"use client"

import { useMemo } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Header } from "@/components/landing/header"
import { TripDrawer } from "@/components/landing/TripDrawer"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Anchor, MapPin, Calendar, RefreshCw } from "lucide-react"
import { useUserItineraries } from "@/lib/queries/itineraries"
import { HaboraApiError, type ItineraryWithBookingsResponse } from "@/lib/api/habora-client"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0]

function getDateRange(itinerary: ItineraryWithBookingsResponse) {
  const dates = itinerary.bookings.flatMap((b) => [b.arrivalDate, b.departureDate])
  if (dates.length === 0) return null
  return {
    earliest: dates.reduce((a, b) => (a < b ? a : b)),
    latest: dates.reduce((a, b) => (a > b ? a : b)),
  }
}

function isUpcoming(itinerary: ItineraryWithBookingsResponse) {
  if (itinerary.status !== "confirmed") return false
  return itinerary.bookings.some((b) => b.arrivalDate >= today)
}

function isPast(itinerary: ItineraryWithBookingsResponse) {
  if (itinerary.status !== "confirmed") return false
  return itinerary.bookings.every((b) => b.departureDate < today)
}

function isCancelled(itinerary: ItineraryWithBookingsResponse) {
  return itinerary.status === "cancelled"
}

// ─── Date formatter ───────────────────────────────────────────────────────────

function useFormatDate() {
  const locale = useLocale()
  return (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(date)
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("MyTrips")
  const label = status === "confirmed" ? t("confirmed") : status === "cancelled" ? t("cancelledStatus") : t("draft")
  const cls =
    status === "confirmed"
      ? "bg-emerald-500/10 text-emerald-500"
      : status === "cancelled"
      ? "bg-rose-500/10 text-rose-500"
      : "bg-amber/10 text-amber"
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}

// ─── Itinerary Card ───────────────────────────────────────────────────────────

function ItineraryCard({ itinerary }: { itinerary: ItineraryWithBookingsResponse }) {
  const t = useTranslations("MyTrips")
  const formatDate = useFormatDate()
  const dateRange = getDateRange(itinerary)
  const portNames = [...new Set(itinerary.bookings.map((b) => b.berthId))]

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-5 hover:border-border hover:shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{itinerary.name}</h3>
          {dateRange && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(dateRange.earliest)} – {formatDate(dateRange.latest)}
            </p>
          )}
        </div>
        <StatusBadge status={itinerary.status} />
      </div>

      {/* Stops summary */}
      {itinerary.bookings.length > 1 && (
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan/70" />
          {t("stops", { count: itinerary.bookings.length })}
        </p>
      )}

      {/* Booking list */}
      {itinerary.bookings.length > 0 && (
        <div className="space-y-2 mb-4">
          {itinerary.bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-muted/40 text-xs"
            >
              <span className="text-muted-foreground truncate">
                {formatDate(booking.arrivalDate)} – {formatDate(booking.departureDate)}
              </span>
              {booking.confirmationCode && (
                <code className="font-mono text-cyan/80 shrink-0">{booking.confirmationCode}</code>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {itinerary.totalEstimatedPrice > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("total")}</span>
          <span className="font-semibold text-foreground">
            €{itinerary.totalEstimatedPrice.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Tab Panel ────────────────────────────────────────────────────────────────

function TripList({
  items,
  emptyMessage,
  emptyLink,
}: {
  items: ItineraryWithBookingsResponse[]
  emptyMessage: string
  emptyLink?: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Anchor className="w-9 h-9 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        {emptyLink && (
          <a
            href="/#map"
            className="mt-2 text-sm text-cyan hover:text-cyan-light underline underline-offset-2 transition-colors"
          >
            {emptyLink}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <ItineraryCard key={it.id} itinerary={it} />
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MyTripsPage() {
  const t = useTranslations("MyTrips")
  const { data, isLoading, error, refetch } = useUserItineraries()

  const { upcoming, past, cancelled } = useMemo(() => {
    const all = data ?? []
    return {
      upcoming: all.filter(isUpcoming),
      past: all.filter(isPast),
      cancelled: all.filter(isCancelled),
    }
  }, [data])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <TripDrawer />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-8">
          {t("title")}
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl bg-slate-800/40" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
            <p className="text-sm font-medium text-destructive">{t("error")}</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof HaboraApiError
                ? `${error.status}: ${error.message}`
                : "Network error — check your connection or the API URL."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">
                {t("upcoming")}
                {upcoming.length > 0 && (
                  <span className="ml-1.5 text-xs bg-amber/20 text-amber rounded-full px-1.5">
                    {upcoming.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">{t("past")}</TabsTrigger>
              <TabsTrigger value="cancelled">{t("cancelled")}</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <TripList
                items={upcoming}
                emptyMessage={t("emptyUpcoming")}
                emptyLink={t("emptyUpcomingLink")}
              />
            </TabsContent>

            <TabsContent value="past">
              <TripList items={past} emptyMessage={t("emptyPast")} />
            </TabsContent>

            <TabsContent value="cancelled">
              <TripList items={cancelled} emptyMessage={t("emptyCancelled")} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
}
