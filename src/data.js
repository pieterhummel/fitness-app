const ex=(id,name,mode='total',video='',notes='',alternatives=[])=>({id,name,weightMode:mode,video,notes,alternatives});
const row=(exerciseId,sets,min,max,restMin,restMax=restMin,repMode='range')=>({id:crypto.randomUUID(),exerciseId,sets,repsMin:min,repsMax:max,restMin,restMax,repMode,notes:''});
export function seed(){
const exercises=[
ex('incline','Low Incline Dumbbell Press','each','','Bench at a low incline; keep chest up and elbows controlled.',['incline-machine','incline-barbell']),
ex('pullup','Pull-Ups','bodyweight','','Use an alternative if needed.',['band-pullup','lat-pulldown']),
ex('lateral','Dumbbell Lateral Raises','each','','Avoid swinging; raise arms slightly forward.',['cable-lateral']),
ex('chest-row','Dumbbell Chest Supported Row','each','https://youtu.be/kNvy2_9Ji2w','Mid/upper back focus.',['cable-row']),
ex('pushup','Banded Push-Ups','bodyweight','https://youtu.be/dI7LVElfMOg','Last set: take to failure as prescribed in the source plan.',['close-pushup']),
ex('squat','Barbell Back Squat','total','','Use your preferred stance and controlled depth.',['leg-press','goblet']),
ex('rdl','Dumbbell Romanian Deadlift','each','https://youtu.be/Xu4DxwKWzl4','Push hips back with a slight knee bend.',['barbell-rdl']),
ex('extension','Seated Leg Extensions','total','','Control the lowering phase.'),
ex('standing-calf','Standing Weighted Calf Raises','total','','Record your chosen load convention consistently.'),
ex('pallof','Pallof Press','total','https://youtu.be/WhCH2CwVo4I','Use a cable or band.',['bird','deadbug','side-plank']),
ex('bench','Barbell Bench Press','total','','Keep feet planted and chest up.',['flat-db']),
ex('cable-row','Seated Cable Row','total','https://youtu.be/Q-5V5T55giY','Mid/upper back focus.',['chest-row']),
ex('ohp','Standing Barbell Overhead Press','total','','Brace your trunk and avoid excessive back arch.',['db-shoulder']),
ex('fly','Standing Mid-Chest Cable Fly','total','','Set cables at chest height.',['pecdeck']),
ex('curl','Behind Body Cable Curls','total','','Keep the upper arm controlled.',['incline-curl']),
ex('facepull','Standing Face Pulls','total','','Use a light load with controlled movement.'),
ex('deadlift','Barbell Deadlift','total','','Keep head, back and hips aligned.',['rdl','trapbar']),
ex('lunge','Front Foot Elevated Reverse Lunges','each','','Alternate legs.',['stepup','single-press']),
ex('curl-leg','Seated Leg Curls','total','','Keep your lower back controlled.',['lying-curl']),
ex('seated-calf','Seated Weighted Calf Raises','total','','Lower heels under control.'),
ex('bird','Bird Dog','bodyweight','https://youtu.be/4qE_9h_6Hes','Extend the opposite arm and leg.',['pallof','deadbug','side-plank']),
ex('incline-machine','Incline Machine Chest Press','total','https://youtu.be/abc1fisYB3w'),ex('incline-barbell','Low Incline Barbell Press','total','https://youtu.be/jW4j7FoqudI'),ex('band-pullup','Banded Pull-Ups','bodyweight','https://youtu.be/VGm-f5-T5no'),ex('lat-pulldown','Lat Pulldowns','total','https://youtu.be/AvYZZhEl7Xk'),ex('cable-lateral','Cable Lateral Raise','total','https://youtu.be/1muit9qEctY'),ex('close-pushup','Close-Grip Push-Ups','bodyweight','https://youtu.be/ZtAz8gupAss'),ex('leg-press','Quad-Focused Leg Press','total','https://youtu.be/0nrW-q7-WRQ'),ex('goblet','Dumbbell Goblet Squat','total','https://youtu.be/nYDEYFXN2Rs'),ex('barbell-rdl','Barbell Romanian Deadlift','total','https://youtu.be/Q-2telZDPRw'),ex('flat-db','Flat Dumbbell Press','each','https://youtu.be/g14dhC5KYBM'),ex('db-shoulder','Standing Dumbbell Shoulder Press','each','https://youtu.be/jWriqmLrQqs'),ex('pecdeck','Pec-Deck Machine Fly','total','https://youtu.be/rnV3y1P7894'),ex('incline-curl','Incline Dumbbell Curls','each','https://youtu.be/3D56VDVkQnM'),ex('trapbar','Trap Bar Deadlift','total','https://youtu.be/5mnlJtf-7WM'),ex('stepup','Weighted Step-Ups','each','https://youtu.be/Cjc3AgmdtlA'),ex('single-press','Single-Leg Leg Press','total','https://youtu.be/hdioTTf8qdw'),ex('lying-curl','Lying Leg Curls','total','https://youtu.be/aYy3alWRDmk'),ex('deadbug','Dead Bug','bodyweight','https://youtu.be/UJ7b8gYa2Es'),ex('side-plank','Side Plank','bodyweight','https://youtu.be/o4LGPtKjbhU')];
return {version:1,exercises,plans:[{id:'upper-lower',name:'Upper / Lower',noteKey:'sourceNote',days:[{id:'upper1',name:'Upper 1',items:[row('incline',3,8,10,120,180),row('pullup',3,6,12,120,180),row('lateral',3,15,20,90,120),row('chest-row',3,10,12,90,120),row('pushup',3,10,10,90,120,'atLeast')]},{id:'lower1',name:'Lower 1',items:[row('squat',3,8,10,120,180),row('rdl',3,10,12,120),row('extension',3,10,15,90,120),row('standing-calf',3,10,15,90),row('pallof',2,5,5,60,60,'perSide')]},{id:'upper2',name:'Upper 2',items:[row('bench',3,8,10,120,180),row('cable-row',3,8,10,90,120),row('ohp',3,6,8,120,180),row('fly',3,10,15,90,120),row('curl',3,10,12,90,120),row('facepull',3,10,10,60)]},{id:'lower2',name:'Lower 2',items:[row('deadlift',3,6,8,120,180),row('lunge',3,8,10,120,120,'perLeg'),row('curl-leg',3,10,15,90,120),row('seated-calf',3,10,15,90),row('bird',2,5,5,60,60,'perSide')]}]},{id:'ppl',name:'Push / Pull / Legs',noteKey:'pplNote',days:['Push','Pull','Legs'].map((name,i)=>({id:'ppl-'+i,name,items:[]}))}],history:[],active:null,settings:{sound:true}};
}
