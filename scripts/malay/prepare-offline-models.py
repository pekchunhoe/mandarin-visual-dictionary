"""Download pinned permissively licensed OPUS snapshots for local evaluation only.

No API token, paid service, global cache, or remote model code is used.
"""
import argparse, hashlib, json, shutil, time, urllib.request
from pathlib import Path

MODELS = {
    'zh-ms': ('Helsinki-NLP/opus-mt-zh-ms', 'cf1a3e4739740082ad4b0cca4aa9f5a5748c4699'),
    'en-mul': ('Helsinki-NLP/opus-mt-en-mul', '07ab277b060b29b7208dc0a198327eeeea92224d'),
    'm2m100': ('facebook/m2m100_418M', '55c2e61bbf05dfb8d7abccdc3fae6fc8512fd636'),
}
FILES = ['README.md', 'config.json', 'generation_config.json', 'tokenizer_config.json', 'source.spm', 'target.spm', 'vocab.json', 'pytorch_model.bin']

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--model',choices=MODELS,required=True)
    parser.add_argument('--root',default='.tmp/malay-models');parser.add_argument('--max-download-mib',type=int,default=900)
    args=parser.parse_args();root=Path(args.root).resolve();root.mkdir(parents=True,exist_ok=True)
    if shutil.disk_usage(root).free < 5*2**30:raise RuntimeError('Keep at least 5 GiB free before downloading models.')
    model,revision=MODELS[args.model];destination=root/args.model;destination.mkdir(exist_ok=True)
    manifest_path=destination/'download-manifest.json'
    manifest=json.loads(manifest_path.read_text('utf-8')) if manifest_path.exists() else {'model':model,'revision':revision,'license':'MIT' if args.model=='m2m100' else 'Apache-2.0','files':{}}
    if manifest['model']!=model or manifest['revision']!=revision:raise RuntimeError('Snapshot identity mismatch; use a separate root.')
    downloaded=0;started=time.monotonic()
    files=FILES if args.model!='m2m100' else ['README.md','config.json','generation_config.json','tokenizer_config.json','special_tokens_map.json','vocab.json','sentencepiece.bpe.model','pytorch_model.bin']
    for name in files:
        output=destination/name
        if output.exists() and name in manifest['files']:
            with output.open('rb') as source:digest=hashlib.file_digest(source,'sha256').hexdigest()
            if digest==manifest['files'][name]['sha256']:continue
            raise RuntimeError('Existing model file failed checksum; inspect rather than overwrite it.')
        url=f'https://huggingface.co/{model}/resolve/{revision}/{name}'
        print(f'Downloading {args.model}/{name}',flush=True)
        partial=output.with_name(output.name+'.partial')
        with urllib.request.urlopen(url,timeout=60) as response, partial.open('wb') as target:
            length=int(response.headers.get('Content-Length',0))
            if length > args.max_download_mib*2**20:raise RuntimeError('File exceeds explicit download ceiling.')
            digest=hashlib.sha256();size=0
            while True:
                chunk=response.read(1024*1024)
                if not chunk:break
                size+=len(chunk);downloaded+=len(chunk)
                if downloaded>args.max_download_mib*2**20:raise RuntimeError('Download ceiling reached; partial data retained.')
                target.write(chunk);digest.update(chunk)
        partial.replace(output);manifest['files'][name]={'bytes':size,'sha256':digest.hexdigest()}
        temporary=manifest_path.with_suffix('.next');temporary.write_text(json.dumps(manifest,indent=2)+'\n','utf-8');temporary.replace(manifest_path)
    print(json.dumps({'model':model,'revision':revision,'downloadedBytes':downloaded,'seconds':time.monotonic()-started,'directory':str(destination)}),flush=True)

if __name__=='__main__':main()
