import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Radio, ShieldCheck } from "lucide-react";

import { OsGrid } from "@/components/os/os-grid";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solo Eleveng Evolution — Centro de Comando Gamer" },
      {
        name: "description",
        content:
          "Sistema operacional gamer: painéis inteligentes de highlights por IA, lives, carta ativa, guilda, contratos, carteira e estatísticas num só dashboard.",
      },
      { property: "og:title", content: "Solo Eleveng Evolution — Centro de Comando Gamer" },
      {
        property: "og:description",
        content: "Dashboard HUD com painéis vivos para a tua carreira gamer.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { lang } = useI18n();
  const { profile, mode } = useHud();

  return (
    <div className="relative space-y-4">
      <span className="os-fog" aria-hidden />

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
            {lang === "pt" ? "Centro de comando" : "Command center"}
          </p>
          <h1 className="text-glow font-display text-xl sm:text-2xl">
            {lang === "pt" ? "Bem-vindo, " : "Welcome, "}
            {profile.name}
          </h1>
        </div>
        <ul className="flex flex-wrap items-center gap-2 text-[10px] tracking-[0.16em] uppercase">
          <li className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-2/50 px-2.5 py-1.5">
            <Cpu className="h-3.5 w-3.5 text-neon-cyan" />
            {lang === "pt" ? "IA ativa" : "AI active"}
          </li>
          <li className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-2/50 px-2.5 py-1.5">
            <Radio className="h-3.5 w-3.5 text-neon-pink" />4 lives
          </li>
          <li className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-2/50 px-2.5 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />
            {mode === "pro" ? "GamerPRO" : "Friendly"}
          </li>
        </ul>
      </header>

      <OsGrid />
    </div>
  );
}
