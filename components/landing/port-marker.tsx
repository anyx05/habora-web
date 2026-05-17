"use client"

import { useState } from "react"
import { Marker, Popup } from "react-map-gl/mapbox"
import { Button } from "@/components/ui/button"
import { Ship, Navigation } from "lucide-react"

interface PortMarkerProps {
  name: string
  description: string | null
  longitude: number
  latitude: number
  totalBerths: number
}

export function PortMarker({ name, description, longitude, latitude, totalBerths }: PortMarkerProps) {
  const [showPopup, setShowPopup] = useState(false)

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(
      new CustomEvent('open-chat', {
        detail: {
          prompt: `I want to check berth availability at ${name}.`
        }
      })
    )
  }

  return (
    <>
      <Marker
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={e => {
          e.originalEvent.stopPropagation()
          setShowPopup(true)
        }}
      >
        <div 
          className="port-marker-dot cursor-pointer"
          onMouseEnter={() => setShowPopup(true)}
          onMouseLeave={() => setShowPopup(false)}
        >
          <div className="port-marker-pulse"></div>
          <div className="port-marker-core"></div>
        </div>
      </Marker>

      {showPopup && (
        <Popup
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
          offset={14}
          closeButton={false}
          closeOnClick={false}
          className="z-50"
          maxWidth="280px"
        >
          <div className="p-3 space-y-3 min-w-[200px]">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan" />
                {name}
              </h3>
              {description && (
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <Ship className="w-4 h-4 text-amber" />
              <span>{totalBerths} Berths Total</span>
            </div>

            <Button 
              onClick={handleAskAI}
              className="w-full bg-cyan/20 hover:bg-cyan/30 text-cyan-light border border-cyan/30 transition-all mt-2"
            >
              Ask AI to Book
            </Button>
          </div>
        </Popup>
      )}
    </>
  )
}
