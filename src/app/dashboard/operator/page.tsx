"use client";

import { useEffect, useState } from "react";
import { Loader2, LogOut, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const variant = status === "closed" ? "secondary" : "outline";
  return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
            <h1 className="text-2xl font-semibold">Operator Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage deals and track associates</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{userName || "Operator"}</Badge>
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

        <nav className="flex flex-col gap-2 sm:flex-row">
          {(["deals", "associates", "sourced"] as const).map((item) => (
            <Button
              key={item}
              variant={tab === item ? "default" : "outline"}
              onClick={() => setTab(item)}
              className="justify-start"
            >
              {item}
            </Button>
          ))}
        </nav>

        {tab === "deals" && (
          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">{deals.length} deal(s)</p>
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
                  <form onSubmit={handleCreateDeal} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
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
              {deals.map((deal) => (
                <Card key={deal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base">{deal.title}</CardTitle>
                      <StatusBadge status={deal.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="font-medium">{deal.company}</p>
                    <p className="text-muted-foreground">{deal.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {deal.signed_up_associates.length} signed up · by {deal.created_by_name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {tab === "associates" && (
          <section className="grid gap-4 md:grid-cols-2">
            {associates.map((associate) => (
              <Card key={associate.id}>
                <CardHeader>
                  <CardTitle className="text-base">{associate.full_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{associate.email}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm lg:grid-cols-5">
                    <div className="rounded-md bg-secondary p-2">Meetings: {associate.stats.weekly_meetings_attended}</div>
                    <div className="rounded-md bg-secondary p-2">Sourced: {associate.stats.companies_sourced}</div>
                    <div className="rounded-md bg-secondary p-2">Screened: {associate.stats.companies_screened}</div>
                    <div className="rounded-md bg-secondary p-2">DD Reports: {associate.stats.dd_reports_written}</div>
                    <div className="rounded-md bg-secondary p-2">Invested: {associate.stats.companies_invested}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {tab === "sourced" && (
          <section className="space-y-3">
            {sourcedCompanies.map((company) => (
              <Card key={company.id}>
                <CardContent className="grid gap-2 pt-6 text-sm md:grid-cols-6">
                  <p className="font-semibold">{company.company_name}</p>
                  <p>{company.website || "-"}</p>
                  <p className="md:col-span-2">{company.description}</p>
                  <p>{company.submitted_by_name}</p>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={company.status} />
                    <span className="text-xs text-muted-foreground">{new Date(company.submitted_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
