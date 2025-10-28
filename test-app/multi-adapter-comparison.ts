import { BunPostgresAdapter, BunMySQLAdapter, BunSQLiteAdapter, BunPostgresOptimized } from "../src/index.js";
import { databases as testDatabases } from "./setup-test-dbs.ts";

// Summary: Compare Bun adapters across PostgreSQL, MySQL, and SQLite with CRUD, transactions, and availability checks.

const POSTGRES_URL = testDatabases.find((d) => d.name === "PostgreSQL")!.connectionString;
const MYSQL_URL = testDatabases.find((d) => d.name === "MySQL")!.connectionString;

interface TestResult {
  adapter: string;
  provider: string;
  success: boolean;
  duration: number;
  error?: string;
  rowCount?: number;
  skipped?: boolean;
  connectionAvailable?: boolean;
}

interface AdapterConfig {
  name: string;
  adapter: any;
  connectionString: string;
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

interface AdapterRunSummary {
  summary: string;
  availability: Array<{ adapter: string; available: boolean }>;
  adapters: Array<{
    adapter: string;
    successRate: string;
    avgDuration: string;
    status: string;
    available: boolean;
  }>;
  results: TestResult[];
}

// Connection availability cache
const connectionCache = new Map<string, { available: boolean; error?: string }>();

const adapters: AdapterConfig[] = [
  {
    name: "PostgreSQL",
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
    name: "PostgreSQL (Optimized)",
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
    name: "MySQL",
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
    name: "SQLite",
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

// Check if a database connection is available
async function checkConnection(adapterConfig: AdapterConfig): Promise<{ available: boolean; error?: string }> {
  const cacheKey = `${adapterConfig.name}-${adapterConfig.connectionString}`;
  
  if (connectionCache.has(cacheKey)) {
    return connectionCache.get(cacheKey)!;
  }

  try {
    const adapter = new adapterConfig.adapter(adapterConfig.connectionString);
    const driverAdapter = await adapter.connect();
    
    // Try a simple query to verify connection
    await driverAdapter.queryRaw({ sql: adapterConfig.testQueries.simple, args: [] });
    await driverAdapter.dispose();
    
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
  testFn: (driverAdapter: any) => Promise<any>
): Promise<TestResult> {
  const startTime = performance.now();
  
  // Check connection availability first
  const connectionStatus = await checkConnection(adapterConfig);
  
  if (!connectionStatus.available) {
    const duration = performance.now() - startTime;
    return {
      adapter: adapterConfig.name,
      provider: adapterConfig.adapter.prototype?.provider || "unknown",
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
      const result = await testFn(driverAdapter);
      const duration = performance.now() - startTime;
      
      return {
        adapter: adapterConfig.name,
        provider: adapter.provider,
        success: true,
        duration,
        rowCount: result?.rows?.length || result?.affectedRows || result,
        connectionAvailable: true,
      };
    } finally {
      await driverAdapter.dispose();
    }
  } catch (error) {
    const duration = performance.now() - startTime;
    return {
      adapter: adapterConfig.name,
      provider: adapterConfig.adapter.prototype?.provider || "unknown",
      success: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
      connectionAvailable: true,
    };
  }
}

async function runAllTests(): Promise<AdapterRunSummary> {
  console.log("🚀 Starting Multi-Adapter Comparison Tests\n");
  
  // First, check which databases are available
  console.log("🔍 Checking database availability...");
  const availabilityResults = await Promise.all(
    adapters.map(async (adapterConfig) => {
      const status = await checkConnection(adapterConfig);
      const icon = status.available ? "✅" : "❌";
      const message = status.available ? "Available" : `Not available: ${status.error}`;
      console.log(`  ${icon} ${adapterConfig.name}: ${message}`);
      return { adapter: adapterConfig.name, available: status.available };
    })
  );
  console.log();
  
  const testSuites = [
    {
      name: "Simple Query Test",
      test: async (driverAdapter: any, queries: any) => {
        return await driverAdapter.queryRaw({ sql: queries.simple, args: [] });
      },
    },
    {
      name: "Parameterized Query Test", 
      test: async (driverAdapter: any, queries: any) => {
        return await driverAdapter.queryRaw(queries.parameterized);
      },
    },
    {
      name: "Table Creation Test",
      test: async (driverAdapter: any, queries: any) => {
        return await driverAdapter.executeRaw({ sql: queries.create, args: [] });
      },
    },
    {
      name: "Insert Test",
      test: async (driverAdapter: any, queries: any) => {
        // First ensure table exists
        await driverAdapter.executeRaw({ sql: queries.create, args: [] });
        return await driverAdapter.executeRaw(queries.insert);
      },
    },
    {
      name: "Select Test",
      test: async (driverAdapter: any, queries: any) => {
        // Ensure table exists and has data
        await driverAdapter.executeRaw({ sql: queries.create, args: [] });
        await driverAdapter.executeRaw(queries.insert);
        return await driverAdapter.queryRaw({ sql: queries.select, args: [] });
      },
    },
    {
      name: "Update Test",
      test: async (driverAdapter: any, queries: any) => {
        // Ensure table exists and has data
        await driverAdapter.executeRaw({ sql: queries.create, args: [] });
        await driverAdapter.executeRaw(queries.insert);
        return await driverAdapter.executeRaw(queries.update);
      },
    },
    {
      name: "Transaction Test",
      test: async (driverAdapter: any, queries: any) => {
        await driverAdapter.executeRaw({ sql: queries.create, args: [] });
        
        const tx = await driverAdapter.startTransaction();
        try {
          await tx.executeRaw(queries.insert);
          await tx.executeRaw(queries.update);
          await tx.commit();
          return { success: true };
        } catch (error) {
          await tx.rollback();
          throw error;
        }
      },
    },
    {
      name: "Cleanup Test",
      test: async (driverAdapter: any, queries: any) => {
        return await driverAdapter.executeRaw({ sql: queries.drop, args: [] });
      },
    },
  ];

  const allResults: TestResult[] = [];

  for (const testSuite of testSuites) {
    console.log(`📋 Running ${testSuite.name}...`);
    
    const results = await Promise.all(
      adapters.map(adapterConfig =>
        runTest(adapterConfig, testSuite.name, (driverAdapter) =>
          testSuite.test(driverAdapter, adapterConfig.testQueries)
        )
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
      
      const duration = `${result.duration.toFixed(2)}ms`;
      const extra = result.rowCount !== undefined ? ` (${result.rowCount} rows)` : "";
      const error = result.error && !result.skipped ? ` - ${result.error}` : "";
      const skipped = result.skipped ? " (skipped - database not available)" : "";
      
      console.log(`  ${status} ${result.adapter}: ${duration}${extra}${error}${skipped}`);
    });
    
    console.log();
  }

  // Summary
  console.log("📊 Test Summary:");
  console.log("================");
  
  const summary = adapters.map(adapterConfig => {
    const adapterResults = allResults.filter(r => r.adapter === adapterConfig.name);
    const successCount = adapterResults.filter(r => r.success).length;
    const skippedCount = adapterResults.filter(r => r.skipped).length;
    const totalCount = adapterResults.length;
    const availableTests = totalCount - skippedCount;
    const avgDuration = adapterResults.reduce((sum, r) => sum + r.duration, 0) / totalCount;
    
    let status: string;
    if (skippedCount === totalCount) {
      status = "⏭️"; // All skipped
    } else if (successCount === availableTests) {
      status = "✅"; // All available tests passed
    } else {
      status = "⚠️"; // Some failures
    }
    
    const rateDisplay = skippedCount > 0 
      ? `${successCount}/${availableTests} (${skippedCount} skipped)`
      : `${successCount}/${totalCount}`;
    
    return {
      adapter: adapterConfig.name,
      successRate: rateDisplay,
      avgDuration: `${avgDuration.toFixed(2)}ms`,
      status,
      available: availableTests > 0,
    };
  });

  summary.forEach(s => {
    console.log(`${s.status} ${s.adapter}: ${s.successRate} tests passed, avg ${s.avgDuration}`);
  });

  // Performance comparison (only for available databases)
  const availableAdapters = summary.filter(s => s.available);
  
  if (availableAdapters.length > 1) {
    console.log("\n⚡ Performance Comparison:");
    console.log("=========================");
    
    const performanceTests = testSuites.filter(t => 
      t.name.includes("Simple") || t.name.includes("Parameterized") || t.name.includes("Insert")
    );
    
    performanceTests.forEach(testSuite => {
      console.log(`\n${testSuite.name}:`);
      const testResults = allResults.filter(r => 
        r.success && !r.skipped
      );
      
      if (testResults.length > 0) {
        testResults
          .sort((a, b) => a.duration - b.duration)
          .forEach((result, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
            console.log(`  ${medal} ${result.adapter}: ${result.duration.toFixed(2)}ms`);
          });
      } else {
        console.log("  No successful tests to compare");
      }
    });
  } else {
    console.log("\n⚡ Performance Comparison:");
    console.log("=========================");
    console.log("Need at least 2 available databases for performance comparison");
  }

  console.log("\n🎯 Conclusion:");
  console.log("==============");
  
  const availableCount = availabilityResults.filter(r => r.available).length;
  const totalCount = availabilityResults.length;
  
  console.log(`Database Availability: ${availableCount}/${totalCount} databases available for testing`);
  
  if (availableCount === 0) {
    console.log("\n⚠️  No databases were available for testing.");
    console.log("To test PostgreSQL: Set TEST_POSTGRES_URL environment variable");
    console.log("To test MySQL: Set TEST_MYSQL_URL environment variable");
    console.log("SQLite: Works out of the box with in-memory database");
  } else {
    console.log("\nAll adapters share the same base implementation, providing:");
    console.log("• Consistent API across PostgreSQL, MySQL, and SQLite");
    console.log("• Optimized query execution with template string caching");
    console.log("• Transaction support (with database-specific limitations)");
    console.log("• Proper parameter placeholder handling for each database type");
    console.log("• Unified error handling and connection management");
    
    if (availableCount < totalCount) {
      console.log("\n💡 To test all adapters:");
      availabilityResults.forEach(result => {
        if (!result.available) {
          const envVar = result.adapter === "PostgreSQL" ? "TEST_POSTGRES_URL" : 
                        result.adapter === "MySQL" ? "TEST_MYSQL_URL" : "";
          if (envVar) {
            console.log(`• Set ${envVar} environment variable for ${result.adapter}`);
          }
        }
      });
    }
  }

  const executedResults = allResults.filter((r) => !r.skipped);
  const passedResults = executedResults.filter((r) => r.success);
  const failedResults = executedResults.length - passedResults.length;
  const skippedResults = allResults.length - executedResults.length;

  const unavailableAdapters = availabilityResults
    .filter((r) => !r.available)
    .map((r) => r.adapter);

  const summaryLines = summary.map(
    (s) => `${s.adapter}: ${s.successRate} tests passed, avg ${s.avgDuration}`
  );

  const summaryText = [
    `Adapters available: ${availableCount}/${totalCount}`,
    `Results: ${passedResults.length} passed, ${failedResults} failed, ${skippedResults} skipped`,
    unavailableAdapters.length > 0
      ? `Unavailable adapters: ${unavailableAdapters.join(", ")}`
      : "All adapters available",
    availableAdapters.length > 1
      ? "Performance comparison executed"
      : "Performance comparison skipped (need at least 2 available adapters)",
    ...summaryLines.map((line) => `• ${line}`),
  ].join("\n");

  return {
    summary: summaryText,
    availability: availabilityResults,
    adapters: summary,
    results: allResults,
  };
}

// Run the tests
if (import.meta.main) {
  runAllTests().catch(console.error);
}

export { runAllTests, adapters, TestResult };
