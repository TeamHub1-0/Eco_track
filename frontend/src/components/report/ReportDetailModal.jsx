"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

// Load Leaflet map only in the browser.
const ReportMap = dynamic(() => import("../ui/report/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      Loading map...
    </div>
  ),
});

export default function ReportDetailModal({ reportId, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/reports/${reportId}`);

        if (!cancelled) {
          setReport(response.data?.data ?? response.data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err?.response?.status === 401) {
            setError("Please log in to view this report.");
          } else if (err?.response?.status === 404) {
            setError("This report could not be found.");
          } else if (!err?.response) {
            setError("Unable to connect to the server. Please try again.");
          } else {
            setError("Failed to load report details. Please try again.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="rounded-xl bg-white p-6">Loading report details...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-xl bg-white p-6 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-red-600">
            {error || "Report information is unavailable."}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded bg-gray-200 px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const latitude = Number(report.location?.latitude);
  const longitude = Number(report.location?.longitude);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">{report.title}</h2>

        <p className="mt-2 text-gray-600">{report.description}</p>

        <p className="mt-2">
          Category: {report.category} | Status: {report.status}
        </p>

        <div className="mt-4 h-64">
          <ReportMap
            latitude={latitude}
            longitude={longitude}
            title={report.title}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded bg-gray-200 px-4 py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
