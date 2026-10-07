# KANJIAN — 20-PICTURE 360° SEMANTIC GALLERY

Validation date: 7 October 2026, Asia/Kuala_Lumpur. Implementation extends the existing provider competition and semantic gallery pipeline. Dictionary content and classification are unchanged. No staging, commit, or push performed.

Final result: **PASS**, with live authenticated-provider limitations stated below. Browser case totals include the explicit focused reruns described under Tests.

## Root cause of small galleries

| Stage | Previous behavior and actual bottleneck |
| --- | --- |
| Backend target/limit | Response capped at 12, but early stopping accepted four images with two complementary facets, otherwise six. |
| Candidate pool | Each provider already requested 20 per gallery query. The early stopping rule usually prevented subsequent distinct facet searches. Retrieval depth, rather than page size, was the bottleneck. |
| Semantic filter | Wrong-sense and action/object requirements legitimately remove candidates. The generic phrase `with fear and trepidation` did not reuse the existing scared/frightened emotion family, rejecting useful synonym scenes in the controlled baseline. Narratives were previously concatenated into subject evidence and could create incidental matches. |
| Diversity/composition | A hard two-per-cluster cap discarded useful different settings and actors within a facet whenever complementary clusters existed. |
| Frontend display | Client capped both online and offline galleries at 12. The main grid itself had no separate four/six cap. “Learn with pictures” always repeated the first three images. |
| Other limits | Six facets, three gallery queries, two thumbnail queries, one thumbnail, symbol restrictions, timeouts, and provider normalization safety limits were separate purposes. They were not blindly raised. |

Before editing, the previous implementation was compiled and measured against the same large deterministic inventories. The pipeline was raw → normalized → quality-qualified → deduplicated → composer → returned:

| Case | Raw / normalized | Qualified / deduplicated | Clusters | Previous composed/returned | New composed/returned | New browser cards |
| --- | --- | --- | --- | --- | --- | --- |
| 苹果 | 36 / 36 | 36 / 36 | 5 | 8 | 20 | 20 |
| 跑 | 36 / 36 | 36 / 36 | 3 | 5 | 20 | 20 |
| 害怕 | 36 / 36 | 36 / 36 | 3 | 6 | 20 | 20 |
| 帮助, curated `assistance; aid` | 36 / 36 | 36 / 36 | 3 | 6 | 20 | 20 |
| 不耻下问 | 36 / 36 | 36 / 36 | 3 | 6 | 20 | 20 |
| 战战兢兢, sense 2 | Previous 72 / 72; new 36 / 36 | Previous 0 / 0; new 36 / 36 | Previous 0; new 3 | 0 | 20 | 20 |

The user's approximate four-image screenshot baseline was not reproduced: its inventory was not attached. The measured zero above uses a controlled pool of frightened/scared/fearful scenes and exposes the old general state-phrase mismatch. It is not a claim that the previous live gallery always returned zero.

## New gallery behaviour

`TARGET_GALLERY_SIZE = 20` is shared by server selection, default ranking, stopping, and client online/offline limits. Thumbnails remain one image.

| Inventory | Verified selection |
| --- | --- |
| 36 sufficiently relevant candidates, six representative meanings | Exactly 20 each |
| 17 / 14 / 12 / 9 / 7 / 4 strong single-facet candidates | Exactly 17 / 14 / 12 / 9 / 7 / 4 |
| Weak candidates inserted to fill 20 | NO |

Different settings and actors can contribute additional depth within an important facet. Exact repeated semantic descriptions remain limited to two when complementary clusters exist. Same-cluster repetition receives a progressive quadratic penalty, capped at 180, plus similarity penalties. The existing useful single-facet fallback remains available. When human scenes exist, at most one generic symbol survives. Novelty only reorders candidates that already passed the quality gate.

## Search depth and measured performance

| Check | Result |
| --- | --- |
| Maximum distinct gallery facet/query rounds | 3 |
| Maximum thumbnail rounds | 2 |
| Configured facet ceiling / observed corpus maximum | 6 / 5 |
| Pixabay gallery candidates/query | 20 |
| Openverse gallery candidates/query, anonymous and authenticated | 20 |
| Provider thumbnail page size | 3 |
| Equivalent query deduplication | PASS |
| Adaptive early stopping | PASS |
| Provider requests bounded | PASS |

