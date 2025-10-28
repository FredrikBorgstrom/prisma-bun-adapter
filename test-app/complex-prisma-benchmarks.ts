import { PrismaClient } from "@prisma/client";
import { createAdapter, type AdapterConfig } from "./lib/db-adapters";
import { databases as testDatabases } from "./setup-test-dbs.ts";

// Summary: Stress-test complex Prisma ORM workloads comparing Bun adapter performance to Prisma's PostgreSQL driver.

const POSTGRES_URL = testDatabases.find((d) => d.name === "PostgreSQL")!.connectionString;

type CaseResult = {
  name: string;
  bunMs: number;
  prismaMs: number;
  winner: "bun" | "prisma" | "tie";
  improvementPct: number; // positive favors winner
};

interface ComplexPrismaBenchmarkSummary {
  summary: string;
  totalCases: number;
  bunWins: number;
  prismaWins: number;
  ties: number;
  averageBunMs: number;
  averagePrismaMs: number;
  overallWinner: "bun" | "prisma" | "tie";
  overallImprovementPct: number;
  highlights: {
    bun: string[];
    neutral: string[];
    prisma: string[];
  };
  results: CaseResult[];
}

function fmt(ms: number) {
  return `${ms.toFixed(2)}ms`;
}

async function time<T>(fn: () => Promise<T>): Promise<{ duration: number; result: T }> {
  const start = performance.now();
  const result = await fn();
  return { duration: performance.now() - start, result };
}

async function ensureDataset(prisma: PrismaClient, opts?: { users?: number; postsPerUser?: [number, number]; tags?: number }): Promise<void> {
  const usersTarget = opts?.users ?? 150;
  const postsRange: [number, number] = opts?.postsPerUser ?? [10, 25];
  const tagsTarget = opts?.tags ?? 40;

  const existingUsers = await prisma.user.count();
  const existingPosts = await prisma.post.count();
  const existingTags = await prisma.tag.count();

  // Tags
  if (existingTags < tagsTarget) {
    const toCreate = Array.from({ length: tagsTarget - existingTags }, (_, i) => ({ name: `tag_${existingTags + i + 1}` }));
    // Create in small batches to avoid hitting parameter limits
    for (let i = 0; i < toCreate.length; i += 20) {
      await prisma.tag.createMany({ data: toCreate.slice(i, i + 20), skipDuplicates: true });
    }
  }

  // Users + Posts (with nested create for realism)
  if (existingUsers < usersTarget) {
    const usersToCreate = usersTarget - existingUsers;
    const tags = await prisma.tag.findMany({ select: { id: true } });

    for (let u = 0; u < usersToCreate; u++) {
      const postCount = Math.floor(Math.random() * (postsRange[1] - postsRange[0] + 1)) + postsRange[0];
      const assigned = new Set<number>();
      const posts = Array.from({ length: postCount }, (_, i) => {
        const tagConnections = [] as { id: number }[];
        const tagAttach = 1 + Math.floor(Math.random() * 3); // 1-3 tags per post
        for (let t = 0; t < tagAttach && tags.length > 0; t++) {
          const idx = Math.floor(Math.random() * tags.length);
          if (!assigned.has(tags[idx]!.id)) {
            assigned.add(tags[idx]!.id);
            tagConnections.push({ id: tags[idx]!.id });
          }
        }
        return {
          title: `Post ${i + 1} of user_${existingUsers + u + 1}`,
          content: "x".repeat(100 + Math.floor(Math.random() * 1000)),
          published: Math.random() < 0.7,
          tags: { connect: tagConnections },
        };
      });

      await prisma.user.create({
        data: {
          email: `user_${existingUsers + u + 1}@example.com`,
          name: `User ${existingUsers + u + 1}`,
          profile: { create: { bio: `Bio for user ${existingUsers + u + 1}` } },
          posts: { create: posts },
        },
      });
    }
  }

  // If post count too low (in case users existed without posts), top up with random posts
  if (existingPosts < usersTarget * postsRange[0]) {
    const deficit = usersTarget * postsRange[0] - existingPosts;
    const users = await prisma.user.findMany({ select: { id: true }, take: Math.min(usersTarget, 500) });
    const userIds = users.map((u) => u.id);
    const data = Array.from({ length: deficit }, (_, i) => ({
      title: `Extra Post ${i + 1}`,
      content: "y".repeat(150 + Math.floor(Math.random() * 1200)),
      published: Math.random() < 0.6,
      authorId: userIds[Math.floor(Math.random() * userIds.length)]!,
    }));
    for (let i = 0; i < data.length; i += 100) {
      await prisma.post.createMany({ data: data.slice(i, i + 100) });
    }
  }
}

