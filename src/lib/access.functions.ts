import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
function makeToken(length = 10) {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

const CreateAccessInput = z.object({
  game: z.string().min(1).max(80),
  minutes: z.number().int().min(5).max(1440).default(15),
});

export const listAccessLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("access_links")
      .select("id, token, game, expires_at, revoked, used_at, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createAccessLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateAccessInput.parse(input))
  .handler(async ({ data, context }) => {
    const token = makeToken();
    const expiresAt = new Date(Date.now() + data.minutes * 60_000).toISOString();
    const { data: row, error } = await context.supabase
      .from("access_links")
      .insert({
        user_id: context.userId,
        token,
        game: data.game,
        expires_at: expiresAt,
        revoked: false,
      })
      .select("id, token, game, expires_at, revoked, used_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const revokeAccessLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("access_links")
      .update({ revoked: true })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
