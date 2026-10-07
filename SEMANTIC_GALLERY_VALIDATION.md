# KANJIAN — PIXABAY + OPENVERSE 360° SEMANTIC GALLERY

Final validation date: 7 October 2026 (Asia/Kuala_Lumpur).

Final result: **PASS**. The current implementation is preserved. This continuation corrected one TypeScript declaration in the diagnostic trace (`excluded?: boolean`), rebuilt the generated server artifact, and completed validation. No new gallery behavior or architecture was added.

## Root causes

- **Provider starvation:** the former ordinary-sense flow exhausted Pixabay queries first and broke out once it found six semantic gallery matches (one for thumbnails), before reaching Openverse. Even the English-definition fallback's alternating sequence checked its stopping condition after each individual provider, so an adequate Pixabay response could skip its Openverse partner.
- **Gallery repetition:** independent top-N relevance ranking rewarded each similar image separately. It did not account for already-represented meaning facets, semantic clusters, or the diminishing contribution of repeated symbols.
- **Secondary bias:** input-order ties favored the provider appended first; Pixabay normalization additionally used downloads/likes and tag overlap. Openverse descriptions and genuine alt text were not retained as scoring evidence. The current common scorer, richer metadata, stable asset tie-breaks, and gallery composer address these issues without provider quotas.

## Provider architecture and competition

| Check | Result |
| --- | --- |
| Pixabay actively queried; Openverse actively queried | PASS, deterministic integration/browser fixtures |
| Concurrent provider rounds; combined candidate pool | PASS |
| Provider starvation removed | PASS |
| Provider-order bias removed; provider-neutral scorer | PASS |
| Shared wrong-sense filtering | PASS |
| Openverse can rank #1; Pixabay can rank #1 | PASS |
| Openverse queried despite six acceptable Pixabay images | PASS |
| Reversing candidate input and provider completion order preserves ranking | PASS |
| Provider popularity cannot override semantic relevance | PASS |
| Fixed provider quota absent | PASS |
| Provider failure isolation and cross-provider duplicate removal | PASS |

## 360° semantic planning and composition

| Check | Result |
| --- | --- |
| Complete selected meaning retained | PASS |
| Generic, reusable multi-facet planner | PASS |
| Scene-oriented queries and equivalent-query deduplication | PASS |
| Maximum semantic/facet search rounds ≤3 | PASS |
| Candidate quality gate and shared relevance threshold | PASS |
| Wrong-sense filtering before diversity | PASS |
| Semantic clustering and redundancy detection | PASS |
| Exact duplicate detection across providers | PASS |
| Facet coverage gain and marginal information gain | PASS |
| Dominant-cluster limiting when relevant alternatives exist | PASS |
| Generic-symbol domination prevention when useful scenes exist | PASS |
| Accuracy over diversity; no irrelevant filler | PASS |
| Single-valid-facet fallback | PASS |
| Fewer-than-target behavior; six strong single-facet candidates return six | PASS |
| Deterministic composition | PASS |

The composer operates only on eligible candidates. It preserves a useful single-facet gallery when the available alternatives are irrelevant, and its stopping condition considers facet coverage rather than merely counting six repeated images.

## Controlled fixture results

| Metric | Before | After |
| --- | --- | --- |
| Representative galleries | 6 | 6 |
| Majority-one-cluster galleries | 6/6 | 0/6 |
| Symbol-dominated galleries | 2/6 | 0/6 |

These are deterministic fixture results, not guarantees about live third-party provider inventory. The comparison uses independent relevance-only top-N ordering and the current composer on the same controlled candidate pools. Browser fixtures use local image bytes while preserving provider URLs and metadata, so they validate the application path, composition, attribution, and layout rather than judging live image pixels.

## Semantic precision

| Check | Result |
| --- | --- |
| Compound-meaning generic-category-tag protection | PASS |
| Explicit action/object requirement | PASS |
| Selected-sense isolation and late-response protection | PASS |
| Wrong-sense rejection | PASS |
| Concrete noun precision: apple fruit, not technology or unrelated fruit | PASS |
| Action precision: running, without shoes or unrelated sports as filler | PASS |
| Emotion precision: fear expression, body language, and reaction | PASS |
| Social concept precision: actual helping interactions | PASS |
| Idiom figurative precision | PASS |

Additional repair regressions separately reject `person`, `person repairing`, and `car vehicle` for `to repair a car`, while retaining `person repairing car`. The browser also exercises the real 修车 entry and its explicit bike-repair meaning.

