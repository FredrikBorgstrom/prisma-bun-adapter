import { createAdapter, type AdapterConfig } from "./lib/db-adapters";

// Summary: Provide a quick side-by-side latency check between Bun and Prisma adapters for common Prisma queries.

async function simplePerformanceTest() {
  console.log("🚀 SIMPLE PERFORMANCE COMPARISON");
  console.log("=".repeat(60));

  let bunAdapter: AdapterConfig | null = null;
  let prismaPgAdapter: AdapterConfig | null = null;

  try {
    // Test BunPostgresAdapter
    bunAdapter = createAdapter("bun");
    console.log("\n⚡ Testing BunPostgresAdapter");
    console.log("-".repeat(40));

    let start = performance.now();
    await bunAdapter.prisma.user.findMany();
    const bunFindAll = performance.now() - start;
    console.log(`Find All Users: ${bunFindAll.toFixed(2)}ms`);

    start = performance.now();
    await bunAdapter.prisma.user.findMany({
      include: {
        profile: true,
        posts: {
          include: {
            tags: true,
          },
        },
      },
    });
    const bunRelations = performance.now() - start;
    console.log(`Complex Relations: ${bunRelations.toFixed(2)}ms`);

    start = performance.now();
    const promises = Array.from({ length: 10 }, () =>
      bunAdapter!.prisma.user.findMany({ take: 5 })
    );
    await Promise.all(promises);
    const bunConcurrent = performance.now() - start;
    console.log(`10 Concurrent Queries: ${bunConcurrent.toFixed(2)}ms`);

    start = performance.now();
    await bunAdapter.prisma.$queryRaw`SELECT COUNT(*) FROM users`;
    const bunRaw = performance.now() - start;
    console.log(`Raw Query: ${bunRaw.toFixed(2)}ms`);

    start = performance.now();
    await bunAdapter.prisma.$transaction(async (tx) => {
      await tx.user.count();
      return await tx.user.findFirst();
    });
    const bunTransaction = performance.now() - start;
    console.log(`Transaction: ${bunTransaction.toFixed(2)}ms`);

    const bunTotal =
      bunFindAll + bunRelations + bunConcurrent + bunRaw + bunTransaction;

    await bunAdapter.dispose();

    // Test PrismaPg adapter
    prismaPgAdapter = createAdapter("prisma-pg");
    console.log("\n⚡ Testing PrismaPg");
    console.log("-".repeat(40));

    start = performance.now();
    await prismaPgAdapter.prisma.user.findMany();
    const pgFindAll = performance.now() - start;
    console.log(`Find All Users: ${pgFindAll.toFixed(2)}ms`);

    start = performance.now();
    await prismaPgAdapter.prisma.user.findMany({
      include: {
        profile: true,
        posts: {
          include: {
            tags: true,
          },
        },
      },
    });
    const pgRelations = performance.now() - start;
    console.log(`Complex Relations: ${pgRelations.toFixed(2)}ms`);

    start = performance.now();
    const pgPromises = Array.from({ length: 10 }, () =>
      prismaPgAdapter!.prisma.user.findMany({ take: 5 })
    );
    await Promise.all(pgPromises);
    const pgConcurrent = performance.now() - start;
    console.log(`10 Concurrent Queries: ${pgConcurrent.toFixed(2)}ms`);

    start = performance.now();
    await prismaPgAdapter.prisma.$queryRaw`SELECT COUNT(*) FROM users`;
    const pgRaw = performance.now() - start;
    console.log(`Raw Query: ${pgRaw.toFixed(2)}ms`);

    start = performance.now();
    await prismaPgAdapter.prisma.$transaction(async (tx) => {
      await tx.user.count();
      return await tx.user.findFirst();
    });
    const pgTransaction = performance.now() - start;
    console.log(`Transaction: ${pgTransaction.toFixed(2)}ms`);

    const pgTotal =
      pgFindAll + pgRelations + pgConcurrent + pgRaw + pgTransaction;

    await prismaPgAdapter.dispose();

    // Results
    console.log("\n📊 COMPARISON RESULTS");
    console.log("=".repeat(60));
    console.log(
      "Test Name".padEnd(25) +
        "BunAdapter".padEnd(15) +
        "PrismaPg".padEnd(15) +
        "Winner"
    );
    console.log("-".repeat(60));

    const tests = [
      { name: "Find All Users", bun: bunFindAll, pg: pgFindAll },
      { name: "Complex Relations", bun: bunRelations, pg: pgRelations },
      { name: "10 Concurrent Queries", bun: bunConcurrent, pg: pgConcurrent },
      { name: "Raw Query", bun: bunRaw, pg: pgRaw },
      { name: "Transaction", bun: bunTransaction, pg: pgTransaction },
    ];

    let bunWins = 0;
    let pgWins = 0;

    tests.forEach((test) => {
      const bunTime = `${test.bun.toFixed(1)}ms`;
      const pgTime = `${test.pg.toFixed(1)}ms`;
      const winner = test.bun < test.pg ? "Bun" : "PrismaPg";
      const difference = Math.abs(
        ((test.bun - test.pg) / Math.max(test.bun, test.pg)) * 100
      );

      console.log(
        test.name.padEnd(25) +
          bunTime.padEnd(15) +
          pgTime.padEnd(15) +
          `${winner} (+${difference.toFixed(1)}%)`
      );

      if (winner === "Bun") bunWins++;
      else pgWins++;
    });

    console.log("-".repeat(60));
    console.log(
      `Total Time`.padEnd(25) +
        `${bunTotal.toFixed(1)}ms`.padEnd(15) +
        `${pgTotal.toFixed(1)}ms`.padEnd(15)
    );

    const overallWinner = bunTotal < pgTotal ? "BunAdapter" : "PrismaPg";
    const overallDifference = Math.abs(
      ((bunTotal - pgTotal) / Math.max(bunTotal, pgTotal)) * 100
    );

    console.log(
      `\n🏆 Overall Winner: ${overallWinner} (${overallDifference.toFixed(
        1
      )}% faster)`
    );
    console.log(`📈 BunAdapter won ${bunWins}/${tests.length} tests`);
    console.log(`📈 PrismaPg won ${pgWins}/${tests.length} tests`);
  } catch (error) {
    console.error("❌ Performance test failed:", error);
  } finally {
    if (bunAdapter) await bunAdapter.dispose();
    if (prismaPgAdapter) await prismaPgAdapter.dispose();
  }
}

simplePerformanceTest();
