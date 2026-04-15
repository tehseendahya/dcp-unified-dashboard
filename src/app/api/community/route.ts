import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/get-user";
import { getCommunityMembers, getOrCreateUser } from "@/lib/store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  getOrCreateUser(user.id, user.email, user.full_name, user.account_type);
  return NextResponse.json(getCommunityMembers());
}
