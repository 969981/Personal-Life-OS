// Build-time gallery allowlist. Never ships all vault attachments or media automatically.
// NOTE: only photos explicitly declared public are shipped in public builds.
import { readdir, readFile, mkdir, copyFile, rm, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args=new Set(process.argv.slice(2));
const privateEnabled=args.has('--include-private') ||
 process.env.LIFE_OS_PRIVATE_BUILD==='I_HAVE_PROTECTED_THE_SITE';
if(args.has('--include-private') && !args.has('--trusted-local-preview')) {
  throw new Error('--include-private requires --trusted-local-preview for local use.');
}
const vault=resolve(process.env.LIFE_OS_VAULT_DIR ?? fileURLToPath(new URL('../vault/',import.meta.url)));
const target=resolve(fileURLToPath(new URL('../apps/web/public/_gallery/',import.meta.url)));
await rm(target,{recursive:true,force:true});
await mkdir(target,{recursive:true});
const photos=join(vault,'Photos');
let filenames=[];
try { filenames=(await readdir(photos)).filter((x)=>x.endsWith('.md')); }
catch(error) { if(error.code!=='ENOENT') throw error; }
let copied=0, skipped=0;
for(const filename of filenames) {
  const text=await readFile(join(photos,filename),'utf8');
  const match=text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if(!match) { skipped++; continue; }
  const front=match[1];
  const visibility=front.match(/^visibility:\s*(?:"|')?(public|private|local-only)(?:"|')?\s*$/m)?.[1]??'private';
  const photo=front.match(/^photo_file:\s*["']?([a-f0-9]{20}\.webp)["']?\s*$/m)?.[1];
  if(!photo || visibility==='local-only' || (visibility!=='public' && !privateEnabled)) { skipped++; continue; }
  const source=join(vault,'Photo-Media',photo);
  try { await access(source); } catch { throw new Error('Missing approved photo file: '+photo); }
  await copyFile(source,join(target,photo));
  copied++;
}
console.log('Gallery build: '+copied+' approved image(s), '+skipped+' excluded. Private='+privateEnabled);
