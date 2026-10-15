"""Fetch only the licensed Princeton 3.0 definitions needed for audit context."""
import hashlib, io, json, pathlib, re, tarfile, urllib.request
root = pathlib.Path('.tmp/malay-datasets/sources')
root.mkdir(parents=True, exist_ok=True)
path = root / 'WNdb-3.0.tar.gz'
url = 'https://wordnetcode.princeton.edu/3.0/WNdb-3.0.tar.gz'
if not path.exists():
    with urllib.request.urlopen(url, timeout=30) as response:
        raw = response.read(16 * 1024 * 1024 + 1)
        if len(raw) > 16 * 1024 * 1024:
            raise ValueError('WordNet download ceiling exceeded')
        path.write_bytes(raw)
raw = path.read_bytes()
definitions = {}
with tarfile.open(fileobj=io.BytesIO(raw)) as archive:
    for pos, name in [('n', 'noun'), ('v', 'verb'), ('a', 'adj'), ('r', 'adv')]:
        member = next(m for m in archive.getmembers() if m.name.endswith('/data.' + name))
        for line in archive.extractfile(member).read().decode('utf-8').splitlines():
            if re.match(r'^\d{8} ', line):
                definitions[line[:8] + '-' + pos] = line.split('|', 1)[1].strip()
(root / 'wordnet-definitions.json').write_text(json.dumps(definitions, ensure_ascii=True), 'utf-8')
(root / 'wordnet-definitions-manifest.json').write_text(json.dumps({'url': url, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest(), 'version': '3.0', 'license': 'Princeton WordNet 3.0 license', 'synsets': len(definitions)}, indent=2), 'utf-8')
print(json.dumps({'bytes': len(raw), 'synsets': len(definitions), 'sha256': hashlib.sha256(raw).hexdigest()}))
