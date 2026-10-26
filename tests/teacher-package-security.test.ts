// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
// @ts-expect-error Native build-time ESM helper.
import { hasGitMetadata, verifyPackageSecurity } from '../scripts/verify-package-security.mjs';

const roots: string[] = [];
function fixture(parent = tmpdir()) {
  const root = mkdtempSync(join(parent, 'kanjian-package-security-')); roots.push(root);
  for (const folder of ['src', 'server', 'api', 'scripts', 'tests', 'public', 'dist']) mkdirSync(join(root, folder));
  writeFileSync(join(root, '.gitignore'), '.env.local\n.env*\n!.env.example\n');
  writeFileSync(join(root, '.vercelignore'), '.git/\n.env\n.env.local\n.env.*.local\n');
  writeFileSync(join(root, '.env.example'), '# Empty server placeholders\nGEMINI_API_KEY=\nPIXABAY_API_KEY=\nOPENVERSE_CLIENT_SECRET=\n');
  writeFileSync(join(root, 'src', 'main.ts'), 'export const safe = true;');
  writeFileSync(join(root, 'dist', 'index.html'), '<main>Dictionary</main>');
  return root;
}
function put(root: string, path: string, content = '') {
  const target = join(root, path); mkdirSync(resolve(target, '..'), { recursive: true }); writeFileSync(target, content);
}
function git(root: string, args: string[]) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error('Temporary Git fixture command failed');
}
afterEach(() => {
  for (const root of roots.splice(0)) {
    // Check absolute deletion targets: only uniquely created fixture directories.
    const target = resolve(root), allowed = [resolve(tmpdir()), resolve('.tmp')];
    if (!allowed.some(parent => target.startsWith(parent + sep)) || !target.includes('kanjian-package-security-')) throw new Error('Unsafe fixture cleanup path');
    rmSync(target, { recursive: true, force: true });
  }
});

describe('Git metadata capability detection', () => {
  it('passes a clean metadata-free Vercel-style build', () => {
    const root = fixture(); expect(hasGitMetadata(root)).toBe(false);
    expect(verifyPackageSecurity({ root }).gitMetadata).toBe(false);
  });
  it('handles an existing empty .git directory without running Git security commands', () => {
    const root = fixture(); mkdirSync(join(root, '.git'));
    const runGit = vi.fn(spawnSync);
    expect(verifyPackageSecurity({ root, runGit }).gitMetadata).toBe(false);
    expect(runGit.mock.calls).toHaveLength(1); expect(runGit.mock.calls[0][1]).toEqual(['rev-parse', '--show-toplevel']);
  });
  it('handles a dangling .git file, reproducing the failing deployment guard', () => {
    const root = fixture(); put(root, '.git', 'gitdir: unavailable-metadata\n');
    expect(verifyPackageSecurity({ root }).gitMetadata).toBe(false);
  });
  it('does not mistake an ancestor repository for the build checkout', () => {
    const root = fixture(resolve('.tmp'));
    expect(hasGitMetadata(root)).toBe(false); expect(verifyPackageSecurity({ root }).gitMetadata).toBe(false);
  });
  it('continues mandatory filesystem checks when Git cannot be launched', () => {
    const root = fixture();
    const runGit = vi.fn(() => ({ error: new Error('Git is unavailable'), status: null, stdout: '', stderr: '' }));
    expect(verifyPackageSecurity({ root, runGit }).gitMetadata).toBe(false); expect(runGit).toHaveBeenCalledTimes(1);
    put(root, 'dist/.env.local');
    expect(() => verifyPackageSecurity({ root, runGit })).toThrow('private environment file');
  });
  it('preserves Git ignore and tracked-file checks in a genuine checkout', () => {
    const root = fixture(); git(root, ['init', '--quiet']);
    const runGit = vi.fn(spawnSync);
    expect(verifyPackageSecurity({ root, runGit }).gitMetadata).toBe(true);
    expect(runGit.mock.calls.map(call => call[1])).toEqual([
      ['rev-parse', '--show-toplevel'], ['check-ignore', '--', '.env.local'], ['ls-files', '-z'],
    ]);
  });
  it('rejects local ignore negation instead of silently falling back', () => {
    const root = fixture(); git(root, ['init', '--quiet']);
    put(root, '.gitignore', '.env.local\n.env*\n!.env.local\n');
    expect(() => verifyPackageSecurity({ root })).toThrow('Git must ignore');
  });
  it.each(['.env.production', 'nested/.env.local'])('rejects tracked private environment files: %s', path => {
    const root = fixture(); git(root, ['init', '--quiet']); put(root, path, 'GEMINI_API_KEY=fixture-only\n'); git(root, ['add', '-f', '--', path]);
    expect(() => verifyPackageSecurity({ root })).toThrow('private environment file is tracked');
  });
});

