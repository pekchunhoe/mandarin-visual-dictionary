"""Pinned public resources for controlled quality evaluation, never browser assets."""
import argparse, hashlib, json, shutil, urllib.request, zipfile, time, concurrent.futures
from pathlib import Path

ROOT=Path('.tmp/malay-recovery').resolve()
RESOURCES={
 'runtime':('https://github.com/ggml-org/llama.cpp/releases/download/b11630/llama-b11630-bin-win-cpu-x64.zip','runtime.zip',19563017,'82463bff7b42c41e8dc934202fb60ba28e1120c04264484b8d349b4a5958190d','MIT','ggml-org/llama.cpp','b11630'),
 'madlad':('https://huggingface.co/google/madlad400-3b-mt/resolve/fa184c675da0b5c9e1c8694fccd4e12e2d422094/model-q4k.gguf','madlad-q4k.gguf',1654597280,'ea6e5531a3e95213c7f0635988d119e078a655c09306e47851e15d4c0c3f9c37','Apache-2.0','google/madlad400-3b-mt','fa184c675da0b5c9e1c8694fccd4e12e2d422094'),
 'qwen':('https://huggingface.co/Qwen/Qwen3-1.7B-GGUF/resolve/90862c4b9d2787eaed51d12237eafdfe7c5f6077/Qwen3-1.7B-Q8_0.gguf','qwen3-1.7b-q8.gguf',1834426016,'061b54daade076b5d3362dac252678d17da8c68f07560be70818cace6590cb1a','Apache-2.0','Qwen/Qwen3-1.7B-GGUF','90862c4b9d2787eaed51d12237eafdfe7c5f6077')
}

def digest(path):
 with path.open('rb') as stream:return hashlib.file_digest(stream,'sha256').hexdigest()

def ranged_download(url,temporary,size,resource,workers):
 # Bounded 16 MiB requests avoid a stalled long-lived public CDN transfer.
 # Every completed range survives interruption; full upstream SHA is checked.
 parts=ROOT/'download-parts'/resource;parts.mkdir(parents=True,exist_ok=True)
 chunk_size=16*2**20;started=time.monotonic()
 ranges=[(start,min(start+chunk_size,size)-1) for start in range(0,size,chunk_size)]
 def fetch(bounds):
  start,end=bounds;part=parts/f'{start:012d}.part'
  if part.exists() and part.stat().st_size==end-start+1:return part
  for attempt in range(3):
   try:
    req=urllib.request.Request(url+f'?download=true&kanjian_range={start}-{end}',headers={'User-Agent':'KANJIAN-local-evaluation','Range':f'bytes={start}-{end}'})
    with urllib.request.urlopen(req,timeout=30) as response:
     if response.status!=206 or response.headers.get('Content-Range')!=f'bytes {start}-{end}/{size}':raise RuntimeError('Unexpected byte-range response.')
     count=0
     with part.with_suffix('.next').open('wb') as target:
      while chunk:=response.read(65536):
       count+=len(chunk)
       if count>end-start+1:raise RuntimeError('Range size exceeded.')
       target.write(chunk)
     if count!=end-start+1:raise RuntimeError('Incomplete range.')
    part.with_suffix('.next').replace(part);return part
   except Exception:
    if attempt==2:raise
    time.sleep(1)
 with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
  for index,_ in enumerate(pool.map(fetch,ranges),1):
   if index%4==0:print(json.dumps({'resource':resource,'completedRanges':index,'totalRanges':len(ranges),'seconds':round(time.monotonic()-started,1)}),flush=True)
 with temporary.open('wb') as target:
  for start,end in ranges:
   with (parts/f'{start:012d}.part').open('rb') as source:shutil.copyfileobj(source,target,1024*1024)

def main():
 parser=argparse.ArgumentParser();parser.add_argument('resource',choices=RESOURCES);parser.add_argument('--max-download-mib',type=int,default=2000);parser.add_argument('--download-workers',type=int,default=4);args=parser.parse_args()
 if not 1<=args.download_workers<=8:raise RuntimeError('Use 1--8 bounded download streams.')
 url,name,size,sha,license,source,revision=RESOURCES[args.resource]
 ROOT.mkdir(parents=True,exist_ok=True)
 if size>args.max_download_mib*2**20:raise RuntimeError('Explicit download ceiling too small.')
 if shutil.disk_usage(ROOT).free<size+5*2**30:raise RuntimeError('Keep at least 5 GiB free after download.')
 output=ROOT/name
 if output.exists():
  if output.stat().st_size!=size or digest(output)!=sha:raise RuntimeError('Existing resource checksum mismatch; inspect locally.')
 else:
  temporary=output.with_suffix('.partial');count=0;hasher=hashlib.sha256()
  if args.resource!='runtime':
   ranged_download(url,temporary,size,args.resource,args.download_workers)
   count=temporary.stat().st_size
   with temporary.open('rb') as stream:hasher=hashlib.file_digest(stream,'sha256')
  else:
   started=time.monotonic()
   with urllib.request.urlopen(urllib.request.Request(url+'?download=true',headers={'User-Agent':'KANJIAN-local-evaluation'}),timeout=30) as response,temporary.open('wb') as target:
    while chunk:=response.read(1024*1024):
     count+=len(chunk)
     if count>size:raise RuntimeError('Unexpected download size.')
     target.write(chunk);hasher.update(chunk)
  if count!=size or hasher.hexdigest()!=sha:raise RuntimeError('Public upstream checksum validation failed.')
  temporary.replace(output)
 manifest={'source':source,'revision':revision,'license':license,'path':str(output),'bytes':size,'sha256':sha,'purpose':'controlled evaluation only; no production acceptance'}
 (ROOT/(args.resource+'-manifest.json')).write_text(json.dumps(manifest,indent=2)+'\n','utf-8')
 if args.resource=='runtime':
  destination=ROOT/'runtime';destination.mkdir(exist_ok=True)
  with zipfile.ZipFile(output) as archive:
   for info in archive.infolist():
    final=(destination/info.filename).resolve()
    if not final.is_relative_to(destination):raise RuntimeError('Unsafe archive path.')
    if Path(info.filename).suffix.lower() in ['.dll','.exe','.txt','.md']:archive.extract(info,destination)
  print(json.dumps({'runtimeFiles':[p.name for p in destination.rglob('*.exe')]}))
 print(json.dumps(manifest))

if __name__=='__main__':main()
