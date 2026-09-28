import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";

import { HudPanel } from "@/components/hud/hud-panel";
import { ActionButton } from "@/components/os/ui";
import { useI18n } from "@/lib/i18n";
import { capturePaypalPayment, capturePaypalTopUp } from "@/lib/paypal.functions";

export const Route = createFileRoute("/pagamento")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
    ref: typeof search.ref === "string" ? search.ref : undefined,
    recarga: search.recarga === "1" || search.recarga === 1 ? true : undefined,
    cancelado: search.cancelado === "1" || search.cancelado === 1 ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Confirmação de pagamento PayPal — Solo Eleveng" },
      {
        name: "description",
        content:
          "Confirmação do pagamento PayPal da carta de evolução ou da recarga da carteira do jogador.",
      },
      { property: "og:title", content: "Confirmação de pagamento PayPal — Solo Eleveng" },
      { property: "og:description", content: "Estado do pagamento PayPal no HUD gamer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentReturnPage,
});

function PaymentReturnPage() {
  const { lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const started = useRef(false);

  const captureOrder = useServerFn(capturePaypalPayment);
  const captureTopUp = useServerFn(capturePaypalTopUp);

  const capture = useMutation({
    mutationFn: async () => {
      if (!search.token) throw new Error("missing_token");
      return search.recarga
        ? captureTopUp({ data: { paypalOrderId: search.token } })
        : captureOrder({ data: { paypalOrderId: search.token } });
    },
    onSuccess: () => {
      for (const key of ["wallet", "orders", "contracts", "notifications", "progression"]) {
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });

  useEffect(() => {
    if (started.current || search.cancelado || !search.token) return;
    started.current = true;
    capture.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.token, search.cancelado]);

  if (search.cancelado) {
    return (
      <HudPanel title={lang === "pt" ? "Pagamento cancelado" : "Payment cancelled"}>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <XCircle className="h-4 w-4 text-destructive" />
          {lang === "pt"
            ? "Você cancelou o pagamento no PayPal. Nada foi cobrado."
            : "You cancelled the PayPal payment. Nothing was charged."}
        </p>
        <div className="mt-3">
          <Link to="/checkout">
            <ActionButton>{lang === "pt" ? "Voltar ao checkout" : "Back to checkout"}</ActionButton>
          </Link>
        </div>
      </HudPanel>
    );
  }

  return (
    <HudPanel title={lang === "pt" ? "Pagamento PayPal" : "PayPal payment"}>
      {capture.isPending && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {lang === "pt" ? "A confirmar o pagamento..." : "Confirming the payment..."}
        </p>
      )}

      {capture.isSuccess && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-neon-green" />
            {search.recarga
              ? lang === "pt"
                ? "Recarga confirmada — o saldo já está na sua carteira."
                : "Top-up confirmed — the balance is in your wallet."
              : lang === "pt"
                ? "Pagamento confirmado — a sua carta de evolução está ativa."
                : "Payment confirmed — your evolution card is active."}
          </p>
          <ActionButton onClick={() => void navigate({ to: "/" })}>
            {lang === "pt" ? "Ir para o HUD" : "Go to the HUD"}
          </ActionButton>
        </div>
      )}

      {capture.isError && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4 text-destructive" />
            {lang === "pt"
              ? "Não conseguimos confirmar este pagamento. Se o valor foi debitado, fale com o suporte."
              : "We could not confirm this payment. If you were charged, contact support."}
          </p>
          <ActionButton variant="ghost" onClick={() => capture.mutate()}>
            {lang === "pt" ? "Tentar de novo" : "Try again"}
          </ActionButton>
        </div>
      )}
    </HudPanel>
  );
}
