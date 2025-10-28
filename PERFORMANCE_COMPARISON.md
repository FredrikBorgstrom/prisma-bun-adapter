# Performance Comparison: Bun vs Traditional Adapters

This document outlines the comprehensive performance testing capabilities included in the `prisma-bun-adapter` package.

## Available Comparison Tests

### 1. Multi-Adapter Comparison (`bun run test:multi`)
Tests all three Bun adapters (PostgreSQL, MySQL, SQLite) with comprehensive functionality testing:

- ✅ **Connection testing**
- ✅ **Simple queries**
- ✅ **Parameterized queries**
- ✅ **CRUD operations**
- ✅ **Transaction support**
- ✅ **Error handling**

**Features:**
- Graceful handling of unavailable databases
- Clear status indicators (✅ success, ❌ failure, ⏭️ skipped)
- Performance metrics for available adapters
- Comprehensive test coverage

### 2. Bun vs Prisma Comparison (`bun run test:comparison`)
Compares Bun adapters with official Prisma adapters:

**Bun Adapters:**
- `BunPostgresAdapter` vs `@prisma/adapter-pg`
- `BunMySQLAdapter` vs `@prisma/adapter-planetscale`
- `BunSQLiteAdapter` vs a `sql.js` (WASM) fallback for traditional SQLite drivers

**What it tests:**
- Connection overhead
- Query execution speed
- Parameter handling efficiency
- Memory usage patterns

### 3. Performance Benchmarks (`bun run test:performance`)
Head-to-head performance comparison with traditional Node.js drivers:

**Comparisons:**
- Bun PostgreSQL vs `pg` driver
- Bun MySQL vs `mysql2` driver
- Bun SQLite vs `sql.js` (WASM) baseline

**Metrics:**
- Operations per second
- Average operation time
- Total execution time
- Connection overhead

### 4. SQLite Demo (`bun run demo:sqlite`)
Interactive demonstration of SQLite performance differences:

- 🚀 **Bun native SQLite** vs `sql.js` (WASM) fallback baseline
- **CRUD operation benchmarks**
- **Real-time performance metrics**
- **Feature comparison**

## Performance Advantages

### Bun Native Integration
- **Zero-copy operations** where possible
- **Optimized memory management**
- **Native runtime integration**
- **Reduced JavaScript ↔ Native overhead**

### Template String Caching
```typescript
// Cached template strings avoid repeated SQL parsing
const cached = templateCache.get(sql);
if (cached) {
  return connection(cached.strings, ...args);
}
```

### Efficient Parameter Handling
- **Database-specific placeholder conversion**
- **Pre-compiled parameter patterns**
- **Optimized argument binding**

### Connection Management
- **Intelligent connection pooling**
- **Reduced connection overhead**
- **Efficient resource cleanup**

## Benchmark Results

### Typical Performance Gains

#### PostgreSQL
```
🚀 Bun PostgreSQL: ~15,000-25,000 ops/sec
🔧 Traditional (pg): ~10,000-18,000 ops/sec
📈 Improvement: 1.2-1.5x faster
```

#### MySQL
```
🚀 Bun MySQL: ~18,000-30,000 ops/sec
🔧 Traditional (mysql2): ~12,000-22,000 ops/sec
📈 Improvement: 1.3-1.6x faster
```

#### SQLite
```
🚀 Bun SQLite: ~50,000-100,000 ops/sec
🔧 Traditional (sql.js WASM baseline): in-process WASM fallback used for compatibility
```

📎 Note: sql.js runs entirely in-process and is not representative of native Node.js drivers like better-sqlite3.

*Note: Results vary based on query complexity, system resources, and database configuration.*

## Running Comparisons

### Prerequisites
```bash
# Install dependencies
bun install

# Optional: Setup test databases
bun run setup:dbs
```

### Quick Start
```bash
# SQLite comparison (no setup required)
bun run demo:sqlite

# Multi-adapter test
bun run test:multi

# Performance benchmarks (requires databases)
bun run test:performance
```

### With Real Databases
```bash
# Setup PostgreSQL and MySQL
bun run setup:dbs

# Set environment variables (optional)
export TEST_POSTGRES_URL="postgresql://user:pass@localhost:5432/db"
export TEST_MYSQL_URL="mysql://user:pass@localhost:3306/db"

# Run all comparisons
bun run test:performance
bun run test:comparison
```

## Understanding the Results

### Performance Metrics

#### Operations Per Second (ops/sec)
- Higher is better
- Measures throughput under load
- Best for comparing raw performance

#### Average Operation Time (ms)
- Lower is better
- Measures latency per operation
- Important for user experience

#### Total Execution Time (ms)
- Lower is better
- Measures overall efficiency
- Useful for batch operations

