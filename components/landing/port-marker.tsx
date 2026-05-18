"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "@/i18n/routing"
import { Marker, Popup } from "react-map-gl/mapbox"
import { Button } from "@/components/ui/button"
import { Ship, Navigation, X, MapPin } from "lucide-react"

interface PortMarkerProps {
  id: string
  name: string
  description: string | null
  longitude: number
  latitude: number
  totalBerths: number
}

export function PortMarker({ id, name, description, longitude, latitude, totalBerths }: PortMarkerProps) {
  const [showPopup, setShowPopup] = useState(false)
  const router = useRouter()
  // Track whether pointer is over the marker or the popup card
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Clear any pending hide so moving between marker ↔ popup doesn't flicker */
  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [])

  /** Schedule hide with a small grace period (150 ms is enough to cross the gap) */
  const scheduleHide = useCallback(() => {
    cancelHide()
    hideTimer.current = setTimeout(() => setShowPopup(false), 150)
  }, [cancelHide])

  const open = useCallback(() => {
    cancelHide()
    setShowPopup(true)
  }, [cancelHide])

  const close = useCallback(() => {
    setShowPopup(false)
    cancelHide()
  }, [cancelHide])

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation()
    close()
    window.dispatchEvent(
      new CustomEvent('open-chat', {
        detail: {
          prompt: `I want to check berth availability at ${name}.`
        }
      })
    )
  }

  const handleViewPort = (e: React.MouseEvent) => {
    e.stopPropagation()
    close()
    router.push(`/ports/${id}` as any)
  }

  return (
    <>
      <Marker
        longitude={longitude}
        latitude={latitude}
        anchor="center"
        onClick={e => {
          e.originalEvent.stopPropagation()
          // Click toggles; if already open, close it
          if (showPopup) {
            close()
          } else {
            open()
          }
        }}
      >
        <div
          className="port-marker-dot cursor-pointer"
          onMouseEnter={open}
          onMouseLeave={scheduleHide}
        >
          <div className="port-marker-pulse" />
          <div className="port-marker-core" />
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
          {/*
            Wrap in a div that also participates in hover tracking.
            Moving the mouse from the marker dot to here cancels the
            scheduleHide, so the card stays visible.
          */}
          <div
            className="p-3 space-y-3 min-w-[200px]"
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
          >
            {/* Close button — lets users explicitly pin-and-dismiss */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 leading-tight">
                <Navigation className="w-4 h-4 text-cyan shrink-0" />
                {name}
              </h3>
              <button
                onClick={close}
                className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 mt-0.5"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {description && (
              <p className="text-sm text-slate-300 line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-200">
              <Ship className="w-4 h-4 text-amber" />
              <span>{totalBerths} Berths Total</span>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={handleViewPort}
                className="w-full bg-amber/90 hover:bg-amber text-navy font-semibold transition-all"
              >
                <MapPin className="w-4 h-4 mr-1.5" />
                View Port & Book
              </Button>
              <Button
                onClick={handleAskAI}
                variant="ghost"
                className="w-full bg-cyan/20 hover:bg-cyan/30 text-cyan-light border border-cyan/30 transition-all"
              >
                Ask AI to Book
              </Button>
            </div>
          </div>
        </Popup>
      )}
    </>
  )
}
