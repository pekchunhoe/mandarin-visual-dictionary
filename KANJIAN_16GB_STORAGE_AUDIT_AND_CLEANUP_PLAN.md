# KANJIAN: 16 GB storage audit and cleanup plan

Audit date: 2 November 2026 at 21:01 (Asia/Kuala_Lumpur).

Project root: `D:\Primary school simulation\mandarin-visual-dictionary`.

Status: AUDIT COMPLETE; CLEANUP NOT APPROVED OR EXECUTED. This report is the only agent-authored new project file; automatic host Git bookkeeping is detailed in section 19. No source/data edits, deletions, moves, renames, cache clears, installs, model downloads, commits, pushes, deployments, paid Gemini requests or bulk translations were performed.

## 1. Executive summary

The measured project contains 17,284,600,123 bytes: 17.284600 GB (16.097538 GiB). Windows reports 17,371,889,664 bytes of allocated file storage. The approximate 16 GB originally observed corresponds to the binary GiB figure, rather than an unexplained extra dataset.

Recommend Scenario B: remove only the 409 exact targets in the manifest whose first scenario is A or B. This releases 16,034,617,284 logical bytes (16.034617 GB) and approximately 16,104,098,304 allocated bytes (16.104098 GB), leaving 1,249,982,839 logical bytes (1.249983 GB; 1.164137 GiB), plus this report. This is a 92.768% practical reduction, while keeping the installed Node dependencies.

All 14,761 currently published Malay meanings, the 198,245 Chinese–English senses, 82 Malay lexical supplements, and 55 original starter Malay meanings are protected. Historical generated/unreviewed status is not permission to discard a meaning already present in the app. Unique provisional alternatives outside the live store remain for review; duplicate copies can be removed only when their retained witness is listed.

The public deployed homepage, CC-CEDICT asset and packed Malay asset were read without invoking application APIs and matched the local bytes. The homepage returned HTTP 200. This does not replace a fresh browser acceptance run after cleanup.

The historical local bulk Malay enrichment project is discontinued by the owner. Its large model resources can be retired. Its build-time packaging code must remain: the current production build invokes it, and an in-memory simulation produced the exact existing store and runtime bytes without generating translations.

## 2. Scope, measurement and filesystem safety

The scan included hidden, ignored, tracked and untracked paths, including .git and both Python environments. It found 48,413 regular file paths and 5,028 directories including the project root, with no enumeration errors. Git had 379 tracked files and no tracked changes or non-ignored untracked files before this report. No AGENTS.md was found in the project or checked ancestor directories.

Sizes are measured file contents, not estimates from historical reports. GB = 1,000,000,000 bytes; GiB = 1,073,741,824 bytes. Tables contain exact byte totals. Nested directory tables overlap and must not be added; the scenario manifest has no ancestor/descendant overlaps. Measurements precede this report, whose small size is extra and retained in every scenario.

Windows filesystem allocation was read through Node filesystem stat.blocks × 512, using bigint device/file identities to deduplicate file streams. Resident NTFS files can report zero allocated data bytes. The total excludes directory indexes, MFT/security records, alternate data streams, filesystem journal/volume overhead, recycle-bin behavior and storage snapshots. Consequently allocated savings are the best measured file-storage estimate, not a promise of the exact subsequent free-space delta.

No hard links were observed: all 48,413 file identities were distinct and each reported one link. A single junction/symlink was skipped rather than traversed: `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\vercel-no-git-cqqlvjlj\node_modules` points to `D:\Primary school simulation\mandarin-visual-dictionary\node_modules`. Its target was counted once at the project root. The junction itself contributes no file-content savings. Do not follow it during cleanup.

Standard user caches outside the project were measured separately at specific known paths. No unrelated directory tree was traversed through a project link. Arbitrary custom cache locations were not exhaustively searched.

### Non-overlapping top-level breakdown

| Path | Files | Logical bytes | Allocated bytes |
| --- | --- | --- | --- |
| `.tmp` | 38,733 | 17,019,225,137 | 17,094,128,128 |
| `node_modules` | 9,069 | 149,222,868 | 160,497,664 |
| `scripts` | 146 | 31,361,007 | 31,635,456 |
| `.git` | 163 | 21,915,362 | 22,168,064 |
| `src` | 61 | 20,626,700 | 20,744,192 |
| `dist` | 55 | 19,226,708 | 19,350,016 |
| `public` | 44 | 13,846,670 | 13,942,784 |
| `server` | 15 | 1,854,136 | 1,875,968 |
| `tests` | 67 | 432,341 | 565,760 |
| `docs` | 7 | 366,420 | 380,928 |
| `test-results` | 4 | 132,299 | 135,680 |
| `api` | 2 | 1,566 | 4,608 |
| `.vercel` | 2 | 651 | 512 |
| Root-level files | 45 | 6,388,258 | 6,459,904 |
| TOTAL | 48,413 | 17,284,600,123 | 17,371,889,664 |

### Largest 30 directories, including nested directories

| Rank | Directory under project root | Files | Logical bytes | Allocated bytes |
| --- | --- | --- | --- | --- |
| 1 | `.tmp` | 38,733 | 17,019,225,137 | 17,094,128,128 |
| 2 | `.tmp/malay-recovery` | 184 | 5,226,284,746 | 5,226,455,040 |
| 3 | `.tmp/malay-models` | 51 | 3,930,617,360 | 3,930,689,536 |
| 4 | `.tmp/malay-models/m2m100` | 13 | 2,432,762,830 | 2,432,786,432 |
| 5 | `.tmp/malay-recovery/download-parts` | 107 | 1,675,241,120 | 1,675,243,520 |
| 6 | `.tmp/malay-recovery/download-parts/madlad` | 99 | 1,654,597,280 | 1,654,599,680 |
| 7 | `.tmp/malay-deep` | 232 | 1,592,953,831 | 1,593,361,408 |
| 8 | `.tmp/malay-complete` | 697 | 993,427,019 | 994,700,288 |
| 9 | `.tmp/malay-model-env` | 28,511 | 911,466,694 | 969,181,184 |
| 10 | `.tmp/malay-model-env/Lib` | 28,469 | 907,213,238 | 964,843,520 |
| 11 | `.tmp/malay-model-env/Lib/site-packages` | 28,469 | 907,213,238 | 964,843,520 |
| 12 | `.tmp/malay-cuda11-env` | 3,113 | 792,995,806 | 798,259,712 |
| 13 | `.tmp/malay-cuda11-env/Lib` | 3,095 | 791,243,579 | 796,473,856 |
| 14 | `.tmp/malay-cuda11-env/Lib/site-packages` | 3,095 | 791,243,579 | 796,473,856 |
| 15 | `.tmp/malay-models/hplt-en-ms` | 12 | 708,366,343 | 708,386,816 |
| 16 | `.tmp/malay-deep/recovery-import` | 62 | 700,879,076 | 700,993,536 |
| 17 | `.tmp/malay-deep/recovery-import/isolated` | 55 | 676,163,146 | 676,270,080 |
| 18 | `.tmp/malay-deep/new-import` | 40 | 670,969,831 | 671,076,352 |
| 19 | `.tmp/malay-deep/new-import/isolated` | 33 | 636,842,068 | 636,944,384 |
| 20 | `.tmp/malay-cuda11-env/Lib/site-packages/nvidia` | 17 | 633,480,247 | 633,495,552 |
| 21 | `.tmp/malay-cuda11-env/Lib/site-packages/nvidia/cublas` | 15 | 633,480,036 | 633,495,552 |
| 22 | `.tmp/malay-cuda11-env/Lib/site-packages/nvidia/cublas/bin` | 5 | 633,061,086 | 633,065,472 |
| 23 | `.tmp/malay-lexical-accuracy` | 92 | 610,328,808 | 610,505,728 |
| 24 | `.tmp/malay-model-env/Lib/site-packages/torch` | 14,307 | 525,984,095 | 556,766,720 |
| 25 | `.tmp/malay-models/m2m100/ct2-int8` | 4 | 490,825,930 | 490,831,872 |
| 26 | `.tmp/malay-datasets` | 1,795 | 410,879,407 | 414,230,528 |
| 27 | `.tmp/malay-models/zh-ms` | 13 | 396,005,839 | 396,021,760 |
| 28 | `.tmp/malay-models/en-mul` | 13 | 393,482,348 | 393,494,528 |
| 29 | `.tmp/malay-model-env/Lib/site-packages/torch/lib` | 27 | 374,113,122 | 374,165,504 |
| 30 | `.tmp/malay-models/hplt-en-ms/ct2-float32` | 3 | 313,248,958 | 313,253,888 |

### Largest 50 individual files

| Rank | File under project root | Logical bytes | Allocated bytes |
| --- | --- | --- | --- |
| 1 | `.tmp/malay-models/m2m100/pytorch_model.bin` | 1,935,796,948 | 1,935,798,272 |
| 2 | `.tmp/malay-recovery/madlad-llama-q4k.gguf` | 1,660,781,696 | 1,660,784,640 |
| 3 | `.tmp/malay-recovery/madlad-q4k.gguf` | 1,654,597,280 | 1,654,599,680 |
| 4 | `.tmp/malay-cuda11-env/Lib/site-packages/nvidia/cublas/bin/cublasLt64_11.dll` | 544,070,144 | 544,071,680 |
| 5 | `.tmp/malay-models/m2m100/ct2-int8/model.bin` | 487,900,904 | 487,903,232 |
| 6 | `.tmp/malay-models/hplt-en-ms/ct2-float32/model.bin` | 312,087,617 | 312,090,624 |
| 7 | `.tmp/malay-models/zh-ms/pytorch_model.bin` | 312,087,009 | 312,090,624 |
| 8 | `.tmp/malay-models/en-mul/pytorch_model.bin` | 310,258,677 | 310,259,712 |
| 9 | `.tmp/malay-models/hplt-en-ms/model.npz.best-chrf.npz` | 307,935,566 | 307,937,280 |
| 10 | `.tmp/malay-model-env/Lib/site-packages/torch/lib/torch_cpu.dll` | 305,887,744 | 305,889,280 |
| 11 | `.tmp/malay-recovery/source-tasks.jsonl` | 123,220,267 | 123,224,064 |
| 12 | `.tmp/malay-complete/full-hplt/workload.jsonl` | 119,217,444 | 119,218,176 |
| 13 | `.tmp/malay-complete/tasks.jsonl` | 119,217,444 | 119,218,176 |
| 14 | `.tmp/malay-complete/full-hplt-fast/workload.jsonl` | 107,621,137 | 107,622,400 |
| 15 | `.tmp/malay-complete/tasks-tail.jsonl` | 107,621,137 | 107,622,400 |
| 16 | `.tmp/malay-remaining-senses.jsonl` | 90,486,504 | 90,488,832 |
| 17 | `.tmp/malay-cuda11-env/Lib/site-packages/nvidia/cublas/bin/cublas64_11.dll` | 88,668,160 | 88,670,208 |
| 18 | `.tmp/malay-models/hplt-en-ms/ct2-int8/model.bin` | 82,193,357 | 82,194,432 |
| 19 | `.tmp/malay-complete/quarantine.jsonl` | 80,688,223 | 80,691,200 |
| 20 | `.tmp/malay-models/zh-ms/ct2-int8/model.bin` | 79,567,635 | 79,568,896 |
| 21 | `.tmp/malay-models/en-mul/ct2-int8/model.bin` | 79,104,315 | 79,106,048 |
| 22 | `.tmp/malay-cuda11-env/Lib/site-packages/ctranslate2/ctranslate2.dll` | 61,794,304 | 61,796,352 |
| 23 | `.tmp/malay-deep/classified-withheld.jsonl` | 61,222,457 | 61,222,912 |
| 24 | `.tmp/malay-model-env/Lib/site-packages/ctranslate2/ctranslate2.dll` | 59,297,792 | 59,297,792 |
| 25 | `.tmp/malay-complete/full-gpu-final/workload.jsonl` | 51,757,917 | 51,761,152 |
| 26 | `.tmp/malay-complete/tasks-gpu-final.jsonl` | 51,757,917 | 51,761,152 |
| 27 | `.tmp/malay-lexical-accuracy/run/review-queue.jsonl` | 47,898,384 | 47,898,624 |
| 28 | `.tmp/malay-lexical-accuracy/run-v2/review-queue.jsonl` | 47,898,384 | 47,898,624 |
| 29 | `.tmp/malay-lexical-accuracy/run-v3/review-queue.jsonl` | 47,898,210 | 47,898,624 |
| 30 | `.tmp/malay-lexical-accuracy/run-final/review-queue.jsonl` | 47,897,535 | 47,898,624 |
| 31 | `.tmp/malay-deep/recovery-outcomes.jsonl` | 41,557,837 | 41,558,016 |
| 32 | `.tmp/malay-cuda11-env/Lib/site-packages/numpy.libs/libopenblas64__v0.3.23-293-gc2f4bdbb-gcc_10_3_0-2bde3a66a51006b2b53eb373ff767a3f.dll` | 38,168,576 | 38,170,624 |
| 33 | `.tmp/malay-complete/full-cpu-final/workload.jsonl` | 34,722,935 | 34,725,888 |
| 34 | `.tmp/malay-complete/tasks-cpu-final.jsonl` | 34,722,935 | 34,725,888 |
| 35 | `.tmp/malay-datasets/sources/wiktionary-bahasa.json` | 33,898,835 | 33,902,592 |
| 36 | `.tmp/malay-model-env/Lib/site-packages/torch/lib/torch_cpu.lib` | 29,325,638 | 29,327,360 |
| 37 | `.tmp/malay-deep/recovery-withheld.json` | 28,935,501 | 28,938,240 |
| 38 | `.tmp/malay-recovery/wiktionary-malay.jsonl` | 28,607,738 | 28,610,560 |
| 39 | `.tmp/malay-qualified/full-scan.jsonl` | 27,455,134 | 27,455,488 |
| 40 | `.tmp/malay-offline-import-4pxwz1/isolated/store-37beca40675b-1.json` | 21,382,730 | 21,385,216 |
| 41 | `.tmp/malay-offline-import-4pxwz1/isolated/store.json` | 21,382,730 | 21,385,216 |
| 42 | `.tmp/malay-offline-import-AMBHW8/isolated/store-37beca40675b-1.json` | 21,382,730 | 21,385,216 |
| 43 | `.tmp/malay-offline-import-AMBHW8/isolated/store.json` | 21,382,730 | 21,385,216 |
| 44 | `.tmp/malay-offline-import-dReIrh/isolated/store-37beca40675b-1.json` | 21,382,730 | 21,385,216 |
| 45 | `.tmp/malay-offline-import-dReIrh/isolated/store.json` | 21,382,730 | 21,385,216 |
| 46 | `.tmp/malay-offline-import-duwULH/isolated/store-37beca40675b-1.json` | 21,382,730 | 21,385,216 |
| 47 | `.tmp/malay-offline-import-duwULH/isolated/store.json` | 21,382,730 | 21,385,216 |
| 48 | `.tmp/malay-offline-import-GzOinn/isolated/store-37beca40675b-1.json` | 21,382,730 | 21,385,216 |
| 49 | `.tmp/malay-offline-import-GzOinn/isolated/store.json` | 21,382,730 | 21,385,216 |
| 50 | `.tmp/malay-offline-import-KTKhDO/isolated/store-37beca40675b-1.json` | 21,382,730 | 21,385,216 |

## 3. Why storage grew

| Measured category | Logical bytes | Interpretation |
| --- | --- | --- |
| All .tmp files | 17,019,225,137 | 98.465% of project contents; main source of growth |
| Translation-related .tmp files, including test fixtures | 16,765,106,703 | Subset of .tmp; do not add to it |
| Model weights (.bin/.npz/.gguf) | 7,222,311,004 | Includes original and converted representations |
| Model download fragments | 1,675,241,120 | Kept alongside assembled models |
| Two Python environments | 1,704,462,500 | Local inference only |
| Repeated import/build/generator test directories | 2,127,734,807 | 296 distinct mkdtemp directories |
| Three integrated import-checkpoint trees | 1,570,239,409 | Every staged production-shaped meaning matches a retained current meaning |
| Current source/data directories plus cedict archive | 66,528,724 | src/data + public/data + scripts/data + cedict.txt.gz; includes evaluation data |
| Git repository metadata | 21,915,362 | Small; preserve history |

Confirmed growth mechanisms:

- The MADLAD downloader retains 16 MiB ranges after assembly. All 99 completed ranges total 1,654,597,280 bytes; concatenating them in filename order hashes to `ea6e5531a3e95213c7f0635988d119e078a655c09306e47851e15d4c0c3f9c37`, exactly matching the assembled original model. Converted MADLAD has a different size and is a separate experimental representation, not a byte-identical duplicate.
- Offline import writes a complete store snapshot after each 128 records. The completed/isolated and deep new/recovery trees consume 1.570 GB. Many checkpoints are identical because the additions were already integrated.
- Tests create .tmp/malay-* directories with mkdtemp and do not remove them in their finally/after hooks. The 52 lexical-import fixtures alone occupy 1,112,126,503 bytes; 24 offline-import fixtures occupy 959,493,329 bytes. Fixture-only strings such as makna ujian and synthetic reviewer metadata are not accepted user translations.
- Models coexist in original PyTorch/NPZ form, CTranslate2 int8/float32 form and experimental GGUF form. The pinned downloaders check existing file hashes; repeated re-download into the same validated path was not demonstrated. Storage comes from retained representations and parts.
- Playwright failure traces retain captured resources, including repeated corpus assets. Root test output plus historical browser-result directories occupy 120,135,644 bytes. Old diagnostic logs and screenshots also remain.
- Timestamped whole-project backup snapshots add 281,535,320 bytes; they preserve historical non-ignored/uncommitted source and remain under review.
- The ordinary server packaging verifier also creates an isolated directory under the OS temporary directory. It is outside the measured project; do not infer or add its unmeasured size.

Future changes, requiring separate source-edit authorization: clean each test-owned temporary directory in a guarded finally/after hook; save only necessary checkpoint deltas or bounded snapshots; remove verified range fragments after successful assembly; set artifact retention limits; avoid copying dependency trees; retain fixed build evidence paths; remove or disable obsolete generation aliases while keeping packaging. No script was rewritten during this audit.

## 4. Existing Malay translation preservation baseline

The authoritative maintenance store is `scripts/data/malay-translations-v1.json`. The authoritative readable runtime is `src/data/malay-runtime.json`; it is the exact runtime projection of the maintenance store. The worker loads the lossless packed derivative `src/data/malay-runtime-packed.json`. The original editorial starter translations and Malay examples originate in `src/data/learning-source.ts` and are generated into `src/data/learning-runtime.json`. Preserve both source and generated assets.

The main corpus `public/data/cedict.json` contains original Chinese/pinyin/English rows, rather than embedded Malay meanings. There is no SQLite/database storage in the project inventory. JSONL/CSV/TSV research files exist separately. `scripts/data/malay-glosses.json` and `scripts/data/malay-sense-overrides.json` remain required editorial build inputs. All current tracked files, including translation memory, policy, attribution, review sheets and manually corrected data, are retained.

| Baseline measurement | Current value |
| --- | --- |
| CC-CEDICT rows / stable entry IDs | 125,173 / 125,173 |
| Unique simplified headwords | 121,408 |
| Raw English definitions | 199,713 |
| Classifier-only definitions excluded from sense count | 1,468 |
| Dictionary senses / unique SHA-256 sense keys | 198,245 / 198,245 |
| Senses with published Malay meanings | 14,761 |
| Senses without a Malay meaning | 183,484 |
| Malay coverage | 7.445837% |
| Aligned key + entryId + senseId + exact English checks | 14,761 / 14,761 |
| Stored Malay status labels | 13,052 generated; 1,709 unreviewed; 0 verified |
| Primary Malay meaning kinds | 8,798 definition; 1,779 lexical; 4,184 legacy |
| Additional malayLexical supplements / malayDefinition supplements | 82 / 0 |
| Starter entries / starter senses / starter Malay meanings | 54 / 121 / 55 |
| Starter meanings matching the runtime at the same sense | 55 / 55 |
| Runtime version | ms-MY-v1-49faaa93c203 |
| Runtime projection and packed round trip | Exact equality; all fields retained |

### Required data files and raw SHA-256 baseline

