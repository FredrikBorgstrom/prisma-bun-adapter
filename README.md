Prisma Bun Adapter
==================

**Using Prisma 7.0 as of version 1.3**

Prisma driver adapters for Bun's native SQL clients (PostgreSQL, MySQL, SQLite).

- Zero external runtime dependencies for Bun-backed connections
- Template-string based parameterization with caching
- Works with Prisma 6 driver adapter API

Install
-------

Pick the adapter(s) you want. The package includes classes for all 3 drivers.

```
bun add @abcx3/prisma-bun-adapter
```

Optional (for comparisons / tests in this repo):

```
bun add -d @prisma/adapter-pg @prisma/adapter-planetscale mysql2 better-sqlite3
```

Quick Start
-----------

PostgreSQL (Bun native):

```ts
import { PrismaClient } from "@prisma/client";
import { BunPostgresAdapter } from "@abcx3/prisma-bun-adapter";

const adapter = new BunPostgresAdapter({
  connectionString: process.env.DATABASE_URL!,
  maxConnections: 20,
});

const prisma = new PrismaClient({
  adapter: adapter,
  log: ["query", "info", "warn", "error"],
});

await prisma.user.findMany();
```


Optimized Build (Optional)
--------------------------

*please note, the optimized package only works with PostgreSQL. MySQL support might be added in the future.*

The package also ships an "optimized" bundle under `@abcx3/prisma-bun-adapter/optimized`. It enables a few extra runtime tweaks: connection pooling (default `maxConnections: 20`), eager warm-up of the Postgres socket, and more aggressive SQL template caching. Those features improve throughput for high-concurrency apps but add a bit of startup work and memory usage.

You can opt in explicitly:

```ts
import { PrismaClient } from "@prisma/client";
import { BunPostgresAdapter } from "@abcx3/prisma-bun-adapter/optimized";

const adapter = new BunPostgresAdapter({
  connectionString: process.env.DATABASE_URL!,
  maxConnections: 20,
});

const prisma = new PrismaClient({ adapter });

await prisma.user.findMany();
```

