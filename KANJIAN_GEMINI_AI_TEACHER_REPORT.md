# KANJIAN Gemini AI Teacher integration

This report records the initial mocked integration checks. Subsequent authorized live checks are in [the final verification report](KANJIAN_AI_TEACHER_FINAL_VERIFICATION_REPORT.md); the latest universal prompt improvements are in [the language-quality report](KANJIAN_AI_TEACHER_LANGUAGE_QUALITY_REPORT.md).

Verified locally on 26 October 2026 (Asia/Kuala_Lumpur). Implementation is local; no commit, push, or deployment was performed. No live Gemini request was made.

## Result

The selected dictionary entry now has two AI Teacher actions below its meaning selector: **造句 · Example Sentences** and **近义词和反义词 · Synonyms & Antonyms**. Both use only `gemini-3.5-flash-lite`. There is no model override or alternate-model fallback.

Sentences require exactly three distinct Chinese sentences containing the entire selected simplified headword, each with English and Malaysian Malay translations. Each sentence has its own trilingual copy button. Relations have separate synonym and antonym tables, English/Malay meanings, and exactly one Copy All button. Collections expand beyond eight visible entries; Copy All includes the complete generated collection even while collapsed. Empty relations have explicit Chinese, English and Malay messages.

The existing dictionary meanings, example sentences, search behavior, translations, picture galleries, pronunciation, saved words, quizzes, and corpus data remain in place. Git comparison confirmed no changes to tracked dictionary/translation data or the existing generated image service.

## Environment loading and credential handling

The previous Vite server configuration loaded only `PIXABAY_`, `PEXELS_`, and `OPENVERSE_` variables. `server/environment.ts` now also loads server-only `GEMINI_API_KEY` through Vite's mode-aware environment loader. It fills only undefined process variables, preserving already configured values.

The project's `.env.local` was left untouched. Its Gemini key was verified as present without printing its value. Existing environment variables and Vercel settings were not edited. `.env.example` adds only an empty placeholder. Private environment files remain ignored; only `.env.example` is tracked. The pre-existing `.gitignore` changes and Malay recovery work were left untouched.

Production functions read `process.env.GEMINI_API_KEY` at runtime; they do not read or package `.env.local`. Browser code has no secret-variable reference, server import, or Gemini provider URL. Vite's default client prefix remains unchanged. No `VITE_GEMINI_API_KEY`, build-time secret substitution, credential-bearing URL, credential log, or secret response was introduced. Configured credentials were compared in memory against source and generated text assets; no matches were found. The scanner prints only safe status messages.

## Server architecture and validation

`POST /api/teacher` accepts exactly `{ word, sense, action }`, with actions `sentences` and `synonyms-antonyms`. The server resolves the dictionary entry and selected sense itself. Client prompts, definitions, model overrides, extra fields, unknown words/senses, unsupported methods, cross-origin browser requests, and query overrides are rejected.

The two actions share one server integration and have separate instructions and JSON response schemas. Headword, selected English meaning, existing Malay meaning where available, part of speech where available, and idiom classification guide generation. Dictionary fields are serialized as data and explicitly separated from system instructions.

Gemini is called through the official REST `generateContent` API, with `x-goog-api-key` authentication and `responseMimeType` / `responseJsonSchema`. Only a completed `STOP` response is accepted. Runtime validation checks exact result keys, the matching headword, three complete sentences, headword inclusion, duplicate Chinese text, missing translations, language/script requirements, unsafe control/markup characters, relation overlap, and bounds. Both server and browser validate content. Prompts require faithful Malaysian Bahasa Melayu, whole-idiom interpretation, school-appropriate content, genuine lexical relations and no fabricated opposites.

Requests have a 2 KiB application limit and five-second raw-body timeout. Provider responses are read with a 96 KB ceiling; strings and arrays have further limits. Provider calls have a 22-second timeout; the Vercel function allows 30 seconds. HTTP errors, malformed/truncated output, timeouts, quota exhaustion, missing configuration and unavailable models produce safe errors. Raw provider errors are never returned or logged. There are no automatic retries; retrying is an explicit user action.

