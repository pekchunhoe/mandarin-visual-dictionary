import assert from 'node:assert/strict';
import { lstatSync, readFileSync, readdirSync, realpathSync, existsSync } from 'node:fs';
import { basename, join, resolve, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const privateEnvName = name => /^\.env/i.test(name) && name !== '.env.example';
const canonical = path => {
  const value = realpathSync(path);
  return process.platform === 'win32' ? value.toLowerCase() : value;
};

/** A .git path can be empty, inaccessible, or a dangling worktree pointer. */
export function hasGitMetadata(root, runGit = spawnSync) {
  try {
    const probe = runGit('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return !probe.error && probe.status === 0 && canonical(probe.stdout.trim()) === canonical(root);
  } catch { return false; }
}

function walk(directory) {
  const files = [];
  assert(!lstatSync(directory).isSymbolicLink(), 'A package directory must not be a symbolic link.');
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    assert(!item.isSymbolicLink(), 'A package file must not be a symbolic link.');
    assert(item.name !== '.git', 'Git metadata must not appear in application artifacts.');
    if (item.isDirectory()) files.push(...walk(path));
    else {
      assert(!privateEnvName(item.name), 'A private environment file appears in source or deployment artifacts.');
      files.push(path);
    }
  }
  return files;
}

function verifyEmptyExample(path) {
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith('#')) continue;
    assert(/^[A-Za-z_][\w]*=\s*$/.test(text), 'Environment examples must contain only empty placeholders.');
  }
}

/** Security checks are mandatory in both Git checkouts and metadata-free builds. */
export function verifyPackageSecurity({ root = process.cwd(), environment = {}, runGit = spawnSync } = {}) {
  root = resolve(root);
  const ignore = readFileSync(join(root, '.gitignore'), 'utf8').split(/\r?\n/);
  assert(ignore.includes('.env.local'), 'Private environment files must be ignored.');
  // Local root env files are build inputs, not runtime/public assets. Keep their
  // upload exclusions intact even when Git cannot evaluate ignore rules.
  if (existsSync(join(root, '.vercelignore'))) {
    const uploadIgnore = readFileSync(join(root, '.vercelignore'), 'utf8').split(/\r?\n/).map(line => line.trim());
    assert(uploadIgnore.includes('.git/') || uploadIgnore.includes('.git'), 'Vercel uploads must exclude Git metadata.');
    assert(uploadIgnore.includes('.env.local') || uploadIgnore.includes('.env*'), 'Vercel uploads must exclude local environment files.');
  }

  const gitMetadata = hasGitMetadata(root, runGit);
  if (gitMetadata) {
    const ignored = runGit('git', ['check-ignore', '--', '.env.local'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    assert(!ignored.error && ignored.status === 0, 'Git must ignore local environment files.');
    const tracked = runGit('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    assert(!tracked.error && tracked.status === 0, 'Git tracked-file security verification failed.');
    assert(tracked.stdout.split('\0').filter(path => /^\.env/i.test(basename(path))).every(path => path === '.env.example'), 'A private environment file is tracked.');
  }

  // Public inputs are checked before copying and dist is checked after building.
  // Include Vercel's final output when available, plus function/source trees.
  const roots = ['src', 'server', 'api', 'scripts', 'tests', 'public', 'dist', '.vercel/output'];
  const files = roots.flatMap(folder => existsSync(join(root, folder)) ? walk(join(root, folder)) : []);
  const example = join(root, '.env.example');
  if (existsSync(example)) files.push(example);
  const credentials = [...new Set(Object.values(environment).filter(value => typeof value === 'string' && value.trim().length >= 8).flatMap(value => [value, value.trim(), encodeURIComponent(value), encodeURIComponent(value.trim())]))].map(value => Buffer.from(value));
  for (const file of files) {
    if (basename(file) === '.env.example') verifyEmptyExample(file);
    // Retain the existing corpus/research-data scan exclusion. Their filenames
    // were still inspected above; all public/dist/runtime output is scanned.
    if (relative(root, file).startsWith(`scripts${sep}data${sep}`)) continue;
    const source = readFileSync(file);
    assert(!credentials.some(value => source.includes(value)), 'A configured credential appears in source or generated assets.');
  }
  return { gitMetadata, scannedFiles: files.length };
}
