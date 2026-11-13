import test from 'node:test';
import assert from 'node:assert/strict';
import plugin from './remark-wikilinks.mjs';
test('embed creates sandboxed inline frame, not direct private Markdown content',()=>{
  const tree={type:'root',children:[{type:'paragraph',children:[{type:'text',value:'引用 ![[Knowledge/Long Note]] 和 [[Open Me]]'}]}]};
  plugin()(tree,{path:'/repo/vault/Samples/source.md'});
  const fragments=tree.children[0].children;
  const embedded=fragments.find(x=>x.type==='html');
  assert.ok(embedded);
  assert.match(embedded.value,/class="life-embed-frame"/);
  assert.match(embedded.value,/sandbox=""/);
  assert.match(embedded.value,/src="\/embed\/knowledge\/long%20note"/);
  assert.doesNotMatch(embedded.value,/<script|onload=/);
  assert.ok(fragments.find(x=>x.type==='link'));
});
