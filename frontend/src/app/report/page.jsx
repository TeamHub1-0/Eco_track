"use client";

import ReportsDashboard from "@/components/report/ReportDashboard";

export default function ReportPage() {
  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <section className="py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Make Your Community Cleaner
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Found unmanaged garbage? Report it to EcoTrack. Your report could
            become the starting point for a cleanup mission.
          </p>

          <button
            type="button"
            className="mt-8 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-green-700"
          >
            + Report Garbage
          </button>
        </section>

        <div className="mt-4">
          <ReportsDashboard />
        </div>

        <h1 className="bg-black text-white p-4">Hi</h1>
      </div>
    </div>
  );
}
