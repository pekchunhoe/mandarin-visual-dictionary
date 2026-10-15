"""Local-only checkpointed MT. Outputs are candidates, never verified translations."""
import argparse, hashlib, json, os, time, sys, re, unicodedata, socket, shutil
from pathlib import Path
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'
sys.stdout.reconfigure(encoding='utf-8')

def sha(path):
    with Path(path).open('rb') as f: return hashlib.file_digest(f, 'sha256').hexdigest()

def atomic(path, value):
    partial = path.with_suffix('.next')
    partial.write_text(json.dumps(value, ensure_ascii=False) + '\n', encoding='utf-8')
    partial.replace(path)

def structural_issues(task, text, tokens):
    issues = []
    if not text.strip(): issues.append('empty')
    if unicodedata.normalize('NFC', text).casefold() == task['input'].casefold(): issues.append('english-copy')
    if '\ufffd' in text or re.search(r'[\u3400-\u9fff\u0400-\u052f\u0600-\u06ff]', text): issues.append('unicode-or-target-script')
    if re.search(r'\b(the|which|something|someone|undefined|TODO|translation pending)\b', text, re.I): issues.append('untranslated-or-placeholder')
    if re.search(r'\b(mobil|sepeda|kantor|rumah sakit|telepon|apotik|kulkas|handuk|gratis|obat|hewan|bebek|sapi)\b', text, re.I): issues.append('indonesian-localization')
    if len(text) > max(160, len(task['input']) * 4) or tokens >= 191: issues.append('length-or-truncation')
    if len(re.findall(r'\b(\w+)\b', text)) > 8 and re.search(r'\b(\w+)(?:\s+\1){3,}\b', text, re.I): issues.append('repetition')
    if sorted(re.findall(r'\d+(?:[.,]\d+)*', task['input'])) != sorted(re.findall(r'\d+(?:[.,]\d+)*', text)): issues.append('number-changed')
    return issues

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--model', choices=['hplt', 'm2m100'], default='hplt')
    p.add_argument('--precision', choices=['int8', 'float32'], default='int8')
    p.add_argument('--device', choices=['cpu', 'cuda'], default='cpu')
    p.add_argument('--input', required=True); p.add_argument('--output', required=True)
    p.add_argument('--threads', type=int, default=4); p.add_argument('--batch-size', type=int, default=48)
    p.add_argument('--beam-size', type=int, default=4); p.add_argument('--max-records', type=int)
    args = p.parse_args()
    if not 1 <= args.threads <= 8 or not 1 <= args.batch_size <= 128 or not 1 <= args.beam_size <= 5: raise ValueError('Unbounded inference settings')
    # Optional CUDA libraries stay in the separate virtual environment. No
    # system PATH, driver, subscription or hosting setting is changed.
    dll_dir = Path(sys.prefix) / 'Lib/site-packages/nvidia/cublas/bin'
    if dll_dir.exists():
        dll_handle = os.add_dll_directory(str(dll_dir)); os.environ['PATH'] = str(dll_dir) + os.pathsep + os.environ.get('PATH', '')
    import ctranslate2, psutil, sentencepiece
    out = Path(args.output); out.mkdir(parents=True, exist_ok=True)
    # A Windows byte lock prevents competing writers, including after a crash.
    import msvcrt
    lock = (out / 'runner.lock').open('a+b'); lock.seek(0); lock.write(b'0'); lock.flush(); lock.seek(0)
    msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
    snapshot = out / 'workload.jsonl'
    if not snapshot.exists():
        temporary = out / 'workload.next'
        shutil.copyfile(args.input, temporary); temporary.replace(snapshot)
    if sha(snapshot) != sha(args.input): raise RuntimeError('Input changed: use a separate output directory')
    model = Path('.tmp/malay-models/hplt-en-ms' if args.model == 'hplt' else '.tmp/malay-models/m2m100')
    provenance = json.loads((model / 'download-manifest.json').read_text('utf-8'))
    identity = {'schema': 1, 'inputSha256': sha(snapshot), 'model': provenance['model'], 'revision': provenance['revision'],
                'weightsSha256': sha(model / ('ct2-' + args.precision) / 'model.bin'), 'runtime': ctranslate2.__version__, 'beamSize': args.beam_size, 'quantization': args.precision, 'preprocessing': 'complete-original-sense-v3-context-in-qa'}
    if args.device != 'cpu': identity['device'] = args.device
    manifest_path = out / 'checkpoint.json'
    manifest = json.loads(manifest_path.read_text('utf-8')) if manifest_path.exists() else {'identity': identity, 'shards': [], 'completed': 0, 'inferenceSeconds': 0, 'peakRssBytes': 0}
    if manifest['identity'] != identity: raise RuntimeError('Checkpoint/model/workload mismatch; use a separate output directory')
    cache = {}
    for shard in manifest['shards']:
        path = out / shard['file']
        if sha(path) != shard['sha256']: raise RuntimeError('Checkpoint shard checksum mismatch')
        for row in json.loads(path.read_text('utf-8')):
            cache[row['inferenceKey']] = row
    if args.model == 'hplt':
        sp = sentencepiece.SentencePieceProcessor(model_file=str(model / 'model.en-ms.spm'))
        encode = lambda text: sp.encode(text, out_type=str)
        decode = lambda tokens: sp.decode(tokens)
    else:
        from transformers import M2M100Tokenizer
        tokenizer = M2M100Tokenizer.from_pretrained(str(model), local_files_only=True); tokenizer.src_lang = 'en'
        encode = lambda text: tokenizer.convert_ids_to_tokens(tokenizer.encode(text))
        decode = lambda tokens: tokenizer.decode(tokenizer.convert_tokens_to_ids(tokens), skip_special_tokens=True).strip()
    translator = ctranslate2.Translator(str(model / ('ct2-' + args.precision)), device=args.device, compute_type=args.precision, inter_threads=1, intra_threads=args.threads)
    # Inference is explicitly denied network access, including accidental fallbacks.
    def deny_network(*a, **kw): raise RuntimeError('Network disabled during local translation')
    socket.socket.connect = deny_network; socket.create_connection = deny_network
    print(json.dumps({'ready': True, 'identity': identity, 'resumeAt': manifest['completed'], 'availableRamBytes': psutil.virtual_memory().available}), flush=True)
    pending = []; current = []; index = 0
    def save():
        nonlocal pending
        if not pending: return
        path = out / f"batch-{len(manifest['shards']):06d}.json"
        # A crash after shard publication but before manifest publication repeats
        # only that unpublished batch; it never skips uncommitted work.
        atomic(path, pending)
        manifest['shards'].append({'file': path.name, 'sha256': sha(path), 'records': len(pending)})
        manifest['completed'] += len(pending)
        manifest['peakRssBytes'] = max(manifest['peakRssBytes'], psutil.Process().memory_info().rss)
        atomic(manifest_path, manifest)
        print(json.dumps({'completed': manifest['completed'], 'inferenceSeconds': round(manifest['inferenceSeconds'], 2), 'rssMiB': round(psutil.Process().memory_info().rss / 2**20), 'availableMiB': round(psutil.virtual_memory().available / 2**20)}), flush=True)
        pending = []
    def process(batch):
        started = time.monotonic()
        unique = {}; rows = {}
        for task in batch:
            if task['inferenceKey'] in cache: rows[task['key']] = {**cache[task['inferenceKey']], 'key': task['key'], 'reusedExactContext': True}; continue
            unique.setdefault(task['inferenceKey'], task)
        tasks = list(unique.values()); inputs = [encode(t['input']) for t in tasks]
        eligible = [(t, tokens) for t, tokens in zip(tasks, inputs) if len(tokens) <= 384]
        for task, tokens in zip(tasks, inputs):
            if len(tokens) > 384: cache[task['inferenceKey']] = {'key': task['key'], 'inferenceKey': task['inferenceKey'], 'text': '', 'issues': ['source-too-long-no-truncation'], 'outputTokens': 0}
        if eligible:
            try:
                options = {'target_prefix': [['__ms__'] for _ in eligible]} if args.model == 'm2m100' else {}
                results = translator.translate_batch([tokens for _, tokens in eligible], beam_size=args.beam_size, max_decoding_length=192, return_scores=True, **options)
                if len(results) != len(eligible): raise RuntimeError('Output cardinality mismatch')
                for (task, _), result in zip(eligible, results):
                    tokens = result.hypotheses[0]; text = unicodedata.normalize('NFC', decode(tokens)).strip()
                    cache[task['inferenceKey']] = {'key': task['key'], 'inferenceKey': task['inferenceKey'], 'text': text, 'outputTokens': len(tokens), 'modelScoreNotConfidence': result.scores[0], 'issues': structural_issues(task, text, len(tokens))}
            except RuntimeError:
                if len(batch) > 1:
                    middle = len(batch) // 2; process(batch[:middle]); process(batch[middle:]); return
                task = batch[0]; cache[task['inferenceKey']] = {'key': task['key'], 'inferenceKey': task['inferenceKey'], 'text': '', 'issues': ['local-inference-failed'], 'outputTokens': 0}
        manifest['inferenceSeconds'] += time.monotonic() - started
        for task in batch:
            row = rows.get(task['key']) or {**cache[task['inferenceKey']], 'key': task['key']}
            pending.append(row)
        if len(pending) >= 384: save()
    with snapshot.open(encoding='utf-8') as source:
        for line in source:
            task = json.loads(line); index += 1
            if index <= manifest['completed']: continue
            if args.max_records and index > args.max_records: break
            current.append(task)
            available = psutil.virtual_memory().available
            size = min(args.batch_size, 8 if available < 600 * 2**20 else 24 if available < 1000 * 2**20 else args.batch_size)
            if len(current) >= size:
                process(current); current = []
                if available < 200 * 2**20: save(); raise RuntimeError('Memory safety limit reached; progress retained')
        if current: process(current)
    save(); print(json.dumps({'done': True, **{k: v for k, v in manifest.items() if k != 'shards'}}), flush=True)

if __name__ == '__main__': main()
