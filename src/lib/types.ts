export type AccountType = "associate" | "operator";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  account_type: AccountType;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  created_by: string;
  created_by_name: string;
  created_at: string;
  signed_up_associates: string[];
}

export interface SourcedCompany {
  id: string;
  company_name: string;
  website: string;
  description: string;
  submitted_by: string;
  submitted_by_name: string;
  submitted_at: string;
  status: "submitted" | "screening" | "screened" | "passed";
}

export interface AssociateStats {
  weekly_meetings_attended: number;
  companies_sourced: number;
  companies_screened: number;
  dd_reports_written: number;
  companies_invested: number;
}
