import { createFileRoute } from "@tanstack/react-router";

/** Temporary connectivity check: reports which PayPal environment accepts the credentials. */
export const Route = createFileRoute("/api/public/paypal/selftest")({
  server: {
    handlers: {
      GET: async () => {
        const id = process.env["PAYPAL_CLIENT_ID"] ?? "";
        const secret = process.env["PAYPAL_CLIENT_SECRET"] ?? "";
        const results: Record<string, unknown> = {
          hasId: id.length > 0,
          idLength: id.length,
          secretLength: secret.length,
        };

        for (const [name, host] of [
          ["sandbox", "https://api-m.sandbox.paypal.com"],
          ["live", "https://api-m.paypal.com"],
        ] as const) {
          try {
            const res = await fetch(`${host}/v1/oauth2/token`, {
              method: "POST",
              headers: {
                Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: "grant_type=client_credentials",
            });
            results[name] = res.status;
          } catch {
            results[name] = "network_error";
          }
        }

        return Response.json(results);
      },
    },
  },
});
