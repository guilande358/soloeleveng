import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Contracts of the signed-in gamer with their progress milestone. */
export const listContracts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contracts")
      .select(
        "id, order_id, kind, status, commission_rate, started_at, ends_at, orders(card_id, mode), contract_progress(current_rank, medals, matches, percent, note)",
      )
      .eq("user_id", context.userId)
      .order("started_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);

    return (data ?? []).map((c) => {
      const progress = Array.isArray(c.contract_progress)
        ? c.contract_progress[0]
        : c.contract_progress;
      return {
        id: c.id,
        kind: c.kind,
        status: c.status,
        commissionRate: Number(c.commission_rate),
        startedAt: c.started_at,
        endsAt: c.ends_at,
        cardId: c.orders?.card_id ?? null,
        mode: c.orders?.mode ?? "friendly",
        percent: progress?.percent ?? 0,
        currentRank: progress?.current_rank ?? "",
        medals: progress?.medals ?? 0,
        matches: progress?.matches ?? 0,
        note: progress?.note ?? null,
      };
    });
  });

const ProgressInput = z.object({
  contractId: z.string().uuid(),
  percent: z.number().int().min(0).max(100),
  currentRank: z.string().trim().max(60).optional(),
  medals: z.number().int().min(0).max(999).optional(),
  matches: z.number().int().min(0).max(9999).optional(),
});

/** Advances contract progress; completing it closes the order and notifies the gamer. */
export const updateContractProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProgressInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: contract, error } = await context.supabase
      .from("contracts")
      .select("id, order_id, kind, status, commission_rate")
      .eq("id", data.contractId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!contract) throw new Error("contract_not_found");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const patch: {
      percent: number;
      current_rank?: string;
      medals?: number;
      matches?: number;
    } = { percent: data.percent };
    if (data.currentRank !== undefined) patch.current_rank = data.currentRank;
    if (data.medals !== undefined) patch.medals = data.medals;
    if (data.matches !== undefined) patch.matches = data.matches;


    await supabaseAdmin.from("contract_progress").update(patch).eq("contract_id", contract.id);

    if (data.percent >= 100 && contract.status === "active") {
      const now = new Date().toISOString();
      await supabaseAdmin
        .from("contracts")
        .update({ status: "completed", ends_at: now })
        .eq("id", contract.id);
      if (contract.order_id) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "completed", completed_at: now })
          .eq("id", contract.order_id);
      }
      await supabaseAdmin
        .from("profiles")
        .update({ active_card_id: null })
        .eq("id", context.userId);
      await supabaseAdmin.from("notifications").insert({
        user_id: context.userId,
        kind: "contract",
        title_pt: "Contrato concluído",
        title_en: "Contract completed",
        body_pt: "Rank objetivo alcançado. Já podes escolher uma nova carta.",
        body_en: "Target rank reached. You can pick a new card now.",
        metadata: { contract_id: contract.id },
      });
    }

    return { ok: true, completed: data.percent >= 100 };
  });
