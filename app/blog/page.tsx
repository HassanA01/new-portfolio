import type { Metadata } from "next";
export const metadata: Metadata = { title: "Blog" };
export default function Blog() {
  return (
    <main id="main-content" className="page-content about-page simple-page">
      <h1>Blog</h1>
      <p className="simple-page-empty">Nothing here yet.</p>
    </main>
  );
}
