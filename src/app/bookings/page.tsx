"use client";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/auth";
import { Booking } from "@/types";
import Link from "next/link";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiRequest("/users/bookings");
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch bookings");
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const response = await apiRequest(`/users/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh bookings list
        fetchBookings();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to cancel booking");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1e1e2f] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-400">Loading bookings...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1e1e2f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Bookings</h1>
              <p className="text-gray-400 mt-2">View and manage your flight bookings</p>
            </div>
            <Link
              href="/flights"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Book New Flight
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-[#2b2b3c] p-8 rounded-2xl text-center">
              <div className="text-gray-400">
                <p className="text-lg mb-2">No bookings found</p>
                <p className="text-sm mb-4">Book your first flight to see it here!</p>
                <Link
                  href="/flights"
                  className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Search Flights
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking: any) => {
                const outboundDeparture = booking.flight?.departure_time ? formatDateTime(booking.flight.departure_time) : null;
                const outboundArrival = booking.flight?.arrival_time ? formatDateTime(booking.flight.arrival_time) : null;
                const returnDeparture = booking.return_flight?.departure_time ? formatDateTime(booking.return_flight.departure_time) : null;
                const returnArrival = booking.return_flight?.arrival_time ? formatDateTime(booking.return_flight.arrival_time) : null;

                return (
                  <div key={booking.id} className="bg-[#2b2b3c] p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{booking.booking_reference}</h3>
                        <p className="text-gray-400 text-sm">
                          Booked on {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">₹{booking.total_price}</p>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Outbound Flight */}
                    {booking.flight && (
                      <div className="bg-[#1e1e2f] p-4 rounded-lg mb-4">
                        <h4 className="font-semibold mb-2">Outbound Flight</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Flight</p>
                            <p className="font-medium">{booking.flight.airline} {booking.flight.flight_number}</p>
                            <p className="text-sm text-gray-400">
                              {booking.flight.origin} → {booking.flight.destination}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Departure</p>
                            <p className="font-medium">{outboundDeparture?.date}</p>
                            <p className="text-sm">{outboundDeparture?.time}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Arrival</p>
                            <p className="font-medium">{outboundArrival?.date}</p>
                            <p className="text-sm">{outboundArrival?.time}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Return Flight */}
                    {booking.return_flight && (
                      <div className="bg-[#1e1e2f] p-4 rounded-lg mb-4">
                        <h4 className="font-semibold mb-2">Return Flight</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Flight</p>
                            <p className="font-medium">{booking.return_flight.airline} {booking.return_flight.flight_number}</p>
                            <p className="text-sm text-gray-400">
                              {booking.return_flight.origin} → {booking.return_flight.destination}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Departure</p>
                            <p className="font-medium">{returnDeparture?.date}</p>
                            <p className="text-sm">{returnDeparture?.time}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Arrival</p>
                            <p className="font-medium">{returnArrival?.date}</p>
                            <p className="text-sm">{returnArrival?.time}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Booking Details */}
                    <div className="bg-[#1e1e2f] p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Cabin Class</p>
                          <p className="font-medium">{booking.cabin_class}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Passengers</p>
                          <p className="font-medium">{booking.passenger_count} passenger(s)</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </Link>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 