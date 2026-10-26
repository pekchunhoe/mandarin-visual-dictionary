# KANJIAN iPad portrait responsive fix

26 October 2026. Status: **PASS** for the responsive layout repair and completed local validation.

## Root cause

The header used a horizontal flex layout with an unconstrained, content-sized identity column, 240–270px identity minimums, gaps, a separate Save button and padded meanings. The right-hand panel could shrink almost to zero. Its `overflow-wrap:anywhere` then split ordinary English and Malay words. Breakpoints at 800px and 600px did not protect the wider portrait range.

For **新官上任三把火 at 820 × 1180**, the defect was reproduced locally: English text was only **41.67px wide**, its paragraph was **756px tall**, and the header grew to **2214.25px**. The page had no horizontal overflow, demonstrating why a page-overflow check alone was insufficient.

## Fix

- Consolidated the scattered header layout rules into one CSS section. Wide layouts use `fit-content(45%) minmax(0,1fr) auto`, with fluid 24–50px gaps. The headword has a bounded column and the meanings retain readable space.
- At **1100px and below**, use one full-width column. This threshold follows the space needed for two text columns, padding, gaps and Save. No device detection is used.
- In the stack, show the headword, pinyin/Listen, Traditional text, optional sense selector, English/Malay meanings, then the existing AI Teacher tools and remaining content. The sense selector remains full-width below the main columns on desktop.
- Use fluid 44–69px headword typography, normal Chinese breaking with strict punctuation handling, and wrapping pinyin/Listen controls. All headword characters remain present.
- English/Malay definitions and sense labels use normal word breaking. `overflow-wrap:break-word` is a fallback for genuinely unbreakable content. Nothing is truncated or hidden to conceal overflow.
- Reserve space above the stacked identity for Save, resetting its grid placement so it cannot overlap the heading. Preserve the existing green/cream palette; darken responsive pinyin and saved-hover text enough to pass contrast checks at their smaller sizes.

At 820px after the fix, English occupies **760px**, its paragraph is **29.69px tall**, and the entire header is **593.86px**. The complete reported headword, pinyin and Traditional text remain visible.

## Files changed

| File | Purpose |
| --- | --- |
| `src/pages/WordDetail.tsx` | Name the identity container and place the unchanged sense selector inside the header grid. |
| `src/styles.css` | Consolidated, bounded desktop columns; full-width portrait stack; typography, wrapping and control placement. |
| `tests/browser/ipad-responsive.spec.ts` | 18 new responsive/interaction cases using real corpus data and measured geometry. |
| `KANJIAN_IPAD_PORTRAIT_RESPONSIVE_FIX_REPORT.md` | This report. |
| `docs/screenshots/ipad-responsive/before-820.png` | Reproduced original defect. |
| `docs/screenshots/ipad-responsive/after-820.png` | Repaired reported entry on iPad portrait. |
| `docs/screenshots/ipad-responsive/after-375.png` | Repaired reported entry on small mobile. |
| `docs/screenshots/ipad-responsive/after-1440.png` | Reported entry on desktop. |
| `docs/screenshots/ipad-responsive/short-word-desktop.png` | Preserved short-word desktop presentation. |
| `docs/screenshots/ipad-responsive/long-malay-820.png` | Complete long Malay definition. |
| `docs/screenshots/ipad-responsive/longest-headword-820.png` | Longest corpus headword and wrapping pinyin. |

Screenshots are outside `public` and do not enter frontend assets.

## Viewport matrix

Each viewport tested **15 real entries in both Edge and WebKit**, totaling **480 entry/viewport/engine layouts**. Definition widths below are measured for the reported entry in Edge; WebKit passed the same dimensional assertions.

| Scenario | Viewport | English width | Edge | WebKit |
| --- | --- | ---: | --- | --- |
| Small mobile | 375 × 667 | 335px | PASS | PASS |
| Large mobile | 430 × 932 | 390px | PASS | PASS |
| iPad portrait | 768 × 1024 | 718px | PASS | PASS |
| iPad portrait | 820 × 1180 | 760px | PASS | PASS |
| Large iPad portrait | 1024 × 1366 | 964px | PASS | PASS |
| iPad landscape | 1180 × 820 | 385.58px | PASS | PASS |
| Desktop | 1440 × 900 | 385.30px | PASS | PASS |
| Wide desktop | 1920 × 1080 | 371.67px | PASS | PASS |
| Intermediate/breakpoints | 600, 601, 799, 800, 801, 1099, 1100, 1101px | Readable | PASS | PASS |

