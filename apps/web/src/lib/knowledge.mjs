
// Build-time Markdown indexing. Always pass only visibility-filtered notes.
const wikiPattern=/(!?)\[\[([^\[\]\r\n]+?)\]\]/g;
const bodyOf=(note)=>typeof note.body==='string'?note.body:'';
export function withoutCode(markdown) {
  let fence='';
  return String(markdown).split(/\r?\n/).map(line=>{
    const m=line.match(/^\s*(\x60{3,}|~{3,})/);
    if(m) {
      if(!fence){fence=m[1][0];return '';}
      if(m[1][0]===fence){fence='';return '';}
    }
    if(fence)return '';
    return line.replace(/\x60+[^\x60]*\x60+/g,'');
  }).join('\n');
}
export function wikiReferences(markdown){
  const refs=[];
  for(const m of withoutCode(markdown).matchAll(wikiPattern)){
    const inner=m[2].trim();
    const pipe=inner.indexOf('|');
    const raw=(pipe<0?inner:inner.slice(0,pipe)).trim();
    const label=(pipe<0?raw:inner.slice(pipe+1)).trim()||raw;
    const hash=raw.indexOf('#');
    const target=(hash<0?raw:raw.slice(0,hash)).trim();
    const heading=hash<0?'':raw.slice(hash+1).trim();
    if(target&&!/[<>]/.test(target)) refs.push({target,label,heading,embed:m[1]==='!'});
  }
  return refs;
}
export function normalizeTarget(input){
  const value=String(input).replaceAll('\\','/').replace(/\.md$/i,'').replace(/^\/+/,'').trim().toLocaleLowerCase();
  if(!value||value.includes('?')||value.includes('#'))return '';
  const parts=[];
  for(const part of value.split('/')){
    if(!part||part==='.')continue;
    if(part==='..'){if(!parts.length)return '';parts.pop();continue;}
    parts.push(part);
  }
  return parts.join('/');
}
export function resolveWiki(notes,target,source=null){
  const key=normalizeTarget(target);
  if(!key)return null;
  const exact=notes.filter(n=>normalizeTarget(n.id)===key);
  if(exact.length!==0)return exact.length===1?exact[0]:null;
  if(source){
    const folder=source.id.split('/').slice(0,-1).join('/');
    const relative=normalizeTarget(folder+'/'+target);
    const match=notes.filter(n=>normalizeTarget(n.id)===relative);
    if(match.length!==0)return match.length===1?match[0]:null;
  }
  const matches=notes.filter(n=>{
    const aliases=Array.isArray(n.data.aliases)?n.data.aliases:[];
    return normalizeTarget(n.id.split('/').at(-1))===key||
      normalizeTarget(n.data.title)===key||
      aliases.some(a=>normalizeTarget(a)===key);
  });
  return matches.length===1?matches[0]:null;
}
export function noteReferences(note){
  const body=withoutCode(bodyOf(note));
  const refs=wikiReferences(body).map(r=>r.target);
  for(const m of body.matchAll(/(?<!!)\[[^\]\n]+\]\(([^)\n]+\.md)(?:#[^)\n]*)?\)/g)){
    if(!/^(?:https?:|data:|\/\/)/i.test(m[1]))refs.push(m[1].trim());
  }
  return [...new Set(refs)];
}
export function incomingLinks(notes,destination){
  return notes.filter(source=>source.id!==destination.id&&noteReferences(source).some(target=>resolveWiki(notes,target,source)?.id===destination.id));
}
export function wikiTargetHref(target,heading=''){
  const path=normalizeTarget(target);
  if(!path)return '#';
  const dest='/wiki/'+path.split('/').map(encodeURIComponent).join('/');
  const hash=heading?('#'+encodeURIComponent(heading.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}\-_ ]/gu,'').replace(/\s+/g,'-'))):'';
  return dest+hash;
}
export function extractDiaryTimeline(markdown){
  const lines=withoutCode(markdown).split('\n');
  const items=[];
  let inTimeline=false;
  for(const line of lines){
    if(/^##\s+Timeline\s*$/i.test(line.trim())){inTimeline=true;continue;}
    if(inTimeline&&/^#{1,2}\s+/.test(line.trim()))break;
    if(!inTimeline)continue;
    const m=line.match(/^\s*-\s+([01]?\d|2[0-3]):([0-5]\d)\s+(?:([💭💡📷📝])\s*)?(.+?)\s*$/u);
    if(m&&m[4].trim())items.push({time:m[1].padStart(2,'0')+':'+m[2],icon:m[3]??'💭',text:m[4].trim()});
  }
  return items;
}
export function timelineItems(notes){
  const results=[];
  for(const n of notes){
    const date=(n.data.date??n.data.created??new Date('2000-01-01T00:00:00Z')).toISOString().slice(0,10);
    const href='/notes/'+n.id.split('/').map(encodeURIComponent).join('/');
    if(n.data.type==='diary'){
      extractDiaryTimeline(bodyOf(n)).forEach((row,i)=>results.push({
        key:'diary:'+n.id+':'+i,kind:'diary',date,time:row.time,title:row.text,icon:row.icon,href:href+'#timeline',sort:date+'T'+row.time
      }));
    }else if(n.data.type==='moment'){
      results.push({
        key:'moment:'+n.id,kind:'moment',date,time:'',title:n.data.title,
        summary:n.data.summary??'',icon:'💭',href,sort:date+'T00:00'
      });
    }
  }
  return results.sort((a,b)=>b.sort.localeCompare(a.sort)||b.key.localeCompare(a.key));
}
