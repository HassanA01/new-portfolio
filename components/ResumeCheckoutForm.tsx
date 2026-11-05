"use client";

import { useState } from "react";

export default function ResumeCheckoutForm() {
  const [pending, setPending] = useState(false);
  return (
    <form
      action="/api/resume/checkout"
      method="post"
      onSubmit={() => setPending(true)}
    >
      <button className="resume-action" type="submit" disabled={pending}>
        {pending ? "Opening checkout…" : "Get résumé · CA$5"}
        {!pending && <span aria-hidden="true">↗</span>}
      </button>
    </form>
  );
}
