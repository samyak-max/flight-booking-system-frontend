import { apiRequest, User } from './auth';
import { 
  Flight, 
  FlightSearch, 
  Booking, 
  CreateBookingRequest, 
  BookingResponse, 
  FlightStatus, 
  UserPreferences,
  UserProfile,
  DashboardData 
} from '@/types';

export const flightAPI = {
  // Search flights
  searchFlights: async (searchParams: FlightSearch): Promise<{ flights: Flight[] }> => {
    const queryParams = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      departureDate: searchParams.departureDate,
      tripType: searchParams.tripType,
      adults: searchParams.adults.toString(),
      children: searchParams.children.toString(),
      infants: searchParams.infants.toString(),
      class: searchParams.class,
    });

    if (searchParams.returnDate && searchParams.tripType === "ROUND_TRIP") {
      queryParams.append("returnDate", searchParams.returnDate);
    }

    const response = await apiRequest(`/flights/search?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to search flights');
    }
    return await response.json();
  },

  // Get flight status
  getFlightStatus: async (flightNumber: string, date?: string): Promise<FlightStatus> => {
    const queryParams = new URLSearchParams();
    if (date) {
      queryParams.append("date", date);
    }
    
    const endpoint = `/flight-status/${flightNumber}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest(endpoint);
    if (!response.ok) {
      throw new Error('Flight not found');
    }
    return await response.json();
  },
};

export const bookingAPI = {
  // Create booking
  createBooking: async (bookingData: CreateBookingRequest): Promise<BookingResponse> => {
    const response = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      throw new Error('Failed to create booking');
    }
    return await response.json();
  },

  // Get user bookings
  getUserBookings: async (): Promise<{ bookings: Booking[] }> => {
    const response = await apiRequest('/users/bookings');
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return await response.json();
  },

  // Get booking details
  getBookingDetails: async (bookingId: string): Promise<any> => {
    const response = await apiRequest(`/users/bookings/${bookingId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch booking details');
    }
    return await response.json();
  },

  // Cancel booking
  cancelBooking: async (bookingId: string): Promise<void> => {
    const response = await apiRequest(`/users/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to cancel booking');
    }
  },
};

export const userAPI = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiRequest('/users/profile');
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return await response.json();
  },

  // Update user preferences
  updatePreferences: async (preferences: UserPreferences): Promise<{ preferences: UserPreferences }> => {
    const response = await apiRequest('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }
    return await response.json();
  },

  // Get dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiRequest('/users/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    return await response.json();
  },
};

export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<any> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    return await response.json();
  },

  // Register
  register: async (email: string, password: string): Promise<any> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return await response.json();
  },
}; 