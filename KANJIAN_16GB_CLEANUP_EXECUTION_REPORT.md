# KANJIAN: approved 16 GB cleanup execution report

Execution date: 2 November 2026 (Asia/Kuala_Lumpur).

Status: COMPLETE.

Approved scope: Scenario B in `KANJIAN_16GB_STORAGE_AUDIT_AND_CLEANUP_PLAN.md`. The original audit remains unchanged (SHA-256 `c23d969bcd790a082411ea57df0f8035c0b77a12d29603ae1c029bb76b666454`). No Scenario C dependency deletion, source changes, commit, push or deployment was performed. No paid Gemini request was made.

## Cleanup outcome

All 409 approved literal targets were reconfirmed and removed successfully. Skipped: 0. Failed/partial removals: 0. The durable operation journal and direct filesystem inspection confirmed all were absent immediately after deletion. No manual removal outside the approved targets occurred.

Removed 16,034,617,284 logical bytes (16.034617 GB), accounting for 16,104,098,304 allocated file bytes (16.104098 GB). The project measured 1,250,471,970 logical bytes (1.250472 GB) immediately after cleanup, including the growing execution journal.

Root node_modules was retained with its original 9,069 files and 149,222,868 logical bytes immediately after deletion. The no-Git copy's exact node_modules junction was verified, unlinked nonrecursively, and its parent then removed without traversing root dependencies. No links remained in the immediate project scan.

Production build, all 1,018 Vitest tests, source/bundle/security, dedicated dictionary validation and production offline/lazy/Malay checks passed. Browser acceptance is summarized in the final validation section below.

## Preflight and authorization safeguards

- Read the entire unchanged 230,531-byte audit and parsed its exact tables. Selected all 409 A/B rows; excluded the C-only node_modules row. Verified sums, literal absolute paths under the resolved project root, no ancestor/descendant overlap, fingerprints and 61 retained duplicate witnesses.
- Re-enumerated hidden/ignored content without following links. Every approved target matched counts, logical/allocation sizes and report fingerprints. No hard links or unexplained links were present.
- Verified all 10 authoritative raw data hashes, all 379 tracked path/content hashes and stable sense/mapping fingerprints against the audit before any deletion. The accepted store/runtime/packed and in-memory packaging outputs were byte-exact.
- Read process command/cwd/open-file and Python memory-map information where applicable. No continuing translation job was found. A temporary Python inspection helper exited before removal. All 409 targets passed an OS DELETE-access/sharing check without any file deletion during preflight.
- Before each removal, rechecked target identity, file/directory set, modification times, links, content/metadata fingerprint and retained duplicate witness. Native PowerShell literal paths and root boundary checks were used, with no wildcard, git clean, global cache clearing or cross-shell deletion.
- Kept a durable BEGIN/RESULT journal for every operation. Every removal returned success and its target was absent afterwards. The final report lists each exact target and operation timestamps.
- All 1,643 original files in the six excluded historical source backups and unique candidate/staged stores were checked present with unchanged identities, sizes and modification times after cleanup. Their unique payloads were never imported or discarded.

## Exact removed targets

These are the original approved targets, not any fresh build/test artifacts created later. Times are UTC. File allocations exclude filesystem metadata/alternate streams/snapshots, as in the audit.

