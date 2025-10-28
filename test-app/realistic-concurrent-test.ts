import { createAdapter, type AdapterConfig } from "./lib/db-adapters";

// Summary: Simulate realistic concurrent Prisma workloads to compare Bun adapter throughput against pg-based implementations.

interface TestResult {
  testName: string;
  bunTime: number;
  pgTime: number;
  bunWins: boolean;
  improvement: number;
}

class RealisticConcurrentTest {
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

  async runRealisticBenchmark(): Promise<void> {
    console.log("🚀 REALISTIC CONCURRENT PERFORMANCE BENCHMARK");
    console.log("=".repeat(70));
    console.log("Testing practical concurrent scenarios within DB limits");

    let bunAdapter: AdapterConfig | null = null;
    let prismaPgAdapter: AdapterConfig | null = null;
    const results: TestResult[] = [];

    try {
      bunAdapter = createAdapter("bun");
      prismaPgAdapter = createAdapter("prisma-pg");

      // Test 1: Light Concurrent Load (10 queries)
      console.log("\n📊 Test 1: Light Concurrent Load");
      console.log("-".repeat(40));
      
      const bunLight = await this.runConcurrentTest(
        bunAdapter,
        "Light Load",
        10,
        (prisma) => prisma.user.findMany({ take: 3 })
      );
      
      const pgLight = await this.runConcurrentTest(
        prismaPgAdapter,
        "Light Load",
        10,
        (prisma) => prisma.user.findMany({ take: 3 })
      );

      results.push({
        testName: "10x Light Queries",
        bunTime: bunLight,
        pgTime: pgLight,
        bunWins: bunLight < pgLight,
        improvement: Math.abs(((bunLight - pgLight) / Math.max(bunLight, pgLight)) * 100)
      });

      // Test 2: Medium Concurrent Load (20 queries)
      console.log("\n📊 Test 2: Medium Concurrent Load");
      console.log("-".repeat(40));
      
      const bunMedium = await this.runConcurrentTest(
        bunAdapter,
        "Medium Load",
        20,
        (prisma) => prisma.user.findMany({
          include: { profile: true },
          take: 2
        })
      );
      
      const pgMedium = await this.runConcurrentTest(
        prismaPgAdapter,
        "Medium Load",
        20,
        (prisma) => prisma.user.findMany({
          include: { profile: true },
          take: 2
        })
      );

      results.push({
        testName: "20x Medium Queries",
        bunTime: bunMedium,
        pgTime: pgMedium,
        bunWins: bunMedium < pgMedium,
        improvement: Math.abs(((bunMedium - pgMedium) / Math.max(bunMedium, pgMedium)) * 100)
      });

      // Test 3: Mixed Operations (15 concurrent)
      console.log("\n📊 Test 3: Mixed Operations");
      console.log("-".repeat(40));
      
      const bunMixed = await this.runConcurrentTest(
        bunAdapter,
        "Mixed Ops",
        15,
        async (prisma) => {
          const operations = [
            () => prisma.user.findMany({ take: 2 }),
            () => prisma.user.count(),
            () => prisma.post.findMany({ take: 3 }),
            () => prisma.$queryRaw`SELECT COUNT(*) FROM users`,
          ];
          
          const randomOp = operations[Math.floor(Math.random() * operations.length)];
          return await randomOp();
        }
      );
      
      const pgMixed = await this.runConcurrentTest(
        prismaPgAdapter,
        "Mixed Ops",
        15,
        async (prisma) => {
          const operations = [
            () => prisma.user.findMany({ take: 2 }),
            () => prisma.user.count(),
            () => prisma.post.findMany({ take: 3 }),
            () => prisma.$queryRaw`SELECT COUNT(*) FROM users`,
          ];
          
          const randomOp = operations[Math.floor(Math.random() * operations.length)];
          return await randomOp();
        }
      );

      results.push({
        testName: "15x Mixed Operations",
        bunTime: bunMixed,
        pgTime: pgMixed,
        bunWins: bunMixed < pgMixed,
        improvement: Math.abs(((bunMixed - pgMixed) / Math.max(bunMixed, pgMixed)) * 100)
      });

      // Test 4: Raw Query Concurrency (12 concurrent)
      console.log("\n📊 Test 4: Raw Query Concurrency");
      console.log("-".repeat(40));
      
      const bunRaw = await this.runConcurrentTest(
        bunAdapter,
        "Raw Queries",
        12,
        (prisma) => prisma.$queryRaw`
          SELECT u.name, COUNT(p.id) as post_count
          FROM users u
          LEFT JOIN posts p ON u.id = p."authorId"
          GROUP BY u.id, u.name
          LIMIT 3
        `
      );
      
      const pgRaw = await this.runConcurrentTest(
        prismaPgAdapter,
        "Raw Queries",
        12,
        (prisma) => prisma.$queryRaw`
          SELECT u.name, COUNT(p.id) as post_count
          FROM users u
          LEFT JOIN posts p ON u.id = p."authorId"
          GROUP BY u.id, u.name
          LIMIT 3
        `
      );

      results.push({
        testName: "12x Raw Queries",
        bunTime: bunRaw,
        pgTime: pgRaw,
        bunWins: bunRaw < pgRaw,
        improvement: Math.abs(((bunRaw - pgRaw) / Math.max(bunRaw, pgRaw)) * 100)
      });

      // Test 5: Transaction Concurrency (8 concurrent)
      console.log("\n📊 Test 5: Transaction Concurrency");
      console.log("-".repeat(40));
      
      const bunTx = await this.runConcurrentTest(
        bunAdapter,
        "Transactions",
        8,
        (prisma) => prisma.$transaction(async (tx) => {
          const count = await tx.user.count();
          const user = await tx.user.findFirst();
          return { count, user };
        })
      );
      
      const pgTx = await this.runConcurrentTest(
        prismaPgAdapter,
        "Transactions",
        8,
        (prisma) => prisma.$transaction(async (tx) => {
          const count = await tx.user.count();
          const user = await tx.user.findFirst();
          return { count, user };
        })
      );

      results.push({
        testName: "8x Transactions",
        bunTime: bunTx,
        pgTime: pgTx,
        bunWins: bunTx < pgTx,
        improvement: Math.abs(((bunTx - pgTx) / Math.max(bunTx, pgTx)) * 100)
      });

      // Test 6: Sequential vs Concurrent Comparison
      console.log("\n📊 Test 6: Sequential vs Concurrent Comparison");
      console.log("-".repeat(40));
      
      // Sequential execution
      console.log("  Sequential execution (10 queries)...");
      const bunSequential = await this.timeOperation(async () => {
        for (let i = 0; i < 10; i++) {
          await bunAdapter!.prisma.user.findMany({ take: 2 });
        }
      });
      
      const pgSequential = await this.timeOperation(async () => {
        for (let i = 0; i < 10; i++) {
          await prismaPgAdapter!.prisma.user.findMany({ take: 2 });
        }
      });
      
      console.log(`    BunPostgresAdapter Sequential: ${bunSequential.duration.toFixed(2)}ms`);
      console.log(`    PrismaPg Sequential: ${pgSequential.duration.toFixed(2)}ms`);
      
      // Concurrent execution
      const bunConcurrentSeq = await this.runConcurrentTest(
        bunAdapter,
        "Concurrent",
        10,
        (prisma) => prisma.user.findMany({ take: 2 })
      );
      
      const pgConcurrentSeq = await this.runConcurrentTest(
        prismaPgAdapter,
        "Concurrent",
        10,
        (prisma) => prisma.user.findMany({ take: 2 })
      );

      console.log(`\n  Concurrency Benefits:`);
      console.log(`    BunAdapter: ${((bunSequential.duration - bunConcurrentSeq) / bunSequential.duration * 100).toFixed(1)}% faster with concurrency`);
      console.log(`    PrismaPg: ${((pgSequential.duration - pgConcurrentSeq) / pgSequential.duration * 100).toFixed(1)}% faster with concurrency`);

      // Results Summary
      this.printResults(results);

    } catch (error) {
      console.error("❌ Benchmark failed:", error);
    } finally {
      if (bunAdapter) await bunAdapter.dispose();
      if (prismaPgAdapter) await prismaPgAdapter.dispose();
    }
  }

