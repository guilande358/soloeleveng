import { createFileRoute } from "@tanstack/react-router";

import { CardsSection } from "@/components/hud/cards-section";
import { GameCardTile } from "@/components/hud/game-card-tile";
import { CARDS } from "@/data/game";
import { BanWarningDialog } from "@/components/hud/ban-warning-dialog";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

export const Route = createFileRoute("/cartas")({
  head: () => ({
    meta: [
      { title: "Cartas e pacotes — Solo Eleveng Evolution" },
      {
        name: "description",
        content:
          "Todas as cartas de elevação: Iron a Legendary, com custo, rank objetivo, medalhas e taxa de sucesso.",
      },
      { property: "og:title", content: "Cartas e pacotes — Solo Eleveng Evolution" },
      { property: "og:description", content: "Cartas de elevação com custo, rank e medalhas." },
      { property: "og:url", content: "/cartas" },
    ],
    links: [{ rel: "canonical", href: "/cartas" }],
  }),
  component: CardsPage,
});

function CardsPage() {
  const { t } = useI18n();
  const { activeCardId, selectCard } = useHud();
  const [pending, setPending] = useState<string | null>(null);

  function request(id: string) {
    if (activeCardId && activeCardId !== id) {
      setPending(id);
      return;
    }
    selectCard(id);
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl">{t("cards.title")}</h1>
      <CardsSection showUpgrade={false} />

      <section>
        <h2 className="mb-3 font-display text-sm tracking-[0.18em] uppercase">
          {t("nav.cards")} · {CARDS.length}
        </h2>
        <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-4">
          {CARDS.map((card) => (
            <GameCardTile
              key={card.id}
              card={card}
              active={activeCardId === card.id}
              onClick={() => request(card.id)}
            />
          ))}
        </div>
      </section>

      <BanWarningDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        onConfirm={() => {
          if (pending) selectCard(pending);
          setPending(null);
        }}
      />
    </div>
  );
}