| Rank | Exact removed path | Logical bytes | Allocated bytes | Result | Completed UTC |
| --- | --- | --- | --- | --- | --- |
| 1 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-models` | 3,930,617,360 | 3,930,689,536 | REMOVED | 2026-11-02T13:28:11.381Z |
| 2 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\download-parts` | 1,675,241,120 | 1,675,243,520 | REMOVED | 2026-11-02T13:28:12.182Z |
| 3 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\madlad-llama-q4k.gguf` | 1,660,781,696 | 1,660,784,640 | REMOVED | 2026-11-02T13:28:19.897Z |
| 4 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\madlad-q4k.gguf` | 1,654,597,280 | 1,654,599,680 | REMOVED | 2026-11-02T13:28:26.380Z |
| 5 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-model-env` | 911,466,694 | 969,181,184 | REMOVED | 2026-11-02T13:28:40.466Z |
| 6 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cuda11-env` | 792,995,806 | 798,259,712 | REMOVED | 2026-11-02T13:29:32.483Z |
| 7 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\recovery-import` | 700,879,076 | 700,993,536 | REMOVED | 2026-11-02T13:29:33.116Z |
| 8 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\new-import` | 670,969,831 | 671,076,352 | REMOVED | 2026-11-02T13:29:33.707Z |
| 9 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\isolated` | 198,390,502 | 198,438,912 | REMOVED | 2026-11-02T13:29:34.357Z |
| 11 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\source-tasks.jsonl` | 123,220,267 | 123,224,064 | REMOVED | 2026-11-02T13:29:35.295Z |
| 12 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\full-hplt\workload.jsonl` | 119,217,444 | 119,218,176 | REMOVED | 2026-11-02T13:29:36.304Z |
| 13 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\tasks.jsonl` | 119,217,444 | 119,218,176 | REMOVED | 2026-11-02T13:29:37.308Z |
| 14 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\full-hplt-fast\workload.jsonl` | 107,621,137 | 107,622,400 | REMOVED | 2026-11-02T13:29:38.224Z |
| 15 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\tasks-tail.jsonl` | 107,621,137 | 107,622,400 | REMOVED | 2026-11-02T13:29:39.181Z |
| 16 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-remaining-senses.jsonl` | 90,486,504 | 90,488,832 | REMOVED | 2026-11-02T13:29:40.044Z |
| 17 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\vercel-no-git-cqqlvjlj` | 88,221,391 | 88,971,264 | REMOVED | 2026-11-02T13:29:40.807Z |
| 18 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-edge-results` | 70,136,154 | 73,633,792 | REMOVED | 2026-11-02T13:29:42.056Z |
| 19 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-4pxwz1` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:42.637Z |
| 20 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-AMBHW8` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:43.264Z |
| 21 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-dReIrh` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:43.854Z |
| 22 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-duwULH` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:44.448Z |
| 23 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-GzOinn` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:45.047Z |
| 24 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-KTKhDO` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:45.647Z |
| 25 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-m7wdlz` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:46.260Z |
| 26 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-N6xEIp` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:46.888Z |
| 27 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-ov3nSR` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:47.482Z |
| 28 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-PtgW9O` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:48.073Z |
| 29 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-PTZYkb` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:48.737Z |
| 30 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-S1D7rM` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:49.331Z |
| 31 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-XjCg9O` | 58,212,939 | 58,217,472 | REMOVED | 2026-11-02T13:29:49.950Z |
| 32 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-CN4qUJ` | 56,793,068 | 56,800,256 | REMOVED | 2026-11-02T13:29:50.534Z |
| 33 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\full-gpu-final\workload.jsonl` | 51,757,917 | 51,761,152 | REMOVED | 2026-11-02T13:29:51.286Z |
| 34 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\tasks-gpu-final.jsonl` | 51,757,917 | 51,761,152 | REMOVED | 2026-11-02T13:29:52.053Z |
| 35 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\runtime` | 49,968,128 | 50,077,696 | REMOVED | 2026-11-02T13:29:52.674Z |
| 36 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\review-queue.jsonl` | 47,898,384 | 47,898,624 | REMOVED | 2026-11-02T13:29:53.559Z |
| 37 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-webkit-results` | 37,780,481 | 38,182,912 | REMOVED | 2026-11-02T13:30:13.801Z |
| 38 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\full-cpu-final\workload.jsonl` | 34,722,935 | 34,725,888 | REMOVED | 2026-11-02T13:30:14.540Z |
| 39 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\tasks-cpu-final.jsonl` | 34,722,935 | 34,725,888 | REMOVED | 2026-11-02T13:30:15.255Z |
| 40 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-0OoA6C` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:15.861Z |
| 41 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-0Oq5MP` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:30:16.435Z |
| 42 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-0r5U1W` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:17.110Z |
| 43 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-1N7HtT` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:17.687Z |
| 44 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-33tuy1` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:18.291Z |
| 45 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-3WVPJg` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:18.876Z |
| 46 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-5qPBx9` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:19.474Z |
| 47 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-5T9tpQ` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:20.077Z |
| 48 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-63H5tK` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:20.674Z |
| 49 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-8X95ia` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:21.268Z |
| 50 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-axhL4Y` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:30:21.855Z |
| 51 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-bB3z2e` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:22.460Z |
| 52 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-C9IKN0` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:30:23.090Z |
| 53 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-e6zAne` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:23.748Z |
| 54 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-ejaV7b` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:24.361Z |
| 55 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-eOa3Pt` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:24.936Z |
| 56 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-EXZKuC` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:30:25.563Z |
| 57 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-fo5s9Q` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:26.146Z |
| 58 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-gFeQrZ` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:26.763Z |
| 59 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HCHQEM` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:27.348Z |
| 60 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HgsKX5` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:27.995Z |
| 61 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HMrODx` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:30:28.610Z |
| 62 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HwNUpe` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:30:29.290Z |
| 63 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-hYvVe2` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:30.067Z |
| 64 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-HZr4aN` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:30.671Z |
| 65 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-IFqycQ` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:31.269Z |
| 66 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-IRM70v` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:31.873Z |
| 67 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-kaqZuB` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:32.472Z |
| 68 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-LAyqYr` | 21,386,593 | 21,393,408 | REMOVED | 2026-11-02T13:30:33.072Z |
| 69 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-LlDBPQ` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:33.677Z |
| 70 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-MclZum` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:34.284Z |
| 71 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-Mg3FlC` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:30:34.870Z |
| 72 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-OpBTxn` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:35.513Z |
| 73 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-Pp8cVl` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:36.171Z |
| 74 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-Q16jUk` | 21,388,428 | 21,393,408 | REMOVED | 2026-11-02T13:30:56.615Z |
| 75 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-QCPRS2` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:30:57.247Z |
| 76 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-QgvrLT` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:30:57.808Z |
| 77 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-RjB8F8` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:30:58.423Z |
| 78 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-SrJrGN` | 21,386,599 | 21,393,408 | REMOVED | 2026-11-02T13:30:58.980Z |
| 79 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-u2aT0T` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:30:59.585Z |
| 80 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-UeFXRK` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:31:00.163Z |
| 81 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-uMYuaY` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:31:00.753Z |
| 82 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-UVQ1CR` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:31:01.324Z |
| 83 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-VqX0Zc` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:31:01.916Z |
| 84 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-WfxiZ3` | 21,386,543 | 21,393,408 | REMOVED | 2026-11-02T13:31:02.541Z |
| 85 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-wnWPv1` | 21,388,436 | 21,393,408 | REMOVED | 2026-11-02T13:31:03.138Z |
| 86 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-WynDnl` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:31:03.734Z |
| 87 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-wZRuh3` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:31:04.489Z |
| 88 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-zAQVWL` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:31:05.087Z |
| 89 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-ZRHNGS` | 21,386,551 | 21,393,408 | REMOVED | 2026-11-02T13:31:05.674Z |
| 90 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-ZsbaJj` | 21,386,607 | 21,393,408 | REMOVED | 2026-11-02T13:31:06.252Z |
| 91 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-ztbybD` | 21,386,601 | 21,393,408 | REMOVED | 2026-11-02T13:31:06.852Z |
| 92 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\staged-store.json` | 21,382,097 | 21,385,216 | REMOVED | 2026-11-02T13:31:07.538Z |
| 93 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\staged-store.json` | 21,382,270 | 21,385,216 | REMOVED | 2026-11-02T13:31:08.245Z |
| 94 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\staged-store.json` | 21,382,097 | 21,385,216 | REMOVED | 2026-11-02T13:31:08.910Z |
| 95 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\baseline-store.json` | 20,828,295 | 20,832,256 | REMOVED | 2026-11-02T13:31:09.683Z |
| 96 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\promotion-before-store.json` | 20,828,295 | 20,832,256 | REMOVED | 2026-11-02T13:31:10.465Z |
| 97 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\baseline-store.json` | 20,828,295 | 20,832,256 | REMOVED | 2026-11-02T13:31:11.188Z |
| 98 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\promotion-before-store.json` | 20,828,295 | 20,832,256 | REMOVED | 2026-11-02T13:31:11.882Z |
| 99 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\baseline-store.json` | 20,828,295 | 20,832,256 | REMOVED | 2026-11-02T13:31:12.607Z |
| 100 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\promotion-before-store.json` | 20,828,295 | 20,832,256 | REMOVED | 2026-11-02T13:31:13.304Z |
| 101 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\baseline-store.json` | 20,828,295 | 20,832,256 | REMOVED | 2026-11-02T13:31:14.002Z |
| 102 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-DBNUjK` | 19,867,432 | 19,870,720 | REMOVED | 2026-11-02T13:31:14.638Z |
| 103 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-Xr0X2X` | 19,867,432 | 19,870,720 | REMOVED | 2026-11-02T13:31:15.243Z |
| 104 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\runtime.zip` | 19,563,017 | 19,566,592 | REMOVED | 2026-11-02T13:31:15.910Z |
| 105 | `D:\Primary school simulation\mandarin-visual-dictionary\dist` | 19,226,708 | 19,350,016 | REMOVED | 2026-11-02T13:31:16.499Z |
| 106 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\staged-runtime.json` | 15,445,028 | 15,446,016 | REMOVED | 2026-11-02T13:31:17.280Z |
| 107 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\staged-runtime.json` | 15,445,036 | 15,446,016 | REMOVED | 2026-11-02T13:31:17.985Z |
| 108 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\staged-runtime.json` | 15,445,028 | 15,446,016 | REMOVED | 2026-11-02T13:31:18.718Z |
| 109 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-after\malay-runtime.json` | 15,132,761 | 15,134,720 | REMOVED | 2026-11-02T13:31:19.428Z |
| 110 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\baseline-runtime.json` | 15,132,761 | 15,134,720 | REMOVED | 2026-11-02T13:31:31.380Z |
| 111 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\promotion-before-runtime.json` | 15,132,761 | 15,134,720 | REMOVED | 2026-11-02T13:31:32.055Z |
| 112 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\baseline-runtime.json` | 15,132,761 | 15,134,720 | REMOVED | 2026-11-02T13:31:32.712Z |
| 113 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\promotion-before-runtime.json` | 15,132,761 | 15,134,720 | REMOVED | 2026-11-02T13:31:33.393Z |
| 114 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\baseline-runtime.json` | 15,132,761 | 15,134,720 | REMOVED | 2026-11-02T13:31:34.047Z |
| 115 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\promotion-before-runtime.json` | 15,132,761 | 15,134,720 | REMOVED | 2026-11-02T13:31:34.713Z |
| 116 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\baseline-runtime.json` | 15,132,761 | 15,134,720 | REMOVED | 2026-11-02T13:31:35.390Z |
| 117 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-2F5qrw` | 13,274,760 | 13,276,160 | REMOVED | 2026-11-02T13:31:35.975Z |
| 118 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-a9R1w6` | 13,274,675 | 13,276,160 | REMOVED | 2026-11-02T13:31:36.555Z |
| 119 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-lUAVoe` | 13,274,760 | 13,276,160 | REMOVED | 2026-11-02T13:31:37.209Z |
| 120 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-UVwKW2` | 13,274,675 | 13,276,160 | REMOVED | 2026-11-02T13:31:37.792Z |
| 121 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-cBCDQJ` | 13,274,580 | 13,275,648 | REMOVED | 2026-11-02T13:31:38.383Z |
| 122 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-EGESGW` | 13,274,580 | 13,275,648 | REMOVED | 2026-11-02T13:31:38.970Z |
| 123 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-qfgsOQ` | 13,274,580 | 13,275,648 | REMOVED | 2026-11-02T13:31:39.558Z |
| 124 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-qSWvQv` | 13,274,580 | 13,275,648 | REMOVED | 2026-11-02T13:31:40.146Z |
| 125 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cedict-original.json` | 10,883,962 | 10,887,168 | REMOVED | 2026-11-02T13:31:40.822Z |
| 126 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-after\cedict.json` | 10,883,962 | 10,887,168 | REMOVED | 2026-11-02T13:31:41.440Z |
| 127 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-before\cedict.json` | 10,883,962 | 10,887,168 | REMOVED | 2026-11-02T13:31:42.098Z |
| 128 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-after\cedict.json` | 10,883,962 | 10,887,168 | REMOVED | 2026-11-02T13:31:42.736Z |
| 129 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-before\cedict.json` | 10,883,962 | 10,887,168 | REMOVED | 2026-11-02T13:31:43.398Z |
| 130 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-focused-results` | 8,753,107 | 8,769,536 | REMOVED | 2026-11-02T13:31:43.988Z |
| 131 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\live\malay-runtime.json` | 5,513,440 | 5,517,312 | REMOVED | 2026-11-02T13:31:44.653Z |
| 132 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-after\malay-runtime.json` | 5,513,440 | 5,517,312 | REMOVED | 2026-11-02T13:31:45.256Z |
| 133 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\production-before\malay-runtime.json` | 5,513,440 | 5,517,312 | REMOVED | 2026-11-02T13:31:45.904Z |
| 134 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\production-before\malay-runtime.json` | 5,513,440 | 5,517,312 | REMOVED | 2026-11-02T13:31:46.513Z |
| 135 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\promotion-before-store.json` | 4,757,938 | 4,759,552 | REMOVED | 2026-11-02T13:31:47.162Z |
| 136 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\isolated\store.json` | 4,757,938 | 4,759,552 | REMOVED | 2026-11-02T13:31:47.845Z |
| 137 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\promotion-before-store.json` | 4,757,938 | 4,759,552 | REMOVED | 2026-11-02T13:31:48.500Z |
| 138 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\madlad-tokenizer` | 4,439,507 | 4,452,352 | REMOVED | 2026-11-02T13:31:49.111Z |
| 139 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\translations-before.json` | 4,308,055 | 4,308,992 | REMOVED | 2026-11-02T13:31:49.783Z |
| 140 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\npm-cache` | 4,076,973 | 4,132,864 | REMOVED | 2026-11-02T13:31:50.463Z |
| 141 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\promotion-before-runtime.json` | 3,755,171 | 3,756,032 | REMOVED | 2026-11-02T13:31:51.180Z |
| 142 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\isolated\runtime.json` | 3,755,171 | 3,756,032 | REMOVED | 2026-11-02T13:31:51.795Z |
| 143 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\promotion-before-runtime.json` | 3,755,171 | 3,756,032 | REMOVED | 2026-11-02T13:31:52.488Z |
| 144 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\runtime-before.json` | 3,502,330 | 3,506,176 | REMOVED | 2026-11-02T13:31:53.157Z |
| 145 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\audit.json` | 2,177,162 | 2,179,072 | REMOVED | 2026-11-02T13:31:53.775Z |
| 146 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\audit.json` | 2,177,162 | 2,179,072 | REMOVED | 2026-11-02T13:32:48.435Z |
| 147 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\lexical-m2m100\workload.jsonl` | 1,909,885 | 1,912,832 | REMOVED | 2026-11-02T13:32:49.094Z |
| 148 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\lexical-tasks.jsonl` | 1,909,885 | 1,912,832 | REMOVED | 2026-11-02T13:32:49.676Z |
| 149 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-edge-final-results` | 1,870,378 | 1,880,064 | REMOVED | 2026-11-02T13:32:50.331Z |
| 150 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-5Uv8Mh` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:32:50.902Z |
| 151 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-6FIVGY` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:32:51.502Z |
| 152 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-6k8qIl` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:32:52.072Z |
| 153 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-6SHAMr` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:32:52.698Z |
| 154 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-9nqhh2` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:32:53.313Z |
| 155 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-aYosgw` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:32:53.968Z |
| 156 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-C6BpLA` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:32:54.584Z |
| 157 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-eFyQhJ` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:32:55.333Z |
| 158 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-fjMEhu` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:32:56.018Z |
| 159 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-gR9qIv` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:32:56.686Z |
| 160 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-h7eU48` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:32:57.396Z |
| 161 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-Hixkm5` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:32:58.138Z |
| 162 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-hvigHn` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:32:58.777Z |
| 163 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-JuAwoi` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:32:59.632Z |
| 164 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-JvCJn8` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:33:00.321Z |
| 165 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-O7Wn58` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:33:00.943Z |
| 166 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-Qt9T33` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:33:01.550Z |
| 167 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-RlahCd` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:33:02.183Z |
| 168 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-RmP1ab` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:33:02.782Z |
| 169 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-rnhDZH` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:33:03.397Z |
| 170 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-rwAHGm` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:33:04.007Z |
| 171 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-uTbfEw` | 1,689,363 | 1,695,744 | REMOVED | 2026-11-02T13:33:04.660Z |
| 172 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-vZq1Es` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:33:05.262Z |
| 173 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-xeAJeO` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:33:05.951Z |
| 174 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-XjHik7` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:33:06.577Z |
| 175 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-yGW8uD` | 1,689,505 | 1,695,744 | REMOVED | 2026-11-02T13:33:07.228Z |
| 176 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-3Z7GO1` | 1,686,955 | 1,687,552 | REMOVED | 2026-11-02T13:33:07.805Z |
| 177 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-4OuzTn` | 1,686,955 | 1,687,552 | REMOVED | 2026-11-02T13:33:08.420Z |
| 178 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-ISXPNM` | 1,686,955 | 1,687,552 | REMOVED | 2026-11-02T13:33:09.042Z |
| 179 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-JmXtAy` | 1,686,949 | 1,687,552 | REMOVED | 2026-11-02T13:33:09.638Z |
| 180 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-MVvwIg` | 1,686,949 | 1,687,552 | REMOVED | 2026-11-02T13:33:10.274Z |
| 181 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-NET0t3` | 1,686,949 | 1,687,552 | REMOVED | 2026-11-02T13:33:11.051Z |
| 182 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-build-test-TS96J5` | 1,686,955 | 1,687,552 | REMOVED | 2026-11-02T13:33:58.861Z |
| 183 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\protected-hplt\workload.jsonl` | 1,504,886 | 1,507,328 | REMOVED | 2026-11-02T13:33:59.479Z |
| 184 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\protected2-hplt\workload.jsonl` | 1,494,741 | 1,495,040 | REMOVED | 2026-11-02T13:34:00.084Z |
| 185 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-focused-fixed-results` | 1,415,606 | 1,421,312 | REMOVED | 2026-11-02T13:34:00.662Z |
| 186 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\english-browser-service.mjs` | 934,558 | 937,984 | REMOVED | 2026-11-02T13:34:01.327Z |
| 187 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\gallery-browser-service.mjs` | 934,558 | 937,984 | REMOVED | 2026-11-02T13:34:01.974Z |
| 188 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\large-gallery-browser-service.mjs` | 934,558 | 937,984 | REMOVED | 2026-11-02T13:34:02.580Z |
| 189 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\progressive-browser-service.mjs` | 934,558 | 937,984 | REMOVED | 2026-11-02T13:34:03.179Z |
| 190 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ultra-fast\gallery-after.mjs` | 934,558 | 937,984 | REMOVED | 2026-11-02T13:34:03.790Z |
| 191 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\candidates.json` | 927,923 | 929,792 | REMOVED | 2026-11-02T13:34:04.483Z |
| 192 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v2\candidates.json` | 928,261 | 929,792 | REMOVED | 2026-11-02T13:34:05.110Z |
| 193 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\dictionary-benchmark-run.mjs` | 826,603 | 827,392 | REMOVED | 2026-11-02T13:34:05.720Z |
| 194 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\benchmark.mjs` | 826,603 | 827,392 | REMOVED | 2026-11-02T13:34:06.291Z |
| 195 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\dictionary-benchmark.mjs` | 826,603 | 827,392 | REMOVED | 2026-11-02T13:34:06.908Z |
| 196 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\dictionary-benchmark.mjs` | 826,603 | 827,392 | REMOVED | 2026-11-02T13:34:07.481Z |
| 197 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\benchmark-after.mjs` | 827,163 | 827,392 | REMOVED | 2026-11-02T13:34:08.093Z |
| 198 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\benchmark-before.mjs` | 826,603 | 827,392 | REMOVED | 2026-11-02T13:34:08.676Z |
| 199 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-v1.jsonl` | 608,818 | 610,304 | REMOVED | 2026-11-02T13:34:09.288Z |
| 200 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-beam1\workload.jsonl` | 604,472 | 606,208 | REMOVED | 2026-11-02T13:34:09.872Z |
| 201 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-cuda-fp32\workload.jsonl` | 604,472 | 606,208 | REMOVED | 2026-11-02T13:34:10.461Z |
| 202 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-cuda11\workload.jsonl` | 604,472 | 606,208 | REMOVED | 2026-11-02T13:34:11.094Z |
| 203 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-fp32\workload.jsonl` | 604,472 | 606,208 | REMOVED | 2026-11-02T13:34:11.681Z |
| 204 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-hplt-v3\workload.jsonl` | 604,472 | 606,208 | REMOVED | 2026-11-02T13:34:12.286Z |
| 205 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-m2m100-v3\workload.jsonl` | 604,472 | 606,208 | REMOVED | 2026-11-02T13:34:12.924Z |
| 206 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot.jsonl` | 604,472 | 606,208 | REMOVED | 2026-11-02T13:34:13.513Z |
| 207 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\pilot-v2.jsonl` | 598,046 | 602,112 | REMOVED | 2026-11-02T13:34:14.116Z |
| 208 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\new-m2m100\workload.jsonl` | 522,900 | 524,288 | REMOVED | 2026-11-02T13:34:14.692Z |
| 209 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\surname-hplt\workload.jsonl` | 454,304 | 454,656 | REMOVED | 2026-11-02T13:34:15.302Z |
| 210 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\surname-tasks.jsonl` | 454,304 | 454,656 | REMOVED | 2026-11-02T13:34:15.872Z |
| 211 | `D:\Primary school simulation\mandarin-visual-dictionary\test-results` | 132,299 | 135,680 | REMOVED | 2026-11-02T13:34:16.488Z |
| 212 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\live\家俱-chinese-phone.png` | 86,572 | 90,112 | REMOVED | 2026-11-02T13:34:17.133Z |
| 213 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\live\哺乳动物-chinese-phone.png` | 79,732 | 81,920 | REMOVED | 2026-11-02T13:34:17.782Z |
| 214 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-responsive\after-longest-headword.png` | 70,054 | 73,728 | REMOVED | 2026-11-02T13:34:18.423Z |
| 215 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-responsive\before-820.png` | 71,921 | 73,728 | REMOVED | 2026-11-02T13:34:19.046Z |
| 216 | `D:\Primary school simulation\mandarin-visual-dictionary\scripts\malay\__pycache__` | 57,496 | 69,632 | REMOVED | 2026-11-02T13:34:19.638Z |
| 217 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\teacher-language-browser-final` | 47,394 | 57,344 | REMOVED | 2026-11-02T13:34:20.244Z |
| 218 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-0RYq6A` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:20.843Z |
| 219 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-37sFqd` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:21.451Z |
| 220 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-4xpnc2` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:35.743Z |
| 221 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-7HoJQT` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:36.359Z |
| 222 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-7vycwi` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:36.948Z |
| 223 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-8D9aaj` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:37.537Z |
| 224 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-a7MVQH` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:38.180Z |
| 225 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-AbBNIv` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:38.800Z |
| 226 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-aeRLjD` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:39.400Z |
| 227 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-AZ9ADz` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:40.036Z |
| 228 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-gBNUZZ` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:40.681Z |
| 229 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-gD27nw` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:41.276Z |
| 230 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-GocRD8` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:41.878Z |
| 231 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-gU2QoL` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:42.597Z |
| 232 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-gUiHKP` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:43.170Z |
| 233 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-KUaQBN` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:43.789Z |
| 234 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-L1uC3c` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:44.381Z |
| 235 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-mRNTjT` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:45.032Z |
| 236 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-NM6reo` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:45.621Z |
| 237 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-PqoyS3` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:46.244Z |
| 238 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-U0AsXs` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:46.824Z |
| 239 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-UKIYsO` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:47.450Z |
| 240 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-UtuARy` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:48.100Z |
| 241 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-wufFUQ` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:48.708Z |
| 242 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-Wy0tNl` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:49.322Z |
| 243 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-rejection-test-yxzY8c` | 4,857 | 13,312 | REMOVED | 2026-11-02T13:34:49.940Z |
| 244 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-6KGqpd` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:50.572Z |
| 245 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-A1QCnH` | 4,926 | 12,288 | REMOVED | 2026-11-02T13:34:51.182Z |
| 246 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-aqVPrU` | 4,926 | 12,288 | REMOVED | 2026-11-02T13:34:51.780Z |
| 247 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-fBJwgJ` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:52.492Z |
| 248 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-FGQA6L` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:53.069Z |
| 249 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-gsehyy` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:53.731Z |
| 250 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-I8Ffec` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:54.356Z |
| 251 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-imOpcl` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:55.006Z |
| 252 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-kFLuqe` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:55.593Z |
| 253 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-KqsYRr` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:56.209Z |
| 254 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-MX6fvD` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:56.813Z |
| 255 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-n5ejZt` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:57.422Z |
| 256 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-oud0gk` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:58.039Z |
| 257 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-oZHCB5` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:34:58.658Z |
| 258 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-Px17OE` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:13.110Z |
| 259 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-Q7g8Sj` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:13.714Z |
| 260 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-QY0ptR` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:14.308Z |
| 261 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-t5LkIj` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:14.917Z |
| 262 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-Tfv9Sh` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:15.508Z |
| 263 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-V0eO9r` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:16.107Z |
| 264 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-V9uFRF` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:16.740Z |
| 265 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-vwUzf2` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:17.339Z |
| 266 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-WJzBbC` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:17.946Z |
| 267 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-xlyWUp` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:18.558Z |
| 268 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-yhxb8D` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:19.162Z |
| 269 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-yHzNbf` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:19.799Z |
| 270 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-yjdX1o` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:20.376Z |
| 271 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-Zb2JHf` | 5,220 | 12,288 | REMOVED | 2026-11-02T13:35:20.984Z |
| 272 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-0zyptF` | 4,690 | 8,192 | REMOVED | 2026-11-02T13:35:21.570Z |
| 273 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-5R50C1` | 4,690 | 8,192 | REMOVED | 2026-11-02T13:35:22.199Z |
| 274 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-AY8VyK` | 4,690 | 8,192 | REMOVED | 2026-11-02T13:35:22.789Z |
| 275 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-snQxSD` | 4,690 | 8,192 | REMOVED | 2026-11-02T13:35:23.424Z |
| 276 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-provider-test-zegh6Z` | 4,690 | 8,192 | REMOVED | 2026-11-02T13:35:24.114Z |
| 277 | `D:\Primary school simulation\mandarin-visual-dictionary\tsconfig.tsbuildinfo` | 4,408 | 8,192 | REMOVED | 2026-11-02T13:35:24.725Z |
| 278 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-39XP9k` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:25.373Z |
| 279 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-5ZGx3R` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:26.059Z |
| 280 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-9FPg3O` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:26.718Z |
| 281 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-b7Q7vj` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:27.321Z |
| 282 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-cQpxyM` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:27.921Z |
| 283 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-hBOEF0` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:28.529Z |
| 284 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-K8EQfl` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:29.124Z |
| 285 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-kXfs2h` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:29.751Z |
| 286 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-sxr5dJ` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:30.353Z |
| 287 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-vV6UyD` | 1,691 | 512 | REMOVED | 2026-11-02T13:35:31.014Z |
| 288 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-0i1dYn` | 856 | 512 | REMOVED | 2026-11-02T13:35:31.588Z |
| 289 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-3dTDVW` | 856 | 512 | REMOVED | 2026-11-02T13:35:32.208Z |
| 290 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-5PGyzT` | 856 | 512 | REMOVED | 2026-11-02T13:35:32.801Z |
| 291 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-78BUDJ` | 856 | 512 | REMOVED | 2026-11-02T13:35:33.424Z |
| 292 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-7mUELF` | 856 | 512 | REMOVED | 2026-11-02T13:35:34.017Z |
| 293 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-AFYJmh` | 856 | 512 | REMOVED | 2026-11-02T13:35:34.641Z |
| 294 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-aPxZcZ` | 856 | 512 | REMOVED | 2026-11-02T13:35:35.293Z |
| 295 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ArsyuB` | 856 | 512 | REMOVED | 2026-11-02T13:35:35.890Z |
| 296 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-eeQjaP` | 856 | 512 | REMOVED | 2026-11-02T13:35:43.122Z |
| 297 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-JutQsY` | 856 | 512 | REMOVED | 2026-11-02T13:35:43.722Z |
| 298 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-oyvViq` | 856 | 512 | REMOVED | 2026-11-02T13:35:44.331Z |
| 299 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-QAx671` | 856 | 512 | REMOVED | 2026-11-02T13:35:44.938Z |
| 300 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-qhz9zq` | 856 | 512 | REMOVED | 2026-11-02T13:35:45.572Z |
| 301 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-RczYbE` | 856 | 512 | REMOVED | 2026-11-02T13:35:46.256Z |
| 302 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-s2sied` | 856 | 512 | REMOVED | 2026-11-02T13:35:46.856Z |
| 303 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-t8aaxe` | 856 | 512 | REMOVED | 2026-11-02T13:35:47.490Z |
| 304 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-t9mZUt` | 856 | 512 | REMOVED | 2026-11-02T13:35:48.066Z |
| 305 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-TVcFAg` | 856 | 512 | REMOVED | 2026-11-02T13:35:48.682Z |
| 306 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-xQWZ3T` | 856 | 512 | REMOVED | 2026-11-02T13:35:49.262Z |
| 307 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-zPNsvr` | 856 | 512 | REMOVED | 2026-11-02T13:35:49.887Z |
| 308 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\final-predeploy-browser-results` | 45 | 0 | REMOVED | 2026-11-02T13:35:50.484Z |
| 309 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-accessibility-results` | 45 | 0 | REMOVED | 2026-11-02T13:35:51.099Z |
| 310 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-existing-results` | 45 | 0 | REMOVED | 2026-11-02T13:35:51.696Z |
| 311 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\ipad-webkit-final-results` | 45 | 0 | REMOVED | 2026-11-02T13:35:52.308Z |
| 312 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-14vQBD` | 793 | 0 | REMOVED | 2026-11-02T13:35:52.894Z |
| 313 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-3kUExn` | 793 | 0 | REMOVED | 2026-11-02T13:35:53.547Z |
| 314 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-8D5jHI` | 793 | 0 | REMOVED | 2026-11-02T13:35:54.186Z |
| 315 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-B9jBLn` | 793 | 0 | REMOVED | 2026-11-02T13:35:54.796Z |
| 316 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-c0ixtu` | 793 | 0 | REMOVED | 2026-11-02T13:35:55.430Z |
| 317 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-HDg3Yp` | 1,376 | 0 | REMOVED | 2026-11-02T13:35:56.054Z |
| 318 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-hrEdne` | 793 | 0 | REMOVED | 2026-11-02T13:35:56.690Z |
| 319 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-iO15Jo` | 793 | 0 | REMOVED | 2026-11-02T13:35:57.353Z |
| 320 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-iRU97g` | 793 | 0 | REMOVED | 2026-11-02T13:35:57.973Z |
| 321 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-LiNWEf` | 793 | 0 | REMOVED | 2026-11-02T13:35:58.642Z |
| 322 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-N3DCBH` | 793 | 0 | REMOVED | 2026-11-02T13:35:59.290Z |
| 323 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-n6I45u` | 793 | 0 | REMOVED | 2026-11-02T13:36:00.016Z |
| 324 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-PLiBRc` | 793 | 0 | REMOVED | 2026-11-02T13:36:00.667Z |
| 325 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-ppu2Vj` | 793 | 0 | REMOVED | 2026-11-02T13:36:01.331Z |
| 326 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-pryXio` | 793 | 0 | REMOVED | 2026-11-02T13:36:02.044Z |
| 327 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-QziRd6` | 1,376 | 0 | REMOVED | 2026-11-02T13:36:02.679Z |
| 328 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-sQfhtO` | 793 | 0 | REMOVED | 2026-11-02T13:36:03.303Z |
| 329 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-wiaOK9` | 793 | 0 | REMOVED | 2026-11-02T13:36:03.976Z |
| 330 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-xuCswo` | 793 | 0 | REMOVED | 2026-11-02T13:36:04.580Z |
| 331 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-budget-test-zeg4YH` | 793 | 0 | REMOVED | 2026-11-02T13:36:05.259Z |
| 332 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-0k4bWV` | 35 | 0 | REMOVED | 2026-11-02T13:36:05.894Z |
| 333 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-0pCrTh` | 35 | 0 | REMOVED | 2026-11-02T13:36:19.964Z |
| 334 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-3WnALM` | 46 | 0 | REMOVED | 2026-11-02T13:36:20.843Z |
| 335 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-4ZK7fe` | 35 | 0 | REMOVED | 2026-11-02T13:36:21.556Z |
| 336 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-5zdyxP` | 46 | 0 | REMOVED | 2026-11-02T13:36:22.546Z |
| 337 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-66b8jd` | 35 | 0 | REMOVED | 2026-11-02T13:36:23.257Z |
| 338 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-6Mfx7H` | 46 | 0 | REMOVED | 2026-11-02T13:36:24.043Z |
| 339 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-6trXoW` | 46 | 0 | REMOVED | 2026-11-02T13:36:24.695Z |
| 340 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-7CM663` | 35 | 0 | REMOVED | 2026-11-02T13:36:25.393Z |
| 341 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-7KrwLn` | 46 | 0 | REMOVED | 2026-11-02T13:36:26.020Z |
| 342 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-9eh25V` | 296 | 0 | REMOVED | 2026-11-02T13:36:26.686Z |
| 343 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-9kZ5L4` | 46 | 0 | REMOVED | 2026-11-02T13:36:27.293Z |
| 344 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-AyHVVJ` | 46 | 0 | REMOVED | 2026-11-02T13:36:27.946Z |
| 345 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-BALcPr` | 46 | 0 | REMOVED | 2026-11-02T13:36:28.583Z |
| 346 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ckcLWT` | 296 | 0 | REMOVED | 2026-11-02T13:36:29.205Z |
| 347 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-dBr3Qy` | 296 | 0 | REMOVED | 2026-11-02T13:36:29.803Z |
| 348 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ERgNDP` | 296 | 0 | REMOVED | 2026-11-02T13:36:30.442Z |
| 349 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-fNoWG2` | 35 | 0 | REMOVED | 2026-11-02T13:36:31.049Z |
| 350 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-fwQMr1` | 46 | 0 | REMOVED | 2026-11-02T13:36:31.678Z |
| 351 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-g42ILH` | 296 | 0 | REMOVED | 2026-11-02T13:36:32.271Z |
| 352 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-gu6Ktw` | 296 | 0 | REMOVED | 2026-11-02T13:36:32.922Z |
| 353 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-hAhOcp` | 296 | 0 | REMOVED | 2026-11-02T13:36:33.539Z |
| 354 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-hs7NYa` | 35 | 0 | REMOVED | 2026-11-02T13:36:34.277Z |
| 355 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-IF0XM4` | 296 | 0 | REMOVED | 2026-11-02T13:36:34.915Z |
| 356 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-jdghdv` | 35 | 0 | REMOVED | 2026-11-02T13:36:35.557Z |
| 357 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-JoHaRY` | 46 | 0 | REMOVED | 2026-11-02T13:36:36.200Z |
| 358 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-kl2ufj` | 296 | 0 | REMOVED | 2026-11-02T13:36:36.835Z |
| 359 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-Kqk1oA` | 296 | 0 | REMOVED | 2026-11-02T13:36:37.466Z |
| 360 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-KSyyox` | 35 | 0 | REMOVED | 2026-11-02T13:36:38.109Z |
| 361 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-kX3AEM` | 296 | 0 | REMOVED | 2026-11-02T13:36:38.807Z |
| 362 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-KY8joL` | 35 | 0 | REMOVED | 2026-11-02T13:36:39.486Z |
| 363 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-LWpTzj` | 35 | 0 | REMOVED | 2026-11-02T13:36:40.104Z |
| 364 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-mKzL3t` | 46 | 0 | REMOVED | 2026-11-02T13:36:40.775Z |
| 365 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-O0EG09` | 296 | 0 | REMOVED | 2026-11-02T13:36:41.382Z |
| 366 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-o824aU` | 46 | 0 | REMOVED | 2026-11-02T13:36:42.100Z |
| 367 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-qkYMDS` | 35 | 0 | REMOVED | 2026-11-02T13:36:42.740Z |
| 368 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-QvLyo5` | 46 | 0 | REMOVED | 2026-11-02T13:36:49.373Z |
| 369 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-QWz2Vy` | 46 | 0 | REMOVED | 2026-11-02T13:36:50.089Z |
| 370 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-RhjDWj` | 46 | 0 | REMOVED | 2026-11-02T13:36:50.718Z |
| 371 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-rIBqLH` | 46 | 0 | REMOVED | 2026-11-02T13:36:51.337Z |
| 372 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-rIropR` | 296 | 0 | REMOVED | 2026-11-02T13:36:51.943Z |
| 373 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-roHTXF` | 46 | 0 | REMOVED | 2026-11-02T13:36:52.562Z |
| 374 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-rrTzPJ` | 46 | 0 | REMOVED | 2026-11-02T13:36:53.147Z |
| 375 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-SL9ORK` | 296 | 0 | REMOVED | 2026-11-02T13:36:53.765Z |
| 376 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-t3o3Wr` | 35 | 0 | REMOVED | 2026-11-02T13:36:54.351Z |
| 377 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-tFtkGN` | 35 | 0 | REMOVED | 2026-11-02T13:36:54.981Z |
| 378 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-UCS94Z` | 296 | 0 | REMOVED | 2026-11-02T13:36:55.569Z |
| 379 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-uGPM9T` | 35 | 0 | REMOVED | 2026-11-02T13:36:56.253Z |
| 380 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ujRVdE` | 35 | 0 | REMOVED | 2026-11-02T13:36:56.840Z |
| 381 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-URwVnf` | 35 | 0 | REMOVED | 2026-11-02T13:36:57.489Z |
| 382 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-UWmQNs` | 35 | 0 | REMOVED | 2026-11-02T13:36:58.213Z |
| 383 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-vd3Sny` | 46 | 0 | REMOVED | 2026-11-02T13:36:58.900Z |
| 384 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-vEg5Xj` | 296 | 0 | REMOVED | 2026-11-02T13:36:59.551Z |
| 385 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-wahJ8G` | 35 | 0 | REMOVED | 2026-11-02T13:37:00.241Z |
| 386 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-WFZ6H9` | 46 | 0 | REMOVED | 2026-11-02T13:37:00.879Z |
| 387 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-Whd8Bp` | 296 | 0 | REMOVED | 2026-11-02T13:37:01.536Z |
| 388 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-zCLRfn` | 296 | 0 | REMOVED | 2026-11-02T13:37:02.171Z |
| 389 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ZeCslT` | 296 | 0 | REMOVED | 2026-11-02T13:37:02.904Z |
| 390 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ZmIgNc` | 296 | 0 | REMOVED | 2026-11-02T13:37:03.539Z |
| 391 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-bulk-test-ZVYvoh` | 35 | 0 | REMOVED | 2026-11-02T13:37:04.245Z |
| 392 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-1kK5Gb` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:04.867Z |
| 393 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-2KKgTx` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:05.511Z |
| 394 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-2kwy5E` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:06.164Z |
| 395 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-35CI2r` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:06.802Z |
| 396 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-7OpGEb` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:07.507Z |
| 397 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-9S6q8A` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:08.365Z |
| 398 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-AK5q8B` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:09.174Z |
| 399 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-chelyF` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:09.950Z |
| 400 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-DM5cv1` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:10.627Z |
| 401 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-jjSYTz` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:11.278Z |
| 402 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-JZmTsl` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:11.946Z |
| 403 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-ksXBOF` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:37.039Z |
| 404 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-qKLkYM` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:37.654Z |
| 405 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-QMRuq3` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:38.253Z |
| 406 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-rSz9MT` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:38.903Z |
| 407 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-tx2Hrm` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:39.494Z |
| 408 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-vjrbcj` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:40.108Z |
| 409 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-cost-policy-Y39lar` | 1,499 | 0 | REMOVED | 2026-11-02T13:37:40.688Z |
| 410 | `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\teacher-copy-browser-results` | 45 | 0 | REMOVED | 2026-11-02T13:37:41.297Z |

