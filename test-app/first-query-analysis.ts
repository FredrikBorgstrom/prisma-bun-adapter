import { createAdapter, type AdapterConfig } from "./lib/db-adapters";

// Summary: Measure cold versus warm query latency for Bun and Prisma adapters to highlight startup overhead.

async function analyzeFirstQuery() {
  console.log("🔍 FIRST QUERY ANALYSIS");
  console.log("=".repeat(60));
  
  console.log("\n📊 Testing BunPostgresAdapter");
  console.log("-".repeat(40));
  
  let bunAdapter = createAdapter("bun");
  
  // Time the very first query (cold start)
  let start = performance.now();
  const bunFirstResult = await bunAdapter.prisma.user.findMany();
  let bunFirstTime = performance.now() - start;
  console.log(`First query (cold): ${bunFirstTime.toFixed(2)}ms`);
  
  // Time subsequent queries
  start = performance.now();
  await bunAdapter.prisma.user.findMany();
  let bunSecondTime = performance.now() - start;
  console.log(`Second query (warm): ${bunSecondTime.toFixed(2)}ms`);
  
  start = performance.now();
  await bunAdapter.prisma.user.findMany();
  let bunThirdTime = performance.now() - start;
  console.log(`Third query (warm): ${bunThirdTime.toFixed(2)}ms`);
  
  await bunAdapter.dispose();
  
  console.log("\n📊 Testing PrismaPg");
  console.log("-".repeat(40));
  
  let pgAdapter = createAdapter("prisma-pg");
  
  // Time the very first query (cold start)
  start = performance.now();
  const pgFirstResult = await pgAdapter.prisma.user.findMany();
  let pgFirstTime = performance.now() - start;
  console.log(`First query (cold): ${pgFirstTime.toFixed(2)}ms`);
  
  // Time subsequent queries
  start = performance.now();
  await pgAdapter.prisma.user.findMany();
  let pgSecondTime = performance.now() - start;
  console.log(`Second query (warm): ${pgSecondTime.toFixed(2)}ms`);
  
  start = performance.now();
  await pgAdapter.prisma.user.findMany();
  let pgThirdTime = performance.now() - start;
  console.log(`Third query (warm): ${pgThirdTime.toFixed(2)}ms`);
  
  await pgAdapter.dispose();
  
  console.log("\n📋 COLD START COMPARISON");
  console.log("=".repeat(60));
  console.log(`BunAdapter first query: ${bunFirstTime.toFixed(2)}ms`);
  console.log(`PrismaPg first query:   ${pgFirstTime.toFixed(2)}ms`);
  
  const coldDifference = Math.abs(((bunFirstTime - pgFirstTime) / Math.max(bunFirstTime, pgFirstTime)) * 100);
  const coldWinner = bunFirstTime < pgFirstTime ? "BunAdapter" : "PrismaPg";
  console.log(`Cold start winner: ${coldWinner} (${coldDifference.toFixed(1)}% difference)`);
  
  console.log("\n📋 WARM QUERY COMPARISON");
  console.log("=".repeat(60));
  console.log(`BunAdapter warm avg: ${((bunSecondTime + bunThirdTime) / 2).toFixed(2)}ms`);
  console.log(`PrismaPg warm avg:   ${((pgSecondTime + pgThirdTime) / 2).toFixed(2)}ms`);
  
  const warmBunAvg = (bunSecondTime + bunThirdTime) / 2;
  const warmPgAvg = (pgSecondTime + pgThirdTime) / 2;
  const warmDifference = Math.abs(((warmBunAvg - warmPgAvg) / Math.max(warmBunAvg, warmPgAvg)) * 100);
  const warmWinner = warmBunAvg < warmPgAvg ? "BunAdapter" : "PrismaPg";
  console.log(`Warm query winner: ${warmWinner} (${warmDifference.toFixed(1)}% difference)`);
  
  console.log("\n💡 INSIGHTS:");
  if (bunFirstTime > pgFirstTime * 2) {
    console.log("   - BunAdapter has significantly slower cold start");
    console.log("   - This suggests connection initialization overhead");
  }
  if (warmBunAvg > warmPgAvg * 1.5) {
    console.log("   - BunAdapter is slower even when warm");
    console.log("   - This suggests query execution overhead");
  }
  if (bunFirstTime > warmBunAvg * 3) {
    console.log("   - BunAdapter cold start is much slower than warm queries");
    console.log("   - Connection pooling initialization is the bottleneck");
  }
}

analyzeFirstQuery().catch(console.error);
