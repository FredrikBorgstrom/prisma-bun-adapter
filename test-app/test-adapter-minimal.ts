import { PrismaClient } from "@prisma/client";
import { BunPostgresAdapter } from "prisma-bun-postgres-adapter";

// Summary: Smoke test the Bun PostgreSQL adapter with minimal setup to ensure basic connectivity and queries succeed.

async function testAdapter() {
  console.log("🧪 Testing Bun PostgreSQL Adapter (minimal)...\n");

  try {
    console.log("1. Creating adapter...");
    const adapter = new BunPostgresAdapter(process.env.DATABASE_URL!);
    console.log("   ✅ Adapter created successfully");

    console.log("2. Creating Prisma client with adapter...");
    const prisma = new PrismaClient({ 
      adapter,
      log: ["error"] // Only log errors to reduce noise
    });
    console.log("   ✅ Prisma client created successfully");

    console.log("3. Testing basic query...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("   ✅ Query executed successfully:", result);

    console.log("\n🎉 Adapter is working!");
    
    await prisma.$disconnect();
    await adapter.dispose();
    
  } catch (error) {
    console.error("❌ Adapter test failed:");
    console.error(error);
    
    if (error instanceof Error) {
      console.log("\nError details:");
      console.log("Message:", error.message);
      console.log("Stack:", error.stack);
    }
  }
}

testAdapter();
