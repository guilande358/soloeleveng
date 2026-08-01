import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

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
  const [tab, setTab] = useState<"login" | "signup">("login");

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

          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            {tab === "signup" && <Field label={t("auth.user")} type="text" />}
            <Field label={t("auth.email")} type="email" />
            <Field label={t("auth.password")} type="password" />
            {tab === "signup" && <Field label={t("auth.confirm")} type="password" />}

            {tab === "signup" && (
              <label className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <input type="checkbox" className="mt-0.5 accent-[var(--primary)]" />
                {t("auth.terms")}
              </label>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-3 font-display text-sm tracking-[0.16em] text-primary-foreground uppercase"
            >
              {tab === "login" ? t("auth.login") : t("auth.signup")}
            </button>
          </form>

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
          <p className="mt-3 text-center text-[10px] text-muted-foreground">{t("auth.demo")}</p>
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

function Field({ label, type }: { label: string; type: string }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-widest text-muted-foreground uppercase">{label}</span>
      <input
        type={type}
        className="mt-1 w-full rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm outline-hidden focus:border-primary"
      />
    </label>
  );
}
