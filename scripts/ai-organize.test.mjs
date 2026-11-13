import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const organizer=fileURLToPath(new URL('./ai-organize.mjs',import.meta.url));
const approver=fileURLToPath(new URL('./approve-proposal.mjs',import.meta.url));
async function exec(file,args,env) {
  return await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[file,...args],{env,stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    child.stdout.on('data',(x)=>stdout+=x);
    child.stderr.on('data',(x)=>stderr+=x);
    child.on('error',reject);
    child.on('exit',(status)=>resolve({status,stdout,stderr}));
  });
}
test('local Ollama draft requires manual approval; raw chat is unchanged',async(t)=>{
  const tmp=await mkdtemp(join(tmpdir(),'life-os-ai-'));
  t.after(()=>rm(tmp,{recursive:true,force:true}));
  const vault=join(tmp,'vault');
  const sourceDir=join(vault,'Chat-Captures');
  await mkdir(sourceDir,{recursive:true});
  const source=join(sourceDir,'sample.md');
  const content='这是用户明确选取的聊天原文：想法是给日记加自动归档。\n不允许发布原始聊天。';
  await writeFile(source,content);
  const server=createServer(async(req,res)=>{
    if(req.url!=='/api/generate' || req.method!=='POST') {res.writeHead(404).end();return;}
    let body='';
    for await (const chunk of req) body+=chunk;
    const params=JSON.parse(body);
    assert.match(params.prompt,/明确选取/);
    assert.equal(params.stream,false);
    assert.equal(params.format,'json');
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({response:JSON.stringify({
      title:'自动归档灵感',category:'idea',
      summary:'希望把日记内容形成长期可检索的归档。',
      tags:['diary','automation'],
      actions:['创建最小原型','验证私密发布']
    })}));
  });
  await new Promise((resolve)=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>server.close());
  const port=server.address().port;
  const env={...process.env,LIFE_OS_VAULT_DIR:vault,OLLAMA_URL:'http://127.0.0.1:'+port};
  const organized=await exec(organizer,['--input',source,'--provider','ollama','--model','mock-test'],env);
  assert.equal(organized.status,0,organized.stderr);
  const dir=join(vault,'00-Inbox','AI-Proposals');
  const names=await readdir(dir);
  assert.equal(names.length,1);
  assert.equal(await readFile(source,'utf8'),content);
  const proposal=await readFile(join(dir,names[0]),'utf8');
  assert.match(proposal,/status: pending-review/);
  assert.match(proposal,/visibility: private/);
  const id=names[0].match(/^proposal-([a-f0-9]{16})\.md$/)?.[1];
  assert.ok(id);
  const approval=await exec(approver,['--id',id,'--target','Ideas'],env);
  assert.equal(approval.status,0,approval.stderr);
  assert.match(await readFile(join(vault,'Ideas',names[0]),'utf8'),/status: reviewed/);
  assert.equal(await readFile(source,'utf8'),content);
});
