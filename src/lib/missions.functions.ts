import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MissionEntry = {
  id: string;
  labelPt: string;
  labelEn: string;
  cycle: string;
  kind: string;
  total: number;
  xp: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
};

/** Mission catalogue with the signed-in gamer's real progress. */
export const listMissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MissionEntry[]> => {
    const { data: missions, error } = await context.supabase
      .from("missions")
      .select("id, label_pt, label_en, cycle, kind, total, xp, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);

    const { data: progress, error: progressError } = await context.supabase
      .from("user_mission_progress")
      .select("mission_id, progress, completed, claimed")
      .eq("user_id", context.userId);
    if (progressError) throw new Error(progressError.message);

    const byMission = new Map((progress ?? []).map((p) => [p.mission_id, p]));

    return (missions ?? []).map((m) => {
      const p = byMission.get(m.id);
      return {
        id: m.id,
        labelPt: m.label_pt,
        labelEn: m.label_en,
        cycle: m.cycle,
        kind: m.kind,
        total: m.total,
        xp: m.xp,
        progress: Math.min(p?.progress ?? 0, m.total),
        completed: Boolean(p?.completed) || (p?.progress ?? 0) >= m.total,
        claimed: Boolean(p?.claimed),
      };
    });
  });

/** Claims the XP reward of a completed mission. */
export const claimMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ missionId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: mission, error } = await context.supabase
      .from("missions")
      .select("id, total, xp, label_pt, label_en")
      .eq("id", data.missionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!mission) throw new Error("mission_not_found");

    const { data: progress } = await context.supabase
      .from("user_mission_progress")
      .select("id, progress, claimed")
      .eq("user_id", context.userId)
      .eq("mission_id", mission.id)
      .maybeSingle();

    if (!progress || progress.progress < mission.total) throw new Error("mission_incomplete");
    if (progress.claimed) throw new Error("mission_claimed");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await supabaseAdmin
      .from("user_mission_progress")
      .update({ claimed: true, completed: true })
      .eq("id", progress.id);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("xp")
      .eq("id", context.userId)
      .maybeSingle();

    const nextXp = (profile?.xp ?? 0) + mission.xp;
    await supabaseAdmin
      .from("profiles")
      .update({ xp: nextXp, level: Math.max(1, Math.floor(nextXp / 1000) + 1) })
      .eq("id", context.userId);

    await supabaseAdmin.from("notifications").insert({
      user_id: context.userId,
      kind: "mission",
      title_pt: "Missão concluída",
      title_en: "Mission completed",
      body_pt: `${mission.label_pt} — +${mission.xp} XP`,
      body_en: `${mission.label_en} — +${mission.xp} XP`,
      metadata: { mission_id: mission.id },
    });

    return { ok: true, xp: nextXp };
  });
