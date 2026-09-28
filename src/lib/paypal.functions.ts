import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OriginInput = z.object({
  origin: z.string().url().max(200),
});

function urls(origin: string, extra: string) {
  return {
    returnUrl: `${origin}/pagamento?${extra}`,
    cancelUrl: `${origin}/pagamento?cancelado=1`,
  };
}

/** Starts a PayPal payment for an open payment intent and returns the approval URL. */
export const startPaypalPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    OriginInput.extend({ reference: z.string().min(6).max(60) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: intent, error } = await context.supabase
      .from("payment_intents")
      .select("reference, total, card_id, status, user_id")
      .eq("reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!intent || intent.user_id !== context.userId) throw new Error("payment_not_found");
    if (intent.status !== "pending") throw new Error("payment_already_settled");

    const { createPaypalOrder } = await import("@/lib/paypal.server");
    const { returnUrl, cancelUrl } = urls(
      data.origin,
      `ref=${encodeURIComponent(intent.reference)}`,
    );

    const order = await createPaypalOrder({
      amount: Number(intent.total),
      reference: intent.reference,
      description: `Carta ${intent.card_id} — Solo Eleveng Evolution`,
      returnUrl,
      cancelUrl,
    });

    return { approveUrl: order.approveUrl, paypalOrderId: order.id };
  });

/** Captures the approved PayPal order and settles the card purchase. */
export const capturePaypalPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ paypalOrderId: z.string().min(5).max(60) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { capturePaypalOrder } = await import("@/lib/paypal.server");
    const capture = await capturePaypalOrder(data.paypalOrderId);
    if (!capture.ok || !capture.reference) throw new Error("paypal_not_approved");

    const { data: intent, error } = await context.supabase
      .from("payment_intents")
      .select("reference, total, user_id, status")
      .eq("reference", capture.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!intent || intent.user_id !== context.userId) throw new Error("payment_not_found");
    if (capture.amount > 0 && capture.amount + 0.01 < Number(intent.total)) {
      throw new Error("paypal_amount_mismatch");
    }

    const { settlePayment } = await import("@/lib/payments.server");
    return settlePayment(intent.reference);
  });

/** Starts a PayPal top-up for the wallet and returns the approval URL. */
export const startPaypalTopUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    OriginInput.extend({ amount: z.number().positive().max(1000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const reference = `TOPUP-${context.userId}-${Date.now().toString(36).toUpperCase()}`;
    const { createPaypalOrder } = await import("@/lib/paypal.server");
    const { returnUrl, cancelUrl } = urls(data.origin, "recarga=1");

    const order = await createPaypalOrder({
      amount: Number(data.amount.toFixed(2)),
      reference,
      description: "Recarga da carteira — Solo Eleveng Evolution",
      returnUrl,
      cancelUrl,
    });

    return { approveUrl: order.approveUrl, paypalOrderId: order.id };
  });

/** Captures an approved PayPal top-up and credits the wallet once. */
export const capturePaypalTopUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ paypalOrderId: z.string().min(5).max(60) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { capturePaypalOrder } = await import("@/lib/paypal.server");
    const capture = await capturePaypalOrder(data.paypalOrderId);
    if (!capture.ok || !capture.reference) throw new Error("paypal_not_approved");
    if (!capture.reference.startsWith(`TOPUP-${context.userId}`)) throw new Error("forbidden");
    if (capture.amount <= 0) throw new Error("paypal_amount_mismatch");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("wallet_transactions")
      .select("id")
      .eq("user_id", context.userId)
      .eq("metadata->>paypal_order_id", data.paypalOrderId)
      .maybeSingle();
    if (existing) return { ok: true, credited: 0, alreadyCredited: true };

    const { error } = await supabaseAdmin.rpc("apply_wallet_delta", {
      _user_id: context.userId,
      _kind: "deposit",
      _amount: capture.amount,
      _description: "Recarga via PayPal",
      _metadata: {
        paypal_order_id: data.paypalOrderId,
        capture_id: capture.captureId,
        reference: capture.reference,
      },
    });
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      kind: "wallet",
      title_pt: "Recarga confirmada",
      title_en: "Top-up confirmed",
      body_pt: `${capture.amount.toFixed(2)} USD adicionados via PayPal.`,
      body_en: `${capture.amount.toFixed(2)} USD added via PayPal.`,
      metadata: { paypal_order_id: data.paypalOrderId },
    });

    return { ok: true, credited: capture.amount, alreadyCredited: false };
  });
