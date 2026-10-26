# KANJIAN AI Teacher — multilingual language-quality improvements

26 October 2026 · Asia/Kuala_Lumpur

**Implementation and mocked regression verification: PASS. New-prompt live linguistic quality: NOT VERIFIED.** No further live Gemini request was made, so this report does not claim that the earlier quality issue is empirically resolved for future generations.

## Implementation

The two AI Teacher actions now share an expanded, server-only language policy in `server/teacher-instructions.ts`. It applies universally to selected dictionary entries; it contains no headword-specific replacement, word blacklist or special case for the previously tested examples.

The instructions require:

- Natural modern Mandarin, conventional collocations and grammatical word order, with concise, educational examples in varied everyday situations. Exactly three sentences must genuinely use the complete selected headword in its selected sense. Quoting a word, forcing poetic combinations, changing senses for variety and producing minor rewrites are discouraged explicitly.
- Clear English and standard Malaysian Bahasa Melayu (`ms-MY`), using familiar, precise wording suitable for students. The policy distinguishes standard Malaysian usage from Indonesian phrasing while allowing shared vocabulary that is appropriate in Malaysia.
- Faithful translations directly from the Chinese meaning. Instructions explicitly cover participants, referents, negation, degree, time/aspect, modality and cause/consequence, and prohibit added facts, lost qualifications and vague substitutions.
- Contextual translation of the whole idiom, fixed expression or figurative usage, including its intended effect. The policy applies even without an explicit idiom flag. It discourages character-by-character rendering, invented foreign proverbs and literal images accompanied by vague explanations. Literal imagery remains appropriate when the selected sense and sentence actually describe a literal situation.
- Respect for the selected dictionary meaning and available part of speech. Existing Malay text may be unreviewed; it is a reference hint to be checked against the selected sense and sentence context, not blindly copied. Dictionary fields remain data, never instructions.
- Broad consideration of established synonyms/antonyms before filtering. The model is told not to stop at an arbitrary three or five if other genuine alternatives fit. Grammar, register and contextual meaning must support each relation. Each returned expression needs its own relevant English/Malay meaning.
- Accuracy over quantity: no invented expressions, loosely associated topics, related objects, duplicate/script variants, self-relations, cross-list overlap or padding. The existing maximum of 30 per section remains a cost ceiling, not a target or minimum. Empty arrays remain valid.

A silent review is requested **within the same generation response**. There is no second verification request, additional model, automatic retry or post-processing model pipeline. The only model remains **`gemini-3.5-flash-lite`**. Output budgets remain 2,200 tokens for sentences and 6,000 for relations; existing temperature, timeouts and validation bounds are unchanged. Longer instructions add input-token overhead, which has not been measured in a new live run.

## Cache and interface compatibility

The shared prompt version is now **`teacher-v2-linguistic`**, replacing `teacher-v1`. Server and browser cache identities already include that version; old results cannot satisfy a current-version request. Browser response validation rejects old-version envelopes, and a regression test verifies that stale content is not displayed or cached and that recovery requires an explicit retry.

Historical live recordings retain their original version and content. The optional recorded-live browser suite now skips recordings with a mismatched model/prompt version. Old output is not relabeled as new-prompt evidence.

Exactly three sentence rows, all Chinese/English/Malay fields, each individual copy button, the single relations Copy All button, expandable lists and empty-state messages are unchanged. The UI component, styles, clipboard implementation, dictionary detail page and dictionary data were preserved.

The existing **20 requests per 60 seconds** architecture is unchanged: exact ID `kanjian-ai-teacher`, production threshold controlled by Vercel, per-IP SDK bucketing, local development limit 20, rejection before generation, and fail-closed handling. No hosting/security settings, environment file or dependency was modified.

## Regression coverage

New curated **mock fixtures** cover two different idioms, a polysemous verb sense, a broad vocabulary collection and a concrete noun with no antonym. They are authored test examples, not new Gemini output or independent linguistic certification.

- `画蛇添足`: the Malay examples describe an unnecessary addition/change that spoils an otherwise adequate result. One fixture uses `perubahan yang tidak perlu itu merosakkan hasilnya`; another preserves possibility with `mungkin akan merosakkannya`.
- `亡羊补牢`: examples concern remedying a mistake or preventing recurrence, without translating the animal/enclosure imagery literally.
- `开`: the selected switch-on sense is retained in the dictionary context, request, UI and `pasang lampu` translation; other senses are not merged into the result.
- `高兴`: ten distinct established near-synonym fixtures and three antonyms exercise lists beyond the initial eight visible rows. Copy All includes the hidden items and every translation before expansion.
- `苹果`: empty relations retain the three-language explanation and complete clipboard output.

Tests verify the actual outgoing instructions and selected dictionary context, prompt-injection separation, model identity, unchanged output limits and a single mocked generation call per uncached action. Existing tests still cover structural validation, duplicates, quota/errors/timeouts, caching, rate limits and absent-key behavior.

Browser coverage checks all three copy buttons for each idiom with the real browser clipboard, plus the full synonym/antonym collection, empty results and a polysemous example. Only Windows CRLF line endings are normalized during comparisons; all other clipboard characters, translations and sections must match exactly. Desktop/mobile screenshots are stored under `.tmp/teacher-language-*.png` and were visually inspected.