| Exact file | Bytes | SHA-256 |
| --- | --- | --- |
| `D:\Primary school simulation\mandarin-visual-dictionary\cedict.txt.gz` | 3,978,169 | `c01e6d2d7f7545b4a29e08da17e7ec77a1b1fd1531009269e74e42f391fb2c1d` |
| `D:\Primary school simulation\mandarin-visual-dictionary\public\data\cedict.json` | 10,883,962 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\data\cedict-core.json` | 9,612 | `cde4a2da8ec02a43fc6e6efa4612dcfecc84cbd61950fe6274d7d1b9e15bdafe` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\data\learning-source.ts` | 13,927 | `57055055cfabdd124a98c54e492b66e776d6c8a7de6085ce88717b81d02f3be6` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\data\learning-runtime.json` | 54,085 | `2bf7646d28f13d32616c2515dfc237f9045b3ac3f9198a9b29e206543d9136db` |
| `D:\Primary school simulation\mandarin-visual-dictionary\scripts\data\malay-translations-v1.json` | 21,382,097 | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\data\malay-runtime.json` | 15,445,028 | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\data\malay-runtime-packed.json` | 4,102,517 | `4c350c9fe9403eb6df144f433dbd6bdac8dcf9b62c9ccd403589730641799da5` |
| `D:\Primary school simulation\mandarin-visual-dictionary\scripts\data\malay-glosses.json` | 6,328 | `31b06e7bdb316f8926e94dcb6d88e155cae94bfdfd842767ced4043c29821e33` |
| `D:\Primary school simulation\mandarin-visual-dictionary\scripts\data\malay-sense-overrides.json` | 3,051 | `0620b3d034e2379b8d12b93783721e1884c759141bd3a93a59c5d260f6b98abf` |

### Stable sense and record identity

Entry ID is simplified + | + traditional + | + numeric pinyin. For each row, filter out definitions beginning CL:, then assign zero-based sense IDs sense-0, sense-1, etc. The sense key is SHA-256 of UTF-8 JSON.stringify([entryId, index, rawEnglish]). English display text only strips inline classifier annotations and trims whitespace. Never reorder definitions or attach a meaning using a headword alone.

| Semantic integrity fingerprint | SHA-256 |
| --- | --- |
| Entire sorted sense identity/mapping | `a506792e22fe4a1d9e456edfadf5baefae6d3c9c48e184d7f5d2085740a1c87f` |
| Entire sorted maintenance records, including all metadata | `ec62bf1cece64adfb2b039a702b320f4d46500c95e8c403ce879c3371273d0f5` |
| Entire sorted runtime records, including all metadata | `771c8bcf63fb6db1c4fd998a35d34f1d857141c66e9e925bb986e0dcfd4f4583` |
| All 379 tracked path/content-hash pairs | `30dda8fdb8feac94e311e02392b219e2001dc4c41fc7474ceeed032f5625aa3e` |

For record/mapping fingerprints, sort records by their hexadecimal key, recursively serialize object keys in sorted order with compact JSON and arrays in original order, append one newline after each record, then hash UTF-8 bytes. For the tracked-tree fingerprint, sort git ls-files paths in ordinal order, and concatenate path + NUL + lowercase file SHA-256 + newline. Hash that UTF-8 stream. The tracked-tree aggregate protects every existing tracked source/data/configuration file without printing credentials.

The missing-translation UI remains unchanged: MalayMeaning displays Makna ini belum diterjemahkan.; MissingMalayTranslation offers a user-initiated Google Translate link whose result is not saved. English definitions remain available under the existing display controls. applyMalayRecords binds entry ID, sense ID and exact English, and preserves existing editorial meanings. There is no automatic bulk fill for missing senses.

## 5. Historical and staging translation investigation

Scanned 2,706 project-local historical JSON/JSONL files outside installed packages and npm cache. Of these, 2,666 parsed after handling 27 UTF-16 deployment-metadata files. The remaining 40 malformed containers/lines are deliberately broken bulk-dataset test fixtures verified against tests/malay-bulk-dataset.test.ts, rather than unexplained production data corruption. CSV/TSV artifacts were inventoried; the tiny synthetic fixtures and their creation sites were inspected. No database files were found.

A broad nested scan searched Malay, supplemental, candidateMalay and verifiedMalay fields and acceptance markers. A separate semantic scan covered 498 store/runtime/candidate/translation JSON files and checked production-shaped records against current key, entryId, senseId, English, Malay and supplemental texts. No unique out-of-app record explicitly marked verified, human-verified or accepted was found. This finding is bounded by those schemas and cannot certify the approval history of arbitrary prose or every provisional candidate. Existing published generated/unreviewed records are all preserved regardless of status.

The following unique payloads require review and are excluded from deletion; byte-identical extra copies have a retained witness in the duplicate manifest. Counts are per file, not additive across copies.

| Retained exact path | Bytes | Unique compared production-shaped records | Finding |
| --- | --- | --- | --- |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\additional-existing-candidates.json` | 1,009,054 | 206 | 206 unreviewed alternatives among 697 candidates |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical\candidates.json` | 6,836,009 | 4,647 | 4,647 generated alternatives among 5,597 candidates |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\candidates.json` | 928,261 | 1 | One older lexical supplement differs from current corrected value |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\staged-runtime.json` | 15,445,036 | 1 | One older lexical supplement differs from current corrected value |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\staged-store.json` | 21,382,270 | 1 | One older lexical supplement differs from current corrected value |

Example: sense key `c1ee01d801517c4ea6ccec8e783d12d35138e8e2a5a348e78af486def73d086a` maps to 鞋|鞵|xie2, sense-0, variant of 鞋[xie2]. The older run/run-v2 staging has lexical supplement kasut; sepatu; current accepted data retains kasut. The main explanation Varian bagi 鞋[xie2]. is unchanged. Preserve the current correction and retain one historical alternate copy for review; do not import the old supplement.

All production-shaped meanings in .tmp/malay-complete/isolated, .tmp/malay-deep/recovery-import and .tmp/malay-deep/new-import match retained current meanings and sense mappings. These three obsolete import trees contain 31 + 62 + 40 JSON files; checkpoint/preparation metadata has no independent accepted translation. Their complete directory removal is covered by Scenario B.

Keep all six historical project backup directories at .tmp/malay-datasets/backups, totaling 281,535,320 bytes. Their stored Malay meanings match current retained meanings, but the backups include historical source/uncommitted work; this audit did not prove every old source file recoverable from Git. Their retention is for unresolved unique historical source, not to resume translation.

Raw withheld/quarantine outputs, review ledgers and source-only bilingual dictionaries are not promoted into the dictionary. The unclassified remainder stays under review. No translations were imported, modified or newly generated.

## 6. Required packaging versus retired bulk generation

Current production build:

`build-learning-data → pipeline.mjs build → build-malay-transport → tsc -b → build-image-function → build-teacher-function → verify-server-package → vite build → verify-translation-cost → verify-teacher-package`

The build command selects buildMalay, not generate(). It reads the accepted maintenance store and existing editorial glosses, validates current senses, then emits the readable runtime and packed derivative. Its reference-definition grammar is also used by quality validation. Preserve `scripts/malay/pipeline.mjs`, `scripts/malay/corpus.mjs`, `scripts/malay/quality.mjs`, `scripts/malay/io.mjs`, `scripts/malay/reference-definition.mjs`, `scripts/build-malay-transport.mjs`, `scripts/build-learning-data.mjs`, their src/lib helpers, learning source, accepted store and editorial data.

An independent read-only native Node 24 simulation executed the existing editorialCandidates and quality validation in memory. All 14,761 accepted records survived, with zero rejected/stale records. Simulated JSON plus final newline matched both current maintenance-store and runtime SHA-256 byte for byte. It did not invoke buildMalay or write any output. The source archive also reconstructed exactly the current Chinese/pinyin/English corpus.

Retired generation resources include the downloaded Helsinki OPUS zh-ms/en-mul, Meta M2M100, HPLT and MADLAD weights; their CTranslate2 conversions, tokenizer downloads, llama.cpp runtime/archive, fragments and two Python environments. Neither src/server/api runtime code nor current dev/build commands reference these models or environments. Only explicit historical maintenance scripts reference them. The downloaded resources contain model/tokenizer data, not authoritative accepted dictionary records.

The obsolete command entry points malay:queue, malay:generate, malay:import, malay:datasets:prepare/test-import/import and malay:lexical:prepare/integrate remain in package.json because this is an audit. Do not run them. A separately approved source change can disable these entry points and document retirement. Keep malay:build packaging and its build dependencies intact. Do not delete scripts/malay wholesale: current automated tests also import bulk-dataset, offline-quality, offline-integrate, lexical-enrichment, deep-quality and dataset-reader modules. Removing those tracked modules would require a deliberate test/script change with no material storage benefit.

Gemini AI Teacher is separate: server/ai-teacher.ts sends click-initiated requests through native fetch, and teacher-rate-limit.ts uses @vercel/firewall. It requires no local Python, Hugging Face, CTranslate2 or model weights. Preserve both API wrappers, generated server service bundles, instructions/prompts, schema, credential boundary, rate limiting, client buttons and Copy Prompt/clipboard code.

Operational retirement is the owner decision recorded here; no generator code has been disabled or deleted during the audit. Losing the ability to resume old translation jobs after approved resource deletion is intentional.

## 7. Historical builds and unique files

Only two actual application dist trees were found outside dependency packages: current dist (19,226,708 bytes) and .tmp/vercel-no-git-cqqlvjlj/dist (19,218,875 bytes), totaling 38,445,583 bytes. No project build, .next, out, coverage or playwright-report output directory was present. Dependency package dist directories are installed package contents, not old application builds. .vercel holds only 651 bytes of project-link metadata/readme, not a large deployment archive. Preserve it.

Current dist is generated from retained source/public assets. Corpus and packed Malay copies match source hashes, so removing this local output cannot delete the source data or the already hosted deployment. The old no-Git staging copy contains 394 files; 381 match a current path exactly. Thirteen differ: generated build graphs/bundles/buildinfo and four old source/test files. All four old source blobs are reachable in existing Git history, using git hash-object and git rev-list --objects --all:

| Historical relative path in no-Git copy | Reachable Git blob |
| --- | --- |
| src/components/AITeacher.tsx | `31636cb669a60fae7173f1b040b0beffc6f2d164` |
| src/pages/WordDetail.tsx | `2a207dca0b2864e01fff20383c6314553bf50f49` |
| src/styles.css | `804f9b97e872b7bb1a72ba9c43c629f251f9a8f2` |
| tests/ai-teacher-client.test.tsx | `fa8436b48a5f36e938d0169c1bd7f6d21c1fef4a` |

No unique source or Malay payload was found in that staging build. Its whole 88,221,391-byte file tree is an approved-cleanup candidate, conditional on safely removing the exact node_modules junction itself without following its target. Keep .git, including the historical blobs.

Build classification: current source/data/configuration and project link are A (required); current dist/buildinfo and cached build graphs are B (reproducible); committed reports/screenshots and unresolved historical source backups are C (history worth preserving/review); the verified historical no-Git build and stale test-result outputs are D (obsolete). These build letters are separate from the four cleanup groups below.

## 8. Confirmed duplicates and recoverable storage accounting

The size-prefiltered SHA-256 pass examined 1,031 files in repeated-size groups of at least 65,536 bytes. It confirmed 138 identical-content groups with 612 redundant copies: 3,713,209,459 logical bytes and 3,714,613,248 allocated bytes beyond one copy per group. This is a verified lower bound, not a claim that every smaller file was compared. Names alone were never used as proof. Identical bytes do not make a current source or licensed runtime asset disposable.

| Representative duplicate group | Bytes per file | Copies observed | SHA-256 |
| --- | --- | --- | --- |
| `scripts/data/malay-translations-v1.json` | 21,382,097 | 57 | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `.tmp/malay-datasets/backups/2026-10-15T23-57-45-678Z/project/scripts/data/malay-translations-v1.json` | 20,828,295 | 24 | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `.tmp/malay-offline-import-4pxwz1/isolated/store-37beca40675b-1.json` | 21,382,730 | 13 | `dda32f9331bab109e2d7cab2a370aff2bd16e7fe7aca74aaec5474451ae9ccb3` |
| `.tmp/malay-offline-import-4pxwz1/isolated/store.json` | 21,382,730 | 13 | `45e7a42e559a13131e29df0e85f7a17e81c32b321feb2a9ab0921bed07d351a7` |
| `.tmp/malay-offline-import-4pxwz1/isolated/runtime.json` | 15,445,496 | 13 | `6a3b150ab8d74f2a81aaef3f5e08767cae1bb7022b8c273d0d8cbd5bfc13e11e` |
| `dist/data/cedict.json` | 10,883,962 | 17 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `.tmp/malay-datasets/backups/2026-10-15T23-57-45-678Z/project/src/data/malay-runtime.json` | 15,132,761 | 10 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-complete/full-hplt/workload.jsonl` | 119,217,444 | 2 | `d8dbb3366b2ec59f41c2f157c48a75b70a070e9680e06937514506b48046d81f` |
| `.tmp/malay-complete/isolated/store-bc500b6484e1-1024.json` | 7,175,139 | 17 | `1488da9482d4c34734edb945f188b7e29ee2d2460f3585aebdb78332d3e5d100` |
| `.tmp/malay-complete/full-hplt-fast/workload.jsonl` | 107,621,137 | 2 | `67236939ac4750bf03b529853a771877fe86c8f519bb6f66af57c281631f0b0f` |
| `src/data/malay-runtime.json` | 15,445,028 | 5 | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |
| `.tmp/malay-complete/full-gpu-final/workload.jsonl` | 51,757,917 | 2 | `f80290073505d66f16b378b510c095feac61de2147072698a632c0a6d7f025a9` |

Large current store copies occur 57 times. Other groups include old integrated stores, synthetic-test stores/runtime assets, corpus copies in traces and backups, and paired source/workload queues. The two synthetic stores with 21,382,730-byte sizes have different SHA-256 values despite equal sizes, so they were kept in separate groups.

Do not add the 3.713 GB duplicate total to model, checkpoint or fixture totals. Most duplicates already belong to a selected directory. After those directory targets and source queues are covered, the manifest adds only 61 individual duplicate file targets, totaling 554,737,657 logical bytes. Each has a retained exact-byte witness outside every proposed removal target, including Scenario C. The six historical backups are excluded from this selective deduplication so their restore manifests remain intact.

The 99 model range fragments are an additional assembly duplication, proven by streaming concatenation rather than equal-size file grouping. The fragment directory and assembled models are separate actual streams, so deleting both after retirement frees both allocations.

## 9. Dependencies, project caches and shared caches

| Item | Logical bytes | Allocated bytes | Role / recommendation |
| --- | --- | --- | --- |
| node_modules | 149,222,868 | 160,497,664 | Required local development/build/test install; retain in B; reinstall from lock before reuse if choosing C |
| node_modules/.vite (included above) | 6,633,674 | 6,660,096 | Reproducible current development cache; included in C parent only |
| .tmp/npm-cache | 4,076,973 | 4,132,864 | Project-local npm cache; included in B |
| scripts/malay/__pycache__ | 57,496 | 69,632 | Six compiled Python modules for retired maintenance; included in B |
| .tmp/malay-model-env | 911,466,694 | 969,181,184 | Private CPU translation environment; included in B |
| .tmp/malay-cuda11-env | 792,995,806 | 798,259,712 | Private CUDA 11 translation environment; included in B |
| tsconfig.tsbuildinfo | 4,408 | 8,192 | Reproducible compiler state; included in A |

All 19 installed direct dependencies match their exact versions in package-lock.json. Production packages are React, React DOM, lucide-react, DM Sans and @vercel/firewall. Build/development packages include Vite, esbuild, TypeScript and Babel through the Vite plugin. Test packages include Vitest, jsdom, Testing Library, Playwright and axe. No package.json dependency is exclusive to local bulk Malay model inference; indiscriminate npm uninstall would damage development/testing or current features.

The Python environments are not shared global installs: both pyvenv.cfg files identify their exact .tmp locations and Python 3.12.7 base. The CPU environment includes torch 2.14.1+cpu, transformers 4.57.6, ctranslate2 4.8.3, accelerate, sentencepiece and GGUF helpers. The CUDA environment includes ctranslate2 3.24.0, numpy 1.26.4 and nvidia-cublas-cu11 11.11.3.6. The large cublasLt64_11.dll is 544,070,144 bytes. These local environments can be removed as units after approval; preserve the unrelated base Python installation and system GPU drivers.

### Outside-project caches: measured, excluded from all savings

| Exact shared location | Logical bytes | Allocated bytes | Decision |
| --- | --- | --- | --- |
| `C:/Users/User/AppData/Local/pip/Cache` | 859,731,020 | 862,089,216 | Shared ownership/use unresolved; no deletion recommendation |
| `C:/Users/User/AppData/Local/npm-cache` | 2,061,869,293 | 2,083,319,296 | Shared ownership/use unresolved; no deletion recommendation |
| `C:/Users/User/AppData/Local/ms-playwright` | 2,033,529,241 | 2,034,932,736 | Shared ownership/use unresolved; no deletion recommendation |

The standard Hugging Face and torch cache locations checked were absent; no hidden global model cache was found at those specific paths. The models here are direct .tmp downloads. Standard .npm, roaming npm-cache, pnpm store, Yarn cache and uv cache paths checked were also absent. No evidence establishes that every pip/npm/browser-cache byte belongs to this project. Playwright cache contains two Chromium/headless generations, ffmpeg, Firefox and WebKit; default Windows tests use installed Edge, while WebKit-specific verification uses downloaded browsers. Keep these shared caches outside the cleanup manifest. Do not run global cache clearing or uninstall browser binaries belonging to other projects.

## 10. GitHub, Vercel, credentials and online safety

Branch: main. HEAD: `38b875aa817d23ea5106c1e2d46a1fd7c316bd03` (Fix iPad portrait responsive dictionary layout; 26 October 2026, 16:21:58 +08:00). Existing reachable history has 29 commits. Origin is [pekchunhoe/mandarin-visual-dictionary](https://github.com/pekchunhoe/mandarin-visual-dictionary). Initial working tree was clean; the only intended final non-ignored change is this report. No push authentication or deployment mutation was attempted.

.git uses 21,915,362 logical bytes; its objects directory uses 21,833,112 bytes. git count-objects reports 126 loose objects (1,629 KiB) and 1,044 packed objects across 2 packs (19,657 KiB), no garbage and no prune-packable objects. There is no storage reason to rewrite history, prune objects, delete .git or run git clean. Preserve all repository metadata and historical source blobs.

.gitignore excludes .tmp, node_modules, dist, .vercel, private env files, tsbuildinfo, coverage, test-results, playwright-report and Python bytecode. .vercelignore explicitly excludes .tmp, .git, node_modules, private environment files and test artifacts, and excludes several legacy recovery experiments. These ignored paths are local-only candidates; deleting them creates no tracked-file deletion in a later commit. Every tracked source/data/config file is retained.

vercel.json sets npm run build and dist output, and explicitly packages public/data/cedict.json for both api/images.js and api/teacher.js. Vite builds the offline shell/service-worker asset list, lazy worker, visual lexicon and packed Malay transport. The existing server/image-service.mjs and server/teacher-service.mjs are tracked generated native bundles imported by API wrappers; keep them, their generators and source inputs. Dist itself is reproducible. Build graphs under .tmp are regenerated by Vite and used by packaging/bundle checks; the current root browser/worker graphs are retained so existing read-only checks still work before a fresh build.

Node engine requirement is 24.x. Future builds require npm dependencies, but do not require Python, CTranslate2, model weights, translation checkpoints, source-only enrichment queues or any .tmp historical backup. No current src/server/api code references those retired .tmp paths. Vite explicitly ignores .tmp in its watcher. Native package checks passed without relying on the model environments.

Credential requirements, names only: GEMINI_API_KEY for AI Teacher; PIXABAY_API_KEY, PEXELS_API_KEY and optional OPENVERSE_CLIENT_ID/OPENVERSE_CLIENT_SECRET for image providers. VERCEL, NODE_ENV and trusted request metadata control production rate-limit behavior; preserve the existing kanjian-ai-teacher firewall policy. .env.local currently has GEMINI_API_KEY and a Vercel token variable; values were suppressed. .env.example has empty placeholders. Local credential presence does not prove remote provider configuration. Keep .env.local and .vercel/project.json; do not copy credentials into a public backup, report, bundle or commit.

### Read-only deployed asset evidence

| Public resource | HTTP / bytes | SHA-256 / comparison |
| --- | --- | --- |
| [Homepage](https://mandarin-visual-dictionary.vercel.app/) | 200 / 703 | f4ae48c64d1fe893bf933ccec1b30b9e90133117dcd9a3565dc3c278dfffb066; exactly matches local dist/index.html |
| [Current CC-CEDICT](https://mandarin-visual-dictionary.vercel.app/data/cedict.json) | 200 / 10,883,962 | 29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a; matches local source |
| [Current packed Malay](https://mandarin-visual-dictionary.vercel.app/assets/malay-runtime-packed-DXRu-Ca5.json) | 200 / 4,102,517 | 4c350c9fe9403eb6df144f433dbd6bdac8dcf9b62c9ccd403589730641799da5; matches local source |

The service worker advertises those runtime data assets plus visual-lexicon-BbIQzTYa.json; the deployed homepage references index-C3YbJZml.js and index-C9m0sDuP.css. A byte comparison corrected an initial decoded-string discrepancy: the deployed and local HTML bytes are identical. No online teacher or image API was invoked. Local-only removal cannot retract an already deployed Vercel artifact, and the retained source/lock/config/data form the rebuild inputs. A fresh production build is deferred because it writes generated files, not because a model dependency was found.

## 11. Four cleanup groups

### Group A — safe to remove after approval

Exact targets classified A in the manifest: old application dist, test-owned fixtures, browser-result outputs, buildinfo, verified no-Git staging copy, project-local npm cache and exact duplicate files with retained witnesses. The no-Git copy needs the junction procedure. Optional Scenario C adds the reproducible node_modules install, conditional on later reinstallation. Some fixture/duplicate files contain copies of Malay meanings; their real contents remain in protected current data or a named retained witness.

### Group B — retired Malay translation infrastructure

Exact targets classified B: model/tokenizer/runtime downloads and fragments; both private Python environments; six Python bytecode cache files; the three semantically verified integrated import trees; and 23 source-only task/queue files. Their deletion intentionally ends historical job resumability. No accepted meaning has its only surviving copy in these targets. Experimental scripts and npm generation aliases are retired in intent but remain tracked because build/tests share modules; changing them is a separate approved source-edit task.

### Group C — must preserve

All 379 currently tracked files, .git, private credentials, Vercel project linkage and current configuration. In particular preserve the complete Mandarin–English corpus/archive and learning material, accepted Malay store/runtime/packed assets, glosses/overrides, sense/index helpers, attribution and license files, all source/public photos and visual assets, Gemini Teacher prompts/rate limits/API/client, Copy Prompt code, Pixabay/Openverse adapters, offline service worker/cache migration, responsive styles, tests, Node manifest/lock and both native service bundles. Required installed dependencies stay in recommended B. Rebuilding indexes from unchanged sense data is permissible only during later validation.

### Group D — unknown or requires review; excluded from savings

Unique provisional staging alternatives and historical source backups, shared user caches, and remaining research/withheld/quarantine/evaluation files whose full acceptance history cannot be established. Keep at least one copy of each unique payload; exact duplicate alternate copies may appear in the manifest only with a retained witness. Do not infer deletion approval from missing verified status.

After B, about 1.004 GB remains under .tmp. The largest retained portions are listed below; these are remaining bytes within each parent after the selected child removals, not permission to delete the whole parent.

| Parent path retained in part | Remaining logical bytes | Reason to retain/review |
| --- | --- | --- |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets` | 360,231,782 | Includes intact historical source backups and unique candidates |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy` | 192,190,898 | Unique earlier supplement, alternatives and review evidence |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep` | 174,341,669 | Research/source/quarantine/evaluation history; review required |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete` | 143,377,953 | Research/source/quarantine/evaluation history; review required |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-qualified` | 43,293,883 | Research/source/quarantine/evaluation history; review required |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery` | 30,663,346 | Research/source/quarantine/evaluation history; review required |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical` | 19,021,609 | Research/source/quarantine/evaluation history; review required |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ultra-fast` | 6,840,511 | Historical diagnostic evidence; not required by runtime |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-responsive` | 4,534,246 | Historical diagnostic evidence; not required by runtime |

