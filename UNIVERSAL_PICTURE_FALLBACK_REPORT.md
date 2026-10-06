# KANJIAN — UNIVERSAL PICTURE FALLBACK

> Historical continuation baseline. The completed audit and current validation
> are in [KANJIAN — ZERO-GAP PICTURE COVERAGE](ZERO_GAP_PICTURE_COVERAGE_REPORT.md).
> The 3,885 unresolved senses described below have now been resolved; the full
> corpus has 177,753 valid plans, 20,458 explicit exclusions, and zero gaps.

The screenshot-case fix and provider integration are verified. **The universal
semantic coverage target is not established:** 3,885 English senses without a
plan still require semantic review. They have not been relabeled as exclusions.
No commit or push was performed.

## ROOT CAUSE

The untagged definition of 不耻下问 starts with “not”. The classifier rejected it
before extracting its positive action, and the corpus has no idiom annotation
that would activate the existing idiom fallback. `fromRow` therefore produced an
abstract sense with no visual query, `imageSearchPlan` returned null, neither
provider ran, and `WordDetail` selected the explanatory empty state.

The English fallback now recognizes negation of an inhibiting attitude, retains
ASK/LEARN, and produces bounded alternatives. It rejects negative alternatives,
grammar notes, and irrelevant provider metadata. Named concept templates remain
in place. The gallery and relationship explanation render independently.

## SCREENSHOT CASE — 不耻下问

- Pinyin: bù chǐ xià wèn
- English definition: not feel ashamed to ask and learn from one's subordinates
- Fallback plan: `english-definition`, action predicate `ask`, related learning terms
- Generated queries: `person asking question`; `people asking for advice`; `people learning together`
- Pixabay reached: PASS
- Openverse fallback reached: PASS
- Relevant gallery result possible: PASS through real service with mocked upstream responses
- Reviewed explanation required for pictures: NO

The browser loads the real full dictionary and its worker, requests the selected
sense's gallery, and runs the actual server planner, provider adapters, relevance
filter, deduplication, and response normalization. Only provider responses and
image bytes are mocked. Screenshots use an existing local photo as fixture bytes;
they verify rendering and attribution, not the visual relevance of a live photo.

## CORPUS AUDIT

| Metric | Result |
| --- | ---: |
| Total dictionary rows | 125,173 |
| Total meaning records | 199,713 |
| Displayed senses | 198,245 |
| English-definition senses | 198,211 |
| Normal visual plans | 163,026 |
| Idiom fallback plans | 7,435 |
| — semantic fallback | 674 |
| — existing last-resort idiom fallback | 6,761 |
| English fallback plans | 4,845 |
| Eligible senses with structurally valid plans | 175,306 |
| Malformed/missing plans among classified visual senses | 0 |
| English senses intentionally excluded under explicit existing policies | 19,020 |
| English senses without plans needing semantic review | 3,885 |
| Missing plans in the independently reviewed concrete regression inventory | 0 |
| Picturable senses without plans across the entire corpus | **Undetermined; zero is not established** |

The raw-to-displayed difference is 1,468 classifier records; another 34 displayed
senses have no ASCII English letters. The 19,020 policy exclusions comprise
5,399 named-entity policy decisions, 9,337 cross-reference/pronunciation records,
910 age-appropriate-content exclusions, 1,482 grammar/usage notes, 649 negated
definitions without a validated positive scenario, 578 function words/ambiguous
auxiliaries, and 665 excluded actions. These are explicit policy decisions,
not a claim that every excluded real-world subject is physically unpicturable.

The previous audit was circular: a sense was “picturable” if inference returned a
plan, and every null inference was called non-picturable. The revised audit keeps
unresolved definitions separate. Thus its zero malformed-plan result must not be
reported as 100% semantic coverage. The unresolved set contains metadata and
potentially picturable content, including `to 3D print; 3D printing`.

Reproduce with:

```powershell
node_modules/.bin/esbuild scripts/audit-picture-coverage.ts --bundle --platform=node --format=esm --outfile=.tmp/audit-picture-coverage.mjs
node .tmp/audit-picture-coverage.mjs
```

The complete reason ledger is `.tmp/picture-coverage.json`. Its dictionary
presentation SHA-256 remains
`e60e3644bbd33c8d19040fab277681a3daa6759ede7a38c53afa75145bb18d63`.
The dictionary file SHA-256 remains
`29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a`.

## QUERY QUALITY

