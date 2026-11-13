import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const bin=fileURLToPath(new URL('./import-memos.mjs',import.meta.url));
test('Memos import is opt-in, private and idempotent',async (t)=>{
  const tmp=await mkdtemp(join(tmpdir(),'life-os-memos-'));
  t.after(()=>rm(tmp,{recursive:true,force:true}));
  const vault=join(tmp,'vault');
  const fixture=join(tmp,'input.json');
  await writeFile(fixture,JSON.stringify({memos:[
    {name:'memos/123', content:'# 这里是私人原文', createTime:'2026-11-11T08:00:00Z',tags:['life'],visibility:'PUBLIC'}
  ]}));
  const execute=(apply)=>{
    const args=[bin,'--file',fixture];
    if(apply) args.push('--apply');
    return spawnSync(process.execPath,args,{env:{...process.env,LIFE_OS_VAULT_DIR:vault},encoding:'utf8'});
  };
  const preview=execute(false);
  assert.equal(preview.status,0,preview.stderr);
  const {access}=await import('node:fs/promises');
  await assert.rejects(access(join(vault,'Moments')));
  const first=execute(true);
  assert.equal(first.status,0,first.stderr);
  const names=await readdir(join(vault,'Moments'));
  assert.equal(names.length,1);
  const content=await readFile(join(vault,'Moments',names[0]),'utf8');
  assert.match(content,/visibility: private/);
  assert.match(content,/source_visibility: "PUBLIC"/);
  assert.match(content,/这里是私人原文/);
  const second=execute(true);
  assert.equal(second.status,0,second.stderr);
  assert.match(second.stdout,/skipped 1 duplicate/);
});
