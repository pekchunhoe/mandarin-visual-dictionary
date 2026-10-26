# KANJIAN Vercel build repair

26 October 2026 · Base checkout: `e8f20be`

**Result: PASS for all five requested build/security criteria.** No commit, push or deployment was performed. No live Gemini call was made.

## Cause and repair

`scripts/verify-teacher-package.mjs` previously ran `git check-ignore .env.local` and `git ls-files` whenever `existsSync('.git')` returned true. An existing `.git` path does not establish that Git can read repository metadata; an empty directory or inaccessible/dangling pointer can still produce `fatal: not a git repository`.

The verifier now calls the new `scripts/verify-package-security.mjs` helper. It quietly probes `git rev-parse --show-toplevel` and verifies that the result identifies this actual project directory. A parent repository is not accepted as metadata for an isolated build copy.

When the probe succeeds, local Git ignore and tracked-environment-file checks remain mandatory. Ignore negation, tracked private env files and failed local Git security checks are rejected. When the probe fails or Git is unavailable, Git-specific checks are skipped and the filesystem/artifact checks still run.

Mandatory checks cover:

- Required local ignore declarations and the existing Vercel upload exclusions when `.vercelignore` is present.
- Private `.env*` filenames in source/function trees, public inputs, `dist`, and `.vercel/output` when available; these fail even if their values are not configured in the process environment.
- Nonempty `.env.example` placeholders, Git metadata inside application artifacts, and unsafe package links.
- Configured Gemini, Pixabay, Pexels and Openverse credential values in source/build artifacts, including raw, trimmed and URL-encoded forms. The existing research/corpus content-scan exclusion is retained, while filenames there and all public/dist/runtime output remain checked.
- The existing browser/server boundary and both native AI Teacher API actions using mocked Gemini.

Root local env files remain permitted configuration inputs; they are not treated as deployable assets. `.env.local` was neither modified nor copied into the metadata-free verification build. `.vercelignore` and the real `.git` directory were not altered or uploaded.

## Changes

1. Updated `scripts/verify-teacher-package.mjs` to delegate the Git-aware security verification and report the mode used.
2. Added `scripts/verify-package-security.mjs` for the capability probe and mandatory filesystem/artifact checks.
3. Added `tests/teacher-package-security.test.ts` with **34 regression tests**.
4. Added this report. Test copies, logs and injected fixtures are confined to ignored temporary locations.

No application prompts, language generation, model selection, dictionary/translation data, galleries, API settings, UI, dependencies or 20-request-per-minute firewall code changed.

## Verification results

| Completion criterion | Result | Evidence |
| --- | --- | --- |
| Local production build | **PASS** | `npm run build`; `.tmp/vercel-repair-local-build.log`. Final verifier confirms genuine Git ignore/tracked-file checks ran. |
| Build without Git metadata | **PASS** | Full `npm run build` in an isolated copy with no `.git` or private env files and ancestor Git discovery disabled; `.tmp/vercel-repair-nogit-build.log` confirms metadata-free checks ran. Existing dependencies were linked; no packages or real credentials were downloaded/copied. |
| API credential protection | **PASS** | Five provider credential variables tested as synthetic injected values; raw and encoded leaks are rejected without printing the values. Production source/security checks also pass with the actual local configuration. |
| Sensitive-file rejection | **PASS** | Unit tests cover private env files in 10 source/artifact locations. Full metadata-free verifier rejects injected env files in `dist`, `public`, and a Vercel function output directory, then passes after those fixtures are removed. |
| Existing functionality preserved | **PASS** | **224 tests passed across 8 files**, covering the new verifier and existing teacher/API/Pixabay/Openverse regressions. Native image packaging scenarios and both mocked teacher actions pass. Protected-file byte hashes and existing data comparisons are unchanged. |

The full metadata-free verifier additionally passed with an existing unusable `.git` directory and a dangling `.git` pointer. **13 end-to-end clean/rejection checks passed**, recorded in `.tmp/vercel-no-git-evidence.json`.

Additional checks passed: `npm run typecheck`, `npm run check:source`, `npm run test:bundle`, `npm run check:whitespace`, and the current native teacher package verification. Regression output is in `.tmp/vercel-repair-regression.log`.

The build without metadata completed the frontend, dictionary/Malay transport, image function, Gemini teacher function, bundle guard and final security verifier. The deployment-compatibility failure is repaired locally; actual Vercel deployment remains unperformed under the user's instructions.
