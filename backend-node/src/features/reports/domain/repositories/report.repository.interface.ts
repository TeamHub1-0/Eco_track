import type { Report } from "../entities/report.entity.js";
import type { ReportImage } from "../entities/report-image.entity.js";
import type { ReportHistoryEntry } from "../entities/report-history.entity.js";
import type { ReportId, UserId, Location, ReportStatus, PartialReportUpdate } from "../entities/types.js";

export interface IReportRepository {
  createReport(report: Report, imagePaths: string[]): Promise<Report>;
  getReportById(id: ReportId): Promise<Report | null>;
  getReportsByUserId(userId: UserId, options: {
    status?: ReportStatus;
    page: number;
    limit: number;
  }): Promise<{ reports: Report[]; total: number }>;
  getNearbyReports(latitude: number, longitude: number, radiusMeters: number, page: number, limit: number): Promise<{ reports: Report[]; total: number }>;
  getReportHistory(reportId: ReportId): Promise<ReportHistoryEntry[]>;
  updateReport(id: ReportId, updates: PartialReportUpdate, userId: UserId): Promise<Report>;
  addImage(reportId: ReportId, imagePath: string): Promise<void>;
}
