# KANJIAN — Malay translation recovery report

Completed 16 October 2026 (Asia/Kuala_Lumpur). Evidence timestamps below are UTC.

The complete **192,326-sense withheld backlog was reassessed from verified saved outputs**. The release adds **8,466 provisional meanings**: **375 lexical equivalents** and **8,091 translations of dictionary cross-reference definitions**. All **198,245 senses** and **5,919 previously stored Malay meanings** remain intact. Final stored-meaning coverage is **14,385 / 198,245 = 7.2562%**; **183,860 senses remain without an admitted Malay meaning**. Most of this increase is explicitly typed definition coverage, not lexical-equivalent coverage. No independent human review is claimed.

The validated application/data release was committed, pushed to the existing GitHub repository and deployed through the existing Vercel Hobby project. Actual live data and browser checks passed. **Translation API calls: 0. Translation API charges: USD 0.** No billing information, subscription, paid inference, new paid resource, or hosting upgrade was introduced.

## A. Root-cause investigation

The baseline was verified at Git commit `43a137e4f49414492c5ee96c9d4cc5fb094e0176`: 125,173 dictionary entries, 198,245 senses, 5,919 stored Malay meanings and 192,326 missing. The authoritative store remains `scripts/data/malay-translations-v1.json`; production uses its existing lazy `src/data/malay-runtime.json` projection. No external database was introduced.

Every original workload hash, partition offset, checkpoint shard checksum, output cardinality and sense-key alignment was verified. All 192,326 actual prior quarantine records exist. The original quarantine and checkpoints were retained unchanged.

| Previous-run observation | Verified count / conclusion |
| --- | ---: |
| Unique missing senses processed in the previous full run | 194,061 |
| Primary full-run output rows / nonempty outputs | 194,061 / 194,061 |
| Additional previous lexical/surname rows | 3,660 |
| Full-backlog candidate rows, including additional attempts | 197,721 |
| Additional benchmark rows in saved prior complete-run checkpoints | 3,040 |
| All verified prior complete-run checkpoint rows, including benchmarks | 200,761 |
| Raw empty outputs across those checkpoints | 0 |
| Recorded local-inference-failed rows across those checkpoints | 0 |
| Duplicate primary sense IDs | 0 |
| Explicit exact-context cache reuse flags in full-backlog rows | 57 |
| Prior import-stage failures | 0 |
| Prior withheld senses with no recorded rejection rule | 0 |

These are saved output-row counts, not a count of individual decoder calls or independent successful semantic translations. The previous input/cache logic can reuse identical contexts. Three prior `empty`/`missing-malay` validation flags arose after postprocessing even though raw output strings were nonempty. That is different from an empty model response. Earlier exploratory work outside the complete-run checkpoint directory is not included in the checkpoint totals above.

The primary bottleneck was the exact-reference gate: **190,448** withheld senses carried `no-independent-sense-reference`; **192,258** carried `whole-output-reference-mismatch`. These counts overlap. A lack of reference agreement was treated as insufficient evidence for automatic admission, not proof that the model text was wrong. This excluded good translated definitions as well as genuinely bad outputs.

The exhaustive classification uses the following reproducible priority order. Each withheld sense belongs to exactly one row, even if it has several warnings:

| Disjoint observable evidence category | Senses |
| --- | ---: |
| Unknown semantics: no required reference evidence | 156,060 |
| Script or format requiring review | 23,518 |
| Identical source/output, including possible loanwords | 7,665 |
| Corruption or repetition warning | 1,447 |
| Reference mismatch requiring semantic review | 1,393 |
| Language warning requiring review | 1,338 |
| Length or truncation warning | 813 |
| Existing known-sense-conflict policy flag | 47 |
| Other recorded rule requiring review | 45 |
| **Total** | **192,326** |

The complete per-sense ledger is local at `.tmp/malay-deep/classified-withheld.jsonl`; its SHA-256 and compact diagnostics are committed in `scripts/data/malay-deep-forensics.json`. Nonexclusive warnings include 8,244 English-copy flags, 24,269 lexical-symbol/script flags, 17,570 Unicode/target-script flags, 1,147 inference-stage Indonesian vocabulary flags, 585 further locale-review flags, 441 English-word warnings, 6,120 number-change warnings, 562 bare-verb warnings, and 8,528 idiom explanation warnings. These must not be added together or presented as mutually exclusive linguistic errors.

