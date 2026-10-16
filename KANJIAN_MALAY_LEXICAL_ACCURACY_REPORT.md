# KANJIAN — Malay lexical accuracy report

Completed 16 October 2026 (Asia/Kuala_Lumpur). Application/data release, GitHub push and live Production verification are complete. Evidence timestamps below are UTC.

The complete 198,245-sense corpus was assessed. The release adds **458 provisional lexical equivalents**: **82 enrich previously definition-only senses** and **376 cover previously untranslated senses**. All 14,385 existing Malay records retain every original field. Total stored-content coverage becomes **14,761 / 198,245 = 7.4458%**. Explicit lexical coverage increases from **1,403 to 1,861**, with **82 senses containing both types**. There are **183,484 completely untranslated senses**. No paid inference or translation API was called.

## A. Baseline audit

Local main and origin/main matched 6cba4e5891d56a3a50d5aa7b1d7ba89a524cf495. The existing repository is https://github.com/pekchunhoe/mandarin-visual-dictionary. Production before release was dpl_3eZFUXuXiimGiDfJNkAEL3d7amuP at the same source SHA, READY on the existing Hobby project. Live dictionary and translation bytes were independently downloaded and matched the baseline.

The authoritative store is scripts/data/malay-translations-v1.json; the student app loads src/data/malay-runtime.json lazily through its existing dictionary worker. There is no external translation database. The verified backup at .tmp/malay-datasets/backups/2026-10-15T23-57-45-678Z contains 302 independent nonignored source/data files, a SHA-256 manifest and RESTORE.txt. All 15 pre-existing untracked research files remain unchanged and outside the release.

Baseline: 125,173 entries, 198,245 senses, 14,385 stored Malay records (7.2562%), 1,403 explicitly typed equivalents, 8,798 explicitly typed definitions and 4,184 untyped legacy records. The prior 8,091 recovered cross-reference definitions remain present.

The content audit, separate from stored type fields, classifies 4,339 existing texts as lexical equivalents by explicit type or complete sense/POS evidence, 8,896 as definitions (including 98 legacy records carrying an explicit idiom-explanation flag), 1,146 as mixed/ambiguous and 4 as questionable under existing scoped policies. These are automated evidence categories, not independent correctness labels. No structural validation failure was found. The four linguistic warnings remain unchanged and appear in the review sheet; they are not declared proven errors. No short legacy text was automatically promoted to a lexical type.

## B. Lexical improvement

All 8,896 definition-only records were analyzed before the missing backlog. Exactly 82 of the previously recovered 8,091 definitions gain a separate provisional lexical field. Original explanations, statuses, source input, raw model output and provenance are preserved. All 183,860 initially missing senses were then assessed; 376 new reference-derived equivalents qualified, without an acceptance cap.

The backward-compatible extension adds optional malayLexical/malayDefinition objects with separate text, review status, source, license and version. The original malay text and metadata remain intact. Full alignment evidence stays in the authoritative store; raw inference/alignment metadata is omitted from the runtime supplement. The interface emphasizes the equivalent and labels its explanation separately. Dictionary extraction is labelled as provisional dictionary content; preserved neural outputs retain their machine-translation labels. The official Google Translate navigation fallback remains for missing meanings.

Direct extraction requires the complete English sense, every semicolon/slash clause, consistent grammatical category, a unique aligned synset and both Wordnet Bahasa and Malay Wiktionary evidence. If Mandarin concordance is unavailable, every English clause must itself be unambiguous. A contradictory Mandarin synset is never ignored. Unqualified bare verb roots, regional vocabulary, incomplete senses and known scope conflicts are withheld.

Exact variant/abbreviation references preserve both scripts and tone-number pinyin. Every sense of the cited entry must independently support the same lexical content and POS. Ordinary see-references, ambiguous targets, cycles, unresolved senses and incorrect pinyin do not authorize propagation. Seeds are frozen; generated outputs cannot recursively authorize other outputs. Reference seeds can reuse preserved target glosses revalidated through exact Mandarin/English/POS WordNet evidence; these inherited glosses do not all have Wiktionary page attestation. This is distinct from the two-reference-family requirement for all 376 new direct entries.

