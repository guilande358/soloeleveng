import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";

import { ActionButton, Row } from "@/components/os/ui";
import { resolveCards } from "@/lib/card-map";
import { listCards } from "@/lib/cards.functions";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

function useCatalogue() {
  const fetchCards = useServerFn(listCards);
  const { data } = useQuery({ queryKey: ["cards"], queryFn: () => fetchCards() });
  return resolveCards(data);
}

export function MarketWidget() {
  const cards = useCatalogue();
  return (
    <div>
      {cards.slice(0, 4).map((c) => (
        <Row key={c.id} label={`${c.name} Card`} value={`${c.price.toFixed(2)} USD`} glow={c.glow} />
      ))}
    </div>
  );
}

export function MarketFull() {
  const { lang } = useI18n();
  const cards = useCatalogue();
  const { selectCard } = useHud();
  const navigate = useNavigate();

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <div
            className="mb-2 grid h-20 place-items-center rounded-md"
            style={{ background: `radial-gradient(circle at 50% 40%, ${c.glow}44, transparent)` }}
          >
            <Sparkles className="h-5 w-5" style={{ color: c.glow }} />
          </div>
          <p className="truncate font-display text-[12px]">{c.name} Card</p>
          <p className="text-[11px] text-muted-foreground">
            {c.currentRank} → {c.targetRank}
          </p>
          <p className="text-[11px] text-muted-foreground">{c.price.toFixed(2)} USD</p>
          <div className="mt-2">
            <ActionButton
              onClick={() => {
                selectCard(c.id);
                void navigate({ to: "/checkout" });
              }}
            >
              {lang === "pt" ? "Comprar" : "Buy"}
            </ActionButton>
          </div>
        </div>
      ))}
    </div>
  );
}
