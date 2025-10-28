import { BunPostgresAdapter } from "../src/index.js";

// Summary: Exercise the low-level Bun adapter directly to confirm connection, querying, and cleanup.

async function testAdapter() {
  console.log("Testing native Bun adapter...");
  
  const adapter = new BunPostgresAdapter(process.env.DATABASE_URL);
  
  try {
    const driverAdapter = await adapter.connect();
    console.log("Connected successfully");
    
    // Test a simple query
    const result = await driverAdapter.queryRaw({
      sql: "SELECT COUNT(*) as count FROM users",
      args: []
    });
    
    console.log("Query result:", result);
    
    await driverAdapter.dispose();
    console.log("Test completed successfully");
    
  } catch (error) {
    console.error("Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAdapter();
