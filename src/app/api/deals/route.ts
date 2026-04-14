import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/get-user";
import {
  getDeals,
  createDeal,
  signUpForDeal,
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

  const deal = createDeal({
    title: body.title,
    company: body.company,
    description: body.description,
    status: "open",
    created_by: user.id,
    created_by_name: user.full_name,
  });

  return NextResponse.json(deal);
}