## Dictionary and feature preservation

Mandarin–English: 125,173 rows and 198,245 unique stable senses. Malay: all 14,761 records and 82 lexical supplements preserved; 183,484 senses remain untranslated with the existing fallback. All 55 editorial starter Malay meanings remain aligned.

Preservation is based on complete data hashes and sense/content mappings, not counts alone. Raw authoritative hashes matched before deletion, immediately after deletion and after the normal production build. The dedicated existing validator checked original gzip/corpus equality, every record's sense/quality alignment, runtime projection, full original data and 20 canonical Malay search/selected-sense regressions. The packed transport round trip was checked independently.

| Authoritative file | Bytes | Preserved raw SHA-256 |
| --- | --- | --- |
| `cedict.txt.gz` | 3,978,169 | `c01e6d2d7f7545b4a29e08da17e7ec77a1b1fd1531009269e74e42f391fb2c1d` |
| `public/data/cedict.json` | 10,883,962 | `29ef153e108ce38023db98baabfdfe40447b2ff70d4c6d5c4643773755fea27a` |
| `src/data/cedict-core.json` | 9,612 | `cde4a2da8ec02a43fc6e6efa4612dcfecc84cbd61950fe6274d7d1b9e15bdafe` |
| `src/data/learning-source.ts` | 13,927 | `57055055cfabdd124a98c54e492b66e776d6c8a7de6085ce88717b81d02f3be6` |
| `src/data/learning-runtime.json` | 54,085 | `2bf7646d28f13d32616c2515dfc237f9045b3ac3f9198a9b29e206543d9136db` |
| `scripts/data/malay-translations-v1.json` | 21,382,097 | `b2da754474821abd6b3ac9428796a0bc0b5e338a27c93350891854620ea1d3c1` |
| `src/data/malay-runtime.json` | 15,445,028 | `cff29f4747a5a62a7533c255544d5847374b395c863feca50279c8f42059be19` |
| `src/data/malay-runtime-packed.json` | 4,102,517 | `4c350c9fe9403eb6df144f433dbd6bdac8dcf9b62c9ccd403589730641799da5` |
| `scripts/data/malay-glosses.json` | 6,328 | `31b06e7bdb316f8926e94dcb6d88e155cae94bfdfd842767ced4043c29821e33` |
| `scripts/data/malay-sense-overrides.json` | 3,051 | `0620b3d034e2379b8d12b93783721e1884c759141bd3a93a59c5d260f6b98abf` |

