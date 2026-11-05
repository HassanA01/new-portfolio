import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

function load(file, overrides = {}) {
  const source = new URL(file, import.meta.url);
  const js = ts.transpileModule(fs.readFileSync(source, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const result = { exports: {} };
  const original = createRequire(source);
  new Function("require", "module", "exports", js)(
    (name) => overrides[name] ?? original(name),
    result,
    result.exports,
  );
  return result.exports;
}
const policy = load("../lib/resume-payments.ts");
const paid = {
  id: "cs_test_abcdefghijklmnop",
  mode: "payment",
  currency: "cad",
  amount_total: 500,
  payment_status: "paid",
  created: 1000,
  metadata: { product: policy.RESUME_PRODUCT, resume_fulfilled: "true" },
};

test("download requires the correct product, currency, amount and paid status", () => {
  assert.equal(policy.canDownload(paid, 1001000), true);
  for (const patch of [
    { mode: "subscription" },
    { currency: "usd" },
    { amount_total: 100 },
    { payment_status: "unpaid" },
    { metadata: { product: "other", resume_fulfilled: "true" } },
  ]) {
    assert.equal(policy.canDownload({ ...paid, ...patch }, 1001000), false);
  }
});
test("success-page redirect cannot grant access before webhook fulfillment", () => {
  assert.equal(
    policy.canDownload(
      { ...paid, metadata: { product: policy.RESUME_PRODUCT } },
      1001000,
    ),
    false,
  );
});
test("download expires exactly seven days after session creation", () => {
  const expiry = (paid.created + policy.DOWNLOAD_WINDOW) * 1000;
  assert.equal(policy.canDownload(paid, expiry - 1), true);
  assert.equal(policy.canDownload(paid, expiry), false);
});
test("malformed session IDs are rejected", () => {
  assert.equal(policy.validSessionId(paid.id), true);
  for (const id of [
    null,
    "",
    "cs_test_a",
    "../private/AneeqHassan.pdf",
    "cs_test_foo?x=1",
  ])
    assert.equal(policy.validSessionId(id), false);
});
test("checkout uses the configured origin and fixed CA$5 pricing", async () => {
  let payload;
  const checkout = load("../app/api/resume/checkout/route.ts", {
    "@/lib/rate-limit": { rateLimitResponse: async () => null },
    "@/lib/resume-payments": {
      ...policy,
      appOrigin: () => "https://portfolio.example",
      stripeClient: () => ({
        checkout: {
          sessions: {
            create: async (data) => {
              payload = data;
              return { url: "https://checkout.stripe.com/test" };
            },
          },
        },
      }),
    },
  });
  const denied = await checkout.POST(
    new Request("https://portfolio.example/api/resume/checkout", {
      method: "POST",
      headers: { origin: "https://attacker.example" },
    }),
  );
  assert.equal(denied.status, 403);
  assert.equal(payload, undefined);
  const response = await checkout.POST(
    new Request("https://portfolio.example/api/resume/checkout", {
      method: "POST",
      headers: { origin: "https://portfolio.example" },
      body: "amount=1",
    }),
  );
  assert.equal(response.status, 303);
  assert.equal(payload.line_items[0].price_data.unit_amount, 500);
  assert.equal(payload.line_items[0].price_data.currency, "cad");
  assert.equal(payload.payment_method_types, undefined);
});
test("webhook signature validation and paid-session fulfillment are idempotent", async () => {
  process.env.STRIPE_WEBHOOK_SECRET = "test-signing-secret";
  const previousKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "unit-test-placeholder";
  let writes = 0;
  let current = { ...paid, metadata: { product: policy.RESUME_PRODUCT } };
  const client = {
    webhooks: {
      constructEvent: (_body, signature) => {
        if (signature !== "valid") throw new Error("bad signature");
        return {
          id: "evt_test",
          type: "checkout.session.completed",
          data: { object: current },
        };
      },
    },
    checkout: {
      sessions: {
        retrieve: async () => current,
        update: async () => {
          writes++;
          current = paid;
        },
      },
    },
  };
  const webhook = load("../app/api/stripe/webhook/route.ts", {
    "@/lib/resume-payments": { ...policy, stripeClient: () => client },
  });
  const request = (signature) =>
    new Request("https://portfolio.example/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": signature },
      body: "{}",
    });
  assert.equal((await webhook.POST(request("invalid"))).status, 400);
  assert.equal(writes, 0);
  current = { ...current, payment_status: "unpaid" };
  assert.equal((await webhook.POST(request("valid"))).status, 200);
  assert.equal(writes, 0);
  current = { ...current, payment_status: "paid" };
  await webhook.POST(request("valid"));
  await webhook.POST(request("valid"));
  assert.equal(writes, 1);
  delete process.env.STRIPE_WEBHOOK_SECRET;
  if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = previousKey;
});
test("résumé is not publicly served", () => {
  assert.ok(
    !fs.existsSync(new URL("../public/AneeqHassan.pdf", import.meta.url)),
  );
  assert.ok(
    fs.existsSync(new URL("../private/AneeqHassan.pdf", import.meta.url)),
  );
});

test("download denies unpaid and refunded sessions and only serves fulfilled PDFs", async () => {
  let current = {
    ...paid,
    created: Math.floor(Date.now() / 1000),
    payment_intent: "pi_test",
  };
  let refunded = false;
  let reads = 0;
  const download = load("../app/api/resume/download/route.ts", {
    "@/lib/resume-payments": {
      ...policy,
      stripeClient: () => ({
        checkout: { sessions: { retrieve: async () => current } },
        paymentIntents: {
          retrieve: async () => ({
            latest_charge: { refunded, disputed: false },
          }),
        },
      }),
    },
    "node:fs/promises": {
      readFile: async () => {
        reads++;
        return Buffer.from("%PDF-test");
      },
    },
  });
  const request = () =>
    new Request(
      `https://portfolio.example/api/resume/download?session_id=${paid.id}`,
    );
  current = { ...current, payment_status: "unpaid" };
  assert.equal((await download.GET(request())).status, 403);
  assert.equal(reads, 0);
  current = { ...current, payment_status: "paid" };
  refunded = true;
  assert.equal((await download.GET(request())).status, 403);
  assert.equal(reads, 0);
  refunded = false;
  const response = await download.GET(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/pdf");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.match(response.headers.get("content-disposition"), /attachment/);
  assert.equal(await response.text(), "%PDF-test");
});

test("custom checkout returns a client secret and uses return_url", async () => {
  let payload;
  const checkout = load("../app/api/resume/checkout/route.ts", {
    "@/lib/rate-limit": { rateLimitResponse: async () => null },
    "@/lib/resume-payments": {
      ...policy,
      appOrigin: () => "https://portfolio.example",
      stripeClient: () => ({
        checkout: {
          sessions: {
            create: async (data) => {
              payload = data;
              return { client_secret: "unit-test-client-secret" };
            },
          },
        },
      }),
    },
  });
  const response = await checkout.POST(
    new Request("https://portfolio.example/api/resume/checkout", {
      method: "POST",
      headers: {
        origin: "https://portfolio.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({ ui: "elements" }),
    }),
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).clientSecret, "unit-test-client-secret");
  assert.equal(payload.ui_mode, "elements");
  assert.equal(payload.success_url, undefined);
  assert.match(payload.return_url, /\/resume\/success\?session_id=/);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});
