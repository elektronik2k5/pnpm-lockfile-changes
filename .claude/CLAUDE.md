# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm action       # Run the action locally (requires env vars set)
pnpm lint         # ESLint across all files
pnpm test         # Node test runner
pnpm lint && pnpm test  # Full check
```

To run a single test file: `node --test tests/unit/unit.test.mjs`

## Architecture

This is a GitHub Action that posts PR comments summarizing `pnpm-lock.yaml` changes. The three source files map to a clean pipeline:

**`src/action.mjs`** — Entry point. Fetches the PR's current and base lock files from the GitHub API, calls `diffLocks`, then calls `generateComment` and posts/updates the PR comment via Octokit.

**`src/utils.js`** — Contains `diffLocks` which compares two parsed lock files and categorizes each package as `ADDED`, `UPDATED`, `DOWNGRADED`, or `REMOVED` using `semver`. This is the core logic.

**`src/comment.mjs`** — Takes the diff output and generates a markdown table (via `markdown-table`). Collapses the table into a `<details>` block when the number of changes exceeds `collapsibleThreshold`.

**`action.yml`** — Declares the action as `using: node24`, pointing directly to `src/action.mjs`. No bundling required; `node_modules` must be present (installed via `pnpm ci` in the workflow before the action runs).

## Key Details

- **Input parameters** are defined in `action.yml`: `token`, `path` (default: `pnpm-lock.yaml`), `collapsibleThreshold` (default: 25), `failOnDowngrade`, `updateComment`. When running via `pnpm run action` (in CI or locally), set these as `INPUT_*` env vars since `action.yml` defaults are not applied.
- **Lock file parsing** uses `snyk-nodejs-lockfile-parser`; base lock file content arrives as a base64 blob from the GitHub API and is decoded via `js-base64`.
- **CI** runs `pnpm lint` + `pnpm test` on PRs (`.github/workflows/tests.yml`). End-to-end testing runs via `pnpm run action` in `.github/workflows/main.yml` after `pnpm ci`.
