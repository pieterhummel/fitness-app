const dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('kudazo-fitness',1);req.onupgradeneeded=()=>req.result.createObjectStore('state');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
async function get(key){const db=await dbPromise;return new Promise((resolve,reject)=>{const tx=db.transaction('state','readonly'),req=tx.objectStore('state').get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export const read=()=>get('app');
export const readSync=()=>get('sync');
export async function write(data,sync){const db=await dbPromise;return new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(data,'app');if(sync!==undefined)tx.objectStore('state').put(sync,'sync');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
