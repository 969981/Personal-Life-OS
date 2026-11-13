import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, appendFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli=fileURLToPath(new URL('./sync-probe.mjs',import.meta.url));
test('PC to mobile and back probe only passes after a real appended confirmation',async t=>{
  const tmp=await mkdtemp(join(tmpdir(),'life-os-sync-probe-'));
  t.after(()=>rm(tmp,{recursive:true,force:true}));
  const exec=(...args)=>spawnSync(process.execPath,[cli,...args],{
    env:{...process.env,LIFE_OS_VAULT_DIR:tmp},encoding:'utf8'
  });
  const created=exec('create');
  assert.equal(created.status,0,created.stderr);
  const id=created.stdout.match(/SYNC_PROBE_ID=([a-f0-9]{16})/)?.[1];
  assert.ok(id);
  const names=await readdir(join(tmp,'Sync-Probes'));
  assert.equal(names.length,1);
  const path=join(tmp,'Sync-Probes',names[0]);
  const original=await readFile(path,'utf8');
  assert.match(original,/visibility: private/);
  assert.notEqual(original.split(/\r?\n/).some(s=>s.trim()==='PHONE-CONFIRMED: '+id),true);
  const tooEarly=exec('verify',id);
  assert.notEqual(tooEarly.status,0);
  await appendFile(path,'\nPHONE-CONFIRMED: '+id+'\n');
  const valid=exec('verify',id);
  assert.equal(valid.status,0,valid.stderr);
  const cleared=exec('clean',id);
  assert.equal(cleared.status,0,cleared.stderr);
  assert.deepEqual(await readdir(join(tmp,'Sync-Probes')),[]);
});
