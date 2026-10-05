# KANJIAN — PICTURE SEMANTIC RELEVANCE

## Root cause and pipeline audit

The selected sense was already preserved correctly: `WordDetail` selects a sense ID, `useImages` isolates each word/sense request, and `/api/images` resolves the canonical dictionary entry and selected English definition on the server. The problem was what happened after that selection.

- The shared classifier correctly distinguishes grammatical/function words from lexical meanings, retains WordNet abstract noun categories, and recognizes visible descriptor families before conceptual fallback.
- WordNet puts `frightened` in the existing panic family. Its canonical dictionary query is `panicked person facial expression`. The previous image plan reused that template and discarded the specific word `frightened` too early. It did not simply classify fear as a generic abstract concept.
- Pixabay tags were already available. Ranking counted every matching query token equally, so `person`, `facial`, and `expression` could outweigh a specific synonym such as `scared` or `terrified`. Popularity was also a tie-breaker.
- Provider normalization truncated each page to 12 images before selected-meaning relevance could be considered.
- At most two Pixabay requests were made, followed by one configured Pexels fallback. Searching stopped after six images regardless of semantic evidence. Results from the second query were appended, not jointly reranked.
- Existing deduplication handled IDs and normalized image URLs, including resized copies. Existing caches already included word and sense; the stale-gallery guard was also present and is retained.

## Implementation

`server/visual-search.ts` now supplies one shared server-side visual query plan and metadata relevance scorer. It runs before provider requests and after candidate merging. No Mandarin-specific vocabulary list was added.

Recognized copulas, action/state wrappers, and simple agent definitions are normalized conservatively. Examples include `to be frightened` → `frightened`, `the act of swimming` → `swimming`, and `a person who teaches` → `teacher`. Agent nouns are accepted only when the existing WordNet verb/person vocabulary validates them. Unrecognized relative clauses, nonliteral domains, and physical subjects retain their meaning. Bare action lemmas with abstract event/state readings can use a directly visible action; physical nouns and named conceptual domains retain their existing interpretation.

Candidate tiers are A: specific visible meaning, B: a useful lexical/morphological alternative, C: a specific scene/expression, D: an abstract domain illustration, and E: a simpler conceptual fallback. The existing descriptor templates and lexical families supply expression alternatives. The related panic/fear families can share fear-response vocabulary; unrelated expressions such as anger and happiness are not mixed for variety. Expanded polysemous WordNet descriptors are not blindly treated as interchangeable tags.

The canonical dictionary classifier, its full lexical coverage, starter classifications, and saved-word reclassification remain unchanged. The 125,173-row/199,713-meaning equivalence regression still passes. New search code stays on the server; the lazy semantic-data architecture remains intact.

## Actual generated candidates

These were emitted by the new plan for the specified English meanings. Candidates are alternatives, not unconditional requests.

| Word / selected meaning | Candidates in priority order |
| --- | --- |
| 恐惧 — to be frightened | A: `frightened person` (photo); B: `scared person` (all); C: `frightened face` (all) |
| 生气 — angry | A: `angry person` (photo); C: `angry face` (all); C: `anger expression` (all) |
| 跑 — run | A: `person running` (all); B: `running` (all) |
| 老师 — teacher | A: `teacher teaching` (photo); B: `teacher` (all) |
| 苹果 — apple | A: `apple fruit` (photo); B: `apple fruit` (all) |
| 政治 — politics | D: `government parliament politics` (all); E: `politics` (all) |
| 经济 — economy | D: `economy business finance` (all); E: `economy` (all) |
| 科学 — science | D: `science laboratory research` (all); E: `science` (all) |

The existing action sense `to run` uses the same `person running` → `running` queries, starting with photos. `all` retains photo, illustration, and vector support. Category restrictions are removed on secondary queries, while the subject remains specific.

## Why broad results cannot outrank direct meaning matches

Relevance is calculated from actual Pixabay tags or an actual Pexels description. Generated alt text and the requested query are never counted as evidence about image contents.

- Exact selected content terms have a base score of 300; vetted related terms have 200; context-only matches have 30. Bounded match counts and query-priority bonuses cannot overturn that ordering.
- Generic words such as person, people, face, expression, portrait, human, emotion, and concept do not establish semantic relevance.
- Emotion results with descriptive metadata but no selected-expression or related-family match are excluded. Smiling, neutral, angry, crowd, or police portraits cannot pass merely by being pictures of people.
- For directly visual meanings, a category such as animal or fruit does not count as enough evidence for dog or apple. Conceptual meanings retain their domain illustration behavior.
- Complete provider pages are retained until candidates can be jointly ranked. ID and resized-URL deduplication runs again on the merged, ordered candidates before returning up to 12 images.
- Direct-meaning galleries use supported subject matches when available. They do not pad those matches with generic results just to reach twelve. If no supported match exists, at most two uncertain results can be used as a last resort; explicit generic/wrong-emotion metadata is still excluded.
- Diversity uses provider image type and contributor identity only to break identical relevance-score ties. It cannot promote a less relevant picture, and no visual near-duplicate detection or image recognition is claimed.

