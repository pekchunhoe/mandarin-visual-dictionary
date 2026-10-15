# KANJIAN Malay translation completion report

Date: 14 October 2026. Work remained local; no commit, push or deployment and no paid API calls.

**Translation generation is incomplete.** This run added 2,475 accepted automated candidates, bringing usable provisional Malay coverage to **3,868 / 198,245 senses (1.9511%)**. All 3,868 require independent human linguistic review. The existing trilingual software remains functional; this is not a claim of complete corpus translation or verified linguistic accuracy.

## Corpus integrity

There are **125,173 canonical entries**, 121,408 distinct simplified spellings, and **199,713 raw definitions**. The existing app excludes **1,468 standalone `CL:` classifier definitions**, exposing **198,245 meaning senses**. Inline classifier annotations are cleaned for display separately. The two counts therefore use different inclusion rules; neither deduplication nor lost data explains the discrepancy.

The original corpus was audited before additions. Its SHA-256 remains `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a`. Values were compared against the original `cedict.txt.gz`, and all 125,173 entries passed presentation/classification snapshots. Original Chinese, English, pinyin, filtered sense ordinals and stable sense keys remain unchanged. All **1,393 previous translation records were preserved exactly**, including their provenance.

## Coverage and verification

| Measure | Count |
|---|---:|
| Accepted Malay senses | 3,868 |
| Preserved provisional senses | 1,393 |
| Newly accepted automated senses (`generated`) | 2,475 |
| High-confidence automated status | 0 |
| Independently human-verified senses | 0 |
| Accepted senses requiring human review | 3,868 |
| Missing senses | 194,377 |
| Original tagged idiom/figurative senses | 8,583 |
| Translated tagged idiom/figurative senses | 55, or 0.6408% |
| Missing tagged idiom/figurative senses | 8,528 |
| Newly added explicit idiom/figurative explanations | 94 |
| Initial three-language lexical candidates | 5,597 |
| Lexical candidates quarantined rather than accepted | 3,216 |

The 94 explanations include senses of idiomatic headwords whose individual English glosses are not tagged by the existing idiom classifier. Original classifications were preserved, so 94 is not the tagged-idiom coverage numerator. New accepted automated coverage alone is 1.2485% of the corpus.

Rejected candidates remain outside the authoritative dictionary and continue to count as missing. Rejection and missing figures overlap; they must not be added together. The five neural benchmark runs generated 200 outputs for the same 40 senses, **not 200 translated corpus senses**; those outputs were not automatically imported.

Existing runtime statuses remain compatible (`missing`, `generated`, `unreviewed`, `verified`). Optional `translationQuality` distinguishes human verification, high-confidence automation and automation requiring review. Rejected status is recorded in separate ledgers. Generation forces review-required status even if an adapter claims human verification. Confidence numbers are heuristics, not calibrated probabilities.

## Resources and licensing

