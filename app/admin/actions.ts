"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db/client";
import { experience, projects } from "@/db/schema";
import { experienceInput, projectInput } from "@/lib/admin/validation";

async function requireOwner() {
  const session = await auth();
  if (!session?.user) throw new Error("admin: unauthorized");
}

function formValues(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, (formData.get(k) ?? "").toString()]));
}

export async function saveProject(id: number | null, formData: FormData) {
  await requireOwner();
  const parsed = projectInput.parse(
    formValues(formData, ["title", "description", "tech", "image", "github", "live", "featured", "sortOrder"]),
  );
  const db = getDb();
  if (id === null) {
    await db.insert(projects).values(parsed);
  } else {
    await db.update(projects).set(parsed).where(eq(projects.id, id));
  }
  revalidateTag("content:projects");
  redirect("/admin");
}

export async function deleteProject(id: number) {
  await requireOwner();
  await getDb().delete(projects).where(eq(projects.id, id));
  revalidateTag("content:projects");
  redirect("/admin");
}

export async function saveExperience(id: number | null, formData: FormData) {
  await requireOwner();
  const parsed = experienceInput.parse(
    formValues(formData, ["title", "company", "duration", "impact", "techStack", "highlights", "sortOrder"]),
  );
  const db = getDb();
  if (id === null) {
    await db.insert(experience).values(parsed);
  } else {
    await db.update(experience).set(parsed).where(eq(experience.id, id));
  }
  revalidateTag("content:experience");
  redirect("/admin");
}

export async function deleteExperience(id: number) {
  await requireOwner();
  await getDb().delete(experience).where(eq(experience.id, id));
  revalidateTag("content:experience");
  redirect("/admin");
}
