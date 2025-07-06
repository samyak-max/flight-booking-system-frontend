"use client";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  // Don't render anything during loading or if not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-[#2b2b3c] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-white">
              Flight Booking
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/flights"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Search Flights
            </Link>
            <Link
              href="/bookings"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              My Bookings
            </Link>
            <Link
              href="/flight-status"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Flight Status
            </Link>
            <Link
              href="/profile"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Profile
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}; 