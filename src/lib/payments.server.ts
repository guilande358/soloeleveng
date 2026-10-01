import { createHmac, timingSafeEqual } from "crypto";

/** HMAC signature shared by the internal payment provider and the webhook route. */
export function signPayload(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifySignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = signPayload(body, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type SettleResult = {
  ok: boolean;
  status: string;
  orderId: string | null;
  contractId: string | null;
  alreadySettled: boolean;
};

/**
 * Settles a payment intent: debits the wallet, activates the order, creates the
 * contract with its commission and seeds progress. Idempotent per reference.
 */
export async function settlePayment(reference: string): Promise<SettleResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: intent, error } = await supabaseAdmin
    .from("payment_intents")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!intent) throw new Error("payment_not_found");

  if (intent.status === "paid") {
    const { data: existing } = await supabaseAdmin
      .from("contracts")
      .select("id")
      .eq("order_id", intent.order_id ?? "")
      .maybeSingle();
    return {
      ok: true,
      status: "paid",
      orderId: intent.order_id,
      contractId: existing?.id ?? null,
      alreadySettled: true,
    };
  }

  const amount = Number(intent.amount);
  const commission = Number(intent.commission);
  const total = Number(intent.total);

  if (total <= 0) {
    // Free starter card: nothing to charge, just log the activation.
    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: intent.user_id,
      kind: "purchase",
      amount: 0,
      description: `Carta ${intent.card_id} (gratuita)`,
      metadata: { reference, free: true },
    });
  } else if (intent.method === "wallet") {
    const { error: debitError } = await supabaseAdmin.rpc("apply_wallet_delta", {
      _user_id: intent.user_id,
      _kind: "purchase",
      _amount: -amount,
      _description: `Carta ${intent.card_id}`,
      _metadata: { reference, card_id: intent.card_id },
    });
    if (debitError) {
      throw new Error(
        debitError.message.includes("insufficient_funds")
          ? "insufficient_funds"
          : debitError.message,
      );
    }
    if (commission > 0) {
      const { error: commissionError } = await supabaseAdmin.rpc("apply_wallet_delta", {
        _user_id: intent.user_id,
        _kind: "commission",
        _amount: -commission,
        _description: "Comissão GamerPRO",
        _metadata: { reference, rate: commission / amount },
      });
      if (commissionError) throw new Error(commissionError.message);
    }
  } else {
    // External/simulated method: record the charge without touching the balance.
    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: intent.user_id,
      kind: "purchase",
      amount: -total,
      description: `Carta ${intent.card_id} (${intent.method})`,
      metadata: { reference, external: true, commission },
    });
  }

  if (intent.order_id) {
    await supabaseAdmin
      .from("orders")
      .update({ status: "active", mode: intent.mode })
      .eq("id", intent.order_id);
  }

  await supabaseAdmin
    .from("profiles")
    .update({ active_card_id: intent.card_id, mode: intent.mode })
    .eq("id", intent.user_id);

  const { data: card } = await supabaseAdmin
    .from("cards")
    .select("current_rank, target_rank, medals, name")
    .eq("id", intent.card_id)
    .maybeSingle();

  const { data: contract, error: contractError } = await supabaseAdmin
    .from("contracts")
    .insert({
      user_id: intent.user_id,
      order_id: intent.order_id,
      kind: intent.mode === "pro" ? "gamerpro" : "friendly",
      status: "active",
      commission_rate: amount > 0 ? commission / amount : 0,
    })
    .select("id")
    .single();
  if (contractError) throw new Error(contractError.message);

  await supabaseAdmin.from("contract_progress").insert({
    contract_id: contract.id,
    user_id: intent.user_id,
    current_rank: card?.current_rank ?? "",
    medals: 0,
    matches: 0,
    percent: 0,
    note: card ? `${card.current_rank} → ${card.target_rank}` : null,
  });

  await supabaseAdmin.from("payment_intents").update({ status: "paid" }).eq("id", intent.id);

  await supabaseAdmin.from("notifications").insert({
    user_id: intent.user_id,
    kind: "order",
    title_pt: "Pagamento confirmado",
    title_en: "Payment confirmed",
    body_pt: `${card?.name ?? "Carta"} Card iniciado.`,
    body_en: `${card?.name ?? "Card"} Card started.`,
    metadata: { reference },
  });

  return {
    ok: true,
    status: "paid",
    orderId: intent.order_id,
    contractId: contract.id,
    alreadySettled: false,
  };
}
