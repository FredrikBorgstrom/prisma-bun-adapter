import {
  ColumnType,
  ColumnTypeEnum,
  DriverAdapterError,
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
  /**
   * Validate connections before returning them from the pool.
   * When true, runs a lightweight health check (SELECT 1) on connections
   * that have been idle longer than `validateIdleThresholdMs`.
   * Defaults to true.
   */
  validateOnBorrow?: boolean;
  /**
   * Only validate connections that have been idle for at least this many milliseconds.
   * This avoids unnecessary validation overhead for recently-used connections.
   * Defaults to 10000 (10 seconds).
   */
  validateIdleThresholdMs?: number;
  /**
   * Custom query to use for connection validation.
   * Defaults to 'SELECT 1'.
   */
  validationQuery?: string;
  /**
   * Maximum number of retries when acquiring a healthy connection from the pool.
   * Defaults to 2.
   */
  maxAcquireRetries?: number;
  ssl?:
  | boolean
  | {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
}

/**
 * Pool statistics for debugging and monitoring
 */
export interface PoolStats {
  /** Total connections in the pool */
  total: number;
  /** Idle connections available for use */
  idle: number;
  /** Connections currently in use */
  active: number;
  /** Requests waiting for a connection */
  waiting: number;
  /** Total dead connections evicted since adapter creation */
  deadConnectionsEvicted: number;
  /** Total connection validation failures */
  validationFailures: number;
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

// Note: Template caching has been removed to keep the adapter stateless.
// If needed, a configurable cache can be added later via adapter options.

// Pre-compiled column type matchers for better performance
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Metadata tracked for each pooled connection
 */
interface ConnectionMetadata {
  /** Timestamp when this connection was created */
  createdAt: number;
  /** Timestamp when this connection was last used (released back to pool) */
  lastUsedAt: number;
  /** Timestamp when this connection was last validated */
  lastValidatedAt: number;
}

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
  private poolingDisabled: boolean;
  private disablePoolForTransactions: boolean;
  // Track in-use connections to avoid double-release
  private inUseConnections: Set<BunSqlConnection> = new Set();
  // Pre-warm threshold: start creating connections when we hit this usage
  private preWarmThreshold: number;
  // Counter for occasional pre-warm checks (using bitwise for speed)
  private roundRobinIndex: number = 0;
  // Minimum pool size to keep warm (for high-concurrency scenarios)
  private minPoolSize: number;
  // Track pending connection creation to avoid duplicate creates
  private pendingConnections: number = 0;
  // Connection health tracking
  private connectionMetadata: Map<BunSqlConnection, ConnectionMetadata> = new Map();
  // Pool health statistics
  private deadConnectionsEvicted: number = 0;
  private validationFailures: number = 0;
  // Configuration for connection validation
  private validateOnBorrow: boolean;
  private validateIdleThresholdMs: number;
  private validationQuery: string;
  private maxAcquireRetries: number;

  constructor(connectionString: string, maxConnections: number = 20, config?: Partial<BunPostgresConfig>) {
    this.connectionString = connectionString;
    this.poolingDisabled = (process.env.PRISMA_BUN_ADAPTER_DISABLE_POOL || "false") === "true";
    this.disablePoolForTransactions =
      (process.env.PRISMA_BUN_ADAPTER_DISABLE_POOL_FOR_TX || "true") === "true" || this.poolingDisabled;
    this.maxConnections = this.poolingDisabled ? 1 : maxConnections;

    // Connection validation configuration
    this.validateOnBorrow = config?.validateOnBorrow ?? true;
    this.validateIdleThresholdMs = config?.validateIdleThresholdMs ?? 10000; // 10 seconds default
    this.validationQuery = config?.validationQuery ?? "SELECT 1";
    this.maxAcquireRetries = config?.maxAcquireRetries ?? 2;

    if (this.poolingDisabled) {
      this.preWarmThreshold = 0;
      this.minPoolSize = 0;
    } else {
      // Pre-warm when we hit 70% capacity
      this.preWarmThreshold = Math.floor(this.maxConnections * 0.7);
      // For high connection counts, keep at least 10% of connections warm
      // For lower counts, keep at least 2 connections warm
      this.minPoolSize = Math.max(2, Math.floor(this.maxConnections * 0.1));
    }
  }

  /**
   * Get current pool statistics for monitoring and debugging
   */
  getPoolStats(): PoolStats {
    return {
      total: this.connections.length,
      idle: this.availableConnections.length,
      active: this.inUseConnections.size,
      waiting: this.waitQueue.length,
      deadConnectionsEvicted: this.deadConnectionsEvicted,
      validationFailures: this.validationFailures,
    };
  }

  /**
   * Check if a connection is still alive by running a lightweight query
   */
  private async isConnectionAlive(connection: BunSqlConnection): Promise<boolean> {
    try {
      const strings = this.createTemplateStrings([this.validationQuery]);
      await connection(strings);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Determine if a connection needs validation based on idle time
   */
  private needsValidation(connection: BunSqlConnection): boolean {
    if (!this.validateOnBorrow) {
      return false;
    }
    const metadata = this.connectionMetadata.get(connection);
    if (!metadata) {
      // Unknown connection, validate to be safe
      return true;
    }
    const idleTime = Date.now() - metadata.lastUsedAt;
    return idleTime >= this.validateIdleThresholdMs;
  }

  /**
   * Check if an error indicates a dead/broken connection
   */
  private isConnectionError(error: unknown): boolean {
    if (!error) return false;
    
    const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
    const errorCode = (error as any)?.code?.toString?.() ?? (error as any)?.errno ?? "";
    
    // Check error message patterns
    const connectionErrorPatterns = [
      "password authentication failed",
      "connection refused",
      "connection reset",
      "connection terminated",
      "connection closed",
      "socket hang up",
      "econnreset",
      "econnrefused",
      "epipe",
      "etimedout",
      "enetunreach",
      "ehostunreach",
      "network is unreachable",
      "no route to host",
      "broken pipe",
      "server closed the connection",
      "unexpected end of data",
      "ssl connection has been closed",
      "the connection was lost",
      "cannot acquire connection",
      "too many clients",
    ];
    
    for (const pattern of connectionErrorPatterns) {
      if (message.includes(pattern)) {
        return true;
      }
    }
    
    // Check PostgreSQL error codes indicating connection issues
    const connectionErrorCodes = [
      "08000", // connection_exception
      "08003", // connection_does_not_exist
      "08006", // connection_failure
      "08001", // sqlclient_unable_to_establish_sqlconnection
      "08004", // sqlserver_rejected_establishment_of_sqlconnection
      "08007", // transaction_resolution_unknown
      "08P01", // protocol_violation
      "57P01", // admin_shutdown
      "57P02", // crash_shutdown
      "57P03", // cannot_connect_now
      "28P01", // invalid_password (often indicates stale connection)
      "28000", // invalid_authorization_specification
    ];
    
    if (connectionErrorCodes.includes(errorCode)) {
      return true;
    }
    
    return false;
  }

  /**
   * Remove a dead connection from the pool
   */
  private evictConnection(connection: BunSqlConnection): void {
    // Remove from all tracking structures
    const idx = this.connections.indexOf(connection);
    if (idx !== -1) {
      this.connections.splice(idx, 1);
    }
    
    const availIdx = this.availableConnections.indexOf(connection);
    if (availIdx !== -1) {
      this.availableConnections.splice(availIdx, 1);
    }
    
    this.inUseConnections.delete(connection);
    this.connectionMetadata.delete(connection);
    this.deadConnectionsEvicted++;
    
    // Try to close the connection gracefully (fire-and-forget)
    this.closeConnection(connection);
  }

  private async getConnection(): Promise<BunSqlConnection> {
    if (this.poolingDisabled) {
      const connection = await this.createConnection();
      this.inUseConnections.add(connection);
      return connection;
    }
    
    // Try to acquire a healthy connection with retries
    for (let attempt = 0; attempt <= this.maxAcquireRetries; attempt++) {
      const connection = await this.acquireConnectionFromPool();
      
      // Check if connection needs validation
      if (this.needsValidation(connection)) {
        const isAlive = await this.isConnectionAlive(connection);
        
        if (!isAlive) {
          // Connection is dead, evict it and try again
          this.validationFailures++;
          console.warn(
            `[prisma-bun-adapter] Dead connection detected and evicted from pool ` +
            `(attempt ${attempt + 1}/${this.maxAcquireRetries + 1})`
          );
          this.evictConnection(connection);
          continue;
        }
        
        // Update validation timestamp
        const metadata = this.connectionMetadata.get(connection);
        if (metadata) {
          metadata.lastValidatedAt = Date.now();
        }
      }
      
      return connection;
    }
    
    // All retries exhausted, throw an error
    throw new Error(
      `[prisma-bun-adapter] Failed to acquire a healthy database connection ` +
      `after ${this.maxAcquireRetries + 1} attempts. ` +
      `Pool stats: ${JSON.stringify(this.getPoolStats())}`
    );
  }

  /**
   * Acquire a connection from the pool without validation
   */
  private async acquireConnectionFromPool(): Promise<BunSqlConnection> {
    // Fast path: try to get an available connection (LIFO is faster than round-robin)
    if (this.availableConnections.length > 0) {
      const connection = this.availableConnections.pop()!;
      this.inUseConnections.add(connection);
      
      // Defer pre-warming to avoid hot path overhead - only check occasionally
      // Use bitwise check to avoid expensive modulo
      if ((this.roundRobinIndex++ & 0x3F) === 0 && // Every 64th call
          this.availableConnections.length < this.minPoolSize &&
          this.connections.length < this.maxConnections &&
          this.pendingConnections === 0 &&
          this.waitQueue.length === 0) {
        this.preWarmConnection().catch(() => {
          // Ignore
        });
      }
      
      return connection;
    }

    // If we haven't reached the max, create a new connection
    if (this.connections.length + this.pendingConnections < this.maxConnections) {
      this.pendingConnections++;
      try {
        const connection = await this.createConnection();
        this.connections.push(connection);
        this.inUseConnections.add(connection);
        
        // Pre-warm: if we're getting close to capacity, create another connection proactively
        if (this.connections.length >= this.preWarmThreshold && 
            this.connections.length < this.maxConnections &&
            this.waitQueue.length === 0 &&
            this.pendingConnections <= 1) {
          // Don't await - create in background
          this.preWarmConnection().catch(() => {
            // Ignore pre-warm errors
          });
        }
        
        return connection;
      } finally {
        this.pendingConnections--;
      }
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      this.waitQueue.push({ resolve, reject });
    });
  }

  private async preWarmConnection(): Promise<void> {
    if (this.poolingDisabled) {
      return;
    }
    // Only pre-warm if we're not at max, have no waiters, and not already creating
    if (this.connections.length < this.maxConnections && 
        this.waitQueue.length === 0 &&
        this.pendingConnections === 0 &&
        this.availableConnections.length < this.minPoolSize) {
      this.pendingConnections++;
      try {
        const connection = await this.createConnection();
        this.connections.push(connection);
      this.availableConnections.push(connection);
        
        // Continue pre-warming until we hit minimum pool size
        if (this.availableConnections.length < this.minPoolSize &&
            this.connections.length < this.maxConnections) {
          // Create one more in background
          this.preWarmConnection().catch(() => {
            // Ignore
          });
        }
      } catch {
        // Ignore pre-warm failures
      } finally {
        this.pendingConnections--;
      }
    }
  }

  private releaseConnection(connection: BunSqlConnection): void {
    // Safety check: don't release if not in use (fast path check)
    if (!this.inUseConnections.delete(connection)) {
      return;
    }
    
    // Update last used timestamp for idle-time validation
    const metadata = this.connectionMetadata.get(connection);
    if (metadata) {
      metadata.lastUsedAt = Date.now();
    }
    
    // Check if anyone is waiting - prioritize waiters
    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift();
      if (waiter) {
        this.inUseConnections.add(connection);
        waiter.resolve(connection);
        return;
      }
    }
    
    // Add back to available pool (LIFO - fastest)
    this.availableConnections.push(connection);
    
    // Defer pre-warming check to avoid hot path overhead
    // Only check occasionally using bitwise for speed
    if ((this.roundRobinIndex & 0x7F) === 0 && // Every 128th release
        this.availableConnections.length < this.minPoolSize &&
        this.connections.length < this.maxConnections &&
        this.pendingConnections === 0 &&
        this.waitQueue.length === 0) {
      if (this.poolingDisabled) {
        return;
      }
      this.preWarmConnection().catch(() => {
        // Ignore
      });
    }
  }

  /**
   * Release a connection that encountered an error.
   * If the error indicates a broken connection, evict it from the pool.
   */
  private releaseConnectionWithError(connection: BunSqlConnection, error: unknown): void {
    if (this.isConnectionError(error)) {
      console.warn(
        `[prisma-bun-adapter] Evicting connection due to error: ${error instanceof Error ? error.message : String(error)}`
      );
      this.evictConnection(connection);
    } else {
      this.releaseConnection(connection);
    }
  }

  private closeConnection(connection: BunSqlConnection): void {
    try {
      const maybeEnd = connection.end?.();
      if (maybeEnd && typeof (maybeEnd as any).then === "function") {
        maybeEnd.catch(() => {});
        return;
      }
    } catch {
      // ignore
    }
    try {
      const maybeClose = connection.close?.();
      if (maybeClose && typeof (maybeClose as any).then === "function") {
        maybeClose.catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  private async createConnection(): Promise<BunSqlConnection> {
    const BunSQL = (globalThis as any).Bun?.sql;
    if (!BunSQL) {
      throw new Error(
        "Bun's native SQL client is not available. Make sure you're running with Bun 1.3+",
      );
    }

    const candidates = this.buildPgConnectionCandidates(this.connectionString);
    const schemaForSearchPath = this.getSchemaParam(this.connectionString);
    let lastErr: any = null;
    for (const candidate of candidates) {
      try {
        const conn = new BunSQL(candidate) as BunSqlConnection;
        try {
          const strings = this.createTemplateStrings(["SELECT 1"]);
          await conn(strings);
          if (schemaForSearchPath) {
            const setPath = this.createTemplateStrings([`SET search_path TO "${schemaForSearchPath}"`]);
            await conn(setPath);
          }
          
          // Track connection metadata for health checking
          const now = Date.now();
          this.connectionMetadata.set(conn, {
            createdAt: now,
            lastUsedAt: now,
            lastValidatedAt: now,
          });
          
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

  private getSchemaParam(s: string): string | null {
    try {
      const u = new URL(s);
      return u.searchParams.get('schema');
    } catch {
      return null;
    }
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
            // Map Prisma's schema param to Postgres search_path via options
            const schemaParam = u.searchParams.get('schema');
            if (schemaParam) {
              u.searchParams.delete('schema');
              const existing = u.searchParams.get('options');
              const opt = existing ? `${existing} -c search_path=${schemaParam}` : `-c search_path=${schemaParam}`;
              u.searchParams.set('options', opt);
            }
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
      // Also translate any ?schema= param to options=-c search_path=...
      try {
        const url = new URL(`${scheme}://${rebuiltAuthority}${tail}`);
        const schemaParam = url.searchParams.get('schema');
        if (schemaParam) {
          url.searchParams.delete('schema');
          const existing = url.searchParams.get('options');
          const opt = existing ? `${existing} -c search_path=${schemaParam}` : `-c search_path=${schemaParam}`;
          url.searchParams.set('options', opt);
          return url.toString();
        }
      } catch { }
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
    await Promise.all(this.connections.map((conn) => conn.end().catch(() => {})));
    this.connections = [];
    this.availableConnections = [];
    this.inUseConnections.clear();
    this.connectionMetadata.clear();
    this.roundRobinIndex = 0;
    if (this.waitQueue.length > 0) {
      const error = new Error("Adapter disposed");
      while (this.waitQueue.length) {
        this.waitQueue.shift()?.reject(error);
      }
    }
  }

  async executeScript(script: string): Promise<void> {
    const connection = await this.getConnection();
    let scriptError: unknown = null;
    try {
      const statements = script.split(";").filter((stmt) => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          const strings = this.createTemplateStrings([statement.trim()]);
          const result = await connection(strings);
          this.ensureSuccessfulResult(result, statement.trim());
        }
      }
    } catch (error) {
      scriptError = error;
      throw error;
    } finally {
      // Evict connection if it appears to be dead, otherwise return to pool
      if (scriptError) {
        this.releaseConnectionWithError(connection, scriptError);
      } else {
        this.releaseConnection(connection);
      }
    }
  }

  async queryRaw(query: SqlQuery): Promise<SqlResultSet> {
    const connection = await this.getConnection();
    let queryError: unknown = null;
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

      // Compute column names/types for this result
      const firstRow = result[0];
      const columnNames = Object.keys(firstRow);
      const columnTypes = this.determineColumnTypes(result, columnNames);
      const colIsJsonMask = columnTypes.map((t) => t === ColumnTypeEnum.Json);

      const columnCount = columnNames.length;
      const rowCount = result.length;
      const rows = new Array(rowCount);

      // Process all rows efficiently using cached metadata
      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const row = result[rowIndex];
        const processedRow = new Array(columnCount);

        for (let colIndex = 0; colIndex < columnCount; colIndex++) {
          const val = row[columnNames[colIndex]];
          processedRow[colIndex] = colIsJsonMask[colIndex]
            ? this.ensureJsonString(val)
            : this.serializeValueFast(val);
        }

        rows[rowIndex] = processedRow;
      }

      return { columnNames, columnTypes, rows };

    } catch (error) {
      queryError = error;
      console.error("Error in queryRaw:", error);
      // throwDriverError always throws, but TypeScript needs explicit throw
      throw this.createDriverError(error, query.sql, { query, stage: "queryRaw" });
    } finally {
      // Evict connection if it appears to be dead, otherwise return to pool
      if (queryError) {
        this.releaseConnectionWithError(connection, queryError);
      } else {
        this.releaseConnection(connection);
      }
    }
  }

  async executeRaw(query: SqlQuery): Promise<number> {
    const connection = await this.getConnection();
    let queryError: unknown = null;
    try {
      const result = await this.executeQueryOptimized(
        connection,
        query.sql,
        query.args || [],
      );
      return result.affectedRows || result.count || 0;
    } catch (error) {
      queryError = error;
      // createDriverError returns the error for explicit throw (TypeScript satisfaction)
      throw this.createDriverError(error, query.sql, { query, stage: "executeRaw" });
    } finally {
      // Evict connection if it appears to be dead, otherwise return to pool
      if (queryError) {
        this.releaseConnectionWithError(connection, queryError);
      } else {
        this.releaseConnection(connection);
      }
    }
  }

  private ensureSuccessfulResult(result: BunSqlResult, sql: string): BunSqlResult {
    const payload = result as any;
    const error = payload?.error ?? payload?.cause;
    if (error) {
      this.throwDriverError(error, sql, payload);
    }
    if (payload?.success === false) {
      this.throwDriverError(payload?.error ?? payload, sql, payload);
    }
    return result;
  }

  private async executeQueryOptimized(
    connection: BunSqlConnection,
    sql: string,
    args: any[],
  ): Promise<BunSqlResult> {
    // Fast path for queries without parameters
    if (args.length === 0) {
      const strings = this.createTemplateStrings([sql]);
      const result = await connection(strings);
      return this.ensureSuccessfulResult(result, sql);
    }

    const cached = this.getOrCreateTemplate(sql, args.length);
    if (cached) {
      const expanded = cached.argOrder?.length
        ? cached.argOrder.map((i) => args[i])
        : args;
      const coerced = this.coerceArgsForPostgres(expanded);
      const result = await connection(cached.strings, ...coerced);
      return this.ensureSuccessfulResult(result, sql);
    }

    // Fallback: Query has args but no recognized placeholders
    // This can happen with Prisma-generated queries that embed parameters differently
    // We still need to coerce arrays for Postgres compatibility
    const coerced = this.coerceArgsForPostgres(args);
    const strings = this.createTemplateStrings([sql]);
    const result = await connection(strings, ...coerced);
    return this.ensureSuccessfulResult(result, sql);
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
  // Coerce arguments for Postgres with awareness of JSON and array placeholders.
  // - For placeholders targeting JSON/JSONB, ensure a single JSON string is passed
  //   (avoid double-stringifying values that are already JSON text).
  // - For true Postgres array placeholders (e.g., $1::text[] or ANY($1)),
  //   convert primitive JS arrays to array literal strings.
  // - Otherwise, leave arrays as-is (useful for JSON columns which often receive arrays).
  private coerceArgsForPostgres(args: any[], sql?: string): any[] {
    const jsonParamIndexes = sql ? this.findJsonParamIndexes(sql) : new Set<number>();
    const arrayParamIndexes = sql ? this.findPgArrayParamIndexes(sql) : new Set<number>();

    // Fast path: if there are no arrays and no explicit JSON placeholders,
    // return the args as-is to avoid per-call allocations.
    if (jsonParamIndexes.size === 0) {
      let hasArray = false;
      for (let i = 0; i < args.length; i++) {
        if (Array.isArray(args[i])) {
          hasArray = true;
          break;
        }
      }
      if (!hasArray) return args;
    }
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

    const ensureJsonText = (v: any): any => {
      if (typeof v === "string") {
        const t = v.trim();
        if (t.startsWith("{") || t.startsWith("[") || t === "null" || t === "true" || t === "false" || /^(?:-?\d+(?:\.\d+)?)$/.test(t)) {
          return v;
        }
        return JSON.stringify(v);
      }
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    };

    return args.map((v, idx) => {
      const i = idx + 1;
      if (jsonParamIndexes.has(i)) {
        return ensureJsonText(v);
      }
      if (Array.isArray(v) && isPrimitiveArray(v)) {
        if (arrayParamIndexes.has(i)) return toPgArrayLiteral(v);
        return toPgArrayLiteral(v);
      }
      return v;
    });
  }

  // Identify 1-based parameter indexes used as JSON/JSONB in the SQL text
  private findJsonParamIndexes(sql: string): Set<number> {
    const out = new Set<number>();
    const s = sql.toLowerCase();
    const reCast = /\$(\d+)\s*::\s*jsonb?/g;
    let m: RegExpExecArray | null;
    while ((m = reCast.exec(s)) !== null) {
      out.add(Number(m[1]));
    }
    const reFunc = /cast\s*\(\s*\$(\d+)\s+as\s+jsonb?\s*\)/g;
    while ((m = reFunc.exec(s)) !== null) {
      out.add(Number(m[1]));
    }
    return out;
  }

  // Identify 1-based parameter indexes used as Postgres arrays (ANY($n) or ::type[])
  private findPgArrayParamIndexes(sql: string): Set<number> {
    const out = new Set<number>();
    const s = sql.toLowerCase();
    const reAny = /any\s*\(\s*\$(\d+)\s*\)/g;
    let m: RegExpExecArray | null;
    while ((m = reAny.exec(s)) !== null) {
      out.add(Number(m[1]));
    }
    const reTyped = /\$(\d+)\s*::\s*[a-z0-9_]+\[\]/g;
    while ((m = reTyped.exec(s)) !== null) {
      out.add(Number(m[1]));
    }
    return out;
  }

  private getOrCreateTemplate(sql: string, argCount: number) {
    if (argCount === 0) {
      return null;
    }

    const built = this.buildTemplate(sql, argCount);
    if (!built) {
      // Don't throw - return null to allow fallback path
      // This handles Prisma queries that embed parameters differently
      return null;
    }
    return built;
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
    const connection = this.disablePoolForTransactions
      ? await this.createConnection()
      : await this.getConnection();
    let reserved: BunReservedSqlConnection;

    try {
      reserved = await connection.reserve();
    } catch (err) {
      if (this.disablePoolForTransactions) {
        this.closeConnection(connection);
      } else {
        this.releaseConnection(connection);
      }
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
        if (this.disablePoolForTransactions) {
          this.closeConnection(connection);
        } else {
          this.releaseConnection(connection);
        }
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
      if (this.disablePoolForTransactions) {
        this.closeConnection(connection);
      } else {
        this.releaseConnection(connection);
      }
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
        this.throwDriverError(err, sql, { args, transaction: true });
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
        const columnTypes = this.determineColumnTypes(result, columnNames);
        const colIsJsonMask = columnTypes.map((t) => t === ColumnTypeEnum.Json);

        const columnCount = columnNames.length;
        const rows = new Array(result.length);

        for (let rowIndex = 0; rowIndex < result.length; rowIndex++) {
          const row = result[rowIndex];
          const processedRow = new Array(columnCount);

          for (let colIndex = 0; colIndex < columnCount; colIndex++) {
            const val = row[columnNames[colIndex]];
            processedRow[colIndex] = colIsJsonMask[colIndex]
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

  private async executeTransactionQueryOptimized(
    tx: BunSqlTransaction,
    sql: string,
    args: any[],
  ): Promise<BunSqlResult> {
    if (args.length === 0) {
      const strings = this.createTemplateStrings([sql]);
      const result = await tx(strings);
      return this.ensureSuccessfulResult(result, sql);
    }

    const cached = this.getOrCreateTemplate(sql, args.length);
    if (cached) {
      const expanded = cached.argOrder?.length
        ? cached.argOrder.map((i) => args[i])
        : args;
      const coerced = this.coerceArgsForPostgres(expanded, sql);
      const result = await tx(cached.strings, ...coerced);
      return this.ensureSuccessfulResult(result, sql);
    }

    // Fallback: Transaction query has args but no recognized placeholders
    // Apply array coercion for Postgres compatibility
    const coerced = this.coerceArgsForPostgres(args, sql);
    const strings = this.createTemplateStrings([sql]);
    const result = await tx(strings, ...coerced);
    return this.ensureSuccessfulResult(result, sql);
  }

  /**
   * Create a DriverAdapterError from a raw error (returns instead of throwing for TypeScript control flow)
   */
  private createDriverError(rawError: unknown, sql: string, payload?: unknown): DriverAdapterError {
    if (rawError instanceof DriverAdapterError) {
      return rawError;
    }

    if (rawError instanceof Error) {
      const mapped = this.mapPostgresError(rawError);
      (mapped as any).context = { sql, payload, original: rawError };
      return new DriverAdapterError(mapped);
    }

    if (rawError && typeof rawError === "object") {
      const mapped = this.mapPostgresError(rawError);
      (mapped as any).context = { sql, payload, original: rawError };
      return new DriverAdapterError(mapped);
    }

    const message =
      typeof rawError === "string" ? rawError : "Bun SQL query failed";
    const mapped: any = {
      kind: "postgres",
      code: "UNKNOWN",
      severity: "ERROR",
      message,
      detail: undefined,
      column: undefined,
      hint: undefined,
      originalMessage: message,
    };
    mapped.context = { sql, payload, original: rawError };
    return new DriverAdapterError(mapped);
  }

  private throwDriverError(rawError: unknown, sql: string, payload?: unknown): never {
    throw this.createDriverError(rawError, sql, payload);
  }

  private mapPostgresError(error: any) {
    const message =
      typeof error?.message === "string" ? error.message : "Postgres error";
    const severity =
      typeof error?.severity === "string" ? error.severity : "ERROR";
    const detail = typeof error?.detail === "string" ? error.detail : undefined;
    const column =
      typeof error?.column === "string"
        ? error.column
        : this.extractIdentifier(message);
    const hint = typeof error?.hint === "string" ? error.hint : undefined;
    const sqlState =
      typeof error?.errno === "string"
        ? error.errno
        : typeof error?.code === "string" && /^[0-9A-Z]{5}$/.test(error.code)
          ? error.code
          : undefined;

    if (!sqlState && message === "Transaction is already closed") {
      return {
        kind: "TransactionAlreadyClosed" as const,
        cause: message,
        originalMessage: message,
      };
    }

    const base: any = {
      originalCode:
        sqlState ??
        (typeof error?.code === "string" ? error.code : undefined),
      originalMessage: message,
    };

    const fields = this.extractConstraintFields(detail);

    switch (sqlState) {
      case "23505":
        return {
          ...base,
          kind: "UniqueConstraintViolation",
          constraint: fields ? { fields } : undefined,
        };
      case "23502":
        return {
          ...base,
          kind: "NullConstraintViolation",
          constraint: fields ? { fields } : undefined,
        };
      case "23503":
        return {
          ...base,
          kind: "ForeignKeyConstraintViolation",
          constraint: fields ? { fields } : undefined,
        };
      case "3D000":
        return {
          ...base,
          kind: "DatabaseDoesNotExist",
          db: typeof error?.database === "string" ? error.database : undefined,
        };
      case "42P01":
        return {
          ...base,
          kind: "TableDoesNotExist",
          table:
            typeof error?.table === "string"
              ? error.table
              : this.extractIdentifier(message),
        };
      case "42703":
        return {
          ...base,
          kind: "ColumnNotFound",
          column,
        };
      case "53300":
        return {
          ...base,
          kind: "TooManyConnections",
          cause: message,
        };
      case "25P02":
      case "2F000":
      case "57014":
        return {
          ...base,
          kind: "TransactionAlreadyClosed",
          cause: message,
        };
      case "40001":
      case "40P01":
        return {
          ...base,
          kind: "TransactionWriteConflict",
        };
      case "08003":
      case "08006":
      case "57P01":
        return {
          ...base,
          kind: "ConnectionClosed",
        };
      case "28P01":
      case "28000":
        return {
          ...base,
          kind: "AuthenticationFailed",
          user: typeof error?.user === "string" ? error.user : undefined,
        };
      case "22001":
        return {
          ...base,
          kind: "LengthMismatch",
          column,
        };
      case "22003":
        return {
          ...base,
          kind: "ValueOutOfRange",
          cause: message,
        };
      default:
        return {
          ...base,
          kind: "postgres",
          code:
            sqlState ??
            (typeof error?.code === "string" ? error.code : "UNKNOWN"),
          severity,
          message,
          detail,
          column,
          hint,
        };
    }
  }

  private extractConstraintFields(detail?: string): string[] | undefined {
    if (typeof detail !== "string") {
      return undefined;
    }
    const match = detail.match(/Key \\(([^)]+)\\)/);
    if (!match) {
      return undefined;
    }
    return match[1]
      .split(",")
      .map((field) => field.trim())
      .filter(Boolean);
  }

  private extractIdentifier(message?: string): string | undefined {
    if (typeof message !== "string") {
      return undefined;
    }
    const match = message.match(/\"([^\"]+)\"/);
    return match?.[1];
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
      let hasNonArrayValue = false;
      const primitiveTypes = new Set<string>();

      for (let r = 0; r < result.length; r++) {
        const v = result[r][name];
        if (v === null || v === undefined) continue;

        if (Array.isArray(v)) {
          hasArray = true;
          if (v.length > 0 && arrayElementType === null) {
            arrayElementType = this.inferColumnTypeFast(v[0]);
          }
          continue;
        } else if (
          typeof v === "object" &&
          !(v instanceof Date) &&
          !Buffer.isBuffer(v)
        ) {
          hasOtherObjects = true;
          hasNonArrayValue = true;
          continue;
        }

        hasNonArrayValue = true;
        primitiveTypes.add(typeof v);
      }

      const hasMixedPrimitiveTypes = primitiveTypes.size > 1;

      if (
        hasOtherObjects ||
        hasMixedPrimitiveTypes ||
        (hasArray && hasNonArrayValue)
      ) {
        types[i] = ColumnTypeEnum.Json;
        continue;
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
      // Handle strings that may already contain JSON or be improperly wrapped
      let s = (value as string).trim();

      // Fast path: valid JSON as-is
      if (this.isJsonishString(s)) {
        try {
          // Validate it parses; if it does, return unchanged
          JSON.parse(s);
          return s;
        } catch {
          // If it looks JSON-ish but is malformed (e.g., ""value""),
          // try to normalize by stripping repeated leading/trailing quotes
          const unwrapped = s.replace(/^"+|"+$/g, "");
          return JSON.stringify(unwrapped);
        }
      }

      // Not JSON-like: treat as a plain string value
      return JSON.stringify(s);
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
        ? 20 // Default for string config
        : this.config.maxConnections || 20;

    // Pass the full config object for connection validation settings
    const configOptions = typeof this.config === "string" ? undefined : this.config;

    return new OptimizedBunPostgresDriverAdapter(
      connectionString,
      maxConnections,
      configOptions,
    );
  }

  async dispose(): Promise<void> {
    // Factory cleanup
  }
}

export default BunPostgresAdapter;
// Convenience alias to match common naming expectations
export { BunPostgresAdapter as BunPostgres };
