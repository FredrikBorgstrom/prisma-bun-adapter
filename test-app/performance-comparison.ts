import { BunPostgresAdapter, BunMySQLAdapter, BunSQLiteAdapter, BunPostgresOptimized } from "../src/index.js";
import { databases as testDatabases } from "./setup-test-dbs.ts";
import { createSqlJsDriverAdapter } from "./lib/sqljs-traditional-adapter.ts";

// Summary: Compare Bun-native adapters to traditional drivers through uniform performance benchmarks across supported databases.

const POSTGRES_URL = testDatabases.find((d) => d.name === "PostgreSQL")!.connectionString;
const MYSQL_URL = testDatabases.find((d) => d.name === "MySQL")!.connectionString;

interface BenchmarkResult {
  adapter: string;
  type: "bun" | "traditional";
  provider: string;
  operations: number;
  totalTime: number;
  avgTime: number;
  opsPerSecond: number;
  success: boolean;
  error?: string;
}

interface AdapterConfig {
  name: string;
  type: "bun" | "traditional";
  provider: string;
  createAdapter: () => Promise<any>;
  connectionString?: string;
}

interface PerformanceComparisonSummary {
  summary: string;
  availability: Array<{ adapter: string; type: "bun" | "traditional"; available: boolean }>;
  results: BenchmarkResult[];
  overallWinner?: "bun" | "traditional" | "tie";
  differencePct?: number;
}

// Traditional Node.js adapters for comparison
async function createTraditionalAdapters(): Promise<AdapterConfig[]> {
  const adapters: AdapterConfig[] = [];

  // PostgreSQL with pg
  try {
    const { Pool } = await import("pg");
    adapters.push({
      name: "Traditional PostgreSQL (pg)",
      type: "traditional",
      provider: "postgresql",
      connectionString: POSTGRES_URL,
      createAdapter: async function() {
        const pool = new Pool({ 
          connectionString: this.connectionString,
          max: 5
        });
        return {
          query: async (sql: string, params: any[] = []) => {
            const client = await pool.connect();
            try {
              const result = await client.query(sql, params);
              return result.rows;
            } finally {
              client.release();
            }
          },
          close: () => pool.end()
        };
      }
    });
  } catch (error) {
    console.log("⚠️  pg not available for PostgreSQL comparison");
  }

  // MySQL with mysql2
  try {
    const mysql = await import("mysql2/promise");
    adapters.push({
      name: "Traditional MySQL (mysql2)",
      type: "traditional", 
      provider: "mysql",
      connectionString: MYSQL_URL,
      createAdapter: async function() {
        const pool = mysql.createPool({
          uri: this.connectionString,
          connectionLimit: 5
        });
        return {
          query: async (sql: string, params: any[] = []) => {
            const [rows] = await pool.execute(sql, params);
            return rows;
          },
          close: () => pool.end()
        };
      }
    });
  } catch (error) {
    console.log("⚠️  mysql2 not available for MySQL comparison");
  }

  // SQLite baseline using sql.js (pure WASM, runs inside Bun without native bindings)
  adapters.push({
    name: "Traditional SQLite (sql.js)",
    type: "traditional",
    provider: "sqlite",
    createAdapter: async function() {
      const driver = await createSqlJsDriverAdapter(":memory:");
      return {
        query: async (sql: string, params: any[] = []) => {
          const result = await driver.query(sql, params);
          return Array.isArray(result) ? result : [];
        },
        close: () => driver.close()
      };
    }
  });

  return adapters;
}

