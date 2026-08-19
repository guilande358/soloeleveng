import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type TimelineEntry = { at: string; pt: string; en: string };
export type InsightEntry = { pt: string; en: string };

export type HighlightItem = {
  id: string;
  user_id: string;
  title_pt: string;
  title_en: string;
  game: string;
  map: string;
  match_date: string;
  duration: string;
  kda: string;
  tags: string[];
  hue: string;
  timeline: TimelineEntry[];
  insights: InsightEntry[];
  video_url: string | null;
  is_public: boolean;
  created_at: string;
};

const SELECT =
  "id, user_id, title_pt, title_en, game, map, match_date, duration, kda, tags, hue, timeline, insights, video_url, is_public, created_at";

function normalize(row: Record<string, unknown>): HighlightItem {
  return {
    ...(row as unknown as HighlightItem),
    tags: Array.isArray(row["tags"]) ? (row["tags"] as string[]) : [],
    timeline: Array.isArray(row["timeline"]) ? (row["timeline"] as TimelineEntry[]) : [],
    insights: Array.isArray(row["insights"]) ? (row["insights"] as InsightEntry[]) : [],
  };
}

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public feed of shared highlights (anyone can read). */
export const listPublicHighlights = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("highlights")
    .select(SELECT)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => normalize(r as Record<string, unknown>));
});

/** Highlights owned by the signed-in gamer, public or not. */
export const listMyHighlights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("highlights")
      .select(SELECT)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(24);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => normalize(r as Record<string, unknown>));
  });

/** Toggles whether one of my highlights is shared publicly. */
export const setHighlightVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), isPublic: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("highlights")
      .update({ is_public: data.isPublic })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Records a new highlight for the signed-in gamer. */
export const createHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(2).max(80),
        game: z.string().trim().min(1).max(60),
        map: z.string().trim().min(1).max(60),
        duration: z.string().trim().min(1).max(12),
        kda: z.string().trim().min(1).max(20),
        tags: z.array(z.string().trim().min(1).max(20)).max(6).optional(),
        videoUrl: z.string().url().max(400).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("highlights")
      .insert({
        user_id: context.userId,
        title_pt: data.title,
        title_en: data.title,
        game: data.game,
        map: data.map,
        match_date: new Date().toISOString().slice(0, 10),
        duration: data.duration,
        kda: data.kda,
        tags: data.tags ?? [],
        hue: "var(--neon-cyan)",
        video_url: data.videoUrl ?? null,
        is_public: true,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });
