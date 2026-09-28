/** PayPal REST helpers. Server-only: reads credentials from the environment. */

type PaypalOrder = {
  id: string;
  status: string;
  links?: { href: string; rel: string; method: string }[];
};

type PaypalCapture = {
  id: string;
  status: string;
  purchase_units?: {
    reference_id?: string;
    payments?: { captures?: { id: string; amount: { value: string; currency_code: string } }[] };
  }[];
};

function baseUrl() {
  return process.env["PAYPAL_ENV"] === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function accessToken() {
  const id = process.env["PAYPAL_CLIENT_ID"];
  const secret = process.env["PAYPAL_CLIENT_SECRET"];
  if (!id || !secret) throw new Error("paypal_not_configured");

  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("paypal_auth_failed");
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

/** Creates a PayPal order and returns its id plus the approval URL. */
export async function createPaypalOrder(input: {
  amount: number;
  reference: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const token = await accessToken();
  const res = await fetch(`${baseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.reference,
          description: input.description.slice(0, 120),
          amount: { currency_code: "USD", value: input.amount.toFixed(2) },
        },
      ],
      application_context: {
        brand_name: "Solo Eleveng Evolution",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  const order = (await res.json()) as PaypalOrder & { message?: string };
  if (!res.ok || !order.id) throw new Error("paypal_order_failed");
  const approve = order.links?.find((l) => l.rel === "approve")?.href;
  if (!approve) throw new Error("paypal_no_approval_url");
  return { id: order.id, approveUrl: approve };
}

/** Captures an approved PayPal order and returns the captured amount. */
export async function capturePaypalOrder(orderId: string) {
  const token = await accessToken();
  const res = await fetch(`${baseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const json = (await res.json()) as PaypalCapture & { name?: string };

  if (!res.ok && json.name !== "ORDER_ALREADY_CAPTURED") throw new Error("paypal_capture_failed");

  const unit = json.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const amount = capture ? Number(capture.amount.value) : 0;

  return {
    ok: json.status === "COMPLETED" || json.name === "ORDER_ALREADY_CAPTURED",
    status: json.status ?? "COMPLETED",
    amount,
    reference: unit?.reference_id ?? null,
    captureId: capture?.id ?? null,
  };
}

/** Reads an order (used to confirm amount/reference before crediting). */
export async function getPaypalOrder(orderId: string) {
  const token = await accessToken();
  const res = await fetch(`${baseUrl()}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("paypal_order_not_found");
  const json = (await res.json()) as PaypalCapture;
  const unit = json.purchase_units?.[0];
  return { status: json.status, reference: unit?.reference_id ?? null };
}
