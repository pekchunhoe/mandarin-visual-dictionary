# KANJIAN — IDIOM / PHRASE PICTURE DETECTION FIX

## Root cause and runtime audit

The selected sense was already authoritative. CC-CEDICT rows become canonical words and stable `sense-N` entries through `dictionary-entry-core.ts`. `WordDetail` selects that exact sense, and `visualQuery(sense)` determines whether to mount the existing `VisualGallery`. The gallery requests the canonical word ID and selected sense ID. The server resolves the same row and sense before building its search plan.

The failure happened earlier in shared classification. A leading `fig.` survived normalization and failed the allowed-character check. Both normalization and query construction explicitly rejected parenthetical idiom/figurative annotations. Even without the label, `to be frightened stiff` failed the whole-descriptor matcher and became a generic conceptual phrase. Some other expressions fell through to inappropriate noun-head or literal action matching.

The missing eligible query made the UI show its existing “no reviewed visual explanation” fallback. Editorial content was not an additional gate: there is no requirement for reviewed examples, Malay text, or an editorial explanation before dynamic image retrieval. No UI redesign or provider coupling was needed.

## State at continuation and completed changes

The continuation began with shared label parsing and phrase extraction, additions to the English visual templates, optional `semanticPredicate` metadata, server-planner wiring, a v5 cache-schema bump, and an untracked idiom regression file. The server normalizer had a duplicate `predicate` declaration that prevented compilation. Browser coverage, final regression review, updated cache assertions, and generated artifacts were incomplete.

The continuation fixed that declaration and completed the existing approach:

- Semantic-only label parsing preserves displayed glosses, literal/figurative intent, grammatical exclusions, and domain qualifiers. Label words used as ordinary content remain intact.
- The shared WordNet-backed classifier recognizes emotional modifiers, human state clauses, gerunds, and action particles. Existing English construction templates cover opaque examples such as “over the moon,” “lose one's temper,” and “lend a helping hand.” No Mandarin-specific idiom list was added.
- Extracted predicates feed the existing query planner and metadata reranker. For fear phrases, words such as `stiff`, `mind`, and `person` cannot substitute for fear evidence.
- Literal senses stay independent. Unresolved figurative or idiomatic expressions retain the conservative explanation fallback instead of automatically becoming literal nouns or actions.
- Descriptor/gerund ambiguity is guarded: “shining,” “drooping,” and similar existing descriptors retain their interpretation; modal “willing” remains conceptual.
- `dictionary-visual-v5` invalidates earlier browser/provider keys and upgrades the app cache. Existing word/sense identity, pending-request reuse, stale-response guards, deduplication, provider fallback, API-key boundaries, budgets, and combined ranking remain in place.

The runtime continues through one pipeline: selected gloss → shared semantic classification → visual eligibility → server query candidates → existing provider adapters → combined relevance ranking/deduplication → gallery or its existing loading/error/empty state. A no-English or grammatical sense uses the existing explanation UI without a provider request.

## Actual implementation output

For 魂飞魄散, `sense-1`:

- Displayed meaning: `fig. to be frightened stiff`
- Normalized gloss: `to be frightened stiff`
- Extracted predicate: `frightened`
- Primary query: `frightened person` (photo)
- Fallback candidates: `scared person`, `frightened face` (all image types)

All four plans were emitted from current source:

| Sense | Candidates in priority order |
| --- | --- |
| `sense-0`: lit. the soul flies away and scatters (idiom) | `soul flies away and scatters concept`; `soul flies away and scatters` |
| `sense-1`: fig. to be frightened stiff | `frightened person`; `scared person`; `frightened face` |
| `sense-2`: spooked out of one's mind | `spooked person`; `scared person`; `spooked face` |
| `sense-3`: terror-stricken | `scared person`; `panicked person`; `scared face` |

These are bounded alternatives, not unconditional requests. Each sense has independent browser and provider cache keys.

## Verification

- PASS: 67 focused idiom regression cases; prior picture relevance, meaning, coverage, and image-client regressions.
- PASS: 536 automated tests across 15 files on the final implementation.
- PASS: all 32 browser regressions; the two picture/sense-switch regressions passed again after the final modal-word correction.
- PASS: the new browser regression uses the real server planner with deterministic provider fixtures. It checks literal/figurative plans, selected-button highlighting, unchanged displayed text, loading, dynamic galleries without editorial content, delayed responses, independent cached senses, errors, empty responses, explicit retries, preview, request counts, and absence of unexpected browser errors.
- PASS: production build, typecheck, and all six isolated deployment scenarios. No Vite chunk-size warning.
- PASS: bundle/source boundaries, production offline behavior, lazy loading, saved-word upgrades, and obsolete-cache removal.
- PASS: whitespace checks and `git diff --check`.

The main entry is 301.01 KB (previously 300.98 KB); the worker is 21.44 KB. The lexicon remains one unchanged 750.82 KB lazy JSON asset. No semantic lexicon or server search module entered the initial React bundle.

A before/after audit covered all 125,173 dictionary rows and 199,713 meaning records. All displayed definitions, headwords, pinyin, and stable sense IDs remained identical. Inference outputs changed for 8,226 meaning records, including added predicate metadata, label eligibility, and conservative rejection of unresolved idioms. The full-classification snapshots were updated after this audit, and a separate presentation hash captured from the previous classifier now protects the unchanged dictionary text and IDs. The three regenerated starter-query changes preserve action particles: “run away,” “skip over,” and “set up.” Primary ordinary-word queries remain covered by explicit regressions.

Two older provider fixtures for “to go to bed” now describe `sleeping person bed`, so they test the depicted action rather than treating the idiom's literal words as semantic evidence. Assertions and request limits were retained.

Opaque English idioms outside the recognized vocabulary/constructions still need semantic evidence or an explicit template; the implementation does not claim universal idiom understanding. Live Pixabay was not used for verification; provider tests are mocked and independent of credentials.

## Files changed

- `README.md`, `IDIOM_VISUAL_REPORT.md`
- `src/lib/visual-inference-core.ts`, `src/data/visual-templates.json`
- `server/visual-search.ts`
- `src/lib/visual-schema.ts`, `public/sw.js`
- `src/data/learning-runtime.json`, `server/image-service.mjs` (generated artifacts)
- `tests/idiom-visuals.test.ts`, `tests/browser/idiom-visuals.spec.ts`
- `tests/bundle-architecture.test.ts`, `tests/conceptual-visuals.test.ts`
- `tests/image-client.test.tsx`, `tests/meaning-visuals.test.ts`, `tests/visual-coverage.test.ts`
- `scripts/verify-offline.mjs`

Commit/push performed: NO.
