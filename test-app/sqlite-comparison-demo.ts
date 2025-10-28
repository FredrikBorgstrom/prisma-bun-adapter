import { BunSQLiteAdapter } from "../src/index.js";
import { SqlJsTraditionalClient } from "./lib/sqljs-traditional-adapter.ts";

const isJsonSummary = process.env.BUN_ADAPTER_SUMMARY_JSON === "1";
const log = (...args: any[]) => {
  if (!isJsonSummary) {
    console.log(...args);
  }
};

// Summary: Evaluate Bun's SQLite adapter against a sql.js-based traditional fallback for queries and CRUD workloads.

/**
 * SQLite Performance Comparison Demo
 * Compares Bun's native SQLite with a sql.js (WASM) fallback traditional approach
 */

interface BenchmarkResult {
  name: string;
  operations: number;
  totalTime: number;
  avgTime: number;
  opsPerSecond: number;
}

interface SQLiteDemoSummary {
  summary: string;
  benchmarks: BenchmarkResult[];
  speedup: number;
  crudScenarios: number;
}

async function benchmarkBunSQLite(operations: number): Promise<BenchmarkResult> {
  const adapter = new BunSQLiteAdapter(":memory:");
  const driverAdapter = await adapter.connect();
  
  // Warm up
  await driverAdapter.queryRaw({ sql: "SELECT 1", args: [] });
  
  const startTime = performance.now();
  
  // Run benchmark operations sequentially to mimic real driver roundtrips
  for (let i = 0; i < operations; i++) {
    await driverAdapter.queryRaw({ sql: "SELECT ? as iteration", args: [i] });
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  await driverAdapter.dispose();
  
  return {
    name: "Bun SQLite (Native)",
    operations,
    totalTime,
    avgTime: totalTime / operations,
    opsPerSecond: (operations / totalTime) * 1000
  };
}

async function benchmarkTraditionalSQLite(operations: number): Promise<BenchmarkResult> {
  const db = new SqlJsTraditionalClient(":memory:");
  
  // Warm up
  await db.query("SELECT 1");
  
  const startTime = performance.now();
  
  // Run benchmark operations sequentially to mimic real driver roundtrips
  for (let i = 0; i < operations; i++) {
    await db.query("SELECT ? as iteration", [i]);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  await db.close();
  
  return {
    name: "Traditional SQLite (sql.js)",
    operations,
    totalTime,
    avgTime: totalTime / operations,
    opsPerSecond: (operations / totalTime) * 1000
  };
}

async function runCRUDComparison(): Promise<number> {
  log("📊 CRUD Operations Comparison:");
  log("=============================");
  
  // Test CRUD operations
  const crudTests = [
    {
      name: "Table Creation",
      sql: `CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: "Insert Operations",
      operations: async (adapter: any, isBun: boolean) => {
        const promises = [];
        for (let i = 0; i < 50; i++) {
          if (isBun) {
            promises.push(adapter.executeRaw({ 
              sql: "INSERT INTO test_table (name) VALUES (?)", 
              args: [`user_${i}`] 
            }));
          } else {
            promises.push(adapter.query("INSERT INTO test_table (name) VALUES (?)", [`user_${i}`]));
          }
        }
        await Promise.all(promises);
      }
    },
    {
      name: "Select Operations",
      operations: async (adapter: any, isBun: boolean) => {
        const promises = [];
        for (let i = 0; i < 50; i++) {
          if (isBun) {
            promises.push(adapter.queryRaw({ 
              sql: "SELECT * FROM test_table WHERE name = ?", 
              args: [`user_${i}`] 
            }));
          } else {
            promises.push(adapter.query("SELECT * FROM test_table WHERE name = ?", [`user_${i}`]));
          }
        }
        await Promise.all(promises);
      }
    }
  ];
  
  for (const test of crudTests) {
    if (test.operations) {
      log(`\n${test.name}:`);
      
      // Bun adapter
      const bunAdapter = new BunSQLiteAdapter(":memory:");
      const bunDriver = await bunAdapter.connect();
      
      // Setup table
      await bunDriver.executeRaw({ 
        sql: `CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, 
        args: [] 
      });
      
      const bunStart = performance.now();
      await test.operations(bunDriver, true);
      const bunTime = performance.now() - bunStart;
      
      await bunDriver.dispose();
      
      // Traditional adapter
      const traditionalAdapter = new SqlJsTraditionalClient(":memory:");
      await traditionalAdapter.query(`CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      const traditionalStart = performance.now();
      await test.operations(traditionalAdapter, false);
      const traditionalTime = performance.now() - traditionalStart;
      
      await traditionalAdapter.close();
      
      const speedup = traditionalTime / bunTime;
      
      log(`  🚀 Bun: ${bunTime.toFixed(2)}ms`);
      log(`  🔧 Traditional: ${traditionalTime.toFixed(2)}ms`);
      log(`  📈 Speedup: ${speedup.toFixed(2)}x`);
    }
  }

  return crudTests.length;
}

async function main(): Promise<SQLiteDemoSummary> {
  log("🗃️  SQLite Performance Comparison Demo\n");
  log("This demo compares Bun's native SQLite adapter with traditional approaches.\n");
  
  const operations = 5000;
  
  log(`📊 Running ${operations} query operations...\n`);
  
  // Run benchmarks
  const [bunResult, traditionalResult] = await Promise.all([
    benchmarkBunSQLite(operations),
    benchmarkTraditionalSQLite(operations)
  ]);
  
  // Display results
  log("📈 Benchmark Results:");
  log("====================");
  
  [bunResult, traditionalResult].forEach(result => {
    const icon = result.name.includes("Bun") ? "🚀" : "🔧";
    log(`${icon} ${result.name}:`);
    log(`   Total time: ${result.totalTime.toFixed(2)}ms`);
    log(`   Avg per op: ${result.avgTime.toFixed(3)}ms`);
    log(`   Ops/second: ${result.opsPerSecond.toFixed(0)}`);
    log();
  });
  
  // Performance comparison
  const speedup = traditionalResult.opsPerSecond > 0 ? 
    bunResult.opsPerSecond / traditionalResult.opsPerSecond : 0;
  
  log("⚡ Performance Comparison:");
  log("=========================");
  log(`🚀 Bun SQLite: ${bunResult.opsPerSecond.toFixed(0)} ops/sec`);
  log(`🔧 Traditional: ${traditionalResult.opsPerSecond.toFixed(0)} ops/sec`);
  
  if (speedup > 1) {
    log(`📈 Bun is ${speedup.toFixed(2)}x faster!`);
  } else if (speedup > 0) {
    log(`📉 Traditional is ${(1/speedup).toFixed(2)}x faster`);
  }
  
  log();
  
  // CRUD comparison
  const crudScenarioCount = await runCRUDComparison();
  
  log("\n🎯 Key Advantages of Bun SQLite Adapter:");
  log("========================================");
  log("🚀 Native Bun runtime integration");
  log("⚡ Optimized template string caching");
  log("🔄 Efficient parameter placeholder conversion");
  log("📦 No external dependencies");
  log("🛡️  Type-safe with Prisma integration");
  log("🔧 Consistent API across all database types");
  
  log("\n💡 Note: Traditional SQLite numbers use sql.js (WASM) as a safe fallback in Bun.");
  log("   Real-world performance with native Node.js drivers like better-sqlite3 will differ.");
  log("   Differences also depend on:");
  log("   • Database size and complexity");
  log("   • Query patterns and frequency");
  log("   • System resources and configuration");

  const summaryText = [
    `Benchmark operations: ${operations}`,
    `Bun SQLite: ${bunResult.opsPerSecond.toFixed(0)} ops/sec (${bunResult.avgTime.toFixed(3)}ms avg)`,
    `Traditional SQLite: ${traditionalResult.opsPerSecond.toFixed(0)} ops/sec (${traditionalResult.avgTime.toFixed(3)}ms avg)`,
    speedup > 0
      ? `Relative speed: ${speedup >= 1 ? `${speedup.toFixed(2)}x faster` : `${(1 / speedup).toFixed(2)}x slower`}`
      : "Relative speed: unavailable",
    `CRUD scenarios evaluated: ${crudScenarioCount}`,
  ].join("\n");

  if (isJsonSummary) {
    const payload = {
      summary: summaryText,
      benchmarks: [bunResult, traditionalResult],
      speedup,
      crudScenarios: crudScenarioCount,
    };
    console.log(JSON.stringify(payload));
  }

  return {
    summary: summaryText,
    benchmarks: [bunResult, traditionalResult],
    speedup,
    crudScenarios: crudScenarioCount,
  };
}

if (import.meta.main) {
  main().catch(console.error);
}

export { main as runSQLiteDemo };
