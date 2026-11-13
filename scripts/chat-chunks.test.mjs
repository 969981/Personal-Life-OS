import test from 'node:test';
import assert from 'node:assert/strict';
import {chunkChat} from './chat-chunks.mjs';
test('long transcript is covered across overlapped chunks with no missing tail',()=>{
  const chat=Array.from({length:100},(_,i)=>'这是第'+i+'轮聊天，带有一个独立句子 '+('x'.repeat(110))).join('\n');
  const chunks=chunkChat(chat,3500,200);
  assert.ok(chunks.length>3);
  assert.equal(chunks[0].start,0);
  assert.equal(chunks.at(-1).end,chat.length);
  for(let i=1;i<chunks.length;i++) {
    assert.ok(chunks[i].start<chunks[i-1].end);
    assert.ok(chunks[i].start>chunks[i-1].start);
    assert.equal(chat.slice(chunks[i].start,chunks[i].end),chunks[i].text);
  }
});
test('reject pathological chunk sizes',()=>{
  assert.throws(()=>chunkChat('x',20));
  assert.throws(()=>chunkChat('x',3000,1500));
});
