import type { Metadata } from "next";
export const metadata: Metadata = { title: "Blog" };
export default function Blog() {
  return (
    <main id="main-content" className="page-content">
      <div className="introduction">
        <h1>Blog</h1>
        <p>Nothing here yet.</p>
      </div>
    </main>
  );
}
