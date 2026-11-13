// Optional Memos -> Markdown one-way importer. Never modifies Memos itself.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function parseArgs(argv) {
  const opts = { apply: false };
  for (let i=2;i<argv.length;i++) {
    const key=argv[i];
    if(key==='--apply') { opts.apply=true; continue; }
    if(key.startsWith('--')) opts[key.slice(2)]=argv[++i] ?? '';
  }
  return opts;
}
const args=parseArgs(process.argv);
if(Boolean(args.file)===Boolean(args.url)) {
  console.error('Usage: node scripts/import-memos.mjs --file export.json [--apply] OR --url https://your-memos.example [--apply]');
  process.exit(2);
}
function validDate(input) {
  const parsed=new Date(input ?? Date.now());
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString().slice(0,10) : '1970-01-01';
}
function yaml(value) { return JSON.stringify(String(value).replaceAll('\r',' ').replaceAll('\n',' ')); }
async function fetchMemos(base) {
  const origin=new URL(base);
  const local=['localhost','127.0.0.1','::1','[::1]'].includes(origin.hostname);
  if(origin.protocol!=='https:' && !(origin.protocol==='http:' && local)) {
    throw new Error('Memos URL must use HTTPS, except localhost.');
  }
  if(origin.username || origin.password || origin.search || origin.hash ||
     !['/','/api/','/api/v1/','/api','/api/v1'].includes(origin.pathname)) {
    throw new Error('Provide Memos instance origin, without credentials or query parameters.');
  }
  const token=process.env.MEMOS_TOKEN;
  if(!token) throw new Error('Set MEMOS_TOKEN in your local environment, not in a committed file.');
  const paths=origin.pathname.includes('v1') ? ['/api/v1/memos','/api/memos'] :
    origin.pathname.includes('/api') ? ['/api/memos','/api/v1/memos'] : ['/api/memos','/api/v1/memos'];
  const gathered=[];
  let chosen;
  let next='';
  const seen=new Set();
  for(let page=0;page<50;page++) {
    let successful=false;
    for(const path of (chosen ? [chosen] : paths)) {
      const url=new URL(path,origin);
      url.searchParams.set('pageSize','100');
      if(next) url.searchParams.set('pageToken',next);
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),10000);
      let response;
      try {
        response=await fetch(url,{
          headers:{Authorization:'Bearer '+token,Accept:'application/json'},
          signal:controller.signal,
          redirect:'error',
        });
      } finally { clearTimeout(timeout); }
      if(!response.ok) {
        if(!chosen && [404,405].includes(response.status)) continue;
        throw new Error('Memos API HTTP '+response.status+' (path '+path+'); token is never printed.');
      }
      const data=await response.json();
      if(!Array.isArray(data.memos)) throw new Error('Unexpected Memos API response shape.');
      gathered.push(...data.memos);
      next=typeof data.nextPageToken==='string' ? data.nextPageToken : '';
      chosen=path;
      successful=true;
      break;
    }
    if(!successful) throw new Error('No supported Memos API endpoint found (tried /api/memos and /api/v1/memos).');
    if(!next) return gathered;
    if(seen.has(next)) throw new Error('Repeated page token detected.');
    seen.add(next);
  }
  throw new Error('More than 50 Memos pages; stop and import in smaller batches.');
}

const raw=args.file ? JSON.parse(await readFile(resolve(args.file),'utf8')) : await fetchMemos(args.url);
const memos=Array.isArray(raw) ? raw : Array.isArray(raw?.memos) ? raw.memos : null;
if(!memos) throw new Error('Input JSON must be a memo array or an object with memos array.');
if(memos.length>5000) throw new Error('Safety limit: only 5000 memos per import.');
const vault=resolve(process.env.LIFE_OS_VAULT_DIR ?? fileURLToPath(new URL('../vault/',import.meta.url)));
const folder=join(vault,'Moments');
if(args.apply) await mkdir(folder,{recursive:true});
let created=0,skipped=0,invalid=0;
for(const memo of memos) {
  if(!memo || typeof memo.content!=='string' || !memo.content.trim()) { invalid++; continue; }
  const sourceId=String(memo.name ?? memo.id ?? '').trim();
  const date=validDate(memo.createTime ?? memo.createdTs ?? memo.createdTime);
  const identity=sourceId || (date+':'+memo.content);
  const hash=createHash('sha256').update(identity).digest('hex').slice(0,20);
  const filename='memos-'+date+'-'+hash+'.md';
  const title=String(memo.property?.title || memo.content.split('\n').find((x)=>x.trim()) || '碎碎念').trim().replace(/^#+\s*/,'').slice(0,80);
  const tags=Array.isArray(memo.tags) ? memo.tags.filter((x)=>typeof x==='string').map((x)=>x.slice(0,40)).slice(0,10) : [];
  const metadata=[
    '---','title: '+yaml(title),'type: moment','created: '+yaml(date),'visibility: private',
    'tags: '+JSON.stringify([...new Set(['memos',...tags])]),
    'source: memos','source_id: '+yaml(sourceId),
    'source_visibility: '+yaml(memo.visibility ?? 'unknown'),
    'source_hash: '+yaml(createHash('sha256').update(memo.content).digest('hex')),
    '---','','# '+title.replaceAll('\n',' '),'',memo.content.trim(),'',
    '> 从 Memos 导入，原始内容保留；附件没有自动下载。',''
  ].join('\n');
  if(args.apply) {
    try { await writeFile(join(folder,filename),metadata,{flag:'wx',mode:0o600}); created++; }
    catch(error) { if(error.code==='EEXIST') skipped++; else throw error; }
  } else created++;
}
console.log((args.apply?'Imported ':'Dry-run: would import ')+created+' memo(s); skipped '+skipped+' duplicate(s); invalid '+invalid+'.');
if(!args.apply) console.log('No files written. Add --apply after reviewing count.');
else console.log('All imported records have visibility: private and are ignored by Public Git.');
