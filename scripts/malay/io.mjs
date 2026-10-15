import { writeFileSync, mkdirSync, renameSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export function atomicJSON(file, value) {
  mkdirSync(resolve(file, '..'), { recursive: true });
  const text = JSON.stringify(value) + '\n';
  // Avoid needless dev-server reloads and transient Windows watcher locks.
  if (existsSync(file) && readFileSync(file, 'utf8') === text) return;
  writeFileSync(file + '.next', text);
  for (let attempt = 0; ; attempt++) {
    try { renameSync(file + '.next', file); return; }
    catch (error) {
      if (!['EPERM','EBUSY','EACCES'].includes(error.code) || attempt === 9) throw error;
      // At most one second; the old destination and recoverable .next remain
      // intact if a reader keeps the file locked. Never delete the old asset.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}
