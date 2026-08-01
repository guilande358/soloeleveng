import { createFileRoute, Link } from "@tanstack/react-router";
import { Radio, Store, Target, Trophy, Users } from "lucide-react";

import heroImg from "@/assets/hud-hero.jpg";
import { CardsSection } from "@/components/hud/cards-section";
import { ComingSoonPanel } from "@/components/hud/coming-soon-panel";
import { ContractsPanel } from "@/components/hud/contracts-panel";
import { ModeSelector } from "@/components/hud/mode-selector";
import { NotificationsPanel } from "@/components/hud/notifications-panel";
import { ProgressPanel } from "@/components/hud/progress-panel";
import { SecureAccessPanel } from "@/components/hud/secure-access-panel";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solo Eleveng Evolution — HUD gamer de elevação de contas" },
      {
        name: "description",
        content:
          "HUD digital para gamers solo: escolha sua carta, defina o rank objetivo e evolua sua conta com suporte de LLMs ou jogadores profissionais.",
      },
      { property: "og:title", content: "Solo Eleveng Evolution — HUD gamer" },
      {
        property: "og:description",
        content: "Escolha sua carta, evolua sua conta e alcance o rank objetivo.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();

  const quick = [
    { Icon: Trophy, label: "Ranking Global", sub: "TOP 100" },
    { Icon: Users, label: "Comunidade", sub: "Online" },
    { Icon: Radio, label: "Lives", sub: "Soon" },
    { Icon: Target, label: t("progress.missions"), sub: "18/20" },
    { Icon: Store, label: "Loja", sub: "Cards" },
  ];

  return (
    <div className="space-y-5">
      <section className="hud-panel relative overflow-hidden">
        <span className="hud-frame" aria-hidden />
        <img
          src={heroImg}
          alt="Cavaleiro solo com espada de cristal luminosa"
          width={1536}
          height={896}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative p-6 sm:p-10">
          <h1 className="font-display text-3xl leading-tight sm:text-5xl">
            <span className="text-glow block">{t("hero.line1")}</span>
            <span className="block text-neon-cyan italic">{t("hero.line2")}</span>
            <span className="block text-neon-pink">{t("hero.line3")}</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{t("hero.sub")}</p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">{t("hero.tagline")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/cartas"
              className="rounded-lg bg-primary px-5 py-3 font-display text-sm tracking-[0.16em] text-primary-foreground uppercase"
            >
              {t("nav.cards")}
            </Link>
            <Link
              to="/modos"
              className="rounded-lg border border-border px-5 py-3 font-display text-sm tracking-[0.16em] uppercase"
            >
              {t("modes.title")}
            </Link>
          </div>
        </div>
      </section>

      <ul className="scroll-hidden flex gap-2 overflow-x-auto pb-1">
        {quick.map(({ Icon, label, sub }) => (
          <li
            key={label}
            className="hud-panel flex min-w-[9.5rem] shrink-0 items-center gap-2 p-3"
          >
            <Icon className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[10px] tracking-wider text-muted-foreground uppercase">{sub}</p>
            </div>
          </li>
        ))}
      </ul>

      <CardsSection />

      <section>
        <h2 className="mb-2 font-display text-sm tracking-[0.18em] uppercase">{t("modes.title")}</h2>
        <ModeSelector />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProgressPanel />
        <NotificationsPanel limit={3} />
        <ContractsPanel />
        <SecureAccessPanel />
      </div>

      <ComingSoonPanel />
    </div>
  );
}
