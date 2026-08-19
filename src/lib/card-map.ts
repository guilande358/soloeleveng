import { CARDS, type GameCard, type SupportKind } from "@/data/game";

export type CardRecord = {
  id: string;
  name: string;
  rarity: string;
  glow: string;
  price: number | string;
  current_rank: string;
  target_rank: string;
  medals: number;
  days: string;
  success: number;
  support: string;
  players: number;
  matches: string;
};

/** Maps a backend card row to the shape the HUD card components expect. */
export function toGameCard(row: CardRecord): GameCard {
  return {
    id: row.id,
    name: row.name,
    rarity: row.rarity,
    glow: row.glow,
    price: Number(row.price),
    currentRank: row.current_rank,
    targetRank: row.target_rank,
    medals: row.medals,
    days: row.days,
    success: row.success,
    support: (row.support === "human" ? "human" : "llm") as SupportKind,
    players: row.players,
    matches: row.matches,
  };
}

/** Backend catalogue when loaded, local catalogue as first-paint fallback. */
export function resolveCards(rows: CardRecord[] | undefined): GameCard[] {
  if (!rows || rows.length === 0) return CARDS;
  return rows.map(toGameCard);
}
