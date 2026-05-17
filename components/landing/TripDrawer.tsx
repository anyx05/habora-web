"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Ship, X, Loader2, Anchor, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner"
import { useTranslations, useLocale } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import {
  useCurrentItinerary,
  useRemoveBookingFromItinerary,
  useConfirmItinerary,
  useCancelItinerary,
} from "@/lib/queries/itineraries"
import type { BookingResponse } from "@/lib/api/habora-client"

export function TripDrawer() {
  const t = useTranslations("Trip")
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ── Auth check ─────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
    }
    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Data hooks ─────────────────────────────────────────────────
  const { data: itinerary, isLoading } = useCurrentItinerary()
  const removeMutation = useRemoveBookingFromItinerary()
  const confirmMutation = useConfirmItinerary()
  const cancelMutation = useCancelItinerary()

  const bookings = itinerary?.bookings ?? []
  const bookingCount = bookings.length
  const totalPrice = itinerary?.totalEstimatedPrice ?? 0

  // ── Listen for trip-updated custom events from chat ────────────
  useEffect(() => {
    const handleTripUpdated = () => {
      // The query will auto-refetch via invalidation, but we can
      // also open the drawer to show the new item
      if (isAuthenticated) {
        setIsOpen(true)
      }
    }
    window.addEventListener("trip-updated", handleTripUpdated)
    return () => window.removeEventListener("trip-updated", handleTripUpdated)
  }, [isAuthenticated])

  // ── Handlers ───────────────────────────────────────────────────
  const handleRemove = useCallback(
    (bookingId: string) => {
      if (!itinerary) return
      removeMutation.mutate(
        { itineraryId: itinerary.id, bookingId },
        {
          onError: (error) => {
            toast.error(error.message || "Failed to remove item")
          },
        }
      )
    },
    [itinerary, removeMutation]
  )

  const handleConfirm = useCallback(() => {
    if (!itinerary) return
    confirmMutation.mutate(itinerary.id, {
      onSuccess: (data) => {
        const count = data.confirmedBookings?.length ?? bookingCount
        toast.success(t("confirmSuccess", { count }))
        setIsOpen(false)
      },
      onError: (error: any) => {
        if (error.errorCode === "BERTH_CONFLICT_IN_ITINERARY") {
          toast.error(t("confirmConflict"))
        } else {
          toast.error(error.message || "Confirmation failed")
        }
      },
    })
  }, [itinerary, confirmMutation, bookingCount, t])

  const handleCancel = useCallback(() => {
    if (!itinerary) return
    cancelMutation.mutate(itinerary.id, {
      onSuccess: () => {
        setIsOpen(false)
      },
      onError: (error) => {
        toast.error(error.message || "Cancellation failed")
      },
    })
  }, [itinerary, cancelMutation])

  // ── Date formatter ─────────────────────────────────────────────
  const formatDate = useCallback(
    (dateStr: string) => {
      const date = new Date(dateStr + "T00:00:00")
      return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
    },
    [locale]
  )

  const calculateNights = useCallback(
    (arrival: string, departure: string) => {
      const a = new Date(arrival)
      const d = new Date(departure)
      return Math.ceil((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
    },
    []
  )

  // ── Don't render for unauthenticated users ─────────────────────
  if (!isAuthenticated) return null

  // ── Don't show trigger if no itinerary or empty ────────────────
  const showTrigger = !isLoading && itinerary && bookingCount > 0

  return (
    <>
      {/* ── Floating Trigger Button ──────────────────────────────── */}
      <AnimatePresence>
        {showTrigger && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-20 right-4 sm:right-6 z-[1050] flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-navy to-slate text-white shadow-xl shadow-navy/30 hover:shadow-2xl hover:shadow-navy/40 transition-shadow"
            aria-label={t("openTrip")}
            id="trip-drawer-trigger"
          >
            <Ship className="w-4 h-4" />
            <span className="text-sm font-medium">{t("openTrip")}</span>
            <Badge className="bg-amber text-navy text-xs font-bold px-1.5 py-0 min-w-[20px] h-5">
              {bookingCount}
            </Badge>

            {/* Subtle pulse on the badge */}
            <motion.span
              className="absolute right-3 top-1 w-5 h-5 rounded-full bg-amber/40"
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Trip Drawer (Sheet) ───────────────────────────────────── */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-navy/95 backdrop-blur-xl border-l border-white/10 text-white flex flex-col p-0"
        >
          {/* Header */}
          <SheetHeader className="p-5 pb-4 border-b border-white/10 bg-gradient-to-r from-navy to-slate">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber/20 to-amber/10 text-amber ring-1 ring-amber/30">
                <Ship className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <SheetTitle className="text-white text-lg">
                  {t("drawerTitle")}
                </SheetTitle>
                <SheetDescription className="text-white/50 text-xs">
                  {itinerary?.name || "My trip"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Content — scrollable booking list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
            {bookingCount === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4">
                  <Anchor className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/50 text-sm max-w-[240px]">
                  {t("empty")}
                </p>
              </div>
            ) : (
              /* Booking Cards */
              bookings.map((booking: BookingResponse) => {
                const nights = calculateNights(
                  booking.arrivalDate,
                  booking.departureDate
                )
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group relative rounded-xl bg-white/[0.05] border border-white/10 p-4 hover:bg-white/[0.08] transition-colors"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(booking.id)}
                      disabled={removeMutation.isPending}
                      className="absolute top-3 right-3 p-1 rounded-md text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={t("removeItem")}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Berth info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan/10 text-cyan shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          Berth {booking.berthId.slice(0, 8)}
                        </p>
                        <p className="text-xs text-white/50">
                          {booking.vesselName} · {booking.vesselLengthM}m
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-amber/70" />
                      <span>
                        {formatDate(booking.arrivalDate)} –{" "}
                        {formatDate(booking.departureDate)}
                      </span>
                      <span className="text-white/30">·</span>
                      <span>{nights} {nights === 1 ? (locale === 'et' ? 'öö' : 'night') : (locale === 'et' ? 'ööd' : 'nights')}</span>
                    </div>

                    {/* Price */}
                    {booking.totalPrice != null && (
                      <div className="text-right">
                        <span className="text-sm font-semibold text-amber">
                          €{booking.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {bookingCount > 0 && (
            <SheetFooter className="p-4 pt-3 border-t border-white/10 bg-navy/50 backdrop-blur-sm flex flex-col gap-3">
              {/* Total */}
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-white/60 font-medium">
                  {t("totalLabel")}
                </span>
                <span className="text-lg font-bold text-white">
                  €{totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Confirm button */}
              <Button
                onClick={handleConfirm}
                disabled={confirmMutation.isPending || bookingCount === 0}
                className="w-full h-11 bg-gradient-to-r from-amber to-amber/90 hover:from-amber/90 hover:to-amber text-navy font-semibold shadow-lg shadow-amber/20 transition-all"
                id="confirm-trip-btn"
              >
                {confirmMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  t("confirm")
                )}
              </Button>

              {/* Cancel button — with AlertDialog confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full text-white/50 hover:text-red-400 hover:bg-red-400/10"
                    id="cancel-trip-btn"
                  >
                    {t("cancel")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-navy border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      {t("cancelDialogTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      {t("cancelDialogMessage")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/10 border-white/10 text-white hover:bg-white/20 hover:text-white">
                      {t("cancelKeep")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      {cancelMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {t("cancelConfirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