No translation process was stopped. Basic process enumeration showed Node processes but no Python/Pythonw, Ollama or llama server/CLI process at inspection time. WMI command-line access was denied, so the running Node commands could not be attributed with confidence. Before any later removal, confirm no project translation/test/build job is using the selected paths; do not stop unrelated processes.

## 12. Three cleanup scenarios

All scenarios protect the 14,761 published Malay senses, 82 supplements, original starter data, deployed site and future source-based deployment. Scope is cumulative; the first-scenario column controls membership. No shared user cache is included.

| Measurement | A — conservative | B — recommended | C — maximum reproducible |
| --- | --- | --- | --- |
| Current logical GB | 17.284600 | 17.284600 | 17.284600 |
| Reclaimable logical bytes | 2,355,322,958 | 16,034,617,284 | 16,183,840,152 |
| Reclaimable logical GB | 2.355323 | 16.034617 | 16.183840 |
| Expected remaining logical GB | 14.929277 | 1.249983 | 1.100760 |
| Reclaimable allocated GB | 2.361092 | 16.104098 | 16.264596 |
| Expected remaining allocated GB | 15.010798 | 1.267791 | 1.107294 |
| Exact target paths | 311 | 409 | 410 |
| Existing Malay translations | Preserved | Preserved | Preserved |
| Current hosted app | Protected; local only | Protected; local only | Protected; local only |
| Future deployment | Retained inputs | Retained inputs | Retained inputs; reinstall dependencies |
| Risk | Low; junction special case | Low for current app; historical jobs cannot resume | Moderate inconvenience; network/install needed |
| Scope | Obsolete builds/test artifacts; real translation machinery retained | A plus retired machinery, verified checkpoints, queues and duplicates | B plus node_modules |

Scenario B is the maximum practical recommendation: it retains a working local dependency installation and leaves only about 1.250 GB plus the report. Scenario C saves only another 149,222,868 logical bytes (0.149223 GB) and would prevent immediate local builds/tests until npm ci restores dependencies. It is an idle-workspace option, not an equally practical improvement. Removing additional uncertain research/backups is not included in any safe scenario. Freed space can grow again when builds/tests recreate artifacts; validate and report both immediate and post-test sizes.

## 13. Cleanup evidence and prerequisites by purpose

Every exact manifest row inherits the evidence below plus its individual witness, if applicable. All rows require explicit approval and preflight; this is not an execution command.

| Code | Purpose and current references | Malay / unique data | App, deployment, backup and validation prerequisite |
| --- | --- | --- | --- |
| MODEL | Pinned local research downloads, conversions, tokenizer and llama runtime; only historical maintenance references | No accepted sense records; tokenizer vocabulary is not a translation store | No live/build dependency. No backup needed for retired weights; preserve public provenance/licenses. |
| PYENV | Private .tmp CPU/CUDA inference environment | Third-party packages, not authoritative dictionary data | No npm/Vercel dependency. Confirm no job uses it; preserve base Python and GPU drivers. |
| CHECKPOINT | Completed offline-integrate snapshots and resume metadata | Retained Malay copies; every production-shaped text/mapping matches current store | No build dependency. Recheck semantic inclusion if target changed. Historical backups remain. |
| QUEUE | Input/workload extracts used by retired scripts | 23 files checked: no Malay target fields; original corpus remains | No app/build dependency; resuming cancelled. No queue backup needed. |
| FIXTURE | Current tests create new random fixture directories, with no dependency on previous runs | Copied real data plus synthetic/malformed inputs; fake reviewer metadata is synthetic | No app/build dependency. Keep tests and current data. Check ownership against mkdtemp call sites. |
| CLONE | Previous no-Git packaging experiment | Current data byte matches; four old source blobs reachable in Git | No deployment input. Preserve .git; unlink exact junction without traversing target before parent removal. |
| BROWSER | Historical Playwright screenshots, traces, resource captures | May capture existing UI/data; no sole authoritative accepted meanings | No build dependency. Committed docs/screenshots remain; regenerate results if needed. |
| BUILD | Generated Vite dist for local preview | Copies retained corpus/packed Malay; deployed/source hashes match | Hosted site unaffected. Rebuild before preview/artifact validation. |
| TSC | Incremental TypeScript state | No dictionary data | Recreated by typecheck/build. |
| CACHE | Project-local npm artifact/log cache | No authoritative meanings | Installed dependencies and lock remain in B. No global cache action. |
| PYCACHE | Six ignored Python maintenance bytecode files | No authoritative meanings | No production dependency; original tracked Python source remains. |
| DUPLICATE | Same size and SHA-256 as exact retained witness | All bytes including any historical alternative remain in witness | No sole-copy loss. Never remove witness; abort on hash difference. Historical resumes intentionally unsupported. |
| DEPENDENCIES | npm-installed packages matching lockfile | No unique app source/data | C only. Reinstall with Node 24/npm ci before builds/tests/dev. Network and disk needed. |

Before approved cleanup, ensure a recoverable copy of current source/data exists in Git/history or an existing private off-target backup; arrange a separately authorized private backup if needed. No backup was created during this audit. Do not copy credentials into this report or public assets. New model/checkpoint backups are unnecessary for cancelled jobs.

## 14. Exact cleanup manifest, sorted by allocated space reclaimed

Root: `D:\Primary school simulation\mandarin-visual-dictionary`. These are literal absolute targets; no wildcard removals. Directory rows cover only inventoried subtrees and no child is counted again. First scenario A = A/B/C; B = B/C; C = optional C only. Group refers to cleanup Group A/B. Yes means only after explicit approval, preflight and special prerequisites.

