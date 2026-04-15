"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  FileText,
  Flag,
  Home,
  Loader2,
  LogOut,
  MessageSquarePlus,
  Table,
  Users,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CommunityMember, Deal, DealTask, GoalItem, TrackingItem } from "@/lib/types";

type DashboardTab =
  | "home"
  | "my-deals"
  | "source"
  | "community"
  | "associate-tracker"
  | "goals"
  | "tracking";
type AccountType = "associate" | "operator";

const sourceSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  website: z.string().optional(),
  description: z.string().optional(),
  diligence_stage: z.string().optional(),
  received_inquiry: z.string().optional(),
  funding_round: z.string().optional(),
  industry: z.string().optional(),
  date_most_recent_screening: z
    .string()
    .regex(
      /^$|^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/[0-9]{4}$/,
      "Use mm/dd/yyyy"
    )
    .optional(),
  accelerator: z.string().optional(),
  region: z.string().optional(),
  pitch_deck: z.string().optional(),
  rating: z
    .string()
    .regex(/^$|^-?[0-3]$/, "Use integer from -3 to 3")
    .optional(),
  notes: z.string().optional(),
  fundraise: z.string().optional(),
  one_pager_url: z.string().optional(),
  founder_name: z.string().optional(),
  location_city: z.string().optional(),
  duke_connection: z.string().optional(),
});

const updateSchema = z.object({
  stage: z.string().min(1, "Stage is required"),
  note: z.string().optional(),
});

type SourceValues = z.infer<typeof sourceSchema>;
type UpdateValues = z.infer<typeof updateSchema>;

