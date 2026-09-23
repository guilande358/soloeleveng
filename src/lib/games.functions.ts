import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type GameRow = Database["public"]["Tables"]["games"]["Row"];

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

/** Public catalogue of supported games with their access/protection rules. */
export const listGames = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("games")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const GameInput = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(60),
  hue: z.string().trim().min(2).max(60).default("var(--neon-cyan)"),
  elevation_enabled: z.boolean().default(true),
  access_rules_pt: z.string().trim().max(600).default(""),
  access_rules_en: z.string().trim().max(600).default(""),
  protection_rules_pt: z.string().trim().max(600).default(""),
  protection_rules_en: z.string().trim().max(600).default(""),
  max_sessions: z.number().int().min(1).max(10).default(1),
  sort_order: z.number().int().min(0).max(999).default(0),
});

/** True when the signed-in user holds the admin role. */
export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return { admin: Boolean(data) };
  });

/** Creates a supported game. RLS restricts writes to admins. */
export const createGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GameInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("games")
      .insert(data)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/** Updates a supported game. RLS restricts writes to admins. */
export const updateGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), patch: GameInput.partial() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch = Object.fromEntries(
      Object.entries(data.patch).filter(([, v]) => v !== undefined),
    ) as Database["public"]["Tables"]["games"]["Update"];
    const { data: row, error } = await context.supabase
      .from("games")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/** Removes a supported game. RLS restricts writes to admins. */
export const deleteGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("games").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
