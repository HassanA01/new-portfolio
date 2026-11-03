# Paid résumé integration

Price: **US$5**, one-time. Hosted Checkout → signed webhook → private PDF download.
Production URL: `https://aneeqhassan.com`.

The PDF lives in `private/AneeqHassan.pdf`, outside Next's public assets. Vercel's
file tracing includes it only in the download function. Never put a copy in `public`.
The Checkout Session ID acts as a bearer download credential: keep it private.
Pages and downloads containing it disable indexing/referrer sharing/caching.
Access lasts seven days after Checkout creation; save the PDF to keep it.

The webhook verifies Stripe's signature and checks product, currency, amount and
paid status. It persists a fulfillment flag on the Checkout Session itself. This
keeps access durable across Vercel invocations without a local database or disk
writes. Duplicate events safely write the same entitlement. Unpaid delayed-method
sessions wait for `checkout.session.async_payment_succeeded`. Downloads recheck
payment and fulfillment, and reject refunded or disputed charges.

## Configure and test before live traffic

1. Use a Stripe sandbox for development. Store credentials in ignored `.env.local`
   locally and sensitive Vercel environment variables in production:
   - `APP_URL=https://aneeqhassan.com` (local: `http://localhost:3000`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: matching Stripe publishable key for the homepage checkout modal.
   - `STRIPE_SECRET_KEY`: a restricted key with Checkout Sessions read/write,
     Products and Prices write (inline price creation), PaymentIntents read and
     Charges read. Never expose it using a `NEXT_PUBLIC_` variable.
   - `STRIPE_WEBHOOK_SECRET`: the endpoint's signing secret.
2. Register `https://aneeqhassan.com/api/stripe/webhook` in Stripe Workbench for
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and
   `checkout.session.async_payment_failed`. Failure events are acknowledged without
   granting access. For local testing, Stripe CLI can forward events to
   `localhost:3000/api/stripe/webhook`; use its separate signing secret.
3. Test checkout success/cancellation, delayed payment, duplicate webhook delivery,
   expired access, unpaid downloads, refund/dispute blocking and signature rejection.
4. Replace sandbox configuration with live restricted credentials and the live
   endpoint signing secret only after testing. Redeploy Vercel after changing env.

Tax calculation is not enabled. Confirm applicable tax registrations before enabling
Stripe Tax. The success page polls for webhook fulfillment; it never grants access.
It advises paid users to retry rather than pay again if confirmation is delayed.

## Commands

```sh
docker compose up --build
# In another terminal:
docker compose exec web npm run typecheck
docker compose exec web node --test tests/resume-payments.test.mjs
docker build --target test -t portfolio-test .
docker build --target production -t portfolio .
```

No real payment has been tested or charged during implementation. Account connection,
production secrets, webhook registration, sandbox validation and deployment remain
required before this is live.
