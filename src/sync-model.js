import {copy,validBackup} from './model.js?v=6';
export const GROUPS=['plans','exercises','history'];
const DEVICE=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const keyOK=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
const dictionary=x=>x&&typeof x==='object'&&!Array.isArray(x);
const stable=x=>JSON.stringify(normalize(x));
function normalize(x){if(Array.isArray(x))return x.map(normalize);if(!x||typeof x!=='object')return x;return Object.fromEntries(Object.keys(x).sort().map(k=>[k,normalize(x[k])]));}
function comparable(value){const v=copy(value);if(v?.days)v.days.forEach(day=>day.items.forEach(item=>delete item.id));return v;}
export const equivalent=(a,b)=>stable(comparable(a))===stable(comparable(b));
export function shared(data){return Object.fromEntries(GROUPS.map(g=>[g,copy(data[g])]));}
export function isPristine(data,defaults){return GROUPS.every(g=>equivalent(data[g],defaults[g]));}
// Ignore random prescription row IDs when comparing independently seeded devices.
export function isDefaultData(data,defaults){return equivalent({days:data.plans.flatMap(p=>p.days)}, {days:defaults.plans.flatMap(p=>p.days)})&&stable(data.plans.map(({days,...p})=>p))===stable(defaults.plans.map(({days,...p})=>p))&&equivalent(data.exercises,defaults.exercises)&&data.history.length===0&&!data.active;}
export function compareClocks(a,b){let higher=false,lower=false;for(const key of new Set([...Object.keys(a),...Object.keys(b)])){const av=a[key]||0,bv=b[key]||0;if(av>bv)higher=true;if(av<bv)lower=true;}return higher&&lower?null:higher?1:lower?-1:0;}
export function unionClocks(...clocks){const result={};for(const clock of clocks)for(const[k,v]of Object.entries(clock))result[k]=Math.max(result[k]||0,v);return result;}
export function newReplica(deviceId,deviceName){return {format:'kudazo-fitness-sync-v1',deviceId,deviceName,clock:{[deviceId]:0},records:{plans:{},exercises:{},history:{}}};}
export function trackChanges(replica,before,after){const changes=[];for(const group of GROUPS){const a=new Map((before?.[group]||[]).map(v=>[v.id,v])),b=new Map(after[group].map(v=>[v.id,v]));for(const id of new Set([...a.keys(),...b.keys()]))if(!equivalent(a.get(id)??null,b.get(id)??null))changes.push({group,id,value:b.get(id)??null});}
if(!changes.length)return false;replica.clock[replica.deviceId]=(replica.clock[replica.deviceId]||0)+1;for(const change of changes)replica.records[change.group][change.id]={value:copy(change.value),clock:copy(replica.clock)};return true;}
export function materialize(replica,local){const result=copy(local);for(const group of GROUPS)result[group]=Object.values(replica.records[group]).filter(r=>r.value!==null).map(r=>copy(r.value));result.history.sort((a,b)=>a.finishedAt-b.finishedAt);return result;}
export function mergeReplicas(local,remotes){const result=copy(local),conflicts=[];result.clock=unionClocks(local.clock,...remotes.map(r=>r.clock));for(const group of GROUPS){const ids=new Set([local,...remotes].flatMap(r=>Object.keys(r.records[group])));for(const id of ids){let candidates=[];for(const replica of [local,...remotes]){const record=replica.records[group][id];if(!record)continue;const entry={...copy(record),deviceName:replica.deviceName,deviceId:replica.deviceId};if(candidates.some(c=>{const cmp=compareClocks(c.clock,entry.clock);return cmp===1||(cmp===0&&equivalent(c.value,entry.value));}))continue;candidates=candidates.filter(c=>compareClocks(c.clock,entry.clock)!==-1);const equal=candidates.find(c=>equivalent(c.value,entry.value));if(equal)equal.clock=unionClocks(equal.clock,entry.clock);else candidates.push(entry);}
if(candidates.length>1)conflicts.push({group,id,candidates});const first=candidates[0];result.records[group][id]={value:copy(first.value),clock:copy(first.clock)};}}
return {replica:result,conflicts};}
export function resolveConflicts(merge,choices){const replica=copy(merge.replica);if(!merge.conflicts.length)return replica;replica.clock[replica.deviceId]=(replica.clock[replica.deviceId]||0)+1;merge.conflicts.forEach((conflict,i)=>{const chosen=conflict.candidates[choices[i]];if(!chosen)throw Error('Invalid conflict choice');replica.records[conflict.group][conflict.id]={value:copy(chosen.value),clock:copy(replica.clock)};});return replica;}
export function validReplica(replica){try{
if(!replica||replica.format!=='kudazo-fitness-sync-v1'||!DEVICE.test(replica.deviceId)||typeof replica.deviceName!=='string'||replica.deviceName.length>80||!validClock(replica.clock)||!dictionary(replica.records))return false;
for(const group of GROUPS){const entries=Object.entries(replica.records[group]);if(entries.length>100000)return false;for(const[id,r]of entries){if(!keyOK(id)||!r||!validClock(r.clock)||compareClocks(replica.clock,r.clock)===-1||compareClocks(replica.clock,r.clock)===null||!(r.value===null||r.value.id===id))return false;}}
const d=materialize(replica,{version:1,plans:[],exercises:[],history:[],active:null,settings:{sound:true}});return validBackup(d)&&d.history.every(h=>h.finishedAt!==null);
}catch{return false;}}
function validClock(clock){return dictionary(clock)&&Object.keys(clock).length<=1000&&Object.entries(clock).every(([id,count])=>DEVICE.test(id)&&Number.isSafeInteger(count)&&count>=0&&count<=1e9);}
