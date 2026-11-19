import type { ReportId, ReportImageId } from "./types.js";

export class ReportImage {
  constructor(
    readonly id: ReportImageId,
    readonly reportId: ReportId,
    readonly imagePath: string,
    readonly createdAt: Date,
  ) {}
}
