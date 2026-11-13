// Explicit local-only private preview, without remote bindings.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url));
const env={...process.env,LIFE_OS_SHOW_PRIVATE:'true',LIFE_OS_PRIVATE_BUILD:''};
const prepare=spawnSync(process.execPath,[fileURLToPath(new URL('./prepare-photos.mjs',import.meta.url)),'--include-private','--trusted-local-preview'],{
  cwd:repo,env,stdio:'inherit'
});
if(prepare.status!==0) process.exit(prepare.status??1);
const npm=process.platform==='win32'?'npm.cmd':'npm';
const run=spawnSync(npm,['--prefix','apps/web','run','dev'],{cwd:repo,env,stdio:'inherit',shell:process.platform==='win32'});
process.exit(run.status??1);
