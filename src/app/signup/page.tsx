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

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  accountType: z.enum(["associate", "operator"]),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      accountType: "associate",
    },
  });

  async function onSubmit(values: SignupValues) {
    setLoading(true);
    setError("");

    if (isDemo) {
      const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
      if (users.some((user: { email: string }) => user.email === values.email)) {
        setError("An account with this email already exists.");
        setLoading(false);
        return;
      }

      const newUser = {
        id: `demo-${Date.now()}`,
        email: values.email,
        password: values.password,
        full_name: values.fullName,
        account_type: values.accountType,
      };

      users.push(newUser);
      localStorage.setItem("demo_users", JSON.stringify(users));

      const demoUser = {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        account_type: newUser.account_type,
      };

      document.cookie = `demo_user=${encodeURIComponent(JSON.stringify(demoUser))};path=/;max-age=86400`;
      localStorage.setItem("demo_current_user", JSON.stringify(demoUser));
      window.location.href =
        values.accountType === "operator"
          ? "/dashboard/operator"
          : "/dashboard/associate";
      return;
    }

    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          account_type: values.accountType,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = "/login";
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
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Join the DCP investment platform</CardDescription>
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
                  <label className="text-sm font-medium">Full name</label>
                  <Input placeholder="Jane Smith" {...form.register("fullName")} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="you@example.com" {...form.register("email")} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="Min. 6 characters" {...form.register("password")} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(["associate", "operator"] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={form.watch("accountType") === type ? "default" : "outline"}
                      onClick={() => form.setValue("accountType", type)}
                    >
                      {type === "associate" ? "Associate" : "Operating Team"}
                    </Button>
                  ))}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button asChild variant="link" className="h-auto px-0 py-0 font-medium">
                  <Link href="/login">Sign in</Link>
                </Button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
