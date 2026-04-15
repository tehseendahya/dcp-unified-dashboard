import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/get-user";
import { getTrackingItems, updateTrackingItem } from "@/lib/store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getTrackingItems());
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.account_type !== "operator") {
    return NextResponse.json({ error: "Only operators can edit tracking rows" }, { status: 403 });
  }

  const body = await request.json();
  const item = updateTrackingItem(body.trackingId, {
    deal_stage: body.deal_stage || "",
    tasks_next_steps: body.tasks_next_steps || "",
    volunteers_assigned_associates: body.volunteers_assigned_associates || "",
  });
  if (!item) return NextResponse.json({ error: "Tracking row not found" }, { status: 404 });
  return NextResponse.json(item);
}
