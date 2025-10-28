const sql = new Bun.sql(process.env.DATABASE_URL);

// Summary: Verify Bun's SQL tagged templates handle parameter binding and return expected metadata.

// Test parameterized query
const email = 'alice@example.com';
const query = sql`SELECT * FROM users WHERE email = ${email}`;

query.then(result => {
  console.log('Parameterized query result:', result);
  console.log('Result length:', result.length);
  console.log('Result count:', result.count);
  console.log('Command:', result.command);
  
  if (result.length > 0) {
    console.log('First user:', result[0]);
  }
}).catch(e => {
  console.log('Error:', e.message);
});
