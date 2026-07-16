/**
 * D1 Local Shim
 * ─────────────
 * Provides a D1Database-compatible interface backed by the local
 * .wrangler/state/v3/d1 SQLite file created by `wrangler d1 migrations apply --local`.
 *
 * Used ONLY in Node.js dev mode (i.e. `npm run dev` via Vite).
 * In production (Cloudflare Workers), the real D1 binding is used.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../");

function findLocalD1DbPath(): string {
  const d1Dir = path.join(
    projectRoot,
    ".wrangler",
    "state",
    "v3",
    "d1",
    "miniflare-D1DatabaseObject"
  );

  if (!fs.existsSync(d1Dir)) {
    throw new Error(
      `Local D1 directory not found at: ${d1Dir}\n` +
        "Run: npx wrangler d1 migrations apply mind2care-db --local"
    );
  }

  const files = fs.readdirSync(d1Dir).filter((f) => f.endsWith(".sqlite") && !f.includes("-shm") && !f.includes("-wal") && f !== "metadata.sqlite");

  if (files.length === 0) {
    throw new Error(
      `No SQLite database file found in: ${d1Dir}\n` +
        "Run: npx wrangler d1 migrations apply mind2care-db --local"
    );
  }

  return path.join(d1Dir, files[0]);
}

// Singleton DB connection
let _db: Database.Database | null = null;

function getLocalDb(): Database.Database {
  if (!_db) {
    const dbPath = findLocalD1DbPath();
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
  }
  return _db;
}

// ─── D1Result shim ───────────────────────────────────────────────────────────

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    changed_db: boolean;
    changes: number;
    last_row_id: number;
    duration: number;
    size_after: number;
    rows_read: number;
    rows_written: number;
  };
}

// ─── D1PreparedStatement shim ────────────────────────────────────────────────

class LocalD1PreparedStatement {
  private _query: string;
  private _bindings: unknown[] = [];

  constructor(query: string) {
    this._query = query;
  }

  bind(...values: unknown[]): D1PreparedStatement {
    const stmt = new LocalD1PreparedStatement(this._query);
    stmt._bindings = values;
    return stmt as any;
  }

  async first<T = Record<string, unknown>>(_colName?: string): Promise<T | null> {
    const db = getLocalDb();
    try {
      const stmt = db.prepare(this._query);
      const row = stmt.get(...this._bindings) as Record<string, unknown> | undefined;
      if (!row) return null;
      if (_colName !== undefined) return (row[_colName] ?? null) as T;
      return row as T;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`D1 shim first() error: ${msg}\nQuery: ${this._query}`);
    }
  }

  async run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    const db = getLocalDb();
    try {
      const stmt = db.prepare(this._query);
      const info = stmt.run(...this._bindings);
      return {
        results: [] as T[],
        success: true as const,
        meta: {
          changed_db: info.changes > 0,
          changes: info.changes,
          last_row_id: Number(info.lastInsertRowid),
          duration: 0,
          size_after: 0,
          rows_read: 0,
          rows_written: info.changes,
        },
      } as any;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`D1 shim run() error: ${msg}\nQuery: ${this._query}`);
    }
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    const db = getLocalDb();
    try {
      const stmt = db.prepare(this._query);
      const rows = stmt.all(...this._bindings) as T[];
      return {
        results: rows,
        success: true as const,
        meta: {
          changed_db: false,
          changes: 0,
          last_row_id: 0,
          duration: 0,
          size_after: 0,
          rows_read: rows.length,
          rows_written: 0,
        },
      } as any;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`D1 shim all() error: ${msg}\nQuery: ${this._query}`);
    }
  }

  raw<T = unknown[]>(options: { columnNames: true }): Promise<[string[], ...T[]]>;
  raw<T = unknown[]>(options?: { columnNames?: false }): Promise<T[]>;
  async raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<any> {
    const db = getLocalDb();
    try {
      const stmt = db.prepare(this._query);
      if (options?.columnNames) {
        const columns = stmt.columns().map((c: any) => c.name);
        const rows = stmt.raw().all(...this._bindings) as T[];
        return [columns, ...rows] as any;
      }
      const rows = stmt.raw().all(...this._bindings);
      return rows as T[];
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`D1 shim raw() error: ${msg}\nQuery: ${this._query}`);
    }
  }
}

// ─── D1Database shim ─────────────────────────────────────────────────────────

class LocalD1Database {
  prepare(query: string): D1PreparedStatement {
    return new LocalD1PreparedStatement(query) as any;
  }

  async dump(): Promise<ArrayBuffer> {
    throw new Error("D1 shim: dump() not implemented.");
  }

  async batch<T = unknown>(
    statements: D1PreparedStatement[]
  ): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    for (const stmt of statements) {
      results.push(await (stmt as any).all<T>());
    }
    return results as any;
  }

  async exec(query: string): Promise<D1ExecResult> {
    const db = getLocalDb();
    try {
      db.exec(query);
      return { count: 1, duration: 0 };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`D1 shim exec() error: ${msg}`);
    }
  }

  withSession(constraintOrBookmark?: string): D1DatabaseSession {
    return {
      prepare: (query: string) => this.prepare(query),
      batch: <T = unknown>(statements: D1PreparedStatement[]) => this.batch<T>(statements),
      exec: (query: string) => this.exec(query),
      getBookmark: () => constraintOrBookmark ?? null,
    };
  }
}

/**
 * Returns a D1Database shim backed by the local wrangler SQLite file.
 * Only call this from server-side Node.js dev code.
 */
export function getLocalD1(): D1Database {
  return new LocalD1Database();
}
