import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  appOrigin,
  RESUME_AMOUNT,
  RESUME_PRODUCT,
  stripeClient,
} from "@/lib/resume-payments";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const origin = appOrigin();
    if (request.headers.get("origin") !== origin) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 },
      );
    }
    // "elements" powers the custom in-page checkout modal (Stripe Elements +
    // Checkout Sessions). Any other request falls back to Stripe-hosted Checkout.
    const custom = request.headers
      .get("content-type")
      ?.includes("application/json")
      ? (await request.json()).ui === "elements"
      : false;
    const session = await stripeClient().checkout.sessions.create(
      {
        mode: "payment",
        integration_identifier: "portfolio_resume_qmrxpvtn",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: RESUME_AMOUNT,
              product_data: {
                name: "Aneeq Hassan’s résumé",
                description: "PDF download · access for 7 days after purchase",
                // Required by Stripe Managed Payments: downloadable document, limited-time access.
                tax_code: "txcd_10503001",
              },
            },
          },
        ],
        metadata: { product: RESUME_PRODUCT },
        ...(custom
          ? {
              ui_mode: "elements" as const,
              return_url: `${origin}/resume/success?session_id={CHECKOUT_SESSION_ID}`,
              // Managed Payments (Stripe as merchant of record) only supports Stripe's own
              // hosted/embedded UIs, so the custom modal opts out for this session.
              managed_payments: { enabled: false },
              // The modal collects email itself; hide Link's sign-up block inside the card fields.
              wallet_options: { link: { display: "never" } },
            }
          : {
              success_url: `${origin}/resume/success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${origin}/resume?cancelled=1`,
            }),
      },
      { idempotencyKey: randomUUID() },
    );
    if (custom) {
      if (!session.client_secret)
        throw new Error("Checkout client secret missing");
      return NextResponse.json(
        { clientSecret: session.client_secret },
        {
          headers: { "Cache-Control": "private, no-store" },
        },
      );
    }
    if (!session.url) throw new Error("Checkout URL missing");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "resume_checkout_failed",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    return NextResponse.json(
      { error: "Checkout is unavailable. Please try again later." },
      { status: 503 },
    );
  }
}
