import type { Metadata } from "next";
import ResumeDownload from "@/components/ResumeDownload";
export const metadata: Metadata = {
  title: "Your résumé download",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  return (
    <main id="main-content" className="page-content resume-purchase">
      <h1>Your résumé download</h1>
      {session_id ? (
        <ResumeDownload sessionId={session_id} />
      ) : (
        <p>Open the download link from your Stripe checkout.</p>
      )}
    </main>
  );
}
