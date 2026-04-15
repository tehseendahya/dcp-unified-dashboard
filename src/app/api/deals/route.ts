import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/get-user";
import {
  getDeals,
  createDeal,
  signUpForDeal,
  addDealUpdate,
  addDealTask,
  signUpForTask,
  assignAssociateToTask,
  updateTaskStatus,
  getOrCreateUser,
} from "@/lib/store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(getDeals());
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  getOrCreateUser(user.id, user.email, user.full_name, user.account_type);

  if (body.action === "signup") {
    const deal = signUpForDeal(body.dealId, user.id);
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    return NextResponse.json(deal);
  }

  if (body.action === "update") {
    const deal = addDealUpdate(body.dealId, {
      author_id: user.id,
      author_name: user.full_name,
      stage: body.stage,
      note: body.note || "",
    });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    return NextResponse.json(deal);
  }

  if (body.action === "create_task") {
    const deal = addDealTask(body.dealId, {
      title: body.title,
      details: body.details || "",
      status: "todo",
      due_date: body.due_date || "",
      created_by: user.id,
      created_by_name: user.full_name,
    });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    return NextResponse.json(deal);
  }

  if (body.action === "task_signup") {
    const deal = signUpForTask(body.dealId, body.taskId, user.id);
    if (!deal) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(deal);
  }

  if (body.action === "task_assign") {
    if (user.account_type !== "operator") {
      return NextResponse.json({ error: "Only operators can assign tasks" }, { status: 403 });
    }
    const deal = assignAssociateToTask(body.dealId, body.taskId, body.associateId);
    if (!deal) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(deal);
  }

  if (body.action === "task_status") {
    const deal = updateTaskStatus(body.dealId, body.taskId, body.status);
    if (!deal) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(deal);
  }

  const deal = createDeal({
    title: body.title,
    company: body.company,
    description: body.description,
    status: "open",
    created_by: user.id,
    created_by_name: user.full_name,
    sheet: body.sheet,
  });

  return NextResponse.json(deal);
}
