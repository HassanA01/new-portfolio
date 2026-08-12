"use client";

export function DeleteButton({ label, action }: { label: string; action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete ${label}? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm text-ink-muted underline decoration-line underline-offset-4 hover:text-ink">
        Delete
      </button>
    </form>
  );
}
