import {
  Deal,
  SourcedCompany,
  UserProfile,
  AssociateStats,
  DealProgressUpdate,
  CommunityMember,
  DealTask,
  DealSheetFields,
} from "./types";

// In-memory mock store (replace with Supabase tables in production)

const users: UserProfile[] = [];

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

const deals: Deal[] = [
  {
    id: "1",
    title: "Series A Investment",
    company: "TechCo Inc.",
    description: "Series A round for an AI startup focused on healthcare.",
    status: "in_progress",
    created_by: "system",
    created_by_name: "Operating Team",
    created_at: new Date().toISOString(),
    signed_up_associates: [],
    updates: [
      {
        id: "1-1",
        deal_id: "1",
        author_id: "system",
        author_name: "Operating Team",
        stage: "Received inquiry",
        note: "Intro email received from founder. High-level fit looks promising.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      },
      {
        id: "1-2",
        deal_id: "1",
        author_id: "system",
        author_name: "Aiden Suganuma",
        stage: "Screening call",
        note: "Completed first screening call and captured key GTM risks to validate.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      {
        id: "1-3",
        deal_id: "1",
        author_id: "system",
        author_name: "Alex Boniske",
        stage: "DD in progress",
        note: "Drafted one-pager and started diligence doc on customer retention assumptions.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
    ],
    tasks: [
      {
        id: "1-task-1",
        title: "Request latest investor update",
        details: "Reach out and ask them to send the latest investor update details.",
        status: "todo",
        due_date: "",
        created_by: "system",
        created_by_name: "Operating Team",
        assigned_associate_ids: [],
      },
    ],
    sheet: {
      ...emptySheetFields(),
      deal_stage: "Investment Opportunity",
      latest_updates: "DL: Reach out - have them send the latest investor update (in details).",
      next_steps: "DL: Follow up on investor update details and timeline.",
    },
  },
  {
    id: "2",
    title: "Seed Round Due Diligence",
    company: "GreenEnergy Corp",
    description: "Seed round for a clean energy company.",
    status: "open",
    created_by: "system",
    created_by_name: "Operating Team",
    created_at: new Date().toISOString(),
    signed_up_associates: [],
    updates: [],
    tasks: [],
    sheet: {
      ...emptySheetFields(),
      deal_stage: "6. Tracking - In 2 weeks",
      column_14: "Investment Opportunity",
      latest_updates:
        "1/20: Clarify board representation and expanded SAFE pro-rata expectations.",
      next_steps:
        "DN: Send email to June. DL: Ask rationale for round expansion. DL: Ask Matt Dixon on pro-rata.",
    },
  },
  {
    id: "3",
    title: "Growth Equity Review",
    company: "FinServ Solutions",
    description: "Growth equity opportunity in fintech space.",
    status: "in_progress",
    created_by: "system",
    created_by_name: "Operating Team",
    created_at: new Date().toISOString(),
    signed_up_associates: [],
    updates: [],
    tasks: [],
    sheet: {
      ...emptySheetFields(),
      deal_stage: "6. Tracking - In 2 weeks",
      column_14: "Investment Opportunity",
      latest_updates:
        "Need updated 2025 financials and follow-up clarification from Justin.",
      next_steps:
        "DN: finalize investor email and follow up on clarifications.",
    },
  },
  {
    id: "4",
    title: "Bridge Round Closing",
    company: "Zoo.dev",
    description: "Bridge round prior to Series A.",
    status: "in_progress",
    created_by: "system",
    created_by_name: "Operating Team",
    created_at: new Date().toISOString(),
    signed_up_associates: [],
    updates: [],
    tasks: [
      {
        id: "4-task-1",
        title: "Send wire reminders",
        details: "Send reminder to pending investors before wire deadline.",
        status: "in_progress",
        due_date: "",
        created_by: "system",
        created_by_name: "Operating Team",
        assigned_associate_ids: [],
      },
    ],
    sheet: {
      ...emptySheetFields(),
      column_1: "New Company",
      deal_stage: "2. Closing",
      column_14: "Investment Opportunity",
      deal_lead: "?",
      terms: "Bridge round prior to Series A, valuation $175M",
      timeline: "March",
      latest_updates: "Missing some wires; continue follow-ups through closing window.",
      next_steps:
        "Wire tomorrow/Wednesday. After wire, thank David Price for intro.",
      volunteers: "Karan, Chris, A'nna, Lauren L., Utkarsh",
    },
  },
  {
    id: "5",
    title: "Secondary Option Review",
    company: "Fluidstack",
    description: "SAFE / Secondary option closing process.",
    status: "in_progress",
    created_by: "system",
    created_by_name: "Operating Team",
    created_at: new Date().toISOString(),
    signed_up_associates: [],
    updates: [],
    tasks: [],
    sheet: {
      ...emptySheetFields(),
      column_1: "Portfolio Company",
      deal_stage: "2. Closing",
      column_14: "Secondary Option",
      deal_lead: "DN/DL",
      terms: "SAFE/Secondary option",
      timeline: "Wire by 31st",
      latest_updates: "Confirm KYC completion and finalize wire instructions.",
      next_steps: "DL: Confirm wire instructions and wire today.",
      volunteers: "Evelyn, Matt, Tehseen, Chris",
    },
  },
];

const sourcedCompanies: SourcedCompany[] = [];

const associateStats: Record<string, AssociateStats> = {};
const communitySeed: CommunityMember[] = [
  {
    id: "community-1",
    full_name: "Aiden Suganuma",
    email: "aiden.suganuma@duke.edu",
    phone: "5716452655",
    role: "associate",
  },
  {
    id: "community-2",
    full_name: "Alex Boniske",
    email: "alex.boniske@duke.edu",
    phone: "8287673137",
    role: "associate",
  },
  {
    id: "community-3",
    full_name: "Alex Chindris",
    email: "alex.chindris@duke.edu",
    phone: "9048644252",
    role: "alumni",
  },
];

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
