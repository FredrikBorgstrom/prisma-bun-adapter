import { createAdapter, type AdapterConfig } from "./lib/db-adapters";

// Summary: Measure connection pooling efficiency and stability under increasing concurrent load using shared adapter helpers.

class ConnectionEfficiencyTest {
  private async timeOperation<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    return { result, duration };
  }

  async runConnectionEfficiencyTest(): Promise<void> {
    console.log("🔌 CONNECTION EFFICIENCY & CONCURRENCY TEST");
    console.log("=".repeat(60));
    console.log("Testing connection management under concurrent load");

    // Test different concurrency levels to find the breaking point
    const concurrencyLevels = [5, 10, 15, 20];
    
    for (const concurrency of concurrencyLevels) {
      console.log(`\n📊 Testing ${concurrency}x Concurrent Queries`);
      console.log("-".repeat(50));
      
      // Test BunPostgresAdapter
      console.log(`🚀 BunPostgresAdapter (${concurrency}x concurrent):`);
      let bunAdapter: AdapterConfig | null = null;
      
      try {
        bunAdapter = createAdapter("bun");
        
        const { duration: bunTime } = await this.timeOperation(async () => {
          const promises = Array.from({ length: concurrency }, () =>
            bunAdapter!.prisma.user.findMany({ take: 2 })
          );
          return await Promise.all(promises);
        });
        
        console.log(`  ✅ Success: ${bunTime.toFixed(2)}ms`);
        await bunAdapter.dispose();
        
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        if (bunAdapter) await bunAdapter.dispose();
      }
      
      // Test PrismaPg
      console.log(`📦 PrismaPg (${concurrency}x concurrent):`);
      let prismaPgAdapter: AdapterConfig | null = null;
      
      try {
        prismaPgAdapter = createAdapter("prisma-pg");
        
        const { duration: pgTime } = await this.timeOperation(async () => {
          const promises = Array.from({ length: concurrency }, () =>
            prismaPgAdapter!.prisma.user.findMany({ take: 2 })
          );
          return await Promise.all(promises);
        });
        
        console.log(`  ✅ Success: ${pgTime.toFixed(2)}ms`);
        await prismaPgAdapter.dispose();
        
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        if (prismaPgAdapter) await prismaPgAdapter.dispose();
      }
      
      // Small delay between tests to let connections clean up
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test the working concurrency level in detail
    console.log("\n🎯 DETAILED PERFORMANCE AT SAFE CONCURRENCY LEVEL");
    console.log("=".repeat(60));
    
    await this.runDetailedComparison(5); // Use a safe concurrency level
  }
  
  private async runDetailedComparison(concurrency: number): Promise<void> {
    console.log(`Testing ${concurrency}x concurrent operations in detail:`);
    
    const tests = [
      {
        name: "Simple Queries",
        operation: (prisma: any) => prisma.user.findMany({ take: 3 })
      },
      {
        name: "Count Queries", 
        operation: (prisma: any) => prisma.user.count()
      },
      {
        name: "Raw Queries",
        operation: (prisma: any) => prisma.$queryRaw`SELECT COUNT(*) FROM users`
      },
      {
        name: "Relation Queries",
        operation: (prisma: any) => prisma.user.findMany({ 
          include: { profile: true }, 
          take: 2 
        })
      }
    ];
    
    for (const test of tests) {
      console.log(`\n📊 ${test.name} (${concurrency}x concurrent):`);
      
      // Test BunPostgresAdapter
      let bunAdapter: AdapterConfig | null = null;
      let bunTime = 0;
      let bunSuccess = false;
      
      try {
        bunAdapter = createAdapter("bun");
        
        const { duration } = await this.timeOperation(async () => {
          const promises = Array.from({ length: concurrency }, () => test.operation(bunAdapter!.prisma));
          return await Promise.all(promises);
        });
        
        bunTime = duration;
        bunSuccess = true;
        console.log(`  🚀 BunAdapter: ${bunTime.toFixed(2)}ms ✅`);
        await bunAdapter.dispose();
        
      } catch (error) {
        console.log(`  🚀 BunAdapter: Failed - ${error.message} ❌`);
        if (bunAdapter) await bunAdapter.dispose();
      }
      
      // Test PrismaPg
      let prismaPgAdapter: AdapterConfig | null = null;
      let pgTime = 0;
      let pgSuccess = false;
      
      try {
        prismaPgAdapter = createAdapter("prisma-pg");
        
        const { duration } = await this.timeOperation(async () => {
          const promises = Array.from({ length: concurrency }, () => test.operation(prismaPgAdapter!.prisma));
          return await Promise.all(promises);
        });
        
        pgTime = duration;
        pgSuccess = true;
        console.log(`  📦 PrismaPg:  ${pgTime.toFixed(2)}ms ✅`);
        await prismaPgAdapter.dispose();
        
      } catch (error) {
        console.log(`  📦 PrismaPg:  Failed - ${error.message} ❌`);
        if (prismaPgAdapter) await prismaPgAdapter.dispose();
      }
      
      // Compare results
      if (bunSuccess && pgSuccess) {
        const winner = bunTime < pgTime ? "BunAdapter" : "PrismaPg";
        const improvement = Math.abs(((bunTime - pgTime) / Math.max(bunTime, pgTime)) * 100);
        console.log(`  🏆 Winner: ${winner} (+${improvement.toFixed(1)}%)`);
      } else if (bunSuccess && !pgSuccess) {
        console.log(`  🏆 Winner: BunAdapter (PrismaPg failed)`);
      } else if (!bunSuccess && pgSuccess) {
        console.log(`  🏆 Winner: PrismaPg (BunAdapter failed)`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("\n💡 KEY INSIGHTS:");
    console.log("   - Connection management efficiency varies between adapters");
    console.log("   - Native implementations may handle concurrency differently");
    console.log("   - Database connection limits affect real-world performance");
    console.log("   - Single-connection adapters may be more efficient for some workloads");
  }
}

async function main() {
  const test = new ConnectionEfficiencyTest();
  await test.runConnectionEfficiencyTest();
}

main();