| Resource | License / result |
|---|---|
| [Helsinki OPUS Chinese–Malay](https://huggingface.co/Helsinki-NLP/opus-mt-zh-ms) | Apache-2.0; downloaded and tested. Actual tokenizer exposes `>>ind<<`, not the advertised Malaysian Malay selector. Default output was permitted only for evaluation. |
| [Helsinki OPUS English–multilingual](https://huggingface.co/Helsinki-NLP/opus-mt-en-mul) | Apache-2.0; tested with its actual `>>zlm_Latn<<` Malay token. No `>>zsm_Latn<<` token in this snapshot. |
| [Facebook M2M100 418M](https://huggingface.co/facebook/m2m100_418M) | MIT; tested English and Chinese sources with explicit `__ms__` target. This is a Malay selector, not proof of Malaysian localization. |
| [NLLB distilled 600M](https://huggingface.co/facebook/nllb-200-distilled-600M) | CC-BY-NC-4.0; excluded from this commercially permissible workflow. |
| [Mesolitica small Malaysian translation model](https://huggingface.co/mesolitica/translation-t5-small-standard-bahasa-cased) | Examined, not downloaded: model-weight license was not established from its card. A code-library license was not assumed to license weights. |
| [MADLAD400 3B](https://huggingface.co/google/madlad400-3b-mt) | Apache-2.0; investigated but not benchmarked. The current CT2 conversion path requires substantially more free memory for this larger model. The card documents a smaller Candle quantization; neither Candle nor its Rust toolchain is installed here. Its quality is unknown in this project. |
| [Wordnet Bahasa](https://github.com/omwn/omw-data/tree/main/wns/msa) | MIT explicitly covers data. Used **zsm** Malay data, not the separate Indonesian file. |
| [Chinese Open Wordnet](https://github.com/omwn/omw-data/blob/main/wns/cow/LICENSE) | Permits use/modification/distribution for any purpose with notices retained. |
| [Princeton WordNet 3.0](https://github.com/omwn/omw-data/blob/main/wns/eng/LICENSE) | Permits commercial use with its full notices/disclaimer retained. |

The three lexical resources share WordNet 3.0 synset identifiers. They are pinned to OMW commit `406bf83b3c507a3d1f26e88252d5d66893fd36bf`; downloaded files have SHA-256 manifests checked before alignment. Complete source licenses are shipped in `public/data/licenses/`, with attribution in `public/data/MALAY-NOTICE.txt`. KANJIAN-authored additions and corpus alignment retain CC-BY-SA-4.0 metadata. No DBP/PRPM data was scraped or copied.

Model revisions, in table order: OPUS Chinese `cf1a3e4739740082ad4b0cca4aa9f5a5748c4699`; OPUS English `07ab277b060b29b7208dc0a198327eeeea92224d`; M2M100 `55c2e61bbf05dfb8d7abccdc3fae6fc8512fd636`.

## Quality benchmark and publication decision

The benchmark has 40 uniquely aligned corpus senses: common school vocabulary, noun/verb/adjective distinctions, polysemy in 开/长/行/好/得, abstract concepts, technical vocabulary, uncommon words, cultural context and 12 idiom cases. Each English sense is a separate input. A second M2M100 English run expands dictionary abbreviations and literal/figurative markers without changing stored definitions.

References and judgments are **assistant-authored exploratory assessments**, not certified human gold data, blind evaluation or a statistically representative corpus accuracy estimate. Every input/output, reference, model revision and judgment is retained in `scripts/data/malay-model-benchmark-results.json`. Exact-reference matches are reported separately and are not a semantic accuracy measure.

| Approach | Assistant-assessed acceptable candidates | Acceptable idiom cases | Inference seconds / 40 senses | Senses/sec | End-of-inference RSS |
|---|---:|---:|---:|---:|---:|
| OPUS Chinese default, no qualified Malay selector | 7/40 | 0/12 | 1.078 | 37.11 | 436 MB |
| OPUS English → Malay | 5/40 | 0/12 | 3.954 | 10.12 | 434 MB |
| M2M100 Chinese → Malay | 8/40 | 0/12 | 4.781 | 8.37 | 882 MB |
| M2M100 exact English sense → Malay | 15/40 | 1/12 | 11.406 | 3.51 | 881 MB |
| M2M100 cleaned English sense → Malay | 15/40 | 1/12 | 11.750 | 3.40 | 881 MB |

The unrestricted-publication criterion requires at least 90% adequate complete meanings, appropriate sense/idiom behavior and no severe hallucination. Every model fails decisively. English context improves M2M100 sense discrimination over bare headwords but does not solve fidelity or idioms. Examples: “to boil” becomes “to drink”; “gluttonous” becomes “glucose”; figurative meanings become literal English-metaphor translations. OPUS Chinese emits subtitle control markup and an unrelated expletive for some uncommon words. Cleaning abbreviations does not make M2M100 eligible for bulk import.

Therefore **no unrestricted neural translation batch was published**. Model scores/log probabilities do not establish semantic correctness.

The selected restricted approach uses an assistant-authored list of 1,800 exact English terminology keys plus 94 explicitly scoped explanations. A lexical candidate requires a unique shared Chinese/English synset, agreement of every English clause, a qualified Malay term present in that zsm synset, and structural/language QA. Only the selected equivalent is retained; questionable resource synonyms are excluded. Qualifiers and unresolved multi-clause senses are not silently discarded.

All 196,852 initially missing senses were scanned, with no arbitrary first-N publication cutoff. The final scan qualified 2,475 additions: **2,381 lexical senses and 94 scoped explanations**. Initial deterministic samples, all 215 initial verb alignments and further distributed samples were inspected by the assistant. This exposed wrong or over-broad alignments, including 公猪 “boar” → “wild pig,” pricing “to value” → “appreciate,” and “to flee” → regional “kabur.” Those policies now reject the relevant candidates. Sampling and concordance still cannot guarantee the other translations. A final 100-record sample and all 94 explanations are in `scripts/data/malay-linguistic-review.json` for independent human review.

## Pipeline, resource bounds and recoverability

The existing pipeline was extended with selected-sense queues, policy-sensitive cache signatures, persisted rejection dispositions, review-quality/model metadata and development index deltas. It continues to validate imports atomically and preserve existing translations. Changed adapter logic or terminology changes its version, invalidating old candidate caches. Rejections are not repeatedly regenerated unless explicitly retried. Cached outputs are restricted to the current selection. Unknown billing reservations remain protected.

Each completed batch is saved as an immutable file before the checkpoint manifest advances. Successful checkpoints remain recoverable after interruption; authoritative data changes only through validated import. Windows atomic writes now skip identical content and retry transient file locks briefly while preserving the old destination. Re-running the final generation after import produced **zero new candidates**, with no duplicate records or provider calls.

The complete missing queue is `.tmp/malay-remaining-senses.jsonl` (194,377 senses). Full scan dispositions, rejection ledger, selection, output and checkpoint files are under `.tmp/malay-qualified/`. The imported records also remain in the authoritative store, independent of temporary outputs. The index delta contains **2,475 upserts and zero removals**. Existing worker reloads apply the new lazy asset; no live index-update protocol or search algorithm was replaced.

Local inference used CPU int8, one model at a time, two threads, beam size four, at most 64 input texts and 384 source tokens. Overlong input is refused rather than truncated. Models, venv and checkpoints are development-only. Public downloads use explicit byte ceilings and checksum manifests. No remote model code or paid provider was invoked.

This machine has 8 logical CPUs and approximately 11.85 GiB RAM; available RAM fluctuated around 2–3 GiB. M2M100 conversion initially refused its conservative free-memory guard, then succeeded with bounded float16 source loading and int8 conversion. Downloaded/converted models occupy 3.22 GB; the project-local Python environment occupies 0.91 GB. Over 63 GB of disk remained free. Reported inference RSS is a point measurement, not a measured peak. Conversion times were approximately 25 s (Chinese OPUS), 11 s (English OPUS), and 22 s (M2M100). The constrained full scan took approximately 1.7 s, excluding corpus loading and publication; generation used 25 batches of at most 100 senses.

## Search, bundle and regression evidence

All 3,868 accepted terms were tested for index presence and entry retrieval. Exact/phrase/synonym/morphology and Mandarin/pinyin/English regressions remain intact. The Malay index has 1,982 normalized vocabulary terms, 4,100 postings and a 1,119,875-byte diagnostic serialized representation. That diagnostic snapshot is not an added startup payload.

Startup JS remains **321,145 bytes** before and after this run; gzip changed only from 95,834 to 95,837 bytes. The worker remains 56,062 bytes. The expanded Malay asset is **3,502,330 bytes raw / 321,307 gzip / 230,970 Brotli**, loaded on demand, absent from fresh-home downloads/precache. Model weights, benchmarks, review samples and ledgers do not enter the browser import graph.

Full dictionary index construction measured 7.55 s. Warm median queries: Mandarin 0.10 ms, pinyin 0.64 ms, English “dog” 0.16 ms, Malay “anjing” 0.35 ms, “membantu” 0.43 ms and phrase “tidak malu bertanya” 0.27 ms. These are local measurements, not cross-device guarantees. Retained heap after GC was about 289 MB. The production offline test measured a 17.7 s cold first lookup while other browser checks were active, with zero fresh-home dictionary/Malay fetches and no page errors.

Completed verification:

- **812 unit tests / 25 files passed** with one worker. An earlier concurrent run had one 60-second full-corpus snapshot timeout; the isolated rerun passed without changing snapshots or timeout limits.
- **80 browser tests passed** in 9.6 minutes, including responsive layouts, accessibility, selected-sense galleries, mixed providers, failures, saves and all search languages.
- The expanded three-test Malay browser suite additionally passed with the new **semikonduktor → 半导体** and **kebenaran akhirnya terbongkar → 水落石出** selected-sense galleries and reloads. An initial targeted reload timed out while a build was also rewriting watched files; the rerun after the build passed. Preprocessing/build and browser stages should be sequential.
- Production build, TypeScript, seven isolated server packaging/failure scenarios, source/security boundaries, whitespace, bundle boundaries and lazy-loading checks passed.
- Production Malay offline search, saved-sense retention, phrase/synonym lookup and legacy-cache migration passed.
- Full corpus/value comparison, stable IDs, duplicate rejection, preservation of all 1,393 prior records, review status controls, rejection checkpoint/resumption and changed-policy cache invalidation passed.
- Python preprocessing scripts compiled. Neural quality evaluation remains separate from software test success.
- After the Windows atomic-write adjustment, all six pipeline tests passed again; the final build and bundle/source/whitespace checks passed again as well.

## Exact continuation commands

Run from this repository in PowerShell. The current resources and virtual environment are already available. To add more qualified terms/explanations, update the exact-sense TSV files after linguistic assessment, then run:

```powershell
node scripts/malay/prepare-qualified-run.mjs
node scripts/malay/pipeline.mjs generate .tmp/malay-qualified/config.json
node scripts/malay/pipeline.mjs import .tmp/malay-qualified/accepted-candidates.json
npm run malay:validate
node scripts/malay/completion-audit.mjs
npm run malay:queue
```

On an unchanged store this intentionally generates no new records. Do not delete checkpoints to resume. The qualifier limits publication by proven scope, not by a small batch count. Shared terminology is reused only after each Chinese/English sense passes alignment; original records and their metadata remain separate.

If local lexical downloads are absent, restore the pinned public resources:

```powershell
$malayPython = '.\.tmp\malay-model-env\Scripts\python.exe'
& $malayPython scripts/malay/prepare-lexical-resources.py
```

To reproduce model evaluation using the existing environment:

```powershell
$malayPython = '.\.tmp\malay-model-env\Scripts\python.exe'
node scripts/malay/benchmark-models.mjs
& $malayPython scripts/malay/prepare-offline-models.py --model zh-ms
& $malayPython scripts/malay/prepare-offline-models.py --model en-mul
& $malayPython scripts/malay/prepare-offline-models.py --model m2m100 --max-download-mib 2100
& $malayPython scripts/malay/offline-model-runtime.py convert --model zh-ms
& $malayPython scripts/malay/offline-model-runtime.py convert --model en-mul
& $malayPython scripts/malay/offline-model-runtime.py convert --model m2m100
& $malayPython scripts/malay/offline-model-runtime.py translate --model zh-ms --allow-untargeted-benchmark --input .tmp/malay-benchmark/direct-input.json --output .tmp/malay-benchmark/direct-output.json
& $malayPython scripts/malay/offline-model-runtime.py translate --model en-mul --input .tmp/malay-benchmark/english-input.json --output .tmp/malay-benchmark/english-output.json
& $malayPython scripts/malay/offline-model-runtime.py translate --model m2m100 --source-language zh --input .tmp/malay-benchmark/direct-input.json --output .tmp/malay-benchmark/m2m-zh-output.json
& $malayPython scripts/malay/offline-model-runtime.py translate --model m2m100 --source-language en --input .tmp/malay-benchmark/english-input.json --output .tmp/malay-benchmark/m2m-en-output.json
& $malayPython scripts/malay/offline-model-runtime.py translate --model m2m100 --source-language en --input .tmp/malay-benchmark/english-cleaned-input.json --output .tmp/malay-benchmark/m2m-cleaned-output.json
node scripts/malay/evaluate-benchmarks.mjs
```

Dependencies are pinned in `scripts/malay/requirements-offline.txt`; this run used Python 3.12, CTranslate2 4.8.3, Transformers 4.57.6 and CPU Torch 2.14.1. Public downloads require network access; inference after download is offline. The Chinese untargeted option is deliberately unavailable for the serving worker.

For full regression checks, run unit/build/browser stages sequentially to avoid memory contention. Keep `npm run dev` running for browser tests and `npm run preview` for offline/lazy checks:

```powershell
npm test -- --maxWorkers=1
npm run build
npm run test:browser
npm run malay:validate
npm run test:bundle
npm run check:source
npm run check:whitespace
npm run test:lazy
npm run test:malay-offline
npm run test:offline
npm run measure:bundle
```

## Remaining blockers

**194,377 senses and 8,528 tagged idiom/figurative senses remain untranslated.** No tested neural model meets the acceptance criterion. Additional safe coverage requires more qualified terminology/exact-sense explanations, or a commercially permissible model that passes a new benchmark and subsequent sense-level checks. The current approach cannot resolve most cultural explanations, proper names, dialectal/rare words, ambiguous senses or difficult idioms automatically.

All 3,868 accepted translations still require independent Malaysian Malay linguistic review. Neither source licensing, WordNet concordance nor passing software tests supplies that review. Checkpoints, original data, accepted progress and the complete remaining queue have been preserved. No claim of 100% substantive coverage is made.