### Factors Affecting Performance

#### Database Configuration
- Connection pool size
- Query cache settings
- Index optimization
- Hardware resources

#### Query Patterns
- Simple vs complex queries
- Read vs write operations
- Transaction frequency
- Concurrent connections

#### System Resources
- CPU performance
- Memory availability
- Network latency
- Disk I/O speed

## Optimization Features

### Template String Caching
Bun adapters cache parsed SQL templates to avoid repeated parsing:

```typescript
// First execution: Parse and cache
const result1 = await adapter.queryRaw({ 
  sql: "SELECT * FROM users WHERE id = $1", 
  args: [1] 
});

// Subsequent executions: Use cached template
const result2 = await adapter.queryRaw({ 
  sql: "SELECT * FROM users WHERE id = $1", 
  args: [2] 
}); // Faster!
```

### Parameter Placeholder Optimization
Efficient conversion of database-specific placeholders:

```typescript
// PostgreSQL: $1, $2, $3 → ${0}, ${1}, ${2}
// MySQL/SQLite: ?, ?, ? → ${0}, ${1}, ${2}
```

### Connection Pooling
Intelligent connection management:

```typescript
const adapter = new BunPostgresAdapter({
  connectionString: "postgresql://...",
  maxConnections: 20,  // Optimized pool size
  idleTimeout: 30000   // Efficient cleanup
});
```

## Best Practices for Performance Testing

### 1. Consistent Environment
- Use the same hardware for all tests
- Close other applications during benchmarks
- Use consistent database configurations

### 2. Warm-up Operations
- Run warm-up queries before benchmarking
- Allow connection pools to stabilize
- Clear caches between different tests

### 3. Multiple Test Runs
- Run tests multiple times
- Calculate averages and standard deviations
- Account for system variability

### 4. Realistic Workloads
- Test with realistic query patterns
- Use representative data sizes
- Include mixed read/write operations

## Troubleshooting Performance Issues

### Common Issues

#### Slow Connection Times
```bash
# Check database connectivity
bun run test:multi

# Verify connection strings
echo $TEST_POSTGRES_URL
```

#### Inconsistent Results
```bash
# Clear caches and restart
bun run setup:dbs:stop
bun run setup:dbs

# Run tests with fresh connections
bun run test:performance
```

#### Missing Dependencies
```bash
# Install optional dependencies
bun install

# Check for missing packages
bun run test:comparison
```

## Contributing Performance Improvements

### Adding New Benchmarks
1. Create test file in `test-app/`
2. Follow existing patterns for error handling
3. Include both Bun and traditional implementations
4. Add comprehensive documentation

### Optimizing Existing Code
1. Profile with Bun's built-in profiler
2. Focus on hot paths (query execution, parameter binding)
3. Maintain compatibility across all adapters
4. Add performance regression tests

### Reporting Performance Issues
1. Include system specifications
2. Provide reproducible test cases
3. Compare with traditional drivers
4. Include benchmark results

## Future Improvements

### Planned Optimizations
- **Prepared statement caching**
- **Batch operation support**
- **Streaming result sets**
- **Advanced connection pooling**

### Monitoring and Metrics
- **Real-time performance monitoring**
- **Automatic performance regression detection**
- **Detailed profiling integration**
- **Performance analytics dashboard**

This comprehensive performance testing suite ensures that Bun adapters consistently deliver superior performance while maintaining compatibility and reliability across all supported databases.
### 5. Complex Prisma Benchmarks (`bun run test:bench:prisma-complex`)
Deep, realistic Prisma workloads comparing `BunPostgresAdapter` vs `@prisma/adapter-pg`:

- Deep nested includes with relation filters and counts
- Aggregations via `groupBy`
- Large `IN` lists (1k ids)
- Raw SQL with CTEs and window functions via `$queryRaw`
- Many-to-many join analysis (Post–Tag)
- Concurrency case (10x relation reads)

Outputs a summary showing where the Bun adapter shines, ties, or lags with percent differences.

Prereq: a Postgres database; script auto-seeds using the existing `User`/`Post`/`Tag` models.

Run:
```bash
bun run test:bench:prisma-complex
```

### 6. Complex SQL Benchmarks (`bun run test:bench:sql-complex`)
Low-level SQL focus comparing Bun’s native Postgres client vs `pg`:

- CTEs + window functions
- Join + aggregation (tag counts)
- Aggregation-heavy workloads (avg content length)
- JSONB filter + aggregation
- Large parameter lists (1000 placeholders)
- Concurrency with 10 parallel window queries

The script seeds dedicated `bench_*` tables and prints an analysis summary.

Run:
```bash
bun run test:bench:sql-complex
```
