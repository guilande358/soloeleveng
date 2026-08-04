import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type WalletSnapshot = {
  balance: number;
  pending: number;
  coffeeCount: number;
  earnings: number;
  spent: number;
  transactions: {
    id: string;
    kind: string;
    amount: number;
    description: string;
    created_at: string;
  }[];
  payouts: {
    id: string;
    amount: number;
    method: string;
    destination: string;
    status: string;
    created_at: string;
  }[];
};

/** Wallet balance, statement and payout requests for the signed-in gamer. */
export const getWallet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WalletSnapshot> => {
    let { data: wallet } = await context.supabase
      .from("wallets")
      .select("balance, pending, coffee_count")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!wallet) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("wallets")
        .insert({ user_id: context.userId, balance: 0, coffee_count: 0, pending: 0 });
      wallet = { balance: 0, pending: 0, coffee_count: 0 };
    }

    const { data: transactions, error: txError } = await context.supabase
      .from("wallet_transactions")
      .select("id, kind, amount, description, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (txError) throw new Error(txError.message);

    const { data: payouts, error: payoutError } = await context.supabase
      .from("payout_requests")
      .select("id, amount, method, destination, status, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (payoutError) throw new Error(payoutError.message);

    const rows = (transactions ?? []).map((t) => ({ ...t, amount: Number(t.amount) }));
    const earnings = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const spent = rows.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);

    return {
      balance: Number(wallet.balance),
      pending: Number(wallet.pending),
      coffeeCount: wallet.coffee_count,
      earnings,
      spent,
      transactions: rows,
      payouts: (payouts ?? []).map((p) => ({ ...p, amount: Number(p.amount) })),
    };
  });

const PayoutInput = z.object({
  amount: z.number().positive().max(100_000),
  method: z.enum(["pix", "mpesa", "paypal", "crypto", "bank"]),
  destination: z.string().trim().min(4).max(120),
});

const MIN_PAYOUT = 10;

/** Request a withdrawal: locks the amount as pending and records the statement entry. */
export const requestPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PayoutInput.parse(input))
  .handler(async ({ data, context }) => {
    if (data.amount < MIN_PAYOUT) throw new Error("min_payout");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const masked =
      data.destination.length > 6
        ? `${data.destination.slice(0, 3)}***${data.destination.slice(-3)}`
        : "***";

    const { error: deltaError } = await supabaseAdmin.rpc("apply_wallet_delta", {
      _user_id: context.userId,
      _kind: "payout",
      _amount: -data.amount,
      _description: `Saque via ${data.method}`,
      _metadata: { method: data.method, destination: masked },
      _pending_delta: data.amount,
    });
    if (deltaError) {
      throw new Error(
        deltaError.message.includes("insufficient_funds") ? "insufficient_funds" : deltaError.message,
      );
    }

    const { data: row, error } = await supabaseAdmin
      .from("payout_requests")
      .insert({
        user_id: context.userId,
        amount: data.amount,
        method: data.method,
        destination: masked,
        status: "pending",
      })
      .select("id, amount, method, destination, status, created_at")
      .single();
    if (error) throw new Error(error.message);

    return { ...row, amount: Number(row.amount) };
  });

/** Simulated top-up while no external payment provider is connected. */
export const topUpWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ amount: z.number().positive().max(1000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("apply_wallet_delta", {
      _user_id: context.userId,
      _kind: "deposit",
      _amount: data.amount,
      _description: "Recarga simulada",
      _metadata: { simulated: true },
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
