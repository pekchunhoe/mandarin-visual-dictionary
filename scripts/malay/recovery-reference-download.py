"""Bounded, gzip-compressed licensed references and small model metadata."""
import argparse,concurrent.futures,gzip,hashlib,io,json,urllib.request
from pathlib import Path
ROOT=Path('.tmp/malay-recovery')
def get(url,headers=None,limit=8*2**20):
 with urllib.request.urlopen(urllib.request.Request(url,headers=headers or {}),timeout=30) as r:
  data=r.read(limit+1)
  if len(data)>limit:raise RuntimeError('Small resource download ceiling exceeded.')
  return data,dict(r.headers),r.status
def main():
 parser=argparse.ArgumentParser();parser.add_argument('resource',choices=['wiktionary','tokenizer','conversion-source']);args=parser.parse_args()
 ROOT.mkdir(exist_ok=True)
 if args.resource=='wiktionary':
  url='https://kaikki.org/dictionary/Malay/kaikki.org-dictionary-Malay.jsonl'
  _,headers,status=get(url,{'Accept-Encoding':'gzip','Range':'bytes=0-0'},1024)
  total=int(headers['Content-Range'].rsplit('/',1)[1])
  if total>8*2**20:raise RuntimeError('Compressed reference data exceeds 8 MiB.')
  def part(start):
   end=min(start+2**20,total)-1
   data,h,code=get(url+f'?kanjian_range={start}',{'Accept-Encoding':'gzip','Range':f'bytes={start}-{end}'},2**20)
   if code!=206 or h.get('Content-Range')!=f'bytes {start}-{end}/{total}':raise RuntimeError('Invalid compressed byte range.')
   print(json.dumps({'referenceBytes':len(data),'rangeStart':start}),flush=True);return data
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:raw=b''.join(pool.map(part,range(0,total,2**20)))
  data=gzip.GzipFile(fileobj=io.BytesIO(raw)).read(40*2**20+1)
  if len(data)>40*2**20:raise RuntimeError('Decoded reference ceiling exceeded.')
  (ROOT/'wiktionary-malay.jsonl').write_bytes(data)
  manifest={'source':url,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'retrieved':'2026-10-15','dump':'enwiktionary 2026-09-02, extracted 2026-10-03','license':'CC-BY-SA-4.0, English Wiktionary contributors; page links retained. Evaluation references only.','compressedBytes':len(raw)}
  (ROOT/'wiktionary-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n','utf-8')
  print(json.dumps(manifest));return
 if args.resource=='tokenizer':
  root=ROOT/'madlad-tokenizer';root.mkdir(exist_ok=True)
  base='https://huggingface.co/google/madlad400-3b-mt/resolve/fa184c675da0b5c9e1c8694fccd4e12e2d422094/'
  for name in ['README.md','config.json','tokenizer_config.json','special_tokens_map.json','added_tokens.json','spiece.model']:
   if (root/name).exists():continue
   data,_,_=get(base+name+'?download=true')
   (root/name).write_bytes(data);print(name,len(data),flush=True)
  return
 for name in ['conversion/t5.py','conversion/base.py','gguf-py/gguf/constants.py']:
  try:data,_,_=get('https://raw.githubusercontent.com/ggml-org/llama.cpp/b11630/'+name)
  except Exception as error:print(name,type(error).__name__,flush=True);continue
  (ROOT/('reference-'+Path(name).name)).write_bytes(data);print(name,len(data),flush=True)
if __name__=='__main__':main()
