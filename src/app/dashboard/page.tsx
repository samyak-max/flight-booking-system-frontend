"use client";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/auth";
import { Booking, DashboardData } from "@/types";
import Link from "next/link";
import { useAllFlightStatusSSE } from "@/hooks/useFlightStatusSSE";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  // Real-time flight status updates for all flights
  const {
    statuses: flightStatuses,
    isConnected,
    error: sseError,
    lastUpdate,
    reconnect,
    disconnect,
    connect
  } = useAllFlightStatusSSE();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiRequest("/users/dashboard");
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1e1e2f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {user?.email}</h1>
            <p className="text-gray-400 mt-2">Here's your flight booking overview</p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-400">Loading dashboard...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {dashboardData && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
                  <p className="text-3xl font-bold text-green-500">{dashboardData.bookingStats.total}</p>
                </div>
                <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-2">Confirmed</h3>
                  <p className="text-3xl font-bold text-blue-500">{dashboardData.bookingStats.confirmed}</p>
                </div>
                <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-2">Cancelled</h3>
                  <p className="text-3xl font-bold text-red-500">{dashboardData.bookingStats.cancelled}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/flights" className="bg-[#2b2b3c] p-6 rounded-2xl hover:bg-[#3b3b4c] transition-colors">
                  <h3 className="text-lg font-semibold mb-2">Search Flights</h3>
                  <p className="text-gray-400">Find and book your next flight</p>
                </Link>
                <Link href="/bookings" className="bg-[#2b2b3c] p-6 rounded-2xl hover:bg-[#3b3b4c] transition-colors">
                  <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
                  <p className="text-gray-400">View and manage your bookings</p>
                </Link>
              </div>

              {/* Recent Bookings */}
              {dashboardData.recentBookings && dashboardData.recentBookings.length > 0 && (
                <div className="bg-[#2b2b3c] p-6 rounded-2xl mb-8">
                  <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                  <div className="space-y-4">
                    {dashboardData.recentBookings.map((booking) => (
                      <div key={booking.id} className="bg-[#1e1e2f] p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{booking.booking_reference || booking.id}</p>
                            <p className="text-gray-400 text-sm">
                              {booking.flight?.origin} → {booking.flight?.destination}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {booking.flight?.departure_time && formatDate(booking.flight.departure_time)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{booking.total_price || 'N/A'}</p>
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-500/20 text-green-200' :
                              booking.status === 'cancelled' ? 'bg-red-500/20 text-red-200' :
                              'bg-blue-500/20 text-blue-200'
                            }`}>
                              {booking.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Flights */}
              {dashboardData.upcomingFlights && dashboardData.upcomingFlights.length > 0 && (
                <div className="bg-[#2b2b3c] p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Upcoming Flights</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (realTimeEnabled) {
                            disconnect();
                            setRealTimeEnabled(false);
                          } else {
                            connect();
                            setRealTimeEnabled(true);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          realTimeEnabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {realTimeEnabled ? '🔴 Live' : '⚪ Enable Live Updates'}
                      </button>
                      
                      {realTimeEnabled && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-400">
                            {isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SSE Error Message */}
                  {sseError && realTimeEnabled && (
                    <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-3 py-2 rounded-lg mb-4 flex justify-between items-center text-sm">
                      <span>{sseError}</span>
                      <button 
                        onClick={reconnect}
                        className="px-2 py-1 bg-yellow-500 text-black rounded text-xs hover:bg-yellow-400"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {lastUpdate && realTimeEnabled && (
                    <div className="text-xs text-gray-400 mb-4">
                      Last update: {lastUpdate.toLocaleTimeString()}
                    </div>
                  )}

                  <div className="space-y-4">
                    {dashboardData.upcomingFlights.map((booking) => {
                      const flightNumber = booking.flight?.flight_number;
                      const realtimeStatus = flightNumber && flightStatuses[flightNumber];
                      
                      return (
                        <div key={booking.id} className="bg-[#1e1e2f] p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{booking.flight?.flight_number}</p>
                                {realtimeStatus && (
                                  <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-200">
                                    {realtimeStatus.status}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm">
                                {booking.flight?.origin} → {booking.flight?.destination}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {booking.flight?.departure_time && formatDate(booking.flight.departure_time)}
                              </p>
                              
                              {/* Real-time status message */}
                              {realtimeStatus && realtimeStatus.remarks && (
                                <p className="text-green-400 text-xs mt-1 font-medium">
                                  {realtimeStatus.remarks}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{booking.booking_reference}</p>
                              <p className="text-gray-400 text-sm">{booking.cabin_class}</p>
                              
                              {/* Real-time update indicator */}
                              {realtimeStatus && (
                                <p className="text-xs text-green-400 mt-1">
                                  🔴 Live
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 