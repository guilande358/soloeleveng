import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StatsSnapshot = {
  hours: number;
  wins: number;
  kd: number;
  mvps: number;
  accuracy: number;
  heroes: number;
  trend: number[];
};

/** Career stats for the signed-in gamer (null when none recorded yet). */
export const getMyStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StatsSnapshot | null> => {
    const { data, error } = await context.supabase
      .from("stats")
      .select("hours, wins, kd, mvps, accuracy, heroes, trend")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      hours: data.hours,
      wins: data.wins,
      kd: Number(data.kd),
      mvps: data.mvps,
      accuracy: data.accuracy,
      heroes: data.heroes,
      trend: Array.isArray(data.trend) ? data.trend.map(Number) : [],
    };
  });
