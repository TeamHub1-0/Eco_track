import type { IReportRepository } from "../../src/features/reports/domain/repositories/report.repository.interface.js";
import type { ReportId, UserId, ReportStatus, PartialReportUpdate } from "../../src/features/reports/domain/entities/types.js";
import { Report } from "../../src/features/reports/domain/entities/report.entity.js";
import { ReportImage } from "../../src/features/reports/domain/entities/report-image.entity.js";
import { ReportHistoryEntry } from "../../src/features/reports/domain/entities/report-history.entity.js";
import { IdGenerator, Clock } from "../../src/features/reports/infrastructure/system.js";

export class InMemoryReportRepository implements IReportRepository {
  private reports = new Map<ReportId, Report>();
  private images = new Map<ReportId, ReportImage[]>();
  private history = new Map<ReportId, ReportHistoryEntry[]>();

  async createReport(report: Report, imagePaths: string[]): Promise<Report> {
    if (this.reports.has(report.id)) {
      throw new Error(`report ${report.id} already exists`);
    }
    const images = imagePaths.map((path, index) =>
      new ReportImage(`${report.id}-img-${index}` as unknown as string, report.id, path, new Date()),
    );
    this.reports.set(report.id, report);
    this.images.set(report.id, images);
    this.history.set(report.id, [
      new ReportHistoryEntry(
        `${report.id}-hist-0` as unknown as string,
        report.id,
        report.userId,
        null,
        report.status,
        "Report submitted",
        new Date(),
      ),
    ]);
    return this.getReportById(report.id);
  }

  async getReportById(id: ReportId): Promise<Report | null> {
    const report = this.reports.get(id);
    if (!report) return null;
    const images = this.images.get(id) ?? [];
    const history = this.history.get(id) ?? [];
    return Report.rehydrate({
      id: report.id,
      userId: report.userId,
      category: report.category,
      title: report.title,
      description: report.description,
      location: report.location,
      locationSource: report.locationSource,
      locationAccuracy: report.locationAccuracy,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      images,
      history,
    });
  }

  async getReportsByUserId(userId: UserId, options: {
    status?: ReportStatus;
    page: number;
    limit: number;
  }): Promise<{ reports: Report[]; total: number }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const offset = (page - 1) * limit;

    let all = Array.from(this.reports.values()).filter((r) => r.userId === userId);
    if (options.status) {
      all = all.filter((r) => r.status === options.status);
    }
    all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = all.length;
    const pageReports = all.slice(offset, offset + limit);

    const reports = await Promise.all(pageReports.map(async (r) => {
      const images = this.images.get(r.id) ?? [];
      const history = this.history.get(r.id) ?? [];
      return Report.rehydrate({
        id: r.id, userId: r.userId, category: r.category, title: r.title,
        description: r.description, location: r.location, locationSource: r.locationSource,
        locationAccuracy: r.locationAccuracy, status: r.status, createdAt: r.createdAt,
        updatedAt: r.updatedAt, images, history,
      });
    }));

    return { reports, total };
  }

  async getReportHistory(reportId: ReportId): Promise<ReportHistoryEntry[]> {
    return this.history.get(reportId) ?? [];
  }

  async updateReport(id: ReportId, updates: PartialReportUpdate, userId: UserId): Promise<Report> {
    const existing = await this.getReportById(id);
    if (!existing) throw new Error("report not found");
    if (existing.userId !== userId) throw new Error("forbidden");

    const updated = existing.withChanges({
      title: updates.title,
      description: updates.description,
      category: updates.category,
      location: updates.location,
      locationSource: updates.locationSource,
      locationAccuracy: updates.locationAccuracy,
    }, new Date());

    this.reports.set(id, updated);
    return this.getReportById(id);
  }

  async addImage(reportId: ReportId, imagePath: string): Promise<void> {
    const imgs = this.images.get(reportId) ?? [];
    imgs.push(new ReportImage(`${reportId}-img-${Date.now()}` as unknown as string, reportId, imagePath, new Date()));
    this.images.set(reportId, imgs);
  }

  reset(): void {
    this.reports.clear();
    this.images.clear();
    this.history.clear();
  }
}

export class SequentialIds implements IdGenerator {
  private next = 0;
  newId(): string {
    this.next += 1;
    return `rep-${this.next}`;
  }
}

export class FixedClock implements Clock {
  constructor(public current = new Date("2026-01-15T12:00:00Z")) {}
  now(): Date {
    return new Date(this.current);
  }
}
