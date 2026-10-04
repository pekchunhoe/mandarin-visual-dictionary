import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const excluded = new Set(['node_modules', 'dist', '.git', '.tmp', 'test-results', 'playwright-report']);
async function walk(path = '.') { const files = []; for (const entry of await readdir(path, { withFileTypes: true })) { if (excluded.has(entry.name)) continue; const item = `${path}/${entry.name}`; if (entry.isDirectory()) files.push(...await walk(item)); else if (/\.(tsx?|m?js|json|css|md|html|svg|webmanifest)$/.test(entry.name) || ['.env.example','.gitignore','.gitattributes'].includes(entry.name)) files.push(item); } return files; }
let failed = false; const files = await walk();
for (const file of files) { const result = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--check', '--', process.platform === 'win32' ? 'NUL' : '/dev/null', file], { encoding: 'utf8' }); /* --no-index uses exit 1 for a clean added file as well as for differences. */ if (result.error || (result.status ?? 2) > 1 || result.stdout.trim()) { failed = true; console.error(result.stdout || result.stderr || result.error); } }
console.log(`git diff --no-index --check: ${failed ? 'FAIL' : 'PASS'} (${files.length} files; workspace has no Git repository).`);
process.exitCode = failed ? 1 : 0;
