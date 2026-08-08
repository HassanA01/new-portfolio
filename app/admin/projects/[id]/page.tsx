import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { projects } from "@/db/schema";
import { deleteProject } from "@/app/admin/actions";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = (await getDb().select().from(projects).where(eq(projects.id, Number(id))))[0];
  if (!row) notFound();
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-ink">Edit: {row.title}</h1>
        <DeleteButton label={row.title} action={deleteProject.bind(null, row.id)} />
      </div>
      <ProjectForm row={row} />
    </>
  );
}
