import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PRO_COMMISSION_RATE = 0.2;

const CheckoutInput = z.object({
  cardId: z.string().min(1).max(40),
  mode: z.enum(["friendly", "pro"]),
  method: z.enum(["wallet", "card", "paypal", "pix", "mpesa", "crypto"]),
});

function makeReference() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SEEV-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

/** Orders + open payment intent for the signed-in gamer. */
export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, card_id, status, mode, created_at, completed_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);

    const { data: intents } = await context.supabase
      .from("payment_intents")
      .select("id, reference, card_id, mode, method, amount, commission, total, status, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      orders: data ?? [],
      intents: (intents ?? []).map((i) => ({
        ...i,
        amount: Number(i.amount),
        commission: Number(i.commission),
        total: Number(i.total),
      })),
    };
  });

/**
 * Creates (or upgrades) the single open order and returns a payment reference.
 * The one-open-order-per-user rule is enforced by a unique index in the database.
 */
export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CheckoutInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: card, error: cardError } = await context.supabase
      .from("cards")
      .select("id, name, price")
      .eq("id", data.cardId)
      .maybeSingle();
    if (cardError) throw new Error(cardError.message);
    if (!card) throw new Error("card_not_found");

    const amount = Number(card.price);
    const commission = data.mode === "pro" ? Number((amount * PRO_COMMISSION_RATE).toFixed(2)) : 0;
    const total = Number((amount + commission).toFixed(2));

    const { data: open, error: openError } = await context.supabase
      .from("orders")
      .select("id, card_id, status")
      .eq("user_id", context.userId)
      .in("status", ["active", "pending_payment"])
      .maybeSingle();
    if (openError) throw new Error(openError.message);

    let orderId: string;

    if (open) {
      if (open.status === "active" && open.card_id === data.cardId) throw new Error("already_active");
      const { error } = await context.supabase
        .from("orders")
        .update({ card_id: data.cardId, mode: data.mode, status: "pending_payment" })
        .eq("id", open.id);
      if (error) throw new Error(error.message);
      orderId = open.id;
    } else {
      const { data: created, error } = await context.supabase
        .from("orders")
        .insert({
          user_id: context.userId,
          card_id: data.cardId,
          mode: data.mode,
          status: "pending_payment",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      orderId = created.id;
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("payment_intents")
      .update({ status: "cancelled" })
      .eq("user_id", context.userId)
      .eq("status", "pending");

    const reference = makeReference();
    const { data: intent, error: intentError } = await supabaseAdmin
      .from("payment_intents")
      .insert({
        user_id: context.userId,
        order_id: orderId,
        reference,
        card_id: data.cardId,
        mode: data.mode,
        method: data.method,
        amount,
        commission,
        total,
        status: "pending",
      })
      .select("reference, amount, commission, total, method, mode, status")
      .single();
    if (intentError) throw new Error(intentError.message);

    return {
      orderId,
      reference: intent.reference,
      amount: Number(intent.amount),
      commission: Number(intent.commission),
      total: Number(intent.total),
      upgraded: Boolean(open),
    };
  });

/**
 * Confirms a payment. Shares the settlement helper with the public webhook, so
 * a real gateway can call the webhook later without changing this logic.
 */
export const confirmPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ reference: z.string().min(6).max(60) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: intent, error } = await context.supabase
      .from("payment_intents")
      .select("id, user_id")
      .eq("reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!intent || intent.user_id !== context.userId) throw new Error("payment_not_found");

    const { settlePayment } = await import("@/lib/payments.server");
    return settlePayment(data.reference);
  });

/** Cancels the open order and its pending payment intent. */
export const cancelOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", data.orderId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("payment_intents")
      .update({ status: "cancelled" })
      .eq("order_id", data.orderId)
      .eq("status", "pending");
    await supabaseAdmin
      .from("contracts")
      .update({ status: "cancelled" })
      .eq("order_id", data.orderId)
      .eq("status", "active");
    await supabaseAdmin
      .from("profiles")
      .update({ active_card_id: null })
      .eq("id", context.userId);

    return { ok: true };
  });
