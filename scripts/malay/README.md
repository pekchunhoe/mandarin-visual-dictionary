# Malaysian Malay corpus maintenance

The pipeline covers every exposed CC-CEDICT sense, not just the starter collection. No service is enabled by default, and no DBP content is copied. Existing English and Chinese data are immutable inputs. Candidate Malay glosses are independently written and licensed CC BY-SA 4.0 as additions to CC-CEDICT. They await Malaysian Malay language review.

Commands from the repository root:

```powershell
npm run malay:audit
npm run malay:build
npm run malay:validate
npm run malay:queue
npm run malay:generate -- ./my-provider-config.json
npm run malay:import -- .tmp/malay-generated-candidates.json
```

The queue contains all missing senses with Mandarin, traditional spelling, numeric pinyin, unmodified English, a canonical entry ID, sense ID and SHA-256 key. It includes every idiom/figurative sense identified by the app's existing classifier. It can be consumed by a licensed translator or a local model. `maxRecords` bounds each generation invocation; repeated invocations skip accepted corpus records and reuse checkpointed candidates. Failed or rejected senses remain missing. Cache keys incorporate the adapter version, model, prompt version and exact sense fingerprint. Increment an adapter/prompt version to invalidate cached candidates. Previously accepted records remain protected during builds; imports may replace an unreviewed record with a verified record carrying a named reviewer. Reviewed corrections require explicit maintenance outside the routine import command.

## Adapter contract

Use a local ESM adapter that exports `version`, `source`, `license` and `async translateBatch(senses, options)`. Keep credentials in environment variables read by the adapter, never in browser code or data output. Source licensing and any external data access permissions must be established before generation. Neither DBP verification nor licensed reference use may be claimed without evidence.

```js
export const version = 'licensed-model-ms-MY-1';
export const source = 'Name of model or licensed dataset';
export const license = 'Applicable license or documented permission';
export async function translateBatch(senses, options) {
  // Each record MUST retain the exact input sense key and English alignment.
  // Use the Mandarin/pinyin context and English part-of-speech cues.
  // Return only substantive glosses; uncertain senses may be omitted.
  return {
    records: [/* { key, malay, malaySearchTerms, malaySynonyms,
      malayMorphology, translationConfidence, idiomExplanation } */],
    usage: { inputTokens: 0, outputTokens: 0, costUsd: 0 }
  };
}
```

Candidates are always marked `generated`. A human-reviewed import can use `verified` with `translationReviewer`; an automated provider cannot mark itself verified. Idioms need `idiomExplanation: true` and a fluent figurative explanation. Literal context may be included in the gloss where necessary. Do not manufacture Malay proverb equivalents. No algorithm guarantees semantic correctness; all candidate glosses require review before verified status.

## Costs, retries and recovery

KANJIAN is in strict zero-cost mode. Generation requires `offline: true`; both budget fields must be zero or omitted. Network/paid configurations are rejected before an adapter is imported. Legacy checkpoints with costs, reservations or pending network work are refused without modification. Offline usage must be zero; a non-zero claim quarantines the batch and is not retried. Trusted local adapters must actually operate offline: arbitrary third-party JavaScript is not a network sandbox. No adapter is enabled or invoked by the application or normal build. No hosted inference service is used. Do not embed credentials in provider metadata.

Generation never publishes automatically: inspect the candidates, then run the import command. Import validation is atomic; malformed or misaligned imports are rejected. Ordinary builds use only accepted records and never invoke an adapter. Generated records with placeholder, English-copy, localization, Unicode, provenance or idiom-explanation failures are withheld.

Set `regenerateUnreviewed: true` to generate replacement candidates for unreviewed accepted senses after changing the model or prompt. They remain separate candidates; routine import replaces an existing translation only with a verified record and a named reviewer. A small checkpoint manifest references immutable files in its `.batches` directory, avoiding a full-corpus rewrite after every batch. Retain both the manifest and directory when moving or backing up a run. Legacy zero-cost single-file checkpoints migrate automatically. Existing pending network checkpoints remain preserved and cannot be resumed in zero-cost mode.

The runtime overlay is a versioned content-hashed JSON asset fetched only in the dictionary worker on demand. It stores translations sparsely, leaving missing senses explicit in the runtime schema. Malay equivalent, phrase, synonym and approved morphology indexes are built once in that worker. Searching does not stem every word indiscriminately. Chinese, English and pinyin retain their existing normalizer and relative matching order, now using sorted prefix keys and trigram postings. Ambiguous Latin inputs share result space across languages. Visual classification runs only for requested results with the same raw English sense input as before, with a bounded cache of 200 prepared words.

