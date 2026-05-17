"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useAnalyticsData } from "@/lib/queries/analytics"
import { Loader2, TrendingUp, Anchor, Ship, Clock, AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"

const COLORS = ['#06b6d4', '#FFBF00', '#1e293b', '#e2e8f0']

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalyticsData()
  const t = useTranslations("Dashboard") // Reusing some translations

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-cyan">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading Analytics...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-rose-500">
        <AlertTriangle className="w-8 h-8 mb-4" />
        <p>Failed to load analytics data. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your marina's performance and occupancy trends.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Occupancy Rate
              <Anchor className="w-4 h-4 text-cyan" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Based on 30-day capacity</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Cancellation Rate
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data.cancellationRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Of total bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Daily revenue inferred from bookings (Last 14 Days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#8899aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8899aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0a1628', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#06b6d4' }}
                    formatter={(value) => [`€${value}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#0a1628', stroke: '#06b6d4', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vessel Size Mix Pie Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ship className="w-5 h-5 text-amber" />
              Vessel Size Mix
            </CardTitle>
            <CardDescription>Distribution of bookings by assigned berth length</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              {data.vesselSizeMix.every(item => item.value === 0) ? (
                <p className="text-muted-foreground text-sm">Not enough data</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.vesselSizeMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.vesselSizeMix.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0a1628', borderColor: '#1e293b', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {data.vesselSizeMix.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lead Time Bar Chart */}
        <Card className="border-border/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan" />
              Booking Lead Time
            </CardTitle>
            <CardDescription>How far in advance customers book their berths</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.leadTimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#8899aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8899aa" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0a1628', borderColor: '#1e293b', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
                  />
                  <Bar dataKey="value" name="Bookings" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