A total of 458 additions qualified as provisional, all pending independent language review. The final pass retains 193,448 unresolved sense decisions across existing and missing records, plus 47,797 evaluated WordNet alternatives that lacked required evidence or failed a scoped rule. Those alternative counts overlap senses and are not counts of proven incorrect translations. All 183,484 missing senses stay missing. The committed review sheet lists every addition; the local hashed review ledger retains uncertain candidates and rejection reasons. New negative tests reject bank/riverbank, illumination/lightweight, electrical charge/fee, current/present, collection/place/solidify, POS conflicts, partial clauses and conflicting target senses. Source exclusions are scoped to their questioned pairs, so rejecting opportunity/can does not reject opportunity/peluang, and a bedbug warning does not reject the legitimate insult sense of bangsat.

Local promotion uses an isolated validated pair, bound corpus/store/policy/candidate hashes, a paired backup journal and rollback. A real Windows file-lock interruption restored both baseline files and recorded rolled-back; stopping task-owned readers allowed successful promotion. A final repeated import adds zero records and zero supplements. Tests also prove tampered batches, duplicate IDs, changed policies and explanation overwrites are rejected.

## C. Translation model evaluation

This release reuses verified saved outputs rather than repeating unchanged neural inference. Both cached models still show substantive sense and locale errors; unrestricted neural admission remains unjustified. The improvement is a separate licensed lexical extraction/validation stage, with no invented confidence percentages. New neural inference calls: 0; translation API cost: USD 0.

- HPLT English–Malay v2.0, revision 873965aa16eb43f662b57f52f39dcc2efe20681d, CC BY 4.0: https://huggingface.co/HPLT/translate-en-ms-v2.0-hplt_opus.
- Meta M2M100 418M, revision 55c2e61bbf05dfb8d7abccdc3fae6fc8512fd636, MIT, explicitly supports Malay ms: https://huggingface.co/facebook/m2m100_418M.

Input hashes, every loaded shard checksum, cardinality and exact original sense alignment were reverified for the two 380-row CPU benchmark runs. Prior measured CPU int8 beam-4 runs took 11.500 seconds for HPLT (33.04 rows/s, 148,168,704 B peak RSS) and 47.876 seconds for M2M100 (7.94 rows/s, 884,236,288 B peak RSS). These are historical verified measurements, not new throughput claims. The six historical CPU/GPU/beam/precision configurations remain in the evaluation evidence. Errors include unrelated technical terms, temporal/spatial confusion, fasting versus speed, noun/verb category errors, English copies and regional vocabulary. No new model, package, GPU service or paid resource was provisioned.

This machine has an Intel i5-10210U, 8 logical cores and 12,728,672,256 B RAM. The complete final reference pass took 9.596 seconds including audit, resource checks and output writing under concurrent local work. The 380-case comparison after resource loading took about 0.066 seconds. Neither measures neural decoding or GPU utilization. Existing memory-aware local inference, CPU fallback, immutable shards, input-aware caches, checkpoint resumption and network denial remain available and unchanged.

References retain the pinned OMW revision 406bf83b3c507a3d1f26e88252d5d66893fd36bf, Wordnet Bahasa MIT notice, Chinese Open Wordnet and Princeton WordNet licenses, and CC BY-SA 4.0 Wiktionary attribution. Kaikki and Mesolitica are mirrors of one Wiktionary source family. Per-sense source links are in public/data/MALAY-LEXICAL-ATTRIBUTION.json; complete notices remain in MALAY-NOTICE.txt and data/licenses. No DBP/PRPM, Cambridge or unlicensed Google-derived dataset was copied.

## D. Coverage before and after