## 不耻下问

**bù chǐ xià wèn — “not feel ashamed to ask and learn from one's subordinates”**

| Check | Result |
| --- | --- |
| Visual plan and complete meaning preserved | PASS |
| Pixabay queried; Openverse queried; both compete | PASS |
| Human asking/learning scenes competitive | PASS |
| Question-symbol domination prevented | PASS |
| Generic student portraits rejected | PASS |
| Gallery independent of a reviewed visual explanation | PASS |

The real dictionary/app path retains the original definition and pinyin. The planner uses reusable English predicate and scene rules; no Chinese-idiom special case was introduced.

## Second idiom

**魂飞魄散 — selected sense: “fig. to be frightened stiff.”**

Multi-facet behavior: PASS. Figurative visualization: PASS. Provider competition: PASS. No 不耻下问 special-case dependency: PASS. The actual corpus text for `sense-1` is `fig. to be frightened stiff`. Its selected figurative gallery represents fear expressions, trembling/body language, and reactions; it does not use literal soul/flying/scattering queries. Other dictionary senses remain separately selectable.

## Providers and live validation

| Openverse check | Result |
| --- | --- |
| Anonymous `page_size=20` live search | PASS — HTTP 200 |
| Returned/normalized live candidates | 20 / 20 |
| Anonymous requests above 20 prevented | PASS |
| OAuth code path | PASS — deterministic integration and isolated package checks |
| Authenticated live search | NOT POSSIBLE — credentials unavailable |
| Description and genuine alt text retained when supplied | PASS |
| Creator, original source/provider, and license retained | PASS |

The retained 6 October live sample supplied titles for 20/20 candidates, creators for 12/20, and source/license information for 20/20. It supplied no descriptions or genuine alt text; preservation of those optional fields is verified with deterministic fixtures. This continuation did not repeat the live request. A presence-only environment check confirmed that Pixabay and Openverse OAuth credentials remain unavailable.

Pixabay provider code path and mocked integration: PASS. Live Pixabay search: NOT POSSIBLE — API key unavailable. Its public endpoint was reachable and returned HTTP 400 to the deliberately unauthenticated reachability request; this is not a successful search and is not an overall task failure.

## Cache and performance

Picture strategy version: **`dual-provider-360-v1`**; picture relevance version: **`picture-relevance-v3`**. These cover both concurrent provider competition and facet-aware composition. Dictionary visual schema remains **`dictionary-visual-v7`**.

| Check | Result |
| --- | --- |
| Old sequential/fallback picture cache keys invalidated safely | PASS |
| Old repetitive gallery results cannot indefinitely bypass the composer | PASS |
| Dictionary cache and saved words preserved | PASS |
| Unrelated local state preserved | PASS |
| Equivalent queries deduplicated | PASS |
| Provider requests concurrent; failures isolated | PASS |
| Cached searches/results and pending requests reused | PASS |
| Stops when sufficient strong facet coverage exists | PASS |

The client and server picture cache keys include the new strategy. Client picture results are memory-only, requests use `no-store`, and the service worker excludes the image API. Dictionary and saved-word storage are not versioned or cleared by this change.

- Average facets per eligible sense: **1.92**.
- Average unique visual queries per eligible sense: **2.27**.
- Maximum semantic/facet rounds: **3**; thumbnails use at most **2**.
- Openverse candidate cap/request: **20** for gallery, **3** for thumbnail, including authenticated requests.
- Pixabay configured candidate cap/request: **20** for gallery, **3** for thumbnail.
- Normal gallery flow: at most three concurrent Pixabay/Openverse pairs, within the existing eight-second deadline. Optional legacy Pexels fallback and bounded OAuth/token recovery remain separate from this normal search-round count. No requests are added merely to balance provider representation.

Provider calls bounded: PASS. No unbounded query expansion: PASS. The fresh static audit measured **1.9217003369844672** facets and **2.266212103311899** unique queries per eligible sense; observed maximum facets **5** (configured ceiling **6**), maximum rounds **3**, structural failures **0**. Queries are deduplicated, retain the complete selected meaning, and contain no Chinese characters/control characters or overlong values. Eligible plans remain exactly **177,753**, matching the independent zero-gap audit; excluded senses do not gain facet plans.

