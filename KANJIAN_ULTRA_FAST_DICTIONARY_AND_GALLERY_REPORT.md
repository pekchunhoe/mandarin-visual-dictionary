# KANJIAN — dictionary startup and progressive semantic galleries

16 October 2026, Asia/Kuala_Lumpur. Local implementation and validation are complete. The Production record below will be completed after deployment and live verification.

## A. Baseline, root causes and implementation

The starting local `main`, `origin/main` and READY Production deployment were `b2cb0262a521645bb2c398b039bef03c8c5fed47`, deployment `dpl_76autCDEjSPpsEJNRQLeXCif7uFM`. The existing repository and Vercel project are unchanged. The verified rollback copy is `.tmp/malay-datasets/backups/2026-10-16T01-12-15-252Z/`, containing 318 independently copied files, a SHA-256 manifest and restoration instructions. All 15 pre-existing untracked research files were independently checked against that manifest and remain unchanged and excluded from this release.

The lexical accuracy, translation recovery, twenty-picture gallery, relevance, bundle and Openverse reports were reviewed as historical evidence. New measurements, rather than their old timing numbers, underpin this report.

The actual gallery path remains: canonical word and selected sense → existing English whole-context plan and complementary facets → concurrent Pixabay/Openverse searches → normalization, license/URL checks → selected-sense relevance, cross-provider deduplication and diversity composition → image metadata → browser thumbnail requests → rendering. Existing idiom fallback and optional sparse-gallery Pexels rescue remain in this path.

The important bottlenecks were:

- **Delivery barrier:** the providers already ran concurrently, but the server waited for both and all necessary rounds before returning one JSON response. The client then waited for that complete response before rendering any live gallery metadata.
- **Repeated composition:** the same immutable candidate pool was ranked repeatedly for progress, round stopping and final output. Its composition is now reused until another provider appends candidates.
- **Image choice:** the old leading Openverse tile could use the original image even when a thumbnail existed. It now uses the supplied thumbnail. Pixabay retains a sharp medium leading tile, with the smaller supplied variant on low-density phones. Original preview images are requested when the preview opens.
- **Index allocations:** exact postings repeatedly copied arrays, most postings allocated a one-element array, an additional ID/order map duplicated corpus identities, and every searchable row had another wrapper object. Integer/singleton postings, in-place appends and direct key arrays remove those allocations. Duplicate raw strings are normalized once per entry, ASCII text skips irrelevant Unicode decomposition, and repeated Malay construction terms share normalization work.
- **First-result barrier:** exact Mandarin matches waited for the full multilingual/trigram index. After the corpus, Malay overlay and visual data are ready, the worker now publishes complete exact Han matches as partial results. Final ranked results still resolve the original request and populate the normal search cache. Clicking a prepared result opens it immediately.
- **Repeated Malay metadata:** the readable runtime repeats long provenance, licensing and review strings. A derived column/string-table transport preserves every field while substantially reducing JSON bytes and sharing repeated decoded strings.

The API now supports opt-in `Accept: application/x-ndjson`. Each newline contains `{ result, done }`. The first qualifying image can be published alone; no minimum batch is imposed. Each completed provider can improve the gallery. Both providers still finish their shared round before any stopping decision. Final membership uses the same relevance, deduplication and diversity rules, with no arrival-order bonus or equal-provider quota. Existing JSON callers and JSON validation errors remain supported.

The browser shares each in-flight request, forwards partial snapshots to its subscribers, and caches only successfully completed results. An interrupted stream leaves already available pictures usable with a retry notice, without treating partial inventory as a complete cache hit. Surviving pictures retain their positions; preview selection follows picture ID. Obsolete callbacks cannot update a new word or sense. Warm cached metadata can render synchronously, without an extra loading transition. Offline lookup uses the existing bundled fallback rather than remote cached references.

The approximately **20-picture target is unchanged**. First visible pictures load eagerly with priority; other pictures remain browser-lazy, asynchronously decoded, and dimensionally stable. Loading placeholders reserve the leading tile geometry. Large originals are not mirrored or proxied through KANJIAN.

