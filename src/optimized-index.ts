import {
  ColumnType,
  ColumnTypeEnum,
  IsolationLevel,
  SqlDriverAdapter,
  SqlQuery,
  SqlResultSet,
  Transaction,
} from "@prisma/driver-adapter-utils";

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

export class OptimizedBunPostgresDriverAdapter implements SqlDriverAdapter {
  readonly provider = "postgres" as const;
  readonly adapterName = "bun-postgres-adapter-optimized";
  private connectionString: string;
  private connections: BunSqlConnection[] = [];
  private availableConnections: BunSqlConnection[] = [];
  private waitQueue: Array<{
    resolve: (conn: BunSqlConnection) => void;
    reject: (err: Error) => void;
  }> = [];
  private maxConnections: number;

  constructor(connectionString: string, maxConnections: number = 20) {
    this.connectionString = connectionString;
    this.maxConnections = maxConnections;
  }

  private async getConnection(): Promise<BunSqlConnection> {
    // Try to get an available connection first
    if (this.availableConnections.length > 0) {
      return this.availableConnections.pop()!;
    }

    // If we haven't reached the max, create a new connection
    if (this.connections.length < this.maxConnections) {
      const connection = await this.createConnection();
      this.connections.push(connection);
      return connection;
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      this.waitQueue.push({ resolve, reject });
    });
  }

  private releaseConnection(connection: BunSqlConnection): void {
    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift();
      waiter?.resolve(connection);
      return;
    }
    this.availableConnections.push(connection);
  }

  private async createConnection(): Promise<BunSqlConnection> {
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
    const norm = (() => {
      if (!raw) return raw;

      // Heuristic: if unencoded reserved characters appear in userinfo, avoid WHATWG parsing
      const schemeMatch = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
      const schemeFromRaw = schemeMatch?.[1];
      const restFromRaw = schemeMatch ? raw.slice(schemeMatch[0].length) : "";
      const atInRest = restFromRaw.lastIndexOf("@");
      const userinfoCandidate =
        atInRest !== -1 ? restFromRaw.slice(0, atInRest) : "";
      const hasUnencodedReserved = /[/?#]/.test(userinfoCandidate);

      if (!hasUnencodedReserved) {
        try {
          const u = new URL(raw);
          const scheme = u.protocol.replace(":", "");
          if (["postgres", "postgresql"].includes(scheme)) {
            // Avoid double-encoding: decode valid %HH triplets first, then encode
            const decodeTriplets = (s: string) =>
              s.replace(/%[0-9a-fA-F]{2}/g, (m) => {
                try {
                  return decodeURIComponent(m);
                } catch {
                  return m;
                }
              });
            if (u.username)
              u.username = encodeURIComponent(decodeTriplets(u.username));
            if (u.password)
              u.password = encodeURIComponent(decodeTriplets(u.password));
            return u.toString();
          }
          return raw;
        } catch { }
      }

      // Manual rewrite tolerant of unencoded reserved in userinfo
      const m = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
      if (!m) return raw;
      const scheme = m[1];
      const rest = raw.slice(m[0].length);

      const at = rest.lastIndexOf("@");
      if (at === -1) return raw;
      const userinfo = rest.slice(0, at);
      const hostAndTail = rest.slice(at + 1);
      let boundary = hostAndTail.length;
      for (const sep of ["/", "?", "#"]) {
        const idx = hostAndTail.indexOf(sep);
        if (idx !== -1 && idx < boundary) boundary = idx;
      }
      const hostport = hostAndTail.slice(0, boundary);
      const tail = hostAndTail.slice(boundary);
      const colon = userinfo.indexOf(":");
      const userRaw = colon === -1 ? userinfo : userinfo.slice(0, colon);
      const passRaw = colon === -1 ? "" : userinfo.slice(colon + 1);
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
    })();

    const out: string[] = [];
    if (norm) out.push(norm);
    if (raw && raw !== norm) out.push(raw);
    const qp = this.toPgPasswordQueryVariant(raw);
    if (qp) out.push(qp);
    return out;
  }

  private toPgPasswordQueryVariant(raw: string): string | null {
    const m = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
    if (!m) return null;
    const scheme = m[1];
    if (!["postgres", "postgresql"].includes(scheme)) return null;
    const rest = raw.slice(m[0].length);
    const at = rest.lastIndexOf("@");
    if (at === -1) return null;
    const userinfo = rest.slice(0, at);
    const hostAndTail = rest.slice(at + 1);
    let boundary = hostAndTail.length;
    for (const sep of ["/", "?", "#"]) {
      const idx = hostAndTail.indexOf(sep);
      if (idx !== -1 && idx < boundary) boundary = idx;
    }
    const hostport = hostAndTail.slice(0, boundary);
    const tail = hostAndTail.slice(boundary);
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

  async dispose(): Promise<void> {
    // Close all connections in parallel
    await Promise.all(this.connections.map((conn) => conn.end()));
    this.connections = [];
    this.availableConnections = [];
    if (this.waitQueue.length > 0) {
      const error = new Error("Adapter disposed");
      while (this.waitQueue.length) {
        this.waitQueue.shift()?.reject(error);
      }
    }
    templateCache.clear();
  }

  async executeScript(script: string): Promise<void> {
    const connection = await this.getConnection();
    try {
      const statements = script.split(";").filter((stmt) => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          const strings = this.createTemplateStrings([statement.trim()]);
          await connection(strings);
        }
      }
    } finally {
      this.releaseConnection(connection);
    }
  }

  async queryRaw(query: SqlQuery): Promise<SqlResultSet> {
    const connection = await this.getConnection();
    try {
      const result = await this.executeQueryOptimized(
        connection,
        query.sql,
        query.args || [],
      );

      // Fast path for empty results
      if (!Array.isArray(result) || result.length === 0) {
        return { columnNames: [], columnTypes: [], rows: [] };
      }

      // Pre-allocate arrays for better performance
      const firstRow = result[0];
      const columnNames = Object.keys(firstRow);
      const columnCount = columnNames.length;
      const rowCount = result.length;

      // Determine column types using a scan to better detect JSON columns
      const columnTypes = this.determineColumnTypes(result, columnNames);
      const rows = new Array(rowCount);

      // Process all rows efficiently
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
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
    } finally {
      this.releaseConnection(connection);
    }
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
    } finally {
      this.releaseConnection(connection);
    }
  }

  private executeQueryOptimized(
    connection: BunSqlConnection,
    sql: string,
    args: any[],
  ): Promise<BunSqlResult> {
    // Fast path for queries without parameters
    if (args.length === 0) {
      const strings = this.createTemplateStrings([sql]);
      return connection(strings);
    }

    const cached = this.getOrCreateTemplate(sql, args.length);
    if (cached) {
      const expanded = cached.argOrder?.length
        ? cached.argOrder.map((i) => args[i])
        : args;
      const coerced = this.coerceArgsForPostgres(expanded);
      return connection(cached.strings, ...coerced);
    }

    // Fallback: Query has args but no recognized placeholders
    // This can happen with Prisma-generated queries that embed parameters differently
    // We still need to coerce arrays for Postgres compatibility
    const coerced = this.coerceArgsForPostgres(args);
    const strings = this.createTemplateStrings([sql]);
    return connection(strings, ...coerced);
  }

  private createTemplateStrings(parts: string[]): TemplateStringsArray {
    // Ensure we have at least one empty string at the end
    if (parts.length === 1) {
      parts = [...parts, ""];
    }
    return Object.assign(parts, { raw: parts }) as TemplateStringsArray;
  }

  // Convert primitive JS arrays to a Postgres array literal string.
  // This helps when binding values into array-typed columns (e.g., text[]),
  // preventing errors like: malformed array literal: "...".
  // We keep object/complex arrays untouched to avoid interfering with JSON.
  private coerceArgsForPostgres(args: any[]): any[] {
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

  private getOrCreateTemplate(sql: string, argCount: number) {
    if (argCount === 0) {
      return null;
    }

    const cacheKey = sql;
    let cached = templateCache.get(cacheKey);

    if (!cached || cached.paramCount !== argCount) {
      const built = this.buildTemplate(sql, argCount);
      if (!built) {
        // Don't throw - return null to allow fallback path
        // This handles Prisma queries that embed parameters differently
        return null;
      }
      templateCache.set(cacheKey, built);
      cached = built;
    }

    return cached;
  }

  private buildTemplate(sql: string, argCount: number) {
    const templateSql = this.replacePlaceholders(sql, argCount);
    if (!templateSql) {
      return null;
    }

    const parts = templateSql.split(/\$\{\d+\}/);
    const strings = this.createTemplateStrings(parts);
    const re = /\$\{(\d+)\}/g;
    const argOrder: number[] = [];
    let m: RegExpExecArray | null = re.exec(templateSql);
    while (m !== null) {
      argOrder.push(Number(m[1]));
      m = re.exec(templateSql);
    }
    return { strings, paramCount: argCount, argOrder };
  }

  private replacePlaceholders(sql: string, argCount: number): string | null {
    if (argCount === 0) {
      return sql;
    }

    if (/\$\d+/.test(sql)) {
      return this.replaceDollarPlaceholders(sql, argCount);
    }

    if (sql.includes("?")) {
      return this.replaceQuestionPlaceholders(sql, argCount);
    }

    return null;
  }

  private replaceDollarPlaceholders(sql: string, argCount: number): string {
    let templateSql = sql;
    for (let n = argCount; n >= 1; n--) {
      const idx = n - 1;
      const marker = "${" + idx + "}";
      templateSql = templateSql.replaceAll(`$${n}`, marker);
    }
    return templateSql;
  }

  private replaceQuestionPlaceholders(
    sql: string,
    argCount: number,
  ): string | null {
    let result = "";
    let lastIndex = 0;
    let replaced = 0;
    let i = 0;
    let inSingle = false;
    let inDouble = false;
    let inLineComment = false;
    let inBlockComment = false;
    let dollarTag: string | null = null;

    while (i < sql.length) {
      const char = sql[i];
      const next = sql[i + 1];

      if (inLineComment) {
        if (char === "\n") {
          inLineComment = false;
        }
        i++;
        continue;
      }

      if (inBlockComment) {
        if (char === "*" && next === "/") {
          inBlockComment = false;
          i += 2;
          continue;
        }
        i++;
        continue;
      }

      if (dollarTag) {
        if (sql.startsWith(dollarTag, i)) {
          i += dollarTag.length;
          dollarTag = null;
          continue;
        }
        i++;
        continue;
      }

      if (inSingle) {
        if (char === "'" && next === "'") {
          i += 2;
          continue;
        }
        if (char === "'") {
          inSingle = false;
        }
        i++;
        continue;
      }

      if (inDouble) {
        if (char === '"' && next === '"') {
          i += 2;
          continue;
        }
        if (char === '"') {
          inDouble = false;
        }
        i++;
        continue;
      }

      if (char === "'" && !inDouble) {
        inSingle = true;
        i++;
        continue;
      }

      if (char === '"' && !inSingle) {
        inDouble = true;
        i++;
        continue;
      }

      if (char === "-" && next === "-") {
        inLineComment = true;
        i += 2;
        continue;
      }

      if (char === "/" && next === "*") {
        inBlockComment = true;
        i += 2;
        continue;
      }

      if (char === "$") {
        const match = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
        if (match) {
          dollarTag = match[0];
          i += match[0].length;
          continue;
        }
      }

      if (char === "?" && replaced < argCount) {
        result += sql.slice(lastIndex, i) + "${" + replaced + "}";
        replaced++;
        i++;
        lastIndex = i;
        continue;
      }

      i++;
    }

    result += sql.slice(lastIndex);
    if (replaced !== argCount) {
      return null;
    }
    return result;
  }

  async startTransaction(
    isolationLevel?: IsolationLevel,
  ): Promise<Transaction> {
    const connection = await this.getConnection();
    let reserved: BunReservedSqlConnection;

    try {
      reserved = await connection.reserve();
    } catch (err) {
      this.releaseConnection(connection);
      throw err;
    }

    const txRunner = ((strings: TemplateStringsArray, ...values: any[]) =>
      reserved(strings, ...values)) as BunSqlTransaction;

    txRunner.commit = async () => {
      const commit = this.createTemplateStrings(["COMMIT"]);
      await reserved(commit);
    };

    txRunner.rollback = async () => {
      const rollback = this.createTemplateStrings(["ROLLBACK"]);
      await reserved(rollback);
    };

    let finished = false;
    let aborted = false;

    const releaseReserved = async () => {
      try {
        const maybeRelease = reserved.release?.();
        if (maybeRelease && typeof (maybeRelease as any).then === "function") {
          await maybeRelease;
        }
      } catch {
        // ignore release errors
      }
    };

    const finalize = async (action: "commit" | "rollback") => {
      if (finished) {
        return;
      }

      finished = true;
      try {
        if (action === "commit") {
          await txRunner.commit();
        } else {
          try {
            await txRunner.rollback();
          } catch {
            // swallow rollback errors for already-closed transactions
          }
        }
      } finally {
        await releaseReserved();
        this.releaseConnection(connection);
      }
    };

    try {
      const begin = this.createTemplateStrings(["BEGIN"]);
      await reserved(begin);

      if (isolationLevel) {
        const iso = this.createTemplateStrings([
          `SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
        ]);
        await reserved(iso);
      }
    } catch (err) {
      await releaseReserved();
      this.releaseConnection(connection);
      throw err;
    }

    const runQuery = async (
      sql: string,
      args: any[],
    ): Promise<BunSqlResult> => {
      if (finished) {
        throw new Error("Transaction is already closed");
      }

      try {
        return await this.executeTransactionQueryOptimized(txRunner, sql, args);
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
        if (aborted) {
          await finalize("rollback");
          throw new Error("Transaction rolled back due to a previous error");
        }
        await finalize("commit");
      },
      rollback: async () => {
        await finalize("rollback");
      },
    };
  }

  private executeTransactionQueryOptimized(
    tx: BunSqlTransaction,
    sql: string,
    args: any[],
  ): Promise<BunSqlResult> {
    if (args.length === 0) {
      const strings = this.createTemplateStrings([sql]);
      return tx(strings);
    }

    const cached = this.getOrCreateTemplate(sql, args.length);
    if (cached) {
      const expanded = cached.argOrder?.length
        ? cached.argOrder.map((i) => args[i])
        : args;
      const coerced = this.coerceArgsForPostgres(expanded);
      return tx(cached.strings, ...coerced);
    }

    // Fallback: Transaction query has args but no recognized placeholders
    // Apply array coercion for Postgres compatibility
    const coerced = this.coerceArgsForPostgres(args);
    const strings = this.createTemplateStrings([sql]);
    return tx(strings, ...coerced);
  }

  private inferColumnTypeFast(value: unknown): ColumnType {
    if (value === null || value === undefined) {
      return ColumnTypeEnum.UnknownNumber;
    }

    const valueType = typeof value;

    // Fast type checking - most common cases first
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
        // Fast string type detection
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

  private serializeValueFast(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    const valueType = typeof value;

    // Fast path for common types
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

    // Ensure JSON columns arrive as valid JSON strings
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
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

  private isJsonishString(s: string): boolean {
    if (!s) return false;
    const t = s.trim();
    if (!t) return false;
    if (t.startsWith("{") || t.startsWith("[")) return true;
    if (t.startsWith('"') && t.endsWith('"')) return true;
    return false;
  }

  private ensureJsonString(value: unknown): string {
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
}

export class BunPostgresAdapter {
  readonly provider = "postgres" as const;
  readonly adapterName = "bun-postgres-adapter-optimized";
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
      typeof this.config === "string"
        ? 20 // Increased default for better concurrency
        : this.config.maxConnections || 20;

    return new OptimizedBunPostgresDriverAdapter(
      connectionString,
      maxConnections,
    );
  }

  async dispose(): Promise<void> {
    // Factory cleanup
  }
}

export default BunPostgresAdapter;
// Convenience alias to match common naming expectations
export { BunPostgresAdapter as BunPostgres };