## Requests, caches, and selected meanings

Visible emotion galleries use at most three Pixabay queries; other meanings use at most two. Thumbnails use at most two and return one picture. Searches stop once there are six supported gallery candidates or one supported thumbnail, on a provider failure, or at the existing eight-second total deadline. Conceptual searches retain the existing two-query domain path. Configured Pexels remains one fallback request. Diversity does not cause additional requests.

The existing 24-hour successful/empty provider-result cache, 60-second transient-failure cache, credential-aware cache invalidation, pending-request reuse, provider cooldowns, safe search, and API rate limits remain. Both browser and provider cache keys now include `picture-relevance-v1`, alongside the existing word/sense and query distinctions.

The meaning selector and gallery UI were not redesigned. A new browser regression delays the first 恐惧 sense response, switches to `fear`, waits for the old response, verifies that it cannot replace the current gallery/preview, then reopens the first sense from its independent cache.

## Verification

| Check | Result |
| --- | --- |
| Visual query normalization | PASS |
| Specific meaning prioritized over broad category | PASS |
| Visible emotions handled | PASS |
| Actions handled | PASS |
| Concrete nouns preserved | PASS |
| Abstract conceptual fallback preserved | PASS |
| Function-word handling preserved | PASS |
| Multiple meanings independently handled | PASS |
| Pixabay metadata reranking | PASS |
| Multi-query deduplication | PASS |
| Caching/API efficiency | PASS |
| Illustration/photo/vector support preserved | PASS |
| Gallery rendering preserved | PASS |
| Focused picture relevance tests | PASS: 32 cases |
| Full automated tests | PASS: 466 tests across 14 files |
| Browser regressions | PASS: 31 cases |
| Typecheck | PASS |
| Production build | PASS; no Vite chunk-size warning |
| Isolated deployment artifact checks | PASS: six scenarios |
| Bundle architecture and source/security checks | PASS |
| Production offline and lazy/upgrade checks | PASS |
| Whitespace check and `git diff --check` | PASS |

The build retains a 300.98 KB main entry, 19.02 KB worker, and one 750.82 KB lazy semantic JSON asset. No large semantic data or server search logic was added to the startup import graph.

Live authenticated Pixabay verification was unavailable: no Pixabay key was configured in the process or local environment files. Tests are deterministic and independent of provider credentials. They establish query and metadata-ordering behavior, not visual recognition or a guarantee that every live picture depicts the intended meaning. Sparse or inaccurate provider metadata can reduce gallery size or quality.

## Changed files

- `server/visual-search.ts`: normalization, query candidates, metadata scoring, and ranking.
- `server/image-plan.ts`: shared plan integration and versioned provider cache keys.
- `server/images.ts`: bounded semantic searches and joint result selection.
- `server/providers.ts`: retain provider-page candidates and actual descriptive/type metadata.
- `src/lib/visual-schema.ts`, `src/lib/visual.ts`, `src/types.ts`: lightweight relevance version, configurable deduplication limit, and optional image-type metadata.
- `server/image-service.mjs`: rebuilt deployment artifact.
- `tests/picture-relevance.test.ts`, `tests/browser/picture-relevance.spec.ts`: focused semantic and sense-switching regressions.
- `tests/meaning-visuals.test.ts`, `tests/visual-coverage.test.ts`, `scripts/verify-server-package.mjs`: fixtures now provide meaningful metadata; dictionary classifications retain their prior expectations.
- `README.md`, `PICTURE_RELEVANCE_REPORT.md`: behavior, request budgets, and verification documentation.

Redeployment is required to publish the rebuilt server artifact and new browser cache version. Commit/push performed: NO.

## Final working-tree verification — 5 October 2026

Resumed the existing implementation without rewriting application code or changing tests. Reviewed all modified source, tests, documentation, and the regenerated server artifact. No accidental changes, debugging code, test-only bypasses, unrelated refactors, or unexpected untracked deliverables were found. Existing scratch files remain ignored under `.tmp/`.

Fresh verification passed: all 466 automated tests (including 32 focused relevance cases), all 31 browser cases, production build and six isolated deployment checks, bundle/source checks, production offline checks, lazy-loading and saved-word/cache-upgrade checks, and whitespace checks. The browser runner exited successfully after its test server required manual shutdown during Windows teardown; no assertions or timeouts were changed.

Rebuilt and executed the query audit from current source; all eight candidate lists above were confirmed. An additional runtime audit confirmed separate browser/provider cache keys, three independent requests, and cache reuse for all three 恐惧 senses: `to be frightened` → `frightened person`, `fear` → `scared person`, and `dread` → `dread concept`. Direct anger, running, teacher, and apple metadata also outranked generic/category-only fixtures.

No implementation fixes were needed. Live Pixabay verification remains NOT RUN because neither the process nor local environment files configure a key. No commit or push was performed.
