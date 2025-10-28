import { createAdapter, type AdapterConfig } from "./lib/db-adapters";

// Summary: Benchmark concurrent query throughput comparing Bun adapter to Prisma/pg under simultaneous workloads.

interface ConcurrentTestResult {
  testName: string;
  bunTime: number;
  pgTime: number;
  bunWins: boolean;
  improvement: number;
}

class ConcurrentBenchmark {
  private async timeOperation<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    return { result, duration };
  }

  private async runConcurrentTest(
    adapter: AdapterConfig,
    testName: string,
    concurrency: number,
    operation: (prisma: any) => Promise<any>
  ): Promise<number> {
    console.log(`  ${testName} (${concurrency}x concurrent)...`);
    
    const { duration } = await this.timeOperation(async () => {
      const promises = Array.from({ length: concurrency }, () => operation(adapter.prisma));
      return await Promise.all(promises);
    });
    
    console.log(`    ${adapter.name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  async runComprehensiveBenchmark(): Promise<void> {
    console.log("🚀 COMPREHENSIVE CONCURRENT PERFORMANCE BENCHMARK");
    console.log("=".repeat(80));
    console.log("Testing Bun's native SQL performance vs Node.js pg driver");

    let bunAdapter: AdapterConfig | null = null;
    let prismaPgAdapter: AdapterConfig | null = null;
    const results: ConcurrentTestResult[] = [];

    try {
      bunAdapter = createAdapter("bun");
      prismaPgAdapter = createAdapter("prisma-pg");

      // Test 1: Concurrent Simple Queries
      console.log("\n📊 Test 1: Concurrent Simple Queries");
      console.log("-".repeat(50));
      
      const bunSimple = await this.runConcurrentTest(
        bunAdapter,
        "Simple SELECT",
        50,
        (prisma) => prisma.user.findMany({ take: 5 })
      );
      
      const pgSimple = await this.runConcurrentTest(
        prismaPgAdapter,
        "Simple SELECT",
        50,
        (prisma) => prisma.user.findMany({ take: 5 })
      );

      results.push({
        testName: "50x Simple SELECT",
        bunTime: bunSimple,
        pgTime: pgSimple,
        bunWins: bunSimple < pgSimple,
        improvement: Math.abs(((bunSimple - pgSimple) / Math.max(bunSimple, pgSimple)) * 100)
      });

      // Test 2: Concurrent Complex Queries
      console.log("\n📊 Test 2: Concurrent Complex Queries");
      console.log("-".repeat(50));
      
      const bunComplex = await this.runConcurrentTest(
        bunAdapter,
        "Complex Relations",
        25,
        (prisma) => prisma.user.findMany({
          include: {
            profile: true,
            posts: {
              include: {
                tags: true
              }
            }
          },
          take: 3
        })
      );
      
      const pgComplex = await this.runConcurrentTest(
        prismaPgAdapter,
        "Complex Relations",
        25,
        (prisma) => prisma.user.findMany({
          include: {
            profile: true,
            posts: {
              include: {
                tags: true
              }
            }
          },
          take: 3
        })
      );

      results.push({
        testName: "25x Complex Relations",
        bunTime: bunComplex,
        pgTime: pgComplex,
        bunWins: bunComplex < pgComplex,
        improvement: Math.abs(((bunComplex - pgComplex) / Math.max(bunComplex, pgComplex)) * 100)
      });

      // Test 3: Concurrent Raw Queries
      console.log("\n📊 Test 3: Concurrent Raw Queries");
      console.log("-".repeat(50));
      
      const bunRaw = await this.runConcurrentTest(
        bunAdapter,
        "Raw SQL",
        30,
        (prisma) => prisma.$queryRaw`
          SELECT u.name, COUNT(p.id) as post_count
          FROM users u
          LEFT JOIN posts p ON u.id = p."authorId"
          GROUP BY u.id, u.name
          LIMIT 5
        `
      );
      
      const pgRaw = await this.runConcurrentTest(
        prismaPgAdapter,
        "Raw SQL",
        30,
        (prisma) => prisma.$queryRaw`
          SELECT u.name, COUNT(p.id) as post_count
          FROM users u
          LEFT JOIN posts p ON u.id = p."authorId"
          GROUP BY u.id, u.name
          LIMIT 5
        `
      );

      results.push({
        testName: "30x Raw SQL",
        bunTime: bunRaw,
        pgTime: pgRaw,
        bunWins: bunRaw < pgRaw,
        improvement: Math.abs(((bunRaw - pgRaw) / Math.max(bunRaw, pgRaw)) * 100)
      });

      // Test 4: Mixed Concurrent Operations
      console.log("\n📊 Test 4: Mixed Concurrent Operations");
      console.log("-".repeat(50));
      
      const bunMixed = await this.runConcurrentTest(
        bunAdapter,
        "Mixed Operations",
        20,
        async (prisma) => {
          const operations = [
            () => prisma.user.findMany({ take: 2 }),
            () => prisma.user.count(),
            () => prisma.$queryRaw`SELECT COUNT(*) FROM posts`,
            () => prisma.user.findFirst({ include: { profile: true } }),
            () => prisma.post.findMany({ take: 3, include: { author: true } })
          ];
          
          // Pick a random operation
          const randomOp = operations[Math.floor(Math.random() * operations.length)];
          return await randomOp();
        }
      );
      
      const pgMixed = await this.runConcurrentTest(
        prismaPgAdapter,
        "Mixed Operations",
        20,
        async (prisma) => {
          const operations = [
            () => prisma.user.findMany({ take: 2 }),
            () => prisma.user.count(),
            () => prisma.$queryRaw`SELECT COUNT(*) FROM posts`,
            () => prisma.user.findFirst({ include: { profile: true } }),
            () => prisma.post.findMany({ take: 3, include: { author: true } })
          ];
          
          // Pick a random operation
          const randomOp = operations[Math.floor(Math.random() * operations.length)];
          return await randomOp();
        }
      );

      results.push({
        testName: "20x Mixed Operations",
        bunTime: bunMixed,
        pgTime: pgMixed,
        bunWins: bunMixed < pgMixed,
        improvement: Math.abs(((bunMixed - pgMixed) / Math.max(bunMixed, pgMixed)) * 100)
      });

      // Test 5: High Concurrency Stress Test
      console.log("\n📊 Test 5: High Concurrency Stress Test");
      console.log("-".repeat(50));
      
      const bunStress = await this.runConcurrentTest(
        bunAdapter,
        "Stress Test",
        100,
        (prisma) => prisma.user.findFirst()
      );
      
      const pgStress = await this.runConcurrentTest(
        prismaPgAdapter,
        "Stress Test",
        100,
        (prisma) => prisma.user.findFirst()
      );

      results.push({
        testName: "100x Stress Test",
        bunTime: bunStress,
        pgTime: pgStress,
        bunWins: bunStress < pgStress,
        improvement: Math.abs(((bunStress - pgStress) / Math.max(bunStress, pgStress)) * 100)
      });

      // Test 6: Concurrent Transactions
      console.log("\n📊 Test 6: Concurrent Transactions");
      console.log("-".repeat(50));
      
      const bunTx = await this.runConcurrentTest(
        bunAdapter,
        "Transactions",
        15,
        (prisma) => prisma.$transaction(async (tx) => {
          const count = await tx.user.count();
          const user = await tx.user.findFirst();
          return { count, user };
        })
      );
      
      const pgTx = await this.runConcurrentTest(
        prismaPgAdapter,
        "Transactions",
        15,
        (prisma) => prisma.$transaction(async (tx) => {
          const count = await tx.user.count();
          const user = await tx.user.findFirst();
          return { count, user };
        })
      );

      results.push({
        testName: "15x Transactions",
        bunTime: bunTx,
        pgTime: pgTx,
        bunWins: bunTx < pgTx,
        improvement: Math.abs(((bunTx - pgTx) / Math.max(bunTx, pgTx)) * 100)
      });

      // Results Summary
      this.printResults(results);

    } catch (error) {
      console.error("❌ Benchmark failed:", error);
    } finally {
      if (bunAdapter) await bunAdapter.dispose();
      if (prismaPgAdapter) await prismaPgAdapter.dispose();
    }
  }

  private printResults(results: ConcurrentTestResult[]): void {
    console.log("\n🏆 CONCURRENT PERFORMANCE RESULTS");
    console.log("=".repeat(80));
    
    console.log("Test Name".padEnd(25) + "BunAdapter".padEnd(15) + "PrismaPg".padEnd(15) + "Winner & Improvement");
    console.log("-".repeat(80));
    
    let bunWins = 0;
    let totalBunTime = 0;
    let totalPgTime = 0;
    
    results.forEach(result => {
      const bunTime = `${result.bunTime.toFixed(1)}ms`;
      const pgTime = `${result.pgTime.toFixed(1)}ms`;
      const winner = result.bunWins ? "🚀 Bun" : "PrismaPg";
      const improvement = `+${result.improvement.toFixed(1)}%`;
      
      console.log(
        result.testName.padEnd(25) + 
        bunTime.padEnd(15) + 
        pgTime.padEnd(15) + 
        `${winner} ${improvement}`
      );
      
      if (result.bunWins) bunWins++;
      totalBunTime += result.bunTime;
      totalPgTime += result.pgTime;
    });
    
    console.log("-".repeat(80));
    console.log(`Total Time`.padEnd(25) + `${totalBunTime.toFixed(1)}ms`.padEnd(15) + `${totalPgTime.toFixed(1)}ms`.padEnd(15));
    
    const overallWinner = totalBunTime < totalPgTime ? "BunPostgresAdapter" : "PrismaPg";
    const overallImprovement = Math.abs(((totalBunTime - totalPgTime) / Math.max(totalBunTime, totalPgTime)) * 100);
    
    console.log("\n🎯 CONCURRENT PERFORMANCE SUMMARY");
    console.log("=".repeat(80));
    console.log(`🏆 Overall Winner: ${overallWinner} (${overallImprovement.toFixed(1)}% faster)`);
    console.log(`📊 BunPostgresAdapter won ${bunWins}/${results.length} concurrent tests`);
    console.log(`📊 PrismaPg won ${results.length - bunWins}/${results.length} concurrent tests`);
    
    if (bunWins > results.length / 2) {
      console.log("\n🚀 CONCLUSION: BunPostgresAdapter excels at concurrent operations!");
      console.log("   Native Bun SQL implementation shows superior performance under load.");
    } else if (bunWins > 0) {
      console.log("\n⚖️  CONCLUSION: Mixed results with BunPostgresAdapter showing strength in specific concurrent scenarios.");
    } else {
      console.log("\n📈 CONCLUSION: PrismaPg currently leads, but BunPostgresAdapter shows promise for optimization.");
    }
    
    console.log("\n💡 Key Insights:");
    console.log("   - Concurrent operations are where native implementations typically excel");
    console.log("   - Results may vary based on query complexity and system resources");
    console.log("   - Both adapters maintain full Prisma compatibility");
  }
}

async function main() {
  const benchmark = new ConcurrentBenchmark();
  await benchmark.runComprehensiveBenchmark();
}

main();
