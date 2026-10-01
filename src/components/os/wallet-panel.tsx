import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { ActionButton, Chip, Row, StatTile } from "@/components/os/ui";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { startPaypalTopUp } from "@/lib/paypal.functions";
import { getWallet, requestPayout } from "@/lib/wallet.functions";

const money = (v: number) => `${v < 0 ? "-" : ""}$ ${Math.abs(v).toFixed(2)}`;

const KIND_LABEL: Record<string, { pt: string; en: string }> = {
  deposit: { pt: "Recarga", en: "Top-up" },
  purchase: { pt: "Compra de carta", en: "Card purchase" },
  commission: { pt: "Comissão GamerPRO", en: "GamerPRO commission" },
  payout: { pt: "Saque", en: "Withdrawal" },
  coffee_sent: { pt: "Café enviado", en: "Coffee sent" },
  coffee_received: { pt: "Café recebido", en: "Coffee received" },
};

function useWalletQuery(enabled: boolean) {
  const fetchWallet = useServerFn(getWallet);
  return useQuery({
    queryKey: ["wallet"],
    queryFn: () => fetchWallet(),
    enabled,
  });
}

export function WalletWidget() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const { data } = useWalletQuery(Boolean(userId));

  if (!userId) {
    return (
      <div className="space-y-2">
        <p className="text-glow font-display text-lg">$ 0.00</p>
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
          {lang === "pt" ? "Inicie sessão" : "Sign in"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-glow font-display text-lg">{money(data?.balance ?? 0)}</p>
      <Row
        label={lang === "pt" ? "Ganhos" : "Earnings"}
        value={money(data?.earnings ?? 0)}
        glow="var(--neon-green)"
      />
      <Row
        label={lang === "pt" ? "Cafés" : "Coffees"}
        value={String(data?.coffeeCount ?? 0)}
        glow="var(--neon-gold)"
      />
    </div>
  );
}

export function WalletFull() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const queryClient = useQueryClient();
  const { data, isLoading } = useWalletQuery(Boolean(userId));

  const payoutFn = useServerFn(requestPayout);
  const topUpFn = useServerFn(startPaypalTopUp);
  const [amount, setAmount] = useState("25");
  const [method, setMethod] = useState<"pix" | "mpesa" | "paypal" | "crypto" | "bank">("mpesa");
  const [destination, setDestination] = useState("");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["wallet"] });
  };

  const payout = useMutation({
    mutationFn: (input: { amount: number; method: typeof method; destination: string }) =>
      payoutFn({ data: input }),
    onSuccess: () => {
      toast.success(lang === "pt" ? "Saque solicitado" : "Withdrawal requested");
      setDestination("");
      refresh();
    },
    onError: (error: Error) => {
      const key = error.message;
      toast.error(
        key.includes("insufficient_funds")
          ? lang === "pt"
            ? "Saldo insuficiente"
            : "Insufficient balance"
          : key.includes("min_payout")
            ? lang === "pt"
              ? "Saque mínimo de $ 10.00"
              : "Minimum withdrawal is $ 10.00"
            : lang === "pt"
              ? "Não foi possível solicitar o saque"
              : "Could not request the withdrawal",
      );
    },
  });

  const topUp = useMutation({
    mutationFn: async () => {
      const value = Number(amount) || 50;
      const paypal = await topUpFn({ data: { amount: value, origin: window.location.origin } });
      window.location.href = paypal.approveUrl;
      return paypal;
    },
    onError: () =>
      toast.error(
        lang === "pt"
          ? "Não foi possível abrir o PayPal para a recarga"
          : "Could not open PayPal for the top-up",
      ),
  });

  if (!userId) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "Inicie sessão para ver saldo, extrato e pedir saques."
            : "Sign in to see your balance, statement and request payouts."}
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

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <StatTile label={lang === "pt" ? "Saldo" : "Balance"} value={money(data?.balance ?? 0)} />
        <Row
          label={lang === "pt" ? "Ganhos totais" : "Total earnings"}
          value={money(data?.earnings ?? 0)}
        />
        <Row label={lang === "pt" ? "Gastos" : "Spent"} value={money(data?.spent ?? 0)} />
        <Row label={lang === "pt" ? "Pendente" : "Pending"} value={money(data?.pending ?? 0)} />
        <Row
          label={lang === "pt" ? "Cafés" : "Coffees"}
          value={String(data?.coffeeCount ?? 0)}
          glow="var(--neon-gold)"
        />

        <div className="space-y-2 rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <p className="font-display text-[11px] tracking-[0.18em] uppercase">
            {lang === "pt" ? "Saque" : "Withdraw"}
          </p>
          <div className="flex gap-2">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24 rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
              placeholder="25.00"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
              className="flex-1 rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="pix">Pix</option>
              <option value="paypal">PayPal</option>
              <option value="crypto">Crypto</option>
              <option value="bank">{lang === "pt" ? "Banco" : "Bank"}</option>
            </select>
          </div>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
            placeholder={
              lang === "pt" ? "Número / conta de destino" : "Destination number / account"
            }
          />
          <div className="flex flex-wrap gap-2">
            <ActionButton
              onClick={() => {
                const value = Number(amount.replace(",", "."));
                if (!Number.isFinite(value) || value <= 0) {
                  toast.error(lang === "pt" ? "Valor inválido" : "Invalid amount");
                  return;
                }
                if (destination.trim().length < 4) {
                  toast.error(lang === "pt" ? "Destino inválido" : "Invalid destination");
                  return;
                }
                payout.mutate({ amount: value, method, destination: destination.trim() });
              }}
            >
              {payout.isPending
                ? lang === "pt"
                  ? "A enviar..."
                  : "Sending..."
                : lang === "pt"
                  ? "Pedir saque"
                  : "Request payout"}
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => topUp.mutate()}>
              {topUp.isPending
                ? lang === "pt"
                  ? "A abrir o PayPal..."
                  : "Opening PayPal..."
                : lang === "pt"
                  ? "Recarregar com PayPal"
                  : "Top up with PayPal"}
            </ActionButton>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {lang === "pt"
              ? "Mínimo $ 10.00. O valor fica pendente até aprovação."
              : "Minimum $ 10.00. The amount stays pending until approval."}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <p className="mb-2 font-display text-[11px] tracking-[0.18em] uppercase">
            {lang === "pt" ? "Extrato" : "Statement"}
          </p>
          {isLoading ? (
            <p className="text-[11px] text-muted-foreground">
              {lang === "pt" ? "A carregar..." : "Loading..."}
            </p>
          ) : (data?.transactions.length ?? 0) === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              {lang === "pt" ? "Sem movimentos ainda." : "No movements yet."}
            </p>
          ) : (
            <div className="scroll-hidden max-h-64 overflow-y-auto">
              {data?.transactions.map((t) => {
                const label = KIND_LABEL[t.kind];
                return (
                  <Row
                    key={t.id}
                    label={`${label ? (lang === "pt" ? label.pt : label.en) : t.description} · ${new Date(
                      t.created_at,
                    ).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB")}`}
                    value={money(t.amount)}
                    glow={t.amount >= 0 ? "var(--neon-green)" : "var(--neon-pink)"}
                  />
                );
              })}
            </div>
          )}
        </div>

        {(data?.payouts.length ?? 0) > 0 ? (
          <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
            <p className="mb-2 font-display text-[11px] tracking-[0.18em] uppercase">
              {lang === "pt" ? "Saques" : "Payouts"}
            </p>
            {data?.payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 py-1.5">
                <span className="truncate text-[11px] text-muted-foreground">
                  {money(p.amount)} · {p.method} · {p.destination}
                </span>
                <Chip glow={p.status === "paid" ? "var(--neon-green)" : "var(--neon-gold)"}>
                  {p.status}
                </Chip>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
