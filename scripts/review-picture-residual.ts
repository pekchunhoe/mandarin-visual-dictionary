import { readFileSync, writeFileSync } from 'node:fs';
import { inferVisualIntent } from '../src/lib/visual-inference';
import { metadataExclusion } from '../src/lib/visual-exclusions';
const baseline = JSON.parse(readFileSync('scripts/data/picture-coverage-baseline.json', 'utf8'));
const remaining = baseline.filter((r: { english: string }) => !inferVisualIntent(r.english) && !metadataExclusion(r.english));
const decisions = baseline.map((r: { english: string }) => {
  const plan = inferVisualIntent(r.english);
  return { ...r, decision: plan ? 'VALID_VISUAL_PLAN' : metadataExclusion(r.english) ? 'EXPLICIT_POLICY_EXCLUSION' : 'UNRESOLVED', query: plan?.query, reason: plan ? undefined : metadataExclusion(r.english) };
});
const clusters: Record<string, { before: number; plans: number; exclusions: number; remaining: number }> = {};
for (const r of baseline) {
  const c = clusters[r.cluster] ??= { before: 0, plans: 0, exclusions: 0, remaining: 0 };
  c.before++;
  if (inferVisualIntent(r.english)) c.plans++; else if (metadataExclusion(r.english)) c.exclusions++; else c.remaining++;
}
writeFileSync('.tmp/picture-residual.json', JSON.stringify(remaining, null, 2));
writeFileSync('.tmp/picture-baseline-decisions.json', JSON.stringify(decisions, null, 2));
const summary = JSON.stringify({ remaining: remaining.length, clusters }, null, 2);
writeFileSync('.tmp/zero-gap-clusters.json', summary);
console.log(summary);
if (baseline.length !== 3885 || remaining.length) process.exitCode = 1;
