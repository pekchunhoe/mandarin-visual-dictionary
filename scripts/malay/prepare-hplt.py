"""Pinned public HPLT download and local int8 conversion; never cloud inference."""
import hashlib, json, time, urllib.request, shutil, argparse
from pathlib import Path

MODEL = 'HPLT/translate-en-ms-v2.0-hplt_opus'
REVISION = '873965aa16eb43f662b57f52f39dcc2efe20681d'
FILES = {
    'README.md': None,
    'model.en-ms.spm': '6f0665a0e1d544dd2bde166e7da0e337b8a00d384f48d56db55c75ff2765e76a',
    'model.en-ms.vocab': None,
    'model.npz.best-chrf.npz': '35e36ae55781473fe7f03405fa22cea4ed8f572c6679ce77f60b2574f3cb9f5c',
}

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--precision', choices=['int8', 'float32'], default='int8'); args = parser.parse_args()
    root = Path('.tmp/malay-models/hplt-en-ms'); root.mkdir(parents=True, exist_ok=True)
    if shutil.disk_usage(root).free < 3 * 2**30:
        raise RuntimeError('Keep 3 GiB free; no automatic storage upgrades.')
    manifest = {'model': MODEL, 'revision': REVISION, 'license': 'CC-BY-4.0', 'files': {}}
    for name, expected in FILES.items():
        dest = root / name
        if not dest.exists():
            partial = dest.with_suffix(dest.suffix + '.partial')
            print('Downloading ' + name, flush=True)
            for attempt in range(4):
                try:
                    with urllib.request.urlopen(f'https://huggingface.co/{MODEL}/resolve/{REVISION}/{name}', timeout=45) as source, partial.open('wb') as target:
                        count = 0
                        while chunk := source.read(2**20):
                            count += len(chunk)
                            if count > 320 * 2**20: raise RuntimeError('Download exceeds pinned model ceiling')
                            target.write(chunk)
                    partial.replace(dest); break
                except Exception:
                    if attempt == 3: raise
                    time.sleep(2)
        digest = hashlib.sha256(dest.read_bytes()).hexdigest()
        if expected and digest != expected: raise RuntimeError('Model checksum mismatch: ' + name)
        manifest['files'][name] = {'bytes': dest.stat().st_size, 'sha256': digest}
    (root / 'download-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    from ctranslate2.converters import MarianConverter
    import sentencepiece
    from ctranslate2.converters.marian import load_vocab
    sp = sentencepiece.SentencePieceProcessor(model_file=str(root / 'model.en-ms.spm'))
    pieces = [sp.id_to_piece(i) for i in range(sp.get_piece_size())]
    assert len(pieces) == 64000 and pieces[:2] == ['</s>', '<unk>']
    # The published .vocab is SentencePiece token/log-score TSV, not Marian YAML.
    # Preserve every original token ID and verify the converter's own parser.
    vocab = root / 'marian-vocab.yml'
    vocab.write_text(''.join(json.dumps(token, ensure_ascii=False) + ': ' + str(i) + '\n' for i, token in enumerate(pieces)), encoding='utf-8')
    assert load_vocab(str(vocab)) == pieces, 'Vocabulary conversion changed token IDs'
    converted = root / ('ct2-' + args.precision)
    if not (converted / 'model.bin').exists():
        MarianConverter(str(root / 'model.npz.best-chrf.npz'), [str(vocab)]).convert(str(converted), quantization=args.precision)
    print(json.dumps({'ready': str(root), 'precision': args.precision, 'downloadBytes': sum(v['bytes'] for v in manifest['files'].values()), 'convertedBytes': (converted / 'model.bin').stat().st_size}), flush=True)

if __name__ == '__main__': main()
