# KANJIAN final dataset integration report

Generated 2026-10-15T02:52:46.342Z. Counts refer to canonical individual CC-CEDICT senses, not word-list membership.

## Result

The local dictionary now contains **4,184 Malay-translated senses of 198,245 (2.110520%)**, an increase of **316** over the verified 3,868 baseline (1.951121%). **194,061 senses remain untranslated.** All 4184 translations require independent Malaysian Malay review; none is claimed human-verified. The 316 new entries are licensed dictionary-derived provisional additions. No paid API or new model inference was used.

Production verification: **PASS**. The deployed Malay asset has 4184 records and version ms-MY-v1-18955b5e78b1.

## Baseline, integrity and recovery

The authoritative corpus has 125,173 entries, 121,408 distinct simplified spellings and 199,713 raw definitions. Its existing classifier-only filter omits 1,468 standalone CL: definitions, yielding 198,245 exposed senses. Mandarin characters, traditional forms, pinyin, English definitions, entry IDs and sense IDs were preserved. The unchanged 10,883,962-byte corpus SHA-256 is:

29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a

Before data mutation, 227 non-ignored project files were copied to an independently restorable snapshot with per-file SHA-256 verification:

D:/Primary school simulation/mandarin-visual-dictionary/.tmp/malay-datasets/backups/2026-10-15T02-16-57-269Z

The snapshot has manifest.json, RESTORE.txt and independent project/ source/data copies. Restore the intended files with Copy-Item -LiteralPath after checking hashes; no Git reset is needed. All 3,868 original translation records were compared by their exact serialized JSON content and remain unchanged. The store/runtime pair was first imported and validated under .tmp/malay-datasets/isolated/. Local promotion uses temporary files, atomic renames, a recovery journal and pre-write copies. Repeating promotion added **zero** records and preserved both resulting file hashes. The original timestamped snapshot remains available after repeat imports.

Earlier model download processes were identified by their exact scripts/malay/recovery-resources.py command line and stopped. No unrelated process was stopped. Completed model files, partial chunks, prior benchmark work and valid checkpoints remain local. No model was run for this integration. Invalid/truncated data is never marked a completed source cache. No pending application-asset write was used as an input.

## Sources, downloads and rights

| Resource | Pinned version / format | Actual processing | Redistribution decision |
|---|---|---:|---|
| kaikki-ms-2026-09-02 | enwiktionary-2026-09-02-extracted-2026-10-03; JSONL word/senses records | 17640 source rows; 15050 usable unique lexical records | Original Wiktionary lemma/gloss/POS fields, CC BY-SA 4.0, with page attribution and adaptation notice |
| mesolitica-wiktionary-5da140040840 | 5da1400408400a49f5550277166afb00aadd0f33; JSON array of word/senses records | 24096 source rows; 6685 usable unique lexical records | Original Wiktionary lemma/gloss/POS fields, CC BY-SA 4.0, with page attribution and adaptation notice |
| Wordnet Bahasa zsm + Chinese Open Wordnet + Princeton WordNet 3.0 | OMW 406bf83b3c507a3d1f26e88252d5d66893fd36bf; TSV | Indexed for exact multilingual synset concordance | MIT data; Chinese Open Wordnet license; Princeton license, all notices retained |
| Princeton WNdb 3.0 | 10,518,425-byte source archive; 117,659 definitions | Audit context for ambiguous senses | Licensed audit-only source; full archive stays outside deployment |
| “200k” English–Malay | Repository 87c0562cb41966babc62b299cd2812e620d1c23e; 6,886,634-byte JSON array of pairs | **234,351 actual rows counted**, local research staging only | Entire list excluded: Google Translate-derived, no confirmed public redistribution grant |
| Cambridge English–Malaysian | Mirror 4f6a54fc39110a7b3289c12f58122ead7cf5dcbb; JSON download | Contents not downloaded; 25,171 is the documentation claim, not a verified count | Excluded; applicable Cambridge permission required |
| DBP/PRPM | Mirror 3a4d87670803d0f69e51e97b5c43f8347b70dd88; ZIP/JSON variants | Contents not downloaded; 78,670 is the documentation claim, not a verified count | Excluded; rights-holder redistribution permission required |
| Kamus Dewan | JSON mirror, unpinned because excluded | Contents not downloaded; count unknown | Excluded; rights-holder redistribution permission required |

