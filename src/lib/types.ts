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
  updates: DealProgressUpdate[];
  tasks: DealTask[];
  sheet: DealSheetFields;
}

export interface DealProgressUpdate {
  id: string;
  deal_id: string;
  author_id: string;
  author_name: string;
  stage: string;
  note: string;
  created_at: string;
}

export interface DealTask {
  id: string;
  title: string;
  details: string;
  status: "todo" | "in_progress" | "done";
  due_date: string;
  created_by: string;
  created_by_name: string;
  assigned_associate_ids: string[];
}

export interface DealSheetFields {
  column_1: string;
  deal_stage: string;
  column_14: string;
  deal_lead: string;
  investors: string;
  terms: string;
  timeline: string;
  latest_updates: string;
  associates_update: string;
  next_steps: string;
  volunteers: string;
}

export interface SourcedCompany {
  id: string;
  company_name: string;
  website: string;
  description: string;
  diligence_stage: string;
  received_inquiry: string;
  funding_round: string;
  industry: string;
  date_most_recent_screening: string;
  accelerator: string;
  region: string;
  pitch_deck: string;
  rating: number | null;
  notes: string;
  fundraise: string;
  one_pager_url: string;
  founder_name: string;
  location_city: string;
  duke_connection: string;
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

export interface CommunityMember {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: "associate" | "operator" | "alumni" | "operating_team";
}

export interface GoalItem {
  id: string;
  annual_goal: string;
  status: string;
  focus_early_2026: string;
  actions: string;
}

export interface TrackingItem {
  id: string;
  company: string;
  column_1: string;
  deal_stage: string;
  priority: string;
  responsible_party: string;
  dcp_pitch: string;
  investors: string;
  terms: string;
  timeline: string;
  notes_latest_news: string;
  tasks_next_steps: string;
  volunteers_assigned_associates: string;
  dd_team: string;
  column_3: string;
}
