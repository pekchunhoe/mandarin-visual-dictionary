# KANJIAN — OPENVERSE SECONDARY IMAGE PROVIDER

Verified 5 October 2026. No commit, push or deployment performed.

```text
Existing Pixabay implementation audited: PASS
Openverse provider added: PASS
Pixabay remains primary provider: PASS
Openverse secondary fallback: PASS

OPENVERSE AUTH
Client credentials server-side: PASS
OAuth token retrieval: PASS (mocked)
Token caching/reuse: PASS
Token expiry handling: PASS
Anonymous fallback: PASS
Credentials exposed to browser: NO

PROVIDER FLOW
Pixabay strong results skip Openverse: PASS
Pixabay empty triggers Openverse: PASS
Pixabay insufficient supplemented by Openverse: PASS
Combined semantic reranking: PASS
Cross-provider deduplication: PASS

SEMANTIC QUALITY
Existing semantic image plans preserved: PASS
Existing relevance scoring preserved: PASS
Idioms preserved: PASS
Generic-result regression: NONE detected by regression tests

LICENSING
Creator metadata preserved: PASS
License metadata preserved: PASS
Source URL preserved: PASS

FAILURE HANDLING
Pixabay failure handled: PASS
Openverse failure handled: PASS
OAuth failure handled: PASS
Both providers empty handled: PASS

SECURITY
OPENVERSE_CLIENT_ID server-only: PASS
OPENVERSE_CLIENT_SECRET server-only: PASS
Access token server-only: PASS
Secret leakage in client build: NONE detected

REGRESSION
Dictionary behaviour: PASS
Visual coverage: PASS
Existing tests: PASS
Focused Openverse tests: PASS
Production build: PASS
git diff --check: PASS

Commit/push performed: NO
```

## Previous limitation and integration

The existing provider chain only supported Pixabay and optional Pexels. Missing,
rejected or insufficient Pixabay candidates could never reach Openverse. Image URL
validation, browser CSP, provider types and captions also assumed the original
stock providers.

Openverse is now another adapter in `server/providers.ts`. `server/images.ts`
keeps orchestration, caching, deadlines and the existing selected-sense reranker.
No parallel image pipeline was added. The dictionary, semantic classifier,
gloss alternatives, idiom planning, relevance scores and layout CSS are unchanged.

## Exact fallback conditions

- Run the existing Pixabay semantic queries first, with the existing query limits.
- Skip Openverse entirely, including OAuth, once there are six usable gallery
  candidates or one thumbnail after shared ranking, filtering and deduplication.
  The existing conceptual stopping rule is retained. Twelve remains the display cap.
- Otherwise use Openverse: this includes missing Pixabay configuration, empty or
  filtered responses, insufficient semantic matches, timeout and provider errors.
- Reuse the same English semantic candidate queries. Do not repeat a query just
  because its Pixabay image type/category differs. Pixabay plus Openverse use at
  most four search attempts; Openverse has at most three distinct gallery queries
  or two thumbnail queries. Search stops on enough results or provider failure.
- Keep optional Pexels after Openverse, including its existing idiom retries when
  Pixabay is unconfigured. With all providers configured, at most five searches
  occur. Without Pixabay, the legacy idiom path can use three Openverse plus three
  Pexels queries. OAuth and a single rejected-token anonymous retry are separate.
- Keep the eight-second overall deadline and 3.5-second individual search timeout;
  reserve the final three seconds after Pixabay for fallback. OAuth has a one-second
  timeout. Deadline exhaustion returns available candidates or existing fallback.

Pixabay and Openverse can coexist in one gallery. Actual Openverse titles/tags
enter the unchanged relevance scorer. Stronger semantic matches can outrank
Pixabay candidates. IDs, image URLs, known resized variants and source pages are
deduplicated. Source identity removes tracking parameters but preserves item IDs.

## OAuth and cache behavior

