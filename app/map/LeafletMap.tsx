"use client"

import React, { useEffect, useRef } from "react"
import L from "leaflet"

// Fix default icon URLs (Leaflet expects images in a specific path). We'll inline a simple marker color.
// Using a base64 SVG to avoid bundling image assets.
const defaultIcon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgZmlsbD0iI2ZlNDg0OCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIC8+PHBhdGggZD0iTTE2IDIyQzE5LjMxNCAyMiAyMiAxOS4zMTQgMjIgMTZDMjIgMTIuNjg2IDE5LjMxNCAxMCAxNiAxMEMxMi42ODYgMTAgMTAgMTIuNjg2IDEwIDE2QzEwIDE5LjMxNCAxMi42ODYgMjIgMTYgMjJaIiBmaWxsPSIjZmZmIiAvPjwvc3ZnPg==",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

export type ProviderMarker = {
  id: string
  name: string
  type: string
  lat: number
  lng: number
}

type Props = {
  markers: ProviderMarker[]
  center?: { lat: number; lng: number }
  zoom?: number
  heightClass?: string
  onMarkerClick?: (id: string) => void
  selectedId?: string
}

export default function LeafletMap({
  markers,
  center = { lat: 14.5995, lng: 120.9842 },
  zoom = 12,
  heightClass = "h-96",
  onMarkerClick,
  selectedId,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map())

  // Initialize map once
  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom,
    })
    mapInstanceRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

  markersLayerRef.current = L.layerGroup().addTo(map)

    const handleResize = () => map.invalidateSize()
    window.addEventListener("resize", handleResize)
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      window.removeEventListener("resize", handleResize)
      map.remove()
      mapInstanceRef.current = null
      markersLayerRef.current = null
      markerMapRef.current.clear()
    }
  }, [center.lat, center.lng, zoom])

  // Update center/zoom when props change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    map.setView([center.lat, center.lng], zoom)
  }, [center.lat, center.lng, zoom])

  // Update markers when props change
  useEffect(() => {
    const map = mapInstanceRef.current
    const group = markersLayerRef.current
    if (!map || !group) return

    group.clearLayers()
    markerMapRef.current.clear()
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: defaultIcon })
      marker.bindPopup(`<strong>${m.name}</strong><br/>${m.type}`)
      if (typeof window !== "undefined") {
        marker.on("click", () => {
          // fire callback with id
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          typeof onMarkerClick === "function" && onMarkerClick(m.id)
        })
      }
      marker.addTo(group)
      markerMapRef.current.set(m.id, marker)
    })
  }, [markers, onMarkerClick])

  // Open popup for selected marker id
  useEffect(() => {
    if (!selectedId) return
    const m = markerMapRef.current.get(selectedId)
    const map = mapInstanceRef.current
    if (m && map) {
      m.openPopup()
    }
  }, [selectedId])

  return (
    <div className="w-full">
  <div ref={mapContainerRef} className={`w-full ${heightClass} rounded-lg border border-gray-200`} />
      <p className="mt-2 text-xs text-gray-500">OpenStreetMap tiles. Data are for illustration purposes only.</p>
    </div>
  )
}
