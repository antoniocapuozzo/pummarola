# Pummarola 🍅

A rapid boilerplate for canonical frontend development with Pug, PostCSS, TypeScript, Vite and Bun.

Built to stay lightweight: no legacy task runner, no heavy framework assumptions, a small core, and a fast feedback loop for prototyping.

## Getting Ready

### Setup

Make sure you have `Bun` installed. The project declares `bun@1.3.5` as its expected package manager and requires Bun `>=1.3.5`.

Clone the repo and enter the project:

```bash
git clone https://github.com/antoniocapuozzo/pummarola.git
cd pummarola
```

Install dependencies:

```bash
bun install
```

After install, Pummarola registers its local CLI automatically, so the `pummarola` command is available right away.

## Commands

- `pummarola` opens the interactive CLI menu
- `pummarola start` starts Vite, opens the browser and rebuilds Pug pages with live reload
- `pummarola build` runs TypeScript checks and creates the production bundle
- `pummarola preview` serves the production build locally
- `pummarola create component <name>` scaffolds a matching Pug component and CSS partial
- `pummarola create page <name>` scaffolds a new page in `source/markup/pages`
- `pummarola create section <name>` scaffolds a reusable section mixin and CSS partial
- `pummarola create layout <name>` scaffolds a new layout and matching CSS partial
- `pummarola delete component <name>` removes a generated component and its linked imports
- `pummarola delete page <name>` removes a generated page
- `pummarola delete section <name>` removes a generated section and its linked imports
- `pummarola delete layout <name>` removes a generated layout and its linked import
- `pummarola doctor` checks project structure and convention alignment
- `bun start` runs the same default development workflow
- `bun run build` runs the same production build workflow
- `bun run preview` previews the production build locally
- `bun run typecheck` checks TypeScript without generating output

## Workflow

- Put page templates in `source/markup/pages`
- Put shared layouts in `source/markup/layouts`
- Put global Pug utilities in `source/markup/utils`, such as `icon`, `placeholder`, `date`, `loop` and `ipsum`
- Put reusable UI mixins in `source/markup/components` when a project needs generated components
- Put reusable page sections in `source/markup/sections` when a project needs generated sections
- Put browser scripts in `source/scripts`
- Put styles in `source/styles`
- Use `source/styles/core` for shared foundations such as reset, breakpoints, design tokens, fonts and icon helpers
- Put component styles in `source/styles/components` when using generated components
- Put section styles in `source/styles/sections` when using generated sections
- Put layout styles in `source/styles/layouts` when using generated layouts
- Put source fonts in `source/fonts`
- Use `public` only for static files that should be copied as-is, such as favicons, social images or manifest files
- During development and build, Pummarola compiles Pug pages into temporary HTML entries that Vite can serve or bundle, then cleans them up
- Build output is generated in `dist`
- Production assets use relative paths, but production HTML should still be tested through `pummarola preview` or another static web server because Vite outputs JavaScript modules

## Core Utilities

The default markup starts intentionally clean: `source/markup/pages/index.pug` provides direct `header`, `main` and `footer` landmarks, while shared behavior lives in utility files.

- `source/markup/utils/icon.pug` exposes `+iconSprite()` and `+icon(...)` for inline SVG sprite usage
- `source/markup/utils/placeholder.pug` supports fixed and responsive placeholder images with optional links and alt text
- `source/styles/core/_fontface.css` registers the bundled Geist and Geist Mono fonts
- `source/styles/core/_icon.css` provides the base `.site-icon` and hidden `.site-icons` sprite styles

## Global and Page Assets

Pummarola keeps shared assets global and lets each page append only what it needs.

- `source/styles/app.css` is the shared stylesheet entry for core foundations, reusable components and styles used across multiple pages
- `source/scripts/app.ts` is the shared script entry for behavior that should run everywhere
- Page-only styles can live in `source/styles/pages`, for example `source/styles/pages/start.css`
- Page-only scripts can live in `source/scripts/pages`, for example `source/scripts/pages/start.ts`
- Page templates can append their own CSS and JavaScript through the `style` and `script` blocks exposed by `source/markup/layouts/base.pug`

Example:

```pug
block append style
  link(rel='stylesheet' href='/source/styles/pages/start.css')

block append script
  script(type='module' src='/source/scripts/pages/start.ts')
```

During production builds, every Pug page in `source/markup/pages` is registered as a Vite HTML entry automatically. Shared assets are bundled once, while page-specific CSS and JavaScript are emitted as separate assets when needed.

## Dependency Baseline

Current package versions are intentionally kept modern and minimal:

- `@clack/prompts` `^1.6.0`
- `@types/bun` `^1.3.14`
- `@types/node` `^26.0.1`
- `@types/pug` `^2.0.10`
- `postcss` `^8.5.16`
- `postcss-preset-env` `^11.3.2`
- `pug` `^3.0.4`
- `typescript` `^6.0.3`
- `vite` `^8.1.0`

## Stack

- [Bun](https://bun.sh)
- [Clack](https://www.clack.cc/)
- [Pug](https://pugjs.org)
- [PostCSS](https://postcss.org)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)

## Current Structure

```bash
.
├── dist
├── public
├── source
│   ├── fonts
│   │   ├── geist
│   │   └── geist-mono
│   ├── cli
│   ├── markup
│   │   ├── components
│   │   ├── layouts
│   │   ├── pages
│   │   └── utils
│   ├── scripts
│   │   └── pages
│   └── styles
│       ├── components
│       ├── core
│       └── pages
├── package.json
├── postcss.config.js
└── tsconfig.json
```

`components`, `sections` and `layouts` style folders are created by the CLI as soon as a project scaffolds those artifact types.

## Notes

This documentation is still evolving alongside the boilerplate itself.

`public` can stay in the project even if it is empty. It is optional during development, but useful as a conventional home for static assets that do not belong in `source`.

Last update: 30/06/2026
