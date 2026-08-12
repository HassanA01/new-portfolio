import { desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { messages } from "@/db/schema";
import { markMessageRead } from "@/app/admin/actions";
import { GlassButton } from "@/components/ui/GlassButton";
import { MonoDetail } from "@/components/ui/MonoDetail";
import { Surface } from "@/components/ui/Surface";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const rows = await getDb().select().from(messages).orderBy(desc(messages.createdAt));
  return (
    <>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-ink">Messages</h1>
        <GlassButton variant="ghost" href="/admin">← Admin</GlassButton>
      </div>
      <ul className="mt-10 grid gap-3">
        {rows.length === 0 && <MonoDetail>No messages yet</MonoDetail>}
        {rows.map((m) => (
          <Surface as="li" key={m.id} className={m.read ? "opacity-60" : undefined}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-ink">
                {m.fromName ?? "Anonymous"} <span className="text-ink-muted">— {m.fromEmail}</span>
              </span>
              <MonoDetail>{m.createdAt.toISOString().slice(0, 16).replace("T", " ")}</MonoDetail>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{m.body}</p>
            {!m.read && (
              <form action={markMessageRead.bind(null, m.id)} className="mt-3">
                <GlassButton variant="ghost" type="submit">Mark read →</GlassButton>
              </form>
            )}
          </Surface>
        ))}
      </ul>
    </>
  );
}
