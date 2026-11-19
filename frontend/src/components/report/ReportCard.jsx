"use client";

import { useState } from "react";
import ReportDetailModal from "@/components/report/ReportDetailModal";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const formatDistance = (meters) => {
  if (meters == null) return "";
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
};

export default function ReportCard({ report, distance }) {
  const [open, setOpen] = useState(false);
  const statusColor =
    STATUS_COLORS[report.status] || "bg-gray-100 text-gray-700";
  const date = report.created_at
    ? new Date(report.created_at).toLocaleDateString()
    : "";
  const imageCount = report.image_count ?? 0;

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                {report.category}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
              >
                {report.status}
              </span>
            </div>

            <h3 className="mt-2 text-lg font-semibold text-gray-900">
              {report.title}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {date}
              {report.location && (
                <span className="ml-2">
                  • {report.location.latitude.toFixed(4)},{" "}
                  {report.location.longitude.toFixed(4)}
                </span>
              )}
              {distance && (
                <span className="ml-2">• {formatDistance(distance)}</span>
              )}
            </p>
          </div>

          {imageCount > 0 && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
              📷 {imageCount}
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            View Details →
          </button>
        </div>
      </div>
      {open && (
        <ReportDetailModal
          reportId={report.id}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
