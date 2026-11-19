import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/report.middleware";
import { getUserId } from "../../../middlewares/report.middleware";
import { parseCreateBody, parseUpdateBody } from "../../../middlewares/report.middleware";
import { CreateReportService } from "../application/services/create-report.service";
import type { CreateReportInput } from "../application/services/create-report.service";
import { UpdateReportService } from "../application/services/update-report.service";
import { TrackReportService } from "../application/services/track-report.service";
import { ReportId, UserId, ReportStatus } from "../domain/entities/types";
import { DomainError } from "../domain/errors";

export class ReportController {
  constructor(
    private readonly createReportService: CreateReportService,
    private readonly updateReportService: UpdateReportService,
    private readonly trackReportService: TrackReportService,
  ) {}

  createReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = UserId(getUserId(req));
      const parsed = parseCreateBody(req);
      const input: CreateReportInput = {
        title: parsed.title,
        description: parsed.description,
        category: parsed.category,
        latitude: parsed.latitude ?? 0,
        longitude: parsed.longitude ?? 0,
        locationSource: parsed.location_source,
        locationAccuracy: parsed.location_accuracy,
        imagePaths: parsed.images,
      };
      const report = await this.createReportService.execute(input, userId);
      res.status(201).json(this.toResponse(report));
    } catch (error) {
      next(error);
    }
  };

  getReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = UserId(getUserId(req));
      const report = await this.trackReportService.getReportById(ReportId(req.params.id as string), userId);
      res.status(200).json(this.toResponse(report));
    } catch (error) {
      next(error);
    }
  };

  listReports = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = UserId(getUserId(req));
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await this.trackReportService.getReportsByUserId(userId, {
        status: req.query.status as ReportStatus,
        page,
        limit,
      });
      res.status(200).json({
        status: "success",
        data: {
          reports: result.reports.map((r) => this.toSummary(r)),
          pagination: { page, limit, total: result.total },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getReportHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = UserId(getUserId(req));
      const history = await this.trackReportService.getReportHistory(ReportId(req.params.id as string), userId);
      res.status(200).json({
        status: "success",
        data: { report_id: req.params.id, history },
      });
    } catch (error) {
      next(error);
    }
  };

  updateReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = UserId(getUserId(req));
      const input = parseUpdateBody(req);
      const report = await this.updateReportService.execute(ReportId(req.params.id as string), input, userId);
      res.status(200).json(this.toResponse(report));
    } catch (error) {
      next(error);
    }
  };

  getNearbyReports = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const latitude = req.query.latitude ? Number(req.query.latitude) : null;
      const longitude = req.query.longitude ? Number(req.query.longitude) : null;
      const radius = req.query.radius ? Number(req.query.radius) : 5000;
      const page = req.query.page ? Number(req.query.page) : 1;
      const per_page = req.query.per_page ? Number(req.query.per_page) : 10;

      if (latitude === null || longitude === null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        res.status(400).json({
          status: "error",
          error: { code: "VALIDATION_ERROR", message: "Valid latitude and longitude are required" },
        });
        return;
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        res.status(400).json({
          status: "error",
          error: { code: "VALIDATION_ERROR", message: "Latitude must be between -90 and 90, longitude between -180 and 180" },
        });
        return;
      }

      const result = await this.trackReportService.getNearbyReports({
        latitude,
        longitude,
        radiusMeters: radius,
        page,
        limit: per_page,
      });

      res.status(200).json({
        status: "success",
        data: {
          reports: result.reports.map((r) => this.toNearbySummary(r)),
          pagination: { page, per_page, total: result.total },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private toResponse(report: {
    id: string;
    userId: string;
    category: string;
    title: string;
    description: string | null;
    location: { latitude: number; longitude: number };
    locationSource: string;
    locationAccuracy: number | null;
    status: string;
    createdAt: Date;
    updatedAt: Date | null;
    images: readonly { id: string; imagePath: string; createdAt: Date }[];
  }) {
    return {
      status: "success",
      data: {
        id: report.id,
        user_id: report.userId,
        category: report.category,
        title: report.title,
        description: report.description,
        location: report.location,
        location_source: report.locationSource,
        location_accuracy: report.locationAccuracy,
        status: report.status,
        created_at: report.createdAt.toISOString(),
        updated_at: report.updatedAt?.toISOString() ?? null,
        images: report.images.map((img) => ({
          id: img.id,
          report_id: report.id,
          image_path: img.imagePath,
          created_at: img.createdAt.toISOString(),
        })),
      },
    };
  }

  private toSummary(report: {
    id: string;
    category: string;
    title: string;
    status: string;
    location: { latitude: number; longitude: number };
    createdAt: Date;
    updatedAt: Date | null;
    images: readonly { id: string }[];
  }) {
    return {
      id: report.id,
      category: report.category,
      title: report.title,
      status: report.status,
      location: report.location,
      created_at: report.createdAt.toISOString(),
      updated_at: report.updatedAt?.toISOString() ?? null,
      image_count: report.images.length,
    };
  }

  private toNearbySummary(report: {
    id: string;
    category: string;
    title: string;
    status: string;
    location: { latitude: number; longitude: number };
    createdAt: Date;
    updatedAt: Date | null;
    images: readonly { id: string }[];
    distance?: number;
  }) {
    const summary = this.toSummary(report);
    return {
      ...summary,
      distance: report.distance !== undefined ? Math.round(report.distance) : undefined,
    };
  }
}

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("Report error:", err);
  const statusCode = err.statusCode || 500;
  const isDomain = err instanceof DomainError;
  res.status(statusCode).json({
    status: "error",
    error: {
      code: isDomain ? (err as DomainError).code : (err.code || "INTERNAL_ERROR"),
      message: isDomain ? err.message : "Internal server error",
    },
  });
};
