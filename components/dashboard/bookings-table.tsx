"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ship, Calendar } from "lucide-react"
import { useBookings } from "@/lib/queries/bookings"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/25",
  "in-progress": "bg-cyan/10 text-cyan border-cyan/20",
  cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20",
}

export function BookingsTable() {
  const { data: bookings = [], isLoading } = useBookings()
  const t = useTranslations("RecentBookings")

  const statusLabels: Record<string, string> = {
    confirmed: t("confirmed"),
    pending: t("pending"),
    "in-progress": t("inProgress"),
    cancelled: t("cancelled"),
  }

  // Show only the 5 most recent bookings on dashboard
  const recentBookings = bookings.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{t("title")}</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/bookings">{t("viewAll")}</a>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-4 bg-muted animate-pulse rounded" />
                  <div className="w-1/4 h-3 bg-muted animate-pulse rounded" />
                </div>
                <div className="w-20 h-6 bg-muted animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("customer")}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    {t("vessel")}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    {t("schedule")}
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="group hover:bg-muted/40 transition-colors relative"
                  >
                    <td className="py-4 px-4 relative">
                      {/* Left accent on hover */}
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-blue-500/0 group-hover:bg-blue-500/50 transition-colors" />
                      <span className="text-sm font-medium text-foreground">
                        {booking.customerName}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan/10 text-cyan">
                            <Ship className="w-4 h-4" />
                          </div>
                        <span className="text-sm text-foreground">
                          {booking.vessel}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {booking.arrival
                            ? format(new Date(booking.arrival), "MMM d")
                            : "N/A"}{" "}
                          →{" "}
                          {booking.departure
                            ? format(new Date(booking.departure), "MMM d")
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={
                          statusStyles[booking.status] ?? statusStyles.pending
                        }
                      >
                        {statusLabels[booking.status] ?? booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
