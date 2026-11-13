import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const [cmd,id]=process.argv.slice(2);
const vault=resolve(process.env.LIFE_OS_VAULT_DIR??fileURLToPath(new URL('../vault/',import.meta.url)));
const folder=join(vault,'Sync-Probes');
if(cmd==='create'){
  await mkdir(folder,{recursive:true});
  const token=randomBytes(8).toString('hex');
  const target=join(folder,'probe-'+token+'.md');
  const content=['---','title: "Vault 双向同步测试"','type: knowledge','visibility: private',
    'tags: [sync-probe]','---','','# Vault 双向同步测试','',
    '这是由电脑生成的同步测试文件。标记：'+token,'',
    '请在手机 Obsidian 打开文件，然后将下面的文字作为新的一行加在文末：','',
    '> PHONE-CONFIRMED: '+token,'',
    '请不要复制开头的引用符号 >，只添加纯文本行。',''
  ].join('\n');
  await writeFile(target,content,{flag:'wx',mode:0o600});
  console.log('SYNC_PROBE_ID='+token);
  console.log('On phone, open Sync-Probes/probe-'+token+'.md and append plain line: PHONE-CONFIRMED: '+token);
  console.log('On PC, run: npm run sync:probe -- verify '+token);
}else if(['verify','clean'].includes(cmd)){
  if(!/^[a-f0-9]{16}$/.test(id??''))throw Error('Expected 16-hex probe ID.');
  const path=join(folder,'probe-'+id+'.md');
  if(cmd==='verify'){
    const text=await readFile(path,'utf8');
    const present=text.split(/\r?\n/).some(s=>s.trim()==='PHONE-CONFIRMED: '+id);
    if(!present)throw Error('No mobile confirmation found on this PC yet; check synchronization.');
    console.log('Vault bidirectional sync test PASS (this test note only).');
  }else{
    await unlink(path);
    console.log('Sync probe removed locally; confirm deletion propagates to mobile.');
  }
}else{
  console.error('Usage: npm run sync:probe -- create | verify <id> | clean <id>');
  process.exitCode=2;
}
