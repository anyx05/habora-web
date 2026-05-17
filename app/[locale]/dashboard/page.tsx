"use client"

import { Ship, Anchor, Calendar, TrendingUp } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { BookingsTable } from "@/components/dashboard/bookings-table"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { useDashboardStats } from "@/lib/queries/stats"
import { useTranslations } from "next-intl"

// import {
//   useCurrentItinerary,
//   useCreateItinerary,
// } from '@/lib/queries/itineraries';

// export default function DashboardPage() {
//   const { data, error, isLoading } = useCurrentItinerary();

//   const create = useCreateItinerary();

//   return (
//     <div>
//       Dashboard

//       <pre
//         style={{
//           position: 'fixed',
//           bottom: 0,
//           right: 0,
//           background: 'black',
//           color: 'lime',
//           padding: 10,
//           fontSize: 11,
//         }}
//       >
//         loading: {String(isLoading)}
//         {'\n'}
//         data: {JSON.stringify(data, null, 2)}
//         {'\n'}
//         error: {error?.message || 'none'}
//       </pre>

//       <button onClick={() => create.mutate({ name: 'Smoke test trip' })}>
//         Create itinerary
//       </button>
//     </div>
//   );
// }

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const t = useTranslations("DashboardHome")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[120px] rounded-xl bg-muted/50 animate-pulse" />
          ))
        ) : (
          <>
            <StatsCard
              title={t("totalBerths")}
              value={stats?.totalBerths ?? 0}
              change={`${stats?.availableBerths ?? 0} ${t("available")}`}
              changeType="positive"
              icon={Anchor}
              iconColor="bg-navy/10 text-navy"
            />
            <StatsCard
              title={t("activeBookings")}
              value={stats?.activeBookings ?? 0}
              change={`${stats?.occupiedBerths ?? 0} ${t("berthsOccupied")}`}
              changeType="neutral"
              icon={Ship}
              iconColor="bg-amber/10 text-amber"
            />
            <StatsCard
              title={t("thisWeek")}
              value={stats?.weekBookings ?? 0}
              change={t("bookingsCreated")}
              changeType="neutral"
              icon={Calendar}
              iconColor="bg-emerald-500/10 text-emerald-600"
            />
            <StatsCard
              title={t("occupancyRate")}
              value={`${stats?.occupancyRate ?? 0}%`}
              change={`${stats?.maintenanceBerths ?? 0} ${t("inMaintenance")}`}
              changeType={
                (stats?.occupancyRate ?? 0) > 70 ? "positive" : "neutral"
              }
              icon={TrendingUp}
              iconColor="bg-navy/10 text-navy"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BookingsTable />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}