import { open, readFile, writeFile, rename, unlink, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

// Handles both Obsidian's daily template and an already populated Diary.
// Append at END of Timeline section. Never overwrite/replace another section.
export function appendToTimeline(original,line) {
  const nl=original.includes('\r\n')?'\r\n':'\n';
  const header=/^##[ \t]+Timeline[ \t]*\r?$/im;
  const match=header.exec(original);
  const entry=line.replace(/\r?\n/g,nl).trimEnd();
  if(!match) return original.trimEnd()+nl+nl+'## Timeline'+nl+nl+entry+nl;
  let start=match.index+match[0].length;
  if(original.slice(start).startsWith('\r\n')) start+=2;
  else if(original[start]==='\n') start++;
  const after=original.slice(start);
  const next=/^#{1,2}[ \t]+\S/m.exec(after);
  const end=next?start+next.index:original.length;
  const within=original.slice(start,end).replace(/[\r\n\t ]*$/,'');
  const updated=(within?within+nl: nl)+entry+nl+nl;
  return original.slice(0,start)+updated+original.slice(end);
}

export function newDiary(date) {
  const name=JSON.stringify(date+' 日记');
  return ['---','title: '+name,'type: diary','date: '+JSON.stringify(date),
    'visibility: private','tags: [daily]','---','','# '+date+' · 日记','',
    '## Timeline','','## 今日的小事','','## 今日待办','','## 今日回顾',''
  ].join('\n');
}

// Exclusive lock across CLI processes; never remove another process's lock.
// Atomic same-directory rename preserves old content if write is interrupted.
export async function appendDiaryEntry(target,date,line){
  await mkdir(dirname(target),{recursive:true});
  const lockPath=target+'.capture.lock';
  let lock;
  for(let attempt=0;attempt<100;attempt++){
    try{lock=await open(lockPath,'wx',0o600);break;}
    catch(error){
      if(error.code!=='EEXIST')throw error;
      if(attempt===99)throw new Error('Daily note is locked; check for stale .capture.lock before retrying.');
      await sleep(40);
    }
  }
  let temp;
  try{
    let text;
    try{text=await readFile(target,'utf8');}
    catch(error){if(error.code==='ENOENT')text=newDiary(date);else throw error;}
    const next=appendToTimeline(text,line);
    temp=target+'.capture-'+randomUUID()+'.tmp';
    await writeFile(temp,next,{flag:'wx',mode:0o600});
    await rename(temp,target);
    temp=undefined;
  }finally{
    if(temp)await unlink(temp).catch(()=>{});
    await lock?.close();
    await unlink(lockPath).catch(()=>{});
  }
}
