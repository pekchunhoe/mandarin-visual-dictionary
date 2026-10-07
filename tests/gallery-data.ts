export const px = (id: number, tags: string) => ({ id, tags, type: 'photo', pageURL: `https://pixabay.com/photos/scene-${id}/`, webformatURL: `https://pixabay.com/get/scene-${id}_640.jpg`, imageWidth: 900, imageHeight: 700 });
export const ov = (id: number, title: string) => ({ id: `scene-${id}`, title, url: `https://images.example.org/scene-${id}.jpg`, thumbnail: `https://images.example.org/scene-${id}-thumb.jpg`, width: 900, height: 700, creator: 'Fixture Creator', creator_url: 'https://images.example.org/creator', foreign_landing_url: `https://images.example.org/photos/${id}`, license: 'by', license_version: '4.0', license_url: 'https://creativecommons.org/licenses/by/4.0/', provider: 'flickr', source: 'flickr', tags: [{ name: title }] });
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
export const askingMeaning = "not feel ashamed to ask and learn from one's subordinates";
export const galleryExamples = [
  { word: '不耻下问', meaning: askingMeaning, repeated: 'asking question mark symbol', scenes: ['student asking teacher question classroom', 'colleague asking advice office', 'mentor and learner learning together sharing knowledge'] },
  { word: '魂飞魄散', meaning: 'fig. to be frightened stiff', repeated: 'frightened person facial expression', scenes: ['frightened child trembling body language', 'frightened person reacting danger', 'scared face expression'] },
  { word: '苹果', meaning: 'apple', repeated: 'apple fruit whole', scenes: ['apple fruit sliced halves', 'apple fruit basket market', 'person eating apple fruit'] },
  { word: '跑', meaning: 'to run', repeated: 'person running athlete track', scenes: ['child running park outdoors', 'woman running trail outdoors', 'person jogging training'] },
  { word: '害怕', meaning: 'to be afraid; to be scared', repeated: 'afraid person face expression', scenes: ['afraid child cowering body language', 'afraid person reacting danger', 'scared person trembling'] },
  { word: '帮助', meaning: 'to help', repeated: 'help helping hand icon symbol', scenes: ['person helping elderly neighbor', 'colleague helping teamwork work', 'student helping learning classroom'] }
];
