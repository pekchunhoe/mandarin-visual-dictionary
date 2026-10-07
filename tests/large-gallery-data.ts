import { askingMeaning, px, ov } from './gallery-data';

export const largeGalleryCases = [
  { word: '苹果', meaning: 'apple', scenes: ['apple fruit sliced halves', 'apple fruit basket market', 'person eating apple fruit'] },
  { word: '跑', meaning: 'to run', scenes: ['athlete running track training', 'child running park outdoors', 'woman running trail outdoors'] },
  { word: '害怕', meaning: 'to be afraid; to be scared', scenes: ['afraid person face expression', 'afraid child trembling body language', 'scared person reacting danger'] },
  { word: '帮助', meaning: 'to help', scenes: ['person helping elderly neighbor', 'colleague helping teamwork work', 'student helping learning classroom'] },
  { word: '不耻下问', meaning: askingMeaning, scenes: ['student asking teacher question classroom', 'colleague asking advice office', 'mentor learner learning together sharing knowledge'] },
  { word: '战战兢兢', meaning: 'with fear and trepidation', scenes: ['frightened person facial expression', 'scared child trembling body language', 'fearful person reacting danger'] }
];
// Distinct actors/settings are useful same-facet depth, rather than numbered
// copies of an otherwise identical semantic description.
const contexts = ['beside window morning', 'near doorway evening', 'at table indoors', 'by bridge outdoors', 'on stairs afternoon', 'in garden daylight', 'near station night', 'beside fence sunset', 'at playground summer', 'by lake winter'];
export function largeGalleryRecords(example: typeof largeGalleryCases[number], count = 36, offset = 0) {
  const titles = Array.from({ length: count }, (_, i) => `${example.scenes[i % example.scenes.length]} ${contexts[(Math.floor(i / example.scenes.length) + Math.floor(offset / 100) * 3) % contexts.length]}`);
  return { hits: titles.map((title, i) => px(offset + i + 1, title)), results: titles.map((title, i) => ov(offset + i + 1001, title)) };
}
