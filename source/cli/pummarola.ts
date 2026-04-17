#!/usr/bin/env bun

import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import * as p from "@clack/prompts";

type Command = "start" | "build" | "preview" | "create" | "delete" | "doctor";
type ArtifactKind = "component" | "page" | "section" | "layout";
type InteractiveAction =
  | "start"
  | "build"
  | "preview"
  | "create"
  | "delete"
  | "doctor"
  | "help";
type DoctorStatus = "pass" | "warn" | "fail";
type DoctorCheck = {
  title: string;
  status: DoctorStatus;
  detail: string;
};

const root = process.cwd();
const appCssPath = path.join(root, "source/styles/app.css");
const baseLayoutPath = path.join(root, "source/markup/layouts/base.pug");
const componentsDir = path.join(root, "source/markup/components");
const componentStylesDir = path.join(root, "source/styles/components");
const sectionsDir = path.join(root, "source/markup/sections");
const sectionStylesDir = path.join(root, "source/styles/sections");
const layoutStylesDir = path.join(root, "source/styles/layouts");
const pagesDir = path.join(root, "source/markup/pages");
const scriptsEntryPath = path.join(root, "source/scripts/app.ts");

const [, , command, ...rawArgs] = process.argv;

function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toPascalCase(value: string): string {
  return toKebabCase(value)
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join("");
}

function cancelIfNeeded<T>(value: T): T {
  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}

