"""Inspect metadata/tensor names from a complete GGUF or its first saved range."""
import json,struct,sys
from pathlib import Path
def inspect(path):
 with Path(path).open('rb') as stream:
  def unpack(fmt):return struct.unpack('<'+fmt,stream.read(struct.calcsize('<'+fmt)))
  def string():return stream.read(unpack('Q')[0]).decode('utf-8')
  def value(kind):
   if kind==8:return string()
   if kind==9:
    subtype,count=unpack('IQ');values=[value(subtype) for _ in range(count)]
    return values if count<32 else {'arrayLength':count}
   return unpack({0:'B',1:'b',2:'H',3:'h',4:'I',5:'i',6:'f',7:'?',10:'Q',11:'q',12:'d'}[kind])[0]
  if stream.read(4)!=b'GGUF':raise RuntimeError('Not GGUF.')
  version,tensors,keys=unpack('IQQ');metadata={}
  for _ in range(keys):
   key=string();metadata[key]=value(unpack('I')[0])
  names=[]
  for _ in range(tensors):
   name=string();dimensions=unpack('I')[0];shape=unpack('Q'*dimensions);kind,offset=unpack('IQ')
   names.append({'name':name,'shape':shape,'type':kind,'offset':offset})
  return {'version':version,'tensorCount':tensors,'metadata':metadata,'firstTensors':names[:8],'headerBytes':stream.tell()}
if __name__=='__main__':print(json.dumps(inspect(sys.argv[1]),ensure_ascii=False,indent=2))
