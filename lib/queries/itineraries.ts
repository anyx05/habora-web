import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  haboraApi, 
  CreateItineraryRequest, 
  AddBookingToItineraryRequest,
  HaboraApiError
} from '../api/habora-client';

export const itineraryKeys = {
  all: ['itineraries'] as const,
  list: () => [...itineraryKeys.all, 'list'] as const,
  current: () => [...itineraryKeys.all, 'current'] as const,
  detail: (id: string) => [...itineraryKeys.all, 'detail', id] as const,
};

export function useCurrentItinerary() {
  return useQuery({
    queryKey: itineraryKeys.current(),
    queryFn: async () => {
      try {
        return await haboraApi.getCurrentItinerary();
      } catch (e) {
        if (e instanceof HaboraApiError && e.status === 404) {
          return null;
        }
        throw e;
      }
    },
    staleTime: 1000 * 30, // 30s
    retry: (failureCount, error) => {
      if (error instanceof HaboraApiError && error.status === 404) {
        return false;
      }
      if (error instanceof HaboraApiError && error.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
}

export function useItineraryDetail(id: string | undefined) {
  return useQuery({
    queryKey: itineraryKeys.detail(id!),
    queryFn: async () => {
      try {
        return await haboraApi.getItinerary(id!);
      } catch (e) {
        if (e instanceof HaboraApiError && e.status === 404) {
          return null;
        }
        throw e;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30s
    retry: (failureCount, error) => {
      if (error instanceof HaboraApiError && error.status === 404) {
        return false;
      }
      if (error instanceof HaboraApiError && error.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
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
      queryClient.invalidateQueries({ queryKey: itineraryKeys.list() });
    },
  });
}

export function useUserItineraries() {
  return useQuery({
    queryKey: itineraryKeys.list(),
    queryFn: async () => {
      try {
        return await haboraApi.listItineraries();
      } catch (e) {
        if (e instanceof HaboraApiError && e.status === 401) {
          return [];
        }
        throw e;
      }
    },
    staleTime: 1000 * 60, // 1 min
    retry: (failureCount, error) => {
      if (error instanceof HaboraApiError && (error.status === 401 || error.status === 404)) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
  });
}
