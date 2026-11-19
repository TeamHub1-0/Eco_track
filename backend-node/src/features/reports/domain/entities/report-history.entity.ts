import type { ReportId, ReportHistoryId, ReportStatus, UserId } from "./types.js";

export class ReportHistoryEntry {
  constructor(
    readonly id: ReportHistoryId,
    readonly reportId: ReportId,
    readonly changedBy: UserId | null,
    readonly oldStatus: ReportStatus | null,
    readonly newStatus: ReportStatus,
    readonly note: string | null,
    readonly createdAt: Date,
  ) {}
}
