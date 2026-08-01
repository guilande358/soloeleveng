import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";

import { HudPanel } from "@/components/hud/hud-panel";
import { PAYMENT_METHODS, findCard } from "@/data/game";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { glowStyle } from "@/lib/style";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout do pacote — Solo Eleveng Evolution" },
      {
        name: "description",
        content:
          "Resumo do pedido da sua carta de elevação, modo do contrato e métodos de pagamento disponíveis.",
      },
      { property: "og:title", content: "Checkout do pacote — Solo Eleveng Evolution" },
      { property: "og:description", content: "Resumo do pedido, modo do contrato e pagamento." },
      { property: "og:url", content: "/checkout" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t, lang } = useI18n();
  const { activeCardId, mode } = useHud();
  const [method, setMethod] = useState("card");
  const card = findCard(activeCardId ?? undefined);

  if (!card) {
    return (
      <HudPanel title={t("checkout.title")}>
        <p className="text-sm text-muted-foreground">{t("checkout.empty")}</p>
        <Link
          to="/cartas"
          className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 font-display text-xs tracking-wider text-primary-foreground uppercase"
        >
          {t("checkout.browse")}
        </Link>
      </HudPanel>
    );
  }

  const commission = mode === "pro" ? 0.2 : 0;
  const total = card.price * (1 + commission);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">{t("checkout.title")}</h1>

      <HudPanel glow={card.glow}>
        <div className="flex items-center gap-3" style={glowStyle(card.glow)}>
          <span
            className="h-12 w-12 rotate-45 rounded-md"
            style={{
              background: "var(--glow)",
              boxShadow: "0 0 24px color-mix(in oklab, var(--glow) 70%, transparent)",
            }}
          />
          <div className="flex-1">
            <p className="font-display text-sm">{card.name} Card</p>
            <p className="text-xs text-muted-foreground">
              {card.currentRank} → {card.targetRank}
            </p>
          </div>
          <span className="font-display text-sm">{card.price.toFixed(2)} USD</span>
        </div>

        <dl className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs">
          <Row label={t("checkout.mode")} value={mode === "pro" ? t("modes.pro") : t("modes.friendly")} />
          <Row label={t("checkout.commission")} value={`${commission * 100}%`} />
          <Row label={t("card.time")} value={`${card.days} ${t("card.days")}`} />
        </dl>
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
          <span className="font-display text-xs tracking-widest uppercase">{t("checkout.total")}</span>
          <span className="font-display text-lg text-glow">{total.toFixed(2)} USD</span>
        </div>
      </HudPanel>

      <HudPanel title={t("checkout.method")}>
        <ul className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-xs transition-colors",
                  method === m.id
                    ? "border-primary bg-primary/15"
                    : "border-border/60 bg-surface-2/50",
                )}
              >
                <span
                  className={cn(
                    "h-3 w-3 rounded-full border",
                    method === m.id ? "border-primary bg-primary" : "border-muted-foreground",
                  )}
                />
                {lang === "pt" ? m.labelPt : m.labelEn}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-display text-sm tracking-[0.16em] text-primary-foreground uppercase opacity-60"
        >
          <Lock className="h-4 w-4" />
          {t("checkout.pay")}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">{t("checkout.soon")}</p>
        <p className="mt-1 text-center text-[10px] tracking-wider text-muted-foreground uppercase">
          {t("checkout.secure")}
        </p>
      </HudPanel>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
