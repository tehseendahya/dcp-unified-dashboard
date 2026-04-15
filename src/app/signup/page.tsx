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
  const [accountType, setAccountType] = useState<"associate" | "operator">("associate");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isDemo) {
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

    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, account_type: accountType } },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    window.location.href = "/login";
  }

  const inputStyle = {
    border: "1px solid var(--border-default)",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-base)" }}>
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, #000 0.5px, transparent 0.5px)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative w-full max-w-[400px] animate-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5" style={{
            background: "var(--bg-sidebar)",
          }}>
            <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-serif)" }}>D</span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]" style={{ color: "var(--text-primary)" }}>
            Create your account
          </h1>
          <p className="mt-1.5 text-[14px]" style={{ color: "var(--text-secondary)" }}>
            Join the DCP investment platform
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{
          background: "var(--bg-card)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.04), 0 0 0 1px var(--border-subtle)",
        }}>
          {isDemo && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[12px]" style={{
              background: "var(--warning-soft)",
              color: "var(--warning)",
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L1 14h14L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M8 6v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Demo mode — Supabase not connected
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="rounded-lg px-3.5 py-2.5 text-[13px]" style={{
                background: "var(--danger-soft)",
                color: "var(--danger)",
              }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>Full name</label>
              <input
                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-lg px-3.5 py-2.5 text-[14px] placeholder:text-[#B0B0BA]"
                style={inputStyle} required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>Email address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg px-3.5 py-2.5 text-[14px] placeholder:text-[#B0B0BA]"
                style={inputStyle} required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full rounded-lg px-3.5 py-2.5 text-[14px] placeholder:text-[#B0B0BA]"
                style={inputStyle} required minLength={6}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--text-primary)" }}>I am joining as</label>
              <div className="grid grid-cols-2 gap-3">
                {(["associate", "operator"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    className="rounded-lg px-4 py-3 text-left"
                    style={{
                      border: accountType === type ? "2px solid var(--accent)" : "1px solid var(--border-default)",
                      background: accountType === type ? "var(--accent-soft)" : "var(--bg-card)",
                    }}
                  >
                    <span className="block text-[13px] font-medium" style={{
                      color: accountType === type ? "var(--accent)" : "var(--text-primary)",
                    }}>
                      {type === "associate" ? "Associate" : "Operating Team"}
                    </span>
                    <span className="block text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {type === "associate" ? "Source & review deals" : "Manage team & deals"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-lg px-4 py-2.5 text-[14px] font-medium text-white disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
              style={{ background: "var(--accent)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </span>
              ) : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[13px]" style={{ color: "var(--text-tertiary)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