Official references: [Gemini 3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [structured output REST configuration](https://ai.google.dev/gemini-api/docs/generate-content/structured-output?hl=en).

## Cost, cache and abuse controls

- No AI request during startup, search typing, ordinary searches, page loading or background prefetching. The request client is dynamically imported after a feature click. The word-detail page remains a separate lazy chunk.
- Separate loading/results/errors for each action; a component remount on word/sense change prevents old results appearing under another meaning.
- Successful results expire after six hours. Browser memory holds at most 50 results; server memory holds at most 200. Cache identity includes action, dictionary entry/sense, meaning/context, fixed model and prompt version; the server also distinguishes credential changes using a hash.
- Identical concurrent requests share work within each browser/server instance. Server generation is capped at eight concurrent requests per instance. These caches are best-effort across Vercel cold starts and are not a distributed cache.
- Output budgets are 2,200 tokens for sentences and 6,000 for relations. Relations allow up to 30 genuine items per section rather than requiring a small fixed count. A quota error adds a 60-second instance cooldown.
- Vercel production uses `@vercel/firewall` shared counters rather than a memory-only limiter. The named rule is `kanjian-ai-teacher`; the dashboard rule sets the production threshold, now chosen as 20 requests per minute. Missing rules, failed checks and check timeouts fail closed before Gemini is called. Development also uses 20 requests per minute per local client. Unsupported non-Vercel production hosting also fails closed.
- No new external database or paid service was provisioned. Vercel firewall counters are per region, as documented in the [official SDK guide](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk).

## Verification

| Check | Observed result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npx vitest run --maxWorkers=2 --testTimeout=30000` | **942 tests passed, 39 files** |
| Focused new teacher tests | **67 passed**, included in the full count |
| `npx playwright test tests/browser/ai-teacher.spec.ts tests/browser/app.spec.ts --reporter=list` | **27 passed** in the final run |
| `npm run build` | Passed; native image/teacher packaging, Vite production assets, offline dictionary cost guard and teacher security/package checks completed |
| `node scripts/verify-teacher-package.mjs` | Passed; configured-key presence, ignored environment files, credential scan, browser boundary and both native API actions with mocked Gemini |
| `npm run check:source` | Passed |
| `npm run test:bundle` | Passed |
| `npm run test:lazy` | Passed against local production preview; fresh-home loading, offline starter features, lazy dictionary data and saved-word/upgrade behavior |
| `npm run check:whitespace` | Passed |

The first unrestricted concurrent test run hit six existing corpus-test timeouts. The complete rerun above used two workers and a 30-second default timeout; all assertions passed, including the corpus snapshot's explicit 60-second limit. No corpus assertions were weakened. Browser checks identified helper-text contrast and initially missing panel references; both were fixed and the complete browser run then passed.

New tests cover JSON validation, nouns/verbs/adjectives/idioms/uncommon and polysemous headwords, large/empty relation lists, copies, cached/concurrent work, expiry, independent loading, stale-result isolation, offline/missing-key errors, retry, model pinning, provider error/quota/timeout handling, oversized requests/responses, prompt-injection fields, environment precedence, distributed rate rejection and fail-closed behavior. All Gemini traffic in tests was mocked, including the packaged native entrypoint.

Existing regression coverage passed for Mandarin, traditional Chinese, pinyin, English and Malay search; corpus presentation; Malay translation pipelines; semantic pictures; Pixabay/Openverse behavior and attribution; gallery caching/loading/failures; saves; pronunciation; quizzes; and offline architecture.

AI Teacher screenshots were captured at widths 320, 390, 768 and 1440 pixels, with no horizontal document overflow. Desktop/mobile sentence screenshots and desktop relation screenshots were visually inspected. Screenshots are under `.tmp/teacher-*.png`. Axe checks passed for the generated teacher panel and the existing homepage/detail accessibility test. Styling follows the existing cream/forest-green theme; this checkout has no separate dark/light theme toggle to exercise.

The Gemini request client is a separate 2.77 KB production chunk (1.33 KB gzip); the main application JS is 324.83 KB (97.14 KB gzip). Bundle checks confirm teacher code is absent from the startup entry chunk. The generated teacher server bundle is 868,574 bytes and has only native Node external imports.

## Files

New implementation: `api/teacher.js`; `server/environment.ts`, `server/ai-teacher.ts`, `server/teacher-handler.ts`, `server/teacher-rate-limit.ts`, `server/teacher-service.mjs`; `src/components/AITeacher.tsx`; `src/lib/ai-teacher-client.ts`, `src/lib/ai-teacher-schema.ts`, `src/lib/teacher-clipboard.ts`; `scripts/build-teacher-function.mjs`, `scripts/verify-teacher-package.mjs`.

New tests: `tests/ai-teacher-server.test.ts`, `tests/ai-teacher-client.test.tsx`, `tests/teacher-rate-limit.test.ts`, `tests/teacher-fixtures.ts`, `tests/browser/ai-teacher.spec.ts`.

Updated: `.env.example`, `vite.config.ts`, `vercel.json`, `package.json`, `package-lock.json`, `src/pages/WordDetail.tsx`, `src/styles.css`, `scripts/check-source.mjs`, `scripts/verify-translation-cost.mjs`. This report is also new. The offline translation cost guard now explicitly allows only the requested supplemental teacher endpoint alongside images; dictionary translation remains offline.

## Local setup and remaining Vercel steps

Local configuration is already present. Keep the existing `GEMINI_API_KEY` in the ignored `.env.local`; no other new environment variable is needed. Run `npm install` when installing the updated dependency lockfile, then restart `npm run dev` to load the server configuration. Do not copy the empty example file over the existing local environment. Click an AI Teacher action to generate content.

Before an authorized Vercel deployment:

1. Keep the already configured server-only `GEMINI_API_KEY`. Confirm its existing scope includes Production and any Preview environment used for staging. Preserve image-provider variables. No browser-prefixed key or model variable is needed.
2. In the project's **Firewall → Configure → New Rule**, choose the `@vercel/firewall` condition, set Rate limit ID to **`kanjian-ai-teacher`**, configure **20 requests per 60 seconds** with blocking, save, review and publish the rule. The SDK uses the trusted client IP as the bucket. Without this rule, production AI generation deliberately returns unavailable.
3. When deployment is explicitly authorized, deploy the source with `npm run build` and the existing Vercel project. The new API is configured with the same packaged dictionary as images and a 30-second function limit.
4. Once live testing is explicitly authorized, perform a small smoke test of both actions, selected senses, copy controls and rate limiting. No live test has been performed in this task.

Live account access, Gemini quota/linguistic quality, and the actual Vercel firewall/environment state were not verified remotely. Schema tests establish structural correctness; they do not prove every generated translation or semantic relation will be accurate. Production caches may miss across server instances. The integration returns a safe temporary-unavailability state if the fixed model cannot serve a request, without switching models.

## Rate-limit update: 20 requests per minute

Follow-up verification on 26 October 2026:

1. The exact production Rate Limit ID remains `kanjian-ai-teacher`.
2. Vercel production delegates the threshold to that firewall rule and does not run the local counter. The development-only counter was changed from 6 to **20 per 60 seconds**. The generated native teacher bundle and setup instructions were updated accordingly.
3. Handler tests allow requests 1–20 and verify that request 21 returns **HTTP 429**, code `rate_limited`, and `Retry-After: 60`, without invoking Gemini. Both AI actions were tested with a rejected Vercel check. Clearing the generation cache before rejection verifies that cached content cannot conceal an accidental Gemini invocation.
4. The application supplies no constant/global `rateLimitKey`. The installed SDK uses Vercel's trusted `x-real-ip` header. An integration test exercised the real installed SDK against mocked firewall/Gemini HTTP responses: two different visitor IPs, sharing the same function proxy socket, each received 20 accepted requests and a separate rejected 21st request. Missing trusted IPs fail closed rather than sharing an unknown/global bucket. Development counters are also separate by socket IP and renew after 60 seconds. This is per-IP protection: people sharing a public IP share its allowance. Shared upstream Gemini quota cooldown and instance concurrency safeguards remain separate, unchanged protections.
5. Server-only `GEMINI_API_KEY`, environment loading, exact model `gemini-3.5-flash-lite`, structured validation, caching, prompts, frontend behavior and safe errors are unchanged. Credential scanning found no configured key in source/generated assets. No environment file or Vercel setting was edited.

Current follow-up checks: **72 tests passed** across `teacher-rate-limit.test.ts`, `ai-teacher-server.test.ts`, and `ai-teacher-client.test.tsx`; `npm run typecheck`, `npm run test:teacher-packaging`, and `npm run check:source` passed. The packaging check regenerated `server/teacher-service.mjs` and exercised both native API actions with mocked Gemini. This server-only update did not require another frontend build or visual change.

The actual live Vercel dashboard rule was not remotely inspected or changed. All network behavior above was mocked; no live Gemini quota was consumed. No commit, push, or deployment was performed.
