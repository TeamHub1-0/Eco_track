"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Leaflet requires the browser, so disable server-side rendering.
const MapLocationPicker = dynamic(() => import("./MapLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] items-center justify-center rounded-xl bg-gray-100">
      <p className="text-sm text-gray-500 animate-pulse">
        Loading interactive map...
      </p>
    </div>
  ),
});

const categories = [
  { value: "PLASTIC", label: "Plastic Waste", icon: "🧴" },
  { value: "PAPER", label: "Paper Waste", icon: "📄" },
  { value: "GLASS", label: "Glass Waste", icon: "🍾" },
  { value: "METAL", label: "Metal Waste", icon: "🥫" },
  { value: "CARDBOARD", label: "Cardboard", icon: "📦" },
  { value: "BIOLOGICAL", label: "Biological Waste", icon: "🌿" },
];

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TITLE_LENGTH = 200;

export default function ReportForm({ onSubmit, onSuccess }) {
  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  // Location
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Image preview URL tracking
  const imageUrls = useRef(new Set());

  useEffect(() => {
    return () => {
      imageUrls.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      imageUrls.current.clear();
    };
  }, []);

  // --------------------------------
  // IMAGE UPLOAD
  // --------------------------------

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    event.target.value = "";

    if (!selectedFiles.length) return;

    setFormError("");

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setFormError("You can upload a maximum of 5 images.");
      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setFormError("Only JPG, JPEG, and PNG images are supported.");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setFormError("Each image must be smaller than 5 MB.");
        return;
      }

      validFiles.push(file);
    }

    const newImages = validFiles.map((file) => {
      const url = URL.createObjectURL(file);

      imageUrls.current.add(url);

      return { file, url };
    });

    setImages((previous) => [...previous, ...newImages]);
  };

  const removeImage = (index) => {
    const imageToRemove = images[index];

    if (!imageToRemove) return;

    URL.revokeObjectURL(imageToRemove.url);
    imageUrls.current.delete(imageToRemove.url);

    setImages((previous) => previous.filter((_, i) => i !== index));
  };

  // --------------------------------
  // HTML5 GEOLOCATION API
  // --------------------------------

  const getCurrentLocation = () => {
    setLocationError("");
    setFormError("");

    if (!navigator.geolocation) {
      setLocationError("Your browser does not support geolocation.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;

        // Reject accuracy worse than 150 meters
        if (accuracy > 100) {
          setLocationError(
            `Location accuracy is too low (${Math.round(accuracy)}m). Please try again or select a location on the map`,
          );
          setLocationLoading(false);
          return;
        }
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "GPS",
        };

        setLocation(coordinates);
        setLocationLoading(false);
      },

      (error) => {
        let message = "Unable to retrieve your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission denied. Please allow location access.";
            break;

          case error.POSITION_UNAVAILABLE:
            message = "Your current location is unavailable.";
            break;

          case error.TIMEOUT:
            message = "Location request timed out. Try again.";
            break;

          default:
            message = "An unexpected location error occurred.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 0,
      },
    );
  };

  // --------------------------------
  // MANUAL MAP LOCATION SELECTION
  // --------------------------------

  const handleMapLocationSelect = (coordinates) => {
    setLocation({
      ...coordinates,
      source: "MANUAL",
      accuracy: null,
    });
    setLocationError("");
    setFormError("");
  };

  // --------------------------------
  // FORM VALIDATION
  // --------------------------------

  const validateForm = () => {
    if (!title.trim()) {
      setFormError("Please provide a report title.");
      return false;
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
      setFormError(`Title must be ${MAX_TITLE_LENGTH} characters or less.`);
      return false;
    }

    if (!category) {
      setFormError("Please select a waste category.");
      return false;
    }

    if (!description.trim()) {
      setFormError("Please describe the garbage problem.");
      return false;
    }

    if (images.length === 0) {
      setFormError("Please upload at least one evidence photo.");
      return false;
    }

    if (!location) {
      setFormError("Please select the garbage location.");
      return false;
    }

    return true;
  };

  // --------------------------------
  // SUBMIT REPORT
  // --------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("description", description.trim());
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    formData.append("location_source", location.source);
    if (location.accuracy !== null) {
      formData.append("location_accuracy", location.accuracy);
    }

    images.forEach((image) => {
      formData.append("images", image.file);
    });

    try {
      setSubmitting(true);

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        console.log("Report data:", Object.fromEntries(formData.entries()));
      }

      onSuccess?.();
    } catch (error) {
      console.error("Report submission failed:", error);

      setFormError(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to submit your report.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* TITLE */}
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Report Title</h2>

          <p className="mt-1 text-sm text-gray-500">
            Give your report a short, descriptive title.
          </p>
        </div>

        <input
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setFormError("");
          }}
          placeholder="Example: Plastic waste dumped near the riverbank"
          maxLength={MAX_TITLE_LENGTH}
          required
          className="text-gray-900 w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />

        <p className="mt-2 text-right text-xs text-gray-400">
          {title.length}/{MAX_TITLE_LENGTH} characters
        </p>
      </section>

      {/* CATEGORY */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            What type of waste did you find?
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select the category that best describes the waste.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setCategory(item.value);
                setFormError("");
              }}
              aria-pressed={category === item.value}
              className={`rounded-xl border p-4 text-left transition-all ${
                category === item.value
                  ? "border-green-600 bg-green-50 ring-2 ring-green-100"
                  : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>

              <p className="mt-3 text-sm font-medium text-gray-800">
                {item.label}
              </p>

              {category === item.value && (
                <span className="mt-2 inline-block text-xs font-semibold text-green-700">
                  Selected ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* DESCRIPTION */}

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Describe the problem
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Explain what you found and why it needs attention.
          </p>
        </div>

        <textarea
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setFormError("");
          }}
          placeholder="Example: There is a large amount of plastic waste dumped beside the roadside..."
          rows={5}
          maxLength={MAX_DESCRIPTION_LENGTH}
          required
          className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 text-gray-900"
        />

        <p className="mt-2 text-right text-xs text-gray-400">
          {description.length}/{MAX_DESCRIPTION_LENGTH} characters
        </p>
      </section>

      {/* IMAGE UPLOAD */}

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Upload evidence
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add photos to help the verification team understand the situation.
            Maximum 5 images, 5 MB each.
          </p>
        </div>

        {images.length < MAX_IMAGES && (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-green-500 hover:bg-green-50/50">
            <span className="text-3xl">📷</span>

            <span className="mt-3 text-sm font-semibold text-gray-700">
              Click to upload photos
            </span>

            <span className="mt-1 text-xs text-gray-500">PNG, JPG or JPEG</span>

            <input
              type="file"
              accept="image/png,image/jpeg"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((preview, index) => (
              <div
                key={preview.url}
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={preview.url}
                  alt={`Uploaded evidence ${index + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white transition hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            {images.length} of {MAX_IMAGES} images selected.
          </p>
        )}
      </section>

      {/* LOCATION SELECTION */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Where did you find the garbage?
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose the location using GPS or select it manually on the map.
          </p>
        </div>

        {/* GPS BUTTON */}

        <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                📍 Use my current location
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Let your browser detect your current GPS coordinates.
              </p>
            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locationLoading ? "Getting location..." : "Use Current Location"}
            </button>
          </div>

          {locationError && (
            <p className="mt-3 text-sm text-red-600">{locationError}</p>
          )}
        </div>

        {/* MAP PICKER */}

        <MapLocationPicker
          location={location}
          onLocationSelect={handleMapLocationSelect}
        />

        {/* SELECTED LOCATION DETAILS */}

        {location && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>

              <h3 className="font-semibold text-green-800">
                Location selected successfully
              </h3>
            </div>

            <div className="mt-3 space-y-2 text-sm text-green-800">
              <p>
                <strong>Latitude:</strong> {location.latitude.toFixed(6)}
              </p>

              <p>
                <strong>Longitude:</strong> {location.longitude.toFixed(6)}
              </p>

              <p>
                <strong>Selection method:</strong>{" "}
                {location.source === "GPS"
                  ? "Current GPS location"
                  : "Manually selected on map"}
              </p>

              {location.accuracy !== null && (
                <p>
                  <strong>GPS accuracy:</strong> ±
                  {Math.round(location.accuracy)} meters
                </p>
              )}
            </div>

            <p className="mt-3 text-xs text-green-700">
              You can click another location on the map to change your
              selection.
            </p>
          </div>
        )}
      </section>

      {/* FORM ERROR */}

      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      {/* SUBMIT */}

      <div className="border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={submitting || locationLoading}
          className="w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting Report..." : "Submit My Report →"}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Your report will be submitted for verification before any cleanup
          action is taken.
        </p>
      </div>
    </form>
  );
}
