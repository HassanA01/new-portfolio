"use client";

import { useActionState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { saveExperience } from "@/app/admin/actions";
import type { experience } from "@/db/schema";

type Row = typeof experience.$inferSelect;

const field =
  "mt-1 w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus-visible:border-ink/30";

export function ExperienceForm({ row }: { row: Row | null }) {
  const action = saveExperience.bind(null, row?.id ?? null);
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className="mt-10 grid max-w-xl gap-5">
      <label className="block">
        <MonoDetail>Company</MonoDetail>
        <input name="company" defaultValue={row?.company ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Title</MonoDetail>
        <input name="title" defaultValue={row?.title ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Duration</MonoDetail>
        <input name="duration" defaultValue={row?.duration ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Impact one-liner</MonoDetail>
        <input name="impact" defaultValue={row?.impact ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Tech stack — one per line</MonoDetail>
        <textarea name="techStack" rows={4} defaultValue={row?.techStack.join("\n") ?? ""} className={field} required />
      </label>
      <label className="block">
        <MonoDetail>Highlights — one per line</MonoDetail>
        <textarea name="highlights" rows={5} defaultValue={row?.highlights.join("\n") ?? ""} className={field} required />
      </label>
      <label className="flex items-center gap-2">
        <MonoDetail>Order</MonoDetail>
        <input type="number" name="sortOrder" defaultValue={row?.sortOrder ?? 0} className={`${field} mt-0 w-24`} required />
      </label>
      {state?.error && (
        <p className="text-sm text-ink-muted">⚠ {state.error}</p>
      )}
      <div>
        <GlassButton type="submit">Save</GlassButton>
      </div>
    </form>
  );
}
