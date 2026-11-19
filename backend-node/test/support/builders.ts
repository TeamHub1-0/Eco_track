import type { Location, WasteCategory, ReportStatus, LocationSource } from "../../src/features/reports/domain/entities/types.js";
import { Report } from "../../src/features/reports/domain/entities/report.entity.js";
import { ReportId, UserId } from "../../src/features/reports/domain/entities/types.js";

export const NOW = new Date("2026-01-15T12:00:00Z");

export const aLocation = (overrides: { latitude?: number; longitude?: number } = {}): Location => ({
  latitude: overrides.latitude ?? -6.2088,
  longitude: overrides.longitude ?? 106.8456,
});

export const aReport = (overrides: {
  id?: string;
  userId?: string;
  category?: WasteCategory;
  title?: string;
  description?: string | null;
  location?: Location;
  locationSource?: LocationSource;
  locationAccuracy?: number | null;
  status?: ReportStatus;
  createdAt?: Date;
  updatedAt?: Date | null;
  images?: readonly { id: string; imagePath: string; createdAt: Date }[];
} = {}) => {
  const images = overrides.images ?? [];
  return Report.rehydrate({
    id: ReportId(overrides.id ?? "rep-1"),
    userId: UserId(overrides.userId ?? "usr-1"),
    category: overrides.category ?? "PLASTIC",
    title: overrides.title ?? "Illegal dumping",
    description: overrides.description ?? null,
    location: overrides.location ?? aLocation(),
    locationSource: overrides.locationSource ?? "GPS",
    locationAccuracy: overrides.locationAccuracy ?? 5.2,
    status: overrides.status ?? "PENDING",
    createdAt: overrides.createdAt ?? NOW,
    updatedAt: overrides.updatedAt ?? NOW,
    images,
  });
};
