import type { Metadata } from "next";
import TodoList from "@/components/TodoList";

export const metadata: Metadata = { title: "Todo" };

export default function Todo() {
  return (
    <main id="main-content" className="page-content todo-page">
      <div className="introduction">
        <h1>Todo</h1>
        <TodoList />
      </div>
    </main>
  );
}
