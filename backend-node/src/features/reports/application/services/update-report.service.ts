import type { IReportRepository } from "../../domain/repositories/report.repository.interface";
import type { Report } from "../../domain/entities/report.entity";
import type {
  ReportId,
  UserId,
  Location,
  LocationSource,
  WasteCategory,
  PartialReportUpdate,
} from "../../domain/entities/types";
import type { Clock } from "../../infrastructure/system";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "../../domain/errors";

export type UpdateReportInput = PartialReportUpdate & { imagePaths?: string[] };

export class UpdateReportService {
  private readonly editableStatuses = ["PENDING"];

  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly clock: Clock,
  ) {}

  async execute(id: ReportId, input: UpdateReportInput, userId: UserId): Promise<Report> {
    const report = await this.reportRepository.getReportById(id);
    if (!report) {
      throw new NotFoundError("report not found");
    }
    if (report.userId !== userId) {
      throw new ForbiddenError("you do not own this report");
    }
    if (!this.editableStatuses.includes(report.status)) {
      throw new ConflictError("report cannot be modified in its current status");
    }

    const updates: PartialReportUpdate = {};
    if (input.title !== undefined) {
      if (!input.title || input.title.trim().length === 0) {
        throw new ValidationError("title is required");
      }
      if (input.title.length > 255) {
        throw new ValidationError("title must not exceed 255 characters");
      }
      updates.title = input.title;
    }
    if (input.description !== undefined) updates.description = input.description;
    if (input.category !== undefined) {
      if (!this.isValidCategory(input.category)) {
        throw new ValidationError("invalid waste category");
      }
      updates.category = input.category;
    }
    if (input.latitude !== undefined || input.longitude !== undefined) {
      if (input.latitude === undefined || input.longitude === undefined) {
        throw new ValidationError("latitude and longitude must be provided together");
      }
      if (!this.isValidLocation({ latitude: input.latitude, longitude: input.longitude })) {
        throw new ValidationError("valid latitude and longitude are required");
      }
      updates.location = { latitude: input.latitude, longitude: input.longitude };
    }
    if (input.locationSource !== undefined) {
      if (input.locationSource !== "GPS" && input.locationSource !== "MANUAL") {
        throw new ValidationError("location_source must be GPS or MANUAL");
      }
      updates.locationSource = input.locationSource;
    }
    if (input.locationAccuracy !== undefined) {
      if (input.locationAccuracy !== null && (input.locationAccuracy < 0 || !Number.isFinite(input.locationAccuracy))) {
        throw new ValidationError("location_accuracy must be a non-negative number");
      }
      updates.locationAccuracy = input.locationAccuracy;
    }

    const updatedReport = report.withChanges(updates, this.clock.now());
    return this.reportRepository.updateReport(id, updates, userId);
  }

  private isValidCategory(category: string): category is WasteCategory {
    return ["PLASTIC", "PAPER", "GLASS", "METAL", "CARDBOARD", "BIOLOGICAL"].includes(category);
  }

  private isValidLocation(location: Location): boolean {
    return (
      Number.isFinite(location.latitude) &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      Number.isFinite(location.longitude) &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  }
}