| Rank | Exact file/folder path | Logical bytes | Recoverable allocated bytes | First scenario / group | Purpose | Needed by current app? | Safe after approval / risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-models` | 3,930,617,360 | 3,930,689,536 | B / B | MODEL — Retired model/tokenizer/llama download | No | Yes / Low |
| 2 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\download-parts` | 1,675,241,120 | 1,675,243,520 | B / B | MODEL — Retired model/tokenizer/llama download | No | Yes / Low |
| 3 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\madlad-llama-q4k.gguf` | 1,660,781,696 | 1,660,784,640 | B / B | MODEL — Retired model/tokenizer/llama download | No | Yes / Low |
| 4 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\madlad-q4k.gguf` | 1,654,597,280 | 1,654,599,680 | B / B | MODEL — Retired model/tokenizer/llama download | No | Yes / Low |
| 5 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-model-env` | 911,466,694 | 969,181,184 | B / B | PYENV — Private retired inference environment | No | Yes / Low |
| 6 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cuda11-env` | 792,995,806 | 798,259,712 | B / B | PYENV — Private retired inference environment | No | Yes / Low |
| 7 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\recovery-import` | 700,879,076 | 700,993,536 | B / B | CHECKPOINT — Integrated import snapshots and metadata | No | Yes / Low |
| 8 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\new-import` | 670,969,831 | 671,076,352 | B / B | CHECKPOINT — Integrated import snapshots and metadata | No | Yes / Low |
| 9 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\isolated` | 198,390,502 | 198,438,912 | B / B | CHECKPOINT — Integrated import snapshots and metadata | No | Yes / Low |
| 10 | `D:\Primary school simulation\mandarin-visual-dictionary\node_modules` | 149,222,868 | 160,497,664 | C / A | DEPENDENCIES — Reproducible Node dependency installation | Local build/test yes; reinstall in C | Conditional / Moderate; reinstall required |
| 11 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\source-tasks.jsonl` | 123,220,267 | 123,224,064 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 12 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\full-hplt\workload.jsonl` | 119,217,444 | 119,218,176 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 13 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\tasks.jsonl` | 119,217,444 | 119,218,176 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 14 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\full-hplt-fast\workload.jsonl` | 107,621,137 | 107,622,400 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 15 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\tasks-tail.jsonl` | 107,621,137 | 107,622,400 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 16 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-remaining-senses.jsonl` | 90,486,504 | 90,488,832 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 17 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\vercel-no-git-cqqlvjlj` | 88,221,391 | 88,971,264 | A / A | CLONE — Obsolete no-Git source/build copy | No | Yes / Low; junction procedure |
| 18 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-edge-results` | 70,136,154 | 73,633,792 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 19 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-4pxwz1` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 20 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-AMBHW8` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 21 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-dReIrh` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 22 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-duwULH` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 23 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-GzOinn` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 24 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-KTKhDO` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 25 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-m7wdlz` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 26 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-N6xEIp` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 27 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-ov3nSR` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 28 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-PtgW9O` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 29 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-PTZYkb` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 30 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-S1D7rM` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 31 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-XjCg9O` | 58,212,939 | 58,217,472 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 32 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-CN4qUJ` | 56,793,068 | 56,800,256 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 33 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\full-gpu-final\workload.jsonl` | 51,757,917 | 51,761,152 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 34 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\tasks-gpu-final.jsonl` | 51,757,917 | 51,761,152 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 35 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\runtime` | 49,968,128 | 50,077,696 | B / B | MODEL — Retired model/tokenizer/llama download | No | Yes / Low |
| 36 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\review-queue.jsonl` | 47,898,384 | 47,898,624 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 37 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-webkit-results` | 37,780,481 | 38,182,912 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 38 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\full-cpu-final\workload.jsonl` | 34,722,935 | 34,725,888 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 39 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\tasks-cpu-final.jsonl` | 34,722,935 | 34,725,888 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 40 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-0OoA6C` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 41 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-0Oq5MP` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 42 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-0r5U1W` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 43 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-1N7HtT` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 44 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-33tuy1` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 45 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-3WVPJg` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 46 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-5qPBx9` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 47 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-5T9tpQ` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 48 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-63H5tK` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 49 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-8X95ia` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 50 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-axhL4Y` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 51 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-bB3z2e` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 52 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-C9IKN0` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 53 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-e6zAne` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 54 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-ejaV7b` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 55 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-eOa3Pt` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 56 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-EXZKuC` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 57 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-fo5s9Q` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 58 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-gFeQrZ` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 59 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HCHQEM` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 60 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HgsKX5` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 61 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HMrODx` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 62 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HwNUpe` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 63 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-hYvVe2` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 64 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HZr4aN` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 65 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-IFqycQ` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 66 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-IRM70v` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 67 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-kaqZuB` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 68 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-LAyqYr` | 21,386,593 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 69 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-LlDBPQ` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 70 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-MclZum` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 71 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-Mg3FlC` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 72 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-OpBTxn` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 73 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-Pp8cVl` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 74 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-Q16jUk` | 21,388,428 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 75 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-QCPRS2` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 76 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-QgvrLT` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 77 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-RjB8F8` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 78 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-SrJrGN` | 21,386,599 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 79 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-u2aT0T` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 80 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-UeFXRK` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 81 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-uMYuaY` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 82 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-UVQ1CR` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 83 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-VqX0Zc` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 84 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-WfxiZ3` | 21,386,543 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 85 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-wnWPv1` | 21,388,436 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 86 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-WynDnl` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 87 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-wZRuh3` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 88 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-zAQVWL` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 89 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-ZRHNGS` | 21,386,551 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 90 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-ZsbaJj` | 21,386,607 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 91 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-ztbybD` | 21,386,601 | 21,393,408 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 92 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\staged-store.json` | 21,382,097 | 21,385,216 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 93 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\staged-store.json` | 21,382,270 | 21,385,216 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 94 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\staged-store.json` | 21,382,097 | 21,385,216 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 95 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\baseline-store.json` | 20,828,295 | 20,832,256 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 96 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\promotion-before-store.json` | 20,828,295 | 20,832,256 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 97 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\baseline-store.json` | 20,828,295 | 20,832,256 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 98 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\promotion-before-store.json` | 20,828,295 | 20,832,256 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 99 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\baseline-store.json` | 20,828,295 | 20,832,256 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 100 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\promotion-before-store.json` | 20,828,295 | 20,832,256 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 101 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\baseline-store.json` | 20,828,295 | 20,832,256 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 102 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-DBNUjK` | 19,867,432 | 19,870,720 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 103 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-Xr0X2X` | 19,867,432 | 19,870,720 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 104 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\runtime.zip` | 19,563,017 | 19,566,592 | B / B | MODEL — Retired model/tokenizer/llama download | No | Yes / Low |
| 105 | `D:\Primary school simulation\mandarin-visual-dictionary\dist` | 19,226,708 | 19,350,016 | A / A | BUILD — Generated application dist | Local preview; reproducible | Yes / Low |
| 106 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\staged-runtime.json` | 15,445,028 | 15,446,016 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 107 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\staged-runtime.json` | 15,445,036 | 15,446,016 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 108 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\staged-runtime.json` | 15,445,028 | 15,446,016 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 109 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-after\malay-runtime.json` | 15,132,761 | 15,134,720 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 110 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\baseline-runtime.json` | 15,132,761 | 15,134,720 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 111 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\promotion-before-runtime.json` | 15,132,761 | 15,134,720 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 112 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\baseline-runtime.json` | 15,132,761 | 15,134,720 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 113 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\promotion-before-runtime.json` | 15,132,761 | 15,134,720 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 114 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\baseline-runtime.json` | 15,132,761 | 15,134,720 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 115 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\promotion-before-runtime.json` | 15,132,761 | 15,134,720 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 116 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\baseline-runtime.json` | 15,132,761 | 15,134,720 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 117 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-2F5qrw` | 13,274,760 | 13,276,160 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 118 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-a9R1w6` | 13,274,675 | 13,276,160 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 119 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-lUAVoe` | 13,274,760 | 13,276,160 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 120 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-UVwKW2` | 13,274,675 | 13,276,160 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 121 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-cBCDQJ` | 13,274,580 | 13,275,648 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 122 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-EGESGW` | 13,274,580 | 13,275,648 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 123 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-qfgsOQ` | 13,274,580 | 13,275,648 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 124 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-qSWvQv` | 13,274,580 | 13,275,648 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 125 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cedict-original.json` | 10,883,962 | 10,887,168 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 126 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-after\cedict.json` | 10,883,962 | 10,887,168 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 127 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-before\cedict.json` | 10,883,962 | 10,887,168 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 128 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-after\cedict.json` | 10,883,962 | 10,887,168 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 129 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-before\cedict.json` | 10,883,962 | 10,887,168 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 130 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-focused-results` | 8,753,107 | 8,769,536 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 131 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\live\malay-runtime.json` | 5,513,440 | 5,517,312 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 132 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-after\malay-runtime.json` | 5,513,440 | 5,517,312 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 133 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-before\malay-runtime.json` | 5,513,440 | 5,517,312 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 134 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-before\malay-runtime.json` | 5,513,440 | 5,517,312 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 135 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\promotion-before-store.json` | 4,757,938 | 4,759,552 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 136 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\isolated\store.json` | 4,757,938 | 4,759,552 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 137 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\promotion-before-store.json` | 4,757,938 | 4,759,552 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 138 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\madlad-tokenizer` | 4,439,507 | 4,452,352 | B / B | MODEL — Retired model/tokenizer/llama download | No | Yes / Low |
| 139 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\translations-before.json` | 4,308,055 | 4,308,992 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 140 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\npm-cache` | 4,076,973 | 4,132,864 | B / A | CACHE — Project-local npm cache | No | Yes / Low |
| 141 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\promotion-before-runtime.json` | 3,755,171 | 3,756,032 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 142 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\isolated\runtime.json` | 3,755,171 | 3,756,032 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 143 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\promotion-before-runtime.json` | 3,755,171 | 3,756,032 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 144 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\runtime-before.json` | 3,502,330 | 3,506,176 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 145 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\audit.json` | 2,177,162 | 2,179,072 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 146 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\audit.json` | 2,177,162 | 2,179,072 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 147 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\lexical-m2m100\workload.jsonl` | 1,909,885 | 1,912,832 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 148 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\lexical-tasks.jsonl` | 1,909,885 | 1,912,832 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 149 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-edge-final-results` | 1,870,378 | 1,880,064 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 150 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-5Uv8Mh` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 151 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-6FIVGY` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 152 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-6k8qIl` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 153 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-6SHAMr` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 154 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-9nqhh2` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 155 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-aYosgw` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 156 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-C6BpLA` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 157 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-eFyQhJ` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 158 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-fjMEhu` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 159 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-gR9qIv` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 160 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-h7eU48` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 161 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-Hixkm5` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 162 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-hvigHn` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 163 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-JuAwoi` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 164 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-JvCJn8` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 165 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-O7Wn58` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 166 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-Qt9T33` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 167 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-RlahCd` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 168 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-RmP1ab` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 169 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-rnhDZH` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 170 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-rwAHGm` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 171 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-uTbfEw` | 1,689,363 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 172 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-vZq1Es` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 173 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-xeAJeO` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 174 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-XjHik7` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 175 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-yGW8uD` | 1,689,505 | 1,695,744 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 176 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-3Z7GO1` | 1,686,955 | 1,687,552 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 177 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-4OuzTn` | 1,686,955 | 1,687,552 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 178 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-ISXPNM` | 1,686,955 | 1,687,552 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 179 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-JmXtAy` | 1,686,949 | 1,687,552 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 180 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-MVvwIg` | 1,686,949 | 1,687,552 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 181 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-NET0t3` | 1,686,949 | 1,687,552 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 182 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-TS96J5` | 1,686,955 | 1,687,552 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 183 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\protected-hplt\workload.jsonl` | 1,504,886 | 1,507,328 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 184 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\protected2-hplt\workload.jsonl` | 1,494,741 | 1,495,040 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 185 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-focused-fixed-results` | 1,415,606 | 1,421,312 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 186 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\english-browser-service.mjs` | 934,558 | 937,984 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 187 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\gallery-browser-service.mjs` | 934,558 | 937,984 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 188 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\large-gallery-browser-service.mjs` | 934,558 | 937,984 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 189 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\progressive-browser-service.mjs` | 934,558 | 937,984 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 190 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ultra-fast\gallery-after.mjs` | 934,558 | 937,984 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 191 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\candidates.json` | 927,923 | 929,792 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 192 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\candidates.json` | 928,261 | 929,792 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 193 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\dictionary-benchmark-run.mjs` | 826,603 | 827,392 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 194 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\benchmark.mjs` | 826,603 | 827,392 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 195 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\dictionary-benchmark.mjs` | 826,603 | 827,392 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 196 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\dictionary-benchmark.mjs` | 826,603 | 827,392 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 197 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\benchmark-after.mjs` | 827,163 | 827,392 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 198 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\benchmark-before.mjs` | 826,603 | 827,392 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 199 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-v1.jsonl` | 608,818 | 610,304 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 200 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-beam1\workload.jsonl` | 604,472 | 606,208 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 201 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-cuda-fp32\workload.jsonl` | 604,472 | 606,208 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 202 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-cuda11\workload.jsonl` | 604,472 | 606,208 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 203 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-fp32\workload.jsonl` | 604,472 | 606,208 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 204 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-v3\workload.jsonl` | 604,472 | 606,208 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 205 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-m2m100-v3\workload.jsonl` | 604,472 | 606,208 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 206 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot.jsonl` | 604,472 | 606,208 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 207 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-v2.jsonl` | 598,046 | 602,112 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 208 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\new-m2m100\workload.jsonl` | 522,900 | 524,288 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 209 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\surname-hplt\workload.jsonl` | 454,304 | 454,656 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 210 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\surname-tasks.jsonl` | 454,304 | 454,656 | B / B | QUEUE — Source-only retired translation workload | No | Yes / Low |
| 211 | `D:\Primary school simulation\mandarin-visual-dictionary\test-results` | 132,299 | 135,680 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 212 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\live\家俱-chinese-phone.png` | 86,572 | 90,112 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 213 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\live\哺乳动物-chinese-phone.png` | 79,732 | 81,920 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 214 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-responsive\after-longest-headword.png` | 70,054 | 73,728 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 215 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-responsive\before-820.png` | 71,921 | 73,728 | B / A | DUPLICATE — Exact duplicate; retained witness listed below | No | Yes / Low |
| 216 | `D:\Primary school simulation\mandarin-visual-dictionary\scripts\malay\__pycache__` | 57,496 | 69,632 | B / B | PYCACHE — Retired Python bytecode cache | No | Yes / Low |
| 217 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\teacher-language-browser-final` | 47,394 | 57,344 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 218 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-0RYq6A` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 219 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-37sFqd` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 220 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-4xpnc2` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 221 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-7HoJQT` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 222 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-7vycwi` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 223 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-8D9aaj` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 224 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-a7MVQH` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 225 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-AbBNIv` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 226 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-aeRLjD` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 227 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-AZ9ADz` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 228 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-gBNUZZ` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 229 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-gD27nw` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 230 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-GocRD8` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 231 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-gU2QoL` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 232 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-gUiHKP` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 233 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-KUaQBN` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 234 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-L1uC3c` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 235 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-mRNTjT` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 236 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-NM6reo` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 237 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-PqoyS3` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 238 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-U0AsXs` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 239 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-UKIYsO` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 240 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-UtuARy` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 241 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-wufFUQ` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 242 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-Wy0tNl` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 243 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-yxzY8c` | 4,857 | 13,312 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 244 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-6KGqpd` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 245 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-A1QCnH` | 4,926 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 246 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-aqVPrU` | 4,926 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 247 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-fBJwgJ` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 248 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-FGQA6L` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 249 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-gsehyy` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 250 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-I8Ffec` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 251 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-imOpcl` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 252 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-kFLuqe` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 253 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-KqsYRr` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 254 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-MX6fvD` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 255 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-n5ejZt` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 256 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-oud0gk` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 257 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-oZHCB5` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 258 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-Px17OE` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 259 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-Q7g8Sj` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 260 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-QY0ptR` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 261 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-t5LkIj` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 262 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-Tfv9Sh` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 263 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-V0eO9r` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 264 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-V9uFRF` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 265 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-vwUzf2` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 266 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-WJzBbC` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 267 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-xlyWUp` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 268 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-yhxb8D` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 269 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-yHzNbf` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 270 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-yjdX1o` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 271 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-Zb2JHf` | 5,220 | 12,288 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 272 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-0zyptF` | 4,690 | 8,192 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 273 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-5R50C1` | 4,690 | 8,192 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 274 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-AY8VyK` | 4,690 | 8,192 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 275 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-snQxSD` | 4,690 | 8,192 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 276 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-zegh6Z` | 4,690 | 8,192 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 277 | `D:\Primary school simulation\mandarin-visual-dictionary\tsconfig.tsbuildinfo` | 4,408 | 8,192 | A / A | TSC — Incremental TypeScript state | No | Yes / Low |
| 278 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-39XP9k` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 279 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-5ZGx3R` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 280 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-9FPg3O` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 281 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-b7Q7vj` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 282 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-cQpxyM` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 283 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-hBOEF0` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 284 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-K8EQfl` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 285 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-kXfs2h` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 286 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-sxr5dJ` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 287 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-vV6UyD` | 1,691 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 288 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-0i1dYn` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 289 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-3dTDVW` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 290 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-5PGyzT` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 291 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-78BUDJ` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 292 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-7mUELF` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 293 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-AFYJmh` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 294 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-aPxZcZ` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 295 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ArsyuB` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 296 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-eeQjaP` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 297 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-JutQsY` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 298 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-oyvViq` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 299 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-QAx671` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 300 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-qhz9zq` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 301 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-RczYbE` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 302 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-s2sied` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 303 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-t8aaxe` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 304 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-t9mZUt` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 305 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-TVcFAg` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 306 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-xQWZ3T` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 307 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-zPNsvr` | 856 | 512 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 308 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\final-predeploy-browser-results` | 45 | 0 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 309 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-accessibility-results` | 45 | 0 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 310 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-existing-results` | 45 | 0 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 311 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-webkit-final-results` | 45 | 0 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |
| 312 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-14vQBD` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 313 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-3kUExn` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 314 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-8D5jHI` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 315 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-B9jBLn` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 316 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-c0ixtu` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 317 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-HDg3Yp` | 1,376 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 318 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-hrEdne` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 319 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-iO15Jo` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 320 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-iRU97g` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 321 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-LiNWEf` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 322 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-N3DCBH` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 323 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-n6I45u` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 324 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-PLiBRc` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 325 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-ppu2Vj` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 326 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-pryXio` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 327 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-QziRd6` | 1,376 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 328 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-sQfhtO` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 329 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-wiaOK9` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 330 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-xuCswo` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 331 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-zeg4YH` | 793 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 332 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-0k4bWV` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 333 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-0pCrTh` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 334 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-3WnALM` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 335 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-4ZK7fe` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 336 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-5zdyxP` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 337 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-66b8jd` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 338 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-6Mfx7H` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 339 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-6trXoW` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 340 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-7CM663` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 341 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-7KrwLn` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 342 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-9eh25V` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 343 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-9kZ5L4` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 344 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-AyHVVJ` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 345 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-BALcPr` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 346 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ckcLWT` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 347 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-dBr3Qy` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 348 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ERgNDP` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 349 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-fNoWG2` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 350 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-fwQMr1` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 351 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-g42ILH` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 352 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-gu6Ktw` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 353 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-hAhOcp` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 354 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-hs7NYa` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 355 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-IF0XM4` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 356 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-jdghdv` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 357 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-JoHaRY` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 358 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-kl2ufj` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 359 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-Kqk1oA` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 360 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-KSyyox` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 361 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-kX3AEM` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 362 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-KY8joL` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 363 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-LWpTzj` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 364 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-mKzL3t` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 365 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-O0EG09` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 366 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-o824aU` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 367 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-qkYMDS` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 368 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-QvLyo5` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 369 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-QWz2Vy` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 370 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-RhjDWj` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 371 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-rIBqLH` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 372 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-rIropR` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 373 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-roHTXF` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 374 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-rrTzPJ` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 375 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-SL9ORK` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 376 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-t3o3Wr` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 377 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-tFtkGN` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 378 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-UCS94Z` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 379 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-uGPM9T` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 380 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ujRVdE` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 381 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-URwVnf` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 382 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-UWmQNs` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 383 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-vd3Sny` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 384 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-vEg5Xj` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 385 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-wahJ8G` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 386 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-WFZ6H9` | 46 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 387 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-Whd8Bp` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 388 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-zCLRfn` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 389 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ZeCslT` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 390 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ZmIgNc` | 296 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 391 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ZVYvoh` | 35 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 392 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-1kK5Gb` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 393 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-2KKgTx` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 394 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-2kwy5E` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 395 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-35CI2r` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 396 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-7OpGEb` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 397 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-9S6q8A` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 398 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-AK5q8B` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 399 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-chelyF` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 400 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-DM5cv1` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 401 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-jjSYTz` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 402 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-JZmTsl` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 403 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-ksXBOF` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 404 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-qKLkYM` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 405 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-QMRuq3` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 406 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-rSz9MT` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 407 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-tx2Hrm` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 408 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-vjrbcj` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 409 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-Y39lar` | 1,499 | 0 | A / A | FIXTURE — Test-owned temporary fixture/import copies | No | Yes / Low |
| 410 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\teacher-copy-browser-results` | 45 | 0 | A / A | BROWSER — Historical browser results/traces | No | Yes / Low |

### Exact duplicate deletion witnesses

Each removal below retains the named witness with identical raw SHA-256. Unique alternative payloads are preserved in the witness. This does not authorize deleting a final copy or whole parent.

| Removal target | Retained witness | Bytes each | Shared content SHA-256 |
| --- | --- | --- | --- |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\review-queue.jsonl` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\review-queue.jsonl` | 47,898,384 | `05ea5b7b2561bcc55a98ae73be1d65403b477ad5fcf1812041bdd4e3cfddaa5d` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\staged-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\staged-store.json` | 21,382,270 | `289df61138ab4355b7a8540f05924c2a2ccfb4af00affb9773880ce5c4fc2bbd` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\staged-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-16T01-12-15-252Z\project\scripts\data\malay-translations-v1.json` | 21,382,097 | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\staged-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-16T01-12-15-252Z\project\scripts\data\malay-translations-v1.json` | 21,382,097 | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\baseline-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\scripts\data\malay-translations-v1.json` | 20,828,295 | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\promotion-before-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\scripts\data\malay-translations-v1.json` | 20,828,295 | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\baseline-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\scripts\data\malay-translations-v1.json` | 20,828,295 | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\promotion-before-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\scripts\data\malay-translations-v1.json` | 20,828,295 | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\baseline-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\scripts\data\malay-translations-v1.json` | 20,828,295 | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\promotion-before-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\scripts\data\malay-translations-v1.json` | 20,828,295 | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\baseline-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\scripts\data\malay-translations-v1.json` | 20,828,295 | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\staged-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\staged-runtime.json` | 15,445,036 | `9bfaebf4f394a97411bf9f9978f00d7d113f78eb9c4c0816336cf3bd9a7aefe3` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\staged-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-16T01-12-15-252Z\project\src\data\malay-runtime.json` | 15,445,028 | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\staged-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-16T01-12-15-252Z\project\src\data\malay-runtime.json` | 15,445,028 | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-after\malay-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\baseline-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\promotion-before-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\baseline-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\promotion-before-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\baseline-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\promotion-before-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\baseline-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cedict-original.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T02-16-57-269Z\project\public\data\cedict.json` | 10,883,962 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-after\cedict.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T02-16-57-269Z\project\public\data\cedict.json` | 10,883,962 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-before\cedict.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T02-16-57-269Z\project\public\data\cedict.json` | 10,883,962 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-after\cedict.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T02-16-57-269Z\project\public\data\cedict.json` | 10,883,962 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-before\cedict.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T02-16-57-269Z\project\public\data\cedict.json` | 10,883,962 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\live\malay-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T20-41-18-328Z\project\src\data\malay-runtime.json` | 5,513,440 | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-after\malay-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T20-41-18-328Z\project\src\data\malay-runtime.json` | 5,513,440 | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-before\malay-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T20-41-18-328Z\project\src\data\malay-runtime.json` | 5,513,440 | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-before\malay-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T20-41-18-328Z\project\src\data\malay-runtime.json` | 5,513,440 | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\promotion-before-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T03-08-30-567Z\project\scripts\data\malay-translations-v1.json` | 4,757,938 | `f0343588c8f1e184ab8db32ca35e4942cd9062361dc198a020d64d11194ee275` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\isolated\store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T03-08-30-567Z\project\scripts\data\malay-translations-v1.json` | 4,757,938 | `f0343588c8f1e184ab8db32ca35e4942cd9062361dc198a020d64d11194ee275` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\promotion-before-store.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T03-08-30-567Z\project\scripts\data\malay-translations-v1.json` | 4,757,938 | `f0343588c8f1e184ab8db32ca35e4942cd9062361dc198a020d64d11194ee275` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\translations-before.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T02-16-57-269Z\project\scripts\data\malay-translations-v1.json` | 4,308,055 | `34af6703ffb0764ef6f36a649a32c8eb36b4edb087b3c16a3a6594ba5293d314` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\promotion-before-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T03-08-30-567Z\project\src\data\malay-runtime.json` | 3,755,171 | `03d9f0e729651b477bc531897df636c5352b383a744d32d4e94aceb1ad13c475` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\isolated\runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T03-08-30-567Z\project\src\data\malay-runtime.json` | 3,755,171 | `03d9f0e729651b477bc531897df636c5352b383a744d32d4e94aceb1ad13c475` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\promotion-before-runtime.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T03-08-30-567Z\project\src\data\malay-runtime.json` | 3,755,171 | `03d9f0e729651b477bc531897df636c5352b383a744d32d4e94aceb1ad13c475` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\runtime-before.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T02-16-57-269Z\project\src\data\malay-runtime.json` | 3,502,330 | `9225795eb45f818247d235f656684af05583e0abb7a9c53cc673fc45c4730e02` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\audit.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\audit.json` | 2,177,162 | `06715ccfade352870df4507710dd3b99c31da02c623f62058540dae5686ae6ff` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\audit.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\audit.json` | 2,177,162 | `06715ccfade352870df4507710dd3b99c31da02c623f62058540dae5686ae6ff` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\protected-hplt\workload.jsonl` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\protected-tasks.jsonl` | 1,504,886 | `701e8383965dace219ccfb60d444710fa753d100347777f010b3ae77048c5ab1` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\protected2-hplt\workload.jsonl` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\protected2-tasks.jsonl` | 1,494,741 | `d7459e2fc0072babc72634f950058fbe9d5e4d2c65e99e4adf332b5a67d82266` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\english-browser-service.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\idiom-browser-service.mjs` | 934,558 | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\gallery-browser-service.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\idiom-browser-service.mjs` | 934,558 | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\large-gallery-browser-service.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\idiom-browser-service.mjs` | 934,558 | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\progressive-browser-service.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\idiom-browser-service.mjs` | 934,558 | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ultra-fast\gallery-after.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\idiom-browser-service.mjs` | 934,558 | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\candidates.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\candidates.json` | 928,261 | `ccfe446dc90e593ab366c87b41d463222332bccf5516f123926c6b090d613961` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\candidates.json` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\candidates.json` | 927,923 | `e1043a827f8fb9532d07a6315c4214b114293bdb35764eccef064e4354e1bbf2` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\benchmark-after.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ultra-fast\dictionary-benchmark.mjs` | 827,163 | `8c76f66497af29818333aefee2c143aea619767ce3f73d076256095fc01775d6` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\dictionary-benchmark-run.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\benchmark-dictionary.mjs` | 826,603 | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\benchmark.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\benchmark-dictionary.mjs` | 826,603 | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\dictionary-benchmark.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\benchmark-dictionary.mjs` | 826,603 | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\dictionary-benchmark.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\benchmark-dictionary.mjs` | 826,603 | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\benchmark-before.mjs` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\benchmark-dictionary.mjs` | 826,603 | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\new-m2m100\workload.jsonl` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\new-tasks.jsonl` | 522,900 | `869acc6931dc1dc8fff1b0da1c7fe3c6989d6acae3d09f5ddb1dee3b46319de4` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\live\家俱-chinese-phone.png` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\live\家俱-malay-phone.png` | 86,572 | `fabc55258f5829eafc896351f88a0b5b4caf5e04e1df2b113c97f2df3a73dc4a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\live\哺乳动物-chinese-phone.png` | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\live\哺乳动物-malay-phone.png` | 79,732 | `785833d1c186dd63a8cc40282acd014ada48071c2b2fcedd7fe4bdcfc3f4cdbf` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-responsive\before-820.png` | `D:\Primary school simulation\mandarin-visual-dictionary\docs\screenshots\ipad-responsive\before-820.png` | 71,921 | `18cd2d246422d513476aa45aa0c4b69553c382a4395baa10b8dac98dcd3d903f` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-responsive\after-longest-headword.png` | `D:\Primary school simulation\mandarin-visual-dictionary\docs\screenshots\ipad-responsive\longest-headword-820.png` | 70,054 | `b773d7393bb174c286b149cb550b5a2d8e0e7697ab1d1fa87cd876c09ee8bb58` |

### Manifest freeze and target fingerprints

For directory fingerprints, enumerate regular files under the exact target without following links. Collect [projectRelativePathWithForwardSlashes, logicalBytes, stat.blocks*512, device+colon+inode, nlink, Number(bigintStat.mtimeMs)]. Sort paths ordinally; compact JSON.stringify each array, join with newline and append a final newline. Hash UTF-8 with SHA-256. Empty trees hash one newline. These are metadata inventory hashes, not concatenated content hashes. The skipped junction and its exact target are an additional mandatory check.

File rows have raw-byte content hashes. Recheck their identities/links too. Reject changed/new files, unknown links, hard links, different file counts or any fingerprint mismatch; re-audit rather than delete.

| Exact target relative to fixed project root | Regular files | Integrity kind | SHA-256 |
| --- | --- | --- | --- |
| `.tmp/malay-models` | 51 | Subtree metadata inventory | `fa303cbd60b808d2ee5b448f1bd6ecb91b444a38f80698d3d8813076a7192759` |
| `.tmp/malay-recovery/download-parts` | 107 | Subtree metadata inventory | `7b54ad090f31ebbeb16464d3f10f86d041c2bcc6e37cf5fe769ce2626025ca99` |
| `.tmp/malay-recovery/madlad-llama-q4k.gguf` | 1 | File content | `dd8778c6158f4a6cc1cd1ec1a87cdbdfeccc959fbf35f547b96a0394c78d8d73` |
| `.tmp/malay-recovery/madlad-q4k.gguf` | 1 | File content | `ea6e5531a3e95213c7f0635988d119e078a655c09306e47851e15d4c0c3f9c37` |
| `.tmp/malay-model-env` | 28,511 | Subtree metadata inventory | `ab46aaa63560bdfae8cf26136c747985d7bd5d4fde5d753ca53e6ee839ecb20b` |
| `.tmp/malay-cuda11-env` | 3,113 | Subtree metadata inventory | `d818f5c97e7474c671aeb6b5a65d2eab8b683d889ec994ebdb0590ce8d24a384` |
| `.tmp/malay-deep/recovery-import` | 62 | Subtree metadata inventory | `f08749b3b9c9eb5bb0c4a47dea2778c329541199813b5fed3c3b2148b7a5e960` |
| `.tmp/malay-deep/new-import` | 40 | Subtree metadata inventory | `aab99af74e73fe235a3587e6a5f0171762f96ff393cbca892a19673a7147e92e` |
| `.tmp/malay-complete/isolated` | 31 | Subtree metadata inventory | `b66363adc639318ff763f4b564baa46ae46b12808610badc39a98038a5e6f9fd` |
| `node_modules` | 9,069 | Subtree metadata inventory | `7eedf6b1d6faf8c6d47b5e9793df1eb9844fdc39a9a426a5ba5385dd5b2ce203` |
| `.tmp/malay-recovery/source-tasks.jsonl` | 1 | File content | `a0adfcce06a02eaccc54828002b5b6ce7b33795a51896bd277c57f8a13964224` |
| `.tmp/malay-complete/full-hplt/workload.jsonl` | 1 | File content | `d8dbb3366b2ec59f41c2f157c48a75b70a070e9680e06937514506b48046d81f` |
| `.tmp/malay-complete/tasks.jsonl` | 1 | File content | `d8dbb3366b2ec59f41c2f157c48a75b70a070e9680e06937514506b48046d81f` |
| `.tmp/malay-complete/full-hplt-fast/workload.jsonl` | 1 | File content | `67236939ac4750bf03b529853a771877fe86c8f519bb6f66af57c281631f0b0f` |
| `.tmp/malay-complete/tasks-tail.jsonl` | 1 | File content | `67236939ac4750bf03b529853a771877fe86c8f519bb6f66af57c281631f0b0f` |
| `.tmp/malay-remaining-senses.jsonl` | 1 | File content | `ae317d9beefb15f14a50aef5f1524598d3532dc1ab9419853eafeb3197231a03` |
| `.tmp/vercel-no-git-cqqlvjlj` | 394 | Subtree metadata inventory | `7541e8141d27b199f2f04e66f89da260676e8a006cbf4f2fb558a1b6eb186820` |
| `.tmp/ipad-edge-results` | 1,668 | Subtree metadata inventory | `149df744abf8e3e73be32411aa32b643e7db0978b80c1d9085627816b42e82e7` |
| `.tmp/malay-offline-import-4pxwz1` | 7 | Subtree metadata inventory | `8a7356e656fe2700bef8d4acd111bc0e0d6f54e93642ff89c919f043e2afff20` |
| `.tmp/malay-offline-import-AMBHW8` | 7 | Subtree metadata inventory | `e89f2312793c302288cf07ce4d56ded84fe4ff3837979b1b76f8101275ae9d8e` |
| `.tmp/malay-offline-import-dReIrh` | 7 | Subtree metadata inventory | `ccd23e05c460e18890a3877abad3faf118b1ab25bb685bfb57ced8487a7e8721` |
| `.tmp/malay-offline-import-duwULH` | 7 | Subtree metadata inventory | `c0bd3bc253b574794952b55e99036323dbcafd36066686deab759cc4e6b28085` |
| `.tmp/malay-offline-import-GzOinn` | 7 | Subtree metadata inventory | `ff47cf71e643f3113b13496599355806a2cc88df545fc140cb678d85b8eaafd7` |
| `.tmp/malay-offline-import-KTKhDO` | 7 | Subtree metadata inventory | `2147668a2dfa15b0de7a08316e6e8d13ac117e9b19ee1a9e39bda0930d466303` |
| `.tmp/malay-offline-import-m7wdlz` | 7 | Subtree metadata inventory | `963e1f054f1e468baa98300e0d372d70caaf180bed396f7bbd46ebd893c877fe` |
| `.tmp/malay-offline-import-N6xEIp` | 7 | Subtree metadata inventory | `bb771cae0a19ca76cba0da653e80a92bc40519274317d35df16a295d2fcdf61f` |
| `.tmp/malay-offline-import-ov3nSR` | 7 | Subtree metadata inventory | `e849883cd5fa8bc145fd335ffccacd360a1f7ffbd1941db4986461505c318cd5` |
| `.tmp/malay-offline-import-PtgW9O` | 7 | Subtree metadata inventory | `73007dee11fee03f08f470dd2d63cda58433235651732dcf7b16c33acb1c9f52` |
| `.tmp/malay-offline-import-PTZYkb` | 7 | Subtree metadata inventory | `ccefe58dd9b527f226a33abc69f4bb0f056b11112f654192856b784b1d77b5be` |
| `.tmp/malay-offline-import-S1D7rM` | 7 | Subtree metadata inventory | `e351c80f38075e2d60a6d28c21341fbbd8e75d2f5b441a2addc678d007e5d964` |
| `.tmp/malay-offline-import-XjCg9O` | 7 | Subtree metadata inventory | `77731b519c1bf3f6e0472983873d2f4ae3e58cf6cde1e8312d925e2bddd680b1` |
| `.tmp/malay-offline-import-CN4qUJ` | 7 | Subtree metadata inventory | `9d12451e73c45a9e11e128213a6cc6d1bf5d5624590c743efb9c6460eb57449a` |
| `.tmp/malay-complete/full-gpu-final/workload.jsonl` | 1 | File content | `f80290073505d66f16b378b510c095feac61de2147072698a632c0a6d7f025a9` |
| `.tmp/malay-complete/tasks-gpu-final.jsonl` | 1 | File content | `f80290073505d66f16b378b510c095feac61de2147072698a632c0a6d7f025a9` |
| `.tmp/malay-recovery/runtime` | 50 | Subtree metadata inventory | `1658d4275f18a0efa947f550c6053c381e1684db844f2ae5ddc032e7de331ac3` |
| `.tmp/malay-lexical-accuracy/run-v2/review-queue.jsonl` | 1 | File content | `05ea5b7b2561bcc55a98ae73be1d65403b477ad5fcf1812041bdd4e3cfddaa5d` |
| `.tmp/ipad-webkit-results` | 215 | Subtree metadata inventory | `4183aca91a68375d2f7e7339e620f0e36c13b0c4047b94a852dcbf17de558eb6` |
| `.tmp/malay-complete/full-cpu-final/workload.jsonl` | 1 | File content | `fd7a2f20696e38b225cca7c98c0e498008604f89d669ebe01e6e3a697e205414` |
| `.tmp/malay-complete/tasks-cpu-final.jsonl` | 1 | File content | `fd7a2f20696e38b225cca7c98c0e498008604f89d669ebe01e6e3a697e205414` |
| `.tmp/malay-lexical-import-0OoA6C` | 3 | Subtree metadata inventory | `2d3175428616b226feb7e5a51e4695065d879af45f777741cdf9c0dabf50785b` |
| `.tmp/malay-lexical-import-0Oq5MP` | 3 | Subtree metadata inventory | `84310191bb786fc3560b97e01962cbe3025262ff272bb2ba61f226faa7d78f60` |
| `.tmp/malay-lexical-import-0r5U1W` | 3 | Subtree metadata inventory | `37b81ebd057e0c38a30860de7214f88512076e64687140691b294e200fc5fd8d` |
| `.tmp/malay-lexical-import-1N7HtT` | 3 | Subtree metadata inventory | `9078d566250267389072cb515f3837fe80fa37be970a0ed7671b31f6da9f7447` |
| `.tmp/malay-lexical-import-33tuy1` | 3 | Subtree metadata inventory | `13659e8f62410ecf9fc94194ef658ca5525fb5e6a1fcea0514ba6a8918b1108b` |
| `.tmp/malay-lexical-import-3WVPJg` | 3 | Subtree metadata inventory | `8b17ea18334c7e6982bb07301a54319bb0b6831d9bab804120c446acee930a60` |
| `.tmp/malay-lexical-import-5qPBx9` | 3 | Subtree metadata inventory | `55be3cda915abf12398631d0548c9bb7287e3bce188e91157bfb0d2dc206e544` |
| `.tmp/malay-lexical-import-5T9tpQ` | 3 | Subtree metadata inventory | `e1fc7fb0482709b330c7fb4dd78c976e1c90af0b48ccd708f63b9c48834f8501` |
| `.tmp/malay-lexical-import-63H5tK` | 3 | Subtree metadata inventory | `6b67868cafb1c65a721a98b607c33ae1e614b0ec4afa300d6a06ae499784e871` |
| `.tmp/malay-lexical-import-8X95ia` | 3 | Subtree metadata inventory | `11904098136ac4449656b02b52d8185a360d76ccffcd92572bb1fc6a171a4c0f` |
| `.tmp/malay-lexical-import-axhL4Y` | 3 | Subtree metadata inventory | `61f96d8a48bf70080525fe509aebd35095fb632e49d22eac54b171cce109fad0` |
| `.tmp/malay-lexical-import-bB3z2e` | 3 | Subtree metadata inventory | `0f75b84cf0274763136a42d6560c5f589317d90edb3dd9e9b41c94d7e465cf04` |
| `.tmp/malay-lexical-import-C9IKN0` | 3 | Subtree metadata inventory | `a8f1d0fb3805b057a319c6c15cb27643943225b493c7c2ba46fa87f91ce0da28` |
| `.tmp/malay-lexical-import-e6zAne` | 3 | Subtree metadata inventory | `ec0b8923bda8c510bafc895a38f0832addb02b5c057b6515a1c8b0cf28804d6e` |
| `.tmp/malay-lexical-import-ejaV7b` | 3 | Subtree metadata inventory | `ff4ceb8dbdc47a15e7f3e98390a284b9fced8c851e12d65c8cef6c463457ea75` |
| `.tmp/malay-lexical-import-eOa3Pt` | 3 | Subtree metadata inventory | `f640289ddde353a1ab7ecf29851879133a9656f66a0e91cd1991f630a8474b65` |
| `.tmp/malay-lexical-import-EXZKuC` | 3 | Subtree metadata inventory | `0fc49784ace5689013689ae2322db645d94cfa6c17410cd397b2cea3d518e8ff` |
| `.tmp/malay-lexical-import-fo5s9Q` | 3 | Subtree metadata inventory | `9a25240cb2d8f9656f59a17d7ddb32f9769aa5f11b1d4c1803e46a8b814c2cb5` |
| `.tmp/malay-lexical-import-gFeQrZ` | 3 | Subtree metadata inventory | `495813ffdf4bd3a511ca3be5af865745ecc5c03c2894f90d52c272995515008e` |
| `.tmp/malay-lexical-import-HCHQEM` | 3 | Subtree metadata inventory | `17a48fdbe87bb9a505dd9eef218bc9877d33a4a83e37a99cc797a8de09d360ac` |
| `.tmp/malay-lexical-import-HgsKX5` | 3 | Subtree metadata inventory | `02f0b22225e35a87d6803a32c155f332eae11852ff95e85601d2d12e91008ded` |
| `.tmp/malay-lexical-import-HMrODx` | 3 | Subtree metadata inventory | `1384e9bb4071f4c31770405c9afc71c87491db40cc78776707ec8584d265ef3a` |
| `.tmp/malay-lexical-import-HwNUpe` | 3 | Subtree metadata inventory | `3c7eb7ce593ab6c6993aee9fdef112292c6c4909bb7acdd42a1fe8fffad44f9a` |
| `.tmp/malay-lexical-import-hYvVe2` | 3 | Subtree metadata inventory | `ce1e7e34e6399bd212a943e82c3807868b76253b2e21439dffeabd361091e839` |
| `.tmp/malay-lexical-import-HZr4aN` | 3 | Subtree metadata inventory | `ae7ff13a319b6ee8bbf04dd618cdfe8d4a748550c4b6917e8e3e398cd439848c` |
| `.tmp/malay-lexical-import-IFqycQ` | 3 | Subtree metadata inventory | `15ffe2b92eb11c0d4616f6f0edea1cf9feb7bd0a38fbdb7b0a926624d1d59dc2` |
| `.tmp/malay-lexical-import-IRM70v` | 3 | Subtree metadata inventory | `ca66c91401c6f42f913988bee8f147021fd6251a092103ec2d1fdbf594ec5f61` |
| `.tmp/malay-lexical-import-kaqZuB` | 3 | Subtree metadata inventory | `a212c87c9937c5baea08130f35280fdb8962427c8c32de06cb00ba543e9a385a` |
| `.tmp/malay-lexical-import-LAyqYr` | 3 | Subtree metadata inventory | `212c6b8f49fcd497cb696e9f4808333cdde39bf291807f89db25b47db7359e62` |
| `.tmp/malay-lexical-import-LlDBPQ` | 3 | Subtree metadata inventory | `38f8a1ec96fa39b7c0f30417c0750005a59ab7604bdd719ff37a3e99723ac349` |
| `.tmp/malay-lexical-import-MclZum` | 3 | Subtree metadata inventory | `f03c349710d51c92c3818c1075e5df738f62fc31a4ed90f1efb5aced03dfb167` |
| `.tmp/malay-lexical-import-Mg3FlC` | 3 | Subtree metadata inventory | `0f40ce2fd4cd765aacc5bc6dbe20642300a76f9da4e7f01c8407c3a73da7d937` |
| `.tmp/malay-lexical-import-OpBTxn` | 3 | Subtree metadata inventory | `793f42d4a4fa123bd6d63072e173e36dbeca2830409be7ee4d7ef4b5c0e894bf` |
| `.tmp/malay-lexical-import-Pp8cVl` | 3 | Subtree metadata inventory | `12d7b0bacde5aa8408fb704f11ed90b0eb1bdc0bef84cb62e71be9fc69329c83` |
| `.tmp/malay-lexical-import-Q16jUk` | 3 | Subtree metadata inventory | `e487b136f38673058c1a3f4c964365fd7a6973661695d9821c151759054aed16` |
| `.tmp/malay-lexical-import-QCPRS2` | 3 | Subtree metadata inventory | `5bc61fc48c9e3c24038e53a57251a164785e10e3f4d87c7e0ca7486f69aff0ba` |
| `.tmp/malay-lexical-import-QgvrLT` | 3 | Subtree metadata inventory | `0f541924669d3d6636ecbd69923984740b366785d1858dd3bfec224328207f07` |
| `.tmp/malay-lexical-import-RjB8F8` | 3 | Subtree metadata inventory | `b6bfb1b0f0a8716835da6e55ef78d8d85991628868ef927cc8a2b2b4124e7199` |
| `.tmp/malay-lexical-import-SrJrGN` | 3 | Subtree metadata inventory | `c8057a44a008b7330b7583368d83402fb53b9739ab47719e18a76e28265c68f9` |
| `.tmp/malay-lexical-import-u2aT0T` | 3 | Subtree metadata inventory | `b17b98fac14bb9b5371802deb455eb18c76a55e592b8c2aa4f948f2feb8ef80e` |
| `.tmp/malay-lexical-import-UeFXRK` | 3 | Subtree metadata inventory | `4d8b90f54ffe6b816897bf9bd4d1fe6e9fa5130dd3772acfccba9be787be946d` |
| `.tmp/malay-lexical-import-uMYuaY` | 3 | Subtree metadata inventory | `9af349ca68c580e5fc370ccca634727e7a82bf5c3fd885cfb16217140da7eccd` |
| `.tmp/malay-lexical-import-UVQ1CR` | 3 | Subtree metadata inventory | `d90ab3eba90296e6b42bd8e3662b9119c42ea4887eaaee43ba183b27a76e2b4a` |
| `.tmp/malay-lexical-import-VqX0Zc` | 3 | Subtree metadata inventory | `8b5a2d97484d47a77ca663435ba4f0e0f6724636e9e62dbf97df79c4b8de7a6d` |
| `.tmp/malay-lexical-import-WfxiZ3` | 3 | Subtree metadata inventory | `b21c2dbf75d1a82306150e28006783c61fac42c124aa355cdb256c803d7adb0b` |
| `.tmp/malay-lexical-import-wnWPv1` | 3 | Subtree metadata inventory | `f12a4895323f6ca139c016a5b31ea8c3c22a1d6f24a638ddce038e39517b5111` |
| `.tmp/malay-lexical-import-WynDnl` | 3 | Subtree metadata inventory | `f3f471a5fad0296aba519fe81c9ba36946821bd53bdf2260f4ddb4ecbbff17b8` |
| `.tmp/malay-lexical-import-wZRuh3` | 3 | Subtree metadata inventory | `1fde57b0daca47e87a2d2727b761578c27025e0a189c654c3e01cbec60a67d76` |
| `.tmp/malay-lexical-import-zAQVWL` | 3 | Subtree metadata inventory | `900a79e83d6eb4263638265d2ba1d53b4fef2134c49f9b3499692e16158d969f` |
| `.tmp/malay-lexical-import-ZRHNGS` | 3 | Subtree metadata inventory | `f7e2673c488f48acfe9eaa61cd2b30aea56296031674f8b3062b4486864b36b3` |
| `.tmp/malay-lexical-import-ZsbaJj` | 3 | Subtree metadata inventory | `5c0d85c85f11b626658a5ee73a76793d6fc7ed9092093c538e6e4fc02d6891c0` |
| `.tmp/malay-lexical-import-ztbybD` | 3 | Subtree metadata inventory | `54ddd4954052b3cb6dc16bec3386af90b16f69ed6858aa7791f9aaae93868f18` |
| `.tmp/malay-lexical-accuracy/run-final/staged-store.json` | 1 | File content | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `.tmp/malay-lexical-accuracy/run-v2/staged-store.json` | 1 | File content | `289df61138ab4355b7a8540f05924c2a2ccfb4af00affb9773880ce5c4fc2bbd` |
| `.tmp/malay-lexical-accuracy/run-v3/staged-store.json` | 1 | File content | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `.tmp/malay-lexical-accuracy/run-final/baseline-store.json` | 1 | File content | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `.tmp/malay-lexical-accuracy/run-final/promotion-before-store.json` | 1 | File content | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `.tmp/malay-lexical-accuracy/run-v2/baseline-store.json` | 1 | File content | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `.tmp/malay-lexical-accuracy/run-v2/promotion-before-store.json` | 1 | File content | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `.tmp/malay-lexical-accuracy/run-v3/baseline-store.json` | 1 | File content | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `.tmp/malay-lexical-accuracy/run-v3/promotion-before-store.json` | 1 | File content | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `.tmp/malay-lexical-accuracy/run/baseline-store.json` | 1 | File content | `9980df32b47b018258f1cdb3cc4a3fa809ac23dd6609929034116710e696cb89` |
| `.tmp/malay-offline-import-DBNUjK` | 7 | Subtree metadata inventory | `0e57c9409807394353afa5b006d0dfe3a4efe5c0ee69189b71ee900f119362ca` |
| `.tmp/malay-offline-import-Xr0X2X` | 7 | Subtree metadata inventory | `af657a65513c6a1d3114e680db39714f0c91608882715a5f787dde7bfd1d7eb5` |
| `.tmp/malay-recovery/runtime.zip` | 1 | File content | `82463bff7b42c41e8dc934202fb60ba28e1120c04264484b8d349b4a5958190d` |
| `dist` | 55 | Subtree metadata inventory | `a4c962f9af17622ffde9c4187aae94bd688ae60cbd6e5c5c91783e8806764fba` |
| `.tmp/malay-lexical-accuracy/run-final/staged-runtime.json` | 1 | File content | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |
| `.tmp/malay-lexical-accuracy/run-v2/staged-runtime.json` | 1 | File content | `9bfaebf4f394a97411bf9f9978f00d7d113f78eb9c4c0816336cf3bd9a7aefe3` |
| `.tmp/malay-lexical-accuracy/run-v3/staged-runtime.json` | 1 | File content | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |
| `.tmp/malay-deep/production-after/malay-runtime.json` | 1 | File content | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-lexical-accuracy/run-final/baseline-runtime.json` | 1 | File content | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-lexical-accuracy/run-final/promotion-before-runtime.json` | 1 | File content | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-lexical-accuracy/run-v2/baseline-runtime.json` | 1 | File content | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-lexical-accuracy/run-v2/promotion-before-runtime.json` | 1 | File content | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-lexical-accuracy/run-v3/baseline-runtime.json` | 1 | File content | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-lexical-accuracy/run-v3/promotion-before-runtime.json` | 1 | File content | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-lexical-accuracy/run/baseline-runtime.json` | 1 | File content | `294888895666f2c21f2a23a34660dbbe8110bafb165a7334e9c5685c1cc1e128` |
| `.tmp/malay-offline-import-2F5qrw` | 7 | Subtree metadata inventory | `0ea780e038300a4df9a16d2a335ba59847957a30c1b2ae69675f3c57d9338017` |
| `.tmp/malay-offline-import-a9R1w6` | 7 | Subtree metadata inventory | `f56af1c9c02f9b300dfd3f964b8c8e91b3be86a413539e1684ade8a56a30bd24` |
| `.tmp/malay-offline-import-lUAVoe` | 7 | Subtree metadata inventory | `ea8ed65e02c918ac186de719cf0a06674dfc85b47e851134b4c9b9578687b273` |
| `.tmp/malay-offline-import-UVwKW2` | 7 | Subtree metadata inventory | `891535bdd70a0086a0b667c771f207483df8950b28ce82930edbaf70456dcfe6` |
| `.tmp/malay-offline-import-cBCDQJ` | 7 | Subtree metadata inventory | `c2f24a6067e11dce0167f39e1bae47627231a0c91db3f819edfb2f932f3ffaa0` |
| `.tmp/malay-offline-import-EGESGW` | 7 | Subtree metadata inventory | `560841e6c5608201b63eb6b4fbd6d1441d62fda5e1a2b396c0bdfb0a531f9d6c` |
| `.tmp/malay-offline-import-qfgsOQ` | 7 | Subtree metadata inventory | `1535c35b2e614df7c593dbced150be204166e802cfa7e49a0a3f0439e7884d67` |
| `.tmp/malay-offline-import-qSWvQv` | 7 | Subtree metadata inventory | `c9bf3a62fb136f6bea0198b35ddaa154d70fd8160fdf616ffa218f3e80075b40` |
| `.tmp/malay-cedict-original.json` | 1 | File content | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `.tmp/malay-datasets/production-after/cedict.json` | 1 | File content | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `.tmp/malay-datasets/production-before/cedict.json` | 1 | File content | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `.tmp/malay-deep/production-after/cedict.json` | 1 | File content | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `.tmp/malay-deep/production-before/cedict.json` | 1 | File content | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `.tmp/ipad-focused-results` | 10 | Subtree metadata inventory | `88373ef97b8fc0b45d5fafe1f4e8d0930c528fa7fb01115d08d7ff6a614a612e` |
| `.tmp/malay-complete/live/malay-runtime.json` | 1 | File content | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |
| `.tmp/malay-datasets/production-after/malay-runtime.json` | 1 | File content | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |
| `.tmp/malay-datasets/production-before/malay-runtime.json` | 1 | File content | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |
| `.tmp/malay-deep/production-before/malay-runtime.json` | 1 | File content | `1c85ac108b95f13f7cf300d5d88d63e1628fb3fd0f47307480f27eefddaf4c2a` |
| `.tmp/malay-complete/promotion-before-store.json` | 1 | File content | `f0343588c8f1e184ab8db32ca35e4942cd9062361dc198a020d64d11194ee275` |
| `.tmp/malay-datasets/isolated/store.json` | 1 | File content | `f0343588c8f1e184ab8db32ca35e4942cd9062361dc198a020d64d11194ee275` |
| `.tmp/malay-datasets/promotion-before-store.json` | 1 | File content | `f0343588c8f1e184ab8db32ca35e4942cd9062361dc198a020d64d11194ee275` |
| `.tmp/malay-recovery/madlad-tokenizer` | 6 | Subtree metadata inventory | `e89d77e55360725fe297aa2a81e22ec9d50e55f5adcef823c17a1d1c66235e50` |
| `.tmp/malay-recovery/translations-before.json` | 1 | File content | `34af6703ffb0764ef6f36a649a32c8eb36b4edb087b3c16a3a6594ba5293d314` |
| `.tmp/npm-cache` | 36 | Subtree metadata inventory | `6f8941b458e0568893b15b8c07f719f9638907a0d29941c5e5e2c3f9438fd7aa` |
| `.tmp/malay-complete/promotion-before-runtime.json` | 1 | File content | `03d9f0e729651b477bc531897df636c5352b383a744d32d4e94aceb1ad13c475` |
| `.tmp/malay-datasets/isolated/runtime.json` | 1 | File content | `03d9f0e729651b477bc531897df636c5352b383a744d32d4e94aceb1ad13c475` |
| `.tmp/malay-datasets/promotion-before-runtime.json` | 1 | File content | `03d9f0e729651b477bc531897df636c5352b383a744d32d4e94aceb1ad13c475` |
| `.tmp/malay-recovery/runtime-before.json` | 1 | File content | `9225795eb45f818247d235f656684af05583e0abb7a9c53cc673fc45c4730e02` |
| `.tmp/malay-lexical-accuracy/run-v2/audit.json` | 1 | File content | `06715ccfade352870df4507710dd3b99c31da02c623f62058540dae5686ae6ff` |
| `.tmp/malay-lexical-accuracy/run-v3/audit.json` | 1 | File content | `06715ccfade352870df4507710dd3b99c31da02c623f62058540dae5686ae6ff` |
| `.tmp/malay-complete/lexical-m2m100/workload.jsonl` | 1 | File content | `4cbfc3a9708f65731e4431d8bf1a625576b7eee341ca8d4e20186fd830a62725` |
| `.tmp/malay-complete/lexical-tasks.jsonl` | 1 | File content | `4cbfc3a9708f65731e4431d8bf1a625576b7eee341ca8d4e20186fd830a62725` |
| `.tmp/ipad-edge-final-results` | 4 | Subtree metadata inventory | `75f908469e099f3986d5dd3265c4e6ab295c5124780d020ee02f91f4bb6713d0` |
| `.tmp/malay-build-test-5Uv8Mh` | 2 | Subtree metadata inventory | `d3d3e511e379457ff87715a5ff73268082a1cb414bf1c8de7f0357c50d7ae792` |
| `.tmp/malay-build-test-6FIVGY` | 2 | Subtree metadata inventory | `a9bc7b9517731214d850f934687508fcd88fcfb52301b47e132be4b27f1b7784` |
| `.tmp/malay-build-test-6k8qIl` | 2 | Subtree metadata inventory | `65082938426f0c742db60a4a087f07e08beb9d9c29c747b525767b0d5047e6eb` |
| `.tmp/malay-build-test-6SHAMr` | 2 | Subtree metadata inventory | `2403000d522e5f2b424f1e2f73a9ee2d2f7aa27330643005cf3feffa2a78f77d` |
| `.tmp/malay-build-test-9nqhh2` | 2 | Subtree metadata inventory | `b860842c96e6cb312b7ede161d76312b41fdea9ae5f783f58adeca28e9ff41a2` |
| `.tmp/malay-build-test-aYosgw` | 2 | Subtree metadata inventory | `72e9848b1cd21a489898d39f1994e64aeebe687cb61c79b1c87a711a8418d39c` |
| `.tmp/malay-build-test-C6BpLA` | 2 | Subtree metadata inventory | `43d113c901a947e9aed23956b8bec07319461386b239593c82b87f88483951ae` |
| `.tmp/malay-build-test-eFyQhJ` | 2 | Subtree metadata inventory | `05e849f471f6e234a0fe0d5d7a25a4410c5a61f6168b7c47d2e075cfcbdc236a` |
| `.tmp/malay-build-test-fjMEhu` | 2 | Subtree metadata inventory | `22029fa4cfe2e2d92ffdf33b88809fdd4bd02806553c9bfacc84d7cbfe203674` |
| `.tmp/malay-build-test-gR9qIv` | 2 | Subtree metadata inventory | `19f4f906598d6c1ee5b8ad9f56b84eb49a1b232084119ae6c09aa7f6d865d6f0` |
| `.tmp/malay-build-test-h7eU48` | 2 | Subtree metadata inventory | `ebec423dbc9a70192fcc0b6f759913217113253ed3005230bd83442fee955a9c` |
| `.tmp/malay-build-test-Hixkm5` | 2 | Subtree metadata inventory | `4c41acc09982953717346fe68b9a7e3292fc3125aadc450faaa4e25d0a4ab6ef` |
| `.tmp/malay-build-test-hvigHn` | 2 | Subtree metadata inventory | `4a82cdd3ebf1f91e2bc8f38e3cb779f873fdb0b80abb46bf47da6ea09ac721a8` |
| `.tmp/malay-build-test-JuAwoi` | 2 | Subtree metadata inventory | `15e5376d89c325087659bd360a530114d59e5d7bfd1e4514402d9d07e1babc5c` |
| `.tmp/malay-build-test-JvCJn8` | 2 | Subtree metadata inventory | `2d659192fd433c0ed49aded6d50a4cb255f9d72d7c9f81a4626d0f239b05504c` |
| `.tmp/malay-build-test-O7Wn58` | 2 | Subtree metadata inventory | `d27a96bd1fbe4419e1fc0e2e63878289643ebefc49437075f5ea19d4db9f69f7` |
| `.tmp/malay-build-test-Qt9T33` | 2 | Subtree metadata inventory | `f7581e8e1bc3ac78b3a32865aac98efc96bad78e2b10cf8adac691c4a096013b` |
| `.tmp/malay-build-test-RlahCd` | 2 | Subtree metadata inventory | `6dc6ba3c5e96bcdc599b6cbaaf59ffcb73bccc32df71369fc146cd14d634c6ce` |
| `.tmp/malay-build-test-RmP1ab` | 2 | Subtree metadata inventory | `af77c8a5dc5b2dca2470a31b7e6eb8dbf3925f7f911e6c0d82c57aa98d3c83d3` |
| `.tmp/malay-build-test-rnhDZH` | 2 | Subtree metadata inventory | `b54689770df72410b8cdb41773a44ce4004b4ae923d8e62894859c421c958e67` |
| `.tmp/malay-build-test-rwAHGm` | 2 | Subtree metadata inventory | `73c46fed78ac1aa60098456398bce66e39243b2f7c199a905a12be0cd0e323a9` |
| `.tmp/malay-build-test-uTbfEw` | 2 | Subtree metadata inventory | `b895aac1a0b3b99f5016aad37bd9b8bf263a2eec541119cb649318f133889ba0` |
| `.tmp/malay-build-test-vZq1Es` | 2 | Subtree metadata inventory | `7379f8279be22c18bb67e70bc507549c199b2547b0028e3c58d106bcbbbd51f4` |
| `.tmp/malay-build-test-xeAJeO` | 2 | Subtree metadata inventory | `6c9457703518dd3077a244d190fc891bbdea4c4478cd3e479a96335192224cbd` |
| `.tmp/malay-build-test-XjHik7` | 2 | Subtree metadata inventory | `7465050d2a6076ccfd959a5840fdf69b0f30ca61948b28c84ee6907d50272deb` |
| `.tmp/malay-build-test-yGW8uD` | 2 | Subtree metadata inventory | `a349614f382c5d3b43b845f0264bc410921f13bbef5cac6702bca5eae3785437` |
| `.tmp/malay-build-test-3Z7GO1` | 2 | Subtree metadata inventory | `4d9e979527bbf68529fad2594c1d25fb4db3a1f13e5a3e811d8e34dad966600f` |
| `.tmp/malay-build-test-4OuzTn` | 2 | Subtree metadata inventory | `c35803b2f7d3619e1c3cbba7f799bb147a8cad2bfd526db0221e8f5e65a53ae9` |
| `.tmp/malay-build-test-ISXPNM` | 2 | Subtree metadata inventory | `28db835a0ffab70b7d273ac0f263e66b22ba127680a495311df5ce142325d169` |
| `.tmp/malay-build-test-JmXtAy` | 2 | Subtree metadata inventory | `47de35bc768aad986d9fc07406d622af78deb0c57c27755f1cff8f1f565576ef` |
| `.tmp/malay-build-test-MVvwIg` | 2 | Subtree metadata inventory | `c60fc86e52444905202107793f1cfb724edefa930f4897166271debbf4efff5e` |
| `.tmp/malay-build-test-NET0t3` | 2 | Subtree metadata inventory | `849a4765359ba71dc16dcd910c4929db8a3232354d723ee96316fcd2c87ad1a8` |
| `.tmp/malay-build-test-TS96J5` | 2 | Subtree metadata inventory | `08e85b4abb988fa6bc6c1330cb8e6b6b1c7368220ef49651684f92c10b637c38` |
| `.tmp/malay-deep/protected-hplt/workload.jsonl` | 1 | File content | `701e8383965dace219ccfb60d444710fa753d100347777f010b3ae77048c5ab1` |
| `.tmp/malay-deep/protected2-hplt/workload.jsonl` | 1 | File content | `d7459e2fc0072babc72634f950058fbe9d5e4d2c65e99e4adf332b5a67d82266` |
| `.tmp/ipad-focused-fixed-results` | 4 | Subtree metadata inventory | `b22cf9daf3636402712b33bb433fa4080858479fc169bdab757b71ddbecb5da4` |
| `.tmp/english-browser-service.mjs` | 1 | File content | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `.tmp/gallery-browser-service.mjs` | 1 | File content | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `.tmp/large-gallery-browser-service.mjs` | 1 | File content | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `.tmp/progressive-browser-service.mjs` | 1 | File content | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `.tmp/ultra-fast/gallery-after.mjs` | 1 | File content | `bd54839daa2cc96bbb10871219d6e4abfe10b511132f60fd6b30a84835e99960` |
| `.tmp/malay-lexical-accuracy/run-final/candidates.json` | 1 | File content | `e1043a827f8fb9532d07a6315c4214b114293bdb35764eccef064e4354e1bbf2` |
| `.tmp/malay-lexical-accuracy/run-v2/candidates.json` | 1 | File content | `ccfe446dc90e593ab366c87b41d463222332bccf5516f123926c6b090d613961` |
| `.tmp/dictionary-benchmark-run.mjs` | 1 | File content | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `.tmp/malay-complete/benchmark.mjs` | 1 | File content | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `.tmp/malay-datasets/dictionary-benchmark.mjs` | 1 | File content | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `.tmp/malay-deep/dictionary-benchmark.mjs` | 1 | File content | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `.tmp/malay-lexical-accuracy/benchmark-after.mjs` | 1 | File content | `8c76f66497af29818333aefee2c143aea619767ce3f73d076256095fc01775d6` |
| `.tmp/malay-lexical-accuracy/benchmark-before.mjs` | 1 | File content | `160495ea648ff996e5f846f053f79fd09e9170dfaad019fc5ad21bc8265f0870` |
| `.tmp/malay-complete/pilot-v1.jsonl` | 1 | File content | `b10f087ac306c62d3ea70cb4b1d3be037f4c07ce5b14b5ae792fee533926a7ec` |
| `.tmp/malay-complete/pilot-hplt-beam1/workload.jsonl` | 1 | File content | `3a3f446506ffb24739cdd5162403b448170ee99aba8fe79db1ac4a2d9fea0226` |
| `.tmp/malay-complete/pilot-hplt-cuda-fp32/workload.jsonl` | 1 | File content | `3a3f446506ffb24739cdd5162403b448170ee99aba8fe79db1ac4a2d9fea0226` |
| `.tmp/malay-complete/pilot-hplt-cuda11/workload.jsonl` | 1 | File content | `3a3f446506ffb24739cdd5162403b448170ee99aba8fe79db1ac4a2d9fea0226` |
| `.tmp/malay-complete/pilot-hplt-fp32/workload.jsonl` | 1 | File content | `3a3f446506ffb24739cdd5162403b448170ee99aba8fe79db1ac4a2d9fea0226` |
| `.tmp/malay-complete/pilot-hplt-v3/workload.jsonl` | 1 | File content | `3a3f446506ffb24739cdd5162403b448170ee99aba8fe79db1ac4a2d9fea0226` |
| `.tmp/malay-complete/pilot-m2m100-v3/workload.jsonl` | 1 | File content | `3a3f446506ffb24739cdd5162403b448170ee99aba8fe79db1ac4a2d9fea0226` |
| `.tmp/malay-complete/pilot.jsonl` | 1 | File content | `3a3f446506ffb24739cdd5162403b448170ee99aba8fe79db1ac4a2d9fea0226` |
| `.tmp/malay-complete/pilot-v2.jsonl` | 1 | File content | `2d84f82802ecb5a0f750593b16e2e2c6a862a1b945c4d6bdef374d74087a6881` |
| `.tmp/malay-deep/new-m2m100/workload.jsonl` | 1 | File content | `869acc6931dc1dc8fff1b0da1c7fe3c6989d6acae3d09f5ddb1dee3b46319de4` |
| `.tmp/malay-complete/surname-hplt/workload.jsonl` | 1 | File content | `8512a9fc0953f4249977b51e4727fa3680b78023c77362ed2d88b5df4618ed4d` |
| `.tmp/malay-complete/surname-tasks.jsonl` | 1 | File content | `8512a9fc0953f4249977b51e4727fa3680b78023c77362ed2d88b5df4618ed4d` |
| `test-results` | 4 | Subtree metadata inventory | `0b7342deba43b95a7ff91f56e7be522d1036893eb8fbc39917185c7243714ad5` |
| `.tmp/malay-lexical-accuracy/live/家俱-chinese-phone.png` | 1 | File content | `fabc55258f5829eafc896351f88a0b5b4caf5e04e1df2b113c97f2df3a73dc4a` |
| `.tmp/malay-lexical-accuracy/live/哺乳动物-chinese-phone.png` | 1 | File content | `785833d1c186dd63a8cc40282acd014ada48071c2b2fcedd7fe4bdcfc3f4cdbf` |
| `.tmp/ipad-responsive/after-longest-headword.png` | 1 | File content | `b773d7393bb174c286b149cb550b5a2d8e0e7697ab1d1fa87cd876c09ee8bb58` |
| `.tmp/ipad-responsive/before-820.png` | 1 | File content | `18cd2d246422d513476aa45aa0c4b69553c382a4395baa10b8dac98dcd3d903f` |
| `scripts/malay/__pycache__` | 6 | Subtree metadata inventory | `5975b2c28ee3651198c6ea4c6c1a59f0e3560b17aabe4e7c28fbd2649fe2f10f` |
| `.tmp/teacher-language-browser-final` | 4 | Subtree metadata inventory | `c0351e9a56576f9d7d6c6969a030f00236f93a1bb4e33f190516fa5bd5b865f7` |
| `.tmp/malay-rejection-test-0RYq6A` | 9 | Subtree metadata inventory | `9146c39732ffb2df9737be008b7e5f4bc9619728e1657fc96a6c857be4433205` |
| `.tmp/malay-rejection-test-37sFqd` | 9 | Subtree metadata inventory | `f5b197ef5f535150b840958b0eb12d5c6c5edd5accd3f45f706de628f7407c26` |
| `.tmp/malay-rejection-test-4xpnc2` | 9 | Subtree metadata inventory | `f6ef4990327956451cb958998f4e19e2f8e14d569686576169870acb7d998d46` |
| `.tmp/malay-rejection-test-7HoJQT` | 9 | Subtree metadata inventory | `3224cc9cfc00ca9012aa73ad8c53dcaa8c7ec9153a584236bd4b25f4779c9b6a` |
| `.tmp/malay-rejection-test-7vycwi` | 9 | Subtree metadata inventory | `938d82a768681916fed34d326e2b91068558057b4b7f8b8978480e859aabbba4` |
| `.tmp/malay-rejection-test-8D9aaj` | 9 | Subtree metadata inventory | `22cff7ad3d61d70dfafcc1b813f50a2ca6c8d9aae01c7dfd3a99e6facb167076` |
| `.tmp/malay-rejection-test-a7MVQH` | 9 | Subtree metadata inventory | `1165ae1fafef003adc412d46c1fe4c34e095eebe2498b7caec2883346577b24f` |
| `.tmp/malay-rejection-test-AbBNIv` | 9 | Subtree metadata inventory | `533aa93ece351ba2aa4026bdda853917fd410959a0b95b6a8de19cc8db552be6` |
| `.tmp/malay-rejection-test-aeRLjD` | 9 | Subtree metadata inventory | `4c19982bb4c6ec2ee73e313350ff9724106f9e3771390c40f0e580f5ebd3136a` |
| `.tmp/malay-rejection-test-AZ9ADz` | 9 | Subtree metadata inventory | `5447eb2aef3c2ccf1d568fe2b05ded4992bcf92012acb00a6e8d3f8371abdc24` |
| `.tmp/malay-rejection-test-gBNUZZ` | 9 | Subtree metadata inventory | `d64c8c7938ba35ffbd879f3072dba61383ab86c29316226a3fd29184323d2919` |
| `.tmp/malay-rejection-test-gD27nw` | 9 | Subtree metadata inventory | `556d027352955361b513452c9007573ce3379ebb458fd096cecb121241c687a8` |
| `.tmp/malay-rejection-test-GocRD8` | 9 | Subtree metadata inventory | `b3a5a0715c6ebf9141fe2155b86405358ee8606df9b972fac0eaee7de5a3cd99` |
| `.tmp/malay-rejection-test-gU2QoL` | 9 | Subtree metadata inventory | `b6a93b81f55e83ce9fbdeacdbe3e2f833c7a06fdf351b23d4bd19ef63964fe8b` |
| `.tmp/malay-rejection-test-gUiHKP` | 9 | Subtree metadata inventory | `187e5a628085b26701443fcf528e5e72c65fc2aeba85957131d7fbb2496cd020` |
| `.tmp/malay-rejection-test-KUaQBN` | 9 | Subtree metadata inventory | `e79d6fc2e1f824325d4c728aa7e3cea174266a0710b8cc3f2c6593df2d5e9729` |
| `.tmp/malay-rejection-test-L1uC3c` | 9 | Subtree metadata inventory | `c0f5789d79bbaed88d8a9786febab5d9b83f0a83073032de01be534c3aaf80fd` |
| `.tmp/malay-rejection-test-mRNTjT` | 9 | Subtree metadata inventory | `b31ab3a9635174f9ae1b07751962c57cec7c0b45cfeecda09898bbc353d44a30` |
| `.tmp/malay-rejection-test-NM6reo` | 9 | Subtree metadata inventory | `fff6cc0f7380c314a47b35b4b6132be6afc69dca3165e07e4f6eb21d9f61566a` |
| `.tmp/malay-rejection-test-PqoyS3` | 9 | Subtree metadata inventory | `5864c3399eeb2cb9c424842b61f6193d146f5372328bc8cbddfe847e714a12f8` |
| `.tmp/malay-rejection-test-U0AsXs` | 9 | Subtree metadata inventory | `4ed070b1bae0140eba5824057b6b7a865f402eb5deaf16c1f9f05b71d98e6dad` |
| `.tmp/malay-rejection-test-UKIYsO` | 9 | Subtree metadata inventory | `235d023b93f8c2b3e4ce928fc4b82442ba798a44ee6cee3c22611de94ebb8e4a` |
| `.tmp/malay-rejection-test-UtuARy` | 9 | Subtree metadata inventory | `73401333db7edf76848ab3225a4adc71959deaf552cd3506c8f05d4378039635` |
| `.tmp/malay-rejection-test-wufFUQ` | 9 | Subtree metadata inventory | `aa8cccd2944af46b4bbe31de9f9e8b2a774c6e58fac6c328d1119852f3febce7` |
| `.tmp/malay-rejection-test-Wy0tNl` | 9 | Subtree metadata inventory | `bcb9eea42114fd58f3475bf0ec3b2143cef7fcc44f4ff42e8bdcbd2753784042` |
| `.tmp/malay-rejection-test-yxzY8c` | 9 | Subtree metadata inventory | `3c07cf70bc820132d003179c24fa03556edca061caad955528be955a05d01c70` |
| `.tmp/malay-provider-test-6KGqpd` | 6 | Subtree metadata inventory | `2dacb96d6ad0dc502745fbb6575ab5d3bb64cf0a05386f29ed03b17e5df38a8e` |
| `.tmp/malay-provider-test-A1QCnH` | 6 | Subtree metadata inventory | `660d3832c7ee350f73894563e7548745863d3bafe7c896490ffa27ced6228fb1` |
| `.tmp/malay-provider-test-aqVPrU` | 6 | Subtree metadata inventory | `557c18374904a3dc7eb13536688485d283967d9a0b67c0779f9c62571a3f2fde` |
| `.tmp/malay-provider-test-fBJwgJ` | 6 | Subtree metadata inventory | `f80cb0749f0004d37833f7d5bddcb95a349e7f4f797d75c5b8d7cc8c3a5357ce` |
| `.tmp/malay-provider-test-FGQA6L` | 6 | Subtree metadata inventory | `162aafa0b9db17aa1150eca40643139cdd742101779b9b501ed21048237b4d00` |
| `.tmp/malay-provider-test-gsehyy` | 6 | Subtree metadata inventory | `8a692786b1550fa7475f592c3762dda0292cb70f2a8b7c0c7a268e38785f02a9` |
| `.tmp/malay-provider-test-I8Ffec` | 6 | Subtree metadata inventory | `90b3e55f515413db383daf3e42d7e69327bfb6f195075839fa30f53d527969b0` |
| `.tmp/malay-provider-test-imOpcl` | 6 | Subtree metadata inventory | `751d39ba87d0cae2db02a9120542ad9c4f031bde9fbc8154f0ebe920c6f4b9c7` |
| `.tmp/malay-provider-test-kFLuqe` | 6 | Subtree metadata inventory | `b50c4479699fe5ed52186a9338ed124590bb2ee53ad808e9fc109a80d38d9ceb` |
| `.tmp/malay-provider-test-KqsYRr` | 6 | Subtree metadata inventory | `ca3abc94cf5a8ceed694bb3b4955301abb6418e9ae065402d01ade8491599a89` |
| `.tmp/malay-provider-test-MX6fvD` | 6 | Subtree metadata inventory | `8eb1deb3e1d5af8f60450f44de91ef8c90e2ba44dfb539b65d5b571e72425e2b` |
| `.tmp/malay-provider-test-n5ejZt` | 6 | Subtree metadata inventory | `55d21cdb4c35c44b50d81c8e9709e27235afa21ab1fb34733b1c6ef4e8de7bda` |
| `.tmp/malay-provider-test-oud0gk` | 6 | Subtree metadata inventory | `61970dff852f9b4be6298f2010b8e877e6f08da0a64d920fa41089c3a164ecea` |
| `.tmp/malay-provider-test-oZHCB5` | 6 | Subtree metadata inventory | `5c21ffae7ea8f16e9c9d4af10079d8d7d75845b642854a1fa6e20a243b7c6496` |
| `.tmp/malay-provider-test-Px17OE` | 6 | Subtree metadata inventory | `11230cf897f858967eafb34fd992efe03d02d2aaf9c22e2a640e1d908adf0daf` |
| `.tmp/malay-provider-test-Q7g8Sj` | 6 | Subtree metadata inventory | `41f976f93527f915c62b9485df6760862e57469dae25ad491918611fae70ef3f` |
| `.tmp/malay-provider-test-QY0ptR` | 6 | Subtree metadata inventory | `81aa90b9270ecb640d521d69c9cbbffd0f2b6ceca18ebd3697cf26dc152aa8f1` |
| `.tmp/malay-provider-test-t5LkIj` | 6 | Subtree metadata inventory | `5ef135460cad83e64d7f50db22f30f90fb535ca6a1bcc5a01f11718e09b3d117` |
| `.tmp/malay-provider-test-Tfv9Sh` | 6 | Subtree metadata inventory | `64933b9101cb9560e6c20f4761fff0a964c6573ca50f153ce9f8effd2874102b` |
| `.tmp/malay-provider-test-V0eO9r` | 6 | Subtree metadata inventory | `792f4c756607c35a3be2df261c004266a8ce9ec2f67ecd3505d71a409d228d4e` |
| `.tmp/malay-provider-test-V9uFRF` | 6 | Subtree metadata inventory | `e122a5558395b7c4f802557278fafd7523ec3925bb1f28bb7dfa9f565d6a42cc` |
| `.tmp/malay-provider-test-vwUzf2` | 6 | Subtree metadata inventory | `f02bda28c7454b8dfb1fadb2da90230ac8957638c47a2582ffb9a624af7545b2` |
| `.tmp/malay-provider-test-WJzBbC` | 6 | Subtree metadata inventory | `928bf83d0cc8a6071b4ae1f7bbc42a468098c912c470531d7a70f8cab0c39591` |
| `.tmp/malay-provider-test-xlyWUp` | 6 | Subtree metadata inventory | `2003d98831544cf63885151d85f06ea4bf220b062f443db534042820abf3116f` |
| `.tmp/malay-provider-test-yhxb8D` | 6 | Subtree metadata inventory | `84f2ac9788d3bc82a07f2418d1992ad7fcf7c21907394a7da6cd6f8734de1154` |
| `.tmp/malay-provider-test-yHzNbf` | 6 | Subtree metadata inventory | `5b7d36d4652196aa17b9160e9145b018de173f3969b90e5e5bd578d0ce68fe6a` |
| `.tmp/malay-provider-test-yjdX1o` | 6 | Subtree metadata inventory | `1e2feafaae9e162141d49b5763d85e74cb63ad9ec75c00f2f00b1d7078d211ae` |
| `.tmp/malay-provider-test-Zb2JHf` | 6 | Subtree metadata inventory | `e20acf8ad74beb8e77553a4ec5040697e4073e63dc2567bb3f1a2f80a5602e08` |
| `.tmp/malay-provider-test-0zyptF` | 4 | Subtree metadata inventory | `8d6c0184fba8ad8bf8a2c9b6d69fbda815af6bf826b10ff1eab036f647388b89` |
| `.tmp/malay-provider-test-5R50C1` | 4 | Subtree metadata inventory | `f485cc48e8cdf34278fd0df814050d965a14638c9633bf306642bab63e4efd21` |
| `.tmp/malay-provider-test-AY8VyK` | 4 | Subtree metadata inventory | `10125f217cf0dc72dd5ed28e06bdd3f9cbdce6538cfdee606d13c4403acd5920` |
| `.tmp/malay-provider-test-snQxSD` | 4 | Subtree metadata inventory | `6bbc654f91f17de0a19e134cc2555f27c04a24f312fabb3d47fc1eca03cec081` |
| `.tmp/malay-provider-test-zegh6Z` | 4 | Subtree metadata inventory | `475652e0b444b4b9f4bbee01e28cec885504eae99a71cc741ecc05a5b48bd6c5` |
| `tsconfig.tsbuildinfo` | 1 | File content | `2e793315ecf3bcc3067d79c4a075fe81e84031eeabfa8921535bec8a6276b416` |
| `.tmp/malay-budget-test-39XP9k` | 5 | Subtree metadata inventory | `39a6f71ca4ef4185283706f3b5e7c8810d4e1b6e8b443f66f97f9ac03f06f5b4` |
| `.tmp/malay-budget-test-5ZGx3R` | 5 | Subtree metadata inventory | `2142b82a44a7dc64dc9848e1d2f453931c834ae852a60a08085508a7b9eb961f` |
| `.tmp/malay-budget-test-9FPg3O` | 5 | Subtree metadata inventory | `9d083c554e2654cf85fb1fd87f81f09e98ab7776ffe3cac5e2251ffe006c3fb6` |
| `.tmp/malay-budget-test-b7Q7vj` | 5 | Subtree metadata inventory | `8d49428b058751de7c44256033aee698837b0dcdf0cee46a6c8fb85f6ec0af6a` |
| `.tmp/malay-budget-test-cQpxyM` | 5 | Subtree metadata inventory | `710298f62991f3591b5bf06c0d806cc2a5e17ea4104af41693b696597a0ef597` |
| `.tmp/malay-budget-test-hBOEF0` | 5 | Subtree metadata inventory | `634cc7f5c80aed3f66f06af8567e4773215818fadca7a7cd929ba8a6cf530346` |
| `.tmp/malay-budget-test-K8EQfl` | 5 | Subtree metadata inventory | `2228bbd278347197a9e721c0d7bef34f117fcf2f17b3716a31efa9ca4f12b0e3` |
| `.tmp/malay-budget-test-kXfs2h` | 5 | Subtree metadata inventory | `07b94dab18a4923c5c8f9b3f9a0e5b44695ca21a3315a4b68a7ae78435548f11` |
| `.tmp/malay-budget-test-sxr5dJ` | 5 | Subtree metadata inventory | `314c7a564259be5702a07361c4c35767158830605212adf23941882cbe63078f` |
| `.tmp/malay-budget-test-vV6UyD` | 5 | Subtree metadata inventory | `bdbe2e47d1e392f3705c0adee00762e32293a48f15a56f7a9085573b5877e5c8` |
| `.tmp/malay-bulk-test-0i1dYn` | 4 | Subtree metadata inventory | `eb2d42e998d36db9e0a49488e643be1719b094c026b802d30319b460c6b43ab4` |
| `.tmp/malay-bulk-test-3dTDVW` | 4 | Subtree metadata inventory | `d698a47bfecfbea488f56c10af941864f5a90671fd000f8ed9b7391840453298` |
| `.tmp/malay-bulk-test-5PGyzT` | 4 | Subtree metadata inventory | `725b36a0afc0d6d867ce587f87ecf54db4e47b107db0248d54d8d3bc2b35e3ae` |
| `.tmp/malay-bulk-test-78BUDJ` | 4 | Subtree metadata inventory | `e7e57c021b6fdcf47fd0ae06fa550c1a9d850e4ec77a246eddef9e12272ecd11` |
| `.tmp/malay-bulk-test-7mUELF` | 4 | Subtree metadata inventory | `203bff8529b82a888d374b2d516223e0f57bb51e3b648b0ce9e63ec339395d64` |
| `.tmp/malay-bulk-test-AFYJmh` | 4 | Subtree metadata inventory | `bf787d27b29a80dad445a2dc28acd076d539c51f69d97f30d7d2e03b03cd7817` |
| `.tmp/malay-bulk-test-aPxZcZ` | 4 | Subtree metadata inventory | `1351596f0ef5184b6671a70ed23fbc282c57c5bf0052adbe42b06fb4e05b5da2` |
| `.tmp/malay-bulk-test-ArsyuB` | 4 | Subtree metadata inventory | `de23e105252bd1a30f0a62e2d91d69edb50a6b5548ee2829c3071783fbc41e78` |
| `.tmp/malay-bulk-test-eeQjaP` | 4 | Subtree metadata inventory | `5dd337b2ff775c0af8c2401dd7785d3edeef3fcf1597a054e34dc7842ea9a4e2` |
| `.tmp/malay-bulk-test-JutQsY` | 4 | Subtree metadata inventory | `a1a2bf6ebb14eda7842064d7bf2b43df27ca9ddd360ce49303c1d6e5fcad4c06` |
| `.tmp/malay-bulk-test-oyvViq` | 4 | Subtree metadata inventory | `251f9cca7a2c0ce304d3a714d1fc1346bc3d4d4f16199a75e239e79aeff81637` |
| `.tmp/malay-bulk-test-QAx671` | 4 | Subtree metadata inventory | `8dbbb1bb07eb04fdbb0d5bfb6044314f6a015191a44dd92678d64f10cfb0a25e` |
| `.tmp/malay-bulk-test-qhz9zq` | 4 | Subtree metadata inventory | `d3ff9205a6fa87640e54f203bc6a68d7a242f1152a3b3f15c4cfc18f3b28c0a4` |
| `.tmp/malay-bulk-test-RczYbE` | 4 | Subtree metadata inventory | `37664339b3c8d1db8ea46ee7f5d9097f61b50a925d48048a7351837cbb984d9b` |
| `.tmp/malay-bulk-test-s2sied` | 4 | Subtree metadata inventory | `25fa98a68e04cfe0145169309d2b392fe7696bb17471500bd629582643007547` |
| `.tmp/malay-bulk-test-t8aaxe` | 4 | Subtree metadata inventory | `1cee0385d4188858d1217f4a917c998503fa6fac0125188add10c62a5de60335` |
| `.tmp/malay-bulk-test-t9mZUt` | 4 | Subtree metadata inventory | `91c4cedbbd0721fc6290928b0f2f6d5c501b550808c9cf276a39270c45fd5c20` |
| `.tmp/malay-bulk-test-TVcFAg` | 4 | Subtree metadata inventory | `b2087e9b07275b3877800584e5fc712d343db9640dac7ea4f2cf25d031d99484` |
| `.tmp/malay-bulk-test-xQWZ3T` | 4 | Subtree metadata inventory | `236147be90e38bad02fe47e8eb6e6cf7b6fdcabd0783f2aab52518f93eeb0fdb` |
| `.tmp/malay-bulk-test-zPNsvr` | 4 | Subtree metadata inventory | `57919f381f6ff486f5f5e43cb59ef6c728c52e8a2081aba329e5c7f29f64b10a` |
| `.tmp/final-predeploy-browser-results` | 1 | Subtree metadata inventory | `31e4dfa336ca6d0b9e54bf4f3a3780f400c6971036f0d9358533cb738ead4526` |
| `.tmp/ipad-accessibility-results` | 1 | Subtree metadata inventory | `c21d2d20e21fcc4885702f9c4e3f9f6e4526e0ad65b65fd9bc1f941cf9921aa3` |
| `.tmp/ipad-existing-results` | 1 | Subtree metadata inventory | `56bed86f6e7833e1737d4e1fbd272a399a16d05154ae39489ecbaa5037a37998` |
| `.tmp/ipad-webkit-final-results` | 1 | Subtree metadata inventory | `35cab632a1aff7c04ee3a3f90153513f0449d6c751e15354aba3164bc67e2bd2` |
| `.tmp/malay-budget-test-14vQBD` | 3 | Subtree metadata inventory | `1719ebfe1d9372420ed80f3c68d338bc0543388ca3b14b3cb35d7b8e4c8315d0` |
| `.tmp/malay-budget-test-3kUExn` | 3 | Subtree metadata inventory | `cf982aba7675a24a2d346da733ae20c5c24d93088a5526d6d6115cee1b51d3b0` |
| `.tmp/malay-budget-test-8D5jHI` | 3 | Subtree metadata inventory | `72cbb963db4e03f3fadb73faa80f25abe4952c47b1e99c9e256e10e18a8103cf` |
| `.tmp/malay-budget-test-B9jBLn` | 3 | Subtree metadata inventory | `ee7ccc68e2000c53e2c132efc1f000d3747f64c34a1723dab7a5121c6681f52c` |
| `.tmp/malay-budget-test-c0ixtu` | 3 | Subtree metadata inventory | `a549d8d9588505226281208d6da57eeb85bdc0acc1cf8bda65735421bc33f032` |
| `.tmp/malay-budget-test-HDg3Yp` | 4 | Subtree metadata inventory | `6201d8e95b72b9dc7dabc182958d1cca897e5bc0b57b15eacb8edc4d03ef7f7a` |
| `.tmp/malay-budget-test-hrEdne` | 3 | Subtree metadata inventory | `5ba8ae814c6f69db62b72e56433255c8b59510ed9a853d6653617a7365427cc1` |
| `.tmp/malay-budget-test-iO15Jo` | 3 | Subtree metadata inventory | `cc99afbcdf8f026c924359d795d0a60940f7e6f54bfabf9ae696900ce2451d7e` |
| `.tmp/malay-budget-test-iRU97g` | 3 | Subtree metadata inventory | `b4382552cd1d4070e8a97952f835f7597eb8305e9f9558cbf61b33d0e98c1fa6` |
| `.tmp/malay-budget-test-LiNWEf` | 3 | Subtree metadata inventory | `07b1dbdb50f90669683564508dbdd0caff0ba18124526b5a499beda1e2c67305` |
| `.tmp/malay-budget-test-N3DCBH` | 3 | Subtree metadata inventory | `0c2be487308ca59667ef30f95a4340c392e193ab7be61a8c8ddc324d73daf568` |
| `.tmp/malay-budget-test-n6I45u` | 3 | Subtree metadata inventory | `d7aa914b9e2cda58f0ef1338576292b9aee0c3e5166a2723ea28f3e2b814a0d7` |
| `.tmp/malay-budget-test-PLiBRc` | 3 | Subtree metadata inventory | `3afade697a0deff7623bee9ca4570ca8607cc493a7b64701ccc52e572605710b` |
| `.tmp/malay-budget-test-ppu2Vj` | 3 | Subtree metadata inventory | `e12ca0077bb1338d7de747c60cdcdc59f45f281c563ca596274c0bf5efe679e3` |
| `.tmp/malay-budget-test-pryXio` | 3 | Subtree metadata inventory | `b985b3e06afadaa3bd4e50a96e0168f55a4aa34e7dc74c3f1cc1fce87220f1e1` |
| `.tmp/malay-budget-test-QziRd6` | 4 | Subtree metadata inventory | `4596a3d74a500667a5fd0407fd95499ef27531feb3beb232aec956ee0e35c6b4` |
| `.tmp/malay-budget-test-sQfhtO` | 3 | Subtree metadata inventory | `5376b590abbb4bed1c3897eaf1c3bc044f7436e56afd49791864dad9000dfe50` |
| `.tmp/malay-budget-test-wiaOK9` | 3 | Subtree metadata inventory | `23b5efe1125c78e9ba7bb862ee368ec4b694ea07e920fcf818809be2cf34b971` |
| `.tmp/malay-budget-test-xuCswo` | 3 | Subtree metadata inventory | `e73952f88f3cc365ff65bf86c682e1e607237f17296a93220e1b1da451e8c04b` |
| `.tmp/malay-budget-test-zeg4YH` | 3 | Subtree metadata inventory | `cbd24114c2afdd6eea0fbe2a1e8b035e2c4d636aab7e1fcb9057aeaf32d2c927` |
| `.tmp/malay-bulk-test-0k4bWV` | 1 | Subtree metadata inventory | `0f1caa70b176eed27b4b626df51bcd2be93686e61ded8517e25a05ba177ddbc7` |
| `.tmp/malay-bulk-test-0pCrTh` | 1 | Subtree metadata inventory | `308ec701bdd3c44a7b246aae58a2b3346d48e9b14b26951a3442d5f19521df70` |
| `.tmp/malay-bulk-test-3WnALM` | 2 | Subtree metadata inventory | `3237bb071803da84fba6de10ceb2fdfb82bb0e8204f0f9de471d33809dc927d9` |
| `.tmp/malay-bulk-test-4ZK7fe` | 1 | Subtree metadata inventory | `95c814a3680ba92248c45bb8caa2a0c94999dcf4f5c5b013c49d8c10eb700a6e` |
| `.tmp/malay-bulk-test-5zdyxP` | 2 | Subtree metadata inventory | `4567fe9c485d32069b74f2985de1b6e6ecd4c6b1d2be55cf5b38c811f57c8e0f` |
| `.tmp/malay-bulk-test-66b8jd` | 1 | Subtree metadata inventory | `0d30d7f75c28db3526c4ba5040df8fcde7c1e619d489f0968367f31a4ad9d201` |
| `.tmp/malay-bulk-test-6Mfx7H` | 2 | Subtree metadata inventory | `046aa7ceb229b578e2c8c77ee5cc42755bc58920d84a1960d42c6c50216c83d4` |
| `.tmp/malay-bulk-test-6trXoW` | 2 | Subtree metadata inventory | `23c256f22c411aa64c8e2a97ffd1626605137d2ae196234f39a43dc69c9f77e4` |
| `.tmp/malay-bulk-test-7CM663` | 1 | Subtree metadata inventory | `c0ebf84d48ab9a1e8626e514580ed9ff9a36ef64b09e5b93dc6f47a3fadf772a` |
| `.tmp/malay-bulk-test-7KrwLn` | 2 | Subtree metadata inventory | `eaac7fc883974624e36a37efe909d8cbfa03b1a8fee7f729932e8cb4a7f0ec2f` |
| `.tmp/malay-bulk-test-9eh25V` | 5 | Subtree metadata inventory | `a6bc3b91b7a71a8b07cc28f97435b9187cf44f36012ec64a0dda1dfd38384012` |
| `.tmp/malay-bulk-test-9kZ5L4` | 2 | Subtree metadata inventory | `ffb844ca7f549800fc39bce4e8bdaff723b8210bb786c10615643c0abc379dd6` |
| `.tmp/malay-bulk-test-AyHVVJ` | 2 | Subtree metadata inventory | `39bbb670f0bdcdac3c90d2259b9e2ff626272b905e4e98bdd0b2a6ab88040374` |
| `.tmp/malay-bulk-test-BALcPr` | 2 | Subtree metadata inventory | `4a84ceb95b95303e707f2441402b55832b53f16467e95f9ac04bed8586a4d1fd` |
| `.tmp/malay-bulk-test-ckcLWT` | 5 | Subtree metadata inventory | `e8c9bc695303e0de8c427865fd8e3848caf1d371925081e27ca7277e4b8cb4d9` |
| `.tmp/malay-bulk-test-dBr3Qy` | 5 | Subtree metadata inventory | `af15702d0142f1f1b7d36e3698b26c33402f66ef23d67b8576978b85ea3ef93a` |
| `.tmp/malay-bulk-test-ERgNDP` | 5 | Subtree metadata inventory | `00700bc5289edca39e93ed17ff821669b2f41c2f1e42f80ec779feb6dccc30fd` |
| `.tmp/malay-bulk-test-fNoWG2` | 1 | Subtree metadata inventory | `12103fc7f7222a291d3430f8d67ab537ebe691b706f584f8efebed4fffd71ec2` |
| `.tmp/malay-bulk-test-fwQMr1` | 2 | Subtree metadata inventory | `71caf621e51c61619fc1aadf4d1876ddb3b352a5b520c73424c8103e2b5a96a6` |
| `.tmp/malay-bulk-test-g42ILH` | 5 | Subtree metadata inventory | `cf38a8f844cbb3520f09b6a75c8abfdd7387c5f0e882f9731be456c4093a4116` |
| `.tmp/malay-bulk-test-gu6Ktw` | 5 | Subtree metadata inventory | `e3f46bce36ab042e39276100009e79b8241edba2d974882b4d226fd7c0bcca66` |
| `.tmp/malay-bulk-test-hAhOcp` | 5 | Subtree metadata inventory | `da9d184ba77307a613d23fefa39b34bec44856be3719395ace1521e595b9702a` |
| `.tmp/malay-bulk-test-hs7NYa` | 1 | Subtree metadata inventory | `edadeb153b1036d720b2f33116acc410252501a22ea2b570d8f60f2c0ed20df1` |
| `.tmp/malay-bulk-test-IF0XM4` | 5 | Subtree metadata inventory | `ede5456588bb532e0fb70bec97ffeedd202f2b932a9f02cf6c627f6e10f21e2b` |
| `.tmp/malay-bulk-test-jdghdv` | 1 | Subtree metadata inventory | `af578a2e0ddddf96d7f30850e7983a2b31dc09cab7fbb511bfb9e8bea0204ecf` |
| `.tmp/malay-bulk-test-JoHaRY` | 2 | Subtree metadata inventory | `4ac1ce29057d01583df7cbda7de4a7784991266fa7818f77f44a749b36087142` |
| `.tmp/malay-bulk-test-kl2ufj` | 5 | Subtree metadata inventory | `42d113e22527d58d1ee1d54043843abd70f940b74ed5dc38fb98e37fc9a074af` |
| `.tmp/malay-bulk-test-Kqk1oA` | 5 | Subtree metadata inventory | `b2e6ce6f42601c809a58c00da1abdfe348d71353e5272333ab11ef48b673d12c` |
| `.tmp/malay-bulk-test-KSyyox` | 1 | Subtree metadata inventory | `bd93b64ae7dfb6be4baf6be52f91481e4faf03d160795f660eabaca9ae3caeae` |
| `.tmp/malay-bulk-test-kX3AEM` | 5 | Subtree metadata inventory | `c6ccc5dca58d45d482c084f235ea67f2e49b21c87003cd04dfdd2447b31cbb0b` |
| `.tmp/malay-bulk-test-KY8joL` | 1 | Subtree metadata inventory | `b88ccaba18e11986d81d92293dc2620400d0683666722d21b209b6ee2934796f` |
| `.tmp/malay-bulk-test-LWpTzj` | 1 | Subtree metadata inventory | `61acc04f54d77cd2dcbed605d07a67a72b9d2ef647787c372a90b35c2f09034b` |
| `.tmp/malay-bulk-test-mKzL3t` | 2 | Subtree metadata inventory | `68e278f026b4e9aa4e84c427823947655353230338b24c1616c79cbad5e374da` |
| `.tmp/malay-bulk-test-O0EG09` | 5 | Subtree metadata inventory | `6ece7cc874852cb827595b2c607386f4b1011297faae6bd1a2e9382e30f7fcbe` |
| `.tmp/malay-bulk-test-o824aU` | 2 | Subtree metadata inventory | `c37dd47b5c9fc76547596fa057af65c42ecf95a70e8a765f465a2595d047704c` |
| `.tmp/malay-bulk-test-qkYMDS` | 1 | Subtree metadata inventory | `648730c6ab31b5c7682cdd9bbbdef449d2fa16aab240dbf10c8074315268c2c3` |
| `.tmp/malay-bulk-test-QvLyo5` | 2 | Subtree metadata inventory | `c83bd698f43b9cd872bf1f79c405d0a7ce8021fb3117ad3f9791ccf516bb93d0` |
| `.tmp/malay-bulk-test-QWz2Vy` | 2 | Subtree metadata inventory | `f80529193632c5013821ad7b833e9f006ac00af08ec891cb49252f40360be3bf` |
| `.tmp/malay-bulk-test-RhjDWj` | 2 | Subtree metadata inventory | `7d6d9dd72013c23bdae32210cb0cfd48ce091e6ef5715553a1ec63105a0144d0` |
| `.tmp/malay-bulk-test-rIBqLH` | 2 | Subtree metadata inventory | `b5ec3931fe1fe3d835875f948cc5c03cd15190cc1b2a29fe6f81eb441297c82b` |
| `.tmp/malay-bulk-test-rIropR` | 5 | Subtree metadata inventory | `c4caba50ca79d2d024134eb9031af4297649292d020a4b6896de1ee690eae824` |
| `.tmp/malay-bulk-test-roHTXF` | 2 | Subtree metadata inventory | `793585728ba6d61f322bfd6c9bc790e7f7a87d22279d39cd47b2120efe891d70` |
| `.tmp/malay-bulk-test-rrTzPJ` | 2 | Subtree metadata inventory | `fead713f1af796afb522e79d48ff769d407413a873ea7c7ef7d0a5e7de9faa23` |
| `.tmp/malay-bulk-test-SL9ORK` | 5 | Subtree metadata inventory | `69de0efe9a8cd01905808138d8499d141f21ba3034a0a037c8ae38c7ffe78985` |
| `.tmp/malay-bulk-test-t3o3Wr` | 1 | Subtree metadata inventory | `5321bc395f6751b5606517ac79a241a0ad031c4ec96c90783a46aa5bc4282c6b` |
| `.tmp/malay-bulk-test-tFtkGN` | 1 | Subtree metadata inventory | `bd7f8dbc9b0863fb05dba556e413799a48622b7aec75aca3ccfb54d96d8276e1` |
| `.tmp/malay-bulk-test-UCS94Z` | 5 | Subtree metadata inventory | `7a13caa459196d208d3c79d1a6584eb3fb539da5e92c89d76cf66640da587c54` |
| `.tmp/malay-bulk-test-uGPM9T` | 1 | Subtree metadata inventory | `ad1763d294c9b207dc980160878af407011b5767b0ed114536b958937a5bbea8` |
| `.tmp/malay-bulk-test-ujRVdE` | 1 | Subtree metadata inventory | `54015f9454e17d0e048fabd2fa1e4af619264692be554e6eb185336cc0a5d7bb` |
| `.tmp/malay-bulk-test-URwVnf` | 1 | Subtree metadata inventory | `7e15abec55be0e5645950ac3b977ea31bb79329efa8c39aebbd356e7ee079274` |
| `.tmp/malay-bulk-test-UWmQNs` | 1 | Subtree metadata inventory | `133893b341274ce522c3ae4208c019fd35e4d7a24baeb42112500f7d5090ea82` |
| `.tmp/malay-bulk-test-vd3Sny` | 2 | Subtree metadata inventory | `e7cf7e1f9e648c7db94c00bced88121580b27511e2c13898164c69861abf93b1` |
| `.tmp/malay-bulk-test-vEg5Xj` | 5 | Subtree metadata inventory | `9d29fd98e0853bc024297ff8ff7dbee235a670c26b5fea15bc8b147b7666c82b` |
| `.tmp/malay-bulk-test-wahJ8G` | 1 | Subtree metadata inventory | `ddb0769270dc298661e32c85f462e4553b9e7b31c3b55f80376b1684b1d5dd00` |
| `.tmp/malay-bulk-test-WFZ6H9` | 2 | Subtree metadata inventory | `288da713d23995d343a0ed747308d8691412fb5329318bf7631c828f7a798cc5` |
| `.tmp/malay-bulk-test-Whd8Bp` | 5 | Subtree metadata inventory | `6d58f814fc810d25a887c73938e41a761511a750cddd8f8ee58b1894721fe362` |
| `.tmp/malay-bulk-test-zCLRfn` | 5 | Subtree metadata inventory | `b8e3726e1b4a919cc0cc7e5b04e5a5e3303f9f5924059ef844b2d859a1fb342f` |
| `.tmp/malay-bulk-test-ZeCslT` | 5 | Subtree metadata inventory | `0d5ba92cf2ac402906d8565262d5cc303ef221f697026b2fdd59e83cd7fd59e6` |
| `.tmp/malay-bulk-test-ZmIgNc` | 5 | Subtree metadata inventory | `4b107202ac1d36e025fe57d28f07ae6c5c0d3c3a0126af47f9d27c35958da47a` |
| `.tmp/malay-bulk-test-ZVYvoh` | 1 | Subtree metadata inventory | `d85bb32400a46e3140ad6afa7b2e17f47293dbcd0cb807c119f75e7271e1618e` |
| `.tmp/malay-cost-policy-1kK5Gb` | 5 | Subtree metadata inventory | `589d918517fb4ac86c754e866fe0f922cc473849a1405878523a3f2c11f1c4ba` |
| `.tmp/malay-cost-policy-2KKgTx` | 5 | Subtree metadata inventory | `0fd037d1e91419cf6baf5b7822b7fcb9130d23baa6ff9202a6f20324fc0f5061` |
| `.tmp/malay-cost-policy-2kwy5E` | 5 | Subtree metadata inventory | `172acb4f81f15cc26041060b279bcddf9055b1c0066c076125e1aa39532b139d` |
| `.tmp/malay-cost-policy-35CI2r` | 5 | Subtree metadata inventory | `d2f555442346d4bade499a641e962180b90acf37c01d84de84b5f34f27a19b2f` |
| `.tmp/malay-cost-policy-7OpGEb` | 5 | Subtree metadata inventory | `430089bdb3967b592692289728bacaa4151d70027a4943223e45162df0e7cc62` |
| `.tmp/malay-cost-policy-9S6q8A` | 5 | Subtree metadata inventory | `85807d9b295857c74bcd4f44034a8f4e6a16413b4ac4fede25b3b31665f2a1bd` |
| `.tmp/malay-cost-policy-AK5q8B` | 5 | Subtree metadata inventory | `9fe122fead7f5f5821d1fc25f6c32e2ce0eea1a5f765b1cd43399356ee32a17d` |
| `.tmp/malay-cost-policy-chelyF` | 5 | Subtree metadata inventory | `e7af687e02b28c1ef29d9409bd72490f18c0aafbec2dd84ee68da811a13e7073` |
| `.tmp/malay-cost-policy-DM5cv1` | 5 | Subtree metadata inventory | `cab51d797b4d1649eabcdaea4dcba00bda267fa66bf04ac1dcedf62509f853f4` |
| `.tmp/malay-cost-policy-jjSYTz` | 5 | Subtree metadata inventory | `c9b605502ea32a2d6d2486b1a9f9a32844b98fedddf4fefdcf66385319c3674b` |
| `.tmp/malay-cost-policy-JZmTsl` | 5 | Subtree metadata inventory | `380c845ec12cd0f1ed28265456b6c3aabbe8a81b05a11baa40132e4a671291aa` |
| `.tmp/malay-cost-policy-ksXBOF` | 5 | Subtree metadata inventory | `faf5b4fe7697e0afc9b0490d8e09afc6ef78d99bec09aa7bd33efd6ce969a9b5` |
| `.tmp/malay-cost-policy-qKLkYM` | 5 | Subtree metadata inventory | `56b34968e1b2467e8a90f0d753f0dcb1390921628abad5c3172576664db8afeb` |
| `.tmp/malay-cost-policy-QMRuq3` | 5 | Subtree metadata inventory | `2772816baee5606d3399fbccfdea7a81cc124bd56e30846d05b3bfd788bd9f64` |
| `.tmp/malay-cost-policy-rSz9MT` | 5 | Subtree metadata inventory | `b2b29b55e553ee0b0e71d859bf50ff2e3be02aa2cbd8944fcdb0516943d5a1cb` |
| `.tmp/malay-cost-policy-tx2Hrm` | 5 | Subtree metadata inventory | `541ad887070883c4eb37086f83ba0c3becec4ff251cafcf0e077187ba832f87b` |
| `.tmp/malay-cost-policy-vjrbcj` | 5 | Subtree metadata inventory | `f2ea47226a0f6675049d4ef7c7465866de01a4c1f41cd1d5392ee11f4fd7cdbb` |
| `.tmp/malay-cost-policy-Y39lar` | 5 | Subtree metadata inventory | `5762096106d7247758be932212bfb355e1afd9870411369b066741dd0e03a369` |
| `.tmp/teacher-copy-browser-results` | 1 | Subtree metadata inventory | `b0a6cb3ce40d65fd3aba4deff068c1bc43d8f66b56d98582d23462a5db280aee` |

