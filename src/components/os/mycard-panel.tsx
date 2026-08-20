import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { ActionButton, Chip, Meter, Row } from "@/components/os/ui";
import { listCards } from "@/lib/cards.functions";
import { resolveCards } from "@/lib/card-map";
import { listOrders } from "@/lib/orders.functions";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

function useCatalogue() {
  const fetchCards = useServerFn(listCards);
  const { data } = useQuery({ queryKey: ["cards"], queryFn: () => fetchCards() });
  return resolveCards(data);
}

function useMyOrders() {
  const { userId } = useHud();
  const fetchOrders = useServerFn(listOrders);
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
    enabled: Boolean(userId),
  });
}

export function MyCardWidget() {
  const { lang } = useI18n();
  const { activeCardId } = useHud();
  const cards = useCatalogue();
  const card = cards.find((c) => c.id === activeCardId);

  if (!card) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt" ? "Nenhuma carta ativa." : "No active card."}
        </p>
        <Link to="/cartas">
          <ActionButton>{lang === "pt" ? "Escolher carta" : "Pick a card"}</ActionButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="os-float-card grid h-24 w-16 shrink-0 place-items-center rounded-lg border font-display text-[10px]"
        style={{
          borderColor: card.glow,
          background: `linear-gradient(160deg, ${card.glow}33, transparent)`,
          boxShadow: `0 0 26px -6px ${card.glow}`,
        }}
      >
        {card.name}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-display text-sm" style={{ color: card.glow }}>
          {card.name} Card
        </p>
        <Meter value={card.success} max={100} glow={card.glow} />
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
          {card.currentRank} → {card.targetRank} · {card.medals} med
        </p>
      </div>
    </div>
  );
}

export function MyCardFull() {
  const { lang } = useI18n();
  const { activeCardId, mode } = useHud();
  const cards = useCatalogue();
  const { data: orders } = useMyOrders();
  const card = cards.find((c) => c.id === activeCardId);
  const openOrder = orders?.orders.find(
    (o) => o.status === "active" || o.status === "pending_payment",
  );

  if (!card) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "Sem carta ativa. Escolha um pacote para começar a elevação."
            : "No active card. Pick a pack to start climbing."}
        </p>
        <Link to="/cartas">
          <ActionButton>{lang === "pt" ? "Ver cartas" : "Browse cards"}</ActionButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
      <div
        className="os-float-card mx-auto grid h-64 w-44 place-items-center rounded-2xl border font-display"
        style={{
          borderColor: card.glow,
          background: `linear-gradient(160deg, ${card.glow}44, transparent 70%)`,
          boxShadow: `0 0 60px -12px ${card.glow}`,
          transform: "perspective(900px) rotateY(-10deg)",
        }}
      >
        {card.name}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip glow={card.glow}>{card.rarity}</Chip>
          <Chip>{mode === "pro" ? "GamerPRO" : "Friendly"}</Chip>
          {openOrder ? (
            <Chip glow={openOrder.status === "active" ? "var(--neon-green)" : "var(--neon-gold)"}>
              {openOrder.status}
            </Chip>
          ) : null}
        </div>
        <Row label={lang === "pt" ? "Rank atual" : "Current rank"} value={card.currentRank} />
        <Row
          label={lang === "pt" ? "Rank objetivo" : "Target rank"}
          value={card.targetRank}
          glow={card.glow}
        />
        <Row label={lang === "pt" ? "Medalhas" : "Medals"} value={card.medals} />
        <Row
          label={lang === "pt" ? "Prazo" : "Timeframe"}
          value={`${card.days} ${lang === "pt" ? "dias" : "days"}`}
        />
        <Row label={lang === "pt" ? "Sucesso" : "Success"} value={`${card.success}%`} />
        <Row label={lang === "pt" ? "Custo" : "Cost"} value={`$ ${card.price.toFixed(2)}`} />
        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/cartas">
            <ActionButton>{lang === "pt" ? "Atualizar pacote" : "Upgrade pack"}</ActionButton>
          </Link>
          <Link to="/checkout">
            <ActionButton variant="ghost">{lang === "pt" ? "Checkout" : "Checkout"}</ActionButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
