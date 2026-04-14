import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/get-user";
import { getAllAssociates, getAssociateStats, getAssociateDeals } from "@/lib/store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const associates = getAllAssociates().map((a) => ({
    ...a,
    stats: getAssociateStats(a.id),
    deals: getAssociateDeals(a.id),
  }));

  return NextResponse.json(associates);
}
