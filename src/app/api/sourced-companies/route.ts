import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/get-user";
import {
  getSourcedCompanies,
  addSourcedCompany,
  getOrCreateUser,
} from "@/lib/store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(getSourcedCompanies());
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  getOrCreateUser(user.id, user.email, user.full_name, user.account_type);

  const company = addSourcedCompany({
    company_name: body.company_name,
    website: body.website || "",
    description: body.description || "",
    diligence_stage: body.diligence_stage || "",
    received_inquiry: body.received_inquiry || "",
    funding_round: body.funding_round || "",
    industry: body.industry || "",
    date_most_recent_screening: body.date_most_recent_screening || "",
    accelerator: body.accelerator || "",
    region: body.region || "",
    pitch_deck: body.pitch_deck || "",
    rating:
      typeof body.rating === "number" && Number.isInteger(body.rating)
        ? body.rating
        : null,
    notes: body.notes || "",
    fundraise: body.fundraise || "",
    one_pager_url: body.one_pager_url || "",
    founder_name: body.founder_name || "",
    location_city: body.location_city || "",
    duke_connection: body.duke_connection || "",
    submitted_by: user.id,
    submitted_by_name: user.full_name,
  });

  return NextResponse.json(company);
}
