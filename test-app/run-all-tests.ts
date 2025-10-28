import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

class ProcessExitError extends Error {
  constructor(public code: number | undefined) {
    super(`Process exit requested with code ${code ?? 0}`);
    this.name = "ProcessExitError";
  }
}

type TestStatus = "passed" | "failed" | "skipped";

interface DiscoveredModule {
  file: string;
  exportNames: string[];
}

interface TestResult {
  file: string;
  exportName: string;
  durationMs: number;
  summary: string;
  status: TestStatus;
  error?: string;
  exitCode?: number;
}

const TEST_FILE_PATTERN = /\.(?:[cm]?js|ts)$/;
const EXPORT_BLOCK_PATTERN = /export\s*\{([\s\S]*?)\};/g;

const TEST_NAME_MATCHERS = [
  (name: string) => name.startsWith("run"),
  (name: string) => name.endsWith("Tests"),
  (name: string) => name.includes("Benchmark"),
  (name: string) => name.includes("Comparison"),
  (name: string) => name.includes("Analysis"),
  (name: string) => name.endsWith("Demo"),
];

const PURPOSE_BY_FILE: Record<string, string> = {
  "bun-vs-prisma-comparison.ts": "Compare Bun adapters and Prisma drivers across shared functional tests.",
  "complex-prisma-benchmarks.ts": "Stress complex Prisma workloads to contrast Bun adapter performance.",
  "complex-sql-benchmarks.ts": "Benchmark heavy SQL scenarios comparing Bun adapter with pg library.",
  "comprehensive-test.ts": "Run comprehensive Prisma adapter regression across CRUD, relations, performance.",
  "multi-adapter-comparison.ts": "Validate Bun adapters on CRUD, transactions, and availability for each database.",
  "performance-comparison.ts": "Measure Bun adapter speed versus traditional drivers (including the sql.js fallback) on unified benchmarks.",
  "quick-comparison-demo.ts": "Demonstrate quick SQLite comparisons between the Bun adapter and the sql.js fallback driver.",
  "sqlite-comparison-demo.ts": "Evaluate Bun and sql.js fallback SQLite adapters across benchmarks and CRUD cases.",
};

function isLikelyTestExport(name: string): boolean {
  const canonical = name.replace(/[^A-Za-z0-9]/g, "");
  if (!canonical) {
    return false;
  }

  const pascal = canonical[0].toUpperCase() + canonical.slice(1);
  return TEST_NAME_MATCHERS.some((matcher) => matcher(pascal));
}

async function discoverTests(dir: string, currentFile: string): Promise<DiscoveredModule[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const modules: DiscoveredModule[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!TEST_FILE_PATTERN.test(entry.name)) continue;
    if (entry.name.endsWith(".d.ts")) continue;
    if (entry.name === currentFile) continue;

    const filePath = path.join(dir, entry.name);
    const content = await readFile(filePath, "utf8");

    const exportNames = new Set<string>();
    for (const match of content.matchAll(EXPORT_BLOCK_PATTERN)) {
      const block = match[1];
      const parts = block.split(",").map((part) => part.trim()).filter(Boolean);

      for (const part of parts) {
        const alias = part.includes(" as ")
          ? part.split(/\s+as\s+/i)[1]
          : part;
        const cleaned = alias?.replace(/[,;]/g, "").trim();
        if (cleaned && isLikelyTestExport(cleaned)) {
          exportNames.add(cleaned);
        }
      }
    }

    if (exportNames.size > 0) {
      modules.push({
        file: entry.name,
        exportNames: Array.from(exportNames).sort(),
      });
    }
  }

  return modules.sort((a, b) => a.file.localeCompare(b.file));
}

function formatSummary(result: unknown): string {
  if (result == null) {
    return "";
  }

  if (typeof result === "string") {
    return result.trim();
  }

  if (Array.isArray(result)) {
    return result.map(formatSummary).filter(Boolean).join("\n");
  }

  if (typeof result === "object") {
    const maybeSummary = (result as Record<string, unknown>).summary;
    if (typeof maybeSummary === "string") {
      return maybeSummary.trim();
    }
    return JSON.stringify(result, null, 2);
  }

  return String(result);
}

