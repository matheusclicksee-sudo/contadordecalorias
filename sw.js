/* Saldo Kcal — service worker: deixa o app funcionar 100% offline */
const CACHE='saldo-kcal-v2';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html'])));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      if(hit)return hit;
      return fetch(e.request).then(res=>{
        // guarda no cache: arquivos do próprio site e libs de CDN (Tesseract/OCR),
        // para que até a leitura de rótulo funcione offline depois do primeiro uso
        try{
          const copia=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copia));
        }catch(_){}
        return res;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
