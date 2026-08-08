import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("db: DATABASE_URL is not set");
  return drizzle(new Pool({ connectionString: url, max: 3 }), { schema });
}

let _db: ReturnType<typeof create> | null = null;

export function getDb() {
  if (!_db) _db = create();
  return _db;
}

export type Db = ReturnType<typeof getDb>;