If you prefer to fall back automatically when the optimized bundle is unavailable (for example, in slim deployments where the extra bundle isn't shipped), wrap the `require` in a try/catch and fall back to the base entry point. The core API and configuration shape is identical between the two builds, so switching is a one-line change.

Runtime Configuration
---------------------

The adapter looks at a few environment variables to control pooling behaviour:

| Env var | Default | What it does |
| --- | --- | --- |
| `PRISMA_BUN_ADAPTER_DISABLE_POOL` | `false` | When `true`, disables connection pooling entirely and creates a fresh Bun connection for every query. |
| `PRISMA_BUN_ADAPTER_DISABLE_POOL_FOR_TX` | `true` | Disables pooling for Prisma `$transaction` calls only. While true, each interactive transaction gets a dedicated short-lived connection. |

> Build selection (base vs optimised) is done by import path, not by an environment variable. If you want to gate which build you load at runtime, do so in your host application code (e.g. `if (process.env.MY_FLAG) require("@abcx3/prisma-bun-adapter/optimized") else require("@abcx3/prisma-bun-adapter")`).

Connection Health & Pool Management
-----------------------------------

The optimized adapter includes robust connection health checking to handle intermittent connection issues caused by:
- PostgreSQL server idle timeouts (`idle_session_timeout`, `tcp_keepalives_*`)
- Network firewalls dropping idle TCP connections
- Database restarts

### Configuration Options

```ts
import { BunPostgresAdapter } from "@abcx3/prisma-bun-adapter/optimized";

const adapter = new BunPostgresAdapter({
  connectionString: process.env.DATABASE_URL!,
  maxConnections: 20,
  
  // Connection validation settings (all optional)
  validateOnBorrow: true,           // Enable health checks (default: true)
  validateIdleThresholdMs: 10000,   // Only validate connections idle > 10s (default: 10000)
  validationQuery: "SELECT 1",      // Health check query (default: "SELECT 1")
  maxAcquireRetries: 2,             // Retry acquiring healthy connections (default: 2)
});
```

| Option | Default | Description |
| --- | --- | --- |
| `validateOnBorrow` | `true` | When enabled, validates connections before returning them from the pool |
| `validateIdleThresholdMs` | `10000` | Only validate connections that have been idle longer than this (ms). Avoids validation overhead for recently-used connections |
| `validationQuery` | `"SELECT 1"` | Lightweight query used to test connection liveness |
| `maxAcquireRetries` | `2` | Number of times to retry acquiring a healthy connection before failing |

### How It Works

1. **Smart Validation**: Connections are only validated if they've been idle longer than `validateIdleThresholdMs`. Recently-used connections skip validation for better performance.

2. **Automatic Eviction**: Dead connections are automatically detected and removed from the pool. The adapter tracks metadata for each connection including creation time, last use time, and last validation time.

3. **Error-Based Eviction**: If a query fails with a connection-related error (e.g., "connection reset", "socket hang up", authentication errors from stale connections), that connection is evicted instead of being returned to the pool.

4. **Retry Logic**: When acquiring a connection, the adapter will retry up to `maxAcquireRetries` times if dead connections are encountered.

### Pool Statistics

You can monitor pool health using the `getPoolStats()` method on the driver adapter:

```ts
import { PrismaClient } from "@prisma/client";
import { BunPostgresAdapter, OptimizedBunPostgresDriverAdapter } from "@abcx3/prisma-bun-adapter/optimized";

const adapter = new BunPostgresAdapter({
  connectionString: process.env.DATABASE_URL!,
});

const driver = await adapter.connect() as OptimizedBunPostgresDriverAdapter;
const prisma = new PrismaClient({ adapter: driver });

// Get pool statistics
const stats = driver.getPoolStats();
console.log(stats);
// {
//   total: 5,                    // Total connections in pool
//   idle: 3,                     // Available connections
//   active: 2,                   // Connections in use
//   waiting: 0,                  // Requests waiting for a connection
//   deadConnectionsEvicted: 1,   // Dead connections removed
//   validationFailures: 1,       // Failed health checks
// }
```

### Recommended Settings

For most production workloads:

```ts
const adapter = new BunPostgresAdapter({
  connectionString: process.env.DATABASE_URL!,
  maxConnections: 10,              // Adjust based on your workload
  validateOnBorrow: true,          // Enable health checks
  validateIdleThresholdMs: 10000,  // 10 seconds - shorter than server timeout
});
```

If your PostgreSQL server has a short `idle_session_timeout` (e.g., 30 seconds), set `validateIdleThresholdMs` to be shorter (e.g., 5000ms) to catch stale connections before they cause errors.

> **Heads up:** Bun’s pooled connections can currently misbehave inside nested Prisma transactions (connections are reused too early, leading to “Transaction already closed” errors). Until that bug is fully resolved, the optimised adapter defaults `PRISMA_BUN_ADAPTER_DISABLE_POOL_FOR_TX` to `true`; leave it in place unless you have a local fix, or use the base adapter if preferred.



Import Matrix
-------------

Use these patterns depending on which build you want and your module system.

- Base (default) build
  - ESM:
    - `import { BunPostgresAdapter, BunMySQLAdapter, BunSQLiteAdapter } from "@abcx3/prisma-bun-adapter"`
  - CJS:
    - `const { BunPostgresAdapter } = require("@abcx3/prisma-bun-adapter")`

- Optimized Postgres build (subpath)
  - ESM:
    - `import { BunPostgresAdapter } from "@abcx3/prisma-bun-adapter/optimized"`
    - `import BunPostgresAdapter from "@abcx3/prisma-bun-adapter/optimized"`
    - `import { BunPostgres } from "@abcx3/prisma-bun-adapter/optimized"` (alias)
  - Root re-exports (ESM):
    - `import { OptimizedBunPostgresAdapter } from "@abcx3/prisma-bun-adapter"`
    - `import { BunPostgresOptimized } from "@abcx3/prisma-bun-adapter"`
    - Advanced (driver class): `import { OptimizedBunPostgresDriverAdapter } from "@abcx3/prisma-bun-adapter"`

TypeScript module resolution tips (ESM subpaths)
-----------------------------------------------

When importing the optimized subpath, set these in your host project's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

`Node16` also works. This matches Node-style ESM/CJS resolution and avoids errors like “An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.”

Use Prisma Like Normal
----------------------

This adapter integrates with Prisma's driver adapter API. You keep using Prisma Client exactly the same way:

```ts
// Model delegates work unchanged
const users = await prisma.user.findMany({
  where: { email: { contains: "@example.com" } },
  include: { posts: true },
});

// Creates, updates, nested writes, include/select, aggregations, etc.
await prisma.post.create({
  data: {
    title: "Hello",
    author: { connect: { id: 1 } },
  },
});

// Interactive transactions work too
const created = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: "a@b.com" } });
  await tx.post.create({ data: { userId: user.id, title: "Welcome" } });
  return user;
});
```

Service/DI usage (e.g., NestJS): create the client in an async factory and inject it where needed.

```ts
import { PrismaClient } from "@prisma/client";
import { BunPostgresAdapter } from "@abcx3/prisma-bun-adapter";

export async function makePrisma() {
  const adapter = new BunPostgresAdapter(process.env.DATABASE_URL!);
  return new PrismaClient({ adapter });
}

// elsewhere
const prismaService = await makePrisma();
const rows = await prismaService.user.findMany();
```

Notes
-----

- You do not need to percent‑encode special characters in your DB password when using `DATABASE_URL`. The adapter normalizes and encodes credentials automatically so model queries like `prisma.user.findFirst` work regardless of password contents.
- No query rewrites required: keep using `prisma.<model>.<method>` as usual.
- TypeScript module resolution: if your host project uses TypeScript and you import the optimized subpath (or rely on ESM subpath exports), set `compilerOptions.module` and `compilerOptions.moduleResolution` to `"Node16"` or `"NodeNext"` in your `tsconfig.json`. This matches Node-style ESM/CJS resolution and avoids import path errors for `@abcx3/prisma-bun-adapter/optimized`.

Troubleshooting
---------------

- URI error on first model query (e.g., `user.findFirst`): This usually means your `DATABASE_URL` is malformed (e.g., missing scheme/host) or contains a stray character that breaks the URL. The adapter auto‑encodes credentials, but if parsing still fails, verify the URL shape is valid (e.g., `postgresql://user:pass@host:5432/db?sslmode=disable`).
- Models not accessible: Ensure you ran `prisma generate` after updating your schema, and construct `PrismaClient` with the adapter factory, e.g. `new PrismaClient({ adapter: new BunPostgresAdapter(process.env.DATABASE_URL!) })`. Generated model delegates (e.g., `prisma.user.findFirst`) work normally with this adapter.
- TypeScript import errors for optimized build: configure `tsconfig.json` with `module: "Node16" | "NodeNext"` and `moduleResolution: "Node16" | "NodeNext"`. Example:

  ```json
  {
    "compilerOptions": {
      "module": "NodeNext",
      "moduleResolution": "NodeNext"
    }
  }
  ```

MySQL (Bun native):

```ts
import { PrismaClient } from "@prisma/client";
import { BunMySQLAdapter } from "@abcx3/prisma-bun-adapter";

const adapter = new BunMySQLAdapter(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });
```

SQLite (Bun native):

```ts
import { PrismaClient } from "@prisma/client";
import { BunSQLiteAdapter } from "@abcx3/prisma-bun-adapter";

const adapter = new BunSQLiteAdapter(":memory:");
const prisma = new PrismaClient({ adapter });
```

Placeholders & Parameterization
-------------------------------

- PostgreSQL: supports `$1, $2, ...` (preferred), and also `?` for convenience.
- MySQL/SQLite: use `?` placeholders.

Examples:

```ts
// Postgres
await prisma.$queryRaw`SELECT $1 as value`;
// or
await prisma.$queryRaw({ sql: "SELECT $1 as value", args: [123] });

// MySQL / SQLite
await prisma.$queryRaw({ sql: "SELECT ? as value", args: [123] });
```

API Surface
-----------

The package exports the following classes:

- `BunPostgresAdapter`
- `BunMySQLAdapter`
- `BunSQLiteAdapter`

Each class implements Prisma's `SqlDriverAdapter` contract under the hood and can be passed to the `PrismaClient` constructor via the `adapter` option.

Environment
-----------

- Requires Bun runtime for Bun-backed connections.
- Node.js is supported when using Prisma client in your app (the adapter still runs via Bun's native SQL inside the runtime). For most projects, you will run your Prisma client within Bun.
- Suggested engines: Node >= 18, Bun >= 1.1


Tests & Benchmarks
------------------

All tests and benchmarks are automactically configured in Docker, so you need to have Docker installed.

1. Run `tests:setup` to spin up the test databases, initialize and seed them with data
2. Run `tests:run` to run all tests and benchmarks
3. Run `tests:stop` to stop and remove the database containers

You can also run any of the individual tests/benchmarks to get more granular results:

- `bun test:multi`
- `bun test:comparison`
- `test:comprehensive`
- `test:performance`
- `test:bench:prisma-complex`
- `test:bench:sql-complex`
- `demo:sqlite`
- `demo:quick`

Note: SQLite comparisons now use a `sql.js` (WebAssembly) baseline instead of `better-sqlite3`, because Bun currently crashes when loading that native module. The fallback keeps the demos runnable directly under Bun and includes a small simulated driver overhead so that results more closely match native Node.js adapters.

Build & Publish (maintainers)
-----------------------------

This package ships prebuilt JS and `.d.ts` types in `dist/`.

Scripts:

- `bun prepublish` – (or `bun run build`), compile TypeScript to javascript with declarations and outputs to `dist/`
- `bun run test:performance` – optional performance demo
- `bun run test:comparison` – optional comparison scripts
 - `bun run test:bench:prisma-complex` – deep Prisma workloads (Bun vs PrismaPg)
 - `bun run test:bench:sql-complex` – complex raw SQL (Bun vs pg)

Publishing checklist:

1. Update version number in `package.json`.
2. Update CHANGELOG.md with new changes
3. `bun publish`

FAQ
---

Q: I see `syntax error at or near "as"` in Postgres.

A: Use Postgres-style placeholders (`$1`, `$2`, ...) or upgrade to a version of the package that accepts both `?` and `$n`. This package converts placeholders appropriately for Bun's SQL template strings.

Q: How do I run the test scripts?

A: These are for local benchmarking only. See `test-app/setup-databases.md` for setting up Postgres/MySQL containers, then run the scripts under `package.json`.

Benchmark results
-----------------
📈 Benchmark Results:
====================
🚀 Bun PostgreSQL:
   Total time: 8.82ms
   Avg per op: 0.09ms
   Ops/second: 11332

🚀 Bun MySQL:
   Total time: 12.28ms
   Avg per op: 0.12ms
   Ops/second: 8144

🚀 Bun SQLite:
   Total time: 1.76ms
   Avg per op: 0.02ms
   Ops/second: 56723

🔧 Traditional PostgreSQL (pg):
   Total time: 16.38ms
   Avg per op: 0.16ms
   Ops/second: 6106

🔧 Traditional MySQL (mysql2):
   Total time: 19.41ms
   Avg per op: 0.19ms
   Ops/second: 5153

⚡ Performance Comparison by Database:
====================================

POSTGRESQL:
  🚀 Bun: 11332 ops/sec (0.09ms avg)
  🔧 Traditional: 6106 ops/sec (0.16ms avg)
  📈 Bun is 1.86x faster (1.86x speedup)
  🥇 🚀 Bun PostgreSQL: 11332 ops/sec
  🥈 🔧 Traditional PostgreSQL (pg): 6106 ops/sec

MYSQL:
  🚀 Bun: 8144 ops/sec (0.12ms avg)
  🔧 Traditional: 5153 ops/sec (0.19ms avg)
  📈 Bun is 1.58x faster (1.58x speedup)
  🥇 🚀 Bun MySQL: 8144 ops/sec
  🥈 🔧 Traditional MySQL (mysql2): 5153 ops/sec

SQLITE: Only one adapter available
  🚀 Bun SQLite: 56723 ops/sec

🎯 Summary:
===========
🚀 Bun adapters average: 25400 ops/sec
🔧 Traditional adapters average: 5629 ops/sec
📈 Bun adapters are 4.51x faster on average

✅ Tested 5 adapters successfully

License
-------

MIT – see `package.json#license`.
