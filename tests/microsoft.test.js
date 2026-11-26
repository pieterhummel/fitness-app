import test from 'node:test';
import assert from 'node:assert/strict';
import * as microsoft from '../src/microsoft.js';
let configuration,active,requests=[];
const fakeAccount={homeAccountId:'synthetic-test-account',name:'Test user',username:'test@example.invalid'};
class FakeMsal{
 constructor(config){configuration=config;active=null;}
 async initialize(){}async handleRedirectPromise(){return null;}
 getActiveAccount(){return active;}setActiveAccount(value){active=value;}
 getAllAccounts(){return [fakeAccount];}
 async acquireTokenSilent(){return {accessToken:'synthetic-test-token-not-a-real-credential'};}
 async loginRedirect(request){requests.push(request);}
 async acquireTokenRedirect(request){requests.push(request);}
 async clearCache(){active=null;}
}
globalThis.location={origin:'https://fitnessapp.kudazo.nl'};
globalThis.msal={PublicClientApplication:FakeMsal};
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
test('Microsoft login targets personal accounts and remembers the SDK session',async()=>{await microsoft.initializeMicrosoft();assert.equal(configuration.auth.authority,'https://login.microsoftonline.com/consumers');assert.equal(configuration.auth.redirectUri,'https://fitnessapp.kudazo.nl/');assert.equal(configuration.cache.cacheLocation,'localStorage');assert.equal(configuration.auth.clientSecret,undefined);await microsoft.signIn();assert.ok(requests.at(-1).scopes.includes('Files.ReadWrite.AppFolder'));await microsoft.signOut();assert.equal(microsoft.account(),null);});
test('discovery follows trusted Graph pages and keeps the newest device revision',async()=>{await microsoft.initializeMicrosoft();const original=globalThis.fetch;let calls=0;globalThis.fetch=async url=>{calls++;if(url.endsWith('/special/approot'))return response({id:'folder'});if(calls===2)return response({value:[{id:'old',name:'fitness-sync-11111111-1111-4111-8111-111111111111-1.json'}],'@odata.nextLink':'https://graph.microsoft.com/v1.0/me/drive/items/folder/children?$skiptoken=next'});return response({value:[{id:'new',name:'fitness-sync-11111111-1111-4111-8111-111111111111-2.json'}]});};try{const snapshots=await microsoft.cloudSnapshots();assert.equal(snapshots.length,1);assert.equal(snapshots[0].id,'new');assert.equal(calls,3);}finally{globalThis.fetch=original;}});
test('a malicious pagination URL cannot receive the Microsoft bearer token',async()=>{await microsoft.initializeMicrosoft();const original=globalThis.fetch;let calls=0;globalThis.fetch=async url=>{calls++;return response(url.endsWith('/special/approot')?{id:'folder'}:{value:[],'@odata.nextLink':'https://example.invalid/steal-token'});};try{await assert.rejects(microsoft.cloudSnapshots());assert.equal(calls,2);}finally{globalThis.fetch=original;}});
test('download URLs receive no bearer token or browser cookies',async()=>{await microsoft.initializeMicrosoft();const original=globalThis.fetch;let downloadOptions;globalThis.fetch=async(url,options)=>{if(String(url).startsWith('https://graph.microsoft.com')){assert.ok(options.headers.Authorization);return response({size:20,'@microsoft.graph.downloadUrl':'https://download.example.invalid/file'});}downloadOptions=options;return response({format:'fixture'});};try{const file=await microsoft.downloadSnapshot({id:'file-id'});assert.equal(file.format,'fixture');assert.equal(downloadOptions.credentials,'omit');assert.equal(downloadOptions.headers,undefined);}finally{globalThis.fetch=original;}});
test('different device revisions upload to different file paths',async()=>{await microsoft.initializeMicrosoft();const original=globalThis.fetch,urls=[];globalThis.fetch=async(url,options)=>{urls.push(url);assert.equal(options.method,'PUT');return response({id:'uploaded'});};try{const actor='11111111-1111-4111-8111-111111111111';await microsoft.uploadSnapshot({deviceId:actor,clock:{[actor]:1}});await microsoft.uploadSnapshot({deviceId:actor,clock:{[actor]:2}});assert.notEqual(urls[0],urls[1]);assert.match(urls[0],/-1.json/);assert.match(urls[1],/-2.json/);}finally{globalThis.fetch=original;}});
test('permission failures keep a clear recoverable status',async()=>{await microsoft.initializeMicrosoft();const original=globalThis.fetch;globalThis.fetch=async()=>response({},403);try{await assert.rejects(microsoft.cloudSnapshots(),e=>e.key==='syncPermissionError');}finally{globalThis.fetch=original;}});
