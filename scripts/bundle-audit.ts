import { mkdirSync, writeFileSync } from 'node:fs';
import type { Plugin } from 'vite';
// Build-time evidence only: never shipped with the application.
export function bundleAudit(name: string): Plugin {
  return { name: 'bundle-audit-' + name, generateBundle(_, bundle) {
    mkdirSync('.tmp', { recursive: true });
    writeFileSync(`.tmp/${name}-bundle-graph.json`, JSON.stringify(Object.values(bundle).map(item => item.type === 'chunk'
      ? { file: item.fileName, entry: item.isEntry, imports: item.imports, dynamicImports: item.dynamicImports, modules: Object.keys(item.modules) }
      : { file: item.fileName, asset: true }), null, 2));
  } };
}
