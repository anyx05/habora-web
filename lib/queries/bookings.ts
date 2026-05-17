import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useCurrentPortId } from './berths';

export interface Booking {
  id: string;
  customerName: string;
  vessel: string;
  arrival: string;
  departure: string;
  status: string;
}

export function useBookings() {
  const { data: portId } = useCurrentPortId();
  
  return useQuery({
    queryKey: ['bookings', portId],
    enabled: !!portId,
    queryFn: async () => {
      const supabase = createClient();
      
      // Select bookings filtering by berths that belong to the current port.
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_name,
          vessel_name,
          arrival_date,
          departure_date,
          status,
          berths!inner(port_id)
        `)
        .eq('berths.port_id', portId)
        .order('arrival_date', { ascending: false });
        
      if (error) throw new Error(error.message);
      
      return data.map((b: any) => ({
        id: b.id,
        customerName: b.customer_name,
        vessel: b.vessel_name,
        arrival: b.arrival_date,
        departure: b.departure_date,
        status: b.status,
      })) as Booking[];
    }
  });
}

// Cancel a booking (set status to 'cancelled')
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
}

// Update booking status (confirm, cancel, etc.)
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
}

function mapBookingError(code: string | undefined, message: string): string {
  switch (code) {
    case 'P0001':
      return 'This berth is no longer available. Please ask the customer to choose another.';
    case 'P0002':
      return 'The vessel is too long for this berth. Please find a larger berth.';
    case 'P0003':
      return 'The vessel\'s draft exceeds this berth\'s depth. Please find a deeper berth.';
    case 'P0004':
      return 'This berth was just booked by someone else. Please offer different dates or another berth.';
    default:
      return `Booking failed: ${message}`;
  }
}

export interface CreateBookingInput {
  berth_id: string;
  customer_name: string;
  customer_email: string;
  vessel_name: string;
  vessel_length_m: number;
  vessel_draft_m?: number | null;
  arrival_date: string;
  departure_date: string;
  notes?: string | null;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('create_booking_safely', {
        p_berth_id: input.berth_id,
        p_customer_name: input.customer_name,
        p_customer_email: input.customer_email,
        p_vessel_name: input.vessel_name,
        p_vessel_length_m: input.vessel_length_m,
        p_vessel_draft_m: input.vessel_draft_m ?? null,
        p_arrival_date: input.arrival_date,
        p_departure_date: input.departure_date,
        p_notes: input.notes ?? null,
      });

      if (error) {
        const err = new Error(mapBookingError(error.code, error.message));
        (err as any).code = error.code;
        throw err;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
