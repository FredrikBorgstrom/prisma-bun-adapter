import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Client as PgClient } from 'pg';
import { BunPostgresAdapter } from "../src/index.js";

function getBasePgUrl(): string {
  // Prefer test harness env set by setup-test-dbs.ts
  const envUrl = process.env.TEST_POSTGRES_URL || process.env.DATABASE_URL;
  return envUrl ?? 'postgresql://test:test@localhost:5433/test_db';
}

function withSchemaParam(url: string, schema: string): string {
  const u = new URL(url);
  const params = u.searchParams;
  params.set('schema', schema);
  u.search = params.toString();
  return u.toString();
}

function randomSchemaName(prefix = 'panda_role_test'): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${rnd}`;
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true });
}

async function runPrisma(cmd: string, cwd: string) {
  const args = cmd.split(' ').filter(Boolean);
  console.log(`🛠️  prisma ${args.join(' ')} (cwd=${cwd})`);
  // Prefer "bun x prisma" to avoid relying on a separate bunx binary
  const env = { ...process.env } as Record<string, string>;
  if (!env.PANDA_DATABASE_URL && process.env.PANDA_DATABASE_URL) {
    env.PANDA_DATABASE_URL = process.env.PANDA_DATABASE_URL;
  }
  const proc = Bun.spawn({ cmd: ['bun', 'x', 'prisma', ...args], cwd, stdout: 'inherit', stderr: 'inherit', env });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`prisma ${cmd} failed with code ${code}`);
}

export async function runPandaOrganizationRoleTest() {
  const baseUrl = getBasePgUrl();
  const pandaDbUrl = baseUrl; // use public schema for simplicity in this standalone test

  const testAppDir = path.dirname(fileURLToPath(import.meta.url));
  const prismaDir = path.join(testAppDir, 'prisma');
  const outDir = path.join(testAppDir, 'generated', 'panda-client');
  const schemaPath = path.join(prismaDir, 'panda.schema.prisma');

  const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "../generated/panda-client"
}

datasource db {
  provider = "postgresql"
  url      = env("PANDA_DATABASE_URL")
}

model Organization {
  id        String @id @default(cuid(2))
  subdomain String @unique
  name      String

  address String?
  phone   String?
  email   String?
  active  Boolean @default(true)

  encryptionKey String
  keyVersion    Int      @default(1)
  keyRotatedAt  DateTime @default(now())

  subscriptionPlan   String  @default("trial")
  subscriptionStatus String  @default("active")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  settings    OrganizationSettings?
  roles       OrganizationRole[]

  @@map("organization")
}

model OrganizationSettings {
  id String @id @default(cuid(2))
  timezone String @default("Europe/Berlin")
  locale   String @default("de-DE")
  customSettings Json @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  organizationId String @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@map("organization_settings")
}

model OrganizationRole {
  id          String   @id @default(cuid(2))
  name        String
  description String?
  isSystem    Boolean  @default(false)
  permissions String[]
  color       String?  @default("#6b7280")
  priority    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@unique([organizationId, name])
  @@map("organization_role")
}
`;

  console.log('🧪 Panda OrganizationRole test starting');
  console.log(`🔗 Base URL: ${baseUrl}`);
  console.log(`🗂️  Using schema: public`);

  // Write schema and generate client
  await ensureDir(prismaDir);
  await ensureDir(outDir);
  await writeFile(schemaPath, schema, 'utf8');
  console.log(`✍️  Wrote Prisma schema at: ${schemaPath}`);

  // Ensure env var is available for both Prisma CLI and Client
  const prevEnv = process.env.PANDA_DATABASE_URL;
  process.env.PANDA_DATABASE_URL = pandaDbUrl;
  console.log('⚙️  Running prisma generate...');
  await runPrisma(`generate --schema ${schemaPath}`, testAppDir);
  // Instead of db push (which might drop existing public tables), create minimal tables via SQL
  console.log('🧰 Creating minimal tables via SQL');
  {
    const pg = new PgClient({ connectionString: baseUrl });
    await pg.connect();
    await pg.query(`
      DROP TABLE IF EXISTS "public"."organization_role" CASCADE;
      DROP TABLE IF EXISTS "public"."organization_settings" CASCADE;
      DROP TABLE IF EXISTS "public"."organization" CASCADE;
      CREATE TABLE IF NOT EXISTS "public"."organization" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "subdomain" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "address" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "encryptionKey" TEXT NOT NULL,
        "keyVersion" INT NOT NULL DEFAULT 1,
        "keyRotatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "subscriptionPlan" TEXT NOT NULL DEFAULT 'trial',
        "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
        "trialEndsAt" TIMESTAMP,
        "subscriptionEndsAt" TIMESTAMP,
        "stripeCustomerId" TEXT UNIQUE,
        "stripeSubscriptionId" TEXT UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS "public"."organization_settings" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "timezone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
        "locale" TEXT NOT NULL DEFAULT 'de-DE',
        "customSettings" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "organizationId" TEXT UNIQUE REFERENCES "public"."organization"("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "public"."organization_role" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "isSystem" BOOLEAN NOT NULL DEFAULT false,
        "permissions" TEXT[] NOT NULL,
        "color" TEXT NOT NULL DEFAULT '#6b7280',
        "priority" INT NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "organizationId" TEXT NOT NULL REFERENCES "public"."organization"("id") ON DELETE CASCADE,
        UNIQUE ("organizationId", "name")
      );
    `);
    await pg.end();
  }

  // Import generated client dynamically
  const clientModUrl = pathToFileURL(path.join(outDir, 'index.js')).href;
  const { PrismaClient } = (await import(clientModUrl)) as any;

  const adapter = new BunPostgresAdapter(pandaDbUrl);
  // Sanity check direct Bun.sql connectivity with a sanitized URL (schema -> options)
  try {
    const BunSQL = (globalThis as any).Bun?.sql;
    if (BunSQL) {
      const sanitize = (s: string) => {
        try {
          const u = new URL(s);
          const schema = u.searchParams.get('schema');
          if (schema) {
            u.searchParams.delete('schema');
            const existing = u.searchParams.get('options');
            const opt = existing ? `${existing} -c search_path=${schema}` : `-c search_path=${schema}`;
            u.searchParams.set('options', opt);
          }
          return u.toString();
        } catch { return s; }
      };
      const conn = new BunSQL(sanitize(pandaDbUrl));
      const strings = Object.assign(["SELECT 1"], { raw: ["SELECT 1"] }) as TemplateStringsArray;
      await conn(strings);
      console.log('🧪 Bun.sql connectivity check: OK');
    }
  } catch (e) {
    console.error('❌ Bun.sql connectivity check failed:', e);
    throw e;
  }

  const prisma = new PrismaClient({ adapter });

  let cleaned = false;
  let summary: string | undefined;
  try {
    // Create minimal organization
    const org = await prisma.organization.create({
      data: {
        subdomain: 'acme',
        name: 'Acme GmbH',
        encryptionKey: 'test-key',
      },
    });
    console.log(`🏢 Created organization: ${org.id}`);

    // Create role with string[] permissions
    const adminRole = await prisma.organizationRole.create({
      data: {
        name: 'Administrator',
        description: 'Vollzugriff auf alle Funktionen',
        isSystem: true,
        color: '#ef4444',
        priority: 100,
        organizationId: org.id,
        permissions: ['ALL'],
      },
    });
    console.log(`🛡️  Created role: ${adminRole.id} with permissions=${JSON.stringify(adminRole.permissions)}`);

    if (!Array.isArray(adminRole.permissions)) {
      throw new Error('permissions is not an array');
    }
    if (adminRole.permissions.length !== 1 || adminRole.permissions[0] !== 'ALL') {
      throw new Error(`permissions value incorrect: ${JSON.stringify(adminRole.permissions)}`);
    }

    // Verify roundtrip
    const fetched = await prisma.organizationRole.findUnique({ where: { id: adminRole.id } });
    if (!fetched || fetched.permissions[0] !== 'ALL') {
      throw new Error('Failed to roundtrip role with permissions');
    }
    console.log(`🔁 Roundtrip verified: ${JSON.stringify(fetched.permissions)}`);

    summary = `Created OrganizationRole with permissions: ${JSON.stringify(fetched.permissions)}`;
  } finally {
    await prisma?.$disconnect().catch(() => {});
    // Clean up created tables to avoid polluting shared DB
    try {
      const base = new PgClient({ connectionString: baseUrl });
      await base.connect();
      await base.query(`DROP TABLE IF EXISTS "public"."organization_role" CASCADE;`);
      await base.query(`DROP TABLE IF EXISTS "public"."organization_settings" CASCADE;`);
      await base.query(`DROP TABLE IF EXISTS "public"."organization" CASCADE;`);
      await base.end();
      cleaned = true;
      console.log(`🧹 Dropped test tables in public schema`);
    } catch {
      // ignore
    }
    // Restore env var
    if (prevEnv === undefined) delete process.env.PANDA_DATABASE_URL; else process.env.PANDA_DATABASE_URL = prevEnv;
    // Do not return here to avoid overriding success/throw; just log.
  }
  return summary ?? (cleaned ? 'Test finished (cleaned)' : 'Test finished');
}

// Allow running directly: `bun test-app/panda-organization-role.ts`
if (import.meta.main) {
  (async () => {
    try {
      const summary = await runPandaOrganizationRoleTest();
      console.log(`✅ ${summary}`);
      process.exit(0);
    } catch (err) {
      console.error('❌ Panda OrganizationRole test failed:', err);
      process.exit(1);
    }
  })();
}
