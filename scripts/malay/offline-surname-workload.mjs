import { readFileSync, writeFileSync } from 'node:fs';
import { hash } from './corpus.mjs';
const root = '.tmp/malay-complete';
const tasks = readFileSync(`${root}/tasks.jsonl`, 'utf8').trim().split('\n').map(JSON.parse).filter(t => /^surname [A-Za-z][A-Za-z '-]*$/.test(t.english)).map(t => {
  const input = `Family name: ${t.english.slice(8)}.`;
  return { ...t, originalInferenceKey: t.inferenceKey, input, inferenceKey: hash(JSON.stringify([t.inferenceKey, input, 'surname-definition-template-v1'])) };
});
writeFileSync(`${root}/surname-tasks.jsonl`, tasks.map(t => JSON.stringify(t)).join('\n') + '\n');
console.log(JSON.stringify({ surnameTasks: tasks.length, pilotLimit: 200 }));