async function runTests(baseDir: string, modules: DiscoveredModule[]): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const originalLog = console.log;
  const originalExit = process.exit;

  const totalTests = modules.reduce(
    (sum, module) => sum + module.exportNames.length,
    0,
  );
  let completedTests = 0;

  const subprocessExports = new Map<string, Set<string>>([
    ["quick-comparison-demo.ts", new Set(["runQuickDemo"])],
    ["sqlite-comparison-demo.ts", new Set(["runSQLiteDemo"])],
  ]);

  const runWithMutedConsole = async <T>(fn: () => Promise<T> | T): Promise<T> => {
    console.log = (() => {}) as typeof console.log;
    try {
      return await fn();
    } finally {
      console.log = originalLog;
    }
  };

  process.exit = ((code?: number) => {
    throw new ProcessExitError(code);
  }) as typeof process.exit;

  try {
    for (const module of modules) {
      const moduleUrl = pathToFileURL(path.join(baseDir, module.file)).href;

      let moduleExports: Record<string, unknown> = {};
      try {
        if (!subprocessExports.has(module.file)) {
          moduleExports = await runWithMutedConsole(() => import(moduleUrl));
        }
      } catch (error) {
        if (error instanceof ProcessExitError) {
          const passed = !error.code || error.code === 0;
          originalLog(
            passed
              ? `✅ (${completedTests + 1}/${totalTests}) ${module.file} • (module load) exited ${error.code ?? 0}`
              : `❌ (${completedTests + 1}/${totalTests}) ${module.file} • (module load) exited ${error.code}`,
          );
          completedTests += module.exportNames.length;
          results.push({
            file: module.file,
            exportName: "(module load)",
            durationMs: 0,
            summary: "",
            status: passed ? "passed" : "failed",
            exitCode: error.code,
            error: passed ? undefined : `Exited with code ${error.code}`,
          });
          continue;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        originalLog(`❌ (${completedTests + 1}/${totalTests}) ${module.file} • (module load) failed: ${errorMessage}`);
        completedTests += module.exportNames.length;
        results.push({
          file: module.file,
          exportName: "(module load)",
          durationMs: 0,
          summary: "",
          status: "failed",
          error: errorMessage,
        });
        continue;
      }

      for (const exportName of module.exportNames) {
        const runInSubprocess = subprocessExports.get(module.file)?.has(exportName) ?? false;

        if (runInSubprocess) {
          originalLog(`▶️  (${completedTests + 1}/${totalTests}) ${module.file} • ${exportName}`);
          const subprocessResult = await runDemoInSubprocess(baseDir, module.file);
          completedTests += 1;

          results.push({
            file: module.file,
            exportName,
            durationMs: subprocessResult.durationMs,
            summary: subprocessResult.summary,
            status: subprocessResult.success ? "passed" : "failed",
            error: subprocessResult.success ? undefined : subprocessResult.error,
          });

          if (subprocessResult.success) {
            originalLog(`   ✅ Completed in ${subprocessResult.durationMs.toFixed(2)}ms`);
          } else {
            originalLog(`   ❌ Failed: ${subprocessResult.error ?? "Unknown error"}`);
          }

          continue;
        }

        const candidate = moduleExports[exportName];
        if (typeof candidate !== "function") {
          originalLog(`⏭️  (${completedTests + 1}/${totalTests}) ${module.file} • ${exportName} — skipped (not callable)`);
          results.push({
            file: module.file,
            exportName,
            durationMs: 0,
            summary: "",
            status: "skipped",
            error: `Export "${exportName}" is not callable.`,
          });
          completedTests += 1;
          continue;
        }

        const runner = candidate as () => unknown;
        const startedAt = performance.now();
        originalLog(`▶️  (${completedTests + 1}/${totalTests}) ${module.file} • ${exportName}`);

        try {
          const output = await runWithMutedConsole(() => runner());
          const durationMs = performance.now() - startedAt;
          const summary = formatSummary(output);

          completedTests += 1;
          originalLog(`   ✅ Completed in ${durationMs.toFixed(2)}ms`);

          results.push({
            file: module.file,
            exportName,
            durationMs,
            summary,
            status: "passed",
          });
        } catch (error) {
          const durationMs = performance.now() - startedAt;
          completedTests += 1;

          if (error instanceof ProcessExitError) {
            const passed = !error.code || error.code === 0;
            originalLog(
              passed
                ? `   ✅ Completed (exit ${error.code ?? 0})`
                : `   ❌ Failed (exit ${error.code})`,
            );
            results.push({
              file: module.file,
              exportName,
              durationMs,
              summary: "",
              status: passed ? "passed" : "failed",
              exitCode: error.code,
              error: passed ? undefined : `Exited with code ${error.code}`,
            });
            continue;
          }

          const errorMessage = error instanceof Error ? error.message : String(error);
          originalLog(`   ❌ Failed: ${errorMessage}`);
          results.push({
            file: module.file,
            exportName,
            durationMs,
            summary: "",
            status: "failed",
            error: errorMessage,
          });
        }
      }
    }
  } finally {
    console.log = originalLog;
    process.exit = originalExit;
  }

  return results;
}

