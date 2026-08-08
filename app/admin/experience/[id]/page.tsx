import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { experience } from "@/db/schema";
import { deleteExperience } from "@/app/admin/actions";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = (await getDb().select().from(experience).where(eq(experience.id, Number(id))))[0];
  if (!row) notFound();
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-ink">
          Edit: {row.company} — {row.title}
        </h1>
        <DeleteButton label={`${row.company} — ${row.title}`} action={deleteExperience.bind(null, row.id)} />
      </div>
      <ExperienceForm row={row} />
    </>
  );
}
