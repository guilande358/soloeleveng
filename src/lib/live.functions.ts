import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Starts (or reuses) the signed-in gamer's live room. */
export const startLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(1).max(80),
        game: z.string().trim().min(1).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("live_rooms")
      .select("id")
      .eq("user_id", context.userId)
      .eq("is_live", true)
      .maybeSingle();

    if (existing) {
      const { error } = await context.supabase
        .from("live_rooms")
        .update({ title: data.title, game: data.game })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { id: existing.id };
    }

    const { data: room, error } = await context.supabase
      .from("live_rooms")
      .insert({
        user_id: context.userId,
        title: data.title,
        game: data.game,
        provider: "webrtc",
        is_live: true,
        viewer_count: 0,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: room.id };
  });

/** Ends a live room owned by the signed-in gamer. */
export const endLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ roomId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("live_rooms")
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq("id", data.roomId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Sends a coffee gift: debits the sender's wallet and credits the streamer,
 * both through the single wallet-movement function.
 */
export const sendCoffee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        recipientId: z.string().uuid(),
        amount: z.number().positive().max(500),
        message: z.string().trim().max(160).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.recipientId === context.userId) throw new Error("self_gift");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: debitError } = await supabaseAdmin.rpc("apply_wallet_delta", {
      _user_id: context.userId,
      _kind: "coffee_sent",
      _amount: -data.amount,
      _description: "Café enviado",
      _metadata: { recipient: data.recipientId },
    });
    if (debitError) {
      throw new Error(
        debitError.message.includes("insufficient_funds")
          ? "insufficient_funds"
          : debitError.message,
      );
    }

    const { error: creditError } = await supabaseAdmin.rpc("apply_wallet_delta", {
      _user_id: data.recipientId,
      _kind: "coffee_received",
      _amount: data.amount,
      _description: "Café recebido",
      _metadata: { sender: context.userId },
      _coffee_delta: 1,
    });
    if (creditError) throw new Error(creditError.message);

    await supabaseAdmin.from("coffee_gifts").insert({
      sender_id: context.userId,
      recipient_id: data.recipientId,
      amount: data.amount,
      message: data.message ?? null,
    });

    await supabaseAdmin.from("notifications").insert({
      user_id: data.recipientId,
      kind: "coffee",
      title_pt: "Recebeste um café",
      title_en: "You received a coffee",
      body_pt: `+ ${data.amount.toFixed(2)} USD na tua carteira.`,
      body_en: `+ ${data.amount.toFixed(2)} USD in your wallet.`,
      metadata: { sender: context.userId },
    });

    return { ok: true };
  });

/** Coffee gifts received by the signed-in gamer. */
export const listCoffeeGifts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("coffee_gifts")
      .select("id, sender_id, recipient_id, amount, message, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return (data ?? []).map((g) => ({ ...g, amount: Number(g.amount) }));
  });
