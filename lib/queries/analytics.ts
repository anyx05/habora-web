import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useCurrentPortId } from './berths';

export interface AnalyticsData {
  revenueTrend: { date: string; revenue: number }[];
  vesselSizeMix: { name: string; value: number }[];
  leadTimeDistribution: { name: string; value: number }[];
  cancellationRate: number;
  occupancyRate: number;
}

export function useAnalyticsData() {
  const { data: portId } = useCurrentPortId();
  
  return useQuery({
    queryKey: ['analytics', portId],
    enabled: !!portId,
    queryFn: async (): Promise<AnalyticsData> => {
      const supabase = createClient();
      
      // 1. Fetch berths to know capacity and pricing
      const { data: berths, error: berthsError } = await supabase
        .from('berths')
        .select('id, max_length_m, price_per_night')
        .eq('port_id', portId);
        
      if (berthsError) throw new Error(berthsError.message);
      
      const berthIds = (berths ?? []).map((b: any) => b.id);
      
      // 2. Fetch recent bookings (last 30 days roughly, or all depending on scale)
      // For a real dashboard, you'd filter by a date range. Here we fetch a good chunk.
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, berth_id, arrival_date, departure_date, created_at, status')
        .in('berth_id', berthIds)
        .gte('created_at', thirtyDaysAgo);
        
      if (bookingsError) throw new Error(bookingsError.message);

      // --- Calculate Metrics ---
      
      // A. Revenue Trend (Group by week or day)
      // We will do a simple daily revenue for the last 7-14 days.
      const revenueMap: Record<string, number> = {};
      const sizeMixMap: Record<string, number> = { 'Small (<10m)': 0, 'Medium (10-20m)': 0, 'Large (20m+)': 0 };
      const leadTimeMap: Record<string, number> = { '0-2 days': 0, '3-7 days': 0, '8-30 days': 0, '30+ days': 0 };
      
      let cancelledCount = 0;
      let totalBookedNights = 0;

      (bookings ?? []).forEach((booking: any) => {
        if (booking.status === 'cancelled') {
          cancelledCount++;
          return; // Skip cancelled bookings for revenue/occupancy
        }
        
        const arrival = new Date(booking.arrival_date);
        const departure = new Date(booking.departure_date);
        const created = new Date(booking.created_at);
        
        // Ensure valid dates
        if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) return;
        
        const nights = Math.max(1, Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)));
        totalBookedNights += nights;

        const berth = berths?.find((b: any) => b.id === booking.berth_id);
        const price = berth?.price_per_night || 0;
        const revenue = nights * price;
        
        // Assign revenue to the creation date (or arrival date, depending on accounting preference)
        const dateKey = created.toISOString().split('T')[0];
        revenueMap[dateKey] = (revenueMap[dateKey] || 0) + revenue;
        
        // Vessel Size Mix (inferred from berth length)
        const length = berth?.max_length_m || 0;
        if (length < 10) sizeMixMap['Small (<10m)']++;
        else if (length <= 20) sizeMixMap['Medium (10-20m)']++;
        else sizeMixMap['Large (20m+)']++;
        
        // Lead Time
        const leadDays = Math.max(0, Math.ceil((arrival.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
        if (leadDays <= 2) leadTimeMap['0-2 days']++;
        else if (leadDays <= 7) leadTimeMap['3-7 days']++;
        else if (leadDays <= 30) leadTimeMap['8-30 days']++;
        else leadTimeMap['30+ days']++;
      });
      
      // Formatting Revenue Trend for Recharts (sort by date)
      const revenueTrend = Object.keys(revenueMap)
        .sort()
        .slice(-14) // last 14 days of data
        .map(date => ({
          date: date.slice(5), // MM-DD
          revenue: revenueMap[date]
        }));
        
      const vesselSizeMix = Object.entries(sizeMixMap).map(([name, value]) => ({ name, value }));
      const leadTimeDistribution = Object.entries(leadTimeMap).map(([name, value]) => ({ name, value }));
      
      const totalBookings = bookings?.length || 0;
      const cancellationRate = totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0;
      
      // Simple Occupancy (booked nights / (total berths * 30 days))
      const totalCapacityNights = (berths?.length || 0) * 30;
      const occupancyRate = totalCapacityNights > 0 ? Math.round((totalBookedNights / totalCapacityNights) * 100) : 0;

      return {
        revenueTrend,
        vesselSizeMix,
        leadTimeDistribution,
        cancellationRate,
        occupancyRate
      };
    }
  });
}
