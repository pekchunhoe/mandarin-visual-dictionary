import type { SentenceResult, RelationResult } from '../src/lib/ai-teacher-schema';

// Editorial regression fixtures, NOT live Gemini outputs or proof of model accuracy.
export const unnecessaryAddition: SentenceResult = { word: '画蛇添足', sentences: [
  { chinese: '这张海报已经很清楚了，再加一段说明反而画蛇添足。', english: 'This poster is already clear; adding another explanation would only spoil it.', malay: 'Poster ini sudah jelas; penerangan tambahan yang tidak perlu hanya akan menjejaskan hasilnya.' },
  { chinese: '答案本来是对的，你却改错了，真是画蛇添足。', english: 'The answer was right, but you changed it and made it wrong; the unnecessary change spoiled it.', malay: 'Jawapan itu pada asalnya betul, tetapi kamu mengubahnya hingga menjadi salah; perubahan yang tidak perlu itu merosakkan hasilnya.' },
  { chinese: '这幅画已经很美了，再添几笔恐怕是画蛇添足。', english: 'This painting is already beautiful; a few extra strokes might spoil it.', malay: 'Lukisan ini sudah cantik; beberapa coretan tambahan mungkin akan merosakkannya.' },
] };
export const remedyMistake: SentenceResult = { word: '亡羊补牢', sentences: [
  { chinese: '这次考试没考好，现在认真复习，还算亡羊补牢。', english: 'This exam did not go well, but studying seriously now can still help put things right.', malay: 'Keputusan peperiksaan kali ini kurang baik, tetapi mengulang kaji dengan bersungguh-sungguh sekarang masih boleh membantu memperbaiki keadaan.' },
  { chinese: '家里失窃后，他及时换锁，也算亡羊补牢。', english: 'After his house was burgled, he promptly changed the locks to prevent it from happening again.', malay: 'Selepas rumahnya dimasuki pencuri, dia segera menukar kunci untuk mengelakkan kejadian itu berulang.' },
  { chinese: '虽然已经出错，现在改正也算亡羊补牢。', english: 'Although a mistake has already been made, correcting it now can still prevent further problems.', malay: 'Walaupun kesilapan sudah berlaku, membetulkannya sekarang masih dapat mengelakkan masalah seterusnya.' },
] };
export const switchOn: SentenceResult = { word: '开', sentences: [
  { chinese: '请开灯，房间里有点暗。', english: 'Please turn on the light; the room is a little dark.', malay: 'Sila pasang lampu; bilik ini agak gelap.' },
  { chinese: '天气太热了，我们开风扇吧。', english: 'It is too hot; let us switch on the fan.', malay: 'Cuaca terlalu panas; mari kita pasang kipas.' },
  { chinese: '上课前，老师先开投影仪。', english: 'Before class, the teacher switches on the projector.', malay: 'Sebelum kelas bermula, cikgu memasang projektor.' },
] };
export const happyRelations: RelationResult = { word: '高兴', synonyms: [
  { chinese: '开心', english: 'happy', malay: 'gembira' },
  { chinese: '快乐', english: 'happy', malay: 'gembira' },
  { chinese: '愉快', english: 'cheerful', malay: 'riang' },
  { chinese: '欢喜', english: 'delighted', malay: 'gembira' },
  { chinese: '喜悦', english: 'joyful', malay: 'sukacita' },
  { chinese: '欣喜', english: 'delighted', malay: 'sangat gembira' },
  { chinese: '欢快', english: 'lively and cheerful', malay: 'riang gembira' },
  { chinese: '快活', english: 'happy and carefree', malay: 'gembira dan senang hati' },
  { chinese: '愉悦', english: 'pleased', malay: 'senang hati' },
  { chinese: '欢欣', english: 'jubilant', malay: 'sangat gembira' },
], antonyms: [
  { chinese: '难过', english: 'sad', malay: 'sedih' },
  { chinese: '悲伤', english: 'sorrowful', malay: 'sedih' },
  { chinese: '不快', english: 'unhappy', malay: 'tidak senang hati' },
] };
export const idiomCases = [
  { id: '画蛇添足|畫蛇添足|hua4 she2 tian1 zu2', result: unnecessaryAddition },
  { id: '亡羊补牢|亡羊補牢|wang2 yang2 bu3 lao2', result: remedyMistake },
];