The HTTP handler reads `OPENVERSE_CLIENT_ID` and `OPENVERSE_CLIENT_SECRET` only on
the server. The token POST uses `application/x-www-form-urlencoded` and
`grant_type=client_credentials`; image requests use the bearer Authorization header,
following the [official Openverse API reference](https://api.openverse.org/v1/).

A bounded process-local cache keys token state by a SHA-256 credential fingerprint.
Concurrent acquisitions share a promise. Valid tokens are reused, and reacquired
before expiry with up to 30 seconds of allowance. Missing/partial credentials or
failed/malformed token responses use anonymous search. Authentication failures
have a 60-second cooldown. A search rejecting a bearer token with 401/403 invalidates
it and retries anonymously once. Upstream errors and credentials are never logged.

Openverse uses the existing bounded image cache, pending-request deduplication,
gallery-to-thumbnail reuse, 24-hour successful/empty cache lifetime and 60-second
failure cache. Keys retain word, sense, normalized query, provider and configuration
identity. The browser provider-chain cache version now includes Openverse. Tokens
never enter image results or browser storage. Provider response credential echoes
are rejected before normalization.

## Licensing, rendering and URL handling

Normalized `Photo` records retain title, creator/profile link, original source and
provider, landing page, license, version, license URL and attribution text. The
provider identity remains `openverse`. Only CC BY, CC BY-SA, CC0 and Public Domain
Mark results with a source page and license URL are selected. Other license types
are deliberately excluded from this integration; all results are not described as
public domain.

The existing gallery/preview captions show title, creator, source and license links.
Existing thumbnail credits include the license; returned attribution text is retained
as plain tooltip text. No upstream HTML is injected and no CSS redesign was needed.

Openverse sends `mature=false`; mature, tiny, malformed or unsupported-license images
are discarded. Optional missing creator, tags or thumbnail metadata is tolerated;
the original URL can supply a missing thumbnail. Missing usable dimensions, image
URL, source or license link makes a candidate ineligible.

Pixabay/Pexels keep their existing URL allowlists. Openverse accepts public HTTPS
domain URLs, rejecting literal IPs, local/reserved hostname suffixes, embedded
credentials and custom ports. The image-only CSP now permits HTTPS sources for
Openverse's varied repositories; script, connection and font restrictions remain
unchanged. No arbitrary server image proxy was added.

## Verification and tests

- Full Vitest suite: **601 tests in 18 files passed**, including dictionary,
  all-corpus idiom coverage, relevance, client behavior and API safeguards.
- Focused Openverse suites: **43 tests passed**, covering provider priority,
  sparse/mixed results, filtering, OAuth reuse/expiry/concurrency/failure, anonymous
  access, deadlines, real abort signals, cache identity, URL validation, metadata,
  cross-provider duplicates and nouns/actions/emotions/descriptions/idioms.
- Browser checks: **35 passed in the full 36-check run**. The remaining idiom
  empty-state fixture still returned Pixabay-shaped JSON to Openverse. After making
  that mock provider-aware, **its targeted rerun passed**. No application change was
  needed. The checks include eight existing viewport widths, accessibility, sense
  changes, errors, dictionary search and a new mixed gallery/license test at
  320, 768 and 1280 pixels.
- Production build: **PASS**, including TypeScript, unchanged generated learning
  content, native server bundle and seven isolated deployment scenarios.
- Packaging includes a mocked authenticated Openverse scenario that verifies
  token reuse across words and absence of credentials in API output.
- `npm run check:source`: **PASS** after building with distinct dummy Openverse ID
  and secret values. Client JavaScript, HTML, CSS, JSON, maps and manifests contain
  neither those values nor Openverse credential names/OAuth implementation.
- `npm run test:bundle`: **PASS** for browser/worker/server boundaries and offline
  chunk coverage. API responses remain excluded from service-worker storage.
- `git diff --check` and `npm run check:whitespace`: **PASS**.
- Test network requests are mocked. No live provider credentials are required.

## Exact files changed

```text
.env.example
README.md
OPENVERSE_INTEGRATION_REPORT.md
scripts/check-source.mjs
scripts/verify-server-package.mjs
server/image-handler.ts
server/image-plan.ts
server/image-service.mjs                 (regenerated deployment bundle)
server/images.ts
server/openverse-auth.ts                 (new)
server/providers.ts
src/components/VisualGallery.tsx
src/components/WordThumbnail.tsx
src/lib/visual.ts
src/types.ts
tests/api.test.ts
tests/browser/app.spec.ts
tests/browser/idiom-visuals.spec.ts
tests/conceptual-visuals.test.ts
tests/images.test.ts
tests/meaning-visuals.test.ts
tests/openverse-attribution.test.tsx      (new)
tests/openverse.test.ts                  (new)
tests/picture-relevance.test.ts
tests/pixabay.test.ts
tests/setup.ts
tests/universal-idiom-coverage.test.ts
tests/visual-coverage.test.ts
vercel.json
vite.config.ts
```

## Remaining limitations

Live authentication with the Vercel credentials was not exercised locally, and no
deployment was performed. Token and image caches are per warm server instance;
cold starts/other instances acquire their own tokens. Anonymous access is subject
to upstream limits. Results depend on provider metadata and host availability;
deduplication does not perform perceptual image comparison. License restrictions,
HTTPS and dimension requirements intentionally exclude some Openverse records.
The existing conceptual and sparse-metadata fallback semantics remain unchanged;
automated relevance is not a claim of editorial review.
