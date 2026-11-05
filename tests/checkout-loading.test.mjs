import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const source = new URL("../components/CheckoutModal.tsx", import.meta.url);
let checkoutResult = { type: "loading" };
let paymentProps;
const compiled = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  },
}).outputText;
const loaded = { exports: {} };
const require = createRequire(source);
new Function("require", "module", "exports", compiled)(
  (name) => {
    if (name === "@stripe/stripe-js") return { loadStripe: () => null };
    if (name === "@/components/ui/accordion")
      return { disclosureSpring: {}, hoverLift: {}, pressSpring: {} };
    if (name === "@/components/ConfirmExit") return { default: () => null };
    if (name === "@stripe/react-stripe-js/checkout")
      return {
        useCheckoutElements: () => checkoutResult,
        PaymentElement: (props) => {
          paymentProps = props;
          return React.createElement("div", { "data-stripe-fields": true });
        },
      };
    return require(name);
  },
  loaded,
  loaded.exports,
);
const render = () =>
  renderToStaticMarkup(
    React.createElement(loaded.exports.CheckoutForm, { onPaid() {} }),
  );

test("session loading reserves the payment slot and shows an accessible skeleton", () => {
  checkoutResult = { type: "loading" };
  const html = render();
  assert.match(html, /checkout-payment-slot/);
  assert.match(html, /checkout-email-skeleton/);
  assert.match(html, /checkout-email-slot[^>]*data-ready="false"/);
  assert.match(html, /Loading secure payment fields/);
  assert.match(html, /disabled=""/);
});
test("session success keeps skeleton and payment disabled until Stripe fields report ready", () => {
  checkoutResult = {
    type: "success",
    checkout: {
      total: { total: { minorUnitsAmount: 500 } },
      minorUnitsAmountDivisor: 100,
    },
  };
  const html = render();
  assert.match(html, /Loading secure payment fields/);
  assert.match(html, /data-ready="false"/);
  assert.match(html, /inert=""/);
  assert.match(html, /disabled=""[^>]*>Pay CA\$5/);
  assert.equal(typeof paymentProps.onReady, "function");
  assert.equal(typeof paymentProps.onLoadError, "function");
});