Both providers complete their concurrent round before the stop decision. A full 20 with adequate facet coverage stops immediately. A populated repeated round that adds no unique candidates, qualified candidates, clusters, or gallery count stops expansion after at least two rounds. Empty/weak queries can still reach useful later complementary queries. Maximum normal searches are six provider requests, yielding up to 120 raw records across three pairs, under the existing eight-second deadline and 3.5-second request timeout. Failures and rate limits remain isolated. OAuth/token recovery has its existing bounded extra requests. Optional legacy Pexels remains a sparse-gallery rescue below six, with its existing request bounds; it is not a new source for expanding every gallery to 20.

Fresh uncached measurements from `scripts/audit-gallery-size.ts` used deterministic inventory and a fixed **20 ms mock delay per provider request**. These are local pipeline timings, not live network latency or reliable before/after performance comparisons.

| Case | Provider calls / rounds | Raw → normalized → qualified → deduplicated → composed → returned | Latency ms | Final Pixabay / Openverse |
| --- | --- | --- | --- | --- |
| 苹果 | 2 / 1 | 36 → 36 → 36 → 36 → 20 → 20 | 218 | 9 / 11 |
| 跑 | 2 / 1 | 36 → 36 → 36 → 36 → 20 → 20 | 167 | 12 / 8 |
| 害怕 | 2 / 1 | 36 → 36 → 36 → 36 → 20 → 20 | 449 | 12 / 8 |
| 帮助 | 2 / 1 | 36 → 36 → 36 → 36 → 20 → 20 | 126 | 12 / 8 |
| 不耻下问 | 2 / 1 | 36 → 36 → 36 → 36 → 20 → 20 | 127 | 11 / 9 |
| 战战兢兢 | 2 / 1 | 36 → 36 → 36 → 36 → 20 → 20 | 124 | 10 / 10 |
| Lower-yield 苹果 | 6 / 3 | 96 → 96 → 24 → 24 → 20 → 20 | 266 | Quality decides |

The lower-yield queries are `apple fruit`, `apple fruit sliced`, and `apple fruit market`. Each provider returns 16 records/query: four strong new scenes and twelve unrelated records. Each round adds eight qualified unique candidates; composed counts are 8 → 16 → 20. No increase beyond 20/request was needed. A separate nine-image repeated inventory stops after two rounds/four requests and returns nine. Cached repetition issues no new network calls.

Opt-in server diagnostics now expose target, raw and normalized counts, quality-qualified count, deduplicated count, semantic clusters, composed/final count, and per-query/provider counts. Round diagnostics include new unique candidates, newly qualified candidates, new clusters, new covered facets, and new gallery count. Raw counts describe records consumed by logical queries, including cached query results; cache events distinguish network misses from reuse. No credentials, authorization headers, upstream URLs/bodies, or automatic production logging are added.

## Semantic quality

| Check | Result |
| --- | --- |
| Relevance gate preserved; no global threshold relaxation | PASS |
| Wrong-sense filtering, selected-sense isolation | PASS |
| Explicit action/object requirements | PASS |
| Metadata-only keyword accidents | PASS, focused regressions |
| Long narrative captions appropriately downweighted | PASS |
| Semantic clustering and 360° composition | PASS |
| Progressive dominant-cluster penalty | PASS |
| Generic symbol domination prevented | PASS |
| Provider-order neutrality and cross-provider deduplication | PASS |

Concise subject titles, actual alt text, and actual tags supply primary evidence. Descriptions contribute only bounded short descriptive statements and carry a caption-only ranking penalty. Long statements, first-person narratives, photographer/camera stories, and URLs do not establish depicted subject evidence. Openverse no longer synthesizes a tag from its title, which previously could bypass field handling. Complete original metadata remains available for attribution. Emotion matches additionally require visible state context or an independently relevant short subject tag. Generated query/display fallback text is not semantic proof.

This filters general metadata patterns, without sweater/animal exceptions or Chinese-word rules. Existing exact/related/context tiers, negative evidence, and required action objects remain intact. Concise visible descriptions still work when title/tags are sparse; strong independent tags still work despite an unrelated long narrative.

## 战战兢兢 regression

Selected meaning remains **“with fear and trepidation”**, dictionary sense 2. Both providers: PASS. New capacity: **20**, versus controlled baseline **0** described above. Frightened facial expressions, trembling body language, and reactions to danger qualify across three complementary clusters. Narrative sweater and animal records are rejected. Bare abstract fear titles and nonvisual object descriptions are rejected unless independent subject evidence supports the state. Symbols cannot dominate human scenes.

