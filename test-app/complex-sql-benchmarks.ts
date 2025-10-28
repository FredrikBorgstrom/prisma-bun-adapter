import { BunPostgresAdapter } from "../src/index.js";
import { databases as testDatabases } from "./setup-test-dbs.ts";

// Summary: Benchmark raw SQL workloads comparing Bun's adapter to pg across heavy aggregations, JSON, and concurrency.

const POSTGRES_URL = testDatabases.find((d) => d.name === "PostgreSQL")!.connectionString;

type Runner = {
  name: string;
  query: (client: SqlClient) => Promise<any>;
  iterations?: number;
};

type SqlClient = {
  kind: "bun" | "pg";
  query: (sql: string, args?: any[]) => Promise<any>;
  execute: (sql: string, args?: any[]) => Promise<any>;
  close: () => Promise<void>;
};

type CaseResult = {
  name: string;
  bunMs: number;
  pgMs: number;
  winner: "bun" | "pg" | "tie";
  improvementPct: number;
};

interface ComplexSqlBenchmarkSummary {
  summary: string;
  totalCases: number;
  bunWins: number;
  pgWins: number;
  ties: number;
  averageBunMs: number;
  averagePgMs: number;
  overallWinner: "bun" | "pg" | "tie";
  overallImprovementPct: number;
  highlights: {
    bun: string[];
    pg: string[];
  };
  results: CaseResult[];
}

function fmt(ms: number) {
  return `${ms.toFixed(2)}ms`;
}

async function time<T>(fn: () => Promise<T>): Promise<number> {
  const s = performance.now();
  await fn();
  return performance.now() - s;
}

async function createBunClient(conn: string): Promise<SqlClient> {
  const adapter = new BunPostgresAdapter(conn);
  const driver = await adapter.connect();
  return {
    kind: "bun",
    query: async (sql: string, args: any[] = []) => {
      const res = await driver.queryRaw({ sql, args });
      return res.rows;
    },
    execute: async (sql: string, args: any[] = []) => {
      return driver.executeRaw({ sql, args });
    },
    close: async () => {
      await driver.dispose();
    },
  };
}

async function createPgClient(conn: string): Promise<SqlClient> {
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: conn, max: 10 });
  return {
    kind: "pg",
    query: async (sql: string, args: any[] = []) => {
      const { rows } = await pool.query(sql, args);
      return rows;
    },
    execute: async (sql: string, args: any[] = []) => {
      await pool.query(sql, args);
      return { affectedRows: 0 };
    },
    close: async () => {
      await pool.end();
    },
  };
}

