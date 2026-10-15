# KANJIAN — Complete offline Malay translation execution report

Recorded 16 October 2026, Asia/Kuala_Lumpur. Processing and release evidence use UTC timestamps on 15 October 2026.

The complete **194,061-sense missing-Malay backlog was processed locally**. Quality gates admitted **1,735 new provisional meanings**: **1,028 lexical equivalents** and **707 translations of English surname definitions**. KANJIAN now stores **5,919 Malay meanings (2.9857% of senses)**. All **198,245 original senses** and **4,184 previously stored Malay records** are preserved. **192,326 senses still lack a qualified stored Malay meaning.** Full processing has finished; full translation coverage has not been achieved.

The validated application/data release was pushed to the existing GitHub repository, automatically deployed through its existing Vercel project, and verified on the production domain. **Translation API calls: 0. Translation API charges: USD 0.** No billing information, paid inference, subscription, hosting upgrade, or paid fallback was introduced.

## Verified translation counts

| Measure | Actual result |
| --- | ---: |
| Original dictionary entries | 125,173 |
| Original dictionary senses | 198,245 |
| Original stored Malay senses, preserved | 4,184 |
| Original coverage | 2.1105% |
| Missing senses attempted by the primary local model | 194,061 |
| Nonempty raw primary-model candidates | 194,061 |
| Additional exact-sense M2M100 attempts | 2,906 |
| Additional rephrased surname attempts | 754 |
| Newly imported provisional meanings | 1,735 |
| New lexical equivalents | 1,028 |
| New translated English definitions | 707 |
| New records originating from HPLT | 1,472 |
| New records originating from M2M100 | 263 |
| Final stored Malay meanings | 5,919 |
| Withheld / quarantined senses; remaining without stored Malay | 192,326 |
| Final stored-meaning coverage | 2.9856995132% |
| Newly independently human-reviewed meanings | 0 |
| Added by a real repeat import | 0 |

The increase is 0.8752 percentage points, or 41.47% more stored Malay meanings than the baseline. Definition translations are included in the stored-meaning count and are explicitly distinguished from lexical equivalents. A nonempty model output is a candidate, not proof of a correct translation. The withheld set includes both incorrect outputs and potentially correct outputs lacking sufficient evidence for import.

All 1,735 new records have `translationStatus: generated` and `translationQuality: automated-review-required`. No numerical translation confidence was invented. Across the complete final store, 4,210 records have `generated` status and 1,709 retain `unreviewed` status; no record is claimed to have received independent human review during this work. Existing records, including their earlier metadata, were not rewritten.

## Local engines, licensing and provenance

