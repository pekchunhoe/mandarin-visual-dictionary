# KANJIAN strict zero-cost translation release

## Implemented behavior

Every selected dictionary sense without a stored Malay meaning now offers **Translate with Google**. The link opens `https://translate.google.com/` in a new tab with `sl=en`, `tl=ms`, `op=translate` and the complete selected English definition in the `text` query parameter. Selecting a different meaning updates the link. Qualifiers, punctuation and Unicode are preserved through URL encoding. It is available in English-only, Malay-only and combined display modes. Stored Malay meanings continue to display normally and do not receive this missing-meaning action.

This is ordinary, user-initiated navigation to the official website. KANJIAN does not call a Google translation API, embed Google scripts, scrape results, capture translations or save website output. `noopener noreferrer` and a no-referrer policy protect the original tab. The interface explicitly says that the result is not saved. The website needs an internet connection; KANJIAN's existing stored meanings continue to work offline. Short or ambiguous English definitions can still require the user's judgment on the external website.

**Translation API charges introduced by this release: zero.** No billing information, credit card, Cloud project, API key, hosted inference endpoint, subscription or paid upgrade is requested or activated. There is no paid fallback. No translation model or new translation function is deployed. The existing image service is unchanged.

## Preservation

- Existing canonical senses: **198,245**, unchanged.
- Stored translated senses: **4,184**, unchanged; coverage remains **2.110520%**.
- Missing stored translations: **194,061**. These gain access to the website link; they are not counted as new inline translations.
- New automatic inline translations: **0**. No unsupported coverage increase is claimed.
- Mandarin, traditional spelling, pinyin, English definitions, canonical keys, sense relationships and all existing Malay glosses remain intact.
- `public/data/cedict.json`, `scripts/data/malay-translations-v1.json`, `src/data/malay-runtime.json` and `src/data/learning-runtime.json` are SHA-256 byte-identical to the start of this task.
- A verified, independently restorable 244-file snapshot exists at `.tmp/malay-datasets/backups/2026-10-15T03-08-30-567Z/`, with per-file hashes and restoration instructions. Previous unfinished experiments and downloads remain preserved locally and excluded from deployment.

## Cost enforcement

The optional maintenance generator previously supported explicitly budgeted network providers. This release removes that path. It requires `offline: true` and zero or omitted budget fields, and rejects incompatible settings **before dynamic adapter import**. Checkpoints with recorded cost, reservations or pending network work are refused without modification. A non-zero usage claim quarantines the batch without retry or publication. Ordinary builds never invoke generation. The example generator remains disabled.

The generator accepts trusted local maintenance adapters; arbitrary JavaScript is not a network sandbox. No third-party adapter is enabled in the application. Newly introduced adapters must be audited for genuinely offline operation before use. The deployed application contains no translation engine, so it cannot initiate a translation API charge.

The production build now runs `scripts/verify-translation-cost.mjs`. It rejects prohibited translation SDK/scraper dependencies, translation API endpoints in built JavaScript, unvalidated model weights and additional API functions. It verifies the official link helper performs no request or persistence and retains the existing same-origin `connect-src` policy. No dependencies were added.

## Offline model evaluation

This assessment uses the existing pinned local evaluation records, actual staged weight sizes and current primary model documentation. No new large model was downloaded and no paid service or hosted inference provider was contacted. Earlier 40-sense annotations are exploratory assistant judgments, **not independently human-certified accuracy scores**. They identify concrete failures, not a guarantee about every variant or a calibrated accuracy percentage.

