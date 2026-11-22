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
- Validation performed and any known limitation or follow-up.

Do not log documentation-only changes, including updates to `AGENTS.md`, implementation
specifications, ADRs, or other documentation. Use short chronological Markdown entries.
Do not copy full diffs or generated build output into the log.
