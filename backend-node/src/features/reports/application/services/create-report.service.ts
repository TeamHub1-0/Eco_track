import { Report } from "../../domain/entities/report.entity";
import { ReportId, UserId, Location, LocationSource, WasteCategory } from "../../domain/entities/types";
import { IdGenerator, Clock } from "../../infrastructure/system";
import { ValidationError } from "../../domain/errors";
import type { IReportRepository } from "../../domain/repositories/report.repository.interface";

export type CreateReportInput = {
  title: string;
  description: string | null;
  category: WasteCategory;
  latitude: number;
  longitude: number;
  locationSource: LocationSource;
  locationAccuracy: number | null;
  imagePaths: string[];
};

export class CreateReportService {
  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateReportInput, userId: UserId): Promise<Report> {
    this.validateInput(input);

    const report = Report.create({
      id: ReportId(this.idGenerator.newId()),
      userId,
      category: input.category,
      title: input.title,
      description: input.description,
      location: { latitude: input.latitude, longitude: input.longitude },
      locationSource: input.locationSource,
      locationAccuracy: input.locationAccuracy,
      now: this.clock.now(),
    });

    return this.reportRepository.createReport(report, input.imagePaths);
  }

  private validateInput(input: CreateReportInput): void {
    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError("title is required");
    }
    if (input.title.length > 255) {
      throw new ValidationError("title must not exceed 255 characters");
    }
    if (!input.category) {
      throw new ValidationError("category is required");
    }
    if (!this.isValidCategory(input.category)) {
      throw new ValidationError("invalid waste category");
    }
    if (!this.isValidLocation({ latitude: input.latitude, longitude: input.longitude })) {
      throw new ValidationError("valid latitude and longitude are required");
    }
    if (input.locationSource !== "GPS" && input.locationSource !== "MANUAL") {
      throw new ValidationError("location_source must be GPS or MANUAL");
    }
    if (input.locationAccuracy !== null && (input.locationAccuracy < 0 || !Number.isFinite(input.locationAccuracy))) {
      throw new ValidationError("location_accuracy must be a non-negative number");
    }
    if (input.imagePaths.length > 5) {
      throw new ValidationError("maximum of 5 photographs allowed");
    }
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
