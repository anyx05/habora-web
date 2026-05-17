"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ship, Calendar, CheckCircle2, Anchor, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBookings } from "@/lib/queries/bookings"
import { formatDistanceToNow } from "date-fns"
import { useTranslations } from "next-intl"

export function ActivityFeed() {
  const { data: bookings = [], isLoading } = useBookings()
  const t = useTranslations("ActivityFeed")

  const activityConfig: Record<string, { icon: typeof Ship; iconBg: string; verb: string }> = {
    confirmed: {
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-600",
      verb: t("bookingConfirmed"),
    },
    pending: {
      icon: Calendar,
      iconBg: "bg-amber/10 text-amber",
      verb: t("bookingPending"),
    },
    cancelled: {
      icon: XCircle,
      iconBg: "bg-rose-500/10 text-rose-600",
      verb: t("bookingCancelled"),
    },
  }

  // Take latest 5 bookings as activity items, sorted by most recent
  const activities = bookings.slice(0, 5).map((booking) => {
    const config = activityConfig[booking.status] ?? activityConfig.pending
    return {
      id: booking.id,
      title: config.verb,
      description: `${booking.customerName} — ${booking.vessel}`,
      time: booking.arrival
        ? formatDistanceToNow(new Date(booking.arrival), { addSuffix: true })
        : "Recently",
      icon: config.icon,
      iconBg: config.iconBg,
    }
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-2/3 h-4 bg-muted animate-pulse rounded" />
                  <div className="w-1/2 h-3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center">
            <Anchor className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full shrink-0",
                    activity.iconBg
                  )}
                >
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
