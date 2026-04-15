import { NextResponse } from "next/server";

import { getAuthUser } from "@/lib/get-user";
import { getGoals, updateGoal } from "@/lib/store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getGoals());
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.account_type !== "operator") {
    return NextResponse.json({ error: "Only operators can edit goals" }, { status: 403 });
  }

  const body = await request.json();
  const goal = updateGoal(body.goalId, {
    status: body.status || "",
    focus_early_2026: body.focus_early_2026 || "",
    actions: body.actions || "",
  });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  return NextResponse.json(goal);
}
