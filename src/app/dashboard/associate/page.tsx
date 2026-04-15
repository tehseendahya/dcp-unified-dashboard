"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Deal } from "@/lib/types";

const isDemo =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url";

function StatusBadge({ status }: { status: string }) {
  const variant = status === "closed" ? "secondary" : "outline";
  return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserName(user.user_metadata?.full_name || user.email || "");
          setUserId(user.id);
        }
      }

      await fetch("/api/user");
      const res = await fetch("/api/deals");
      setDeals(await res.json());
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
    setDeals((prev) => prev.map((deal) => (deal.id === updated.id ? updated : deal)));
  }

  async function handleSourceCompany(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/sourced-companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_name: companyName, website: companyWebsite, description: companyDescription }),
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
      body: JSON.stringify({ title: dealTitle, company: dealCompany, description: dealDescription }),
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-[1920px] space-y-4">
        <header className="flex flex-col gap-4 border-b border-b-foreground/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Associate Dashboard</h1>
            <p className="text-sm text-muted-foreground">View active deals and source companies</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{userName || "Associate"}</Badge>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>

        {isDemo && (
          <div className="rounded-md border bg-secondary px-3 py-2 text-sm text-muted-foreground">
            Demo mode enabled. Data resets on server restart.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Source Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submitSuccess && <p className="text-sm text-muted-foreground">Submitted successfully</p>}
              <form onSubmit={handleSourceCompany} className="space-y-3">
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" required />
                <Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="Website" />
                <Textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="Company overview" required />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit for Screening"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <section className="space-y-4 md:col-span-1 xl:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Active Deals</h2>
                <p className="text-sm text-muted-foreground">{deals.length} deal(s)</p>
              </div>
              <Button variant={showCreateDeal ? "outline" : "default"} onClick={() => setShowCreateDeal((s) => !s)}>
                <Plus className="h-4 w-4" />
                {showCreateDeal ? "Cancel" : "New Deal"}
              </Button>
            </div>

            {showCreateDeal && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Deal</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateDeal} className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input value={dealTitle} onChange={(e) => setDealTitle(e.target.value)} placeholder="Deal title" required />
                      <Input value={dealCompany} onChange={(e) => setDealCompany(e.target.value)} placeholder="Company" required />
                    </div>
                    <Textarea value={dealDescription} onChange={(e) => setDealDescription(e.target.value)} placeholder="Description" required />
                    <Button type="submit">Create Deal</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {deals.map((deal) => {
                const isSignedUp = deal.signed_up_associates.includes(userId);
                return (
                  <Card key={deal.id}>
                    <CardHeader>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="text-base">{deal.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{deal.company}</p>
                        </div>
                        <StatusBadge status={deal.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{deal.description}</p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                          {deal.signed_up_associates.length} signed up · by {deal.created_by_name}
                        </p>
                        <Button
                          variant={isSignedUp ? "secondary" : "outline"}
                          size="sm"
                          disabled={isSignedUp}
                          onClick={() => handleSignUp(deal.id)}
                        >
                          {isSignedUp ? "Joined" : "Join Deal"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
