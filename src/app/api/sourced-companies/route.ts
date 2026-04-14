import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/get-user";
import {
  getSourcedCompanies,
  addSourcedCompany,
  getOrCreateUser,
} from "@/lib/store";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(getSourcedCompanies());
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  getOrCreateUser(user.id, user.email, user.full_name, user.account_type);

  const company = addSourcedCompany({
    company_name: body.company_name,
    website: body.website || "",
    description: body.description,
    submitted_by: user.id,
    submitted_by_name: user.full_name,
  });

  return NextResponse.json(company);
}
