import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAllAssociates, getAssociateStats, getAssociateDeals } from "@/lib/store";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const associates = getAllAssociates().map((a) => ({
    ...a,
    stats: getAssociateStats(a.id),
    deals: getAssociateDeals(a.id),
  }));

  return NextResponse.json(associates);
}
