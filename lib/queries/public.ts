import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

// ── Public types (no auth required) ──────────────────────────────

export interface PublicPort {
  id: string;
  name: string;
  location: string;
  description: string | null;
  contact_email: string;
  coordinates: string | null;
  berths: PublicBerth[];
}

export interface PublicBerth {
  id: string;
  port_id: string;
  port_name: string;
  port_location: string;
  name: string;
  max_length_m: number;
  max_draft_m: number;
  price_per_night: number;
  amenities: string[] | null;
  status: 'available' | 'occupied' | 'maintenance';
}

/**
 * Fetch all ports with their berths for the public landing page.
 * Does NOT require authentication — uses the anon/publishable key
 * and relies on RLS SELECT policies being open for ports + active berths.
 */
export function usePublicPortsAndBerths() {
  return useQuery({
    queryKey: ['public-ports-berths'],
    staleTime: 60_000, // 1 minute
    queryFn: async () => {
      const supabase = createClient();

      // Fetch ports
      const { data: ports, error: portsError } = await supabase
        .from('ports')
        .select('id, name, location, description, contact_email, coordinates')
        .order('name');

      if (portsError) throw new Error(portsError.message);

      // Fetch all active berths
      const { data: berths, error: berthsError } = await supabase
        .from('berths')
        .select('id, port_id, name, max_length_m, max_draft_m, price_per_night, amenities, status')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (berthsError) throw new Error(berthsError.message);

      // Group berths under their parent ports
      const portsWithBerths: PublicPort[] = (ports ?? []).map((port: any) => ({
        ...port,
        berths: (berths ?? [])
          .filter((b: any) => b.port_id === port.id)
          .map((b: any) => ({
            ...b,
            port_name: port.name,
            port_location: port.location,
          })),
      }));

      // Flatten all berths with port context for the berths grid
      const allBerths: PublicBerth[] = (berths ?? []).map((b: any) => {
        const port = (ports ?? []).find((p: any) => p.id === b.port_id);
        return {
          ...b,
          port_name: port?.name ?? 'Unknown Port',
          port_location: port?.location ?? '',
        };
      });

      return { ports: portsWithBerths, berths: allBerths };
    },
  });
}

/**
 * Get a single port by ID with its active berths.
 */
export function usePortById(portId: string | undefined) {
  return useQuery({
    queryKey: ['public-port', portId],
    enabled: !!portId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!portId) return null;
      const supabase = createClient();

      const { data: port, error: portError } = await supabase
        .from('ports')
        .select('id, name, location, description, contact_email, coordinates')
        .eq('id', portId)
        .maybeSingle();

      if (portError) throw new Error(portError.message);
      if (!port) return null;

      const { data: berths, error: berthsError } = await supabase
        .from('berths')
        .select('id, port_id, name, max_length_m, max_draft_m, price_per_night, amenities, status')
        .eq('port_id', portId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (berthsError) throw new Error(berthsError.message);

      const berthsWithPortContext: PublicBerth[] = (berths ?? []).map((b: any) => ({
        ...b,
        port_name: (port as any).name,
        port_location: (port as any).location,
      }));

      return { ...(port as any), berths: berthsWithPortContext } as PublicPort;
    },
  });
}
