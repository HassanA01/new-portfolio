"use client";

import { useActionState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { saveProject } from "@/app/admin/actions";
import type { projects } from "@/db/schema";

type Row = typeof projects.$inferSelect;

const field =
  "mt-1 w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus-visible:border-ink/30";

export function ProjectForm({ row }: { row: Row | null }) {
  const action = saveProject.bind(null, row?.id ?? null);
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className="mt-10 grid max-w-xl gap-5">
      <label className="block">
        <MonoDetail>Title</MonoDetail>
        <input name="title" defaultValue={row?.title ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Description</MonoDetail>
        <textarea name="description" rows={3} defaultValue={row?.description ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Tech — one per line</MonoDetail>
        <textarea name="tech" rows={4} defaultValue={row?.tech.join("\n") ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Image path or URL</MonoDetail>
        <input name="image" defaultValue={row?.image ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>GitHub URL</MonoDetail>
        <input name="github" defaultValue={row?.github ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Live URL — optional</MonoDetail>
        <input name="live" defaultValue={row?.live ?? ""} className={field} />
      </label>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="featured" value="true" defaultChecked={row?.featured ?? false} />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <MonoDetail>Order</MonoDetail>
          <input type="number" name="sortOrder" defaultValue={row?.sortOrder ?? 0} className={`${field} mt-0 w-24`} required />
        </label>
      </div>
      {state?.error && (
        <p className="text-sm text-ink-muted">⚠ {state.error}</p>
      )}
      <div>
        <GlassButton type="submit">Save</GlassButton>
      </div>
    </form>
  );
}