## Evidence and limitations

**No additional live Gemini requests were made.** All generation responses in this task's automated/build/browser checks were mocked. The historical live-request ledger remains at four; the previous allowance was not reused or reset. The real key was neither printed nor included in source/generated assets.

These changes strengthen the instructions and protect the application behavior. Automated instruction, schema, fixture and clipboard tests **cannot guarantee the accuracy, naturalness or completeness of every future AI-generated translation or relation**. In particular, passing a curated fixture through mocked Gemini does not establish that the updated model prompt will produce that fixture. The newly strengthened prompt has **not** been live-tested, and the earlier live linguistic issue cannot be declared empirically resolved on this evidence alone.

Further live evaluation requires separate explicit authorization. It should sample idioms, polysemous words, grammatical functions and Malaysian Malay phrasing with independent language review where needed. Actual Vercel firewall enforcement also remains a post-deployment verification requirement.

No commit, push or deployment was performed.

## Changed files

- Added: `server/teacher-instructions.ts`, `tests/teacher-language-fixtures.ts`, `tests/ai-teacher-language.test.ts`, `tests/browser/ai-teacher-language.spec.ts`, and this report.
- Updated: `server/ai-teacher.ts` to use the shared policy; `src/lib/ai-teacher-schema.ts` for the prompt version; `tests/ai-teacher-client.test.tsx` for stale-version rejection; `tests/browser/ai-teacher-recorded-live.spec.ts` for historical-recording compatibility; `scripts/verify-teacher-package.mjs` to assert the current policy/version inside the native bundle.
- Regenerated: `server/teacher-service.mjs`. Existing dictionary, translation and image artifacts are unchanged.
- The two earlier integration/verification reports now link here while preserving their historical results.

## Final verification results

| Check | Observed result | Evidence |
| --- | --- | --- |
| Complete unit/regression suite | **964 passed**, 40 files | `.tmp/teacher-language-vitest-final.log` |
| Browser validation | **32 current scenarios verified**, 4 historical replay cases skipped | `.tmp/teacher-language-playwright-final.log` has 31 passes plus the transient resource failure; `.tmp/teacher-language-pixabay-recheck.log` records that scenario's successful rerun |
| `npm run build` | **PASS** | `.tmp/teacher-language-build.log` |
| `npm run typecheck` | **PASS** | Completed without TypeScript errors |
| Native teacher packaging/security smoke tests | **PASS** | Production build asserts the v2 language policy/version and exercises both native API actions with mocked Gemini; exactly two mock generation calls |
| `npm run check:source` | **PASS** | Credential/browser-server boundary, CSP, placeholders and API service-worker exclusion checks |
| `npm run test:bundle` | **PASS** | Lazy feature/data boundaries and offline chunk coverage |
| `npm run test:lazy` | **PASS** | `.tmp/teacher-language-lazy.log` |
| `npm run check:whitespace` | **PASS** | Source/config scan, including new files |
| Preservation check | **PASS** | Local before/after byte hashes match for `.env.local`, rate limiter, handler, environment loader, UI/styles/clipboard code, Vercel security configuration, dependencies and existing image bundle. No Git diff in existing dictionary/translation/image data. Values/hashes were not printed. |
| Additional live Gemini requests | **0** | No live test harness executed; historical ledger still contains exactly its original four requests |

The full passing regression command was:

```text
npx vitest run --maxWorkers=1 --testTimeout=30000
```

An earlier concurrent unit/browser run exceeded the corpus snapshot's existing 60-second timeout. The complete serial rerun passed without weakening that assertion or changing the test's timeout.

The browser scenarios include the existing application suite, existing teacher suite and five new language/clipboard scenarios. The final full browser run had one existing Pixabay scenario encounter the browser error `net::ERR_NO_BUFFER_SPACE`, leaving a blank page. Its focused rerun passed in 2.2 seconds without application changes. This remains an environment-related test flake to watch in CI. An earlier browser run passed all current scenario assertions but stalled during Windows npm web-server teardown. For the final run, an explicitly managed Vite server and ignored `.tmp/playwright-language-final.config.ts` disabled only automatic web-server management; browser options, test assertions and application behavior were unchanged. Logs retain both runs.

The four optional historical live-response tests were skipped because no new-prompt live recording exists. They are not counted as current validation passes. All new browser fixtures are mocked and identified as such; they cannot trigger a real teacher request if a fixture does not match.

The production offline check preserved fresh-home loading without heavy dictionary work, offline starter features, on-demand dictionary loading, saved words and upgrades. Static preview image API requests produced expected 404 messages because Vite preview serves assets rather than server functions; its offline assertions passed.

Main startup JS remains **324.83 KB / 97.15 KB gzip**. The click-loaded request client is **2.78 KB / 1.33 KB gzip**. The language policy stays entirely server-side, and the generated native teacher bundle is **872,572 bytes**, below its 1 MB bound. No dependency, extra model or extra routine API request was introduced.

Before deployment, retain the distinction between the successful implementation/behavior checks and unmeasured live language quality. Any further real-model evaluation needs explicit authorization, and actual Vercel firewall enforcement must be checked after an authorized deployment. No commit, push or deployment has occurred.