async function seedDataset(client: SqlClient): Promise<void> {
  // Create isolated benchmark tables to avoid interfering with Prisma tables
  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS bench_users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS bench_posts (
      id SERIAL PRIMARY KEY,
      author_id INT NOT NULL REFERENCES bench_users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      published BOOLEAN NOT NULL DEFAULT TRUE,
      content TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS bench_tags (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS bench_post_tag (
      post_id INT NOT NULL REFERENCES bench_posts(id) ON DELETE CASCADE,
      tag_id INT NOT NULL REFERENCES bench_tags(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS bench_events (
      id SERIAL PRIMARY KEY,
      payload JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
  ];

  for (const stmt of schemaStatements) {
    await client.execute(stmt);
  }

  // Quick counts
  const users = (await client.query(`SELECT COUNT(*)::int AS c FROM bench_users`))[0]?.c ?? 0;
  const posts = (await client.query(`SELECT COUNT(*)::int AS c FROM bench_posts`))[0]?.c ?? 0;
  const tags = (await client.query(`SELECT COUNT(*)::int AS c FROM bench_tags`))[0]?.c ?? 0;

  if (tags < 50) {
    const values = Array.from({ length: 50 - tags }, (_, i) => `('btag_${tags + i + 1}')`).join(",");
    await client.execute(`INSERT INTO bench_tags(name) VALUES ${values} ON CONFLICT DO NOTHING`);
  }

  if (users < 200) {
    // Use generate_series for fast seeding
    await client.execute(`
      INSERT INTO bench_users(name)
      SELECT 'user_' || g FROM generate_series(${users + 1}, 200) g;
    `);
  }

  if (posts < 4000) {
    await client.execute(`
      INSERT INTO bench_posts(author_id, created_at, published, content)
      SELECT (floor(random()*200)::int + 1),
             NOW() - make_interval(days => floor(random()*365)::int),
             (random() < 0.75),
             repeat('x', (100 + floor(random()*1500)::int))
      FROM generate_series(${posts + 1}, 4000);
    `);

    // Attach tags randomly
    await client.execute(`
      INSERT INTO bench_post_tag(post_id, tag_id)
      SELECT p.id, (floor(random()*50)::int + 1)
      FROM bench_posts p
      WHERE p.id > ${posts}
      AND (random() < 0.6);
    `);
  }

  // Seed JSONB events for JSON workload if table is small
  const evs = (await client.query(`SELECT COUNT(*)::int AS c FROM bench_events`))[0]?.c ?? 0;
  if (evs < 3000) {
    await client.execute(`
      INSERT INTO bench_events(payload)
      SELECT jsonb_build_object(
        'user', 'user_' || (floor(random()*200)::int + 1),
        'type', (ARRAY['click','view','purchase'])[(floor(random()*3)::int + 1)],
        'value', floor(random()*1000)::int,
        'tags', (SELECT jsonb_agg(name) FROM (
                  SELECT name FROM bench_tags ORDER BY random() LIMIT 3
                ) t)
      )
      FROM generate_series(${evs + 1}, 3000);
    `);
  }
}

async function runComplexSqlBenchmarks(): Promise<ComplexSqlBenchmarkSummary> {
  const conn = POSTGRES_URL;

  console.log("🚀 Complex SQL Benchmarks (Bun vs pg)");
  console.log("=".repeat(80));

  let bun: SqlClient | null = null;
  let pg: SqlClient | null = null;

  try {
    bun = await createBunClient(conn);
    pg = await createPgClient(conn);

    // Warm up
    await Promise.all([bun.query("SELECT 1"), pg.query("SELECT 1")]);

    // Seed dataset (once)
    console.log("🔧 Seeding/ensuring dataset...");
    await seedDataset(bun);

    const runners: Runner[] = [
      {
        name: "CTE + window (top 3 posts per user)",
        iterations: 3,
        query: (c) => c.query(`
          WITH ranked AS (
            SELECT p.id, p.author_id, p.created_at,
                   ROW_NUMBER() OVER (PARTITION BY p.author_id ORDER BY p.created_at DESC) AS rn
            FROM bench_posts p
            WHERE p.published = TRUE
          )
          SELECT * FROM ranked WHERE rn <= 3
        `),
      },
      {
        name: "Join + aggregation (tag counts per post)",
        iterations: 3,
        query: (c) => c.query(`
          SELECT p.id, COUNT(pt.tag_id) AS tag_count
          FROM bench_posts p
          LEFT JOIN bench_post_tag pt ON pt.post_id = p.id
          GROUP BY p.id
          ORDER BY tag_count DESC
          LIMIT 500
        `),
      },
      {
        name: "Aggregation heavy (avg content length per user)",
        iterations: 3,
        query: (c) => c.query(`
          SELECT u.id, AVG(length(p.content)) AS avg_len, COUNT(*) AS cnt
          FROM bench_users u
          JOIN bench_posts p ON p.author_id = u.id
          WHERE p.published = TRUE
          GROUP BY u.id
          HAVING COUNT(*) > 5
          ORDER BY avg_len DESC
          LIMIT 200
        `),
      },
      {
        name: "JSONB filter + aggregation",
        iterations: 5,
        query: (c) => c.query(`
          SELECT payload->>'type' AS type, COUNT(*) AS cnt, AVG(CAST(payload->>'value' AS INT)) AS avg_val
          FROM bench_events
          WHERE (payload->>'value')::int > 100
          GROUP BY payload->>'type'
        `),
      },
      {
        name: "Large parameter list (1000 ids)",
        iterations: 3,
        query: async (c) => {
          const rows = await c.query(`SELECT id FROM bench_posts ORDER BY id DESC LIMIT 1200`);
          const ids = rows.slice(0, 1000).map((r: any) => r.id);
          const params = ids.map((_, i) => `$${i + 1}`).join(",");
          return c.query(`SELECT * FROM bench_posts WHERE id IN (${params})`, ids);
        },
      },
      {
        name: "Concurrency: 10x window queries",
        iterations: 1,
        query: async (c) => {
          const sql = `
            WITH ranked AS (
              SELECT p.id, p.author_id, p.created_at,
                     ROW_NUMBER() OVER (PARTITION BY p.author_id ORDER BY p.created_at DESC) AS rn
              FROM bench_posts p
              WHERE p.published = TRUE
            )
            SELECT * FROM ranked WHERE rn <= 3
          `;
          await Promise.all(Array.from({ length: 10 }, () => c.query(sql)));
        },
      },
    ];

    const results: CaseResult[] = [];

    for (const r of runners) {
      const it = r.iterations ?? 1;
      console.log(`\n📊 ${r.name} (${it}x)`);

      let bunTotal = 0;
      for (let i = 0; i < it; i++) bunTotal += await time(() => r.query(bun!));

      let pgTotal = 0;
      for (let i = 0; i < it; i++) pgTotal += await time(() => r.query(pg!));

      const bunAvg = bunTotal / it;
      const pgAvg = pgTotal / it;
      const winner = bunAvg === pgAvg ? "tie" : bunAvg < pgAvg ? "bun" : "pg";
      const diff = Math.abs(bunAvg - pgAvg);
      const improvementPct = (diff / Math.max(bunAvg, pgAvg)) * 100;

      console.log(`  🚀 Bun: ${fmt(bunAvg)}  |  🔧 pg: ${fmt(pgAvg)}  => 🏁 ${winner} (${improvementPct.toFixed(1)}%)`);
      results.push({ name: r.name, bunMs: bunAvg, pgMs: pgAvg, winner, improvementPct });
    }

    // Summary
    console.log("\n\n🧠 Analysis");
    console.log("=".repeat(80));
    const bunWins = results.filter((r) => r.winner === "bun");
    const pgWins = results.filter((r) => r.winner === "pg");
    const ties = results.filter((r) => r.winner === "tie");

    const avgBun = results.reduce((s, r) => s + r.bunMs, 0) / results.length;
    const avgPg = results.reduce((s, r) => s + r.pgMs, 0) / results.length;
    const overall = avgBun < avgPg ? "bun" : avgBun > avgPg ? "pg" : "tie";
    const overallPct = Math.abs(avgBun - avgPg) / Math.max(avgBun, avgPg) * 100;

    console.log(`Total cases: ${results.length}`);
    console.log(`Bun wins:    ${bunWins.length}`);
    console.log(`pg wins:     ${pgWins.length}`);
    console.log(`Ties:        ${ties.length}`);
    console.log(`Avg Bun:     ${fmt(avgBun)} | Avg pg: ${fmt(avgPg)}`);
    console.log(`Overall:     ${overall} (${overallPct.toFixed(1)}% diff)`);

    const shine = bunWins.filter((r) => r.improvementPct >= 10).map((r) => `• ${r.name} (+${r.improvementPct.toFixed(1)}%)`);
    const regress = pgWins.filter((r) => r.improvementPct >= 10).map((r) => `• ${r.name} (+${r.improvementPct.toFixed(1)}%)`);

    console.log("\nWhere Bun adapter shines:");
    console.log(shine.length ? shine.join("\n") : "• No >10% wins in this run");

    console.log("\nWhere pg may be faster:");
    console.log(regress.length ? regress.join("\n") : "• No >10% regressions in this run");

    console.log("\n💡 Notes:");
    console.log("- Tests emphasize SQL-side complexity (CTEs, windows, JSONB) to minimize ORM overhead.");
    console.log("- Large parameter lists probe placeholder translation and template caching.");
    console.log("- Concurrency case highlights scheduling and connection reuse behavior.");
    
    const summaryText = [
      `Cases: ${results.length}`,
      `Bun wins: ${bunWins.length}`,
      `pg wins: ${pgWins.length}`,
      `Ties: ${ties.length}`,
      `Average Bun: ${fmt(avgBun)}`,
      `Average pg: ${fmt(avgPg)}`,
      `Overall winner: ${overall} (${overallPct.toFixed(1)}% diff)`,
    ].join("\n");

    return {
      summary: summaryText,
      totalCases: results.length,
      bunWins: bunWins.length,
      pgWins: pgWins.length,
      ties: ties.length,
      averageBunMs: avgBun,
      averagePgMs: avgPg,
      overallWinner: overall,
      overallImprovementPct: overallPct,
      highlights: {
        bun: shine.length ? shine : ["No >10% wins in this run"],
        pg: regress.length ? regress : ["No >10% regressions in this run"],
      },
      results,
    };
  } finally {
    if (bun) await bun.close();
    if (pg) await pg.close();
  }
}

if (import.meta.main) {
  runComplexSqlBenchmarks()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Failed:", err instanceof Error ? err.message : String(err));
      process.exit(1);
    });
}

export { runComplexSqlBenchmarks };