The fix recognizes compatible English state phrases through the existing emotion lexicon/templates. It does not hardcode 战战兢兢, change its definition or visual classification, or switch its selected sense. “Visible” here is a semantic metadata expectation tested deterministically; these tests do not perform pixel recognition.

## 不耻下问 regression

Plan/full meaning preserved: PASS. Both providers: PASS. Twenty-image capacity: PASS. Human asking/learning/guidance scenes: PASS. Question-symbol domination prevented: PASS. The large fixture covers classroom questions, workplace advice, and mentor/learner interaction; existing symbol-heavy fixture and provider-order tests remain passing.

## UI and providers

Main gallery exposes all selected images up to 20 and keeps the existing responsive grid. Client's old 12 cap is removed. “Learn with pictures” remains a three-card overview, now selecting representatives across the gallery with new-facet preference and meaningful labels instead of repeating the first three. Preview uses the representative's original gallery index. Loading remains the existing stable batch response; no streaming or reshuffling system was introduced.

Phone 375px / tablet 768px / desktop 1280px: **PASS**. Tests verify 20 unique cards, the twentieth preview, overview preview mapping, license attribution, caption fit, no horizontal overflow, no duplicate-key errors, and retention of selected definitions. Browser limited-inventory cases verify exactly four and twelve. Horizontal overflow: **NONE** in tested viewports. An additional 375px screenshot check inspected the top and bottom of the 20-picture fear gallery, waiting for visible fixture images to load; cards, wrapped attribution, and the representative overview fit without overlap.

Pixabay active: PASS. Openverse active: PASS. Concurrent search: PASS. Provider-neutral ranking: PASS. Openverse anonymous ≤20/request: PASS. Both providers can rank first; completion-order and popularity cannot replace relevance. Provider ratio forced: **NO**.

## Cache

Picture strategy: **`dual-provider-360-20-v2`**, replacing `dual-provider-360-v1`. Both client and server picture keys use it, so old small-gallery results cannot bypass the new strategy. Strategy/cache tests: PASS. Dictionary visual schema remains **`dictionary-visual-v7`**; picture relevance schema remains `picture-relevance-v3`. Saved words, dictionary bytes, TTS and unrelated state are unchanged. Image requests use no-store and remain excluded from service-worker API caching.

## Corpus and idioms

| Check | Fresh verified result |
| --- | --- |
| English-definition senses | 198,211 |
| Valid plans | 177,753 |
| Explicit exclusions | 20,458 |
| Unresolved / invalid | 0 / 0 |
| Zero-gap invariant | PASS: 177,753 + 20,458 = 198,211 |
| Tagged idiom senses | 8,583 |
| With / without plans | 8,583 / 0 — PASS |

Standalone coverage and facet audits were compiled from current source and rerun. Facet audit: 177,753 eligible plans; average facets 1.9217678463935912; average unique queries 2.26622898066418; maximum queries 3; structural failures 0. The complete unit run reconfirmed presentation/classification snapshots and all 8,583 idiom plans. No baseline count or dictionary file was changed.

## Tests and security

| Validation | Result |
| --- | --- |
| Focused count/metadata + semantic-gallery tests | 54/54 PASS |
| Broader image/provider/relevance/cache regressions | 446/446 PASS |
| Complete unit/integration suite | **765/765 PASS**, 22/22 files |
| Browser validation | **77/77 cases verified PASS**: full 77-case run had 73 passes and four obsolete assertion failures; corrected cases then passed 4/4 focused reruns |
| Production build | PASS |
| Package/security checks | PASS, seven isolated package scenarios |
| Typecheck | PASS |
| Source/built-asset boundary checks | PASS |
| Bundle boundaries and offline lazy chunk inclusion | PASS |
| Offline/cache migration | PASS |
| Lazy runtime verification | PASS, isolated final rerun |
| `git diff --check` | PASS |
| Whitespace including untracked source/config additions | PASS |

The production build regenerates `server/image-service.mjs`. Initial JS is 302,109 bytes (93,351 gzip), versus the preceding report's 301,187 bytes (92,896 gzip): +922 bytes, or +455 gzip. Lazy WordDetail is 10,761 bytes; dictionary worker 49,364 bytes; semantic JSON 750,817 bytes. Generated server service is 879,012 bytes, below the existing 1 MB ceiling. Server scoring/data remain out of browser chunks; the complete semantic JSON is still lazy-loaded once. OAuth secrets/access tokens and Pixabay keys remain server-only; provider errors do not expose secrets. No local credentials are configured, no `.env` is added, and `.env.example` remains empty placeholders. Package checks cover missing credentials, token authentication, provider failure, and missing/broken dictionary/service artifacts.

