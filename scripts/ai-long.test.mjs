import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp,readFile,readdir,writeFile,mkdir,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const bin=fileURLToPath(new URL('./ai-organize-multi.mjs',import.meta.url));
const launch=(file,args,env)=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[file,...args],{env,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';
  child.stdout.on('data',x=>stdout+=x);
  child.stderr.on('data',x=>stderr+=x);
  child.on('error',reject);
  child.on('close',code=>resolve({code,stdout,stderr}));
});
test('long Chinese transcript is chunked and multiple evidenced ideas are deduplicated',async t=>{
  const tmp=await mkdtemp(join(tmpdir(),'life-os-long-ai-'));
  t.after(()=>rm(tmp,{recursive:true,force:true}));
  const vault=join(tmp,'vault'),folder=join(vault,'Chat-Captures');
  await mkdir(folder,{recursive:true});
  const original=Array.from({length:6},(_,i)=>
    '### 主题'+i+'\n'+ '要做项目'+i+'的独立记录功能，写入系统。\n' + '长聊天材料'.repeat(420)+'\n'
  ).join('\n');
  const input=join(folder,'chat.md');
  await writeFile(input,original);
  let calls=0;
  const server=createServer(async(req,res)=>{
    let body='';
    for await(const chunk of req) body+=chunk;
    const request=JSON.parse(body);
    calls++;
    const matches=[...request.prompt.matchAll(/要做项目(\d+)的独立记录功能，写入系统/g)];
    const index=matches.length?Number(matches[0][1]):null;
    const item=index===null?[]:[{
      title:'项目'+index+'记录',category:'idea',summary:'该项目可以单独创建记录',
      evidence:'要做项目'+index+'的独立记录功能，写入系统',
      tags:['test'],actions:['验证原文']
    }];
    res.writeHead(200,{'content-type':'application/json'});
    res.end(JSON.stringify({response:JSON.stringify({items:item})}));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>server.close());
  const env={...process.env,LIFE_OS_VAULT_DIR:vault,OLLAMA_URL:'http://127.0.0.1:'+server.address().port};
  const args=['--input',input,'--model','mock','--max','6','--chunk-chars','3200'];
  const first=await launch(bin,args,env);
  assert.equal(first.code,0,first.stderr);
  assert.ok(calls>=4,'expected multiple local model requests for long chat');
  const proposed=join(vault,'00-Inbox','AI-Proposals');
  const names=await readdir(proposed);
  assert.ok(names.length>=3,'expected several separate themes');
  for(const name of names){
    const note=await readFile(join(proposed,name),'utf8');
    assert.match(note,/status: pending-review/);
    assert.match(note,/source_evidence/);
    assert.match(note,/visibility: private/);
  }
  const second=await launch(bin,args,env);
  assert.equal(second.code,0,second.stderr);
  assert.deepEqual(await readdir(proposed),names);
  assert.equal(await readFile(input,'utf8'),original);
});
