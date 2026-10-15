"""Bounded licensed Malay-only Wiktionary download; no model dependencies."""
import concurrent.futures, gzip, hashlib, io, json, pathlib, urllib.request
root = pathlib.Path('.tmp/malay-recovery')  # Preserve the existing staged path.
root.mkdir(parents=True, exist_ok=True)
url = 'https://kaikki.org/dictionary/Malay/kaikki.org-dictionary-Malay.jsonl'
expected = '09719ea7c3ca0448a35ecfacd1a88ef5d816d072523b81b46d2baffb1b51f207'
dest = root / 'wiktionary-malay.jsonl'
def get(target, headers, limit):
    with urllib.request.urlopen(urllib.request.Request(target, headers=headers), timeout=30) as response:
        raw = response.read(limit + 1)
        if len(raw) > limit:
            raise ValueError('Relevant Malay dictionary download ceiling exceeded')
        return raw, dict(response.headers), response.status
if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest() == expected:
    print('Pinned licensed Kaikki source already present; no download needed.')
else:
    _, headers, _ = get(url, {'Accept-Encoding': 'gzip', 'Range': 'bytes=0-0'}, 1024)
    total = int(headers['Content-Range'].rsplit('/', 1)[1])
    if total > 8 * 2**20:
        raise ValueError('Compressed dictionary exceeds 8 MiB')
    def part(start):
        end = min(start + 2**20, total) - 1
        raw, metadata, status = get(url + f'?kanjian_range={start}', {'Accept-Encoding': 'gzip', 'Range': f'bytes={start}-{end}'}, 2**20)
        if status != 206 or metadata.get('Content-Range') != f'bytes {start}-{end}/{total}':
            raise ValueError('Unexpected compressed byte range')
        return raw
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        compressed = b''.join(pool.map(part, range(0, total, 2**20)))
    raw = gzip.GzipFile(fileobj=io.BytesIO(compressed)).read(40 * 2**20 + 1)
    if len(raw) > 40 * 2**20 or hashlib.sha256(raw).hexdigest() != expected:
        raise ValueError('Source changed: reassess its version, licensing and alignment before updating the pinned hash')
    temporary = dest.with_suffix('.jsonl.next')
    temporary.write_bytes(raw)
    temporary.replace(dest)
    (root / 'wiktionary-manifest.json').write_text(json.dumps({'source': url, 'sha256': expected, 'bytes': len(raw), 'dump': 'enwiktionary 2026-09-02, extracted 2026-10-03', 'license': 'CC-BY-SA-4.0; English Wiktionary contributors'}), 'utf-8')
    print(json.dumps({'bytes': len(raw), 'sha256': expected}))
