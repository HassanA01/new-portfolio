"use client";
import { useEffect, useState } from "react";
export default function ResumeDownload({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<"waiting" | "ready" | "error">("waiting");
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const controller = new AbortController();
    const check = async () => {
      try {
        const response = await fetch(
          `/api/resume/status?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Verification failed");
        const data = await response.json();
        if (!active) return;
        if (data.ready) setState("ready");
        else if (++attempts < 20) timeout = setTimeout(check, 2000);
        else setState("error");
      } catch {
        if (active) setState("error");
      }
    };
    void check();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [sessionId]);
  return (
    <div aria-live="polite">
      {state === "waiting" && (
        <p>Confirming your payment… Your download will appear here shortly.</p>
      )}
      {state === "ready" && (
        <>
          <p>Your résumé is ready.</p>
          <a
            className="resume-action"
            href={`/api/resume/download?session_id=${encodeURIComponent(sessionId)}`}
          >
            Download PDF ↓
          </a>
          <p className="resume-note">
            Save this page to download again within 7 days. Keep the link
            private.
          </p>
        </>
      )}
      {state === "error" && (
        <>
          <p>
            Your download isn’t ready yet. If you paid, refresh this page in a
            moment. Don’t pay again.
          </p>
          <button
            type="button"
            className="resume-action"
            onClick={() => window.location.reload()}
          >
            Check again
          </button>
        </>
      )}
    </div>
  );
}
