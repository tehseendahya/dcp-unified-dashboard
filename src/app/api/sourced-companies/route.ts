import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import {
  getSourcedCompanies,
  addSourcedCompany,
  getOrCreateUser,
} from "@/lib/store";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(getSourcedCompanies());
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const fullName = user.user_metadata?.full_name || user.email || "Unknown";
  const accountType = user.user_metadata?.account_type || "associate";

  getOrCreateUser(user.id, user.email || "", fullName, accountType);

  const company = addSourcedCompany({
    company_name: body.company_name,
    website: body.website || "",
    description: body.description,
    submitted_by: user.id,
    submitted_by_name: fullName,
  });

  return NextResponse.json(company);
}
