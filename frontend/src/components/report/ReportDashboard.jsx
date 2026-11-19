"use client";

import { useState } from "react";
import MyReports from "@/components/report/MyReports";

const TABS = [
  { id: "my-reports", label: "My Reports" },
  { id: "nearby", label: "Nearby Reports" },
];

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("my-reports");

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
      {/* Tab Header */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-b-2 border-green-600 text-green-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "my-reports" && <MyReports />}
        {/*{activeTab === "nearby" && <NearbyReports />} */}
      </div>
    </div>
  );
}
