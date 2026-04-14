import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/get-user";
import { getOrCreateUser, getAssociateStats, getAssociateDeals } from "@/lib/store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = getOrCreateUser(user.id, user.email, user.full_name, user.account_type);
  const stats = getAssociateStats(user.id);
  const deals = getAssociateDeals(user.id);

  return NextResponse.json({ profile, stats, deals });
}
