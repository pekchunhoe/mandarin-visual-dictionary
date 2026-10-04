# 看见 Kànjiàn — Pixabay integration completion report

Verified on 4 October 2026 (Asia/Kuala_Lumpur).

## Repository audit and preserved work

The existing application was continued in place, not recreated. This directory has no `.git` metadata, so there is no historical diff, branch, or worktree status to inspect. All current application, provider, configuration, documentation, and test files were reviewed; whitespace verification uses the repository's no-index Git check.

The interrupted integration had already added `server/providers.ts`, `server/image-plan.ts`, expanded `Photo`/`ImageResult` types, and Pixabay URL validation/deduplication helpers. These were preserved and completed. The remaining API and browser still used Pexels-only requests, browser results never expired, and cards used bundled images only. Existing dictionary content, offline photos, sense selection, responsive layout, preview, pronunciation, and search-race protection remain in place.

## Completed implementation

### Provider order and semantic queries

`/api/images` now resolves a known word and approved sense, then tries:

1. Pixabay.
2. Pexels when configured and additional useful results are needed.
3. Bundled curated images.
4. Existing dictionary text and diagram explanations.

Pixabay always receives server-enforced `safesearch=true`. Browser requests cannot supply free-form queries, disable safe search, override provider parameters, or request arbitrary upstream URLs. Queries are normalized, bounded to 100 characters, and derived from reviewed senses:

| Word | Primary query |
| --- | --- |
| 苹果 | `apple fruit` |
| 银行 | `bank financial institution building` |
| 猫 | `domestic cat animal` |
| 跑 | `person running action` |
| 医生 | `doctor medical professional` |

Because/contrast/conditional/function words including 因为、但是、虽然、已经、如果、可能 never reach a stock-image provider. Unreviewed dictionary entries also do not trigger speculative image searches.

### Images, galleries, and attribution

Pixabay results are normalized into the existing `Photo` model: provider-prefixed ID, thumbnail/display/large URLs, dimensions, tags and alt text, contributor/profile, original source page, query context, and expiry. React does not receive raw provider responses.

Pixabay thumbnails use the documented `_340` size; the hero uses the returned web-format display image and the modal uses the larger preview. Galleries target 6–12 images where available, deduplicate IDs and URLs across sizes, reject undersized or malformed pictures, rank tag matches, and exclude known apple-brand and riverbank mismatches. A sparse primary search can use one supporting query, then optional Pexels and bundled pictures, without unlimited retries or pagination. No pictures or contributor credits are fabricated.

The existing hero/gallery, contributor/source links, enlarged preview, keyboard navigation, Escape closing, and focus restoration are preserved. Dictionary text renders while image requests are pending. Obsolete gallery responses cannot overwrite a newer word or meaning.

### Bounded caches and lazy cards

- Live provider search results expire after 24 hours. Successful empty searches also receive a 24-hour server cache; failed searches receive a short 60-second cache.
- Browser cache expiry is bounded by both the server deadline and 24 hours from receipt. Re-reading server results cannot extend the lifetime of their URLs. Mounted live galleries/cards refresh at expiry.
- Server caches hold at most 500 searches and browser caches at most 100 results. Caches are in memory; the service worker excludes API responses and external images.
- Keys distinguish provider or provider chain, word, sense, normalized query, category/visual context, image type, and thumbnail/gallery mode.
- Related-word, browse, and category cards use `IntersectionObserver` with a 100px margin. Offscreen cards do not eagerly request galleries.
- A thumbnail API response contains at most one image. Pixabay is asked for its documented minimum of three candidates; Pexels for one. Thumbnail mode never triggers supporting searches. Cached or pending gallery searches can satisfy thumbnails without another provider request.
- Cards sharing a word/sense deduplicate requests and retain bundled pictures if the service or downloaded image fails. Browsers without `IntersectionObserver` retain their bundled cards.
- API responses use `Cache-Control: no-store`, avoiding an additional HTTP/CDN cache lifetime or stale-while-revalidate window beyond image expiry.

