"use client";
import { api } from "@/lib/api";
import { useState } from "react";
import ReportsDashboard from "@/components/report/ReportDashboard";
import ReportJourney from "@/components/report/ReportJourney";
import ReportModal from "@/components/report/ReportModal";
export default function ReportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReportSubmit = async (formData) => {
    const response = await api.post("/reports", formData);

    return response.data;
  };

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
            onClick={() => setIsModalOpen(true)}
            className="mt-8 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-green-700"
          >
            + Report Garbage
          </button>
          {/* Report Journey */}
          <div className="mt-12">
            <ReportJourney />
          </div>
        </section>

        <div className="mt-4">
          <ReportsDashboard />
        </div>
      </div>
      {/* Report Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}
