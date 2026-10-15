"""Small public metadata only; never downloads restricted dictionary contents."""
import concurrent.futures, json, pathlib, urllib.request

ROOT = pathlib.Path('.tmp/malay-datasets/inventory')
ROOT.mkdir(parents=True, exist_ok=True)
URLS = {
    'github-revision': 'https://api.github.com/repos/malaysia-ai/malaysian-dataset/commits/master',
    '200k': 'https://api.github.com/repos/malaysia-ai/malaysian-dataset/contents/dictionary/200k-english-malay',
    'wiktionary': 'https://api.github.com/repos/malaysia-ai/malaysian-dataset/contents/dictionary/wiktionary',
    'hf-wiktionary': 'https://huggingface.co/api/datasets/mesolitica/wiktionary-bahasa',
    'hf-cambridge': 'https://huggingface.co/api/datasets/mesolitica/crawl-cambridge-english-malaysian',
    'hf-dbp': 'https://huggingface.co/api/datasets/mesolitica/dbp',
}
DOWNLOADS = {
    '200k-README.md': 'https://raw.githubusercontent.com/malaysia-ai/malaysian-dataset/87c0562cb41966babc62b299cd2812e620d1c23e/dictionary/200k-english-malay/README.md',
    'wiktionary-README.md': 'https://raw.githubusercontent.com/malaysia-ai/malaysian-dataset/87c0562cb41966babc62b299cd2812e620d1c23e/dictionary/wiktionary/README.md',
    'wiktionary-extractor.ipynb': 'https://raw.githubusercontent.com/malaysia-ai/malaysian-dataset/87c0562cb41966babc62b299cd2812e620d1c23e/dictionary/wiktionary/wiktionary-bahasa.ipynb',
    '200k-english-malay.json': 'https://raw.githubusercontent.com/malaysia-ai/malaysian-dataset/87c0562cb41966babc62b299cd2812e620d1c23e/dictionary/200k-english-malay/200k-english-malay.json',
    'wiktionary-bahasa.json': 'https://huggingface.co/datasets/mesolitica/wiktionary-bahasa/resolve/5da1400408400a49f5550277166afb00aadd0f33/wiktionary-bahasa.json',
}
def fetch(item):
    name, url = item
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'KANJIAN-licensed-dataset-inventory'})
        with urllib.request.urlopen(req, timeout=25) as response:
            raw = response.read(2 * 1024 * 1024)
        (ROOT / (name + '.json')).write_bytes(raw)
        data = json.loads(raw)
        if isinstance(data, list):
            return name, [{k: r.get(k) for k in ('name', 'size', 'download_url')} for r in data]
        return name, {k: data.get(k) for k in ('sha', 'cardData', 'siblings')}
    except Exception as error:
        return name, {'error': str(error)}
if __name__ == '__main__':
    import sys, hashlib
    if '--stage' in sys.argv:
        stage = ROOT.parent / 'sources'
        stage.mkdir(exist_ok=True)
        for name, url in DOWNLOADS.items():
            dest = stage / name
            try:
                if not dest.exists():
                    req = urllib.request.Request(url, headers={'User-Agent': 'KANJIAN-local-dictionary-research'})
                    with urllib.request.urlopen(req, timeout=25) as response, dest.with_suffix(dest.suffix + '.next').open('wb') as out:
                        total = 0
                        while chunk := response.read(128 * 1024):
                            total += len(chunk)
                            if total > 64 * 1024 * 1024:
                                raise ValueError('Relevant dictionary download exceeds 64 MiB ceiling')
                            out.write(chunk)
                    dest.with_suffix(dest.suffix + '.next').replace(dest)
                raw = dest.read_bytes()
                print(json.dumps({'file': str(dest), 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest(), 'url': url}), flush=True)
            except Exception as error:
                print(json.dumps({'file': str(dest), 'error': str(error)}), flush=True)
        sys.exit(0)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(fetch, URLS.items()):
            print(json.dumps(result, ensure_ascii=True), flush=True)
