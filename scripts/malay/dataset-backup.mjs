import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { corpus, auditCorpus, hash } from './corpus.mjs';
import { qualityIssues, runtimeRecord } from './quality.mjs';
import assert from 'node:assert/strict';

// A self-contained snapshot of source/data, never credentials, downloads or Git internals.
export function backupProject(root = '.tmp/malay-datasets/backups/' + new Date().toISOString().replaceAll(/[:.]/g, '-')) {
  const files = [...new Set(execFileSync('git', ['ls-files', '-c', '-o', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean))];
  const data = corpus(), store = JSON.parse(readFileSync('scripts/data/malay-translations-v1.json'));
  const runtime = JSON.parse(readFileSync('src/data/malay-runtime.json'));
  const byKey = new Map(data.senses.map(s => [s.key, s]));
  assert.equal(new Set(store.records.map(r => r.key)).size, store.records.length);
  assert.equal(store.corpusSha256, data.digest);
  assert.deepEqual(runtime.records, store.records.map(runtimeRecord));
  for (const r of store.records) assert.deepEqual(qualityIssues(r, byKey.get(r.key)), []);
  mkdirSync(root, { recursive: true });
  const manifest = { created: new Date().toISOString(), root: resolve(root), baseline: { ...auditCorpus(data), translations: store.records.length, missing: data.senses.length - store.records.length, coveragePercent: store.records.length / data.senses.length * 100 }, files: {} };
  for (const file of files) {
    if (!existsSync(file) || /(?:^|\/)\.env(?:\.|$)|(?:^|\/)(?:\.vercel|\.git)\//.test(file)) continue;
    const bytes = readFileSync(file), dest = resolve(root, 'project', file);
    assert(!relative(resolve(root, 'project'), dest).startsWith('..'));
    mkdirSync(dirname(dest), { recursive: true }); copyFileSync(file, dest);
    assert.equal(hash(readFileSync(dest)), hash(bytes));
    manifest.files[file] = { bytes: bytes.length, sha256: hash(bytes) };
  }
  writeFileSync(resolve(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(resolve(root, 'working-tree.txt'), execFileSync('git', ['status', '--short']));
  writeFileSync(resolve(root, 'RESTORE.txt'), 'Verify manifest SHA-256 values before restoring. The project/ directory contains independent copies of every non-ignored source/data file present at this checkpoint. Restore only intended files with Copy-Item -LiteralPath; do not reset Git. To restore just the dictionary, copy project/public/data/cedict.json, project/cedict.txt.gz, project/scripts/data/malay-translations-v1.json and project/src/data/malay-runtime.json to their original relative paths. Stop the dev server before restoring the paired Malay assets. Model downloads/checkpoints remain untouched in the original .tmp directory.\n');
  return manifest;
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/dataset-backup.mjs')) console.log(JSON.stringify(backupProject(), (k, v) => k === 'files' ? { count: Object.keys(v).length } : v, 2));
