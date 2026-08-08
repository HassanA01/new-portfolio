"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
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
  redirect("/admin");
}

export async function deleteProject(id: number) {
  await requireOwner();
  await getDb().delete(projects).where(eq(projects.id, id));
  revalidateTag("content:projects");
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
  redirect("/admin");
}

export async function deleteExperience(id: number) {
  await requireOwner();
  await getDb().delete(experience).where(eq(experience.id, id));
  revalidateTag("content:experience");
  redirect("/admin");
}
