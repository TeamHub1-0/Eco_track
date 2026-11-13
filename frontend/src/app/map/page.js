// src/app/map/page.js
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map with Server-Side Rendering disabled
const PollutionMap = dynamic(() => import('@/components/PollutionMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[550px] w-full rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
      <p className="text-gray-500 font-medium">Loading interactive map...</p>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#212529]">Community Pollution Map</h1>
        <p className="text-gray-600 mt-1">
          Click on any pin to inspect reported waste details and cleanup status.
        </p>
      </div>

      {/* Renders the map safely in the browser */}
      <PollutionMap />
    </div>
  );
}