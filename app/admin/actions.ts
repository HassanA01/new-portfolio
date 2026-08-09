"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db/client";
import { experience, messages, projects } from "@/db/schema";
import { experienceInput, projectInput } from "@/lib/admin/validation";
import { reembedSource } from "@/lib/agent/embed";

async function requireOwner() {
  const session = await auth();
  if (!session?.user) throw new Error("admin: unauthorized");
}

function formValues(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, (formData.get(k) ?? "").toString()]));
}

type ActionState = { error: string } | null;

export async function saveProject(
  id: number | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOwner();
  const result = projectInput.safeParse(
    formValues(formData, ["title", "description", "tech", "image", "github", "live", "featured", "sortOrder"]),
  );
  if (!result.success) {
    const issue = result.error.issues[0];
    return { error: `${String(issue.path[0] ?? "field")}: ${issue.message}` };
  }
  const db = getDb();
  let oldProjectKey: string | null = null;
  if (id !== null) {
    const [existing] = await db.select({ title: projects.title }).from(projects).where(eq(projects.id, id));
    if (existing) oldProjectKey = existing.title;
  }
  try {
    if (id === null) {
      await db.insert(projects).values(result.data);
    } else {
      await db.update(projects).set(result.data).where(eq(projects.id, id));
    }
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if ((err as { code?: string }).code === "23505") {
      return { error: "A row with that title/key already exists." };
    }
    throw err;
  }
  revalidateTag("content:projects");
  try { await reembedSource("project", result.data.title); } catch (err) { console.error("embed: project re-embed failed", err); }
  if (oldProjectKey !== null && oldProjectKey !== result.data.title) {
    reembedSource("project", oldProjectKey).catch((err) => console.error("embed: project stale-key prune failed", err));
  }
  redirect("/admin");
}

export async function deleteProject(id: number) {
  await requireOwner();
  const db = getDb();
  const [row] = await db.select({ title: projects.title }).from(projects).where(eq(projects.id, id));
  await db.delete(projects).where(eq(projects.id, id));
  revalidateTag("content:projects");
  if (row) { try { await reembedSource("project", row.title); } catch (err) { console.error("embed: project re-embed failed", err); } }
  redirect("/admin");
}

export async function saveExperience(
  id: number | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOwner();
  const result = experienceInput.safeParse(
    formValues(formData, ["title", "company", "duration", "impact", "techStack", "highlights", "sortOrder"]),
  );
  if (!result.success) {
    const issue = result.error.issues[0];
    return { error: `${String(issue.path[0] ?? "field")}: ${issue.message}` };
  }
  const db = getDb();
  let oldExperienceKey: string | null = null;
  if (id !== null) {
    const [existing] = await db.select({ company: experience.company, title: experience.title }).from(experience).where(eq(experience.id, id));
    if (existing) oldExperienceKey = `${existing.company} — ${existing.title}`;
  }
  try {
    if (id === null) {
      await db.insert(experience).values(result.data);
    } else {
      await db.update(experience).set(result.data).where(eq(experience.id, id));
    }
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if ((err as { code?: string }).code === "23505") {
      return { error: "A row with that title/key already exists." };
    }
    throw err;
  }
  revalidateTag("content:experience");
  const newExperienceKey = `${result.data.company} — ${result.data.title}`;
  try { await reembedSource("experience", newExperienceKey); } catch (err) { console.error("embed: experience re-embed failed", err); }
  if (oldExperienceKey !== null && oldExperienceKey !== newExperienceKey) {
    reembedSource("experience", oldExperienceKey).catch((err) => console.error("embed: experience stale-key prune failed", err));
  }
  redirect("/admin");
}

export async function deleteExperience(id: number) {
  await requireOwner();
  const db = getDb();
  const [row] = await db.select({ company: experience.company, title: experience.title }).from(experience).where(eq(experience.id, id));
  await db.delete(experience).where(eq(experience.id, id));
  revalidateTag("content:experience");
  if (row) { try { await reembedSource("experience", `${row.company} — ${row.title}`); } catch (err) { console.error("embed: experience re-embed failed", err); } }
  redirect("/admin");
}

export async function markMessageRead(id: number) {
  await requireOwner();
  await getDb().update(messages).set({ read: true }).where(eq(messages.id, id));
  redirect("/admin/messages");
}
