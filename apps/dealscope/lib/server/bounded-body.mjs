// SAR DealScope server boundary: byte-accurate, fail-closed HTTP body reader.
// No auth or private valuation data is handled here.
export class BodyIntakeError extends Error {
  constructor(code, status) { super(code); this.name = 'BodyIntakeError'; this.code = code; this.status = status; }
}

async function collectBody(request, maxBytes, kind) {
  const type = request?.headers?.get?.('content-type') || '';
  const allowed = kind === 'json'
    ? /^application\/json(?:\s*;\s*charset\s*=\s*utf-8)?\s*$/i.test(type)
    : /^(multipart\/form-data;\s*boundary=[\w'()+_,.\/:=?-]{1,200}|application\/x-www-form-urlencoded)(?:\s*;.*)?$/i.test(type);
  if (!allowed) throw new BodyIntakeError('invalid_content_type', 415);
  const length = request.headers.get('content-length');
  if (length !== null) {
    const number = Number(length);
    if (!Number.isSafeInteger(number) || number < 0) throw new BodyIntakeError('invalid_content_length', 400);
    if (number > maxBytes) throw new BodyIntakeError('request_too_large', 413);
  }
  if (!request.body || typeof request.body.getReader !== 'function') throw new BodyIntakeError('empty_request', 400);
  const chunks=[];let total=0;
  const reader=request.body.getReader();
  try {
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      if(!(value instanceof Uint8Array))throw new BodyIntakeError('invalid_request', 400);
      total+=value.byteLength;
      if(total>maxBytes)throw new BodyIntakeError('request_too_large',413);
      chunks.push(value);
    }
  } catch(err){
    await reader.cancel().catch(()=>{});
    if(err instanceof BodyIntakeError)throw err;
    throw new BodyIntakeError('invalid_request',400);
  } finally {reader.releaseLock();}
  if(total===0)throw new BodyIntakeError('empty_request',400);
  const bytes=new Uint8Array(total);
  let offset=0;
  for(const part of chunks){bytes.set(part,offset);offset+=part.length;}
  return {bytes,type};
}

export async function readBoundedJson(request,maxBytes){
  const {bytes}=await collectBody(request,maxBytes,'json');
  let result;
  try { result=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)); }
  catch {throw new BodyIntakeError('invalid_request',400);}
  if(!result || typeof result!=='object' || Array.isArray(result))throw new BodyIntakeError('invalid_request',400);
  return result;
}

export async function readBoundedForm(request,maxBytes){
  const {bytes,type}=await collectBody(request,maxBytes,'form');
  try {return await new Response(bytes,{headers:{'content-type':type}}).formData();}
  catch {throw new BodyIntakeError('invalid_intake',400);}
}