Corpus cases include 新官上任三把火, 苹果, 学习, 不耻下问, 近朱者赤，近墨者黑, 火; the four longest headwords (including 中央人民政府驻香港特别行政区联络办公室 and punctuation-bearing sayings); the longest English definitions, 十三经 and 海选; and long Malay meanings for 刻舟求剑, 心猿意马 and 滥竽充数. Test selection derives these extreme cases from the actual local corpus/translation files, without rewriting them.

Checks cover page overflow, comfortable/full-width definitions, unbroken ordinary Latin words using text ranges, visible Chinese character bounds and real line wrapping, pinyin/Listen separation, Save separation, content-based header height, usable AI/Copy Prompt controls, gallery widths, selected-sense preservation through orientation changes, language switches, saving and accessibility. Gallery and AI responses are mocked; no live provider requests are needed.

## Evidence and regression results

- **Edge:** all 16 geometry cases and orientation/AI/copy case passed. Axe initially caught the contrast of smaller pinyin; the focused accessibility case passed after correction. Logs: `.tmp/ipad-edge-final.log`, `.tmp/ipad-accessibility.log`.
- **WebKit:** all **18 cases passed**, with iPad touch/mobile viewport emulation. Log: `.tmp/ipad-webkit-final.log`.
- **Existing browser suite:** all **39 scenarios passed**, including search, translations, saved words, quizzes, gallery attribution/sizing, native clipboard copying, API-error fallbacks and existing AI Teacher behavior. Log: `.tmp/ipad-existing-browser.log`.
- **Full regression:** `npx vitest run --maxWorkers=1 --testTimeout=30000` — **1,018 tests / 43 files passed**. Log: `.tmp/ipad-full-tests.log`. The 28 focused existing UI tests also passed during implementation.
- **TypeScript/build/security:** `npm run typecheck`, `npm run build`, `npm run check:source`, `npm run check:whitespace`, `npm run test:bundle` and `git diff --check` passed. Build included native server packaging, private-file/credential checks and both mocked teacher actions. Build log: `.tmp/ipad-build.log`.
- **Production layout:** the built preview passed the exact reported entry at 375, 820, 1024 and 1180px; English widths were 335, 760, 964 and 385.58px respectively. Both generation and Copy Prompt controls remained present. Log: `.tmp/ipad-production-layout.log`.
- **Production offline/lazy checks:** `npm run test:offline` and `npm run test:lazy` passed, including saved data/cache upgrades, offline photos, dictionary/worker loading and image-API cache bypass. Logs: `.tmp/ipad-offline.log`, `.tmp/ipad-lazy.log`. Static preview emitted image-resource 404 messages; all assertions passed.
- Detailed measurements: `.tmp/ipad-responsive/metrics-{edge,webkit-ipad}-{width}.json`. Screenshots were visually reviewed for portrait, mobile, desktop, short words, the longest headword and long Malay text.

## Before/after and representative screenshots

[Before: 820px](docs/screenshots/ipad-responsive/before-820.png) · [After: 820px](docs/screenshots/ipad-responsive/after-820.png) · [Mobile](docs/screenshots/ipad-responsive/after-375.png) · [Desktop](docs/screenshots/ipad-responsive/after-1440.png)

[Short-word desktop](docs/screenshots/ipad-responsive/short-word-desktop.png) · [Long Malay](docs/screenshots/ipad-responsive/long-malay-820.png) · [Longest headword](docs/screenshots/ipad-responsive/longest-headword-820.png)

## Preservation and limitations

Twenty protected files matched pre-change hashes after the build: environment/API configuration, credentials file, server instructions, model/schema/client, rate limiter, gallery component, copy-prompt components/builders, clipboard helper and dependency manifests. Dictionary and translation directories have no diff. Gemini generation behavior, both Copy Prompt buttons, API security, Pixabay/Openverse integration and the 20-per-60-second rate-limit architecture are unchanged. Initial JavaScript remains **324,831 bytes**; detail features remain lazy-loaded.

The exact reported entry has **no stored Malay translation** in the existing dataset. Its readable missing-translation message and existing translation link are preserved; no translation was invented or added. Existing long Malay definitions on other real entries were tested in full.

These are automated Edge and Windows WebKit layout tests, including iPad user-agent/touch/viewport emulation, **not a physical iPad or native iPad Safari test**. Real iOS fonts and browser chrome can differ; physical-device confirmation remains useful. The implementation uses the existing viewport meta tag and standard CSS layout, without Safari/device-specific branches.

No live Gemini requests, dependencies added, API keys exposed, commits, pushes or deployments were made.
