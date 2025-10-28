import { PrismaClient as PrismaClientPg } from "@prisma/client";
import { BunMySQLAdapter, BunPostgresAdapter, BunSQLiteAdapter, BunPostgresOptimized } from "../src/index.js";
import { createSqlJsDriverAdapter } from "./lib/sqljs-traditional-adapter.ts";
import { databases as testDatabases } from "./setup-test-dbs";

// Summary: Compare Bun ORM adapters against Prisma equivalents across databases to measure functionality and relative speed.

const POSTGRES_URL = testDatabases.find((d) => d.name === "PostgreSQL")!.connectionString;
const MYSQL_URL = testDatabases.find((d) => d.name === "MySQL")!.connectionString;
// Optional: Planetscale URL for Prisma MySQL testing (required for @prisma/adapter-planetscale)
const PLANETSCALE_URL = process.env.TEST_PLANETSCALE_URL || "";

interface TestResult {
  adapter: string;
  provider: string;
  type: "bun" | "prisma";
  success: boolean;
  duration: number;
  error?: string;
  rowCount?: number;
  skipped?: boolean;
  connectionAvailable?: boolean;
}

interface AdapterConfig {
  name: string;
  type: "bun" | "prisma";
  adapter: any;
  connectionString?: string;
  connectionConfig?: any;
  testQueries: {
    simple: string;
    parameterized: { sql: string; args: any[] };
    create: string;
    insert: { sql: string; args: any[] };
    select: string;
    update: { sql: string; args: any[] };
    delete: string;
    drop: string;
  };
}

interface AdapterComparisonSummary {
  summary: string;
  availability: Array<{ adapter: string; type: "bun" | "prisma"; available: boolean }>;
  results: TestResult[];
  overallWinner?: "bun" | "prisma" | "tie";
  differencePct?: number;
}

// Connection availability cache
const connectionCache = new Map<string, { available: boolean; error?: string }>();

// Lazy load Prisma adapters to handle optional dependencies
async function loadPrismaAdapters() {
  const adapters: any = {};
  // Attach the default Prisma Client (assumed PostgreSQL in this repo's schema)
  adapters.PrismaClientPg = PrismaClientPg;
  
  try {
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const { Pool } = await import("pg");
    adapters.PrismaPg = PrismaPg;
    adapters.Pool = Pool;
  } catch (error) {
    console.log("⚠️  @prisma/adapter-pg not available:", (error as Error).message);
  }

  try {
    const { PrismaPlanetScale } = await import("@prisma/adapter-planetscale");
    const { connect } = await import("@planetscale/database");
    adapters.PrismaPlanetScale = PrismaPlanetScale;
    adapters.planetscaleConnect = connect;
  } catch (error) {
    console.log("⚠️  @prisma/adapter-planetscale or @planetscale/database not available:", (error as Error).message);
  }

  // Try to load a separately generated Prisma Client for MySQL
  // Generate with: bunx prisma generate --schema test-app/prisma/mysql.schema.prisma
  try {
    const mysqlClient = await import("./generated/mysql-client/index.js");
    adapters.PrismaClientMySQL = mysqlClient.PrismaClient;
  } catch (error) {
    console.log("⚠️  Prisma MySQL client not found. Generate with: bunx prisma generate --schema test-app/prisma/mysql.schema.prisma");
  }

  return adapters;
}

