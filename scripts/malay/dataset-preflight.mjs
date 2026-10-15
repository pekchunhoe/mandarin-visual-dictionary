import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
const git = args => execFileSync('git', args, { encoding: 'utf8' });
const pending = [...new Set(git(['ls-files', '-m', '-o', '--exclude-standard', '-z']).split('\0').filter(Boolean))];
// Preserve these unfinished experiments in the worktree; they are not needed
// for the tested application release or its deterministic dataset importer.
const excluded = file => /^scripts\/malay\/(?:recovery-|adapt-madlad-gguf|inspect-gguf)/.test(file)
  || /^scripts\/data\/(?:malay-recovery-|malay-translation-memory-v1\.json)/.test(file);
const files = pending.filter(file => !excluded(file));
for (const file of files) {
  assert(!/^(?:\.tmp|\.vercel|node_modules|test-results|dist)\//.test(file), `Excluded directory: ${file}`);
  assert(!/(?:^|\/)\.env(?!\.example$)/.test(file), `Environment file: ${file}`);
  assert(!/200k-english-malay|cambridge-english-malaysian|Kamus_Dewan|dbp\.zip/.test(file), `Restricted dataset: ${file}`);
  const bytes = readFileSync(file);
  assert(bytes.length < 8 * 1024 * 1024, `Unexpected large addition: ${file}`);
  const text = bytes.toString('utf8');
  assert(!/BEGIN [A-Z ]*PRIVATE KEY|gh[pousr]_[a-zA-Z0-9]{20}|github_pat_[a-zA-Z0-9_]{20}|AKIA[0-9A-Z]{16}/.test(text), `Potential credential: ${file}`);
}
writeFileSync('.tmp/malay-datasets/release-paths.nul', files.join('\0') + '\0');
writeFileSync('.tmp/malay-datasets/release-preflight.json', JSON.stringify({ files: files.map(file => ({ file, bytes: statSync(file).size })), preservedUnfinished: pending.filter(excluded) }, null, 2) + '\n');
console.log(JSON.stringify({ releaseFiles: files.length, preservedUnfinished: pending.filter(excluded), largest: files.map(file => ({ file, bytes: statSync(file).size })).sort((a, b) => b.bytes - a.bytes).slice(0, 6) }, null, 2));
