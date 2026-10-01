import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { signIn, signUp } from "@/lib/auth.functions";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Solo Eleveng Evolution" },
      {
        name: "description",
        content: "Acesse sua conta gamer ou cadastre-se para começar a evoluir seu rank.",
      },
      { property: "og:title", content: "Entrar ou criar conta — Solo Eleveng Evolution" },
      { property: "og:description", content: "Login e cadastro do HUD gamer." },
      { property: "og:url", content: "/auth" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { next?: string; reset?: string };
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (tab === "signup") {
      if (password !== confirm) {
        toast.error(t("auth.passwordMismatch"));
        return;
      }
      if (!agreed) {
        toast.error(t("auth.acceptTerms"));
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const result = await signIn({ data: { email, password } });
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        });
        toast.success(t("auth.welcomeBack"));
        navigate({ to: search.next ?? "/" });
      } else {
        await signUp({ data: { email, password, name } });
        toast.success(t("auth.accountCreated"));
        const result = await signIn({ data: { email, password } });
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        });
        navigate({ to: search.next ?? "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.error"));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: search.next ?? "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.error"));
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="hud-panel relative overflow-hidden p-5">
        <span className="hud-frame" aria-hidden />
        <div className="relative">
          <div className="mb-4 flex gap-1 rounded-lg border border-border/60 p-1">
            {(["login", "signup"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn(
                  "flex-1 rounded-md py-2 font-display text-xs tracking-widest uppercase",
                  tab === k ? "bg-primary/25 text-foreground" : "text-muted-foreground",
                )}
              >
                {k === "login" ? t("auth.login") : t("auth.signup")}
              </button>
            ))}
          </div>

          <h1 className="font-display text-xl">
            {tab === "login" ? t("auth.loginTitle") : t("auth.signupTitle")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {tab === "login" ? t("auth.loginSub") : t("auth.signupSub")}
          </p>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            {tab === "signup" && (
              <Field label={t("auth.user")} type="text" value={name} onChange={setName} />
            )}
            <Field label={t("auth.email")} type="email" value={email} onChange={setEmail} />
            <Field
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={setPassword}
            />
            {tab === "signup" && (
              <Field
                label={t("auth.confirm")}
                type="password"
                value={confirm}
                onChange={setConfirm}
              />
            )}

            {tab === "signup" && (
              <label className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-[var(--primary)]"
                />
                {t("auth.terms")}
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-display text-sm tracking-[0.16em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? t("common.loading") : tab === "login" ? t("auth.login") : t("auth.signup")}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <span className="relative flex justify-center text-[10px] uppercase text-muted-foreground">
              <span className="bg-surface-1 px-2">{t("auth.or")}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2/60 px-4 py-3 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t("auth.google")}
          </button>

          {tab === "login" && (
            <button
              type="button"
              className="mt-3 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
            >
              {t("auth.forgot")}
            </button>
          )}

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            {tab === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button
              type="button"
              onClick={() => setTab(tab === "login" ? "signup" : "login")}
              className="text-primary underline-offset-2 hover:underline"
            >
              {tab === "login" ? t("auth.signup") : t("auth.login")}
            </button>
          </p>
        </div>
      </div>

      <Link
        to="/perfil"
        className="block text-center text-[11px] text-muted-foreground underline-offset-2 hover:underline"
      >
        {t("profile.title")}
      </Link>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-widest text-muted-foreground uppercase">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 w-full rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm outline-hidden focus:border-primary"
      />
    </label>
  );
}