## B. Reproducible performance measurements

Hardware: Intel Core i5-10210U, eight logical CPUs, 12,728,672,256 bytes RAM, Windows 11 (`10.0.26200`), Node 24.18.0. Browser checks use installed Microsoft Edge 155. Desktop viewport is 1280×900; the constrained phone viewport is 390×844, with CDP 4× CPU slowdown, 1.6 Mbps download, 750 Kbps upload and 100 ms network latency. This is a browser simulation, not a measurement on physical Android hardware; CDP worker throttling is not independently guaranteed.

### Isolated index benchmark

Three alternating baseline/optimized subprocess runs used the same corpus, meanings, search workload and explicit garbage collection. The baseline executable was captured before editing. The optimized benchmark uses the decoded lossless transport. Network transfer is excluded. `builtMs` includes corpus object construction, Malay attachment and index construction; retained heap also includes the benchmark's retained corpus/lookup structures.

| Metric | Baseline median | Optimized median |
| --- | ---: | ---: |
| Construction | 5,555.94 ms | 5,032.87 ms |
| Retained heap | 321,675,896 B | 220,190,688 B |
| Retained RSS | 674,729,984 B | 544,411,648 B |

Construction improves approximately 9.4%; retained heap falls approximately 31.6% (101.5 MB). The first pre-edit profiled measurement was 5,467.35 ms and 322,134,808 bytes retained heap. The earlier preliminary 92 MB reduction is superseded by this repeated comparison, which includes the transport's string sharing. Warm-query median-of-run medians remained small: 猫 0.100 → 0.092 ms; dog 0.150 → 0.106 ms; pinyin `chang jing lu` 1.518 → 1.474 ms; Malay `anjing` 0.571 → 0.550 ms and `membantu` 0.393 → 0.362 ms. Tiny differences are not all improvements: the long Malay phrase was 0.404 → 0.408 ms. Complete per-query timings and all six runs are retained in `.tmp/ultra-fast/dictionary-comparison.json`.

### Controlled provider discovery

`scripts/profile-gallery.mjs <rollback-project>` compares the actual old/new orchestrators with identical semantic data and controlled 100 ms/800 ms providers. These are simulated provider responses, not claims about provider network speed. It records provider, plan, round and final trace events.

| Fast provider | First metadata before → after | Complete response before → after | Provider requests | Final inventory |
| --- | ---: | ---: | ---: | --- |
| Pixabay | 907 → 111 ms | 907 → 860 ms | 2 → 2 | 20 → 20 |
| Openverse | 868 → 119 ms | 868 → 849 ms | 2 → 2 | 20 → 20 |

The fast-Pixabay case publishes four qualifying pictures before the peer completes. The fast-Openverse case can publish 20 immediately; the slower provider still competes and improves final membership. An explicit assertion also confirms identical final picture IDs and server ordering in both arrival orders. Final provider composition is identical before and after: 19 Openverse, one Pixabay. A separate regression verifies publication of **one** qualifying image while a peer is still pending. Cached server discovery adds zero upstream requests; measured cached orchestration drops from 56–64 ms to 32–34 ms in this instrumented scenario. Trace observers themselves perform extra diagnostics, so these are not pure production ranker CPU timings.

### Controlled browser profile

`node scripts/profile-performance.mjs before|after` serves the production build, gzip-compressed dictionary assets, a fixed JPEG, and explicitly simulated image discovery. The image API has an early four-image batch at 200 ms and final 20 at 1,200 ms; old clients receive JSON at completion, streaming clients receive progressive snapshots. Each selected fixture has a distinct URL and metadata; the image bytes are the same local test photograph, so this does not independently verify 20 different real scenes. Both profiles require all 20 grid images to finish loading with positive natural dimensions after scrolling.

Final optimized build comparison:

