"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/auth";
import { Booking, Ticket } from "@/types";
import Link from "next/link";

interface BookingDetailsResponse {
  id: string;
  booking_reference: string;
  total_price: number;
  cabin_class: string;
  status: string;
  created_at: string;
  flight: any;
  return_flight?: any;
  passengers: any[];
  tickets: Ticket[];
}

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [bookingDetails, setBookingDetails] = useState<BookingDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await apiRequest(`/users/bookings/${bookingId}`);
      
      if (response.ok) {
        const data = await response.json();
        setBookingDetails(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch booking details");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", { 
        year: "numeric",
        month: "short", 
        day: "numeric" 
      }),
      time: date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
    };
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-200';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-200';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1e1e2f] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-400">Loading booking details...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1e1e2f] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
            <Link href="/bookings" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
              ← Back to Bookings
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1e1e2f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/bookings" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
              ← Back to Bookings
            </Link>
            <h1 className="text-3xl font-bold">Booking Details</h1>
          </div>

          {bookingDetails && (
            <div className="space-y-6">
              {/* Booking Summary */}
              <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{bookingDetails.booking_reference}</h2>
                    <p className="text-gray-400">
                      Booked on {new Date(bookingDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">
                      ₹{bookingDetails.total_price}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(bookingDetails.status)}`}>
                      {bookingDetails.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Cabin Class</p>
                    <p className="font-medium">{bookingDetails.cabin_class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Passengers</p>
                    <p className="font-medium">{bookingDetails.passengers?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Flight Information */}
              {bookingDetails.flight && (
                <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-4">Outbound Flight</h3>
                  <div className="bg-[#1e1e2f] p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Flight</p>
                        <p className="font-medium">
                          {bookingDetails.flight.airline} {bookingDetails.flight.flight_number}
                        </p>
                        <p className="text-sm text-gray-400">
                          {bookingDetails.flight.origin} → {bookingDetails.flight.destination}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Departure</p>
                        <p className="font-medium">
                          {formatDateTime(bookingDetails.flight.departure_time).date}
                        </p>
                        <p className="text-sm">
                          {formatDateTime(bookingDetails.flight.departure_time).time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Arrival</p>
                        <p className="font-medium">
                          {formatDateTime(bookingDetails.flight.arrival_time).date}
                        </p>
                        <p className="text-sm">
                          {formatDateTime(bookingDetails.flight.arrival_time).time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Flight */}
              {bookingDetails.return_flight && (
                <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-4">Return Flight</h3>
                  <div className="bg-[#1e1e2f] p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Flight</p>
                        <p className="font-medium">
                          {bookingDetails.return_flight.airline} {bookingDetails.return_flight.flight_number}
                        </p>
                        <p className="text-sm text-gray-400">
                          {bookingDetails.return_flight.origin} → {bookingDetails.return_flight.destination}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Departure</p>
                        <p className="font-medium">
                          {formatDateTime(bookingDetails.return_flight.departure_time).date}
                        </p>
                        <p className="text-sm">
                          {formatDateTime(bookingDetails.return_flight.departure_time).time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Arrival</p>
                        <p className="font-medium">
                          {formatDateTime(bookingDetails.return_flight.arrival_time).date}
                        </p>
                        <p className="text-sm">
                          {formatDateTime(bookingDetails.return_flight.arrival_time).time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Passengers */}
              {bookingDetails.passengers && bookingDetails.passengers.length > 0 && (
                <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-4">Passengers</h3>
                  <div className="space-y-3">
                    {bookingDetails.passengers.map((passenger, index) => (
                      <div key={passenger.id || index} className="bg-[#1e1e2f] p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Name</p>
                            <p className="font-medium">
                              {passenger.full_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Type</p>
                            <p className="font-medium">{passenger.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Date of Birth</p>
                            <p className="font-medium">
                              {new Date(passenger.dob).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets */}
              {bookingDetails.tickets && bookingDetails.tickets.length > 0 && (
                <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-4">E-Tickets</h3>
                  <div className="space-y-3">
                    {bookingDetails.tickets.map((ticket, index) => {
                      // Find the corresponding passenger
                      const passenger = bookingDetails.passengers?.find(p => p.id === ticket.passenger_id);
                      
                      return (
                        <div key={ticket.id} className="bg-[#1e1e2f] p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">E-Ticket Number</p>
                              <p className="font-medium font-mono">{ticket.e_ticket_number}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Passenger</p>
                              <p className="font-medium">
                                {passenger?.full_name || `Passenger ${index + 1}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 