Tracked-tree SHA-256: `30dda8fdb8feac94e311e02392b219e2001dc4c41fc7474ceeed032f5625aa3e`. The current 379 tracked source/data/configuration files matched this aggregate after cleanup, build and unit validation.

Required Malay packaging remains operational in the normal Node 24 production build; no model/environment was restored or downloaded. Preserve pipeline.mjs build and its quality/corpus/io/reference helpers, accepted store, editorial inputs and packed-data generator. The cancelled generation commands were not run and their tracked code/aliases were not rewritten.

Gemini Teacher, Copy Prompt, image providers, offline code and responsive UI source remain byte-for-byte unchanged. The build tested both native Teacher actions using mocked fetch and packaged image failure/security cases. Local browser servers use an explicit non-credential placeholder and Teacher interactions are mocked. Existing .env.local, Vercel linkage and ignore/security configuration hashes remain unchanged; no secret values are included here.

## Storage measurements and reconciliation

GB means 1,000,000,000 bytes. Measurements include hidden/ignored files and deduplicate filesystem identities without traversing links. Reported allocation is stat.blocks × 512; directory/MFT/ADS/journal/snapshot/recycle-bin accounting and unrelated volume activity are outside these file-stream measurements. No before/after whole-volume free-space delta was recorded, so it is not claimed. All totals below include this execution report at the measured snapshot.

