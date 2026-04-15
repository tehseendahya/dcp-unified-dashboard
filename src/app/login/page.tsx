"use client";

import React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const isDemo =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "your-supabase-url";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    setError("");

    if (isDemo) {
      const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
      const user = users.find(
        (candidate: { email: string; password: string }) =>
          candidate.email === values.email && candidate.password === values.password
      );

      if (!user) {
        setError("Invalid email or password. Sign up first in demo mode.");
        setLoading(false);
        return;
      }

      const demoUser = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        account_type: user.account_type,
      };
      document.cookie = `demo_user=${encodeURIComponent(JSON.stringify(demoUser))};path=/;max-age=86400`;
      localStorage.setItem("demo_current_user", JSON.stringify(demoUser));
      window.location.href =
        user.account_type === "operator"
          ? "/dashboard/operator"
          : "/dashboard/associate";
      return;
    }

    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword(values);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const accountType = user?.user_metadata?.account_type || "associate";
    window.location.href =
      accountType === "operator" ? "/dashboard/operator" : "/dashboard/associate";
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1920px] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your DCP dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDemo && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  <TriangleAlert className="h-4 w-4" />
                  Demo mode enabled
                </div>
              )}

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="you@example.com" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="Enter your password" {...form.register("password")} />
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Button asChild variant="link" className="h-auto px-0 py-0 font-medium">
                  <Link href="/signup">Create one</Link>
                </Button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
