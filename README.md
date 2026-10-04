# 看见 Kànjiàn · Visual Mandarin Dictionary

A working React + Vite + TypeScript dictionary built around photographs, Mandarin pronunciation, and connections between Chinese, English, and Bahasa Melayu. Responsive layouts work from 320 px phones to desktop screens.

## Run locally

Requires Node.js 22.12+ (verified with Node 24).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local`. Open **http://127.0.0.1:5173**. Vite includes the same image API handler used on Vercel, so the application works locally without a second server.

No key is needed for dictionary search or the curated pictures. To enable live image search, add the following to `.env.local` and restart the development server:

```env
PIXABAY_API_KEY=your_actual_key_here
```

Optionally set `PEXELS_API_KEY` for fallback searches. Pixabay is tried first, then configured Pexels, bundled curated photos, and finally the existing text/diagram explanation. This key is server-only; never name it with a `VITE_` prefix or place it in React code.

## What works

- Simplified/traditional Chinese, marked/unmarked/numeric pinyin, English, and selected Malay vocabulary; recent searches, keyboard suggestions, IME-safe input, clear, and back navigation.
- The genuine **125,173-entry CC-CEDICT export** is bundled as a static indexed dictionary. Its 10.9 MB uncompressed JSON is downloaded only when a search needs the full dataset, then parsed and indexed once in a Web Worker. The starter collection is immediately available in the app bundle.
- Ten visual categories, word of the day, picture vocabulary, saved words on this device, sense selection, contextual learning, and picture quizzes.
- Mandarin-only speech using an installed Chinese voice; replay, stop, and cancellation between buttons. If no Mandarin voice is installed, the app explains how to add one instead of using an English voice.
- Editorial Malay meanings, simple Chinese explanations, and multilingual examples for selected vocabulary. Missing enhancements are explicitly marked rather than invented at runtime.
- A varied **eight-photo apple gallery** and 19 other starter cover photos are bundled for use without a key. The sources are real Pexels photographs, visually checked during implementation. No mock API responses are used in production.
- Configured Pixabay searches target 6–12 unique pictures per approved sense, with attribution, a hero image, previews, loading and failure states. Server and browser caches expire live results within 24 hours. Actual availability varies by meaning/provider.
- Related-word, browse, and category cards lazily request one thumbnail near the viewport, reuse cached or pending requests, and retain bundled pictures when unavailable.
- Abstract connectors get relationship diagrams. Unreviewed meanings show their dictionary definition and pronunciation without a speculative photo query.
- A production service worker precaches the app, worker, local fonts, and starter photos. The full dictionary becomes available offline after its first successful download while the service worker controls the page.

## Sources and licensing

Dictionary: [CC-CEDICT, distributed by MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict), downloaded 3 October 2026. [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) applies to the dictionary, the compact conversion, and the editorial learning-data additions. Preserve attribution and share adapted data under that license. The original export is retained in `cedict.txt.gz`; original metadata and credits are in `public/data/NOTICE.txt`. The original full definitions are retained in `public/data/cedict.json`; the UI removes classifier-only annotations from concise meanings.

Live Pixabay pictures: [Pixabay API documentation](https://pixabay.com/api/docs/) and [Content License](https://pixabay.com/service/license-summary/). Results retain contributor and source attribution. Temporary search-result URLs expire within 24 hours; they are never stored permanently or precached by the service worker. Permanent reuse requires downloading and hosting images under the applicable terms.

Bundled and fallback pictures: [Pexels license](https://www.pexels.com/license/). `src/data/photos.ts` maps each cover to its original photo ID; `src/data/apple-gallery.json` records the additional source IDs and verified photographer names. Missing photographer metadata is not fabricated. Every bundled gallery picture links to its original Pexels page; the application includes the required Pexels provider link. Live API results retain photographer names, profile links, and source links. Follow the [Pexels API guidelines](https://www.pexels.com/api/documentation/) when extending or deploying the integration.

Font: locally bundled DM Sans via `@fontsource-variable/dm-sans` (SIL Open Font License in that package). CJK text uses the device's installed Chinese fonts. No Google Fonts requests are made.

## Architecture

```text
src/App.tsx                      Hash routes, search lifecycle, saved words
src/components/                  Search, speech, pictures, preview, quiz, error boundary
src/pages/                       Home and word detail
src/data/learning.ts              Reviewed word/sense enhancements and categories
src/data/cedict-core.json         Genuine CC-CEDICT starter subset
src/lib/dictionary.ts             Pinyin normalization and in-memory index
src/lib/dictionary.worker.ts      Full dictionary loading and indexing off the UI thread
src/lib/search.ts                 Shared worker, caching, obsolete-search cancellation
src/lib/images.ts                 Shared thumbnail/gallery requests and expiring sense-aware cache
server/images.ts                 Provider ordering, request deduplication, bounded caches
server/providers.ts              Pixabay/Pexels adapters and response normalization
server/image-plan.ts             Approved semantic queries and provider cache keys
api/images.ts                    Vercel HTTP handler and input/rate controls
public/data/cedict.json           Full dictionary; never parsed on each search
public/photos/                   Reviewed local Pexels images
public/sw.js                     Production offline cache template
vite.config.ts                   Local API and build-specific precache generation
```

Hash routing keeps links reloadable on static hosts without catch-all routing that could swallow `/api/images`. The core dictionary runs locally, so a separate `/api/dictionary` round trip is unnecessary. AI is not used to generate factual definitions or request translations. No Gemini dependency or key is needed.

Cache keys include provider (or the browser provider chain), word, sense, normalized query, visual/category type, image type and request mode. Stable identifiers keep unrelated meanings apart. Uncurated entries retain their dictionary definitions and pronunciation; no automatic stock-photo interpretation is applied to them. Query construction is deterministic and reviewed in the learning data (`bank financial institution building`, `person running action`, etc.).

Obsolete dictionary requests detach their listeners and never update the current search. Image calls are deduplicated; shared in-flight requests finish into the cache, while unmounted galleries ignore their results. This avoids cancelling a request that another component still needs. Explicit retry bypasses the browser result cache while respecting provider and HTTP 429 cooldowns. Live expiry is inherited from the server, so reading an old server result never starts a new 24-hour lifetime. Mounted galleries/cards refresh at expiry. Server entries are capped at 500 and browser entries at 100; failures use a short 60-second cache. API responses use `Cache-Control: no-store` to prevent HTTP/edge caches from extending signed URL lifetime.

## Image API and safeguards

```http
GET /api/images?word=苹果&sense=sense-0&mode=gallery
GET /api/images?word=苹果&sense=sense-0&mode=thumbnail
```

- Only GET, known learning words, existing sense IDs, and `gallery`/`thumbnail` modes are accepted. Duplicate parameters are rejected. Arbitrary `q`, proxy URLs, extra parameters, and oversized inputs are rejected.
- The server builds the provider query from the selected sense. User input never becomes a free-form provider search.
- `PIXABAY_API_KEY` stays in the server-to-Pixabay request; the optional Pexels key stays in its server Authorization header. Neither is exposed through Vite, API responses, errors, logs, or React. Upstream requests abort after at most 3.5 seconds each, within an 8-second overall search budget. Redirects are rejected. Provider failures leave dictionary data and available local photos usable.
- Pixabay always receives `safesearch=true`, English, approved category/image-type values, and a reviewed semantic query. The client cannot override these. Abstract/function words skip providers.
- Galleries request 32 candidate Pixabay hits and at most one supporting query if fewer than six survive filtering. Cards request the documented minimum of three candidates, return just one thumbnail, and never trigger a supporting/gallery search. Pexels requests 24 gallery candidates or one thumbnail candidate.
- Provider image URLs are restricted to approved Pixabay/Pexels HTTPS hosts; duplicates, undersized pictures, and malformed responses are filtered. React renders all text without raw HTML.
- Bounded in-memory per-client limits permit 30 calls/minute per server instance. Vercel's trusted client-IP header is preferred. For a large multi-instance deployment, add Vercel Firewall limits or a shared rate-limit store; process-local limits are not globally coordinated.
- Pexels does **not document a safe-search switch**. Approved educational queries restrict the search surface, but automated provider results are not a guarantee of child-suitable content. An unmoderated Wikimedia fallback is deliberately not enabled. Deployments needing editorial approval of every photo should use an approved-photo catalogue.
- Security headers restrict scripts, connections, and fonts to this origin and allow images only from this origin or the approved Pixabay/Pexels hosts. API responses are not edge-cached.

## Checks

```sh
npm test                 # Focused dictionary, UI, speech, provider and API tests
npm run typecheck
npm run build
npm run test:browser     # Real browser interaction, eight screen widths, axe accessibility
npm run check:source     # Browser/server boundary, environment, CSP and built asset checks
npm run check:whitespace # git diff --no-index --check for this initially non-Git workspace
```

Browser tests use installed Microsoft Edge on Windows; elsewhere run `npx playwright install chromium` first. `PLAYWRIGHT_CHANNEL` can explicitly select an installed browser. External image API responses are mocked in automated tests; tests do not depend on live Pixabay or Pexels accounts. No lint script is configured; TypeScript and source/whitespace checks cover the configured static checks.

To test production offline support:

```sh
npm run build
npm run preview          # Leave running on port 4173
npm run test:offline     # In a second terminal; Edge by default
```

Offline caching is enabled only in a production build. First load requires connectivity; broad dictionary searches require one successful full-data download. Browsers can evict cached data. Device-local saved words are not synced across devices.

## Updating data and photos

Download the latest public `.txt.gz` CC-CEDICT export from MDBG to `cedict.txt.gz`, then run `npm run data:import`. The importer handles CRLF, preserves the full dictionary fields, and selects starter words from the learning catalogue. It never runs during a user search or downloads data during a normal build. Review editorial sense mappings and run tests after an upstream update because meanings can change.

The photo maintenance scripts `scripts/download-photos.mjs` and `scripts/download-gallery.mjs` fetch known original Pexels IDs; `node scripts/photo-metadata.mjs` regenerates actual image dimensions. Visually review replacements for relevance. Use suitably sized files; do not bundle original multi-megapixel images.

## Deploy to Vercel

1. Import this project into Vercel (or run the Vercel CLI from this directory).
2. Use the Vite framework preset, `npm run build`, and `dist` output. `vercel.json` already records these settings and security headers. Vercel discovers `api/images.ts` automatically.
3. Open **Settings → Environment Variables → PIXABAY_API_KEY**, enter your key for the intended deployment environments, then **Redeploy**. Optionally also set **PEXELS_API_KEY** for fallback. Never use a `VITE_` prefix.
4. After redeploying, check the photo endpoint with a known word/sense, pronunciation on a device with a Mandarin voice, and an offline reload after the service worker installs.

No commit, push, or deployment is performed by the implementation task. The API implementation is mock-tested; live authenticated Pixabay/Pexels operation has not been verified here because no keys were configured.

## Initial audit and deliberate limits

The supplied directory was empty and had no `.git`, framework, routing, API, styling, Gemini integration, Vercel setup, PWA, tests, reusable components, or environment patterns to preserve. React/Vite and Vercel functions follow the requested defaults. See `IMPLEMENTATION_REPORT.md` for verification results.

Malay coverage, examples, approved image queries, and relationship diagrams are curated subsets, not claims of full 125,173-entry educational enrichment. Most starter covers have one offline photo; apple has eight. Live galleries provide up to 12 where the provider has relevant results. ID/URL deduplication does not detect every visually similar crop, and images should be reviewed for high-assurance classroom deployment. Pronunciation quality and availability depend on installed device voices. No accounts, handwriting, stroke animation, AI enhancement, or spaced repetition are included.
