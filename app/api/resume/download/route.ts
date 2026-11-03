import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import {
  canDownload,
  stripeClient,
  validSessionId,
} from "@/lib/resume-payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("session_id");
  if (!validSessionId(id))
    return NextResponse.json({ error: "Invalid checkout" }, { status: 400 });
  try {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(id);
    if (!canDownload(session))
      return NextResponse.json(
        { error: "Download is not available for this payment" },
        { status: 403 },
      );
    // Revoke downloads for refunded or disputed payments.
    if (typeof session.payment_intent !== "string")
      return new NextResponse(null, { status: 403 });
    const payment = await stripe.paymentIntents.retrieve(
      session.payment_intent,
      { expand: ["latest_charge"] },
    );
    const charge = payment.latest_charge;
    if (
      !charge ||
      typeof charge === "string" ||
      charge.refunded ||
      charge.disputed
    )
      return new NextResponse(null, { status: 403 });
    const pdf = await readFile(
      join(process.cwd(), "private", "AneeqHassan.pdf"),
    );
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Aneeq-Hassan-Resume.pdf"',
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    console.error(JSON.stringify({ event: "resume_download_failed" }));
    return NextResponse.json(
      { error: "Unable to download. Please try again." },
      { status: 503 },
    );
  }
}
