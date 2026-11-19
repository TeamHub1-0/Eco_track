"use client";

import { useState, useEffect, useCallback } from "react";
import ReportCard from "@/components/report/ReportCard";
import { api } from "@/lib/api";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchReports = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reports", {
        params: { page: pageNum, limit: 10 },
      });

      const data = response.data?.data;
      const fetchedReports = data?.reports ?? [];
      const pagination = data?.pagination ?? {};

      if (pageNum === 1) {
        setReports(fetchedReports);
      } else {
        setReports((prev) => [...prev, ...fetchedReports]);
      }

      setTotal(pagination.total ?? fetchedReports.length);
      setHasMore(fetchedReports.length < (pagination.total ?? fetchedReports.length));
      setPage(pageNum);
    } catch (err) {
      if (err?.response?.status === 401) {
        setError("Please log in to view your reports.");
      } else {
        setError("Failed to load your reports. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  if (loading && reports.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => fetchReports(1)}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <span className="text-3xl">📋</span>
        </div>
          <h3 className="text-lg font-semibold text-gray-900">
            You haven&apos;t submitted any garbage reports yet.
          </h3>
        <p className="mt-2 text-sm text-gray-500">
          Start making a difference in your community by reporting waste.
        </p>
        <button
          type="button"
          onClick={() => (window.location.href = "/report")}
          className="mt-4 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Create Your First Report
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => fetchReports(page + 1)}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {reports.length > 0 && total > reports.length && !hasMore && (
        <p className="mt-4 text-center text-xs text-gray-500">
          Showing {reports.length} of {total} reports
        </p>
      )}
    </div>
  );
}