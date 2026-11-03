import { NextResponse } from "next/server";
import { isResumePayment, stripeClient } from "@/lib/resume-payments";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY)
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  if (!signature)
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const stripe = stripeClient();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
      );
      if (
        isResumePayment(session) &&
        session.metadata?.resume_fulfilled !== "true"
      ) {
        // Stripe stores this durable, idempotent entitlement; no ephemeral server disk state.
        await stripe.checkout.sessions.update(session.id, {
          metadata: { resume_fulfilled: "true" },
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    console.error(
      JSON.stringify({
        event: "resume_fulfillment_failed",
        stripeEventId: event.id,
      }),
    );
    return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
  }
}
