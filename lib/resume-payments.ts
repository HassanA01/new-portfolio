import Stripe from "stripe";

export const RESUME_PRODUCT = "aneeq-resume-v1";
export const RESUME_AMOUNT = 500;
export const DOWNLOAD_WINDOW = 7 * 24 * 60 * 60;

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key, { maxNetworkRetries: 2 });
}

export function isResumePayment(session: Stripe.Checkout.Session) {
  return (
    session.metadata?.product === RESUME_PRODUCT &&
    session.mode === "payment" &&
    session.currency === "usd" &&
    session.amount_total === RESUME_AMOUNT &&
    session.payment_status === "paid"
  );
}

export function canDownload(
  session: Stripe.Checkout.Session,
  now = Date.now(),
) {
  return (
    isResumePayment(session) &&
    session.metadata?.resume_fulfilled === "true" &&
    now / 1000 < session.created + DOWNLOAD_WINDOW
  );
}

export function validSessionId(value: string | null): value is string {
  return !!value && /^cs_(test_|live_)?[A-Za-z0-9]{16,250}$/.test(value);
}

export function appOrigin() {
  const value = process.env.APP_URL;
  if (!value) throw new Error("APP_URL is not configured");
  const url = new URL(value);
  if (
    url.protocol !== "https:" &&
    url.hostname !== "localhost" &&
    url.hostname !== "127.0.0.1"
  ) {
    throw new Error("APP_URL must use HTTPS outside local development");
  }
  return url.origin;
}
