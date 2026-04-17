# Pummarola 🍅

A rapid boilerplate for canonical frontend development with Pug, PostCSS, TypeScript, Vite and Bun.

Built to stay lightweight: no legacy task runner, no heavy framework assumptions, and a fast feedback loop for prototyping.

## Getting Ready

### Setup

Make sure you have `Bun` installed.
The project declares Bun as its expected package manager in `package.json`.

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
- Put reusable UI mixins in `source/markup/components`
- Put reusable page sections in `source/markup/sections`
- Put shared layouts and mixins in `source/markup/layouts` and `source/markup/utils`
- Put browser scripts in `source/scripts`
- Put styles in `source/styles`
- Put component styles in `source/styles/components`
- Put section styles in `source/styles/sections`
- Put layout styles in `source/styles/layouts`
- Use `source/styles/core` for shared foundations such as reset, breakpoints and design tokens
- Use `public` only for static files that should be copied as-is, such as favicons, social images or manifest files
- Build output is generated in `dist`
- Production assets use relative paths, so `dist/index.html` can also be opened directly when needed

## VSCode Snippets

Pummarola now ships with project-local VSCode snippets in `.vscode/pummarola.code-snippets`.

- `comm` inserts the shared multi-line CSS comment block
- `med` inserts a breakpoint with Pummarola custom media tokens such as `--mq-tablet`
- `cl` inserts a quick `console.log(...)` in JavaScript and TypeScript files

The workspace also maps `*.css` files to `postcss` in `.vscode/settings.json`, so PostCSS-oriented snippets and editor support behave more naturally with Pummarola's syntax.

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
│   ├── markup
│   │   ├── components
│   │   ├── layouts
│   │   ├── pages
│   │   ├── sections
│   │   └── utils
│   ├── scripts
│   └── styles
│       ├── components
│       ├── layouts
│       ├── sections
│       └── core
├── package.json
├── postcss.config.js
└── tsconfig.json
```

## Notes

This documentation is still evolving alongside the boilerplate itself.

`public` can stay in the project even if it is empty. It is optional during development, but useful as a conventional home for static assets that do not belong in `source`.

Last update: 16/04/2026
