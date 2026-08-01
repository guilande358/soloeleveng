import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Layers, Swords, User, CreditCard } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", key: "nav.home", Icon: Home },
  { to: "/cartas", key: "nav.cards", Icon: Layers },
  { to: "/modos", key: "nav.modes", Icon: Swords },
  { to: "/checkout", key: "nav.checkout", Icon: CreditCard },
  { to: "/perfil", key: "nav.profile", Icon: User },
] as const;

export function HudBottomNav() {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="sticky bottom-0 z-40 mt-8 border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
        {items.map(({ to, key, Icon }) => {
          const active = path === to;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md py-1.5 text-[10px] font-semibold tracking-wide uppercase transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn("h-4.5 w-4.5", active && "drop-shadow-[0_0_8px_var(--neon)]")}
                />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