## 15. Safe execution in a subsequent approved cleanup

1. Obtain explicit approval for Scenario B or a literal subset of manifest rows. This report is not approval. B does not approve C, Group D, tracked-source edits, alias changes, shared-cache deletion, Git operations, a commit, push or deployment.
2. Confirm the resolved project root is `D:\Primary school simulation\mandarin-visual-dictionary`, branch/HEAD and current tracked state. Recompute authoritative hashes, the 379-file tracked-tree hash, counts and sense mappings before removal. Preserve any new user work and re-audit targets changed since this snapshot. Confirm existing private source/data recovery or arrange a separately approved backup.
3. Identify active project build/test/dev/inference jobs and allow them to finish, or arrange stopping only clearly identified project jobs. WMI denied Node command-line attribution during this audit. If translation machinery is active, report it and postpone affected paths. Do not stop unrelated processes.
4. Resolve each literal approved target, verify its exact case-insensitive boundary under the project root, and inspect all parent components for reparse points. Recheck file counts, sizes, metadata/content fingerprints, nlink and duplicate witnesses. Reject changed or new files, external/unknown link targets, hard links and any ancestor/descendant overlap. Never expand child approval to the .tmp parent.
5. For `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\vercel-no-git-cqqlvjlj\node_modules` only, verify it is still a junction to the root node_modules. Unlink the junction object using a link-aware nonrecursive operation (for example .NET Directory.Delete(path, false), only after verifying ReparsePoint). Never recurse into its target. Reinspect the staging copy for remaining reparse points before removing its approved literal parent. Do not mix PowerShell path enumeration with cmd deletion.
6. A future authorized executor should process only selected non-overlapping literal rows with native literal-path handling in one shell. Keep all witnesses/protected files. No unrestricted git clean -fdx, broad wildcard deletion, root deletion, Git object pruning, global cache clearing or package uninstall. Record any locked/failed/skipped target; do not force-close an unrelated process. Measure immediate reclaimed allocation/free space.
7. If C was separately selected, keep package.json and package-lock.json and reinstall using Node 24/npm ci before builds/tests/dev. B needs no reinstall.
8. Run the validation below. Newly created build/test artifacts lie outside this frozen manifest; measure them separately rather than silently adding deletion targets. Keep Group D and historical backups until a separate review decides their disposition.

