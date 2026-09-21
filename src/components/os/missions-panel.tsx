import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { ActionButton, Chip, Meter } from "@/components/os/ui";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { claimMission, listMissions, type MissionEntry } from "@/lib/missions.functions";

const CYCLE_LABEL: Record<string, { pt: string; en: string }> = {
  daily: { pt: "Diária", en: "Daily" },
  weekly: { pt: "Semanal", en: "Weekly" },
  monthly: { pt: "Mensal", en: "Monthly" },
};

function useMissions() {
  const { userId } = useHud();
  const fetchMissions = useServerFn(listMissions);
  return useQuery({
    queryKey: ["missions"],
    queryFn: () => fetchMissions(),
    enabled: Boolean(userId),
  });
}

export function MissionsWidget() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const { data } = useMissions();

  if (!userId) {
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt"
          ? "Entre para acompanhar as missões que avançam com as suas partidas."
          : "Sign in to track missions that advance with your matches."}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {(data ?? []).slice(0, 3).map((m) => (
        <div key={m.id}>
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="truncate text-muted-foreground">{lang === "pt" ? m.labelPt : m.labelEn}</span>
            <span className="font-display">
              {m.progress}/{m.total}
            </span>
          </div>
          <div className="mt-1">
            <Meter value={m.progress} max={m.total} glow="var(--neon-green)" />
          </div>
        </div>
      ))}
      {data && data.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt" ? "Sem missões ativas." : "No active missions."}
        </p>
      )}
    </div>
  );
}

export function MissionsFull() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const { data, isLoading } = useMissions();
  const queryClient = useQueryClient();
  const claimFn = useServerFn(claimMission);

  const claim = useMutation({
    mutationFn: (missionId: string) => claimFn({ data: { missionId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions"] });
      void queryClient.invalidateQueries({ queryKey: ["progression"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(lang === "pt" ? "XP recebido" : "XP claimed");
    },
    onError: () =>
      toast.error(lang === "pt" ? "Missão ainda não concluída" : "Mission not completed yet"),
  });

  if (!userId) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "As missões usam as suas partidas registradas, lives e highlights."
            : "Missions use your registered matches, lives and highlights."}
        </p>
        <Link to="/auth">
          <ActionButton>{lang === "pt" ? "Entrar" : "Sign in"}</ActionButton>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</p>;
  }

  return (
    <div className="space-y-2">
      {(data ?? []).map((m: MissionEntry) => (
        <div key={m.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="truncate font-display text-[12px]">{lang === "pt" ? m.labelPt : m.labelEn}</p>
            <Chip glow="var(--neon-green)">
              {lang === "pt"
                ? (CYCLE_LABEL[m.cycle]?.pt ?? m.cycle)
                : (CYCLE_LABEL[m.cycle]?.en ?? m.cycle)}
            </Chip>
          </div>
          <Meter value={m.progress} max={m.total} glow="var(--neon-green)" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              {m.progress}/{m.total} · +{m.xp} XP
            </p>
            {m.claimed ? (
              <Chip>{lang === "pt" ? "Resgatada" : "Claimed"}</Chip>
            ) : (
              <ActionButton
                variant={m.completed ? "primary" : "ghost"}
                onClick={() => (m.completed ? claim.mutate(m.id) : undefined)}
              >
                {m.completed
                  ? lang === "pt"
                    ? "Resgatar"
                    : "Claim"
                  : lang === "pt"
                    ? "Em curso"
                    : "In progress"}
              </ActionButton>
            )}
          </div>
        </div>
      ))}
      {data && data.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt" ? "Sem missões cadastradas." : "No missions registered."}
        </p>
      )}
    </div>
  );
}
