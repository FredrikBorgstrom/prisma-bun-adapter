#!/usr/bin/env bun

/**
 * Quick setup script for test databases using Docker
 * Run with: bun run test-app/setup-test-dbs.ts
 */

import { $ } from "bun";

export interface DatabaseConfig {
  name: string;
  containerName: string;
  image: string;
  port: number;
  envVars: Record<string, string>;
  connectionString: string;
  envVarName: string;
  // Optional server runtime configuration flags, e.g. { max_connections: 200 }
  // For Postgres, these are passed as: -c key=value
  serverConfig?: Record<string, string | number>;
}

export const databases: DatabaseConfig[] = [
  {
    name: "PostgreSQL",
    containerName: "test-postgres",
    image: "postgres:15",
    port: 5433,
    envVars: {
      POSTGRES_USER: "test",
      POSTGRES_PASSWORD: "test",
      POSTGRES_DB: "test_db",
    },
    // Increase default connection limit for tests
    // Override with TEST_POSTGRES_MAX_CONNECTIONS env var
    serverConfig: {
      max_connections: process.env.TEST_POSTGRES_MAX_CONNECTIONS || 200
    },
    connectionString: "postgresql://test:test@localhost:5433/test_db",
    envVarName: "TEST_POSTGRES_URL",
  },
  {
    name: "MySQL",
    containerName: "test-mysql",
    image: "mysql:8.0",
    port: 3306,
    envVars: {
      MYSQL_ROOT_PASSWORD: "root",
      MYSQL_USER: "test",
      MYSQL_PASSWORD: "test",
      MYSQL_DATABASE: "test_db",
    },
    connectionString: "mysql://test:test@localhost:3306/test_db",
    envVarName: "TEST_MYSQL_URL",
  },
];

async function checkDocker(): Promise<boolean> {
  try {
    await $`docker info`.quiet();
    return true;
  } catch {
    return false;
  }
}

async function isContainerRunning(containerName: string): Promise<boolean> {
  try {
    const result = await $`docker ps --filter name=${containerName} --format "{{.Names}}"`.text();
    return result.trim() === containerName;
  } catch {
    return false;
  }
}

async function isPortInUse(port: number): Promise<boolean> {
  try {
    await $`lsof -i :${port}`.quiet();
    return true;
  } catch {
    return false;
  }
}

async function startDatabase(db: DatabaseConfig): Promise<boolean> {
  console.log(`🚀 Starting ${db.name}...`);

  // Check if container is already running
  if (await isContainerRunning(db.containerName)) {
    console.log(`  ✅ ${db.name} container is already running`);
    return true;
  }

  // Check if port is in use
  if (await isPortInUse(db.port)) {
    console.log(`  ⚠️  Port ${db.port} is already in use. ${db.name} might already be running.`);
    return false;
  }

  try {
    // Remove existing container if it exists
    await $`docker rm ${db.containerName}`.quiet();
  } catch {
    // Container doesn't exist, that's fine
  }

  try {
    // Build environment variables for docker run
    const envArgs = Object.entries(db.envVars)
      .flatMap(([key, value]) => ["-e", `${key}=${value}`]);

    // Start the container
    const internalPort = db.name === "PostgreSQL" ? 5432 : db.port;
    
    // Build optional server args (e.g., Postgres: -c max_connections=200)
    const serverArgs = db.serverConfig
      ? Object.entries(db.serverConfig).flatMap(([key, value]) => ["-c", `${key}=${value}`])
      : [];

    await $`docker run --name ${db.containerName} ${envArgs} -p ${db.port}:${internalPort} -d ${db.image} ${serverArgs}`.quiet();

    // Wait for the database to be ready
    console.log(`  ⏳ Waiting for ${db.name} to be ready...`);
    
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        // Try to connect to verify it's ready
        if (db.name === "PostgreSQL") {
          await $`docker exec ${db.containerName} pg_isready -U test`.quiet();
        } else if (db.name === "MySQL") {
          await $`docker exec ${db.containerName} mysqladmin ping -h localhost -u test -ptest`.quiet();
        }
        break;
      } catch {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (attempts >= maxAttempts) {
      console.log(`  ❌ ${db.name} failed to start within ${maxAttempts} seconds`);
      return false;
    }

    console.log(`  ✅ ${db.name} is ready!`);
    if (db.serverConfig && Object.keys(db.serverConfig).length > 0) {
      console.log("  ⚙️  Server config:");
      for (const [k, v] of Object.entries(db.serverConfig)) {
        console.log(`     - ${k}=${v}`);
      }
    }
    console.log(`  📝 Connection string: ${db.connectionString}`);
    console.log(`  🔧 Environment variable: export ${db.envVarName}="${db.connectionString}"`);
    
    return true;
  } catch (error) {
    console.log(`  ❌ Failed to start ${db.name}: ${error}`);
    return false;
  }
}

async function stopDatabase(db: DatabaseConfig): Promise<void> {
  console.log(`🛑 Stopping ${db.name}...`);
  
  try {
    await $`docker stop ${db.containerName}`.quiet();
    await $`docker rm ${db.containerName}`.quiet();
    console.log(`  ✅ ${db.name} stopped and removed`);
  } catch {
    console.log(`  ⚠️  ${db.name} container not found or already stopped`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || "start";

  console.log("🗄️  Database Setup Script for Prisma Bun Adapter Testing\n");

  // Check if Docker is available
  if (!(await checkDocker())) {
    console.log("❌ Docker is not available. Please install Docker first.");
    console.log("Visit: https://docs.docker.com/get-docker/");
    process.exit(1);
  }

  if (command === "stop") {
    console.log("🧹 Stopping test databases...\n");
    
    for (const db of databases) {
      await stopDatabase(db);
    }
    
    console.log("\n✅ All test databases stopped");
    return;
  }

  if (command === "start") {
    console.log("🚀 Setting up test databases...\n");
    
    const results: Array<{ db: DatabaseConfig; success: boolean }> = [];
    
    for (const db of databases) {
      const success = await startDatabase(db);
      results.push({ db, success });
      console.log();
    }

    // Summary
    console.log("📊 Setup Summary:");
    console.log("================");
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length > 0) {
      console.log("\n✅ Successfully started:");
      successful.forEach(({ db }) => {
        console.log(`  • ${db.name} on port ${db.port}`);
      });
      
      console.log("\n🔧 Environment variables to set:");
      successful.forEach(({ db }) => {
        console.log(`export ${db.envVarName}="${db.connectionString}"`);
      });
    }
    
    if (failed.length > 0) {
      console.log("\n❌ Failed to start:");
      failed.forEach(({ db }) => {
        console.log(`  • ${db.name}`);
      });
    }
    
    console.log("\n🧪 To run tests:");
    console.log("bun run test-app/multi-adapter-comparison.ts");
    
    console.log("\n🛑 To stop databases:");
    console.log("bun run test-app/setup-test-dbs.ts stop");
    
    return;
  }

  console.log("Usage:");
  console.log("  bun run test-app/setup-test-dbs.ts [command]");
  console.log("");
  console.log("Commands:");
  console.log("  start        Start test databases (default)");
  console.log("  stop         Stop and remove test databases");
}

if (import.meta.main) {
  main().catch(console.error);
}