Counting each sense once within an overlapping warning family gives **27,106 language-warning senses**, **192,299 reference/semantic-scope-warning senses**, and **27,408 format-warning senses**. Language combines copy, English/Indonesian word warnings and target-script flags; semantic scope combines reference absence/mismatch, known scope conflicts and contextual/idiom requirements; format combines script, length, structure, corruption, number-change, repetition and invalid search-term flags. These exact flag lists and results are retained in `.tmp/malay-deep/rejection-families.json`. Duplicate text across separate senses is not a duplicate sense ID and is not rejected merely because its spelling repeats.

**Semantic correctness totals remain unknown.** The corpus lacks independent human labels, so a definitive total of genuinely incorrect, genuinely correct, or ambiguous translations cannot be manufactured from these warnings. The reference-gap category is explicitly unknown; format/language warnings can also contain correct text. All 183,860 still-withheld senses remain review candidates rather than being declared incorrect. The separate final outcome ledger records 6,576 cached admissions, 1,890 new admissions and 183,860 remaining withheld senses, summing to the original 192,326.

### Validation defects and improvements

- **Loanwords were rejected twice.** Inference attached an unconditional English-copy flag; the later validator retained it even when scoped Malay evidence existed. The Malay-reference helper also discarded many identical English spellings through a short whitelist. Recovery now admits an unchanged spelling only with the complete English/POS sense and explicit Malay Wiktionary attestation. Seventeen newly stored lexical records retain identical English/Malay spelling, including Internet, tsunami and sampan. Arbitrary English copies still fail.
- **Translated definitions were forced through lexical gates.** The previous gate required short whole outputs to exactly match a Malay WordNet lemma and rejected Chinese anywhere in Malay text. Correct `see …` and `variant of …` definitions therefore failed for preserving their original Chinese citations. A separate bounded definition grammar now preserves the full citation, traditional/simplified delimiter, tone-number pinyin and qualifiers. Arbitrary Han, missing/changed citations, changed tone numbers and extra explanations remain rejected.
- **Missing Chinese WordNet coverage was treated as a universal blocker.** Where a Chinese entry is absent, recovery requires a unique complete-English synset plus both Wordnet Bahasa and Malay Wiktionary evidence. Existing contradictory Chinese evidence is never ignored. English spelling alone never authorizes propagation between senses.
- **Bare verbs were overrestricted.** A short prefix whitelist excluded valid verb lemmas. A root now needs exact Malay Wiktionary verb/POS attestation; a noun such as `racun` does not qualify for “to poison” merely because it occurs in a broad WordNet synset. Multiword equivalents are permitted. Leading `untuk` is normalized only for English infinitives.
- **Broad references are not sufficient by themselves.** Assistant inspection found incorrect combinations such as computer `tetikus` for animal mouse, anatomical `dada` for a storage chest, `permainan` for wild game, and `tuisyen` for education fees. Explicit scoped exclusions with regression tests prevent admission. These findings also demonstrate why global string agreement is not a semantic accuracy guarantee.

There was no demonstrated mass failure in model invocation, target-language selection, duplicate handling, storage schema or the previous import. M2M100 used `en` and `__ms__`, not Malayalam `ml`. There was no invented confidence threshold controlling these new admissions. Selected model/reference licenses were available; licensing did not explain the prior mass rejection. The import was made more reproducible by binding the prepared batch to the exact recovery policy/source hashes, so changed rules invalidate an unreconciled prepared import.

## B. Models, licensing and measured resource use

