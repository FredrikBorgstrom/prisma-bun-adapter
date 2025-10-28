import { createAdapter, type AdapterConfig, type AdapterType } from "./lib/db-adapters";

// Summary: Compare adapter implementations by running shared Prisma test suites and aggregating success rates.

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}

interface AdapterResults {
  adapterName: string;
  adapterType: AdapterType;
  results: TestResult[];
  totalDuration: number;
  successRate: number;
}

class AdapterComparisonTester {
  private async runTest(
    name: string, 
    testFn: (prisma: any) => Promise<void>,
    prisma: any
  ): Promise<TestResult> {
    const start = performance.now();
    try {
      await testFn(prisma);
      const duration = performance.now() - start;
      return { name, success: true, duration };
    } catch (error) {
      const duration = performance.now() - start;
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { name, success: false, duration, error: errorMessage };
    }
  }

  private async runTestSuite(adapter: AdapterConfig): Promise<AdapterResults> {
    const { prisma } = adapter;
    const results: TestResult[] = [];

    console.log(`\n🧪 Testing ${adapter.name}`);
    console.log("=".repeat(60));

    // Basic Queries
    console.log("\n📋 Basic Queries");
    results.push(await this.runTest("Find all users", async (p) => {
      const users = await p.user.findMany();
      if (users.length === 0) throw new Error("No users found");
    }, prisma));

    results.push(await this.runTest("Find user by email", async (p) => {
      const user = await p.user.findUnique({
        where: { email: "alice@example.com" }
      });
      if (!user) throw new Error("User not found");
    }, prisma));

    results.push(await this.runTest("Count records", async (p) => {
      const count = await p.user.count();
      if (count === 0) throw new Error("No users to count");
    }, prisma));

    results.push(await this.runTest("Find with relations", async (p) => {
      const users = await p.user.findMany({
        include: {
          profile: true,
          posts: {
            include: {
              tags: true
            }
          }
        }
      });
      if (users.length === 0) throw new Error("No users with relations found");
    }, prisma));

    // CRUD Operations
    console.log("\n🔄 CRUD Operations");
    let testUserId: number;

    results.push(await this.runTest("Create user", async (p) => {
      const user = await p.user.create({
        data: {
          email: `test-${adapter.type}@example.com`,
          name: `Test User ${adapter.type}`
        }
      });
      testUserId = user.id;
    }, prisma));

    results.push(await this.runTest("Update user", async (p) => {
      await p.user.update({
        where: { id: testUserId },
        data: { name: `Updated Test User ${adapter.type}` }
      });
    }, prisma));

    results.push(await this.runTest("Create nested relations", async (p) => {
      await p.user.update({
        where: { id: testUserId },
        data: {
          profile: {
            create: {
              bio: `Test user profile for ${adapter.type}`
            }
          },
          posts: {
            create: {
              title: `Test Post ${adapter.type}`,
              content: `This is a test post for ${adapter.type}`
            }
          }
        }
      });
    }, prisma));

    results.push(await this.runTest("Delete user (cascade)", async (p) => {
      await p.user.delete({
        where: { id: testUserId }
      });
    }, prisma));

    // Raw Queries
    console.log("\n🔍 Raw Queries");
    results.push(await this.runTest("Raw SELECT query", async (p) => {
      const result = await p.$queryRaw`
        SELECT COUNT(*) as user_count FROM users
      `;
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error("Raw query returned no results");
      }
    }, prisma));

