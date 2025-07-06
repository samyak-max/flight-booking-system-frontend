"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/auth";
import { Flight, Passenger, CreateBookingRequest, BookingResponse } from "@/types";

export default function BookPage() {
  const router = useRouter();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [cabinClass, setCabinClass] = useState<"ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST">("ECONOMY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get selected flight from localStorage
    const flightData = localStorage.getItem("selectedFlight");
    if (flightData) {
      const flight = JSON.parse(flightData);
      setSelectedFlight(flight);
      // Initialize with one adult passenger
      setPassengers([{
        fullName: "",
        dob: "",
        nationality: "",
        passportNumber: "",
        type: "ADULT",
      }]);
    } else {
      router.push("/flights");
    }
  }, [router]);

  const addPassenger = () => {
    setPassengers([...passengers, {
      fullName: "",
      dob: "",
      nationality: "",
      passportNumber: "",
      type: "ADULT",
    }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: any) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengers(updatedPassengers);
  };

  const calculateTotalPrice = () => {
    if (!selectedFlight) return 0;
    return selectedFlight.price * passengers.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const bookingRequest: CreateBookingRequest = {
        flightId: selectedFlight!.id,
        cabinClass,
        passengers,
      };

      const response = await apiRequest("/bookings", {
        method: "POST",
        body: JSON.stringify(bookingRequest),
      });

      if (response.ok) {
        const result: BookingResponse = await response.json();
        // Clear selected flight from localStorage
        localStorage.removeItem("selectedFlight");
        // Redirect to booking confirmation
        router.push(`/bookings/${result.booking.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create booking");
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!selectedFlight) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1e1e2f] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="text-gray-400">Loading...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const departure = formatDateTime(selectedFlight.departureTime);
  const arrival = formatDateTime(selectedFlight.arrivalTime);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1e1e2f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Book Flight</h1>
            <p className="text-gray-400 mt-2">Complete your booking details</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Flight Summary */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Flight Summary</h2>
              <div className="bg-[#1e1e2f] p-4 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{departure.time}</p>
                        <p className="text-sm text-gray-400">{selectedFlight.origin}</p>
                      </div>
                      <div className="flex-1 flex items-center">
                        <div className="w-full border-t border-gray-600 relative">
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1e1e2f] px-2">
                            <p className="text-xs text-gray-400">{formatDuration(selectedFlight.duration)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{arrival.time}</p>
                        <p className="text-sm text-gray-400">{selectedFlight.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{selectedFlight.airline}</span>
                      <span>{selectedFlight.flightNumber}</span>
                      <span>{departure.date}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-green-500">₹{selectedFlight.price}</p>
                    <p className="text-sm text-gray-400">per person</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cabin Class Selection */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Cabin Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'] as const).map((cls) => (
                  <label key={cls} className="cursor-pointer">
                    <input
                      type="radio"
                      name="cabinClass"
                      value={cls}
                      checked={cabinClass === cls}
                      onChange={(e) => setCabinClass(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      cabinClass === cls
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 bg-[#1e1e2f]'
                    }`}>
                      <p className="font-medium">{cls.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-400">
                        {(() => {
                          const availableSeats = selectedFlight.availableSeats as any;
                          // Handle mapping between PREMIUM and PREMIUM_ECONOMY
                          if (cls === 'PREMIUM_ECONOMY' && availableSeats['PREMIUM']) {
                            return availableSeats['PREMIUM'];
                          }
                          return availableSeats[cls] || 0;
                        })()} available
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Passengers</h2>
                <button
                  type="button"
                  onClick={addPassenger}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Passenger
                </button>
              </div>
              
              <div className="space-y-4">
                {passengers.map((passenger, index) => (
                  <div key={index} className="bg-[#1e1e2f] p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Passenger {index + 1}</h3>
                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePassenger(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          value={passenger.fullName}
                          onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                          className="w-full px-3 py-2 bg-[#2b2b3c] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter full name (e.g., John Doe)"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={passenger.dob}
                          onChange={(e) => updatePassenger(index, 'dob', e.target.value)}
                          className="w-full px-3 py-2 bg-[#2b2b3c] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nationality</label>
                        <input
                          type="text"
                          value={passenger.nationality}
                          onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                          className="w-full px-3 py-2 bg-[#2b2b3c] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter nationality (e.g., American)"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Passenger Type</label>
                        <select
                          value={passenger.type}
                          onChange={(e) => updatePassenger(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 bg-[#2b2b3c] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="ADULT">Adult</option>
                          <option value="CHILD">Child</option>
                          <option value="INFANT">Infant</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Passport Number</label>
                        <input
                          type="text"
                          value={passenger.passportNumber}
                          onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                          className="w-full px-3 py-2 bg-[#2b2b3c] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter passport number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Total Price</h2>
                  <p className="text-gray-400">{passengers.length} passenger(s) × ₹{selectedFlight.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-500">₹{calculateTotalPrice()}</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-lg font-semibold"
            >
              {loading ? "Processing..." : "Complete Booking"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 