The primary engine was [HPLT English–Malay v2.0](https://huggingface.co/HPLT/translate-en-ms-v2.0-hplt_opus), pinned to revision `873965aa16eb43f662b57f52f39dcc2efe20681d`. Its model card identifies English → Malay, Marian Transformer-base, and **CC BY 4.0**. Four downloaded files totalled **310,507,316 bytes**; original weights were 307,935,566 bytes. The converted int8 weights occupy **82,193,357 bytes**, and float32 weights **312,087,617 bytes**. Conversion checks every one of the 64,000 SentencePiece vocabulary IDs. Credits, the model citation, funding acknowledgement, license, revisions and conversion changes are recorded in `public/data/MALAY-OFFLINE-MODELS.json` and the public notice. The model supports generic Malay and does not guarantee Malaysian usage.

The secondary engine was [Meta M2M100 418M](https://huggingface.co/facebook/m2m100_418M), pinned to `55c2e61bbf05dfb8d7abccdc3fae6fc8512fd636`, under **MIT**. Existing downloaded files were reused: 1,935,796,948 bytes in the source cache, with **487,900,904 bytes** of converted int8 weights. Inference explicitly uses source `en` and target `__ms__`; Malayalam `ml` is never selected. The full Meta MIT notice is retained.

Licensed lexical evidence uses the existing pinned Wordnet Bahasa, Chinese Open Wordnet, Princeton WordNet and Malay Wiktionary references. Existing license texts and attribution remain intact. The surname definition evidence is Wordnet Bahasa `nama keluarga`, synset `06336904-n`, OMW revision `406bf83b3c507a3d1f26e88252d5d66893fd36bf` (MIT). Data notices preserve the dictionary's existing CC BY-SA attribution and distinguish source/model licenses. No model weights are redistributed in Git or the frontend.

The alternative [Google MADLAD400 3B MT](https://huggingface.co/google/madlad400-3b-mt) has an Apache 2.0 model card. An existing approximately 1.65 GB quantized cache was tested locally. A temporary metadata adapter retained the payload checksum; current `llama-cli` / server paths failed an encoder-order assertion. The classic completion executable ran, but copied English for a short glossary case and provided no reliable batched translation setup. No MADLAD result was imported and no general accuracy advantage is claimed.

## Hardware and measured processing

Actual machine: Windows 11 build 26200; Intel Core i5-10210U, four physical / eight logical cores; **12,728,672,256 bytes RAM**; Intel UHD graphics plus **NVIDIA GeForce MX250, 2,048 MiB VRAM**, driver 511.69. Free disk was approximately 59.6 GB initially and 55.6 GB in the later hardware snapshot. Available RAM fluctuated from approximately 1.85 GB to 4.27 GB while desktop applications were running.

Separate Python **3.12.7** environments were used; the system Python installation was retained. The CPU environment used CTranslate2 4.8.3, Transformers 4.57.6, Torch 2.14.1+cpu and SentencePiece 0.2.2. The old NVIDIA driver could not support the current CUDA 12 runtime. An isolated CTranslate2 **3.24.0** environment with the official free cuBLAS **11.11.3.6** runtime enabled local GPU inference without changing the driver. The vendor runtime has its own license and remains local; it is not redistributed or deployed. Current [CTranslate2 installation requirements](https://opennmt.net/CTranslate2/installation.html) were checked before choosing the isolated older runtime.

| Actual full-workload partition | Senses | Inference seconds | Senses/second | Observed peak process RSS |
| --- | ---: | ---: | ---: | ---: |
| CPU int8, beam 4 | 18,456 | 1,329.243 | 13.88 | 199,385,088 B |
| CPU int8, beam 1 continuation | 34,176 | 776.724 | 44.00 | 199,962,624 B |
| CPU int8, beam 1 final partition | 56,571 | 1,814.172 | 31.18 | 211,324,928 B |
| GPU float32, beam 1 final partition | 84,858 | 2,484.932 | 34.15 | 547,495,936 B |
| **Primary total** | **194,061** | **6,405.071 worker-seconds** | | |

The final CPU and GPU partitions overlapped, so summed worker-seconds are not wall-clock duration. CPU batches used up to 128 rows and four threads; GPU batches used up to 128 rows and two threads. Observed GPU use was approximately 552–744 MiB VRAM, below its 2 GiB capacity; this is sampled use, not a formally measured peak. M2M100 processed 2,906 additional senses in **425.553 seconds**, with observed peak RSS **896,794,624 bytes**. The surname retry processed 754 senses in **19.344 seconds**, with peak RSS **145,887,232 bytes**. RAM/RSS observations exclude some shared-library, filesystem cache and GPU allocations.

## Quality evaluation and remaining bottleneck

The committed benchmark contains **380 stratified senses**, including everyday nouns, verbs, modifiers, technical terms, abstract terms, idioms, rare vocabulary and ambiguous senses. It includes 300 cases with licensed cross-source references and 80 difficult assistant drafts. Six actual model configurations were tested on the same panel; 280 paired cases received assistant inspection. This is **not an independently human-validated gold benchmark**. Reference matching and assistant screening do not establish semantic accuracy.

| Configuration, same 380 senses | Seconds | Exact draft-or-licensed-reference matches | Passing final concordance filter |
| --- | ---: | ---: | ---: |
| HPLT CPU int8, beam 4 | 11.500 | 115 | 160 |
| HPLT CPU int8, beam 1 | 8.562 | 125 | 164 |
| M2M100 CPU int8, beam 4 | 47.876 | 133 | 180 |
| HPLT CPU float32, beam 4 | 28.595 | 111 | 157 |
| HPLT legacy CUDA int8, beam 1 | 12.156 | 121 | 160 |
| HPLT legacy CUDA float32, beam 1 | 5.890 | 124 | 163 |

These are observed timings on a busy desktop, and exact-match counts are not accuracy percentages. The unrestricted import pilot failed: HPLT confused spatial “long” with `lama`, produced unrelated outputs for technical vocabulary, and M2M100 rendered “to boil” as `untuk minum`. Both confused fasting with speed. Float32 did not remove these semantic errors. Idioms, short ambiguous glosses, names, abbreviations and Indonesian vocabulary were recurring problems. HPLT was selected for feasible complete-backlog throughput, with restricted M2M100 fallback and conservative import gates; neither was declared generally accurate enough to fill all missing senses.

Every sense retained its exact ID, original English, Mandarin, pinyin, entry context and available POS/reference information. Final neural input was the complete original English sense. Experiments appending reference definitions or quoting prompts did not reliably improve results. Mandarin and WordNet context therefore constrain validation; the English-to-Malay model itself does not understand Mandarin sense alignment. Ambiguous isolated outputs cannot qualify from an English-word lookup alone.

The lexical gate requires a whole model output to agree with licensed Malay lemmas from a unique Mandarin-and-all-English-clauses synset, then applies Unicode, English-copy, locale, repetition, length, number, structural and known semantic-scope exclusions. Normalization is limited and recorded; raw outputs remain in provenance. Model agreement and a sequence score are never treated as independent verification. The policy also excludes known false friends and Indonesian forms. These checks reduce risk but cannot prove every retained provisional meaning is correct.

For surname definitions, a separate **200-case pilot qualified 184** whole outputs, after which all 754 eligible annotations were attempted. Import requires an actual model-produced `nama keluarga` prefix plus the complete unchanged, case-sensitive Roman name. Changed, omitted or generic names and extra claims are withheld. **707** such definitions qualified. The validator never fills a failed output from a hardcoded translation template. These records have `translationKind: definition-translation`; the other 1,028 have `lexical-equivalent`.

All new records await independent Mandarin–Malaysian Malay review. The committed [review sheet](KANJIAN_OFFLINE_MALAY_REVIEW_SHEET.md) lists all 1,735 additions as pending. The committed benchmark and evaluation retain references, actual outputs and review limitations. A separate local 380-case independent-review template leaves reviewer/approval fields blank. Further coverage requires stronger sense-aware translation and/or independent language review; automatically inserting the remaining candidates would compromise dictionary quality.

## Integrity, reversible integration and checkpoints

The authoritative store remains `scripts/data/malay-translations-v1.json`, compiled into the existing lazy `src/data/malay-runtime.json` worker asset. There is no new external production database or schema migration. `translationKind` is the smallest backward-compatible extension, alongside existing model, revision, source, review and alignment fields.

Before translation, **250 nonignored project files** were independently backed up with a per-file checksum manifest and `RESTORE.txt`:

`.tmp/malay-datasets/backups/2026-10-15T13-35-40-331Z/`

The production dictionary and Malay runtime were independently downloaded before release and matched the baseline backup. All **15 pre-existing untracked recovery experiment files** remain unchanged and were excluded from the commit. Git history was preserved.

The deterministic workload identified 193,919 distinct complete contexts and 142 potential duplicate contexts. It never merges meanings by English spelling alone. Hashed inputs, frozen partition manifests, per-sense alignment, runtime/weight/configuration identity, immutable checkpoint shards and per-directory locks support resumption. Input over 384 tokens is rejected rather than silently truncated; output is capped at 192 tokens and limit cases are withheld. Workers adapt batches to available RAM and split failures. Inference runs with offline settings and denied socket connections, with no cloud provider or paid fallback.

All full-workload checkpoints were reconciled before preparing the final import. Import first ran against an isolated copy, using immutable 128-record batch snapshots, protected-existing checks, exact-ID validation and import checkpoints. Paired local promotion used backup files plus a journal and rollback on error. The complete canonical corpus, original Malay store records and original runtime records were verified; a subsequent real import added zero records.

| SHA-256 integrity target | Verified value |
| --- | --- |
| Original and final canonical dictionary | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| Original Malay store | `f0343588c8f1e184ab8db32ca35e4942cd9062361dc198a020d64d11194ee275` |
| Final Malay store | `1488da9482d4c34734edb945f188b7e29ee2d2460f3585aebdb78332d3e5d100` |
| Final local and live Malay runtime | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |

The canonical gzip and learning assets also match the backup. Every one of the 4,184 old store/runtime records retains byte-equivalent serialized content. Every new record has a valid original sense ID and unchanged English, with no duplicate sense records. Final store size is **7,175,139 bytes**; runtime size **5,513,440 bytes**. The compact committed import manifest records counts, model identities, input/source hashes, timings and test totals. Private candidates, quarantine and checkpoints remain under ignored `.tmp/malay-complete/`.

For recovery, verify the backup manifest before copying any file. Stop the dev server and restore both paired Malay files from the backup `project/` directory to their original paths; do not reset unrelated Git changes. The completed local promotion journal is `.tmp/malay-complete/promotion-journal.json`. The previous working production deployment is `dpl_GKULfsUrqz7T1xuiAYfyPfc9N5Cc` at commit `70054cde4e46e40952e3d84c99d154034cb96fd8` and remains the rollback reference. No rollback was needed.

The full run is complete. To verify/resume either recorded final partition without redoing its completed work, retain the frozen manifests and run:

```powershell
.\.tmp\malay-model-env\Scripts\python.exe scripts/malay/offline-bulk.py --input .tmp/malay-complete/tasks-cpu-final.jsonl --output .tmp/malay-complete/full-cpu-final --threads 4 --batch-size 128 --beam-size 1
.\.tmp\malay-cuda11-env\Scripts\python.exe scripts/malay/offline-bulk.py --device cuda --precision float32 --input .tmp/malay-complete/tasks-gpu-final.jsonl --output .tmp/malay-complete/full-gpu-final --threads 2 --batch-size 128 --beam-size 1
```

The frozen earlier partitions and `bulk-plan.json` must remain intact. Completed checkpoints, model caches and identity checks prevent repeated downloads or inference. Reconciliation and isolated re-import use `node scripts/malay/offline-prepare.mjs` followed by `node scripts/malay/offline-integrate.mjs`. Local promotion is a separate explicit `--promote-local` operation described in `scripts/malay/README.md`.

## Application changes and validation

The existing architecture, search worker, accepted/stored translations, saved words, galleries, quizzes, pronunciation and offline storage remain operational. New lexical records display **“Machine-translated equivalent · awaiting language review”**. New definitions display **“Machine-translated English definition · awaiting language review”**. Existing translation display remains compatible.

The official **Translate with Google** link remains an optional user action for missing meanings. A real production click opened the official site with the selected English meaning, source `en` and target `ms` and returned HTTP 200. No automatic Google translation request occurs, and no translation result is scraped, read or persisted. The live missing-sense record remained unchanged after navigation.

| Validation | Result |
| --- | --- |
| Production build, TypeScript and existing server packaging checks | PASS |
| Unit/integration tests | **830 passed**, 28 files, 84.75 seconds |
| Full actual Edge browser suite | **84 passed**, zero failed/skipped/flaky, 7.7 minutes |
| New focused model-label/search browser test | PASS |
| Full-corpus preservation, valid IDs, old-record protection, idempotent import | PASS |
| Source/whitespace and lazy-bundle checks | PASS |
| Translation cost guard: no SDK/API endpoint/model payload in production | PASS |
| Lazy dictionary loading and existing offline feature checks | PASS |
| Stored new lexical and definition meanings plus labels available offline | PASS |
| Saved-word/data-cache migration checks | PASS |
| Live new-translation search and exact deployed data comparison | PASS |
| Live existing Malay meanings, galleries and ambiguous bank senses | PASS |
| Live official Google website fallback | PASS |

A Windows Vite watcher encountered `EBUSY` while temporary isolated import files changed. The dev watcher now ignores `.tmp`; the import test and complete browser suite passed with the fixed dev server running. An earlier test run while inference occupied the desktop timed out one full-corpus test; after inference finished, all 830 tests passed without weakening its timeout.

Actual local full-text index construction took **5,014 ms**, with **292,260,896 bytes retained heap**, approximately 2.23 MiB above the earlier baseline. Median warm index query times were 0.090 ms for `猫`, 0.640 ms for `chang jing lu`, 0.123 ms for `dog`, 0.347 ms for `anjing`, and 0.382 ms for `membantu`. These measure the local search index, not network or complete page latency. A clean local browser's first full lookup took 4,938 ms; the home page fetched neither the full dictionary nor Malay runtime before needed.

The main startup JavaScript is **321,652 bytes** (95,965 gzip), the worker **56,062 bytes**, and the lazy Malay runtime **503,024 bytes gzip**. Models are absent from Git, deployment inputs and application bundles. No translation inference runs on Vercel or in a student's browser.

## GitHub and production verification

- Repository: [pekchunhoe/mandarin-visual-dictionary](https://github.com/pekchunhoe/mandarin-visual-dictionary).
- Baseline: `70054cde4e46e40952e3d84c99d154034cb96fd8`.
- Validated application/data commit: **[`b309397b4dbbc849d2ba880b1e3ffa9acc9fa49f`](https://github.com/pekchunhoe/mandarin-visual-dictionary/commit/b309397b4dbbc849d2ba880b1e3ffa9acc9fa49f)**.
- Push: successful to existing `main`; remote SHA independently matched. No force push or replacement repository.
- Git-triggered production deployment: **`dpl_GeENonvcoPP51SyADZtD8C4A2ncr`**, **READY**, correct source SHA and existing domain alias.
- Existing project: `prj_45bxtqgs7w3rV211KuVvoWmmxJkU`, scope `pek-explains-physics`, **Hobby** plan.
- Live application: [KANJIAN](https://mandarin-visual-dictionary.vercel.app).

This report records the verified application/data commit; the report itself is committed separately as documentation. The established Git-triggered workflow was used. No new Vercel project, storage service, translation function, plan change, environment change or paid resource was introduced. The largest committed data file is approximately 7.18 MB, and models/caches/backups are excluded. Existing Hobby deployment compatibility was checked against the project configuration and [Vercel limits](https://vercel.com/docs/limits); the actual build/deployment succeeded. This does not promise unlimited future hosting traffic.

The new-meaning production browser run finished at **2026-10-15T15:59:37.503Z**. It exercised 13 Mandarin/English/Malay searches and definition display, checked pinyin, reviewed phone 320-pixel and desktop 1440-pixel layouts, and recorded **zero JavaScript errors, zero image API server errors and zero forbidden translation requests**. The home view appeared in 1,324 ms in that run; the first cold full lookup took 7,884 ms. Subsequent queries reused the loaded dictionary.

| Actual live example | Pinyin | English | Stored Malay | New type |
| --- | --- | --- | --- | --- |
| 不动产 | bù dòng chǎn | real estate | hartanah | Lexical equivalent |
| 研究员 | yán jiū yuán | researcher | Penyelidik | Lexical equivalent |
| 肾脏 | shèn zàng | kidney | buah pinggang | Lexical equivalent |
| 碳水化合物 | tàn shuǐ huà hé wù | carbohydrate | karbohidrat | Lexical equivalent |
| 丁 | Dīng | surname Ding | Nama keluarga: Ding. | Translated English definition |

Existing `人口普查 / census / banci`, `灯泡 / light bulb / mentol`, `脚踝 / ankle / buku lali`, `研究 / research / penyelidikan`, `银行 / bank / bank`, and `狗 / dog / anjing` passed live regression checks. Financial bank and riverbank remain separate; missing meanings retain the external fallback. Existing gallery requests returned HTTP 200 and no failed requests were recorded in that regression run.

At **2026-10-15T16:00:16.304Z**, all five independently fetched live assets matched the validated local build by SHA-256: main JavaScript, lazy detail JavaScript, dictionary worker, Malay runtime, and complete canonical dictionary. The public model notice also matched local source. Screenshots and detailed browser/network evidence are retained locally in `.tmp/malay-complete/live/`, `.tmp/malay-datasets/production-after/` and `.tmp/zero-cost/`.

## Evidence and limits

Reproducible committed evidence includes `scripts/data/malay-offline-import-manifest.json`, `malay-offline-benchmark.json`, `malay-offline-evaluation.json`, the review policy, full licenses, import/quality tests and the pending review sheet. Local evidence includes `baseline.json`, `hardware.json`, `bulk-plan.json`, every worker checkpoint, `preparation.json`, `quarantine.jsonl`, isolated import snapshots, `integration-first.json`, the zero-addition repeat `integration.json`, `preservation.json`, test logs/results, `performance.json`, and production asset hashes under `.tmp/malay-complete/`.

**The remaining limitation is semantic quality and independent review, not an API quota.** Both usable local models produced substantial errors on difficult dictionary senses. All feasible full-backlog inference, conservative integration, testing, Git synchronization and production verification were completed. Automatic inline coverage remains approximately 3%; no paid service was used to increase it, and the remaining 192,326 senses were not filled with unqualified text.
