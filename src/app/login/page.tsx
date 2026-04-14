"use client";

import { useState } from "react";
import Link from "next/link";

const isDemo =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isDemo) {
      // Demo mode: look up user from localStorage registry
      const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
      const user = users.find(
        (u: { email: string; password: string }) =>
          u.email === email && u.password === password
      );
      if (!user) {
        setError("Invalid email or password. Sign up first in demo mode.");
        setLoading(false);
        return;
      }
      // Set cookie for middleware + localStorage for client
      const demoUser = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        account_type: user.account_type,
      };
      document.cookie = `demo_user=${encodeURIComponent(JSON.stringify(demoUser))};path=/;max-age=86400`;
      localStorage.setItem("demo_current_user", JSON.stringify(demoUser));

      window.location.href =
        user.account_type === "operator"
          ? "/dashboard/operator"
          : "/dashboard/associate";
      return;
    }

    // Supabase mode
    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const accountType = user?.user_metadata?.account_type || "associate";

    window.location.href =
      accountType === "operator"
        ? "/dashboard/operator"
        : "/dashboard/associate";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          DCP Dashboard
        </h1>
        {isDemo && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded px-3 py-2 text-center">
            Demo mode — Supabase not connected
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gray-900 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
