"use client";

import { useEffect, useState } from "react";
import { Deal, SourcedCompany, AssociateStats } from "@/lib/types";

const isDemo =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url";

interface AssociateWithStats {
  id: string;
  email: string;
  full_name: string;
  account_type: string;
  stats: AssociateStats;
  deals: Deal[];
}

type Tab = "deals" | "associates" | "sourced";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; dot: string }> = {
    open: { bg: "var(--success-soft)", color: "var(--success)", dot: "#22C55E" },
    in_progress: { bg: "var(--warning-soft)", color: "var(--warning)", dot: "#F59E0B" },
    closed: { bg: "#F4F4F5", color: "#71717A", dot: "#A1A1AA" },
    submitted: { bg: "var(--accent-soft)", color: "var(--accent)", dot: "#2C5FD1" },
    screening: { bg: "var(--warning-soft)", color: "var(--warning)", dot: "#F59E0B" },
    screened: { bg: "var(--success-soft)", color: "var(--success)", dot: "#22C55E" },
  };
  const c = config[status] || config.closed;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status.replace("_", " ")}
    </span>
  );
}

export default function OperatorDashboard() {
  const [tab, setTab] = useState<Tab>("deals");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [associates, setAssociates] = useState<AssociateWithStats[]>([]);
  const [sourcedCompanies, setSourcedCompanies] = useState<SourcedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
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
        }
      } else {
        const { createClient } = await import("@/lib/supabase-browser");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email || "");
        }
      }

      await fetch("/api/user");

      const [dealsRes, associatesRes, sourcedRes] = await Promise.all([
        fetch("/api/deals"),
        fetch("/api/associates"),
        fetch("/api/sourced-companies"),
      ]);

      setDeals(await dealsRes.json());
      setAssociates(await associatesRes.json());
      setSourcedCompanies(await sourcedRes.json());
      setLoading(false);
    }
    load();
  }, []);

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: dealTitle,
        company: dealCompany,
        description: dealDescription,
      }),
    });
    const newDeal = await res.json();
    setDeals((prev) => [...prev, newDeal]);
    setDealTitle("");
    setDealCompany("");
    setDealDescription("");
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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "deals", label: "Deals",
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg>,
    },
    {
      key: "associates", label: "Associates",
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/><circle cx="8" cy="4.5" r="2.5"/></svg>,
    },
    {
      key: "sourced", label: "Sourced",
      icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 4v4l2.5 2.5"/></svg>,
    },
  ];

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
              <div className="text-[11px] text-[#71717A]">Operating Team</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-left ${
                tab === t.key ? "text-white" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
              }`}
              style={tab === t.key ? { background: "rgba(255,255,255,0.08)" } : undefined}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-3 mt-auto">
          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold" style={{ background: "var(--accent)" }}>
                {userName.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white truncate">{userName}</div>
                <div className="text-[11px] text-[#71717A] truncate">Operator</div>
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
              {tab === "deals" ? "Deals" : tab === "associates" ? "Associates" : "Sourced Companies"}
            </h1>
            <p className="text-[14px] mt-1" style={{ color: "var(--text-secondary)" }}>
              {tab === "deals" ? "Manage and track all active deals." : tab === "associates" ? "View associate profiles and performance." : "Review companies submitted by associates."}
            </p>
          </div>

          {/* Deals Tab */}
          {tab === "deals" && (
            <div className="animate-in animate-in-delay-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{deals.length} deal{deals.length !== 1 ? "s" : ""}</p>
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
                {deals.map((deal, i) => (
                  <div key={deal.id} className={`rounded-xl p-5 animate-in animate-in-delay-${Math.min(i + 1, 4)}`} style={{
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
                    </div>
                  </div>
                ))}
                {deals.length === 0 && (
                  <div className="text-center py-12 rounded-xl" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-default)" }}>
                    <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No deals yet. Create one to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Associates Tab */}
          {tab === "associates" && (
            <div className="animate-in animate-in-delay-1">
              {associates.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-default)" }}>
                  <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No associates have signed up yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {associates.map((a, i) => (
                    <div key={a.id} className={`rounded-xl p-5 animate-in animate-in-delay-${Math.min(i + 1, 4)}`} style={{
                      background: "var(--bg-card)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03), 0 0 0 1px var(--border-subtle)",
                    }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-semibold" style={{ background: "var(--accent)" }}>
                          {a.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>{a.full_name}</h3>
                          <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>{a.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {[
                          { label: "Weekly Meetings", value: a.stats.weekly_meetings_attended },
                          { label: "Sourced", value: a.stats.companies_sourced },
                          { label: "Screened", value: a.stats.companies_screened },
                          { label: "DD Reports", value: a.stats.dd_reports_written },
                          { label: "Invested", value: a.stats.companies_invested },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center rounded-lg p-2.5" style={{ background: "var(--bg-base)" }}>
                            <p className="text-[18px] font-semibold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                            <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--text-tertiary)" }}>{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      {a.deals.length > 0 && (
                        <div>
                          <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--text-tertiary)" }}>Signed up for:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {a.deals.map((d) => (
                              <span key={d.id} className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{
                                background: "var(--accent-soft)",
                                color: "var(--accent)",
                              }}>
                                {d.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sourced Companies Tab */}
          {tab === "sourced" && (
            <div className="animate-in animate-in-delay-1">
              {sourcedCompanies.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ background: "var(--bg-card)", border: "1px dashed var(--border-default)" }}>
                  <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>No companies have been sourced yet.</p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden" style={{
                  background: "var(--bg-card)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px var(--border-subtle)",
                }}>
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <th className="py-3 px-5 text-left text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Company</th>
                        <th className="py-3 px-5 text-left text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Website</th>
                        <th className="py-3 px-5 text-left text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Description</th>
                        <th className="py-3 px-5 text-left text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Submitted By</th>
                        <th className="py-3 px-5 text-left text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Status</th>
                        <th className="py-3 px-5 text-left text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sourcedCompanies.map((c) => (
                        <tr key={c.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td className="py-3 px-5 font-medium" style={{ color: "var(--text-primary)" }}>{c.company_name}</td>
                          <td className="py-3 px-5" style={{ color: "var(--text-secondary)" }}>{c.website || "—"}</td>
                          <td className="py-3 px-5 max-w-xs truncate" style={{ color: "var(--text-secondary)" }}>{c.description}</td>
                          <td className="py-3 px-5" style={{ color: "var(--text-primary)" }}>{c.submitted_by_name}</td>
                          <td className="py-3 px-5"><StatusBadge status={c.status} /></td>
                          <td className="py-3 px-5 text-[12px]" style={{ color: "var(--text-tertiary)" }}>{new Date(c.submitted_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
