import {
  Deal,
  SourcedCompany,
  UserProfile,
  AssociateStats,
  DealProgressUpdate,
  CommunityMember,
  DealTask,
  DealSheetFields,
  GoalItem,
  TrackingItem,
} from "./types";

import fs from "node:fs";

const users: UserProfile[] = [];

const DEAL_TRACKER_PATH =
  "/Users/tehseen/Downloads/DCP Associates Meeting - Deal Progress Tracker  - Deal Progress Tracker.csv";
const GOALS_PATH =
  "/Users/tehseen/Downloads/DCP Associates Meeting - Deal Progress Tracker  - DCP - Goals 2025.csv";
const TRACKING_PATH =
  "/Users/tehseen/Downloads/DCP Associates Meeting - Deal Progress Tracker  - To update Airtable - Tracking .csv";

function emptySheetFields(): DealSheetFields {
  return {
    column_1: "",
    deal_stage: "",
    column_14: "",
    deal_lead: "",
    investors: "",
    terms: "",
    timeline: "",
    latest_updates: "",
    associates_update: "",
    next_steps: "",
    volunteers: "",
  };
}

function parseCsvRows(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const next = raw[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

function readCsv(path: string): string[][] {
  if (!fs.existsSync(path)) return [];
  return parseCsvRows(fs.readFileSync(path, "utf8"));
}

function splitNames(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^and\s+/i, ""))
    .filter((entry) => entry && entry !== "?" && !entry.toLowerCase().includes("maybe"));
}