async function createBunAdapters(): Promise<AdapterConfig[]> {
  return [
    {
      name: "Bun PostgreSQL",
      type: "bun",
      provider: "postgresql",
      connectionString: POSTGRES_URL,
      createAdapter: async function() {
        const adapter = new BunPostgresAdapter(this.connectionString!);
        const driverAdapter = await adapter.connect();
        return {
          query: async (sql: string, params: any[] = []) => {
            const result = await driverAdapter.queryRaw({ sql, args: params });
            return result.rows;
          },
          execute: async (sql: string, params: any[] = []) => {
            return await driverAdapter.executeRaw({ sql, args: params });
          },
          close: () => driverAdapter.dispose()
        };
      }
    },
    {
      name: "Bun MySQL",
      type: "bun",
      provider: "mysql",
      connectionString: MYSQL_URL,
      createAdapter: async function() {
        const adapter = new BunMySQLAdapter(this.connectionString!);
        const driverAdapter = await adapter.connect();
        return {
          query: async (sql: string, params: any[] = []) => {
            const result = await driverAdapter.queryRaw({ sql, args: params });
            return result.rows;
          },
          execute: async (sql: string, params: any[] = []) => {
            return await driverAdapter.executeRaw({ sql, args: params });
          },
          close: () => driverAdapter.dispose()
        };
      }
    },
    {
      name: "Bun SQLite",
      type: "bun",
      provider: "sqlite",
      createAdapter: async function() {
        const adapter = new BunSQLiteAdapter(":memory:");
        const driverAdapter = await adapter.connect();
        return {
          query: async (sql: string, params: any[] = []) => {
            const result = await driverAdapter.queryRaw({ sql, args: params });
            return result.rows;
          },
          execute: async (sql: string, params: any[] = []) => {
            return await driverAdapter.executeRaw({ sql, args: params });
          },
          close: () => driverAdapter.dispose()
        };
      }
    },
    {
      name: "Bun PostgreSQL (Optimized)",
      type: "bun",
      provider: "postgresql",
      connectionString: POSTGRES_URL,
      createAdapter: async function() {
        const adapter = new BunPostgresOptimized(this.connectionString!);
        const driverAdapter = await adapter.connect();
        return {
          query: async (sql: string, params: any[] = []) => {
            const result = await driverAdapter.queryRaw({ sql, args: params });
            return result.rows;
          },
          execute: async (sql: string, params: any[] = []) => {
            return await driverAdapter.executeRaw({ sql, args: params });
          },
          close: () => driverAdapter.dispose()
        };
      }
    }
  ];
}

async function checkAdapterAvailability(config: AdapterConfig): Promise<boolean> {
  try {
    const adapter = await config.createAdapter();
    await adapter.query("SELECT 1");
    await adapter.close();
    return true;
  } catch (error) {
    return false;
  }
}

async function runBenchmark(config: AdapterConfig, operations: number = 100): Promise<BenchmarkResult> {
  try {
    const adapter = await config.createAdapter();
    
    // Warm up
    await adapter.query("SELECT 1");
    
    const startTime = performance.now();
    
    // Run benchmark operations
    const promises = [];
    const isPostgres = config.provider === "postgresql";
    const param = isPostgres ? "$1" : "?";
    const benchmarkSql = `SELECT ${param} as iteration`;
    for (let i = 0; i < operations; i++) {
      promises.push(adapter.query(benchmarkSql, [i]));
    }
    
    await Promise.all(promises);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / operations;
    const opsPerSecond = (operations / totalTime) * 1000;
    
    await adapter.close();
    
    return {
      adapter: config.name,
      type: config.type,
      provider: config.provider,
      operations,
      totalTime,
      avgTime,
      opsPerSecond,
      success: true
    };
  } catch (error) {
    const isPostgres = config.provider === "postgresql";
    const param = isPostgres ? "$1" : "?";
    const failingSql = `SELECT ${param} as iteration`;
    return {
      adapter: config.name,
      type: config.type,
      provider: config.provider,
      operations: 0,
      totalTime: 0,
      avgTime: 0,
      opsPerSecond: 0,
      success: false,
      error: error instanceof Error
        ? `${error.message} | SQL: ${failingSql}`
        : String(error)
    };
  }
}

