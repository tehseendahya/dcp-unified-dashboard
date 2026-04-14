"use client";

import { useState } from "react";
import Link from "next/link";

const isDemo =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"associate" | "operator">(
    "associate"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isDemo) {
      // Demo mode: store user in localStorage
      const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
      if (users.some((u: { email: string }) => u.email === email)) {
        setError("An account with this email already exists.");
        setLoading(false);
        return;
      }
      const newUser = {
        id: `demo-${Date.now()}`,
        email,
        password,
        full_name: fullName,
        account_type: accountType,
      };
      users.push(newUser);
      localStorage.setItem("demo_users", JSON.stringify(users));

      // Auto-login in demo mode
      const demoUser = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        account_type: newUser.account_type,
      };
      document.cookie = `demo_user=${encodeURIComponent(JSON.stringify(demoUser))};path=/;max-age=86400`;
      localStorage.setItem("demo_current_user", JSON.stringify(demoUser));

      window.location.href =
        accountType === "operator"
          ? "/dashboard/operator"
          : "/dashboard/associate";
      return;
    }

    // Supabase mode
    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // In Supabase mode, show confirmation message
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Create Account
        </h1>
        {isDemo && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded px-3 py-2 text-center">
            Demo mode — Supabase not connected
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              required
            />
          </div>
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
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={accountType}
              onChange={(e) =>
                setAccountType(e.target.value as "associate" | "operator")
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="associate">Associate</option>
              <option value="operator">Operating Team</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
