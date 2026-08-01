import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { GameCardTile } from "@/components/hud/game-card-tile";
import { CARDS } from "@/data/game";
import { useI18n } from "@/lib/i18n";

export function CardCarousel({
  selectedId,
  activeId,
  onSelect,
}: {
  selectedId: string;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: number) {
    trackRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-sm tracking-[0.18em] uppercase">{t("cards.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("cards.subtitle")}</p>
        </div>
        <div className="hidden gap-1.5 sm:flex">
          <button
            type="button"
            aria-label="prev"
            onClick={() => scrollBy(-1)}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="next"
            onClick={() => scrollBy(1)}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="scroll-hidden flex snap-x snap-mandatory gap-3 overflow-x-auto pt-2 pb-4"
      >
        {CARDS.map((card) => (
          <div key={card.id} className="snap-center">
            <GameCardTile
              card={card}
              active={activeId === card.id}
              featured={selectedId === card.id}
              onClick={() => onSelect(card.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
