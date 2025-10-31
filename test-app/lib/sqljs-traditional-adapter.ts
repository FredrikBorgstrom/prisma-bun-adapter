/// <reference types="bun" />
import initSqlJs, { Database, SqlJsStatic } from "sql.js";

type QueryRow = Record<string, any>;

interface SqlJsRunResult {
  affectedRows: number;
  lastInsertRowid: number | null;
}

const SELECT_LIKE_PREFIXES = ["SELECT", "WITH", "PRAGMA", "EXPLAIN"];

/**
 * Minimal wrapper around sql.js that behaves like a traditional SQLite client.
 * Used to provide a non-Bun baseline that still runs inside the Bun runtime.
 */
export class SqlJsTraditionalClient {
  private static modulePromise: Promise<SqlJsStatic> | null = null;
  private readonly dbPromise: Promise<Database>;
  private readonly filename: string;

  constructor(filename: string = ":memory:") {
    this.filename = filename;
    this.dbPromise = SqlJsTraditionalClient.createDatabase(filename);
  }

  private static getModule(): Promise<SqlJsStatic > | null {
    if (!this.modulePromise) {
      this.modulePromise = initSqlJs();
    }
    return this.modulePromise;
  }

  private static async createDatabase(filename: string): Promise<Database> {
    const SQL = await this.getModule();

    if (filename === ":memory:") {
      return new SQL.Database();
    }

    if (typeof Bun !== "undefined") {
      try {
        const file = Bun.file(filename);
        if (await file.exists()) {
          const buffer = await file.arrayBuffer();
          return new SQL.Database(new Uint8Array(buffer));
        }
      } catch {
        // Fall back to empty database if file cannot be read
      }
    }

    return new SQL.Database();
  }

  private isSelectStatement(sql: string): boolean {
    const trimmed = sql.trim().toUpperCase();
    return SELECT_LIKE_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
  }

  private async select(sql: string, params: any[]): Promise<QueryRow[]> {
    const db = await this.dbPromise;
    const stmt = db.prepare(sql);

    try {
      stmt.bind(params);
      const rows: QueryRow[] = [];

      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }

      return rows;
    } finally {
      stmt.free();
    }
  }

  private async run(sql: string, params: any[]): Promise<SqlJsRunResult> {
    const db = await this.dbPromise;
    const stmt = db.prepare(sql);

    try {
      stmt.bind(params);
      stmt.step();
    } finally {
      stmt.free();
    }

    const affectedRows = typeof db.getRowsModified === "function" ? db.getRowsModified() : 0;
    let lastInsertRowid: number | null = null;

    try {
      const rowIdStmt = db.prepare("SELECT last_insert_rowid() as id");
      try {
        if (rowIdStmt.step()) {
          const row = rowIdStmt.getAsObject() as { id?: number };
          if (typeof row.id === "number") {
            lastInsertRowid = row.id;
          }
        }
      } finally {
        rowIdStmt.free();
      }
    } catch {
      // Ignore failures when fetching last_insert_rowid
    }

    return { affectedRows, lastInsertRowid };
  }

  async query(sql: string, params: any[] = []): Promise<QueryRow[] | SqlJsRunResult> {
    if (this.isSelectStatement(sql)) {
      return this.select(sql, params);
    }
    return this.run(sql, params);
  }

  async execute(sql: string, params: any[] = []): Promise<SqlJsRunResult> {
    return this.run(sql, params);
  }

  async close(): Promise<void> {
    const db = await this.dbPromise;
    db.close();
  }

}

interface QueryRawArgs {
  sql: string;
  args?: any[];
}

interface SqlRawResult {
  rows: any[][];
  columnNames: string[];
  columnTypes: string[];
}

/**
 * Helper that exposes a sql.js-backed driver with a Prisma-like interface.
 */
export async function createSqlJsDriverAdapter(filename: string = ":memory:") {
  const client = new SqlJsTraditionalClient(filename);

  return {
    /**
     * Mimics Prisma's SqlDriverAdapter#queryRaw response shape.
     */
    queryRaw: async ({ sql, args = [] }: QueryRawArgs): Promise<SqlRawResult> => {
      const rowsOrInfo = await client.query(sql, args);

      if (!Array.isArray(rowsOrInfo)) {
        return { rows: [], columnNames: [], columnTypes: [] };
      }

      if (rowsOrInfo.length === 0) {
        return { rows: [], columnNames: [], columnTypes: [] };
      }

      const columnNames = Object.keys(rowsOrInfo[0]);
      const rows = rowsOrInfo.map((row) => columnNames.map((name) => row[name]));

      return {
        rows,
        columnNames,
        columnTypes: columnNames.map(() => "unknown"),
      };
    },

    executeRaw: async ({ sql, args = [] }: QueryRawArgs) => {
      return client.execute(sql, args);
    },

    query: async (sql: string, params: any[] = []) => {
      return client.query(sql, params);
    },

    close: async () => {
      await client.close();
    },

    dispose: async () => {
      await client.close();
    },
  };
}
