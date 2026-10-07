import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CloudSave = {
  id: string;
  gameName: string;
  slot: string;
  fileName: string;
  storagePath: string;
  sizeBytes: number;
  sha256: string;
  note: string | null;
  createdAt: string;
};

export const listCloudSaves = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CloudSave[]> => {
    const { data, error } = await context.supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id,
      gameName: r.game_name,
      slot: r.slot,
      fileName: r.file_name,
      storagePath: r.storage_path,
      sizeBytes: Number(r.size_bytes),
      sha256: r.sha256,
      note: r.note,
      createdAt: r.created_at,
    }));
  });

const registerSchema = z.object({
  gameName: z.string().trim().min(1).max(80),
  slot: z.string().trim().min(1).max(40),
  fileName: z.string().trim().min(1).max(200),
  storagePath: z.string().min(1).max(400),
  sizeBytes: z.number().int().min(0).max(52428800),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  note: z.string().max(300).optional(),
});

export const registerCloudSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => registerSchema.parse(d))
  .handler(async ({ data, context }) => {
    if (!data.storagePath.startsWith(`${context.userId}/`)) throw new Error("Forbidden");
    const { error } = await context.supabase.from("game_saves").insert({
      user_id: context.userId,
      game_name: data.gameName,
      slot: data.slot,
      file_name: data.fileName,
      storage_path: data.storagePath,
      size_bytes: data.sizeBytes,
      sha256: data.sha256,
      note: data.note || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Signed link: own download (5 min) or share token for duo/booster (15 min). */
export const getCloudSaveLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), share: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("game_saves")
      .select("storage_path, file_name")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error || !row) throw new Error("not_found");
    const ttl = data.share ? 900 : 300;
    const { data: signed, error: sErr } = await context.supabase.storage
      .from("game-saves")
      .createSignedUrl(row.storage_path, ttl, { download: row.file_name });
    if (sErr || !signed) throw new Error(sErr?.message ?? "sign_failed");
    return { url: signed.signedUrl, expiresIn: ttl };
  });

export const deleteCloudSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("game_saves")
      .select("storage_path")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!row) throw new Error("not_found");
    await context.supabase.storage.from("game-saves").remove([row.storage_path]);
    const { error } = await context.supabase.from("game_saves").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
