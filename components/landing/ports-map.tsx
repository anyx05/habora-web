"use client"

import { useMemo, useRef } from "react"
import Map, { NavigationControl, MapRef } from "react-map-gl/mapbox"
import { PortMarker } from "./port-marker"
import { Navigation } from "lucide-react"

export interface MapPort {
  id: string
  name: string
  description: string | null
  coordinates: string | null
  berths: any[]
}

interface PortsMapProps {
  ports: MapPort[]
}

const ESTONIA_CENTER = { longitude: 24.7, latitude: 59.05 }
const DEFAULT_ZOOM = 7
const MIN_ZOOM = 2
const MAX_ZOOM = 16

export default function PortsMap({ ports }: PortsMapProps) {
  const mapRef = useRef<MapRef>(null)
  
  // Calculate bounding box to fit all ports on mount/recenter
  const validPorts = useMemo(() => {
    return ports
      .filter((p) => p.coordinates)
      .map((p) => {
        const [latStr, lngStr] = p.coordinates!.split(",")
        const lat = parseFloat(latStr)
        const lng = parseFloat(lngStr)
        if (isNaN(lat) || isNaN(lng)) return null
        return { ...p, coords: [lng, lat] as [number, number] } // Mapbox is [lng, lat]
      })
      .filter(Boolean) as (MapPort & { coords: [number, number] })[]
  }, [ports])

  const bounds = useMemo(() => {
    if (validPorts.length === 0) return null
    const lngs = validPorts.map(p => p.coords[0])
    const lats = validPorts.map(p => p.coords[1])
    return [
      [Math.min(...lngs) - 0.5, Math.min(...lats) - 0.5], // SW
      [Math.max(...lngs) + 0.5, Math.max(...lats) + 0.5]  // NE
    ] as [[number, number], [number, number]]
  }, [validPorts])

  const handleRecenter = (e: React.MouseEvent) => {
    e.preventDefault()
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 })
    } else if (mapRef.current) {
      mapRef.current.flyTo({ center: [ESTONIA_CENTER.longitude, ESTONIA_CENTER.latitude], zoom: DEFAULT_ZOOM })
    }
  }

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: ESTONIA_CENTER.longitude,
          latitude: ESTONIA_CENTER.latitude,
          zoom: DEFAULT_ZOOM
        }}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        renderWorldCopies={true}
        onLoad={() => {
          if (bounds && mapRef.current) {
            mapRef.current.fitBounds(bounds, { padding: 80, duration: 0 })
          }
        }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {validPorts.map((port) => (
          <PortMarker
            key={port.id}
            name={port.name}
            description={port.description}
            longitude={port.coords[0]}
            latitude={port.coords[1]}
            totalBerths={port.berths?.length || 0}
          />
        ))}
      </Map>

      {/* Recenter Tool */}
      <button
        onClick={handleRecenter}
        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-[#111d2e]/90 text-white border border-white/10 rounded-lg backdrop-blur shadow-md hover:bg-[#1e293b] transition-colors"
        title="Recenter to ports"
      >
        <Navigation className="w-4 h-4" />
      </button>
    </div>
  )
}
