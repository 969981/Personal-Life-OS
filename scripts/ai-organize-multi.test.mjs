
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const program=fileURLToPath(new URL('./ai-organize-multi.mjs',import.meta.url));
const approve=fileURLToPath(new URL('./approve-proposal.mjs',import.meta.url));
const run=(file,args,env)=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[file,...args],{env,stdio:['ignore','pipe','pipe']});
  let out='',err='';
  child.stdout.on('data',x=>out+=x);
  child.stderr.on('data',x=>err+=x);
  child.on('error',reject);
  child.on('exit',code=>resolve({code,out,err}));
});
test('One input yields multiple independently reviewable notes; invalid evidence dropped',async t=>{
  const tmp=await mkdtemp(join(tmpdir(),'life-os-multi-'));
  t.after(()=>rm(tmp,{recursive:true,force:true}));
  const vault=join(tmp,'vault'),folder=join(vault,'Chat-Captures');
  await mkdir(folder,{recursive:true});
  const original='我想把摄影相册自动按日期分组。其次希望能记录每天随手想到的一个点子。';
  const input=join(folder,'chat.md');
  await writeFile(input,original);
  const server=createServer(async(req,res)=>{
    let request='';
    for await(const chunk of req)request+=chunk;
    assert.match(JSON.parse(request).system,/不可信|未经信任/);
    res.writeHead(200,{'content-type':'application/json'});
    res.end(JSON.stringify({response:JSON.stringify({items:[
      {title:'摄影相册自动分组',category:'project',summary:'按日期整理相册',
       evidence:'我想把摄影相册自动按日期分组',tags:['摄影'],actions:['做一个日期筛选器']},
      {title:'随手灵感',category:'idea',summary:'捕捉日常想法',
       evidence:'希望能记录每天随手想到的一个点子',tags:['灵感'],actions:['设置快捷键']},
      {title:'臆造',category:'idea',summary:'没有来源',evidence:'这句原文不存在'},
    ]})}));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>server.close());
  const env={...process.env,LIFE_OS_VAULT_DIR:vault,OLLAMA_URL:'http://127.0.0.1:'+server.address().port};
  const first=await run(program,['--input',input,'--model','mock'],env);
  assert.equal(first.code,0,first.err);
  assert.match(first.out,/saved=2/);
  assert.match(first.out,/rejected=1/);
  const draftDir=join(vault,'00-Inbox','AI-Proposals');
  const names=await readdir(draftDir);
  assert.equal(names.length,2);
  const again=await run(program,['--input',input,'--model','mock'],env);
  assert.equal(again.code,0,again.err);
  assert.match(again.out,/duplicate=2/);
  for(const name of names){
    const file=await readFile(join(draftDir,name),'utf8');
    assert.match(file,/visibility: private/);
    assert.match(file,/source_evidence:/);
    assert.match(file,/status: pending-review/);
    const type=file.match(/^type: (.+)$/m)[1];
    const target=type==='idea'?'Ideas':'Projects';
    const result=await run(approve,['--id',name.match(/proposal-([a-f0-9]{16})/)[1],'--target',target],env);
    assert.equal(result.code,0,result.err);
    assert.match(await readFile(join(vault,target,name),'utf8'),/status: reviewed/);
  }
  assert.equal(await readFile(input,'utf8'),original);
});
