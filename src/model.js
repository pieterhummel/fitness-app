export const uid=()=>crypto.randomUUID();
export const copy=x=>structuredClone(x);
export function startSession(plan,day,exercises,now=Date.now()){
return {id:uid(),planId:plan.id,planName:plan.name,dayName:day.name,startedAt:now,finishedAt:null,currentId:null,restEndsAt:null,notes:'',entries:day.items.map(item=>{const e=exercises.find(e=>e.id===item.exerciseId);return {...copy(item),id:uid(),plannedExerciseId:e.id,plannedName:e.name,name:e.name,weightMode:e.weightMode,video:e.video,exerciseNotes:e.notes,alternatives:[...e.alternatives],sets:Array.from({length:item.sets},()=>({weight:null,reps:null,done:false,skipped:false}))};})};
}
export function swapExercise(session,entry,alternative){
const remaining=entry.sets.filter(s=>!s.done).length;
if(!remaining)return null;
const replacement={...copy(entry),id:uid(),exerciseId:alternative.id,name:alternative.name,weightMode:alternative.weightMode,video:alternative.video,exerciseNotes:alternative.notes,alternatives:[...alternative.alternatives],sets:Array.from({length:remaining},()=>({weight:null,reps:null,done:false,skipped:false}))};
const i=session.entries.indexOf(entry);
if(entry.sets.some(s=>s.done)){entry.sets=entry.sets.filter(s=>s.done);session.entries.splice(i+1,0,replacement);}else session.entries.splice(i,1,replacement);
session.currentId=replacement.id;return replacement;
}
export function moveEntry(session,id,delta){const i=session.entries.findIndex(e=>e.id===id),j=i+delta;if(i<0||j<0||j>=session.entries.length)return;[session.entries[i],session.entries[j]]=[session.entries[j],session.entries[i]];}
export function previousSets(history,exerciseId,weightMode){for(const h of [...history].sort((a,b)=>b.finishedAt-a.finishedAt)){const sets=h.entries.filter(e=>e.exerciseId===exerciseId&&e.weightMode===weightMode).flatMap(e=>e.sets.filter(s=>s.done));if(sets.length)return sets;}return [];}
export function counts(session){const sets=session.entries.flatMap(e=>e.sets);return {done:sets.filter(s=>s.done).length,total:sets.length,open:sets.filter(s=>!s.done&&!s.skipped).length};}
export function finishSession(session,now=Date.now()){const done=copy(session);done.finishedAt=now;done.restEndsAt=null;done.entries.forEach(e=>e.sets.forEach(s=>{if(!s.done)s.skipped=true;}));return done;}
export function safeVideo(value){if(!value)return true;try{const u=new URL(value);return u.protocol==='https:'&&['youtube.com','www.youtube.com','m.youtube.com','youtu.be'].includes(u.hostname)&&!u.username&&!u.password;}catch{return false;}}
const modes=['total','each','bodyweight','assisted'], repModes=['range','perSide','perLeg','atLeast','seconds'];
const str=x=>typeof x==='string'&&x.length<=20000;
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,100}$/.test(x);
const number=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e15;
function prescription(e){return number(e.repsMin)&&e.repsMin>0&&number(e.repsMax)&&e.repsMax>=e.repsMin&&number(e.restMin)&&number(e.restMax)&&e.restMax>=e.restMin&&repModes.includes(e.repMode)&&str(e.notes);}
function validSession(s){return s&&id(s.id)&&str(s.planName)&&str(s.dayName)&&number(s.startedAt)&&(s.finishedAt===null||number(s.finishedAt))&&(s.restEndsAt===null||number(s.restEndsAt))&&str(s.notes)&&Array.isArray(s.entries)&&s.entries.length<=500&&s.entries.every(e=>id(e.id)&&id(e.exerciseId)&&str(e.name)&&str(e.plannedName)&&modes.includes(e.weightMode)&&safeVideo(e.video)&&str(e.exerciseNotes)&&prescription(e)&&Array.isArray(e.alternatives)&&e.alternatives.every(str)&&Array.isArray(e.sets)&&e.sets.length>0&&e.sets.length<=100&&e.sets.every(x=>(x.weight===null||number(x.weight))&&(x.reps===null||number(x.reps))&&typeof x.done==='boolean'&&typeof x.skipped==='boolean'&&(!x.done||(number(x.reps)&&x.reps>0&&(e.weightMode==='bodyweight'||number(x.weight))))));}
export function validBackup(d){try{
if(!d||d.version!==1||!Array.isArray(d.exercises)||d.exercises.length>5000||!Array.isArray(d.plans)||d.plans.length>500||!Array.isArray(d.history)||d.history.length>100000)return false;
const ids=new Set(d.exercises.map(e=>e.id));if(ids.size!==d.exercises.length)return false;
return d.exercises.every(e=>id(e.id)&&str(e.name)&&e.name.trim()&&modes.includes(e.weightMode)&&str(e.notes)&&str(e.video)&&safeVideo(e.video)&&Array.isArray(e.alternatives)&&e.alternatives.every(id=>ids.has(id)))&&d.plans.every(p=>id(p.id)&&str(p.name)&&p.name.trim()&&(!p.noteKey||['sourceNote','pplNote'].includes(p.noteKey))&&Array.isArray(p.days)&&p.days.length<=100&&p.days.every(day=>id(day.id)&&str(day.name)&&Array.isArray(day.items)&&day.items.length<=500&&day.items.every(e=>id(e.id)&&ids.has(e.exerciseId)&&Number.isInteger(e.sets)&&e.sets>0&&e.sets<=100&&prescription(e))))&&d.history.every(validSession)&&(d.active===null||validSession(d.active))&&d.settings&&typeof d.settings.sound==='boolean';
}catch{return false;}}
