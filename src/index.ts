import {
  ColumnType,
  ColumnTypeEnum,
  IsolationLevel,
  SqlDriverAdapter,
  SqlQuery,
  SqlResultSet,
  Transaction,
} from "@prisma/driver-adapter-utils";

// Common interfaces
interface BunSqlResult extends Array<any> {
  count: number;
  command: string;
  lastInsertRowid: number | null;
  affectedRows: number | null;
}

interface BunSqlConnection {
  (strings: TemplateStringsArray, ...values: any[]): Promise<BunSqlResult>;
  close(): Promise<void>;
  end(): Promise<void>;
  begin(): Promise<BunSqlTransaction>;
  transaction<T>(callback: (tx: BunSqlTransaction) => Promise<T>): Promise<T>;
  reserve(): Promise<BunReservedSqlConnection>;
}

interface BunSqlTransaction {
  (strings: TemplateStringsArray, ...values: any[]): Promise<BunSqlResult>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

interface BunReservedSqlConnection {
  (strings: TemplateStringsArray, ...values: any[]): Promise<BunSqlResult>;
  release?: () => Promise<void> | void;
}

// Configuration interfaces
export interface BunPostgresConfig {
  connectionString: string;
  maxConnections?: number;
  idleTimeout?: number;
  ssl?:
  | boolean
  | {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
}

export interface BunMySQLConfig {
  connectionString: string;
  maxConnections?: number;
  idleTimeout?: number;
  ssl?:
  | boolean
  | {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
}

export interface BunSQLiteConfig {
  filename: string;
  maxConnections?: number;
  readonly?: boolean;
  create?: boolean;
}

// Cache for template strings to avoid repeated parsing
const templateCache = new Map<
  string,
  { strings: TemplateStringsArray; paramCount: number; argOrder: number[] }
>();

// Pre-compiled column type matchers for better performance
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Base adapter class with shared functionality
abstract class BaseBunDriverAdapter implements SqlDriverAdapter {
  abstract readonly provider: "postgres" | "mysql" | "sqlite";
  abstract readonly adapterName: string;

  protected connection: BunSqlConnection | null = null;
  protected connectionString: string;
  protected maxConnections: number;

  constructor(connectionString: string, maxConnections: number = 5) {
    this.connectionString = connectionString;
    this.maxConnections = maxConnections;
  }

  protected async getConnection(): Promise<BunSqlConnection> {
    if (!this.connection) {
      this.connection = await this.createConnection();
    }
    return this.connection;
  }

  protected abstract createConnection(): Promise<BunSqlConnection>;

  async dispose(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
    templateCache.clear();
  }

  async executeScript(script: string): Promise<void> {
    const connection = await this.getConnection();
    const statements = script.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        const strings = this.createTemplateStrings([statement.trim()]);
        await connection(strings);
      }
    }
  }

  async queryRaw(query: SqlQuery): Promise<SqlResultSet> {
    const connection = await this.getConnection();
    const result = await this.executeQueryOptimized(
      connection,
      query.sql,
      query.args || [],
    );

    if (!Array.isArray(result) || result.length === 0) {
      return { columnNames: [], columnTypes: [], rows: [] };
    }

    const firstRow = result[0];
    const columnNames = Object.keys(firstRow);
    const columnCount = columnNames.length;
    const rowCount = result.length;

    // Determine column types by scanning all rows to better detect JSON columns
    const columnTypes = this.determineColumnTypes(result, columnNames);
    const rows = new Array(rowCount);

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = result[rowIndex];
      const processedRow = new Array(columnCount);

      for (let colIndex = 0; colIndex < columnCount; colIndex++) {
        const val = row[columnNames[colIndex]];
        if (columnTypes[colIndex] === ColumnTypeEnum.Json) {
          processedRow[colIndex] = this.ensureJsonString(val);
        } else {
          processedRow[colIndex] = this.serializeValueFast(val);
        }
      }

      rows[rowIndex] = processedRow;
    }

    return { columnNames, columnTypes, rows };
  }

