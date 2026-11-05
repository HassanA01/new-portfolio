import { todoItems } from "@/data/todo";

/** Bulleted to-do list; finished items are struck through and dimmed. */
export default function TodoList({ className }: { className?: string }) {
  return (
    <ul className={["todo-list", className].filter(Boolean).join(" ")}>
      {todoItems.map((item) =>
        item.done ? (
          <li key={item.text} className="todo-done">
            <s>{item.text}</s>
          </li>
        ) : (
          <li key={item.text}>{item.text}</li>
        ),
      )}
    </ul>
  );
}
