"use client";

import { useState, useEffect, useCallback } from "react";
import ReportCard from "@/components/report/ReportCard";
import { api } from "@/lib/api";

const DEFAULT_RADIUS_METERS = 5000;
const RADIUS_STEPS_METERS = [5000, 10000, 20000];
const PAGE_LIMIT = 10;

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

export default function NearbyReports() {
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [radius, setRadius] = useState(DEFAULT_RADIUS_METERS);

  const requestLocation = useCallback(() => {
    setLocationError(null);
    setPermissionDenied(false);
    setError(null);

    if (!navigator.geolocation) {
      setLocationError("Your browser does not support geolocation.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location permission is required to discover nearby reports.",
            );
            setPermissionDenied(true);
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Your current location is unavailable. Try again.",
            );
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Try again.");
            break;
          default:
            setLocationError("An unexpected location error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 180000,
      },
    );
  }, []);

  const fetchNearbyReports = useCallback(
    async (pageNum = 1, reset = false) => {
      if (!location) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/reports/nearby", {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            radius,
            page: pageNum,
            per_page: PAGE_LIMIT,
          },
        });

        const payload = response.data?.data ?? response.data?.reports ?? [];
        const fetchedReports = Array.isArray(payload) ? payload : [];
        const meta = response.data?.meta ?? response.data?.pagination ?? {};

        if (pageNum === 1 || reset) {
          setReports(fetchedReports);
        } else {
          setReports((prev) => [...prev, ...fetchedReports]);
        }

        setHasMore(pageNum < (meta.last_page ?? meta.totalPages ?? 1));
        setPage(pageNum);
      } catch (err) {
        if (err?.response?.status === 401) {
          setError("Please log in to view nearby reports.");
        } else if (err?.response?.status === 404) {
          setError("No nearby reports found.");
        } else {
          setError("Failed to load nearby reports. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [location, radius],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [requestLocation]);

  useEffect(() => {
    if (!location) return;

    const timer = setTimeout(() => {
      setReports([]);
      setPage(1);
      fetchNearbyReports(1, true);
    }, 0);
    return () => clearTimeout(timer);
  }, [location, fetchNearbyReports]);

  const handleRefreshLocation = () => {
    setError(null);
    setLocationError(null);
    setPermissionDenied(false);
    setReports([]);
    setPage(1);
    setHasMore(false);
    setLocation(null);

    requestLocation();
  };

  const handleExpandRadius = () => {
    const currentIndex = RADIUS_STEPS_METERS.indexOf(radius);

    if (currentIndex === RADIUS_STEPS_METERS.length - 1) {
      return;
    }

    setRadius(RADIUS_STEPS_METERS[currentIndex + 1]);
    setPage(1);
    setReports([]);
  };

  const loadMore = () => {
    if (loading || !hasMore) return;
    fetchNearbyReports(page + 1, false);
  };

  if (permissionDenied) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl">📍</span>
        </div>
        <h3 className="text-lg font-semibold text-red-900">
          Location permission is required
        </h3>
        <p className="mt-2 text-sm text-red-700">
          Enable location access in your browser settings to discover garbage
          reports near you, then refresh the page or click Retry.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (locationError && reports.length === 0 && !loading) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-red-900">
          Unable to determine your location
        </h3>
        <p className="mt-2 text-sm text-red-700">{locationError}</p>
        <button
          type="button"
          onClick={handleRefreshLocation}
          className="mt-6 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Refresh Location
        </button>
      </div>
    );
  }

  if (loading && reports.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
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
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          No garbage reports have been found near your current location.
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Try refreshing your location or expanding your search radius.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleRefreshLocation}
            disabled={locationLoading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {locationLoading ? "Refreshing..." : "Refresh Location"}
          </button>
          <button
            type="button"
            onClick={handleExpandRadius}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Expand Search Radius
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            distance={report.distance}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
