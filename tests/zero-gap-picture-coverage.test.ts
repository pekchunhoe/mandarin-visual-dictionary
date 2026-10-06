// @vitest-environment node
import { expect, it } from 'vitest';
import { inferVisualIntent } from '../src/lib/visual-inference';
import { metadataExclusion } from '../src/lib/visual-exclusions';
import { fromRow } from '../src/lib/dictionary-entry';
import { imageSearchPlan } from '../server/image-plan';
import { imageRelevance } from '../server/visual-search';
import { normalizeOpenverse } from '../server/providers';
import { readFileSync } from 'node:fs';

it.each([
  ['folk songs of the state of Chu 楚國[Chu3 guo2]', /folk songs/],
  ['clock (時鐘[shi2 zhong1])', /clock/],
  ['also written 鐘[zhong1]; a clock', /clock/],
  ['(loanword from French) red apple', /red apple/],
  ['What happened?', /asking question/],
  ['warning shouted to another person', /warning another person/],
  ['Watch out for the ball!', /warning another person/],
  ['one who repairs clocks', /repairing clocks/],
  ['state of being exhausted', /exhausted person resting/],
  ['unable to sleep', /sleepless person lying awake/],
  ['lack of water', /water shortage/],
  ['a person who after years of working in a workshop with many different kinds of tools and equipment, repairs clocks', /repairing clocks/],
  ['If you work at it hard enough, you can grind an iron bar into a needle.', /persevering/],
  ['to 3D print; 3D printing', /3d print|three dimensional printing/],
  ['nitrous oxide N2O', /nitrous oxide/],
  ['copper(II) acetoarsenite Cu(C2H3O2)2·3Cu(AsO2)2', /copper/],
  ['Bodø (city in Norway)', /bodo/],
  ['(jade ring)', /jade ring/],
  ['(onom.) (sound of a bell)', /bell ringing/],
  ['a can (loanword from English "tin")', /tin can container/],
  ['Can the leopard change his spots?', /unchanging personal character/]
])('preserves semantic content in %s', (english, query) => {
  const word = fromRow(['測試', '测试', 'ce4 shi4', [english]]);
  const plan = imageSearchPlan(word, word.senses[0]);
  expect(plan?.primary.query).toMatch(query);
  expect(plan?.candidates.every(c => c.query.length <= 100 && !/[\p{Script=Han}\u0000-\u001f]/u.test(c.query))).toBe(true);
});

it.each([
  ['erhua form of 一下[yi1 xia4]', 'VARIANT_REFERENCE_ONLY'],
  ['(neologism c. 2016)', 'METADATA_ONLY'],
  ['(editorial question: is this spelling correct?)', 'METADATA_ONLY'],
  ['often written as ㄅㄧㄤˋ', 'ORTHOGRAPHIC_NOTE'],
  ['Beijing pr. [zhu2 yi5]', 'PRONUNCIATION_NOTE'],
  ['(loanword from Japanese うｐ主, "upunushi")', 'TRANSLITERATION_ONLY'],
  ['(precise meaning unknown, relates to iron)', 'UNSEARCHABLE_FRAGMENT'],
  ['and; as well as', 'FUNCTION_WORD'],
  ['if and only if', 'NON_VISUAL_LOGICAL_RELATION'],
  ['OK!', 'FUNCTION_WORD']
])('justifies exclusion of %s', (english, reason) => {
  expect(inferVisualIntent(english)).toBeNull();
  expect(metadataExclusion(english)).toBe(reason);
});
it('keeps unreviewed nonsense unresolved, rather than excluding on inference failure', () => {
  expect(inferVisualIntent('@@@ xyz ???')).toBeNull();
  expect(metadataExclusion('@@@ xyz ???')).toBeUndefined();
});
it('accounts for every sense in the independently frozen 3,885-sense residual', () => {
  const baseline: { word: string; english: string }[] = JSON.parse(readFileSync('scripts/data/picture-coverage-baseline.json', 'utf8'));
  expect(baseline).toHaveLength(3885);
  const missing = baseline.filter(record => !inferVisualIntent(record.english) && !metadataExclusion(record.english));
  expect(missing).toEqual([]);
});
it('requires action or state evidence over a generic human portrait', () => {
  for (const english of ['one who repairs clocks', 'warning shouted to another person', 'state of being exhausted']) {
    const word = fromRow(['測試', '测试', 'ce4 shi4', [english]]);
    const plan = imageSearchPlan(word, word.senses[0])!;
    const [photo] = normalizeOpenverse([{ id: 'portrait', title: 'person portrait', url: 'https://example.com/portrait.jpg', width: 900, height: 700, foreign_landing_url: 'https://example.com/portrait', license: 'cc0', license_url: 'https://creativecommons.org/publicdomain/zero/1.0/' }], plan.primary.query);
    expect(imageRelevance(photo, plan).semantic).toBe(false);
  }
});