  async executeRaw(query: SqlQuery): Promise<number> {
    const connection = await this.getConnection();
    try {
      const result = await this.executeQueryOptimized(
        connection,
        query.sql,
        query.args || [],
      );
      return result.affectedRows || result.count || 0;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  protected executeQueryOptimized(
    connection: BunSqlConnection,
    sql: string,
    args: any[],
  ): Promise<BunSqlResult> {
    if (args.length === 0) {
      const strings = this.createTemplateStrings([sql]);
      return connection(strings);
    }

    const cacheKey = sql;
    let cached = templateCache.get(cacheKey);

    if (
      (!cached || cached.paramCount !== args.length) &&
      this.hasParameterPlaceholders(sql)
    ) {
      const templateSql = this.convertParameterPlaceholders(sql, args.length);
      const parts = templateSql.split(/\$\{\d+\}/);
      const strings = this.createTemplateStrings(parts);
      const re = /\$\{(\d+)\}/g;
      const argOrder: number[] = [];
      let m: RegExpExecArray | null = re.exec(templateSql);
      while (m !== null) {
        argOrder.push(Number(m[1]));
        m = re.exec(templateSql);
      }
      cached = { strings, paramCount: args.length, argOrder };
      templateCache.set(cacheKey, cached);
    }

    if (cached) {
      const expanded = cached.argOrder?.length
        ? cached.argOrder.map((i) => args[i])
        : args;
      const finalArgs =
        this.provider === "postgres"
          ? this.coerceArgsForPostgres(expanded)
          : expanded;
      return connection(cached.strings, ...finalArgs);
    }

    // Fallback: Query has args but no recognized placeholders
    // This can happen with Prisma-generated queries that embed parameters differently
    // We still need to coerce arrays for Postgres compatibility
    const coercedArgs =
      this.provider === "postgres" ? this.coerceArgsForPostgres(args) : args;
    const strings = this.createTemplateStrings([sql]);
    return connection(strings, ...coercedArgs);
  }

  protected abstract hasParameterPlaceholders(sql: string): boolean;
  protected abstract convertParameterPlaceholders(
    sql: string,
    paramCount: number,
  ): string;

  protected createTemplateStrings(parts: string[]): TemplateStringsArray {
    if (parts.length === 1) {
      parts = [...parts, ""];
    }
    return Object.assign(parts, { raw: parts }) as TemplateStringsArray;
  }

  // Convert primitive JS arrays to a Postgres array literal string for array-typed columns.
  // Leaves complex/object arrays untouched to avoid interfering with JSON payloads.
  protected coerceArgsForPostgres(args: any[]): any[] {
    const toPgArrayLiteral = (arr: any[]): string => {
      const encodeItem = (v: any): string => {
        if (v === null || v === undefined) return "NULL";
        switch (typeof v) {
          case "number":
            return Number.isFinite(v) ? String(v) : "NULL";
          case "boolean":
            return v ? "true" : "false";
          case "string": {
            const s = v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
            return `"${s}"`;
          }
          default: {
            try {
              const s = JSON.stringify(v);
              const e = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
              return `"${e}"`;
            } catch {
              return "NULL";
            }
          }
        }
      };
      return `{${arr.map(encodeItem).join(",")}}`;
    };

    const isPrimitiveArray = (a: any[]): boolean =>
      Array.isArray(a) &&
      a.every(
        (v) => v === null || ["string", "number", "boolean"].includes(typeof v),
      );

    return args.map((v) =>
      Array.isArray(v) && isPrimitiveArray(v) ? toPgArrayLiteral(v) : v,
    );
  }

  // Normalize and encode credentials in connection string to avoid URI errors
  protected normalizeConnectionString(input: string): string {
    const raw = String(input ?? "").trim();
    if (!raw) return raw;

    // Fast path: try URL parser first and re-encode userinfo
    try {
      const parsed = new URL(raw);
      const scheme = parsed.protocol.replace(":", "");
      if (
        [
          "postgres",
          "postgresql",
          "mysql",
          "mysqls",
          "sqlite",
          "file",
        ].includes(scheme)
      ) {
        // Avoid double-encoding: decode valid %HH triplets first, then encode
        const decodeTriplets = (s: string) =>
          s.replace(/%[0-9a-fA-F]{2}/g, (m) => {
            try {
              return decodeURIComponent(m);
            } catch {
              return m;
            }
          });
        if (parsed.username)
          parsed.username = encodeURIComponent(decodeTriplets(parsed.username));
        if (parsed.password)
          parsed.password = encodeURIComponent(decodeTriplets(parsed.password));
        return parsed.toString();
      }
      return raw;
    } catch { }

    // Fallback: robust rewriter for invalid-but-common raw URLs with special chars in userinfo
    // Pattern: <scheme>://<userinfo>@<host-and-rest>
    const schemeMatch = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
    if (!schemeMatch) return raw;
    const scheme = schemeMatch[1];
    const startIdx = schemeMatch[0].length;
    const rest = raw.slice(startIdx);

    // Find authority boundary (before path/query/fragment)
    let boundary = rest.length;
    for (const sep of ["/", "?", "#"]) {
      const idx = rest.indexOf(sep);
      if (idx !== -1 && idx < boundary) boundary = idx;
    }
    const authority = rest.slice(0, boundary);
    const tail = rest.slice(boundary);

    // Find the last '@' in authority as delimiter for userinfo
    const at = authority.lastIndexOf("@");
    if (at === -1) return raw; // no userinfo

    const userinfoRaw = authority.slice(0, at);
    const hostport = authority.slice(at + 1);

    // Split user:pass (first ':') and encode safely
    const colon = userinfoRaw.indexOf(":");
    const userRaw = colon === -1 ? userinfoRaw : userinfoRaw.slice(0, colon);
    const passRaw = colon === -1 ? "" : userinfoRaw.slice(colon + 1);

    // Decode if possible, then encode; if decode fails, encode the raw
    const safeDecode = (s: string) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    };
    const username = encodeURIComponent(safeDecode(userRaw));
    const password =
      passRaw !== "" ? encodeURIComponent(safeDecode(passRaw)) : "";

    const rebuiltAuthority = password
      ? `${username}:${password}@${hostport}`
      : `${username}@${hostport}`;
    return `${scheme}://${rebuiltAuthority}${tail}`;
  }

  async startTransaction(
    isolationLevel?: IsolationLevel,
  ): Promise<Transaction> {
    const connection = await this.createConnection();
    let reserved: BunReservedSqlConnection;

    try {
      reserved = await connection.reserve();
    } catch (err) {
      try {
        await connection.end();
      } catch {
        // ignore shutdown errors
      }
      throw err;
    }
    let finished = false;
    let aborted = false;

    const releaseReserved = async (): Promise<void> => {
      try {
        const maybeRelease = (reserved as any).release?.();
        if (maybeRelease && typeof maybeRelease.then === "function") {
          await maybeRelease;
        }
      } catch {
        // ignore release errors
      }
    };

    const closeConnection = async (): Promise<void> => {
      try {
        await connection.end();
      } catch {
        // ignore shutdown errors
      }
    };

    const finalizeResources = async (): Promise<void> => {
      await releaseReserved();
      await closeConnection();
    };

    try {
      const begin = this.createTemplateStrings(["BEGIN"]);
      await reserved(begin);

      if (isolationLevel && this.provider !== "sqlite") {
        const iso = this.createTemplateStrings([
          `SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
        ]);
        await reserved(iso);
      }
    } catch (err) {
      await finalizeResources();
      throw err;
    }

    const transaction = ((strings: TemplateStringsArray, ...values: any[]) =>
      reserved(strings, ...values)) as BunSqlTransaction;

    transaction.commit = async () => {
      const commit = this.createTemplateStrings(["COMMIT"]);
      await reserved(commit);
    };

    transaction.rollback = async () => {
      const rollback = this.createTemplateStrings(["ROLLBACK"]);
      await reserved(rollback);
    };

    const finalize = async (action: "commit" | "rollback") => {
      if (finished) {
        return;
      }

      try {
        if (action === "commit") {
          await transaction.commit();
        } else {
          try {
            await transaction.rollback();
          } catch {
            // ignore rollback errors when already closed
          }
        }
      } finally {
        finished = true;
        await finalizeResources();
      }
    };

    const runQuery = async (
      sql: string,
      args: any[],
    ): Promise<BunSqlResult> => {
      if (finished) {
        throw new Error("Transaction is already closed");
      }

      try {
        return await this.executeTransactionQueryOptimized(
          transaction,
          sql,
          args,
        );
      } catch (err) {
        aborted = true;
        throw err;
      }
    };

    return {
      provider: this.provider,
      adapterName: this.adapterName,
      options: {
        usePhantomQuery: false,
      },
      queryRaw: async (query: SqlQuery) => {
        const result = await runQuery(query.sql, query.args || []);

        if (!Array.isArray(result) || result.length === 0) {
          return { columnNames: [], columnTypes: [], rows: [] };
        }

        const firstRow = result[0];
        const columnNames = Object.keys(firstRow);
        const columnCount = columnNames.length;

        const columnTypes = this.determineColumnTypes(result, columnNames);
        const rows = new Array(result.length);

        for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
          const row = result[rowIndex];
          const processedRow = new Array(columnCount);

          for (let colIndex = 0; colIndex < columnCount; colIndex++) {
            const val = row[columnNames[colIndex]];
            processedRow[colIndex] =
              columnTypes[colIndex] === ColumnTypeEnum.Json
                ? this.ensureJsonString(val)
                : this.serializeValueFast(val);
          }

          rows[rowIndex] = processedRow;
        }

        return { columnNames, columnTypes, rows };
      },
      executeRaw: async (query: SqlQuery) => {
        const result = await runQuery(query.sql, query.args || []);
        return result.affectedRows || result.count || 0;
      },
      commit: async () => {
        if (finished) {
          return;
        }

        if (aborted) {
          await finalize("rollback");
          throw new Error("Transaction rolled back due to a previous error");
        }

        try {
          await finalize("commit");
        } catch (err) {
          await finalize("rollback").catch(() => { });
          throw err;
        }
      },
      rollback: async () => {
        await finalize("rollback");
      },
    };
  }

  private determineColumnTypes(
    result: any[],
    columnNames: string[],
  ): ColumnType[] {
    const columnCount = columnNames.length;
    const types = new Array(columnCount) as ColumnType[];

    for (let i = 0; i < columnCount; i++) {
      const name = columnNames[i];

      let hasArray = false;
      let hasOtherObjects = false;
      let arrayElementType: ColumnType | null = null;

      for (let r = 0; r < result.length; r++) {
        const v = result[r][name];
        if (v === null || v === undefined) continue;

        if (Array.isArray(v)) {
          hasArray = true;
          if (v.length > 0 && arrayElementType === null) {
            arrayElementType = this.inferColumnTypeFast(v[0]);
          }
          break;
        } else if (
          typeof v === "object" &&
          !(v instanceof Date) &&
          !Buffer.isBuffer(v)
        ) {
          hasOtherObjects = true;
        }
      }

      if (hasArray && arrayElementType !== null) {
        // Map base type to array type
        const arrayTypeMap: Record<number, ColumnType> = {
          [ColumnTypeEnum.Int32]: ColumnTypeEnum.Int32Array,
          [ColumnTypeEnum.Int64]: ColumnTypeEnum.Int64Array,
          [ColumnTypeEnum.Float]: ColumnTypeEnum.FloatArray,
          [ColumnTypeEnum.Double]: ColumnTypeEnum.DoubleArray,
          [ColumnTypeEnum.Numeric]: ColumnTypeEnum.NumericArray,
          [ColumnTypeEnum.Boolean]: ColumnTypeEnum.BooleanArray,
          [ColumnTypeEnum.Character]: ColumnTypeEnum.CharacterArray,
          [ColumnTypeEnum.Text]: ColumnTypeEnum.TextArray,
          [ColumnTypeEnum.Date]: ColumnTypeEnum.DateArray,
          [ColumnTypeEnum.Time]: ColumnTypeEnum.TimeArray,
          [ColumnTypeEnum.DateTime]: ColumnTypeEnum.DateTimeArray,
          [ColumnTypeEnum.Json]: ColumnTypeEnum.JsonArray,
          [ColumnTypeEnum.Enum]: ColumnTypeEnum.EnumArray,
          [ColumnTypeEnum.Bytes]: ColumnTypeEnum.BytesArray,
          [ColumnTypeEnum.Uuid]: ColumnTypeEnum.UuidArray,
        };

        types[i] = arrayTypeMap[arrayElementType] ?? ColumnTypeEnum.JsonArray;

      } else if (hasArray) {
        // Empty array or couldn't determine type
        types[i] = ColumnTypeEnum.JsonArray;
      } else if (hasOtherObjects) {
        types[i] = ColumnTypeEnum.Json;
      } else {
        types[i] = this.inferColumnTypeFast(result[0]?.[name]);
      }
    }

    return types;
  }

  protected isJsonishString(s: string): boolean {
    if (!s) return false;
    const t = s.trim();
    if (!t) return false;
    if (t.startsWith("{") || t.startsWith("[")) return true;
    if (t.startsWith('"') && t.endsWith('"')) return true;
    return false;
  }

  protected ensureJsonString(value: unknown): string {
    if (value === null || value === undefined) return "null";
    const t = typeof value;
    if (t === "string") {
      const s = value as string;
      return this.isJsonishString(s) ? s : JSON.stringify(s);
    }
    if (t === "number" || t === "boolean") return JSON.stringify(value);
    if (value instanceof Date) return JSON.stringify(value.toISOString());
    if (Buffer.isBuffer(value))
      return JSON.stringify(Array.from(value as unknown as Uint8Array));
    try {
      return JSON.stringify(value);
    } catch {
      return "null";
    }
  }

  protected executeTransactionQueryOptimized(
    tx: BunSqlTransaction,
    sql: string,
    args: any[],
  ): Promise<BunSqlResult> {
    if (args.length === 0) {
      const strings = this.createTemplateStrings([sql]);
      return tx(strings);
    }

    if (this.hasParameterPlaceholders(sql)) {
      const templateSql = this.convertParameterPlaceholders(sql, args.length);
      const parts = templateSql.split(/\$\{\d+\}/);
      const strings = this.createTemplateStrings(parts);
      const re = /\$\{(\d+)\}/g;
      const argOrder: number[] = [];
      let m: RegExpExecArray | null = re.exec(templateSql);
      while (m !== null) {
        argOrder.push(Number(m[1]));
        m = re.exec(templateSql);
      }
      const expanded = argOrder.length ? argOrder.map((i) => args[i]) : args;
      const finalArgs =
        this.provider === "postgres"
          ? this.coerceArgsForPostgres(expanded)
          : expanded;
      return tx(strings, ...finalArgs);
    }

    // Fallback: Transaction query has args but no recognized placeholders
    // Apply array coercion for Postgres compatibility
    const coercedArgs =
      this.provider === "postgres" ? this.coerceArgsForPostgres(args) : args;
    const strings = this.createTemplateStrings([sql]);
    return tx(strings, ...coercedArgs);
  }

  protected inferColumnTypeFast(value: unknown): ColumnType {
    if (value === null || value === undefined) {
      return ColumnTypeEnum.UnknownNumber;
    }

    const valueType = typeof value;

    switch (valueType) {
      case "boolean":
        return ColumnTypeEnum.Boolean;
      case "number":
        return Number.isInteger(value)
          ? ColumnTypeEnum.Int32
          : ColumnTypeEnum.Double;
      case "bigint":
        return ColumnTypeEnum.Int64;
      case "string":
        if (DATETIME_REGEX.test(value as string)) {
          return ColumnTypeEnum.DateTime;
        }
        if (DATE_REGEX.test(value as string)) {
          return ColumnTypeEnum.Date;
        }
        if (UUID_REGEX.test(value as string)) {
          return ColumnTypeEnum.Uuid;
        }
        return ColumnTypeEnum.Text;
      case "object":
        if (value instanceof Date) {
          return ColumnTypeEnum.DateTime;
        }
        if (Buffer.isBuffer(value)) {
          return ColumnTypeEnum.Bytes;
        }
        return ColumnTypeEnum.Json;
      default:
        return ColumnTypeEnum.UnknownNumber;
    }
  }

  protected serializeValueFast(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    const valueType = typeof value;

    if (
      valueType === "string" ||
      valueType === "number" ||
      valueType === "boolean"
    ) {
      return value;
    }

    if (valueType === "bigint") {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Buffer.isBuffer(value)) {
      return value;
    }

    // CRITICAL: If value is an array, return it as-is
    // Prisma expects arrays for array-typed columns (text[], int[], etc.)
    // Converting to JSON string breaks Prisma's .map() calls
    if (Array.isArray(value)) {
      return value;
    }

    // For JSON/object-like values, return a valid JSON string to satisfy
    // Prisma driver-adapter-utils which parses JSON columns from strings
    try {
      return JSON.stringify(value);
    } catch {
      // Fallback to string coercion if JSON.stringify fails for any reason
      return String(value);
    }
  }
}

// PostgreSQL Adapter
class BunPostgresDriverAdapter extends BaseBunDriverAdapter {
  readonly provider = "postgres" as const;
  readonly adapterName = "bun-postgres-adapter";

  protected async createConnection(): Promise<BunSqlConnection> {
    const BunSQL = (globalThis as any).Bun?.sql;
    if (!BunSQL) {
      throw new Error(
        "Bun's native SQL client is not available. Make sure you're running with Bun 1.3+",
      );
    }

    const candidates = this.buildPgConnectionCandidates(this.connectionString);
    let lastErr: any = null;
    for (const candidate of candidates) {
      try {
        const conn = new BunSQL(candidate) as BunSqlConnection;
        try {
          const strings = this.createTemplateStrings(["SELECT 1"]);
          await conn(strings);
          return conn;
        } catch (warmErr: any) {
          if (this.isPgAuthFailed(warmErr)) {
            lastErr = warmErr;
            continue;
          }
          throw warmErr;
        }
      } catch (e: any) {
        lastErr = e;
        continue;
      }
    }

    if (
      lastErr &&
      (lastErr instanceof URIError ||
        (typeof lastErr?.message === "string" && /uri/i.test(lastErr.message)))
    ) {
      throw new Error(
        "Invalid DATABASE_URL/connectionString. Check URL shape; credentials are auto-encoded by the adapter.",
      );
    }
    throw lastErr ?? new Error("Failed to establish Postgres connection");
  }

  private isPgAuthFailed(err: any): boolean {
    const msg = String(err?.message ?? "").toLowerCase();
    return (
      msg.includes("password authentication failed") || msg.includes("28p01")
    );
  }

  private buildPgConnectionCandidates(input: string): string[] {
    const raw = String(input ?? "").trim();
    const normalized = this.normalizeConnectionString(raw);
    const out: string[] = [];
    if (normalized) out.push(normalized);
    if (raw && raw !== normalized) out.push(raw);
    const qpVariant = this.toPgPasswordQueryVariant(raw);
    if (qpVariant && !out.includes(qpVariant)) out.push(qpVariant);
    return out;
  }

  private toPgPasswordQueryVariant(raw: string): string | null {
    const m = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
    if (!m) return null;
    const scheme = m[1];
    if (!["postgres", "postgresql"].includes(scheme)) return null;
    const start = m[0].length;
    const rest = raw.slice(start);
    let boundary = rest.length;
    for (const sep of ["/", "?", "#"]) {
      const idx = rest.indexOf(sep);
      if (idx !== -1 && idx < boundary) boundary = idx;
    }
    const authority = rest.slice(0, boundary);
    const tail = rest.slice(boundary);
    const at = authority.lastIndexOf("@");
    if (at === -1) return null;
    const userinfo = authority.slice(0, at);
    const hostport = authority.slice(at + 1);
    const colon = userinfo.indexOf(":");
    const userRaw = colon === -1 ? userinfo : userinfo.slice(0, colon);
    const passRaw = colon === -1 ? "" : userinfo.slice(colon + 1);
    if (!passRaw) return null;
    const safeDecode = (s: string) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    };
    const username = encodeURIComponent(safeDecode(userRaw));
    const passwordRaw = safeDecode(passRaw);
    let path = tail;
    let existingQuery = "";
    const qIdx = tail.indexOf("?");
    if (qIdx !== -1) {
      path = tail.slice(0, qIdx);
      existingQuery = tail.slice(qIdx + 1);
    }
    const join = existingQuery ? "&" : "?";
    const finalQuery = `${existingQuery ? "?" + existingQuery : ""}${join}password=${encodeURIComponent(passwordRaw)}`;
    return `${scheme}://${username}@${hostport}${path}${finalQuery}`;
  }

  protected hasParameterPlaceholders(sql: string): boolean {
    // Postgres uses $n placeholders. Do not treat '?' as a placeholder to avoid
    // collisions with JSONB operators like '?' and '?|'.
    return sql.includes("$1");
  }

  protected convertParameterPlaceholders(
    sql: string,
    paramCount: number,
  ): string {
    let templateSql = sql;
    if (sql.includes("$1")) {
      // Replace from highest index to lowest to avoid $1 matching in $10, $11, ...
      for (let n = paramCount; n >= 1; n--) {
        const idx = n - 1;
        const marker = "${" + idx + "}";
        templateSql = templateSql.replaceAll(`$${n}`, marker);
      }
      return templateSql;
    }
    // Fallback: convert '?' placeholders sequentially
    for (let i = 0; i < paramCount; i++) {
      const marker = "${" + i + "}";
      templateSql = templateSql.replace("?", marker);
    }
    return templateSql;
  }
}

// MySQL Adapter
class BunMySQLDriverAdapter extends BaseBunDriverAdapter {
  readonly provider = "mysql" as const;
  readonly adapterName = "bun-mysql-adapter";

  protected async createConnection(): Promise<BunSqlConnection> {
    const BunSQL = (globalThis as any).Bun?.sql;
    if (!BunSQL) {
      throw new Error(
        "Bun's native SQL client is not available. Make sure you're running with Bun 1.3+",
      );
    }

    const normalized = this.normalizeConnectionString(this.connectionString);
    let connection: BunSqlConnection;
    try {
      connection = new BunSQL(normalized) as BunSqlConnection;
    } catch (e: any) {
      if (
        e instanceof URIError ||
        (typeof e?.message === "string" && /uri/i.test(e.message))
      ) {
        throw new Error(
          "Invalid DATABASE_URL/connectionString. Ensure username/password are percent-encoded (e.g. '@' -> '%40', ':' -> '%3A', '/' -> '%2F').",
        );
      }
      throw e;
    }

    // Warm up the connection
    try {
      const strings = this.createTemplateStrings(["SELECT 1"]);
      await connection(strings);
    } catch (error) {
      // Ignore warm-up errors
    }

    return connection;
  }

  protected hasParameterPlaceholders(sql: string): boolean {
    return sql.includes("?");
  }

  protected convertParameterPlaceholders(
    sql: string,
    paramCount: number,
  ): string {
    let templateSql = sql;
    for (let i = 0; i < paramCount; i++) {
      const marker = "${" + i + "}";
      templateSql = templateSql.replace("?", marker);
    }
    return templateSql;
  }
}

// SQLite Adapter
class BunSQLiteDriverAdapter extends BaseBunDriverAdapter {
  readonly provider = "sqlite" as const;
  readonly adapterName = "bun-sqlite-adapter";

  protected async createConnection(): Promise<BunSqlConnection> {
    const BunSQL = (globalThis as any).Bun?.sql;
    if (!BunSQL) {
      throw new Error(
        "Bun's native SQL client is not available. Make sure you're running with Bun 1.3+",
      );
    }

    const normalized = this.normalizeConnectionString(this.connectionString);
    let connection: BunSqlConnection;
    try {
      connection = new BunSQL(normalized) as BunSqlConnection;
    } catch (e: any) {
      if (
        e instanceof URIError ||
        (typeof e?.message === "string" && /uri/i.test(e.message))
      ) {
        throw new Error(
          "Invalid DATABASE_URL/connectionString. Ensure username/password are percent-encoded (e.g. '@' -> '%40', ':' -> '%3A', '/' -> '%2F').",
        );
      }
      throw e;
    }

    // Warm up the connection
    try {
      const strings = this.createTemplateStrings(["SELECT 1"]);
      await connection(strings);
    } catch (error) {
      // Ignore warm-up errors
    }

    return connection;
  }

  protected hasParameterPlaceholders(sql: string): boolean {
    return sql.includes("?");
  }

  protected convertParameterPlaceholders(
    sql: string,
    paramCount: number,
  ): string {
    let templateSql = sql;
    for (let i = 0; i < paramCount; i++) {
      const marker = "${" + i + "}";
      templateSql = templateSql.replace("?", marker);
    }
    return templateSql;
  }
}

// Adapter factory classes
export class BunPostgresAdapter {
  readonly provider = "postgres" as const;
  readonly adapterName = "bun-postgres-adapter";
  private config: BunPostgresConfig | string;

  constructor(config: BunPostgresConfig | string) {
    this.config = config;
  }

  async connect(): Promise<SqlDriverAdapter> {
    const connectionString =
      typeof this.config === "string"
        ? this.config
        : this.config.connectionString;

    const maxConnections =
      typeof this.config === "string" ? 5 : this.config.maxConnections || 5;

    return new BunPostgresDriverAdapter(connectionString, maxConnections);
  }

  async dispose(): Promise<void> { }
}

export class BunMySQLAdapter {
  readonly provider = "mysql" as const;
  readonly adapterName = "bun-mysql-adapter";
  private config: BunMySQLConfig | string;

  constructor(config: BunMySQLConfig | string) {
    this.config = config;
  }

  async connect(): Promise<SqlDriverAdapter> {
    const connectionString =
      typeof this.config === "string"
        ? this.config
        : this.config.connectionString;

    const maxConnections =
      typeof this.config === "string" ? 5 : this.config.maxConnections || 5;

    return new BunMySQLDriverAdapter(connectionString, maxConnections);
  }

  async dispose(): Promise<void> { }
}

export class BunSQLiteAdapter {
  readonly provider = "sqlite" as const;
  readonly adapterName = "bun-sqlite-adapter";
  private config: BunSQLiteConfig | string;

  constructor(config: BunSQLiteConfig | string) {
    this.config = config;
  }

  async connect(): Promise<SqlDriverAdapter> {
    const connectionString =
      typeof this.config === "string"
        ? this.config
        : `file:${this.config.filename}`;

    const maxConnections =
      typeof this.config === "string"
        ? 1 // SQLite typically uses single connection
        : this.config.maxConnections || 1;

    return new BunSQLiteDriverAdapter(connectionString, maxConnections);
  }

  async dispose(): Promise<void> { }
}

// Default export for backward compatibility
export default BunPostgresAdapter;
// Re-export optimized Postgres for convenience so consumers can opt-in
// without changing import path structure if they prefer a named export.
export {
  BunPostgresAdapter as BunPostgresOptimized, BunPostgresAdapter as OptimizedBunPostgresAdapter, OptimizedBunPostgresDriverAdapter
} from "./optimized-index.js";