The two Wiktionary extracts are versions of the same underlying English Wiktionary, not independent dictionaries. The Mesolitica mirror contains 24,096 entries across languages: only 7,984 identify as ms; 16,112 non-Malay entries were excluded before matching. Its original dump date is unspecified. Regional, obsolete, redirect/form and invalid lexical records are also filtered. Across the two sources, 41736 input rows yielded 21735 normalized evidence records; 491 exact within-source duplicates were removed. Evidence from distinct source versions is retained for attribution; translations are unique per canonical sense.

**Licensing exclusions actually counted: 234,351 rows.** The excluded Cambridge, DBP and Kamus Dewan contents were not downloaded or counted; their unknown totals are not added to this number. Non-commercial educational use was not treated as copyright permission. No Cambridge/DBP/Google-derived gloss was published. Other non-bilingual word lists, synonym/antonym lists from Google, dialect corpora and unrelated large corpora were not imported.

Real source/download URLs and rights references:

- [Malaysian-dataset repository](https://github.com/malaysia-ai/malaysian-dataset), [dictionary documentation](https://malaysian-dataset.readthedocs.io/en/latest/dictionary.html). The repository requests contact before distributing its data; no general grant was assumed for proprietary/Google-derived material.
- [Kaikki Malay source](https://kaikki.org/dictionary/Malay/kaikki.org-dictionary-Malay.jsonl), [extraction/version page](https://kaikki.org/dictionary/Malay/index.html).
- [Pinned Mesolitica Wiktionary mirror](https://huggingface.co/datasets/mesolitica/wiktionary-bahasa/resolve/5da1400408400a49f5550277166afb00aadd0f33/wiktionary-bahasa.json); extraction script and upstream Wiktionary provenance were inspected.
- [Pinned 200k research-only file](https://raw.githubusercontent.com/malaysia-ai/malaysian-dataset/87c0562cb41966babc62b299cd2812e620d1c23e/dictionary/200k-english-malay/200k-english-malay.json).
- [Cambridge mirror](https://huggingface.co/datasets/mesolitica/crawl-cambridge-english-malaysian/resolve/4f6a54fc39110a7b3289c12f58122ead7cf5dcbb/cambridge-english-malaysian.json), [Cambridge rights-holder licensing](https://dictionary.cambridge.org/license).
- [DBP mirror](https://huggingface.co/datasets/mesolitica/dbp/resolve/3a4d87670803d0f69e51e97b5c43f8347b70dd88/dbp.zip), [PRPM original publisher](https://prpm.dbp.gov.my/), [Kamus Dewan mirror](https://huggingface.co/datasets/mesolitica/kamus-dewan/raw/main/Kamus_Dewan_Bahasa_Edisi_Keempat.json).
- [Wiktionary copyrights](https://en.wiktionary.org/wiki/Wiktionary:Copyrights), [CC BY-SA 4.0 legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en), [Princeton 3.0 archive](https://wordnetcode.princeton.edu/3.0/WNdb-3.0.tar.gz).

Pinned eligible source SHA-256 values:

- kaikki-ms-2026-09-02: 09719ea7c3ca0448a35ecfacd1a88ef5d816d072523b81b46d2baffb1b51f207 (28607738 bytes)
- mesolitica-wiktionary-5da140040840: e5ab7a2d168da66529e59fe269bb5d4be5745e4655879be8e4c608280c067363 (33898835 bytes)

All large sources, restricted research data, backups, caches and review ledgers stay in Git-ignored .tmp and are excluded by .vercelignore. The deployed additions retain per-record sources, exact English/sense alignment, status and source-page links. public/data/MALAY-DATASET-ATTRIBUTION.json provides 316 per-sense credit records; MALAY-NOTICE.txt explains the adaptations and links full licenses. The word-detail interface provides a visible Malay sources & licenses link. Original quotations, illustrative examples and third-party embedded dictionary text are not reused.

## Matching, quality and coverage accounting

| Measure | Verified count |
|---|---:|
| Original translated senses | 3,868 |
| Original coverage | 1.951121% |
| Senses with an exact normalized English glossary/headword hit | 15583 |
| Distinct normalized English glossary strings matched | 3342 |
| Strong-evidence sense matches after context/POS/policy filtering | 1013 |
| New provisional translations imported | 316 |
| Strong matches for already-covered senses, retained separately | 697 |
| Unassigned ambiguous/review-only sense candidates | 14582 |
| Of those, senses missing from the original store | 13504 |
| Partially accepted senses with additional withheld alternatives | 25 |
| Remaining untranslated senses | 194,061 |
| Final translated senses | 4,184 |
| Final coverage | 2.110520% |
| Human-verified translations | 0 |
| Translations requiring independent review | 4,184 |

The importer requires exact complete English wording, or evidence for every semicolon/slash clause, source POS, a unique Chinese–English WordNet sense and an attested Malay lemma in the same zsm synset. Qualifiers, idioms, partial definitions and unknown contexts are not silently simplified to create matches. Word-list membership alone never assigns a translation. Additional candidates for existing provisional records are separate from the accepted store. No existing gloss is replaced. No numeric confidence probability is invented for the new imports. Strong-evidence counts describe the matching rule, not an independent linguistic certification; the app correctly labels the results as awaiting review.

Assistant review of the candidate listing and licensed WordNet definitions identified misleading shared IDs/words. Examples quarantined: social atmosphere versus 大气圈, an electrical cable versus 电报, decay versus corruption, game playing versus flirtation, artist versus house painter, unscoped religious phrases and uncertain Malay verb roots. scripts/data/malay-bulk-review-policy.json records explicit exclusions. Ambiguous bank/light/spring/current meanings have functional positive/negative tests with independent POS and Mandarin contexts. The source word cat in Malay means paint; its language orientation is tested so it cannot be mistaken for English cat.

The deterministic sample in scripts/data/malay-bulk-review-samples.json has **56 cases** across technical, verb, modifier, abstract and everyday vocabulary. It exposes source pages and evidence, and explicitly leaves the independent reviewer and approval fields blank. The local review-sheet.tsv is ready for a Mandarin–Malaysian Malay reviewer. Assistant plausibility inspection is not human approval. All unresolved hits and withheld alternatives remain in .tmp/malay-datasets/quarantine.json; the 697 corroborating candidates for existing translations are in additional-existing-candidates.json.

## Implementation and performance

The reusable reader supports JSON arrays, JSONL, CSV, TSV and bounded JSON object maps; explicit language orientation and format detection prevent accidental reversal. Arrays/JSONL/CSV/TSV stream with a per-record bound. JSON object maps are limited to 64 MiB; larger maps must be converted to JSONL. Normalization uses Unicode NFC and whitespace, validates fields, rejects invalid script/encoding, preserves multiple candidates and deduplicates exact records. Immutable normalized shards checkpoint every 500 input rows, with source/shard SHA-256 checks. Resuming reuses completed work and skips earlier rows without translating them again. Truncated inputs cannot be finalized.

First preparation (including normalization of both extracts): 5,067 ms in the recorded initial run. Reviewed preparation from cached normalized records: 2729 ms; measured heap at completion 251 MiB. This is a deterministic source-matching pass, not per-entry network work. The dictionary/search worker, navigation, galleries, authentication/security setup and deployment target are retained. The only quality-schema change makes numeric confidence optional; existing values keep their range checks. Test discovery now excludes the backup/staging directory.

| Stored asset | Before bytes | After bytes |
|---|---:|---:|
| Authoritative Malay store with provenance | 4308055 | 4757938 |
| Lazy runtime asset (raw) | 3502330 | 3755171 |
| Lazy runtime gzip | 321307 | 352846 |
| Lazy runtime Brotli | 230970 | 250397 |

The startup JavaScript remains 321,145 raw bytes / approximately 95.84 kB gzip. Full source dictionaries are not in the frontend. The existing worker fetches the hashed sparse Malay asset only when required, then indexes locally without contacting any dataset provider. Final full-index build: 5457 ms; retained heap 276 MiB. Representative warm Malay queries: anjing 0.435 ms median; membantu 0.482 ms median; tidak malu bertanya 0.377 ms median.

## Validation

- Production build, TypeScript and seven isolated image-function packaging scenarios: PASS.
- Unit/integration: PASS, 823 tests, zero failed or pending; 26 test files.
- Genuine Edge/Chromium browser suite: PASS, 81 passed, 0 unexpected, 0 skipped.
- Import SHA-256, every existing record, all canonical keys, duplicate protections, corpus versus original compressed CC-CEDICT, Unicode, POS/polysemy, source orientation, malformed entries, source/cache integrity, checkpoint resume and zero-addition idempotence: PASS.
- Bundle/lazy boundaries: Pending / inspect log.
- Source/browser credential boundary, CSP and service-worker API exclusion: Pending / inspect log.
- Whitespace/source formatting: Pending / inspect log.
- Production-built offline shell/cache: Pending / inspect log.
- Lazy-load/offline feature checks: Pending / inspect log.
- Production-built Malay offline/reload/saved-sense checks: Pending / inspect log.

The first broad test invocation was interrupted because it discovered the preserved backup's test files; excluding .tmp fixed test discovery. A README trailing blank line was corrected after the whitespace check. Neither issue affected the dictionary. Only final passing runs are counted above. Browser gallery/provider tests use controlled fixtures; actual production API responses are recorded separately below.

Representative new meanings tested through normal search/detail flows:

| Mandarin | Pinyin | English | Provisional Bahasa Melayu |
|---|---|---|---|
| 人口普查 | rén kǒu pǔ chá | census | banci |
| 灯泡 | dēng pào | light bulb | mentol |
| 脚踝 | jiǎo huái | ankle | buku lali |
| 研究 | yán jiū | research | penyelidikan |

Preserved examples include 银行 / bank / bank and 狗 / dog / anjing. Untranslated 河岸 is not assigned financial bank. The full browser suite also covers Chinese/traditional/pinyin/English/Malay search, multiple senses, typo/synonym lookup, idioms, long meanings, mobile/tablet layouts, saved words, reload and galleries.

## GitHub and production

- Repository: https://github.com/pekchunhoe/mandarin-visual-dictionary
- Branch: main. The existing remote was fetched and matched the original base 4d75be23fafa8e44d9711d2e4097acd46b675a03; no force-push or history rewrite is used.
- Application release commit: c22137260e53d19c9f962b141614a5746944ab2e.
- Push verification: verified against origin/main.
- This report may be finalized by a subsequent documentation/release-verification commit; the application release SHA above identifies the tested application content.
- Existing Vercel project: mandarin-visual-dictionary, scope pek-explains-physics; project ID prj_45bxtqgs7w3rV211KuVvoWmmxJkU.
- Existing production URL: https://mandarin-visual-dictionary.vercel.app
- Deployment workflow correction: full authenticated Vercel API metadata confirms that this project is connected to GitHub `main`; pushes automatically create production deployments. The initial application release described here used the existing Vercel CLI, and the subsequent report commit also triggered the Git integration. Domain, Node 24, build command, function packaging, security headers and environment variables were preserved. The dictionary is immutable bundled/static data; no shared production database mutation is needed. The earlier CLI summary omitted the Git link and did not establish its absence.
- Previous working deployment retained for rollback: dpl_Ddxp4e9dArWNJH9XgGAdgRuMfT1K, https://mandarin-visual-dictionary-dcffq36qa-pek-explains-physics.vercel.app . The pre-release production corpus was downloaded, backed up and verified against the same SHA-256. Restore through the existing Vercel rollback mechanism if a critical regression appears.
- New production deployment ID: dpl_C2cjXcwm9GiSQ65MN44YUkGrpyzn.
- New deployment status: READY.
- Live smoke test: PASS, 17 actual search/detail checks; home visible in 757 ms, no page exceptions or image API 5xx responses. Live corpus SHA-256 and the fetched Malay asset match the tested local files. Mobile overflow, credits and full license URLs checked.

Actual smoke evidence: 1 hashed Malay runtime response(s); 55 image API responses (all HTTP 200); 0 failed request(s), detailed in the local production-after/smoke.json ledger. The preserved live dog gallery rendered 1 picture(s). Image availability varies: a successful endpoint does not guarantee 20 relevant pictures for every word, and the existing unavailable-picture fallback remains functional. Provider inventory/content is not a linguistic guarantee.

## Remaining limitations

Coverage is **2.110520%**, not a completed Malay corpus. 194,061 meanings, including many idioms, qualified senses, proper names and specialist senses, remain missing. No independent Mandarin–Malay reviewer has approved the existing or new additions. The policy deliberately rejects some potentially useful synonyms/roots until scoped review. Open source alignments can still contain semantic or regional errors, so provisional labels remain visible. Releasing the excluded publisher datasets would require applicable written permission; this release does not depend on obtaining it. Prior unfinished model-recovery experiments remain preserved locally and excluded from deployment; no ongoing model translation job is required.

Next useful work is independent review of the licensed 56-case sample and quarantined high-frequency senses, followed by explicitly approved sense-specific imports. Broader coverage should use additional licensed sense-bearing resources or a validated translation method, while retaining the same immutable corpus and existing-record protections.