async function createAdapterConfigs(): Promise<AdapterConfig[]> {
  const prismaAdapters = await loadPrismaAdapters();
  
  const configs: AdapterConfig[] = [
    // Bun Adapters
    {
      name: "Bun PostgreSQL",
      type: "bun",
      adapter: BunPostgresAdapter,
      connectionString: POSTGRES_URL,
      testQueries: {
        simple: "SELECT 1 as test_value",
        parameterized: { sql: "SELECT $1 as param_value", args: ["test_param"] },
        create: `CREATE TABLE IF NOT EXISTS test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        insert: { sql: "INSERT INTO test_table (name) VALUES ($1) RETURNING id", args: ["test_name"] },
        select: "SELECT * FROM test_table ORDER BY id",
        update: { sql: "UPDATE test_table SET name = $1 WHERE id = $2", args: ["updated_name", 1] },
        delete: "DELETE FROM test_table WHERE id = 1",
        drop: "DROP TABLE IF EXISTS test_table",
      },
    },
    {
      name: "Bun PostgreSQL (Optimized)",
      type: "bun",
      adapter: BunPostgresOptimized,
      connectionString: POSTGRES_URL,
      testQueries: {
        simple: "SELECT 1 as test_value",
        parameterized: { sql: "SELECT $1 as param_value", args: ["test_param"] },
        create: `CREATE TABLE IF NOT EXISTS test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        insert: { sql: "INSERT INTO test_table (name) VALUES ($1) RETURNING id", args: ["test_name"] },
        select: "SELECT * FROM test_table ORDER BY id",
        update: { sql: "UPDATE test_table SET name = $1 WHERE id = $2", args: ["updated_name", 1] },
        delete: "DELETE FROM test_table WHERE id = 1",
        drop: "DROP TABLE IF EXISTS test_table",
      },
    },
    {
      name: "Bun MySQL",
      type: "bun",
      adapter: BunMySQLAdapter,
      connectionString: MYSQL_URL,
      testQueries: {
        simple: "SELECT 1 as test_value",
        parameterized: { sql: "SELECT ? as param_value", args: ["test_param"] },
        create: `CREATE TABLE IF NOT EXISTS test_table (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        insert: { sql: "INSERT INTO test_table (name) VALUES (?)", args: ["test_name"] },
        select: "SELECT * FROM test_table ORDER BY id",
        update: { sql: "UPDATE test_table SET name = ? WHERE id = ?", args: ["updated_name", 1] },
        delete: "DELETE FROM test_table WHERE id = 1",
        drop: "DROP TABLE IF EXISTS test_table",
      },
    },
    {
      name: "Bun SQLite",
      type: "bun",
      adapter: BunSQLiteAdapter,
      connectionString: ":memory:",
      testQueries: {
        simple: "SELECT 1 as test_value",
        parameterized: { sql: "SELECT ? as param_value", args: ["test_param"] },
        create: `CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        insert: { sql: "INSERT INTO test_table (name) VALUES (?)", args: ["test_name"] },
        select: "SELECT * FROM test_table ORDER BY id",
        update: { sql: "UPDATE test_table SET name = ? WHERE id = ?", args: ["updated_name", 1] },
        delete: "DELETE FROM test_table WHERE id = 1",
        drop: "DROP TABLE IF EXISTS test_table",
      },
    },
  ];

  configs.push({
    name: "Traditional SQLite (sql.js)",
    type: "prisma",
    adapter: class SqlJsAdapter {
      connectionString: string;
      constructor(connectionString: string = ":memory:") {
        this.connectionString = connectionString || ":memory:";
      }
      async connect() {
        return createSqlJsDriverAdapter(this.connectionString);
      }
    },
    connectionString: ":memory:",
    testQueries: {
      simple: "SELECT 1 as test_value",
      parameterized: { sql: "SELECT ? as param_value", args: ["test_param"] },
      create: `CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      insert: { sql: "INSERT INTO test_table (name) VALUES (?)", args: ["test_name"] },
      select: "SELECT * FROM test_table ORDER BY id",
      update: { sql: "UPDATE test_table SET name = ? WHERE id = ?", args: ["updated_name", 1] },
      delete: "DELETE FROM test_table WHERE id = 1",
      drop: "DROP TABLE IF EXISTS test_table",
    },
  });

  // Add Prisma adapters if available
  if (prismaAdapters.PrismaPg && prismaAdapters.Pool) {
    configs.push({
      name: "Prisma PostgreSQL",
      type: "prisma",
      adapter: class PrismaPostgresAdapter {
        constructor(connectionString: string) {
          this.connectionString = connectionString;
        }
        connectionString: string;
        async connect() {
          const pool = new prismaAdapters.Pool({ connectionString: this.connectionString });
          const prismaAdapter = new prismaAdapters.PrismaPg(pool);
          const prisma = new prismaAdapters.PrismaClientPg({ adapter: prismaAdapter });
          // Provide a wrapper with a Bun-like interface for the tests
          return {
            // Support the same shape used by Bun adapters: { sql, args }
            queryRaw: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
              if (Array.isArray(args) && args.length > 0) {
                // For parameterized test we only need the first arg
                const value = args[0];
                // Use Prisma's parameterization via tagged template literals
                return await (prisma as any).$queryRaw`SELECT ${value} as param_value`;
              }
              return await (prisma as any).$queryRawUnsafe(sql);
            },
            executeRaw: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
              if (Array.isArray(args) && args.length > 0) {
                const value = args[0];
                return await (prisma as any).$executeRaw`SELECT ${value}`;
              }
              return await (prisma as any).$executeRawUnsafe(sql);
            },
            close: async () => {
              await prisma.$disconnect();
              await pool.end();
            },
            _pool: pool,
            _client: prisma,
          };
        }
      },
      connectionString: POSTGRES_URL,
      testQueries: {
        simple: "SELECT 1 as test_value",
        parameterized: { sql: "SELECT $1 as param_value", args: ["test_param"] },
        create: `CREATE TABLE IF NOT EXISTS test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        insert: { sql: "INSERT INTO test_table (name) VALUES ($1) RETURNING id", args: ["test_name"] },
        select: "SELECT * FROM test_table ORDER BY id",
        update: { sql: "UPDATE test_table SET name = $1 WHERE id = $2", args: ["updated_name", 1] },
        delete: "DELETE FROM test_table WHERE id = 1",
        drop: "DROP TABLE IF EXISTS test_table",
      },
    });
  }

  if (prismaAdapters.PrismaPlanetScale && prismaAdapters.planetscaleConnect && PLANETSCALE_URL) {
    configs.push({
      name: "Prisma MySQL",
      type: "prisma",
      adapter: class PrismaMySQLAdapter {
        constructor(connectionString: string) {
          this.connectionString = connectionString;
        }
        connectionString: string;
        async connect() {
          if (!prismaAdapters.PrismaClientMySQL) {
            throw new Error("Prisma MySQL client not generated. Run: bunx prisma generate --schema test-app/prisma/mysql.schema.prisma");
          }
          // Use the official Planetscale HTTP driver with the Prisma adapter
          const connection = prismaAdapters.planetscaleConnect({ url: this.connectionString });
          const prismaAdapter = new prismaAdapters.PrismaPlanetScale(connection);
          const prisma = new prismaAdapters.PrismaClientMySQL({ adapter: prismaAdapter });
          return {
            queryRaw: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
              if (Array.isArray(args) && args.length > 0) {
                const value = args[0];
                return await (prisma as any).$queryRaw`SELECT ${value} as param_value`;
              }
              return await (prisma as any).$queryRawUnsafe(sql);
            },
            executeRaw: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
              if (Array.isArray(args) && args.length > 0) {
                const value = args[0];
                return await (prisma as any).$executeRaw`SELECT ${value}`;
              }
              return await (prisma as any).$executeRawUnsafe(sql);
            },
            close: async () => {
              await prisma.$disconnect();
              // planetscale client uses HTTP; no pool to close
            },
            _client: prisma,
          };
        }
      },
      connectionString: PLANETSCALE_URL,
      testQueries: {
        simple: "SELECT 1 as test_value",
        parameterized: { sql: "SELECT ? as param_value", args: ["test_param"] },
        create: `CREATE TABLE IF NOT EXISTS test_table (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        insert: { sql: "INSERT INTO test_table (name) VALUES (?)", args: ["test_name"] },
        select: "SELECT * FROM test_table ORDER BY id",
        update: { sql: "UPDATE test_table SET name = ? WHERE id = ?", args: ["updated_name", 1] },
        delete: "DELETE FROM test_table WHERE id = 1",
      drop: "DROP TABLE IF EXISTS test_table",
      },
    });
  }

  try {
    const mysqlModule = await import("mysql2/promise");
    configs.push({
      name: "Traditional MySQL (mysql2)",
      type: "prisma",
      adapter: class Mysql2Adapter {
        constructor(private readonly connectionString: string) {}
        async connect() {
          const pool = mysqlModule.default.createPool({
            uri: this.connectionString,
            connectionLimit: 10,
          });
          return {
            queryRaw: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
              const [rows] = await pool.query(sql, args);
              if (!Array.isArray(rows) || rows.length === 0) {
                return { rows: [], columnNames: [], columnTypes: [] };
              }
              const columnNames = Object.keys(rows[0] as Record<string, unknown>);
              const values = (rows as Record<string, unknown>[]).map((row) =>
                columnNames.map((name) => row[name]),
              );
              return {
                rows: values,
                columnNames,
                columnTypes: columnNames.map(() => "unknown"),
              };
            },
            executeRaw: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
              const [result] = await pool.execute(sql, args);
              return result;
            },
            close: async () => {
              await pool.end();
            },
          };
        }
      },
      connectionString: MYSQL_URL,
      testQueries: {
        simple: "SELECT 1 as test_value",
        parameterized: { sql: "SELECT ? as param_value", args: ["test_param"] },
        create: `CREATE TABLE IF NOT EXISTS test_table (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        insert: { sql: "INSERT INTO test_table (name) VALUES (?)", args: ["test_name"] },
        select: "SELECT * FROM test_table ORDER BY id",
        update: { sql: "UPDATE test_table SET name = ? WHERE id = ?", args: ["updated_name", 1] },
        delete: "DELETE FROM test_table WHERE id = 1",
        drop: "DROP TABLE IF EXISTS test_table",
      },
    });
  } catch (error) {
    console.log(
      "⚠️  mysql2 not available for traditional MySQL comparison:",
      (error as Error).message,
    );
  }

  // Note: Traditional SQLite comparisons use sql.js (WASM) to avoid Bun-native crashes
  // This keeps a non-Bun baseline while staying fully compatible with Bun's runtime.

  return configs;
}

