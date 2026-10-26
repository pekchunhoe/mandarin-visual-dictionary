# KANJIAN AI Teacher Copy Prompt implementation

Date: 26 October 2026. Status: PASS for the requested client-side feature.

## Changes

Added exactly two compact **Copy Prompt** buttons immediately below the original AI Teacher generation controls. Each copies complete, portable instructions in one click using the current entry and selected meaning. The prompts include available pinyin, Malay meaning, part of speech and sense clarification, without inventing missing metadata.

The sentence prompt requests exactly three distinct natural Mandarin sentences with faithful English and Malaysian Malay translations. Both prompts emphasize contextual idiom meanings and standard Malaysian usage. The vocabulary prompt requests comprehensive, genuine lexical alternatives, up to 30 per category, with usage distinctions and explicit empty-list handling. Both explicitly request readable text and prohibit JSON/code/schema output.

The existing clipboard helper supplies native and legacy copying. If both fail, an accessible error and focused, selected, read-only field guide manual copying. Success feedback lasts three seconds. Copying works before generation, during generation, after API failures/rate limits, and offline once the entry is loaded. It requires no API key, provider call or additional network request.

Complete examples captured from the actual browser clipboard for 美丽 are in [KANJIAN_COPY_PROMPT_EXAMPLES.md](KANJIAN_COPY_PROMPT_EXAMPLES.md). They are instructions, not AI-generated answers.

## Exact files changed

| File | Change |
| --- | --- |
| `src/components/AITeacher.tsx` | Pair each original generation control with its secondary copy control. |
| `src/components/CopyTeacherPromptButton.tsx` | New accessible copy control, transient feedback and manual fallback. |
| `src/lib/teacher-copy-prompt.ts` | New local, selected-sense prompt builders using public dictionary fields. |
| `src/styles.css` | Preserve generation styles through the wrappers; add compact responsive copy styles. |
| `tests/ai-teacher-client.test.tsx` | Update initial control-count assertion for the additive buttons. |
| `tests/teacher-copy-prompt.test.ts` | New prompt-content, metadata, idiom, polysemy and boundary regressions. |
| `tests/teacher-copy-button.test.tsx` | New clipboard, feedback, fallback, API-failure, offline and state regressions. |
| `tests/browser/teacher-copy-prompt.spec.ts` | Seven new native-browser scenarios. |
| `KANJIAN_COPY_PROMPT_EXAMPLES.md` | Both complete prompts captured from the browser clipboard. |
| `KANJIAN_AI_TEACHER_COPY_PROMPT_REPORT.md` | This report. |

## Test evidence

| Check | Result and evidence |
| --- | --- |
| Full regression suite | **1,018 tests / 43 files passed**, including 20 new focused cases; `npx vitest run --maxWorkers=1 --testTimeout=30000`. Log: `.tmp/teacher-copy-full-tests.log`. |
| Browser validation | **39 scenarios passed**: 32 existing dictionary/AI Teacher scenarios and seven new copy-prompt scenarios. Existing generation results, all sentence copy buttons, combined vocabulary copying, Malay translations, saved words and gallery behavior passed. Log: `.tmp/teacher-copy-browser.log`. |
| Native clipboard / accessibility | Both complete prompts copied; Enter/Space and tab order passed; no teacher requests on copying. Offline, HTTP 429/503 and denied-clipboard paths passed. Axe checks found no violations in the new controls' tested success/manual-fallback states. |
| Responsive UI | No horizontal overflow at 320, 390, 768 and 1440 pixels. Desktop and 320px screenshots visually inspected. Evidence: `.tmp/teacher-copy-prompts-{320,390,768,1440}.png`. |
| Typecheck | `npm run typecheck` passed. |
| Production build / packaging | `npm run build` passed, including native server packaging, mocked teacher actions, credential/private-file verification and offline translation-cost guard. Log: `.tmp/teacher-copy-build.log`. |
| Security / bundle boundaries | `npm run check:source`, `npm run check:whitespace`, `npm run test:bundle` and `git diff --check` passed. No server imports or private configuration enter the new prompt builder. |
| Production offline / lazy behavior | `npm run test:offline` and `npm run test:lazy` passed against the production preview. Saved words, cache upgrades, offline photos/dictionary and lazy loading remain functional. Logs: `.tmp/teacher-copy-offline.log`, `.tmp/teacher-copy-lazy.log`. Static preview emitted image-resource 404 messages; all assertions passed. |

Browser tests used Edge with explicit provider interception; all teacher generation responses were mocked. Prompt tests cover 美丽 for both actions, 苹果 vocabulary, 画蛇添足 sentences, the selected 开 sense, missing optional metadata, readable formatting and exclusion of private metadata.

## Preservation and performance

All 19 protected files matched their pre-change hashes after the production build, including `.env.local`, server prompts/handlers/environment loading, rate limiting, model/schema/client configuration, clipboard helper, Vercel settings and dependency manifests. Dictionary/data directories and bundled server functions have no diff. The existing `teacher-v2-linguistic` instructions, exclusive `gemini-3.5-flash-lite` model, schemas, parsing, caching, errors, result UI and 20-per-60-second architecture remain unchanged.

Initial JavaScript is **324,831 bytes before and after** (gzip: 97,145 → 97,141 bytes). Prompt-copy code stays in the lazy word-detail chunk, which increases from 21,237 to 27,803 bytes (gzip: 7,211 → 9,755 bytes). No dependencies were added.

## Limitations

External AI platforms determine their own generated answers; these tests verify copied instructions and application behavior, not the linguistic accuracy of every future answer. No external AI output was generated or evaluated for this feature. Clipboard permissions vary by browser, with legacy/manual copying available when automatic copying fails. Offline copying requires the dictionary entry to be loaded or available in the existing offline cache.

No live Gemini requests, credentials exposed, commits, pushes or deployments were made.
