import { createClient } from '@/lib/supabase/client';

const HABORA_API_URL = process.env.NEXT_PUBLIC_HABORA_API_URL || 'http://localhost:8080';

export async function getSupabaseAccessToken(): Promise<string> {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.access_token) {
    throw new HaboraApiError('Not authenticated', 401);
  }
  
  return session.access_token;
}

export class HaboraApiError extends Error {
  status: number;
  errorCode?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, errorCode?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'HaboraApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;
  }
}

export interface ItineraryResponse {
  id: string;
  userId: string;
  name: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  id: string;
  berthId: string;
  customerName: string;
  customerEmail: string;
  vesselName: string;
  vesselLengthM: number;
  vesselDraftM?: number;
  arrivalDate: string;
  departureDate: string;
  status: string;
  totalPrice?: number;
  notes?: string;
  confirmationCode?: string;
  itineraryId: string;
  stopOrder?: number;
  createdAt: string;
}

export interface ItineraryWithBookingsResponse extends ItineraryResponse {
  bookings: BookingResponse[];
  totalEstimatedPrice: number;
}

export interface ConfirmedBookingResponse {
  bookingId: string;
  confirmationCode: string;
  berthId: string;
  arrivalDate: string;
  departureDate: string;
  totalPrice: number;
}

export interface ConfirmItineraryResponse {
  itineraryId: string;
  status: 'confirmed';
  confirmedBookings: ConfirmedBookingResponse[];
  totalPrice: number;
}

export interface CreateItineraryRequest {
  name: string;
  notes?: string;
}

export interface AddBookingToItineraryRequest {
  berthId: string;
  customerName: string;
  customerEmail: string;
  vesselName: string;
  vesselLengthM: number;
  vesselDraftM?: number;
  arrivalDate: string;
  departureDate: string;
  notes?: string;
  stopOrder?: number;
}

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getSupabaseAccessToken();
  
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${HABORA_API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // Body might not be JSON
      errorData = { message: response.statusText };
    }

    throw new HaboraApiError(
      errorData.message || response.statusText,
      response.status,
      errorData.errorCode,
      errorData.fieldErrors
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as any;
  }

  return response.json();
}

export const haboraApi = {
  async createItinerary(req: CreateItineraryRequest): Promise<ItineraryResponse> {
    return fetchApi<ItineraryResponse>('/api/v1/itineraries', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async getCurrentItinerary(): Promise<ItineraryWithBookingsResponse | null> {
    try {
      return await fetchApi<ItineraryWithBookingsResponse>('/api/v1/itineraries/current');
    } catch (error) {
      if (error instanceof HaboraApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getItinerary(id: string): Promise<ItineraryWithBookingsResponse> {
    return fetchApi<ItineraryWithBookingsResponse>(`/api/v1/itineraries/${id}`);
  },

  async addBookingToItinerary(itineraryId: string, req: AddBookingToItineraryRequest): Promise<BookingResponse> {
    return fetchApi<BookingResponse>(`/api/v1/itineraries/${itineraryId}/bookings`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async removeBookingFromItinerary(itineraryId: string, bookingId: string): Promise<void> {
    return fetchApi<void>(`/api/v1/itineraries/${itineraryId}/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  },

  async confirmItinerary(itineraryId: string): Promise<ConfirmItineraryResponse> {
    return fetchApi<ConfirmItineraryResponse>(`/api/v1/itineraries/${itineraryId}/confirm`, {
      method: 'POST',
    });
  },

  async cancelItinerary(itineraryId: string): Promise<ItineraryResponse> {
    return fetchApi<ItineraryResponse>(`/api/v1/itineraries/${itineraryId}/cancel`, {
      method: 'POST',
    });
  },

  async listItineraries(): Promise<ItineraryWithBookingsResponse[]> {
    return fetchApi<ItineraryWithBookingsResponse[]>('/api/v1/itineraries');
  },
};