| Metric | Desktop before → after | Constrained phone before → after |
| --- | ---: | ---: |
| Home visible | 383 → 375 ms | 2,556 → 2,046 ms |
| First exact Mandarin result | 5,868 → 1,309 ms | 37,329 → 31,542 ms |
| Worker ready after optimized first search | — → 4,857 ms | — → 35,721 ms |
| Optimized worker index-only measure | — → 3,588 ms | — → 4,484 ms |
| Malay resource transfer | 210 → 106 ms | 16,143 → 14,171 ms |
| First loaded gallery image | 1,622 → 611 ms | 4,749 → 639 ms |
| First four loaded images | 1,640 → 619 ms | 4,885 → 2,729 ms |
| Final metadata available | 1,551 → 1,542 ms | 1,718 → 1,896 ms |
| All 20 loaded, including scripted scrolling | 1,879 → 1,818 ms | 12,213 → 10,672 ms |
| Warm gallery navigation | 100 → 78 ms | 640 → 694 ms |
| Gallery API requests, cold + warm navigation | 1 → 1 | 1 → 1 |

Image timing uses real browser image `load` events and positive natural dimensions, not skeleton visibility. It does not measure the final CSS fade's last frame. The first-image improvement comes from earlier metadata and prioritized/lazy downloads, rather than removing pictures. All-gallery timing includes the benchmark's scroll sequence and is not a promise that offscreen images eagerly finish.

Warm cached metadata renders synchronously and makes no second API request. The phone navigation measurement still regresses by about 54 ms in this single run; it includes returning through home and mounting the complete gallery under CPU slowdown. No universal warm-navigation improvement is claimed. Desktop fixture image bytes were 2,159,580 → 2,267,559 B; phone bytes remained 2,159,580 B. Separate display/thumbnail variants can add bytes even when metadata is cached. These results establish earlier useful pictures, not a universal image-byte reduction.

There were zero desktop main-thread long tasks and six phone long tasks in both final comparison runs. Whole scripted-session layout-shift sums were approximately 1.066 → 1.064 desktop and 1.252 → 1.253 phone. These include automatic home/search/detail hash navigations and are **not clean user-navigation CLS scores**. They do not support a claim of a CLS improvement. Browser main-thread heap readings of about 5–6 MB exclude worker memory; the isolated heap benchmark above supplies the comparable memory evidence.

The phone still spends roughly 28 seconds downloading the unchanged 4.13 MB gzip CC-CEDICT asset. A never-downloaded full corpus is consequently not instant at 1.6 Mbps. Starter searches remain immediately available through the existing small local collection; previously downloaded corpus/runtime assets remain available offline.

### Data and build size

| Asset | Before | Optimized |
| --- | ---: | ---: |
| Authoritative readable Malay runtime | 15,445,028 B | unchanged |
| Deployed Malay transport | 15,445,028 B | 4,102,517 B |
| Transport gzip | 1,417,521 B | 1,158,839 B |
| Initial JavaScript | 322,308 B | 324,802 B |
| Dictionary worker | 56,409 B | 57,853 B |
| Distribution, 54 files | 30,541,015 B | 19,202,968 B |

The derived transport cuts uncompressed Malay bytes by 73.4% and gzip transfer by 18.2%. All original fields, including provenance, licenses, review status, English alignment and lexical supplements, round-trip exactly across all 14,761 records. Its generator independently reconstructs and compares every record before writing. Decoder tests also compare the complete decoded asset to the readable runtime. The decoder accepts the prior schema as well. The canonical runtime and authoritative translation store remain byte-for-byte unchanged.

Build, development startup and `malay:build` regenerate the derived asset. Hashed URLs and the existing service-worker upgrade allowlist prevent cross-version reuse; home still does not eagerly load corpus, Malay or semantic JSON. Index persistence was not added: versioned browser data caching already avoids repeat transfer, while this change reduces construction and allows early results without persisting a second large index.

### Genuine Production baseline

