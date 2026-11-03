"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { disclosureSpring } from "@/components/ui/accordion";

/**
 * Custom résumé checkout. Everything visible is ours; only the card fields
 * are Stripe-rendered (required to keep raw card data out of our PCI scope).
 * The backend stays on Checkout Sessions (`ui_mode: "elements"`), so the
 * existing webhook, status polling and 7-day download window are unchanged.
 */

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripe = publishableKey ? loadStripe(publishableKey) : null;

// Mirrors the tokens in globals.css; Stripe's iframe can't read our CSS variables.
const palette = {
  light: {
    background: "#f4f1e9",
    foreground: "#262623",
    muted: "#62625c",
    placeholder: "#9b9a92",
    line: "#dcd7cb",
    danger: "#d94343",
  },
  dark: {
    background: "#191a18",
    foreground: "#eeeee8",
    muted: "#aaa9a1",
    placeholder: "#6f6f68",
    line: "#3d3e37",
    danger: "#ff7575",
  },
};

function prefersDark() {
  const chosen = document.documentElement.dataset.theme;
  if (chosen) return chosen === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Styles Stripe's card fields like the site's own inputs: Manrope, 14px corners, hairline borders. */
function appearanceFor(dark: boolean): Appearance {
  const c = dark ? palette.dark : palette.light;
  return {
    theme: "flat",
    variables: {
      fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
      fontSizeBase: "15px",
      fontWeightNormal: "400",
      fontWeightMedium: "500",
      borderRadius: "14px",
      spacingUnit: "4px",
      gridRowSpacing: "12px",
      gridColumnSpacing: "10px",
      colorBackground: c.background,
      colorText: c.foreground,
      colorTextSecondary: c.muted,
      colorTextPlaceholder: c.placeholder,
      colorPrimary: c.muted,
      colorDanger: c.danger,
      colorIcon: c.muted,
      colorIconHover: c.foreground,
    },
    rules: {
      ".Input": {
        border: `1px solid ${c.line}`,
        boxShadow: "none",
        padding: "11px 16px",
        letterSpacing: "-0.01em",
        transition: "border-color 180ms ease",
      },
      ".Input:hover": { borderColor: c.muted },
      ".Input:focus": {
        borderColor: c.muted,
        boxShadow: "none",
        outline: "none",
      },
      ".Input--invalid": { borderColor: c.danger, boxShadow: "none" },
      ".Label": {
        fontSize: "12px",
        fontWeight: "400",
        letterSpacing: "-0.01em",
        color: c.muted,
        marginBottom: "6px",
      },
      ".Error": { fontSize: "12px", marginTop: "6px" },
      ".Block": {
        border: `1px solid ${c.line}`,
        boxShadow: "none",
        backgroundColor: "transparent",
      },
    },
  };
}

const paymentOptions = { layout: "tabs" as const };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hover eases up and holds; only the press gets the spring.
const hoverLift = {
  scale: 1.03,
  transition: { type: "tween", duration: 0.18, ease: "easeOut" },
} as const;
const pressSpring = { scale: 0.95, transition: disclosureSpring } as const;

/** Site copy says "US$5", so whole-dollar totals drop the cents. */
function formatPrice(minorUnits: number, divisor: number) {
  const amount = minorUnits / divisor;
  return `US$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

export default function CheckoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const [dark, setDark] = useState(false);
  const [clientSecret, setClientSecret] = useState<Promise<string> | null>(
    null,
  );
  const [paidSessionId, setPaidSessionId] = useState<string | null>(null);
  const [paidEmail, setPaidEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    setDark(prefersDark());
    setPaidSessionId(null);
    setPaidEmail(null);
    // One Checkout Session per open; the promise is handed straight to Stripe.
    const secret = createSession();
    secret.catch(() => {}); // Surfaced through useCheckoutElements, not as an unhandled rejection.
    setClientSecret(secret);
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      setClientSecret(null);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const checkoutOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            elementsOptions: {
              appearance: appearanceFor(dark),
              loader: "never" as const,
              fonts: [
                {
                  cssSrc:
                    "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500&display=swap",
                },
              ],
            },
          }
        : null,
    [clientSecret, dark],
  );

  return (
    <dialog
      ref={dialog}
      className="checkout-modal"
      aria-labelledby="checkout-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="checkout-panel">
        <header className="checkout-heading">
          <h2 id="checkout-title">My résumé</h2>
          <motion.button
            type="button"
            className="checkout-close"
            aria-label="Close checkout"
            onClick={onClose}
            whileTap={reduced ? undefined : { scale: 0.8 }}
            transition={disclosureSpring}
          >
            <X size={18} aria-hidden="true" />
          </motion.button>
        </header>

        {open && paidSessionId && (
          <Receipt sessionId={paidSessionId} email={paidEmail} />
        )}

        {open && !paidSessionId && (
          <p className="checkout-lede">Ain’t nun free in this world.</p>
        )}

        {open && !paidSessionId && !stripe && (
          <p className="checkout-message" role="alert">
            Checkout is temporarily unavailable. You can still{" "}
            <a href="/resume">open the checkout page ↗</a>.
          </p>
        )}

        {open && !paidSessionId && stripe && clientSecret && (
          <CheckoutElementsProvider stripe={stripe} options={checkoutOptions!}>
            <CheckoutForm
              onPaid={(sessionId, email) => {
                setPaidSessionId(sessionId);
                setPaidEmail(email);
              }}
            />
          </CheckoutElementsProvider>
        )}

        <footer className="checkout-footer">
          Powered by <strong>Stripe</strong>
        </footer>
      </div>
    </dialog>
  );
}

function createSession() {
  return fetch("/api/resume/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ui: "elements" }),
  }).then(async (response) => {
    if (!response.ok) throw new Error("Checkout unavailable");
    const data = (await response.json()) as { clientSecret?: string };
    if (!data.clientSecret) throw new Error("Checkout unavailable");
    return data.clientSecret;
  });
}

export function CheckoutForm({
  onPaid,
}: {
  onPaid: (sessionId: string, email: string) => void;
}) {
  const result = useCheckoutElements();
  const reduced = useReducedMotion();
  const [fieldsReady, setFieldsReady] = useState(false);
  const [fieldsFailed, setFieldsFailed] = useState(false);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (result.type === "error") {
    return (
      <p className="checkout-message" role="alert">
        Checkout is temporarily unavailable. Please try again in a moment, or{" "}
        <a href="/resume">open the checkout page ↗</a>.
      </p>
    );
  }

  const ready = result.type === "success";
  const checkout = ready ? result.checkout : null;
  const price = checkout
    ? formatPrice(
        checkout.total.total.minorUnitsAmount,
        checkout.minorUnitsAmountDivisor,
      )
    : "US$5";
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const showEmailError = emailTouched && !emailValid;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkout || !fieldsReady || fieldsFailed || submitting) return;
    setEmailTouched(true);
    if (!emailValid) return;
    setSubmitting(true);
    setError(null);
    const outcome = await checkout.confirm({
      email: email.trim(),
      redirect: "if_required",
    });
    if (outcome.type === "error") {
      setError(outcome.error.message);
      setSubmitting(false);
      return;
    }
    const { session } = outcome;
    if (
      session.status.type === "complete" &&
      session.status.paymentStatus === "paid"
    ) {
      onPaid(session.id, email.trim());
      return;
    }
    setError(
      "Your payment hasn’t gone through yet. Please check your details and try again.",
    );
    setSubmitting(false);
  };

  return (
    <form className="checkout-form" onSubmit={submit} noValidate>
      <div className="checkout-field">
        <label htmlFor="checkout-email">Email for your receipt</label>
        <div
          className="checkout-email-slot"
          data-ready={fieldsReady}
          aria-busy={!fieldsReady && !fieldsFailed}
        >
          {!fieldsReady && !fieldsFailed && (
            <div
              className="checkout-skeleton checkout-email-skeleton"
              aria-hidden="true"
            >
              <span />
            </div>
          )}
          <input
            id="checkout-email"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="you@example.com"
            value={email}
            disabled={!ready || !fieldsReady || fieldsFailed || submitting}
            aria-hidden={!fieldsReady || undefined}
            aria-invalid={showEmailError || undefined}
            aria-describedby={
              showEmailError ? "checkout-email-error" : undefined
            }
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(true)}
          />
        </div>
        {showEmailError && (
          <p id="checkout-email-error" className="checkout-field-error">
            Enter a valid email address.
          </p>
        )}
      </div>

      <div
        className="checkout-payment-slot"
        aria-busy={!fieldsReady && !fieldsFailed}
      >
        {!fieldsReady && !fieldsFailed && (
          <div className="checkout-loading" role="status">
            <span className="sr-only">Loading secure payment fields…</span>
            <div className="checkout-skeleton" aria-hidden="true">
              <span className="checkout-skeleton-label" />
              <span />
              <div>
                <span />
                <span />
              </div>
              <span className="checkout-skeleton-label" />
              <span />
            </div>
          </div>
        )}
        {fieldsFailed && (
          <p className="checkout-message" role="alert">
            Payment fields couldn’t load. Please close checkout and try again.
          </p>
        )}
        {ready && (
          <div
            className="checkout-payment-fields"
            data-ready={fieldsReady}
            inert={!fieldsReady || undefined}
            aria-hidden={!fieldsReady}
          >
            <PaymentElement
              options={paymentOptions}
              onReady={() => setFieldsReady(true)}
              onLoadError={() => setFieldsFailed(true)}
            />
          </div>
        )}
      </div>

      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}

      <motion.button
        type="submit"
        className="checkout-pay"
        disabled={!ready || !fieldsReady || fieldsFailed || submitting}
        aria-busy={submitting || undefined}
        whileHover={
          reduced || !ready || !fieldsReady || fieldsFailed || submitting
            ? undefined
            : hoverLift
        }
        whileTap={
          reduced || !ready || !fieldsReady || fieldsFailed || submitting
            ? undefined
            : pressSpring
        }
      >
        {submitting ? "Processing…" : `Pay ${price}`}
        {!submitting && <span aria-hidden="true">↗</span>}
      </motion.button>
    </form>
  );
}

function Receipt({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string | null;
}) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<"confirming" | "ready" | "delayed">(
    "confirming",
  );

  useEffect(() => {
    let active = true;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const check = async () => {
      try {
        const response = await fetch(
          `/api/resume/status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Verification failed");
        const data = (await response.json()) as { ready?: boolean };
        if (!active) return;
        if (data.ready) setState("ready");
        else if (++attempts < 20) timeout = setTimeout(check, 2000);
        else setState("delayed");
      } catch {
        if (active) setState("delayed");
      }
    };
    void check();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [sessionId]);

  const successUrl = `/resume/success?session_id=${encodeURIComponent(sessionId)}`;

  return (
    <div className="checkout-receipt" aria-live="polite">
      <span className="checkout-receipt-mark" aria-hidden="true">
        <Check size={16} strokeWidth={2.25} />
      </span>
      <p className="checkout-lede">
        Thank you. {email ? `A receipt is on its way to ${email}.` : null}
      </p>

      {state === "confirming" && (
        <p className="checkout-status" role="status">
          Confirming with Stripe… your download will appear here in a moment.
        </p>
      )}
      {state === "ready" && (
        <motion.a
          className="checkout-pay"
          href={`/api/resume/download?session_id=${encodeURIComponent(sessionId)}`}
          whileHover={reduced ? undefined : hoverLift}
          whileTap={reduced ? undefined : pressSpring}
        >
          Download PDF <span aria-hidden="true">↓</span>
        </motion.a>
      )}
      {state === "delayed" && (
        <p className="checkout-status" role="status">
          Still confirming. Your download will be ready shortly at the link
          below. Don’t pay again.
        </p>
      )}

      <p className="checkout-note">
        Downloads work for 7 days. <a href={successUrl}>Keep this link</a> to
        come back for it, and keep it private.
      </p>
    </div>
  );
}
