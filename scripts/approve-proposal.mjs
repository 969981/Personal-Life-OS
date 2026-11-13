// Manual, explicit move of an AI proposal. Never alters chat source.
import { readFile, mkdir, rename } from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = {};
for(let i=2;i<process.argv.length;i++) if(process.argv[i]?.startsWith('--')) args[process.argv[i].slice(2)]=process.argv[++i] ?? '';
if (!/^[a-f0-9]{16}$/.test(args.id ?? '') || !['Ideas','Knowledge','Projects'].includes(args.target)) {
  throw new Error('Usage: node scripts/approve-proposal.mjs --id <16-hex> --target Ideas|Knowledge|Projects');
}
const vault=resolve(process.env.LIFE_OS_VAULT_DIR ?? fileURLToPath(new URL('../vault/',import.meta.url)));
const source=join(vault,'00-Inbox','AI-Proposals','proposal-'+args.id+'.md');
const text=await readFile(source,'utf8');
if(!/^status: pending-review$/m.test(text) || !/^visibility: private$/m.test(text)) {
  throw new Error('Proposal is not a pending private draft.');
}
const type={Ideas:'idea',Knowledge:'knowledge',Projects:'project'}[args.target];
if(!new RegExp('^type: '+type+'$','m').test(text)) throw new Error('Target type does not match proposal.');
const destDir=join(vault,args.target);
await mkdir(destDir,{recursive:true});
const destination=join(destDir,'proposal-'+args.id+'.md');
const reviewed=text.replace(/^status: pending-review$/m,'status: reviewed');
const { writeFile, unlink }=await import('node:fs/promises');
await writeFile(destination,reviewed,{flag:'wx',mode:0o600});
await unlink(source);
console.log('Approved and moved to private Markdown folder: '+destination);
