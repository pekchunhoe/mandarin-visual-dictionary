"""Add llama.cpp T5 metadata/names to the official Candle Q4_K payload.

No tensor arithmetic, requantization, or full-precision weights. Metadata and
vocabulary follow ggml-org/llama.cpp b11630 conversion/t5.py (MIT).
"""
import argparse,hashlib,json,math,struct
from pathlib import Path
import gguf,numpy as np

ROOT=Path('.tmp/malay-recovery')
def header(path):
 with Path(path).open('rb') as f:
  def read(fmt):return struct.unpack('<'+fmt,f.read(struct.calcsize('<'+fmt)))
  def string():return f.read(read('Q')[0]).decode('utf-8')
  if f.read(4)!=b'GGUF':raise RuntimeError('Not GGUF.')
  version,count,metadata=read('IQQ')
  if version!=2 or metadata!=0:raise RuntimeError('Expected pinned metadata-free Candle GGUF v2.')
  tensors=[]
  for _ in range(count):
   name=string();ndim=read('I')[0];shape=read('Q'*ndim);kind,offset=read('IQ')
   block,blockbytes=gguf.GGML_QUANT_SIZES[gguf.GGMLQuantizationType(kind)]
   elements=math.prod(shape)
   if elements%block:raise RuntimeError('Invalid quantized tensor shape.')
   tensors.append({'name':name,'shape':shape,'kind':kind,'offset':offset,'bytes':elements//block*blockbytes})
  return tensors,(f.tell()+31)//32*32
def sha(path,start=0):
 h=hashlib.sha256()
 with Path(path).open('rb') as f:
  f.seek(start)
  while b:=f.read(2**20):h.update(b)
 return h.hexdigest()
def metadata(writer,config,directory):
 import sentencepiece as spm
 from sentencepiece import sentencepiece_model_pb2
 model=sentencepiece_model_pb2.ModelProto();model.ParseFromString((directory/'spiece.model').read_bytes())
 if model.trainer_spec.model_type!=1:raise RuntimeError('Expected unigram tokenizer.')
 tokenizer=spm.SentencePieceProcessor(model_file=str(directory/'spiece.model'))
 tokens=[];scores=[];types=[]
 for i in range(tokenizer.get_piece_size()):
  kind=gguf.TokenType.NORMAL
  if tokenizer.is_unknown(i):kind=gguf.TokenType.UNKNOWN
  elif tokenizer.is_control(i):kind=gguf.TokenType.CONTROL
  elif tokenizer.is_unused(i):kind=gguf.TokenType.UNUSED
  elif tokenizer.is_byte(i):kind=gguf.TokenType.BYTE
  tokens.append(tokenizer.id_to_piece(i).encode('utf-8'));scores.append(tokenizer.get_score(i));types.append(kind)
 if len(tokens)!=config['vocab_size']:raise RuntimeError('Tokenizer/vocabulary mismatch.')
 writer.add_name('MADLAD-400 3B MT official Candle Q4_K; metadata adaptation only')
 writer.add_context_length(config['n_positions']);writer.add_embedding_length(config['d_model'])
 writer.add_feed_forward_length(config['d_ff']);writer.add_block_count(config['num_layers'])
 writer.add_decoder_block_count(config['num_decoder_layers']);writer.add_head_count(config['num_heads'])
 writer.add_key_length(config['d_kv']);writer.add_value_length(config['d_kv'])
 writer.add_layer_norm_eps(config['layer_norm_epsilon']);writer.add_layer_norm_rms_eps(config['layer_norm_epsilon'])
 writer.add_relative_attn_buckets_count(config['relative_attention_num_buckets'])
 writer.add_decoder_start_token_id(config['decoder_start_token_id'])
 writer.add_file_type(gguf.LlamaFileType.MOSTLY_Q4_K_S)
 writer.add_tokenizer_model('t5');writer.add_tokenizer_pre('default')
 writer.add_token_list(tokens);writer.add_token_scores(scores);writer.add_token_types(types)
 writer.add_add_space_prefix(model.normalizer_spec.add_dummy_prefix)
 writer.add_remove_extra_whitespaces(model.normalizer_spec.remove_extra_whitespaces)
 if model.normalizer_spec.precompiled_charsmap:writer.add_precompiled_charsmap(model.normalizer_spec.precompiled_charsmap)
 gguf.SpecialVocab(directory,n_vocab=len(tokens)).add_to_gguf(writer)
 writer.add_add_bos_token(False);writer.add_add_eos_token(True)
def main():
 p=argparse.ArgumentParser();p.add_argument('--inspect-only',action='store_true');args=p.parse_args()
 original=ROOT/'madlad-q4k.gguf'
 source=original if original.exists() else ROOT/'download-parts/madlad/000000000000.part'
 tensors,source_start=header(source);mapping=gguf.get_tensor_name_map(gguf.MODEL_ARCH.T5,32)
 names=[mapping.get_name(t['name'],try_suffixes=('.weight',)) for t in tensors]
 if any(n is None for n in names) or len(set(names))!=len(names):raise RuntimeError('Unmapped or duplicate tensor names.')
 offset=0
 for t in tensors:
  if t['offset']!=offset:raise RuntimeError('Unexpected Candle tensor layout; do not copy blindly.')
  offset+=(t['bytes']+31)//32*32
 if args.inspect_only:
  print(json.dumps({'mappedTensors':len(names),'sourceDataOffset':source_start,'tensorPayloadBytes':offset,'exampleNames':names[:6]}));return
 manifest=json.loads((ROOT/'madlad-manifest.json').read_text('utf-8'))
 if not original.exists() or sha(original)!=manifest['sha256']:raise RuntimeError('Original model checksum mismatch.')
 if original.stat().st_size-source_start!=offset:raise RuntimeError('Tensor payload size mismatch.')
 output=ROOT/'madlad-llama-q4k.gguf';provenance=ROOT/'madlad-adapted-manifest.json'
 if output.exists():
  saved=json.loads(provenance.read_text('utf-8'))
  if sha(output)!=saved['sha256']:raise RuntimeError('Adapted model checksum mismatch.')
  print(json.dumps(saved));return
 temporary=output.with_suffix('.next');writer=gguf.GGUFWriter(temporary,'t5')
 config=json.loads((ROOT/'madlad-tokenizer/config.json').read_text('utf-8'));metadata(writer,config,ROOT/'madlad-tokenizer')
 for t,name in zip(tensors,names):writer.add_tensor_info(name,tuple(reversed(t['shape'])),np.dtype(np.float32),t['bytes'],raw_dtype=gguf.GGMLQuantizationType(t['kind']))
 writer.write_header_to_file();writer.write_kv_data_to_file();writer.write_ti_data_to_file();writer.close()
 target_start=(temporary.stat().st_size+31)//32*32
 with temporary.open('ab') as dst,original.open('rb') as src:
  dst.write(b'\0'*(target_start-temporary.stat().st_size));src.seek(source_start)
  while chunk:=src.read(2**20):dst.write(chunk)
 source_payload=sha(original,source_start);target_payload=sha(temporary,target_start)
 if source_payload!=target_payload:raise RuntimeError('Tensor payload changed; adaptation refused.')
 result={**manifest,'path':str(output.resolve()),'sourceSha256':manifest['sha256'],'sha256':sha(temporary),'format':'llama.cpp-compatible T5 GGUF','metadataSource':'https://github.com/ggml-org/llama.cpp/blob/b11630/conversion/t5.py','tensors':len(tensors),'payloadSha256':source_payload,'tensorPayloadUnchanged':True,'sourceDataOffset':source_start,'targetDataOffset':target_start,'tokenizerSha256':sha(ROOT/'madlad-tokenizer/spiece.model')}
 temporary.replace(output);provenance.write_text(json.dumps(result,indent=2)+'\n','utf-8');print(json.dumps(result))
if __name__=='__main__':main()
