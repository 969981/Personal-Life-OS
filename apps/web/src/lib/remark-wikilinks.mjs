
import {wikiReferences,wikiTargetHref} from './knowledge.mjs';
const tokens=/(!?)\[\[([^\[\]\r\n]+?)\]\]/g;
function rewriteText(value){
  const output=[];let cursor=0;
  for(const match of value.matchAll(tokens)){
    if(match.index>cursor)output.push({type:'text',value:value.slice(cursor,match.index)});
    const ref=wikiReferences(match[0])[0];
    if(!ref)output.push({type:'text',value:match[0]});
    else output.push({type:'link',url:wikiTargetHref(ref.target,ref.heading),
      title:ref.embed?'笔记引用（打开目标）':null,
      children:[{type:'text',value:(ref.embed?'↳ ':'')+ref.label}]});
    cursor=match.index+match[0].length;
  }
  if(cursor<value.length)output.push({type:'text',value:value.slice(cursor)});
  return output.length?output:[{type:'text',value}];
}
export default function remarkWikilinks(){
  return (tree)=>{
    function walk(node){
      if(!Array.isArray(node.children))return;
      if(['link','linkReference','image','imageReference','code','inlineCode','html'].includes(node.type))return;
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
