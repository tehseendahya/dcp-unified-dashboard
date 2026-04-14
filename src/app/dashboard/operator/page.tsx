"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Deal, SourcedCompany, AssociateStats } from "@/lib/types";

interface AssociateWithStats {
  id: string;
  email: string;
  full_name: string;
  account_type: string;
  stats: AssociateStats;
  deals: Deal[];
}

type Tab = "deals" | "associates" | "sourced";

export default function OperatorDashboard() {
  const [tab, setTab] = useState<Tab>("deals");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [associates, setAssociates] = useState<AssociateWithStats[]>([]);
  const [sourcedCompanies, setSourcedCompanies] = useState<SourcedCompany[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // Create deal form
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealCompany, setDealCompany] = useState("");
  const [dealDescription, setDealDescription] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email || "");
        await fetch("/api/user");
      }

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
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "deals", label: "Deals" },
    { key: "associates", label: "Associates" },
    { key: "sourced", label: "Sourced Companies" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          DCP Operating Team Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{userName}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px ${
                tab === t.key
                  ? "border-gray-900 text-gray-900 font-medium"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Deals Tab */}
        {tab === "deals" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                All Deals
              </h2>
              <button
                onClick={() => setShowCreateDeal(!showCreateDeal)}
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1"
              >
                {showCreateDeal ? "Cancel" : "+ New Deal"}
              </button>
            </div>

            {showCreateDeal && (
              <form
                onSubmit={handleCreateDeal}
                className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Deal Title
                    </label>
                    <input
                      type="text"
                      value={dealTitle}
                      onChange={(e) => setDealTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={dealCompany}
                      onChange={(e) => setDealCompany(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={dealDescription}
                    onChange={(e) => setDealDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-800"
                >
                  Create Deal
                </button>
              </form>
            )}

            <div className="space-y-3">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {deal.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {deal.company} &middot;{" "}
                        <span
                          className={
                            deal.status === "open"
                              ? "text-green-600"
                              : deal.status === "in_progress"
                              ? "text-yellow-600"
                              : "text-gray-400"
                          }
                        >
                          {deal.status.replace("_", " ")}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {deal.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created by {deal.created_by_name} &middot;{" "}
                        {deal.signed_up_associates.length} associate(s) signed
                        up
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {deals.length === 0 && (
                <p className="text-sm text-gray-500">No deals yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Associates Tab */}
        {tab === "associates" && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Associate Profiles
            </h2>
            {associates.length === 0 ? (
              <p className="text-sm text-gray-500">
                No associates have signed up yet.
              </p>
            ) : (
              <div className="space-y-4">
                {associates.map((a) => (
                  <div
                    key={a.id}
                    className="border border-gray-200 rounded-lg p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {a.full_name}
                        </h3>
                        <p className="text-xs text-gray-500">{a.email}</p>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-3 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-lg font-semibold text-gray-900">
                          {a.stats.weekly_meetings_attended}
                        </p>
                        <p className="text-xs text-gray-500">
                          Weekly Meetings
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-lg font-semibold text-gray-900">
                          {a.stats.companies_sourced}
                        </p>
                        <p className="text-xs text-gray-500">Sourced</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-lg font-semibold text-gray-900">
                          {a.stats.companies_screened}
                        </p>
                        <p className="text-xs text-gray-500">Screened</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-lg font-semibold text-gray-900">
                          {a.stats.dd_reports_written}
                        </p>
                        <p className="text-xs text-gray-500">DD Reports</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-lg font-semibold text-gray-900">
                          {a.stats.companies_invested}
                        </p>
                        <p className="text-xs text-gray-500">Invested</p>
                      </div>
                    </div>
                    {/* Deals */}
                    {a.deals.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Signed up for:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {a.deals.map((d) => (
                            <span
                              key={d.id}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                            >
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
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Sourced Companies
            </h2>
            {sourcedCompanies.length === 0 ? (
              <p className="text-sm text-gray-500">
                No companies have been sourced yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="py-2 pr-4 text-xs font-medium text-gray-500">
                        Company
                      </th>
                      <th className="py-2 pr-4 text-xs font-medium text-gray-500">
                        Website
                      </th>
                      <th className="py-2 pr-4 text-xs font-medium text-gray-500">
                        Description
                      </th>
                      <th className="py-2 pr-4 text-xs font-medium text-gray-500">
                        Assignee
                      </th>
                      <th className="py-2 pr-4 text-xs font-medium text-gray-500">
                        Status
                      </th>
                      <th className="py-2 text-xs font-medium text-gray-500">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourcedCompanies.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100"
                      >
                        <td className="py-2.5 pr-4 text-gray-900">
                          {c.company_name}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600">
                          {c.website || "-"}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600 max-w-xs truncate">
                          {c.description}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-900">
                          {c.submitted_by_name}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              c.status === "submitted"
                                ? "bg-blue-50 text-blue-700"
                                : c.status === "screening"
                                ? "bg-yellow-50 text-yellow-700"
                                : c.status === "screened"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-500 text-xs">
                          {new Date(c.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
