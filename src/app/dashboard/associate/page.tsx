"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Deal } from "@/lib/types";

export default function AssociateDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  // Source company form
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
        setUserId(user.id);
        // Initialize user in store
        await fetch("/api/user");
      }

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
      body: JSON.stringify({
        company_name: companyName,
        website: companyWebsite,
        description: companyDescription,
      }),
    });
    setCompanyName("");
    setCompanyWebsite("");
    setCompanyDescription("");
    setSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  }

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          DCP Associate Dashboard
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Source company form */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Submit Company for Screening
              </h2>
              {submitSuccess && (
                <p className="text-green-600 text-xs mb-3">
                  Company submitted successfully!
                </p>
              )}
              <form onSubmit={handleSourceCompany} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-900 text-white py-1.5 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>

          {/* Right column: Deals */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Deals</h2>
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
              {deals.map((deal) => {
                const isSignedUp = deal.signed_up_associates.includes(userId);
                return (
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
                      <button
                        onClick={() => handleSignUp(deal.id)}
                        disabled={isSignedUp}
                        className={`text-xs px-3 py-1 rounded border ${
                          isSignedUp
                            ? "border-gray-200 text-gray-400 cursor-default"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {isSignedUp ? "Signed up" : "Sign up"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {deals.length === 0 && (
                <p className="text-sm text-gray-500">No deals yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
