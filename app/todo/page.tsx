import type { Metadata } from "next";

export const metadata: Metadata = { title: "Todo" };

export default function Todo() {
  return (
    <main id="main-content" className="page-content todo-page">
      <div className="introduction">
        <h1>Todo</h1>
        <ul className="todo-list">
          <li>Build Anike, my agent.</li>
          <li>Upload images for the memories section on the About me page.</li>
          <li>
            Add a goat photo that pops up when hovering over “vibing with the
            goats” on the About me page.
          </li>
          <li>Upload all my résumés in chronological order.</li>
          <li>
            Record myself reading the About me text and add a voice option so
            visitors can listen to it.
          </li>
        </ul>
      </div>
    </main>
  );
}
