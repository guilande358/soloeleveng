import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Brain, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ActionButton, Chip, Row } from "@/components/os/ui";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import {
  createHighlight,
  listMyHighlights,
  listPublicHighlights,
  setHighlightVisibility,
  type HighlightItem,
} from "@/lib/highlights.functions";

function useHighlights() {
  const { userId } = useHud();
  const fetchMine = useServerFn(listMyHighlights);
  const fetchPublic = useServerFn(listPublicHighlights);

  const mine = useQuery({
    queryKey: ["highlights", "mine"],
    queryFn: () => fetchMine(),
    enabled: Boolean(userId),
  });
  const shared = useQuery({
    queryKey: ["highlights", "public"],
    queryFn: () => fetchPublic(),
  });

  const items: HighlightItem[] = (mine.data?.length ? mine.data : shared.data) ?? [];
  const isLoading = shared.isLoading || (Boolean(userId) && mine.isLoading);
  return { items, isLoading, isMine: Boolean(mine.data?.length) };
}

const title = (h: HighlightItem, lang: string) => (lang === "pt" ? h.title_pt : h.title_en);

function Poster({ hue, duration }: { hue: string; duration: string }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-[linear-gradient(140deg,var(--surface-2),var(--background))]">
      <span className="os-fog absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute inset-0 grid place-items-center">
        <span
          className="grid h-14 w-14 place-items-center rounded-full border bg-background/60 transition-transform group-hover:scale-110"
          style={{ borderColor: hue, boxShadow: `0 0 30px -4px ${hue}` }}
        >
          <Play className="h-6 w-6" style={{ color: hue }} />
        </span>
      </div>
      <span className="absolute right-2 bottom-2 rounded-sm bg-background/80 px-1.5 font-display text-[10px]">
        {duration}
      </span>
    </div>
  );
}

export function HighlightsWidget() {
  const { lang } = useI18n();
  const { items, isLoading } = useHighlights();
  const top = items[0];

  if (isLoading) {
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt" ? "A analisar partidas..." : "Analysing matches..."}
      </p>
    );
  }

  if (!top) {
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt"
          ? "Sem highlights ainda. Registe uma partida para a IA analisar."
          : "No highlights yet. Log a match for the AI to analyse."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Poster hue={top.hue} duration={top.duration} />
      <div className="flex items-center gap-1.5">
        <Chip glow="var(--neon-pink)">IA</Chip>
        <Chip>{top.game}</Chip>
      </div>
      <div>
        <p className="truncate font-display text-sm">{title(top, lang)}</p>
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          {top.map} · {top.match_date} · KDA {top.kda}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {top.tags.map((tg) => (
          <Chip key={tg} glow="var(--neon-gold)">
            {tg}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function HighlightsFull() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const queryClient = useQueryClient();
  const { items, isMine } = useHighlights();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((h) => h.id === selectedId) ?? items[0] ?? null;

  const [form, setForm] = useState({
    title: "",
    game: "Valorant",
    map: "Ascent",
    duration: "00:45",
    kda: "3/0/1",
  });

  const visibilityFn = useServerFn(setHighlightVisibility);
  const createFn = useServerFn(createHighlight);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["highlights"] });
  };

  const toggle = useMutation({
    mutationFn: (input: { id: string; isPublic: boolean }) => visibilityFn({ data: input }),
    onSuccess: refresh,
    onError: () => toast.error(lang === "pt" ? "Não foi possível atualizar" : "Could not update"),
  });

  const create = useMutation({
    mutationFn: () => createFn({ data: form }),
    onSuccess: () => {
      toast.success(lang === "pt" ? "Highlight registado" : "Highlight saved");
      setForm((f) => ({ ...f, title: "" }));
      refresh();
    },
    onError: () => toast.error(lang === "pt" ? "Dados inválidos" : "Invalid data"),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3">
        {selected ? (
          <>
            <Poster hue={selected.hue} duration={selected.duration} />
            <div>
              <p className="font-display text-sm">{title(selected, lang)}</p>
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                {selected.game} · {selected.map} · KDA {selected.kda}
              </p>
            </div>
          </>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            {lang === "pt" ? "Nenhum highlight disponível." : "No highlight available."}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setSelectedId(h.id)}
              className="rounded-lg border border-border/50 bg-surface-2/40 p-2 text-left"
              style={selected?.id === h.id ? { borderColor: h.hue } : undefined}
            >
              <p className="truncate font-display text-[11px]">{title(h, lang)}</p>
              <p className="text-[9px] tracking-wider text-muted-foreground uppercase">
                {h.game} · {h.duration}
              </p>
            </button>
          ))}
        </div>

        {selected && isMine ? (
          <div className="flex flex-wrap gap-2">
            <ActionButton
              variant="ghost"
              onClick={() => toggle.mutate({ id: selected.id, isPublic: !selected.is_public })}
            >
              {selected.is_public
                ? lang === "pt"
                  ? "Tornar privado"
                  : "Make private"
                : lang === "pt"
                  ? "Tornar público"
                  : "Make public"}
            </ActionButton>
            <Chip glow={selected.is_public ? "var(--neon-green)" : "var(--neon-gold)"}>
              {selected.is_public
                ? lang === "pt"
                  ? "Público"
                  : "Public"
                : lang === "pt"
                  ? "Privado"
                  : "Private"}
            </Chip>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {selected && selected.timeline.length > 0 ? (
          <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
            <p className="mb-2 flex items-center gap-1.5 font-display text-[11px] tracking-[0.18em] uppercase">
              <Brain className="h-3.5 w-3.5 text-neon-cyan" /> Timeline IA
            </p>
            {selected.timeline.map((e) => (
              <Row
                key={e.at}
                label={lang === "pt" ? e.pt : e.en}
                value={e.at}
                glow="var(--neon-cyan)"
              />
            ))}
          </div>
        ) : null}

        {selected && selected.insights.length > 0 ? (
          <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
            <p className="mb-2 flex items-center gap-1.5 font-display text-[11px] tracking-[0.18em] uppercase">
              <Sparkles className="h-3.5 w-3.5 text-neon-gold" />
              {lang === "pt" ? "Análise" : "Analysis"}
            </p>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              {selected.insights.map((i) => (
                <li key={i.en}>· {lang === "pt" ? i.pt : i.en}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {userId ? (
          <div className="space-y-2 rounded-xl border border-border/50 bg-surface-2/40 p-3">
            <p className="font-display text-[11px] tracking-[0.18em] uppercase">
              {lang === "pt" ? "Registar partida" : "Log a match"}
            </p>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={lang === "pt" ? "Título do momento" : "Moment title"}
              className="w-full rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={form.game}
                onChange={(e) => setForm({ ...form, game: e.target.value })}
                className="rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
                placeholder="Game"
              />
              <input
                value={form.map}
                onChange={(e) => setForm({ ...form, map: e.target.value })}
                className="rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
                placeholder="Map"
              />
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
                placeholder="00:45"
              />
              <input
                value={form.kda}
                onChange={(e) => setForm({ ...form, kda: e.target.value })}
                className="rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
                placeholder="3/0/1"
              />
            </div>
            <ActionButton onClick={() => create.mutate()}>
              {create.isPending
                ? lang === "pt"
                  ? "A guardar..."
                  : "Saving..."
                : lang === "pt"
                  ? "Guardar highlight"
                  : "Save highlight"}
            </ActionButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
