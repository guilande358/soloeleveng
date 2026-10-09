import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PLATFORMS = ["br1", "euw1", "eun1", "na1", "la1", "la2", "kr", "jp1", "oc1", "tr1", "ru"] as const;
type Platform = (typeof PLATFORMS)[number];

function regionFor(p: Platform) {
  if (["br1", "na1", "la1", "la2", "oc1"].includes(p)) return "americas";
  if (["kr", "jp1"].includes(p)) return "asia";
  return "europe";
}

async function riot<T>(url: string): Promise<T> {
  const key = process.env["RIOT_API_KEY"];
  if (!key) throw new Error("riot_key_missing");
  const res = await fetch(url, { headers: { "X-Riot-Token": key } });
  if (res.status === 404) throw new Error("riot_not_found");
  if (res.status === 401 || res.status === 403) throw new Error("riot_key_invalid");
  if (res.status === 429) throw new Error("riot_rate_limited");
  if (!res.ok) throw new Error(`riot_error_${res.status}`);
  return (await res.json()) as T;
}

async function fetchRank(platform: Platform, puuid: string) {
  const entries = await riot<Array<{ queueType: string; tier: string; rank: string; leaguePoints: number }>>(
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
  ).catch(() => []);
  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? entries[0];
  return solo ? { tier: solo.tier, division: solo.rank, lp: solo.leaguePoints } : { tier: null, division: null, lp: null };
}

export type RiotAccount = {
  game_name: string;
  tag_line: string;
  platform: string;
  tier: string | null;
  division: string | null;
  lp: number | null;
  last_synced_at: string | null;
};

export const getMyRiotAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RiotAccount | null> => {
    const { data } = await context.supabase
      .from("riot_accounts")
      .select("game_name, tag_line, platform, tier, division, lp, last_synced_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data ?? null;
  });

export const linkRiotAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        gameName: z.string().trim().min(3).max(16),
        tagLine: z.string().trim().replace(/^#/, "").min(2).max(5),
        platform: z.enum(PLATFORMS),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const region = regionFor(data.platform);
    const acc = await riot<{ puuid: string; gameName: string; tagLine: string }>(
      `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(data.gameName)}/${encodeURIComponent(data.tagLine)}`,
    );
    const rank = await fetchRank(data.platform, acc.puuid);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("riot_accounts").upsert({
      user_id: context.userId,
      puuid: acc.puuid,
      game_name: acc.gameName,
      tag_line: acc.tagLine,
      platform: data.platform,
      ...rank,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unlinkRiotAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("riot_accounts").delete().eq("user_id", context.userId);
    return { ok: true };
  });

type RiotMatch = {
  metadata: { matchId: string };
  info: {
    gameCreation: number;
    gameDuration: number;
    queueId: number;
    participants: Array<{
      puuid: string;
      win: boolean;
      kills: number;
      deaths: number;
      assists: number;
      championName: string;
      pentaKills: number;
      quadraKills: number;
      tripleKills: number;
      firstBloodKill: boolean;
      totalDamageDealtToChampions: number;
    }>;
  };
};

export const syncRiotMatches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: acc } = await context.supabase
      .from("riot_accounts")
      .select("puuid, platform")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!acc) throw new Error("riot_not_linked");
    const platform = acc.platform as Platform;
    const region = regionFor(platform);

    const ids = await riot<string[]>(
      `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${acc.puuid}/ids?start=0&count=10`,
    );
    const { data: existing } = await context.supabase
      .from("matches")
      .select("external_match_id")
      .eq("user_id", context.userId)
      .in("external_match_id", ids.length ? ids : ["-"]);
    const known = new Set((existing ?? []).map((r) => r.external_match_id));
    const fresh = ids.filter((id) => !known.has(id)).reverse();

    const { data: lol } = await context.supabase.from("games").select("id").eq("slug", "lol").maybeSingle();

    let imported = 0;
    let xp = 0;
    for (const id of fresh) {
      const m = await riot<RiotMatch>(`https://${region}.api.riotgames.com/lol/match/v5/matches/${id}`);
      const p = m.info.participants.find((x) => x.puuid === acc.puuid);
      if (!p || m.info.gameDuration < 300) continue;
      const team = m.info.participants;
      const topDmg = Math.max(...team.map((x) => x.totalDamageDealtToChampions));
      const medals =
        p.pentaKills * 3 + p.quadraKills * 2 + p.tripleKills + (p.firstBloodKill ? 1 : 0);
      const { data: row, error } = await context.supabase
        .from("matches")
        .insert({
          user_id: context.userId,
          game_id: lol?.id ?? null,
          game_name: "League of Legends",
          result: p.win ? "win" : "loss",
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          duration_minutes: Math.round(m.info.gameDuration / 60),
          medals: Math.min(50, medals),
          mvp: p.win && p.totalDamageDealtToChampions === topDmg,
          accuracy: 0,
          note: `Riot API · ${p.championName}`,
          played_at: new Date(m.info.gameCreation).toISOString(),
          external_match_id: id,
          source: "riot",
        })
        .select("xp")
        .single();
      if (error) continue;
      imported += 1;
      xp += row?.xp ?? 0;
    }

    const rank = await fetchRank(platform, acc.puuid);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("riot_accounts")
      .update({ ...rank, last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("user_id", context.userId);

    return { imported, xp, checked: ids.length };
  });