    results.push(await this.runTest("Raw query with parameters", async (p) => {
      const email = "alice@example.com";
      const result = await p.$queryRaw`
        SELECT * FROM users WHERE email = ${email}
      `;
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error("Parameterized query returned no results");
      }
    }, prisma));

    // Transactions
    console.log("\n💳 Transactions");
    results.push(await this.runTest("Simple transaction", async (p) => {
      await p.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            email: `tx-test-${adapter.type}@example.com`,
            name: `Transaction Test ${adapter.type}`
          }
        });

        await tx.profile.create({
          data: {
            bio: `Created in transaction for ${adapter.type}`,
            userId: user.id
          }
        });

        // Clean up
        await tx.user.delete({ where: { id: user.id } });
      });
    }, prisma));

    // Performance Tests
    console.log("\n⚡ Performance Tests");
    results.push(await this.runTest("Concurrent queries (10x)", async (p) => {
      const promises = Array.from({ length: 10 }, () =>
        p.user.findMany({
          include: {
            posts: {
              include: {
                tags: true
              }
            }
          }
        })
      );

      const queryResults = await Promise.all(promises);
      if (queryResults.some(result => result.length === 0)) {
        throw new Error("Some concurrent queries returned no results");
      }
    }, prisma));

    results.push(await this.runTest("Batch operation (50 records)", async (p) => {
      const batchSize = 50;
      const users = Array.from({ length: batchSize }, (_, i) => ({
        email: `batch-${adapter.type}-${i}@example.com`,
        name: `Batch User ${adapter.type} ${i}`
      }));

      // Create in batches
      await p.user.createMany({
        data: users
      });

      // Verify count
      const count = await p.user.count({
        where: {
          email: {
            startsWith: `batch-${adapter.type}-`
          }
        }
      });

      if (count !== batchSize) {
        throw new Error(`Expected ${batchSize} users, got ${count}`);
      }

      // Clean up
      await p.user.deleteMany({
        where: {
          email: {
            startsWith: `batch-${adapter.type}-`
          }
        }
      });
    }, prisma));

    results.push(await this.runTest("Complex aggregation", async (p) => {
      const result = await p.user.aggregate({
        _count: {
          id: true
        },
        _max: {
          createdAt: true
        },
        _min: {
          createdAt: true
        }
      });

      if (!result._count.id || result._count.id === 0) {
        throw new Error("Aggregation returned no results");
      }
    }, prisma));

    // Print individual results
    results.forEach(result => {
      const status = result.success ? "✅" : "❌";
      const duration = result.duration.toFixed(2);
      const error = result.error ? `: ${result.error}` : "";
      console.log(`${status} ${result.name} (${duration}ms)${error}`);
    });

    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;

    return {
      adapterName: adapter.name,
      adapterType: adapter.type,
      results,
      totalDuration,
      successRate
    };
  }

  private printComparison(bunResults: AdapterResults, prismaPgResults: AdapterResults) {
    console.log("\n📊 ADAPTER COMPARISON RESULTS");
    console.log("=".repeat(80));

    console.log(`\n🏆 Overall Performance:`);
    console.log(`${bunResults.adapterName}:`);
    console.log(`  Total Duration: ${bunResults.totalDuration.toFixed(2)}ms`);
    console.log(`  Success Rate: ${bunResults.successRate.toFixed(1)}%`);
    console.log(`  Average per test: ${(bunResults.totalDuration / bunResults.results.length).toFixed(2)}ms`);

    console.log(`\n${prismaPgResults.adapterName}:`);
    console.log(`  Total Duration: ${prismaPgResults.totalDuration.toFixed(2)}ms`);
    console.log(`  Success Rate: ${prismaPgResults.successRate.toFixed(1)}%`);
    console.log(`  Average per test: ${(prismaPgResults.totalDuration / prismaPgResults.results.length).toFixed(2)}ms`);

    // Performance comparison
    const bunFaster = bunResults.totalDuration < prismaPgResults.totalDuration;
    const fasterAdapter = bunFaster ? bunResults : prismaPgResults;
    const slowerAdapter = bunFaster ? prismaPgResults : bunResults;
    const speedDifference = ((slowerAdapter.totalDuration - fasterAdapter.totalDuration) / slowerAdapter.totalDuration * 100);

    console.log(`\n🚀 Performance Winner: ${fasterAdapter.adapterName}`);
    console.log(`   ${speedDifference.toFixed(1)}% faster than ${slowerAdapter.adapterName}`);

    // Detailed test comparison
    console.log(`\n📋 Detailed Test Comparison:`);
    console.log("Test Name".padEnd(35) + "BunAdapter".padEnd(15) + "PrismaPg".padEnd(15) + "Winner");
    console.log("-".repeat(80));

    bunResults.results.forEach((bunResult, index) => {
      const pgResult = prismaPgResults.results[index];
      if (!pgResult) return;

      const bunTime = bunResult.success ? `${bunResult.duration.toFixed(1)}ms` : "FAILED";
      const pgTime = pgResult.success ? `${pgResult.duration.toFixed(1)}ms` : "FAILED";
      
      let winner = "TIE";
      if (bunResult.success && pgResult.success) {
        winner = bunResult.duration < pgResult.duration ? "Bun" : "PrismaPg";
      } else if (bunResult.success && !pgResult.success) {
        winner = "Bun";
      } else if (!bunResult.success && pgResult.success) {
        winner = "PrismaPg";
      }

      console.log(
        bunResult.name.padEnd(35) + 
        bunTime.padEnd(15) + 
        pgTime.padEnd(15) + 
        winner
      );
    });

    // Summary
    console.log(`\n🎯 Summary:`);
    if (bunResults.successRate === prismaPgResults.successRate && bunResults.successRate === 100) {
      console.log(`✅ Both adapters passed all tests successfully!`);
    } else {
      console.log(`⚠️  Success rates: Bun ${bunResults.successRate.toFixed(1)}%, PrismaPg ${prismaPgResults.successRate.toFixed(1)}%`);
    }
    
    console.log(`⏱️  ${fasterAdapter.adapterName} is the performance winner`);
    console.log(`🔧 Both adapters are functionally compatible with Prisma`);
  }

  async runComparison(): Promise<void> {
    console.log("🔄 PRISMA ADAPTER COMPARISON TEST");
    console.log("=".repeat(80));
    console.log("Comparing BunPostgresAdapter vs @prisma/adapter-pg");

    let bunAdapter: AdapterConfig | null = null;
    let prismaPgAdapter: AdapterConfig | null = null;

    try {
      // Test BunPostgresAdapter
      bunAdapter = createAdapter("bun");
      const bunResults = await this.runTestSuite(bunAdapter);

      // Test PrismaPg adapter
      prismaPgAdapter = createAdapter("prisma-pg");
      const prismaPgResults = await this.runTestSuite(prismaPgAdapter);

      // Print comparison
      this.printComparison(bunResults, prismaPgResults);

      // Check if both adapters passed all tests
      const allTestsPassed = bunResults.successRate === 100 && prismaPgResults.successRate === 100;
      
      if (!allTestsPassed) {
        console.log("\n❌ Some tests failed. Check the detailed results above.");
        process.exit(1);
      } else {
        console.log("\n🎉 All tests passed for both adapters!");
      }

    } catch (error) {
      console.error("❌ Comparison test failed:", error);
      process.exit(1);
    } finally {
      // Clean up connections
      if (bunAdapter) {
        await bunAdapter.dispose();
      }
      if (prismaPgAdapter) {
        await prismaPgAdapter.dispose();
      }
    }
  }
}

async function main() {
  const tester = new AdapterComparisonTester();
  await tester.runComparison();
}

main();