async function runComplexPrismaBenchmarks(): Promise<ComplexPrismaBenchmarkSummary> {
  // Use centrally defined test database connection
  process.env.DATABASE_URL = POSTGRES_URL;

  console.log("🚀 Complex Prisma Benchmarks (Bun vs PrismaPg)");
  console.log("=".repeat(80));

  let bun: AdapterConfig | null = null;
  let pg: AdapterConfig | null = null;

  try {
    bun = createAdapter("bun");
    pg = createAdapter("prisma-pg");

    // Warm up and ensure dataset
    console.log("🔧 Warming up and ensuring dataset...");
    await Promise.all([
      bun.prisma.$queryRaw`SELECT 1`,
      pg.prisma.$queryRaw`SELECT 1`,
    ]);
    await ensureDataset(bun.prisma);

    const cases: Array<{
      name: string;
      run: (client: PrismaClient) => Promise<any>;
      iterations?: number; // default 1
    }> = [
      {
        name: "Deep nested include (users -> profile, posts.tags) with filters",
        iterations: 3,
        run: (client) =>
          client.user.findMany({
            take: 50,
            where: { active: true, posts: { some: { published: true } } },
            orderBy: { createdAt: "desc" },
            include: {
              profile: true,
              posts: {
                where: { published: true },
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { tags: true },
              },
              _count: { select: { posts: true } },
            },
          }),
      },
      {
        name: "Aggregation: groupBy author with counts and max timestamps",
        iterations: 3,
        run: (client) =>
          client.post.groupBy({
            by: ["authorId"],
            _count: { id: true },
            _max: { createdAt: true },
            having: { authorId: { _count: { gt: 5 } } },
            orderBy: { _count: { id: "desc" } },
            take: 50,
          }),
      },
      {
        name: "Large IN list (1k post ids)",
        iterations: 3,
        run: async (client) => {
          const ids = await client.post.findMany({ select: { id: true }, take: 1200 });
          const list = ids.slice(0, 1000).map((x) => x.id);
          return client.post.findMany({ where: { id: { in: list } }, take: 1000 });
        },
      },
      {
        name: "Raw SQL: CTE + window function (top posts per user)",
        iterations: 5,
        run: (client) => client.$queryRaw`
          WITH ranked AS (
            SELECT p.id, p."authorId", p."createdAt",
                   ROW_NUMBER() OVER (PARTITION BY p."authorId" ORDER BY p."createdAt" DESC) AS rn
            FROM posts p
            WHERE p.published = true
          )
          SELECT * FROM ranked WHERE rn <= 3
        `,
      },
      {
        name: "Join with many-to-many: posts with tag counts",
        iterations: 3,
        run: (client) => client.$queryRaw`
          SELECT p.id, COUNT(pt."B") as tag_count
          FROM posts p
          LEFT JOIN "_PostToTag" pt ON pt."A" = p.id
          GROUP BY p.id
          ORDER BY tag_count DESC
          LIMIT 100
        `,
      },
      {
        name: "Concurrent: 10x deep relation reads",
        iterations: 1,
        run: async (client) => {
          const ops = Array.from({ length: 10 }, () =>
            client.user.findMany({
              take: 10,
              include: { posts: { take: 3, include: { tags: true } }, profile: true },
            })
          );
          return Promise.all(ops);
        },
      },
    ];

    const results: CaseResult[] = [];

    for (const c of cases) {
      const iters = c.iterations ?? 1;
      console.log(`\n📊 ${c.name} (${iters}x)`);

      // Bun
      let bunTotal = 0;
      for (let i = 0; i < iters; i++) {
        const { duration } = await time(() => c.run(bun!.prisma));
        bunTotal += duration;
      }

      // PrismaPg
      let pgTotal = 0;
      for (let i = 0; i < iters; i++) {
        const { duration } = await time(() => c.run(pg!.prisma));
        pgTotal += duration;
      }

      const bunAvg = bunTotal / iters;
      const pgAvg = pgTotal / iters;
      const winner = bunAvg === pgAvg ? "tie" : bunAvg < pgAvg ? "bun" : "prisma";
      const diff = Math.abs(bunAvg - pgAvg);
      const improvementPct = (diff / Math.max(bunAvg, pgAvg)) * 100;

      console.log(`  🚀 Bun:     ${fmt(bunAvg)}`);
      console.log(`  🔷 Prisma:  ${fmt(pgAvg)}`);
      console.log(
        `  🏁 Winner: ${winner === "tie" ? "tie" : winner} (${improvementPct.toFixed(1)}% diff)`
      );

      results.push({ name: c.name, bunMs: bunAvg, prismaMs: pgAvg, winner, improvementPct });
    }

    // Summary & analysis
    console.log("\n\n🧠 Analysis");
    console.log("=".repeat(80));

    const bunWins = results.filter((r) => r.winner === "bun");
    const prismaWins = results.filter((r) => r.winner === "prisma");
    const ties = results.filter((r) => r.winner === "tie");

    const avgBun = results.reduce((s, r) => s + r.bunMs, 0) / results.length;
    const avgPrisma = results.reduce((s, r) => s + r.prismaMs, 0) / results.length;
    const overall = avgBun < avgPrisma ? "bun" : avgBun > avgPrisma ? "prisma" : "tie";
    const overallPct = Math.abs(avgBun - avgPrisma) / Math.max(avgBun, avgPrisma) * 100;

    console.log(`Total cases: ${results.length}`);
    console.log(`Bun wins:    ${bunWins.length}`);
    console.log(`Prisma wins: ${prismaWins.length}`);
    console.log(`Ties:        ${ties.length}`);
    console.log(`Avg Bun:     ${fmt(avgBun)} | Avg Prisma: ${fmt(avgPrisma)}`);
    console.log(`Overall:     ${overall} (${overallPct.toFixed(1)}% diff)`);

    const shine = bunWins
      .filter((r) => r.improvementPct >= 10)
      .map((r) => `• ${r.name} (+${r.improvementPct.toFixed(1)}%)`);
    const neutral = ties.map((r) => `• ${r.name}`);
    const regress = prismaWins
      .filter((r) => r.improvementPct >= 10)
      .map((r) => `• ${r.name} (+${r.improvementPct.toFixed(1)}%)`);

    console.log("\nWhere Bun adapter shines:");
    console.log(shine.length ? shine.join("\n") : "• No >10% wins in this run");

    console.log("\nWhere differences are neutral:");
    console.log(neutral.length ? neutral.join("\n") : "• None");

    console.log("\nWhere PrismaPg may be faster:");
    console.log(regress.length ? regress.join("\n") : "• No >10% regressions in this run");

    console.log("\n💡 Notes:");
    console.log("- Deep nested includes and many-to-many joins stress query materialization and row mapping.");
    console.log("- Window functions and CTEs run through $queryRaw, showing driver overhead more directly.");
    console.log("- Large IN lists stress parameter handling and template caching.");
    console.log("- Concurrency demo highlights connection and prepared statement reuse.");
    
    const summaryText = [
      `Cases: ${results.length}`,
      `Bun wins: ${bunWins.length}`,
      `Prisma wins: ${prismaWins.length}`,
      `Ties: ${ties.length}`,
      `Average Bun: ${fmt(avgBun)}`,
      `Average Prisma: ${fmt(avgPrisma)}`,
      `Overall winner: ${overall} (${overallPct.toFixed(1)}% diff)`,
    ].join("\n");

    return {
      summary: summaryText,
      totalCases: results.length,
      bunWins: bunWins.length,
      prismaWins: prismaWins.length,
      ties: ties.length,
      averageBunMs: avgBun,
      averagePrismaMs: avgPrisma,
      overallWinner: overall,
      overallImprovementPct: overallPct,
      highlights: {
        bun: shine.length ? shine : ["No >10% wins in this run"],
        neutral: neutral.length ? neutral : ["None"],
        prisma: regress.length ? regress : ["No >10% regressions in this run"],
      },
      results,
    };
  } finally {
    if (bun) await bun.dispose();
    if (pg) await pg.dispose();
  }
}

if (import.meta.main) {
  runComplexPrismaBenchmarks()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Complex benchmark failed:", err instanceof Error ? err.message : String(err));
      process.exit(1);
    });
}

export { runComplexPrismaBenchmarks };
