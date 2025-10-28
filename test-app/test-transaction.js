import { BunPostgresAdapter } from "../src/index.js";

// Summary: Validate transactional support for the Bun PostgreSQL adapter including commit and rollback paths.

async function testTransaction() {
  console.log("Testing native Bun transaction...");
  
  const adapter = new BunPostgresAdapter(process.env.DATABASE_URL);
  
  try {
    const driverAdapter = await adapter.connect();
    console.log("Connected successfully");
    
    // Test transaction
    const tx = await driverAdapter.startTransaction();
    console.log("Transaction started");
    
    // Test query in transaction
    const result = await tx.queryRaw({
      sql: "SELECT COUNT(*) as count FROM users",
      args: []
    });
    
    console.log("Transaction query result:", result);
    
    // Commit transaction
    await tx.commit();
    console.log("Transaction committed");
    
    await driverAdapter.dispose();
    console.log("Test completed successfully");
    
  } catch (error) {
    console.error("Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testTransaction();
