"use client"

import { Anchor, MapPin, Loader2 } from "lucide-react"
import { usePublicPortsAndBerths } from "@/lib/queries/public"
import { MapWrapper } from "./map-wrapper"
import { useTranslations } from "next-intl"

export function FeaturedPorts() {
  const { data, isLoading, error } = usePublicPortsAndBerths()
  const t = useTranslations("FeaturedPorts")

  const ports = data?.ports ?? []

  return (
    <section id="map" className="pt-12 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-cyan/10 mb-4 transition-transform duration-300 hover:scale-105">
            <MapPin className="w-5 h-5 text-cyan" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty text-sm sm:text-base leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Interactive Map */}
        <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_-15px_rgba(6,182,212,0.18)]">
          {/* Subtle gradient overlay to blend edges */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_50px_rgba(10,22,40,0.5)] z-20" />
          
          {isLoading ? (
            <div className="w-full h-full bg-card/50 flex flex-col items-center justify-center gap-4 text-cyan/70 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading Marina Map...</p>
            </div>
          ) : error ? (
            <div className="w-full h-full bg-card/50 flex flex-col items-center justify-center gap-4 text-rose-500 backdrop-blur-sm">
              <Anchor className="w-8 h-8" />
              <p className="font-medium">
                {t("error")} {error.message}
              </p>
            </div>
          ) : (
            <div className="w-full h-full">
              <MapWrapper ports={ports} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
