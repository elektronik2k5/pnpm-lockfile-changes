# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build        # Bundle src/action.mjs → dist/index.js via @vercel/ncc (commit dist/ after changes)
pnpm lint         # ESLint across all files
pnpm test         # Jest unit tests
pnpm lint && pnpm test  # Full check before committing
```

To run a single test file: `pnpm exec jest tests/unit/unit.test.js`

## Architecture

This is a GitHub Action that posts PR comments summarizing `package-lock.json` changes. The three source files map to a clean pipeline:

**`src/action.mjs`** — Entry point. Fetches the PR's current and base lock files from the GitHub API, calls `diffLocks`, then calls `generateComment` and posts/updates the PR comment via Octokit.

**`src/utils.js`** — Contains `diffLocks` which compares two parsed lock files and categorizes each package as `ADDED`, `UPDATED`, `DOWNGRADED`, or `REMOVED` using `semver`. This is the core logic.

**`src/comment.mjs`** — Takes the diff output and generates a markdown table (via `markdown-table`). Collapses the table into a `<details>` block when the number of changes exceeds `collapsibleThreshold`.

**`dist/index.js`** — Bundled output (ncc inlines all dependencies). This file must be committed; it's what GitHub Actions actually runs. Always rebuild and commit `dist/` when changing source files.

## Key Details

- **Input parameters** are defined in `action.yml`: `token`, `path` (default: `package-lock.json`), `collapsibleThreshold` (default: 25), `failOnDowngrade`, `updateComment`.
- **Lock file parsing** uses `snyk-nodejs-lockfile-parser`; base lock file content arrives as a base64 blob from the GitHub API and is decoded via `js-base64`.
- **CI** runs `pnpm lint` + `pnpm test` on PRs (`.github/workflows/tests.yml`) and also runs the action against itself to test end-to-end behavior (`.github/workflows/main.yml`).
- **Code style**: Prettier-enforced, 100-char print width, single quotes, no semicolons, 2-space indent. ESLint extends `eslint:recommended` with the Jest plugin.
