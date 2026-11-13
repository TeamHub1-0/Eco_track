// src/app/map/page.js
export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-[#212529]">Community Pollution Map</h1>
      <p className="mt-2 text-gray-600">View reported waste locations and active cleanup areas across Pyin Oo Lwin.</p>
      
      {/* Map container placeholder */}
      <div className="mt-6 w-full h-[500px] bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center shadow-sm">
        <span className="text-gray-400 font-medium">[ Interactive Map Integration Goes Here ]</span>
      </div>
    </div>
  );
}