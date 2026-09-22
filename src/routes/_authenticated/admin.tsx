import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { HudPanel } from "@/components/hud/hud-panel";
import { ActionButton, Chip, Row, StatTile } from "@/components/os/ui";
import {
  adminAdjustBalance,
  adminEndLive,
  adminOverview,
  adminResolvePayout,
  adminSetContractStatus,
  adminSetOrderStatus,
} from "@/lib/admin.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Centro de administração — Solo Eleveng" },
      {
        name: "description",
        content:
          "Painel único para acompanhar pedidos, contratos, lives, carteiras e saques de todos os jogadores do HUD.",
      },
      { property: "og:title", content: "Centro de administração — Solo Eleveng" },
      { property: "og:description", content: "Pedidos, contratos, lives, carteiras e saques num só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const TABS = ["orders", "contracts", "lives", "wallets", "payouts"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, { pt: string; en: string }> = {
  orders: { pt: "Pedidos", en: "Orders" },
  contracts: { pt: "Contratos", en: "Contracts" },
  lives: { pt: "Lives", en: "Lives" },
  wallets: { pt: "Carteiras", en: "Wallets" },
  payouts: { pt: "Saques", en: "Payouts" },
};

function AdminPage() {
  const { lang } = useI18n();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("orders");
  const [adjust, setAdjust] = useState<{ userId: string; amount: string; note: string }>({
    userId: "",
    amount: "",
    note: "",
  });

  const fetchOverview = useServerFn(adminOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    retry: false,
  });

  const orderFn = useServerFn(adminSetOrderStatus);
  const contractFn = useServerFn(adminSetContractStatus);
  const liveFn = useServerFn(adminEndLive);
  const payoutFn = useServerFn(adminResolvePayout);
  const balanceFn = useServerFn(adminAdjustBalance);

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  const done = () => {
    refresh();
    toast.success(lang === "pt" ? "Atualizado" : "Updated");
  };
  const fail = () => toast.error(lang === "pt" ? "Ação não permitida" : "Action not allowed");

  const setOrder = useMutation({
    mutationFn: (v: { id: string; status: "active" | "completed" | "cancelled" }) => orderFn({ data: v }),
    onSuccess: done,
    onError: fail,
  });
  const setContract = useMutation({
    mutationFn: (v: { id: string; status: "active" | "paused" | "completed" | "cancelled" }) =>
      contractFn({ data: v }),
    onSuccess: done,
    onError: fail,
  });
  const endLive = useMutation({
    mutationFn: (id: string) => liveFn({ data: { id } }),
    onSuccess: done,
    onError: fail,
  });
  const resolvePayout = useMutation({
    mutationFn: (v: { id: string; decision: "paid" | "rejected" }) => payoutFn({ data: v }),
    onSuccess: done,
    onError: fail,
  });
  const adjustBalance = useMutation({
    mutationFn: () =>
      balanceFn({
        data: {
          userId: adjust.userId,
          amount: Number(adjust.amount) || 0,
          description: adjust.note || "Ajuste manual",
        },
      }),
    onSuccess: () => {
      setAdjust({ userId: "", amount: "", note: "" });
      done();
    },
    onError: fail,
  });

  if (error) {
    return (
      <HudPanel title={lang === "pt" ? "Acesso restrito" : "Restricted"}>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          {lang === "pt"
            ? "Esta área é apenas para a conta administradora."
            : "This area is for the administrator account only."}
        </p>
      </HudPanel>
    );
  }

  const input = "w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs";

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">{lang === "pt" ? "Administração" : "Administration"}</h1>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile
          label={lang === "pt" ? "Saldo total" : "Total balance"}
          value={`${(data?.totals.balance ?? 0).toFixed(2)}`}
        />
        <StatTile
          label={lang === "pt" ? "Em saque" : "On hold"}
          value={`${(data?.totals.pending ?? 0).toFixed(2)}`}
        />
        <StatTile
          label={lang === "pt" ? "Contratos ativos" : "Active contracts"}
          value={String(data?.totals.activeContracts ?? 0)}
        />
        <StatTile label={lang === "pt" ? "Ao vivo" : "Live now"} value={String(data?.totals.liveNow ?? 0)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}>
            <Chip glow={tab === t ? "var(--neon-cyan)" : undefined}>
              {lang === "pt" ? TAB_LABEL[t].pt : TAB_LABEL[t].en}
            </Chip>
          </button>
        ))}
      </div>

      {isLoading && <p className="text-xs text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</p>}

      {tab === "orders" && (
        <div className="space-y-2">
          {(data?.orders ?? []).map((o) => (
            <HudPanel key={o.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[12px]">{o.player}</p>
                <Chip glow={o.status === "active" ? "var(--neon-green)" : undefined}>{o.status}</Chip>
              </div>
              <Row label={lang === "pt" ? "Carta" : "Card"} value={o.card_id} />
              <Row label={lang === "pt" ? "Modo" : "Mode"} value={o.mode} />
              <div className="mt-2 flex flex-wrap gap-2">
                <ActionButton variant="ghost" onClick={() => setOrder.mutate({ id: o.id, status: "active" })}>
                  {lang === "pt" ? "Ativar" : "Activate"}
                </ActionButton>
                <ActionButton variant="ghost" onClick={() => setOrder.mutate({ id: o.id, status: "completed" })}>
                  {lang === "pt" ? "Concluir" : "Complete"}
                </ActionButton>
                <ActionButton variant="ghost" onClick={() => setOrder.mutate({ id: o.id, status: "cancelled" })}>
                  {lang === "pt" ? "Cancelar" : "Cancel"}
                </ActionButton>
              </div>
            </HudPanel>
          ))}
        </div>
      )}

      {tab === "contracts" && (
        <div className="space-y-2">
          {(data?.contracts ?? []).map((c) => (
            <HudPanel key={c.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[12px]">{c.player}</p>
                <Chip glow={c.status === "active" ? "var(--neon-green)" : undefined}>{c.status}</Chip>
              </div>
              <Row label={lang === "pt" ? "Tipo" : "Kind"} value={c.kind} />
              <Row label={lang === "pt" ? "Comissão" : "Commission"} value={`${Math.round(c.commission_rate * 100)}%`} />
              <Row label={lang === "pt" ? "Progresso" : "Progress"} value={`${c.percent}%`} />
              <div className="mt-2 flex flex-wrap gap-2">
                <ActionButton variant="ghost" onClick={() => setContract.mutate({ id: c.id, status: "paused" })}>
                  {lang === "pt" ? "Pausar" : "Pause"}
                </ActionButton>
                <ActionButton variant="ghost" onClick={() => setContract.mutate({ id: c.id, status: "active" })}>
                  {lang === "pt" ? "Retomar" : "Resume"}
                </ActionButton>
                <ActionButton variant="ghost" onClick={() => setContract.mutate({ id: c.id, status: "completed" })}>
                  {lang === "pt" ? "Concluir" : "Complete"}
                </ActionButton>
              </div>
            </HudPanel>
          ))}
        </div>
      )}

      {tab === "lives" && (
        <div className="space-y-2">
          {(data?.lives ?? []).map((l) => (
            <HudPanel key={l.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-display text-[12px]">{l.title}</p>
                <Chip glow={l.is_live ? "var(--neon-pink)" : undefined}>
                  {l.is_live ? (lang === "pt" ? "Ao vivo" : "Live") : lang === "pt" ? "Encerrada" : "Ended"}
                </Chip>
              </div>
              <Row label={lang === "pt" ? "Jogador" : "Player"} value={l.player} />
              <Row label={lang === "pt" ? "Espectadores" : "Viewers"} value={String(l.viewer_count)} />
              {l.is_live && (
                <div className="mt-2">
                  <ActionButton variant="ghost" onClick={() => endLive.mutate(l.id)}>
                    {lang === "pt" ? "Encerrar live" : "End live"}
                  </ActionButton>
                </div>
              )}
            </HudPanel>
          ))}
        </div>
      )}

      {tab === "wallets" && (
        <div className="space-y-3">
          <HudPanel title={lang === "pt" ? "Ajustar saldo" : "Adjust balance"}>
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className={input}
                placeholder={lang === "pt" ? "ID do jogador" : "Player id"}
                value={adjust.userId}
                onChange={(e) => setAdjust((a) => ({ ...a, userId: e.target.value }))}
              />
              <input
                className={input}
                placeholder={lang === "pt" ? "Valor (+/-)" : "Amount (+/-)"}
                value={adjust.amount}
                onChange={(e) => setAdjust((a) => ({ ...a, amount: e.target.value }))}
              />
              <input
                className={input}
                placeholder={lang === "pt" ? "Motivo" : "Reason"}
                value={adjust.note}
                onChange={(e) => setAdjust((a) => ({ ...a, note: e.target.value }))}
              />
            </div>
            <div className="mt-2">
              <ActionButton onClick={() => adjustBalance.mutate()}>
                {lang === "pt" ? "Aplicar" : "Apply"}
              </ActionButton>
            </div>
          </HudPanel>
          {(data?.wallets ?? []).map((w) => (
            <HudPanel key={w.user_id}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[12px]">{w.player}</p>
                <span className="font-display text-sm">{w.balance.toFixed(2)} USD</span>
              </div>
              <Row label={lang === "pt" ? "Em saque" : "On hold"} value={w.pending.toFixed(2)} />
              <Row label={lang === "pt" ? "Cafés" : "Coffees"} value={String(w.coffee_count)} />
              <p className="mt-1 truncate text-[10px] text-muted-foreground">{w.user_id}</p>
            </HudPanel>
          ))}
        </div>
      )}

      {tab === "payouts" && (
        <div className="space-y-2">
          {(data?.payouts ?? []).map((p) => (
            <HudPanel key={p.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[12px]">{p.player}</p>
                <Chip glow={p.status === "pending" ? "var(--neon-gold)" : undefined}>{p.status}</Chip>
              </div>
              <Row label={lang === "pt" ? "Valor" : "Amount"} value={`${p.amount.toFixed(2)} USD`} />
              <Row label={lang === "pt" ? "Método" : "Method"} value={p.method} />
              <Row label={lang === "pt" ? "Destino" : "Destination"} value={p.destination} />
              {p.status === "pending" && (
                <div className="mt-2 flex gap-2">
                  <ActionButton onClick={() => resolvePayout.mutate({ id: p.id, decision: "paid" })}>
                    {lang === "pt" ? "Pagar" : "Mark paid"}
                  </ActionButton>
                  <ActionButton
                    variant="ghost"
                    onClick={() => resolvePayout.mutate({ id: p.id, decision: "rejected" })}
                  >
                    {lang === "pt" ? "Recusar" : "Reject"}
                  </ActionButton>
                </div>
              )}
            </HudPanel>
          ))}
        </div>
      )}
    </div>
  );
}