The original live running API took 2,533 ms to return one JSON result containing 20 unique images: 12 Pixabay and eight Openverse, all eight with licensing metadata. The live mobile-width browser loaded all 20 with no failures or page errors. Its first recorded load (350 ms) included the existing bundled fallback; it is **not** a cold live-provider first-image measurement. First four loads took 3,273 ms. The live first full dictionary lookup took 17,600 ms on the uncontrolled connection.

The first short-ID idiom probe correctly returned 400. A corrected canonical-ID probe returned 20 images, 14 Pixabay and six Openverse, in 5,488 ms. This corrected result is in `live-before-idiom.json`. No conclusion is drawn from the invalid probe about provider inventory. Production cold-start, token, upstream and image-host time cannot be individually separated from these public endpoint observations; controlled trace tests isolate the delivery barrier instead.

## C. Gallery quality, counts, caching and limits

Existing whole-context planning, idiom fallback, relevance thresholds, negative evidence, semantic facets, diversity composition and URL/source identity deduplication remain authoritative. No visual-recognition model, unrelated filler, reduced target or forced provider quota was introduced. The controlled corpus covers common nouns (猫, 狗, 苹果, 学生), running/helping/studying/asking/raising-hand activities, 不耻下问 and difficult idioms, and separate bank/light/current/spring/charge meanings. Existing six 20-image scenarios and truthful four-/12-image inventories remain covered by browser tests.

The process-local provider cache remains bounded to 500 entries, with shared in-flight provider requests, 24-hour successful/empty metadata lifetime, 60-second failure caching and rate-limit cooldowns. The browser complete-result cache remains bounded to 100 entries. Keys retain canonical word/sense, query, provider, mode, configuration fingerprint and semantic strategy version. Gallery-to-thumbnail reuse now also accepts a valid already available partial image, avoiding another call or waiting for the remaining gallery.

Both normal providers still run concurrently, with up to three semantic rounds, existing 3.5-second per-search timeouts and an eight-second overall deadline. OAuth acquisition remains single-flight with token reuse, invalidation and bounded anonymous fallback. The public API retains its 30-request/minute client rate limit and existing validation. Cancellation discards obsolete UI updates; shared provider requests can finish usefully for cache reuse. Stream reading has the existing ten-second browser deadline and an explicit one-MiB total payload bound.

Only current metadata references are reused; expired image URLs are not displayed through stale-while-revalidate. Existing per-instance caches do not guarantee cross-instance reuse, global rate-limit coordination or unlimited traffic. No external cache/database was provisioned. Cache hits were 100% for the controlled repeat request after the first fill, with zero additional provider calls; this is not a claim about an unknown production-wide hit rate.