function formatRoleLabel(role: CommunityMember["role"]) {
  if (role === "operating_team") return "Operating Team";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function isCurrentDeal(deal: Deal) {
  return deal.status !== "closed";
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1.5">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-xl">
      <CardContent className="space-y-1 pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardShell({ accountType }: { accountType: AccountType }) {
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<DashboardTab>("home");
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [community, setCommunity] = React.useState<CommunityMember[]>([]);
  const [goals, setGoals] = React.useState<GoalItem[]>([]);
  const [tracking, setTracking] = React.useState<TrackingItem[]>([]);
  const [userId, setUserId] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null);
  const [communitySearch, setCommunitySearch] = React.useState("");
  const [communityRoleFilter, setCommunityRoleFilter] = React.useState("all");
  const [selectedAssociateId, setSelectedAssociateId] = React.useState<string | null>(
    null
  );
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskDetails, setNewTaskDetails] = React.useState("");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");

  const sourceForm = useForm<SourceValues>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      company_name: "",
      website: "",
      description: "",
      diligence_stage: "",
      received_inquiry: "",
      funding_round: "",
      industry: "",
      date_most_recent_screening: "",
      accelerator: "",
      region: "",
      pitch_deck: "",
      rating: "",
      notes: "",
      fundraise: "",
      one_pager_url: "",
      founder_name: "",
      location_city: "",
      duke_connection: "",
    },
  });

  const updateForm = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { stage: "", note: "" },
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const userRes = await fetch("/api/user");
    const userPayload = await userRes.json();

    const [dealsRes, communityRes, goalsRes, trackingRes] = await Promise.all([
      fetch("/api/deals"),
      fetch("/api/community"),
      fetch("/api/goals"),
      fetch("/api/tracking"),
    ]);

    setUserId(userPayload.profile.id);
    setUserName(userPayload.profile.full_name);
    setDeals(await dealsRes.json());
    setCommunity(await communityRes.json());
    setGoals(await goalsRes.json());
    setTracking(await trackingRes.json());
    setLoading(false);
  }, []);

  async function updateGoalItem(goal: GoalItem) {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId: goal.id,
        status: goal.status,
        focus_early_2026: goal.focus_early_2026,
        actions: goal.actions,
      }),
    });
    const updated = await res.json();
    setGoals((current) =>
      current.map((entry) => (entry.id === updated.id ? updated : entry))
    );
  }

  async function updateTrackingRow(item: TrackingItem) {
    const res = await fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingId: item.id,
        deal_stage: item.deal_stage,
        tasks_next_steps: item.tasks_next_steps,
        volunteers_assigned_associates: item.volunteers_assigned_associates,
      }),
    });
    const updated = await res.json();
    setTracking((current) =>
      current.map((entry) => (entry.id === updated.id ? updated : entry))
    );
  }

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSignOut() {
    const isDemo =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url";

    if (isDemo) {
      document.cookie = "demo_user=;path=/;max-age=0";
      localStorage.removeItem("demo_current_user");
      window.location.href = "/login";
      return;
    }

    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function signUpForDeal(dealId: string) {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", dealId }),
    });
    const updatedDeal = await res.json();
    setDeals((current) =>
      current.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal))
    );
  }

  async function submitUpdate(values: UpdateValues) {
    if (!activeDeal) return;
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        dealId: activeDeal.id,
        stage: values.stage,
        note: values.note,
      }),
    });

    const updatedDeal = await res.json();
    setDeals((current) =>
      current.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal))
    );
    setActiveDeal(updatedDeal);
    updateForm.reset({ stage: "", note: "" });
  }

  async function submitSource(values: SourceValues) {
    await fetch("/api/sourced-companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        rating: values.rating ? Number(values.rating) : null,
      }),
    });
    sourceForm.reset();
  }

  async function createTask() {
    if (!activeDeal || !newTaskTitle.trim()) return;
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_task",
        dealId: activeDeal.id,
        title: newTaskTitle.trim(),
        details: newTaskDetails.trim(),
        due_date: newTaskDueDate.trim(),
      }),
    });
    const updatedDeal = await res.json();
    setDeals((current) =>
      current.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal))
    );
    setActiveDeal(updatedDeal);
    setNewTaskTitle("");
    setNewTaskDetails("");
    setNewTaskDueDate("");
  }

  async function signUpForTaskInDeal(dealId: string, taskId: string) {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "task_signup", dealId, taskId }),
    });
    const updatedDeal = await res.json();
    setDeals((current) =>
      current.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal))
    );
    if (activeDeal?.id === dealId) {
      setActiveDeal(updatedDeal);
    }
  }

  async function assignTaskToAssociate(
    dealId: string,
    taskId: string,
    associateId: string
  ) {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "task_assign",
        dealId,
        taskId,
        associateId,
      }),
    });
    const updatedDeal = await res.json();
    setDeals((current) =>
      current.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal))
    );
    if (activeDeal?.id === dealId) {
      setActiveDeal(updatedDeal);
    }
  }

  async function setTaskStatus(
    dealId: string,
    taskId: string,
    status: DealTask["status"]
  ) {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "task_status", dealId, taskId, status }),
    });
    const updatedDeal = await res.json();
    setDeals((current) =>
      current.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal))
    );
    if (activeDeal?.id === dealId) {
      setActiveDeal(updatedDeal);
    }
  }

  const sortedDeals = React.useMemo(
    () =>
      [...deals].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [deals]
  );

  const myDeals = React.useMemo(() => {
    if (accountType === "operator") return sortedDeals;
    return sortedDeals.filter((deal) =>
      deal.signed_up_associates.includes(userId)
    );
  }, [accountType, sortedDeals, userId]);

  const myDealStats = React.useMemo(() => {
    return {
      sourced: myDeals.length,
      screened: myDeals.filter((deal) =>
        deal.updates.some((update) =>
          update.stage.toLowerCase().includes("screen")
        )
      ).length,
      diligence: myDeals.filter((deal) =>
        deal.updates.some((update) => update.stage.toLowerCase().includes("dd"))
      ).length,
      memos: myDeals.filter((deal) =>
        deal.updates.some(
          (update) =>
            update.stage.toLowerCase().includes("memo") ||
            update.stage.toLowerCase().includes("one page")
        )
      ).length,
      invested: myDeals.filter((deal) => deal.status === "closed").length,
    };
  }, [myDeals]);

  const filteredCommunity = React.useMemo(() => {
    return community.filter((member) => {
      const matchesRole =
        communityRoleFilter === "all" || member.role === communityRoleFilter;
      const q = communitySearch.toLowerCase();
      const matchesQuery =
        member.full_name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.phone.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [community, communityRoleFilter, communitySearch]);

  const associateMembers = React.useMemo(
    () => community.filter((member) => member.role === "associate"),
    [community]
  );

  const selectedAssociate = React.useMemo(() => {
    if (!selectedAssociateId) return null;
    return associateMembers.find((member) => member.id === selectedAssociateId) ?? null;
  }, [associateMembers, selectedAssociateId]);

  const selectedAssociateDeals = React.useMemo(() => {
    if (!selectedAssociate) return [];
    return sortedDeals.filter((deal) =>
      deal.signed_up_associates.includes(selectedAssociate.id)
    );
  }, [selectedAssociate, sortedDeals]);

  React.useEffect(() => {
    if (accountType !== "operator") return;
    if (!selectedAssociateId && associateMembers.length > 0) {
      setSelectedAssociateId(associateMembers[0].id);
      return;
    }

    if (
      selectedAssociateId &&
      !associateMembers.some((member) => member.id === selectedAssociateId)
    ) {
      setSelectedAssociateId(associateMembers[0]?.id ?? null);
    }
  }, [accountType, associateMembers, selectedAssociateId]);

  const selectedAssociateStats = React.useMemo(() => {
    const sourced = selectedAssociateDeals.length;
    const screened = selectedAssociateDeals.filter((deal) =>
      deal.updates.some((update) => update.stage.toLowerCase().includes("screen"))
    ).length;
    const diligence = selectedAssociateDeals.filter((deal) =>
      deal.updates.some((update) => update.stage.toLowerCase().includes("dd"))
    ).length;
    const memos = selectedAssociateDeals.filter((deal) =>
      deal.updates.some(
        (update) =>
          update.stage.toLowerCase().includes("memo") ||
          update.stage.toLowerCase().includes("one page")
      )
    ).length;
    const invested = selectedAssociateDeals.filter((deal) => deal.status === "closed").length;

    return { sourced, screened, diligence, memos, invested };
  }, [selectedAssociateDeals]);

  const selectedAssociateCurrentDeals = React.useMemo(
    () => selectedAssociateDeals.filter((deal) => deal.status !== "closed"),
    [selectedAssociateDeals]
  );

  const selectedAssociatePastDeals = React.useMemo(
    () => selectedAssociateDeals.filter((deal) => deal.status === "closed"),
    [selectedAssociateDeals]
  );

  const selectedAssociateContributionMetrics = React.useMemo(() => {
    if (!selectedAssociate) {
      return {
        updatesAuthored: 0,
        tasksAssigned: 0,
        tasksCompleted: 0,
      };
    }

    let updatesAuthored = 0;
    let tasksAssigned = 0;
    let tasksCompleted = 0;

    for (const deal of sortedDeals) {
      updatesAuthored += deal.updates.filter(
        (update) => update.author_id === selectedAssociate.id
      ).length;

      const assignedTasks = deal.tasks.filter((task) =>
        task.assigned_associate_ids.includes(selectedAssociate.id)
      );
      tasksAssigned += assignedTasks.length;
      tasksCompleted += assignedTasks.filter((task) => task.status === "done").length;
    }

    return { updatesAuthored, tasksAssigned, tasksCompleted };
  }, [selectedAssociate, sortedDeals]);

  const associateTodos = React.useMemo(() => {
    if (accountType !== "associate") return [];
    return myDeals.flatMap((deal) =>
      deal.tasks
        .filter((task) => task.assigned_associate_ids.includes(userId))
        .map((task) => ({ deal, task }))
    );
  }, [accountType, myDeals, userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <header className="flex flex-col gap-5 border-b border-b-foreground/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight">
              {accountType === "operator" ? "Operator" : "Associate"} Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Dealflow, updates, sourcing, and community directory
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 min-w-60 justify-between rounded-lg px-4"
              >
                {userName}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setTab("home")}>
                <Home className="h-4 w-4" />
                Home
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTab("my-deals")}>
                <FileText className="h-4 w-4" />
                My deals
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTab("source")}>
                <MessageSquarePlus className="h-4 w-4" />
                Source
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTab("community")}>
                <Users className="h-4 w-4" />
                Community
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTab("goals")}>
                <Flag className="h-4 w-4" />
                Goals
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTab("tracking")}>
                <Table className="h-4 w-4" />
                Tracking
              </DropdownMenuItem>
              {accountType === "operator" && (
                <DropdownMenuItem onClick={() => setTab("associate-tracker")}>
                  <Users className="h-4 w-4" />
                  Associate tracker
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {tab === "home" && (
          <section className="space-y-5">
            <SectionHeader
              title="Home"
              description="Dealflow and team progress updates."
            />
            <div className="space-y-4">
              {sortedDeals.map((deal) => {
                const associateSigned =
                  accountType === "associate" &&
                  deal.signed_up_associates.includes(userId);
                return (
                  <Card
                    key={deal.id}
                    className={
                      associateSigned
                        ? "rounded-xl border-emerald-500/60 bg-emerald-50/80 dark:bg-emerald-950/30"
                        : "rounded-xl"
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{deal.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {deal.company}
                          </CardDescription>
                        </div>
                        <Badge variant={isCurrentDeal(deal) ? "secondary" : "outline"}>
                          {deal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
                        {deal.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {accountType === "associate" &&
                          !deal.signed_up_associates.includes(userId) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => signUpForDeal(deal.id)}
                            >
                              Join deal
                            </Button>
                          )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveDeal(deal)}
                        >
                          View progress updates
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {tab === "my-deals" && (
          <section className="space-y-6">
            <SectionHeader
              title="My deals"
              description="Recent and active deals with your contribution metrics and tasks."
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard label="Sourced" value={myDealStats.sourced} />
              <StatCard label="Screened" value={myDealStats.screened} />
              <StatCard label="Due diligence" value={myDealStats.diligence} />
              <StatCard label="Memos written" value={myDealStats.memos} />
              <StatCard label="Invested" value={myDealStats.invested} />
            </div>

            {accountType === "associate" && (
              <Card className="rounded-xl border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">My task to-dos</CardTitle>
                  <CardDescription>
                    Tasks you are assigned to across your deals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {associateTodos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No assigned tasks yet.
                    </p>
                  ) : (
                    associateTodos.map(({ deal, task }) => (
                      <div
                        key={`${deal.id}-${task.id}`}
                        className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {deal.company} · {deal.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              task.status === "done"
                                ? "secondary"
                                : task.status === "in_progress"
                                  ? "outline"
                                  : "default"
                            }
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                          {task.status !== "done" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTaskStatus(deal.id, task.id, "done")}
                            >
                              Mark done
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {myDeals.map((deal) => (
                <Card
                  key={deal.id}
                  className={
                    isCurrentDeal(deal)
                      ? "rounded-xl border-emerald-500/60"
                      : "rounded-xl"
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{deal.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {deal.company}
                        </CardDescription>
                      </div>
                      <Badge variant={isCurrentDeal(deal) ? "secondary" : "outline"}>
                        {deal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 pt-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveDeal(deal)}
                    >
                      Open deal details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {tab === "source" && (
          <section className="space-y-6">
            <SectionHeader
              title="Source company"
              description="Submit a company profile with diligence context and notes."
            />
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <form
                  onSubmit={sourceForm.handleSubmit(submitSource)}
                  className="grid gap-6 md:grid-cols-2"
                >
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Company Name *</label>
                    <Input {...sourceForm.register("company_name")} />
                    {sourceForm.formState.errors.company_name && (
                      <p className="text-xs text-destructive">
                        {sourceForm.formState.errors.company_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Website</label>
                    <Input
                      {...sourceForm.register("website")}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Diligence Stage</label>
                    <Input
                      {...sourceForm.register("diligence_stage")}
                      placeholder="Received inquiry / Screening"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Received Inquiry</label>
                    <Input {...sourceForm.register("received_inquiry")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Funding Round</label>
                    <Input {...sourceForm.register("funding_round")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <Input {...sourceForm.register("industry")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Date most recent screening
                    </label>
                    <Input
                      {...sourceForm.register("date_most_recent_screening")}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Accelerator</label>
                    <Input
                      {...sourceForm.register("accelerator")}
                      placeholder="Leave blank if none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <Input {...sourceForm.register("region")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pitch Deck</label>
                    <Input
                      {...sourceForm.register("pitch_deck")}
                      placeholder="Drop files URL or browse link"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating</label>
                    <Input
                      {...sourceForm.register("rating")}
                      placeholder="Integer from -3 to 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fundraise</label>
                    <Input {...sourceForm.register("fundraise")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      One Pager / Due diligence (doc URL)
                    </label>
                    <Input {...sourceForm.register("one_pager_url")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Founder Name</label>
                    <Input {...sourceForm.register("founder_name")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location (City)</label>
                    <Input {...sourceForm.register("location_city")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duke Connection</label>
                    <Input {...sourceForm.register("duke_connection")} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Company Description</label>
                    <Textarea {...sourceForm.register("description")} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea {...sourceForm.register("notes")} />
                  </div>

                  <div className="md:col-span-2">
                    <Button type="submit" className="min-w-36">
                      Submit company
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>
        )}

        {tab === "community" && (
          <section className="space-y-6">
            <SectionHeader
              title="Community"
              description="Directory of alumni, associates, and operating team members."
            />
            <Card className="rounded-xl">
              <CardContent className="space-y-5 pt-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={communitySearch}
                    onChange={(event) => setCommunitySearch(event.target.value)}
                    placeholder="Search contacts..."
                  />
                  <select
                    className="h-10 min-w-56 rounded-md border border-input bg-background px-3 text-sm"
                    value={communityRoleFilter}
                    onChange={(event) => setCommunityRoleFilter(event.target.value)}
                  >
                    <option value="all">All Contacts</option>
                    <option value="associate">Associates</option>
                    <option value="operator">Operating Team</option>
                    <option value="operating_team">Operating Team (Legacy)</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>

                <div className="divide-y rounded-md border">
                  {filteredCommunity.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium leading-tight">{member.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRoleLabel(member.role)}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground sm:text-right">
                        <p>{member.email}</p>
                        <p>{member.phone || "No phone listed"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {tab === "goals" && (
          <section className="space-y-6">
            <SectionHeader
              title="Goals"
              description="FY26 goals visible to associates and editable by operators."
            />
            <div className="space-y-4">
              {goals
                .filter((goal) => goal.annual_goal || goal.status || goal.actions)
                .map((goal) => (
                  <Card key={goal.id} className="rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {goal.annual_goal || "Unlabeled goal"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
                        {accountType === "operator" ? (
                          <Input
                            value={goal.status}
                            onChange={(event) =>
                              setGoals((current) =>
                                current.map((entry) =>
                                  entry.id === goal.id
                                    ? { ...entry, status: event.target.value }
                                    : entry
                                )
                              )
                            }
                          />
                        ) : (
                          <p className="text-sm">{goal.status || "—"}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Focus early 2026
                        </p>
                        {accountType === "operator" ? (
                          <Textarea
                            value={goal.focus_early_2026}
                            onChange={(event) =>
                              setGoals((current) =>
                                current.map((entry) =>
                                  entry.id === goal.id
                                    ? {
                                        ...entry,
                                        focus_early_2026: event.target.value,
                                      }
                                    : entry
                                )
                              )
                            }
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">{goal.focus_early_2026 || "—"}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Actions</p>
                        {accountType === "operator" ? (
                          <Textarea
                            value={goal.actions}
                            onChange={(event) =>
                              setGoals((current) =>
                                current.map((entry) =>
                                  entry.id === goal.id ? { ...entry, actions: event.target.value } : entry
                                )
                              )
                            }
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">{goal.actions || "—"}</p>
                        )}
                      </div>
                      {accountType === "operator" && (
                        <Button size="sm" onClick={() => updateGoalItem(goal)}>
                          Save goal
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        )}

        {tab === "tracking" && (
          <section className="space-y-6">
            <SectionHeader
              title="Tracking"
              description="Airtable tracking data imported for review and updates."
            />
            <div className="space-y-4">
              {tracking
                .filter((item) => item.company)
                .map((item) => (
                  <Card key={item.id} className="rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.company}</CardTitle>
                      <CardDescription>
                        {item.priority || "No priority"} · {item.responsible_party || "No owner"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase text-muted-foreground">
                            Deal stage
                          </p>
                          {accountType === "operator" ? (
                            <Input
                              value={item.deal_stage}
                              onChange={(event) =>
                                setTracking((current) =>
                                  current.map((entry) =>
                                    entry.id === item.id
                                      ? { ...entry, deal_stage: event.target.value }
                                      : entry
                                  )
                                )
                              }
                            />
                          ) : (
                            <p className="text-sm">{item.deal_stage || "—"}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase text-muted-foreground">
                            Volunteers
                          </p>
                          {accountType === "operator" ? (
                            <Input
                              value={item.volunteers_assigned_associates}
                              onChange={(event) =>
                                setTracking((current) =>
                                  current.map((entry) =>
                                    entry.id === item.id
                                      ? {
                                          ...entry,
                                          volunteers_assigned_associates: event.target.value,
                                        }
                                      : entry
                                  )
                                )
                              }
                            />
                          ) : (
                            <p className="text-sm">{item.volunteers_assigned_associates || "—"}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Latest notes
                        </p>
                        <p className="whitespace-pre-wrap text-sm">{item.notes_latest_news || "—"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Tasks / next steps
                        </p>
                        {accountType === "operator" ? (
                          <Textarea
                            value={item.tasks_next_steps}
                            onChange={(event) =>
                              setTracking((current) =>
                                current.map((entry) =>
                                  entry.id === item.id
                                    ? { ...entry, tasks_next_steps: event.target.value }
                                    : entry
                                )
                              )
                            }
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm">{item.tasks_next_steps || "—"}</p>
                        )}
                      </div>
                      {accountType === "operator" && (
                        <Button size="sm" onClick={() => updateTrackingRow(item)}>
                          Save tracking row
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        )}

        {tab === "associate-tracker" && accountType === "operator" && (
          <section className="space-y-6">
            <SectionHeader
              title="Associate tracker"
              description="Open any associate to review their deal activity, current pipeline, and contributions."
            />

            <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Associates</CardTitle>
                  <CardDescription>Click an associate to view full activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {associateMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No associates found.</p>
                  ) : (
                    associateMembers.map((member) => {
                      const dealCount = sortedDeals.filter((deal) =>
                        deal.signed_up_associates.includes(member.id)
                      ).length;
                      const selected = selectedAssociateId === member.id;
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => setSelectedAssociateId(member.id)}
                          className={`w-full rounded-md border p-3 text-left transition-colors ${
                            selected
                              ? "border-primary bg-muted"
                              : "border-border hover:bg-muted/60"
                          }`}
                        >
                          <p className="text-sm font-medium">{member.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email} · {dealCount} deal{dealCount === 1 ? "" : "s"}
                          </p>
                        </button>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {selectedAssociate ? selectedAssociate.full_name : "Select an associate"}
                  </CardTitle>
                  <CardDescription>
                    {selectedAssociate
                      ? "Equivalent to their My Deals view, including current/past deals and contribution signals."
                      : "Choose an associate from the list to view detailed stats and contributions."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedAssociate ? (
                    <p className="text-sm text-muted-foreground">
                      No associate selected yet.
                    </p>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <StatCard label="Sourced" value={selectedAssociateStats.sourced} />
                        <StatCard label="Screened" value={selectedAssociateStats.screened} />
                        <StatCard
                          label="Due diligence"
                          value={selectedAssociateStats.diligence}
                        />
                        <StatCard label="Memos written" value={selectedAssociateStats.memos} />
                        <StatCard label="Invested" value={selectedAssociateStats.invested} />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <StatCard
                          label="Updates authored"
                          value={selectedAssociateContributionMetrics.updatesAuthored}
                        />
                        <StatCard
                          label="Tasks assigned"
                          value={selectedAssociateContributionMetrics.tasksAssigned}
                        />
                        <StatCard
                          label="Tasks completed"
                          value={selectedAssociateContributionMetrics.tasksCompleted}
                        />
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Current deals</h3>
                        {selectedAssociateCurrentDeals.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No active deals for this associate.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {selectedAssociateCurrentDeals.map((deal) => (
                              <div
                                key={deal.id}
                                className="rounded-md border border-border p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-medium">{deal.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {deal.company}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">{deal.status}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Past deals</h3>
                        {selectedAssociatePastDeals.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No closed deals yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {selectedAssociatePastDeals.map((deal) => (
                              <div
                                key={deal.id}
                                className="rounded-md border border-border p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-medium">{deal.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {deal.company}
                                    </p>
                                  </div>
                                  <Badge variant="outline">{deal.status}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        <Dialog open={!!activeDeal} onOpenChange={(open) => !open && setActiveDeal(null)}>
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl">{activeDeal?.title}</DialogTitle>
              <DialogDescription className="pt-1">{activeDeal?.company}</DialogDescription>
            </DialogHeader>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {activeDeal?.description}
              </p>

              <div className="grid gap-2 rounded-md border p-3 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-medium">Deal stage:</span>{" "}
                  {activeDeal?.sheet.deal_stage || "—"}
                </p>
                <p>
                  <span className="font-medium">Deal lead:</span>{" "}
                  {activeDeal?.sheet.deal_lead || "—"}
                </p>
                <p>
                  <span className="font-medium">Timeline:</span>{" "}
                  {activeDeal?.sheet.timeline || "—"}
                </p>
                <p>
                  <span className="font-medium">Terms:</span>{" "}
                  {activeDeal?.sheet.terms || "—"}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium">Latest updates:</span>{" "}
                  {activeDeal?.sheet.latest_updates || "—"}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium">Next steps:</span>{" "}
                  {activeDeal?.sheet.next_steps || "—"}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium">Volunteers:</span>{" "}
                  {activeDeal?.sheet.volunteers || "—"}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Tasks / next steps</h3>
                <div className="space-y-2 rounded-md border p-3">
                  {activeDeal?.tasks.length ? (
                    activeDeal.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="space-y-2 rounded-md border p-3 text-sm"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-0.5">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-muted-foreground">
                              {task.details || "No details"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              task.status === "done"
                                ? "secondary"
                                : task.status === "in_progress"
                                  ? "outline"
                                  : "default"
                            }
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Due: {task.due_date || "Not set"} · Assigned:{" "}
                          {task.assigned_associate_ids.length || 0}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {accountType === "associate" &&
                            !task.assigned_associate_ids.includes(userId) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  signUpForTaskInDeal(activeDeal!.id, task.id)
                                }
                              >
                                Sign up for task
                              </Button>
                            )}
                          {accountType === "operator" && (
                            <>
                              <select
                                className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                                defaultValue=""
                                onChange={(event) => {
                                  const value = event.target.value;
                                  if (value) {
                                    assignTaskToAssociate(activeDeal!.id, task.id, value);
                                    event.currentTarget.value = "";
                                  }
                                }}
                              >
                                <option value="">Assign associate...</option>
                                {associateMembers.map((member) => (
                                  <option key={member.id} value={member.id}>
                                    {member.full_name}
                                  </option>
                                ))}
                              </select>
                              <select
                                className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                                value={task.status}
                                onChange={(event) =>
                                  setTaskStatus(
                                    activeDeal!.id,
                                    task.id,
                                    event.target.value as DealTask["status"]
                                  )
                                }
                              >
                                <option value="todo">todo</option>
                                <option value="in_progress">in progress</option>
                                <option value="done">done</option>
                              </select>
                            </>
                          )}
                          {accountType === "associate" &&
                            task.assigned_associate_ids.includes(userId) &&
                            task.status !== "done" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setTaskStatus(activeDeal!.id, task.id, "done")
                                }
                              >
                                Mark done
                              </Button>
                            )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tasks yet.
                    </p>
                  )}

                  {accountType === "operator" && activeDeal && (
                    <div className="space-y-2 rounded-md border border-dashed p-3">
                      <p className="text-sm font-medium">Create task</p>
                      <Input
                        placeholder="Task title"
                        value={newTaskTitle}
                        onChange={(event) => setNewTaskTitle(event.target.value)}
                      />
                      <Textarea
                        placeholder="Task details"
                        value={newTaskDetails}
                        onChange={(event) => setNewTaskDetails(event.target.value)}
                      />
                      <Input
                        placeholder="Due date (optional)"
                        value={newTaskDueDate}
                        onChange={(event) => setNewTaskDueDate(event.target.value)}
                      />
                      <Button size="sm" onClick={createTask}>
                        Add task
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Progress updates</h3>
                <div className="max-h-60 space-y-2.5 overflow-auto rounded-md border p-3">
                  {activeDeal?.updates.length ? (
                    [...activeDeal.updates]
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((update) => (
                        <div key={update.id} className="space-y-1.5 rounded-md border p-3 text-sm">
                          <p className="font-medium">{update.stage}</p>
                          <p className="text-muted-foreground">{update.note || "No note"}</p>
                          <p className="text-xs text-muted-foreground">
                            {update.author_name} · {new Date(update.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No updates yet.</p>
                  )}
                </div>
              </div>

              {(accountType === "operator" ||
                activeDeal?.signed_up_associates.includes(userId)) && (
                <form
                  onSubmit={updateForm.handleSubmit(submitUpdate)}
                  className="space-y-3 rounded-md border p-4"
                >
                  <h3 className="text-sm font-semibold">Post update</h3>
                  <Input
                    placeholder="Stage (screened, DD, memo, first meeting...)"
                    {...updateForm.register("stage")}
                  />
                  <Textarea placeholder="Details" {...updateForm.register("note")} />
                  <Button type="submit" size="sm">
                    Submit update
                  </Button>
                </form>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
