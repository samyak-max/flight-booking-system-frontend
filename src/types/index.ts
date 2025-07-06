export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  availableSeats: {
    ECONOMY: number;
    PREMIUM_ECONOMY?: number;
    BUSINESS?: number;
    FIRST?: number;
  };
  status: 'SCHEDULED' | 'DELAYED' | 'BOARDING' | 'DEPARTED' | 'IN_AIR' | 'LANDED' | 'ARRIVED' | 'CANCELLED' | 'DIVERTED';
  distance?: number;
  aircraft?: string;
  amenities?: string[];
}

export interface Passenger {
  id?: string;
  fullName: string;
  dob: string;
  nationality: string;
  passportNumber: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
}

export interface Booking {
  id: string;
  bookingReference: string;
  totalPrice: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  passengerCount: number;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  flight?: Flight;
  returnFlight?: Flight;
  passengers?: Passenger[];
}

export interface Ticket {
  id: string;
  booking_id: string;
  passenger_id: string;
  e_ticket_number: string;
  passenger?: Passenger;
  flight?: Flight;
  booking?: {
    booking_reference: string;
    cabin_class: string;
  };
}

export interface FlightSearch {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: 'ONE_WAY' | 'ROUND_TRIP';
  adults: number;
  children: number;
  infants: number;
  class: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
}

export interface FlightStatus {
  flightId?: string; // UUID from backend
  flightNumber: string;
  airline: string;
  origin: string; // Will contain originId from API
  destination: string; // Will contain destinationId from API
  scheduledDeparture: string;
  estimatedDeparture: string;
  scheduledArrival: string;
  estimatedArrival: string;
  status: 'SCHEDULED' | 'DELAYED' | 'BOARDING' | 'DEPARTED' | 'IN_AIR' | 'LANDED' | 'ARRIVED' | 'CANCELLED' | 'DIVERTED';
  statusUpdateTime: string;
  remarks?: string;
}

export interface CreateBookingRequest {
  flightId: string;
  returnFlightId?: string;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  passengers: Passenger[];
}

export interface BookingResponse {
  booking: Booking;
  passengers: Passenger[];
  tickets: Ticket[];
}

export interface UserPreferences {
  preferredCabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  favoriteAirports?: string[];
  preferredAirlines?: string[];
  mealPreferences?: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    kosher: boolean;
    halal: boolean;
  };
  seatPreferences?: {
    preferWindow: boolean;
    preferAisle: boolean;
    preferExtraLegroom: boolean;
  };
}

export interface UserProfile {
  id: string;
  preferences: UserPreferences;
}

export interface DashboardData {
  user: any;
  bookingStats: {
    total: number;
    confirmed: number;
    cancelled: number;
    pending: number;
  };
  recentBookings: any[];
  upcomingFlights: any[];
} 