Pixabay's [official documentation](https://pixabay.com/api/docs/) requires 24-hour request caching and allows temporary search-result display; its default limit is 100 requests per 60 seconds. The current temporary URL/expiry behavior and attribution remain. [Openverse's API reference](https://api.openverse.org/v1/) documents free anonymous/registered access, response rate-limit headers and 429 handling. Existing supported CC BY, CC BY-SA, CC0 and Public Domain Mark filtering, creator, source, original-source and license links are preserved. [Vercel supports streamed function responses](https://vercel.com/docs/functions/streaming-functions); the existing Node function retains its 15-second configuration. The actual team was verified active on **Hobby**. No hosting upgrade, paid API, translation model, image proxy, new subscription or account provisioning was used.

## D. Malay content and integrity

| Content | Before | Newly added | After |
| --- | ---: | ---: | ---: |
| Dictionary entries | 125,173 | 0 | 125,173 |
| Dictionary senses | 198,245 | 0 | 198,245 |
| Senses with Malay content | 14,761 | 0 | 14,761 |
| Explicit lexical equivalents | 1,861 | 0 | 1,861 |
| Completely untranslated senses | 183,484 | 0 | 183,484 |

Secondary enrichment was deferred to preserve the speed-focused scope. No new unreviewed translations were manufactured. Existing generated/provisional meanings retain their review labels; all 14,761 stored runtime records still require independent language review. This change improves delivery, not linguistic approval status.

Verified unchanged SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `public/data/cedict.json` | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `scripts/data/malay-translations-v1.json` | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `src/data/malay-runtime.json` | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |

Independent comparison against the rollback implementation checks 938,640 actual corpus normalization inputs and exact result identities/order for 821 representative queries. Both pass. Existing complete corpus/semantic snapshots additionally protect meanings, pinyin, IDs, English definitions and visual classification.

## E. Validation and limitations

Final isolated validation passed **875 tests across 36 files** (`vitest run --no-file-parallelism`, 99.67 seconds), with zero failures or skips. All **90 browser cases** passed across the full runs and isolated reruns. The latest full browser command reported 89 passed and one resource-contention timeout; that same lookup/error-recovery case then passed in 7.7 seconds, and the stale-sense and real-stream phone/desktop cases passed again in the same isolated four-case run. Checks include full unit/integration and browser suites; actual HTTP chunk streaming; fragmented Unicode/JSON; one-image progress; late stronger-provider competition; interruption and final-only caching; shared subscribers; stale word/sense updates; warm/offline cache behavior; canonical search ordering; lossless Malay reconstruction; attribution; large previews; and 20 loaded images at phone/desktop widths.

The first unconstrained parallel test run encountered corpus/import timeouts. A subsequent two-worker run passed all then-current 872 tests. During final concurrent build/browser/unit work, the corpus snapshot again exceeded its unchanged 60-second timeout and one browser English lookup exceeded its unchanged 30-second wait. Isolated reruns resolved those outcomes; timeouts and assertions were not weakened. The first browser pass also exposed and led to fixes for the sharp first Pixabay tile and clicking an early result while indexing. Their three targeted reruns passed. The final isolated complete unit run subsequently passed all 875 tests.

Production build/type checks and all seven isolated deployment packaging scenarios passed. Source/secret checks, CSP/API exclusions, bundle boundaries and whitespace checks passed. General offline migration and lazy saved-word/upgrade checks passed. Static preview image API 404s are expected in the offline/lazy verification server; these exercise existing fallback behavior and are not live-provider errors.

A separate isolated Node stress process failed to construct the full index under a **256 MiB V8 heap cap**, despite the lower retained heap. Temporary construction allocations and non-heap typed-array storage still matter; the retained-heap improvement is not a claim that all startup memory fits within 256 MiB. The same optimized workload did complete under a **384 MiB V8 heap cap** in 5,187 ms, retaining 220,270,792 bytes after explicit GC. These are Node heap-cap probes, not physical Android/browser memory guarantees. The failed probe was local and isolated, not a Production failure.

Remaining limits: actual provider metadata can be sparse or incorrect; filtering is not an independent review of pixels. Third-party host failures/ORB blocks can still occur. No perceptual duplicate detector was added. Real image bytes vary with inventory and hosts, so fixture byte totals do not establish a real-world bandwidth reduction. Twenty is conditional on valid inventory within existing request/deadline limits. The home/static and first-full-corpus workloads remain materially different. A fresh offline install cannot search corpus data that has never been downloaded.

## F. Release, live verification and rollback

All essential local checks are complete. Safe commit/push and the existing Git-triggered Production deployment follow. No force push or replacement repository/project is authorized or used. The prior Production deployment remains the rollback target until the new release is verified. Detailed final source SHA, READY deployment, asset hashes, public gallery streaming and actual loaded image counts will be appended here.

Rollback can restore the previous known-good commit through a normal revert and the existing deployment workflow, or restore the previous READY deployment using the established Vercel project. Local source/data restoration instructions and verified bytes remain in the checkpoint. No canonical data migration needs reversal because the authoritative files were unchanged.

Reproducible local evidence: `.tmp/ultra-fast/` contains the profiled pre-edit CPU trace; isolated before/after executables and six subprocess measurements; provider trace comparisons; before/after browser resource/timing records; live observations/screenshots; corpus and research-file integrity checks; and result-order parity. The compact committed record is `scripts/data/ultra-fast-performance-verification.json`.
