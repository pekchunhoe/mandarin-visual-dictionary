# KANJIAN Bahasa Melayu dictionary integration report

Date: 14 October 2026 (Asia/Kuala_Lumpur). Release state: implementation and local validation complete; comprehensive linguistic translation coverage remains incomplete. No commit, push or deployment was performed. No paid translation service was used.

## Corpus baseline and substantive coverage

All counts were recalculated from the checked-in corpus, not the current upstream release.

| Measure | Count |
|---|---:|
| Dictionary rows / unique canonical Mandarin entries | 125,173 / 125,173 |
| Unique simplified headword spellings | 121,408 |
| Raw definition records | 199,713 |
| Classifier-only metadata records excluded by the existing app | 1,468 |
| Individual exposed meaning/sense records | 198,245 |
| Nonempty English senses | 198,245 (100%) |
| Single-codepoint entries / distinct single-codepoint spellings | 13,528 / 10,788 |
| Single Han-character entries / distinct simplified Han characters | 13,518 / 10,780 |
| Distinct Han characters across both spelling fields, all entries | 14,392 |
| Compound/multi-codepoint entries | 111,645 |
| Entries with multiple exposed senses | 44,380 |
| Existing idiom/figurative-tagged senses | 8,583 |
| Existing starter words / senses / Malay glosses | 54 / 121 / 55 |
| Substantive, structurally sense-aligned Malay glosses | 1,393 |
| Independently verified translations | 0 |
| Unreviewed editorial candidates, including preserved starter glosses | 1,393 |
| External batch-model generated accepted translations | 0 |
| Missing Malay translations | 196,852 |
| Substantive exposed-sense coverage | 0.7027% |
| Translated tagged idiom senses | 3 / 8,583 (0.0350%) |
| Remaining tagged idiom senses | 8,580 |

The raw count of 199,713 includes 1,468 `CL:` records that the existing application does not expose as independent meanings. Translation coverage uses 198,245 exposed senses. These metadata records were preserved in the original corpus. Single-codepoint counts include a few non-Han symbols; the separate Han-only counts remove that ambiguity. Compound counts use spelling length, not a claim about grammatical word segmentation.

The idiom denominator uses the application's existing `idiomGloss` classifier, including figurative/proverb annotations. An additional independently explained idiom, 不耻下问, is not tagged in this particular CC-CEDICT snapshot; it is translated and included in difficult-review samples, but is not added to the tagged-sense denominator. Four explicit figurative explanations are available in total. No Malay proverbs were invented.

All accepted glosses contain substantive Malay text, match the exact English sense and have provenance. Structural acceptance is not a guarantee of linguistic correctness. There are zero independently verified translations. This release does not claim full coverage or 1,393 human-verified translations.

Corpus SHA-256: `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a`. Translation overlay version: `ms-MY-v1-4c177923253e`. The full dictionary and starter raw subset were re-imported from the existing local gzip archive and remained byte-identical. Every original simplified/traditional spelling, numeric pinyin and English definition is preserved. Existing displayed-English cleanup and canonical sense IDs remain unchanged.

## Audit findings and architecture

The original application had a lightweight 54-word starter runtime, a worker-fetched 10.88 MB CC-CEDICT JSON asset, a lazy 750.82 KB WordNet semantic asset, and shared server/browser visual inference. Its search normalized Chinese, pinyin and English into an exact map, then scanned normalized entry keys for prefix/substring results. Malay was available only on selected starter senses. The old worker classified the entire corpus before returning its first full-dictionary lookup.

The application retains those boundaries. Each `Sense` now supports Malay equivalents, synonyms, approved morphological terms, source, license, confidence, version, review status and reviewer information. Missing senses have explicit missing status; no English text or filler is substituted into Malay. The unchanged raw corpus is overlaid with sparse, fingerprinted Malay records from a separate content-hashed asset. Existing Malay glosses are preserved on enrichment and saved-word refresh.

The worker retains the complete canonical corpus, including senses omitted by an editorial starter presentation. Results carry the selected canonical sense into cards, detail routes, thumbnails and galleries. The server resolver now falls back to the complete canonical row when that selected sense is absent from the starter view. This fixes the important example of 开 / `to boil`, which cannot be resolved from the two-sense starter presentation alone.

