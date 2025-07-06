"use client";
import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/auth";
import { Flight, FlightSearch } from "@/types";

export default function FlightsPage() {
  const [searchParams, setSearchParams] = useState<FlightSearch>({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    tripType: "ONE_WAY",
    adults: 1,
    children: 0,
    infants: 0,
    class: "ECONOMY",
  });
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
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
      
      if (response.ok) {
        const data = await response.json();
        setFlights(data.flights || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to search flights");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      }),
      time: date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
    };
  };

  const handleBookFlight = (flight: Flight) => {
    // Store selected flight in localStorage for booking process
    localStorage.setItem("selectedFlight", JSON.stringify(flight));
    // Navigate to booking page
    window.location.href = "/book";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1e1e2f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Search Flights</h1>
            <p className="text-gray-400 mt-2">Find the perfect flight for your trip</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-[#2b2b3c] p-6 rounded-2xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">From</label>
                <input
                  type="text"
                  placeholder="Origin (e.g., LAX)"
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.origin}
                  onChange={(e) => setSearchParams({...searchParams, origin: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <input
                  type="text"
                  placeholder="Destination (e.g., JFK)"
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams({...searchParams, destination: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Departure Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.departureDate}
                  onChange={(e) => setSearchParams({...searchParams, departureDate: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Trip Type</label>
                <select
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.tripType}
                  onChange={(e) => setSearchParams({...searchParams, tripType: e.target.value as "ONE_WAY" | "ROUND_TRIP"})}
                >
                  <option value="ONE_WAY">One Way</option>
                  <option value="ROUND_TRIP">Round Trip</option>
                </select>
              </div>
            </div>

            {searchParams.tripType === "ROUND_TRIP" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Return Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={searchParams.returnDate}
                    onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Adults</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.adults}
                  onChange={(e) => setSearchParams({...searchParams, adults: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Children</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.children}
                  onChange={(e) => setSearchParams({...searchParams, children: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Infants</label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.infants}
                  onChange={(e) => setSearchParams({...searchParams, infants: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Class</label>
                <select
                  className="w-full px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchParams.class}
                  onChange={(e) => setSearchParams({...searchParams, class: e.target.value as any})}
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Flights"}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Search Results */}
          {hasSearched && (
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">
                Search Results ({flights.length} flights found)
              </h2>
              
              {flights.length === 0 && !loading ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No flights found for your search criteria.</p>
                  <p className="text-sm mt-2">Try adjusting your search parameters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flights.map((flight) => {
                    const departure = formatDateTime(flight.departureTime);
                    const arrival = formatDateTime(flight.arrivalTime);
                    
                    return (
                      <div key={flight.id} className="bg-[#1e1e2f] p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="text-center">
                                <p className="text-lg font-semibold">{departure.time}</p>
                                <p className="text-sm text-gray-400">{flight.origin}</p>
                              </div>
                              <div className="flex-1 flex items-center">
                                <div className="w-full border-t border-gray-600 relative">
                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1e1e2f] px-2">
                                    <p className="text-xs text-gray-400">{flight.duration}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-semibold">{arrival.time}</p>
                                <p className="text-sm text-gray-400">{flight.destination}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{flight.airline}</span>
                              <span>{flight.flightNumber}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                flight.status === 'SCHEDULED' ? 'bg-green-500/20 text-green-200' :
                                flight.status === 'DELAYED' ? 'bg-yellow-500/20 text-yellow-200' :
                                'bg-red-500/20 text-red-200'
                              }`}>
                                {flight.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-green-500">₹{flight.price}</p>
                            <p className="text-sm text-gray-400">per person</p>
                            <button
                              onClick={() => handleBookFlight(flight)}
                              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Book Flight
                            </button>
                          </div>
                        </div>
                        
                        {flight.amenities && flight.amenities.length > 0 && (
                          <div className="border-t border-gray-700 pt-3">
                            <p className="text-sm text-gray-400 mb-1">Amenities:</p>
                            <div className="flex flex-wrap gap-2">
                              {flight.amenities.map((amenity, index) => (
                                <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 