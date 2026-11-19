import { ReportId, UserId, ReportStatus } from "../../domain/entities/types";
import { ReportHistoryEntry } from "../../domain/entities/report-history.entity";
import type { IReportRepository } from "../../domain/repositories/report.repository.interface";
import type { Report } from "../../domain/entities/report.entity";
import { NotFoundError, ForbiddenError } from "../../domain/errors";

export type TrackReportOptions = {
  status?: ReportStatus;
  page: number;
  limit: number;
};

export type NearbyReportsOptions = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  page: number;
  limit: number;
};

export class TrackReportService {
  constructor(private readonly reportRepository: IReportRepository) {}

  async getReportById(id: ReportId, userId: UserId): Promise<Report> {
    const report = await this.reportRepository.getReportById(id);
    if (!report) {
      throw new NotFoundError("report not found");
    }
    return report;
  }

  async getReportsByUserId(userId: UserId, options: TrackReportOptions) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    return this.reportRepository.getReportsByUserId(userId, {
      status: options.status,
      page,
      limit,
    });
  }

  async getReportHistory(reportId: ReportId, userId: UserId): Promise<ReportHistoryEntry[]> {
    const report = await this.reportRepository.getReportById(reportId);
    if (!report) {
      throw new NotFoundError("report not found");
    }
    return this.reportRepository.getReportHistory(reportId);
  }

  async getNearbyReports(options: NearbyReportsOptions) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const radiusMeters = Math.max(1, Math.min(50000, options.radiusMeters ?? 5000));
    return this.reportRepository.getNearbyReports(options.latitude, options.longitude, radiusMeters, page, limit);
  }
}
