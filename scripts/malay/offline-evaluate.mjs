import { readFileSync, writeFileSync } from 'node:fs';
import { loadRun } from './offline-prepare.mjs';
import { qualifyOffline, offlinePolicy } from './offline-quality.mjs';
import { atomicJSON } from './io.mjs';
const root = '.tmp/malay-complete';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
// These flags record the assistant's actual reading of the displayed outputs,
// not an automatic similarity score or an independent human review.
const flaggedHplt = new Set([5,7,8,10,11,13,15,17,18,19,21,22,23,24,25,27,28,29,30,31,32,33,34,35,36,37,38,39,40,42,44,45,46,47,48,49,51,54,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,81,86,102,103,104,113,118,119,123,124,128,133,136,138,142,148,153,155,158,161,162,163,164,165,166,167,169,170,172,174,175,176,178,186,189,193,196,197,203,205,208,218,220,221,225,226,228,229,230,231,233,234,235,236,238,244,248,250,253,254,262,264,265,266,267,271,273,276,277,279]);
const flaggedM2m = new Set([6,7,10,11,13,15,17,18,21,22,24,25,27,28,29,30,31,32,33,34,35,36,38,39,41,42,43,44,47,48,49,51,54,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,81,83,85,87,89,90,98,102,103,104,106,109,118,119,126,133,135,136,138,141,148,153,157,163,167,168,189,197,198,209,211,213,214,215,216,220,221,226,229,234,236,237,243,244,248,250,253,257,260,264,266,267,272,273,276,277,278]);
const notes = {
  6: 'M2M100 rendered boiling as drinking. HPLT retained mendidih.',
  8: 'HPLT selected temporal lama for spatial long; no unrestricted word-only reuse.',
  19: 'HPLT produced Spontan for semiconductor; M2M100 produced semikonduktor.',
  31: 'HPLT produced corrupt repeated symbols for the figurative expression.',
  138: 'Both models selected cepat (fast speed) for fasting; must be withheld.',
  189: 'HPLT generated BookingSuite advertising/copyright text unrelated to prestige.',
  211: 'M2M100 selected kacang for garlic; HPLT produced bawang putih.',
  250: 'HPLT produced an unrelated anatomical term for blanket; M2M100 gave clothing. Neither qualifies.',
  260: 'M2M100 selected teka-teki (riddle) for axe; HPLT produced kapak.'
};
const panel = read('scripts/data/malay-offline-benchmark.json');
const policy = offlinePolicy();
const runs = ['pilot-hplt-v3', 'pilot-hplt-beam1', 'pilot-m2m100-v3', 'pilot-hplt-fp32', 'pilot-hplt-cuda11', 'pilot-hplt-cuda-fp32'].map(name => ({ name, ...loadRun(`${root}/${name}`, `${root}/pilot.jsonl`) }));
const summaries = runs.map(run => {
  const model = { ...run.checkpoint.identity, license: run.name.includes('m2m') ? 'MIT' : 'CC-BY-4.0' };
  return { name: run.name, model, seconds: run.checkpoint.inferenceSeconds, peakRssBytes: run.checkpoint.peakRssBytes,
    sensesPerSecond: run.rows.length / run.checkpoint.inferenceSeconds, cases: run.rows.length,
    structurallyFlagged: run.rows.filter(r => r.issues.length).length,
    exactDraftOrLicensedReferenceMatches: run.rows.filter((r, i) => run.tasks[i].references.some(s => r.text.toLowerCase().replace(/^untuk /, '') === s.toLowerCase())).length,
    passingConcordanceFilter: run.tasks.filter((t, i) => qualifyOffline(t, run.rows[i], model, policy).record).length };
});
const cases = panel.cases.map((c, i) => ({ ...c, input: runs[0].tasks[i].input,
  outputs: runs.map(run => ({ engine: run.name, ...run.rows[i], qualificationIssues: qualifyOffline(run.tasks[i], run.rows[i], { ...run.checkpoint.identity, license: run.name.includes('m2m') ? 'MIT' : 'CC-BY-4.0' }, policy).issues ?? [] })),
  assistantAssessment: i < 280 ? {
    reviewerRole: 'AI assistant; not an independent Mandarin–Malay human reviewer',
    hpltBeam4: flaggedHplt.has(i) ? 'flagged-error-or-localization-review' : 'no-obvious-error-found-provisional-only',
    m2m100: flaggedM2m.has(i) ? 'flagged-error-or-localization-review' : 'no-obvious-error-found-provisional-only', notes: notes[i] ?? 'Examined complete model output against the original sense and available references; no human approval claimed.'
  } : { reviewerRole: 'awaiting independent review', assessment: 'reference-and-structural-comparison-only' },
  independentHumanApproval: false, independentReviewer: '', independentReviewNotes: '' }));
const annotations = loadRun(`${root}/surname-hplt`, `${root}/surname-tasks.jsonl`);
const annotationPilot = annotations.rows.slice(0, 200).map((o, i) => ({ key: annotations.tasks[i].key, simplified: annotations.tasks[i].simplified,
  english: annotations.tasks[i].english, input: annotations.tasks[i].input, output: o.text,
  qualificationIssues: qualifyOffline(annotations.tasks[i], o, { ...annotations.checkpoint.identity, license: 'CC-BY-4.0' }, policy).issues ?? [],
  reference: read('scripts/data/malay-offline-templates.json').surname, independentHumanApproval: false, independentReviewer: '' }));
atomicJSON('scripts/data/malay-offline-evaluation.json', { schema: 1, sourcePanelDigest: panel.digest, corpusSha256: panel.corpusSha256,
  referencePolicy: panel.referencePolicy, caseCount: cases.length, licensedReferenceCases: 300, assistantInspectedCases: 280,
  independentHumanReviewedCases: 0, warning: 'Reference matching, model agreement and assistant screening are not semantic proof or independent human review. General unrestricted bulk import failed the pilot.',
  summaries, cases, annotationPilot: { cases: annotationPilot, qualified: annotationPilot.filter(c => !c.qualificationIssues.length).length,
    independentHumanReviewedCases: 0, note: 'Additional restricted annotation pilot; exact licensed prefix plus unchanged name is required. Generic name, translated or omitted names, and extra claims are withheld.' } });
writeFileSync(`${root}/independent-review-template.json`, JSON.stringify({ instructions: 'An independent Mandarin–Malay reviewer must check the exact sense, Malaysian grammar, terminology, and context; fill reviewer identity before approval.', cases: cases.map(c => ({ key: c.key, simplified: c.simplified, pinyin: c.pinyin, english: c.english, category: c.category, references: c.references, referenceEvidence: c.referenceEvidence, outputs: c.outputs.map(o => ({ engine: o.engine, text: o.text })), reviewer: '', humanApproved: false, notes: '' })) }, null, 2));
console.log(JSON.stringify({ summaries, assistantInspectedCases: 280, independentHumanReviewedCases: 0 }, null, 2));