async function main(): Promise<PerformanceComparisonSummary> {
  console.log("🚀 Bun vs Traditional Adapter Performance Comparison\n");
  
  const bunAdapters = await createBunAdapters();
  const traditionalAdapters = await createTraditionalAdapters();
  const allAdapters = [...bunAdapters, ...traditionalAdapters];
  
  // Check availability
  console.log("🔍 Checking adapter availability...");
  const availabilityResults = await Promise.all(
    allAdapters.map(async (config) => {
      const available = await checkAdapterAvailability(config);
      const icon = available ? "✅" : "❌";
      const typeIcon = config.type === "bun" ? "🚀" : "🔧";
      console.log(`  ${icon} ${typeIcon} ${config.name}: ${available ? "Available" : "Not available"}`);
      return { config, available };
    })
  );

  const availabilitySummary = availabilityResults.map(({ config, available }) => ({
    adapter: config.name,
    type: config.type,
    available,
  }));
  
  const availableAdapters = availabilityResults
    .filter(r => r.available)
    .map(r => r.config);
  
  if (availableAdapters.length === 0) {
    console.log("\n❌ No adapters available for testing");
    console.log("💡 Setup databases with: bun run setup:dbs");
    return {
      summary: "No adapters available for benchmarking. Run database setup before executing this suite.",
      availability: availabilitySummary,
      results: [],
      overallWinner: "tie",
      differencePct: 0,
    };
  }
  
  console.log(`\n📊 Running performance benchmarks (100 operations each)...\n`);
  
  // Run benchmarks
  const results = await Promise.all(
    availableAdapters.map(config => runBenchmark(config, 100))
  );
  
  // Display results
  console.log("📈 Benchmark Results:");
  console.log("====================");
  
  results.forEach(result => {
    if (result.success) {
      const typeIcon = result.type === "bun" ? "🚀" : "🔧";
      console.log(`${typeIcon} ${result.adapter}:`);
      console.log(`   Total time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`   Avg per op: ${result.avgTime.toFixed(2)}ms`);
      console.log(`   Ops/second: ${result.opsPerSecond.toFixed(0)}`);
    } else {
      console.log(`❌ ${result.adapter}: ${result.error}`);
    }
    console.log();
  });
  
  // Performance comparison by database type
  console.log("⚡ Performance Comparison by Database:");
  console.log("====================================");
  
  const providers = ["postgresql", "mysql", "sqlite"];
  
  const databaseSummaryLines: string[] = [];

  providers.forEach(provider => {
    const providerResults = results.filter(r => 
      r.provider === provider && r.success
    );
    
    if (providerResults.length >= 2) {
      console.log(`\n${provider.toUpperCase()}:`);
      
      const bunResult = providerResults.find(r => r.type === "bun");
      const traditionalResult = providerResults.find(r => r.type === "traditional");
      
      if (bunResult && traditionalResult) {
        const speedupOps = bunResult.opsPerSecond / traditionalResult.opsPerSecond;
        const speedupTime = traditionalResult.avgTime / bunResult.avgTime;
        
        console.log(`  🚀 Bun: ${bunResult.opsPerSecond.toFixed(0)} ops/sec (${bunResult.avgTime.toFixed(2)}ms avg)`);
        console.log(`  🔧 Traditional: ${traditionalResult.opsPerSecond.toFixed(0)} ops/sec (${traditionalResult.avgTime.toFixed(2)}ms avg)`);
        
        if (speedupOps > 1) {
          console.log(`  📈 Bun is ${speedupOps.toFixed(2)}x faster (${speedupTime.toFixed(2)}x speedup)`);
        } else {
          console.log(`  📉 Traditional is ${(1/speedupOps).toFixed(2)}x faster`);
        }

        const sectionLines = [
          `Bun: ${bunResult.opsPerSecond.toFixed(0)} ops/sec (${bunResult.avgTime.toFixed(2)}ms avg)`,
          `Traditional: ${traditionalResult.opsPerSecond.toFixed(0)} ops/sec (${traditionalResult.avgTime.toFixed(2)}ms avg)`,
          speedupOps > 1
            ? `Winner: Bun (${speedupOps.toFixed(2)}x faster)`
            : `Winner: Traditional (${(1/speedupOps).toFixed(2)}x faster)`
        ];
        databaseSummaryLines.push(`${provider.toUpperCase()}:`);
        sectionLines.forEach(line => databaseSummaryLines.push(`  ${line}`));
      }
      
      // Sort by performance
      providerResults
        .sort((a, b) => b.opsPerSecond - a.opsPerSecond)
        .forEach((result, index) => {
          const medal = index === 0 ? "🥇" : "🥈";
          const typeIcon = result.type === "bun" ? "🚀" : "🔧";
          console.log(`  ${medal} ${typeIcon} ${result.adapter}: ${result.opsPerSecond.toFixed(0)} ops/sec`);
        });
    } else if (providerResults.length === 1) {
      console.log(`\n${provider.toUpperCase()}: Only one adapter available`);
      const result = providerResults[0];
      const typeIcon = result.type === "bun" ? "🚀" : "🔧";
      console.log(`  ${typeIcon} ${result.adapter}: ${result.opsPerSecond.toFixed(0)} ops/sec`);
    }
  });
  
  // Summary
  console.log("\n🎯 Summary:");
  console.log("===========");
  
  const successfulResults = results.filter(r => r.success);
  const bunResults = successfulResults.filter(r => r.type === "bun");
  const traditionalResults = successfulResults.filter(r => r.type === "traditional");
  
  const bunAvgOps =
    bunResults.length > 0
      ? bunResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / bunResults.length
      : 0;
  const traditionalAvgOps =
    traditionalResults.length > 0
      ? traditionalResults.reduce((sum, r) => sum + r.opsPerSecond, 0) / traditionalResults.length
      : 0;

  if (bunResults.length > 0 && traditionalResults.length > 0) {
    console.log(`🚀 Bun adapters average: ${bunAvgOps.toFixed(0)} ops/sec`);
    console.log(`🔧 Traditional adapters average: ${traditionalAvgOps.toFixed(0)} ops/sec`);
    
    if (bunAvgOps > traditionalAvgOps) {
      console.log(`📈 Bun adapters are ${(bunAvgOps / traditionalAvgOps).toFixed(2)}x faster on average`);
    } else {
      console.log(`📉 Traditional adapters are ${(traditionalAvgOps / bunAvgOps).toFixed(2)}x faster on average`);
    }
  }
  
  console.log(`\n✅ Tested ${successfulResults.length} adapters successfully`);
  console.log(`❌ ${results.length - successfulResults.length} adapters failed`);
  
  if (availableAdapters.length < allAdapters.length) {
    console.log("\n💡 To test more adapters:");
    console.log("  bun run setup:dbs  # Setup PostgreSQL and MySQL");
    console.log("  bun install        # Install optional dependencies");
  }
  const successCount = successfulResults.length;
  const failureCount = results.length - successCount;

  const fastestAdapter = [...successfulResults]
    .sort((a, b) => b.opsPerSecond - a.opsPerSecond)[0];

  const summaryLines = [
    `Adapters benchmarked: ${availableAdapters.length}/${allAdapters.length}`,
    `Results: ${successCount} succeeded, ${failureCount} failed`,
    fastestAdapter
      ? `Fastest adapter: ${fastestAdapter.adapter} (${fastestAdapter.opsPerSecond.toFixed(0)} ops/sec)`
      : "No successful benchmark results",
  ];

  if (bunResults.length > 0) {
    summaryLines.push(`Bun average: ${bunAvgOps.toFixed(0)} ops/sec`);
  }

  if (traditionalResults.length > 0) {
    summaryLines.push(`Traditional average: ${traditionalAvgOps.toFixed(0)} ops/sec`);
  }

  summaryLines.push(...databaseSummaryLines);

  let overallWinner: "bun" | "traditional" | "tie" | undefined;
  let differencePct: number | undefined;

  if (bunResults.length > 0 && traditionalResults.length > 0) {
    const diff = bunAvgOps - traditionalAvgOps;
    if (Math.abs(diff) < 1e-6) {
      overallWinner = "tie";
      differencePct = 0;
      summaryLines.push("Overall winner: Tie (0.00% difference)");
    } else if (bunAvgOps > traditionalAvgOps && traditionalAvgOps > 0) {
      overallWinner = "bun";
      differencePct = ((bunAvgOps - traditionalAvgOps) / traditionalAvgOps) * 100;
      summaryLines.push(`Overall winner: Bun adapters (+${differencePct.toFixed(2)}% ops/sec)`);
    } else if (bunAvgOps < traditionalAvgOps && bunAvgOps > 0) {
      overallWinner = "traditional";
      differencePct = ((traditionalAvgOps - bunAvgOps) / bunAvgOps) * 100;
      summaryLines.push(`Overall winner: Traditional adapters (+${differencePct.toFixed(2)}% ops/sec)`);
    } else {
      overallWinner = "tie";
      differencePct = 0;
      summaryLines.push("Overall winner: Tie (insufficient data for percentage)");
    }
  } else {
    summaryLines.push("Overall winner: Not enough data for comparison");
  }

  return {
    summary: summaryLines.join("\n"),
    availability: availabilitySummary,
    results,
    overallWinner,
    differencePct,
  };
}

if (import.meta.main) {
  main().catch(console.error);
}

export { main as runPerformanceComparison };
