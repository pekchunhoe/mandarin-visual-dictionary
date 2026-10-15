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
