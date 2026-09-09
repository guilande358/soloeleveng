import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MatchRow = {
  id: string;
  game_id: string | null;
  game_name: string;
  result: string;
  kills: number;
  deaths: number;
  assists: number;
  duration_minutes: number;
  medals: number;
  mvp: boolean;
  accuracy: number;
  xp: number;
  note: string | null;
  played_at: string;
};

const SELECT =
  "id, game_id, game_name, result, kills, deaths, assists, duration_minutes, medals, mvp, accuracy, xp, note, played_at";

/** Matches registered by the signed-in gamer, newest first. */
export const listMyMatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MatchRow[]> => {
    const { data, error } = await context.supabase
      .from("matches")
      .select(SELECT)
      .eq("user_id", context.userId)
      .order("played_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const MatchInput = z.object({
  gameId: z.string().uuid().nullable().optional(),
  gameName: z.string().trim().min(1).max(60),
  result: z.enum(["win", "loss", "draw"]),
  kills: z.number().int().min(0).max(200).default(0),
  deaths: z.number().int().min(0).max(200).default(0),
  assists: z.number().int().min(0).max(200).default(0),
  durationMinutes: z.number().int().min(0).max(600).default(0),
  medals: z.number().int().min(0).max(50).default(0),
  mvp: z.boolean().default(false),
  accuracy: z.number().int().min(0).max(100).default(0),
  note: z.string().trim().max(200).optional(),
});

/**
 * Registers a real match. The database trigger credits XP, raises level/rank,
 * advances the active card contract and moves mission progress.
 */
export const createMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MatchInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("matches")
      .insert({
        user_id: context.userId,
        game_id: data.gameId ?? null,
        game_name: data.gameName,
        result: data.result,
        kills: data.kills,
        deaths: data.deaths,
        assists: data.assists,
        duration_minutes: data.durationMinutes,
        medals: data.medals,
        mvp: data.mvp,
        accuracy: data.accuracy,
        note: data.note ?? null,
      })
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as MatchRow;
  });

export type Progression = {
  xp: number;
  level: number;
  rank: string;
  xpIntoLevel: number;
  xpPerLevel: number;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  kd: number;
  mvps: number;
  medals: number;
  accuracy: number;
  hours: number;
  games: number;
  trend: number[];
};

const XP_PER_LEVEL = 1000;

/** Level, rank and career statistics computed from the registered matches. */
export const getMyProgression = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Progression> => {
    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("xp, level, rank")
      .eq("id", context.userId)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    const { data: rows, error } = await context.supabase
      .from("matches")
      .select("result, kills, deaths, medals, mvp, accuracy, duration_minutes, game_name, xp")
      .eq("user_id", context.userId)
      .order("played_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    const matches = rows ?? [];
    const wins = matches.filter((m) => m.result === "win").length;
    const losses = matches.filter((m) => m.result === "loss").length;
    const kills = matches.reduce((s, m) => s + m.kills, 0);
    const deaths = matches.reduce((s, m) => s + m.deaths, 0);
    const medals = matches.reduce((s, m) => s + m.medals, 0);
    const minutes = matches.reduce((s, m) => s + m.duration_minutes, 0);
    const accuracyRows = matches.filter((m) => m.accuracy > 0);
    const xp = profile?.xp ?? 0;

    const recent = matches.slice(0, 12).reverse();
    const maxXp = Math.max(1, ...recent.map((m) => m.xp));

    return {
      xp,
      level: profile?.level ?? 1,
      rank: profile?.rank ?? "Iron",
      xpIntoLevel: xp % XP_PER_LEVEL,
      xpPerLevel: XP_PER_LEVEL,
      matches: matches.length,
      wins,
      losses,
      winRate: matches.length ? Math.round((wins / matches.length) * 100) : 0,
      kd: deaths ? Number((kills / deaths).toFixed(2)) : kills,
      mvps: matches.filter((m) => m.mvp).length,
      medals,
      accuracy: accuracyRows.length
        ? Math.round(accuracyRows.reduce((s, m) => s + m.accuracy, 0) / accuracyRows.length)
        : 0,
      hours: Math.round((minutes / 60) * 10) / 10,
      games: new Set(matches.map((m) => m.game_name)).size,
      trend: recent.map((m) => Math.max(6, Math.round((m.xp / maxXp) * 100))),
    };
  });
