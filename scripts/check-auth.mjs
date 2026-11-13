// Verify all routes protected by Caddy. Credentials only via transient env vars.
const args={};
for(let i=2;i<process.argv.length;i++){
  if(process.argv[i]==='--allow-tailnet'){args.allowTailnet=true;continue;}
  if(process.argv[i]?.startsWith('--'))args[process.argv[i].slice(2)]=process.argv[++i]??'';
}
const base=new URL(args.base??'http://127.0.0.1:8088/');
const local=['127.0.0.1','localhost','[::1]','::1'].includes(base.hostname);
const tailnet=args.allowTailnet&&base.protocol==='https:'&&base.hostname.endsWith('.ts.net');
if(!(local||tailnet)||base.username||base.password||base.pathname!=='/'||base.search||base.hash)
  throw Error('Only localhost is permitted unless --allow-tailnet and HTTPS .ts.net are explicit.');
const user=process.env.LIFE_OS_TEST_USER,pass=process.env.LIFE_OS_TEST_PASSWORD;
if(!user||!pass)throw Error('Set LIFE_OS_TEST_USER and LIFE_OS_TEST_PASSWORD in a local shell; never pass a password as a command argument.');
const good='Basic '+Buffer.from(user+':'+pass).toString('base64');
const bad='Basic '+Buffer.from('bad-user:bad-password').toString('base64');
const paths=['/','/diary/','/moments/','/photos/','/knowledge/','/search/','/capture/',
  '/capture/sw.js','/capture/offline.html','/notes/samples/idea-demo/',
  '/wiki/unresolved/','/embed/unresolved/','/_gallery/not-found.webp','/not-a-file'];
async function hit(path,method,auth){
  const response=await fetch(new URL(path,base),{
    method,redirect:'manual',cache:'no-store',headers:auth?{Authorization:auth}:{},
    signal:AbortSignal.timeout(8000)
  });
  await response.body?.cancel();
  return response;
}
for(const path of paths)for(const method of ['GET','HEAD']){
  const r=await hit(path,method);
  if(r.status!==401)throw Error('SECURITY FAIL anonymous '+method+' '+path+' returned '+r.status);
}
for(const path of ['/','/capture/offline.html','/_gallery/not-found.webp']){
  if((await hit(path,'GET',bad)).status!==401)throw Error('SECURITY FAIL invalid password accepted: '+path);
}
for(const path of ['/','/capture/','/capture/offline.html','/notes/samples/idea-demo/']){
  const r=await hit(path,'GET',good);
  if(r.status!==200)throw Error('Authorized GET failed '+path+': '+r.status);
  if(!(r.headers.get('cache-control')??'').includes('no-store'))throw Error('Cache-Control must contain no-store: '+path);
}
if((await hit('/_gallery/not-found.webp','GET',good)).status!==404)throw Error('Expected 404 for absent authorized image');
console.log('AUTH PASS: '+paths.length+' paths blocked for anonymous GET/HEAD, wrong password rejected, allowed pages require login and no-store.');