Measured representative live latency: **NOT MEASURED**. Measured representative live request-count comparison: **NOT MEASURED**. A retained single-run synthetic benchmark, with a fixed 30 ms mock delay per request, recorded **136 ms / 1 Pixabay request before → 142 ms / 2 concurrent provider requests after**. It demonstrates that the second provider participates, but is not a reliable estimate of live latency or workload-wide request counts.

## Corpus and idioms

The standalone `scripts/audit-picture-coverage.ts` was compiled from the current source and rerun cleanly: **PASS**, exit code **0**.

| Corpus check | Verified result |
| --- | --- |
| Dictionary rows | 125,173 |
| English-definition senses | 198,211 |
| Valid visual plans | 177,753 |
| Explicit justified exclusions | 20,458 |
| Unresolved / invalid | 0 / 0 |
| 177,753 + 20,458 = 198,211 | PASS |
| Zero-gap invariant | PASS |
| Tagged idiom senses | 8,583 |
| Idiom senses with / without plans | 8,583 / 0 |
| Idiom coverage | PASS — reconfirmed by the complete unit rerun |

The fresh audit's presentation hash is `e60e3644bbd33c8d19040fab277681a3daa6759ede7a38c53afa75145bb18d63`; word and intent hashes also match the existing regression snapshots. No baseline counts were changed.

## Security and final validation

| Validation | Final result |
| --- | --- |
| Unit/integration (`npm test -- --reporter=dot`) | **742/742 PASS**, 21/21 files; fresh continuation run |
| Expanded Playwright suite | **67/67 PASS**, retained completed 6 October run |
| Focused browser validation after the type correction | **3/3 PASS**: 不耻下问 composition/trace, Openverse competition after six Pixabay results, real-dictionary repair precision |
| Standalone zero-gap audit | PASS — fresh continuation run |
| Static facet/fixture audit (`scripts/audit-semantic-gallery.ts`) | PASS — one full continuation run |
| Production build (`npm run build`) | PASS |
| Server package validation (included in build) | PASS — all seven isolated scenarios |
| Source/security (`npm run check:source`) | PASS |
| Bundle verification (`npm run test:bundle`) | PASS |
| Offline/cache migration (`npm run test:offline`) | PASS |
| Lazy loading and legacy upgrades (`npm run test:lazy`) | PASS |
| Final `git diff --check` | PASS |
| Final working-tree inventory | PASS — 28 intended source/test/script/report files |

The first continuation build exposed a declaration mismatch: scorer output permits `excluded` to be undefined, while `CompetitionTrace.evaluated` required a boolean. Making this diagnostic field optional fixed compilation. Compiling the current source with either declaration produces byte-identical JavaScript, so this correction changes no gallery behavior. The server artifact was regenerated from the current source. The full unit suite and relevant browser cases were rerun; the completed 67-case run remains applicable to the unchanged runtime source.

The browser checks confirm provider competition, diversity, attribution, caching, error recovery, responsive layouts, real-dictionary 不耻下问, 魂飞魄散, and repair precision: **PASS**. Deterministic tests exercise code and rendering; they do not assess arbitrary live image pixels.

| Security check | Result |
| --- | --- |
| Openverse OAuth credentials and access tokens remain server-only | PASS |
| Pixabay key and provider secrets absent from browser assets | PASS |
| Provider/OAuth implementation absent from client graph | PASS |
| Secrets absent from source maps/build | PASS — no production source maps emitted |
| Secrets absent from reports/logs and sanitized API responses | PASS |
| Real `.env` files absent from tracked/current changes | PASS — only `.env.example`, with empty placeholders |
| Required provider/composer code present in server package | PASS |

Package scenarios cover normal requests, Openverse authentication/token reuse, missing keys, provider failures, missing dictionary, missing service, and broken service. Manual source/diff inspection plus checks of changed files/build output found no real API keys, OAuth secrets, tokens, auth payloads, or local credentials. Clearly labeled synthetic credentials remain in validation code and do not occur in production build output.

## Bundle and regression checks

Initial JavaScript is **301,187 bytes** (**92,896 bytes gzip**), only **181 bytes** larger than the prior recorded optimized measurement of 301,006 bytes. The dictionary worker is **49,364 bytes**; semantic data remains a separate lazy JSON asset. The generated server package is **876,695 bytes**, below the existing 1 MB ceiling. Server-only semantic composition and provider code stay out of the React startup graph.

