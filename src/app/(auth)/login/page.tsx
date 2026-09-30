"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UsersRound, Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const t = useTranslations("LoginPage");
  const linkError = searchParams.get("error");
  const linkErrorMessage =
    linkError === "link_expired"
      ? t("linkExpired")
      : linkError === "link_invalid"
        ? t("linkInvalid")
        : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const destination = inviteToken
      ? `/join/${encodeURIComponent(inviteToken)}`
      : "/dashboard";
    window.location.href = destination;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between p-10 border-r border-border relative overflow-hidden">
        {/* Subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.875 0.105 206 / 0.07) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.875 0.105 206 / 0.05) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="CloudSwift CRM" className="h-8 w-auto" />
        </div>

        {/* Hero copy */}
        <div className="relative space-y-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
              WhatsApp-powered<br />
              customer engagement
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Manage conversations, automate follow-ups, and grow your pipeline —
              all from a single CloudSwift workspace.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              "Inbox, contacts & pipelines in one place",
              "Visual flows & automation engine",
              "Real-time broadcasts to any segment",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} OnCloudSwift. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="CloudSwift CRM" className="h-7 w-auto" />
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Heading */}
          <div className="space-y-1.5">
            {inviteToken ? (
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <UsersRound className="h-5 w-5 text-primary" />
              </div>
            ) : null}
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {inviteToken ? t("titleAccept") : t("titleWelcome")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {inviteToken ? t("descAccept") : t("descWelcome")}
            </p>
          </div>

          {/* Alerts */}
          {linkErrorMessage && !error && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              {linkErrorMessage}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                {t("emailLabel")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  {t("passwordLabel")}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 h-10 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? t("signingIn") : t("signIn")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href={
                inviteToken
                  ? `/signup?invite=${encodeURIComponent(inviteToken)}`
                  : "/signup"
              }
              className="font-medium text-primary hover:text-primary/80"
            >
              {t("createAccount")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
