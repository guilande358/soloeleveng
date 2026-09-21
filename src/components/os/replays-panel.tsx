import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Play } from "lucide-react";
import { useMemo, useState } from "react";

import { ActionButton, Chip, Row } from "@/components/os/ui";
import { listMyHighlights, listPublicHighlights } from "@/lib/highlights.functions";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

function useReplays() {
  const { userId } = useHud();
  const fetchMine = useServerFn(listMyHighlights);
  const fetchShared = useServerFn(listPublicHighlights);

  const mine = useQuery({
    queryKey: ["my-highlights"],
    queryFn: () => fetchMine(),
    enabled: Boolean(userId),
  });
  const shared = useQuery({ queryKey: ["public-highlights"], queryFn: () => fetchShared() });

  const rows = userId ? (mine.data ?? []) : (shared.data ?? []);
  return { rows, loading: shared.isLoading || (Boolean(userId) && mine.isLoading) };
}

export function ReplaysWidget() {
  const { lang } = useI18n();
  const { rows } = useReplays();

  return (
    <div>
      {rows.slice(0, 4).map((r) => (
        <Row
          key={r.id}
          label={lang === "pt" ? r.title_pt : r.title_en}
          value={r.duration}
          glow="var(--neon-pink)"
        />
      ))}
      {rows.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt" ? "Nenhum replay registrado ainda." : "No replays registered yet."}
        </p>
      )}
    </div>
  );
}

export function ReplaysFull() {
  const { lang } = useI18n();
  const { rows, loading } = useReplays();
  const [game, setGame] = useState("all");

  const games = useMemo(() => Array.from(new Set(rows.map((r) => r.game))), [rows]);
  const filtered = game === "all" ? rows : rows.filter((r) => r.game === game);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setGame("all")}>
          <Chip glow={game === "all" ? "var(--neon-pink)" : undefined}>
            {lang === "pt" ? "Todos" : "All"}
          </Chip>
        </button>
        {games.map((g) => (
          <button key={g} type="button" onClick={() => setGame(g)}>
            <Chip glow={game === g ? "var(--neon-pink)" : undefined}>{g}</Chip>
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</p>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-2">
            <div
              className="mb-2 grid aspect-video place-items-center rounded-md border border-border/50 bg-background/60"
              style={{ background: `radial-gradient(circle at 50% 40%, ${r.hue}33, transparent)` }}
            >
              <Play className="h-6 w-6" style={{ color: r.hue }} />
            </div>
            <p className="truncate font-display text-[11px]">{lang === "pt" ? r.title_pt : r.title_en}</p>
            <p className="text-[9px] tracking-wider text-muted-foreground uppercase">
              {r.duration} · {r.map} · {r.kda}
            </p>
          </div>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "Registre uma partida no painel de IA Highlights para ver o replay aqui."
            : "Register a match in the AI Highlights panel to see the replay here."}
        </p>
      )}

      <Link to="/perfil">
        <ActionButton variant="ghost">{lang === "pt" ? "Ver percurso" : "View journey"}</ActionButton>
      </Link>
    </div>
  );
}
