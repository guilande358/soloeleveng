import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { ActionButton, Chip, Meter, Row } from "@/components/os/ui";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { listContracts, updateContractProgress } from "@/lib/contracts.functions";

function useContractsQuery(enabled: boolean) {
  const fetchContracts = useServerFn(listContracts);
  return useQuery({
    queryKey: ["contracts"],
    queryFn: () => fetchContracts(),
    enabled,
  });
}

const statusGlow = (status: string) =>
  status === "active"
    ? "var(--neon-cyan)"
    : status === "completed"
      ? "var(--neon-green)"
      : "var(--muted-foreground)";

export function ContractsWidget() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const { data } = useContractsQuery(Boolean(userId));

  if (!userId || (data?.length ?? 0) === 0) {
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt" ? "Sem contratos ativos." : "No active contracts."}
      </p>
    );
  }

  return (
    <div>
      {data?.slice(0, 3).map((c) => (
        <Row
          key={c.id}
          label={`${c.cardId ?? "-"} · ${c.kind === "gamerpro" ? "GamerPRO" : "Friendly"}`}
          value={`${c.percent}%`}
          glow={statusGlow(c.status)}
        />
      ))}
    </div>
  );
}

export function ContractsFull() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const queryClient = useQueryClient();
  const { data, isLoading } = useContractsQuery(Boolean(userId));
  const advanceFn = useServerFn(updateContractProgress);

  const advance = useMutation({
    mutationFn: (input: { contractId: string; percent: number }) => advanceFn({ data: input }),
    onSuccess: (result) => {
      toast.success(
        result.completed
          ? lang === "pt"
            ? "Contrato concluído"
            : "Contract completed"
          : lang === "pt"
            ? "Progresso atualizado"
            : "Progress updated",
      );
      void queryClient.invalidateQueries({ queryKey: ["contracts"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error(lang === "pt" ? "Falha ao atualizar" : "Update failed"),
  });

  if (!userId) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "Inicie sessão para ver os teus contratos e comissões."
            : "Sign in to see your contracts and commissions."}
        </p>
        <Link
          to="/auth"
          className="inline-block rounded-lg bg-primary px-4 py-2 font-display text-[11px] tracking-[0.16em] text-primary-foreground uppercase"
        >
          {lang === "pt" ? "Entrar" : "Sign in"}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt" ? "A carregar..." : "Loading..."}
      </p>
    );
  }

  if ((data?.length ?? 0) === 0) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "Ainda não tens contratos. Escolhe uma carta para começar."
            : "No contracts yet. Pick a card to get started."}
        </p>
        <Link
          to="/cartas"
          className="inline-block rounded-lg bg-primary px-4 py-2 font-display text-[11px] tracking-[0.16em] text-primary-foreground uppercase"
        >
          {lang === "pt" ? "Ver cartas" : "Browse cards"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {data?.map((c) => (
        <div
          key={c.id}
          className="space-y-2 rounded-xl border border-border/50 bg-surface-2/40 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-[12px] capitalize">{c.cardId ?? "-"} Card</p>
            <Chip glow={statusGlow(c.status)}>{c.status}</Chip>
          </div>
          <Row
            label={lang === "pt" ? "Modo" : "Mode"}
            value={c.kind === "gamerpro" ? "GamerPRO" : "Friendly"}
          />
          <Row
            label={lang === "pt" ? "Comissão" : "Commission"}
            value={`${(c.commissionRate * 100).toFixed(0)}%`}
          />
          <Row label={lang === "pt" ? "Objetivo" : "Objective"} value={c.note ?? "-"} />
          <Row label={lang === "pt" ? "Partidas" : "Matches"} value={String(c.matches)} />
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] tracking-wider text-muted-foreground uppercase">
              <span>{lang === "pt" ? "Progresso" : "Progress"}</span>
              <span>{c.percent}%</span>
            </div>
            <Meter value={c.percent} max={100} glow={statusGlow(c.status)} />
          </div>
          {c.status === "active" ? (
            <div className="flex gap-2 pt-1">
              <ActionButton
                variant="ghost"
                onClick={() =>
                  advance.mutate({ contractId: c.id, percent: Math.min(100, c.percent + 25) })
                }
              >
                +25%
              </ActionButton>
              <ActionButton onClick={() => advance.mutate({ contractId: c.id, percent: 100 })}>
                {lang === "pt" ? "Concluir" : "Complete"}
              </ActionButton>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
