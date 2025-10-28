import { prisma } from "./lib/db-simple";

// Summary: Validate baseline Prisma connectivity without custom adapters before running adapter-specific tests.

async function testBasicConnection() {
  console.log("🧪 Testing basic Prisma connection (without adapter)...\n");

  try {
    // Test database connection
    console.log("1. Testing database connection...");
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log("   ✅ Database connection successful");

    // Test basic query
    console.log("2. Testing basic query...");
    const userCount = await prisma.user.count();
    console.log(`   ✅ Found ${userCount} users`);

    console.log("\n🎉 Basic Prisma setup is working!");
    console.log("Now we can test the adapter...");
    
  } catch (error) {
    console.error("❌ Basic setup failed:", error);
    console.log("\n🔧 This suggests an issue with:");
    console.log("   - Database connection");
    console.log("   - Prisma schema/migrations");
    console.log("   - Environment configuration");
  } finally {
    await prisma.$disconnect();
  }
}

testBasicConnection();
