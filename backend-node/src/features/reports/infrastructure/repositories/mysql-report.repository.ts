import type { IReportRepository } from "../../domain/repositories/report.repository.interface";
import { Report } from "../../domain/entities/report.entity";
import { ReportHistoryEntry } from "../../domain/entities/report-history.entity";
import type { ReportId, ReportHistoryId, UserId, ReportStatus } from "../../domain/entities/types";
import { ReportMapper } from "../mappers/report.mapper";
import { pool } from "../../../../config/database";
import { NotFoundError } from "../../domain/errors";

type ReportDbRow = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string | null;
  longitude: number;
  latitude: number;
  location_source: string;
  location_accuracy: number | null;
  status: string;
  created_at: Date;
  updated_at: Date | null;
  distance?: number;
};

type ReportImageDbRow = {
  id: string;
  report_id: string;
  image_path: string;
  created_at: Date;
};

type ReportHistoryDbRow = {
  id: string;
  report_id: string;
  changed_by: string | null;
  old_status: string | null;
  new_status: string;
  note: string | null;
  created_at: Date;
};

type UpdateFields = {
  title?: string;
  description?: string | null;
  category?: string;
  location?: { latitude: number; longitude: number };
  locationSource?: string;
  locationAccuracy?: number | null;
};

export class MySQLReportRepository implements IReportRepository {
  private readonly mapper = new ReportMapper();

  async createReport(report: Report, imagePaths: string[]): Promise<Report> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const values = this.mapper.toInsertValues(report);
      await connection.execute(
        `INSERT INTO garbage_reports (id, user_id, category, title, description, location, location_source, location_accuracy, status)
         VALUES (?, ?, ?, ?, ?, ST_GeomFromText(?, 4326), ?, ?, ?)`,
        [
          values.id,
          values.user_id,
          values.category,
          values.title,
          values.description ?? null,
          values.location,
          values.location_source,
          values.location_accuracy ?? null,
          values.status,
        ],
      );

      if (imagePaths.length > 0) {
        const imageRows = imagePaths.map((path, index) => [
          `${report.id}-img-${index}`,
          report.id,
          path,
        ]);
        await connection.query(
          "INSERT INTO report_images (id, report_id, image_path) VALUES ?",
          [imageRows as unknown as never[]],
        );
      }

      await connection.commit();
      const created = await this.getReportById(report.id);
      if (!created) {
        throw new Error("report could not be created");
      }
      return created;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getReportById(id: ReportId): Promise<Report | null> {
    const [reportRows] = await pool.execute(
      `SELECT id, user_id, category, title, description,
              ST_X(location) AS longitude, ST_Y(location) AS latitude,
              location_source, location_accuracy, status, created_at, updated_at
       FROM garbage_reports WHERE id = ?`,
      [id],
    );
    const rows = reportRows as unknown as ReportDbRow[];
    if (rows.length === 0) return null;
    const reportRow = rows[0];

    const [imageRows] = await pool.execute(
      "SELECT id, report_id, image_path, created_at FROM report_images WHERE report_id = ? ORDER BY created_at ASC",
      [id],
    );
    const images = imageRows as unknown as ReportImageDbRow[];

    return this.mapper.toDomain({ report: reportRow, images });
  }

  async getReportsByUserId(userId: UserId, options: {
    status?: ReportStatus;
    page: number;
    limit: number;
  }): Promise<{ reports: Report[]; total: number }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ["user_id = ?"];
    const params: (string | number | null)[] = [userId];

    if (options.status) {
      conditions.push("status = ?");
      params.push(options.status);
    }

    const whereClause = conditions.join(" AND ");

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM garbage_reports WHERE ${whereClause}`,
      params,
    );
    const count = countRows as unknown as { total: number }[];
    const total = Number(count[0]?.total ?? 0);

    const [reportRows] = await pool.execute(
      `SELECT id, user_id, category, title, description,
              ST_X(location) AS longitude, ST_Y(location) AS latitude,
              location_source, location_accuracy, status, created_at, updated_at
       FROM garbage_reports WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const reportList = reportRows as unknown as ReportDbRow[];