| Measurement | Before execution | Immediately after deletion | After all validation/final report |
| --- | --- | --- | --- |
| Project logical bytes | 17,284,893,579 | 1,250,471,970 | 1,417,049,704 |
| Project logical GB | 17.284894 | 1.250472 | 1.417050 |
| Project allocated file bytes | 17,372,188,672 | 1,268,286,976 | 1,435,055,616 |
| Project allocated GB | 17.372189 | 1.268287 | 1.435056 |
| .tmp logical bytes | 17,019,225,137 | 1,004,028,764 | 1,151,482,775 |
| node_modules logical bytes | 149,222,868 | 149,222,868 | 149,222,886 |
| Dictionary data/input directories + archive | 66,528,724 | Unchanged | 66,528,724 |
| Application/maintenance/test source trees | 68,122,420 | Includes approved bytecode removal | 68,064,924 |

The source-tree row sums src, server, api, scripts, public and tests (including data/generated files); the dictionary row is a subset and must not be added to it. Only six ignored Python bytecode files were removed from those source trees. All 379 tracked file contents remain exact. The installed dependency change is a tiny Vitest results-cache update, not uninstall/reinstallation.

| Reconciliation item | Measured value |
| --- | --- |
| Frozen audit project size | 17,284,600,123 bytes / 17.284600 GB |
| Actual execution preflight size | 17,284,893,579 bytes |
| Approved target contents actually removed | 16,034,617,284 bytes / 16.034617 GB |
| Approved target allocated file bytes removed | 16,104,098,304 bytes / 16.104098 GB |
| Immediate net project reduction | 16,034,421,609 bytes |
| Final net logical project reduction | 15,867,843,875 bytes / 15.867844 GB |
| Final net allocated-file reduction | 15,937,133,056 bytes / 15.937133 GB |
| Net growth after immediate cleanup from validation/reporting | 166,577,734 bytes |
| New file paths created by build/tests | 130 |
| Gross new-file contents from build/tests | 168,680,435 bytes |
| Final execution report size | 88,264 bytes |
| Final measurement UTC | 2026-11-02T14:06:13.075Z |

