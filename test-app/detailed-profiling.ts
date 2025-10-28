import { createAdapter, type AdapterConfig } from "./lib/db-adapters";

// Summary: Profile specific query shapes to understand per-adapter latency distribution and warm-up behavior.

class DetailedProfiler {
  private async profileQuery(adapter: AdapterConfig, queryName: string, queryFn: () => Promise<any>) {
    const { prisma } = adapter;
    
    console.log(`\n🔍 Profiling: ${queryName} (${adapter.name})`);
    console.log("-".repeat(60));
    
    // Warm up
    await queryFn();
    
    const iterations = 10;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await queryFn();
      const duration = performance.now() - start;
      times.push(duration);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
    
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`Median:  ${median.toFixed(2)}ms`);
    console.log(`Min:     ${min.toFixed(2)}ms`);
    console.log(`Max:     ${max.toFixed(2)}ms`);
    console.log(`Std Dev: ${Math.sqrt(times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length).toFixed(2)}ms`);
    
    return { avg, min, max, median };
  }

  async runDetailedComparison() {
    console.log("🔬 DETAILED PERFORMANCE PROFILING");
    console.log("=".repeat(80));

    let bunAdapter: AdapterConfig | null = null;
    let prismaPgAdapter: AdapterConfig | null = null;

    try {
      bunAdapter = createAdapter("bun");
      prismaPgAdapter = createAdapter("prisma-pg");

      // Test 1: Simple SELECT
      console.log("\n📊 Test 1: Simple SELECT Query");
      const bunSimple = await this.profileQuery(bunAdapter, "Simple SELECT", async () => {
        return await bunAdapter!.prisma.user.findMany({ take: 10 });
      });

      const pgSimple = await this.profileQuery(prismaPgAdapter, "Simple SELECT", async () => {
        return await prismaPgAdapter!.prisma.user.findMany({ take: 10 });
      });

      console.log(`\n🏆 Simple SELECT Winner: ${bunSimple.avg < pgSimple.avg ? 'Bun' : 'PrismaPg'} (${Math.abs(((bunSimple.avg - pgSimple.avg) / Math.max(bunSimple.avg, pgSimple.avg)) * 100).toFixed(1)}% difference)`);

      // Test 2: Single Connection Query
      console.log("\n📊 Test 2: Single Connection Performance");
      const bunSingle = await this.profileQuery(bunAdapter, "Single Connection", async () => {
        return await bunAdapter!.prisma.$queryRaw`SELECT COUNT(*) FROM users`;
      });

      const pgSingle = await this.profileQuery(prismaPgAdapter, "Single Connection", async () => {
        return await prismaPgAdapter!.prisma.$queryRaw`SELECT COUNT(*) FROM users`;
      });

      console.log(`\n🏆 Single Connection Winner: ${bunSingle.avg < pgSingle.avg ? 'Bun' : 'PrismaPg'} (${Math.abs(((bunSingle.avg - pgSingle.avg) / Math.max(bunSingle.avg, pgSingle.avg)) * 100).toFixed(1)}% difference)`);

      // Test 3: Connection Pool Stress
      console.log("\n📊 Test 3: Connection Pool Stress Test");
      const bunPool = await this.profileQuery(bunAdapter, "Pool Stress", async () => {
        const promises = Array.from({ length: 5 }, () => 
          bunAdapter!.prisma.user.findMany({ take: 1 })
        );
        return await Promise.all(promises);
      });

      const pgPool = await this.profileQuery(prismaPgAdapter, "Pool Stress", async () => {
        const promises = Array.from({ length: 5 }, () => 
          prismaPgAdapter!.prisma.user.findMany({ take: 1 })
        );
        return await Promise.all(promises);
      });

      console.log(`\n🏆 Pool Stress Winner: ${bunPool.avg < pgPool.avg ? 'Bun' : 'PrismaPg'} (${Math.abs(((bunPool.avg - pgPool.avg) / Math.max(bunPool.avg, pgPool.avg)) * 100).toFixed(1)}% difference)`);

      // Test 4: Transaction Performance
      console.log("\n📊 Test 4: Transaction Performance");
      const bunTx = await this.profileQuery(bunAdapter, "Transaction", async () => {
        return await bunAdapter!.prisma.$transaction(async (tx) => {
          await tx.user.count();
          return await tx.user.findFirst();
        });
      });

      const pgTx = await this.profileQuery(prismaPgAdapter, "Transaction", async () => {
        return await prismaPgAdapter!.prisma.$transaction(async (tx) => {
          await tx.user.count();
          return await tx.user.findFirst();
        });
      });

      console.log(`\n🏆 Transaction Winner: ${bunTx.avg < pgTx.avg ? 'Bun' : 'PrismaPg'} (${Math.abs(((bunTx.avg - pgTx.avg) / Math.max(bunTx.avg, pgTx.avg)) * 100).toFixed(1)}% difference)`);

      // Summary
      console.log("\n📋 PERFORMANCE ANALYSIS SUMMARY");
      console.log("=".repeat(80));
      
      const tests = [
        { name: "Simple SELECT", bun: bunSimple.avg, pg: pgSimple.avg },
        { name: "Single Connection", bun: bunSingle.avg, pg: pgSingle.avg },
        { name: "Pool Stress", bun: bunPool.avg, pg: pgPool.avg },
        { name: "Transaction", bun: bunTx.avg, pg: pgTx.avg },
      ];

      let bunWins = 0;
      let pgWins = 0;

      tests.forEach(test => {
        const winner = test.bun < test.pg ? "Bun" : "PrismaPg";
        const difference = Math.abs(((test.bun - test.pg) / Math.max(test.bun, test.pg)) * 100);
        
        console.log(`${test.name.padEnd(20)}: ${winner.padEnd(10)} (+${difference.toFixed(1)}%)`);
        
        if (winner === "Bun") bunWins++;
        else pgWins++;
      });

      console.log(`\n🏆 Overall: BunAdapter won ${bunWins}/${tests.length} tests, PrismaPg won ${pgWins}/${tests.length} tests`);

      if (pgWins > bunWins) {
        console.log("\n💡 ANALYSIS: PrismaPg is consistently faster, likely due to:");
        console.log("   - More mature connection pooling implementation");
        console.log("   - Optimized query execution path");
        console.log("   - Better memory management");
        console.log("   - Native driver optimizations");
      }

    } catch (error) {
      console.error("❌ Profiling failed:", error);
    } finally {
      if (bunAdapter) await bunAdapter.dispose();
      if (prismaPgAdapter) await prismaPgAdapter.dispose();
    }
  }
}

async function main() {
  const profiler = new DetailedProfiler();
  await profiler.runDetailedComparison();
}

main();
