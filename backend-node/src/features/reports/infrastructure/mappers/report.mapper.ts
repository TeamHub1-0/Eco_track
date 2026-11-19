import { Report } from "../../domain/entities/report.entity";
import { ReportImage } from "../../domain/entities/report-image.entity";
import type {
  ReportId,
  UserId,
  Location,
  WasteCategory,
  ReportStatus,
  LocationSource,
  ReportImageId,
} from "../../domain/entities/types";

export type ReportDbRow = {
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
};

export type ReportImageDbRow = {
  id: string;
  report_id: string;
  image_path: string;
  created_at: Date;
};

export class ReportMapper {
  toDomain(rows: { report: ReportDbRow; images: ReportImageDbRow[] }): Report | null {
    const { report, images } = rows;
    if (!report) return null;

    const location: Location = {
      latitude: Number(report.latitude),
      longitude: Number(report.longitude),
    };

    return Report.rehydrate({
      id: report.id as ReportId,
      userId: report.user_id as UserId,
      category: report.category as WasteCategory,
      title: report.title,
      description: report.description,
      location,
      locationSource: report.location_source as LocationSource,
      locationAccuracy: report.location_accuracy ?? null,
      status: report.status as ReportStatus,
      createdAt: report.created_at,
      updatedAt: report.updated_at,
      images: images.map(
        (img) =>
          new ReportImage(
            img.id as unknown as ReportImageId,
            img.report_id as ReportId,
            img.image_path,
            img.created_at,
          ),
      ),
    });
  }

  toInsertValues(report: Report) {
    return {
      id: report.id,
      user_id: report.userId,
      category: report.category,
      title: report.title,
      description: report.description,
      location: `POINT(${report.location.longitude} ${report.location.latitude})`,
      location_source: report.locationSource,
      location_accuracy: report.locationAccuracy,
      status: report.status,
    };
  }

  toImageValues(reportId: ReportId, imagePath: string) {
    return {
      report_id: reportId,
      image_path: imagePath,
    };
  }

  toUpdateValues(updates: {
    title?: string;
    description?: string | null;
    category?: WasteCategory;
    location?: Location;
    locationSource?: LocationSource;
    locationAccuracy?: number | null;
  }) {
    const values: Record<string, unknown> = {};
    if (updates.title !== undefined) values.title = updates.title;
    if (updates.description !== undefined) values.description = updates.description;
    if (updates.category !== undefined) values.category = updates.category;
    if (updates.location !== undefined) {
      values.location = `POINT(${updates.location.longitude} ${updates.location.latitude})`;
    }
    if (updates.locationSource !== undefined) values.location_source = updates.locationSource;
    if (updates.locationAccuracy !== undefined) values.location_accuracy = updates.locationAccuracy;
    return values;
  }
}
