import { fromRow } from '../src/lib/dictionary-entry';
import { byId } from '../src/data/learning';
import { imageSearchPlan } from '../server/image-plan';
import { normalizeOpenverse, normalizePixabay } from '../server/providers';
import type { Photo } from '../src/types';

import { galleryExamples, px, ov } from './gallery-data';
export * from './gallery-data';
export function planFor(english: string) {
  const word = fromRow(['測試', '测试', 'ce4 shi4', [english]]);
  return imageSearchPlan(word, word.senses[0])!;
}
export function examplePool(example: typeof galleryExamples[number]) {
  const word = byId.get(example.word);
  const plan = word ? imageSearchPlan(word, word.senses[0])! : planFor(example.meaning);
  const photos: Photo[] = [
    ...normalizePixabay(Array.from({ length: 6 }, (_, i) => px(i + 1, example.repeated)), plan.primary.query),
    ...normalizePixabay([px(20, example.scenes[0])], plan.primary.query),
    ...normalizeOpenverse(example.scenes.slice(1).map((scene, i) => ov(30 + i, scene)), plan.primary.query)
  ];
  return { plan, photos };
}
