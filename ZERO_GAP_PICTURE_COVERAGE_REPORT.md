# KANJIAN — ZERO-GAP PICTURE COVERAGE

Validated 6 October 2026. No commit or push performed.

**198,211 English senses = 177,753 valid plans + 20,458 explicit exclusions.**
**UNRESOLVED = 0. INVALID PLANS = 0.**

## OPENVERSE 401 DIAGNOSIS

| Anonymous request | HTTP status | Results | Usable normalized results |
| --- | ---: | ---: | ---: |
| Default page size | 200 | 20 | 14 |
| page_size=20 | 200 | 20 | 14 |
| page_size=21 | 401 | 0 | 0 |
| page_size=32 | 401 | 0 | 0 |

Actual root cause: the gallery adapter requested 32 results without authentication.
Four live requests to the same endpoint with the same query confirmed that the
anonymous page-size limit is 20. This agrees with the
[Openverse API documentation](https://api.openverse.org/v1/) and
[Openverse's explanation of the 401 limit](https://make.wordpress.org/openverse/2022/06/17/mitigating-out-of-terms-api-usage/).

Adapter change required: **YES**. Anonymous galleries now request 20; authenticated
galleries retain 32; thumbnails retain 3. A rejected token's anonymous retry also
uses 20. Focused tests cover absent/partial credentials, token failures, and a
32 → 20 retry after token rejection.

Authenticated server request: **NOT POSSIBLE**. The process has no configured
Openverse client credentials, and there is no local environment credential file.
OAuth token acquisition, authenticated status, and returned result count therefore
have no live result. The existing server OAuth implementation is reused unchanged
by the diagnostic; its mock authentication and isolated-package tests pass.

Live normalization: **PASS**, 14 usable images from each successful anonymous
response. No additional live provider sampling was performed. This validates
transport and normalization, not the visual relevance of every live photograph.

## FINAL 3,885 — FAILURE CLUSTERS

| Cluster | Before | Plans added | Exclusions | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Embedded Chinese annotation | 1017 | 790 | 227 | 0 |
| Dictionary metadata / cross-reference | 565 | 192 | 373 | 0 |
| Other rejected English construction | 449 | 325 | 124 | 0 |
| Questions / exclamations | 430 | 105 | 325 | 0 |
| Numeric modifier / quantity | 383 | 381 | 2 | 0 |
| Unicode punctuation / accented words | 295 | 289 | 6 | 0 |
| Dated names / history | 221 | 220 | 1 | 0 |
| Parenthesis-only gloss | 180 | 70 | 110 | 0 |
| Chemical / scientific notation | 148 | 148 | 0 | 0 |
| Quoted gloss / title | 117 | 116 | 1 | 0 |
| Alternative clauses | 43 | 12 | 31 | 0 |
| Negation | 37 | 22 | 15 | 0 |
| **Total** | **3,885** | **2,670** | **1,215** | **0** |

The same rules also reclassify senses outside this baseline, producing a net
223 fewer plans and 223 more explicit exclusions there. The full-corpus arithmetic
therefore differs from simply adding the baseline's 2,670 plans to the old total.

Major rules:

- Remove embedded Chinese/pinyin annotations while retaining the English clause;
  normalize accented names, typography, numeric modifiers and scientific notation.
- Distinguish metadata-only references from a reference followed by an independent
  semantic gloss. Handle nested parentheses without altering displayed definitions.
- Map specific speech acts to their action: warning someone, asking a question,
  thanking, greeting, celebrating, or a runner preparing to start. Pure pragmatic
  formulas and grammatical interrogatives receive explicit function-word reasons.
- Retain action/object relationships such as repairing clocks. Handle exhausted
  states, inability to sleep, lack of water, and predicates after long introductory
  clauses. The original negated-inhibition rule for 不耻下问 remains intact.
- Record manually reviewed residual English constructions in
  visual-reviewed-glosses.ts, including untagged proverbs and ambiguous technical
  nouns. No Mandarin headword override or catch-all exclusion was added.

## ITERATIVE COVERAGE

These checkpoints track the frozen residual. Rules overlap clusters; the initial
annotation pass also normalized Unicode and quotation marks. Early candidate
plans were subsequently checked by metadata and regression rules.

| Completed checkpoint | Unresolved baseline senses |
| --- | ---: |
| Starting state | 3,885 |
| Embedded Chinese / Unicode annotation handling | 2,074 |
| Metadata handling | 1,970 |
| Initial question / exclamation handling | 1,894 |
| Rejected English / numeric constructions | 755 |
| Parenthetical and subsequent clusters | 425 |
| Speech acts and grammatical interrogatives | 261 |
| Explicit residual review | 6 |
| Final residual decisions and full audit | **0** |

## COVERAGE BEFORE AND AFTER

| Metric | Before | After |
| --- | ---: | ---: |
| English senses | 198,211 | 198,211 |
| Normal plans | 163,026 | 163,637 |
| Idiom fallback plans | 7,435 | 7,439 |
| English fallback plans | 4,845 | 6,677 |
| Total valid plans | 175,306 | 177,753 |
| Explicit exclusions | 19,020 | 20,458 |
| Unresolved | 3,885 | **0** |
| Invalid plans | 0 | **0** |

Counts are mutually exclusive. The audit fails for unresolved or invalid plans,
or an arithmetic mismatch. Absence of a plan is never an exclusion reason.
A regression deliberately leaves an unknown malformed gloss unresolved.
“Valid” means a bounded English search plan under the documented semantic rules;
it does not mean that every sense has an available, relevant provider photograph.

## FINAL EXCLUSION BREAKDOWN

Legacy reason labels are grouped into the equivalent codes below; their ledger
entries remain available in .tmp/picture-coverage.json.

| Reason code | Count |
| --- | ---: |
| NAMED_ENTITY_POLICY | 5,508 |
| CROSS_REFERENCE_OR_PRONUNCIATION_NOTE | 4,413 |
| VARIANT_REFERENCE_ONLY | 3,968 |
| GRAMMAR_ONLY | 1,703 |
| FUNCTION_WORD | 930 |
| AGE_APPROPRIATE_CONTENT_POLICY | 906 |
| PRONUNCIATION_NOTE | 715 |
| EXCLUDED_ACTION_POLICY | 666 |
| NEGATION_WITHOUT_VALIDATED_SCENE | 659 |
| CROSS_REFERENCE_ONLY | 439 |
| ORTHOGRAPHIC_NOTE | 395 |
| NON_VISUAL_LOGICAL_RELATION | 124 |
| METADATA_ONLY | 21 |
| TRANSLITERATION_ONLY | 8 |
| UNSEARCHABLE_FRAGMENT | 3 |
| **Total** | **20,458** |

OTHER_JUSTIFIED_NONVISUAL: **0**. Exclusions include explicit product policies
for named entities, age-appropriate content, and selected actions; they are not
claims that all excluded subjects are physically impossible to depict.

## SCREENSHOT — 不耻下问

| Check | Result |
| --- | --- |
| Plan | PASS |
| Queries | PASS — person asking question; people asking for advice; people learning together |
| Pixabay | PASS — actual service with mocked upstream responses |
| Openverse fallback | PASS — zero, rejected and partial primary results |
| Gallery independent of editorial explanation | PASS |

Screenshots: .tmp/english-fallback-empty.png,
.tmp/english-fallback-rejected.png, .tmp/english-fallback-partial.png.
The browser loads the real dictionary and service. Provider responses and image
bytes are fixtures; screenshots verify gallery rendering and attribution.

## PROVIDER REGRESSION

| Check | Result |
| --- | --- |
| Pixabay zero → Openverse | PASS |
| Pixabay rejected → Openverse | PASS |
| Partial Pixabay → Openverse | PASS |
| Provider failure isolation | PASS |
| Combined semantic reranking | PASS |
| Cross-provider deduplication | PASS |
| Openverse attribution | PASS |

## SECURITY

| Check | Result |
| --- | --- |
| OAuth credentials server-only | PASS |
| Access token server-only | PASS |
| Secrets absent from bundle | PASS |
| Secrets absent from logs | PASS — static/test checks; diagnostic emits only status/counts |

Live OAuth was unavailable; these checks use the existing authentication tests,
credential-echo rejection tests, server boundaries and production-package checks.

## REGRESSION AND VALIDATION

| Check | Result |
| --- | --- |
| 8,583 tagged idioms covered | PASS — 8,583/8,583 |
| Dictionary source unchanged | PASS — raw bytes and presentation hashes |
| Picture relevance preserved | PASS — focused semantic/provider regressions |
| Bundle optimization preserved | PASS — one lazy semantic JSON asset; server bundle 866,347 bytes |
| Full test suite | PASS — 709 tests across 20 files |
| Browser tests | PASS — 39/39 |
| Production build | PASS |
| Packaging/security | PASS — seven isolated deployment scenarios and source checks |
| Offline migration / lazy loading | PASS |
| Whitespace and git diff --check | PASS |

The first full runs exposed stale generated data/snapshots and a fixture type
error, all corrected. A concurrent run exceeded the existing corpus-test timeout;
the final complete suite was rerun without competing build/browser work.
Offline checks were rerun after starting their required production preview.
The Windows browser runner required stopping its verified child dev server after
all cases passed; it then exited successfully with the 39-passed summary.

Dictionary SHA-256: 29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a.
Presentation SHA-256: e60e3644bbd33c8d19040fab277681a3daa6759ede7a38c53afa75145bb18d63.

## REPRODUCING THE AUDIT

Run from the repository root:


    node_modules/.bin/esbuild scripts/audit-picture-coverage.ts --bundle --platform=node --format=esm --outfile=.tmp/audit-picture-coverage.mjs
    node .tmp/audit-picture-coverage.mjs
    node_modules/.bin/esbuild scripts/review-picture-residual.ts --bundle --platform=node --format=esm --outfile=.tmp/review-picture-residual.mjs
    node .tmp/review-picture-residual.mjs


The versioned baseline is scripts/data/picture-coverage-baseline.json.
Full decisions: .tmp/picture-baseline-decisions.json.
Full corpus ledger: .tmp/picture-coverage.json.
Compact result: .tmp/zero-gap-summary.json.
Openverse live evidence: .tmp/openverse-diagnosis.json.

## FILES CHANGED

Includes inherited continuation changes and this session's changes:

- `scripts/verify-offline.mjs`
- `server/image-service.mjs`
- `server/images.ts`
- `server/providers.ts`
- `server/visual-search.ts`
- `src/data/learning-runtime.json`
- `src/lib/visual-inference-core.ts`
- `src/lib/visual-schema.ts`
- `src/pages/WordDetail.tsx`
- `tests/bundle-architecture.test.ts`
- `tests/conceptual-visuals.test.ts`
- `tests/image-client.test.tsx`
- `tests/openverse.test.ts`
- `tests/picture-relevance.test.ts`
- `tests/universal-idiom-coverage.test.ts`
- `tests/visual-coverage.test.ts`
- `UNIVERSAL_PICTURE_FALLBACK_REPORT.md`
- `scripts/audit-picture-coverage.ts`
- `scripts/data/picture-coverage-baseline.json`
- `scripts/diagnose-openverse.ts`
- `scripts/export-unresolved-pictures.ts`
- `scripts/review-picture-residual.ts`
- `scripts/sample-picture-providers.ts`
- `src/lib/english-visual-fallback.ts`
- `src/lib/visual-exclusions.ts`
- `src/lib/visual-expressions.ts`
- `src/lib/visual-gloss-normalization.ts`
- `src/lib/visual-reviewed-glosses.ts`
- `tests/browser/english-picture-fallback.spec.ts`
- `tests/english-picture-fallback.test.ts`
- `tests/zero-gap-picture-coverage.test.ts`
- ZERO_GAP_PICTURE_COVERAGE_REPORT.md
