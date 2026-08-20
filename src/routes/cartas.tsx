import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { BanWarningDialog } from "@/components/hud/ban-warning-dialog";
import { CardsSection } from "@/components/hud/cards-section";
import { GameCardTile } from "@/components/hud/game-card-tile";
import { resolveCards } from "@/lib/card-map";
import { listCards } from "@/lib/cards.functions";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/cartas" },
    ],
    links: [{ rel: "canonical", href: "/cartas" }],
  }),
  component: CardsPage,
});

function CardsPage() {
  const { t } = useI18n();
  const { activeCardId, selectCard } = useHud();
  const navigate = useNavigate();
  const [pending, setPending] = useState<string | null>(null);

  const fetchCards = useServerFn(listCards);
  const { data } = useQuery({ queryKey: ["cards"], queryFn: () => fetchCards() });
  const cards = resolveCards(data);

  function choose(id: string) {
    selectCard(id);
    void navigate({ to: "/checkout" });
  }

  function request(id: string) {
    if (activeCardId && activeCardId !== id) {
      setPending(id);
      return;
    }
    choose(id);
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl">{t("cards.title")}</h1>
      <CardsSection showUpgrade={false} />

      <section>
        <h2 className="mb-3 font-display text-sm tracking-[0.18em] uppercase">
          {t("nav.cards")} · {cards.length}
        </h2>
        <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-4">
          {cards.map((card) => (
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
          if (pending) choose(pending);
          setPending(null);
        }}
      />
    </div>
  );
}