## References and review

DBP's [Kamus Dewan Perdana portal](https://kamus.dbp.gov.my/) states that reproducing its content requires written permission. [PRPM](https://prpm.dbp.gov.my/) is a terminology reference, not an assumed unrestricted API. This implementation does not scrape either service. CC-CEDICT [attribution and license](https://www.mdbg.net/chinese/dictionary?page=cedict) continue to apply to the original corpus. See `scripts/data/malay-human-review-samples.json` for translated and missing difficult senses, and the integration report for measured coverage.

[Open Multilingual Wordnet](https://omwn.org/omw1.html) lists a separate Malay (`zsm`) Wordnet Bahasa, under [MIT](https://github.com/omwn/omw-data/blob/main/wns/msa/LICENSE), alongside Indonesian (`ind`). It is a possible licensed offline reference. Its Princeton WordNet 3.0 synset IDs are not CC-CEDICT sense IDs, and the application's compact visual lexicon is WordNet 3.1 category data, not a sense concordance. Using those lemmas safely requires explicit synset alignment and Malaysia terminology review. No OMW lemmas have been imported or counted as translated in this release.
# Licensed bulk datasets

The current release adds dictionary evidence through `bulk-dataset.mjs`; it
does not require model inference or paid APIs. Run from the project root:

```powershell
node scripts/malay/dataset-backup.mjs
python scripts/malay/dataset-inventory.py
python scripts/malay/dataset-inventory.py --stage
python scripts/malay/dataset-download-kaikki.py
python scripts/malay/prepare-lexical-resources.py
npm run malay:datasets:prepare
npm run malay:datasets:test-import
npm run malay:datasets:import
node scripts/malay/dataset-release-artifacts.mjs
npm run malay:validate
```

The staging downloader includes the Google-derived 200k list solely for the
requested local research inventory. It is never an eligible importer source.
Cambridge, DBP and Kamus Dewan contents are not downloaded or imported. Keep
all `.tmp` source files, backups, model chunks and quarantine ledgers out of Git
and deployment uploads. Source hashes and licenses are pinned in the importer;
new versions require a fresh provenance and semantic review.

`dataset-reader.mjs` handles JSON arrays, bounded JSON object maps, JSONL,
CSV and TSV. Arrays/JSONL/delimited input stream; object maps have a 64 MiB
ceiling. CSV quoted multiline cells and escaped quotes are supported. Explicit
source language orientation prevents treating the Malay word `cat` (paint) as
the English animal. Normalization uses NFC and whitespace only. Individual
malformed or unusable rows are counted; a truncated source is never marked
complete. Normalized immutable shards/checkpoints are validated by SHA-256,
deduplicated and resumed in 500-input-row batches. The lexical indexes retain
only normalized eligible records, not entire source documents.

Matching requires exact English definition wording (or every semicolon/slash
clause), source POS, a unique Chinese–English WordNet synset, and the same
Malay lemma in the corresponding zsm synset. A headword hit is insufficient.
`scripts/data/malay-bulk-review-policy.json` adds explicit contextual,
localization and grammatical exclusions identified by assistant review. It is
not human verification. Quarantine includes unresolved hits and withheld
alternatives; existing records receive separate additional candidates.

The importer writes and validates an isolated store/runtime pair, checks every
existing record for byte-equivalent JSON content, then optionally promotes the
pair locally. A pending promotion journal stops further writes after an
interruption; restore its two `promotion-before-*.json` files only after
checking their journal SHA-256 values and rerun validation. The timestamped
backup has a full per-file SHA-256 manifest and independent `project/` source
copies with restoration instructions. Repeating the import adds zero records.
No numeric confidence is fabricated; new records carry explicit concordance
evidence and `unreviewed` / `automated-review-required` status. The existing
generator and previously stored confidence values remain compatible.

Runtime data uses the existing lazy worker asset. Full datasets and checkpoints
are never needed by production. `MALAY-NOTICE.txt`, the full licenses and
per-sense `MALAY-DATASET-ATTRIBUTION.json` retain source credits. The review
sample is `scripts/data/malay-bulk-review-samples.json`; the local TSV review
sheet and all ambiguous candidates are in `.tmp/malay-datasets/`.

## Complete local offline model processing

`KANJIAN_COMPLETE_OFFLINE_MALAY_TRANSLATION_REPORT.md` records actual counts,
benchmarks and release verification. The neural models are maintenance tools;
neither Vercel nor a student's browser downloads weights or runs inference.
All inference is local, and the worker explicitly disables network connections.
There is no paid provider, billing setup, subscription, or paid fallback.

Use the existing separate Python 3.12 environment in `.tmp/malay-model-env`.
`prepare-hplt.py` verifies the pinned HPLT CC BY 4.0 weight/tokenizer checksums,
preserves and checks all 64,000 tokenizer IDs, and creates int8 / float32 local
CTranslate2 models. `requirements-offline.txt` lists the CPU dependencies.
`requirements-cuda11.txt` describes a separate optional environment for the
existing older NVIDIA driver; it changes no system driver. The free NVIDIA
vendor runtime is not redistributed with the application.

After backing up the current store, `node scripts/malay/offline-workload.mjs`
creates a hashed per-sense workload with Mandarin, pinyin, exact English,
entry context, available POS/reference data and protected-existing status.
It deduplicates only equivalent complete contexts, never English spelling alone.
Each worker locks its directory, takes an immutable workload snapshot, checks
identity and shard SHA-256 values, and resumes its committed position. Batches
shrink with low available RAM and split on inference failure. Oversized input
is rejected instead of silently truncated; low memory/disk failures retain
completed shards. Separate partitions cannot import until all original senses
have an exactly aligned output row. No candidate is automatically verified.

Resume the two final partitions of the recorded run in separate terminals:

```powershell
.\.tmp\malay-model-env\Scripts\python.exe scripts/malay/offline-bulk.py --input .tmp/malay-complete/tasks-cpu-final.jsonl --output .tmp/malay-complete/full-cpu-final --threads 4 --batch-size 128 --beam-size 1
.\.tmp\malay-cuda11-env\Scripts\python.exe scripts/malay/offline-bulk.py --device cuda --precision float32 --input .tmp/malay-complete/tasks-gpu-final.jsonl --output .tmp/malay-complete/full-gpu-final --threads 2 --batch-size 128 --beam-size 1
```

The frozen original CPU partitions and `bulk-plan.json` must remain unchanged.
M2M100 processes a separate exact-sense lexical subset; a restricted surname
retry expands `surname NAME` to the synonymous `Family name: NAME.` input.
Only a whole model output matching licensed `nama keluarga` and the complete
unchanged Roman name qualifies. Such outputs are typed and displayed as English
definition translations, separately from lexical equivalents. The validator
does not fill a translation from the template when the model fails.

After all worker checkpoints finish:

```powershell
node scripts/malay/offline-prepare.mjs
node scripts/malay/offline-integrate.mjs
node scripts/malay/offline-integrate.mjs --promote-local
```

The first import is isolated. Immutable per-batch import snapshots permit
interruption recovery; existing translations are protected byte for byte at
record level. Local promotion uses a paired backup/journal and rollback on
failure. A repeat import adds zero records. Unqualified outputs remain local
in `.tmp/malay-complete/quarantine.jsonl`; they never enter application data.
If a promotion journal is pending, verify its before-file SHA-256 values and
restore both `promotion-before-store.json` and `promotion-before-runtime.json`
before retrying. The complete project snapshot also has `RESTORE.txt` and a
per-file checksum manifest. Do not reset unrelated working-tree changes.

The committed evaluation contains 380 stratified senses, licensed references,
actual model outputs, assistant screening, and a separate 200-case surname
pilot. Independent human review remains zero. Model agreement, exact reference
matching and automated validation do not establish general semantic accuracy.
All newly stored outputs require independent Mandarin–Malaysian Malay review.

## Deep recovery of the recorded bulk run

`KANJIAN_MALAY_TRANSLATION_RECOVERY_REPORT.md` records the subsequent forensic
investigation and release. `deep-forensics.mjs` verifies all saved workload and
shard hashes and classifies every original withheld sense. Its evidence classes
are not semantic truth labels. The immutable prior quarantine remains intact.
`deep-recover.mjs` reuses actual cached model outputs; it accepts scoped Malay
loanwords and verb lemmas using POS/reference evidence. Missing Chinese WordNet
entries require both a unique complete-English synset and Malay Wiktionary
attestation; a contradictory Chinese entry is never ignored. Known false friends
remain excluded by `malay-deep-review-policy.json`.

Dictionary cross-reference definitions have a separate bounded grammar in
`reference-definition.mjs`. It preserves the complete cited Chinese spelling
and numeric pinyin. The generic Unicode validator permits Han only when this
complete proof validates; arbitrary Han, damaged references, dropped qualifiers
and extra explanations remain rejected. These records are explicitly definitions.
Protected mode translates seven fixed relations with an opaque marker and
restores the original citation per sense. Its many output rows are not thousands
of independently inferred lexical translations. Both raw model text and the
actual protected English input are stored, with grammar normalization disclosed.

The new run reused both downloaded models. M2M100 processed only previously
unattempted, reference-eligible senses. A failed long-placeholder pilot was
quarantined; a shorter marker and expanded English abbreviation passed the
500-sense scoped pilot. No human verification or calibrated confidence is claimed.

The frozen new workloads and checkpoints are in `.tmp/malay-deep/`. To verify or
resume inference without repeating completed work:

```powershell
.\.tmp\malay-model-env\Scripts\python.exe scripts/malay/offline-bulk.py --model m2m100 --input .tmp/malay-deep/new-tasks.jsonl --output .tmp/malay-deep/new-m2m100 --threads 4 --batch-size 128 --beam-size 4
.\.tmp\malay-model-env\Scripts\python.exe scripts/malay/offline-bulk.py --input .tmp/malay-deep/protected2-tasks.jsonl --output .tmp/malay-deep/protected2-hplt --threads 2 --batch-size 128 --beam-size 4 --preprocessing protected-dictionary-reference-v1
node scripts/malay/deep-stage.mjs --new --resume
```

The last command stages an idempotent import and does not promote it. Paired
promotion is the separate `--promote-local` operation. Each prepared import binds
the exact policy/source hashes as well as its baseline and candidate hashes.
Retain the original extraction and partition files; do not regenerate workloads
over a promoted store into the same run directory. A new recovery session needs
its own backup, baseline and workspace before extraction. The two canonical Malay
JSON files have a narrowly scoped 32 MiB preflight ceiling; all other pending
files retain the 8 MiB check. Weights/caches are excluded from Git and deployment.

## Separate lexical equivalents and preserved explanations

The additive schema keeps every original `malay` text and its metadata intact.
An optional `malayLexical` or `malayDefinition` object has its own text, status,
quality, source, license and version. Untyped legacy text is not relabelled based
on length. The UI presents the equivalent and explanation separately. Full
lexical evidence stays in the source store, outside the lazy runtime projection.

`lexical-enrichment.mjs` assesses the complete corpus, prioritizing existing
definitions. Direct lexical extraction requires full English-clause/POS agreement
and both Wordnet Bahasa and Malay Wiktionary evidence. If Mandarin concordance
is absent, every English clause must be independently unambiguous. Known sense,
locale and grammatical conflicts remain withheld. Exact equivalence references
require unchanged script and numeric pinyin plus agreement across ALL target
senses. Ordinary see-references, unresolved meanings, POS conflicts and cycles
are never followed. Seeds are frozen; outputs do not recursively authorize outputs.

The recorded frozen run is `.tmp/malay-lexical-accuracy/run-final`. Do not regenerate
its preparation over a promoted store. Revalidate or resume with:

```powershell
node scripts/malay/lexical-enrichment.mjs integrate
node scripts/malay/lexical-enrichment.mjs integrate --promote-local
node scripts/malay/lexical-evaluate.mjs
```

The first command only stages an isolated pair. Promotion binds the original
store, corpus, candidate file and policy hashes, preserves every old field, uses
a paired backup/journal, and restores on write failure. A pending journal blocks
further promotion until its two verified before-files are restored. Repeat imports
add nothing. A fresh research run needs a new directory and baseline backup.
All uncertain alternatives and provisional outputs remain in the hashed local
review queue; the committed lexical review sheet lists all released additions.

The 380-sense evaluation reuses verified offline model shards and includes 300
licensed reference cases. Source overlap makes extractor/reference matching a
consistency check, not independent semantic accuracy. Zero independent human
reviews are claimed. Read KANJIAN_MALAY_LEXICAL_ACCURACY_REPORT.md before
interpreting acceptance counts or expanding unrestricted neural inference.