| Regression check | Result |
| --- | --- |
| Dictionary source and Chinese text unchanged | PASS |
| Pinyin, English definitions, and sense mapping unchanged | PASS |
| Saved words and unrelated persistent state preserved | PASS |
| TTS and navigation unchanged | PASS |
| Dictionary worker boundaries and lazy semantic loading preserved | PASS |
| Bundle optimization preserved | PASS |
| Offline/service-worker behavior preserved | PASS |

Fresh offline migration testing preserved dictionary bytes without redownloading, retained saved words and recent history, removed obsolete shells, and bypassed old image API caches. Lazy testing verified a fresh home loads neither the semantic corpus nor the dictionary worker, while starter features and migrated saved entries work offline.

## Before / after examples

All six “before” fixtures contain six Pixabay images. Provider distributions below are fixture outcomes, not quotas.

| Example | Before | After facets represented | After Pixabay / Openverse |
| --- | --- | --- | --- |
| 不耻下问 | Six question-symbol variants | Classroom asking; colleague advice; mentor learning; one symbol | 2 / 2 |
| 魂飞魄散 | Six fear-expression images | Fear expression; trembling/body language; reaction to danger | 3 / 1 |
| 苹果 | Six whole-apple images | Sliced appearance; basket/market context; eating; whole fruit | 3 / 2 |
| 跑 | Six track-running images | Track practice; child running in a park; trail running | 3 / 1 |
| 害怕 | Six fearful-face images | Facial expression; cowering/trembling; situational reaction | 3 / 2 |
| 帮助 | Six helping-hand symbols | Helping an elderly neighbor; workplace teamwork; classroom help; one symbol | 2 / 2 |

不耻下问 gains visible asking and learning interactions while retaining one symbolic cue. 魂飞魄散 and 害怕 show complementary manifestations of fear rather than unrelated emotions. 苹果 adds appearance, context, and use while keeping the fruit central. 跑 broadens actors and settings while retaining the running action. 帮助 adds actual assistance in several settings. Every selected fixture candidate passes the same semantic eligibility gate before diversity contributes to ordering.

## Files changed

All **28** changed/untracked files were reviewed. Existing implementation and regression coverage are preserved; this continuation changes the trace type, regenerates the server bundle, and finalizes this report.

| Group | Complete intended inventory |
| --- | --- |
| Server source and generated artifact | `server/image-plan.ts`, `server/image-service.mjs`, `server/images.ts`, `server/providers.ts`, `server/visual-search.ts`, `server/semantic-gallery.ts` |
| Shared client types/cache/identity | `src/lib/visual-schema.ts`, `src/lib/visual.ts`, `src/types.ts` |
| Validation scripts | `scripts/audit-semantic-gallery.ts`, `scripts/benchmark-gallery.ts`, `scripts/validate-gallery-live.ts` |
| Browser tests | `tests/browser/english-picture-fallback.spec.ts`, `tests/browser/idiom-visuals.spec.ts`, `tests/browser/semantic-gallery.spec.ts` |
| Unit/integration tests and fixtures | `tests/conceptual-visuals.test.ts`, `tests/english-picture-fallback.test.ts`, `tests/idiom-visuals.test.ts`, `tests/meaning-visuals.test.ts`, `tests/openverse.test.ts`, `tests/picture-relevance.test.ts`, `tests/pixabay.test.ts`, `tests/universal-idiom-coverage.test.ts`, `tests/visual-coverage.test.ts`, `tests/gallery-data.ts`, `tests/gallery-fixtures.ts`, `tests/semantic-gallery.test.ts` |
| Final report | `SEMANTIC_GALLERY_VALIDATION.md` |

## Removed temporary files

- `.tmp/`: reviewed scratch audit bundles/JSON, diagnostic exports, mock benchmark output, historical test/build logs, screenshots, browser-result directories, temporary package copies, and download cache. Verified final values are retained in this report; reusable validation scripts and fixtures remain in source.
- `test-results/`: generated Playwright run state.

Task-owned development/preview processes were stopped. Generated ignored production output (`dist/`) and the normal TypeScript build cache are retained. No source, intended tests, or requested reports were removed.

## Remaining limitations

- Live Pixabay search requires an API key that is unavailable here.
- Authenticated Openverse live validation requires credentials that are unavailable here.
- Live third-party image relevance and diversity depend on available inventory and the accuracy/completeness of provider metadata.

**COMMIT/PUSH: NOT PERFORMED.**
