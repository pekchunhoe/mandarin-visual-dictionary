"""Fetch three licensed, pinned WordNet resources with a 64 MiB total ceiling."""
import hashlib,json,urllib.request
from pathlib import Path
root=Path('.tmp/malay-lexical');root.mkdir(parents=True,exist_ok=True)
revision='406bf83b3c507a3d1f26e88252d5d66893fd36bf'
paths=['wns/msa/LICENSE','wns/msa/README','wns/msa/wn-data-zsm.tab','wns/cow/LICENSE','wns/cow/README','wns/cow/wn-data-cmn.tab','wns/eng/LICENSE','wns/eng/README','wns/eng/wn-data-eng.tab']
manifest_path=root/'download-manifest.json'
manifest=json.loads(manifest_path.read_text('utf-8')) if manifest_path.exists() else {'repository':'omwn/omw-data','revision':revision,'files':{}}
revision=manifest['revision'];total=0
if revision!='406bf83b3c507a3d1f26e88252d5d66893fd36bf':raise RuntimeError('Unqualified lexical revision.')
for relative in paths:
    path=root/relative;path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists() and relative in manifest['files']:
        if hashlib.sha256(path.read_bytes()).hexdigest()!=manifest['files'][relative]['sha256']:raise RuntimeError('Existing lexical file checksum mismatch.')
        continue
    print('Downloading '+relative,flush=True)
    try:
        with urllib.request.urlopen(f'https://raw.githubusercontent.com/omwn/omw-data/{revision}/{relative}',timeout=60) as response:
            data=response.read(64*2**20+1)
    except urllib.error.HTTPError as error:
        if relative.endswith('/README') and error.code==404:continue
        raise
    total+=len(data)
    if total>64*2**20:raise RuntimeError('Lexical download ceiling exceeded.')
    path.write_bytes(data);manifest['files'][relative]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
    temp=manifest_path.with_suffix('.next');temp.write_text(json.dumps(manifest,indent=2)+'\n','utf-8');temp.replace(manifest_path)
print(json.dumps({'revision':revision,'downloadedBytes':total,'files':list(manifest['files'])}))
