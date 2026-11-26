const BUILD='7';
const CACHE=`kudazo-fitness-v${BUILD}`;
const ROOT=new URL('./',self.location.href).pathname;
const SHELL=`./index.html?build=${BUILD}`;
const FILES=[SHELL,'./style.css?v=7','./src/app.js?v=7','./src/microsoft.js?v=7','./src/sync-model.js?v=7','./vendor/msal-browser-4.30.0.min.js','./src/model.js?v=7','./src/data.js?v=7','./src/storage.js?v=7','./locales/en.json?v=7','./manifest.webmanifest?v=7','./icons/favicon.png?v=7','./icons/icon-maskable-512.png?v=7','./icons/icon-192.png?v=7','./icons/icon-512.png?v=7','./icons/apple-touch-icon.png?v=7'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kudazo-fitness-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(request.mode==='navigate'&&(url.pathname===ROOT||url.pathname===ROOT+'index.html')){
   // Refresh the app shell when online; a timestamped cache still works offline.
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4000);
   try{const response=await fetch(request,{cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error('Navigation failed');await cache.put(SHELL,response.clone());return response;}
   catch(error){const saved=await cache.match(SHELL);if(saved)return saved;throw error;}
   finally{clearTimeout(timeout);}
  }
  return (await cache.match(request))||fetch(request);
 })());
});
