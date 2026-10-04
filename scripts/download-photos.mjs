import { mkdir, writeFile } from 'node:fs/promises';
const photos = { apple: 102104, cat: 1170986, dog: 1108099, bird: 326900, fish: 128756, elephant: 3739327, banana: 61127, watermelon: 1313267, airplane: 358319, car: 170811, house: 106399, umbrella: 35625424, book: 5503752, school: 256541, doctor: 5452201, running: 2526878, happy: 3760854, cold: 688660, tree: 8905675, flower: 736230 };
await mkdir('public/photos', { recursive: true });
await Promise.all(Object.entries(photos).map(async ([key, id]) => {
  try { const response = await fetch(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`); if (!response.ok) throw new Error(String(response.status)); await writeFile(`public/photos/${key}.jpg`, Buffer.from(await response.arrayBuffer())); console.log(`${key}: downloaded`); } catch(error) { console.error(`${key}: ${error.message}`); process.exitCode = 1; }
}));