- Negated action definitions: PASS in regressions; inhibit-negation preserves the positive act.
- Grammar notes excluded: PASS in focused regressions.
- Negative alternatives excluded: PASS, including `not happy / sad` and `without happiness / happy`.
- Chinese annotation leakage removed: PASS; all 175,306 generated plans passed the audit's query checks.
- Named concept templates preserved: PASS.
- Generic student portraits rejected for 不耻下问: PASS.
- Parentheses, semicolons, long glosses, social actions, emotional states, and named abstract scenarios: PASS in focused tests.

Additional audit repairs preserve accented species names and concrete heads,
avoid factory queries for explicitly botanical plants, and prevent sentence
fragments, exclamations, book titles, or literal idiom objects from becoming new
misleading fallback subjects. This is regression evidence, not a complete
semantic judgment of every generated query.

## PROVIDERS

All following checks PASS with mocked integration responses:

- Pixabay primary; Openverse fallback.
- Pixabay zero → Openverse.
- All Pixabay hits rejected → Openverse.
- One acceptable Pixabay result → Openverse supplement.
- Cross-provider duplicates → one retained image.
- Openverse failure → acceptable Pixabay images retained.
- Pixabay failure → Openverse results retained.
- Combined semantic reranking and provider-neutral final relevance ranking.

The stopping threshold counts deduplicated semantic matches: six for a gallery,
one for a thumbnail. Raw hits and generic conceptual illustrations cannot satisfy
it. Final galleries do not retain known irrelevant metadata merely for padding.
Provider identity does not affect the relevance score; existing creator/type
diversity breaks ties after semantic scoring.

## OPENVERSE

- Openverse result rendered in regression test: PASS.
- Creator preserved: PASS.
- Source preserved: PASS.
- License preserved: PASS.
- License URL preserved: PASS.
- Credentials server-only: PASS.
- Tokens absent from client bundle: PASS by server/client boundaries and bundle checks.

The anonymous live sample reached `https://api.openverse.org/v1/images/` but
received **HTTP 401**. The existing authentication-failure cooldown then skipped
subsequent searches. No live candidates were available for normalization or
attribution validation. Mocked normalization and browser tests cover both.
The sample does not read environment credentials, rejects Authorization headers,
request bodies, and other endpoints, and writes no credential files.

## REGRESSION

- 8,583 tagged idiom/figurative senses still covered: PASS (1,102 normal, 674 semantic fallback, 6,761 last resort, 46 English fallback).
- Existing semantic relevance preserved: PASS; acceptable-result filtering strengthened.
- Existing picture gallery preserved: PASS.
- Dictionary content unchanged: PASS, including raw bytes and presentation hash.
- Bundle optimization preserved: PASS; server service 850,573 bytes, semantic lexicon remains one lazy asset.
- Tests: PASS — 671 tests across 19 files.
- Browser tests: all 39 cases passed across the full run and targeted rerun. The first full run had one dictionary-loading timeout under concurrent corpus audit load; its three-case file passed separately in 33.4 seconds.
- Production build: PASS.
- Isolated server packaging/security: PASS in all seven scenarios.
- Source boundary, bundle, whitespace, and `git diff --check`: PASS.
- Offline migration and lazy-loading checks: PASS.

## FILES CHANGED

- `scripts/audit-picture-coverage.ts`
- `scripts/sample-picture-providers.ts`
- `scripts/verify-offline.mjs`
- `server/images.ts`
- `server/visual-search.ts`
- `server/image-service.mjs` (regenerated production artifact)
- `src/lib/english-visual-fallback.ts`
- `src/lib/visual-inference-core.ts`
- `src/lib/visual-schema.ts`
- `src/pages/WordDetail.tsx`
- `tests/english-picture-fallback.test.ts`
- `tests/browser/english-picture-fallback.spec.ts`
- `tests/bundle-architecture.test.ts`
- `tests/conceptual-visuals.test.ts`
- `tests/image-client.test.tsx`
- `tests/openverse.test.ts`
- `tests/picture-relevance.test.ts`
- `tests/universal-idiom-coverage.test.ts`
- `tests/visual-coverage.test.ts`
- `UNIVERSAL_PICTURE_FALLBACK_REPORT.md`

## REMAINING LIMITATIONS

1. Universal semantic coverage remains unfinished: 3,885 unplanned English senses
   require review and any resulting fixes. The zero-gap target cannot honestly
   be marked PASS.
2. Anonymous live Openverse returned HTTP 401. Actual live search candidates and
   their visual relevance remain unverified; provider-flow results above use mocks.
