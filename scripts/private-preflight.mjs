import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const env=await readFile(resolve(root,'deploy/.private.env'),'utf8').catch(()=>{throw Error('Create ignored deploy/.private.env from deploy/private.env.example first.');});
const caddy=await readFile(resolve(root,'deploy/Caddyfile.private'),'utf8');
const compose=await readFile(resolve(root,'deploy/compose.private.yml'),'utf8');
function value(key){
  const row=env.split(/\r?\n/).find(s=>s.startsWith(key+'='));
  let v=row?.slice(key.length+1).trim()??'';
  if((v.startsWith("'")&&v.endsWith("'"))||(v.startsWith('"')&&v.endsWith('"')))v=v.slice(1,-1);
  return v;
}
function check(ok,msg){if(!ok)throw Error('Private deployment preflight: '+msg);}
check(/^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,50}$/.test(value('LIFE_OS_BASIC_USER'))&&value('LIFE_OS_BASIC_USER')!=='your-username','choose a non-placeholder username');
check(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value('LIFE_OS_BASIC_HASH')),'provide a real bcrypt hash, not a plaintext password');
check(/^\s*basic_auth\s*{/m.test(caddy),'Caddy must protect the entire site using basic_auth');
check(/Cache-Control.*no-store/.test(caddy),'missing no-store');
check(/127\.0\.0\.1:8088:80/.test(compose)&&!/0\.0\.0\.0:8088:80/.test(compose),'bind only 127.0.0.1');
console.log('Private deployment STATIC preflight PASS; hash and secrets not printed.');
console.log('Continue with actual authenticated HTTP checks before building any private site.');