function ensureString(value: string | symbol): string {
  if (typeof value !== "string") {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}

function ensureBoolean(value: boolean | symbol): boolean {
  if (typeof value !== "boolean") {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}

async function ensureProjectFile(filePath: string, label: string): Promise<void> {
  try {
    await stat(filePath);
  } catch {
    p.log.error(`Missing ${label}: ${path.relative(root, filePath)}`);
    process.exit(1);
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(directory: string, extension: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => path.join(directory, entry.name))
      .sort();
  } catch {
    return [];
  }
}

async function runScript(scriptName: "__dev" | "__build" | "__preview"): Promise<void> {
  const child = Bun.spawn(["bun", "run", scriptName], {
    cwd: root,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await child.exited;

  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

async function promptName(kind: ArtifactKind, initial?: string): Promise<string> {
  if (initial) {
    return toKebabCase(initial);
  }

  const response = cancelIfNeeded(
    await p.text({
      message: `What is the ${kind} name?`,
      placeholder:
        kind === "component"
          ? "button"
          : kind === "page"
            ? "about"
            : kind === "section"
              ? "hero"
              : "marketing",
      validate(value) {
        return value.trim().length === 0 ? `Please enter a ${kind} name.` : undefined;
      },
    }),
  );

  return toKebabCase(ensureString(response));
}

async function confirmOverwrite(targetPath: string): Promise<boolean> {
  if (!(await fileExists(targetPath))) {
    return true;
  }

  return ensureBoolean(
    cancelIfNeeded(
      await p.confirm({
        message: `${path.relative(root, targetPath)} already exists. Overwrite it?`,
        initialValue: false,
      }),
    ),
  );
}

async function confirmRemoval(label: string): Promise<boolean> {
  return ensureBoolean(
    cancelIfNeeded(
      await p.confirm({
        message: `Remove ${label}?`,
        initialValue: false,
      }),
    ),
  );
}

async function insertIncludeIntoBaseLayout(includeLine: string): Promise<void> {
  const source = await readFile(baseLayoutPath, "utf8");

  if (source.includes(includeLine)) {
    return;
  }

  const lines = source.split("\n");
  let insertAt = 0;

  while (insertAt < lines.length && lines[insertAt].startsWith("include ")) {
    insertAt += 1;
  }

  lines.splice(insertAt, 0, includeLine);
  await writeFile(baseLayoutPath, `${lines.join("\n").trimEnd()}\n`);
}

async function insertImportIntoAppCss(importLine: string, groupPrefix?: string): Promise<void> {
  const source = await readFile(appCssPath, "utf8");

  if (source.includes(importLine)) {
    return;
  }

  const lines = source.split("\n");
  let insertAt = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim();

    if (groupPrefix && trimmedLine === "") {
      continue;
    }

    if (groupPrefix && trimmedLine.startsWith(`@import "${groupPrefix}`)) {
      insertAt = index + 1;
      continue;
    }

    if (trimmedLine.startsWith("@import ")) {
      insertAt = index + 1;
    }
  }

  if (insertAt === -1) {
    insertAt = 0;
  }

  lines.splice(insertAt, 0, importLine);

  await writeFile(appCssPath, `${lines.join("\n").trimEnd()}\n`);
}

async function removeLineIfPresent(filePath: string, lineToRemove: string): Promise<void> {
  const source = await readFile(filePath, "utf8");
  const nextSource = source
    .split("\n")
    .filter((line) => line.trim() !== lineToRemove.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  await writeFile(filePath, `${nextSource.trimEnd()}\n`);
}

async function createComponent(nameArg?: string): Promise<void> {
  await ensureProjectFile(appCssPath, "source/styles/app.css");
  await ensureProjectFile(baseLayoutPath, "source/markup/layouts/base.pug");

  const name = await promptName("component", nameArg);
  const mixinName = toPascalCase(name).replace(/^[A-Z]/, (char) => char.toLowerCase());
  const markupPath = path.join(componentsDir, `${name}.pug`);
  const stylePath = path.join(componentStylesDir, `_${name}.css`);

  const shouldWriteMarkup = await confirmOverwrite(markupPath);
  if (!shouldWriteMarkup) {
    p.cancel("Component creation cancelled.");
    return;
  }

  const shouldWriteStyle = await confirmOverwrite(stylePath);
  if (!shouldWriteStyle) {
    p.cancel("Component creation cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start(`Creating component "${name}"`);

  await mkdir(componentsDir, { recursive: true });
  await mkdir(componentStylesDir, { recursive: true });

  const componentName = toPascalCase(name);
  const markupTemplate = `//- ${componentName} component.\n//- @author Pummarola\n//- Usage: +${mixinName}({ label: '${componentName}' })\n\nmixin ${mixinName}(props = {})\n  - var label = props.label || '${componentName}'\n\n  .${name}&attributes(attributes)\n    if block\n      block\n    else\n      = label\n`;

  const styleTemplate = `/*\n// ----------------------------------\n// 🍅 Pummarola ${componentName}\n// ----------------------------------\n*/\n\n.${name} {\n  display: block;\n}\n`;

  await writeFile(markupPath, markupTemplate);
  await writeFile(stylePath, styleTemplate);
  await insertIncludeIntoBaseLayout(`include ../components/${name}`);
  await insertImportIntoAppCss(`@import "components/_${name}.css";`, "components/");

  spinner.stop(`Component "${name}" created`);
  p.note(
    [`Markup: ${path.relative(root, markupPath)}`, `Styles: ${path.relative(root, stylePath)}`].join("\n"),
    "Generated files",
  );
}

async function createPage(nameArg?: string): Promise<void> {
  await ensureProjectFile(baseLayoutPath, "source/markup/layouts/base.pug");

  const name = await promptName("page", nameArg);
  const pagePath = path.join(pagesDir, `${name}.pug`);
  const shouldWrite = await confirmOverwrite(pagePath);

  if (!shouldWrite) {
    p.cancel("Page creation cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start(`Creating page "${name}"`);

  await mkdir(pagesDir, { recursive: true });

  const pageTemplate = `extends ../layouts/base\n\nblock content\n  main(class="site-main" role="main")\n    .site-shell\n      h1 ${toPascalCase(name)}\n`;

  await writeFile(pagePath, pageTemplate);

  spinner.stop(`Page "${name}" created`);
  p.note(path.relative(root, pagePath), "Generated file");
}

async function createSection(nameArg?: string): Promise<void> {
  await ensureProjectFile(appCssPath, "source/styles/app.css");
  await ensureProjectFile(baseLayoutPath, "source/markup/layouts/base.pug");

  const name = await promptName("section", nameArg);
  const mixinName = `${toKebabCase(name)
    .split("-")
    .filter(Boolean)
    .map((chunk, index) => (index === 0 ? chunk : chunk.charAt(0).toUpperCase() + chunk.slice(1)))
    .join("")}Section`;
  const sectionName = toPascalCase(name);
  const sectionClassName = `${name}-section`;
  const sectionTitleClassName = `site-${name}-section-title`;
  const markupPath = path.join(sectionsDir, `${name}.pug`);
  const stylePath = path.join(sectionStylesDir, `_${name}.css`);

  const shouldWriteMarkup = await confirmOverwrite(markupPath);
  if (!shouldWriteMarkup) {
    p.cancel("Section creation cancelled.");
    return;
  }

  const shouldWriteStyle = await confirmOverwrite(stylePath);
  if (!shouldWriteStyle) {
    p.cancel("Section creation cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start(`Creating section "${name}"`);

  await mkdir(sectionsDir, { recursive: true });
  await mkdir(sectionStylesDir, { recursive: true });

  const markupTemplate = `//- ${sectionName} section.\n//- @author Pummarola\n//- Usage: +${mixinName}()\n//- Usage: +${mixinName}({ heading: '${sectionName}' })\n//- Usage: +${mixinName}({ heading: '${sectionName}' })(class='is-highlighted')\n\nmixin ${mixinName}(props = {})\n  - var heading = props.heading || 'Title'\n\n  section.${sectionClassName}&attributes(attributes)\n    .site-shell\n      .${sectionTitleClassName}\n        h1= heading\n\n      if block\n        block\n`;

  const styleTemplate = `/*\n// ----------------------------------\n// 🍅 Pummarola ${sectionName} Section\n// ----------------------------------\n*/\n\n.${sectionClassName} {\n  padding-block: var(--space-xxl);\n}\n\n.${sectionTitleClassName} {\n  margin-bottom: var(--space-lg);\n}\n`;

  await writeFile(markupPath, markupTemplate);
  await writeFile(stylePath, styleTemplate);
  await insertIncludeIntoBaseLayout(`include ../sections/${name}`);
  await insertImportIntoAppCss(`@import "sections/_${name}.css";`, "sections/");

  spinner.stop(`Section "${name}" created`);
  p.note(
    [`Markup: ${path.relative(root, markupPath)}`, `Styles: ${path.relative(root, stylePath)}`].join("\n"),
    "Generated files",
  );
}

async function createLayout(nameArg?: string): Promise<void> {
  await ensureProjectFile(appCssPath, "source/styles/app.css");

  const name = await promptName("layout", nameArg);
  const layoutName = toPascalCase(name);
  const markupPath = path.join(root, "source/markup/layouts", `${name}.pug`);
  const stylePath = path.join(layoutStylesDir, `_${name}.css`);

  const shouldWriteMarkup = await confirmOverwrite(markupPath);
  if (!shouldWriteMarkup) {
    p.cancel("Layout creation cancelled.");
    return;
  }

  const shouldWriteStyle = await confirmOverwrite(stylePath);
  if (!shouldWriteStyle) {
    p.cancel("Layout creation cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start(`Creating layout "${name}"`);

  await mkdir(path.dirname(markupPath), { recursive: true });
  await mkdir(layoutStylesDir, { recursive: true });

  const markupTemplate = `doctype html\nhtml(lang="en")\n  head\n    meta(charset="utf-8")\n    meta(name="viewport", content="width=device-width, initial-scale=1.0")\n    block title\n      title Pummarola | ${layoutName}\n    link(rel="stylesheet", href="/source/styles/app.css")\n  body(class="${name}-layout")\n    block content\n    block script\n      script(type="module", src="/source/scripts/app.ts")\n`;

  const styleTemplate = `/*\n// ----------------------------------\n// 🍅 Pummarola ${layoutName} Layout\n// ----------------------------------\n*/\n\n.${name}-layout {\n  min-height: 100vh;\n}\n`;

  await writeFile(markupPath, markupTemplate);
  await writeFile(stylePath, styleTemplate);
  await insertImportIntoAppCss(`@import "layouts/_${name}.css";`, "layouts/");

  spinner.stop(`Layout "${name}" created`);
  p.note(
    [`Markup: ${path.relative(root, markupPath)}`, `Styles: ${path.relative(root, stylePath)}`].join("\n"),
    "Generated files",
  );
}

async function promptArtifactKind(initial?: string, action = "create"): Promise<ArtifactKind> {
  if (initial === "component" || initial === "page" || initial === "section" || initial === "layout") {
    return initial;
  }

  const response = cancelIfNeeded(
    await p.select({
      message: `What do you want to ${action}?`,
      options: [
        { label: "Component", value: "component" },
        { label: "Page", value: "page" },
        { label: "Section", value: "section" },
        { label: "Layout", value: "layout" },
      ],
    }),
  );

  return ensureString(response) as ArtifactKind;
}

async function promptAction(): Promise<InteractiveAction> {
  const response = cancelIfNeeded(
    await p.select({
      message: "What do you want to do?",
      options: [
        { label: "Start", value: "start", hint: "Open Vite with live reload" },
        { label: "Build", value: "build", hint: "Create production output" },
        { label: "Preview", value: "preview", hint: "Serve the dist bundle locally" },
        { label: "Create", value: "create", hint: "Choose what to scaffold" },
        { label: "Delete", value: "delete", hint: "Choose what to remove" },
        { label: "Doctor", value: "doctor", hint: "Check project structure and conventions" },
        { label: "Show", value: "help", hint: "Print CLI reference" },
      ],
    }),
  );

  return ensureString(response) as InteractiveAction;
}

async function removeComponent(nameArg?: string): Promise<void> {
  await ensureProjectFile(appCssPath, "source/styles/app.css");
  await ensureProjectFile(baseLayoutPath, "source/markup/layouts/base.pug");

  const name = await promptName("component", nameArg);
  const markupPath = path.join(componentsDir, `${name}.pug`);
  const stylePath = path.join(componentStylesDir, `_${name}.css`);
  const includeLine = `include ../components/${name}`;
  const importLine = `@import "components/_${name}.css";`;

  const hasMarkup = await fileExists(markupPath);
  const hasStyle = await fileExists(stylePath);

  if (!hasMarkup && !hasStyle) {
    p.log.warn(`Nothing to remove for component "${name}".`);
    return;
  }

  const confirmed = await confirmRemoval(`component "${name}"`);
  if (!confirmed) {
    p.cancel("Removal cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start(`Removing component "${name}"`);

  if (hasMarkup) {
    await rm(markupPath, { force: true });
  }

  if (hasStyle) {
    await rm(stylePath, { force: true });
  }

  await removeLineIfPresent(baseLayoutPath, includeLine);
  await removeLineIfPresent(appCssPath, importLine);

  spinner.stop(`Component "${name}" removed`);
}

async function removePage(nameArg?: string): Promise<void> {
  const name = await promptName("page", nameArg);
  const pagePath = path.join(pagesDir, `${name}.pug`);

  if (!(await fileExists(pagePath))) {
    p.log.warn(`Page "${name}" does not exist.`);
    return;
  }

  const confirmed = await confirmRemoval(`page "${name}"`);
  if (!confirmed) {
    p.cancel("Removal cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start(`Removing page "${name}"`);

  await rm(pagePath, { force: true });

  spinner.stop(`Page "${name}" removed`);
}

async function removeSection(nameArg?: string): Promise<void> {
  await ensureProjectFile(appCssPath, "source/styles/app.css");
  await ensureProjectFile(baseLayoutPath, "source/markup/layouts/base.pug");

  const name = await promptName("section", nameArg);
  const markupPath = path.join(sectionsDir, `${name}.pug`);
  const stylePath = path.join(sectionStylesDir, `_${name}.css`);
  const includeLine = `include ../sections/${name}`;
  const importLine = `@import "sections/_${name}.css";`;

  const hasMarkup = await fileExists(markupPath);
  const hasStyle = await fileExists(stylePath);

  if (!hasMarkup && !hasStyle) {
    p.log.warn(`Nothing to remove for section "${name}".`);
    return;
  }

  const confirmed = await confirmRemoval(`section "${name}"`);
  if (!confirmed) {
    p.cancel("Removal cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start(`Removing section "${name}"`);

  if (hasMarkup) {
    await rm(markupPath, { force: true });
  }

  if (hasStyle) {
    await rm(stylePath, { force: true });
  }

  await removeLineIfPresent(baseLayoutPath, includeLine);
  await removeLineIfPresent(appCssPath, importLine);

  spinner.stop(`Section "${name}" removed`);
}

async function removeLayout(nameArg?: string): Promise<void> {
  await ensureProjectFile(appCssPath, "source/styles/app.css");

  const name = await promptName("layout", nameArg);
  const markupPath = path.join(root, "source/markup/layouts", `${name}.pug`);
  const stylePath = path.join(layoutStylesDir, `_${name}.css`);
  const importLine = `@import "layouts/_${name}.css";`;

  if (name === "base") {
    p.log.warn('The "base" layout cannot be deleted through the CLI.');
    return;
  }

  const hasMarkup = await fileExists(markupPath);
  const hasStyle = await fileExists(stylePath);

  if (!hasMarkup && !hasStyle) {
    p.log.warn(`Nothing to remove for layout "${name}".`);
    return;
  }

  const confirmed = await confirmRemoval(`layout "${name}"`);
  if (!confirmed) {
    p.cancel("Removal cancelled.");
    return;
  }

  const spinner = p.spinner();
  spinner.start(`Removing layout "${name}"`);

  if (hasMarkup) {
    await rm(markupPath, { force: true });
  }

  if (hasStyle) {
    await rm(stylePath, { force: true });
  }

  await removeLineIfPresent(appCssPath, importLine);

  spinner.stop(`Layout "${name}" removed`);
}

async function createArtifact(kindArg?: string, nameArg?: string): Promise<void> {
  const kind = await promptArtifactKind(kindArg, "create");

  if (kind === "component") {
    await createComponent(nameArg);
    return;
  }

  if (kind === "section") {
    await createSection(nameArg);
    return;
  }

  if (kind === "layout") {
    await createLayout(nameArg);
    return;
  }

  await createPage(nameArg);
}

async function removeArtifact(kindArg?: string, nameArg?: string): Promise<void> {
  const kind = await promptArtifactKind(kindArg, "delete");

  if (kind === "component") {
    await removeComponent(nameArg);
    return;
  }

  if (kind === "section") {
    await removeSection(nameArg);
    return;
  }

  if (kind === "layout") {
    await removeLayout(nameArg);
    return;
  }

  await removePage(nameArg);
}

function parseMarkupIncludes(source: string, directory: string): Set<string> {
  const pattern = new RegExp(`^include \\.\\.\\/${directory}\\/([a-z0-9-]+)$`, "gm");
  const matches = source.matchAll(pattern);
  return new Set(Array.from(matches, (match) => match[1]));
}

function parseStyleImports(source: string, directory: string): Set<string> {
  const pattern = new RegExp(`^@import "${directory}\\/_([a-z0-9-]+)\\.css";$`, "gm");
  const matches = source.matchAll(pattern);
  return new Set(Array.from(matches, (match) => match[1]));
}

function collectImportLines(source: string): string[] {
  return source
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("@import "));
}

function pushCheck(checks: DoctorCheck[], title: string, status: DoctorStatus, detail: string): void {
  checks.push({ title, status, detail });
}

async function runDoctor(): Promise<void> {
  const spinner = p.spinner();
  spinner.start("Running Pummarola doctor");

  const checks: DoctorCheck[] = [];

  const [hasBaseLayout, hasAppCss, hasScriptEntry] = await Promise.all([
    fileExists(baseLayoutPath),
    fileExists(appCssPath),
    fileExists(scriptsEntryPath),
  ]);

  pushCheck(
    checks,
    "Core files",
    hasBaseLayout && hasAppCss && hasScriptEntry ? "pass" : "fail",
    [
      hasBaseLayout ? "layouts/base.pug" : "missing layouts/base.pug",
      hasAppCss ? "styles/app.css" : "missing styles/app.css",
      hasScriptEntry ? "scripts/app.ts" : "missing scripts/app.ts",
    ].join(" | "),
  );

  const [
    componentMarkupFiles,
    sectionMarkupFiles,
    layoutMarkupFiles,
    componentStyleFiles,
    sectionStyleFiles,
    layoutStyleFiles,
    pageFiles,
    baseLayoutSource,
    appCssSource,
  ] = await Promise.all([
    listFiles(componentsDir, ".pug"),
    listFiles(sectionsDir, ".pug"),
    listFiles(path.join(root, "source/markup/layouts"), ".pug"),
    listFiles(componentStylesDir, ".css"),
    listFiles(sectionStylesDir, ".css"),
    listFiles(layoutStylesDir, ".css"),
    listFiles(pagesDir, ".pug"),
    hasBaseLayout ? readFile(baseLayoutPath, "utf8") : Promise.resolve(""),
    hasAppCss ? readFile(appCssPath, "utf8") : Promise.resolve(""),
  ]);

  const componentNames = new Set(componentMarkupFiles.map((file) => path.basename(file, ".pug")));
  const sectionNames = new Set(sectionMarkupFiles.map((file) => path.basename(file, ".pug")));
  const layoutNames = new Set(
    layoutMarkupFiles
      .map((file) => path.basename(file, ".pug"))
      .filter((name) => name !== "base"),
  );
  const componentStyleNames = new Set(componentStyleFiles.map((file) => path.basename(file, ".css").replace(/^_/, "")));
  const sectionStyleNames = new Set(sectionStyleFiles.map((file) => path.basename(file, ".css").replace(/^_/, "")));
  const layoutStyleNames = new Set(layoutStyleFiles.map((file) => path.basename(file, ".css").replace(/^_/, "")));
  const includedComponents = parseMarkupIncludes(baseLayoutSource, "components");
  const includedSections = parseMarkupIncludes(baseLayoutSource, "sections");
  const importedComponents = parseStyleImports(appCssSource, "components");
  const importedSections = parseStyleImports(appCssSource, "sections");
  const importedLayouts = parseStyleImports(appCssSource, "layouts");

  const componentsMissingStyle = Array.from(componentNames).filter((name) => !componentStyleNames.has(name));
  const stylesMissingComponent = Array.from(componentStyleNames).filter((name) => !componentNames.has(name));
  const componentsMissingInclude = Array.from(componentNames).filter((name) => !includedComponents.has(name));
  const staleIncludes = Array.from(includedComponents).filter((name) => !componentNames.has(name));
  const componentsMissingImport = Array.from(componentNames).filter((name) => !importedComponents.has(name));
  const staleImports = Array.from(importedComponents).filter((name) => !componentNames.has(name));

  pushCheck(
    checks,
    "Component pairs",
    componentsMissingStyle.length === 0 && stylesMissingComponent.length === 0 ? "pass" : "warn",
    componentsMissingStyle.length === 0 && stylesMissingComponent.length === 0
      ? `${componentNames.size} component pair(s) aligned`
      : [
          componentsMissingStyle.length > 0 ? `missing CSS: ${componentsMissingStyle.join(", ")}` : null,
          stylesMissingComponent.length > 0 ? `missing Pug: ${stylesMissingComponent.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
  );

  const sectionsMissingStyle = Array.from(sectionNames).filter((name) => !sectionStyleNames.has(name));
  const stylesMissingSection = Array.from(sectionStyleNames).filter((name) => !sectionNames.has(name));
  pushCheck(
    checks,
    "Section pairs",
    sectionsMissingStyle.length === 0 && stylesMissingSection.length === 0 ? "pass" : "warn",
    sectionsMissingStyle.length === 0 && stylesMissingSection.length === 0
      ? `${sectionNames.size} section pair(s) aligned`
      : [
          sectionsMissingStyle.length > 0 ? `missing CSS: ${sectionsMissingStyle.join(", ")}` : null,
          stylesMissingSection.length > 0 ? `missing Pug: ${stylesMissingSection.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
  );

  const layoutsMissingStyle = Array.from(layoutNames).filter((name) => !layoutStyleNames.has(name));
  const stylesMissingLayout = Array.from(layoutStyleNames).filter((name) => !layoutNames.has(name));
  pushCheck(
    checks,
    "Layout pairs",
    layoutsMissingStyle.length === 0 && stylesMissingLayout.length === 0 ? "pass" : "warn",
    layoutsMissingStyle.length === 0 && stylesMissingLayout.length === 0
      ? `${layoutNames.size} custom layout pair(s) aligned`
      : [
          layoutsMissingStyle.length > 0 ? `missing CSS: ${layoutsMissingStyle.join(", ")}` : null,
          stylesMissingLayout.length > 0 ? `missing Pug: ${stylesMissingLayout.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
  );

  pushCheck(
    checks,
    "Base layout includes",
    componentsMissingInclude.length === 0 && staleIncludes.length === 0 ? "pass" : "warn",
    componentsMissingInclude.length === 0 && staleIncludes.length === 0
      ? "all components are included in layouts/base.pug"
      : [
          componentsMissingInclude.length > 0 ? `missing include: ${componentsMissingInclude.join(", ")}` : null,
          staleIncludes.length > 0 ? `stale include: ${staleIncludes.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
  );

  const sectionsMissingInclude = Array.from(sectionNames).filter((name) => !includedSections.has(name));
  const staleSectionIncludes = Array.from(includedSections).filter((name) => !sectionNames.has(name));
  pushCheck(
    checks,
    "Base layout section includes",
    sectionsMissingInclude.length === 0 && staleSectionIncludes.length === 0 ? "pass" : "warn",
    sectionsMissingInclude.length === 0 && staleSectionIncludes.length === 0
      ? "all sections are included in layouts/base.pug"
      : [
          sectionsMissingInclude.length > 0 ? `missing include: ${sectionsMissingInclude.join(", ")}` : null,
          staleSectionIncludes.length > 0 ? `stale include: ${staleSectionIncludes.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
  );

  pushCheck(
    checks,
    "CSS imports",
    componentsMissingImport.length === 0 && staleImports.length === 0 ? "pass" : "warn",
    componentsMissingImport.length === 0 && staleImports.length === 0
      ? "all component styles are imported in app.css"
      : [
          componentsMissingImport.length > 0 ? `missing import: ${componentsMissingImport.join(", ")}` : null,
          staleImports.length > 0 ? `stale import: ${staleImports.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
  );

  const sectionsMissingImport = Array.from(sectionNames).filter((name) => !importedSections.has(name));
  const staleSectionImports = Array.from(importedSections).filter((name) => !sectionNames.has(name));
  pushCheck(
    checks,
    "Section CSS imports",
    sectionsMissingImport.length === 0 && staleSectionImports.length === 0 ? "pass" : "warn",
    sectionsMissingImport.length === 0 && staleSectionImports.length === 0
      ? "all section styles are imported in app.css"
      : [
          sectionsMissingImport.length > 0 ? `missing import: ${sectionsMissingImport.join(", ")}` : null,
          staleSectionImports.length > 0 ? `stale import: ${staleSectionImports.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
  );

  const layoutsMissingImport = Array.from(layoutNames).filter((name) => !importedLayouts.has(name));
  const staleLayoutImports = Array.from(importedLayouts).filter((name) => !layoutNames.has(name));
  pushCheck(
    checks,
    "Layout CSS imports",
    layoutsMissingImport.length === 0 && staleLayoutImports.length === 0 ? "pass" : "warn",
    layoutsMissingImport.length === 0 && staleLayoutImports.length === 0
      ? "all custom layout styles are imported in app.css"
      : [
          layoutsMissingImport.length > 0 ? `missing import: ${layoutsMissingImport.join(", ")}` : null,
          staleLayoutImports.length > 0 ? `stale import: ${staleLayoutImports.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
  );

  const importLines = collectImportLines(appCssSource);
  const importOrderValid = appCssSource
    .split("\n")
    .every((line, index, lines) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("@import ")) {
        return true;
      }

      return lines.slice(0, index).every((previousLine) => {
        const previous = previousLine.trim();
        return (
          previous === "" ||
          previous.startsWith("/*") ||
          previous.startsWith("//") ||
          previous.startsWith("*") ||
          previous.startsWith("@import ")
        );
      });
    });

  pushCheck(
    checks,
    "Import placement",
    importOrderValid ? "pass" : "fail",
    importOrderValid ? `${importLines.length} import(s) are grouped before style rules` : "app.css has imports after CSS rules",
  );

  const pageSources = await Promise.all(
    pageFiles.map(async (filePath) => ({
      filePath,
      source: await readFile(filePath, "utf8"),
    })),
  );

  const pagesMissingExtends = pageSources
    .filter(({ source }) => !source.includes("extends ../layouts/base"))
    .map(({ filePath }) => path.basename(filePath, ".pug"));

  pushCheck(
    checks,
    "Page layout usage",
    pagesMissingExtends.length === 0 ? "pass" : "warn",
    pagesMissingExtends.length === 0
      ? `${pageFiles.length} page(s) extend layouts/base`
      : `missing extends ../layouts/base: ${pagesMissingExtends.join(", ")}`,
  );

  spinner.stop("Doctor finished");

  const iconByStatus: Record<DoctorStatus, string> = {
    pass: "OK",
    warn: "WARN",
    fail: "FAIL",
  };

  for (const check of checks) {
    p.log.message(`${iconByStatus[check.status]} ${check.title}: ${check.detail}`);
  }

  const summary = {
    pass: checks.filter((check) => check.status === "pass").length,
    warn: checks.filter((check) => check.status === "warn").length,
    fail: checks.filter((check) => check.status === "fail").length,
  };

  const summaryStatus = summary.fail > 0 ? "Doctor found blocking issues." : summary.warn > 0 ? "Doctor found a few warnings." : "Doctor looks healthy.";

  p.note(
    [`Passed: ${summary.pass}`, `Warnings: ${summary.warn}`, `Failures: ${summary.fail}`].join("\n"),
    summaryStatus,
  );
}

async function showHelp(): Promise<void> {
  p.note(
    [
      "pummarola",
      "pummarola start",
      "pummarola build",
      "pummarola preview",
      "pummarola create component <name>",
      "pummarola create page <name>",
      "pummarola create section <name>",
      "pummarola create layout <name>",
      "pummarola delete component <name>",
      "pummarola delete page <name>",
      "pummarola delete section <name>",
      "pummarola delete layout <name>",
      "pummarola doctor",
    ].join("\n"),
    "Available commands",
  );
}

async function main(): Promise<void> {
  p.intro("🍅 Pummarola");

  switch (command as Command | undefined) {
    case "start":
      await runScript("__dev");
      break;
    case "build":
      await runScript("__build");
      break;
    case "preview":
      await runScript("__preview");
      break;
    case "create":
      await createArtifact(rawArgs[0], rawArgs[1]);
      break;
    case "delete":
      await removeArtifact(rawArgs[0], rawArgs[1]);
      break;
    case "doctor":
      await runDoctor();
      break;
    default:
      switch (await promptAction()) {
        case "start":
          await runScript("__dev");
          break;
        case "build":
          await runScript("__build");
          break;
        case "preview":
          await runScript("__preview");
          break;
        case "create":
          await createArtifact();
          break;
        case "delete":
          await removeArtifact();
          break;
        case "doctor":
          await runDoctor();
          break;
        default:
          await showHelp();
          break;
      }
      break;
  }

  p.outro("Pummarola is ready.");
}

main().catch((error) => {
  p.log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