Initial validation runs experienced dictionary/snapshot timeouts during concurrent heavy validation. The isolated complete unit rerun passed without timeout changes. The complete browser run passed all ten new gallery cases and 63 existing cases; one historical two-query stop assertion and three historical two-per-facet assertions failed. Those assertions were updated to the intended new depth and repeated-description contract, and all four cases passed their focused rerun. This is a complete suite run plus targeted reruns, not a claim of one clean 77-case invocation.

## Live providers

- **Pixabay:** live search NOT POSSIBLE — key unavailable. An unauthenticated reachability request returned HTTP 400; it is not a successful search.
- **Openverse anonymous:** one small `person running` request at `page_size=20` returned **HTTP 200**, 20 raw/normalized images, 20 titles, 20 source links, 20 license links, and 12 creator fields. No descriptions/alt text were supplied by this live response. No >20 request or corpus-wide search was made.
- **Openverse authenticated:** NOT POSSIBLE — OAuth credentials unavailable. Mocked authentication and failure isolation passed.

The initial sandboxed network attempt could not connect; the requested small check succeeded outside the network sandbox. Live twenty-picture semantic/gallery quality and representative live latency were not measured. Anonymous endpoint availability is verified separately from the deterministic gallery behavior.

## Files changed

- `server/images.ts` — target, adaptive depth, per-round/count diagnostics, overview facet metadata.
- `server/semantic-gallery.ts` — larger stopping target, metadata evidence, progressive depth and semantic repetition control.
- `server/visual-search.ts` — general English state phrases, visible-state evidence, caption penalty, reusable qualified pool.
- `server/providers.ts` — actual Openverse tags kept separate from title.
- `server/image-service.mjs` — regenerated production service.
- `src/lib/visual-schema.ts` — shared target and image strategy version.
- `src/lib/images.ts` — client online/offline target caps.
- `src/lib/visual.ts` — representative overview selection and labels.
- `src/types.ts` — optional gallery facet metadata.
- `src/components/VisualGallery.tsx` — representative overview and correct preview indices.
- `scripts/audit-gallery-size.ts` — reproducible count/depth/latency fixture audit.
- `tests/large-gallery-data.ts` — reusable large, semantically varied provider fixtures.
- `tests/large-gallery.test.ts` — 21 count/quality/depth regressions.
- `tests/browser/large-gallery.spec.ts` — ten large/limited/responsive gallery cases.
- `tests/image-client.test.tsx` — client target, cache, limited inventory and overview checks.
- `tests/semantic-gallery.test.ts` — new strategy expectation.
- `tests/images.test.ts` — updated intended final cap.
- `tests/meaning-visuals.test.ts` — subject-state evidence in generic fixture.
- `tests/english-picture-fallback.test.ts` — bounded repeated-inventory expectations.
- `tests/idiom-visuals.test.ts` — bounded round expectations.
- `tests/openverse.test.ts` — adaptive/cache/auth request expectations.
- `tests/picture-relevance.test.ts` — repeated inventory versus useful later-round expectations.
- `tests/pixabay.test.ts` — bounded expansion/cache expectations.
- `tests/browser/english-picture-fallback.spec.ts` — repeated-inventory requests.
- `tests/browser/idiom-visuals.spec.ts` — third distinct crowd query below the new target.
- `tests/browser/semantic-gallery.spec.ts` — adaptive completion-order requests and repeated-description bounds within facets.
- `TWENTY_PICTURE_SEMANTIC_GALLERY_REPORT.md` — this report.

## Remaining limitations

Twenty is conditional on sufficiently qualified unique inventory within the existing bounded query/deadline budget. Sparse or inaccurate metadata may omit useful images or misdescribe pixels; no visual recognition is added. Semantic fingerprints suppress repeated descriptions, but cannot identify visually identical images with unrelated URLs and materially different metadata. Browser provider assets deliberately use a local test photograph to avoid network dependence; metadata, uniqueness, counts, previews, layouts and attribution are tested, not real visual scene quality. Conservative narrative filtering can discard a useful long title; concise independent subject evidence remains eligible. Small single-facet inventories remain valid and are not padded.

## Commit/push

**NOT PERFORMED.** Changes remain unstaged for review.
