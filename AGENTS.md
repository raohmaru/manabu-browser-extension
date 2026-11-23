# Agent Guide

## Source of Truth

- Read `specs/implementation.md` before implementation. It defines the architecture,
  technology stack, component behavior, data model, build system, and testing checklist.
- Verify current behavior in the source and `manifest.json`; use `README.md` and
  `package.json` for setup and commands.
- Do not duplicate implementation details in this file. When code or requirements change
  the documented architecture, update `specs/implementation.md` instead.

## Architecture Decision Records

- Record important architecture decisions in `specs/adr.md`, including the context,
  decision, and its consequences.
- Write the record when the decision is made, and keep the history current: if a decision
  changes, add a new record describing the change rather than replacing the original.

## Common Commands

- `npm run dev` — watch mode with live reload (serves `dist/` at http://localhost:8000).
- `npm run dev:chrome` — dev mode using the Chrome extension storage context.
- `npm run build` — production build to `dist/` (clean, copy assets, db, css, js).
- `npm run build:dist` — production build with `NODE_ENV=production` (minified).
- `npx tsc --noEmit` — type-check without emitting (run for any TypeScript change).

## Repository Layout

See `specs/implementation.md` for the full project structure and architecture.

## Code Conventions

- Formatting per `.editorconfig`: 4-space indent, LF endings, UTF-8, final newline.
- Strict TypeScript (`tsconfig.json`). Keep interfaces in `src/types/interfaces.ts` and
  enums in `src/types/enums.js` with matching `enums.d.ts` declarations.
- Custom elements extend `Component` (`src/components/Component.ts`), follow the
  `connectedCallback` → `loadTemplateFunc` → `initialize/load` → `render` →
  `setupEventListeners` lifecycle, and call `customElements.define` at the end.
  Register new components in `src/components/index.ts` (side-effect barrel import).
- Templates are functions returning template literals using `{{path.to.value}}`
  interpolation, `${expr}` evaluation, and `:click="handler(args)"` event binding.
- Access persisted state through `src/utils/storage/storage.ts` (`getData`,
  `setProp`, `subscribe`); avoid calling `chrome.storage` directly except in `head.ts`.
- Document exported functions and classes with JSDoc, matching the existing style.

## Working with Vocabulary Data

- Vocabulary lives in CSV files per JLPT level under `src/data/vocab/n{1..5}/`.
- `category` and `level` text values must match the `Categories` / `JLPTLevels`
  entries in `src/types/enums.js`; they are mapped to numeric indices at build time.
- Word IDs are assigned sequentially by `build/generate-db.js` during the build.
  Do not hand-edit IDs in the CSV files.
- After changing vocabulary data, rebuild (`npm run build:dist`) to regenerate
  `dist/data/vocab/*.sqlite3`.

## Gotchas

- Never edit `dist/` — it is generated and git-ignored. Change source and rebuild.
- `head.js` runs synchronously in `<head>` to apply the theme before first paint;
  changes to theme initialization can reintroduce a flash of the wrong theme.
- The extension CSP relies on `'wasm-unsafe-eval'` for SQLite WASM; changing it can
  break the database layer.

## Change Workflow

1. Read `specs/implementation.md` and inspect the relevant source and callers.
2. Check the working tree and avoid unrelated changes.
3. Make the smallest coherent source change using existing patterns.
4. Update directly affected types, storage keys, components, CSV data, manifest, or build
   scripts only when required.
5. Use the scripts in `package.json`; run `npx tsc --noEmit` for TypeScript changes.
6. Run `npm run build:dist` for build, UI, manifest, CSS, or data changes unless the task
   is documentation-only.
7. When build output is loaded manually, verify it at `chrome://extensions`.
8. Update `specs/implementation.md` when a code change alters architecture or requirements.
9. For application implementation changes, record the completed change in
   `specs/progress.md`.

## Progress Log Requirement

After each application implementation change to source code, configuration, or data,
append a concise entry to `specs/progress.md` containing:

- Date and scope of the change.
- What changed in source or configuration.
- Relevant implementation details.

Do not log documentation-only changes, including updates to `AGENTS.md`, implementation
specifications, ADRs, or other documentation. Use short chronological Markdown entries.
Do not copy full diffs or generated build output into the log.
