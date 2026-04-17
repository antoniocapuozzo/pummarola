import { rmSync } from "node:fs";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import pug from "pug";
import { defineConfig, type Plugin } from "vite";

const projectRoot = process.cwd();
const markupRoot = path.join(projectRoot, "source/markup");
const pagesDir = path.join(markupRoot, "pages");
const logPrefix = "🍅 Pummarola";

async function listPugPages(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listPugPages(fullPath);
      }

      return entry.name.endsWith(".pug") ? [fullPath] : [];
    }),
  );

  return pages.flat();
}

function toOutputPath(pagePath: string): string {
  const relativePage = path.relative(pagesDir, pagePath);
  return path.join(projectRoot, relativePage.replace(/\.pug$/, ".html"));
}

async function buildMarkup(): Promise<string[]> {
  try {
    await stat(pagesDir);
  } catch {
    return [];
  }

  const pages = await listPugPages(pagesDir);

  return Promise.all(
    pages.map(async (pagePath) => {
      // Compile each Pug page into a real HTML entry that Vite can serve.
      const html = pug.renderFile(pagePath, {
        basedir: markupRoot,
        filename: pagePath,
      });
      const outputPath = toOutputPath(pagePath);

      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${html}\n`);

      return outputPath;
    }),
  );
}

async function cleanupGeneratedMarkup(outputPaths: Iterable<string>): Promise<void> {
  await Promise.all(
    Array.from(outputPaths, async (outputPath) => {
      await rm(outputPath, { force: true });
    }),
  );
}

function cleanupGeneratedMarkupSync(outputPaths: Iterable<string>): number {
  const paths = Array.from(outputPaths);

  for (const outputPath of paths) {
    // Remove only generated HTML entries, never source files or build output.
    rmSync(outputPath, { force: true });
  }

  return paths.length;
}

function pugPagesPlugin(): Plugin {
  let buildQueue = Promise.resolve();
  let generatedOutputs = new Set<string>();
  let cleanupRegistered = false;

  const queueBuild = async (onDone?: () => void) => {
    buildQueue = buildQueue
      .then(async () => {
        // Rebuild all page entries from source/markup/pages before Vite serves them.
        const outputs = await buildMarkup();
        generatedOutputs = new Set(outputs);

        if (outputs.length > 0) {
          console.info(`${logPrefix} built ${outputs.length} page(s) from Pug`);
        }

        onDone?.();
      })
      .catch((error) => {
        console.error(`${logPrefix} failed to build markup`);
        console.error(error);
      });

    await buildQueue;
  };

  const queueCleanup = async () => {
    if (generatedOutputs.size === 0) {
      return;
    }

    const outputsToCleanup = generatedOutputs;
    generatedOutputs = new Set();

    await cleanupGeneratedMarkup(outputsToCleanup);
    console.info(`${logPrefix} removed ${outputsToCleanup.size} generated HTML file(s)`);
  };

  const registerCleanup = (cleanup: () => Promise<void>) => {
    if (cleanupRegistered) {
      return;
    }

    cleanupRegistered = true;

    const runCleanup = () => {
      // Use sync cleanup on process exit so generated entries do not remain in root.
      const removedCount = cleanupGeneratedMarkupSync(generatedOutputs);
      generatedOutputs = new Set();

      if (removedCount > 0) {
        console.info(`${logPrefix} removed ${removedCount} generated HTML file(s)`);
      }
    };

    process.once("SIGINT", runCleanup);
    process.once("SIGTERM", runCleanup);
    process.once("exit", runCleanup);
  };

  return {
    name: "pummarola-pug-pages",
    configResolved(config) {
      if (config.command === "serve") {
        // Cleanup is needed only in dev, where HTML entries are temporary.
        registerCleanup(queueCleanup);
      }
    },
    async buildStart() {
      await queueBuild();
    },
    async configureServer(server) {
      await queueBuild();

      // Watch the whole markup tree so layouts, pages and utils all trigger reloads.
      server.watcher.add(markupRoot);
      server.watcher.on("change", async (file) => {
        if (!file.endsWith(".pug")) {
          return;
        }

        await queueBuild(() => {
          server.ws.send({ type: "full-reload" });
        });
      });

      server.watcher.on("add", async (file) => {
        if (!file.endsWith(".pug")) {
          return;
        }

        await queueBuild(() => {
          server.ws.send({ type: "full-reload" });
        });
      });

      server.watcher.on("unlink", async (file) => {
        if (!file.endsWith(".pug")) {
          return;
        }

        // Remove the matching generated HTML when a page source disappears.
        const deletedOutput = toOutputPath(file);
        generatedOutputs.delete(deletedOutput);
        await rm(deletedOutput, { force: true });

        await queueBuild(() => {
          server.ws.send({ type: "full-reload" });
        });
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [pugPagesPlugin()],
  server: {
    host: "0.0.0.0",
    open: true,
  },
});
