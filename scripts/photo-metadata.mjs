import { readdir, readFile, writeFile } from 'node:fs/promises';
const metadata = {};
for (const file of await readdir('public/photos')) {
  if (!file.endsWith('.jpg')) continue;
  const bytes = await readFile(`public/photos/${file}`);
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    const marker = bytes[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) { metadata[file.slice(0, -4)] = { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) }; break; }
    offset += bytes.readUInt16BE(offset + 2) + 2;
  }
  if (!metadata[file.slice(0, -4)]) throw new Error(`Dimensions missing: ${file}`);
}
await writeFile('src/data/photo-metadata.json', JSON.stringify(metadata, null, 2) + '\n');
console.log(`Read real image dimensions for ${Object.keys(metadata).length} photos.`);
