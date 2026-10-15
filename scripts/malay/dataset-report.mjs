import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const read = file => JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const optional = file => existsSync(file) ? read(file) : undefined;
const p = read('scripts/data/malay-bulk-statistics.json'), i = p.integration;
const unit = optional('.tmp/malay-datasets/unit-results.json');
const browser = optional('.tmp/malay-datasets/browser-results.json');
const storage = optional('.tmp/malay-datasets/storage.json');
const perf = optional('.tmp/malay-datasets/dictionary-performance.json');
const production = optional('.tmp/malay-datasets/production-after/smoke.json');
const release = optional('.tmp/malay-datasets/release.json');
const pct = n => n.toFixed(6) + '%';
const logStatus = (file, marker) => existsSync(file) && readFileSync(file, 'utf8').includes(marker) ? 'PASS' : 'Pending / inspect log';
const backup = 'D:/Primary school simulation/mandarin-visual-dictionary/.tmp/malay-datasets/backups/2026-10-15T02-16-57-269Z';
const text = `# KANJIAN final dataset integration report

Generated ${new Date().toISOString()}. Counts refer to canonical individual CC-CEDICT senses, not word-list membership.

## Result

The local dictionary now contains **${i.after.toLocaleString('en-US')} Malay-translated senses of 198,245 (${pct(i.coveragePercent)})**, an increase of **${i.added}** over the verified ${i.before.toLocaleString('en-US')} baseline (${pct(i.before / 198245 * 100)}). **${i.missing.toLocaleString('en-US')} senses remain untranslated.** All ${i.after} translations require independent Malaysian Malay review; none is claimed human-verified. The ${i.added} new entries are licensed dictionary-derived provisional additions. No paid API or new model inference was used.

Production verification: **${production?.productionPass ? 'PASS' : 'pending'}**. ${production ? `The deployed Malay asset has ${production.runtimeAssets[0]?.translations} records and version ${production.runtimeAssets[0]?.version}.` : 'Local tests are recorded below; release results will be filled only after actual verification.'}

## Baseline, integrity and recovery

The authoritative corpus has 125,173 entries, 121,408 distinct simplified spellings and 199,713 raw definitions. Its existing classifier-only filter omits 1,468 standalone CL: definitions, yielding 198,245 exposed senses. Mandarin characters, traditional forms, pinyin, English definitions, entry IDs and sense IDs were preserved. The unchanged 10,883,962-byte corpus SHA-256 is:

\
29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a

Before data mutation, 227 non-ignored project files were copied to an independently restorable snapshot with per-file SHA-256 verification:

\
${backup}

The snapshot has manifest.json, RESTORE.txt and independent project/ source/data copies. Restore the intended files with Copy-Item -LiteralPath after checking hashes; no Git reset is needed. All 3,868 original translation records were compared by their exact serialized JSON content and remain unchanged. The store/runtime pair was first imported and validated under .tmp/malay-datasets/isolated/. Local promotion uses temporary files, atomic renames, a recovery journal and pre-write copies. Repeating promotion added **zero** records and preserved both resulting file hashes. The original timestamped snapshot remains available after repeat imports.

Earlier model download processes were identified by their exact scripts/malay/recovery-resources.py command line and stopped. No unrelated process was stopped. Completed model files, partial chunks, prior benchmark work and valid checkpoints remain local. No model was run for this integration. Invalid/truncated data is never marked a completed source cache. No pending application-asset write was used as an input.

## Sources, downloads and rights

| Resource | Pinned version / format | Actual processing | Redistribution decision |
|---|---|---:|---|
${p.sourceResults.map(s => `| ${s.id} | ${s.version}; ${s.file.endsWith('jsonl') ? 'JSONL word/senses records' : 'JSON array of word/senses records'} | ${s.inputRows} source rows; ${s.normalizedRecords} usable unique lexical records | Original Wiktionary lemma/gloss/POS fields, CC BY-SA 4.0, with page attribution and adaptation notice |`).join('\n')}
| Wordnet Bahasa zsm + Chinese Open Wordnet + Princeton WordNet 3.0 | OMW ${'406bf83b3c507a3d1f26e88252d5d66893fd36bf'}; TSV | Indexed for exact multilingual synset concordance | MIT data; Chinese Open Wordnet license; Princeton license, all notices retained |
| Princeton WNdb 3.0 | 10,518,425-byte source archive; 117,659 definitions | Audit context for ambiguous senses | Licensed audit-only source; full archive stays outside deployment |
| “200k” English–Malay | Repository 87c0562cb41966babc62b299cd2812e620d1c23e; 6,886,634-byte JSON array of pairs | **234,351 actual rows counted**, local research staging only | Entire list excluded: Google Translate-derived, no confirmed public redistribution grant |
| Cambridge English–Malaysian | Mirror 4f6a54fc39110a7b3289c12f58122ead7cf5dcbb; JSON download | Contents not downloaded; 25,171 is the documentation claim, not a verified count | Excluded; applicable Cambridge permission required |
| DBP/PRPM | Mirror 3a4d87670803d0f69e51e97b5c43f8347b70dd88; ZIP/JSON variants | Contents not downloaded; 78,670 is the documentation claim, not a verified count | Excluded; rights-holder redistribution permission required |
| Kamus Dewan | JSON mirror, unpinned because excluded | Contents not downloaded; count unknown | Excluded; rights-holder redistribution permission required |

The two Wiktionary extracts are versions of the same underlying English Wiktionary, not independent dictionaries. The Mesolitica mirror contains 24,096 entries across languages: only 7,984 identify as ms; 16,112 non-Malay entries were excluded before matching. Its original dump date is unspecified. Regional, obsolete, redirect/form and invalid lexical records are also filtered. Across the two sources, ${p.sourceResults.reduce((n,s)=>n+s.inputRows,0)} input rows yielded ${p.sourceResults.reduce((n,s)=>n+s.normalizedRecords,0)} normalized evidence records; ${p.sourceResults.reduce((n,s)=>n+s.exactDuplicates,0)} exact within-source duplicates were removed. Evidence from distinct source versions is retained for attribution; translations are unique per canonical sense.

**Licensing exclusions actually counted: 234,351 rows.** The excluded Cambridge, DBP and Kamus Dewan contents were not downloaded or counted; their unknown totals are not added to this number. Non-commercial educational use was not treated as copyright permission. No Cambridge/DBP/Google-derived gloss was published. Other non-bilingual word lists, synonym/antonym lists from Google, dialect corpora and unrelated large corpora were not imported.

Real source/download URLs and rights references:

- [Malaysian-dataset repository](https://github.com/malaysia-ai/malaysian-dataset), [dictionary documentation](https://malaysian-dataset.readthedocs.io/en/latest/dictionary.html). The repository requests contact before distributing its data; no general grant was assumed for proprietary/Google-derived material.
- [Kaikki Malay source](https://kaikki.org/dictionary/Malay/kaikki.org-dictionary-Malay.jsonl), [extraction/version page](https://kaikki.org/dictionary/Malay/index.html).
- [Pinned Mesolitica Wiktionary mirror](${p.sourceResults[1].url}); extraction script and upstream Wiktionary provenance were inspected.
- [Pinned 200k research-only file](${p.excludedSources[0].url}).
- [Cambridge mirror](${p.excludedSources[1].url}), [Cambridge rights-holder licensing](https://dictionary.cambridge.org/license).
- [DBP mirror](${p.excludedSources[2].url}), [PRPM original publisher](https://prpm.dbp.gov.my/), [Kamus Dewan mirror](${p.excludedSources[3].url}).
- [Wiktionary copyrights](https://en.wiktionary.org/wiki/Wiktionary:Copyrights), [CC BY-SA 4.0 legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode.en), [Princeton 3.0 archive](https://wordnetcode.princeton.edu/3.0/WNdb-3.0.tar.gz).

Pinned eligible source SHA-256 values:

${p.sourceResults.map(s => `- ${s.id}: ${s.sha256} (${s.bytes} bytes)`).join('\n')}

All large sources, restricted research data, backups, caches and review ledgers stay in Git-ignored .tmp and are excluded by .vercelignore. The deployed additions retain per-record sources, exact English/sense alignment, status and source-page links. public/data/MALAY-DATASET-ATTRIBUTION.json provides 316 per-sense credit records; MALAY-NOTICE.txt explains the adaptations and links full licenses. The word-detail interface provides a visible Malay sources & licenses link. Original quotations, illustrative examples and third-party embedded dictionary text are not reused.

## Matching, quality and coverage accounting

| Measure | Verified count |
|---|---:|
| Original translated senses | 3,868 |
| Original coverage | ${pct(3868 / 198245 * 100)} |
| Senses with an exact normalized English glossary/headword hit | ${p.headwordMatchedSenses} |
| Distinct normalized English glossary strings matched | ${p.distinctEnglishHeadwordMatches} |
| Strong-evidence sense matches after context/POS/policy filtering | ${p.highConfidenceSenseMatches} |
| New provisional translations imported | 316 |
| Strong matches for already-covered senses, retained separately | ${p.existingWithAdditionalCandidates} |
| Unassigned ambiguous/review-only sense candidates | ${p.ambiguousSenses} |
| Of those, senses missing from the original store | ${p.ambiguousMissingSenses} |
| Partially accepted senses with additional withheld alternatives | ${p.partialMatchesWithWithheldAlternatives} |
| Remaining untranslated senses | 194,061 |
| Final translated senses | 4,184 |
| Final coverage | ${pct(i.coveragePercent)} |
| Human-verified translations | 0 |
| Translations requiring independent review | 4,184 |

The importer requires exact complete English wording, or evidence for every semicolon/slash clause, source POS, a unique Chinese–English WordNet sense and an attested Malay lemma in the same zsm synset. Qualifiers, idioms, partial definitions and unknown contexts are not silently simplified to create matches. Word-list membership alone never assigns a translation. Additional candidates for existing provisional records are separate from the accepted store. No existing gloss is replaced. No numeric confidence probability is invented for the new imports. Strong-evidence counts describe the matching rule, not an independent linguistic certification; the app correctly labels the results as awaiting review.

Assistant review of the candidate listing and licensed WordNet definitions identified misleading shared IDs/words. Examples quarantined: social atmosphere versus 大气圈, an electrical cable versus 电报, decay versus corruption, game playing versus flirtation, artist versus house painter, unscoped religious phrases and uncertain Malay verb roots. scripts/data/malay-bulk-review-policy.json records explicit exclusions. Ambiguous bank/light/spring/current meanings have functional positive/negative tests with independent POS and Mandarin contexts. The source word cat in Malay means paint; its language orientation is tested so it cannot be mistaken for English cat.

The deterministic sample in scripts/data/malay-bulk-review-samples.json has **56 cases** across technical, verb, modifier, abstract and everyday vocabulary. It exposes source pages and evidence, and explicitly leaves the independent reviewer and approval fields blank. The local review-sheet.tsv is ready for a Mandarin–Malaysian Malay reviewer. Assistant plausibility inspection is not human approval. All unresolved hits and withheld alternatives remain in .tmp/malay-datasets/quarantine.json; the 697 corroborating candidates for existing translations are in additional-existing-candidates.json.

## Implementation and performance

The reusable reader supports JSON arrays, JSONL, CSV, TSV and bounded JSON object maps; explicit language orientation and format detection prevent accidental reversal. Arrays/JSONL/CSV/TSV stream with a per-record bound. JSON object maps are limited to 64 MiB; larger maps must be converted to JSONL. Normalization uses Unicode NFC and whitespace, validates fields, rejects invalid script/encoding, preserves multiple candidates and deduplicates exact records. Immutable normalized shards checkpoint every 500 input rows, with source/shard SHA-256 checks. Resuming reuses completed work and skips earlier rows without translating them again. Truncated inputs cannot be finalized.

First preparation (including normalization of both extracts): 5,067 ms in the recorded initial run. Reviewed preparation from cached normalized records: ${Math.round(p.milliseconds)} ms; measured heap at completion ${Math.round(p.heapBytes / 1048576)} MiB. This is a deterministic source-matching pass, not per-entry network work. The dictionary/search worker, navigation, galleries, authentication/security setup and deployment target are retained. The only quality-schema change makes numeric confidence optional; existing values keep their range checks. Test discovery now excludes the backup/staging directory.

| Stored asset | Before bytes | After bytes |
|---|---:|---:|
| Authoritative Malay store with provenance | ${i.storeBytesBefore} | ${i.storeBytesAfter} |
| Lazy runtime asset (raw) | ${storage?.runtimeBefore.raw ?? i.runtimeBytesBefore} | ${storage?.runtimeAfter.raw ?? i.runtimeBytesAfter} |
| Lazy runtime gzip | ${storage?.runtimeBefore.gzip ?? 'pending'} | ${storage?.runtimeAfter.gzip ?? 'pending'} |
| Lazy runtime Brotli | ${storage?.runtimeBefore.brotli ?? 'pending'} | ${storage?.runtimeAfter.brotli ?? 'pending'} |

The startup JavaScript remains 321,145 raw bytes / approximately 95.84 kB gzip. Full source dictionaries are not in the frontend. The existing worker fetches the hashed sparse Malay asset only when required, then indexes locally without contacting any dataset provider. ${perf ? `Final full-index build: ${Math.round(perf.builtMs)} ms; retained heap ${Math.round(perf.retainedHeapBytes / 1048576)} MiB. Representative warm Malay queries: ${Object.entries(perf.queries).filter(([q]) => ['anjing','membantu','tidak malu bertanya'].includes(q)).map(([q,v])=>q+' '+v.medianMs.toFixed(3)+' ms median').join('; ')}.` : 'Final full-index timings are pending the performance run.'}

## Validation

- Production build, TypeScript and seven isolated image-function packaging scenarios: PASS.
- Unit/integration: ${unit?.success ? `PASS, ${unit.numPassedTests} tests, zero failed or pending; 26 test files.` : 'pending'}
- Genuine Edge/Chromium browser suite: ${browser ? `${browser.stats.unexpected === 0 ? 'PASS' : 'FAIL'}, ${browser.stats.expected} passed, ${browser.stats.unexpected} unexpected, ${browser.stats.skipped} skipped.` : 'running / pending final result'}
- Import SHA-256, every existing record, all canonical keys, duplicate protections, corpus versus original compressed CC-CEDICT, Unicode, POS/polysemy, source orientation, malformed entries, source/cache integrity, checkpoint resume and zero-addition idempotence: PASS.
- Bundle/lazy boundaries: ${logStatus('.tmp/malay-datasets/bundle.log', 'PASS:')}.
- Source/browser credential boundary, CSP and service-worker API exclusion: ${logStatus('.tmp/malay-datasets/security.log', 'PASS:')}.
- Whitespace/source formatting: ${logStatus('.tmp/malay-datasets/whitespace.log', 'PASS')}.
- Production-built offline shell/cache: ${logStatus('.tmp/malay-datasets/offline.log', 'PASS')}.
- Lazy-load/offline feature checks: ${logStatus('.tmp/malay-datasets/lazy.log', 'PASS')}.
- Production-built Malay offline/reload/saved-sense checks: ${logStatus('.tmp/malay-datasets/malay-offline.log', '"productionOfflinePass": true')}.

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
- Application release commit: ${release?.applicationCommit ?? 'pending final reviewed commit'}.
- Push verification: ${release?.pushVerified ? 'verified against origin/main' : 'pending'}.
- This report may be finalized by a subsequent documentation-only commit; the application release SHA above identifies the tested application content.
- Existing Vercel project: mandarin-visual-dictionary, scope pek-explains-physics; project ID prj_45bxtqgs7w3rV211KuVvoWmmxJkU.
- Existing production URL: https://mandarin-visual-dictionary.vercel.app
- Deployment workflow: the existing project has no Git-source link; use its established Vercel CLI production deployment, preserving domain, Node 24, build command, function packaging, security headers and environment variables. No replacement project or remote database is created. The dictionary is immutable bundled/static data; no shared production database mutation is needed.
- Previous working deployment retained for rollback: dpl_Ddxp4e9dArWNJH9XgGAdgRuMfT1K, https://mandarin-visual-dictionary-dcffq36qa-pek-explains-physics.vercel.app . The pre-release production corpus was downloaded, backed up and verified against the same SHA-256. Restore through the existing Vercel rollback mechanism if a critical regression appears.
- New production deployment ID: ${release?.deploymentId ?? 'pending'}.
- New deployment status: ${release?.deploymentStatus ?? 'pending'}.
- Live smoke test: ${production?.productionPass ? `PASS, ${production.examples.length} actual search/detail checks; home visible in ${production.homeVisibleMs} ms, no page exceptions or image API 5xx responses. Live corpus SHA-256 and the fetched Malay asset match the tested local files. Mobile overflow, credits and full license URLs checked.` : 'pending; no deployment claim is made yet'}

${production ? `Actual smoke evidence: ${production.runtimeAssets.length} hashed Malay runtime response(s); ${production.apiResponses.length} image API responses; ${production.failedRequests.length} failed request(s), detailed in the local production-after/smoke.json ledger. Provider availability/content is not a linguistic guarantee.` : ''}

## Remaining limitations

Coverage is **${pct(i.coveragePercent)}**, not a completed Malay corpus. 194,061 meanings, including many idioms, qualified senses, proper names and specialist senses, remain missing. No independent Mandarin–Malay reviewer has approved the existing or new additions. The policy deliberately rejects some potentially useful synonyms/roots until scoped review. Open source alignments can still contain semantic or regional errors, so provisional labels remain visible. Releasing the excluded publisher datasets would require applicable written permission; this release does not depend on obtaining it. Prior unfinished model-recovery experiments remain preserved locally and excluded from deployment; no ongoing model translation job is required.

Next useful work is independent review of the licensed 56-case sample and quarantined high-frequency senses, followed by explicitly approved sense-specific imports. Broader coverage should use additional licensed sense-bearing resources or a validated translation method, while retaining the same immutable corpus and existing-record protections.
`;
writeFileSync('KANJIAN_FINAL_DATASET_INTEGRATION_REPORT.md', text);
writeFileSync('KANJIAN_DATASET_INTEGRATION_REPORT.md', '# KANJIAN dataset integration\n\nThe completed integration and release results are recorded in [KANJIAN_FINAL_DATASET_INTEGRATION_REPORT.md](KANJIAN_FINAL_DATASET_INTEGRATION_REPORT.md).\n');
console.log('Updated dataset integration reports.');
