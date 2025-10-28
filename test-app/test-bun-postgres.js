const sql = new Bun.sql(process.env.DATABASE_URL);

// Summary: Sanity-check Bun SQL queries against PostgreSQL and inspect result structures.

// Test basic query using tagged template literal
const query = sql`SELECT COUNT(*) as count FROM users`;

query.then(result => {
  console.log('Query result:', result);
  console.log('Result type:', typeof result);
  console.log('Is array:', Array.isArray(result));
  
  if (Array.isArray(result) && result.length > 0) {
    console.log('First row:', result[0]);
    console.log('First row keys:', Object.keys(result[0]));
  }
}).catch(e => {
  console.log('Error:', e.message);
  console.log('Stack:', e.stack);
});