// Check if a database connection is available
async function checkConnection(adapterConfig: AdapterConfig): Promise<{ available: boolean; error?: string }> {
  const cacheKey = `${adapterConfig.name}-${adapterConfig.connectionString}`;
  
  if (connectionCache.has(cacheKey)) {
    return connectionCache.get(cacheKey)!;
  }

  try {
    const adapter = new adapterConfig.adapter(adapterConfig.connectionString);
    const driverAdapter = await adapter.connect();
    
    // Try a simple query to verify connection using a unified interface
    await driverAdapter.queryRaw({ sql: adapterConfig.testQueries.simple, args: [] });
    // Clean up
    if (adapterConfig.type === "bun") {
      await driverAdapter.dispose();
    } else if (driverAdapter.close) {
      await driverAdapter.close();
    }
    
    const result = { available: true };
    connectionCache.set(cacheKey, result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const result = { available: false, error: errorMessage };
    connectionCache.set(cacheKey, result);
    return result;
  }
}

async function runTest(
  adapterConfig: AdapterConfig,
  testName: string,
  testFn: (driverAdapter: any, config: AdapterConfig) => Promise<any>
): Promise<TestResult> {
  const startTime = performance.now();
  
  // Check connection availability first
  const connectionStatus = await checkConnection(adapterConfig);
  
  if (!connectionStatus.available) {
    const duration = performance.now() - startTime;
    return {
      adapter: adapterConfig.name,
      provider: adapterConfig.name.split(" ")[1]?.toLowerCase() || "unknown",
      type: adapterConfig.type,
      success: false,
      duration,
      error: `Database not available: ${connectionStatus.error}`,
      skipped: true,
      connectionAvailable: false,
    };
  }
  
  try {
    const adapter = new adapterConfig.adapter(adapterConfig.connectionString);
    const driverAdapter = await adapter.connect();
    
    try {
      const result = await testFn(driverAdapter, adapterConfig);
      const duration = performance.now() - startTime;
      
      return {
        adapter: adapterConfig.name,
        provider: adapterConfig.name.split(" ")[1]?.toLowerCase() || "unknown",
        type: adapterConfig.type,
        success: true,
        duration,
        rowCount: result?.rows?.length || result?.affectedRows || result,
        connectionAvailable: true,
      };
    } finally {
      if (adapterConfig.type === "bun") {
        await driverAdapter.dispose();
      } else {
        // Clean up Prisma adapter connections
        if (driverAdapter.close) {
          await driverAdapter.close();
        } else if (driverAdapter.end) {
          await driverAdapter.end();
        } else if (driverAdapter._pool && driverAdapter._pool.end) {
          await driverAdapter._pool.end();
        }
      }
    }
  } catch (error) {
    const duration = performance.now() - startTime;
    return {
      adapter: adapterConfig.name,
      provider: adapterConfig.name.split(" ")[1]?.toLowerCase() || "unknown",
      type: adapterConfig.type,
      success: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
      connectionAvailable: true,
    };
  }
}

async function runAllTests(): Promise<AdapterComparisonSummary> {
  console.log("🚀 Bun vs Prisma Adapter Comparison\n");
  
  const adapters = await createAdapterConfigs();
  
  // First, check which databases are available
  console.log("🔍 Checking adapter availability...");
  const availabilityResults = await Promise.all(
    adapters.map(async (adapterConfig) => {
      const status = await checkConnection(adapterConfig);
      const icon = status.available ? "✅" : "❌";
      const typeIcon = adapterConfig.type === "bun" ? "🚀" : "🔷";
      
      if (status.available) {
        console.log(`  ${icon} ${typeIcon} ${adapterConfig.name}: Available`);
      } else {
        // Clean up error messages for better readability
        let cleanError = status.error || "Unknown error";
        if (cleanError.includes("password authentication failed")) {
          cleanError = "Database not running or wrong credentials";
        } else if (cleanError.includes("Connection closed") || cleanError.includes("ECONNREFUSED")) {
          cleanError = "Database server not running";
        } else if (cleanError.includes("getaddrinfo ENOTFOUND")) {
          cleanError = "Database host not found";
        }
        console.log(`  ${icon} ${typeIcon} ${adapterConfig.name}: ${cleanError}`);
      }
      return { adapter: adapterConfig.name, available: status.available, type: adapterConfig.type };
    })
  );
  
  const availableCount = availabilityResults.filter(r => r.available).length;
  const totalCount = availabilityResults.length;
  
  console.log(`\n📊 Status: ${availableCount}/${totalCount} adapters available for testing`);

  const allResults: TestResult[] = [];

  if (availableCount === 0) {
    console.log("\n❌ No adapters available for comparison testing.");
    console.log("\n💡 To enable database testing:");
    console.log("   1. Setup databases: bun run setup:dbs");
    console.log("   2. Or set environment variables:");
    console.log("      export TEST_POSTGRES_URL='postgresql://user:pass@localhost:5433/db'");
    console.log("      export TEST_MYSQL_URL='mysql://user:pass@localhost:3306/db'");
    console.log("\n🗃️  For SQLite-only testing, try: bun run demo:sqlite");
    
    const summaryText = [
      `Adapters available: ${availableCount}/${totalCount}`,
      "Tests skipped: No adapters could connect.",
      "Setup databases with environment variables or bun run setup:dbs."
    ].join("\n");

    return {
      summary: summaryText,
      availability: availabilityResults,
      results: allResults,
    };
  }
  
  console.log();
  
  const testSuites = [
    {
      name: "Simple Query Test",
      test: async (driverAdapter: any, config: AdapterConfig) => {
        const iterations = 2000;
        let lastResult: any = null;

        for (let i = 0; i < iterations; i++) {
          lastResult = await driverAdapter.queryRaw({ sql: config.testQueries.simple, args: [] });
        }

        return lastResult;
      },
    },
    {
      name: "Parameterized Query Test", 
      test: async (driverAdapter: any, config: AdapterConfig) => {
        const iterations = 2000;
        let lastResult: any = null;

        for (let i = 0; i < iterations; i++) {
          lastResult = await driverAdapter.queryRaw(config.testQueries.parameterized);
        }

        return lastResult;
      },
    },
    {
      name: "Connection Overhead Test",
      test: async (driverAdapter: any, config: AdapterConfig) => {
        // Test multiple quick operations to measure connection overhead
        const startTime = performance.now();
        
        const operations = 2000;
        for (let i = 0; i < operations; i++) {
          await driverAdapter.queryRaw({ sql: config.testQueries.simple, args: [] });
        }
        
        const endTime = performance.now();
        return { operations, totalTime: endTime - startTime };
      },
    },
    {
      name: "CRUD Batch Test",
      test: async (driverAdapter: any, config: AdapterConfig) => {
        const tableName = `temp_table_${Math.random().toString(36).slice(2, 10)}`;
        const replaceTableName = (sql: string) => sql.replace(/test_table/g, tableName);

        // Ensure table exists in a clean state
        await driverAdapter.queryRaw({ sql: replaceTableName(config.testQueries.drop), args: [] }).catch(() => {});
        await driverAdapter.queryRaw({ sql: replaceTableName(config.testQueries.create), args: [] });

        const operations = 500;

        const insertArgsTemplate = config.testQueries.insert.args || [];
        const startTime = performance.now();

        for (let i = 0; i < operations; i++) {
          const insertArgs = insertArgsTemplate.map((arg, index) => {
            if (typeof arg === "string" && index === 0) {
              return `${arg}_${i}`;
            }
            if (typeof arg === "number" && index === 1) {
              return i + 1;
            }
            return arg;
          });

          await driverAdapter.queryRaw({
            sql: replaceTableName(config.testQueries.insert.sql),
            args: insertArgs,
          });
        }

        for (let i = 0; i < operations; i++) {
          await driverAdapter.queryRaw({
            sql: replaceTableName(config.testQueries.select),
            args: [],
          });
        }

        const endTime = performance.now();

        await driverAdapter.queryRaw({ sql: replaceTableName(config.testQueries.drop), args: [] }).catch(() => {});

        return { operations: operations * 2, totalTime: endTime - startTime };
      },
    },
  ];

  for (const testSuite of testSuites) {
    console.log(`📋 Running ${testSuite.name}...`);
    
    const results = await Promise.all(
      adapters.map(adapterConfig =>
        runTest(adapterConfig, testSuite.name, testSuite.test)
      )
    );
    
    allResults.push(...results);
    
    // Display results for this test
    results.forEach(result => {
      let status: string;
      if (result.skipped) {
        status = "⏭️";
      } else if (result.success) {
        status = "✅";
      } else {
        status = "❌";
      }
      
      const typeIcon = result.type === "bun" ? "🚀" : "🔷";
      const duration = `${result.duration.toFixed(2)}ms`;
      const extra = result.rowCount !== undefined ? ` (${result.rowCount} rows)` : "";
      const error = result.error && !result.skipped ? ` - ${result.error}` : "";
      const skipped = result.skipped ? " (skipped - database not available)" : "";
      
      console.log(`  ${status} ${typeIcon} ${result.adapter}: ${duration}${extra}${error}${skipped}`);
    });
    
    console.log();
  }

  // Performance comparison by database type
  console.log("⚡ Performance Comparison by Database:");
  console.log("====================================");
  
  const databases = ["postgresql", "mysql", "sqlite"];
  const databaseSummaryLines: string[] = [];
  
  const hasComparisons = databases.some(dbType => {
    const dbResults = allResults.filter(r => 
      r.provider === dbType && r.success && !r.skipped
    );
    return dbResults.length >= 2;
  });
  
  if (hasComparisons) {
    databases.forEach(dbType => {
      const dbResults = allResults.filter(r => 
        r.provider === dbType && r.success && !r.skipped
      );
      
      if (dbResults.length >= 2) {
        console.log(`\n${dbType.toUpperCase()}:`);
        
        const bunResults = dbResults.filter(r => r.type === "bun");
        const prismaResults = dbResults.filter(r => r.type === "prisma");
        
        if (bunResults.length > 0 && prismaResults.length > 0) {
          const bunAvg = bunResults.reduce((sum, r) => sum + r.duration, 0) / bunResults.length;
          const prismaAvg = prismaResults.reduce((sum, r) => sum + r.duration, 0) / prismaResults.length;
          const speedup = prismaAvg / bunAvg;
          
          console.log(`  🚀 Bun Adapter: ${bunAvg.toFixed(2)}ms average`);
          console.log(`  🔷 Prisma Adapter: ${prismaAvg.toFixed(2)}ms average`);
          
          if (speedup > 1) {
            console.log(`  📈 Bun is ${speedup.toFixed(2)}x faster`);
            databaseSummaryLines.push(`${dbType.toUpperCase()}:`);
            databaseSummaryLines.push(`  Bun average: ${bunAvg.toFixed(2)}ms`);
            databaseSummaryLines.push(`  Traditional average: ${prismaAvg.toFixed(2)}ms`);
            databaseSummaryLines.push(`  Winner: Bun (${speedup.toFixed(2)}x faster)`);
          } else {
            const inverse = (1 / speedup).toFixed(2);
            console.log(`  📉 Prisma is ${inverse}x faster`);
            databaseSummaryLines.push(`${dbType.toUpperCase()}:`);
            databaseSummaryLines.push(`  Bun average: ${bunAvg.toFixed(2)}ms`);
            databaseSummaryLines.push(`  Traditional average: ${prismaAvg.toFixed(2)}ms`);
            databaseSummaryLines.push(`  Winner: Traditional (${inverse}x faster)`);
          }
        }
      }
    });
  } else {
    console.log("\n⚠️  No direct comparisons available (need both Bun and Prisma adapters for same database)");
    
    // Show individual results if available
    const successfulResults = allResults.filter(r => r.success && !r.skipped);
    if (successfulResults.length > 0) {
      console.log("\n📊 Individual Adapter Performance:");
      successfulResults.forEach(result => {
        const typeIcon = result.type === "bun" ? "🚀" : "🔷";
        console.log(`  ${typeIcon} ${result.adapter}: ${result.duration.toFixed(2)}ms average`);
      });
      
      const grouped = new Map<string, TestResult[]>();
      successfulResults.forEach(result => {
        const key = result.provider.toUpperCase();
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(result);
      });
      
      grouped.forEach((providerResults, provider) => {
        const bun = providerResults.filter(r => r.type === "bun");
        const prisma = providerResults.filter(r => r.type === "prisma");
        if (bun.length === 0 && prisma.length === 0) return;
        
        databaseSummaryLines.push(`${provider}:`);
        if (bun.length > 0) {
          const bunAvg = bun.reduce((sum, r) => sum + r.duration, 0) / bun.length;
          databaseSummaryLines.push(`  Bun average: ${bunAvg.toFixed(2)}ms`);
        }
        if (prisma.length > 0) {
          const prismaAvg = prisma.reduce((sum, r) => sum + r.duration, 0) / prisma.length;
          databaseSummaryLines.push(`  Traditional average: ${prismaAvg.toFixed(2)}ms`);
        }
      });
    }
  }

  // Summary
  console.log("\n📊 Summary:");
  console.log("===========");
  
  const bunAdapters = availabilityResults.filter(r => r.type === "bun");
  const prismaAdapters = availabilityResults.filter(r => r.type === "prisma");
  
  console.log(`Bun Adapters: ${bunAdapters.filter(r => r.available).length}/${bunAdapters.length} available`);
  console.log(`Prisma Adapters: ${prismaAdapters.filter(r => r.available).length}/${prismaAdapters.length} available`);
  
  console.log("\n🎯 Key Differences:");
  console.log("==================");
  console.log("🚀 Bun Adapters:");
  console.log("  • Use Bun's native SQL clients");
  console.log("  • Optimized for Bun runtime");
  console.log("  • Template string caching");
  console.log("  • Unified base implementation");
  
  console.log("\n🔷 Prisma Adapters:");
  console.log("  • Use traditional Node.js drivers");
  console.log("  • Mature ecosystem");
  console.log("  • Broader compatibility");
  console.log("  • Official Prisma support");
  
  const availableAdapters = availabilityResults.filter(r => r.available);
  
  if (availableAdapters.length < availabilityResults.length) {
    console.log("\n💡 To test more adapters:");
    console.log("   • Setup databases: bun run setup:dbs");
    console.log("   • Install dependencies: bun install");
    console.log("   • Set environment variables for existing databases");
  }
  
  if (availableAdapters.length > 0) {
    console.log(`\n✅ Successfully tested ${availableAdapters.length} adapter(s)`);
    if (availableAdapters.length === 1 && availableAdapters[0].adapter.includes("SQLite")) {
      console.log("💡 For more comprehensive comparisons, setup PostgreSQL/MySQL databases");
    }
  }

  const executedResults = allResults.filter((r) => !r.skipped);
  const passedResults = executedResults.filter((r) => r.success);
  const failedResults = executedResults.length - passedResults.length;
  const skippedResults = allResults.length - executedResults.length;

  const bunAvailability = availabilityResults.filter((r) => r.type === "bun");
  const prismaAvailability = availabilityResults.filter((r) => r.type === "prisma");

  const bunExecuted = executedResults.filter((r) => r.type === "bun");
  const prismaExecuted = executedResults.filter((r) => r.type === "prisma");

  const bunPassCount = bunExecuted.filter((r) => r.success).length;
  const prismaPassCount = prismaExecuted.filter((r) => r.success).length;

  let overallWinner: "bun" | "prisma" | "tie" | undefined;
  let differencePct: number | undefined;
  let overallLine = "Overall winner: Not enough data";

  if (bunExecuted.length > 0 && prismaExecuted.length > 0) {
    const bunAvgDuration =
      bunExecuted.reduce((sum, r) => sum + r.duration, 0) / bunExecuted.length;
    const prismaAvgDuration =
      prismaExecuted.reduce((sum, r) => sum + r.duration, 0) / prismaExecuted.length;

    if (Math.abs(bunAvgDuration - prismaAvgDuration) < 1e-6) {
      overallWinner = "tie";
      differencePct = 0;
      overallLine = "Overall winner: Tie (0.00% difference)";
    } else if (bunAvgDuration < prismaAvgDuration && prismaAvgDuration > 0) {
      overallWinner = "bun";
      differencePct = ((prismaAvgDuration - bunAvgDuration) / prismaAvgDuration) * 100;
      overallLine = `Overall winner: Bun adapters (${differencePct.toFixed(2)}% faster)`;
    } else if (bunAvgDuration > prismaAvgDuration && bunAvgDuration > 0) {
      overallWinner = "prisma";
      differencePct = ((bunAvgDuration - prismaAvgDuration) / bunAvgDuration) * 100;
      overallLine = `Overall winner: Prisma adapters (${differencePct.toFixed(2)}% faster)`;
    } else {
      overallWinner = "tie";
      differencePct = 0;
      overallLine = "Overall winner: Tie (insufficient data for percentage)";
    }
  }

  const summaryText = [
    `Adapters available: ${availableCount}/${totalCount} (Bun ${bunAvailability.filter(r => r.available).length}/${bunAvailability.length}, Prisma ${prismaAvailability.filter(r => r.available).length}/${prismaAvailability.length})`,
    `Results: ${passedResults.length} passed, ${failedResults} failed, ${skippedResults} skipped across ${testSuites.length} suites`,
    `Direct comparisons: ${hasComparisons ? "completed" : "insufficient adapters"}`,
    bunExecuted.length > 0
      ? `Bun pass rate: ${bunPassCount}/${bunExecuted.length}`
      : "Bun adapters not exercised",
    prismaExecuted.length > 0
      ? `Prisma pass rate: ${prismaPassCount}/${prismaExecuted.length}`
      : "Prisma adapters not exercised",
    overallLine,
    ...databaseSummaryLines,
  ].join("\n");

  return {
    summary: summaryText,
    availability: availabilityResults,
    results: allResults,
    overallWinner,
    differencePct,
  };
}

// Run the tests
// @ts-ignore -- import.meta.main is only available in ESM runtimes like Bun/Node 18+.
if (import.meta.main) {
  runAllTests()
    .then(() => {
      // Ensure Bun/Node exit even if underlying clients keep handles alive
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { runAllTests };