Visual classification is deferred to requested results, using the same original raw definition and classifier as before. A 200-word cache avoids repeated work. The worker does not bundle another dictionary or starter data copy. Saved refreshes retain educational examples, classifications and existing Malay content.

The maintenance import script previously read `learning.ts` for editorial headwords, although the lessons had moved to `learning-source.ts`; that could silently regenerate an empty raw starter subset. It now reads the correct source. A real re-import verified unchanged corpus and starter-subset hashes.

## Translation generation, quality and licensing

The shipped candidates come from independently written Malaysian Malay glosses applied only to exact English senses, exact Mandarin/English overrides, and preserved starter material. Context guards restrict ambiguous glosses such as `patient`, `mouse`, `cold`, `short` and `old`. Complex definitions and idioms are not covered by blind substring replacement or literal character translation. Polysemous 开 and 长 demonstrate independently aligned senses rather than one translation repeated across every meaning.

| Accepted source | Sense records | License |
|---|---:|---|
| KANJIAN independently written Malaysian Malay candidates | 1,327 | CC BY-SA 4.0 |
| KANJIAN independently written sense candidates | 11 | CC BY-SA 4.0 |
| KANJIAN existing editorial learning collection | 55 | CC BY-SA 4.0 |

The original corpus remains [CC-CEDICT, CC BY-SA 4.0](https://www.mdbg.net/chinese/dictionary?page=cedict). Malay additions retain record-level provenance and license metadata, with a public `MALAY-NOTICE.txt`. Confidence values distinguish candidate quality; they are not calibrated correctness probabilities.

[DBP's Kamus Dewan Perdana portal](https://kamus.dbp.gov.my/) requires written permission to reproduce its content. [PRPM](https://prpm.dbp.gov.my/) was considered as a terminology reference; the automated page request timed out. Neither site was scraped or bulk-copied. No candidate is labelled DBP-verified and no unrestricted DBP API is assumed.

[Open Multilingual Wordnet](https://omwn.org/omw1.html) lists Malay `zsm` separately from Indonesian `ind`; [Wordnet Bahasa's license is MIT](https://github.com/omwn/omw-data/blob/main/wns/msa/LICENSE). It is a viable licensed reference for subsequent work, but its WordNet 3.0 synsets are not CC-CEDICT sense IDs, and this project's WordNet 3.1 visual categories are not a semantic concordance. No OMW data was imported or counted as translated. Reliable sense alignment and Malaysian usage review are still needed before using it for corpus translations.

The reproducible pipeline provides ordinal deterministic ordering, SHA-256 sense keys, chunked generation, bounded concurrency (1–8), caching, atomic checkpoint manifests and immutable batch files, legacy checkpoint migration, resume, bounded retries, sanitized failures, source/version attribution, token/cost tracking, stale-record reporting, incremental candidate regeneration, protected verified records and atomic import validation. Unknown billed requests retain pending reservations; changing batch sizes does not reissue their senses. A network adapter must be explicitly enabled with a maximum run budget and a conservative enforced per-batch ceiling. The configuration ships disabled. Normal builds and dictionary lookups never invoke translation providers.

The full remaining queue is `.tmp/malay-remaining-senses.jsonl`: 196,852 sense records, 91,547,115 bytes, generated locally and excluded from shipping bundles. Difficult-review samples include all four translated idiom explanations and 100 missing tagged idioms. See `scripts/malay/README.md` for adapter and review instructions.

Automatic QA detects missing/empty Malay, copied English (with documented ordinary loanword exceptions), placeholder text, common English remnants, materially different Indonesian terms, Han output in Malay, replacement/lone-surrogate Unicode, invalid provenance/confidence/status, unsupported DBP claims, duplicate sense records, misaligned English, and idioms lacking a declared semantic explanation. Corpus preservation is checked against the entire local gzip export. Semantic equivalence, natural language quality and localization remain human-review responsibilities. Automatic language heuristics are not comprehensive detectors.

## Search and interface verification

Malay search uses normalized, boundary-preserving NFKC/NFD forms, exact equivalent/phrase postings, explicit synonym/morphology postings, token intersection, sorted prefix vocabulary and trigram-limited one-edit/transposition tolerance. It does not stem unrelated words indiscriminately. Exact equivalents precede definition phrases, synonyms, approved inflections, partial and fuzzy matches. Confidence and familiar learning vocabulary break ties. Each hit identifies a specific sense.

Chinese/English/pinyin keep their original normalizer and relative exact/prefix/substring order. Sorted prefix keys and packed Uint32 trigram postings replace per-keystroke whole-entry scans. An independent comparison against the pre-change search class passed all 278 Chinese, pinyin, English, partial and substring queries without Malay collisions. Ambiguous Latin input can match both languages; result slots are shared to keep Malay discoverable while preserving the relative order of legacy matches. There is no manual language switch.

| Malay query | Expected Mandarin | Matching sense / result |
|---|---|---|
| anjing | 狗 | sense-0, rank 1 |
| kucing | 猫 | sense-0, rank 1 |
| membantu | 帮助 | sense-1, rank 1 |
| belajar | 学习 | sense-0, rank 1 |
| sekolah | 学校 | sense-0, rank 1 |
| guru | 老师 | sense-0, rank 1 |
| keberanian | 勇气 | sense-0, rank 1 |
| rendah hati | 谦虚 | sense-0, rank 1 |
| tidak malu bertanya | 不耻下问 | sense-0, rank 1 |
| bantu | 帮助 | sense-0, rank 1 |
| bantuan | 帮助 | sense-0, rank 1 |
| pertolongan | 帮助 | sense-0, rank 1 |
| menolong | 帮助 | sense-1, rank 1 |
| ANJING | 狗 | sense-0, rank 1 |
| rendah　hati | 谦虚 | sense-0, rank 1 |
| anjnig | 狗 | sense-0, rank 1 |
| mendidih | 开 | sense-3, rank 1 |
| tumbuh | 长 | sense-3, rank 1 |
| algoritma | 算法 | sense-1, rank 1 |
| sentiasa | 总是 | sense-0, rank 11 |

The requested nine examples all rank first in the Malay index. Unit tests additionally cover emotions, adjectives, reading, polysemous characters, compounds, technical vocabulary, idioms, Unicode, missing senses and non-destructive enrichment. Trilingual cards display the matching sense. Details show paired English/Malay with language attributes, radio display controls and honest review/missing states. Controls do not mutate dictionary data. Phone meanings stack at full width; long text wraps, and Mandarin/pinyin/pronunciation remain prominent.

Malay input resolves a Mandarin sense before images are requested. Existing Pixabay/Openverse competition, semantic reranking, deduplication, attribution, caching, fallbacks, perspective selection and the 20-image target are retained. Real server-pipeline fixture tests for `membantu` and `tidak malu bertanya` each selected 20 semantically qualified pictures, including both providers and licensing. Separate tests verify the canonical boiling sense resolves correctly. Images are subject to provider inventory; no live-provider inventory or universal 20-photo availability is claimed.

## Performance and offline behavior

| Built artifact | Before bytes (gzip) | After bytes (gzip) |
|---|---:|---:|
| Initial JavaScript graph | 302,109 (93,351) | 321,145 (95,834) |
| Stylesheet | 46,056 (10,324) | 47,091 (10,515) |
| Dictionary worker | 49,364 (18,705) | 56,062 (21,297) |
| Full dictionary JSON | 10,883,962 (4,129,501) | 10,883,962 (4,129,501) |
| Lazy Malay overlay | 0 | 757,172 (about 95,332) |
| Native image-service bundle | 879,012 (309,865) | 891,834 (310,346) |

The initial JavaScript increase is approximately 2.66% compressed. Bundle measurements count the initial JS import graph; CSS and fonts are listed separately. Malay data is not eagerly imported into that graph and is not fresh-home precached. It is fetched once when dictionary work needs it and retained for offline reuse. Starter Malay matches appear immediately while the full worker initializes, and final results include the full translated corpus. No translation API call occurs on ordinary lookup.

The Malay index has 300 normalized terms, 322 token keys, 780 trigram keys and 1,556 postings. Its serialized diagnostic representation is 122,427 bytes. It is built once in the worker from the overlay, not a separate startup/download asset; this representation size is not a browser heap measurement. The editable source translation store is 929,681 bytes.

| Query | Before median ms | After median ms (including cached result visuals) |
|---|---:|---:|
| 猫 | 29.033 | 0.105 |
| chang jing lu | 81.491 | 0.524 |
| dog | 17.547 | 0.123 |
| help | 18.154 | 0.086 |
| anjing | 39.327 | 0.309 |
| membantu | 82.323 | 0.454 |
| tidak malu bertanya | 66.216 | 0.129 |
| qzxqzxqzx | 70.730 | 0.027 |

Initial Node corpus preparation measured 24.11 seconds before and 4.96 seconds after. A supplementary historical-class run measured 18.07 seconds; timing varies with host activity and JIT state. These are local full-corpus Node benchmarks (eight passes/query), not universal mobile guarantees. The after benchmark includes on-demand visual preparation and a cached row map corresponding to worker behavior. Cold-query maxima are higher than medians; see the JSON evidence.

Supplementary retained Node heap after explicit GC was 255.5 MiB for the historical implementation and 271.8 MiB after. Packed typed posting buffers limit index overhead, but V8 RSS/temporary allocation remains substantial (after retained RSS 591.1 MiB in this maintenance benchmark). Real low-memory Android/iPad testing is still required. A fully translated corpus will need additional profiling and may justify sharded language assets before release; this release does not certify memory use at 100% translation coverage.

Production-browser first full Malay lookup measured 6,598 ms locally. Fresh home made zero dictionary/Malay data downloads. Production tests verified cached phrase/synonym lookup, preserved saved English/Malay sense content, offline reloads, existing offline photos, legacy v5/v6/v7 cache upgrade behavior, obsolete asset removal and image API cache bypass.

Phone/tablet layouts were tested in desktop Microsoft Edge at 390×844 and 820×1180, with existing responsive tests spanning 320–1440 px. Screenshots were visually inspected. These are viewport tests, not physical Android Chrome or iPad Safari executions. Physical-device/browser matrix testing remains unverified.

## Validation results and completion boundaries

- Production build and TypeScript: passed.
- Unit/regression suite: 811 tests across 25 files passed. Follow-up targeted tests passed after index/checkpoint refinements.
- Browser suite: all 80 cases covered. The full run passed 78; a semantic retry issue and a test's overly strict assumption about valid starter aliases were corrected, and both failed cases passed targeted reruns. Final phone/tablet layout checks also passed.
- Full-corpus Malay QA: 1,393 accepted aligned records, zero structural failures; original corpus preserved against gzip export.
- Historical legacy ranking comparison: 278 queries passed.
- Production lazy/offline tests, Malay offline checks, server packaging scenarios, bundle boundaries, secret/CSP checks and whitespace: passed.
- Human language verification: not performed; zero records are marked verified.

Implemented: dictionary-wide sense schema/overlay, corpus audit, reproducible batch/import/review pipeline, full missing-sense export, indexed Malay search, trilingual cards/details, matched-sense route persistence, canonical server image resolution, responsive controls, lazy loading, offline migration, provenance and QA/reporting.

Available translations: 1,393 substantive unreviewed sense glosses (0.7027%). Remaining: 196,852 senses, including 8,580 tagged idiom/figurative senses, plus human review of every current candidate. Complete linguistic coverage is not achieved.

The remaining translation work needs a Malaysian Malay reviewer and either a licensed, validated sense-aligned corpus or a configured context-aware local/provider adapter. No such full-corpus source/model or credentials were present in the repository. DBP reproduction needs its stated permission; licensed OMW data still needs semantic alignment. A paid provider would need an explicitly configured budget and credentials; no paid service was enabled, purchased or used. These linguistic/source dependencies, physical-device testing and future full-coverage memory profiling remain open.

## Reproduction and evidence

```powershell
npm run data:import
npm run malay:audit
npm run malay:build
npm run malay:validate
npm run malay:queue
npm run build
npm test -- --maxWorkers=2
npm run test:browser
npm run preview -- --port 4173
# With preview running:
npm run test:lazy
npm run test:offline
npm run test:malay-offline
npm run test:bundle
npm run check:source
npm run check:whitespace
```

Evidence: `.tmp/malay-corpus-baseline.json`, `.tmp/malay-coverage.json`, `.tmp/malay-qa.json`, `.tmp/malay-legacy-ranking.json`, `.tmp/malay-bundle-before.json`, `.tmp/bundle-after.json`, `.tmp/malay-search-before.json`, `.tmp/malay-search-before-confirmed.json`, `.tmp/malay-search-after.json`, `.tmp/malay-offline.json`, `.tmp/malay-phone.png` and `.tmp/malay-tablet.png`. The deterministic accepted records and human-review samples are in `scripts/data/`; the runtime overlay is `src/data/malay-runtime.json`.