describe('filesystem and deployment artifact checks without Git', () => {
  it.each(['dist/.env', 'dist/.env.local', 'dist/nested/.env.production.local', 'public/.env.production', 'src/.env.local', 'server/.env.local', 'api/.env', 'scripts/data/.env.production', 'tests/.env.local', '.vercel/output/functions/teacher.func/.env.local'])('rejects sensitive files even without a configured key: %s', path => {
    const root = fixture(); put(root, path);
    expect(() => verifyPackageSecurity({ root })).toThrow('private environment file');
  });
  it('rejects Git metadata inside generated assets', () => {
    const root = fixture(); put(root, 'dist/.git/config');
    expect(() => verifyPackageSecurity({ root })).toThrow('Git metadata');
  });
  it('allows root-only local configuration without modifying or packaging it', () => {
    const root = fixture(); put(root, '.env.local', 'GEMINI_API_KEY=root-only-fixture-secret\n');
    const before = readFileSync(join(root, '.env.local'));
    expect(verifyPackageSecurity({ root, environment: { GEMINI_API_KEY: 'root-only-fixture-secret' } }).gitMetadata).toBe(false);
    expect(readFileSync(join(root, '.env.local'))).toEqual(before);
  });
  it.each(['GEMINI_API_KEY', 'PIXABAY_API_KEY', 'PEXELS_API_KEY', 'OPENVERSE_CLIENT_ID', 'OPENVERSE_CLIENT_SECRET'])('rejects leaked %s values, raw or URL encoded, without exposing them in errors', name => {
    const root = fixture(), secret = 'fixture-secret-with-a-space /?+';
    for (const value of [secret, encodeURIComponent(secret)]) {
      put(root, 'dist/asset-without-an-extension', value);
      let caught: unknown;
      try { verifyPackageSecurity({ root, environment: { [name]: secret } }); } catch (error) { caught = error; }
      expect(caught).toBeInstanceOf(Error); expect(String(caught)).toContain('configured credential'); expect(String(caught)).not.toContain(secret); expect(String(caught)).not.toContain(encodeURIComponent(secret));
    }
  });
  it.each(['public/assets/image.dat', 'server/service.mjs', 'api/handler.js', '.vercel/output/static/main.js'])('scans public, runtime and Vercel artifacts for credential values: %s', path => {
    const root = fixture(); put(root, path, 'trimmed-fixture-secret');
    expect(() => verifyPackageSecurity({ root, environment: { GEMINI_API_KEY: '  trimmed-fixture-secret  ' } })).toThrow('configured credential');
  });
  it('rejects populated environment examples even when no key is configured', () => {
    const root = fixture(); put(root, '.env.example', 'GEMINI_API_KEY=some-unconfigured-secret\n');
    expect(() => verifyPackageSecurity({ root })).toThrow('empty placeholders');
  });
  it('keeps ignore-file protections mandatory when metadata is unavailable', () => {
    const root = fixture(); put(root, '.gitignore', 'node_modules/\n');
    expect(() => verifyPackageSecurity({ root })).toThrow('must be ignored');
  });
  it.each(['.git/\n', '.env.local\n'])('rejects removed Vercel upload exclusions: %s', contents => {
    const root = fixture(); put(root, '.vercelignore', contents);
    expect(() => verifyPackageSecurity({ root })).toThrow('Vercel uploads');
  });
});
