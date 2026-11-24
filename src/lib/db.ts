import fs from "node:fs";
import path from "node:path";

/**
 * Database access layer.
 *
 * Architecture decision — one SQL schema, two interchangeable engines:
 *  • DATABASE_URL set   → node-postgres Pool (Supabase / any PostgreSQL 14+)
 *  • DATABASE_URL empty → PGlite: the real PostgreSQL engine compiled to WASM,
 *                         persisted in ./.data — zero-setup for demos & grading.
 * Both run the exact same migrations in /supabase/migrations and the exact same
 * parameterised SQL below, so nothing is "faked" in local mode.
 */

export type Row = Record<string, unknown>;
export interface Queryable {
  query<T = Row>(sql: string, params?: unknown[]): Promise<T[]>;
}
interface Engine extends Queryable {
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  kind: "postgres" | "pglite";
}

async function createEngine(): Promise<Engine> {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: url,
      max: 10,
      ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
    });
    return {
      kind: "postgres",
      async query(sql, params = []) {
        const res = await pool.query(sql, params as unknown[]);
        return res.rows;
      },
      async exec(sql) {
        await pool.query(sql);
      },
      async transaction(fn) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const result = await fn({
            query: async (sql, params = []) => (await client.query(sql, params as unknown[])).rows,
          });
          await client.query("COMMIT");
          return result;
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      },
    };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const dir = path.join(process.cwd(), ".data", "pglite");
  fs.mkdirSync(dir, { recursive: true });
  const db = new PGlite(dir);
  await db.waitReady;
  return {
    kind: "pglite",
    async query(sql, params = []) {
      const res = await db.query(sql, params as unknown[]);
      return res.rows as never[];
    },
    async exec(sql) {
      await db.exec(sql);
    },
    async transaction(fn) {
      return db.transaction(async (tx) =>
        fn({ query: async (sql, params = []) => (await tx.query(sql, params as unknown[])).rows as never[] }),
      );
    },
  };
}

const g = globalThis as unknown as { __mednovaDb?: Promise<Engine> };

async function init(): Promise<Engine> {
  const engine = await createEngine();
  const dir = path.join(process.cwd(), "supabase", "migrations");
  // 001 is portable; 002 (RLS for Supabase roles) only applies on Supabase.
  await engine.exec(fs.readFileSync(path.join(dir, "001_schema.sql"), "utf8"));
  const { seedIfEmpty } = await import("./seed");
  await seedIfEmpty(engine);
  return engine;
}

export function getDb(): Promise<Engine> {
  if (!g.__mednovaDb) {
    g.__mednovaDb = init().catch((err) => {
      g.__mednovaDb = undefined;
      throw err;
    });
  }
  return g.__mednovaDb;
}

export async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await getDb()).query<T>(sql, params);
}

export async function one<T = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> {
  return (await getDb()).transaction(fn);
}

export async function dbKind() {
  return (await getDb()).kind;
}
