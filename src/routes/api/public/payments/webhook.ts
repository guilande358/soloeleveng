import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { settlePayment, verifySignature } from "@/lib/payments.server";

const Payload = z.object({
  event: z.string().min(1).max(60),
  reference: z.string().min(6).max(60),
});

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYMENT_WEBHOOK_SECRET"];
        if (!secret) return new Response("Not configured", { status: 500 });

        const body = await request.text();
        const signature = request.headers.get("x-seev-signature");
        if (!verifySignature(body, signature, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: z.infer<typeof Payload>;
        try {
          payload = Payload.parse(JSON.parse(body));
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        if (payload.event !== "payment.succeeded") {
          return Response.json({ ignored: true });
        }

        try {
          const result = await settlePayment(payload.reference);
          return Response.json({ ok: true, alreadySettled: result.alreadySettled });
        } catch (error) {
          const message = error instanceof Error ? error.message : "settle_failed";
          console.error("payment webhook failed", message);
          const status = message === "payment_not_found" ? 404 : 422;
          return Response.json({ ok: false, error: message }, { status });
        }
      },
    },
  },
});
