export function isDemoMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url"
  );
}

export interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  account_type: "associate" | "operator";
}

export function parseDemoUserFromCookie(cookieValue: string | undefined): DemoUser | null {
  if (!cookieValue) return null;
  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return null;
  }
}
