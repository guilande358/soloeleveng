import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { ActionButton, Chip } from "@/components/os/ui";
import { useI18n } from "@/lib/i18n";
import {
  getMyRiotAccount,
  linkRiotAccount,
  syncRiotMatches,
  unlinkRiotAccount,
} from "@/lib/riot.functions";

const PLATFORMS = ["br1", "euw1", "eun1", "na1", "la1", "la2", "kr", "jp1", "oc1", "tr1", "ru"] as const;

function errText(e: unknown, pt: boolean) {
  const m = e instanceof Error ? e.message : "";
  if (m.includes("riot_key_missing")) return pt ? "Chave da Riot ainda não configurada" : "Riot key not configured";
  if (m.includes("riot_key_invalid")) return pt ? "Chave da Riot inválida ou expirada" : "Riot key invalid or expired";
  if (m.includes("riot_not_found")) return pt ? "Riot ID não encontrado" : "Riot ID not found";
  if (m.includes("riot_rate_limited")) return pt ? "Muitos pedidos — tente em 2 min" : "Rate limited — retry in 2 min";
  return pt ? "Falha na ligação à Riot" : "Riot connection failed";
}

export function RiotConnect() {
  const { lang } = useI18n();
  const pt = lang === "pt";
  const qc = useQueryClient();
  const getFn = useServerFn(getMyRiotAccount);
  const linkFn = useServerFn(linkRiotAccount);
  const syncFn = useServerFn(syncRiotMatches);
  const unlinkFn = useServerFn(unlinkRiotAccount);
  const { data: acc } = useQuery({ queryKey: ["riot"], queryFn: () => getFn() });
  const [riotId, setRiotId] = useState("");
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("br1");

  const link = useMutation({
    mutationFn: () => {
      const [gameName, tagLine] = riotId.split("#");
      if (!gameName || !tagLine) throw new Error("format");
      return linkFn({ data: { gameName, tagLine, platform } });
    },
    onSuccess: () => {
      toast.success(pt ? "Conta Riot vinculada" : "Riot account linked");
      void qc.invalidateQueries({ queryKey: ["riot"] });
    },
    onError: (e) =>
      toast.error(e instanceof Error && e.message === "format" ? (pt ? "Use o formato Nome#TAG" : "Use Name#TAG") : errText(e, pt)),
  });

  const sync = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r) => {
      toast.success(
        pt ? `${r.imported} novas partidas · +${r.xp} XP` : `${r.imported} new matches · +${r.xp} XP`,
      );
      for (const k of ["riot", "progression", "matches", "missions", "contracts", "notifications"])
        void qc.invalidateQueries({ queryKey: [k] });
    },
    onError: (e) => toast.error(errText(e, pt)),
  });

  const unlink = useMutation({
    mutationFn: () => unlinkFn(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["riot"] }),
  });

  const input = "rounded-md border border-border bg-background px-2 py-1.5 text-xs";

  return (
    <div className="space-y-2 rounded-xl border border-border/50 bg-surface-2/40 p-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-[12px]">Riot Games · League of Legends</p>
        <Chip glow="var(--neon-cyan)">{pt ? "API oficial" : "Official API"}</Chip>
      </div>
      {acc ? (
        <>
          <p className="text-xs">
            {acc.game_name}#{acc.tag_line} · {acc.platform.toUpperCase()} ·{" "}
            {acc.tier ? `${acc.tier} ${acc.division ?? ""} ${acc.lp ?? 0} LP` : pt ? "Sem rank" : "Unranked"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {pt ? "Última sincronização" : "Last sync"}:{" "}
            {acc.last_synced_at ? new Date(acc.last_synced_at).toLocaleString() : "—"}
          </p>
          <div className="flex gap-2">
            <ActionButton onClick={() => !sync.isPending && sync.mutate()}>
              {sync.isPending ? "..." : pt ? "Sincronizar partidas" : "Sync matches"}
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => unlink.mutate()}>
              {pt ? "Desvincular" : "Unlink"}
            </ActionButton>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-2">
          <input
            className={input}
            placeholder="Nome#BR1"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
          />
          <select className={input} value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>
          <ActionButton onClick={() => !link.isPending && link.mutate()}>
            {link.isPending ? "..." : pt ? "Vincular" : "Link"}
          </ActionButton>
        </div>
      )}
    </div>
  );
}
