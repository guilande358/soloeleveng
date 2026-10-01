import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Handshake, ShieldCheck, Users } from "lucide-react";

import { ContractsPanel } from "@/components/hud/contracts-panel";
import { HudPanel } from "@/components/hud/hud-panel";
import { ModeSelector } from "@/components/hud/mode-selector";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/modos")({
  head: () => ({
    meta: [
      { title: "Modos Friendly e GamerPRO — Solo Eleveng Evolution" },
      {
        name: "description",
        content:
          "Friendly: contrato amigável e gratuito entre amigos. GamerPRO: guildas, comissão do sistema e proteção de conta.",
      },
      { property: "og:title", content: "Modos Friendly e GamerPRO" },
      {
        property: "og:description",
        content: "Contrato amigável gratuito ou profissional com guilda.",
      },
      { property: "og:url", content: "/modos" },
    ],
    links: [{ rel: "canonical", href: "/modos" }],
  }),
  component: ModesPage,
});

function ModesPage() {
  const { t } = useI18n();
  const { mode } = useHud();

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl">{t("modes.title")}</h1>
      <ModeSelector />

      {mode === "friendly" ? (
        <HudPanel title={t("modes.friendly")} glow="var(--neon-green)">
          <ul className="space-y-2 text-sm">
            <Item Icon={Handshake} text={t("modes.friendly.desc")} />
            <Item
              Icon={Users}
              text="Salas privadas: Sala dos Amigos, Treino Noturno, Ranqueada Casual"
            />
            <Item Icon={ShieldCheck} text="Sem comissão · 0% · acordo direto entre gamers" />
          </ul>
        </HudPanel>
      ) : (
        <HudPanel title={t("modes.pro")} glow="var(--neon)">
          <ul className="space-y-2 text-sm">
            <Item Icon={Crown} text={t("modes.pro.desc")} />
            <Item
              Icon={ShieldCheck}
              text="Proteção de conta, suporte prioritário e relatórios avançados"
            />
            <Item Icon={Users} text="Evolution Guild · 48/50 membros · ranking #15" />
          </ul>
        </HudPanel>
      )}

      <ContractsPanel />

      <Link
        to="/checkout"
        className="inline-block rounded-lg bg-primary px-5 py-3 font-display text-xs tracking-[0.16em] text-primary-foreground uppercase"
      >
        {t("nav.checkout")}
      </Link>
    </div>
  );
}

function Item({ Icon, text }: { Icon: typeof Crown; text: string }) {
  return (
    <li className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface-2/50 p-2.5">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <span className="text-xs text-muted-foreground">{text}</span>
    </li>
  );
}
