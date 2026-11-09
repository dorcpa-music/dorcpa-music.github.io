// Service worker: the site works offline after the first visit.
const V='1c0b428dcd', CORE='core-'+V, COVERS='covers-v1', EXT='ext-v1';
const CORE_FILES=['./','index.html','t.json','ar.json','manifest.webmanifest','favicon.svg','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>c.addAll(CORE_FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('core-')&&k!==CORE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const cacheFirst=(req,name)=>caches.open(name).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque')c.put(req,r.clone());return r})));
const netFirst=(req)=>fetch(req).then(r=>{if(r.ok){const cl=r.clone();caches.open(CORE).then(c=>c.put(req,cl))}return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match('index.html')));
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.origin===location.origin){
    if(u.pathname.includes('/c/'))e.respondWith(cacheFirst(req,COVERS));
    else e.respondWith(netFirst(req));
  }else if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(cacheFirst(req,EXT));
  }
});
