export type WasteCategory = "PLASTIC" | "PAPER" | "GLASS" | "METAL" | "CARDBOARD" | "BIOLOGICAL";

export type ReportStatus = "PENDING" | "APPROVED" | "RESOLVED" | "REJECTED";

export type LocationSource = "GPS" | "MANUAL";

export type ReportId = string & { readonly __brand: "ReportId" };
export const ReportId = (value: string): ReportId => value as ReportId;

export type UserId = string & { readonly __brand: "UserId" };
export const UserId = (value: string): UserId => value as UserId;

export type ReportImageId = string & { readonly __brand: "ReportImageId" };
export type ReportHistoryId = string & { readonly __brand: "ReportHistoryId" };

export type Location = { readonly latitude: number; readonly longitude: number };

export const MAX_IMAGES_PER_REPORT = 5;

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const MAX_IMAGE_SIZE_MB = 5;

export type PartialReportUpdate = {
  title?: string;
  description?: string | null;
  category?: WasteCategory;
  location?: Location;
  latitude?: number;
  longitude?: number;
  locationSource?: LocationSource;
  locationAccuracy?: number | null;
};
