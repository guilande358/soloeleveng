import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> }; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("forbidden");
}

export type AdminOverview = {
  orders: {
    id: string;
    user_id: string;
    card_id: string;
    status: string;
    mode: string;
    created_at: string;
    player: string;
  }[];
  contracts: {
    id: string;
    user_id: string;
    kind: string;
    status: string;
    commission_rate: number;
    started_at: string;
    player: string;
    percent: number;
  }[];
  lives: {
    id: string;
    user_id: string;
    title: string;
    game: string;
    is_live: boolean;
    viewer_count: number;
    started_at: string;
    player: string;
  }[];
  wallets: {
    user_id: string;
    balance: number;
    pending: number;
    coffee_count: number;
    player: string;
  }[];
  payouts: {
    id: string;
    user_id: string;
    amount: number;
    method: string;
    destination: string;
    status: string;
    created_at: string;
    player: string;
  }[];
  totals: { balance: number; pending: number; activeContracts: number; liveNow: number };
};

/** Full operational snapshot for the administrator. */
export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    await assertAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profiles, orders, contracts, progress, lives, wallets, payouts] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, name"),
      supabaseAdmin
        .from("orders")
        .select("id, user_id, card_id, status, mode, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin
        .from("contracts")
        .select("id, user_id, kind, status, commission_rate, started_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin.from("contract_progress").select("contract_id, percent"),
      supabaseAdmin
        .from("live_rooms")
        .select("id, user_id, title, game, is_live, viewer_count, started_at")
        .order("started_at", { ascending: false })
        .limit(60),
      supabaseAdmin.from("wallets").select("user_id, balance, pending, coffee_count").limit(200),
      supabaseAdmin
        .from("payout_requests")
        .select("id, user_id, amount, method, destination, status, created_at")
        .order("created_at", { ascending: false })
        .limit(80),
    ]);

    const names = new Map((profiles.data ?? []).map((p) => [p.id, p.name]));
    const percents = new Map((progress.data ?? []).map((p) => [p.contract_id, p.percent]));
    const player = (id: string) => names.get(id) ?? id.slice(0, 8);

    const walletRows = (wallets.data ?? []).map((w) => ({
      user_id: w.user_id,
      balance: Number(w.balance),
      pending: Number(w.pending),
      coffee_count: w.coffee_count,
      player: player(w.user_id),
    }));
    const contractRows = (contracts.data ?? []).map((c) => ({
      ...c,
      commission_rate: Number(c.commission_rate),
      player: player(c.user_id),
      percent: percents.get(c.id) ?? 0,
    }));
    const liveRows = (lives.data ?? []).map((l) => ({ ...l, player: player(l.user_id) }));

    return {
      orders: (orders.data ?? []).map((o) => ({ ...o, player: player(o.user_id) })),
      contracts: contractRows,
      lives: liveRows,
      wallets: walletRows,
      payouts: (payouts.data ?? []).map((p) => ({
        ...p,
        amount: Number(p.amount),
        player: player(p.user_id),
      })),
      totals: {
        balance: walletRows.reduce((s, w) => s + w.balance, 0),
        pending: walletRows.reduce((s, w) => s + w.pending, 0),
        activeContracts: contractRows.filter((c) => c.status === "active").length,
        liveNow: liveRows.filter((l) => l.is_live).length,
      },
    };
  });

/** Changes an order status. */
export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending_payment", "active", "completed", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        status: data.status,
        completed_at: data.status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Changes a contract status. */
export const adminSetContractStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["active", "paused", "completed", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("contracts")
      .update({
        status: data.status,
        ends_at:
          data.status === "completed" || data.status === "cancelled"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Force-ends a live room. */
export const adminEndLive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("live_rooms")
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Approves or rejects a payout request, settling the pending amount. */
export const adminResolvePayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), decision: z.enum(["paid", "rejected"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: payout, error } = await supabaseAdmin
      .from("payout_requests")
      .select("id, user_id, amount, status, method")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!payout) throw new Error("payout_not_found");
    if (payout.status !== "pending") throw new Error("payout_already_resolved");

    const amount = Number(payout.amount);

    if (data.decision === "paid") {
      // Amount already left the balance on request: only release the hold.
      const { error: deltaError } = await supabaseAdmin.rpc("apply_wallet_delta", {
        _user_id: payout.user_id,
        _kind: "payout_paid",
        _amount: 0,
        _description: `Saque pago via ${payout.method}`,
        _metadata: { payout_id: payout.id, amount },
        _pending_delta: -amount,
      });
      if (deltaError) throw new Error(deltaError.message);
    } else {
      const { error: deltaError } = await supabaseAdmin.rpc("apply_wallet_delta", {
        _user_id: payout.user_id,
        _kind: "payout_refund",
        _amount: amount,
        _description: "Saque recusado — valor devolvido",
        _metadata: { payout_id: payout.id },
        _pending_delta: -amount,
      });
      if (deltaError) throw new Error(deltaError.message);
    }

    await supabaseAdmin
      .from("payout_requests")
      .update({ status: data.decision })
      .eq("id", payout.id);

    await supabaseAdmin.from("notifications").insert({
      user_id: payout.user_id,
      kind: "wallet",
      title_pt: data.decision === "paid" ? "Saque pago" : "Saque recusado",
      title_en: data.decision === "paid" ? "Payout paid" : "Payout rejected",
      body_pt: `${amount.toFixed(2)} USD via ${payout.method}.`,
      body_en: `${amount.toFixed(2)} USD via ${payout.method}.`,
      metadata: { payout_id: payout.id },
    });

    return { ok: true };
  });

/** Manual balance adjustment, always recorded in the statement. */
export const adminAdjustBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        amount: z.number().min(-100_000).max(100_000),
        description: z.string().trim().min(3).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as Ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("apply_wallet_delta", {
      _user_id: data.userId,
      _kind: "adjustment",
      _amount: data.amount,
      _description: data.description,
      _metadata: { by: context.userId },
    });
    if (error) {
      throw new Error(
        error.message.includes("insufficient_funds") ? "insufficient_funds" : error.message,
      );
    }
    return { ok: true };
  });
