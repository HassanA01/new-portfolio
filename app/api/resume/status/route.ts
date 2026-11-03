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
    const session = await stripeClient().checkout.sessions.retrieve(id);
    return NextResponse.json(
      { ready: canDownload(session), paymentStatus: session.payment_status },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "Referrer-Policy": "no-referrer",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to verify payment" },
      { status: 503 },
    );
  }
}