The immediate 1.250472 GB result matches the approximately 1.250 GB plan. The final approximately 1.417 GB result includes fresh import-test fixtures, regenerated dist/native browser-test helpers, compiler state and validation evidence. Existing screenshots/metrics were refreshed by the existing browser tests and some became smaller, so gross new-file bytes differ from net growth. The execution report and automatic Codex Git bookkeeping also contribute small differences from the frozen audit. There was no attempt to force the old final-size estimate by deleting unapproved new artifacts.

## Validation results

| Check | Result | Evidence / detail |
| --- | --- | --- |
| Normal production build | PASS | TypeScript; Malay packaging; native image artifacts; source/package security; mocked Teacher sentences and relations |
| Vitest full suite | PASS | 43 files; 1018 passed |
| Source/security boundary | PASS | Existing normal check passed |
| Translation cost policy | PASS | Existing normal check passed |
| UI/worker/server bundle architecture | PASS | Existing normal check passed |
| Production offline cache migration | PASS | .tmp/kanjian-cleanup-validation/offline.log |
| Production lazy loading and offline saved-word upgrades | PASS | Expected 404 diagnostics were emitted, but all assertions passed. |
| Production offline Malay | PASS | Saved sense, synonyms/phrases, translated definitions/references/loanwords retained; no page errors. |
| Dedicated Malay validation | PASS | Original corpus equality, every accepted record validated, 20 search cases and sense IDs checked. |
| Git object connectivity | PASS | Read-only fsck exit 0; dangling objects reported and left untouched. |
| WebKit iPad responsive regression suite | PASS | 18 passed; 0 skipped/failed/flaky; 10.93 minutes |
| Full Edge browser suite | PASS | 123 passed; 4 opt-in replay skips; 0 failed/flaky; 16.38 minutes |
| Final complete tracked/data/sense preservation | PASS | All 379 tracked hashes, three semantic fingerprints, 198245 senses, 14761 Malay meanings, 82 supplements, 55 starter meanings and packed round trip exact. |