function statusFromStage(stage: string): Deal["status"] {
  const normalized = stage.toLowerCase();
  if (normalized.includes("closed") || normalized.includes("passing") || normalized.includes("pass")) {
    return "closed";
  }
  if (
    normalized.includes("active") ||
    normalized.includes("screen") ||
    normalized.includes("tracking") ||
    normalized.includes("closing") ||
    normalized.includes("dd")
  ) {
    return "in_progress";
  }
  return "open";
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ImportedData = {
  deals: Deal[];
  goals: GoalItem[];
  tracking: TrackingItem[];
  associates: CommunityMember[];
};

function importCsvData(): ImportedData {
  const dealRows = readCsv(DEAL_TRACKER_PATH);
  const goalsRows = readCsv(GOALS_PATH);
  const trackingRows = readCsv(TRACKING_PATH);

  const associateNames = new Set<string>();
  const deals: Deal[] = [];

  for (let i = 1; i < dealRows.length; i += 1) {
    const row = dealRows[i];
    const company = row[0] || "";
    if (!company) continue;

    const volunteers = row[11] || "";
    const ddTeam = row[12] || "";
    const dealStage = row[2] || "";
    const latestUpdates = row[8] || "";
    const nextSteps = row[10] || "";

    const combinedNames = [...splitNames(volunteers), ...splitNames(ddTeam)];
    for (const name of combinedNames) {
      associateNames.add(name);
    }

    const updateNote = latestUpdates.split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
    const nextStepLines = nextSteps
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const tasks: DealTask[] = nextStepLines.map((line, index) => ({
      id: `import-task-${i}-${index + 1}`,
      title: line.slice(0, 120),
      details: line,
      status: "todo",
      due_date: "",
      created_by: "system",
      created_by_name: "Operating Team",
      assigned_associate_ids: [],
    }));

    deals.push({
      id: String(i),
      title: company,
      company,
      description:
        row[6] || row[9] || row[8] || "Imported from Deal Progress Tracker.",
      status: statusFromStage(dealStage),
      created_by: "system",
      created_by_name: "Operating Team",
      created_at: new Date().toISOString(),
      signed_up_associates: [],
      updates: updateNote
        ? [
            {
              id: `import-update-${i}`,
              deal_id: String(i),
              author_id: "system",
              author_name: "Operating Team",
              stage: dealStage || "Update",
              note: updateNote,
              created_at: new Date().toISOString(),
            },
          ]
        : [],
      tasks,
      sheet: {
        column_1: row[1] || "",
        deal_stage: dealStage,
        column_14: row[3] || "",
        deal_lead: row[4] || "",
        investors: row[5] || "",
        terms: row[6] || "",
        timeline: row[7] || "",
        latest_updates: latestUpdates,
        associates_update: row[9] || "",
        next_steps: nextSteps,
        volunteers,
      },
    });
  }

  const associates: CommunityMember[] = [...associateNames].map((fullName) => {
    const slug = createSlug(fullName || "associate");
    return {
      id: `associate-${slug}`,
      full_name: fullName,
      email: `${slug}@dcp.local`,
      phone: "",
      role: "associate",
    };
  });

  const associateByName = new Map<string, string>();
  for (const associate of associates) {
    associateByName.set(associate.full_name.toLowerCase(), associate.id);
  }

  for (const deal of deals) {
    const names = [
      ...splitNames(deal.sheet.volunteers),
      ...splitNames((deal as Deal).sheet.associates_update),
    ];
    const ids = names
      .map((name) => associateByName.get(name.toLowerCase()))
      .filter((id): id is string => Boolean(id));
    deal.signed_up_associates = [...new Set(ids)];
  }

  const goals: GoalItem[] = goalsRows.slice(1).map((row, index) => ({
    id: `goal-${index + 1}`,
    annual_goal: row[0] || "",
    status: row[1] || "",
    focus_early_2026: row[2] || "",
    actions: row[3] || "",
  }));

  const tracking: TrackingItem[] = trackingRows.slice(1).map((row, index) => ({
    id: `tracking-${index + 1}`,
    company: row[0] || "",
    column_1: row[1] || "",
    deal_stage: row[2] || "",
    priority: row[3] || "",
    responsible_party: row[4] || "",
    dcp_pitch: row[5] || "",
    investors: row[6] || "",
    terms: row[7] || "",
    timeline: row[8] || "",
    notes_latest_news: row[9] || "",
    tasks_next_steps: row[10] || "",
    volunteers_assigned_associates: row[11] || "",
    dd_team: row[12] || "",
    column_3: row[13] || "",
  }));

  return { deals, goals, tracking, associates };
}

const imported = importCsvData();
const deals: Deal[] = imported.deals;
const goals: GoalItem[] = imported.goals;
const trackingItems: TrackingItem[] = imported.tracking;

const sourcedCompanies: SourcedCompany[] = [];

const associateStats: Record<string, AssociateStats> = {};
const communitySeed: CommunityMember[] = imported.associates;

function getDefaultStats(): AssociateStats {
  return {
    weekly_meetings_attended: 12,
    companies_sourced: 8,
    companies_screened: 5,
    dd_reports_written: 3,
    companies_invested: 1,
  };
}

export function getOrCreateUser(
  id: string,
  email: string,
  full_name: string,
  account_type: "associate" | "operator"
): UserProfile {
  let user = users.find((u) => u.id === id);
  if (!user) {
    user = {
      id,
      email,
      full_name,
      account_type,
      created_at: new Date().toISOString(),
    };
    users.push(user);
    associateStats[id] = getDefaultStats();
  }
  return user;
}

export function getUserProfile(id: string): UserProfile | undefined {
  return users.find((u) => u.id === id);
}

export function getAllAssociates(): UserProfile[] {
  return users.filter((u) => u.account_type === "associate");
}

export function getDeals(): Deal[] {
  return deals;
}

export function getDeal(id: string): Deal | undefined {
  return deals.find((d) => d.id === id);
}

export function createDeal(
  deal: Omit<Deal, "id" | "created_at" | "signed_up_associates" | "updates" | "tasks" | "sheet"> & {
    updates?: DealProgressUpdate[];
    tasks?: DealTask[];
    sheet?: DealSheetFields;
  }
): Deal {
  const newDeal: Deal = {
    ...deal,
    id: String(deals.length + 1),
    created_at: new Date().toISOString(),
    signed_up_associates: [],
    updates: deal.updates ?? [],
    tasks: deal.tasks ?? [],
    sheet: deal.sheet ?? emptySheetFields(),
  };
  deals.push(newDeal);
  return newDeal;
}

export function signUpForDeal(dealId: string, userId: string): Deal | undefined {
  const deal = deals.find((d) => d.id === dealId);
  if (deal && !deal.signed_up_associates.includes(userId)) {
    deal.signed_up_associates.push(userId);
  }
  return deal;
}

export function addDealUpdate(
  dealId: string,
  update: Omit<DealProgressUpdate, "id" | "deal_id" | "created_at">
): Deal | undefined {
  const deal = deals.find((entry) => entry.id === dealId);
  if (!deal) {
    return undefined;
  }

  deal.updates.push({
    ...update,
    id: `${dealId}-${deal.updates.length + 1}`,
    deal_id: dealId,
    created_at: new Date().toISOString(),
  });

  const lowered = update.stage.toLowerCase();
  if (lowered.includes("invest")) {
    deal.status = "closed";
  } else if (lowered.includes("screen") || lowered.includes("dd") || lowered.includes("memo")) {
    deal.status = "in_progress";
  }

  return deal;
}

export function addDealTask(
  dealId: string,
  task: Omit<DealTask, "id" | "assigned_associate_ids">
): Deal | undefined {
  const deal = deals.find((entry) => entry.id === dealId);
  if (!deal) {
    return undefined;
  }

  deal.tasks.push({
    ...task,
    id: `${dealId}-task-${deal.tasks.length + 1}`,
    assigned_associate_ids: [],
  });
  return deal;
}

export function signUpForTask(dealId: string, taskId: string, userId: string): Deal | undefined {
  const deal = deals.find((entry) => entry.id === dealId);
  if (!deal) {
    return undefined;
  }

  const task = deal.tasks.find((entry) => entry.id === taskId);
  if (!task) {
    return undefined;
  }

  if (!task.assigned_associate_ids.includes(userId)) {
    task.assigned_associate_ids.push(userId);
  }
  if (!deal.signed_up_associates.includes(userId)) {
    deal.signed_up_associates.push(userId);
  }
  return deal;
}

export function assignAssociateToTask(
  dealId: string,
  taskId: string,
  associateId: string
): Deal | undefined {
  const deal = deals.find((entry) => entry.id === dealId);
  if (!deal) {
    return undefined;
  }

  const task = deal.tasks.find((entry) => entry.id === taskId);
  if (!task) {
    return undefined;
  }

  if (!task.assigned_associate_ids.includes(associateId)) {
    task.assigned_associate_ids.push(associateId);
  }
  if (!deal.signed_up_associates.includes(associateId)) {
    deal.signed_up_associates.push(associateId);
  }
  return deal;
}

export function updateTaskStatus(
  dealId: string,
  taskId: string,
  status: DealTask["status"]
): Deal | undefined {
  const deal = deals.find((entry) => entry.id === dealId);
  if (!deal) {
    return undefined;
  }
  const task = deal.tasks.find((entry) => entry.id === taskId);
  if (!task) {
    return undefined;
  }
  task.status = status;
  return deal;
}

export function getSourcedCompanies(): SourcedCompany[] {
  return sourcedCompanies;
}

export function addSourcedCompany(
  company: Omit<SourcedCompany, "id" | "submitted_at" | "status">
): SourcedCompany {
  const newCompany: SourcedCompany = {
    ...company,
    id: String(sourcedCompanies.length + 1),
    submitted_at: new Date().toISOString(),
    status: "submitted",
  };
  sourcedCompanies.push(newCompany);
  return newCompany;
}

export function getAssociateStats(userId: string): AssociateStats {
  return associateStats[userId] || getDefaultStats();
}

export function getAssociateDeals(userId: string): Deal[] {
  return deals.filter((d) => d.signed_up_associates.includes(userId));
}

export function getGoals(): GoalItem[] {
  return goals;
}

export function updateGoal(
  goalId: string,
  updates: Pick<GoalItem, "status" | "focus_early_2026" | "actions">
): GoalItem | undefined {
  const goal = goals.find((entry) => entry.id === goalId);
  if (!goal) return undefined;
  goal.status = updates.status;
  goal.focus_early_2026 = updates.focus_early_2026;
  goal.actions = updates.actions;
  return goal;
}

export function getTrackingItems(): TrackingItem[] {
  return trackingItems;
}

export function updateTrackingItem(
  trackingId: string,
  updates: Pick<TrackingItem, "deal_stage" | "tasks_next_steps" | "volunteers_assigned_associates">
): TrackingItem | undefined {
  const row = trackingItems.find((entry) => entry.id === trackingId);
  if (!row) return undefined;
  row.deal_stage = updates.deal_stage;
  row.tasks_next_steps = updates.tasks_next_steps;
  row.volunteers_assigned_associates = updates.volunteers_assigned_associates;
  return row;
}

export function getCommunityMembers(): CommunityMember[] {
  const usersAsMembers: CommunityMember[] = users.map((user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: "",
    role: user.account_type === "operator" ? "operator" : "associate",
  }));

  const combined = [...communitySeed, ...usersAsMembers];
  const uniqueByEmail = new Map<string, CommunityMember>();
  for (const member of combined) {
    uniqueByEmail.set(member.email, member);
  }
  return [...uniqueByEmail.values()];
}
