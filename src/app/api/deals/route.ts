import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import {
  getDeals,
  createDeal,
  signUpForDeal,
  getOrCreateUser,
} from "@/lib/store";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(getDeals());
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const accountType = user.user_metadata?.account_type || "associate";
  const fullName = user.user_metadata?.full_name || user.email || "Unknown";

  // Ensure user exists in store
  getOrCreateUser(user.id, user.email || "", fullName, accountType);

  if (body.action === "signup") {
    const deal = signUpForDeal(body.dealId, user.id);
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    return NextResponse.json(deal);
  }

  // Create deal
  const deal = createDeal({
    title: body.title,
    company: body.company,
    description: body.description,
    status: "open",
    created_by: user.id,
    created_by_name: fullName,
  });

  return NextResponse.json(deal);
}