The normal npm run build included TypeScript tsc -b, existing Malay packaging, both native API bundles, all isolated image deployment/failure checks, Vite/offline-shell generation, translation-cost policy and both mocked native Teacher actions. No separate duplicate typecheck/build was needed after that successful check.

The complete Edge suite covered Teacher language/context/clipboard, semantic galleries and provider competition, Pixabay/Openverse attribution and image sizes, Mandarin/English/Malay searches and sense alignment, missing Malay fallback/external link, offline/cache behavior, desktop/mobile/iPad layouts and accessibility. The additional complete iPad/WebKit suite covered 16 viewports plus orientation/state retention and accessibility. No failed assertion, unexpected result or flaky retry was recorded in either browser JSON report.

Four Edge cases in ai-teacher-recorded-live.spec.ts were intentionally skipped because no opt-in existing live-response recording was supplied. They are the beautiful sentences, idiom sentences, beautiful relations and apple recorded clipboard replays. These skips made no live requests. Standard mocked Teacher/clipboard cases and native server/package checks passed. No recording was generated and no paid Gemini call was made.

Expected non-failing diagnostics: the lazy-loading checker printed deliberate 404 resource probes but completed successfully; Node printed a NO_COLOR/FORCE_COLOR environment warning. Read-only git fsck --connectivity-only exited 0 and reported dangling objects, which were left untouched.

Both local test servers were stopped after testing: only the recorded Node processes 14084 (4173) and 14820 (5173), verified against executable, previously observed start time and local listener ownership. No unrelated process was stopped. Their wrapper-session exit after deliberate shutdown is not a validation failure.

| Retained validation evidence | Bytes |
| --- | --- |
| `.tmp/kanjian-cleanup-validation/browser-test-list.log` | 23,852 |
| `.tmp/kanjian-cleanup-validation/build.log` | 7,284 |
| `.tmp/kanjian-cleanup-validation/edge-artifacts/.last-run.json` | 45 |
| `.tmp/kanjian-cleanup-validation/edge-browser.log` | 32,062 |
| `.tmp/kanjian-cleanup-validation/edge-results.json` | 142,319 |
| `.tmp/kanjian-cleanup-validation/final-integrity.log` | 1,138 |
| `.tmp/kanjian-cleanup-validation/lazy.log` | 3,002 |
| `.tmp/kanjian-cleanup-validation/malay-integrity.log` | 6,770 |
| `.tmp/kanjian-cleanup-validation/malay-offline.log` | 934 |
| `.tmp/kanjian-cleanup-validation/offline.log` | 636 |
| `.tmp/kanjian-cleanup-validation/unit-tests.log` | 648 |
| `.tmp/kanjian-cleanup-validation/webkit-artifacts/.last-run.json` | 45 |
| `.tmp/kanjian-cleanup-validation/webkit-browser.log` | 6,546 |
| `.tmp/kanjian-cleanup-validation/webkit-results.json` | 21,565 |

