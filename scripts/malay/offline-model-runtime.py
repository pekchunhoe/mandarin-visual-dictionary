"""Bounded, network-disabled Marian model conversion and JSONL inference worker."""
import argparse, hashlib, json, os, sys, time
from pathlib import Path
sys.stdin.reconfigure(encoding='utf-8');sys.stdout.reconfigure(encoding='utf-8');sys.stderr.reconfigure(encoding='utf-8')
os.environ['HF_HUB_OFFLINE']='1';os.environ['TRANSFORMERS_OFFLINE']='1'
os.environ['TOKENIZERS_PARALLELISM']='false';os.environ['OMP_NUM_THREADS']='2'

def main():
    parser=argparse.ArgumentParser();parser.add_argument('command',choices=['convert','serve','translate'])
    parser.add_argument('--model',choices=['zh-ms','en-mul','m2m100'],required=True);parser.add_argument('--root',default='.tmp/malay-models')
    parser.add_argument('--threads',type=int,default=2);parser.add_argument('--input');parser.add_argument('--output')
    parser.add_argument('--beam-size',type=int,default=4);parser.add_argument('--source-language',choices=['en','zh'],default='en');parser.add_argument('--allow-untargeted-benchmark',action='store_true');args=parser.parse_args()
    if not 1<=args.threads<=4 or not 1<=args.beam_size<=5:raise RuntimeError('Use 1–4 threads and 1–5 beams.')
    import ctranslate2, psutil
    directory=Path(args.root).resolve()/args.model;manifest=json.loads((directory/'download-manifest.json').read_text('utf-8'))
    converted=directory/'ct2-int8'
    if args.command=='convert':
        if (converted/'model.bin').exists():
            print(json.dumps({'alreadyConverted':str(converted)}));return
        if psutil.virtual_memory().available<1.2*2**30:raise RuntimeError('Not enough free memory for safe single-model conversion.')
        import torch
        torch.set_num_threads(args.threads)
        from ctranslate2.converters import TransformersConverter
        start=time.monotonic()
        # float16 source loading plus int8 conversion stays below the full fp32
        # weight footprint; check free memory after importing torch as well.
        if args.model=='m2m100' and psutil.virtual_memory().available<1.8*2**30:raise RuntimeError('M2M float16 conversion needs at least 1.8 GiB free memory after loading torch.')
        TransformersConverter(str(directory),load_as_float16=args.model=='m2m100',low_cpu_mem_usage=args.model=='m2m100').convert(str(converted),quantization='int8')
        (converted/'KANJIAN-PROVENANCE.json').write_text(json.dumps({'model':manifest['model'],'revision':manifest['revision'],'license':manifest['license'],'quantization':'int8','runtime':ctranslate2.__version__},indent=2)+'\n','utf-8')
        print(json.dumps({'converted':str(converted),'seconds':time.monotonic()-start,'rssBytes':psutil.Process().memory_info().rss}));return
    from transformers import MarianTokenizer, M2M100Tokenizer
    tokenizer=M2M100Tokenizer.from_pretrained(str(directory),local_files_only=True) if args.model=='m2m100' else MarianTokenizer.from_pretrained(str(directory),local_files_only=True)
    if args.model=='m2m100':tokenizer.src_lang=args.source_language
    target='__ms__' if args.model=='m2m100' else '>>zsm_Latn<<' if '>>zsm_Latn<<' in tokenizer.supported_language_codes else '>>zlm_Latn<<' if args.model=='en-mul' else '>>zsm_Latn<<'
    if args.model!='m2m100' and target not in tokenizer.supported_language_codes:
        if args.command!='translate' or not args.allow_untargeted_benchmark:raise RuntimeError('Model does not support the explicitly required Malaysian Malay target token.')
        target='' # Benchmark-only evidence of why this model cannot be accepted for bulk ms-MY generation.
    translator=ctranslate2.Translator(str(converted),device='cpu',compute_type='int8',inter_threads=1,intra_threads=args.threads)
    def translate(request):
        texts=request['texts']
        if not isinstance(texts,list) or not 1<=len(texts)<=64 or any(not isinstance(t,str) or len(t)>4000 for t in texts):raise RuntimeError('Input batch or text exceeds its explicit bound.')
        inputs=[tokenizer.convert_ids_to_tokens(tokenizer.encode(text if args.model=='m2m100' else target+' '+text)) for text in texts]
        if any(len(tokens)>384 for tokens in inputs):raise RuntimeError('Source is too long; refusing to truncate a dictionary sense.')
        started=time.monotonic()
        options={'target_prefix':[[target] for _ in inputs]} if args.model=='m2m100' else {}
        result=translator.translate_batch(inputs,beam_size=args.beam_size,max_decoding_length=192,min_decoding_length=1,return_scores=True,**options)
        outputs=[]
        for row in result:
            hypothesis=row.hypotheses[0]
            ids=tokenizer.convert_tokens_to_ids(hypothesis)
            outputs.append({'text':tokenizer.decode(ids,skip_special_tokens=True).strip(),'score':row.scores[0],'outputTokens':len(hypothesis),'hitLengthLimit':len(hypothesis)>=191})
        return {'outputs':outputs,'seconds':time.monotonic()-started,'inputTokens':sum(len(t) for t in inputs),'outputTokens':sum(o['outputTokens'] for o in outputs),'rssBytes':psutil.Process().memory_info().rss,'model':manifest['model'],'revision':manifest['revision'],'targetToken':target,'runtime':ctranslate2.__version__}
    if args.command=='translate':
        request=json.loads(Path(args.input).read_text('utf-8'));result=translate(request)
        Path(args.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n','utf-8');print(json.dumps({k:v for k,v in result.items() if k!='outputs'}));return
    print(json.dumps({'ready':True,'model':manifest['model'],'targetToken':target}),flush=True)
    for line in sys.stdin:
        try:
            request=json.loads(line);result=translate(request);result['id']=request.get('id')
            print(json.dumps(result,ensure_ascii=False),flush=True)
        except Exception as error:
            print(json.dumps({'id':locals().get('request',{}).get('id'),'error':type(error).__name__+': '+str(error)}),flush=True)

if __name__=='__main__':main()
