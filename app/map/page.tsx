"use client"

import LeafletMap, { ProviderMarker } from "./LeafletMap"
import { useState, useMemo, useCallback } from "react"

// Base dummy provider data - Manila / Metro Manila approximate coords
const BASE_PROVIDERS: ProviderMarker[] = [
  { id: "1", name: "Makati Endo Center", type: "Endocrinologist", lat: 14.5547, lng: 121.0244 },
  { id: "2", name: "QC Health Clinic", type: "Primary Care", lat: 14.6514, lng: 121.0490 },
  { id: "3", name: "WellPlus Pharmacy", type: "Pharmacy", lat: 14.5840, lng: 121.0631 },
  { id: "4", name: "St. Metro Hospital", type: "Hospital", lat: 14.5826, lng: 121.0000 },
  { id: "5", name: "Rapid Urgent Care", type: "Urgent Care", lat: 14.5600, lng: 121.0437 },
  { id: "6", name: "BGC Diabetes Center", type: "Endocrinologist", lat: 14.5491, lng: 121.0463 },
]

export default function Map() {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [distanceFilter, setDistanceFilter] = useState("10")
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 14.5995, lng: 120.9842 }) // Manila
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Simple client-side filtering (no geocoding yet). If query matches name substring (case-insensitive) and type matches.
  const filteredProviders = useMemo(() => {
    const q = query.trim().toLowerCase()
    // First, filter by text and type
    const base = BASE_PROVIDERS.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q)
      const matchesType = typeFilter === "All" || p.type === typeFilter
      return matchesQuery && matchesType
    })
    // Then, apply distance filter relative to current map center
    const maxKm = Number(distanceFilter)
    return base.filter((p) => haversineKm(center.lat, center.lng, p.lat, p.lng) <= maxKm)
  }, [query, typeFilter])

  // Adjust map center toward first filtered result for quick visual feedback
  const mapCenter = filteredProviders.length ? { lat: filteredProviders[0].lat, lng: filteredProviders[0].lng } : center

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.")
      return
    }
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCenter({ lat: latitude, lng: longitude })
      },
      (err) => {
        setGeoError(err.message || "Unable to retrieve your location.")
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Healthcare Map
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find nearby healthcare providers, pharmacies, and diabetes specialists in your area.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Optionally: future geocoding could update center here based on query
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Provider Name
                  </label>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    placeholder="e.g. Makati, Diabetes, Pharmacy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="All">All</option>
                    <option value="Endocrinologist">Endocrinologists</option>
                    <option value="Primary Care">Primary Care</option>
                    <option value="Pharmacy">Pharmacies</option>
                    <option value="Hospital">Hospitals</option>
                    <option value="Urgent Care">Urgent Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
                  <select
                    value={distanceFilter}
                    onChange={(e) => setDistanceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                    <option value="40">40 km</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
                    Use my location
                  </button>
                  <button
                    type="button"
                    onClick={() => setCenter({ lat: 14.5995, lng: 120.9842 })}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Reset to Manila
                  </button>
                </div>
                <p className="md:ml-auto">
                  Showing <span className="font-medium text-gray-800">{filteredProviders.length}</span> of {BASE_PROVIDERS.length} providers
                </p>
              </div>
              {geoError && (
                <p className="mt-2 text-sm text-red-600">{geoError}</p>
              )}
            </form>
          </div>
        </div>

        {/* Map and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Realistic Leaflet Map (OSM tiles) */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Map View
            </h2>
            <LeafletMap
              markers={filteredProviders}
              center={mapCenter}
              selectedId={selectedId ?? undefined}
              onMarkerClick={(id: string) => setSelectedId(id)}
            />
          </div>

          {/* Results List (Dummy Data) */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Nearby Providers
            </h2>
            <ul className="space-y-4">
              {filteredProviders.map((p) => (
                <li
                  key={p.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white cursor-pointer"
                  onClick={() => {
                    setSelectedId(p.id)
                    setCenter({ lat: p.lat, lng: p.lng })
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                      <p className="text-sm text-gray-600">{p.type}</p>
                    </div>
                    <span
                      className="inline-block h-3 w-3 rounded-full mt-1"
                      style={{ backgroundColor: colorForType(p.type) }}
                      aria-label={p.type}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Lat/Lng: {p.lat.toFixed(4)}, {p.lng.toFixed(4)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find Doctors</h3>
              <p className="text-sm text-gray-600">Locate diabetes specialists</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find Pharmacies</h3>
              <p className="text-sm text-gray-600">Locate nearby pharmacies</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Emergency Care</h3>
              <p className="text-sm text-gray-600">Find urgent care centers</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lab Services</h3>
              <p className="text-sm text-gray-600">Find testing facilities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Local helper for provider color badges (mirrors DummyMap logic)
function colorForType(t: ProviderMarker["type"]) {
  switch (t) {
    case "Endocrinologist":
      return "#3b82f6"
    case "Primary Care":
      return "#22c55e"
    case "Pharmacy":
      return "#f59e0b"
    case "Hospital":
      return "#ef4444"
    case "Urgent Care":
      return "#a855f7"
    default:
      return "#6b7280"
  }
}

// Haversine distance in kilometers between two lat/lng pairs
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}