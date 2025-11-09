"use client"

import React from "react"

export type DummyPoint = {
  id: string
  name: string
  type: "Endocrinologist" | "Primary Care" | "Pharmacy" | "Hospital" | "Urgent Care"
  x: number // 0-1000 (svg coord)
  y: number // 0-600 (svg coord)
  color?: string
}

type Props = {
  points: DummyPoint[]
  heightClass?: string
}

// Simple SVG “map” with a grid and dots. No external APIs.
export default function DummyMap({ points, heightClass = "h-96" }: Props) {
  const width = 1000
  const height = 600

  return (
    <div className={`w-full ${heightClass}`}>
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
        >
          {/* Light background grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* a couple of abstract shapes for city blocks */}
          <g opacity="0.08">
            <rect x="80" y="80" width="280" height="180" fill="#3b82f6" />
            <rect x="420" y="120" width="220" height="140" fill="#22c55e" />
            <rect x="700" y="80" width="200" height="220" fill="#a855f7" />
            <rect x="180" y="340" width="220" height="180" fill="#ef4444" />
            <rect x="520" y="360" width="320" height="160" fill="#f59e0b" />
          </g>

          {/* points */}
          {points.map((p) => (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r={10} fill={p.color || colorForType(p.type)} stroke="#ffffff" strokeWidth={2} />
              <text x={p.x + 14} y={p.y + 4} fontSize={16} fill="#374151">{p.name}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 text-xs text-gray-500">Data are for illustration purposes only</div>
    </div>
  )
}

function colorForType(t: DummyPoint["type"]) {
  switch (t) {
    case "Endocrinologist":
      return "#3b82f6" // blue
    case "Primary Care":
      return "#22c55e" // green
    case "Pharmacy":
      return "#f59e0b" // amber
    case "Hospital":
      return "#ef4444" // red
    case "Urgent Care":
      return "#a855f7" // purple
    default:
      return "#6b7280" // gray
  }
}
