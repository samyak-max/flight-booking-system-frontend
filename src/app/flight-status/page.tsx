"use client";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/auth";
import { FlightStatus } from "@/types";
import { RealTimeFlightStatus } from "@/components/RealTimeFlightStatus";

export default function FlightStatusPage() {
  const [flightNumber, setFlightNumber] = useState("");
  const [date, setDate] = useState("");
  const [flightStatus, setFlightStatus] = useState<FlightStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Transform backend response to FlightStatus format
  const transformBackendResponse = (data: any): FlightStatus => {
    return {
      flightId: data.flightId,
      flightNumber: data.flightNumber,
      airline: data.airline,
      // Use originId/destinationId since origin/destination names are not provided
      origin: data.originId,
      destination: data.destinationId,
      status: data.status,
      scheduledDeparture: data.departureTime,
      estimatedDeparture: data.departureTime,
      scheduledArrival: data.arrivalTime,
      estimatedArrival: data.arrivalTime,
      statusUpdateTime: data.updatedAt,
      remarks: data.message,
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const queryParams = new URLSearchParams();
      if (date) {
        queryParams.append("date", date);
      }
      
      const endpoint = `/flight-status/${flightNumber}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiRequest(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        // Transform backend response to match FlightStatus interface
        const transformedData = transformBackendResponse(data);
        setFlightStatus(transformedData);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Flight not found");
        setFlightStatus(null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setFlightStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    // Handle undefined, null, or empty strings
    if (!dateTime) {
      return {
        date: "N/A",
        time: "N/A",
      };
    }

    try {
      const date = new Date(dateTime);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateTime);
        return {
          date: "Invalid Date",
          time: "Invalid Date",
        };
      }

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
    } catch (error) {
      console.error('Error formatting date:', dateTime, error);
      return {
        date: "Error",
        time: "Error",
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-500/20 text-green-200';
      case 'DELAYED':
        return 'bg-yellow-500/20 text-yellow-200';
      case 'BOARDING':
        return 'bg-blue-500/20 text-blue-200';
      case 'DEPARTED':
        return 'bg-purple-500/20 text-purple-200';
      case 'IN_AIR':
        return 'bg-indigo-500/20 text-indigo-200';
      case 'LANDED':
        return 'bg-teal-500/20 text-teal-200';
      case 'ARRIVED':
        return 'bg-cyan-500/20 text-cyan-200';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-200';
      case 'DIVERTED':
        return 'bg-orange-500/20 text-orange-200';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return '🕐';
      case 'DELAYED':
        return '⏰';
      case 'BOARDING':
        return '🚶';
      case 'DEPARTED':
        return '🛫';
      case 'IN_AIR':
        return '✈️';
      case 'LANDED':
        return '🛬';
      case 'ARRIVED':
        return '🏁';
      case 'CANCELLED':
        return '❌';
      case 'DIVERTED':
        return '🔄';
      default:
        return '❓';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1e1e2f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Flight Status</h1>
            <p className="text-gray-400 mt-2">Check real-time flight information</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-[#2b2b3c] p-6 rounded-2xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Flight Number</label>
                <input
                  type="text"
                  placeholder="e.g., AA123"
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date (Optional)</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Check Flight Status"}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Flight Status Results */}
          {hasSearched && flightStatus && (
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Flight Information</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusIcon(flightStatus.status)}</span>
                  <span className={`px-3 py-1 rounded text-sm ${getStatusColor(flightStatus.status)}`}>
                    {flightStatus.status}
                  </span>
                </div>
              </div>

              {/* Real-time Updates Section */}
              <div className="mb-6">
                <RealTimeFlightStatus
                  flightId={flightStatus.flightNumber}
                  currentStatus={flightStatus}
                  showToggle={true}
                  compact={false}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Flight Details */}
                <div className="bg-[#1e1e2f] p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Flight Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Flight:</span>
                      <span className="font-medium">{flightStatus.airline} {flightStatus.flightNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Updated:</span>
                      <span className="font-medium">
                        {formatDateTime(flightStatus.statusUpdateTime).date} at {formatDateTime(flightStatus.statusUpdateTime).time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Departure Info */}
                <div className="bg-[#1e1e2f] p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Departure</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scheduled:</span>
                      <span className="font-medium">
                        {formatDateTime(flightStatus.scheduledDeparture).date} at {formatDateTime(flightStatus.scheduledDeparture).time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated:</span>
                      <span className={`font-medium ${
                        flightStatus.estimatedDeparture !== flightStatus.scheduledDeparture 
                          ? 'text-yellow-400' 
                          : 'text-green-400'
                      }`}>
                        {formatDateTime(flightStatus.estimatedDeparture).date} at {formatDateTime(flightStatus.estimatedDeparture).time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrival Info */}
                <div className="bg-[#1e1e2f] p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Arrival</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scheduled:</span>
                      <span className="font-medium">
                        {formatDateTime(flightStatus.scheduledArrival).date} at {formatDateTime(flightStatus.scheduledArrival).time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated:</span>
                      <span className={`font-medium ${
                        flightStatus.estimatedArrival !== flightStatus.scheduledArrival 
                          ? 'text-yellow-400' 
                          : 'text-green-400'
                      }`}>
                        {formatDateTime(flightStatus.estimatedArrival).date} at {formatDateTime(flightStatus.estimatedArrival).time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {flightStatus.remarks && (
                  <div className="bg-[#1e1e2f] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Remarks</h3>
                    <p className="text-gray-300">{flightStatus.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Results */}
          {hasSearched && !flightStatus && !loading && !error && (
            <div className="bg-[#2b2b3c] p-8 rounded-2xl text-center">
              <div className="text-gray-400">
                <p className="text-lg mb-2">No flight status found</p>
                <p className="text-sm">Please check the flight number and try again.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 