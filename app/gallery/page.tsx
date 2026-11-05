import type { Metadata } from "next";
export const metadata: Metadata = { title: "Gallery" };
export default function Gallery() {
  return (
    <main id="main-content" className="page-content about-page simple-page">
      <h1>Gallery</h1>
      <p className="simple-page-empty">Nothing here yet.</p>
    </main>
  );
}
