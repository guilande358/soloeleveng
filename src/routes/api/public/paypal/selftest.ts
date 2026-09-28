import { createFileRoute } from "@tanstack/react-router";

/** Temporary connectivity check: confirms the PayPal credentials authenticate. */
export const Route = createFileRoute("/api/public/paypal/selftest")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { createPaypalOrder } = await import("@/lib/paypal.server");
          const order = await createPaypalOrder({
            amount: 1,
            reference: "SELFTEST",
            description: "Connectivity check",
            returnUrl: "https://example.com/return",
            cancelUrl: "https://example.com/cancel",
          });
          return Response.json({ ok: true, hasApproveUrl: Boolean(order.approveUrl) });
        } catch (error) {
          return Response.json(
            { ok: false, reason: error instanceof Error ? error.message : "unknown" },
            { status: 200 },
          );
        }
      },
    },
  },
});
