"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import {
  disclosureSpring,
  hoverLift,
  pressSpring,
} from "@/components/ui/accordion";
import ConfirmExit from "@/components/ConfirmExit";

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

/** Site copy says "CA$5", so whole-dollar totals drop the cents. */
function formatPrice(minorUnits: number, divisor: number) {
  const amount = minorUnits / divisor;
  return `CA$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
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
  // After paying, leaving without the PDF gets a second look.
  const [downloaded, setDownloaded] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const exitAllowed = useRef(false);
  const guardExit = !!paidSessionId && !downloaded;
  const closeNow = () => {
    exitAllowed.current = true;
    setConfirmExit(false);
    onClose();
  };
  const requestClose = () => {
    if (guardExit) setConfirmExit(true);
    else closeNow();
  };

  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    setDark(prefersDark());
    setPaidSessionId(null);
    setPaidEmail(null);
    setDownloaded(false);
    setConfirmExit(false);
    exitAllowed.current = false;
    // One Checkout Session per open; the promise is handed straight to Stripe.
    const secret = createSession();
    secret.catch(() => {}); // Surfaced through useCheckoutElements, not as an unhandled rejection.
    setClientSecret(secret);
    delete element?.dataset.reopened;
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
      aria-labelledby={paidSessionId ? undefined : "checkout-title"}
      aria-label={paidSessionId ? "Payment confirmed" : undefined}
      onKeyDown={(event) => {
        // Escape is the dialog's own close shortcut; take it over so it runs through the guard.
        if (event.key !== "Escape" || confirmExit) return;
        event.preventDefault();
        requestClose();
      }}
      onCancel={(event) => {
        // React also routes the nested exit prompt's events here; only handle our own.
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        if (!confirmExit) requestClose();
      }}
      onClose={(event) => {
        if (event.target !== event.currentTarget) return;
        // A close the browser forced past us (e.g. repeated Escape): reopen and ask first.
        const element = dialog.current;
        if (element && open && guardExit && !exitAllowed.current) {
          // Reopen in the same tick, without replaying the entrance, so nothing flashes.
          element.dataset.reopened = "true";
          element.showModal();
          setConfirmExit(true);
          return;
        }
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div className="checkout-panel">
        <header className="checkout-heading">
          {!paidSessionId && <h2 id="checkout-title">My résumé</h2>}
          <motion.button
            type="button"
            className="checkout-close"
            aria-label="Close checkout"
            onClick={requestClose}
            whileTap={reduced ? undefined : { scale: 0.8 }}
            transition={disclosureSpring}
          >
            <X size={18} aria-hidden="true" />
          </motion.button>
        </header>

        {open && paidSessionId && (
          <Receipt
            sessionId={paidSessionId}
            email={paidEmail}
            onDownload={() => setDownloaded(true)}
          />
        )}

        {open && !paidSessionId && (
          <p className="checkout-lede">ain’t nun free in this world</p>
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

        {!paidSessionId && (
          <footer className="checkout-footer">
            Powered by <strong>Stripe</strong>
          </footer>
        )}
      </div>

      <ConfirmExit
        open={confirmExit}
        className="checkout-exit"
        message="bruv you didn’t download it yet. You sure you wanna exit?"
        stayLabel="Stay"
        exitLabel="Exit anyway"
        emphasis="stay"
        stayClassName="checkout-pay"
        exitClassName="checkout-ghost"
        dismissible={false}
        onStay={() => setConfirmExit(false)}
        onExit={closeNow}
      />
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
    : "CA$5";
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const showEmailError = emailTouched && !emailValid;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkout || !fieldsReady || fieldsFailed || submitting) return;
    setEmailTouched(true);
    if (!emailValid) return;
    setSubmitting(true);
    setError(null);
    // Incomplete or invalid card details: Stripe marks the field itself, so no banner here.
    const validation = await checkout.validateElements();
    if (validation.type === "error") {
      setSubmitting(false);
      return;
    }
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
      </motion.button>
    </form>
  );
}

function Receipt({
  sessionId,
  email,
  onDownload,
}: {
  sessionId: string;
  email: string | null;
  onDownload: () => void;
}) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<"confirming" | "ready" | "delayed">(
    "confirming",
  );
  // "intro": the check mark draws itself in the centre of the modal, then
  // slides (shared layoutId) up to its resting slot once "settled".
  const [phase, setPhase] = useState<"intro" | "settled">(
    reduced ? "settled" : "intro",
  );

  useEffect(() => {
    if (phase === "settled") return;
    const timeout = setTimeout(() => setPhase("settled"), INTRO_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

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

  if (phase === "intro") {
    return (
      <div className="checkout-receipt" data-phase="intro" aria-live="polite">
        <ReceiptMark size={72} iconSize={30} draw />
        <span className="sr-only">Payment confirmed.</span>
      </div>
    );
  }

  return (
    <div className="checkout-receipt" aria-live="polite">
      <ReceiptMark size={34} iconSize={16} />
      <motion.div
        className="checkout-receipt-body"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: "easeOut", delay: 0.18 }}
      >
        <p className="checkout-lede">
          Preciate dat cuz 🤞
          {email && (
            <>
              <br />
              <span className="checkout-receipt-sub">
                A receipt is on its way to {email}
              </span>
            </>
          )}
        </p>

        {state !== "delayed" && (
          <div
            className="checkout-download-slot"
            role="status"
            aria-busy={state === "confirming"}
          >
            {/* The skeleton fades out underneath while the button fades up in place, so nothing pops. */}
            <AnimatePresence initial={false}>
              {state === "confirming" && (
                <motion.div
                  key="skeleton"
                  className="checkout-skeleton checkout-download-skeleton"
                  aria-hidden="true"
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: reduced ? 0 : 0.3,
                      ease: "easeOut",
                    },
                  }}
                >
                  <span />
                </motion.div>
              )}
            </AnimatePresence>
            {state === "confirming" && (
              <span className="sr-only">
                Confirming with Stripe… your download will appear here in a
                moment.
              </span>
            )}
            {state === "ready" && (
              <motion.a
                className="checkout-pay"
                href={`/api/resume/download?session_id=${encodeURIComponent(sessionId)}`}
                onClick={onDownload}
                whileHover={reduced ? undefined : hoverLift}
                whileTap={reduced ? undefined : pressSpring}
              >
                Download PDF <span aria-hidden="true">↓</span>
              </motion.a>
            )}
          </div>
        )}
        {state === "delayed" && (
          <p className="checkout-status" role="status">
            Still confirming. Your download will appear here shortly. Don’t pay
            again.
          </p>
        )}
      </motion.div>
    </div>
  );
}

const INTRO_HOLD_MS = 1100;
const markSlide = { type: "spring", stiffness: 260, damping: 28 } as const;

/**
 * Signature-ringed check. The same layoutId in both receipt phases lets
 * framer-motion carry it from the centre of the modal to its final slot.
 */
function ReceiptMark({
  size,
  iconSize,
  draw = false,
}: {
  size: number;
  iconSize: number;
  draw?: boolean;
}) {
  return (
    <motion.span
      className="checkout-receipt-mark"
      style={{ width: size, height: size }}
      layoutId="checkout-receipt-mark"
      initial={draw ? { scale: 0.6, opacity: 0 } : undefined}
      animate={draw ? { scale: 1, opacity: 1 } : undefined}
      transition={{
        layout: markSlide,
        scale: { type: "spring", stiffness: 320, damping: 20 },
        opacity: { duration: 0.2 },
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width={iconSize}
        height={iconSize}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={draw ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.5, ease: "easeOut", delay: 0.2 },
            opacity: { duration: 0.1, delay: 0.2 },
          }}
        />
      </svg>
    </motion.span>
  );
}
