const CACHE='mi-malla-upse-v4';
const SHELL=['./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const url=new URL(r.url);

  if(r.mode==='navigate'){
    e.respondWith(
      fetch(r,{cache:'no-store'}).catch(()=>caches.match('./index.html'))
    );
    return;
  }

  if(url.origin===self.location.origin){
    e.respondWith(
      fetch(r).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(r,copy));
        return res;
      }).catch(()=>caches.match(r))
    );
  }
});
