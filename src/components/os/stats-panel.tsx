import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { ActionButton, Chip, Meter, Sparkline, StatTile } from "@/components/os/ui";
import { listGames } from "@/lib/games.functions";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { createMatch, getMyProgression, listMyMatches } from "@/lib/matches.functions";

export function useProgression() {
  const { userId } = useHud();
  const fetchProgression = useServerFn(getMyProgression);
  return useQuery({
    queryKey: ["progression"],
    queryFn: () => fetchProgression(),
    enabled: Boolean(userId),
  });
}

export function StatsWidget() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const { data } = useProgression();

  if (!userId) {
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt"
          ? "Entre e registre partidas para ver as suas estatísticas reais."
          : "Sign in and register matches to see your real statistics."}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[12px]">
          {lang === "pt" ? "Nível" : "Level"} {data?.level ?? 1}
        </span>
        <Chip glow="var(--neon-gold)">{data?.rank ?? "Iron"}</Chip>
      </div>
      <Meter value={data?.xpIntoLevel ?? 0} max={data?.xpPerLevel ?? 1000} glow="var(--neon-gold)" />
      <div className="grid grid-cols-3 gap-2">
        <StatTile label={lang === "pt" ? "Partidas" : "Matches"} value={String(data?.matches ?? 0)} />
        <StatTile label={lang === "pt" ? "Vitórias" : "Wins"} value={String(data?.wins ?? 0)} />
        <StatTile label="K/D" value={String(data?.kd ?? 0)} />
      </div>
    </div>
  );
}

