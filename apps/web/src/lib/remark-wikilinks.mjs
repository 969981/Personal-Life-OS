
import {wikiReferences,wikiTargetHref,normalizeTarget} from './knowledge.mjs';
const tokens=/(!?)\[\[([^\[\]\r\n]+?)\]\]/g;
function rewriteText(value){
  const output=[];let cursor=0;
  for(const match of value.matchAll(tokens)){
    if(match.index>cursor)output.push({type:'text',value:value.slice(cursor,match.index)});
    const ref=wikiReferences(match[0])[0];
    if(!ref)output.push({type:'text',value:match[0]});
    else if(ref.embed) {
      // Sandbox transclusions: only visible notes receive /embed routes at build time.
      // No raw source filenames or unsanitized HTML are interpolated.
      const target=normalizeTarget(ref.target);
      const slug=target.split('/').map(encodeURIComponent).join('/');
      const destination='/embed/'+slug;
      const fullLink=wikiTargetHref(ref.target,ref.heading);
      output.push({type:'html',value:
        '<span class="life-embed"><iframe class="life-embed-frame" sandbox="" referrerpolicy="no-referrer" loading="lazy" title="笔记内容预览" src="'+destination+'"></iframe>'+
        '<a class="life-embed-open" href="'+fullLink+'">打开完整笔记 ↗</a></span>'
      });
    } else output.push({type:'link',url:wikiTargetHref(ref.target,ref.heading),
      title:null,children:[{type:'text',value:ref.label}]});
    cursor=match.index+match[0].length;
  }
  if(cursor<value.length)output.push({type:'text',value:value.slice(cursor)});
  return output.length?output:[{type:'text',value}];
}
export default function remarkWikilinks(){
  return (tree,file)=>{
    const origin=String(file?.path??'').replaceAll('\\','/');
    const marker=origin.lastIndexOf('/vault/');
    const source=marker>=0?origin.slice(marker+7):'';
    const directory=source.split('/').slice(0,-1).join('/');
    function walk(node){
      if(!Array.isArray(node.children))return;
      if(node.type==='link' && typeof node.url==='string'){
        // Rewrite local Markdown links through the same privacy-filtered Wiki router.
        const match=node.url.match(/^([^?#]+\.md)(?:#([^?]+))?$/i);
        if(match&&!/^(https?:|data:|\/\/)/i.test(match[1])){
          const local=match[1].startsWith('/')?match[1].slice(1):((directory?directory+'/':'')+match[1]);
          const resolved=normalizeTarget(local);
          if(resolved)node.url=wikiTargetHref(resolved,match[2]??'');
        }
        return;
      }
      if(['linkReference','image','imageReference','code','inlineCode','html'].includes(node.type))return;
      const out=[];
      for(const child of node.children){
        if(child.type==='text'&&child.value.includes('[['))out.push(...rewriteText(child.value));
        else{walk(child);out.push(child);}
      }
      node.children=out;
    }
    walk(tree);
  };
}
