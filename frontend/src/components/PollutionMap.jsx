// src/components/PollutionMap.jsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const sampleReports = [
  {
    id: 1,
    title: 'Plastic Waste Accumulation',
    category: 'Plastic',
    status: 'Unresolved',
    coords: [22.035, 96.456],
  },
  {
    id: 2,
    title: 'Blocked Drainage Canal',
    category: 'Mixed Waste',
    status: 'In Progress',
    coords: [22.039, 96.462],
  },
];

export default function PollutionMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Prevent double-initialization in React Strict Mode
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([22.036, 96.459], 14);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    sampleReports.forEach((report) => {
      L.marker(report.coords, { icon: defaultIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-size: 14px;">
            <strong>${report.title}</strong><br/>
            <span style="color: #555; font-size: 12px;">Type: ${report.category}</span><br/>
            <span style="display: inline-block; margin-top: 6px; padding: 2px 8px; font-size: 11px; border-radius: 999px; background: #fee2e2; color: #b91c1c;">
              ${report.status}
            </span>
          </div>
        `);
    });

    // Clean up cleanly when leaving the page
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="h-[550px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}