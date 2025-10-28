#!/usr/bin/env bun

import { prisma } from "./lib/db";

// Summary: Confirm full adapter setup by checking connectivity, queries, and transaction capabilities.

async function validateSetup() {
  console.log("🔍 Validating Prisma Bun PostgreSQL Adapter setup...\n");

  try {
    // Test 1: Database connection
    console.log("1. Testing database connection...");
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log("   ✅ Database connection successful");

    // Test 2: Adapter functionality
    console.log("2. Testing adapter functionality...");
    const userCount = await prisma.user.count();
    console.log(`   ✅ Adapter working (found ${userCount} users)`);

    // Test 3: Transaction support
    console.log("3. Testing transaction support...");
    await prisma.$transaction(async (tx) => {
      await tx.user.count();
    });
    console.log("   ✅ Transactions working");

    // Test 4: Raw queries
    console.log("4. Testing raw queries...");
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
    console.log("   ✅ Raw queries working");

    console.log("\n🎉 All validations passed! The adapter is working correctly.");
    console.log("\n📚 Next steps:");
    console.log("   - Run 'bun run dev' for basic functionality demo");
    console.log("   - Run 'bun run test' for comprehensive testing");
    
    return true;
  } catch (error) {
    console.error("\n❌ Validation failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("   - Check your DATABASE_URL in .env");
    console.log("   - Make sure PostgreSQL is running");
    console.log("   - Run 'bun run db:migrate' if you haven't already");
    console.log("   - Run 'bun run db:seed' to populate test data");
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

validateSetup().then((success) => {
  process.exit(success ? 0 : 1);
});