| Measure | Before | After |
| --- | ---: | ---: |
| Dictionary senses | 198,245 | 198,245 |
| Senses with stored Malay content | 14,385 | 14,761 |
| Total content coverage | 7.2562% | 7.4458% |
| Explicit lexical coverage | 1,403 (0.7077%) | 1,861 (0.9387%) |
| Explicit explanatory definitions | 8,798 (4.4379%) | 8,798 (4.4379%) |
| Senses containing both explicit types | 0 | 82 |
| Preserved untyped legacy records | 4,184 | 4,184 |
| Main records with generated status | 12,676 | 13,052 |
| Additional generated lexical supplements | 0 | 82 |
| Main records with unreviewed status | 1,709 | 1,709 |
| Independently human-reviewed meanings | 0 | 0 |
| Completely untranslated senses | 183,860 | 183,484 |

The union content count includes dual-type senses once. New dictionary extraction is automated/provisional, not neural model output or human review. Existing confidence values are preserved; new records add no confidence percentage. Explicit lexical coverage rises by 458 senses (32.64% relative); the larger audit classification of legacy text is not counted as new translation coverage.

## E. Independent quality evaluation

The representative 380-sense panel contains 300 licensed dictionary reference cases and 80 assistant-authored difficult drafts. It spans 71 verbs, 24 technical cases, 32 idioms, 12 modifiers, uncommon words, long/figurative definitions, ordinary vocabulary and several polysemy/grammar categories. Exact category counts and every source citation are in scripts/data/malay-lexical-evaluation.json.

| All 380 cases | HPLT cached output | M2M100 cached output | New lexical extractor |
| --- | ---: | ---: | ---: |
| Complete reference-lemma agreement | 105 | 120 | 215 |
| Scoped gate accepted / candidate generated | 165 | 181 | 240 |

On the 300 licensed cases, the extractor generates 239 candidates: 214 fully match the recorded reference lemmas, 25 contain a different/additional reference-attested alternative, and 61 are withheld. HPLT and M2M100 respectively match 96 and 109 recorded reference sets on that subset. The different exact-match normalization is specified in the evaluator; these numbers should not be substituted for earlier report metrics.

The licensed references were authored independently of these neural models, but the extractor uses overlapping dictionary sources. This is reference consistency, not a new blinded semantic benchmark. The 80 drafts are not independent ground truth. Synonyms and inflections mean a nonmatch can be correct, and a reference match can still have a contextual defect. Consequently correct-sense totals, incorrect-sense totals, grammatical quality, Malaysian suitability, explanation correctness, false acceptance and false rejection remain unmeasured without independent linguistic labels. They are explicitly null in the evidence, not zero. No independent human review is claimed. All 458 additions and the four flagged old meanings remain pending human review. The benchmark does not justify filling all remaining senses with neural output.

## F. Application performance and regression validation

The sparse existing worker architecture, search algorithm, pinyin/English corpus, idioms, provider integrations, 360-degree galleries, security configuration and lazy boundaries remain. The generated native image-function bundle was refreshed from the shared source; provider adapters and security settings were not edited. No model weights, source caches or checkpoints enter Git or deployment assets.

| Measured asset | Before bytes | After bytes |
| --- | ---: | ---: |
| Authoritative store | 20,828,295 | 21,382,097 |
| Lazy runtime JSON | 15,132,761 | 15,445,028 |
| Runtime gzip | 1,368,935 | 1,417,521 |
| Initial JavaScript | 321,652 | 322,308 |
| Dictionary worker | 56,062 | 56,409 |

Final dist: 54 files, 30,541,015 bytes. The runtime grows about 2.06%; initial JS grows 656 bytes. Both canonical JSON files remain under their existing 32 MiB preflight limits, with the normal 8 MiB guard elsewhere. No external DB, paid storage or hosting upgrade was introduced.

Uncontended index construction measured 5,450.57 ms before and 5,913.86 ms after; retained heap measured 321,282,712 B before and 321,724,944 B after (442,232 B more). Warm median anjing lookup measured 0.569 ms before / 0.539 ms after; membantu 0.419 / 0.422 ms; Chinese 猫 0.100 / 0.107 ms. These are local index timings, not network latency or low-end phone hardware. An earlier after-sample under concurrent browsers was slower and was retained separately; no speed improvement is asserted from it. Cold-loading still has a substantial full-dictionary/index cost. Fresh-home lazy checks fetch neither full dictionary nor Malay runtime.

