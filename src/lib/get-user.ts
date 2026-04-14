import { cookies } from "next/headers";
import { isDemoMode, parseDemoUserFromCookie, DemoUser } from "./demo";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  account_type: "associate" | "operator";
}

export async function getAuthUser(): Promise<AuthUser | null> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    const raw = cookieStore.get("demo_user")?.value;
    const demoUser: DemoUser | null = parseDemoUserFromCookie(raw);
    if (!demoUser) return null;
    return {
      id: demoUser.id,
      email: demoUser.email,
      full_name: demoUser.full_name,
      account_type: demoUser.account_type,
    };
  }

  // Supabase mode
  const { createClient } = await import("./supabase-server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || "",
    full_name: user.user_metadata?.full_name || user.email || "Unknown",
    account_type: user.user_metadata?.account_type || "associate",
  };
}