| Candidate | License and practical evidence | Release decision |
|---|---|---|
| [Helsinki OPUS English–multilingual](https://huggingface.co/Helsinki-NLP/opus-mt-en-mul) | Apache 2.0. Pinned revision `07ab277b060b29b7208dc0a198327eeeea92224d`; original local weights 310,258,677 bytes, converted CPU int8 weights 79,104,315 bytes. The tested target was `zlm_Latn`; the model card lists broader targets, so its list is not treated as proof that a specific snapshot has a Malaysian Malay selector. Existing outputs include `cat` → `buk`. | Relatively compact local candidate, but the tested configuration has unacceptable sense/terminology failures. Not enabled inline. A browser conversion and sustained mobile performance have not been validated. |
| [Meta M2M100 418M](https://huggingface.co/facebook/m2m100_418M) | MIT; explicitly supports Malay `ms`. Pinned revision `55c2e61bbf05dfb8d7abccdc3fae6fc8512fd636`; original local weights 1,935,796,948 bytes, CPU int8 weights 487,900,904 bytes. Existing English-sense testing used the documented target-language mechanism. `to boil` produced `untuk minum` (“to drink”). | No demonstrated configuration correction resolves the recorded semantic errors. Quantization effects were not isolated; these results do not establish that every full-precision variant fails. The tested path does not qualify for release. |
| [Google MADLAD-400 3B MT](https://huggingface.co/google/madlad400-3b-mt) | Apache 2.0. The staged Q4K file is **1,654,597,280 bytes**, revision `fa184c675da0b5c9e1c8694fccd4e12e2d422094`. Its model card documents approximately 1.65 GB quantized versus 11.8 GB original weights and domain/production-evaluation limitations. | No completed, validated browser runtime or Malaysian Malay sense benchmark is available for this snapshot. The weight download and runtime memory are unsuitable for silently adding to this lightweight educational site. No weights are hosted or loaded by this release. |
| [Meta NLLB-200 distilled 600M](https://huggingface.co/facebook/nllb-200-distilled-600M) | CC BY-NC 4.0, potentially compatible with properly attributed non-commercial evaluation. Its model card describes research use, does not release it for production deployment, and notes domain/length limits. | The non-commercial app status does not establish production reliability. No validated sense-aware browser implementation or quota-safe hosting plan exists here, so it is not downloaded, served or enabled. The model-card intended-use statement is distinguished from the license itself. |

The existing Chinese-to-OPUS snapshot is not an English-to-Malay solution; its actual target vocabulary was unsuitable for claiming Malaysian Malay coverage. A general LLM was not substituted for a validated translator. [Transformers.js WebGPU guidance](https://huggingface.co/docs/transformers.js/en/guides/webgpu) documents local browser inference, but browser/GPU support and available memory vary. CPU Python/CTranslate2 measurements do not establish browser/WASM/WebGPU compatibility. Adding a browser runtime would also require new dependencies, explicit model download consent, cache/storage bounds, device testing, licensing notices and a sense-aware quality evaluation. Those requirements are not currently met.

The built-in browser Translator API was also checked in a secure local context on the installed Edge 155 browser. The API exists, but `Translator.availability({sourceLanguage: 'en', targetLanguage: 'ms'})` returned **unavailable**. No translation session or model download was started. [Chrome's documented language list](https://developer.chrome.com/docs/ai/translator-api) omits Malay and documents desktop-only availability; [Edge's API documentation](https://learn.microsoft.com/en-us/microsoft-edge/web-platform/translator-api) does not replace the actual per-language availability check. Browser-owned translation therefore does not provide a reliable English–Malay option on the tested device either. No experimental browser flags or cloud polyfill are enabled.

Therefore **no automatic offline inline engine is integrated**. This follows the requirement to integrate one only when reliability, resource limits and zero paid infrastructure are established. Licensed existing dictionary translations remain the inline source, with the official website as an optional online action for missing meanings.

The [official Cloud Translation setup documentation](https://docs.cloud.google.com/translate/docs/setup) is a reference only. Cloud Translation is not activated, and its free allowances are not used as a billing-dependent workaround.

## Validation and resource impact

- Production build, TypeScript and seven isolated server-packaging scenarios: **PASS**.
- Full unit/integration suite: **825 tests passed**, 26 files, no failures or skips.
- Focused browser suite: **6 passed**, zero failed, skipped or flaky, including the real new-tab navigation test and existing Malay/gallery/mobile checks.
- Production-built lazy loading and Malay offline/reload/saved-sense checks: **PASS**.
- Data preservation, build cost guard, lazy bundle boundaries, source/security checks and whitespace: passing; final release checks recorded below.
- Startup JavaScript remains **321,145 bytes / 95,837 bytes gzip**, identical in size to the preceding release.
- The lazy word-detail chunk is **12,473 bytes**. The worker and hashed Malay data asset retain their existing filenames and content; no model weights or dataset files were added to the frontend.
- The only production feature added is a static external link and explanatory text. No new server function, storage/database, background task, inference compute or paid service is provisioned. Existing Vercel configuration, project, domain, credentials and environment variables remain unchanged.

Browser verification checks the actual anchor, exact selected-sense parameters, new-tab behavior, null opener, no pre-click Google request, no storage change, sense switching, 320-pixel layout, reload and existing Mandarin/English/Malay searches. The automated local popup test uses a deterministic third-party response and does not pretend to evaluate Google's translation quality. Production verification separately opens the actual official website and records only navigation/status; it does not read or persist translation results.

## GitHub and production

- Repository: https://github.com/pekchunhoe/mandarin-visual-dictionary
- Branch: `main`.
- Release commit: pending validated release.
- Existing production project: `pek-explains-physics/mandarin-visual-dictionary`, ID `prj_45bxtqgs7w3rV211KuVvoWmmxJkU`.
- Existing URL: https://mandarin-visual-dictionary.vercel.app
- Prior working deployment retained for rollback: `dpl_7DjrHJn3tAYBBqVQZjTWSQdpHUoh`, the Git-triggered deployment of preceding commit `824604c296a0067ec6db3e015086a4e267bc86dc`.
- Deployment and independent live verification: pending. No production-success claim is made before verification.

Authenticated project/deployment API metadata confirms the existing GitHub integration deploys `main` automatically. This release uses that workflow without plan changes, paid add-ons, quota overrides or a duplicate manual deployment. If the platform refuses the deployment because of a limit, the previous working release is retained; no upgrade or billing activation is attempted. This release introduces no translation API or model-hosting resource that could incur translation charges. The earlier integration report's inference about a missing Git link was corrected after checking the full authenticated API metadata; the CLI inspection summary had omitted that information.
