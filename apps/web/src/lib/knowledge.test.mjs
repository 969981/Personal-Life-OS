
import test from 'node:test';
import assert from 'node:assert/strict';
import {extractDiaryTimeline,timelineItems,wikiReferences,resolveWiki,incomingLinks,wikiTargetHref} from './knowledge.mjs';
const note=(id,title,type,body,aliases=[])=>({id,body,data:{title,type,date:new Date('2026-11-13T00:00:00Z'),aliases}});
test('QuickAdd and CLI log lines appear in Moments, without tasks or code fences',()=>{
  const diary=note('Diary/2026/11/2026-11-13','今天','diary',[
    '# 日记','## Timeline','- 09:31 💭 晨间记录','- 10:15 💡 灵感出现',
    '- [ ] 待办','~~~','- 12:00 💭 代码围栏','~~~',
    '## 今日的小事','- 18:00 💭 这条不应展示'
  ].join('\n'));
  const entries=extractDiaryTimeline(diary.body);
  assert.equal(entries.length,2);
  assert.equal(entries[0].time,'09:31');
  assert.equal(entries[1].icon,'💡');
  const timeline=timelineItems([diary,note('Moments/memo','独立碎片','moment','')]);
  assert.equal(timeline.length,3);
  assert.equal(timeline[0].time,'10:15');
  assert.ok(timeline[0].href.endsWith('#timeline'));
});
test('Wiki aliases, headings, embeds and backlinks respect the visible notes set',()=>{
  const target=note('Knowledge/长久笔记','长期知识','knowledge','# 文本',['别名']);
  const source=note('Diary/day','某天','diary',
    '有 [[长期知识|短标题]] [[Knowledge/长久笔记#子标题]] ![[别名]] 和 '+String.fromCharCode(96)+'[[忽略]]'+String.fromCharCode(96));
  const refs=wikiReferences(source.body);
  assert.equal(refs.length,3);
  assert.equal(refs[1].heading,'子标题');
  assert.equal(refs[2].embed,true);
  assert.equal(resolveWiki([source,target],'别名')?.id,target.id);
  assert.equal(incomingLinks([source,target],target).length,1);
  assert.equal(resolveWiki([source,target],'秘密'),null);
});
test('Ambiguous name does not guess; traversal above vault is rejected',()=>{
  const a=note('Ideas/Alpha','一个','idea','');
  const b=note('Knowledge/Alpha','另一个','knowledge','');
  assert.equal(resolveWiki([a,b],'Alpha'),null);
  assert.equal(resolveWiki([a,b],'Ideas/Alpha')?.id,a.id);
  assert.equal(wikiTargetHref('../../secret'),'#');
});