## Regenerated paths and new artifacts retained

All 409 old targets were absent immediately after deletion. Six of those path names were later recreated by the approved normal build/browser tests; they are fresh artifacts, not failed removals. No second deletion was attempted.

| Approved path name recreated | Fresh logical bytes | Cause |
| --- | --- | --- |
| `dist` | 19,226,708 | Normal successful production build |
| `.tmp/english-browser-service.mjs` | 934,558 | Existing browser gallery fixture bundling |
| `.tmp/gallery-browser-service.mjs` | 934,558 | Existing browser gallery fixture bundling |
| `.tmp/large-gallery-browser-service.mjs` | 934,558 | Existing browser gallery fixture bundling |
| `.tmp/progressive-browser-service.mjs` | 934,558 | Existing browser gallery fixture bundling |
| `tsconfig.tsbuildinfo` | 4,408 | Normal successful tsc -b |

Largest new artifact groups after the cleanup snapshot:

| New file/folder group | New files | New logical bytes |
| --- | --- | --- |
| `.tmp/malay-offline-import-x3epqE` | 7 | 58,212,939 |
| `.tmp/malay-lexical-import-PCU9nz` | 3 | 21,388,436 |
| `.tmp/malay-lexical-import-PcsKKY` | 3 | 21,386,607 |
| `.tmp/malay-lexical-import-DzVPRM` | 3 | 21,386,601 |
| `.tmp/malay-lexical-import-V0K3nH` | 3 | 21,386,551 |
| `dist` | 55 | 19,226,708 |
| `.tmp/malay-build-test-Mkd5rB` | 2 | 1,689,505 |
| `.tmp/english-browser-service.mjs` | 1 | 934,558 |
| `.tmp/gallery-browser-service.mjs` | 1 | 934,558 |
| `.tmp/large-gallery-browser-service.mjs` | 1 | 934,558 |
| `.tmp/progressive-browser-service.mjs` | 1 | 934,558 |
| `.tmp/kanjian-cleanup-validation` | 14 | 246,846 |
| `.tmp/malay-provider-test-lVR0rj` | 6 | 5,220 |
| `.tmp/malay-rejection-test-rYD0KI` | 9 | 4,857 |
| `tsconfig.tsbuildinfo` | 1 | 4,408 |
| `.tmp/malay-cost-policy-FhJwMm` | 5 | 1,499 |
| `.tmp/malay-bulk-test-jkuPMG` | 4 | 856 |
| `.tmp/malay-budget-test-HYTlgj` | 3 | 793 |
| `.tmp/malay-bulk-test-ZcLums` | 5 | 296 |
| `.tmp/malay-bulk-test-nibkWV` | 2 | 46 |

The import-test stores contain copies of the preserved dictionary plus intentionally synthetic test candidates; they were not promoted to the authoritative data. Models, translation environments and model-download fragments remain absent. Playwright removed its own transient trace resources after passing tests. Remaining test output and fresh build artifacts are retained as required; no manual cleanup outside the original approved targets was performed.

## Remaining largest files

These are retained current inputs, excluded historical/review material or fresh validation outputs. This table is descriptive and grants no further deletion approval.

| Exact remaining file | Logical bytes | Allocated bytes |
| --- | --- | --- |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-complete\quarantine.jsonl` | 80,688,223 | 80,691,200 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\classified-withheld.jsonl` | 61,222,457 | 61,222,912 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\review-queue.jsonl` | 47,898,384 | 47,898,624 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-v3\review-queue.jsonl` | 47,898,210 | 47,898,624 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run-final\review-queue.jsonl` | 47,897,535 | 47,898,624 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\recovery-outcomes.jsonl` | 41,557,837 | 41,558,016 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\sources\wiktionary-bahasa.json` | 33,898,835 | 33,902,592 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\recovery-withheld.json` | 28,935,501 | 28,938,240 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-recovery\wiktionary-malay.jsonl` | 28,607,738 | 28,610,560 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-qualified\full-scan.jsonl` | 27,455,134 | 27,455,488 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-x3epqE\isolated\store-37beca40675b-1.json` | 21,382,730 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-x3epqE\isolated\store.json` | 21,382,730 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\staged-store.json` | 21,382,270 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-16T01-12-15-252Z\project\scripts\data\malay-translations-v1.json` | 21,382,097 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-DzVPRM\baseline-store.json` | 21,382,097 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-PcsKKY\baseline-store.json` | 21,382,097 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-PCU9nz\baseline-store.json` | 21,382,097 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-import-V0K3nH\baseline-store.json` | 21,382,097 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\scripts\data\malay-translations-v1.json` | 21,382,097 | 21,385,216 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\scripts\data\malay-translations-v1.json` | 20,828,295 | 20,832,256 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.git\objects\pack\pack-a158bf749984fffca03ceef9e9138a4a8309ec4a.pack` | 18,815,933 | 18,817,024 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-offline-import-x3epqE\isolated\runtime.json` | 15,445,496 | 15,446,016 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-lexical-accuracy\run\staged-runtime.json` | 15,445,036 | 15,446,016 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-16T01-12-15-252Z\project\src\data\malay-runtime.json` | 15,445,028 | 15,446,016 |
| `D:\Primary school simulation\mandarin-visual-dictionary\src\data\malay-runtime.json` | 15,445,028 | 15,446,016 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\backups\2026-10-15T23-57-45-678Z\project\src\data\malay-runtime.json` | 15,132,761 | 15,134,720 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\eligible-tasks.jsonl` | 14,689,980 | 14,692,352 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-deep\recovered.json` | 12,025,339 | 12,025,856 |
| `D:\Primary school simulation\mandarin-visual-dictionary\node_modules\@esbuild\win32-x64\esbuild.exe` | 11,694,592 | 11,698,176 |
| `D:\Primary school simulation\mandarin-visual-dictionary\.tmp\malay-datasets\sources\wordnet-definitions.json` | 11,060,191 | 11,063,296 |

## Git, protected files and outstanding scope

Before: main at 38b875aa817d23ea5106c1e2d46a1fd7c316bd03; no tracked changes; only KANJIAN_16GB_STORAGE_AUDIT_AND_CLEANUP_PLAN.md untracked.

After: same branch/HEAD; no tracked edits or deletions; two untracked reports: the intact audit and this execution report. Generated .tmp/dist/cache artifacts remain ignored. Git connectivity passed. No history rewrite, object cleanup, commit, push or Vercel deployment occurred. Remote authentication/live provider billing was not exercised. Future production build inputs remain present, and the normal production build already succeeded after removing the retired resources.

Protected: all accepted Mandarin/English/Malay data, sense/index/search inputs, Malay packaging, Gemini prompts/buttons/server APIs/security/rate limits, Copy Prompt, Pixabay/Openverse/gallery code, offline/service-worker behavior, responsive source, Node dependencies/lockfiles, private credentials, Vercel configuration and Git history. All 2,748 retained original research/backup files checked under the excluded research roots have unchanged identities, sizes and modification times, including all six historical source backups and unique staging alternatives. No alternative was imported or discarded.

The original audit is unchanged at SHA-256 `c23d969bcd790a082411ea57df0f8035c0b77a12d29603ae1c029bb76b666454`. All authoritative raw hashes and complete tracked-tree/semantic fingerprints were rechecked after the full validation and matched. Private configuration values were not printed; their hashes were compared only in memory.

Additional cleanup opportunities require separate approval: the fresh import-test directories and browser helpers/build output listed above; any retained unique staging alternatives/historical backups only after a separate review; shared global caches only after establishing ownership. The old generation aliases/scripts remain tracked because this task prohibited rewriting the translation system; disabling them is a separate source task that must preserve build packaging/tests.

No cleanup blocker remains. The only test limitation is the four opt-in recorded-response replays skipped without supplied recordings. No live paid Gemini call or production website change was used for validation.

Completed: all approved targets removed, existing translations unchanged, normal build and relevant regression checks passed. Newly regenerated artifacts remain for a separately approved decision.
