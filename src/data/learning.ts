import type { Example, Sense, VisualType, Word } from '../types';
import raw from './cedict-core.json';
import { displayMeaning, toneMarks } from '../lib/dictionary';

type Lesson = [string, string, string, VisualType, string?, string?];
// Editorial learning material, separate from the unchanged CC-CEDICT definitions.
const lessons: Record<string, Lesson> = {
  '苹果': ['Food', 'epal', '一种常见的水果，可以是红色、绿色或黄色。', 'food', 'apple fruit whole sliced orchard', 'apple'],
  '苹果公司': ['People', 'syarikat Apple', '一家制造电脑和手机的公司。', 'abstract'],
  '银行': ['Places', 'bank', '可以存钱、取钱的地方。', 'place', 'bank financial institution building'],
  '猫': ['Animals', 'kucing', '一种会喵喵叫的小动物。', 'animal', 'domestic cat animal', 'cat'],
  '狗': ['Animals', 'anjing', '一种会汪汪叫的动物。', 'animal', 'domestic dog animal', 'dog'],
  '鸟': ['Animals', 'burung', '有羽毛和翅膀的动物。', 'animal', 'bird animal perched', 'bird'],
  '鱼': ['Animals', 'ikan', '生活在水里、用鳃呼吸的动物。', 'animal', 'fish animal underwater', 'fish'],
  '大象': ['Animals', 'gajah', '一种有长鼻子的大动物。', 'animal', 'elephant animal', 'elephant'],
  '兔子': ['Animals', 'arnab', '一种有长耳朵的小动物。', 'animal', 'rabbit animal'],
  '熊猫': ['Animals', 'panda', '一种爱吃竹子的黑白色动物。', 'animal', 'giant panda animal'],
  '香蕉': ['Food', 'pisang', '一种长长的水果，成熟时通常是黄色的。', 'food', 'banana fruit', 'banana'],
  '橙子': ['Food', 'oren', '一种圆圆的、多汁的水果。', 'food', 'orange citrus fruit'],
  '梨': ['Food', 'pir', '一种多汁的水果。', 'food', 'pear fruit'],
  '西瓜': ['Food', 'tembikai', '一种大大的水果，里面通常是红色的。', 'food', 'watermelon fruit sliced', 'watermelon'],
  '米饭': ['Food', 'nasi', '用米和水煮熟的食物。', 'food', 'cooked rice bowl'],
  '面包': ['Food', 'roti', '用面粉等材料烤成的食物。', 'food', 'bread loaf bakery'],
  '水': ['Food', 'air', '我们每天都要喝的液体。', 'food', 'drinking water glass'],
  '牛奶': ['Food', 'susu', '来自奶牛的白色饮品。', 'food', 'milk glass bottle'],
  '飞机': ['Transport', 'kapal terbang', '一种在天空中飞行的交通工具。', 'object', 'passenger airplane flying takeoff', 'airplane'],
  '汽车': ['Transport', 'kereta', '在道路上行驶的交通工具。', 'object', 'car vehicle road', 'car'],
  '自行车': ['Transport', 'basikal', '用脚踩踏板前进的两轮车。', 'object', 'bicycle bike outdoors'],
  '火车': ['Transport', 'kereta api', '在铁轨上行驶的交通工具。', 'object', 'passenger train railway'],
  '房子': ['Home', 'rumah', '人们居住的建筑物。', 'place', 'house home exterior', 'house'],
  '桌子': ['Home', 'meja', '可以在上面吃饭、写字的家具。', 'object', 'wooden table furniture'],
  '椅子': ['Home', 'kerusi', '供人坐的家具。', 'object', 'chair furniture'],
  '雨伞': ['Home', 'payung', '下雨时用来遮雨的东西。', 'object', 'umbrella rain open closed', 'umbrella'],
  '书': ['School', 'buku', '可以阅读和学习的东西。', 'object', 'books reading library', 'book'],
  '学校': ['School', 'sekolah', '学生学习的地方。', 'place', 'school classroom education', 'school'],
  '老师': ['People', 'guru', '帮助学生学习的人。', 'person', 'teacher teaching classroom'],
  '学生': ['People', 'murid', '在学校学习的人。', 'person', 'student studying classroom'],
  '医生': ['People', 'doktor', '帮助病人恢复健康的人。', 'person', 'doctor medical professional', 'doctor'],
  '医院': ['Places', 'hospital', '医生为病人看病的地方。', 'place', 'hospital building healthcare'],
  '跑': ['Actions', 'berlari', '用双脚快速向前移动。', 'action', 'person running action', 'running'],
  '跳': ['Actions', 'melompat', '用脚蹬地，让身体离开地面。', 'action', 'person jumping action'],
  '吃': ['Actions', 'makan', '把食物放进嘴里。', 'action', 'person eating food'],
  '高兴': ['Emotions', 'gembira', '心情很好，感到快乐。', 'emotion', 'happy smiling person', 'happy'],
  '伤心': ['Emotions', 'sedih', '心里难过，不开心。', 'emotion', 'sad person expression'],
  '冷': ['Weather', 'sejuk', '温度低，让人想穿厚衣服。', 'property', 'person feeling cold snowy weather', 'cold'],
  '热': ['Weather', 'panas', '温度高，让人想凉快一下。', 'property', 'hot sunny weather person'],
  '太阳': ['Weather', 'matahari', '给地球带来光和热的星体。', 'object', 'sun sunshine sky'],
  '雨': ['Weather', 'hujan', '从云里落下来的水滴。', 'object', 'rain drops rainy weather'],
  '云': ['Weather', 'awan', '天空中由小水滴或冰晶组成的物体。', 'object', 'clouds blue sky'],
  '树': ['Nature', 'pokok', '有树干和树枝的植物。', 'object', 'tree forest nature', 'tree'],
  '花': ['Nature', 'bunga', '植物上常常有颜色和香味的部分。', 'object', 'flower blossom garden', 'flower'],
  '山': ['Nature', 'gunung', '地面上高高隆起的部分。', 'place', 'mountain landscape'],
  '海': ['Nature', 'laut', '大片的咸水水域。', 'place', 'sea ocean water'],
  '水果': ['Food', 'buah-buahan', '苹果、香蕉等植物的果实，可以食用。', 'food', 'mixed fresh fruits'],
  '因为': ['Connections', 'kerana', '用来说明事情发生的原因。', 'abstract'],
  '虽然': ['Connections', 'walaupun', '先说一个情况，再说与预期不同的结果。', 'abstract'],
  '已经': ['Connections', 'sudah', '表示事情在这以前发生了。', 'abstract'],
  '但是': ['Connections', 'tetapi', '连接两个意思有转折的部分。', 'abstract'],
  '可能': ['Connections', 'mungkin', '表示事情也许会发生。', 'abstract'],
  '如果': ['Connections', 'jika', '提出一个条件，再说明结果。', 'abstract'],
  '开': ['Actions', 'membuka', '让关着的东西打开。', 'action', 'person opening door']
};
const ex = (chinese: string, pinyin: string, english: string, malay: string): Example => ({ chinese, pinyin, english, malay });
const examples: Record<string, Example[]> = {
  '苹果': [ex('我每天吃一个苹果。', 'Wǒ měitiān chī yí ge píngguǒ.', 'I eat an apple every day.', 'Saya makan sebiji epal setiap hari.'), ex('这个苹果又大又红。', 'Zhè ge píngguǒ yòu dà yòu hóng.', 'This apple is big and red.', 'Epal ini besar dan merah.')],
  '猫': [ex('这只猫在睡觉。', 'Zhè zhī māo zài shuìjiào.', 'This cat is sleeping.', 'Kucing ini sedang tidur.'), ex('我喜欢猫。', 'Wǒ xǐhuan māo.', 'I like cats.', 'Saya suka kucing.')],
  '银行': [ex('妈妈去银行存钱。', 'Māma qù yínháng cún qián.', 'Mum goes to the bank to deposit money.', 'Ibu pergi ke bank untuk menyimpan wang.'), ex('银行在学校旁边。', 'Yínháng zài xuéxiào pángbiān.', 'The bank is next to the school.', 'Bank itu di sebelah sekolah.')],
  '跑': [ex('他在公园里跑步。', 'Tā zài gōngyuán lǐ pǎobù.', 'He is running in the park.', 'Dia sedang berlari di taman.'), ex('小狗跑得很快。', 'Xiǎogǒu pǎo de hěn kuài.', 'The puppy runs very fast.', 'Anak anjing itu berlari dengan sangat pantas.')],
  '高兴': [ex('见到你，我很高兴。', 'Jiàndào nǐ, wǒ hěn gāoxìng.', 'I am happy to see you.', 'Saya gembira berjumpa dengan kamu.'), ex('她高兴地笑了。', 'Tā gāoxìng de xiào le.', 'She smiled happily.', 'Dia tersenyum dengan gembira.')],
  '冷': [ex('今天很冷。', 'Jīntiān hěn lěng.', 'It is cold today.', 'Hari ini sangat sejuk.'), ex('水太冷了。', 'Shuǐ tài lěng le.', 'The water is too cold.', 'Air itu terlalu sejuk.')],
  '医生': [ex('医生帮助生病的人。', 'Yīshēng bāngzhù shēngbìng de rén.', 'Doctors help people who are ill.', 'Doktor membantu orang yang sakit.'), ex('我想当医生。', 'Wǒ xiǎng dāng yīshēng.', 'I want to be a doctor.', 'Saya mahu menjadi doktor.')],
  '飞机': [ex('飞机在天上飞。', 'Fēijī zài tiānshang fēi.', 'The airplane is flying in the sky.', 'Kapal terbang sedang terbang di langit.'), ex('我们坐飞机去旅行。', 'Wǒmen zuò fēijī qù lǚxíng.', 'We travel by airplane.', 'Kami pergi melancong dengan kapal terbang.')],
  '雨伞': [ex('下雨了，请带雨伞。', 'Xià yǔ le, qǐng dài yǔsǎn.', 'It is raining. Please take an umbrella.', 'Hari hujan. Sila bawa payung.'), ex('这是我的雨伞。', 'Zhè shì wǒ de yǔsǎn.', 'This is my umbrella.', 'Ini payung saya.')],
  '因为': [ex('因为下雨，所以我们在家看书。', 'Yīnwèi xià yǔ, suǒyǐ wǒmen zài jiā kàn shū.', 'Because it is raining, we are reading at home.', 'Kerana hujan, kami membaca buku di rumah.')],
  '虽然': [ex('虽然下雨，但是我们还是去学校。', 'Suīrán xià yǔ, dànshì wǒmen háishi qù xuéxiào.', 'Although it is raining, we still go to school.', 'Walaupun hujan, kami tetap pergi ke sekolah.')],
  '已经': [ex('我已经吃饭了。', 'Wǒ yǐjīng chī fàn le.', 'I have already eaten.', 'Saya sudah makan.')],
  '但是': [ex('我想出去，但是下雨了。', 'Wǒ xiǎng chūqù, dànshì xià yǔ le.', 'I want to go out, but it is raining.', 'Saya mahu keluar, tetapi hari hujan.')],
  '可能': [ex('明天可能会下雨。', 'Míngtiān kěnéng huì xià yǔ.', 'It may rain tomorrow.', 'Esok mungkin hujan.')],
  '如果': [ex('如果下雨，我们就在家看书。', 'Rúguǒ xià yǔ, wǒmen jiù zài jiā kàn shū.', 'If it rains, we will read at home.', 'Jika hujan, kami akan membaca buku di rumah.')]
};
const relationships: Record<string, [string, string, string]> = {
  '因为': ['下雨 · It is raining', '因为 → 所以 / cause → result', '在家看书 · Read at home'],
  '虽然': ['下雨 · It is raining', '虽然 → 但是 / unexpected result', '去学校 · Go to school anyway'],
  '已经': ['以前 · Before', '已经 / already happened', '吃完饭了 · Finished eating'],
  '但是': ['想出去 · Want to go out', '但是 / but', '下雨了 · It is raining'],
  '可能': ['明天 · Tomorrow', '可能 / perhaps', '会下雨？ · Will it rain?'],
  '如果': ['如果下雨 · If it rains', '如果 → 就 / condition → result', '在家看书 · Read at home']
};
export type RawRow = [string, string, string, string[]];
export function fromRow(row: RawRow): Word {
  const [traditional, simplified, numericPinyin, definitions] = row;
  return { id: `${simplified}|${traditional}|${numericPinyin}`, simplified, traditional, numericPinyin, pinyin: toneMarks(numericPinyin), source: 'CC-CEDICT', senses: definitions.filter(d => !d.startsWith('CL:')).map((english, i) => ({ id: `sense-${i}`, english: displayMeaning(english), visualType: 'abstract', examples: [] })) };
}
export const words: Word[] = Object.entries(lessons).flatMap(([chinese, lesson]) => {
  const rows = (raw as RawRow[]).filter(r => r[1] === chinese);
  const preferred: Record<string, string> = { '苹果': 'ping2 guo3', '跑': 'pao3', '书': 'shu1', '云': 'yun2', '鸟': 'niao3' };
  const row = rows.find(r => r[2] === preferred[chinese] && !/^\(classical\)/.test(r[3][0])) ?? rows.find(r => !/surname|variant of|see |abbr\. for|\(classical\)/i.test(r[3][0])) ?? rows[0];
  if (!row) return [];
  const word = fromRow(row); const [category, malay, explanation, visualType, visualQuery, photo] = lesson;
  if (chinese === '热') word.senses.sort((a, b) => Number(b.english.startsWith('hot')) - Number(a.english.startsWith('hot')));
  if (chinese === '兔子') word.senses.sort((a, b) => Number(b.english === 'rabbit') - Number(a.english === 'rabbit'));
  const base = word.senses[0];
  // Enrich only the selected first sense. Unrelated dictionary senses retain independent IDs and no photo query.
  word.senses[0] = { ...base, malay, chineseExplanation: explanation, visualType, visualQuery, examples: examples[chinese] ?? [], relationship: relationships[chinese] };
  if (chinese === '开') {
    const opening = word.senses.find(s => /^to open/.test(s.english));
    const operating = word.senses.find(s => /to turn on/.test(s.english));
    if (opening && operating) word.senses = [
      { ...opening, malay: 'membuka', visualType: 'action', visualQuery: 'person opening door', chineseExplanation: explanation, examples: [ex('请开门。','Qǐng kāi mén.','Please open the door.','Sila buka pintu.')] },
      { ...operating, malay: 'menghidupkan', visualType: 'action', visualQuery: 'person turning on light switch', chineseExplanation: '让机器、电灯等开始工作。', examples: [ex('请开灯。','Qǐng kāi dēng.','Please turn on the light.','Sila hidupkan lampu.')] }
    ];
  }
  return [{ ...word, id: chinese, category, photo }];
});
export const byId = new Map(words.map(w => [w.id, w]));
export const categories = [
  ['Animals', '动物', '猫', 'Discover your animal friends', 'sage'], ['Food', '食物', '苹果', 'A delicious way to learn', 'peach'],
  ['Transport', '交通', '飞机', 'Let’s go on an adventure', 'blue'], ['Home', '家', '房子', 'Words that feel like home', 'sand'],
  ['School', '学校', '书', 'A little learning, every day', 'lavender'], ['People', '人物', '医生', 'The people around us', 'peach'],
  ['Actions', '动作', '跑', 'Put your words in motion', 'sage'], ['Emotions', '感情', '高兴', 'A word for every feeling', 'sand'],
  ['Weather', '天气', '冷', 'Whatever the weather', 'blue'], ['Nature', '大自然', '树', 'Explore the world outside', 'sage']
] as const;
