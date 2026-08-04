import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type CardRow = Database["public"]["Tables"]["cards"]["Row"];

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Public card catalogue (Iron → Legendary). */
export const listCards = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("cards")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({ ...c, price: Number(c.price) }));
});

/** Public list of live rooms currently streaming. */
export const listLiveRooms = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("live_rooms")
    .select("id, user_id, title, game, viewer_count, started_at, is_live, provider_url")
    .eq("is_live", true)
    .order("started_at", { ascending: false })
    .limit(12);
  if (error) throw new Error(error.message);
  return data ?? [];
});