## 16. Post-cleanup validation

### Data and build gates

- Immediately before and after deletion, verify all raw file hashes in section 4 and the existing 379 tracked path/content hashes. They must match. Require 125,173 corpus rows, 198,245 stable sense keys, 14,761 Malay records, 183,484 missing senses, 82 lexical supplements and the 55 starter Malay meanings. Recheck original gzip extraction, Chinese/pinyin/English values, exact sense mappings, all store metadata, readable runtime projection, packed lossless round trip and search terms/synonyms/morphology.
- Run npm run build once. It regenerates learning/Malay packaging, compiler state, native APIs, Vite output/offline shell and bundle evidence, and runs native image packaging, security, translation-cost and mocked Teacher checks. It must succeed without retired models/environments/queues/checkpoints. Compare authoritative hashes again after build; do not accept an exit code if data changed.
- Run npm test, npm run check:source, npm run check:translation-cost and npm run test:bundle. The build already performs type checking; run a separate typecheck only if that check was not completed. Broaden/rerun checks only if a change or failure justifies it. Tests recreate .tmp fixtures, so measure immediate and post-validation sizes separately.
- Existing import tests must preserve the accepted store/runtime hashes. Synthetic makna ujian fixtures must never be promoted. Do not run a real translation generation/import job.

### Application acceptance gates

