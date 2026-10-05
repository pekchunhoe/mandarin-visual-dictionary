# 看见 Kànjiàn · Visual Mandarin Dictionary

A working React + Vite + TypeScript dictionary built around photographs, Mandarin pronunciation, and connections between Chinese, English, and Bahasa Melayu. Responsive layouts work from 320 px phones to desktop screens.

## Run locally

Requires Node.js 24 (also pinned for Vercel in `package.json`).

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

Pixabay is tried first, then Openverse when more suitable results are needed, then optional configured Pexels, bundled curated photos, and the existing text/diagram explanation. Openverse works anonymously; set `OPENVERSE_CLIENT_ID` and `OPENVERSE_CLIENT_SECRET` for OAuth client-credentials access. Optionally retain `PEXELS_API_KEY` for the final provider fallback. All credentials stay server-side; never use a `VITE_` prefix or place credentials in React code.

Openverse tokens are cached in server memory, shared across concurrent searches and reacquired shortly before expiry. Token failures temporarily use anonymous search; rejected bearer tokens receive one anonymous retry. See [OPENVERSE_INTEGRATION_REPORT.md](OPENVERSE_INTEGRATION_REPORT.md) for exact fallback conditions, tests and remaining limitations. The implementation follows the [Openverse API reference](https://api.openverse.org/v1/).

## What works

- Simplified/traditional Chinese, marked/unmarked/numeric pinyin, English, and selected Malay vocabulary; recent searches, keyboard suggestions, IME-safe input, clear, and back navigation.
- The genuine **125,173-entry CC-CEDICT export** is bundled as a static indexed dictionary. Its 10.9 MB uncompressed JSON is downloaded only when a search needs the full dataset, then parsed and indexed once in a Web Worker. The starter collection is immediately available in the app bundle.
- Ten visual categories, word of the day, picture vocabulary, saved words on this device, sense selection, contextual learning, and picture quizzes.
- Mandarin-only speech using an installed Chinese voice; replay, stop, and cancellation between buttons. If no Mandarin voice is installed, the app explains how to add one instead of using an English voice.
- Editorial Malay meanings, simple Chinese explanations, and multilingual examples for selected vocabulary. Missing enhancements are explicitly marked rather than invented at runtime.
- A varied **eight-photo apple gallery** and 19 other starter cover photos are bundled for use without a key. The sources are real Pexels photographs, visually checked during implementation. No mock API responses are used in production.
- Configured Pixabay searches target 6–12 unique pictures per visual dictionary sense, with attribution, a hero image, previews, loading and failure states. Server and browser caches expire live results within 24 hours. Actual availability varies by meaning/provider.
- Related-word, browse, and category cards lazily request one thumbnail near the viewport, reuse cached or pending requests, and retain bundled pictures when unavailable.
- Visually understandable dictionary senses use deterministic English semantic inference, including concrete nouns, actions, emotions, human states and visible adjectives. Curated metadata overrides the inferred intent where available. Abstract connectors get relationship diagrams, while unresolved meanings retain their definition and pronunciation without a stock-image search.
- A production service worker precaches the app, worker, local fonts, and starter photos. The full dictionary becomes available offline after its first successful download while the service worker controls the page.

## Sources and licensing

Dictionary: [CC-CEDICT, distributed by MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict), downloaded 3 October 2026. [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) applies to the dictionary, the compact conversion, and the editorial learning-data additions. Preserve attribution and share adapted data under that license. The original export is retained in `cedict.txt.gz`; original metadata and credits are in `public/data/NOTICE.txt`. The original full definitions are retained in `public/data/cedict.json`; the UI removes classifier-only annotations from concise meanings.

Live Pixabay pictures: [Pixabay API documentation](https://pixabay.com/api/docs/) and [Content License](https://pixabay.com/service/license-summary/). Results retain contributor and source attribution. Temporary search-result URLs expire within 24 hours; they are never stored permanently or precached by the service worker. Permanent reuse requires downloading and hosting images under the applicable terms.

Bundled and fallback pictures: [Pexels license](https://www.pexels.com/license/). `src/data/photos.ts` maps each cover to its original photo ID; `src/data/apple-gallery.json` records the additional source IDs and verified photographer names. Missing photographer metadata is not fabricated. Every bundled gallery picture links to its original Pexels page; the application includes the required Pexels provider link. Live API results retain photographer names, profile links, and source links. Follow the [Pexels API guidelines](https://www.pexels.com/api/documentation/) when extending or deploying the integration.

Font: locally bundled DM Sans via `@fontsource-variable/dm-sans` (SIL Open Font License in that package). CJK text uses the device's installed Chinese fonts. No Google Fonts requests are made.

English semantic classification: a compact, deterministic derivative of Princeton WordNet 3.1, with provenance in `src/data/visual-lexicon-source.json` and license in `public/data/WORDNET-LICENSE.txt`. Its complete noun categories, verb lemmas and 669 emotion/state/adjective expressions remain embedded in the server function. The browser worker fetches one content-hashed JSON asset on demand; the main UI never imports or parses it. Python, the original archive, and external WordNet downloads are unnecessary at runtime. `src/data/visual-templates.json` provides English visual contexts, expanded through explicitly selected WordNet synsets and adjective satellites. No Mandarin word membership is involved. Invalid lexicon structure preserves curated overrides and the English template anchors; unresolved meanings degrade conservatively.

## Architecture

```text
src/App.tsx                      Hash routes, search lifecycle, saved words
src/components/                  Search, speech, pictures, preview, quiz, error boundary
src/pages/                       Home and word detail
src/data/learning-source.ts       Build-time editorial source and canonical starter selection
src/data/learning-runtime.json    Generated, already classified starter words
src/data/learning.ts              Lightweight UI access to generated starters
src/data/cedict-core.json         Genuine CC-CEDICT starter subset
src/lib/dictionary.ts             Pinyin normalization and in-memory index
src/lib/dictionary.worker.ts      Full dictionary loading and indexing off the UI thread
src/lib/search.ts                 Core search and result cache
src/lib/dictionary-client.ts      Shared worker messages and obsolete-request cancellation
src/lib/images.ts                 Shared thumbnail/gallery requests and expiring sense-aware cache
server/images.ts                 Provider ordering, request deduplication, bounded caches
server/providers.ts              Pixabay/Openverse/Pexels adapters and normalization
server/openverse-auth.ts         Server-only OAuth token acquisition and reuse
server/image-plan.ts             Selected-sense semantic queries and provider cache keys
server/visual-search.ts          Visual query candidates and selected-meaning metadata ranking
server/dictionary.ts             Lazy, canonical full-dictionary resolution
server/image-handler.ts          Shared HTTP handler and input/rate controls
server/image-service.mjs         Generated native Node bundle, including WordNet data
api/images.js                    Vercel entrypoint with guarded service initialization
src/lib/visual-inference-core.ts  Unchanged classifier factory, used by worker and server
src/lib/visual-inference.ts       Server/build entry with embedded semantic data
public/data/cedict.json           Full dictionary; never parsed on each search
public/photos/                   Reviewed local Pexels images
public/sw.js                     Production offline cache template
vite.config.ts                   Local API and build-specific precache generation
```

Hash routing keeps links reloadable on static hosts without catch-all routing that could swallow `/api/images`. The core dictionary runs locally, so a separate `/api/dictionary` round trip is unnecessary. AI is not used to generate factual definitions or request translations. No Gemini dependency or key is needed.

Cache keys include the visual schema and picture-relevance versions, provider (or the browser provider chain), word, sense, normalized query, visual/category type, image type and request mode. Stable identifiers keep unrelated meanings apart. Full-dictionary entries use canonical simplified/traditional/pinyin row IDs and canonical sense IDs. `buildVisualQuery` retains the existing dictionary classifications and conceptual coverage. Before provider search, the server's `visualSearchPlan` normalizes recognized English wrappers and preserves the selected visual predicate: `to be frightened` first searches `frightened person`, followed only as needed by `scared person` and `frightened face`. Existing WordNet descriptor families supply related expressions; a conservative agent rule turns `a person who teaches` into `teacher`. Domain annotations and function-word exclusions remain authoritative. No Mandarin vocabulary list was added.

Provider pages retain their candidates until the combined results are reranked against the selected meaning. Exact subject/predicate matches outrank related lexical matches, which outrank category-only metadata; query priority and limited diversity break ties. Pixabay tags and actual Pexels descriptions provide evidence, never generated alt text or invented image recognition. Generic or wrong-emotion portraits are excluded from emotion galleries. Directly visual galleries keep supported subject matches rather than padding to twelve; missing metadata can provide at most two uncertain results only when no supported match exists. Relevant photos, illustrations, and vectors remain eligible. See `PICTURE_RELEVANCE_REPORT.md` for query examples, request limits, and verification.

The current `dictionary-visual-v5` schema invalidates older image/classification cache keys. Saved dictionary entries are reclassified by the worker before they appear in My words or a saved detail page, so old non-visual decisions cannot persist. Loading and retry states cover this asynchronous step. Only explicit curated overrides are retained; legacy derived queries without an origin are recomputed. No browser image results are persisted in local storage. The service worker cache includes the visual schema and content hash, precaches the new inference code, removes obsolete app caches and excludes `/api/` responses from caching.

Conceptual vocabulary follows the same selected-English-sense pipeline as concrete words. The WordNet export retains 18 abstract noun classes as `concept:*` categories, alongside physical nouns, verbs and descriptors. `src/data/concept-templates.json` supplies shared English domain queries (for example, politics → government parliament politics); it contains no Mandarin membership list. Domain annotations qualify a meaning rather than vetoing it. Grammar, particles and connectors still skip image search. Unmatched ordinary lexical meanings use their own phrase plus `concept`, with the plain phrase as a single fallback, even when optional WordNet data is unavailable. Nonliteral domain descriptors retain their domain instead of using a literal human-expression template. Existing unsafe-meaning and proper-name checks remain.

Idiom and phrase eligibility uses the same shared classifier in the dictionary worker and server. Dictionary labels are normalized only for semantic analysis: displayed definitions and sense IDs remain intact. Recognized emotional constructions, gerunds, action particles, and a small set of shared English expression templates yield a semantic predicate before provider search. For example, `fig. to be frightened stiff` yields `frightened`, then `frightened person` with bounded fear-expression alternatives. The predicate also supplies the existing metadata reranker, so literal words such as `stiff` or generic `person` do not outweigh fear evidence. Explicit literal senses keep their own interpretation; unresolved figurative/idiomatic meanings and grammar retain the explanation fallback. Dynamic picture eligibility does not require editorial examples or a reviewed visual explanation. See `IDIOM_VISUAL_REPORT.md` for the runtime audit and regression evidence.

Concept searches use Pixabay `image_type=all` from the first request, allowing photos, illustrations and vectors with `safesearch=true` and `lang=en`. After the existing simpler Pixabay query, Openverse can reuse the same English semantic alternatives before the optional Pexels fallback. Openverse searches exclude mature content and accept CC BY, CC BY-SA, CC0 and Public Domain Mark results with license/source links. Actual titles and tags enter the unchanged semantic reranker. Captions retain creator, title, source and license links; thumbnail credits include the license. No upstream attribution HTML is rendered. Sufficient primary results, caching and thumbnail reuse avoid extra calls. Images are illustrative search results, not reviewed definitions; availability and relevance vary.

Obsolete dictionary requests detach their listeners and never update the current search. Image calls are deduplicated; shared in-flight requests finish into the cache, while unmounted galleries ignore their results. This avoids cancelling a request that another component still needs. Explicit retry bypasses the browser result cache while respecting provider and HTTP 429 cooldowns. Live expiry is inherited from the server, so reading an old server result never starts a new 24-hour lifetime. Mounted galleries/cards refresh at expiry. Server entries are capped at 500 and browser entries at 100; failures use a short 60-second cache. API responses use `Cache-Control: no-store` to prevent HTTP/edge caches from extending signed URL lifetime.

## Image API and safeguards

```http
GET /api/images?word=苹果&sense=sense-0&mode=gallery
GET /api/images?word=苹果&sense=sense-0&mode=thumbnail
```

- Only GET, known canonical dictionary entries (or starter-word aliases), existing sense IDs, and `gallery`/`thumbnail` modes are accepted. Duplicate parameters are rejected. Arbitrary `q`, proxy URLs, extra parameters, and oversized inputs are rejected.
- The server builds the provider query from the selected sense. User input never becomes a free-form provider search.
- `PIXABAY_API_KEY` stays in the server-to-Pixabay request; the optional Pexels key and Openverse bearer token stay in server Authorization headers. Openverse client credentials are sent only in the server OAuth form POST. None are exposed through Vite, API responses, errors, logs, or React. Upstream searches abort after at most 3.5 seconds each, within an 8-second overall budget, with the last 3 seconds reserved after Pixabay for fallback. OAuth has a 1-second timeout. Redirects are rejected. Provider failures leave dictionary data and available local photos usable.
- Pixabay always receives `safesearch=true`, English, approved category/image-type values, and a server-derived semantic query. The client cannot override these. Abstract/function words skip providers.
- Galleries request 32 candidates from Pixabay or Openverse. Searches stop at six semantically supported gallery results (one for thumbnails), on provider failure, or at the deadline. Conceptual searches retain their existing domain path and stopping rule. Pixabay retains up to three semantic gallery queries or two thumbnail queries. Openverse uses distinct English queries within the remaining four-search Pixabay/Openverse budget, up to three gallery queries or two thumbnail queries. Identical Openverse queries differing only in Pixabay type/category are not repeated. Pexels retains its final configured fallback (including its existing idiom retries when Pixabay is unconfigured). Cached and pending searches are reused; image diversity never triggers another request by itself.
- Pixabay/Pexels image URLs remain restricted to their approved HTTPS hosts. Normalized Openverse images may use public HTTPS domain hosts because Openverse aggregates multiple repositories; literal IPs, local hostnames, credentials and custom ports are rejected. Matching image URLs and source pages are deduplicated; undersized, malformed, mature or unlicensed Openverse results are filtered. React renders all text without raw HTML.
- Bounded in-memory per-client limits permit 30 calls/minute per server instance. Vercel's trusted client-IP header is preferred. For a large multi-instance deployment, add Vercel Firewall limits or a shared rate-limit store; process-local limits are not globally coordinated.
- Pexels does **not document a safe-search switch**. Openverse sends `mature=false` and rejects mature results. Approved educational queries restrict the search surface, but automated provider results are not a guarantee of child-suitable content. Deployments needing editorial approval of every photo should use an approved-photo catalogue.
- Security headers restrict scripts, connections, and fonts to this origin. The image-only CSP permits HTTPS hosts so Openverse thumbnails and original images from aggregated repositories can display. API responses are not edge-cached.

## Checks

```sh
npm test                 # Focused dictionary, UI, speech, provider and API tests
npm run typecheck
npm run build
npm run test:browser     # Real browser interaction, eight screen widths, axe accessibility
npm run test:packaging   # Isolated native Node artifact, mocked provider and failure cases
npm run check:source     # Browser/server boundary, environment, CSP and built asset checks
npm run check:whitespace # Includes tracked and untracked source/config files
```

Browser tests use installed Microsoft Edge on Windows; elsewhere run `npx playwright install chromium` first. `PLAYWRIGHT_CHANNEL` can explicitly select an installed browser. External image API responses are mocked in automated tests; tests do not depend on live Pixabay, Openverse or Pexels accounts. No lint script is configured; TypeScript and source/whitespace checks cover the configured static checks.

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

To regenerate English semantic data, run `python scripts/import-visual-lexicon.py path/to/wn3.1.dict.tar.gz`. Template anchors use `part-of-speech:lemma:optional-zero-based-sense`; select the intended WordNet meaning before expanding synonyms. The importer follows same-synset terms and outward adjective satellites, never antonyms. Review the generated data and run the inference tests after changing templates. Deterministic lexical rules cannot resolve every ambiguous gloss; provider availability and image relevance still vary.

## Deploy to Vercel

1. Import this project into Vercel (or run the Vercel CLI from this directory).
2. Use the Vite framework preset, `npm run build`, and `dist` output. Vercel discovers `api/images.js` automatically. The build regenerates and verifies `server/image-service.mjs`; `vercel.json` explicitly packages `public/data/cedict.json`. Keep the generated bundle in the deployment source. The dictionary is resolved relative to the server module, independent of the function's working directory. No external npm dependency or loose WordNet file is needed at runtime.
3. Open **Settings → Environment Variables → PIXABAY_API_KEY**, enter your key for the intended deployment environments, then **Redeploy**. Set **OPENVERSE_CLIENT_ID** and **OPENVERSE_CLIENT_SECRET** for authenticated secondary search; without them, Openverse uses anonymous access. Optionally retain **PEXELS_API_KEY** for the final provider fallback. Never use a `VITE_` prefix.
4. After redeploying, check the photo endpoint with a known word/sense, pronunciation on a device with a Mandarin voice, and an offline reload after the service worker installs.

No commit, push, or deployment is performed by the implementation task. Provider and OAuth behavior is mock-tested; live authenticated operation with the Vercel credentials has not been verified locally.

## Initial audit and deliberate limits

The supplied directory was empty and had no `.git`, framework, routing, API, styling, Gemini integration, Vercel setup, PWA, tests, reusable components, or environment patterns to preserve. React/Vite and Vercel functions follow the requested defaults. See `IMPLEMENTATION_REPORT.md` for verification results.

Malay coverage, examples, approved image queries, and relationship diagrams are curated subsets, not claims of full 125,173-entry educational enrichment. Most starter covers have one offline photo; apple has eight. Live galleries provide up to 12 where the provider has relevant results. ID/URL deduplication does not detect every visually similar crop, and images should be reviewed for high-assurance classroom deployment. Pronunciation quality and availability depend on installed device voices. No accounts, handwriting, stroke animation, AI enhancement, or spaced repetition are included.

## Bundle performance

`npm run build` regenerates all 54 starter words from the editorial source and current shared classifier before compilation. `npm run dev` does the same. Do not edit `learning-runtime.json` by hand. Word detail/preview and quiz code are lazy modules; the small home, category and saved layouts stay together. The main thread indexes only the starter collection. It passes that collection to the worker once, avoiding a duplicate starter payload in worker JavaScript. Full CC-CEDICT remains a separate, unchanged static asset.

A fresh PWA install precaches the small worker, lazy UI modules and local pictures, but does not fetch the large semantic JSON or full dictionary. The first full lookup downloads and caches both. Saved-word reclassification only needs the semantic asset. Upgrades preserve a previously downloaded dictionary and prepare the new semantic asset when upgrading from the old bundled worker, so existing offline capabilities remain available. Hashed assets ignore the preview server's Origin variation when matching precached module requests. API responses remain excluded.

Run `npm run test:bundle` after a production build to verify the emitted UI/worker import boundaries, deduplication and precache coverage. Run `npm run measure:bundle` for actual raw/gzip/Brotli sizes. Both use build evidence in `.tmp`; no analyzer ships to browsers. With `npm run preview` running, `npm run test:lazy` verifies cold-home network requests, offline lazy pages, worker data reuse, saved entries and upgrades. The full-dictionary parity test checks all 125,173 rows against the pre-optimization classifier. See `BUNDLE_OPTIMIZATION_REPORT.md` for the measured comparison.
