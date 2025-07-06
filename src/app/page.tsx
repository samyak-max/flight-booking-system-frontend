"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthData } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { API_CONFIG } from "@/lib/config";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Store authentication data
        setAuthData(result.user, result.session);
        
        // Refresh user context
        refreshUser();
        
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e1e2f] px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#2b2b3c] p-8 rounded-2xl shadow-xl space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center">Welcome back</h2>
        <p className="text-sm text-gray-400 text-center">
          Sign in to continue to your dashboard
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 bg-[#1e1e2f] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-green-500 hover:text-green-400">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