| Feature | Existing or targeted validation |
| --- | --- |
| Dictionary and search | Dictionary/worker/client/Malay tests; Mandarin, English, Malay, spacing, case, typo and multiple-sense searches. Recheck all 20 canonical search fixtures and matched-sense IDs. |
| Missing Malay | Select an untranslated sense and retain English, Malay notice, existing display controls and external Google link. No automatic or persisted translation appears. |
| Gemini AI Teacher | Server/client/language/rate-limit/package tests with mocked network. Verify both sentences and synonyms/antonyms actions, schema/security/rate limiting and selected-meaning prompts. No paid live call without separate approval. |
| Copy Prompt | Prompt/button/clipboard/browser fixtures; verify selected sense, copied text and preserved results across viewport transitions. |
| Pixabay/Openverse | Provider/API/semantic/progressive/attribution tests with fixtures; retain image meaning, licensing and fallbacks. A later live public image smoke request can check provider availability without exposing keys. |
| Offline | npm run test:offline and offline-Malay browser suite: prime data, go offline, search both languages, open saved entries/photos/lazy pages, verify migrations and API cache bypass. |
| Lazy/cache integrity | With a separately started local preview, npm run test:lazy; corpus/Malay assets load on demand once and work offline. Preserve saved-word upgrades and sense-index mapping. |
| Responsive desktop/iPad/mobile | Existing ipad-responsive/browser suites: desktop 1440/1920; iPad portrait 820x1180 and landscape 1180x820; phones 375/430. Check long words/meanings, tools, accessibility and selected-sense/Copy Prompt state. Verify Edge and WebKit where available. |
| Secret/bundle boundaries | Existing package-security and check:source checks with actual keys only in memory. No private env files, secret values, server/OAuth/Gemini implementation or model weights in public/dist/browser assets. Keep same-origin CSP and service-worker /api bypass. |
| GitHub/Vercel | No tracked deletions/edits; only this report is intentionally untracked. Build from retained Node 24 source/lock/config succeeds. Preserve native service bundles and corpus includeFiles. No push or deployment in cleanup validation. |

