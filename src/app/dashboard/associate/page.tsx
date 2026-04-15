"use client";

import { useEffect, useState } from "react";
import { Deal } from "@/lib/types";

const isDemo =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; dot: string }> = {
    open: { bg: "var(--success-soft)", color: "var(--success)", dot: "#22C55E" },
    in_progress: { bg: "var(--warning-soft)", color: "var(--warning)", dot: "#F59E0B" },
    closed: { bg: "#F4F4F5", color: "#71717A", dot: "#A1A1AA" },
  };
  const c = config[status] || config.closed;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status.replace("_", " ")}
    </span>
  );
}

export default function AssociateDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealCompany, setDealCompany] = useState("");
  const [dealDescription, setDealDescription] = useState("");

  useEffect(() => {
    async function load() {
      if (isDemo) {
        const stored = localStorage.getItem("demo_current_user");
        if (stored) {
          const user = JSON.parse(stored);
          setUserName(user.full_name);
          setUserId(user.id);
        }
      } else {
        const { createClient } = await import("@/lib/supabase-browser");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email || "");
          setUserId(user.id);
        }
      }
      await fetch("/api/user");
      const res = await fetch("/api/deals");
      const data = await res.json();
      setDeals(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignUp(dealId: string) {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", dealId }),
    });
    const updated = await res.json();
    setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  async function handleSourceCompany(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/sourced-companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name: companyName, website: companyWebsite, description: companyDescription }),
    });
    setCompanyName(""); setCompanyWebsite(""); setCompanyDescription("");
    setSubmitting(false); setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  }

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: dealTitle, company: dealCompany, description: dealDescription }),
    });
    const newDeal = await res.json();
    setDeals((prev) => [...prev, newDeal]);
    setDealTitle(""); setDealCompany(""); setDealDescription("");
    setShowCreateDeal(false);
  }

  async function handleSignOut() {
    if (isDemo) {
      document.cookie = "demo_user=;path=/;max-age=0";
      localStorage.removeItem("demo_current_user");
    } else {
      const { createClient } = await import("@/lib/supabase-browser");
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    window.location.href = "/login";
  }

  const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-[13px] placeholder:text-[#B0B0BA]";
  const inputStyle = { border: "1px solid var(--border-default)", background: "var(--bg-card)", color: "var(--text-primary)" };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" style={{ color: "var(--accent)" }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-[14px]" style={{ color: "var(--text-secondary)" }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col h-screen sticky top-0" style={{ background: "var(--bg-sidebar)" }}>
        <div className="p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <span className="text-white font-bold text-[13px]" style={{ fontFamily: "var(--font-serif)" }}>D</span>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white tracking-[-0.01em]">DCP Platform</div>
              <div className="text-[11px] text-[#71717A]">Associate</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-white" style={{ background: "rgba(255,255,255,0.08)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1.5" y="1.5" width="5" height="5" rx="1"/>
              <rect x="9.5" y="1.5" width="5" height="5" rx="1"/>
              <rect x="1.5" y="9.5" width="5" height="5" rx="1"/>
              <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
            </svg>
            Deals
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[#A1A1AA] hover:text-white hover:bg-white/5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 14v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/>
              <circle cx="8" cy="4.5" r="2.5"/>
            </svg>
            Source Company
          </a>
        </nav>

        <div className="p-3 mt-auto">
          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold" style={{ background: "var(--accent)" }}>
                {userName.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white truncate">{userName}</div>
                <div className="text-[11px] text-[#71717A] truncate">Associate</div>
              </div>
              <button onClick={handleSignOut} className="text-[#71717A] hover:text-white p-1" title="Sign out">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M6 8h8"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {isDemo && (
          <div className="px-4 py-2 text-center text-[11px] font-medium" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>
            Demo mode — Supabase not connected. Data resets on server restart.
          </div>
        )}

        <div className="px-8 py-6">
          {/* Page header */}
          <div className="mb-8 animate-in">
            <h1 className="text-[24px] font-semibold tracking-[-0.03em]" style={{ color: "var(--text-primary)" }}>
              Dashboard
            </h1>
            <p className="text-[14px] mt-1" style={{ color: "var(--text-secondary)" }}>
              View active deals and source new companies.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Source company card */}
            <div className="xl:col-span-1 animate-in animate-in-delay-1">
              <div className="rounded-xl p-6" style={{
                background: "var(--bg-card)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03), 0 0 0 1px var(--border-subtle)",
              }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-soft)" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M8 3v10M3 8h10"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Source Company</h2>
                    <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Submit for screening</p>
                  </div>
                </div>

                {submitSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13.5 4.5l-7 7L3 8"/>
                    </svg>
                    Submitted successfully
                  </div>
                )}

                <form onSubmit={handleSourceCompany} className="space-y-3.5">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Company Name</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corp" className={inputClass} style={inputStyle} required />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Website</label>
                    <input type="text" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="acme.com" className={inputClass} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
                    <textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)}
                      rows={3} placeholder="Brief overview of the company..."
                      className={`${inputClass} resize-none`} style={inputStyle} required />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full rounded-lg px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
                    style={{ background: "var(--accent)" }}>
                    {submitting ? "Submitting..." : "Submit for Screening"}
                  </button>
                </form>
              </div>
            </div>

            {/* Deals column */}
            <div className="xl:col-span-2 animate-in animate-in-delay-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[16px] font-semibold" style={{ color: "var(--text-primary)" }}>Active Deals</h2>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{deals.length} deal{deals.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowCreateDeal(!showCreateDeal)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium hover:brightness-110 active:scale-[0.98]"
                  style={showCreateDeal
                    ? { border: "1px solid var(--border-default)", color: "var(--text-secondary)", background: "var(--bg-card)" }
                    : { background: "var(--accent)", color: "white" }
                  }>
                  {showCreateDeal ? "Cancel" : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M8 3v10M3 8h10"/>
                      </svg>
                      New Deal
                    </>
                  )}
                </button>
              </div>

              {showCreateDeal && (
                <form onSubmit={handleCreateDeal} className="rounded-xl p-5 mb-4" style={{
                  background: "var(--bg-card)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03), 0 0 0 1px var(--border-subtle)",
                }}>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Deal Title</label>
                      <input type="text" value={dealTitle} onChange={(e) => setDealTitle(e.target.value)}
                        className={inputClass} style={inputStyle} required />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Company</label>
                      <input type="text" value={dealCompany} onChange={(e) => setDealCompany(e.target.value)}
                        className={inputClass} style={inputStyle} required />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Description</label>
                    <textarea value={dealDescription} onChange={(e) => setDealDescription(e.target.value)}
                      rows={2} className={`${inputClass} resize-none`} style={inputStyle} required />
                  </div>
                  <button type="submit"
                    className="rounded-lg px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 active:scale-[0.98]"
                    style={{ background: "var(--accent)" }}>
                    Create Deal
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {deals.map((deal, i) => {
                  const isSignedUp = deal.signed_up_associates.includes(userId);
                  return (
                    <div key={deal.id} className={`rounded-xl p-5 group animate-in animate-in-delay-${Math.min(i + 1, 4)}`} style={{
                      background: "var(--bg-card)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px var(--border-subtle)",
                    }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <h3 className="text-[14px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                              {deal.title}
                            </h3>
                            <StatusBadge status={deal.status} />
                          </div>
                          <p className="text-[13px] mb-2" style={{ color: "var(--text-secondary)" }}>
                            {deal.company}
                          </p>
                          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                            {deal.description}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            <span className="flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M14 14v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="8" cy="4.5" r="2.5"/>
                              </svg>
                              {deal.signed_up_associates.length} signed up
                            </span>
                            <span>by {deal.created_by_name}</span>
                          </div>
                        </div>
                        <button onClick={() => handleSignUp(deal.id)} disabled={isSignedUp}
                          className="flex-shrink-0 rounded-lg px-4 py-2 text-[12px] font-medium active:scale-[0.97]"
                          style={isSignedUp
                            ? { background: "var(--success-soft)", color: "var(--success)", cursor: "default" }
                            : { border: "1px solid var(--border-default)", color: "var(--text-primary)", background: "var(--bg-card)" }
                          }>
                          {isSignedUp ? (
                            <span className="flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13.5 4.5l-7 7L3 8"/>
                              </svg>
                              Joined
                            </span>
                          ) : "Join Deal"}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {deals.length === 0 && (
                  <div className="text-center py-12 rounded-xl" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-default)" }}>
                    <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No deals yet. Create one to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
