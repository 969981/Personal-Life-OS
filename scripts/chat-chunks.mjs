// Chunk a long transcript by newline boundaries with small overlaps.
// Chunk offsets refer to JS UTF-16 indexes; no content leaves the local process.
export function chunkChat(text, maxChars=7000, overlap=240) {
  if(typeof text!=='string'||!text.trim())throw new Error('Expected nonempty chat text.');
  if(!Number.isInteger(maxChars)||maxChars<3000||maxChars>20000) {
    throw new Error('Chunk length must be an integer between 3000 and 20000.');
  }
  if(overlap<0||overlap>=maxChars/3)throw new Error('Overlap is too large.');
  const chunks=[];
  let start=0;
  while(start<text.length){
    let end=Math.min(text.length,start+maxChars);
    if(end<text.length){
      const lineEnd=text.lastIndexOf('\n',end);
      if(lineEnd>start+Math.floor(maxChars*.65))end=lineEnd+1;
    }
    chunks.push({text:text.slice(start,end),start,end});
    if(end===text.length)break;
    const next=Math.max(start+1,end-overlap);
    start=next;
  }
  return chunks;
}
