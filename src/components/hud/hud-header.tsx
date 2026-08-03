import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Globe, LogOut, User } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", key: "nav.home" },
  { to: "/cartas", key: "nav.cards" },
  { to: "/modos", key: "nav.modes" },
  { to: "/perfil", key: "nav.profile" },
] as const;

export function HudHeader() {
  const { t, lang, setLang } = useI18n();
  const { userId, profile } = useHud();
  const path = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success(t("auth.signedOut"));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/src/assets/seev-logo.png" alt="Solo Eleveng Evolution" width={40} height={40} className="h-9 w-9" />
          <span className="font-display text-[11px] leading-3 tracking-[0.18em] text-foreground">
            SOLO
            <br />
            ELEVENG
          </span>
        </Link>

        <nav className="scroll-hidden ml-2 hidden flex-1 items-center gap-1 overflow-x-auto md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-md px-3 py-1.5 font-display text-xs tracking-widest uppercase transition-colors",
                path === l.to
                  ? "bg-primary/25 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLang(lang === "pt" ? "en" : "pt")}
            aria-label={t("common.lang")}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang.toUpperCase()}
          </button>
          <Link
            to="/notificacoes"
            aria-label={t("notif.title")}
            className="relative rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-neon-pink" />
          </Link>

          {userId ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/perfil"
                className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-xs font-medium transition-colors hover:bg-surface-2"
              >
                <span
                  className="grid h-6 w-6 place-items-center rounded-full font-display text-[10px] font-bold"
                  style={{ background: profile.accent, color: "#0b1120" }}
                >
                  {profile.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden max-w-[6rem] truncate sm:inline">{profile.name}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label={t("auth.signOut")}
                className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-display text-xs tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
            >
              <User className="h-3.5 w-3.5" />
              {t("nav.auth")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