Final unit/integration: 864 passed, 0 failed, 0 skipped, 32 files. Full corpus presentation/visual regression covers all 125,173 rows. Final real Edge browser run: **88 passed, 0 failed, 0 skipped**, exit code 0, 676.173 seconds including test-server cleanup. Both new dual-field/lexical cases and all prior gallery, polysemy, fallback and mobile tests passed. Production results are recorded below. Existing bundle/lazy, offline migration and saved meanings, source/security, provenance, duplicate/overwrite protection, Unicode and zero-cost guards passed. The first lazy-check invocation lacked its required preview server; it was rerun with the server and passed. An interrupted browser attempt is not counted as a successful run. The final runner required stopping its task-owned Vite server after all tests completed; it then emitted its clean 88-pass summary and exit code 0.

## G. GitHub and Production

- Repository: [pekchunhoe/mandarin-visual-dictionary](https://github.com/pekchunhoe/mandarin-visual-dictionary).
- Final validated application/data commit: [26c6250e6bf538395171d9317e741492655eab01](https://github.com/pekchunhoe/mandarin-visual-dictionary/commit/26c6250e6bf538395171d9317e741492655eab01).
- Push: successful to existing main, independently matched by git ls-remote. No force push or replacement repository.
- Existing Vercel project: prj_45bxtqgs7w3rV211KuVvoWmmxJkU, pek-explains-physics, Hobby.
- Git-triggered Production deployment: dpl_E94i6ie3NWT4B1K3kEWUkQkZLQVF, READY, correct release SHA and existing domain alias.
- Live website: [KANJIAN](https://mandarin-visual-dictionary.vercel.app).

Live verification at 2026-10-16T00:40:47.723Z matched the complete original dictionary, new Malay runtime, main JavaScript, worker and attribution by SHA-256 against the validated build. All 14,761 stored senses were present. Real Mandarin and Malay lookups showed 家俱/perabot with its original Varian bagi 家具[jia1 ju4]. explanation, and 哺乳动物/mamalia with its exact English mammal sense. Pinyin, the 320-pixel phone layout and provisional labels were checked. The missing 电流 / an electric current sense retained the official English-to-Malay Google navigation link. No translation was scraped or stored from Google.

The live home appeared in 775 ms. The existing cat gallery rendered 1 item; all 3 observed image API responses returned HTTP 200. Zero critical JavaScript errors and zero forbidden translation/inference requests were observed. The controlled complete browser suite verifies 20-image galleries and both providers; live third-party inventory is not guaranteed to contain 20 usable images. Mobile screenshots in .tmp/malay-lexical-accuracy/live were visually inspected. The lexical equivalent and preserved explanation are distinct and readable.

Automatic approval initially rejected the push because it did not recognize the attached authorization. The attached Phase 11 authorization and exact repository scope were rechecked, and the same approval process then permitted the normal push. No bypass or indirect push was used. No authorization or deployment blocker remains.

This report and its compact verification evidence are committed as a documentation follow-up to the application/data release. See scripts/data/malay-lexical-release-verification.json for exact test, deployment, hash and performance evidence; scripts/data/malay-lexical-manifest.json and malay-lexical-evaluation.json for processing/quality evidence; and KANJIAN_MALAY_LEXICAL_REVIEW_SHEET.md for all provisional additions. Full backups, frozen candidates, quarantine decisions and model checkpoints remain local and ignored.


Rollback: the verified previous immutable Vercel deployment is dpl_3eZFUXuXiimGiDfJNkAEL3d7amuP. Local rollback restores the paired before-store/before-runtime files after checking journal SHA-256 values and stopping readers, or restores the original backup project copies. Do not reset unrelated work or force-push. Final corpus SHA-256 is 29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a; final store b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1; final runtime cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19.

Outstanding linguistic work: independent Malaysian Malay review, 1,146 ambiguous legacy texts, four policy warnings and 183,484 untranslated senses. All feasible qualified reference work completed; no numerical target was forced. Translation API calls and translation API charges remain zero.