The Pixabay size, minimum-page, cache, and temporary URL behavior was checked against the [official API documentation](https://pixabay.com/api/docs/). These are temporary search-result images, not permanent hotlinks or locally stored live-provider assets.

### Failures and security

Missing keys, empty results, HTTP 400, 401/403, 429, 5xx, network failure, invalid JSON, malformed metadata, and timeouts produce usable fallback results. Provider errors and request URLs are neither returned nor logged. A defensive check also rejects unexpected responses containing the configured secret.

Upstream requests abort after at most 3.5 seconds each, with an overall search budget of eight seconds; browser API calls have a ten-second timeout. Redirects are rejected. HTTP 429 responses establish a provider-wide cooldown honoring reset/retry seconds with a minimum of 60 seconds; client API 429 responses also prevent immediate repeated requests, including manual retry. Authentication failures establish a short cooldown. Dictionary lookup remains independent of all provider failures.

Only GET, known dictionary IDs, existing senses, and the two approved modes are accepted. Extra and duplicate parameters are rejected. Existing per-client API rate limits remain. HTTPS image/source hosts are validated, and the Vercel image CSP now permits the required Pixabay hosts while browser connections remain same-origin.

`PIXABAY_API_KEY` and optional `PEXELS_API_KEY` are server-only. `.env.example` contains empty placeholders for both. `.env.local` and other local secret files remain ignored. README documents local `.env.local` setup and Vercel **Settings → Environment Variables → PIXABAY_API_KEY → Redeploy**.

## Verification performed

All automated provider tests use deterministic fixtures. Browser API responses and live-image fixtures are intercepted; the suite does not depend on real provider accounts.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 112 unit/component/provider/API tests |
| Focused image/provider/client/API tests | PASS — 70 tests across four files |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run test:browser` | PASS — 19 Microsoft Edge tests |
| `npm run test:offline` | PASS — production shell, core words, downloaded full dictionary, eight bundled apple photos, and offline reloads |
| `npm run check:source` | PASS — browser/server separation, built assets, environment placeholders, ignore rules, CSP, service-worker API exclusion |
| Build with dummy Pixabay/Pexels credentials | PASS — neither credential nor server key name appeared in browser assets |
| `npm run check:whitespace` | PASS — equivalent `git diff --no-index --check` across source/config/documentation |
| Lint | Not configured; no lint command exists |
| Desktop/mobile visual review | PASS — generated screenshots reviewed |

Focused coverage includes provider priority; all five required semantic intents; mandatory safe search; all six abstract/function-word exclusions; normalization; deduplication; exact 24-hour expiry; inherited server deadlines; mounted-result expiry; sense separation; missing keys; Pexels and bundled fallbacks; empty responses; all required HTTP errors; cooldowns; network/timeout/malformed responses; secret suppression; API parameter rejection; lazy category/related cards; single-thumbnail behavior; offline fallback; pending request reuse; and obsolete-response protection.

Browser coverage includes eight widths (320–1440px), dictionary search and recovery, IME, independent senses, saved words, quiz feedback, accessibility checks, 12-image gallery layouts, failed image requests, lazy thumbnail requests, Pixabay hero/thumbnail/preview sizing, source attribution, and preview keyboard/focus behavior.

The Browser skill was attempted for in-app review, but its connection timed out during initialization. The project's headless Edge suite and screenshot script provided browser verification instead. Screenshots are in `.tmp/`.

## Live verification

**Live Pixabay verification: NOT RUN — PIXABAY_API_KEY not configured**

Live Pexels verification: NOT RUN — PEXELS_API_KEY not configured.

No real keys were requested, written, or used. Dummy build-test values were confined to the build process. Missing local keys are not an implementation failure; authenticated availability and real-result relevance remain unverified.

## Files completed or changed

- `server/images.ts`: provider orchestration, expiring searches, deduplication, timeouts, cooldowns, and fallback composition.
- `server/providers.ts`: completed interrupted adapters, thumbnail request sizing, normalization and attribution.
- `server/image-plan.ts`, `src/types.ts`: inspected and retained the interrupted query planning and expanded models.
- `api/images.ts`: server credentials, validated modes, duplicate-parameter rejection, generic errors, and cache headers.
- `src/lib/visual.ts`, `src/lib/images.ts`, `src/lib/useImages.ts`: URL deduplication, cache identity/expiry, shared requests, offline behavior, and obsolete-response protection.
- `src/components/WordThumbnail.tsx`, `WordCard.tsx`, `Photo.tsx`, `VisualGallery.tsx`, `src/pages/Home.tsx`, `src/styles.css`: lazy cards, bundled failure fallback, source credit, correct image sizes, and preserved layouts.
- `vite.config.ts`, `vercel.json`, `.env.example`: local server-only configuration and image CSP.
- `tests/pixabay.test.ts`, `tests/image-client.test.tsx`, `tests/images.test.ts`, `tests/api.test.ts`, `tests/setup.ts`, `tests/browser/app.spec.ts`: focused and browser regression coverage.
- `scripts/check-source.mjs`, `package.json`: reproducible source and built-asset security checks.
- `README.md`, `IMPLEMENTATION_REPORT.md`: setup, architecture, behavior, verification, and limitations.
- `dist/`, `tsconfig.tsbuildinfo`, `.tmp/`, and test artifacts: regenerated during verification; already covered by ignore rules.

## Remaining limitations

- No authenticated live Pixabay/Pexels call was possible. Results and availability must be checked after configuring the deployment keys.
- Safe search, reviewed queries, and metadata filtering do not guarantee that every live result is appropriate or semantically correct. Optional Pexels fallback has no documented safe-search switch. Classroom deployments requiring approval of every picture need an editorial review process.
- Six to twelve images are a target, not a promise. Sparse meanings may show fewer results; most bundled words have one photo, while apple has eight. ID/URL matching cannot identify every visually similar crop.
- Server cache, deduplication, and rate/cooldown state are instance-local and reset on cold starts. A larger multi-instance deployment needs shared storage/rate controls for global coordination and durable provider caching.
- Live external photos are intentionally unavailable offline; curated photos and previously downloaded dictionary data remain available. Permanent Pixabay image reuse requires a separate download/hosting workflow under its terms.
- Existing dictionary enrichment and Mandarin speech limitations remain: Malay/examples/diagrams cover curated subsets, and speech depends on installed voices.

No Git initialization, commit, push, or deployment was performed.
