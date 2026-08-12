import { reembedAll } from "@/lib/agent/embed";

reembedAll()
  .then((r) => {
    console.log(`embed: ${r.embedded} embedded, ${r.skipped} unchanged, ${r.deleted} pruned`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