async function runDemoInSubprocess(baseDir: string, fileName: string): Promise<{ success: boolean; summary: string; durationMs: number; error?: string }> {
  const command = Bun.spawn({
    cmd: ["bun", fileName],
    cwd: baseDir,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      BUN_ADAPTER_SUMMARY_JSON: "1",
    },
  });

  const start = performance.now();
  const stdoutPromise = new Response(command.stdout).text();
  const stderrPromise = new Response(command.stderr).text();
  const exitCode = await command.exited;
  const durationMs = performance.now() - start;

  const stdout = (await stdoutPromise).trim();
  const stderr = (await stderrPromise).trim();

  if (exitCode !== 0) {
    return {
      success: false,
      summary: "",
      durationMs,
      error: stderr || `Exited with code ${exitCode}`,
    };
  }

  let summary = "";
  if (stdout) {
    const firstLine = stdout.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
    try {
      const parsed = JSON.parse(firstLine) as { summary?: string };
      if (typeof parsed.summary === "string") {
        summary = parsed.summary;
      } else {
        summary = stdout;
      }
    } catch {
      summary = stdout;
    }
  }

  return {
    success: true,
    summary,
    durationMs,
  };
}

function printReport(results: TestResult[]): void {
  const log = console.log.bind(console);

  if (results.length === 0) {
    log("No test runners found. Export async functions like `runAllTests` to register a test.");
    return;
  }

  log("🧪 Aggregated Test Report");
  log("========================");

  for (const result of results) {
    const header = `${result.file} • ${result.exportName} (${result.durationMs.toFixed(2)}ms)`;
    const purpose = PURPOSE_BY_FILE[result.file];

    switch (result.status) {
      case "passed": {
        log(`\n✅ ${header}`);
        if (purpose) {
          log(`** ${purpose} **`);
        }
        if (result.summary) {
          const expanded = expandDatabaseSummary(result.summary);
          log(expanded);
        } else {
          log("   (No summary returned)");
        }
        
        break;
      }
      case "failed": {
        log(`\n❌ ${header}`);
        if (purpose) {
          log(`** ${purpose} **`);
        }
        if (result.error) {
          log(`   ${result.error}`);
        }
       
        break;
      }
      case "skipped": {
        log(`\n⏭️  ${header}`);
        if (purpose) {
          log(`** ${purpose} **`);
        }
        if (result.error) {
          log(`   ${result.error}`);
        } else {
          log("   (Skipped)");
        }
        break;
      }
    }
  }
}

function expandDatabaseSummary(summary: string): string {
  const lines = summary.split(/\r?\n/);
  const headers = ["POSTGRESQL:", "MYSQL:", "SQLITE:"];

  if (!lines.some((line) => headers.some((header) => line.trim().startsWith(header)))) {
    return summary;
  }

  const introLines: string[] = [];
  const sectionMap = new Map<string, string[]>();
  let currentSection: string | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const matchedHeader = headers.find((header) => line.startsWith(header));
    if (matchedHeader) {
      currentSection = matchedHeader.slice(0, -1);
      if (!sectionMap.has(currentSection)) {
        sectionMap.set(currentSection, []);
      }
      continue;
    }

    if (currentSection) {
      sectionMap.get(currentSection)!.push(line);
    } else {
      introLines.push(line);
    }
  }

  const result: string[] = [...introLines];

  headers.forEach((header) => {
    const name = header.slice(0, -1);
    const entries = sectionMap.get(name);
    if (entries && entries.length > 0) {
      if (result.length > 0) {
        result.push("");
      }
      result.push(`** ${name} **`);
      entries.forEach((entry) => {
        result.push(`- ${entry}`);
      });
    }
  });

  return result.join("\n");
}

async function main(): Promise<void> {
  const currentPath = fileURLToPath(import.meta.url);
  const baseDir = path.dirname(currentPath);
  const currentFile = path.basename(currentPath);

  const modules = await discoverTests(baseDir, currentFile);
  const results = await runTests(baseDir, modules);
  printReport(results);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to run aggregated tests:", error);
    process.exit(1);
  });
