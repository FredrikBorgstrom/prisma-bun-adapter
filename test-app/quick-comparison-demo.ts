import { BunSQLiteAdapter } from "../src/index.js";
import { SqlJsTraditionalClient } from "./lib/sqljs-traditional-adapter.ts";

const isJsonSummary = process.env.BUN_ADAPTER_SUMMARY_JSON === "1";
const log = (...args: any[]) => {
  if (!isJsonSummary) {
    console.log(...args);
  }
};

// Summary: Demonstrate Bun SQLite speed versus a sql.js-based fallback traditional driver.

/**
 * Quick Comparison Demo
 * Shows Bun SQLite adapter performance vs a sql.js fallback traditional approach
 * This works without any database setup and demonstrates the comparison concept
 */

interface ComparisonResult {
  name: string;
  type: "bun" | "traditional";
  operations: number;
  totalTime: number;
  avgTime: number;
  opsPerSecond: number;
}

interface QuickDemoSummary {
  summary: string;
  bun: ComparisonResult;
  traditional: ComparisonResult;
  speedup: number;
}

async function benchmarkBunAdapter(operations: number): Promise<ComparisonResult> {
  const adapter = new BunSQLiteAdapter(":memory:");
  const driverAdapter = await adapter.connect();
  
  const startTime = performance.now();
  
  for (let i = 0; i < operations; i++) {
    await driverAdapter.queryRaw({ sql: "SELECT ? as test", args: [i] });
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  await driverAdapter.dispose();
  
  return {
    name: "Bun SQLite Adapter",
    type: "bun",
    operations,
    totalTime,
    avgTime: totalTime / operations,
    opsPerSecond: (operations / totalTime) * 1000
  };
}

async function benchmarkTraditionalAdapter(operations: number): Promise<ComparisonResult> {
  const adapter = new SqlJsTraditionalClient(":memory:");
  
  const startTime = performance.now();
  
  for (let i = 0; i < operations; i++) {
    await adapter.query("SELECT ? as test", [i]);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  await adapter.close();
  
  return {
    name: "Traditional SQLite (sql.js)",
    type: "traditional",
    operations,
    totalTime,
    avgTime: totalTime / operations,
    opsPerSecond: (operations / totalTime) * 1000
  };
}

async function main(): Promise<QuickDemoSummary> {
  log("🚀 Quick Adapter Comparison Demo");
  log("================================\n");
  
  log("This demo shows the performance difference between:");
  log("🚀 Bun's native SQLite adapter");
  log("🔧 sql.js (WASM) fallback for traditional drivers\n");
  
  const operations = 5000;
  log(`📊 Running ${operations} operations with each adapter...\n`);
  
  // Run benchmarks
  log("⏳ Testing Bun adapter...");
  const bunResult = await benchmarkBunAdapter(operations);
  
  log("⏳ Testing traditional adapter...");
  const traditionalResult = await benchmarkTraditionalAdapter(operations);
  
  // Display results
  log("\n📈 Results:");
  log("===========");
  
  [bunResult, traditionalResult].forEach(result => {
    const icon = result.type === "bun" ? "🚀" : "🔧";
    log(`\n${icon} ${result.name}:`);
    log(`   Total time: ${result.totalTime.toFixed(2)}ms`);
    log(`   Avg per op: ${result.avgTime.toFixed(3)}ms`);
    log(`   Ops/second: ${result.opsPerSecond.toFixed(0)}`);
  });
  
  // Comparison
  const speedup = bunResult.opsPerSecond / traditionalResult.opsPerSecond;
  const timeImprovement = traditionalResult.avgTime / bunResult.avgTime;

  log("\n⚡ Performance Comparison:");
  log("=========================");
  
  if (speedup > 1) {
    log(`📈 Bun is ${speedup.toFixed(2)}x faster (${timeImprovement.toFixed(2)}x time improvement)`);
  } else {
    log(`📉 Traditional is ${(1/speedup).toFixed(2)}x faster`);
  }
  
  log(`\n🚀 Bun: ${bunResult.opsPerSecond.toFixed(0)} ops/sec`);
  log(`🔧 Traditional: ${traditionalResult.opsPerSecond.toFixed(0)} ops/sec`);
  
  log("\n🎯 Why Bun Adapters Are Faster:");
  log("==============================");
  log("✨ Native runtime integration");
  log("⚡ Optimized memory management");
  log("🔄 Template string caching");
  log("📦 Zero external dependencies");
  log("🛡️  Type-safe Prisma integration");
  
  log("\n💡 For real database comparisons:");
  log("   bun run setup:dbs     # Setup PostgreSQL & MySQL");
  log("   bun run test:performance  # Full performance test");

  const summaryText = [
    `Comparison operations: ${operations}`,
    `Bun: ${bunResult.opsPerSecond.toFixed(0)} ops/sec (${bunResult.avgTime.toFixed(3)}ms avg)`,
    `Traditional: ${traditionalResult.opsPerSecond.toFixed(0)} ops/sec (${traditionalResult.avgTime.toFixed(3)}ms avg)`,
    speedup > 0
      ? `Relative speed: ${speedup >= 1 ? `${speedup.toFixed(2)}x faster` : `${(1 / speedup).toFixed(2)}x slower`}`
      : "Relative speed: unavailable",
  ].join("\n");

  if (isJsonSummary) {
    const payload = {
      summary: summaryText,
      bun: bunResult,
      traditional: traditionalResult,
      speedup,
    };
    console.log(JSON.stringify(payload));
  }


  return {
    summary: summaryText,
    bun: bunResult,
    traditional: traditionalResult,
    speedup,
  };
}

if (import.meta.main) {
  main().catch(console.error);
}

export { main as runQuickDemo };
