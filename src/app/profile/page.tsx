"use client";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/lib/api";
import { UserProfile, UserPreferences } from "@/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredCabinClass: 'ECONOMY',
    favoriteAirports: [],
    preferredAirlines: [],
    mealPreferences: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      kosher: false,
      halal: false,
    },
    seatPreferences: {
      preferWindow: false,
      preferAisle: false,
      preferExtraLegroom: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state for adding airports and airlines
  const [newAirport, setNewAirport] = useState("");
  const [newAirline, setNewAirline] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await userAPI.getProfile();
      setProfile(profileData);
      if (profileData.preferences) {
        setPreferences({
          preferredCabinClass: profileData.preferences.preferredCabinClass || 'ECONOMY',
          favoriteAirports: profileData.preferences.favoriteAirports || [],
          preferredAirlines: profileData.preferences.preferredAirlines || [],
          mealPreferences: {
            vegetarian: profileData.preferences.mealPreferences?.vegetarian || false,
            vegan: profileData.preferences.mealPreferences?.vegan || false,
            glutenFree: profileData.preferences.mealPreferences?.glutenFree || false,
            kosher: profileData.preferences.mealPreferences?.kosher || false,
            halal: profileData.preferences.mealPreferences?.halal || false,
          },
          seatPreferences: {
            preferWindow: profileData.preferences.seatPreferences?.preferWindow || false,
            preferAisle: profileData.preferences.seatPreferences?.preferAisle || false,
            preferExtraLegroom: profileData.preferences.seatPreferences?.preferExtraLegroom || false,
          },
        });
      }
    } catch (err) {
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await userAPI.updatePreferences(preferences);
      setSuccess("Preferences updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const addAirport = () => {
    if (newAirport.trim() && !preferences.favoriteAirports?.includes(newAirport.trim().toUpperCase())) {
      setPreferences(prev => ({
        ...prev,
        favoriteAirports: [...(prev.favoriteAirports || []), newAirport.trim().toUpperCase()]
      }));
      setNewAirport("");
    }
  };

  const removeAirport = (airport: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteAirports: prev.favoriteAirports?.filter(a => a !== airport) || []
    }));
  };

  const addAirline = () => {
    if (newAirline.trim() && !preferences.preferredAirlines?.includes(newAirline.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferredAirlines: [...(prev.preferredAirlines || []), newAirline.trim()]
      }));
      setNewAirline("");
    }
  };

  const removeAirline = (airline: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredAirlines: prev.preferredAirlines?.filter(a => a !== airline) || []
    }));
  };

  const updateMealPreference = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      mealPreferences: {
        ...prev.mealPreferences!,
        [key as keyof UserPreferences['mealPreferences']]: value
      }
    }));
  };

  const updateSeatPreference = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      seatPreferences: {
        ...prev.seatPreferences!,
        [key as keyof UserPreferences['seatPreferences']]: value
      }
    }));
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1e1e2f] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-400">Loading profile...</div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1e1e2f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Profile & Preferences</h1>
            <p className="text-gray-400 mt-2">Manage your account and travel preferences</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">User ID</p>
                  <p className="font-medium text-xs">{profile?.id}</p>
                </div>
              </div>
            </div>

            {/* Preferred Cabin Class */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Preferred Cabin Class</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'] as const).map((cls) => (
                  <label key={cls} className="cursor-pointer">
                    <input
                      type="radio"
                      name="preferredCabinClass"
                      value={cls}
                      checked={preferences.preferredCabinClass === cls}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        preferredCabinClass: e.target.value as any
                      }))}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 transition-colors text-center ${
                      preferences.preferredCabinClass === cls
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 bg-[#1e1e2f]'
                    }`}>
                      <p className="text-sm font-medium">{cls.replace('_', ' ')}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Favorite Airports */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Favorite Airports</h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAirport}
                    onChange={(e) => setNewAirport(e.target.value.toUpperCase())}
                    placeholder="Airport code (e.g., JFK)"
                    className="flex-1 px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={3}
                  />
                  <button
                    onClick={addAirport}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.favoriteAirports?.map((airport) => (
                  <span
                    key={airport}
                    className="px-3 py-1 bg-[#1e1e2f] rounded-full text-sm flex items-center gap-2"
                  >
                    {airport}
                    <button
                      onClick={() => removeAirport(airport)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Airlines */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Preferred Airlines</h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAirline}
                    onChange={(e) => setNewAirline(e.target.value)}
                    placeholder="Airline name (e.g., Emirates)"
                    className="flex-1 px-3 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={addAirline}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.preferredAirlines?.map((airline) => (
                  <span
                    key={airline}
                    className="px-3 py-1 bg-[#1e1e2f] rounded-full text-sm flex items-center gap-2"
                  >
                    {airline}
                    <button
                      onClick={() => removeAirline(airline)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Meal Preferences */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Meal Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(preferences.mealPreferences || {}).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateMealPreference(key, e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-[#1e1e2f] border-gray-600 rounded focus:ring-green-500"
                    />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seat Preferences */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Seat Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(preferences.seatPreferences || {}).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateSeatPreference(key, e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-[#1e1e2f] border-gray-600 rounded focus:ring-green-500"
                    />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-[#2b2b3c] p-6 rounded-2xl">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 