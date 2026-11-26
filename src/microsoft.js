// Public OAuth application ID. This is not a client secret.
export const CLIENT_ID='d1835dac-96e0-4789-adfc-4d3f318ff087';
const SCOPES=['Files.ReadWrite.AppFolder','User.Read'];
let instance;
export function account(){return instance?.getActiveAccount()||null;}
export async function initializeMicrosoft(){
 if(!globalThis.msal)throw Error('Microsoft sign-in library could not load.');
 instance=new msal.PublicClientApplication({auth:{clientId:CLIENT_ID,authority:'https://login.microsoftonline.com/consumers',redirectUri:new URL('./',location.origin).href,postLogoutRedirectUri:new URL('./',location.origin).href,navigateToLoginRequestUrl:false},cache:{cacheLocation:'localStorage'}});
 await instance.initialize();const result=await instance.handleRedirectPromise();if(result?.account)instance.setActiveAccount(result.account);
 if(!account()){const accounts=instance.getAllAccounts();if(accounts.length===1)instance.setActiveAccount(accounts[0]);}
 return account();
}
export async function signIn(){if(!instance)await initializeMicrosoft();return instance.loginRedirect({scopes:SCOPES,prompt:'select_account'});}
export function reconnect(){return instance.acquireTokenRedirect({account:account(),scopes:SCOPES});}
export async function accessToken(){try{if(!account())throw Error();return (await instance.acquireTokenSilent({account:account(),scopes:SCOPES})).accessToken;}catch{throw new SyncError('syncNeedsLogin');}}
export async function signOut(){const current=account();await instance.clearCache({account:current});instance.setActiveAccount(null);}
export class SyncError extends Error{constructor(key){super(key);this.key=key;}}
const GRAPH='https://graph.microsoft.com/v1.0';
async function graph(path,options={}){
 if(!path.startsWith('/me/drive/'))throw new SyncError('syncFailed');
 const token=await accessToken(),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
 try{const response=await fetch(GRAPH+path,{...options,signal:controller.signal,cache:'no-store',headers:{Authorization:`Bearer ${token}`,...options.headers}});if(response.status===401)throw new SyncError('syncNeedsLogin');if(response.status===403)throw new SyncError('syncPermissionError');if(response.status===429)throw new SyncError('syncThrottled');if(!response.ok)throw new SyncError('syncFailed');return await response.json();}
 finally{clearTimeout(timeout);}
}
const FILE=/^fitness-sync-([a-f0-9-]{36})-(\d+)\.json$/i;
export async function cloudSnapshots(){
 const folder=await graph('/me/drive/special/approot');if(!folder.id)throw new SyncError('syncFailed');
 const latest=new Map();let path=`/me/drive/items/${encodeURIComponent(folder.id)}/children?$select=id,name,size,eTag`;let count=0;
 while(path){const result=await graph(path);if(!Array.isArray(result.value))throw new SyncError('syncInvalidData');for(const item of result.value){const match=FILE.exec(item.name);if(!match)continue;const sequence=Number(match[2]);if(!Number.isSafeInteger(sequence)||sequence<=0)continue;const old=latest.get(match[1]);if(!old||old.sequence<sequence)latest.set(match[1],{...item,deviceId:match[1],sequence});}if(++count>200)throw new SyncError('syncTooManyFiles');if(result['@odata.nextLink']){const u=new URL(result['@odata.nextLink']);if(u.origin!=='https://graph.microsoft.com'||!u.pathname.startsWith('/v1.0/me/drive/'))throw new SyncError('syncFailed');path=u.pathname.slice('/v1.0'.length)+u.search;}else path=null;}
 return [...latest.values()];
}
export async function downloadSnapshot(item){
 const meta=await graph(`/me/drive/items/${encodeURIComponent(item.id)}`);if(meta.size>25*1024*1024)throw new SyncError('syncTooLarge');
 const url=new URL(meta['@microsoft.graph.downloadUrl']);if(url.protocol!=='https:'||url.username||url.password)throw new SyncError('syncInvalidData');
 // This URL is supplied by Graph and already authorized. Never send the bearer token to it.
 const response=await fetch(url.href,{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok)throw new SyncError('syncFailed');const text=await response.text();if(text.length>25*1024*1024)throw new SyncError('syncTooLarge');return JSON.parse(text);
}
export async function uploadSnapshot(replica){
 const sequence=replica.clock[replica.deviceId],name=`fitness-sync-${replica.deviceId}-${sequence}.json`,content=JSON.stringify(replica);
 if(new TextEncoder().encode(content).length>25*1024*1024)throw new SyncError('syncTooLarge');
 // A distinct file for each device and revision prevents one device overwriting another.
 return graph(`/me/drive/special/approot:/${name}:/content`,{method:'PUT',headers:{'Content-Type':'application/json'},body:content});
}
