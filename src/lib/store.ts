import { Deal, SourcedCompany, UserProfile, AssociateStats } from "./types";

// In-memory mock store (replace with Supabase tables in production)

const users: UserProfile[] = [];

const deals: Deal[] = [
  {
    id: "1",
    title: "Series A Investment",
    company: "TechCo Inc.",
    description: "Series A round for an AI startup focused on healthcare.",
    status: "open",
    created_by: "system",
    created_by_name: "Operating Team",
    created_at: new Date().toISOString(),
    signed_up_associates: [],
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
  },
];

const sourcedCompanies: SourcedCompany[] = [];

const associateStats: Record<string, AssociateStats> = {};

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

export function createDeal(deal: Omit<Deal, "id" | "created_at" | "signed_up_associates">): Deal {
  const newDeal: Deal = {
    ...deal,
    id: String(deals.length + 1),
    created_at: new Date().toISOString(),
    signed_up_associates: [],
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
