/* Capture-only service worker. Never cache diaries, note pages, photos or auth responses. */
const VERSION='life-os-capture-shell-v1';
const FALLBACK='/capture/offline.html';
self.addEventListener('install',(event)=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.add(FALLBACK)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',(event)=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('life-os-capture-shell-')&&k!==VERSION).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',(event)=>{
  if(event.request.method!=='GET'||event.request.mode!=='navigate')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||!['/capture','/capture/'].includes(url.pathname))return;
  event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(FALLBACK)));
});