export function StatsFull() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const queryClient = useQueryClient();
  const { data } = useProgression();

  const fetchGames = useServerFn(listGames);
  const { data: games } = useQuery({ queryKey: ["games"], queryFn: () => fetchGames() });

  const fetchMatches = useServerFn(listMyMatches);
  const { data: matches } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetchMatches(),
    enabled: Boolean(userId),
  });

  const createFn = useServerFn(createMatch);
  const [form, setForm] = useState({
    gameId: "",
    result: "win" as "win" | "loss" | "draw",
    kills: "",
    deaths: "",
    assists: "",
    duration: "",
    medals: "",
    accuracy: "",
    mvp: false,
  });

  const register = useMutation({
    mutationFn: () => {
      const game = (games ?? []).find((g) => g.id === form.gameId) ?? (games ?? [])[0];
      if (!game) throw new Error("no_game");
      return createFn({
        data: {
          gameId: game.id,
          gameName: game.name,
          result: form.result,
          kills: Number(form.kills) || 0,
          deaths: Number(form.deaths) || 0,
          assists: Number(form.assists) || 0,
          durationMinutes: Number(form.duration) || 0,
          medals: Number(form.medals) || 0,
          accuracy: Number(form.accuracy) || 0,
          mvp: form.mvp,
        },
      });
    },
    onSuccess: () => {
      toast.success(lang === "pt" ? "Partida registrada — XP creditado" : "Match saved — XP credited");
      setForm((f) => ({ ...f, kills: "", deaths: "", assists: "", duration: "", medals: "", accuracy: "", mvp: false }));
      for (const key of ["progression", "matches", "missions", "contracts", "notifications"]) {
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
    onError: () => toast.error(lang === "pt" ? "Não foi possível registrar" : "Could not save the match"),
  });

  if (!userId) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "As estatísticas vêm das suas partidas registradas — nada é simulado."
            : "Statistics come from your registered matches — nothing is simulated."}
        </p>
        <Link to="/auth">
          <ActionButton>{lang === "pt" ? "Entrar" : "Sign in"}</ActionButton>
        </Link>
      </div>
    );
  }

  const input = "rounded-md border border-border bg-background px-2 py-1.5 text-xs";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-[12px]">
            {lang === "pt" ? "Nível" : "Level"} {data?.level ?? 1} · {data?.xp ?? 0} XP
          </p>
          <Chip glow="var(--neon-gold)">{data?.rank ?? "Iron"}</Chip>
        </div>
        <div className="mt-2">
          <Meter value={data?.xpIntoLevel ?? 0} max={data?.xpPerLevel ?? 1000} glow="var(--neon-gold)" />
        </div>
      </div>

      {data && data.trend.length > 0 && <Sparkline data={data.trend} />}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatTile label={lang === "pt" ? "Horas" : "Hours"} value={String(data?.hours ?? 0)} />
        <StatTile label={lang === "pt" ? "Vitórias" : "Wins"} value={`${data?.winRate ?? 0}%`} />
        <StatTile label="K/D" value={String(data?.kd ?? 0)} />
        <StatTile label="MVP" value={String(data?.mvps ?? 0)} />
        <StatTile label={lang === "pt" ? "Precisão" : "Accuracy"} value={`${data?.accuracy ?? 0}%`} />
        <StatTile label={lang === "pt" ? "Medalhas" : "Medals"} value={String(data?.medals ?? 0)} />
      </div>

      <div className="space-y-2 rounded-xl border border-border/50 bg-surface-2/40 p-3">
        <p className="font-display text-[11px] tracking-[0.18em] uppercase">
          {lang === "pt" ? "Registrar partida" : "Register match"}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <select
            className={input}
            value={form.gameId}
            onChange={(e) => setForm((f) => ({ ...f, gameId: e.target.value }))}
          >
            {(games ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <select
            className={input}
            value={form.result}
            onChange={(e) => setForm((f) => ({ ...f, result: e.target.value as "win" | "loss" | "draw" }))}
          >
            <option value="win">{lang === "pt" ? "Vitória" : "Win"}</option>
            <option value="loss">{lang === "pt" ? "Derrota" : "Loss"}</option>
            <option value="draw">{lang === "pt" ? "Empate" : "Draw"}</option>
          </select>
          <input
            className={input}
            inputMode="numeric"
            placeholder={lang === "pt" ? "Abates" : "Kills"}
            value={form.kills}
            onChange={(e) => setForm((f) => ({ ...f, kills: e.target.value }))}
          />
          <input
            className={input}
            inputMode="numeric"
            placeholder={lang === "pt" ? "Mortes" : "Deaths"}
            value={form.deaths}
            onChange={(e) => setForm((f) => ({ ...f, deaths: e.target.value }))}
          />
          <input
            className={input}
            inputMode="numeric"
            placeholder={lang === "pt" ? "Assistências" : "Assists"}
            value={form.assists}
            onChange={(e) => setForm((f) => ({ ...f, assists: e.target.value }))}
          />
          <input
            className={input}
            inputMode="numeric"
            placeholder={lang === "pt" ? "Minutos" : "Minutes"}
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
          />
          <input
            className={input}
            inputMode="numeric"
            placeholder={lang === "pt" ? "Medalhas" : "Medals"}
            value={form.medals}
            onChange={(e) => setForm((f) => ({ ...f, medals: e.target.value }))}
          />
          <input
            className={input}
            inputMode="numeric"
            placeholder={lang === "pt" ? "Precisão %" : "Accuracy %"}
            value={form.accuracy}
            onChange={(e) => setForm((f) => ({ ...f, accuracy: e.target.value }))}
          />
        </div>
        <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <input
            type="checkbox"
            checked={form.mvp}
            onChange={(e) => setForm((f) => ({ ...f, mvp: e.target.checked }))}
          />
          MVP
        </label>
        <ActionButton onClick={() => register.mutate()}>
          {register.isPending
            ? lang === "pt"
              ? "A gravar..."
              : "Saving..."
            : lang === "pt"
              ? "Registrar e ganhar XP"
              : "Save and earn XP"}
        </ActionButton>
      </div>

      <div className="space-y-2">
        <p className="font-display text-[11px] tracking-[0.18em] uppercase">
          {lang === "pt" ? "Últimas partidas" : "Latest matches"}
        </p>
        {(matches ?? []).slice(0, 10).map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-surface-2/40 px-3 py-2 text-[11px]"
          >
            <span className="truncate font-display">{m.game_name}</span>
            <span className="text-muted-foreground">
              {m.kills}/{m.deaths}/{m.assists}
            </span>
            <Chip glow={m.result === "win" ? "var(--neon-green)" : "var(--muted-foreground)"}>
              {m.result === "win"
                ? lang === "pt"
                  ? "Vitória"
                  : "Win"
                : m.result === "draw"
                  ? lang === "pt"
                    ? "Empate"
                    : "Draw"
                  : lang === "pt"
                    ? "Derrota"
                    : "Loss"}
            </Chip>
            <span className="font-display text-neon-gold">+{m.xp} XP</span>
          </div>
        ))}
        {matches && matches.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            {lang === "pt" ? "Nenhuma partida registrada ainda." : "No matches registered yet."}
          </p>
        )}
      </div>
    </div>
  );
}
