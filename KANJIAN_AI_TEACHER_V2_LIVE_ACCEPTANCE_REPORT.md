# KANJIAN AI Teacher — v2 live acceptance

**Release readiness: FAIL.** Technical execution passed, but the actual outputs still contain material language/semantic errors. The stronger prompt is active; these failures cannot be attributed to old cached generations.

Test date: **26 October 2026**, Asia/Kuala_Lumpur. **Exactly four newly authorized real requests** were used, with no retry, alternative model, billing change, commit, push or deployment. No API key was printed or written into the evidence artifacts.

## Pipeline evidence

The rebuilt production entrypoint was executed locally: `api/teacher.js` → `server/teacher-service.mjs` → official Gemini API. This was not a separately constructed generation prompt. Before forwarding each request, the harness compared the outgoing system instruction with the exact current source policy; all four matched. Every application response identified **`teacher-v2-linguistic`**. Every provider response reported **`gemini-3.5-flash-lite`**, HTTP 200 and `STOP`.

A fresh Node process started with an empty application memory cache. Exactly one actual upstream call was recorded for each case, so none reused a previous cached generation. Selected meanings came from the real dictionary resolver, including the apple-fruit sense rather than the technology company.

| Case | Live result | Quality assessment |
| --- | --- | --- |
| 画蛇添足 · sentences | 3 complete, distinct trilingual sentences; 3,208 ms | **FAIL**: literal/awkward Malay, a Malay spelling error, and awkward Chinese/English wording remain. |
| 不耻下问 · sentences | 3 complete, distinct trilingual sentences; 2,020 ms | **PASS with reservations**: core idiom sense is preserved, particularly the manager/employee example. The school example is under-contextualized; translations are wordy and the Malay hierarchy wording is not ideal for students. |
| 美丽 · relations | 6 synonyms, 2 antonyms; 2,928 ms | **FAIL for the requested breadth**: returned relations are broadly defensible, but useful established alternatives are omitted. Some Malay wording needs polish. |
| 苹果 · relations | 2 purported synonyms, 0 antonyms; 2,531 ms | **FAIL**: the two synonym relationships are false. The empty antonym list is correct. |

Reported usage: **2,973 input + 1,086 output = 4,059 tokens**. These counts do not imply a billing-state or monetary-cost assessment.

## Linguistic findings

**画蛇添足:** the first Malay sentence still says `seperti melukis ular menambah kaki`. This translates the literal image instead of naturally explaining how an unnecessary addition spoils an otherwise adequate result. The second uses the awkward phrase `melukis dengan kadar yang secukupnya`; its English `be just right when painting` also reads like a calque. Chinese `做画` would be better expressed with the conventional `作画` or `画画`. The third Malay sentence spells the intended word `menyakinkan`; the standard spelling is **`meyakinkan`**, explicitly confirmed by [DBP](https://prpm.dbp.gov.my/Cari1?d=175768&keyword=meyakinkan). The third Chinese sentence also ends in an ASCII full stop, a minor presentation issue. These issues prevent acceptance even though the schema and three-sentence count passed.

**不耻下问:** the manager consulting younger staff clearly demonstrates the intended sense. The academic-humility sentence is also broadly appropriate. The school sentence describes asking questions generally without identifying the lower-rank/less-knowledgeable person being consulted; it would be a stronger educational example with that relationship made clear. Repeated English dictionary-style explanations and Malay `orang bawahan dalam pelajaran` are cumbersome. I do not classify the Chinese sentence as necessarily incorrect merely because its target is implicit; I flag its pedagogical ambiguity and unnatural translation choice. The [Ministry of Education idiom dictionary](https://dict.idioms.moe.edu.tw/bookView.jsp?ID=168) supports the distinction between general willingness to ask questions and learning without embarrassment from someone of lower status or knowledge. This is a qualified pass, not a claim of perfect phrasing.

**美丽:** actual synonyms were `漂亮、好看、秀丽、俊美、美观、奇丽`; antonyms were `丑陋、难看`. These are established words, with contextual/register differences rather than universal interchangeability. Coverage improved over the prior three-item sample, but useful alternatives such as **优美、秀美、俏丽** were omitted while the more specialized `奇丽` was included. The response ended normally with only 311 output tokens against a 6,000-token budget, so the list was not cut off by its output limit. My assessment is that further useful coverage was reasonably available: compare the official entries for [优美](https://dict.revised.moe.edu.tw/dictView.jsp?ID=153661&la=0&powerMode=0), [秀美](https://dict.concised.moe.edu.tw/dictView.jsp?ID=27228&la=1&powerMode=0), and the synonyms listed under [美丽](https://dict.revised.moe.edu.tw/dictView.jsp?ID=28970&q=1&word=%E9%BA%97). This does not establish an exhaustive mandatory list. Malay `menarik pandangan` for 美观 is less natural than wording such as `indah dipandang` in the relevant visual context.

**苹果:** the model returned `红富士 — Fuji apple — epal fuji` and `果实 — fruit — buah` as synonyms. A named apple variety is a subtype, and the generic fruit concept is broader than apple; neither is a genuine lexical equivalent. These are real words assigned fabricated synonym relationships. Fuji is listed among apple varieties by the [Ministry of Agriculture](https://fae.moa.gov.tw/map/food_item.php?id=132&type=AS01). The empty antonym array passed the no-fabricated-opposite check, but it does not compensate for the false synonyms.

## Actual outputs and checks

All six complete sentence sets and every returned relation are preserved **without correcting their wording** in [the actual-output JSON](KANJIAN_AI_TEACHER_V2_LIVE_ACCEPTANCE_OUTPUTS.json). It also contains selected meanings, timestamps, upstream status/model, usage, active prompt version, matched-instruction hashes and fresh-request evidence. The ignored `.tmp/teacher-v2-live-acceptance-ledger.json` separately enforces this authorization's four-request ceiling; the earlier four-request ledger was not reset or reused.

The native packaging/security smoke check passed before the live run. Afterward, **89 focused regression tests passed across four files**, using mocked Gemini: `.tmp/teacher-v2-acceptance-regression.log`. They cover language instructions, selected senses, stale prompt rejection, API errors, copies and rate limiting. They establish implementation behavior, not semantic correctness of model output. The earlier **964-test / 32-browser-scenario** evidence remains historical; the complete suites were not rerun or represented as new results in this acceptance pass.

Before/after checks confirmed the environment file, application source, current prompts/version, UI, clipboard code, rate limiter, security configuration, dependencies and existing image bundle were unchanged. The existing `kanjian-ai-teacher` per-IP **20 requests per 60 seconds** architecture remains intact. Actual deployed Vercel enforcement still requires a post-deployment test.

**Decision:** do not claim the AI Teacher meets its language-quality acceptance criteria for release. Address literal idiom translation, natural Malay/spelling, and subtype/hypernym confusion in lexical relations, then obtain separate authorization for another bounded live evaluation. No post-test prompt/code change was made, and no further live request is permitted under this exhausted allowance. Passing structure and regression checks cannot guarantee generated linguistic accuracy.
