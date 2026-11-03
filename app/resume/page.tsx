import ResumeCheckoutForm from "@/components/ResumeCheckoutForm";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Get my résumé" };
export default function Resume() {
  return (
    <main id="main-content" className="page-content resume-purchase">
      <h1>My résumé</h1>
      <p>Get my latest résumé as a PDF for US$5.</p>
      <p className="resume-note">
        Your download link works for 7 days after purchase. Save a copy to keep
        it.
      </p>
      <ResumeCheckoutForm />
      <p className="resume-note">
        Secure checkout with Stripe. Changed your mind? You can cancel at
        checkout.
      </p>
    </main>
  );
}