[HPLT English–Malay v2.0](https://huggingface.co/HPLT/translate-en-ms-v2.0-hplt_opus) is pinned to `873965aa16eb43f662b57f52f39dcc2efe20681d`, **CC BY 4.0**. [Meta M2M100 418M](https://huggingface.co/facebook/m2m100_418M) is pinned to `55c2e61bbf05dfb8d7abccdc3fae6fc8512fd636`, **MIT**. Existing downloaded weights were reused; no model download was needed for this recovery. HPLT's original downloaded files total 310,507,316 bytes, with 82,193,357 bytes of converted int8 weights. The existing M2M100 source cache totals 1,935,796,948 bytes and its converted int8 weights 487,900,904 bytes. Attribution, model revisions and full license notices remain public.

Licensed references reuse pinned Wordnet Bahasa, Chinese Open Wordnet, Princeton WordNet and Malay Wiktionary extracts. The two Wiktionary extracts are mirrors of one underlying source and are not counted as two independent dictionaries. New per-lexical-record source-page credits appear in `/data/MALAY-RECOVERY-ATTRIBUTION.json`. Maintainer-authored Malay definition grammar and corpus-aligned additions retain CC BY-SA 4.0 attribution.

The previous 380-sense, six-configuration measurements were retained and examined, not rerun with unchanged models. They showed substantive errors in both models; HPLT produced unrelated text for technical terms and confused spatial “long” with `lama`, while M2M100 rendered “to boil” as drinking in one case. Both confused fasting with speed. Reference-match counts in those benchmarks are not semantic accuracy percentages. HPLT remains useful for throughput and fixed dictionary relations; M2M100 provides a measured, restricted lexical fallback.

Additional alternatives were investigated. The small [Mesolitica translation T5 v2](https://huggingface.co/mesolitica/translation-t5-small-standard-bahasa-cased-v2) advertises Malay translation, but its official API/card at revision `930bf94c378d14df39793ef6c081ece74e158b37` did not specify a model license. The Malaya software's MIT license alone does not establish rights to those separate weights. It was not downloaded or used. [NLLB 600M](https://huggingface.co/facebook/nllb-200-distilled-600M) has CC BY-NC 4.0 model restrictions and was not selected for unrestricted educational corpus reuse. Cached [MADLAD400 3B](https://huggingface.co/google/madlad400-3b-mt), Apache 2.0, had previously shown a working classic completion path but unreliable short-gloss output and encoder-order failures in the available batch/server paths. There was no demonstrated fix or measured advantage justifying another full run. No new accuracy claim is made for these unbenchmarked alternatives.

This pass used the existing Python 3.12.7 CPU environment with CTranslate2 4.8.3. The machine has four physical/eight logical cores and 12,728,672,256 bytes RAM. Current hardware sampling confirmed Windows 11 build 26200 and approximately 53.6 GB free disk. CPU/GPU identifiers and installed drivers remain those verified in the preceding report: Intel i5-10210U and NVIDIA MX250 2 GiB. The existing GPU-capable maintenance path remains available, but the small new lexical queue and seven fixed relation strings were practical on CPU without conversions or GPU startup. No GPU throughput is claimed for this pass.

| Actual new processing | Rows assessed | Unique model-input contexts | Inference seconds | Observed peak process RSS |
| --- | ---: | ---: | ---: | ---: |
| M2M100 CPU int8, four threads, beam 4 | 711 | 711 | 60.593 | 921,133,056 B |
| HPLT first protected-marker pilot, quarantined | 500 | 7 | 0.453 | 142,790,656 B |
| HPLT improved protected definitions, CPU int8 | 1,796 | 7 | 0.125 | 143,691,776 B |

M2M100 produced approximately 11.73 rows/second in this workload. HPLT translated seven fixed relation inputs and reused those outputs for opaque references; reporting thousands of independently inferred lexical translations per second would be misleading. Its measured seconds include checkpoint worker batch processing, not model startup, workload preparation or reference checks. New saved rows total **3,007**, including the failed 500-row pilot; the 711+7+7 distinct input contexts explain why row count differs from decoder work. All new raw output rows were nonempty and no local inference failure was recorded. RSS is sampled process memory, not a complete measurement of all system allocations.

## C. Recovery, pilots and complete eligible processing

A deterministic **500-sense stratified cached pilot** included 40 idioms, 50 polysemous senses, 40 long definitions, 60 technical/scientific senses, 100 verbs, 50 modifiers, 40 rare/bound senses and 120 common senses. The original gate admitted zero in this selected previously withheld panel; the improved scoped gate admitted 14. This is acceptance yield, not a semantic correctness estimate. Difficult unsupported cases stayed withheld.

The complete cached reassessment recovered **6,576 actual prior model outputs**: **281 lexical equivalents** and **6,295 definitions**. Recovery ran against all 192,326 original withheld senses without an arbitrary acceptance cap. Those records passed isolated import and were integrated locally before new inference.

The new lexical queue used only still-missing, reference-eligible contexts that had not already been attempted by M2M100. Its reference targets were fixed before inference and were never inserted into model prompts. The first **500 cases** form a new reference-backed holdout; references are licensed dictionary evidence, not model-authored gold answers or independent human approval. Assistant screening exposed fees/tuition and ethnology/anthropology mismatches, which were excluded. All **711 eligible senses** were then processed with checkpoint resumption: **94 lexical equivalents** qualified, and **617** remained withheld. A preparedness/preparations mismatch was also excluded. This conditional 94/711 yield cannot be generalized to arbitrary dictionary senses or used to assert overall model accuracy superiority.

Cross-reference recovery used a separate pilot. The first 500 protected cases failed the gate because HPLT altered `KANJIANREF` and omitted required relation terms. None was imported from that attempt. Clearer full English wording and an opaque `X` marker produced a revised **500-case pilot with 500 admissible definitions**, after narrow normalization of marker case and equivalent Malay word order. Full processing covered all **1,796 eligible remaining exact-reference definitions**. All qualified. This is a bounded grammar proof covering seven fixed relations, not 500 or 1,796 independent open-domain semantic translations. Each original citation and numeric pinyin is restored independently for its exact original sense key. No lexical translation is inferred for the cited Chinese word.

The final outcome is **8,466 additions: 375 lexical + 8,091 definitions**. All new records are `generated` / `automated-review-required`, with model/revision, actual source input, raw model output, runtime and alignment provenance. No calibrated probability is invented. The [pending review sheet](KANJIAN_MALAY_RECOVERY_REVIEW_SHEET.md) contains every new addition; zero rows are independently approved. The committed evaluation includes the stratified pilot, the 711-case reference-based evaluation and fixed-relation evidence. Neither model agreement, back-translation nor an exact string metric is treated as proof of correctness.

## D. Coverage comparison

| Measure | Before | After |
| --- | ---: | ---: |
| Dictionary senses | 198,245 | 198,245 |
| Stored Malay meanings | 5,919 | 14,385 |
| Explicitly typed lexical equivalents | 1,028 (0.5186%) | 1,403 (0.7077%) |
| Explicitly typed translated definitions | 707 (0.3566%) | 8,798 (4.4379%) |
| Preserved legacy meanings with no kind field | 4,184 (2.1105%) | 4,184 (2.1105%) |
| Total stored-meaning coverage | 2.9857% | 7.2562% |
| Missing meanings | 192,326 | 183,860 |
| Stored `generated` status | 4,210 | 12,676 |
| Preserved `unreviewed` status | 1,709 | 1,709 |
| Independently human-reviewed meanings established | 0 | 0 |

Legacy meanings are left unclassified rather than silently relabelled as lexical equivalents. Total stored coverage rose by **4.2705 percentage points**; explicitly typed lexical coverage rose by **375 senses / 36.48%**. The larger total increase is predominantly dictionary definitions. It is not a misleading claim of 14,385 verified lexical equivalents.

## E. Data integrity, import safety and limits

A verified independent project backup of **279 nonignored files** was created before recovery:

`.tmp/malay-datasets/backups/2026-10-15T20-41-18-328Z/`

It includes the canonical dictionary, both Malay files, all 15 pre-existing untracked experiments, per-file hashes, working-tree state and `RESTORE.txt`. Production assets were independently downloaded before this release and matched local baseline data. The old working production deployment is `dpl_Bcut7pu1HpR4HWpAMiyEnufGASxu`, source `43a137e4f49414492c5ee96c9d4cc5fb094e0176`.

Both recovery and new-result imports first used isolated copies. They retain exact original sense IDs, use immutable 128-record import snapshots, prevent duplicate/overwrite operations, validate source/policy hashes, and promote the store/runtime pair with a backup journal and rollback on write error. A real repeat import added **0** records and retained the same final hashes. No unrelated working files were committed or changed.

Full integrity checks prove all 5,919 old store records and all 5,919 old runtime records are byte-equivalent at serialized-record level. All 15 original untracked files retain their original checksums. Mandarin, traditional forms, pinyin, English, sense IDs, canonical compressed dictionary and learning runtime remain unchanged. All new IDs are unique, resolve to their exact original senses and pass the structural/provenance validator.

| SHA-256 target | Value |
| --- | --- |
| Unchanged canonical dictionary | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| Baseline Malay store | `1488da9482d4c34734edb945f188b7e29ee2d2460f3585aebdb78332d3e5d100` |
| Final Malay store | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| Final local/live Malay runtime | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |

The store is **20,828,295 bytes** and runtime **15,132,761 bytes**. All model weights, caches, raw quarantine and checkpoints remain ignored. Only those two validated JSON assets may exceed the existing 8 MiB preflight check, with a narrow 32 MiB ceiling; other pending files retain the 8 MiB guard. Neither file approaches GitHub's 100 MB file limit. The complete built production output is approximately **30,081,568 bytes**, within the existing static deployment architecture. No new storage product or inference function was provisioned.

For local rollback, stop development servers, verify the backup manifest and restore both paired Malay files from its `project/` directory. Preserve unrelated changes; do not reset Git history. Immutable prior Vercel production remains the deployment rollback reference. No production rollback was required.

Completed runs can be verified/resumed with the exact commands in `scripts/malay/README.md`. Keep frozen workloads and checkpoints; do not regenerate extraction files over a promoted store into an existing run directory. The worker verifies input/model/configuration identity, resumes saved shards and denies inference network connections. A paid provider or billing fallback does not exist.

## F. Application and regression validation

The application architecture and gallery implementation are unchanged. Students retrieve stored meanings through the existing lazy worker. The existing labels distinguish **Machine-translated equivalent** from **Machine-translated English definition**, both awaiting language review. Source citations in definitions are preserved identifiers, not an incorrect target-language reversal.

| Actual validation | Result |
| --- | --- |
| Production build / TypeScript / existing image-function packaging / cost guard | PASS |
| Full unit/integration run | **844 passed**, 29 files, 53.86 seconds |
| Targeted final provenance/quality guard tests | **17 passed**, two files |
| Clean final actual Edge browser run | **86 passed**, 0 failed, 0 skipped |
| New recovered meaning and all ten polysemy browser tests | PASS |
| Source/whitespace and lazy bundle boundaries | PASS |
| Full corpus and every existing translation preservation | PASS |
| Isolated import, duplicate protection, source tamper protection and repeat import | PASS |
| Offline new loanwords / cross-reference definitions / labels | PASS |
| Saved words, idioms, photos and v5/v6-to-v7 offline migration | PASS |
| Production exact-data and live gallery/fallback checks | PASS |

An initial new browser test assumed Chinese search should open B超's abbreviation meaning by default. The app correctly opened the first canonical meaning, “B-mode ultrasonography.” The test was corrected to explicitly select the abbreviation sense before asserting its Malay definition; both focused tests passed, followed by the clean complete final browser run. No application behaviour was altered to satisfy this test.

Final live verification also corrected two checker limitations: large runtime bodies are downloaded independently rather than through an evictable DevTools response cache, and progressive search is checked against the actual clicked card instead of a potentially reordered positional locator. The corrected real-site checks passed; no application code change was needed for either issue.

Real browser checks covered **bank, light, charge, current, spring, right, match, set, run and break**. Scoped unit pairs reject the wrong alternate meaning; browser checks preserve the selected canonical English sense. Existing Pixabay, Openverse, 360-degree semantic galleries, idioms, lazy loading, saved words, pronunciation and the official Google Translate fallback passed regression checks. Tests do not certify every linguistic sense in the corpus.

Measured local index build was **5,696 ms**, with **321,287,544 bytes retained heap**, approximately **27.68 MiB** above the previous 292,260,896-byte measurement. Median warm searches were 0.102 ms for `猫`, 1.659 ms for `chang jing lu`, 0.150 ms for `dog`, 0.664 ms for `anjing` and 0.432 ms for `membantu`. These measure local index queries, not full network/page latency. The first clean local browser lookup was **6,033 ms**; the home page still fetched neither full dictionary nor Malay runtime before needed. The larger stored-meaning asset adds memory and cold-loading work; no low-end mobile hardware timing is claimed from desktop viewport tests.

Startup JavaScript remains approximately **321.65 kB**, the dictionary worker approximately **56.06 kB**, and Malay data remains lazy JSON (**approximately 1.369 MB gzip**). No translation model enters the browser bundle or Vercel runtime. Normal searches invoke no translation API. Missing meanings retain the optional official Google website link; its selected-English/target-Malay navigation was tested without reading or persisting Google's translation result.

## G. GitHub, production and live examples

- Existing repository: [pekchunhoe/mandarin-visual-dictionary](https://github.com/pekchunhoe/mandarin-visual-dictionary).
- Validated application/data source: **[`91991afbd5251658be0c7dda27f2396615611e2b`](https://github.com/pekchunhoe/mandarin-visual-dictionary/commit/91991afbd5251658be0c7dda27f2396615611e2b)**.
- Push: successful to existing `main`, independently matched to remote SHA; no force push or replacement repository.
- Existing Vercel project: `prj_45bxtqgs7w3rV211KuVvoWmmxJkU`, `pek-explains-physics`, **Hobby**.
- Git-triggered production deployment: **`dpl_2ievUu6HWuTmmZYeNqXXnKXsEevn`**, **READY**, correct source SHA and existing domain alias.
- Live application: [KANJIAN](https://mandarin-visual-dictionary.vercel.app).

The report records the verified application/data release; this document is committed separately as documentation. Hosting plan, environment variables, security configuration, domain and existing image API architecture were preserved. Deployment used the established Git-triggered workflow. Existing [Vercel limits](https://vercel.com/docs/limits) and package size were checked; the actual deployment succeeded without a paid upgrade. This does not promise unlimited future traffic.

The live recovery verification completed at **2026-10-15T21:34:19.572Z**, checked new Mandarin/Malay searches, pinyin, exact English-to-Malay linkage, both translation labels, desktop/320-pixel phone layout, the ten polysemous English queries and public attribution. It recorded zero critical JavaScript errors, zero image API server errors and zero forbidden translation requests. Its home view appeared in **589 ms** and first full lookup in **6488 ms**. Existing Malay examples and the real image gallery also passed a separate production regression check. A real official Google website fallback click passed without scraping or saving a translation.

The observed live gallery inventory rendered one item, and one Openverse thumbnail request was blocked by the browser's ORB protection. Dictionary display remained usable and image API responses had no server errors. The 20-image/360-degree behaviour and both provider integrations passed the controlled browser regressions; that does not guarantee live third-party image availability.

| Actual live example | English | Malay | Classification |
| --- | --- | --- | --- |
| 互联网 | Internet | Internet | Scoped lexical loanword |
| 海啸 | tsunami | tsunami | Scoped lexical loanword |
| 轮椅 | wheelchair | Kerusi roda | Lexical equivalent |
| T裇 | variant of T恤[T xu4] | Varian bagi T恤[T xu4]. | Translated definition, cached output |
| B超 | abbr. for B型超聲\|B型超声[B xing2 chao1 sheng1] | Singkatan bagi B型超聲\|B型超声[B xing2 chao1 sheng1]. | Translated definition, protected reference |

At **2026-10-15T21:34:58.843Z**, independently downloaded main JavaScript, detail JavaScript, dictionary worker, complete canonical dictionary and Malay runtime matched the validated local build by SHA-256. The public recovery attribution also matched source. Detailed local evidence and screenshots are in `.tmp/malay-deep/live/`.

Committed evidence includes `malay-deep-forensics.json`, `malay-deep-evaluation.json`, `malay-deep-recovery-manifest.json`, the scoped review policy, attribution, pipeline/test changes and the pending review sheet. Local evidence includes the full original classification ledger, final outcome ledger, backups, immutable model shards, failed and successful pilots, isolated import journals, preservation results, test logs, hardware/performance measurements and deployment verification.

**Remaining limit:** safe open-domain semantic validation remains unavailable for much of the corpus. Both models still produce substantive errors, lexical references remain incomplete, and independent Mandarin–Malaysian Malay review is outstanding. Complete cached reassessment and every justified new eligible workload finished; no numerical acceptance target was forced. The remaining 183,860 senses were preserved as missing rather than filled with unqualified text. Translation API charges remain zero.
