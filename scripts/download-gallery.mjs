import { readFile, writeFile } from 'node:fs/promises';
const photos = JSON.parse(await readFile('src/data/apple-gallery.json', 'utf8'));
await Promise.all(photos.map(async photo => {
  const response = await fetch(`https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=900`);
  if (!response.ok) throw new Error(`${photo.key}: ${response.status}`);
  await writeFile(`public/photos/${photo.key}.jpg`, Buffer.from(await response.arrayBuffer()));
  console.log(photo.key);
}));