### Fresh audit checks versus historical evidence

Passed fresh: preservation counts/hash/identity/projection/packed checks; all 55 starter meanings aligned; original archive equality; in-memory packaging byte-exact with zero rejected/stale records; all 20 real Malay search cases and matched-sense checks; 183,484 missing senses; index statistics (10,798 vocabulary terms, 15,273 postings); node scripts/check-source.mjs; node scripts/verify-translation-cost.mjs; node scripts/verify-teacher-package.mjs (dummy key, fully mocked fetch, both native actions); dependency lock versions; public deployed static asset checks. No Gemini request was sent.

The first ad-hoc search harness used a Windows stdin encoding path that replaced literal Chinese assertions and failed. Repeating it with explicit Unicode escapes passed all 20 cases. No source/data change was involved.

Not freshly run: full Vitest, full browser suites, production build or offline browser scripts. These write generated files, snapshots, results or temporary directories and were deferred under the audit restriction. Historical logs record 43 test files / 1,018 tests passed, build/offline/lazy passes and 18 WebKit iPad tests passed. Older full Edge output contains an accessibility failure; a later focused accessibility run passed 1 test. Those mixed logs do not establish a fresh full Edge pass. Rerun acceptance after cleanup.

## 17. Preserved feature/configuration fingerprints

These raw hashes supplement the complete 379-file aggregate and the authoritative data hashes. All current tracked files are retained, including licenses, scripts and review documentation. No secret value or private env content is included.

| Exact file | Bytes | SHA-256 |
| --- | --- | --- |
| `D:\Primary school simulation\mandarin-visual-dictionary\package.json` | 3,266 | `2b16a9aada497ccc12e25259c2f2b9e3df4567ea0ae9bace78461f6d1bf46c92` |
| `D:\Primary school simulation\mandarin-visual-dictionary\package-lock.json` | 109,399 | `a5db94063ed9935f84783bd2a4986b255f6311953013fef2fc14f05201ed6020` |
| `D:\Primary school simulation\mandarin-visual-dictionary\vercel.json` | 915 | `afc4a4d696b4eb89a1d01c2674caa89dc2b60eb384e24d8ee3c3f915ddd78f53` |
| `D:\Primary school simulation\mandarin-visual-dictionary\vite.config.ts` | 2,271 | `cf750720fcaeff047b4016770606540dbb3b6d947c8ecb7e31ce94472c6977bb` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.gitignore` | 183 | `3f2b141985d15043036dbae32880ad8c9bd36ebc3b6ece14a940edaed2cb6fa8` |
| `D:\Primary school simulation\mandarin-visual-dictionary\.vercelignore` | 433 | `c7f4dcd5d24cc4b7ec8211ce938440f8653799737041b1f061fb4e7e15b284f3` |
| `D:\Primary school simulation\mandarin-visual-dictionary\public\data\cedict.json` | 10,883,962 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\data\malay-runtime.json` | 15,445,028 | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\data\malay-runtime-packed.json` | 4,102,517 | `4c350c9fe9403eb6df144f433dbd6bdac8dcf9b62c9ccd403589730641799da5` |
| `D:\Primary school simulation\mandarin-visual-dictionary\scripts\data\malay-translations-v1.json` | 21,382,097 | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `D:\Primary school simulation\mandarin-visual-dictionary\server\ai-teacher.ts` | 5,406 | `14a70dcdf8e7ab7fa1abc8206c73945d7833e1004186155e79dd7e4de2af3bce` |
| `D:\Primary school simulation\mandarin-visual-dictionary\server\teacher-instructions.ts` | 5,724 | `ecce4e8d2cbb6c6958b3ff7feda29dd35bd6913369f406d89d6d7afc415ea1cd` |
| `D:\Primary school simulation\mandarin-visual-dictionary\server\teacher-rate-limit.ts` | 1,986 | `fced8fde526fe0236e793e600392bbab05ed15e828b42fdf555e512ce60bede7` |
| `D:\Primary school simulation\mandarin-visual-dictionary\server\teacher-handler.ts` | 3,753 | `163ee0e402433c6f14424cb5d858756b4f8e8987cbe2124898e5630d0a355c8f` |
| `D:\Primary school simulation\mandarin-visual-dictionary\server\environment.ts` | 431 | `f80a9cdb93553c2788e525b2e39d7789c4d29df770655fce0a5af9c70a551f91` |
| `D:\Primary school simulation\mandarin-visual-dictionary\server\image-service.mjs` | 892,792 | `5c005bd790d306f1107951a902883ee5f48602a22b88ac5d3000185303a8cfa2` |
| `D:\Primary school simulation\mandarin-visual-dictionary\server\teacher-service.mjs` | 872,572 | `992e287d8c10d24e5881f3bc2d4704e07923fe0763993d2e8a595fe1cb311dbd` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\components\AITeacher.tsx` | 7,793 | `2234740e8bc1430528a95655bfae42a2d6c60e510c99922f9aa408088a1c53ed` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\components\CopyTeacherPromptButton.tsx` | 2,568 | `c28791be89f0a16a3689f3c58e43fd5e6feefd7684c0d5cb305404a103ea3474` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\lib\teacher-copy-prompt.ts` | 5,573 | `d0f0da81ad9229d197bc620891d3ef775d861a0666c8e7bd72f445568243276e` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\lib\teacher-clipboard.ts` | 1,653 | `672b828ae2d6647745b7b91a39e80e881e0bd1faa492876736c30f5a3adacae5` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\lib\ai-teacher-schema.ts` | 3,217 | `1ab9331cc60394070d37df839778adddfe0e39c2eb73921a47450822da9a0433` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\lib\ai-teacher-client.ts` | 2,378 | `4360ab290d54a50166942ad0ca66c92bfb4ad04d6817a45301d06b4893b0c216` |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\components\VisualGallery.tsx` | 5,838 | `8897f9d63149be2656e303e7e2bc9ccb5fc665948a7e27e5023f8e6704881595` |
| `D:\Primary school simulation\mandarin-visual-dictionary\public\sw.js` | 2,847 | `8547c66aa37fe0a772906a7a16878a19fc701d3ea80ef86c64a0d83ca14be6aa` |

## 18. Remaining uncertainties and explicit approval checklist

- Unique candidate alternatives and older lexical supplement corrections remain under review. No unique explicitly accepted/human-verified staging record was found in the examined schemas; that is not a guarantee about arbitrary prose or every historical manual decision. Do not import or discard retained alternate payloads automatically.
- The six source backup snapshots may contain unique historical/uncommitted source. Their complete restorability remains protected. Additional research/quarantine/lexical source material and translation memory remain as listed; no scenario assumes it is dispensable.
- Global pip/npm/Playwright ownership is shared/unresolved, and nonstandard external cache locations may exist. They are outside all project savings.
- Active Node command lines were inaccessible via WMI. Confirm selected paths are idle before later deletion; no unrelated process was stopped. No Python/llama/Ollama inference process was observed in the basic process list.
- Fresh complete build/browser/functional verification is a post-cleanup gate. Existing local secrets and retained source do not prove live provider credentials, external API availability, future npm registry availability or remote push/deploy authentication. No source-based rebuild dependency on retired models was found.
- Sizes are an inventory snapshot of file streams, not volume metadata/ADS/recycle-bin/snapshot accounting. Paths may change before approval; fingerprint mismatch requires re-audit. Report size and newly generated validation artifacts are extra.
- Deleting retired resources prevents historical translation jobs and several old preservation/evaluation scripts from resuming; this is intentional. Normal app/build/tests have their inputs preserved. Source aliases and generation modules remain unchanged until a separately approved source task disables them.

Approval checklist for the owner:

- [ ] Approve Scenario B: 409 literal manifest targets, 16.034617 GB file contents / 16.104098 GB allocated estimate.
- [ ] Accept permanent loss of old bulk Malay model/job resumability.
- [ ] Keep all 14,761 existing published Malay meanings, 82 supplements, starter data, all current tracked source/config/data and Git history unchanged.
- [ ] Keep Group D, intact historical backups, private credentials, Vercel linkage and shared caches.
- [ ] Require target fingerprint/duplicate-witness preflight and the special no-Git junction procedure.
- [ ] Require the post-cleanup preservation/build/test/UI verification without paid Gemini calls.
- [ ] Optional separate choice only: Scenario C dependency removal, with later reinstall before development.
- [ ] Treat disabling obsolete aliases/scripts as a separate source-edit approval, preserving packaging and current tests.

STOP: no cleanup execution is authorized by this report. Await the owner's explicit approval.

## 19. Final audit integrity verification

Immediately before report creation, raw hashes of all 385 existing non-build/non-dependency source/config/data/documentation/Python-bytecode files were rechecked against the audit baseline: zero changes. This includes all 379 Git-tracked files. A complete project metadata re-enumeration found zero changes to original file identities/sizes/timestamps/allocation outside automated host bookkeeping, no changed links, and no scan errors. All manifest targets remained unchanged; no overlaps or removal of a duplicate witness were found.

Codex itself independently rotated transient bookkeeping refs under .git/refs/codex/turn-diffs during the interrupted/resumed turn: two new 41-byte refs and one old 41-byte ref disappeared, with new/removed bookkeeping directories. Net change is 41 logical bytes and zero allocated file bytes. These are automatic host metadata changes, not manual Git cleanup, source/data edits or proposed removal targets. No attempt was made to alter or restore them. Preserve .git.

The inventory and scenario tables use the original frozen measurement of 17,284,600,123 bytes. This report is the only agent-authored new project file. Its UTF-8 size is 230,531 bytes. Including this report and the observed host metadata delta, the end-of-audit project has 17,284,830,695 logical bytes; Scenario B would leave 1,250,213,411 logical bytes before new validation outputs. Further host bookkeeping or filesystem metadata can change independently.

No requested cleanup has been executed.