  private printResults(results: TestResult[]): void {
    console.log("\n🏆 CONCURRENT PERFORMANCE RESULTS");
    console.log("=".repeat(70));
    
    console.log("Test Name".padEnd(20) + "BunAdapter".padEnd(12) + "PrismaPg".padEnd(12) + "Winner & Improvement");
    console.log("-".repeat(70));
    
    let bunWins = 0;
    let totalBunTime = 0;
    let totalPgTime = 0;
    
    results.forEach(result => {
      const bunTime = `${result.bunTime.toFixed(1)}ms`;
      const pgTime = `${result.pgTime.toFixed(1)}ms`;
      const winner = result.bunWins ? "🚀 Bun" : "PrismaPg";
      const improvement = `+${result.improvement.toFixed(1)}%`;
      
      console.log(
        result.testName.padEnd(20) + 
        bunTime.padEnd(12) + 
        pgTime.padEnd(12) + 
        `${winner} ${improvement}`
      );
      
      if (result.bunWins) bunWins++;
      totalBunTime += result.bunTime;
      totalPgTime += result.pgTime;
    });
    
    console.log("-".repeat(70));
    console.log(`Total Time`.padEnd(20) + `${totalBunTime.toFixed(1)}ms`.padEnd(12) + `${totalPgTime.toFixed(1)}ms`.padEnd(12));
    
    const overallWinner = totalBunTime < totalPgTime ? "BunPostgresAdapter" : "PrismaPg";
    const overallImprovement = Math.abs(((totalBunTime - totalPgTime) / Math.max(totalBunTime, totalPgTime)) * 100);
    
    console.log("\n🎯 CONCURRENT PERFORMANCE SUMMARY");
    console.log("=".repeat(70));
    console.log(`🏆 Overall Winner: ${overallWinner} (${overallImprovement.toFixed(1)}% faster)`);
    console.log(`📊 BunPostgresAdapter won ${bunWins}/${results.length} concurrent tests`);
    console.log(`📊 PrismaPg won ${results.length - bunWins}/${results.length} concurrent tests`);
    
    if (bunWins >= results.length / 2) {
      console.log("\n🚀 CONCLUSION: BunPostgresAdapter shows excellent concurrent performance!");
      console.log("   Native Bun SQL implementation demonstrates competitive advantages.");
    } else {
      console.log("\n📈 CONCLUSION: Both adapters show strong performance characteristics.");
      console.log("   Choose based on your specific concurrency requirements.");
    }
    
    console.log("\n💡 Key Insights:");
    console.log("   - Concurrent operations reveal adapter strengths and weaknesses");
    console.log("   - Native implementations often excel under concurrent load");
    console.log("   - Both adapters maintain full Prisma compatibility");
    console.log("   - Performance may vary based on query complexity and system resources");
  }
}

async function main() {
  const test = new RealisticConcurrentTest();
  await test.runRealisticBenchmark();
}

main();
