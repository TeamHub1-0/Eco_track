"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

// Fix the default Leaflet marker icons in Next.js
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon.src || markerIcon,
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  shadowUrl: markerShadow.src || markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        accuracy: null,
        source: "MAP",
      });
    },
  });

  return null;
}

// Automatically move the map when GPS coordinates change
function MapController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo([location.latitude, location.longitude], 16, {
      duration: 1.5,
    });
  }, [location, map]);

  return null;
}

export default function MapLocationPicker({ location, onLocationSelect }) {
  // Initial map center.
  // Change this to the center of your application's service area.
  const defaultCenter = [16.8661, 96.1951];

  const mapCenter = location
    ? [location.latitude, location.longitude]
    : defaultCenter;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">
          Choose a location on the map
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Click anywhere on the map to place your report marker.
        </p>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={location ? 16 : 13}
        scrollWheelZoom={true}
        className="h-[350px] w-full z-0"
      >
        {/* OpenStreetMap tiles */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Handle map clicks */}

        <MapClickHandler onLocationSelect={onLocationSelect} />

        {/* Move map when GPS location changes */}

        <MapController location={location} />

        {/* Display selected location marker */}

        {location && (
          <Marker
            position={[location.latitude, location.longitude]}
            icon={defaultIcon}
          />
        )}
      </MapContainer>

      <div className="bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-500">
          📍 Select the exact location where the garbage was found.
        </p>
      </div>
    </div>
  );
}
