import { useState } from "react";
import { toast } from "sonner";

import { BanWarningDialog } from "@/components/hud/ban-warning-dialog";
import { CardCarousel } from "@/components/hud/card-carousel";
import { CardShowcase } from "@/components/hud/card-showcase";
import { UpgradeButton } from "@/components/hud/upgrade-button";
import { CARDS, findCard, type GameCard } from "@/data/game";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

/** Carousel + centre banner. Enforces the one-active-card-at-a-time rule. */
export function CardsSection({ showUpgrade = true }: { showUpgrade?: boolean }) {
  const { t } = useI18n();
  const { activeCardId, selectCard } = useHud();
  const [previewId, setPreviewId] = useState(activeCardId ?? "diamond");
  const [pending, setPending] = useState<string | null>(null);

  const preview: GameCard = findCard(previewId) ?? (CARDS[5] as GameCard);

  function request(id: string) {
    setPreviewId(id);
    if (activeCardId && activeCardId !== id) {
      setPending(id);
      return;
    }
    selectCard(id);
  }

  return (
    <div className="space-y-4">
      <CardCarousel selectedId={previewId} activeId={activeCardId} onSelect={request} />
      <CardShowcase card={preview} />
      <div className="flex flex-wrap items-center gap-3">
        {showUpgrade && <UpgradeButton onSummoned={request} />}
        <button
          type="button"
          onClick={() => request(preview.id)}
          className="rounded-lg border border-border px-4 py-2.5 font-display text-xs tracking-[0.16em] uppercase"
        >
          {activeCardId && activeCardId !== preview.id ? t("cards.upgrade") : t("cards.select")}
        </button>
      </div>

      <BanWarningDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        onConfirm={() => {
          if (pending) {
            selectCard(pending);
            toast.success(t("cards.upgrade"));
          }
          setPending(null);
        }}
      />
    </div>
  );
}
