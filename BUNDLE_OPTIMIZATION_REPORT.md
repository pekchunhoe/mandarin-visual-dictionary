# KANJIAN — VITE BUNDLE OPTIMIZATION COMPLETION

Verified 5 October 2026 from the existing, interrupted working tree. No commit, push, or deployment was performed.

## Root cause

- Visual lexicon duplicated in startup React graph: FIXED.
- Visual lexicon duplicated in dictionary worker: FIXED.
- Large semantic data loaded on initial home page: NO.
- Vite chunk-size warning: RESOLVED, without increasing the warning threshold.

## Final production sizes

Decimal KB (1,000 bytes), uncompressed unless specified. Baseline measurements come from the previous run's `.tmp/bundle-before.json`. Final measurements come from the rebuilt `dist` and `.tmp/bundle-after.json`.

| Asset / measure | Before | After |
| --- | ---: | ---: |
| Initial browser JavaScript | 1,054.67 KB | 300.95 KB |
| Main entry | 303.88 KB | 300.95 KB |
| Large visual startup chunk | 750.78 KB | Removed |
| Dictionary worker | 784.98 KB | 19.02 KB |
| Lazy semantic JSON | Embedded twice in JS | 750.82 KB |
| All browser JavaScript, including worker and service worker | 1,841.81 KB | 335.97 KB |
| Total dist | 15,339.51 KB | 14,584.40 KB |

Initial JavaScript decreased by 753.71 KB (71.46%). Worker JavaScript decreased by 765.97 KB (97.58%). The largest initial chunk decreased from 750.78 KB to 300.95 KB, a reduction of 449.83 KB (59.92%).

Exact final bytes:

| Artifact | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| `index-BEjhHAwr.js` | 300,951 | 92,750 |
| `dictionary.worker-DMvKWzGn.js` | 19,018 | 7,245 |
| `visual-lexicon-BbIQzTYa.json` | 750,817 | 267,812 |
| `WordDetail-9tyVNsZ2.js` | 10,379 | 3,644 |
| `PictureQuiz-CxMRQKwS.js` | 1,566 | 881 |
| `sw.js` | 4,056 | 1,474 |
| All browser JS | 335,970 | — |
| Total dist | 14,584,404 | — |

Initial JS means the entry and its static JavaScript imports. The PWA additionally precaches the worker, lazy UI modules, fonts, styles, and local pictures for offline use; they are not all executed on the initial React path. The full semantic JSON and CC-CEDICT are excluded from a fresh install's precache.

## Optimization

| Check | Result |
| --- | --- |
| Runtime inference removed from React startup graph | PASS |
| All 54 starter classifications generated at build time | PASS |
| Complete semantic lexicon moved to one lazy JSON asset | PASS |
| Worker loads semantic data on demand | PASS |
| Concurrent searches and refreshes share one semantic promise | PASS |
| Repeated successful requests do not redownload semantic data in a worker lifecycle | PASS |
| Duplicate browser lexicon removed | PASS |
| Source-generation metadata excluded from browser output | PASS |
| CC-CEDICT excluded from main JS and shipped once as static JSON | PASS |
| Server functionality preserved without browser assets | PASS |

The UI receives generated starter words and worker-classified full-dictionary entries. The worker receives the already loaded starter collection in an initialization message, which also removes its duplicate starter payload. The shared classifier factory is unchanged; the server embeds its data while the worker fetches the hashed JSON. No large duplicate browser dataset remains. The server's independent embedded lexicon is intentional and is not included in browser chunks.

Direct starter lookup, starter detail, quiz, and saved starter IDs do not require semantic data. A full-dictionary search needs it to classify the non-starter index. Opening saved non-starter entries needs it to recompute derived fields from stored meanings; visiting home with saved content does not trigger that work. Saved reclassification needs no CC-CEDICT download.

## Functional equivalence

All 125,173 dictionary rows retain exactly the same IDs, senses, displayed meanings, visual eligibility, categories, and primary queries. The JSON-loaded worker classifier reproduces the pre-optimization row digest:

`ea77c225a7eddda8c623c4b340e768863b2523d099586e7d4b90fbded42cb480`

An additional direct comparison with the pre-optimization classifier source checked all 199,713 definitions, including fallback queries, subjects, and concept domains. Its complete-intent digest is now pinned in the regression test:

`fc466297f9ad2027585e3bf9330d701ba0af9566ee5978379cc75c22e017bbb8`

The full dictionary itself retains SHA-256 `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a`. No intentional dictionary classification differences were introduced.

| Check | Result |
| --- | --- |
| CC-CEDICT search | PASS |
| Simplified Chinese / Traditional Chinese / pinyin / English search | PASS |
| Pixabay visuals and sense-aware provider requests | PASS, mocked providers |
| Verbs/actions / emotions / adjectives/states / conceptual words | PASS |
| Function-word skipping | PASS |
| Saved content preserved and derived fields recomputed | PASS |

Representative words: 苹果, 猫, 跑, 惊讶, 恐慌, 冷, 政治, 经济, 科学, 数学, 法律, 长颈鹿, 金融, 瀑布, 厨师: PASS. 因为 skips Pixabay: PASS. These checks cover the existing visual senses; unrelated senses keep their existing behavior.

## Offline / PWA

