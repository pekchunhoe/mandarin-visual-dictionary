# KANJIAN AI Teacher — final pre-deployment verification

This report preserves the earlier `teacher-v1` live verification. Subsequent universal prompt improvements and current mocked regression evidence are documented in [the language-quality improvement report](KANJIAN_AI_TEACHER_LANGUAGE_QUALITY_REPORT.md). No additional live requests were authorized or made for that update.

Date: **26 October 2026**, Asia/Kuala_Lumpur.

**Technical verification: PASS. Unconditional release sign-off: FAIL pending review of the Malay idiom wording identified below.** The code, security, rate-limit handling, live connectivity, copy controls, regression tests and production build passed. One additional live idiom sample did not fully meet the requirement for precise, standard Malaysian Malay. No production code or prompts were changed to conceal that result.

The configured Vercel rule is reported by the user as **20 requests per 60 seconds**. Actual deployed firewall enforcement is **NOT YET VERIFIED** and must be tested after deployment; local tests cannot establish that it works on Vercel.

No commit, push or deployment was performed. No API key was printed. No environment file, billing setting, quota purchase, Vercel setting, dictionary content or security policy was changed.

## PASS/FAIL matrix

| Requirement | Result | Actual evidence |
| --- | --- | --- |
| Exact model; no alternative fallback | **PASS** | Source and packaged bundle contain only `gemini-3.5-flash-lite`; all four live responses reported that exact provider model version. |
| Firewall Rate Limit ID | **PASS** | `checkRateLimit('kanjian-ai-teacher', ...)` in `server/teacher-rate-limit.ts`; SDK request path/header assertions passed. |
| Reject excess traffic before Gemini | **PASS locally** | Requests 1–20 accepted and 21 rejected in handler tests. Both actions also returned HTTP 429 through the actual packaged API entrypoint with mocked firewall rejection and **zero Gemini calls**. |
| Per-visitor bucketing; no accidental global key | **PASS locally** | No custom/global `rateLimitKey`. Installed SDK derives the key from trusted `x-real-ip`. Two IPs sharing one proxy socket received separate 20-request budgets in the integration test. |
| No conflicting six-request cap | **PASS** | Development uses 20 requests per 60 seconds. The local counter is bypassed on Vercel; the production rule owns the threshold. |
| Both functions using real Gemini | **PASS** | Exactly four controlled requests, all HTTP 200 and completed with `STOP`; both actions passed application runtime validation. |
| Three complete sentences and genuine relations | **PASS for structure and common-word sample** | Both sentence responses contained exactly three distinct Chinese sentences with English/Malay translations. 美丽 returned three genuine synonyms and two antonyms; 苹果 returned no fabricated relations. |
| Standard Malaysian Malay accuracy across all live samples | **FAIL — review required** | The additional idiom sample used imprecise wording such as `jangan buat kerja leceh` for avoiding unnecessary changes. Details below. |
| All individual sentence copy buttons | **PASS** | Six actual clipboard checks: all three buttons for 美丽 and all three for 画蛇添足, using the captured live responses. Each clipboard value matched only its own complete trilingual sentence. |
| Combined relations copy button | **PASS** | Exactly one Copy All button; real clipboard content matched every generated Chinese/English/Malay relation, including the empty 苹果 result and explanations. |
| Existing functionality and performance boundaries | **PASS** | 947 regression tests, 31 browser tests, bundle/source checks and production offline/lazy-loading check passed. Original dictionary/translation data and image bundle have no Git diff. |
| Actual deployed Vercel firewall enforcement | **NOT VERIFIED** | Requires a post-deployment test against the published rule and deployed function. |

## Controlled live requests

The existing local server-only `GEMINI_API_KEY` was loaded in memory. Requests used the real generated `api/teacher.js` → `server/teacher-service.mjs` path, not a separately constructed generation prompt. Only the exact configured Gemini endpoint was allowed by the verification wrapper. A persistent local ledger enforced the **maximum of four** outbound requests. There were **no automatic retries, alternate-model calls, model-list calls, billing changes or quota purchases**.

| # | Local time | Selected entry/sense and action | Upstream/application status | Output | Provider duration | Tokens |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 11:34:59 | 美丽 · beautiful · `sentences` | 200 / 200 | 3 complete trilingual sentences | 1,982 ms | 372 |
| 2 | 11:35:01 | 美丽 · beautiful · `synonyms-antonyms` | 200 / 200 | 3 synonyms, 2 antonyms | 2,087 ms | 433 |
| 3 | 11:35:45 | 苹果 · apple · `synonyms-antonyms` | 200 / 200 | 0 synonyms, 0 antonyms | 1,837 ms | 267 |
| 4 | 11:35:47 | 画蛇添足 · ruin the effect by adding something superfluous · `sentences` | 200 / 200 | 3 complete trilingual sentences | 2,115 ms | 553 |

