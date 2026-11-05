import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  appOrigin,
  RESUME_AMOUNT,
  RESUME_CURRENCY,
  RESUME_PRODUCT,
  stripeClient,
} from "@/lib/resume-payments";
import { rateLimitResponse } from "@/lib/rate-limit";

const checkoutRateLimits = [
  { name: "minute", limit: 5, windowMs: 60_000 },
  { name: "hour", limit: 20, windowMs: 3_600_000 },
] as const;

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
    // Each call creates a Stripe session, so cap how fast one client can ask.
    const limited = await rateLimitResponse(
      request,
      "checkout",
      checkoutRateLimits,
      "Too many checkout attempts. Please wait a minute and try again.",
    );
    if (limited) return limited;
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
        // Card only. The dashboard's automatic methods add Klarna and friends
        // for CAD, and the Payment Element would then show a method picker.
        allowed_payment_method_types: ["card"],
        // Managed Payments (Stripe as merchant of record) is on by default for
        // this account and refuses allowed_payment_method_types, and it would
        // also add tax to amount_total, which the download check compares to
        // the list price. Both the modal and the hosted fallback opt out.
        managed_payments: { enabled: false },
        integration_identifier: "portfolio_resume_qmrxpvtn",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: RESUME_CURRENCY,
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
