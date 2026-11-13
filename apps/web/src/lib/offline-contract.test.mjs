import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('offline capture cache stores only an empty shell, not diary HTML or app assets',async()=>{
  const worker=await readFile(new URL('../../public/capture/sw.js',import.meta.url),'utf8');
  const page=await readFile(new URL('../../public/capture/offline.html',import.meta.url),'utf8');
  assert.match(worker,/const FALLBACK='\/capture\/offline\.html'/);
  assert.match(worker,/cache\.add\(FALLBACK\)/);
  assert.match(worker,/event\.request\.mode!=='navigate'/);
  assert.doesNotMatch(worker,/\/notes\//);
  assert.doesNotMatch(worker,/\/_gallery\//);
  assert.doesNotMatch(worker,/cache\.put\(event\.request/);
  assert.match(page,/obsidian:\/\/daily|obsidian:\/\/'\+entry\.action/);
  assert.match(page,/heading','Timeline'/);
  assert.doesNotMatch(page,/fetch\(/);
  assert.doesNotMatch(page,/indexedDB|localStorage\.setItem\('draft'/);
});