All four responses reported `modelVersion: gemini-3.5-flash-lite` and `finishReason: STOP`. Reported usage totals **882 input + 743 output = 1,625 tokens**. No cost estimate or account billing-state claim is inferred from those counts. Existing project access permitted all four requests. The `.env.local` byte hash was compared before/after the live run and remained unchanged; the hash and key were not printed.

The exact model identifier and structured-output capability also match [Google's model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite). The application sends JSON Schema configuration following the [official structured-output API](https://ai.google.dev/gemini-api/docs/generate-content/structured-output?hl=en).

Local evidence, ignored by Git:

- `.tmp/final-teacher-live-ledger.json`: request count, safe HTTP/model/finish/usage metadata and environment-preservation result.
- `.tmp/final-teacher-live-results.json`: validated application results used for language review and browser replay.
- `.tmp/verify-ai-teacher-live.mjs`: explicit smoke-test harness with the persisted four-request guard. **Do not reset its ledger or send further live requests under this authorization.**

## Live content review

美丽 generated these three complete sentence sets:

1. 中文：这座城市的夜景非常美丽。

   English: The night view of this city is very beautiful.

   Bahasa Melayu: Pemandangan malam bandar ini sangat cantik.

2. 中文：她在花园里拍下了美丽的鲜花。

   English: She took pictures of the beautiful flowers in the garden.

   Bahasa Melayu: Dia mengambil gambar bunga-bunga yang cantik di dalam kebun.

3. 中文：老师用美丽的话语鼓励了我们。

   English: The teacher encouraged us with beautiful words.

   Bahasa Melayu: Cikgu memberikan kata-kata semangat yang indah kepada kami.

The Chinese sentences demonstrate the headword in different contexts, and all translations preserve their central meaning. The third Chinese sentence is understandable but uses a more literary collocation than everyday learner language. This is a limited spot check, not proof of linguistic accuracy for arbitrary entries.

美丽 relations returned:

| Section | 中文 | English | Bahasa Melayu |
| --- | --- | --- | --- |
| Synonym | 漂亮 | pretty | cantik |
| Synonym | 好看 | good-looking | elok |
| Synonym | 秀丽 | pretty and graceful | indah |
| Antonym | 丑陋 | ugly | buruk |
| Antonym | 难看 | ugly | hodoh |

These are established, defensible relations for the selected sense, without duplicates or overlap. The model chose a modest collection of three synonyms; the application has no three-item restriction and accepts up to 30 per section. This sample does not establish exhaustive coverage. 苹果 correctly returned empty lists instead of fabricated opposites.

The additional idiom request correctly used the whole expression in all three Chinese sentences. However, Malay quality needs review. One actual result was:

> 老师提醒我们做数学题时要细心，检查时不要画蛇添足把正确的答案改错了。
>
> English: The teacher reminded us to be careful when doing math problems and not to ruin the correct answers by making unnecessary changes during checks.
>
> Bahasa Melayu: Cikgu mengingatkan kami supaya berhati-hati semasa menjawab soalan matematik, jangan buat kerja leceh yang mengubah jawapan betul menjadi salah semasa menyemak.

DBP lists a work-related sense of `leceh` as “cerewet lagi remeh” and related meanings involving complexity or delay. It is an established Malay word. My contextual review finds `kerja leceh` less precise for the unnecessary alteration that spoils an otherwise correct result. A more precise phrase for review would be `jangan membuat perubahan yang tidak perlu sehingga jawapan yang betul menjadi salah`. Another generated sentence used the literal explanation `melukis ular berkaki (perbuatan yang sia-sia)`, which is less direct for Malaysian learners than explaining that unnecessary additions can spoil the result. [DBP dictionary reference](https://prpm.dbp.gov.my/Cari1?d=123312&keyword=leceh)

These observations prevent an unconditional PASS for the strict standard-Malay accuracy criterion. Runtime schema validation correctly checks structure, missing translations, matching headwords, bounds and duplicates; it cannot certify idiomatic language or semantic precision. The four-request budget is exhausted. No unverified prompt change, stored-output substitution or extra live retry was used to turn this into a claimed pass.

## Firewall and security verification

The production code calls the official `@vercel/firewall` SDK with ID **`kanjian-ai-teacher`**, the incoming request headers and a 2,000 ms timeout. The installed SDK uses the trusted `x-real-ip` value to derive its API-controlled key. The application does not supply a constant key, does not use the common function/proxy socket as the production visitor identity, and fails closed when trusted-IP information or the rule is missing.

Tests exercised the real installed SDK against mocked firewall HTTP responses. Two visitors sharing a proxy socket each received 20 accepted requests and a rejected 21st request with distinct rate-limit keys. Clearing generation caches before the rejection verified that a cache hit could not hide an accidental Gemini call. Both rejected actions return HTTP **429**, code `rate_limited`, and `Retry-After: 60`. The generated native API was separately tested with two mocked firewall denials and zero provider calls.

The production threshold belongs to the configured firewall rule. The development counter is **20/60 seconds** and runs only outside Vercel/non-production. Per-IP protection means visitors sharing a public IP share a budget. Vercel documents regional counters; cross-region traffic may exceed a single region's threshold. See the [official firewall SDK documentation](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk).

Server-only environment loading, API-key headers, strict model selection, response validation, request/response bounds, timeouts, caches, quota cooldown, CSP and no-secret errors are unchanged. Credential scanning against source/generated assets passed. Shared upstream Gemini quota cooldown and instance concurrency protection are separate from the per-visitor firewall budget.

## Reproducible test evidence

| Check | Final observed result | Evidence |
| --- | --- | --- |
| `npx vitest run --maxWorkers=2 --testTimeout=30000` | **947 passed, 39 files** | `.tmp/final-predeploy-vitest.log` |
| Playwright: teacher, recorded live-response replay, existing app | **31 passed** in one clean final run | `.tmp/final-predeploy-playwright-final.log` |
| Actual native API, mocked Vercel rejection for both actions | **PASS**, 2 firewall checks / 0 Gemini calls | Explicit packaged-entrypoint assertion run |
| `npm run build` | **PASS** | `.tmp/final-predeploy-build.log`; final build log `.tmp/final-predeploy-build-final.log` |
| `npm run typecheck` | **PASS** | TypeScript completed without errors |
| `npm run check:source` | **PASS** | Browser/server boundary, credential names, empty env placeholders, CSP and API service-worker exclusion |
| `npm run test:bundle` | **PASS** | Lazy startup, UI/worker/server boundaries and offline chunk coverage |
| `npm run test:lazy` | **PASS** | `.tmp/final-predeploy-lazy.log` |
| `npm run check:whitespace` | **PASS** | Source/config scan including new tests |

The final browser command sets `KANJIAN_TEACHER_RECORDING=.tmp/final-teacher-live-results.json` and runs:

```text
npx playwright test tests/browser/ai-teacher.spec.ts tests/browser/ai-teacher-recorded-live.spec.ts tests/browser/app.spec.ts --output=.tmp/final-predeploy-browser-results --reporter=list
```

Replay intercepts every teacher request and returns only the previously captured live response; unmatched requests receive an error rather than reaching Gemini. It exercised the real browser clipboard with read/write permissions. Native Windows CRLF line endings are normalized to LF for comparison; all other text must match exactly. The permanent fixture test was also expanded to verify every individual sentence button. Initial replay assertions exposed only the Windows newline difference, which was fixed in the test. A separate initial runner-artifact collision was eliminated by isolating output; the complete final run passed.

Screenshots of real captured responses were inspected on mobile and desktop: `.tmp/final-live-beautiful-sentences-mobile.png`, `.tmp/final-live-idiom-sentences-mobile.png`, and `.tmp/final-live-beautiful-relations-desktop.png`. Responsive/no-overflow and accessibility checks passed. Existing search languages, selected senses, dictionary data, translations, pictures, Openverse attribution, Pixabay sizing, gallery caching/failure behavior, saves, pronunciation and quizzes passed the regression suite. The production offline check passed for fresh-home loading, offline starter features, on-demand dictionary data, saved words and upgrades. Static preview image API requests return expected 404s because Vite preview serves assets rather than functions; dictionary/offline assertions still passed.

The main application JS remains **324.83 KB / 97.14 KB gzip**; the click-loaded AI request client is **2.77 KB / 1.33 KB gzip**. Startup remains free of AI generation. The native teacher bundle is **868,581 bytes**, below its 1 MB packaging ceiling.

## Remaining release actions

1. Review and resolve the flagged Malay idiom wording/quality policy before claiming that all live outputs meet the strict language requirement. A prompt change would require separately authorized live verification; this session's four-request allowance has been consumed.
2. After deployment is separately authorized, test the **actual deployed** `kanjian-ai-teacher` rule: permitted requests, request 21 returning 429 in the same window/region, reset after the configured window, a second real public IP receiving its own allowance, and no Gemini invocation for blocked requests. Do not infer this from local mocks or spoofed forwarding headers. Plan any further live quota use explicitly.
3. Confirm the published rule applies to the intended deployment environment and that the existing server-only key is available there. Missing rule/header/check failures deliberately return unavailable; the configured dashboard state was not remotely verified in this task.

Verification changes are limited to browser tests and this report; temporary recordings/harness/logs remain ignored. Existing application code, prompts, dictionaries, translations, gallery integrations, credential files, environment variables and hosting settings were preserved. Nothing has been committed, pushed or deployed.
