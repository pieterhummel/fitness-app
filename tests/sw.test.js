import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
function worker({offline=false}={}){
 const handlers={},calls=[],shell={kind:'cached-shell'},cache={addAll:async files=>calls.push(['precache',files]),match:async key=>{calls.push(['match',key]);return typeof key==='string'?shell:undefined;},put:async key=>calls.push(['put',key])};
 const response={ok:true,kind:'fresh-shell',clone(){return this;}};
 const context={URL,AbortController,setTimeout,clearTimeout,caches:{open:async name=>{calls.push(['open',name]);return cache;},keys:async()=>['kudazo-fitness-v5','kudazo-fitness-v6','other-app'],delete:async key=>calls.push(['delete',key])},fetch:async()=>{if(offline)throw Error('Offline');return response;},self:{location:{origin:'https://fitnessapp.kudazo.nl',href:'https://fitnessapp.kudazo.nl/sw.js'},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>calls.push(['skipWaiting']),clients:{claim:async()=>calls.push(['claim'])}}};
 vm.runInNewContext(source,context);
 return {handlers,calls,run:async type=>{let pending;handlers[type]({waitUntil:p=>pending=p});await pending;},fetch:async(mode='navigate')=>{let pending;handlers.fetch({request:{method:'GET',url:'https://fitnessapp.kudazo.nl/',mode},respondWith:p=>pending=p});return pending;}};
}
test('installation precaches versioned modules and activates without closing tabs',async()=>{const w=worker();await w.run('install');assert.ok(w.calls.some(x=>x[0]==='skipWaiting'));const files=w.calls.find(x=>x[0]==='precache')[1];assert.ok(files.includes('./src/app.js?v=6'));assert.ok(files.includes('./src/model.js?v=6'));});
test('online navigation refreshes the app shell',async()=>{const w=worker();assert.equal((await w.fetch()).kind,'fresh-shell');assert.ok(w.calls.some(x=>x[0]==='put'));});
test('offline navigation restores the current cached shell',async()=>{const w=worker({offline:true});assert.equal((await w.fetch()).kind,'cached-shell');assert.equal(w.calls.find(x=>x[0]==='match')[1],'./index.html?build=6');});
test('activation removes stale fitness caches without touching other apps',async()=>{const w=worker();await w.run('activate');assert.deepEqual(w.calls.filter(x=>x[0]==='delete'),[['delete','kudazo-fitness-v5']]);assert.ok(w.calls.some(x=>x[0]==='claim'));});