| Scenario | Result |
| --- | --- |
| Fresh install and required hashed-asset precache | PASS |
| Home search UI ready without dictionary/semantic fetch or worker execution | PASS |
| Offline home | PASS |
| Offline starter detail and local images immediately after install | PASS |
| Offline quiz and lazy UI modules immediately after install | PASS |
| Lazy semantic data available offline after first use | PASS |
| Saved-word reclassification offline | PASS |
| Upgrade with previously downloaded dictionary | PASS |
| Upgrade with old bundled worker and saved words, without downloaded dictionary | PASS |
| Obsolete chunks removed; current detail and quiz load offline | PASS |
| Saved IDs and stored entries remain unchanged | PASS |
| No captured page errors during expanded lazy/offline/upgrade verification | PASS |
| Vary: Origin cache matching fix preserved | PASS |

The Vary exception now uses a build-generated allowlist of exact hashed asset paths. It applies only to same-origin GET requests with no query string. Query matching is never disabled. Arbitrary `/assets/` files, dictionary data, API requests, external providers, and non-GET requests do not receive this exception. API requests bypass the service worker entirely; upgrade migration only copies allowed dictionary/semantic runtime assets.

Fresh installs deliberately do not support never-downloaded full-dictionary data offline. Once used online, dictionary and semantic data are cached. Upgrades prepare the semantic asset when an old bundled classifier or downloaded dictionary demonstrates an existing offline capability.

The existing root error boundary handles failed lazy imports and offers a reload action. Worker errors preserve saved content; failed semantic downloads retain the existing optional-lexicon fallback and allow another semantic attempt. Dictionary download errors expose the existing retry UI and reuse already loaded semantic data.

## Security / API

- PIXABAY_API_KEY server-only: PASS.
- Image API cache behavior unchanged: PASS.
- 24-hour valid-result caching, transient failure handling, provider fallback, request deduplication, and sense-aware keys: PASS.
- Safe search preserved: PASS.
- No arbitrary provider proxy: PASS.
- Isolated server artifact starts without browser assets or repository dependencies: PASS.

Provider behavior was verified with deterministic fixtures, including isolated deployment-artifact execution. Live authenticated Pixabay/Pexels requests were not performed. Provider implementation source files were not changed by this optimization; the generated server bundle was rebuilt.

## Verification

| Command / check | Result |
| --- | --- |
| `npm test` | PASS: 434 tests across 13 files |
| Optimization-specific unit tests | PASS: starter parity, full dictionary/intents, worker concurrency/retries, cache boundaries |
| `npm run test:browser` | PASS: 30 browser tests |
| `npm run typecheck` | PASS; also run within final build |
| `npm run build` | PASS, no Vite chunk-size warning |
| Deployment artifact checks, invoked by build | PASS: normal, missing key, provider failure, missing dictionary, missing service, broken service |
| `npm run test:offline` | PASS |
| `npm run test:lazy` | PASS, including expanded representative words and both upgrade paths |
| `npm run test:bundle` | PASS |
| `npm run measure:bundle` | PASS |
| `npm run check:source` | PASS |
| `npm run check:whitespace` and `git diff --check` | PASS |
| Unfinished merge/edit marker scan | PASS |

Playwright's Windows web-server teardown stalled after all cases passed. Stopping only the test-owned Vite/npm processes released teardown; the final browser command completed with exit code 0 and `30 passed`. No application or test assertions were bypassed.

## Files changed

- Documentation/configuration: `README.md`, `BUNDLE_OPTIMIZATION_REPORT.md`, `package.json`, `vite.config.ts`.
- Build/verification scripts: `scripts/build-learning-data.mjs`, `scripts/bundle-audit.ts`, `scripts/measure-bundle.mjs`, `scripts/verify-bundle.mjs`, `scripts/verify-lazy.mjs`.
- Runtime/offline: `public/sw.js`, `src/App.tsx`, `src/lib/dictionary-client.ts`, `src/lib/dictionary.worker.ts`, `src/lib/search.ts`.
- Starter data: `src/data/learning.ts`, `src/data/learning-source.ts`, `src/data/learning-runtime.json` (generated).
- Shared classifier boundaries: `src/lib/dictionary-entry.ts`, `src/lib/dictionary-entry-core.ts`, `src/lib/visual-inference.ts`, `src/lib/visual-inference-core.ts`, `src/lib/visual-schema.ts`, `src/lib/visual.ts`.
- Server artifact: `server/image-service.mjs` (generated).
- Tests: `tests/browser/concepts.spec.ts`, `tests/bundle-architecture.test.ts`, `tests/dictionary-worker.test.ts`, `tests/service-worker.test.ts`, `tests/image-client.test.tsx`, `tests/visual-coverage.test.ts`.

The continuation preserved the existing optimization, narrowed immutable cache matching, added concurrency/error/cache-boundary tests, strengthened full-intent parity and production offline/upgrade checks, and completed reporting. Generated files and build artifacts were regenerated successfully; no partial edits remain.

## Remaining performance limitations

- The unchanged CC-CEDICT file is 10,883,962 bytes and dominates total dist. First full lookup still downloads and indexes the complete dictionary in the worker.
- Full semantic coverage still requires 750,817 bytes of JSON (267,812 gzip), parsed in the worker on demand. A successful load is reused within that lifecycle and cached for offline reuse.
- Optional semantic-download failures use the existing reduced-data fallback. An index built during such a failure remains in that worker until it is recreated; normal full-data equivalence is verified separately.
- PWA installation still downloads local photos and deferred UI chunks for offline support. Provider latency and image availability remain external costs.

Redeployment required: YES, to publish the new browser assets, service worker, and rebuilt server artifact together.

Commit/push performed: NO.