    const reports: Report[] = [];
    for (const row of reportList) {
      const [imageRows] = await pool.execute(
        "SELECT id, report_id, image_path, created_at FROM report_images WHERE report_id = ? ORDER BY created_at ASC",
        [row.id],
      );
      const images = imageRows as unknown as ReportImageDbRow[];
      const report = this.mapper.toDomain({ report: row, images });
      if (report) reports.push(report);
    }

    return { reports, total };
  }

  async getNearbyReports(latitude: number, longitude: number, radiusMeters: number, page: number, limit: number): Promise<{ reports: Report[]; total: number }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;

    const point = `POINT(${longitude} ${latitude})`;

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM garbage_reports
       WHERE ST_Distance_Sphere(location, ST_GeomFromText(?, 4326)) <= ?`,
      [point, radiusMeters],
    );
    const count = countRows as unknown as { total: number }[];
    const total = Number(count[0]?.total ?? 0);

    const [reportRows] = await pool.execute(
      `SELECT id, user_id, category, title, description,
              ST_X(location) AS longitude, ST_Y(location) AS latitude,
              location_source, location_accuracy, status, created_at, updated_at,
              ST_Distance_Sphere(location, ST_GeomFromText(?, 4326)) AS distance
       FROM garbage_reports
       WHERE ST_Distance_Sphere(location, ST_GeomFromText(?, 4326)) <= ?
       ORDER BY distance ASC
       LIMIT ? OFFSET ?`,
      [point, point, radiusMeters, safeLimit, offset],
    );
    const reportList = reportRows as unknown as ReportDbRow[];

    const reports: Report[] = [];
    for (const row of reportList) {
      const [imageRows] = await pool.execute(
        "SELECT id, report_id, image_path, created_at FROM report_images WHERE report_id = ? ORDER BY created_at ASC",
        [row.id],
      );
      const images = imageRows as unknown as ReportImageDbRow[];
      const report = this.mapper.toDomain({ report: row, images });
      if (report) {
        (report as any).distance = row.distance;
        reports.push(report);
      }
    }

    return { reports, total };
  }

  async getReportHistory(reportId: ReportId): Promise<ReportHistoryEntry[]> {
    const [rows] = await pool.execute(
      "SELECT id, report_id, changed_by, old_status, new_status, note, created_at FROM report_history WHERE report_id = ? ORDER BY created_at ASC",
      [reportId],
    );
    const history = rows as unknown as ReportHistoryDbRow[];
    return history.map((row) =>
      new ReportHistoryEntry(
        row.id as unknown as ReportHistoryId,
        row.report_id as ReportId,
        row.changed_by ? (row.changed_by as UserId) : null,
        row.old_status ? (row.old_status as ReportStatus) : null,
        row.new_status as ReportStatus,
        row.note,
        row.created_at,
      ),
    );
  }

  async updateReport(id: ReportId, updates: UpdateFields, userId: UserId): Promise<Report> {
    const setClauses: string[] = [];
    const params: (string | number | null)[] = [];

    if (updates.title !== undefined) { setClauses.push("title = ?"); params.push(updates.title); }
    if (updates.description !== undefined) { setClauses.push("description = ?"); params.push(updates.description ?? null); }
    if (updates.category !== undefined) { setClauses.push("category = ?"); params.push(updates.category); }
    if (updates.location !== undefined) {
      setClauses.push("location = ST_GeomFromText(?, 4326)");
      params.push(`POINT(${updates.location.longitude} ${updates.location.latitude})`);
    }
    if (updates.locationSource !== undefined) { setClauses.push("location_source = ?"); params.push(updates.locationSource); }
    if (updates.locationAccuracy !== undefined) { setClauses.push("location_accuracy = ?"); params.push(updates.locationAccuracy ?? null); }

    if (setClauses.length === 0) {
      const existing = await this.getReportById(id);
      if (!existing) throw new NotFoundError("report not found");
      return existing;
    }

    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    await pool.execute(
      `UPDATE garbage_reports SET ${setClauses.join(", ")} WHERE id = ?`,
      params,
    );

    const updated = await this.getReportById(id);
    if (!updated) throw new NotFoundError("report not found");
    return updated;
  }

  async addImage(reportId: ReportId, imagePath: string): Promise<void> {
    await pool.execute(
      "INSERT INTO report_images (id, report_id, image_path) VALUES (?, ?, ?)",
      [`${reportId}-img-${Date.now()}`, reportId, imagePath],
    );
  }
}
