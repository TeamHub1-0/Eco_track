import type {
  Location,
  ReportId,
  ReportStatus,
  UserId,
  WasteCategory,
  LocationSource,
} from "./types.js";
import type { ReportImage } from "./report-image.entity.js";
import type { ReportHistoryEntry } from "./report-history.entity.js";

export class Report {
  private constructor(
    readonly id: ReportId,
    readonly userId: UserId,
    readonly category: WasteCategory,
    readonly title: string,
    readonly description: string | null,
    readonly location: Location,
    readonly locationSource: LocationSource,
    readonly locationAccuracy: number | null,
    readonly status: ReportStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date | null,
    readonly images: readonly ReportImage[],
  ) {}

  static create(props: {
    id: ReportId;
    userId: UserId;
    category: WasteCategory;
    title: string;
    description: string | null;
    location: Location;
    locationSource: LocationSource;
    locationAccuracy: number | null;
    now: Date;
  }): Report {
    return new Report(
      props.id,
      props.userId,
      props.category,
      props.title,
      props.description,
      props.location,
      props.locationSource,
      props.locationAccuracy,
      "PENDING",
      props.now,
      null,
      [],
    );
  }

  static rehydrate(props: {
    id: ReportId;
    userId: UserId;
    category: WasteCategory;
    title: string;
    description: string | null;
    location: Location;
    locationSource: LocationSource;
    locationAccuracy: number | null;
    status: ReportStatus;
    createdAt: Date;
    updatedAt: Date | null;
    images: readonly ReportImage[];
  }): Report {
    return new Report(
      props.id,
      props.userId,
      props.category,
      props.title,
      props.description,
      props.location,
      props.locationSource,
      props.locationAccuracy,
      props.status,
      props.createdAt,
      props.updatedAt,
      props.images,
    );
  }

  withChanges(updates: Partial<{
    title: string;
    description: string | null;
    category: WasteCategory;
    location: Location;
    locationSource: LocationSource;
    locationAccuracy: number | null;
  }>, now: Date): Report {
    return new Report(
      this.id,
      this.userId,
      updates.category ?? this.category,
      updates.title ?? this.title,
      updates.description ?? this.description,
      updates.location ?? this.location,
      updates.locationSource ?? this.locationSource,
      updates.locationAccuracy ?? this.locationAccuracy,
      this.status,
      this.createdAt,
      now,
      this.images,
    );
  }
}
