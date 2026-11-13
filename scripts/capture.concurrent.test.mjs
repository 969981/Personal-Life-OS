import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,readFile,readdir,rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const bin=fileURLToPath(new URL('./capture.mjs',import.meta.url));
const run=(vault,n)=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[bin,'--type','diary','--text','concurrent record '+n],{
    env:{...process.env,LIFE_OS_VAULT_DIR:vault},stdio:['ignore','pipe','pipe']
  });
  let output='';
  child.stderr.on('data',chunk=>output+=chunk);
  child.on('error',reject);
  child.on('close',code=>code===0?resolve():reject(new Error(output+' exit '+code)));
});
test('12 concurrent capture processes on this OS do not lose or duplicate entries',async(t)=>{
  const vault=await mkdtemp(join(tmpdir(),'life-os-concurrent-'));
  t.after(()=>rm(vault,{force:true,recursive:true}));
  await Promise.all(Array.from({length:12},(_,i)=>run(vault,i)));
  const [year]=await readdir(join(vault,'Diary'));
  const [month]=await readdir(join(vault,'Diary',year));
  const [file]=await readdir(join(vault,'Diary',year,month));
  const document=await readFile(join(vault,'Diary',year,month,file),'utf8');
  const captured=[...document.matchAll(/^- \d\d:\d\d 💭 concurrent record (\d+)$/gm)].map(match=>Number(match[1]));
  assert.equal(captured.length,12);
  assert.deepEqual([...captured].sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i));
});
