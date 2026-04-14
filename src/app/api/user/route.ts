import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getOrCreateUser, getAssociateStats, getAssociateDeals } from "@/lib/store";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accountType = user.user_metadata?.account_type || "associate";
  const fullName = user.user_metadata?.full_name || user.email || "Unknown";

  const profile = getOrCreateUser(user.id, user.email || "", fullName, accountType);
  const stats = getAssociateStats(user.id);
  const deals = getAssociateDeals(user.id);

  return NextResponse.json({ profile, stats, deals });
}
