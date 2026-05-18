"use client"

import { use, useState, useEffect, useCallback } from "react"
import { useRouter } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"
import { Header } from "@/components/landing/header"
import { TripDrawer } from "@/components/landing/TripDrawer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Anchor, ArrowLeft, MapPin, Mail, Ship, Ruler, Droplets, Tag } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { usePortById, type PublicBerth } from "@/lib/queries/public"
import {
  useCurrentItinerary,
  useCreateItinerary,
  useAddBookingToItinerary,
} from "@/lib/queries/itineraries"
import { HaboraApiError } from "@/lib/api/habora-client"

// ─── Auth state hook ─────────────────────────────────────────────────────────

function useAuthState() {
  const [user, setUser] = useState<{ email: string; fullName: string | null; role: string | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setUser(null)
        setIsLoading(false)
        return
      }
      const { data: profile } = await supabase.from("users").select("role").eq("id", authUser.id).maybeSingle()
      setUser({
        email: authUser.email ?? "",
        fullName: authUser.user_metadata?.full_name ?? null,
        role: profile?.role ?? null,
      })
      setIsLoading(false)
    }

    fetchUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchUser())
    return () => subscription.unsubscribe()
  }, [])

  return { user, isLoading }
}

// ─── Berth Card ──────────────────────────────────────────────────────────────

interface BerthCardProps {
  berth: PublicBerth
  nights: number
  vesselName: string
  vesselLength: string
  vesselDraft: string
  arrivalDate: string
  departureDate: string
  user: { email: string; fullName: string | null; role: string | null } | null
  authLoading: boolean
}

