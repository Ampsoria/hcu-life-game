import fs from 'node:fs';
import vm from 'node:vm';

const elements = new Map();
const storage = new Map();
const element = (key) => {
  if (!elements.has(key)) {
    const classes = new Set();
    elements.set(key, {style:{setProperty(){}},dataset:{},classList:{toggle(name,value){if(value===undefined)value=!classes.has(name);value?classes.add(name):classes.delete(name)},add(name){classes.add(name)},remove(name){classes.delete(name)},contains(name){return classes.has(name)}},setAttribute(){},querySelector(){return {focus(){}}},focus(){},hidden:false,textContent:'',innerHTML:'',onclick:null});
  }
  return elements.get(key);
};
const context = vm.createContext({
  console,
  Math,
  Date,
  performance:{now:()=>0},
  requestAnimationFrame:()=>0,
  location:{hostname:'localhost',protocol:'http:',origin:'http://localhost'},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  document:{body:{style:{}},getElementById:element,querySelector:element,querySelectorAll:()=>[],addEventListener:()=>{}},
  confirm:()=>true,
});
const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/\ninit\(\);\s*$/,'');
vm.runInContext(fs.readFileSync(new URL('../dist/scene-art.js',import.meta.url),'utf8'),context);
vm.runInContext(source,context);
if(!vm.runInContext("honorTier(3.24)===null && honorTier(3.25)==='second' && honorTier(3.6)==='first' && honorTier(4)==='gold'",context))throw new Error('Honors thresholds or medal tiers are incorrect');
if(!vm.runInContext("specialBadgeKinds(84,84).length===0 && specialBadgeKinds(85,84).join()==='activity' && specialBadgeKinds(84,85).join()==='overall' && specialBadgeKinds(85,85).join()==='activity,overall'",context))throw new Error('Activity or overall Badge thresholds are incorrect');
const badgeLabels=[];
context.badgeContext={fillRect(){},fillText(value){badgeLabels.push(String(value))}};
vm.runInContext("drawHonorBadge(badgeContext,'second',0,0);drawHonorBadge(badgeContext,'first',0,0);drawHonorBadge(badgeContext,'gold',0,0)",context);
if(!['SECOND','FIRST','GOLD'].every(label=>badgeLabels.includes(label)))throw new Error('Export medals do not distinguish each honors tier');
const sceneMotion={campus:'pixel-walker',sports:'pixel-sports-ball',gym:'pixel-gym-ball',library:'pixel-page',classroom:'pixel-chalk',shopping:'pixel-door-left',market:'pixel-lantern',gate:'pixel-cycle',garden:'pixel-water'};
for(const kind of Object.keys(sceneMotion)){
  context.artKind=kind;
  const art=vm.runInContext('sceneArt(artKind)',context);
  if(!art.includes('<rect')||art.includes('<text'))throw new Error(`Pixel scene is missing or contains rendered text: ${kind}`);
  if(!art.includes(sceneMotion[kind]))throw new Error(`Pixel scene has no place-specific motion layer: ${kind}`);
}
const introActors=vm.runInContext('introSceneActors()',context);
if(introActors.player.gender!=='หญิง'||introActors.companion.gender!=='ชาย'||introActors.player.faculty===introActors.companion.faculty)throw new Error('Intro walkers should show a woman and a man from different faculties');
const introScene=vm.runInContext("sceneArt('campus',introSceneActors())",context);
if((introScene.match(/data-scene-role="player"/g)||[]).length!==1||(introScene.match(/data-scene-role="companion"/g)||[]).length!==1)throw new Error('Intro scene does not use both character avatars');
for(const [width,height] of [[690,310],[320,100],[768,260]]){
  context.walkerBox={width,height};
  const paths=vm.runInContext('({right:walkerTravel(1240,310,walkerBox.width,walkerBox.height,390,false),left:walkerTravel(1240,310,walkerBox.width,walkerBox.height,866,true)})',context);
  const visible=Math.min(1240,310*width/height),left=(1240-visible)/2,right=1240-left;
  if(390+paths.right.start+40>=left||390+paths.right.end<=right||866+paths.left.start<=right||866+paths.left.end+40>=left)throw new Error(`Walkers reset before leaving the ${width}x${height} scene`);
}
vm.runInContext('showIntro(false)',context);
if(!['id="introGuide"','id="introNext"','id="introStartNow"','เริ่มเกมเลย','เข้าใจแล้ว ไปใช้ชีวิตกัน','เรียน/ทำงานใช้ พักแล้วฟื้น'].every(text=>element('modalContent').innerHTML.includes(text)))throw new Error('Intro does not show direct play and the optional status guide');
element('introNext').onclick();
if(!element('introWelcome').hidden||element('introGuide').hidden||!element('introScreen').classList.contains('is-guide'))throw new Error('Intro did not advance to the status guide');
element('introBack').onclick();
if(element('introWelcome').hidden||!element('introGuide').hidden||element('introScreen').classList.contains('is-guide'))throw new Error('Intro did not return to the first step');
context.inputCatalog=JSON.parse(fs.readFileSync(new URL('../dist/courses.json',import.meta.url),'utf8'));
vm.runInContext('catalog=inputCatalog',context);
element('seedInput').value='direct-start';
element('introStartNow').onclick();
if(vm.runInContext('state.seed',context)!=='direct-start'||!element('modal').hidden)throw new Error('The main intro button did not start the game directly');
vm.runInContext('showIntro(true)',context);
element('introNext').onclick();
element('seedInput').value='guide-start';
element('startBtn').onclick();
if(vm.runInContext('state.seed',context)!=='guide-start'||!element('modal').hidden)throw new Error('The status guide button did not start the game');
vm.runInContext("newState('repeatable-seed')",context);
const firstStart=vm.runInContext('JSON.stringify({character:state.character,teacher:state.teacher,courses:state.courses.map(c=>c.code),friends:state.friends})',context);
vm.runInContext("newState('repeatable-seed')",context);
const secondStart=vm.runInContext('JSON.stringify({character:state.character,teacher:state.teacher,courses:state.courses.map(c=>c.code),friends:state.friends})',context);
if(firstStart!==secondStart)throw new Error('Story seed did not reproduce the same starting life');
const names=JSON.parse(firstStart);
if(!names.character.name.includes(' ')||names.friends.some(friend=>!friend.name.includes(' ')))throw new Error('Characters still have nicknames instead of full names');
if(!['ชาย','หญิง'].includes(vm.runInContext('state.character.gender',context)))throw new Error('Player gender was not assigned');
if(!vm.runInContext('givenNames(state.character.nationality,state.character.gender).includes(state.character.name.split(" ")[0])',context))throw new Error('Player name does not match assigned gender');
if(vm.runInContext("avatarSvg({...state.character,gender:'ชาย'})===avatarSvg({...state.character,gender:'หญิง'})",context))throw new Error('Male and female pixel avatars look identical');
if(vm.runInContext("avatarSvg({...state.character,faculty:FACULTIES[0].name})===avatarSvg({...state.character,faculty:FACULTIES[3].name})",context))throw new Error('Different faculties have identical pixel outfits');
const twoWalkerScenes=new Set(['campus','sports','gym','shopping','market']);
for(const kind of ['campus','sports','gym','library','classroom','shopping','market','gate']){
  context.artKind=kind;
  const actors=vm.runInContext('sceneActors(artKind)',context);
  if(actors.player.faculty===actors.companion.faculty)throw new Error(`Companion shares the player faculty: ${kind}`);
  const art=vm.runInContext('sceneArt(artKind,sceneActors(artKind))',context);
  if((art.match(/data-scene-role="player"/g)||[]).length!==1)throw new Error(`Scene lacks exactly one player walker: ${kind}`);
  if((art.match(/data-scene-role="companion"/g)||[]).length!==(twoWalkerScenes.has(kind)?1:0))throw new Error(`Scene has the wrong number of companions: ${kind}`);
}
vm.runInContext("state.character.gender='หญิง'",context);
const femaleScene=vm.runInContext("sceneArt('campus',sceneActors('campus'))",context);
vm.runInContext("state.character.gender='ชาย'",context);
if(vm.runInContext("sceneArt('campus',sceneActors('campus'))",context)===femaleScene)throw new Error('Walker does not change with player gender');
vm.runInContext('state.character.faculty=FACULTIES[0].name',context);
const firstFacultyScene=vm.runInContext("sceneArt('campus',sceneActors('campus'))",context);
vm.runInContext('state.character.faculty=FACULTIES[3].name',context);
if(vm.runInContext("sceneArt('campus',sceneActors('campus'))",context)===firstFacultyScene)throw new Error('Walker does not change with player faculty');
vm.runInContext("newState('repeatable-seed')",context);
if(new Set([names.character.name,...names.friends.map(friend=>friend.name)]).size!==4)throw new Error('Friends or player received duplicate full names');
const nameCapacity=vm.runInContext('new Set(THAI_GIVEN_NAMES).size * new Set(THAI_SURNAMES).size',context);
if(nameCapacity<6300)throw new Error(`Thai full-name pool has only ${nameCapacity} distinct combinations`);
if(!vm.runInContext("fullName('จีน').includes(' ') && fullName('ฟิลิปปินส์').includes(' ')",context))throw new Error('International characters did not receive full names');
for(const nationality of ['จีน','ฟิลิปปินส์'])for(const gender of ['ชาย','หญิง']){
  context.testNationality=nationality;context.testGender=gender;
  if(!vm.runInContext('inferGender(fullName(testNationality,new Set(),testGender),testNationality,"test")===testGender',context))throw new Error(`International ${gender} name did not match gender: ${nationality}`);
}
if(new Set(vm.runInContext('FACULTIES.map(f=>JSON.stringify(facultyLook(f.name)))',context)).size!==13)throw new Error('Some faculties share an identical pixel outfit');
if(!element('routineOptions').innerHTML.includes('disabled'))throw new Error('Weekly routine stays clickable during a pending decision');
vm.runInContext("setRoutine('rest')",context);
if(vm.runInContext('state.routine',context)!=='study')throw new Error('Pending decision allowed a weekly routine change');
vm.runInContext("choose(0);setRoutine('rest')",context);
if(vm.runInContext('state.routine',context)!=='rest')throw new Error('Available weekly routine could not be changed');
vm.runInContext("state.ended=true;setRoutine('study')",context);
if(vm.runInContext('state.routine',context)!=='rest')throw new Error('Ended story allowed a weekly routine change');
vm.runInContext("newState('daily-story');choose(0);state.playing=false",context);
if(!vm.runInContext("state.dialogueLog.length===1 && state.dialogue.time==='08:00' && state.dialogue.text.includes(state.memory.at(-1).choice)",context)||!element('dialogueFeed').innerHTML.includes(vm.runInContext('state.friends[0].name',context)))throw new Error('A decision did not create a timed campus conversation');
vm.runInContext('state.dayFraction=.96;emitDueMoments(state.dayFraction)',context);
if(!vm.runInContext('state.dialogueLog.length===1',context))throw new Error('Unimportant hourly diary filler was generated');
vm.runInContext('tickDay();state.dayFraction=.6;emitDueMoments(state.dayFraction)',context);
if(!vm.runInContext("state.dialogue.kind==='followup' && state.dialogue.day===1 && state.dialogue.time==='11:40' && state.dialogue.text.includes(state.memory[0].choice)",context))throw new Error('The next-day story did not reflect the previous decision');
vm.runInContext('tickDay();tickDay();state.dayFraction=.9;emitDueMoments(state.dayFraction)',context);
if(!vm.runInContext("state.dialogue.kind==='followup' && state.dialogue.day===3 && state.dialogue.time==='17:40' && state.dialogue.text.includes(state.memory[0].choice)",context))throw new Error('A later story did not continue the chosen path');
vm.runInContext('save();state=null;load();showDialogueLog()',context);
if(!vm.runInContext("state.dialogueLog.length===3 && state.dialogueLog.at(-1).time==='17:40'",context)||!element('modalContent').innerHTML.includes('เรื่องราวระหว่างวัน'))throw new Error('Timed daily conversations were not saved or available to reread');
vm.runInContext('closeModal()',context);
if(!vm.runInContext('EVENTS.every(event=>EVENT_AFTERMATH[event.id]?.length===event.options.length)',context))throw new Error('Some decisions have no event-specific next-day story');
const riskPreview=vm.runInContext("riskSummary(EVENTS.find(e=>e.id==='rain_bike').options[0][3])",context);
if(!riskPreview.includes('65%')||!riskPreview.includes('35%'))throw new Error('Chance and failure odds are not shown for risky choices');
const riskOutcomes=new Set();
for(let i=0;i<40;i++){
  vm.runInContext(`newState('risk-${i}');openEvent(EVENTS.find(e=>e.id==='rain_bike'));choose(0)`,context);
  riskOutcomes.add(vm.runInContext("state.memory.at(-1).outcomeText.includes('ลื่นบนพื้นเปียก')?'fall':'arrive'",context));
  if(!vm.runInContext("state.dialogue.effects && state.dialogue.text.includes(state.memory.at(-1).outcomeText)",context))throw new Error('Risk outcome did not appear in the narrative with its stat effects');
  vm.runInContext('tickDay();state.dayFraction=.6;emitDueMoments(state.dayFraction)',context);
  if(!vm.runInContext("state.dialogue.kind==='followup' && state.dialogue.time==='11:40' && state.dialogue.text.includes(state.memory.at(-1).outcomeSuccess?'จักรยานยังใช้ได้ดี':'แผลจากจักรยานลื่น')",context))throw new Error('A risky decision did not change the next-day story');
}
if(riskOutcomes.size!==2)throw new Error('Risk choices never produced both success and failure');
for(const eventId of ['printer_queue','wrong_room','found_wallet']){
  const outcomes=new Set();
  for(let i=0;i<30;i++){
    context.testEventId=eventId;
    vm.runInContext(`newState('new-risk-${eventId}-${i}');openEvent(EVENTS.find(e=>e.id===testEventId));choose(0)`,context);
    outcomes.add(vm.runInContext('state.memory.at(-1).outcomeText',context));
    if(!vm.runInContext('state.dialogue.kind===\'chance\' && state.dialogue.effects && state.dialogue.text.includes(state.memory.at(-1).outcomeText)',context))throw new Error(`New risk outcome was not shown: ${eventId}`);
  }
  if(outcomes.size!==2)throw new Error(`New risk choice never produced both outcomes: ${eventId}`);
}
const incidentVariety=new Set();
for(let i=0;i<100;i++){
  vm.runInContext(`newState('incident-variety-${i}');state.day=35;runIncident()`,context);
  incidentVariety.add(vm.runInContext('state.lastIncidentId',context));
}
if(incidentVariety.size<12)throw new Error(`Passing days repeated too few random situations: ${incidentVariety.size}`);
vm.runInContext("newState('incident-story');choose(0);state.day=11;state.nextIncidentDay=12;state.nextEventDay=999;tickDay();state.dayFraction=.99;emitDueMoments(state.dayFraction)",context);
if(!vm.runInContext("state.dialogueLog.some(item=>item.day===12 && item.kind==='incident' && item.effects && /^\\d\\d:\\d\\d$/.test(item.time)) && state.nextIncidentDay>state.day && !state.pending && state.playing",context))throw new Error('A passing-day incident did not change the story and keep time running');
vm.runInContext('save();state=null;load()',context);
if(!vm.runInContext("state.dialogueLog.some(item=>item.day===12 && item.kind==='incident')",context))throw new Error('Random incident was not restored from the save');
vm.runInContext("newState('legacy-name');state.character.name='มิน';state.friends[0].name='ฟ้า';state.friends[1].name='ต้น';state.friends[2].name='เจ';state.nameVersion=1;state.pending={id:'arc-1',title:'ฟ้า ชวนทำงานด้วย',text:'ฟ้า เพื่อนร่วมสาขาคนแรก',place:'อาคารบรรณสาร',options:[]};state.memory.push({id:'arc-1',title:'ฟ้า ชวนทำงานด้วย',day:1});save();state=null;load()",context);
if(!vm.runInContext("state.nameVersion===2 && [state.character.name,...state.friends.map(f=>f.name)].every(name=>name.includes(' ')) && state.pending.title.startsWith(state.friends[0].name) && state.memory.at(-1).title.startsWith(state.friends[0].name) && ['ชาย','หญิง'].includes(state.character.gender) && state.pending.time===clockForMinute(currentMinute())",context))throw new Error('Existing nickname save did not migrate to full names, gender, and clock time');
vm.runInContext("newState('choice-gate');state.stats.money=0;openEvent(EVENTS.find(e=>e.id==='mega'))",context);
if(vm.runInContext('choiceGate(state.pending,state.pending.options[0],0).ok',context))throw new Error('Expensive choice should be locked without money');
vm.runInContext('choose(0)',context);
if(vm.runInContext('state.pending?.id',context)!=='mega')throw new Error('Locked choice advanced the story');
vm.runInContext('choose(2)',context);
if(vm.runInContext('!!state.pending',context))throw new Error('Available choice did not advance the story');
vm.runInContext("newState('knowledge-gain')",context);
const initialKnowledge=vm.runInContext('state.stats.knowledge',context);
vm.runInContext("changeStat('study',10)",context);
if(vm.runInContext('state.stats.knowledge',context)<=initialKnowledge)throw new Error('Studying did not increase knowledge');
vm.runInContext("state.day=28;state.dayFraction=.45;state.paths.year1={index:0,label:'รักษากลุ่มเพื่อน'};state.routine='rest';updateDailyProgress()",context);
if(element('dailyProgressFill').style.width!=='45%')throw new Error('Daily progress does not show elapsed time');
if(element('quickTime').textContent!=='10:48')throw new Error('The daily clock does not match elapsed time');
const friendBefore=vm.runInContext('state.friends[0].score',context);
vm.runInContext('weekly()',context);
if(vm.runInContext('state.friends[0].score',context)<=friendBefore)throw new Error('Yearly path did not affect a later week');
vm.runInContext('save();state=null;load()',context);
if(vm.runInContext('state.day',context)!==28)throw new Error('Saved game did not restore the current day');
vm.runInContext("state.character.faculty='คณะวิทยาศาสตร์และเทคโนโลยี';state.character.major='วิทยาการคอมพิวเตอร์';state.transcript=[];state.day=0;startCourses()",context);
if(vm.runInContext("state.courses.filter(c=>catalog.find(x=>x.code===c.code)?.paths.some(p=>p.branch.includes('วิทยาการคอมพิวเตอร์'))).length",context)<2)throw new Error(`A well-covered major should receive its own courses: ${vm.runInContext('state.courses.map(c=>c.code)',context)}`);
vm.runInContext("newState('failed-save');choose(0);state.day=148;state.courses.forEach(c=>{c.attendance=0;c.punctual=0;c.assignment=0;c.project=0;c.midterm=0;c.final=0});tickDay()",context);
if(!vm.runInContext('state.ended && state.failure.length > 0',context))throw new Error('Failing all courses should end the run');
if(!JSON.parse(storage.get('hcu-life-v1')).ended)throw new Error('Failed ending was not saved');
vm.runInContext('state=null;load()',context);
if(!vm.runInContext('state.ended && state.failure.length > 0',context))throw new Error('Failed ending did not survive reload');
const oldFailedSave=JSON.parse(storage.get('hcu-life-v1'));
oldFailedSave.ended=false;
delete oldFailedSave.failure;
storage.set('hcu-life-v1',JSON.stringify(oldFailedSave));
vm.runInContext('state=null;load()',context);
if(!vm.runInContext('state.ended && state.failure.length > 0',context))throw new Error('Older save with an F was allowed to continue');
if(!JSON.parse(storage.get('hcu-life-v1')).ended)throw new Error('Older failed save was not repaired');
vm.runInContext('showTranscript()',context);
if(!element('modalContent').innerHTML.includes('เกียรตินิยม —'))throw new Error('Failed student was shown as eligible for honors');
vm.runInContext("newState('random-event-save');choose(0);state.day=23;state.nextEventDay=24;tickDay()",context);
const nextEventDay=vm.runInContext('state.nextEventDay',context);
if(JSON.parse(storage.get('hcu-life-v1')).nextEventDay!==nextEventDay)throw new Error('Random event schedule was not saved with the pending choice');
vm.runInContext('state=null;load();choose(0)',context);
if(vm.runInContext('state.nextEventDay',context)!==nextEventDay)throw new Error('Random event schedule changed after reload');
vm.runInContext("newState('fast-event');choose(0);state.day=23;state.nextEventDay=24;state.dayFraction=.9;state.speed=32;state.playing=true;lastTick=1000;loop(2000)",context);
if(!vm.runInContext('state.pending && state.day===24 && state.pending.time===clockForMinute(currentMinute())',context))throw new Error('Fast simulation carried elapsed days through a paused decision');
if(JSON.parse(storage.get('hcu-life-v1')).dayFraction!==vm.runInContext('state.dayFraction',context))throw new Error('Paused daily progress was not saved');
vm.runInContext("newState('no-softlock');Object.keys(state.stats).forEach(key=>state.stats[key]=0)",context);
for(const event of vm.runInContext('EVENTS',context)){
  context.checkEvent=event;
  if(!vm.runInContext('checkEvent.options.some((option,index)=>choiceGate(checkEvent,option,index).ok)',context))throw new Error(`No available choice at zero stats: ${event.id}`);
}
let four=0,six=0,finished=0,failed=0,maxSaveChars=0;
for(let i=0;i<50;i++){
  vm.runInContext(`newState('smoke-${i}')`,context);
  let years=vm.runInContext('state.years',context);
  if(years===6)six++;else four++;
  let loops=0;
  while(!vm.runInContext('state.ended',context)&&loops++<2500){
    if(vm.runInContext('!!state.pending',context)){
      const index=vm.runInContext('state.pending.options.findIndex((option,index)=>choiceGate(state.pending,option,index).ok)',context);
      if(index<0)throw new Error(`No available choice: smoke-${i}`);
      vm.runInContext(`choose(${index})`,context);
    }
    else vm.runInContext('tickDay()',context);
  }
  if(loops>=2500)throw new Error(`Simulation stuck: smoke-${i}`);
  const result=vm.runInContext('({day:state.day,years:state.years,failure:state.failure,transcript:state.transcript,seen:state.seen})',context);
  const codes=result.transcript.map(c=>c.code);
  if(codes.length!==new Set(codes).size)throw new Error(`Repeated course: smoke-${i}`);
  if(result.failure)failed++;else{
    finished++;
    if(result.day!==result.years*365)throw new Error(`Graduated early: smoke-${i}`);
    vm.runInContext('render()',context);
    if(!vm.runInContext("yearTerm().includes('จบการศึกษา') && state.dayFraction===1",context)||element('dayCount').textContent!==`วันที่ ${result.day}`||element('dailyProgressFill').style.width!=='100%'||!element('courseList').innerHTML.includes('ดูใบเกรดทั้งหมด'))throw new Error(`Graduation date, clock, or course label is incorrect: smoke-${i}`);
    if(!JSON.parse(storage.get('hcu-life-v1')).ended)throw new Error(`Graduation was not saved: smoke-${i}`);
    for(const event of ['teacherday','loy','volunteer','pothong','talent','chinese','songkran','parttime','openhouse','junior','candle','internship','farewell'])if(!result.seen.includes(event))throw new Error(`Missing campus event ${event}: smoke-${i}`);
  }
  maxSaveChars=Math.max(maxSaveChars,storage.get('hcu-life-v1')?.length||0);
}
console.log({runs:50,four,six,finished,failed,maxSaveChars});
let neglectFailures=0;
for(let i=0;i<20;i++){
  vm.runInContext(`newState('neglect-${i}');state.routine='activities'`,context);
  let loops=0;
  while(!vm.runInContext('state.ended',context)&&loops++<2500){
    if(vm.runInContext('!!state.pending',context)){
      const index=vm.runInContext('state.pending.options.map((option,index)=>choiceGate(state.pending,option,index).ok?index:-1).filter(index=>index>=0).at(-1)',context);
      if(index===undefined)throw new Error(`No available choice: neglect-${i}`);
      vm.runInContext(`choose(${index})`,context);
    }
    else vm.runInContext('tickDay()',context);
  }
  if(loops>=2500)throw new Error(`Neglect simulation stuck: ${i}`);
  if(vm.runInContext('!!state.failure',context)){
    neglectFailures++;
    if(!vm.runInContext("yearTerm().includes('สิ้นสุดรอบ') && state.dayFraction===1",context))throw new Error(`Failed semester still shows an active term: neglect-${i}`);
  }
}
console.log({neglectRuns:20,neglectFailures});
const drawn=[];
let exportCanvas;
let downloaded='';
context.document.createElement=tag=>{
  if(tag==='canvas'){
    exportCanvas={width:0,height:0,getContext:()=>({fillRect(){},drawImage(){drawn.push('pixel-scene')},beginPath(){},moveTo(){},bezierCurveTo(){},fill(){},fillText:value=>drawn.push(String(value)),measureText:value=>({width:String(value).length*12})}),toBlob:callback=>callback({})};
    return exportCanvas;
  }
  return {click(){downloaded=this.download}};
};
context.document.baseURI='https://example.com/hcu-game/';
context.location.hostname='example.com';
context.location.protocol='https:';
context.URL=class extends URL{static createObjectURL(){return 'blob:test'}static revokeObjectURL(){}};
context.Image=class{async decode(){}};
context.setTimeout=()=>0;
vm.runInContext("state.ended=true;state.failure=null;state.transcript=[{grade:'A',credits:3}];state.stats.activity=85;state.stats.energy=100;state.stats.health=100;state.stats.happiness=100;state.stats.stress=0;state.friends.forEach(friend=>friend.score=100)",context);
vm.runInContext('showResult()',context);
if(!['เกียรตินิยม','เกียรติยศ','เชิดชูเกียรติ'].every(label=>element('modalContent').innerHTML.includes(label)))throw new Error('Result screen omitted an earned Badge');
await vm.runInContext('downloadStory()',context);
if(exportCanvas.width!==1080||exportCanvas.height!==1920)throw new Error('Story image is not Instagram portrait size');
if(!drawn.includes('https://example.com/hcu-game'))throw new Error('Story image omitted the hosted site URL');
if(!drawn.includes('pixel-scene')||!drawn.some(value=>value.includes(vm.runInContext('state.character.name',context))))throw new Error('Story image omitted its scene or character');
if(!drawn.includes('GOLD')||!drawn.some(value=>value.includes('เหรียญทอง')))throw new Error('Perfect GPA export omitted the gold honors medal');
if(!drawn.includes('ACTIVITY')||!drawn.includes('85+')||!drawn.includes('เกียรติยศ')||!drawn.includes('เชิดชูเกียรติ'))throw new Error('Story export omitted an earned activity or overall Badge');
if(!downloaded.endsWith('.png'))throw new Error('Story image did not trigger a PNG download');
console.log({storyImage:'1080×1920 PNG download path verified'});
