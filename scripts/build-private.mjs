import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cwd=fileURLToPath(new URL('../',import.meta.url));
const npm=process.platform==='win32'?'npm.cmd':'npm';
function run(file,args,env=process.env){
  const r=spawnSync(file,args,{cwd,env,stdio:'inherit',shell:process.platform==='win32'});
  if(r.error)throw r.error;
  if(r.status!==0)throw Error(file+' failed with status '+r.status);
}
function stop(){
  try{run('docker',['compose','-f','deploy/compose.private.yml','down']);}
  catch{console.error('Stop Caddy manually with: docker compose -f deploy/compose.private.yml down');}
}
run(process.execPath,['scripts/private-preflight.mjs']);
run(process.execPath,['scripts/check-auth.mjs']);
try{
  run(npm,['run','build'],{...process.env,LIFE_OS_SHOW_PRIVATE:'false',LIFE_OS_PRIVATE_BUILD:'I_HAVE_PROTECTED_THE_SITE'});
  run(process.execPath,['scripts/check-auth.mjs']);
  console.log('Protected local private build completed. Tailnet/phone access must still be checked separately.');
}catch(error){
  console.error('Failing closed: stopping Caddy after a private build/authentication failure.');
  stop();
  throw error;
}