function BerthCard({
  berth, nights, vesselName, vesselLength, vesselDraft,
  arrivalDate, departureDate, user, authLoading,
}: BerthCardProps) {
  const t = useTranslations("PortDetail")
  const { data: currentItinerary } = useCurrentItinerary()
  const createItinerary = useCreateItinerary()
  const addBooking = useAddBookingToItinerary()
  const [isPending, setIsPending] = useState(false)

  const totalPrice = berth.price_per_night * nights

  // Determine disabled reason
  let disabledReason: string | null = null
  if (!user) disabledReason = t("signInTooltip")
  else if (user.role === "port_operator") disabledReason = t("operatorTooltip")
  else if (!vesselName.trim() || !vesselLength.trim()) disabledReason = t("vesselDetailsTooltip")

  const handleAddToTrip = useCallback(async () => {
    if (disabledReason || isPending) return
    setIsPending(true)
    try {
      // Get or create itinerary
      let itineraryId = currentItinerary?.id
      if (!itineraryId) {
        const created = await createItinerary.mutateAsync({ name: "My trip" })
        itineraryId = created.id
      }

      await addBooking.mutateAsync({
        itineraryId,
        request: {
          berthId: berth.id,
          customerName: user!.fullName || user!.email,
          customerEmail: user!.email,
          vesselName: vesselName.trim(),
          vesselLengthM: parseFloat(vesselLength),
          vesselDraftM: vesselDraft ? parseFloat(vesselDraft) : undefined,
          arrivalDate,
          departureDate,
        },
      })

      toast.success(t("addedToTrip"))
      // Notify TripDrawer to open
      window.dispatchEvent(new CustomEvent("trip-updated"))
    } catch (err) {
      if (err instanceof HaboraApiError && err.errorCode === "BERTH_UNAVAILABLE") {
        toast.error(t("berthTaken"))
      } else {
        toast.error((err as Error).message || "Something went wrong")
      }
    } finally {
      setIsPending(false)
    }
  }, [disabledReason, isPending, currentItinerary, createItinerary, addBooking, berth, user, vesselName, vesselLength, vesselDraft, arrivalDate, departureDate, t])

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-5 hover:border-border hover:shadow-md transition-all duration-200">
      {/* Name + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-foreground">{berth.name}</h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
          Available
        </span>
      </div>

      {/* Specs */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-cyan/70" />
          {t("maxLength")} {berth.max_length_m}m
        </span>
        <span className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-cyan/70" />
          {t("maxDraft")} {berth.max_draft_m}m
        </span>
      </div>

      {/* Amenities */}
      {berth.amenities && berth.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {berth.amenities.map((a) => (
            <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border/50 text-muted-foreground">
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Pricing */}
      <div className="flex items-end justify-between mt-4">
        <div>
          <p className="text-xs text-muted-foreground">
            €{berth.price_per_night.toFixed(2)} {t("perNight")}
          </p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {t("totalFor", { n: nights, total: totalPrice.toFixed(2) })}
          </p>
        </div>

        <div className="relative group/btn">
          <Button
            onClick={handleAddToTrip}
            disabled={!!disabledReason || isPending}
            size="sm"
            className="bg-amber hover:bg-amber/90 text-navy font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-navy/40 border-t-navy rounded-full animate-spin" />
                {t("addToTrip")}
              </span>
            ) : (
              t("addToTrip")
            )}
          </Button>
          {disabledReason && (
            <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 text-xs bg-popover text-popover-foreground border border-border rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity z-10">
              {disabledReason}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PortDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { id } = use(params)
  const t = useTranslations("PortDetail")
  const router = useRouter()
  const locale = useLocale()

  const { data: port, isLoading, error } = usePortById(id)
  const { user, isLoading: authLoading } = useAuthState()

  // Vessel form — persists across add-to-trip actions
  const [vesselName, setVesselName] = useState("")
  const [vesselLength, setVesselLength] = useState("")
  const [vesselDraft, setVesselDraft] = useState("")

  // Date range
  const today = new Date().toISOString().split("T")[0]
  const [arrivalDate, setArrivalDate] = useState("")
  const [departureDate, setDepartureDate] = useState("")

  const datesSelected = !!arrivalDate && !!departureDate && departureDate > arrivalDate

  const nights = datesSelected
    ? Math.ceil(
        (new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  // Filter berths by vessel size + status
  const availableBerths: PublicBerth[] = (port?.berths ?? []).filter((b) => {
    if (b.status !== "available") return false
    if (vesselLength && parseFloat(vesselLength) > b.max_length_m) return false
    if (vesselDraft && parseFloat(vesselDraft) > b.max_draft_m) return false
    return true
  })

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <TripDrawer />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Back link */}
        <button
          onClick={() => router.push("/" as any)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t("backToMap")}
        </button>

        {/* ── Port Hero ── */}
        {isLoading ? (
          <div className="space-y-3 mb-10">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error || !port ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Anchor className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-lg font-semibold text-foreground">Port not found</p>
            <p className="text-muted-foreground text-sm mt-1">
              This marina may have been removed or the link is invalid.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
                {port.name}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan/70" />
                  {port.location}
                </span>
                {port.contact_email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-cyan/70" />
                    {port.contact_email}
                  </span>
                )}
              </div>
              {port.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {port.description}
                </p>
              )}
            </div>

            {/* ── Vessel Details ── */}
            <section className="mb-8 p-5 rounded-2xl bg-card border border-border/60">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Ship className="w-4 h-4 text-cyan" />
                {t("vesselTitle")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {t("vesselName")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    placeholder={t("vesselNamePlaceholder")}
                    className="w-full h-9 px-3 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {t("vesselLength")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={vesselLength}
                    onChange={(e) => setVesselLength(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {t("vesselDraft")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={vesselDraft}
                    onChange={(e) => setVesselDraft(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* ── Date Range ── */}
            <section className="mb-8 p-5 rounded-2xl bg-card border border-border/60">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan" />
                {t("datesTitle")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {t("arrival")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={arrivalDate}
                    onChange={(e) => {
                      setArrivalDate(e.target.value)
                      // Auto-clear departure if it's no longer after arrival
                      if (departureDate && departureDate <= e.target.value) {
                        setDepartureDate("")
                      }
                    }}
                    className="w-full h-9 px-3 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {t("departure")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    min={arrivalDate || today}
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-background border border-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* ── Available Berths ── */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-4">
                {t("berthsTitle")}
              </h2>

              {!datesSelected ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
                  <p className="text-muted-foreground text-sm">{t("selectDatesPrompt")}</p>
                </div>
              ) : availableBerths.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
                  <Anchor className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">{t("noBerths")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableBerths.map((berth) => (
                    <BerthCard
                      key={berth.id}
                      berth={berth}
                      nights={nights}
                      vesselName={vesselName}
                      vesselLength={vesselLength}
                      vesselDraft={vesselDraft}
                      arrivalDate={arrivalDate}
                      departureDate={departureDate}
                      user={user}
                      authLoading={authLoading}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
