import Link from "next/link";
import { asc } from "drizzle-orm";
import { signOut } from "@/auth";
import { getDb } from "@/db/client";
import { experience, projects } from "@/db/schema";
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Surface } from "@/components/ui/Surface";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const db = getDb();
  const projectRows = await db.select().from(projects).orderBy(asc(projects.sortOrder));
  const experienceRows = await db.select().from(experience).orderBy(asc(experience.sortOrder));
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-4xl font-medium tracking-[-0.035em] text-ink">
          Admin.<span className="text-ink-faint"> Content lives here.</span>
        </h1>
        <div className="flex items-center gap-4">
          <GlassButton variant="ghost" href="/admin/messages">Messages →</GlassButton>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <GlassButton variant="ghost" type="submit">Sign out →</GlassButton>
          </form>
        </div>
      </div>

      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-medium text-ink">Projects</h2>
          <GlassButton variant="ghost" href="/admin/projects/new">New project →</GlassButton>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {projectRows.map((p) => (
            <Surface as="li" interactive key={p.id} className="p-4">
              <Link href={`/admin/projects/${p.id}`} className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-ink">{p.title}</span>
                <MonoDetail>{p.featured ? "featured · " : ""}#{p.sortOrder}</MonoDetail>
              </Link>
            </Surface>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-medium text-ink">Experience</h2>
          <GlassButton variant="ghost" href="/admin/experience/new">New role →</GlassButton>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {experienceRows.map((e) => (
            <Surface as="li" interactive key={e.id} className="p-4">
              <Link href={`/admin/experience/${e.id}`} className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-ink">
                  {e.company} <span className="text-ink-muted">— {e.title}</span>
                </span>
                <MonoDetail>#{e.sortOrder}</MonoDetail>
              </Link>
            </Surface>
          ))}
        </ul>
      </section>
    </>
  );
}
