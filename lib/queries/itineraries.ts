import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  haboraApi, 
  CreateItineraryRequest, 
  AddBookingToItineraryRequest 
} from '../api/habora-client';

export const itineraryKeys = {
  all: ['itineraries'] as const,
  current: () => [...itineraryKeys.all, 'current'] as const,
  detail: (id: string) => [...itineraryKeys.all, 'detail', id] as const,
};

export function useCurrentItinerary() {
  return useQuery({
    queryKey: itineraryKeys.current(),
    queryFn: () => haboraApi.getCurrentItinerary(),
    staleTime: 1000 * 30, // 30s
  });
}

export function useItineraryDetail(id: string | undefined) {
  return useQuery({
    queryKey: itineraryKeys.detail(id!),
    queryFn: () => haboraApi.getItinerary(id!),
    enabled: !!id,
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreateItineraryRequest) => haboraApi.createItinerary(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.current() });
    },
  });
}

export function useAddBookingToItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, request }: { itineraryId: string; request: AddBookingToItineraryRequest }) => 
      haboraApi.addBookingToItinerary(itineraryId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(variables.itineraryId) });
      queryClient.invalidateQueries({ queryKey: itineraryKeys.current() });
    },
  });
}

export function useRemoveBookingFromItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, bookingId }: { itineraryId: string; bookingId: string }) => 
      haboraApi.removeBookingFromItinerary(itineraryId, bookingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(variables.itineraryId) });
      queryClient.invalidateQueries({ queryKey: itineraryKeys.current() });
    },
  });
}

export function useConfirmItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itineraryId: string) => haboraApi.confirmItinerary(itineraryId),
    onSuccess: (_, itineraryId) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.current() });
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(itineraryId) });
      // Invalidate existing bookings queries to refresh user's bookings list
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCancelItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itineraryId: string) => haboraApi.cancelItinerary(itineraryId),
    onSuccess: (_, itineraryId) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.current() });
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(itineraryId) });
    },
  });
}
