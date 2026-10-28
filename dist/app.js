const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'hcu-life-v1';
const DAY_MS = 3600000 / (365 * 4); // Four simulated years take roughly one real hour at 1×.
const MAX_DIALOGUE_ENTRIES = 8000;
const START_DATE = new Date(Date.UTC(2026, 7, 1));
const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const FACULTIES = [
  { name:'คณะศิลปศาสตร์', weight:263, majors:['ภาษาอังกฤษ','ภาษาจีน','การท่องเที่ยว','การโรงแรม','การสื่อสารภาษาไทยเป็นภาษาที่สอง'], match:['ภาษาอังกฤษ','ภาษาจีน','การท่องเที่ยว','การโรงแรม','การสื่อสารภาษาไทยเป็นภาษาที่สอง'] },
  { name:'คณะบริหารธุรกิจ', weight:252, majors:['การจัดการ','การตลาด','การบัญชี','ธุรกิจระหว่างประเทศ','โลจิสติกส์และโซ่อุปทาน','คอมพิวเตอร์ธุรกิจ','ธุรกิจจีน'], match:['การจัดการ','การตลาด','การบัญชี','ธุรกิจระหว่างประเทศ','โลจิสติกส์','คอมพิวเตอร์ธุรกิจ','ธุรกิจจีน'] },
  { name:'วิทยาลัยจีนศึกษา', weight:181, majors:['ภาษาจีนธุรกิจ','จีนศึกษา'], match:['',''] },
  { name:'คณะเทคนิคการแพทย์', weight:161, majors:['เทคนิคการแพทย์'], match:[''] },
  { name:'คณะสาธารณสุขศาสตร์และสิ่งแวดล้อม', weight:146, majors:['สาธารณสุขชุมชน','อาชีวอนามัยและความปลอดภัย','การจัดการโรงพยาบาล','เวชระเบียนและเวชสถิติ'], match:['สาธารณสุขชุมชน','อาชีวอนามัย','การจัดการโรงพยาบาล','เวชระเบียน'] },
  { name:'คณะนิติศาสตร์', weight:136, majors:['นิติศาสตร์'], match:[''] },
  { name:'คณะกายภาพบำบัด', weight:132, majors:['กายภาพบำบัด'], match:[''] },
  { name:'คณะเภสัชศาสตร์', weight:114, years:6, majors:['เภสัชศาสตร์'], match:[''] },
  { name:'คณะพยาบาลศาสตร์', weight:111, majors:['พยาบาลศาสตร์'], match:['พยาบาลศาสตรบัณฑิต'] },
  { name:'คณะวิทยาศาสตร์และเทคโนโลยี', weight:96, majors:['วิทยาการคอมพิวเตอร์','วิทยาการคำนวณและเทคโนโลยีดิจิทัล','วิทยาศาสตร์ชีวภาพ','วิทยาศาสตร์กายภาพ'], match:['วิทยาการคอมพิวเตอร์','วิทยาการคำนวน','วิทยาศาสตร์ชีวภาพ','วิทยาศาสตร์กายภาพ'] },
  { name:'คณะการแพทย์แผนจีน', weight:72, years:6, majors:['การแพทย์แผนจีน'], match:[''] },
  { name:'คณะนิเทศศาสตร์', weight:47, majors:['นิเทศศาสตร์','ศิลปะการแสดง'], match:['','ศิลปะการแสดง'] },
  { name:'คณะสังคมสงเคราะห์ศาสตร์และสวัสดิการสังคม', weight:12, majors:['สังคมสงเคราะห์ศาสตร์'], match:[''] }
];
// 118 given names × 60 surnames = 7,080 distinct Thai full names.
const THAI_GIVEN_NAMES = 'กนกพร กนกวรรณ กชกร กัญญาณัฐ กัญญารัตน์ กัลยกร กัลยาณี ขวัญชนก ขวัญฤทัย จันทิมา จิราภรณ์ จิรัชญา ชนกนันท์ ชนิดา ชญานิน ชุติกาญจน์ ชุติมา ณิชากร ณัฐกานต์ ณัฐชา ณัฐธิดา ณัฐพร ณัฐมน ดวงกมล ทิพย์สุดา ธนพร ธัญชนก ธัญญารัตน์ นภัสสร นฤมล นิชาภา ปภาวดี ปรางทิพย์ ปริญญา ปรียานุช พัชราภา พิมพ์ชนก พิมพ์ลดา ภัทรวดี มณีรัตน์ มนัสวี รัตนาภรณ์ รุจิรา วรัญญา วราภรณ์ ศิริพร ศุภลักษณ์ สิรินทร์ สุชาดา สุธาสินี อรพรรณ อรอนงค์ อัญชิสา อัญญารินทร์ อารีย์ เอมอร ไอรดา กิตติกร กิตติพงษ์ กิตติภพ เกียรติศักดิ์ จักรพงษ์ จิรายุ จิรภัทร ชยพล ชัยณรงค์ ชัยวัฒน์ ณรงค์ฤทธิ์ ณัฐกิตติ์ ณัฐพงศ์ ณัฐพล ณัฐวุฒิ ดนัย ธนกร ธนกฤต ธนชัย ธนดล ธนพล ธนภัทร ธนวัฒน์ ธีรเดช ธีรภัทร ธีรวัฒน์ นราธิป นรินทร์ นพดล นพพล ปกรณ์ ปฐมพงศ์ ปรเมศวร์ ปัญญวัฒน์ พงศกร พงศธร พชรพล ภาคภูมิ ภัทรพล ภูริณัฐ รณกร รัชพล วรกร วรพล วรวิทย์ วัชรพล วิชญะ วิศรุต ศรัณย์ ศุภกร ศุภณัฐ ศุภชัย สิทธิชัย สุธีร์ สุรศักดิ์ อดิศร อนันต์ อนุชา อภิสิทธิ์ อัครเดช อิทธิพล'.split(' ');
const THAI_SURNAMES = 'กาญจนกุล กิตติคุณ กุลธนากร กุลประเสริฐ เกษมศิริ ขจรศักดิ์ จันทร์แก้ว จันทร์ศรี จิรธนากุล จิรวัฒนากร ชนะกิจ ชัยกิจ ชัยณรงค์ ชัยประเสริฐ ชัยวัฒน์ เชาวน์ศิริ ดำรงกิจ ดำรงสุข ทองคำ ทองดี ทองประเสริฐ ธนกิจเจริญ ธนวัฒน์ ธรรมกุล ธรรมโชติ ธีรภักดี นาคทอง นิ่มนวล บุญเจริญ บุญช่วย บุญธรรม บุญประเสริฐ บุญมี ประกอบกิจ ประชากุล ประเสริฐกุล ปัญญากุล พงศ์กุล พัฒนกุล พิทักษ์วงศ์ ภักดีวงศ์ ภูมิพัฒนา มณีวงศ์ มั่นคง รัตนกุล รัตนชัย รุ่งเรืองกิจ วงศ์สวัสดิ์ วัฒนกิจ วัฒนกุล วิจิตรชัย ศรีกาญจน์ ศรีจันทร์ ศรีทอง ศรีประเสริฐ ศิริกุล ศิริวัฒนา สุขเกษม สุขสวัสดิ์ อุดมทรัพย์'.split(' ');
const AVATAR_PALETTES=[{hair:'#302d2d',skin:'#d7a17c',shirt:'#285f50'},{hair:'#3b302b',skin:'#b77f5d',shirt:'#86556e'},{hair:'#252d32',skin:'#e4b28c',shirt:'#426c9a'},{hair:'#514037',skin:'#c99170',shirt:'#8b7146'}];
const FACULTY_LOOKS=[
  {shirt:'#e8e0c7',trim:'#4d8a78',motif:'book'},
  {shirt:'#863747',trim:'#e8bd5d',motif:'tie'},
  {shirt:'#a83a3f',trim:'#e9c15c',motif:'sash'},
  {shirt:'#f5efe2',trim:'#438a9e',motif:'cross'},
  {shirt:'#eee9d8',trim:'#4e9a72',motif:'cross'},
  {shirt:'#354363',trim:'#e7b95b',motif:'tie'},
  {shirt:'#f2eddf',trim:'#b87585',motif:'cross'},
  {shirt:'#f5ece2',trim:'#a178aa',motif:'cross'},
  {shirt:'#f5f0e9',trim:'#78aeb0',motif:'cross'},
  {shirt:'#2f6286',trim:'#e5bf63',motif:'code'},
  {shirt:'#f2e8dc',trim:'#b54f4e',motif:'cross'},
  {shirt:'#914c68',trim:'#e5bd66',motif:'camera'},
  {shirt:'#4f785f',trim:'#e3cc8a',motif:'star'}
];
const CHINESE_GIVEN_NAMES = 'เจียอี้ เสี่ยวอวี่ เหวินหลิง หยู่ถง ซินอี ห่าวหราน จื่อหาน หมิงเจ๋อ อี้เฉิน เหมยหลิน'.split(' ');
const CHINESE_SURNAMES = 'หลี่ หวัง จาง หลิว เฉิน หยาง หวง เจ้า อู๋ โจว'.split(' ');
const FILIPINO_GIVEN_NAMES = 'Maria Ana Sofia Isabella Gabriela Miguel Gabriel Rafael Daniel Marco'.split(' ');
const FILIPINO_SURNAMES = 'Santos Reyes Garcia Mendoza Cruz Ramos Bautista Aquino Navarro Villanueva'.split(' ');
const TEACHERS = ['อาจารย์นลิน','อาจารย์วรินทร์','อาจารย์ธีรภัทร','อาจารย์พิมพ์ชนก'];
const HOMES = ['กรุงเทพฯ','สมุทรปราการ','ชลบุรี','นครราชสีมา','เชียงใหม่','ขอนแก่น','สงขลา','สุราษฎร์ธานี','อุบลราชธานี','พระนครศรีอยุธยา'];
const ROUTINES = [
  {id:'study',icon:'📚',name:'อ่านหนังสือ',desc:'ความรู้และคะแนนวิชา + / พลังลด'},
  {id:'friends',icon:'💬',name:'เจอเพื่อน',desc:'ความสัมพันธ์ +'},
  {id:'activities',icon:'🎟️',name:'กิจกรรม',desc:'คะแนนกิจกรรม +'},
  {id:'sports',icon:'🏸',name:'กีฬา',desc:'พลังใจและสุขภาพ +'},
  {id:'rest',icon:'🌿',name:'พักผ่อน',desc:'ฟื้นพลัง ลดเครียด'}
];
const QUICK_STAT_TIPS={
  'พลัง':'ใช้เมื่อเรียน ทำงาน หรือเล่นกีฬา พักผ่อนช่วยฟื้น',
  'สุขภาพ':'ความแข็งแรง บางกิจกรรมต้องมีสุขภาพขั้นต่ำ',
  'ความสุข':'ความพอใจในชีวิตจากเพื่อนและการพัก',
  'ความเครียด':'ยิ่งสูงยิ่งเหนื่อยและกระทบการเรียน',
  'เงิน':'ใช้กิน เดินทาง และเที่ยว',
  'ความรู้':'เพิ่มจากการอ่านและการเรียน ช่วยสอบและปลดล็อกตัวเลือก',
  'กิจกรรม':'สะสมจากชมรม กีฬา และงานในมอ',
  'เพื่อน':'ค่าเฉลี่ยความสัมพันธ์กับเพื่อนใกล้ตัว',
  'GPA':'เกรดเฉลี่ยสะสมจากวิชาที่เรียนจบแล้ว เต็ม 4.00'
};
// One hand-drawn icon language for the quick bar, choices, and both guides.
const STAT_ICON_ART={
  energy:'<rect x="3" y="7" width="16" height="10" rx="1"/><path d="M21 10v4M10 9l-2 4h4l-2 3"/>',
  health:'<path d="M12 20 4.5 12.5C1 9 3.5 4 8 4c1.8 0 3.1.9 4 2.2C12.9 4.9 14.2 4 16 4c4.5 0 7 5 3.5 8.5Z"/><path d="M12 8v6M9 11h6"/>',
  happiness:'<circle cx="12" cy="12" r="9"/><path d="M8 10h.1M16 10h.1M8 14c1 1.5 2.4 2 4 2s3-.5 4-2"/>',
  stress:'<path d="M5 18c-2-1.5-2-5 0-6.5-1-4 2-7 6-6.5 2-2 6-1 7 1 3 0 4 3 3 5 2 2 1 5-1 6H5Z"/><path d="m10 8-2 4h4l-2 4 6-6h-4l2-2"/>',
  money:'<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v9c0 1.7 2.7 3 6 3 1.1 0 2.2-.2 3-.5M3 11c0 1.7 2.7 3 6 3M3 15c0 1.7 2.7 3 6 3"/><ellipse cx="16" cy="15" rx="5" ry="3"/><path d="M11 15v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4"/>',
  knowledge:'<path d="M12 6c-2.5-2-5.5-2.7-9-2v14c3.5-.7 6.5 0 9 2 2.5-2 5.5-2.7 9-2V4c-3.5-.7-6.5 0-9 2Z"/><path d="M12 6v14M6 8c1.2 0 2.2.2 3 .5M15 8.5c.8-.3 1.8-.5 3-.5"/>',
  activity:'<path d="M5 21V3M5 4c4-2 6 2 10 0 1.5-.7 2.8-.8 4-.5v10c-4-1-6 2-10 0-1.5-.7-2.8-.8-4-.5"/><path d="M8 17h9"/>',
  friends:'<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 19v-2c0-2.8 2.2-4.5 6-4.5s6 1.7 6 4.5v2H2ZM14 13c4.5-1 8 1 8 4v2h-5"/>',
  gpa:'<path d="M6 3h9l4 4v14H6Z"/><path d="M15 3v5h4M9 17l2.5-6 2.5 6M10 15h3M15.5 17H17"/>'
};
const STAT_ICON_KEYS={'พลัง':'energy','สุขภาพ':'health','ความสุข':'happiness','ความเครียด':'stress','เงิน':'money','ความรู้':'knowledge','กิจกรรม':'activity','เพื่อน':'friends','GPA':'gpa'};
function statIcon(key){const art=STAT_ICON_ART[key];return art?`<svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">${art}</svg>`:''}
const LOCATIONS = ['ลานโพธิ์','อาคารบรรณสาร','โรงอาหาร 1','โรงอาหาร 2','รั้วเขียว','อาคารชิน โสภณพนิช','สนามกีฬา','สวนหยินหยาง','ตลาดนัดเรือบิน','เมกาบางนา','มาร์เก็ตวิลเลจ สุวรรณภูมิ'];
function sceneActors(kind){
  const player={...state.character,sceneRole:'player'};
  const others=FACULTIES.filter(f=>f.name!==player.faculty);
  const faculty=others[hashSeed(`${state.seed}|${kind}|faculty`)%others.length].name;
  const companion={faculty,gender:hashSeed(`${state.seed}|${kind}|gender`)%2?'หญิง':'ชาย',avatar:hashSeed(`${state.seed}|${kind}|avatar`)%AVATAR_PALETTES.length,sceneRole:'companion'};
  return {player,companion};
}
function walkerTravel(stageWidth,stageHeight,boxWidth,boxHeight,x,reverse){
  const visibleWidth=Math.min(stageWidth,stageHeight*boxWidth/boxHeight);
  const left=(stageWidth-visibleWidth)/2,right=stageWidth-left,edge=48;
  const start=reverse?right-x+edge:left-x-edge;
  const end=reverse?left-x-edge:right-x+edge;
  const duration=Math.max(10,Math.min(28,Math.abs(end-start)/55));
  const phase=Math.max(0,Math.min(1,Math.abs(start)/Math.abs(end-start)));
  return {start,end,duration,delay:-duration*phase};
}
function fitWalkerAnimation(svg){
  if(!svg?.getBoundingClientRect||!svg.querySelectorAll)return;
  const box=svg.getBoundingClientRect(),view=svg.viewBox?.baseVal;
  if(!box.width||!box.height||!view?.width||!view?.height)return;
  for(const walker of svg.querySelectorAll('[data-walker-x]')){
    const x=Number(walker.getAttribute('data-walker-x'));
    const path=walkerTravel(view.width,view.height,box.width,box.height,x,walker.classList.contains('pixel-walker-b'));
    walker.style.setProperty('--walk-start',`${path.start.toFixed(1)}px`);
    walker.style.setProperty('--walk-end',`${path.end.toFixed(1)}px`);
    walker.style.animationDuration=`${path.duration.toFixed(2)}s`;
    walker.style.animationDelay=`${path.delay.toFixed(2)}s`;
  }
}
function renderScene(place){let kind=/สนามกีฬา|โพธิ์ทอง/.test(place)?'sports':/อาคารชิน/.test(place)?'gym':/บรรณสาร/.test(place)?'library':/ห้องปฏิบัติการ|ห้องแล็บ|อาคารเรียน|ห้องเรียน|ห้องอาจารย์|ระบบทะเบียน|หอประชุม/.test(place)?'classroom':/เมกา|มาร์เก็ต/.test(place)?'shopping':/เรือบิน/.test(place)?'market':/รั้วเขียว|ทางจักรยาน|จักรยาน|ทางไปอาคาร/.test(place)?'gate':/สวนหยินหยาง/.test(place)?'garden':'campus';const key=`${kind}|${state.seed}|${state.character.gender}|${state.character.faculty}|${state.character.avatar}`;if($('scene').dataset.art!==key){const actors=sceneActors(kind);$('sceneOverlay').innerHTML=globalThis.sceneArt(kind,actors);$('scene').dataset.art=key;$('sceneOverlay').parentNode?.setAttribute('aria-label',`ฉากพิกเซลอาร์ต ${place} มีตัวละคร ${state.character.gender} ${state.character.faculty}${["campus","sports","gym","shopping","market"].includes(kind)?" และนักศึกษาคณะอื่น":""}`);fitWalkerAnimation($('scene').querySelector?.('svg'))}const rainy=state.day%19<4&&!['gym','library','classroom','shopping'].includes(kind);$('scene').classList.toggle('is-rainy',rainy)}
const EVENTS = [
  {id:'orientation', title:'วันแรกที่ลานโพธิ์', place:'ลานโพธิ์', early:true, text:'เสียงรุ่นพี่ชวนเข้ากิจกรรมดังอยู่ข้างลานโพธิ์ ส่วนตารางเรียนในมือก็แน่นจนเริ่มกังวล วันนี้คุณจะเริ่มต้นแบบไหน?', options:[['ไปรู้จักรุ่นพี่และเพื่อนใหม่','ความสัมพันธ์ +8 · กิจกรรม +6',{friends:8,activity:6,energy:-4}],['เดินสำรวจห้องเรียนกับเพื่อน','ตรงต่อเวลา + · เพื่อน +4',{friends:4,study:5,energy:-2}],['กลับหอจัดตารางและพัก','พลัง +8 · การเรียน +3',{energy:8,study:3}]]},
  {id:'green_gate',title:'หลังเลิกเรียนที่รั้วเขียว',place:'รั้วเขียว',text:'เพื่อนชวนออกไปหาอะไรกินทางรั้วเขียว แต่พรุ่งนี้มีงานต้องส่ง คุณจะทำอย่างไร?',options:[['ไปด้วย แล้วกลับมาทำงานต่อ','เพื่อน +7 · เงิน -5',{friends:7,money:-5,energy:-4}],['ชวนเพื่อนทำงานก่อนแล้วค่อยไป','เพื่อน +4 · การเรียน +6',{friends:4,study:6,energy:-5}],['กลับไปทำงานให้เสร็จ','การเรียน +9 · เครียด +4',{study:9,stress:4}]]},
  {id:'rain_bike',title:'ฝนตกก่อนคาบเช้า',place:'ทางจักรยานในมหาวิทยาลัย',text:'ฝนเริ่มตกหนักระหว่างทางไปห้องเรียน จักรยานอยู่ข้างตัวและคาบเช้าใกล้เริ่มแล้ว',options:[['ใส่เสื้อกันฝนแล้วปั่นต่อ','พลัง -3 · เสี่ยงลื่น',{energy:-3},{chance:.65,success:{effects:{punctual:9},text:'คุณปั่นผ่านฝนมาถึงห้องก่อนอาจารย์เริ่มสอน แม้รองเท้าเปียกแต่ยังทันคาบ',quote:'มาทันพอดีเลย เอาเสื้อกันฝนไปผึ่งก่อนนะ'},failure:{effects:{health:-7,energy:-5,punctual:-10,money:-4},text:'ล้อจักรยานลื่นบนพื้นเปียก คุณล้มตรงทางโค้ง ต้องเสียค่าซ่อมและเข้าห้องสาย',quote:'เจ็บตรงไหนไหม เดี๋ยวเราเดินไปส่งที่ห้องพยาบาล'}}],['รอฝนหยุดในอาคาร','พลัง + · เสี่ยงเข้าสาย',{energy:3,punctual:-10}],['นั่งรถรับส่งในมหาวิทยาลัย','ตรงเวลา + · เงิน -',{punctual:5,money:-4}]]},
  {id:'project',title:'นัดทำโปรเจกต์ชนกิจกรรม',place:'อาคารเรียน 2',text:'กลุ่มนัดแก้โปรเจกต์เย็นนี้ แต่ชมรมก็มีงานที่รับปากไว้ เพื่อนร่วมกลุ่มรอคำตอบของคุณ',options:[['ช่วยกลุ่มทำโปรเจกต์','โปรเจกต์ +10 · เพื่อน +5',{project:10,friends:5,activity:-2}],['แบ่งเวลาไปทั้งสองที่','โปรเจกต์ +3 · กิจกรรม +3 · พลัง -8',{project:3,activity:3,energy:-8},{chance:.6,success:{effects:{project:5,activity:5,friends:3},text:'คุณแบ่งหน้าที่ให้กลุ่มก่อนแวะไปช่วยชมรม ทุกอย่างเสร็จทันช่วงเย็น',quote:'วันนี้จัดเวลาเก่งมาก งานกลุ่มก็เดิน ชมรมก็ไม่ขาดคน'},failure:{effects:{project:-5,stress:6,friends:-3},text:'คุณวิ่งไปมาจนพลาดนัดแก้งานสำคัญ เพื่อนร่วมกลุ่มต้องช่วยเก็บรายละเอียดแทน',quote:'รอบหน้าบอกเราก่อนนะ จะได้แบ่งงานกันทัน'}}],['ไปช่วยชมรมเต็มที่','กิจกรรม +10 · เพื่อนร่วมกลุ่ม -5',{activity:10,friends:-5,project:-5}]]},
  {id:'teacher',title:'อาจารย์เรียกคุยหลังคาบ',place:'หน้าห้องอาจารย์',text:'อาจารย์เห็นว่าคุณมีศักยภาพ แต่คะแนนงานล่าสุดยังไม่ดีนัก ท่านเสนอให้เข้ามาปรึกษาก่อนส่งงานชิ้นถัดไป',options:[['เข้าพบและแก้จุดอ่อน','งาน +10 · พลัง -4',{study:10,energy:-4,mentor:5}],['ขอคำแนะนำสั้น ๆ แล้วลองเอง','งาน +5 · พลัง -2',{study:5,energy:-2,mentor:2}],['ขอบคุณและกลับไปพัก','พลัง +6',{energy:6}]]},
  {id:'sports',title:'เย็นนี้ที่อาคารชิน',place:'อาคารชิน โสภณพนิช',text:'ในอาคารชินมีทั้งแบต บาส วอลเลย์ และปิงปอง เพื่อนชวนคุณเล่นกีฬาแทนการนั่งอ่านหนังสืออีกเย็น',options:[['ลงตีแบต บาส วอลเลย์ หรือปิงปอง','สุขภาพ +8 · เพื่อน +5',{health:8,friends:5,energy:-5}],['ไปออกเวทหรือต่อยมวย','สุขภาพ +10 · เครียด -5',{health:10,stress:-5,energy:-6}],['กลับไปอ่านหนังสือ','การเรียน +7',{study:7,stress:2}]]},
  {id:'field',title:'วิ่งรอบสนามตอนเย็น',place:'สนามกีฬา',text:'แดดเริ่มอ่อน เพื่อนบางคนวิ่งรอบสนาม บางคนเตะบอลอยู่ตรงกลาง คุณมีเวลาอีกหนึ่งชั่วโมง',options:[['วิ่งกับเพื่อน','สุขภาพ +7 · เพื่อน +4',{health:7,friends:4,energy:-5}],['ลงเตะบอล','สุขภาพ +7 · กิจกรรม +3',{health:7,activity:3,energy:-7}],['นั่งดูและคุยกับเพื่อน','เพื่อน +6 · พลัง +3',{friends:6,energy:3}]]},
  {id:'bike',title:'จักรยานคันเก่า',place:'ทางไปอาคารบรรณสาร',text:'จักรยานที่ใช้ปั่นข้ามอาคารเริ่มมีเสียงแปลก ๆ ร้านซ่อมใกล้รั้วเขียวเปิดอยู่',options:[['ซ่อมให้เรียบร้อย','เงิน -8 · ตรงเวลา +',{money:-8,punctual:8}],['ยืมจักรยานเพื่อนสักพัก','เพื่อน +3 · เงิน +',{friends:3,money:2}],['เดินไปเรียนก่อน','พลัง -4 · เสี่ยงเข้าสาย',{energy:-4,punctual:-6}]]},
  {id:'lost_pen',title:'ปากกาหายก่อนเริ่มคาบ',place:'ห้องเรียน',text:'ก่อนอาจารย์เข้าห้อง คุณหาไม่เจอว่าปากกาที่ใช้จดโน้ตหายไปไหน คาบนี้มีแบบฝึกหัดเก็บคะแนน',options:[['ย้อนทางไปตามหา','อาจกลับมาทัน',{energy:-2},{chance:.45,success:{effects:{knowledge:2},text:'คุณพบปากกาอยู่ใต้โต๊ะที่โรงอาหารแล้วรีบกลับมาทันแบบฝึกหัด',quote:'โชคดีที่เจอ ยังเหลือเวลาทำข้อแรกนะ'},failure:{effects:{punctual:-6,money:-3,stress:3},text:'หาเท่าไรก็ไม่เจอ สุดท้ายต้องซื้อด้ามใหม่และกลับเข้าห้องช้า',quote:'คราวหน้าลองพกสำรองไว้สักด้ามนะ'}}],['ซื้อด้ามใหม่ที่ร้านใกล้ห้อง','เงิน -3 · ตรงเวลา +2',{money:-3,punctual:2}],['ขอยืมเพื่อนก่อน','เพื่อน +2 · เครียด -2',{friends:2,stress:-2}]]},
  {id:'student_card',title:'บัตรนักศึกษาหาย',place:'อาคารบรรณสาร',text:'ก่อนยืมหนังสือ คุณพบว่าบัตรนักศึกษาไม่อยู่ในกระเป๋า อาจหล่นตอนเดินผ่านโรงอาหาร',options:[['ย้อนหาให้ครบทุกจุด','พลัง -3',{energy:-3},{chance:.55,success:{effects:{happiness:3},text:'คุณเจอบัตรตกอยู่ข้างโต๊ะที่โรงอาหารก่อนมีคนเก็บไป',quote:'โล่งอกไปที คราวหน้าลองใส่ช่องซิปนะ'},failure:{effects:{money:-6,stress:4},text:'หาไม่เจอจนต้องไปทำบัตรใหม่ เสียทั้งเวลาและค่าธรรมเนียม',quote:'วันนี้เหนื่อยหน่อย แต่เดี๋ยวก็ได้บัตรใหม่'}}],['แจ้งทำบัตรใหม่ทันที','เงิน -6 · เครียด -2',{money:-6,stress:-2}],['ขอเพื่อนช่วยตามหา','เพื่อน +3',{friends:3}]]},
  {id:'surprise_quiz',title:'แบบทดสอบไม่บอกล่วงหน้า',place:'ห้องเรียน',text:'อาจารย์แจกกระดาษคำถามตอนต้นคาบ เนื้อหาอยู่ในบทที่เพิ่งเรียนเมื่อสัปดาห์ก่อน',options:[['ลองตอบจากที่จำได้','พลัง -2',{energy:-2},{chance:.6,success:{effects:{study:8,happiness:3},text:'คำตอบหลายข้อที่อ่านมาผุดขึ้นทันเวลา คะแนนเก็บครั้งนี้ช่วยวิชาได้มาก',quote:'เห็นไหม การอ่านทีละนิดช่วยจริง ๆ'},failure:{effects:{study:-3,stress:5},text:'คุณสับสนหัวข้อสำคัญและทำได้ไม่ครบ ต้องกลับไปทบทวนก่อนสอบใหญ่',quote:'ข้อที่พลาดยังแก้ทัน ลองมาดูด้วยกันหลังคาบ'}}],['ถามอาจารย์ให้ชี้แจงโจทย์','อาจารย์ +3 · การเรียน +3',{mentor:3,study:3,stress:2}],['ทำเท่าที่ไหวแล้วจดจุดที่พลาด','ความรู้ +3 · เครียด -2',{knowledge:3,stress:-2}]]},
  {id:'group_chat',title:'ข้อความในกลุ่มถูกเข้าใจผิด',place:'โรงอาหาร 1',text:'ประโยคสั้น ๆ ที่คุณส่งในแชตงานกลุ่มทำให้เพื่อนคนหนึ่งคิดว่าคุณตำหนิเขา บรรยากาศมื้อกลางวันเงียบผิดปกติ',options:[['เดินไปคุยและอธิบายตรง ๆ','เพื่อน +7 · เครียด -3',{friends:7,stress:-3,energy:-2}],['ส่งข้อความขอโทษและนัดคุย','เพื่อน +4 · โปรเจกต์ +2',{friends:4,project:2}],['ปล่อยให้เรื่องเงียบไปเอง','พลัง +2 · เพื่อน -6',{energy:2,friends:-6}]]},
  {id:'wifi_deadline',title:'เน็ตหลุดก่อนส่งงาน',place:'อาคารบรรณสาร',text:'ไฟล์รายงานเสร็จแล้ว แต่สัญญาณอินเทอร์เน็ตขาดก่อนหมดเวลาส่งไม่กี่นาที',options:[['ขอฮอตสปอตจากเพื่อน','เพื่อน +2 · พลัง -2',{friends:2,energy:-2},{chance:.75,success:{effects:{project:7},text:'สัญญาณจากเพื่อนพอให้ส่งไฟล์ทัน คุณกดปุ่มส่งก่อนเวลาหมดไม่กี่วินาที',quote:'ส่งทันแล้ว! คราวหน้าเผื่อเวลาอัปโหลดด้วย'},failure:{effects:{project:-6,stress:6},text:'สัญญาณยังไม่เสถียร ไฟล์อัปโหลดไม่ครบและต้องอธิบายกับอาจารย์',quote:'ลองแคปหน้าจอไว้เป็นหลักฐาน เดี๋ยวเราไปคุยด้วย'}}],['วิ่งไปใช้คอมอีกอาคาร','พลัง -5 · โปรเจกต์ +5',{energy:-5,project:5}],['บันทึกหลักฐานแล้วแจ้งอาจารย์','อาจารย์ +3 · เครียด +2',{mentor:3,stress:2}]]},
  {id:'printer_queue',title:'ร้านถ่ายเอกสารคิวยาว',place:'รั้วเขียว',when:()=>!!termNow(),text:'รายงานต้องส่งเป็นเล่มก่อนคาบ ร้านถ่ายเอกสารใกล้รั้วเขียวมีคนต่อคิวจนเกือบถึงประตู',options:[['ลองรอและขอพิมพ์ด่วน','พลัง -3',{energy:-3},{chance:.55,success:{effects:{project:7,punctual:3},text:'คนหน้าคิวพิมพ์ไม่กี่หน้า ร้านจึงรับไฟล์คุณต่อและเข้าเรียนทัน',quote:'ยังทันส่งก่อนเริ่มคาบพอดี'},failure:{effects:{project:-5,punctual:-7,stress:5},text:'เครื่องพิมพ์ติดขัดตรงเล่มของคุณ รายงานเสร็จหลังอาจารย์เริ่มคาบไปแล้ว',quote:'เอาไฟล์สำรองไปให้อาจารย์ดูก่อนเถอะ'}}],['ส่งไฟล์ให้อาจารย์พร้อมอธิบาย','อาจารย์ +3 · โปรเจกต์ +2',{mentor:3,project:2,stress:2}],['กลับไปแก้รูปเล่มแล้วส่งรอบหน้า','โปรเจกต์ +4 · ตรงเวลา -4',{project:4,punctual:-4}]]},
  {id:'wrong_room',title:'เดินเข้าห้องเรียนผิดอาคาร',place:'อาคารเรียน 2',when:()=>!!termNow(),text:'คุณมาถึงหน้าห้องแล้วเพิ่งเห็นว่าเป็นรหัสวิชาอื่น ห้องเรียนที่ถูกต้องอยู่อีกอาคารหนึ่ง',options:[['วิ่งไปตามแผนที่ในโทรศัพท์','พลัง -4',{energy:-4},{chance:.7,success:{effects:{punctual:6,study:2},text:'คุณไปถึงห้องก่อนอาจารย์เริ่มสอนและได้เวลาตั้งสติ',quote:'ห้องนี้ถูกแล้ว หายใจลึก ๆ ก่อนเริ่มนะ'},failure:{effects:{punctual:-8,stress:6},text:'ทางเชื่อมอาคารคนแน่น คุณเข้าห้องช้าและพลาดคำอธิบายช่วงแรก',quote:'เดี๋ยวเราให้ยืมโน้ตช่วงต้นคาบนะ'}}],['ถามเจ้าหน้าที่แล้วเดินตามทางลัด','อาจารย์ +2 · ตรงเวลา +3',{mentor:2,punctual:3,energy:-2}],['โทรบอกเพื่อนให้แจ้งอาจารย์','เพื่อน +2 · ตรงเวลา -4',{friends:2,punctual:-4,stress:2}]]},
  {id:'found_wallet',title:'เจอกระเป๋าสตางค์ข้างสนาม',place:'สนามกีฬา',text:'หลังเลิกกิจกรรม คุณเห็นกระเป๋าสตางค์ตกอยู่ข้างอัฒจันทร์ ไม่มีใครอยู่แถวนั้น',options:[['ตามหาเจ้าของจากบัตรนักศึกษา','พลัง -3',{energy:-3},{chance:.65,success:{effects:{friends:5,happiness:5},text:'คุณหาเจ้าของเจอที่อาคารชิน เขาดีใจมากและจำหน้าคุณได้',quote:'ขอบคุณจริง ๆ เรากำลังตามหาทั้งเย็น'},failure:{effects:{stress:3},text:'คุณเดินหาจนเย็นแต่ยังไม่เจอ จึงฝากกระเป๋าไว้กับเจ้าหน้าที่',quote:'ฝากไว้ที่นี่ถูกแล้ว เดี๋ยวเราช่วยประกาศหาเจ้าของ'}}],['ส่งให้เจ้าหน้าที่ทันที','ความสุข +3',{happiness:3}],['ชวนเพื่อนช่วยประกาศหา','เพื่อน +3 · กิจกรรม +2',{friends:3,activity:2,energy:-2}]]},
  {id:'mega',title:'เย็นวันศุกร์ที่เมกาบางนา',place:'เมกาบางนา',text:'หลังสัปดาห์หนัก ๆ เพื่อนชวนไปเดินเมกาบางนา คุณมองยอดเงินในกระเป๋าแล้วคิดสักพัก',options:[['ไปกินข้าวและเดินเล่น','เพื่อน +8 · ความสุข +7 · เงิน -12',{friends:8,happiness:7,money:-12}],['ไปแต่กำหนดงบ','เพื่อน +5 · ความสุข +4 · เงิน -5',{friends:5,happiness:4,money:-5}],['พักอยู่หอ','พลัง +8 · เงิน +2',{energy:8,money:2}]]},
  {id:'market',title:'แวะมาร์เก็ตวิลเลจ',place:'มาร์เก็ตวิลเลจ สุวรรณภูมิ',text:'มีเวลาว่างก่อนกลับหอ เพื่อนชวนแวะมาร์เก็ตวิลเลจเพื่อซื้อของใช้และหาอะไรกิน',options:[['ไปด้วยกัน','เพื่อน +6 · เงิน -7',{friends:6,money:-7,happiness:3}],['ฝากเพื่อนซื้อแล้วกลับไปทำงาน','การเรียน +5 · เงิน -3',{study:5,money:-3}],['กลับหอ พักและเก็บเงินไว้ก่อน','พลัง +5',{energy:5}]]},
  {id:'airplane',title:'ตลาดนัดเรือบิน',place:'ตลาดนัดเรือบิน',text:'ค่ำนี้กลุ่มเพื่อนนัดกันที่ตลาดนัดเรือบิน บางคนเพิ่งส่งงานเสร็จและอยากฉลอง',options:[['ไปเดินตลาดกับเพื่อน','เพื่อน +7 · ความสุข +6 · เงิน -8',{friends:7,happiness:6,money:-8}],['ไปสั้น ๆ แล้วกลับ','เพื่อน +4 · ความสุข +3 · เงิน -4',{friends:4,happiness:3,money:-4}],['ขอผ่านเพื่ออ่านสอบ','การเรียน +8 · เครียด +2',{study:8,stress:2}]]},
  {id:'library',title:'โต๊ะประจำในอาคารบรรณสาร',place:'อาคารบรรณสาร',text:'คุณเห็นเพื่อนนั่งอ่านหนังสืออยู่ในห้องสมุด เหลือที่ว่างหนึ่งที่และอีกไม่นานจะสอบกลางภาค',options:[['นั่งอ่านด้วยกัน','การเรียน +7 · เพื่อน +4',{study:7,friends:4}],['ติวให้เพื่อนที่ตามไม่ทัน','เพื่อน +9 · การเรียน +3',{friends:9,study:3,energy:-4}],['หามุมเงียบอ่านคนเดียว','การเรียน +9',{study:9,stress:2}]]},
  {id:'scholarship',title:'ประกาศทุนการศึกษา',place:'อาคารกิจกรรมนักศึกษา',text:'มีทุนสำหรับคนที่ผลเรียนและกิจกรรมดี เปิดรับสมัครถึงเย็นนี้ ต้องเตรียมเอกสารและเขียนเหตุผล',options:[['สมัครทุนอย่างเต็มที่','โอกาสทุน · พลัง -',{scholarship:1,energy:-5,study:3}],['ช่วยเพื่อนเตรียมเอกสารด้วย','เพื่อน +8 · โอกาสทุน',{scholarship:1,friends:8,energy:-8}],['ยังไม่สมัครเทอมนี้','พลัง +4',{energy:4}]]},
  {id:'parttime',title:'งานพิเศษหลังเลิกเรียน',place:'รั้วเขียว',text:'ร้านใกล้รั้วเขียวรับคนช่วยงานช่วงเย็น รายได้จะช่วยเรื่องค่าใช้จ่าย แต่เวลาทบทวนบทเรียนจะน้อยลง',options:[['รับงานสัปดาห์ละสองวัน','เงิน +12 · พลัง -7',{money:12,energy:-7,study:-3}],['รับเฉพาะวันหยุด','เงิน +7 · พลัง -3',{money:7,energy:-3}],['ยังไม่รับงาน','การเรียน +4',{study:4}]]},
  {id:'pothong',title:'โพธิ์ทองเกมส์',place:'สนามกีฬา',text:'เสียงเชียร์ดังทั่วสนาม วันกีฬาสีที่ทุกคนเรียกว่าโพธิ์ทองเกมส์มาถึงแล้ว คุณจะร่วมตรงไหน?',options:[['ลงแข่งกีฬา','กิจกรรม +10 · สุขภาพ +6',{activity:10,health:6,energy:-7}],['ช่วยทำป้ายและเชียร์','กิจกรรม +8 · เพื่อน +6',{activity:8,friends:6,energy:-4}],['แวะดูแล้วกลับอ่านหนังสือ','กิจกรรม +2 · การเรียน +6',{activity:2,study:6}]]},
  {id:'teacherday',title:'วันไหว้ครู',place:'หอประชุม',months:[7,8,9],text:'รุ่นพี่ชวนช่วยเตรียมพานไหว้ครู อาจารย์ที่ปรึกษาของคุณก็อยู่ในงานนี้',options:[['ช่วยเตรียมงาน','กิจกรรม +7 · อาจารย์ +5',{activity:7,mentor:5,energy:-4}],['เข้าร่วมพิธีและคุยกับอาจารย์','อาจารย์ +7 · พลัง -2',{mentor:7,energy:-2}],['ไปเรียนตามตารางแล้วค่อยแวะ','การเรียน +4 · กิจกรรม +2',{study:4,activity:2}]]},
  {id:'loy',title:'ลอยกระทงกับเพื่อน',place:'ลานโพธิ์',months:[11],text:'ค่ำคืนลอยกระทงมีไฟประดับอยู่รอบลานโพธิ์ เพื่อนสนิทส่งข้อความมาชวนเจอ',options:[['ไปด้วยกัน','เพื่อน +8 · ความสุข +7',{friends:8,happiness:7,money:-4}],['ไปสั้น ๆ ก่อนกลับอ่านงาน','เพื่อน +4 · การเรียน +4',{friends:4,study:4}],['พักที่หอ','พลัง +7',{energy:7}]]},
  {id:'chinese',title:'ตรุษจีนในมหาวิทยาลัย',place:'สวนหยินหยาง',months:[1,2],text:'บรรยากาศตรุษจีนเต็มไปด้วยเสียงเพลงและร้านอาหาร เพื่อนชวนไปช่วยบูธวัฒนธรรม',options:[['ช่วยบูธ','กิจกรรม +8 · เพื่อน +6',{activity:8,friends:6,energy:-5}],['เดินชมกับเพื่อน','เพื่อน +5 · ความสุข +5',{friends:5,happiness:5,money:-3}],['กลับไปเตรียมสอบ','การเรียน +7',{study:7,stress:2}]]},
  {id:'songkran',title:'สงกรานต์ก่อนปิดเทอม',place:'ลานโพธิ์',months:[4],text:'กิจกรรมสงกรานต์ก่อนปิดเทอมเริ่มขึ้น ใคร ๆ ก็อยากพักจากงานที่กองเต็มโต๊ะ',options:[['เข้าร่วมกิจกรรม','กิจกรรม +8 · ความสุข +7',{activity:8,happiness:7,energy:-4}],['ชวนเพื่อนถ่ายรูป','เพื่อน +7 · ความสุข +4',{friends:7,happiness:4}],['กลับไปทำโปรเจกต์','โปรเจกต์ +8',{project:8,stress:3}]]},
  {id:'volunteer',title:'ออกค่ายอาสา',place:'อาคารกิจกรรมนักศึกษา',text:'ชมรมชวนลงชื่อออกค่ายอาสาช่วงวันหยุด ต้องใช้เวลาและแรง แต่เพื่อนหลายคนไปด้วย',options:[['ลงชื่อร่วมค่าย','กิจกรรม +12 · เพื่อน +6',{activity:12,friends:6,energy:-9}],['ช่วยเตรียมอุปกรณ์','กิจกรรม +6 · พลัง -3',{activity:6,energy:-3}],['ขอใช้เวลานี้ทบทวนบทเรียน','การเรียน +7',{study:7}]]},
  {id:'openhouse',title:'เปิดบ้านหัวเฉียว',place:'อาคารเรียน 2',text:'มหาวิทยาลัยจัดงานเปิดบ้าน รุ่นน้องถามถึงชีวิตในสาขาของคุณ คุณอยากเล่าอะไรให้เขาฟัง?',options:[['เป็นไกด์พาชมสาขา','กิจกรรม +8 · รุ่นน้อง +',{activity:8,junior:6,energy:-4}],['ช่วยสาธิตงานหรือโปรเจกต์','โปรเจกต์ +6 · กิจกรรม +5',{project:6,activity:5}],['ไปแวะดูงานแล้วกลับอ่านหนังสือ','กิจกรรม +2 · การเรียน +5',{activity:2,study:5}]]},
  {id:'talent',title:'เวทีประกวดความสามารถ',place:'หอประชุม',text:'ชมรมเปิดรับสมัครการแสดงและประกวดร้องเพลง เพื่อนบอกว่าคุณน่าจะลองขึ้นเวทีสักครั้ง',options:[['ขึ้นเวทีกับเพื่อน','กิจกรรม +10 · เพื่อน +5',{activity:10,friends:5,stress:3}],['ช่วยงานหลังเวที','กิจกรรม +7 · เพื่อน +4',{activity:7,friends:4,energy:-4}],['ไปเป็นผู้ชม','ความสุข +5',{happiness:5}]]},
  {id:'taichi',title:'เช้าที่สวนหยินหยาง',place:'สวนหยินหยาง',text:'กลุ่มไทเก๊กกำลังฝึกท่าช้า ๆ ท่ามกลางต้นไม้ เพื่อนชวนให้ลองก่อนเข้าเรียน',options:[['ร่วมฝึก','สุขภาพ +7 · เครียด -6',{health:7,stress:-6}],['นั่งคุยกับเพื่อน','เพื่อน +5 · เครียด -3',{friends:5,stress:-3}],['รีบไปเตรียมคาบเช้า','ตรงเวลา +',{punctual:6}]]},
  {id:'candle',title:'งานแห่เทียนพรรษา',place:'ลานโพธิ์',months:[7,8],text:'ชมรมกำลังจัดขบวนและเตรียมงานแห่เทียนพรรษา ต้องการคนช่วยช่วงบ่าย',options:[['ช่วยเต็มบ่าย','กิจกรรม +8 · เพื่อน +3',{activity:8,friends:3,energy:-5}],['ช่วยหนึ่งชั่วโมง','กิจกรรม +4 · การเรียน +2',{activity:4,study:2}],['ไปทำงานที่ค้างไว้','การเรียน +6',{study:6}]]},
  {id:'internship',title:'โอกาสฝึกงาน',place:'ห้องอาจารย์ที่ปรึกษา',minYear:3,text:'อาจารย์ที่ปรึกษาแนะนำที่ฝึกงานสองแบบ แบบหนึ่งได้ทำงานหนักแต่อาจได้ประสบการณ์มาก อีกแบบมีเวลาให้ชีวิตด้านอื่น',options:[['เลือกงานท้าทาย','โปรเจกต์ +12 · เครียด +5',{project:12,stress:5,mentor:4}],['เลือกที่สมดุลกับชีวิต','โปรเจกต์ +5 · ความสุข +5',{project:5,happiness:5,mentor:2}],['ขอปรึกษารุ่นพี่ก่อน','รุ่นพี่ +7 · โปรเจกต์ +3',{senior:7,project:3}]]},
  {id:'junior',title:'รุ่นน้องขอคำแนะนำ',place:'อาคารบรรณสาร',minYear:3,text:'รุ่นน้องปีหนึ่งกำลังลังเลกับรายวิชาและกิจกรรม เขาจำได้ว่าคุณเคยช่วยในงานเปิดบ้าน',options:[['นั่งช่วยวางแผนให้','รุ่นน้อง +9 · กิจกรรม +3',{junior:9,activity:3,energy:-4}],['ส่งโน้ตและแนะนำสั้น ๆ','รุ่นน้อง +5 · การเรียน +2',{junior:5,study:2}],['นัดคุยวันหลัง','พลัง +3',{energy:3}]]},
  {id:'farewell',title:'ปัจฉิมกับคนที่เดินมาด้วยกัน',place:'ลานโพธิ์',minYear:4,lateOnly:true,text:'ถึงช่วงปลายทาง เพื่อนชวนรวบรวมภาพเก่าและความทรงจำก่อนแยกย้ายกันไป',options:[['ช่วยทำสมุดความทรงจำ','เพื่อน +10 · ความสุข +6',{friends:10,happiness:6,energy:-4}],['ไปถ่ายภาพตามสถานที่โปรด','เพื่อน +6 · ความสุข +7',{friends:6,happiness:7}],['จัดการงานสุดท้ายก่อน','โปรเจกต์ +7',{project:7,stress:3}]]}
];
const CAMPUS_CALENDAR={1:{45:'teacherday',112:'loy',246:'volunteer'},2:{88:'pothong',140:'talent',190:'chinese',255:'songkran',301:'parttime'},3:{65:'openhouse',260:'junior',351:'candle'},4:{70:'internship'}};
const INCIDENTS=[
  {id:'pen_drop',title:'ปากกาหายระหว่างคาบ',place:'ห้องเรียน',speaker:'self',text:'คุณพลิกกระเป๋าหาปากกาที่เพิ่งใช้ไปเมื่อเช้า สุดท้ายต้องซื้อใหม่ก่อนคาบถัดไป',quote:'ของเล็ก ๆ ก็ทำให้วันยุ่งขึ้นได้เหมือนกัน',effects:{money:-2,stress:1},when:()=>!!termNow()},
  {id:'bike_slip',title:'จักรยานลื่นหลังฝนตก',place:'ทางจักรยานในมหาวิทยาลัย',speaker:'friend',text:'ล้อจักรยานลื่นบนพื้นเปียก คุณล้มเบา ๆ และต้องแวะซื้อพลาสเตอร์',quote:'ค่อย ๆ ลุกนะ เดี๋ยวเราช่วยเข็นจักรยานไป',effects:{health:-5,energy:-3,money:-2},when:()=>state.day%19<4},
  {id:'late_bus',title:'รถติดก่อนเข้าเรียน',place:'รั้วเขียว',speaker:'self',text:'รถที่นั่งมาจากบ้านติดอยู่หน้าเส้นทางเข้ามอ คาบแรกเริ่มไปแล้ว',quote:'พรุ่งนี้ต้องเผื่อเวลาออกจากบ้านมากกว่านี้',effects:{punctual:-6,stress:2},when:()=>state.character.living==='เดินทางจากบ้าน'&&!!termNow()},
  {id:'friend_tiff',title:'เถียงกันเรื่องงานกลุ่ม',place:'โรงอาหาร 2',speaker:'friend',text:'คุณกับเพื่อนเข้าใจลำดับงานไม่ตรงกัน คุยไปคุยมาต่างคนต่างเงียบ',quote:'ไว้เราใจเย็นแล้วมาคุยเรื่องนี้กันอีกที',effects:{friends:-4,stress:3},when:()=>!!termNow()},
  {id:'friend_snack',title:'เพื่อนฝากขนมไว้ให้',place:'อาคารบรรณสาร',speaker:'friend',text:'คุณอ่านงานจนลืมมื้อบ่าย เพื่อนวางขนมไว้ข้างสมุดโดยไม่พูดมาก',quote:'กินก่อน เดี๋ยวค่อยอ่านต่อ',effects:{happiness:3,energy:2,friends:2}},
  {id:'notes_found',title:'เจอโน้ตที่ตามหา',place:'อาคารบรรณสาร',speaker:'self',text:'หน้าโน้ตที่หายไปอยู่คั่นในหนังสืออีกเล่ม พออ่านต่อก็เข้าใจบทเรียนที่ค้างไว้',quote:'ตรงนี้เองที่อ่านแล้วไม่เข้าใจเมื่อวาน',effects:{knowledge:2,stress:-2},when:()=>state.routine==='study'},
  {id:'umbrella_share',title:'ร่มคันเดียวใต้ฝน',place:'ลานโพธิ์',speaker:'friend',text:'ฝนลงเม็ดตอนเลิกคาบ เพื่อนขยับร่มให้คุณเดินไปด้วยจนถึงอาคารถัดไป',quote:'เข้ามาใกล้ ๆ เดี๋ยวเปียก',effects:{friends:3,happiness:2},when:()=>state.day%19<4},
  {id:'upload_delay',title:'ไฟล์งานอัปโหลดช้า',place:'อาคารบรรณสาร',speaker:'self',text:'ไฟล์โปรเจกต์ใช้เวลาส่งนานกว่าคิด ต้องกลับไปตรวจว่าระบบรับไฟล์ครบหรือยัง',quote:'คราวหน้าจะเผื่อเวลาอัปโหลดก่อนกำหนด',effects:{project:-3,stress:2},when:()=>!!termNow()},
  {id:'teacher_hint',title:'คำแนะนำหลังคาบ',place:'หน้าห้องอาจารย์',speaker:'teacher',text:'อาจารย์เห็นจุดที่คุณติดในงานและชี้ให้ลองแก้ทีละส่วน',quote:'ลองเริ่มจากข้อที่มั่นใจก่อน แล้วส่วนอื่นจะตามมา',effects:{study:3,mentor:2},when:()=>!!termNow()},
  {id:'club_help',title:'ถูกเรียกไปช่วยงานเล็ก ๆ',place:'อาคารกิจกรรมนักศึกษา',speaker:'friend',text:'ทีมชมรมขาดคนจัดอุปกรณ์พอดี คุณแวะช่วยก่อนกลับ',quote:'ขอบใจนะ พอมีเธองานเสร็จไวขึ้นมาก',effects:{activity:3,friends:2,energy:-2},when:()=>state.routine==='activities'},
  {id:'good_run',title:'วิ่งได้อีกหนึ่งรอบ',place:'สนามกีฬา',speaker:'friend',text:'เย็นนี้คุณวิ่งได้ไกลกว่าสัปดาห์ก่อนโดยไม่ต้องฝืน',quote:'เห็นไหม ร่างกายเริ่มคุ้นแล้ว',effects:{health:3,stress:-2,energy:-2},when:()=>state.routine==='sports'},
  {id:'extra_shift',title:'มีคนขอให้ช่วยกะสั้น ๆ',place:'รั้วเขียว',speaker:'self',text:'ร้านใกล้รั้วเขียวขาดคนช่วยช่วงเย็น คุณรับงานสั้น ๆ และได้เงินเพิ่ม',quote:'เงินก้อนเล็กนี้ช่วยค่าเดินทางได้อีกหลายวัน',effects:{money:4,energy:-3},when:()=>state.stats.money<45},
  {id:'phone_flat',title:'โทรศัพท์แบตหมดก่อนกลับ',place:'รั้วเขียว',speaker:'self',text:'หน้าจอดับตอนกำลังเปิดแผนที่กลับ คุณแวะขอยืมปลั๊กที่ร้านใกล้รั้วเขียวและกลับช้ากว่าปกติ',quote:'พรุ่งนี้ต้องชาร์จก่อนออกจากห้อง',effects:{energy:-2,stress:2}},
  {id:'canteen_queue',title:'แถวโรงอาหารยาวกว่าที่คิด',place:'โรงอาหาร 1',speaker:'friend',text:'เวลาพักเที่ยงเหลือน้อย เพื่อนช่วยต่อแถวอีกช่องให้จนได้ข้าวทันคาบบ่าย',quote:'เอาจานนี้ไปก่อน เดี๋ยวเราตามไป',effects:{friends:2,energy:2}},
  {id:'notes_spill',title:'น้ำหกใส่โน้ต',place:'อาคารบรรณสาร',speaker:'self',text:'แก้วน้ำล้มใส่หน้าที่จดไว้ คุณต้องนั่งเขียนใหม่จากรูปที่ถ่ายเก็บไว้',quote:'ดีที่ถ่ายรูปไว้ งานเย็นนี้เลยยังไปต่อได้',effects:{energy:-3,knowledge:1,stress:2},when:()=>!!termNow()},
  {id:'groupmate_absent',title:'เพื่อนในกลุ่มขาดเรียน',place:'ห้องเรียน',speaker:'friend',text:'เพื่อนร่วมกลุ่มป่วยและส่งข้อความขอให้คุณช่วยสรุปสิ่งที่อาจารย์อธิบายวันนี้',quote:'ขอบใจนะ พรุ่งนี้เราจะกลับไปทำส่วนของตัวเองต่อ',effects:{friends:3,project:2,energy:-2},when:()=>!!termNow()},
  {id:'wrong_turn',title:'เลี้ยวผิดทางระหว่างปั่นจักรยาน',place:'ทางจักรยานในมหาวิทยาลัย',speaker:'self',text:'คุณปั่นเลยทางเข้าอาคารไปหนึ่งช่วง ต้องวนกลับก่อนเริ่มคาบ',quote:'จำทางลัดตรงนี้ไว้ วันหลังจะไม่วนอีก',effects:{punctual:-3,energy:-2},when:()=>!!termNow()},
  {id:'free_tutoring',title:'รุ่นพี่เปิดโต๊ะติว',place:'อาคารบรรณสาร',speaker:'self',text:'รุ่นพี่นั่งช่วยอธิบายโจทย์ที่คุณติดอยู่ พอกลับมาทำเองก็เริ่มเห็นวิธี',quote:'ลองทำข้อนี้อีกครั้ง คราวนี้น่าจะไหว',effects:{knowledge:3,senior:2},when:()=>!!termNow()},
  {id:'club_poster',title:'ช่วยติดโปสเตอร์ก่อนกลับ',place:'ลานโพธิ์',speaker:'friend',text:'เพื่อนในชมรมขอแรงติดโปสเตอร์งานสัปดาห์หน้า ใช้เวลาไม่นานแต่ได้คุยกันระหว่างเดิน',quote:'แปะตรงนี้คนเดินผ่านเห็นแน่',effects:{activity:2,friends:2,energy:-2},when:()=>state.routine==='activities'},
  {id:'rain_shelter',title:'ติดฝนใต้ชายคา',place:'ลานโพธิ์',speaker:'friend',text:'ฝนลงเม็ดหนักจนต้องหยุดรอ เพื่อนที่ไม่ค่อยได้คุยกันยืนหลบอยู่ข้าง ๆ และเริ่มชวนคุย',quote:'ช่วงนี้วิชาเธอเป็นยังไงบ้าง',effects:{friends:2,stress:-2},when:()=>state.day%19<4}
];

let catalog = [];
let state = null;
let ticker = null;
let lastTick = 0;
let modalWasPlaying = false;

function hashSeed(input){let h=2166136261;for(const ch of String(input)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0 || 1}
function random(){let x=state.rng; x^=x<<13;x^=x>>>17;x^=x<<5;state.rng=x>>>0;return (state.rng>>>0)/4294967296}
function pick(arr){return arr[Math.floor(random()*arr.length)]}
function givenNames(nationality,gender){
  if(nationality==='จีน')return gender==='หญิง'?CHINESE_GIVEN_NAMES.filter(name=>['เจียอี้','เสี่ยวอวี่','เหวินหลิง','หยู่ถง','ซินอี','เหมยหลิน'].includes(name)):gender==='ชาย'?CHINESE_GIVEN_NAMES.filter(name=>['ห่าวหราน','จื่อหาน','หมิงเจ๋อ','อี้เฉิน'].includes(name)):CHINESE_GIVEN_NAMES;
  if(nationality==='ฟิลิปปินส์')return gender==='หญิง'?FILIPINO_GIVEN_NAMES.slice(0,5):gender==='ชาย'?FILIPINO_GIVEN_NAMES.slice(5):FILIPINO_GIVEN_NAMES;
  return gender==='หญิง'?THAI_GIVEN_NAMES.slice(0,57):gender==='ชาย'?THAI_GIVEN_NAMES.slice(57):THAI_GIVEN_NAMES;
}
function inferGender(name,nationality,seed){const first=nationality==='จีน'?name.split(' ').at(-1):name.split(' ')[0];if(givenNames(nationality,'หญิง').includes(first))return 'หญิง';if(givenNames(nationality,'ชาย').includes(first))return 'ชาย';return hashSeed(seed)%2?'หญิง':'ชาย'}
function genderIcon(gender){return gender==='ชาย'?'♂':'♀'}
function facultyLook(faculty){return FACULTY_LOOKS[Math.max(0,FACULTIES.findIndex(item=>item.name===faculty))]}
function avatarPixels(character){
  const palette=AVATAR_PALETTES[character.avatar%AVATAR_PALETTES.length]||AVATAR_PALETTES[0],look=facultyLook(character.faculty),pixels=[];
  const add=(x,y,w,h,color)=>pixels.push([x,y,w,h,color]);
  add(9,77,46,3,'#432f35');add(18,60,12,16,'#283e50');add(35,60,12,16,'#283e50');add(16,73,15,5,'#292d35');add(34,73,15,5,'#292d35');
  add(10,37,7,23,look.shirt);add(47,37,7,23,look.shirt);add(10,57,7,6,palette.skin);add(47,57,7,6,palette.skin);
  add(15,33,34,30,look.shirt);add(15,33,34,5,look.trim);add(28,31,9,7,palette.skin);
  if(look.motif==='cross'){add(18,39,8,21,'#fff9ed');add(38,39,8,21,'#fff9ed');add(30,40,4,15,look.trim);add(25,45,14,4,look.trim);add(19,40,6,3,look.trim)}
  if(look.motif==='tie'){add(24,37,16,5,'#fff4de');add(30,40,4,14,look.trim);add(27,52,10,5,look.trim);add(18,39,3,19,'#e8d7b5');add(43,39,3,19,'#e8d7b5')}
  if(look.motif==='book'){add(24,45,16,12,look.trim);add(31,46,2,11,'#fff5d7');add(26,48,4,2,'#fff5d7');add(34,48,4,2,'#fff5d7')}
  if(look.motif==='sash'){for(let i=0;i<5;i++)add(19+i*4,35+i*4,6,4,look.trim);add(38,52,6,6,look.trim)}
  if(look.motif==='code'){add(22,44,4,4,look.trim);add(18,48,4,4,look.trim);add(22,52,4,4,look.trim);add(38,44,4,4,look.trim);add(42,48,4,4,look.trim);add(38,52,4,4,look.trim);add(29,53,6,3,'#fff4d0')}
  if(look.motif==='camera'){add(23,43,19,14,'#f3d79b');add(27,40,10,4,'#f3d79b');add(29,47,8,7,'#493748');add(31,49,4,3,look.trim)}
  if(look.motif==='star'){add(30,43,4,13,look.trim);add(25,47,14,4,look.trim);add(27,53,10,3,look.trim)}
  add(22,14,21,19,palette.skin);add(19,20,4,10,palette.skin);add(43,20,4,10,palette.skin);
  if(character.gender==='หญิง'){add(18,9,29,8,palette.hair);add(17,16,8,25,palette.hair);add(41,16,8,25,palette.hair);add(22,14,22,5,palette.hair);add(18,38,6,6,palette.hair);add(43,38,6,6,palette.hair)}
  else{add(20,9,25,8,palette.hair);add(18,15,7,10,palette.hair);add(41,15,7,10,palette.hair);add(24,14,20,5,palette.hair)}
  add(27,24,3,3,'#252d32');add(38,24,3,3,'#252d32');add(32,30,5,2,'#9e5f59');
  return pixels;
}
function avatarSvg(character){return `<svg viewBox="0 0 64 80" shape-rendering="crispEdges" role="img" aria-label="ตัวละครพิกเซล ${esc(character.gender)} ${esc(character.faculty)}">${avatarPixels(character).map(([x,y,w,h,color])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`).join('')}</svg>`}
function drawAvatar(ctx,character,x,y,scale){for(const [px,py,w,h,color] of avatarPixels(character)){ctx.fillStyle=color;ctx.fillRect(x+px*scale,y+py*scale,w*scale,h*scale)}}
globalThis.sceneAvatarPixels=avatarPixels;
function fullName(nationality='ไทย',excluded=new Set(),gender=null){
  const given=givenNames(nationality,gender);
  const family=nationality==='จีน'?CHINESE_SURNAMES:nationality==='ฟิลิปปินส์'?FILIPINO_SURNAMES:THAI_SURNAMES;
  let name;
  do{const first=pick(given),last=pick(family);name=nationality==='จีน'?`${last} ${first}`:`${first} ${last}`}while(excluded.has(name));
  return name;
}
function nameFromHash(key,nationality,excluded){
  const given=nationality==='จีน'?CHINESE_GIVEN_NAMES:nationality==='ฟิลิปปินส์'?FILIPINO_GIVEN_NAMES:THAI_GIVEN_NAMES;
  const family=nationality==='จีน'?CHINESE_SURNAMES:nationality==='ฟิลิปปินส์'?FILIPINO_SURNAMES:THAI_SURNAMES;
  const total=given.length*family.length,start=hashSeed(key)%total;
  for(let step=0;step<total;step++){
    const index=(start+step)%total,first=given[Math.floor(index/family.length)],last=family[index%family.length];
    const name=nationality==='จีน'?`${last} ${first}`:`${first} ${last}`;
    if(!excluded.has(name))return name;
  }
}
function migrateNames(){
  const oldName=state.character.name,oldFriends=state.friends.map(f=>f.name),used=new Set();
  state.character.name=nameFromHash(`${state.seed}|student`,state.character.nationality,used);
  used.add(state.character.name);
  state.friends.forEach((friend,i)=>{friend.name=nameFromHash(`${state.seed}|friend|${i}`,'ไทย',used);used.add(friend.name)});
  const pairs=[[oldName,state.character.name],...oldFriends.map((old,i)=>[old,state.friends[i].name])];
  const replaceNames=value=>{if(typeof value!=='string')return value;for(const [oldName,newName] of pairs){if(oldName===newName)continue;const escaped=oldName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');value=value.replace(new RegExp(`(^|[^\\p{L}\\p{M}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{M}\\p{N}])`,'gu'),(_,prefix)=>prefix+newName)}return value};
  if(state.pending){state.pending.title=replaceNames(state.pending.title);state.pending.text=replaceNames(state.pending.text)}
  for(const memory of state.memory)memory.title=replaceNames(memory.title);
  state.nameVersion=2;
}
function clamp(n,min=0,max=100){return Math.max(min,Math.min(max,n))}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function weighted(items){let total=items.reduce((a,x)=>a+x.weight,0),n=random()*total;for(const item of items){n-=item.weight;if(n<0)return item}return items.at(-1)}
function dateFor(day){const d=new Date(START_DATE.getTime()+day*86400000);return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()+543}`}
function clockForMinute(value){const minute=Math.max(0,Math.min(1439,Math.floor(value)));return `${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`}
function currentMinute(){return Math.min(1439,Math.floor(clamp(state.dayFraction,0,1)*1440))}
function yearNow(){return Math.min(state.years,Math.floor(state.day/365)+1)}
function termNow(){const d=state.day%365;return d<150?1:d<182?0:d<332?2:0}
function yearTerm(){if(state.ended)return state.failure?`ปี ${yearNow()} · สิ้นสุดรอบ`:`ปี ${state.years} · จบการศึกษา`;return `ปี ${yearNow()} · ${termNow()?`เทอม ${termNow()}`:'ปิดเทอม'}`}
function courseType(c){return /ปฏิบัติ|ฝึก|lab|ทดลอง|คลินิก|สนาม|โครงงาน|โครงการ/i.test(c.title)?'practical':'theory'}
function makeCourse(c){const credit=Number(c.code.match(/(\d)$/)?.[1]);return {code:c.code,title:c.title,credits:credit>=1&&credit<=6?credit:3,type:courseType(c),attendance:68,punctual:68,assignment:68,project:68,midterm:null,final:null,weeks:0,boost:0}}
function startCourses(){
  const faculty=state.character.faculty, major=state.character.major, year=yearNow(), term=termNow();
  if(!term){state.courses=[];return}
  const used=new Set(state.transcript.map(x=>x.code));
  const specific=FACULTIES.find(f=>f.name===faculty);
  const match=specific.match[specific.majors.indexOf(major)]||'';
  const own=catalog.filter(c=>!c.isGE&&c.paths.some(p=>p.faculty===faculty)&&!used.has(c.code)&&!/ชื่อไม่ระบุใน Moodle/.test(c.title));
  const ge=catalog.filter(c=>c.isGE&&!used.has(c.code)).map(course=>({course,order:random()})).sort((a,b)=>a.order-b.order).map(x=>x.course);
  const courseYear=c=>{let m=c.code.match(/^[A-Z]+(\d)/);return m?Number(m[1]):null};
  const rank=c=>{let y=courseYear(c);return (y===year?12:y&&y<year?8:y===year+1?2:0)+random()*2};
  const order=pool=>pool.map(course=>({course,priority:rank(course)})).sort((a,b)=>b.priority-a.priority||a.course.code.localeCompare(b.course.code)).map(x=>x.course);
  const suitable=c=>{let y=courseYear(c);return !y||y===0||y<=year};
  const branch=order(own.filter(c=>!match||c.paths.some(p=>p.faculty===faculty&&p.branch.includes(match))));
  const common=order(own.filter(c=>c.paths.some(p=>p.faculty===faculty&&/ไม่ระบุสาขา|หมวดคณะโดยตรง/.test(p.branch))));
  const electives=order(own);
  const count=year>4?3:4;
  const selection=[];
  const add=(pool,limit)=>{for(const c of pool){if(selection.length>=count||limit<=0)break;if(!selection.some(x=>x.code===c.code)){selection.push(c);limit--}}};
  add(branch.filter(suitable),2);
  add(common.filter(suitable),1);
  add(ge,branch.some(suitable)?1:2);
  add(electives.filter(suitable),count-selection.length);
  add(branch,count-selection.length);
  add(ge,count-selection.length);
  add(electives,count-selection.length);
  state.courses=selection.map(makeCourse);
  state.semesterStudy=0;
  state.semesterWeeks=0;
}
function newState(seed){
  const value=String(seed||Math.random().toString(36).slice(2,10)).trim();
  state={version:1,nameVersion:2,seed:value,rng:hashSeed(value),day:0,dayFraction:0,nextMomentIndex:0,momentSchedule:[],queuedIncident:null,speed:1,playing:false,ended:false,pending:null,routine:'study',paths:{},stats:{energy:72,health:70,stress:28,happiness:67,money:60,activity:12,knowledge:35},friends:[],senior:54,junior:35,mentor:45,transcript:[],courses:[],memory:[],dialogue:null,dialogueLog:[],seen:[],nextEventDay:24,nextIncidentDay:12,lastIncidentId:null,semesterStudy:0,semesterWeeks:0,scholarship:false,character:null};
  let f=weighted(FACULTIES),i=Math.floor(random()*f.majors.length);
  let nationalityRoll=random(),nationality=nationalityRoll<0.0001?'จีน':nationalityRoll<0.0002?'ฟิลิปปินส์':'ไทย';
  let gender=random()<.5?'หญิง':'ชาย';
  let name=fullName(nationality,new Set(),gender);
  let wealth=weighted([{name:'ต้องวางแผนค่าใช้จ่าย',weight:35},{name:'พอใช้จ่าย',weight:50},{name:'ค่อนข้างสบาย',weight:15}]).name;
  let living=weighted([{name:'อยู่หอ',weight:60},{name:'เดินทางจากบ้าน',weight:40}]).name;
  state.character={name,gender,faculty:f.name,major:f.majors[i],years:f.years||4,nationality,hometown:nationality==='ไทย'?pick(HOMES):nationality==='จีน'?'ประเทศจีน':'ประเทศฟิลิปปินส์',wealth,living,avatar:Math.floor(random()*AVATAR_PALETTES.length)};
  state.teacher=pick(TEACHERS);
  state.nextIncidentDay=9+Math.floor(random()*8);
  state.years=state.character.years;
  const usedNames=new Set([name]);
  for(let j=0;j<3;j++){let n=fullName('ไทย',usedNames);usedNames.add(n);state.friends.push({name:n,score:45+Math.floor(random()*18),role:j===0?'เพื่อนร่วมสาขา':j===1?'เพื่อนในชมรม':'เพื่อนต่างคณะ'})}
  startCourses();
  openEvent(EVENTS[0]);
  save();render();
}
function save(){if(!state)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));$('saveStatus').textContent='บันทึกอัตโนมัติแล้ว'}catch{$('saveStatus').textContent='บันทึกไม่ได้'}}
function load(){try{let raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;let saved=JSON.parse(raw);if(saved.version!==1||!saved.character)return false;state=saved;state.playing=false;state.years=state.character.years;state.teacher??='อาจารย์นลิน';state.stats.knowledge??=35;state.paths??={};state.dialogueLog??=[];if(state.pending&&!state.pending.time){const minute=eventMinute(state.pending);state.pending.time=clockForMinute(minute);state.dayFraction=minute/1440}state.nextIncidentDay??=state.day+9+hashSeed(`${state.seed}|incident`)%8;state.lastIncidentId??=null;if(!Array.isArray(state.momentSchedule)){state.momentSchedule=makeMomentSchedule();state.nextMomentIndex=state.momentSchedule.filter(item=>item.minute/1440<=state.dayFraction).length}else state.nextMomentIndex??=0;state.queuedIncident??=null;state.character.avatar??=hashSeed(state.seed)%AVATAR_PALETTES.length;if(state.nameVersion!==2)migrateNames();state.character.gender??=inferGender(state.character.name,state.character.nationality,state.seed);const failed=state.transcript.filter(c=>c.grade==='F');if(failed.length){state.ended=true;state.failure=failed.map(c=>c.code);state.pending=null}if(state.ended)state.dayFraction=1;if(!state.dialogue&&!state.pending&&!state.ended)recordDialogue(makeDailyDialogue());save();render();return true}catch{return false}}
function changeStat(key,n){if(key==='study'||key==='project'||key==='punctual'){for(const c of state.courses){if(key==='study'){c.assignment=clamp(c.assignment+n*.7);c.boost+=n*.35}else if(key==='project')c.project=clamp(c.project+n);else c.punctual=clamp(c.punctual+n)}if(key==='study')state.stats.knowledge=clamp(state.stats.knowledge+n*.65);return}if(key==='friends'){state.friends.forEach((f,i)=>f.score=clamp(f.score+n*(i===0?1:.55)));return}if(key==='senior'||key==='junior'||key==='mentor'){state[key]=clamp(state[key]+n);return}if(key==='scholarship'){state.scholarship=true;return}if(state.stats[key]!==undefined)state.stats[key]=clamp(state.stats[key]+n)}
const CHOICE_REQUIREMENTS={
  project:{0:{knowledge:42}},library:{1:{knowledge:45}},sports:{1:{health:40,energy:28}},field:{1:{health:35,energy:22}},
  mega:{0:{money:15}},airplane:{0:{money:10}},scholarship:{0:{knowledge:40}},internship:{0:{knowledge:50}},
  pothong:{0:{health:40,energy:25}},talent:{0:{happiness:35}},openhouse:{1:{knowledge:45}}
};
const FRIEND_FOCUS={green_gate:2,project:0,sports:1,field:1,mega:2,market:2,airplane:2,library:0,volunteer:1,openhouse:1,junior:0};
const EFFECT_LABELS={study:'การเรียน',project:'โปรเจกต์',punctual:'ตรงเวลา',friends:'เพื่อน',energy:'พลัง',health:'สุขภาพ',stress:'เครียด',happiness:'ความสุข',money:'เงิน',activity:'กิจกรรม',knowledge:'ความรู้',mentor:'อาจารย์',senior:'รุ่นพี่',junior:'รุ่นน้อง',scholarship:'โอกาสทุน'};
const EFFECT_ICONS={study:'✎',project:'▧',punctual:'◷',mentor:'✦',senior:'◆',junior:'◇',scholarship:'✧'};
function effectParts(effects){return Object.entries(effects).flatMap(([key,value])=>key==='scholarship'?[{key,label:'สมัครทุน',value:null}]:key==='study'?[{key,label:'การเรียน',value},{key:'knowledge',label:'ความรู้',value:Number((value*.65).toFixed(1))}]:[{key,label:EFFECT_LABELS[key]||key,value}])}
function effectText(part){return `${part.label}${part.value===null?'':` ${part.value>0?'+':''}${part.value}`}`}
function describeEffects(effects){return effectParts(effects).map(effectText).join(' · ')}
function renderEffects(effects){return effectParts(effects).map(part=>`<span class="effect-item"><span class="effect-icon effect-${esc(part.key)}" aria-hidden="true">${statIcon(part.key)||EFFECT_ICONS[part.key]||'•'}</span>${esc(effectText(part))}</span>`).join('<span class="effect-separator" aria-hidden="true"> · </span>')}
function riskSummary(risk){if(!risk)return '';const good=Math.round(risk.chance*100);const preview=effects=>{const parts=effectParts(effects);return parts.slice(0,2).map(effectText).join(', ')+(parts.length>2?' และอื่น ๆ':'')};return `🎲 ผลดี ${good}% (${preview(risk.success.effects)}) · พลาด ${100-good}% (${preview(risk.failure.effects)})`}
function choiceGate(event,option,index){
  const requirements={...(CHOICE_REQUIREMENTS[event.id]?.[index]||{})};
  for(const key of ['money','energy'])if((option[2][key]||0)<0)requirements[key]=Math.max(requirements[key]||0,-option[2][key]);
  const missing=Object.entries(requirements).filter(([key,need])=>(state.stats[key]??0)<need).map(([key,need])=>`${EFFECT_LABELS[key]||key} ${need}`);
  return {ok:missing.length===0,reason:missing.length?`ต้องมี ${missing.join(' · ')}`:''};
}
function eventMinute(event){const id=event.id;if(id==='orientation')return 8*60;if(/^(rain_bike|lost_pen|student_card|surprise_quiz|wrong_room|taichi|teacherday)$/.test(id))return 9*60+20;if(/^(green_gate|sports|field|bike|mega|market|airplane|parttime|loy|songkran|talent)$/.test(id))return 17*60;return 13*60+15}
function openEvent(event){const minute=eventMinute(event);emitDueMoments(minute/1440);state.playing=false;state.dayFraction=minute/1440;let message=event.id==='teacher'?event.text.replace('อาจารย์เห็น',`${state.teacher}เห็น`):event.text;state.pending={id:event.id,title:event.title,text:message,place:event.place,time:clockForMinute(minute),options:event.options};state.memory.push({day:state.day,id:event.id,title:event.title,place:event.place,time:clockForMinute(minute)});if(state.memory.length>80)state.memory.shift();render();save();if(typeof window!=='undefined'&&window.matchMedia('(max-width: 680px)').matches)window.scrollTo({top:0,behavior:'smooth'})}
function recordDialogue(entry){entry.time??=clockForMinute(currentMinute());state.dialogue=entry;state.dialogueLog??=[];state.dialogueLog.push(entry);if(state.dialogueLog.length>MAX_DIALOGUE_ENTRIES)state.dialogueLog.shift()}
function choiceReaction(effects){
  if(effects.friends<0)return {speaker:state.friends[0].name,quote:'เราเข้าใจว่าเธอมีเหตุผลของตัวเอง แต่เรื่องวันนั้นทำให้เราห่างกันไปนิดหนึ่งนะ'};
  if(effects.friends>0)return {speaker:state.friends[0].name,quote:'ดีที่วันนั้นเราได้ทำอะไรด้วยกัน ต่อไปถ้ามีเรื่องหนัก ๆ ก็บอกเราได้เลย'};
  if(effects.project>0||effects.study>0)return {speaker:state.teacher,quote:`เห็นเธอเริ่มลงมือจริงจังแล้ว วิชา ${state.courses[0]?.code||state.character.major} ค่อย ๆ เก็บงานไปทีละชิ้นก็ทัน`};
  if(effects.activity>0)return {speaker:'เพื่อนในชมรม',quote:'คราวหน้ามาช่วยกันอีกนะ งานวันนี้เดินต่อได้เพราะมีเธออยู่ด้วย'};
  if(effects.health>0)return {speaker:state.friends[1].name,quote:'พอได้ขยับตัวแล้วสีหน้าดูสดใสขึ้นเลย ไว้มาเล่นด้วยกันอีก'};
  if(effects.money>0)return {speaker:'ตัวคุณเอง',quote:'เงินที่เพิ่มขึ้นช่วยให้หายกังวล แต่ต้องจัดเวลาให้การเรียนกับการพักด้วย'};
  if(effects.scholarship)return {speaker:state.teacher,quote:'ถ้าจะรักษาทุน ลองดูคะแนนแต่ละวิชาไว้ตั้งแต่ตอนนี้นะ'};
  return {speaker:'ตัวคุณเอง',quote:'การเลือกครั้งนี้อาจดูเล็ก แต่พรุ่งนี้เราจะเห็นว่ามันพาไปทางไหน'};
}
function choiceConsequence(effects){
  if(effects.friends<0)return 'คำตอบนั้นทำให้เพื่อนบางคนเงียบลง ความสัมพันธ์ต้องใช้เวลาซ่อม';
  if(effects.friends>0)return 'คุณกับเพื่อนมีเรื่องใหม่ที่พูดถึงกันระหว่างเดินกลับ';
  if(effects.project>0||effects.study>0)return 'งานที่ค้างอยู่ขยับไปข้างหน้าและเริ่มเห็นผลในวิชาที่เรียน';
  if(effects.activity>0)return 'ชื่อของคุณถูกจดไว้ในทีมกิจกรรมครั้งถัดไป';
  if(effects.money<0)return 'เงินในกระเป๋าลดลง แต่ช่วงเวลานั้นยังติดอยู่ในความทรงจำ';
  if(effects.energy>0)return 'ได้หยุดพักจริง ๆ จึงมีแรงสำหรับคาบและงานในวันถัดไป';
  return 'ผลของการตัดสินใจค่อย ๆ ปรากฏในวันต่อมา';
}
const EVENT_AFTERMATH={
  orientation:['รุ่นพี่พาไปรู้จักโต๊ะชมรมและเพื่อนใหม่หลายคน จนชื่อของคุณเริ่มมีคนจำได้','คุณเดินเช็กห้องเรียนทีละอาคารกับเพื่อน ตารางในมือจึงเริ่มดูไม่ไกลตัว','คุณกลับมาจัดตารางและเตรียมของพรุ่งนี้ ทำให้คืนแรกในมอสงบกว่าที่คิด'],
  green_gate:['มื้อเย็นที่รั้วเขียวกลายเป็นเวลาคุยกับเพื่อน ก่อนคุณกลับไปเปิดงานที่ยังค้าง','คุณชวนเพื่อนทำงานให้เสร็จก่อน แล้วค่อยไปหาอะไรกินด้วยกัน','คุณอยู่ทำงานต่อจนเสร็จ แม้จะพลาดบทสนทนาหลังเลิกเรียน'],
  rain_bike:[null,'คุณรอให้ฝนซาลงใต้ชายคา พอถึงห้องคาบก็เริ่มไปแล้ว','คุณขึ้นรถรับส่งแล้วมาถึงห้องทัน แต่ต้องจ่ายค่าเดินทางเพิ่ม'],
  project:['คุณนั่งแก้งานกับกลุ่มจนเห็นโครงโปรเจกต์ชัดขึ้น เพื่อนรู้ว่าคืนนี้พึ่งคุณได้',null,'งานชมรมผ่านไปได้ดี แต่กลุ่มโปรเจกต์ต้องแบ่งงานที่คุณไม่ได้ทำใหม่'],
  teacher:['คุณเข้าพบอาจารย์และแก้งานตามจุดที่ถูกชี้ให้เห็นทีละข้อ','คำแนะนำสั้น ๆ ของอาจารย์ช่วยให้คุณกลับไปลองแก้งานเอง','คุณกลับไปพักก่อน งานยังรออยู่บนโต๊ะ แต่วันนี้ได้แรงคืนมา'],
  sports:['คุณลงสนามกับเพื่อน เสียงหัวเราะดังกลบเรื่องงานที่ค้างอยู่ชั่วคราว','หลังออกเวทในอาคารชิน คุณเหนื่อยตัวแต่หัวโล่งขึ้น','คุณกลับไปอ่านหนังสืออีกบทและฝากเพื่อนไว้ว่าไว้มาเล่นด้วยวันหน้า'],
  field:['คุณวิ่งรอบสนามกับเพื่อนจนฟ้าเริ่มมืด แล้วเดินกลับพร้อมกัน','คุณลงเตะบอลกลางสนาม แม้เหนื่อยแต่ได้รู้จักคนในทีมเพิ่ม','คุณนั่งข้างสนามฟังเพื่อนเล่าเรื่องคาบเรียนก่อนแยกกันกลับ'],
  bike:['ร้านใกล้รั้วเขียวซ่อมจักรยานให้ คุณกลับไปปั่นข้ามอาคารได้ตามปกติ','เพื่อนให้ยืมจักรยานและย้ำให้คุณเอามาคืนก่อนคาบเช้า','คุณล็อกจักรยานไว้แล้วเดินไปเรียน ต้องรีบกว่าทุกวัน'],
  lost_pen:[null,'ร้านใกล้ห้องยังเปิดอยู่ คุณได้ปากกาด้ามใหม่และกลับมาทันจดโน้ต','เพื่อนส่งปากกาสำรองให้ คุณนั่งทำแบบฝึกหัดต่อได้ทันที'],
  mega:['คุณเดินเมกาบางนากับเพื่อน กินข้าวและกลับพร้อมรูปถ่ายใหม่หลายรูป','คุณตั้งงบก่อนออกเดิน พอถึงเวลากลับยังมีเงินเหลือไว้ใช้ทั้งสัปดาห์','คุณพักอยู่หอ ปล่อยให้เพื่อนไปเดินเล่นแล้วค่อยดูรูปในแชต'],
  market:['คุณแวะมาร์เก็ตวิลเลจกับเพื่อน ซื้อของใช้แล้วนั่งพักก่อนกลับ','เพื่อนรับฝากซื้อของ คุณใช้เวลาที่เหลือกลับไปทำงาน','คุณกลับไปพักและเก็บเงินไว้ใช้กับเรื่องที่จำเป็นกว่า'],
  airplane:['แสงไฟที่ตลาดนัดเรือบินทำให้ค่ำนี้เหมือนวันหยุดจริง ๆ ก่อนคุณกลับกับเพื่อน','คุณเดินตลาดช่วงสั้น ๆ แล้วแยกกลับมาพักตามที่ตั้งใจ','คุณอยู่ทบทวนบทเรียน ขณะที่รูปของเพื่อนทยอยส่งมาในกลุ่ม'],
  library:['คุณกับเพื่อนแบ่งโต๊ะและช่วยกันจำหัวข้อที่จะออกสอบ','คุณอธิบายส่วนที่เพื่อนตามไม่ทัน จนตัวเองเข้าใจชัดขึ้นด้วย','คุณเลือกมุมเงียบและอ่านต่อได้ยาวโดยไม่มีใครขัดจังหวะ'],
  parttime:['ร้านเริ่มจำเวลาที่คุณมาช่วยงานได้ เงินเพิ่มขึ้นแต่ตารางแน่นกว่าเดิม','คุณเลือกช่วยงานเฉพาะวันหยุด จึงยังมีเย็นวันธรรมดาไว้อ่านหนังสือ','คุณขอผ่านงานพิเศษครั้งนี้และใช้เย็นนั้นทบทวนบทเรียน'],
  group_chat:['คุณอธิบายต่อหน้า เพื่อนจึงรู้ว่าข้อความนั้นไม่ได้ตั้งใจตำหนิ','คุณส่งข้อความขอโทษและนัดคุยงานให้ชัดขึ้นในวันถัดไป','เรื่องในแชตค่อย ๆ เงียบ แต่เพื่อนยังไม่กลับมาคุยเหมือนเดิม'],
  student_card:[null,'คุณยื่นเรื่องทำบัตรใหม่และเก็บใบรับไว้ใช้ระหว่างรอ','เพื่อนช่วยย้อนทางไปโรงอาหาร แม้ยังไม่เจอบัตรแต่คุณไม่ต้องหาคนเดียว'],
  surprise_quiz:[null,'คุณกลับไปถามอาจารย์เรื่องโจทย์ที่อ่านไม่เข้าใจ แล้วจดวิธีคิดไว้','คุณทำเครื่องหมายข้อที่ไม่มั่นใจ เพื่อกลับมาทบทวนก่อนสอบกลางภาค'],
  wifi_deadline:[null,'คุณไปใช้คอมอีกอาคารและตรวจสถานะไฟล์หลังส่งสำเร็จ','อาจารย์เห็นหลักฐานเวลาไฟล์และนัดให้คุณส่งซ้ำเมื่อระบบกลับมา'],
  printer_queue:[null,'อาจารย์เปิดไฟล์รายงานที่คุณส่งและขอเล่มจริงตามมาภายหลัง','คุณแก้รูปเล่มอีกครั้ง ก่อนกลับไปยืนคิวร้านถ่ายเอกสารวันถัดไป'],
  wrong_room:[null,'เจ้าหน้าที่บอกทางเชื่อมอาคารที่สั้นกว่า คุณจดไว้เผื่อคาบหน้า','เพื่อนช่วยแจ้งอาจารย์และส่งโน้ตช่วงที่คุณยังเดินมาไม่ถึง'],
  found_wallet:[null,'เจ้าหน้าที่รับกระเป๋าสตางค์ไว้และเริ่มประกาศหาเจ้าของ','เพื่อนช่วยกันแชร์ข้อความตามหาเจ้าของจนมีคนติดต่อกลับ'],
  scholarship:['คุณเตรียมเอกสารทุนและเริ่มมองคะแนนทุกวิชาจริงจังขึ้น','คุณกับเพื่อนช่วยตรวจใบสมัครให้กันก่อนยื่น','คุณผ่านป้ายประกาศทุนอีกครั้งแล้วตั้งใจว่าจะเตรียมตัวเทอมหน้า'],
  pothong:['เพื่อนในทีมจำจังหวะที่คุณลงแข่งได้และชวนซ้อมรอบหน้า','ป้ายเชียร์ที่คุณช่วยทำยังอยู่ข้างสนามหลังงานจบ','คุณกลับไปเปิดหนังสือพร้อมเสียงเชียร์ที่ยังติดอยู่ในหัว'],
  teacherday:['อาจารย์เห็นชื่อคุณในทีมเตรียมงานและกล่าวขอบคุณหลังพิธี','บทสนทนาสั้น ๆ หลังพิธีทำให้คุณกล้าถามเรื่องเรียนมากขึ้น','คุณแวะทักอาจารย์หลังคาบ แม้ไม่ได้ช่วยเตรียมพาน'],
  loy:['รูปคืนลอยกระทงถูกส่งมาในกลุ่มแชต เพื่อนชวนดูอีกครั้ง','คุณได้คุยกับเพื่อนสั้น ๆ ก่อนกลับไปทำงานต่อ','เพื่อนส่งรูปบรรยากาศมาให้ดู ขณะที่คุณพักอยู่ที่หอ'],
  chinese:['คนที่บูธวัฒนธรรมจำได้ว่าคุณช่วยจัดของและชวนร่วมงานหน้า','เพื่อนเล่าเรื่องร้านอาหารที่เดินชมด้วยกันเมื่อวาน','คุณอ่านเนื้อหาสอบเพิ่ม แต่ยังได้ฟังเพื่อนเล่าถึงงานตรุษจีน'],
  songkran:['เพื่อนชวนดูภาพจากงานสงกรานต์ที่คุณไปร่วม','รูปที่ถ่ายด้วยกันกลายเป็นภาพประจำกลุ่มแชตช่วงปิดเทอม','โปรเจกต์ขยับไปอีกหน้าในวันที่เพื่อนส่วนใหญ่ไปงาน'],
  volunteer:['ทีมค่ายอาสาส่งกำหนดการมาให้ คุณเริ่มจัดของและแบ่งเวลาเรียน','อุปกรณ์ที่คุณช่วยเตรียมถูกนำไปใช้จริงในวันออกค่าย','คุณขออ่านบทเรียนให้จบก่อน แล้วค่อยฟังเพื่อนเล่าเรื่องค่าย'],
  openhouse:['รุ่นน้องคนหนึ่งทักมาถามเรื่องสาขาต่อจากวันที่คุณพาชม','ชิ้นงานที่คุณสาธิตถูกพูดถึงในกลุ่มรุ่นน้อง','คุณเห็นภาพงานเปิดบ้านในเพจมหาวิทยาลัยก่อนกลับไปอ่านหนังสือ'],
  talent:['เพื่อนในชมรมย้อนดูคลิปการแสดงและชวนคุณลองเวทีอีกครั้ง','ทีมหลังเวทีจำได้ว่าคุณช่วยจัดคิวจนงานเดินต่อได้','คุณได้คุยกับคนแสดงหลังลงจากเวที แม้วันนี้มาเป็นผู้ชม'],
  taichi:['ตอนเข้าคาบคุณยังจำจังหวะหายใจจากการฝึกไทเก๊กได้','บทสนทนาที่สวนหยินหยางทำให้คุณกับเพื่อนสนิทขึ้นอีกนิด','คุณเข้าคาบทันและเห็นว่าการเผื่อเวลาเช้าช่วยได้มาก'],
  candle:['ชื่อของคุณอยู่ในรายชื่อทีมช่วยงานแห่เทียน','อุปกรณ์ที่คุณจัดไว้ถูกหยิบไปใช้ตอนเริ่มขบวน','คุณทำงานเรียนที่ค้างไว้เสร็จและแวะดูภาพขบวนในภายหลัง'],
  internship:['อาจารย์ส่งรายละเอียดที่ฝึกงานท้าทายมาให้ คุณเริ่มเตรียมตัวจริงจัง','คุณได้ตารางฝึกงานที่ยังมีเวลารักษาชีวิตด้านอื่น','รุ่นพี่เล่าประสบการณ์ฝึกงาน ทำให้คุณเห็นสิ่งที่ควรถามก่อนเลือก'],
  junior:['รุ่นน้องส่งตารางเรียนที่ปรับใหม่มาให้ดูหลังคุณช่วยวางแผน','โน้ตที่คุณส่งให้ช่วยให้รุ่นน้องตามคาบแรกทัน','รุ่นน้องทักมายืนยันวันนัดคุยครั้งถัดไป'],
  farewell:['เพื่อนเปิดสมุดความทรงจำที่คุณช่วยทำและหัวเราะกับภาพปีหนึ่ง','ภาพจากสถานที่โปรดถูกส่งเข้ากลุ่มก่อนทุกคนแยกย้าย','คุณส่งงานสุดท้ายเสร็จแล้วกลับมาหาเพื่อนที่ลานโพธิ์']
};
function mergedEffects(base,extra={}){const merged={...base};for(const [key,value] of Object.entries(extra))merged[key]=(merged[key]||0)+value;return merged}
function makeChoiceDialogue(event,choice,outcome=null,index=0){const effects=mergedEffects(choice[2],outcome?.effects),reaction=choiceReaction(effects);return {day:state.day,title:`หลังจาก ${event.title}`,place:event.place,speaker:outcome?.speaker||(outcome?state.friends[0].name:reaction.speaker),text:`คุณเลือก “${choice[0]}” ที่${event.place} ${outcome?.text||choiceConsequence(effects)}`,quote:outcome?.quote||reaction.quote,effects,kind:outcome?'chance':'choice'}}
function makeDailyDialogue(){
  const day=state.day,phase=Math.floor(day/3)-1,friend=state.friends[0]?.name||'เพื่อน',course=state.courses[0];
  const last=state.memory.slice().reverse().find(item=>item.choice);
  const path=Object.entries(state.paths).at(-1);
  if(state.stats.energy<24)return {day,title:'พักหายใจระหว่างคาบ',place:'อาคารบรรณสาร',speaker:friend,text:'หลายวันที่ผ่านมาใช้แรงไปมาก จนคนข้าง ๆ เริ่มสังเกตเห็น',quote:'วันนี้พักก่อนสักหน่อยไหม เดี๋ยวเราเอาโน้ตไปให้เอง'};
  if(state.stats.stress>76)return {day,title:'งานที่กองอยู่บนโต๊ะ',place:'อาคารบรรณสาร',speaker:state.teacher,text:'คะแนนและงานที่ใกล้ส่งทำให้สัปดาห์นี้หนักกว่าปกติ',quote:'ไม่ต้องทำทุกอย่างพร้อมกัน ลองแยกงานที่ต้องส่งก่อน แล้วค่อยมาคุยกัน'};
  if(path&&phase%7===0)return {day,title:'ทางที่เลือกไว้ยังเดินต่อ',place:'ลานโพธิ์',speaker:friend,text:`สิ่งที่คุณเลือกไว้ตอนปี ${path[0].slice(-1)} ยังส่งผลถึงวันที่เดินผ่านลานโพธิ์อีกครั้ง`,quote:`ตอนนั้นเธอบอกว่าจะ “${path[1].label}” ตอนนี้เรายังเห็นเธอพยายามอยู่เลย`};
  if(last&&phase%2===0){const reaction=choiceReaction(last.effects||{});return {day,title:`เรื่องของ ${last.title} ยังไม่จบ`,place:last.place||'ลานโพธิ์',speaker:last.outcomeSpeaker||reaction.speaker,text:`ผ่านไป ${Math.max(1,day-last.day)} วันหลังจากคุณเลือก “${last.choice}” ${last.outcomeText||choiceConsequence(last.effects||{})}`,quote:last.outcomeQuote||reaction.quote}}
  const lines={
    study:[{title:'โต๊ะประจำที่อาคารบรรณสาร',place:'อาคารบรรณสาร',speaker:friend,text:`คุณเปิดโน้ตวิชา ${course?.code||state.character.major} ก่อนเข้าเรียนคาบต่อไป`,quote:'ตรงนี้เราไม่เข้าใจเหมือนกัน ลองอ่านด้วยกันอีกหน้าหนึ่งไหม'}, {title:'ก่อนส่งงานชิ้นถัดไป',place:'ห้องเรียน',speaker:state.teacher,text:`งานของ ${course?.code||state.character.major} คืบหน้าไปอีกนิดจากการอ่านทุกสัปดาห์`,quote:'เก็บรายละเอียดให้ครบ แล้วคะแนนงานจะค่อย ๆ ตามมา'}],
    friends:[{title:'มื้อกลางวันกับเพื่อน',place:'โรงอาหาร 2',speaker:friend,text:'เวลาพักเที่ยงกลายเป็นช่วงที่เล่าเรื่องจากคาบเช้าได้ยาวกว่าที่คิด',quote:'จำวันแรกที่เราแทบไม่รู้จักกันได้ไหม ตอนนี้มีเรื่องให้คุยทุกวันเลย'}, {title:'เดินกลับจากรั้วเขียว',place:'รั้วเขียว',speaker:state.friends[2]?.name||friend,text:'หลังซื้อของกิน คุณเดินคุยกับเพื่อนช้า ๆ ก่อนแยกกันกลับ',quote:'วันไหนเหนื่อยก็ทักมาได้นะ ไม่ต้องรอให้มีงานกลุ่ม'}],
    activities:[{title:'ก่อนเริ่มงานชมรม',place:'อาคารกิจกรรมนักศึกษา',speaker:'เพื่อนในชมรม',text:'ป้ายงานถูกยกมาตั้งอีกครั้ง และคุณเริ่มจำหน้าคนในทีมได้มากขึ้น',quote:'ช่วยจับป้ายฝั่งนั้นหน่อย เดี๋ยวเราจัดโต๊ะตรงนี้เอง'}, {title:'เย็นที่ลานโพธิ์',place:'ลานโพธิ์',speaker:state.friends[1]?.name||friend,text:'งานกิจกรรมจบแล้ว แต่ยังมีคนอยู่เก็บของและคุยเรื่องครั้งหน้า',quote:'เหนื่อยเหมือนกันนะ แต่เห็นทุกคนมาช่วยแล้วสนุกดี'}],
    sports:[{title:'หลังเลิกเรียนที่สนามกีฬา',place:'สนามกีฬา',speaker:state.friends[1]?.name||friend,text:'รองเท้าวิ่งเปื้อนฝุ่นนิดหน่อย แต่คุณยังมีแรงหัวเราะตอนเดินออกจากสนาม',quote:'รอบหน้ามาอีกไหม วันนี้เธอวิ่งได้ไกลกว่าเดิมแล้ว'}, {title:'เสียงลูกบอลในอาคารชิน',place:'อาคารชิน โสภณพนิช',speaker:friend,text:'เสียงกีฬาในอาคารชินช่วยให้เรื่องสอบเงียบลงชั่วคราว',quote:'เล่นอีกเกมแล้วค่อยกลับไปอ่านหนังสือก็ได้'}],
    rest:[{title:'ค่ำคืนที่ได้พักจริง ๆ',place:state.character.living==='อยู่หอ'?'หอพัก':'บ้าน',speaker:'ตัวคุณเอง',text:'คืนนี้ไม่มีนัดเพิ่ม คุณวางกระเป๋าและปล่อยให้ตัวเองหยุดคิดเรื่องคะแนนสักพัก',quote:'พรุ่งนี้ค่อยเริ่มใหม่ วันนี้พักให้พอ'}, {title:'เช้าที่ไม่ต้องรีบ',place:'สวนหยินหยาง',speaker:friend,text:'คุณเดินผ่านสวนหยินหยางช้ากว่าวันอื่น และสังเกตเห็นลมเย็นก่อนเข้าคาบ',quote:'เห็นเธอไม่รีบแล้วสบายใจขึ้นเยอะ'}]
  };
  return {day,...lines[state.routine][phase%2]};
}
function makeMomentSchedule(){
  const previous=state.memory.slice().reverse().find(item=>item.choice&&[1,3].includes(state.day-item.day));
  if(previous)return [{minute:state.day-previous.day===1?11*60+40:17*60+40,kind:'followup',stage:state.day-previous.day,memoryDay:previous.day,memoryId:previous.id,choice:previous.choice}];
  if(state.day>0&&state.day%3===0&&state.day<state.nextIncidentDay)return [{minute:12*60+40+(hashSeed(`${state.seed}|moment-time|${state.day}`)%300),kind:'ambient'}];
  return [];
}
function makeAmbientMoment(minute){
  const name=state.character.name,friend=state.friends[0]?.name||'เพื่อน',course=state.courses[hashSeed(`${state.seed}|course|${state.day}`)%Math.max(1,state.courses.length)],code=course?.code||state.character.major;
  const variant=hashSeed(`${state.seed}|ambient|${state.day}`)%3,base={day:state.day,time:clockForMinute(minute),speaker:name,kind:'moment'};
  if(state.stats.energy<28)return {...base,title:'ร่างกายขอเวลาพัก',place:'อาคารบรรณสาร',text:`${name} ตั้งใจอ่านวิชา ${code} แต่เริ่มมองตัวหนังสือไม่ชัดเพราะพักน้อย ${friend} เห็นแล้วขอให้หยุดพักสักครู่`,quote:'พักก่อนก็ได้ เดี๋ยวเราเก็บโน้ตช่วงนี้ให้'};
  if(state.stats.stress>72)return {...base,title:'งานที่ต้องค่อย ๆ แก้',place:'หน้าห้องอาจารย์',speaker:state.teacher,text:`${name} เริ่มกังวลเรื่องงานที่ค้างในวิชา ${code} อาจารย์ชวนแยกสิ่งที่ต้องส่งก่อนออกจากสิ่งที่ยังรอได้`,quote:'เริ่มจากชิ้นที่ใกล้กำหนดที่สุด แล้วค่อยทำส่วนถัดไป'};
  if(state.stats.money<18)return {...base,title:'เงินในกระเป๋าใกล้หมด',place:'รั้วเขียว',text:`${name} หยุดดูราคาของกินหน้ารั้วเขียว แล้วเปลี่ยนใจเลือกมื้อที่พอไหวกับเงินที่เหลือ`,quote:'วันนี้ต้องคิดเรื่องค่าใช้จ่ายอีกหน่อย'};
  if(state.routine==='friends')return {...base,title:'เพื่อนที่ยังนัดกันได้',place:'โรงอาหาร 2',speaker:friend,text:[`${friend} เก็บที่นั่งให้ ${name} ระหว่างพักเที่ยง ทั้งคู่คุยเรื่องที่ไม่ได้เล่าในกลุ่มแชต`,`${name} แวะหา ${friend} หลังคาบ แล้วได้ฟังว่าเพื่อนกำลังกังวลเรื่องงานกลุ่ม`,`${friend} ชวน ${name} เดินออกทางรั้วเขียวหลังเลิกเรียน`][variant],quote:'ไว้มีเรื่องอะไรเล่าให้เราฟังอีกนะ'};
  if(state.routine==='activities')return {...base,title:'งานชมรมคืบหน้า',place:'ลานโพธิ์',speaker:'เพื่อนในชมรม',text:[`${name} แวะดูป้ายงานที่ช่วยทำ คนในชมรมเริ่มจำชื่อและหน้าของคุณได้`,`${name} ได้ข้อความขอความเห็นเรื่องงานกิจกรรมครั้งหน้า และตอบกลับระหว่างเดินไปคาบ`,`${name} ช่วยตรวจรายชื่อทีมงานที่ลานโพธิ์ก่อนแยกกลับ`][variant],quote:'งานครั้งนี้มีเธออยู่ในทีมด้วยนะ'};
  if(state.routine==='sports')return {...base,title:'ร่างกายเริ่มคุ้นกับสนาม',place:'สนามกีฬา',speaker:friend,text:[`${name} วิ่งรอบสนามได้ต่อเนื่องกว่าเดิม ${friend} เดินมารับตรงทางออก`,`หลังเล่นกีฬาในอาคารชิน ${name} เหนื่อยแต่รู้สึกว่าหัวโล่งขึ้น`,`เวลาเตะบอลผ่านไปไว ${name} กับเพื่อนนั่งพักข้างสนามก่อนกลับ`][variant],quote:'ไว้มาเล่นกันอีก'};
  if(state.routine==='rest')return {...base,title:'วันที่ยอมพัก',place:state.character.living==='อยู่หอ'?'หอพัก':'บ้าน',text:[`${name} ปิดงานที่ค้างไว้ชั่วคราวและนอนพักจนมีแรงกลับมา`,`เย็นนี้ ${name} ไม่รับนัดเพิ่ม เลือกกินข้าวและพักโดยไม่ดูคะแนนสักคืน`,`${name} เก็บกระเป๋าไว้ข้างเตียง ปล่อยให้วันนี้ช้าลงก่อนเริ่มใหม่`][variant]};
  return {...base,title:'งานเรียนที่เห็นความคืบหน้า',place:'อาคารบรรณสาร',speaker:state.teacher,text:[`${name} ส่งงานวิชา ${code} อีกชิ้นและเห็นจุดที่ยังต้องแก้ก่อนสอบ`,`โน้ตวิชา ${code} ที่ ${name} จดสะสมไว้เริ่มช่วยตอนทำโจทย์ยาก`,`หลังคาบ ${name} กลับไปตรวจงานวิชา ${code} อีกครั้งก่อนส่ง`][variant],quote:'ค่อย ๆ เก็บงานให้ครบ ความพยายามจะเห็นในคะแนน'};
}
const RISK_FOLLOWUP={
  rain_bike:['จักรยานยังใช้ได้ดี คุณกลับไปปั่นตามทางเดิมอย่างระวัง','แผลจากจักรยานลื่นยังเจ็บนิด ๆ คุณเลือกเดินช้าลงและเช็กค่าซ่อม'],
  lost_pen:['ปากกาที่หาเจอถูกเก็บไว้ช่องเดิมในกระเป๋า','คุณพกปากกาสำรองเพิ่มหลังต้องซื้อด้ามใหม่'],
  student_card:['บัตรนักศึกษากลับมาอยู่ในช่องซิปที่หยิบง่าย','คุณต้องใช้เอกสารชั่วคราวระหว่างรอบัตรใบใหม่'],
  surprise_quiz:['คะแนนเก็บช่วยให้คุณมั่นใจขึ้นในวิชานี้','คุณกลับไปจดหัวข้อที่ทำพลาดและเริ่มทบทวนใหม่'],
  wifi_deadline:['ไฟล์ที่ส่งทันขึ้นสถานะรับงานเรียบร้อย','คุณเก็บภาพหน้าจอไว้ก่อนอธิบายเรื่องไฟล์กับอาจารย์'],
  printer_queue:['รายงานที่พิมพ์ทันอยู่บนโต๊ะอาจารย์แล้ว','คุณส่งไฟล์สำรองให้อาจารย์หลังร้านพิมพ์งานล่าช้า'],
  wrong_room:['คุณจำทางไปห้องเรียนใหม่ได้โดยไม่ต้องเปิดแผนที่','เพื่อนส่งโน้ตช่วงต้นคาบที่คุณพลาดไปให้'],
  found_wallet:['เจ้าของกระเป๋าสตางค์ทักขอบคุณคุณอีกครั้งเมื่อเดินสวนกัน','เจ้าหน้าที่รับเรื่องและช่วยประกาศหาเจ้าของกระเป๋าสตางค์'],
  project:['กลุ่มโปรเจกต์นัดแบ่งงานรอบถัดไปอย่างชัดเจน','เพื่อนร่วมกลุ่มขอให้แจ้งเวลาที่ติดกิจกรรมก่อนนัดครั้งหน้า']
};
function makeFollowupMoment(schedule){
  const memory=state.memory.slice().reverse().find(item=>item.day===schedule.memoryDay&&item.id===schedule.memoryId&&item.choice===schedule.choice);
  if(!memory)return makeAmbientMoment(schedule.minute);
  const name=state.character.name,friend=state.friends[0]?.name||'เพื่อน',effects=memory.effects||{},risk=memory.outcomeSuccess===undefined?null:RISK_FOLLOWUP[memory.id];
  const detail=risk?risk[memory.outcomeSuccess?0:1]:EVENT_AFTERMATH[memory.id]?.[memory.choiceIndex]||choiceConsequence(effects);
  const base={day:state.day,time:clockForMinute(schedule.minute),title:`ผลจาก ${memory.title}`,place:memory.place||'ลานโพธิ์',speaker:name,kind:'followup'};
  if(schedule.stage===1)return {...base,text:`หลังจากเลือก “${memory.choice}” เมื่อวาน ${detail}`,quote:effects.friends>0?'ดีที่เราได้คุยกันวันนั้น':effects.friends<0?'เรื่องวันนั้นเรายังคิดอยู่':null};
  let text,speaker=name,quote;
  if(effects.friends<0){speaker=friend;text=`ผ่านไปหลายวัน ${friend} ยังพูดกับ ${name} น้อยลงหลังเรื่อง “${memory.choice}” คุณเริ่มเห็นว่าความสัมพันธ์ต้องใช้เวลาซ่อม`;quote:'เราอยากคุยกันให้เข้าใจกว่านี้'}
  else if(effects.friends>0){speaker=friend;text=`${friend} ชวน ${name} ไปด้วยกันอีกครั้ง เพราะจำได้ว่าคุณเคยเลือก “${memory.choice}”`;quote:'ครั้งก่อนสนุกดี คราวนี้ไปด้วยกันไหม'}
  else if(effects.study>0||effects.project>0){speaker=state.teacher;text=`งานในวิชา ${state.courses[0]?.code||state.character.major} คืบหน้าต่อจากวันที่ ${name} เลือก “${memory.choice}” อาจารย์เริ่มเห็นรายละเอียดที่ดีขึ้น`;quote:'ส่วนนี้ดีขึ้นแล้ว ลองเก็บจุดเล็ก ๆ ที่เหลือ'}
  else if(effects.health<0||effects.energy<0){text=`ผลจากวันที่เลือก “${memory.choice}” ยังทำให้ ${name} เหนื่อยอยู่บ้าง วันนี้จึงต้องจัดแรงให้พอกับคาบและงานที่รอ`;quote='ค่อย ๆ ไปก็ได้ อย่าฝืนเกินไป'}
  else if(effects.money<0){text=`${name} เปิดดูเงินที่เหลือหลังเลือก “${memory.choice}” แล้วเริ่มวางแผนมื้อและค่าเดินทางช่วงถัดไป`}
  else{text=`หลายวันหลังเลือก “${memory.choice}” ${name} เริ่มเห็นว่าการตัดสินใจครั้งนั้นเปลี่ยนจังหวะชีวิตในมอไปทีละนิด`}
  return {...base,text,speaker,quote};
}
function incidentMinute(id){if(/^(bike_slip|late_bus|wrong_turn)$/.test(id))return 8*60+45;if(/^(phone_flat|club_poster|good_run|extra_shift|rain_shelter)$/.test(id))return 18*60+10;return 13*60+25}
function queueIncident(){if(state.queuedIncident||state.day<state.nextIncidentDay)return;const possible=INCIDENTS.filter(item=>!item.when||item.when());const fresh=possible.filter(item=>item.id!==state.lastIncidentId);const incident=pick(fresh.length?fresh:possible);state.queuedIncident={id:incident.id,minute:incidentMinute(incident.id)}}
function emitDueMoments(fraction){let changed=false;queueIncident();const limit=Math.min(1439,Math.floor(clamp(fraction,0,1)*1440));while(true){const scheduled=state.momentSchedule[state.nextMomentIndex],nextMoment=scheduled?.minute??Infinity,nextIncident=state.queuedIncident?.minute??Infinity,minute=Math.min(nextMoment,nextIncident);if(minute>limit)break;if(nextIncident<=nextMoment){const planned=state.queuedIncident;state.queuedIncident=null;runIncident(planned)}else{recordDialogue(scheduled.kind==='followup'?makeFollowupMoment(scheduled):makeAmbientMoment(scheduled.minute));state.nextMomentIndex++}changed=true}return changed}
function choose(index){if(!state?.pending)return;let e=state.pending,choice=e.options[index];if(!choice||!choiceGate(e,choice,index).ok)return;for(const [k,v] of Object.entries(choice[2]))changeStat(k,v);const risk=choice[3],outcome=risk?(random()<risk.chance?risk.success:risk.failure):null;if(outcome)for(const [k,v] of Object.entries(outcome.effects))changeStat(k,v);const allEffects=mergedEffects(choice[2],outcome?.effects);const focus=e.id.startsWith('arc-')?0:FRIEND_FOCUS[e.id];if(focus!==undefined&&allEffects.friends)state.friends[focus].score=clamp(state.friends[focus].score+allEffects.friends*.5);if(/^year[123]$/.test(e.id))state.paths[e.id]={index,label:choice[0]};const memory=state.memory[state.memory.length-1];memory.choice=choice[0];memory.choiceIndex=index;memory.effects=allEffects;if(outcome){memory.outcomeText=outcome.text;memory.outcomeQuote=outcome.quote;memory.outcomeSpeaker=outcome.speaker||state.friends[0].name;memory.outcomeSuccess=outcome===risk.success;memory.chance=risk.chance}recordDialogue(makeChoiceDialogue(e,choice,outcome,index));state.seen.push(e.id);state.pending=null;state.playing=true;lastTick=performance.now();render();save();if(typeof window!=='undefined'&&window.matchMedia('(max-width: 680px)').matches)window.scrollTo({top:0,behavior:'smooth'})}
function randomEvent(){let year=yearNow(),month=new Date(START_DATE.getTime()+state.day*86400000).getUTCMonth()+1;let list=EVENTS.filter(e=>!e.early&&(!e.minYear||year>=e.minYear)&&(!e.months||e.months.includes(month))&&(!e.lateOnly||year===state.years)&&(!e.when||e.when()));let recent=state.seen.slice(-8);let fresh=list.filter(e=>!recent.includes(e.id));let event=pick(fresh.length?fresh:list);state.nextEventDay=state.day+22+Math.floor(random()*16);openEvent(event)}
function runIncident(plan=null){let incident=plan?INCIDENTS.find(item=>item.id===plan.id):null;if(!incident){const possible=INCIDENTS.filter(item=>!item.when||item.when());const fresh=possible.filter(item=>item.id!==state.lastIncidentId);incident=pick(fresh.length?fresh:possible)}for(const [key,value] of Object.entries(incident.effects))changeStat(key,value);state.lastIncidentId=incident.id;state.nextIncidentDay=state.day+10+Math.floor(random()*10);const speaker=incident.speaker==='friend'?pick(state.friends).name:incident.speaker==='teacher'?state.teacher:'ตัวคุณเอง';recordDialogue({day:state.day,time:clockForMinute(plan?.minute??incidentMinute(incident.id)),title:incident.title,place:incident.place,speaker,text:incident.text,quote:incident.quote,effects:incident.effects,kind:'incident'});if(!plan)save()}
function storyArcEvent(){
  const friend=state.friends[0],year=yearNow(),teacher=state.teacher;
  let event;
  if(year===1)event={id:'arc-1',title:`${friend.name} ชวนทำงานด้วย`,place:'อาคารบรรณสาร',text:`${friend.name} เพื่อนร่วมสาขาคนแรกของคุณชวนจับกลุ่มทำงานในห้องสมุด คุณยังไม่รู้จักวิธีทำงานของกันและกันดีนัก`,options:[['รับและนัดแบ่งงานชัดเจน','เพื่อน +8 · โปรเจกต์ +5',{friends:8,project:5}],['รับ แต่ขอทำส่วนของตัวเอง','เพื่อน +3 · โปรเจกต์ +4',{friends:3,project:4}],['ขอทำกับกลุ่มอื่น','การเรียน +4 · เพื่อน -5',{study:4,friends:-5}]]};
  else if(year===2)event={id:'arc-2',title:`งานกลุ่มของ ${friend.name} มีปัญหา`,place:'โรงอาหาร 2',text:`${friend.name} ดูเงียบไปหลังงานกลุ่มครั้งก่อน วันนี้เขาบอกว่ารู้สึกแบกงานมากกว่าคนอื่น คุณจะตอบอย่างไร?`,options:[['รับฟังและช่วยแก้งานด้วยกัน','เพื่อน +10 · โปรเจกต์ +6',{friends:10,project:6,energy:-5}],['ขอโทษและแบ่งงานใหม่','เพื่อน +7 · โปรเจกต์ +4',{friends:7,project:4}],['บอกว่าทุกคนก็เหนื่อยเหมือนกัน','เพื่อน -10 · พลัง +2',{friends:-10,energy:2}]]};
  else if(year===state.years)event={id:'arc-final',title:`คำชวนสุดท้ายจาก ${friend.name}`,place:'ลานโพธิ์',text:`${friend.name} ชวนกลับไปนั่งที่ลานโพธิ์เหมือนปีหนึ่ง ก่อนแยกย้ายไปทำงานหรือเรียนต่อ เขาถามว่าคุณจำวันแรกได้ไหม`,options:[['นั่งคุยกันจนเย็น','เพื่อน +12 · ความสุข +8',{friends:12,happiness:8}],['ชวนเพื่อนทั้งกลุ่มมาเจอกัน','เพื่อน +9 · กิจกรรม +5',{friends:9,activity:5}],['ขอไปส่งงานสุดท้ายก่อน','โปรเจกต์ +8 · เพื่อน -3',{project:8,friends:-3}]]};
  else event={id:`arc-${year}`,title:`${teacher} เห็นความเปลี่ยนแปลง`,place:'ห้องอาจารย์ที่ปรึกษา',text:`${teacher} จำได้ว่าคุณเคยผ่านงานกลุ่มที่หนักมา ปีนี้ท่านชวนคุยเรื่องฝึกงาน รุ่นน้อง และทิศทางหลังเรียนจบ`,options:[['ขอคำแนะนำและวางแผนจริงจัง','อาจารย์ +8 · โปรเจกต์ +7',{mentor:8,project:7}],['ชวนเพื่อนมาคุยด้วย','อาจารย์ +5 · เพื่อน +5',{mentor:5,friends:5}],['ขอกลับไปคิดก่อน','พลัง +3',{energy:3}]]};
  state.nextEventDay=Math.max(state.nextEventDay,state.day+14);openEvent(event);
}
function majorEvent(){
  const faculty=state.character.faculty,major=state.character.major;
  let event;
  if(/เภสัช|พยาบาล|เทคนิคการแพทย์|กายภาพ|แพทย์แผนจีน/.test(faculty))event={id:`major-${yearNow()}`,title:'วันฝึกปฏิบัติที่ต้องเลือก',place:'ห้องปฏิบัติการ',text:`วิชาปฏิบัติของ${major}มีเคสที่ยากกว่าที่เตรียมมา ${state.teacher} ให้เวลาปรึกษาก่อนประเมินงาน`,options:[['ซ้อมกับเพื่อนแล้วถามอาจารย์','โปรเจกต์ +10 · เพื่อน +4',{project:10,friends:4,mentor:4,energy:-6}],['อ่านคู่มือและลองทำเอง','การเรียน +9 · โปรเจกต์ +4',{study:9,project:4,energy:-5}],['พักก่อนเพื่อให้พร้อม','พลัง +7 · โปรเจกต์ +2',{energy:7,project:2}]]};
  else if(/วิทยาศาสตร์/.test(faculty))event={id:`major-${yearNow()}`,title:'งานทดลองหรือโปรแกรมที่ยังไม่ผ่าน',place:'ห้องแล็บอาคารบรรณสาร',text:`โปรเจกต์${major}ของกลุ่มติดปัญหาใกล้วันส่ง เพื่อนเสนอให้ลองแก้ด้วยกันอีกหนึ่งคืน`,options:[['อยู่แก้กับทีม','โปรเจกต์ +12 · เพื่อน +5',{project:12,friends:5,energy:-8}],['ขอคำปรึกษาอาจารย์','โปรเจกต์ +8 · อาจารย์ +6',{project:8,mentor:6}],['ส่งเท่าที่ทำได้','พลัง +5 · โปรเจกต์ -6',{energy:5,project:-6}]]};
  else if(/บริหารธุรกิจ/.test(faculty))event={id:`major-${yearNow()}`,title:'พรีเซนต์แผนธุรกิจ',place:'อาคารเรียน 2',text:`ถึงวันนำเสนอแผนของสาขา${major} ลูกค้าจำลองถามเรื่องต้นทุนและความเสี่ยง คุณต้องเลือกวิธีตอบ`,options:[['เตรียมข้อมูลกับทีมให้ครบ','โปรเจกต์ +10 · เพื่อน +4',{project:10,friends:4,energy:-5}],['ลองพรีเซนต์แบบสร้างสรรค์','โปรเจกต์ +7 · กิจกรรม +4',{project:7,activity:4,stress:2}],['ให้เพื่อนตอบแทน','เพื่อน -4 · พลัง +3',{friends:-4,energy:3}]]};
  else if(/นิติศาสตร์/.test(faculty))event={id:`major-${yearNow()}`,title:'ซ้อมว่าความศาลจำลอง',place:'ห้องเรียนคณะนิติศาสตร์',text:'เพื่อนชวนคุณขึ้นพูดในศาลจำลองแทนคนที่ป่วยกะทันหัน ต้องอ่านสำนวนภายในคืนนี้',options:[['รับหน้าที่และเตรียมกับทีม','การเรียน +8 · เพื่อน +5',{study:8,friends:5,energy:-7}],['ช่วยค้นข้อกฎหมายหลังฉาก','โปรเจกต์ +8 · พลัง -4',{project:8,energy:-4}],['ขอไม่รับงานเพิ่ม','พลัง +5 · เพื่อน -3',{energy:5,friends:-3}]]};
  else event={id:`major-${yearNow()}`,title:`งานภาคสนามของ${major}`,place:'อาคารกิจกรรมนักศึกษา',text:`${state.teacher} แจ้งงานนอกห้องเรียนที่เกี่ยวกับ${major} ต้องทำร่วมกับคนใหม่และส่งรายงานภายในเทอมนี้`,options:[['ชวนเพื่อนลงพื้นที่ด้วยกัน','โปรเจกต์ +9 · เพื่อน +5',{project:9,friends:5,energy:-6}],['ขอคำแนะนำรุ่นพี่ก่อน','การเรียน +6 · รุ่นพี่ +5',{study:6,senior:5}],['ทำงานเฉพาะส่วนที่ถนัด','โปรเจกต์ +4 · พลัง +2',{project:4,energy:2}]]};
  state.nextEventDay=Math.max(state.nextEventDay,state.day+14);openEvent(event);
}
function yearlyEvent(){const year=yearNow();let events=[
  {id:'year1',title:'จบปีหนึ่งแล้ว',place:'ลานโพธิ์',text:`ปีแรกผ่านไป ${state.character.name} รู้จักผู้คนและเส้นทางในมอมากขึ้น ปีต่อไปอยากให้สิ่งไหนเป็นแกนหลัก?`,options:[['รักษากลุ่มเพื่อนที่มีอยู่','เพื่อน +10',{friends:10,happiness:4}],['ตั้งใจสร้างฐานเกรด','การเรียน +10',{study:10,stress:3}],['ลองกิจกรรมใหม่','กิจกรรม +10',{activity:10,energy:-3}]]},
  {id:'year2',title:'ทางแยกของปีสอง',place:'อาคารกิจกรรมนักศึกษา',text:'ทั้งทุน ชมรม และงานพิเศษเริ่มเข้ามาพร้อมกัน คุณจะเลือกทุ่มแรงให้เรื่องไหน?',options:[['ยื่นทุนและรักษาเกรด','โอกาสทุน · การเรียน +6',{scholarship:1,study:6}],['เป็นแกนหลักกิจกรรม','กิจกรรม +12 · เพื่อน +4',{activity:12,friends:4,energy:-5}],['หารายได้และดูแลตัวเอง','เงิน +14 · พลัง -5',{money:14,energy:-5}]]},
  {id:'year3',title:'ก่อนก้าวสู่ปีสุดท้าย',place:'ห้องอาจารย์ที่ปรึกษา',text:'รุ่นน้องเริ่มมาขอคำแนะนำ ขณะที่อาจารย์คุยเรื่องฝึกงานและโปรเจกต์ใหญ่ คุณจะเตรียมตัวแบบไหน?',options:[['เลือกงานฝึกที่ท้าทาย','โปรเจกต์ +12 · อาจารย์ +4',{project:12,mentor:4,stress:4}],['ช่วยรุ่นน้องและสร้างทีม','รุ่นน้อง +10 · เพื่อน +5',{junior:10,friends:5}],['รักษาสมดุลเพื่อไปให้ถึงวันจบ','พลัง +10 · ความสุข +6',{energy:10,happiness:6}]]}
];
  if(year<=3)openEvent(events[year-1]);else openEvent({id:`year${year}`,title:`ก้าวผ่านปี ${year}`,place:'ลานโพธิ์',text:'อีกหนึ่งปีเต็มไปด้วยวิชา ผู้คน และความทรงจำ ก้าวต่อไปของคุณจะเป็นอย่างไร?',options:[['โฟกัสวิชาปีหน้า','การเรียน +8',{study:8}],['ดูแลคนรอบตัว','เพื่อน +8',{friends:8}],['พักและเริ่มใหม่อย่างสดใส','พลัง +8',{energy:8,happiness:4}]]})
}
function weekly(){
  const r=state.routine,s=state.stats;
  const gain={study:10,friends:2,activities:1,sports:2,rest:1}[r];
  state.semesterStudy+=gain;state.semesterWeeks++;
  if(r==='study'){s.energy=clamp(s.energy-2);s.stress=clamp(s.stress+2);s.happiness=clamp(s.happiness-1);s.knowledge=clamp(s.knowledge+1.2)}
  if(r==='friends'){changeStat('friends',2);s.happiness=clamp(s.happiness+2);s.money=clamp(s.money-1)}
  if(r==='activities'){s.activity=clamp(s.activity+2);s.energy=clamp(s.energy-2);changeStat('friends',1)}
  if(r==='sports'){s.health=clamp(s.health+2);s.stress=clamp(s.stress-2);s.energy=clamp(s.energy-1)}
  if(r==='rest'){s.energy=clamp(s.energy+4);s.stress=clamp(s.stress-3);s.happiness=clamp(s.happiness+1)}
  if(state.day%28===0){
    if(state.paths.year1?.index===0)changeStat('friends',1);
    if(state.paths.year1?.index===1)s.knowledge=clamp(s.knowledge+1);
    if(state.paths.year1?.index===2)s.activity=clamp(s.activity+1);
    if(state.paths.year2?.index===0){if(gpa()!==null&&gpa()>=3.25)s.money=clamp(s.money+2);else s.knowledge=clamp(s.knowledge+1)}
    if(state.paths.year2?.index===1)s.activity=clamp(s.activity+1);
    if(state.paths.year2?.index===2){s.money=clamp(s.money+2);s.energy=clamp(s.energy-1)}
    if(state.paths.year3?.index===0)for(const c of state.courses)c.project=clamp(c.project+1);
    if(state.paths.year3?.index===1)state.junior=clamp(state.junior+1);
    if(state.paths.year3?.index===2){s.energy=clamp(s.energy+1);s.stress=clamp(s.stress-1)}
  }
  if(s.energy<30){s.health=clamp(s.health-1);s.stress=clamp(s.stress+1)}
  if(termNow())for(const c of state.courses){
    let effort=r==='study'?12:r==='rest'?2:r==='activities'?-3:0;
    let base=64+effort+(s.energy-50)*.15-(s.stress-40)*.12+(random()-.5)*14;
    c.attendance=clamp((c.attendance*c.weeks+base+4)/(c.weeks+1));
    c.punctual=clamp((c.punctual*c.weeks+base+(state.character.living==='อยู่หอ'?5:-3))/(c.weeks+1));
    c.assignment=clamp((c.assignment*c.weeks+base+effort)/(c.weeks+1));
    c.project=clamp((c.project*c.weeks+base+(r==='activities'?2:0))/(c.weeks+1));
    c.weeks++;
  }
}
function exam(kind){for(const c of state.courses){const s=state.stats;let effort=state.semesterWeeks?state.semesterStudy/state.semesterWeeks:5;let score=50+effort*1.8+c.boost+(s.knowledge-35)*.18+(s.energy-50)*.16-(s.stress-35)*.17+(random()-.5)*22;c[kind]=clamp(Math.round(score));}save()}
function weights(c){return c.type==='practical'?[.18,.1,.22,.26,.1,.14]:[.12,.08,.18,.12,.22,.28]}
function currentScore(c){let mid=c.midterm??Math.round((c.assignment+c.project)/2);let fin=c.final??Math.round((c.assignment+c.project)/2);let w=weights(c);return Math.round([c.attendance,c.punctual,c.assignment,c.project,mid,fin].reduce((a,x,i)=>a+x*w[i],0))}
function letter(score){return score>=80?'A':score>=75?'B+':score>=70?'B':score>=65?'C+':score>=60?'C':score>=55?'D+':score>=50?'D':'F'}
const GRADE_POINTS={A:4,'B+':3.5,B:3,'C+':2.5,C:2,'D+':1.5,D:1,F:0};
function gpa(){let credits=state.transcript.reduce((a,c)=>a+c.credits,0);return credits?state.transcript.reduce((a,c)=>a+GRADE_POINTS[c.grade]*c.credits,0)/credits:null}
function honorTier(score){return score===null?null:score>=4?'gold':score>=3.6?'first':score>=3.25?'second':null}
function honors(){let x=gpa();return x===null?'—':({gold:'อันดับ 1 เหรียญทอง',first:'อันดับ 1',second:'อันดับ 2'}[honorTier(x)]||'ไม่มี')}
function closeSemester(){
  if(state.courses.some(c=>c.final===null))exam('final');
  let results=state.courses.map(c=>({code:c.code,title:c.title,credits:c.credits,year:yearNow(),term:termNow(),score:currentScore(c),grade:letter(currentScore(c))}));
  state.transcript.push(...results);
  let failed=results.filter(c=>c.grade==='F');
  if(state.scholarship){if(gpa()>=3.25){state.stats.money=clamp(state.stats.money+15);state.memory.push({day:state.day,title:'ได้รับทุนการศึกษา',choice:'รักษา GPA ตามเกณฑ์ทุน'})}else state.memory.push({day:state.day,title:'ยังไม่ได้ทุนการศึกษา',choice:'GPA ยังไม่ถึงเกณฑ์ 3.25'});state.scholarship=false}
  state.courses=[];
  if(failed.length){state.ended=true;state.playing=false;state.dayFraction=1;state.failure=failed.map(c=>c.code);save();showResult();return}
  openEvent({id:`term-${yearNow()}-${termNow()}`,title:'ประกาศผลการเรียน',place:'ระบบทะเบียน',text:`เทอมนี้ผ่านแล้ว GPA สะสม ${gpa()?.toFixed(2)} · ${results.map(c=>`${c.code} ${c.grade}`).join(' · ')} ระหว่างปิดเทอมคุณอยากใช้เวลาอย่างไร?`,options:[['พักให้เต็มที่','พลัง +12 · เครียด -6',{energy:12,stress:-6}],['ออกกิจกรรมหรืออาสา','กิจกรรม +8 · เพื่อน +4',{activity:8,friends:4}],['ทำงานพิเศษเก็บเงิน','เงิน +12 · พลัง -4',{money:12,energy:-4}]]})
}
function tickDay(){
  emitDueMoments(1);
  state.day++;
  state.nextMomentIndex=0;
  state.momentSchedule=makeMomentSchedule();
  state.queuedIncident=null;
  if(state.day>=state.years*365){state.ended=true;state.playing=false;state.dayFraction=1;save();showResult();return}
  const d=state.day%365;
  if(state.day%7===0)weekly();
  if(d===75||d===257)exam('midterm');
  if(d===149||d===331){closeSemester();return}
  if(d===182||d===0)startCourses();
  if(d===105){storyArcEvent();return}
  if(d===215&&yearNow()>=2){majorEvent();return}
  if(d===354){yearlyEvent();return}
  const calendarId=(yearNow()===state.years&&d===317?'farewell':CAMPUS_CALENDAR[yearNow()]?.[d]);
  if(calendarId&&!state.seen.includes(calendarId)){openEvent(EVENTS.find(e=>e.id===calendarId));return}
  if(state.day>=state.nextEventDay){randomEvent();return}
  emitDueMoments(0);
  if(state.day%7===0)save();
}
function updateDailyProgress(){if(!state)return;const value=Math.round(clamp(state.dayFraction,0,1)*100),clock=clockForMinute(currentMinute());$('dailyProgressFill').style.width=`${value}%`;$('quickTime').textContent=clock;$('quickTime').setAttribute('datetime',clock);const progress=document.querySelector('.daily-progress');progress.setAttribute('aria-valuenow',String(value));progress.setAttribute('aria-valuetext',clock)}
function loop(t){if(!lastTick)lastTick=t;let dt=Math.min(1000,t-lastTick);lastTick=t;if(state?.playing&&!state.pending&&!state.ended){state.dayFraction+=dt*state.speed/DAY_MS;let count=0;while(state.dayFraction>=1&&state.playing&&count<36){state.dayFraction--;tickDay();count++}const narrated=state.playing&&emitDueMoments(state.dayFraction);if(count||narrated)render();if(narrated)save();updateDailyProgress()}ticker=requestAnimationFrame(loop)}
function lifeScore(){const academic=gpa()===null?65:gpa()*25;const friends=state.friends.reduce((a,f)=>a+f.score,0)/state.friends.length;const activity=state.stats.activity;const well=(state.stats.happiness+state.stats.health+state.stats.energy+(100-state.stats.stress))/4;return Math.round((academic+friends+activity+well)/4)}
function specialBadgeKinds(activityScore,overallScore){return [Math.round(activityScore)>=85?'activity':null,overallScore>=85?'overall':null].filter(Boolean)}
function earnedBadges(){if(!state?.ended)return[];const tier=!state.failure?honorTier(gpa()):null;const badges=tier?[{kind:'honor',tier,title:'เกียรตินิยม',detail:honors(),symbol:tier==='gold'?'1★':tier==='first'?'1':'2'}]:[];for(const kind of specialBadgeKinds(state.stats.activity,lifeScore()))badges.push(kind==='activity'?{kind,title:'เกียรติยศ',detail:'กิจกรรม 85+',symbol:'★'}:{kind,title:'เชิดชูเกียรติ',detail:'คะแนนชีวิต 85+',symbol:'✦'});return badges}
function setRoutine(id){if(!state||state.pending||state.ended||!ROUTINES.some(r=>r.id===id)||state.routine===id)return;state.routine=id;const routine=ROUTINES.find(r=>r.id===id);recordDialogue({day:state.day,title:'เปลี่ยนจังหวะของสัปดาห์',place:'ลานโพธิ์',speaker:'ตัวคุณเอง',text:`สัปดาห์นี้คุณเลือกเน้น “${routine.name}” หลังจากทบทวนสิ่งที่เกิดขึ้นในช่วงที่ผ่านมา`,quote:`ลองให้เวลากับ${routine.name}มากขึ้น แล้วดูว่าชีวิตในมอจะเปลี่ยนไปอย่างไร`});render();save()}
function percentile(){let score=lifeScore(),count=0,r=hashSeed('6300-benchmark');function next(){r^=r<<13;r^=r>>>17;r^=r<<5;return(r>>>0)/4294967296}for(let i=0;i<6300;i++){let v=0;for(let j=0;j<4;j++)v+=next();let benchmark=clamp(65+(v-2)*26);if(benchmark>=score)count++}return Math.max(.1,Math.round(count/6300*1000)/10)}
function highlights(limit=7){const chosen=[];for(let year=1;year<=state.years;year++){const yearly=state.memory.filter(m=>m.choice&&Math.floor(m.day/365)+1===year);const key=yearly.find(m=>/^(year|arc|major)/.test(m.id||''))||yearly[0];if(key)chosen.push(key)}for(const m of state.memory.filter(m=>m.choice).slice().reverse()){if(chosen.length>=limit)break;if(!chosen.includes(m))chosen.push(m)}return chosen.sort((a,b)=>a.day-b.day)}
function render(){if(!state)return;
  $('mobileNav').hidden=!$('modal').hidden;
  const c=state.character,s=state.stats,pending=state.pending;
  updateDailyProgress();
  $('avatar').innerHTML=avatarSvg(c);
  $('profileName').textContent=c.name;$('profileMeta').textContent=`${c.faculty} · ${c.major}`;
  $('profileInfo').innerHTML=[['เพศ',`${genderIcon(c.gender)} ${c.gender}`],['สัญชาติ',c.nationality],['ภูมิลำเนา',c.hometown],['ที่พัก',c.living],['ครอบครัว',c.wealth],['ระยะหลักสูตร',`${c.years} ปี`],...Object.entries(state.paths).map(([year,path])=>[`ทางที่เลือกปี ${year.slice(-1)}`,path.label])].map(([a,b])=>`<div><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('');
  $('chapterTag').textContent=state.ended?'บทสรุปชีวิต':pending?'ถึงเวลาตัดสินใจ':`บทที่ ${yearNow()} · ${yearTerm()}`;
  $('storyDate').textContent=`${!pending&&state.dialogue&&state.dialogue.day<state.day?'บันทึกล่าสุด · ':''}${dateFor(pending?state.day:state.dialogue?.day??state.day)} · ${pending?.time||state.dialogue?.time||clockForMinute(currentMinute())} · ${yearTerm()}`;
  $('storyTitle').textContent=state.ended?'เรื่องราวบทนี้จบลงแล้ว':pending?pending.title:state.dialogue?.title||'วันธรรมดาที่กำลังเดินไป';
  $('storyText').textContent=state.ended?'ดูผลการเรียน ผู้คน และความทรงจำทั้งหมดในหน้าสรุป':pending?pending.text:state.dialogue?.text||`${c.name} เริ่มใช้ชีวิตในมหาวิทยาลัย เวลาเดินต่อจนถึงเหตุการณ์สำคัญครั้งหน้า`;
  const place=state.ended?(state.failure?'ระบบทะเบียน':'ลานโพธิ์'):pending?.place||state.dialogue?.place||LOCATIONS[Math.floor(state.day/12)%LOCATIONS.length];$('location').textContent=place+' · มหาวิทยาลัยหัวเฉียว';renderScene(place);
  $('dailyDialogue').hidden=!!pending||state.ended||!state.dialogue;
  if(!$('dailyDialogue').hidden){const feed=$('dialogueFeed');feed.innerHTML=state.dialogueLog.slice(-4).map(item=>`<article class="dialogue-entry"><div><time>${esc(item.time||'ก่อนอัปเดต')} · ${dateFor(item.day)}</time><strong>${esc(item.speaker||'ตัวคุณเอง')}</strong></div><p>${esc(item.text||'')}</p>${item.quote?`<span class="dialogue-quote">“${esc(item.quote)}”</span>`:''}${item.effects?`<small class="dialogue-delta">${renderEffects(item.effects)}</small>`:''}</article>`).join('');feed.scrollTop=feed.scrollHeight}
  $('choices').innerHTML=state.ended?'<button class="choice" id="resultAgain"><strong>ดูผลชีวิตของฉัน</strong><span class="choice-arrow">↗</span></button>':pending?pending.options.map((x,i)=>{let gate=choiceGate(pending,x,i),risk=riskSummary(x[3]);return `<button class="choice ${gate.ok?'':'choice-locked'}" data-choice="${i}" ${gate.ok?'':'disabled'} aria-label="${esc(x[0])} — ${esc(describeEffects(x[2]))}${risk?` — ${esc(risk)}`:''}${gate.ok?'':` — ${esc(gate.reason)}`}"><span><strong>${esc(x[0])}</strong><small>${renderEffects(x[2])}</small>${risk?`<small class="choice-risk">${esc(risk)}</small>`:''}${gate.ok?'':`<em>${esc(gate.reason)}</em>`}</span><span class="choice-arrow">${gate.ok?'↗':'🔒'}</span></button>`}).join(''):'';
  document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.choice)));
  if($('resultAgain'))$('resultAgain').onclick=showResult;
  $('runningHint').hidden=!!pending||state.ended||!!state.dialogue;
  $('dayCount').textContent=`วันที่ ${state.day+(state.ended?0:1)}`;$('dateLabel').textContent=dateFor(state.day);$('termLabel').textContent=yearTerm();$('yearEndLabel').textContent=state.ended?(state.failure?'ผลลัพธ์ · สิ้นสุดรอบ':'ผลลัพธ์ · จบหลักสูตร'):`เป้าหมาย · ปี ${state.years}`;$('journeyProgress').style.width=`${Math.min(100,state.day/(state.years*365)*100)}%`;
  $('quickDate').textContent=dateFor(state.day);$('quickTerm').textContent=yearTerm();
  $('pauseBtn').textContent=state.ended?'จบรอบแล้ว':pending?'⏸ หยุดเพื่อเลือก':state.playing?'⏸ หยุดเวลา':'▶ เล่นต่อ';$('pauseBtn').disabled=!!pending||state.ended;
  document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',Number(b.dataset.speed)===state.speed));
  $('routineOptions').innerHTML=ROUTINES.map(r=>`<button data-routine="${r.id}" class="${state.routine===r.id?'active':''}" title="${esc(r.desc)}" ${pending||state.ended?'disabled':''}><b>${r.icon}</b>${r.name}</button>`).join('');
  document.querySelectorAll('[data-routine]').forEach(b=>b.onclick=()=>setRoutine(b.dataset.routine));
  $('weather').textContent=(state.day%19<4?'🌧️ ฝนพรำ':'☀️ แดดสดใส');
  $('lifeRank').textContent=`ดีสุด ${percentile()}%`;
  const stats=[['พลัง',s.energy,'#5eae85'],['สุขภาพ',s.health,'#5eae85'],['ความสุข',s.happiness,'#dca95c'],['ความเครียด',s.stress,'#cb8b82'],['เงิน',s.money,'#dca95c'],['ความรู้',s.knowledge,'#83a6d5'],['กิจกรรม',s.activity,'#5eae85']];
  const relation=Math.round(state.friends.reduce((a,f)=>a+f.score,0)/state.friends.length);
  $('quickStats').innerHTML=[['พลัง',Math.round(s.energy),s.energy,'#e5ae63'],['สุขภาพ',Math.round(s.health),s.health,'#de7e83'],['ความสุข',Math.round(s.happiness),s.happiness,'#e7bb61'],['ความเครียด',Math.round(s.stress),s.stress,'#b989bd'],['เงิน',Math.round(s.money),s.money,'#e0ae59'],['ความรู้',Math.round(s.knowledge),s.knowledge,'#83a6d5'],['กิจกรรม',Math.round(s.activity),s.activity,'#6fae86'],['เพื่อน',relation,relation,'#70aeb0'],['GPA',gpa()===null?'—':gpa().toFixed(2),gpa()===null?0:gpa()/4*100,'#83a6d5']].map(([label,value,percent,color])=>`<div class="quick-stat" tabindex="0" data-status-name="${label}" data-status-description="${QUICK_STAT_TIPS[label]}" aria-label="${label} ${value}: ${QUICK_STAT_TIPS[label]}"><span class="quick-icon" style="color:${color}">${statIcon(STAT_ICON_KEYS[label])}</span><span class="quick-mini"><span style="width:${Math.round(percent)}%;background:${color}"></span></span><strong>${value}</strong><span class="quick-label">${label}</span></div>`).join('');
  $('stats').innerHTML=stats.map(([label,v,color])=>`<div><div class="stat-label"><span>${label}</span><strong>${Math.round(v)}</strong></div><div class="stat-bar"><div class="stat-fill" style="width:${v}%;background:${color}"></div></div></div>`).join('');
  $('gpaBadge').textContent=`GPA ${gpa()===null?'—':gpa().toFixed(2)}`;
  $('courseList').innerHTML=state.courses.length?state.courses.map(x=>`<button class="course" data-course="${esc(x.code)}" aria-label="ดูคะแนนรายวิชา ${esc(x.code)}"><span><span class="course-code">${esc(x.code)}</span><span class="course-name">${esc(x.title)}</span></span><span class="course-score" title="คะแนนประเมินปัจจุบัน">${currentScore(x)}${currentScore(x)<54?' ⚠':''} ↗</span></button>`).join(''):`<p class="empty">${state.ended?'จบเส้นทางแล้ว · ดูใบเกรดทั้งหมด':'ช่วงปิดเทอม · รอวิชาเทอมถัดไป'}</p>`;
  document.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>showCourse(b.dataset.course));
  $('friends').innerHTML=state.friends.map((f,i)=>`<div class="friend"><span class="friend-icon">${['🌻','🍀','✨'][i]}</span><div class="friend-main"><strong>${esc(f.name)}</strong><small>${esc(f.role)}</small></div><span class="friend-score">${Math.round(f.score)}</span></div>`).join('')+`<div class="friend"><span class="friend-icon">🎓</span><div class="friend-main"><strong>รุ่นพี่ / รุ่นน้อง</strong><small>คนที่คอยช่วยกัน</small></div><span class="friend-score">${Math.round((state.senior+state.junior)/2)}</span></div><div class="friend"><span class="friend-icon">📝</span><div class="friend-main"><strong>${esc(state.teacher)}</strong><small>อาจารย์ที่ปรึกษา</small></div><span class="friend-score">${Math.round(state.mentor)}</span></div>`;
}
function showModal(html){modalWasPlaying=!!state?.playing;closeMobileNav();$('mobileNav').hidden=true;$('modal').classList.remove('intro-open');$('modalContent').innerHTML=html;$('modal').hidden=false;state&&(state.playing=false);document.body.style.overflow='hidden'}
function closeModal(){if(!$('modal').hidden){if($('modal').classList.contains('intro-open')&&!state)return;$('modal').hidden=true;$('modal').classList.remove('intro-open');document.body.style.overflow='';if(modalWasPlaying&&state&&!state.pending&&!state.ended)state.playing=true;modalWasPlaying=false;lastTick=performance.now();if(state)render()}}
const INTRO_STAT_TIPS={'พลัง':'เรียน/ทำงานใช้ พักแล้วฟื้น','สุขภาพ':'บางกิจกรรมต้องมีขั้นต่ำ','ความสุข':'เพื่อนและการพักช่วยเพิ่ม','ความเครียด':'สูงแล้วกระทบการเรียน','เงิน':'ใช้กิน เดินทาง และเที่ยว','ความรู้':'อ่านและเรียนเพื่อปลดล็อก','กิจกรรม':'ชมรม กีฬา งานในมอ','เพื่อน':'ความสัมพันธ์กับเพื่อน','GPA':'เกรดเฉลี่ยวิชาที่จบ'};
function statusLegend(intro=false){const tips=intro?INTRO_STAT_TIPS:QUICK_STAT_TIPS;return `<div class="status-legend">${Object.entries(STAT_ICON_KEYS).map(([label,key])=>`<div><b><span class="legend-icon stat-${key}">${statIcon(key)}</span>${label}</b><span>${tips[label]}</span></div>`).join('')}</div>`}
function introStatusLegend(){return statusLegend(true)}
function introOwnerBar(){return `<div class="intro-owner-bar" aria-label="เครดิตผู้สร้างและประกาศสงวนลิขสิทธิ์"><div class="intro-owner-main"><strong>สร้างโดย กรวิชญ์ พุทธบารมี (แอ้ม)</strong><span>นักศึกษา Computer Science ปี 66</span></div><div class="intro-owner-links"><a class="social-logo-link" href="https://github.com/Ampsoria" target="_blank" rel="noopener noreferrer" aria-label="GitHub Ampsoria เปิดแท็บใหม่" title="GitHub · Ampsoria"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 .1.77 1.88 3.26 1.25.1-.72.39-1.21.71-1.49-2.5-.29-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.1c.95 0 1.9.13 2.8.38 2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.73.79 1.16 1.79 1.16 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.12c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z"/></svg></a><a class="social-logo-link" href="https://www.instagram.com/ampokayampfinegwenchana/" target="_blank" rel="noopener noreferrer" aria-label="Instagram ampokayampfinegwenchana สำหรับส่งข้อเสนอแนะและแจ้งบัค เปิดแท็บใหม่" title="Instagram · @ampokayampfinegwenchana"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="18" cy="6" r="1.2" fill="currentColor" stroke="none"/></svg></a></div><p>ส่ง feedback หรือแจ้งบัคทาง IG · © 2026 กรวิชญ์ พุทธบารมี · สงวนลิขสิทธิ์ ห้ามทำซ้ำหรือดัดแปลงโดยไม่ได้รับอนุญาต</p></div>`}
function showIntro(resume=false){
  showModal(`<div class="intro-screen" id="introScreen">${introOwnerBar()}
    <div class="intro-visual">
      <div class="intro-visual-top"><img src="./favicon.svg?v=3" alt="" class="intro-mark"><span>HCU LIFE / 2569</span><button class="music-toggle intro-music-toggle" data-music-toggle type="button" aria-label="ปิดเพลงประกอบ" aria-pressed="true"><span class="music-icon" aria-hidden="true">♫</span><span class="music-text">เพลง: เปิด</span></button></div>
      <div class="intro-scene"><svg viewBox="0 0 1240 310" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges" role="img" aria-label="พิกเซลอาร์ตลานโพธิ์มหาวิทยาลัยหัวเฉียว">${globalThis.sceneArt('campus',introSceneActors())}</svg><span class="intro-scene-label">ลานโพธิ์ · มหาวิทยาลัยหัวเฉียว</span></div>
      <div class="intro-visual-bottom"><span class="intro-visual-eyebrow">FOUR YEARS, ONE STORY</span><strong>ชีวิตในรั้วหัวเฉียว<br>จะเป็นแบบไหน?</strong><p>จากวันแรกที่ลานโพธิ์ สู่ผลการเรียน เพื่อน กิจกรรม และความทรงจำในวันสุดท้าย</p><div class="intro-year-track"><span>ปี 1</span><i></i><span>ปี 2</span><i></i><span>ปี 3</span><i></i><span>ปี 4</span></div></div>
    </div>
    <div class="intro-content">
      <div class="intro-content-top"><span class="eyebrow">THE HCU LIFE SIMULATION</span>${state?'<button class="intro-dismiss" id="introDismiss" aria-label="กลับไปเล่น">×</button>':''}</div>
      <section class="intro-step" id="introWelcome" aria-label="หน้าแนะนำเกม">
        <span class="intro-step-count">หน้าเริ่มเกม</span><h2>ถ้าได้เกิดเป็น<br><em>หนึ่งใน 6,300 คน</em></h2>
        <p class="intro-lead">สุ่มชีวิตนักศึกษาปี 1 แล้วเลือกเส้นทางการเรียน เพื่อน กิจกรรม เงิน และความสุขตลอด 4 ปี</p>
        <div class="intro-feature"><span>สุ่มคณะและสาขา</span><span>เวลาเดินเป็นวัน</span><span>หยุดเมื่อมีเรื่องให้เลือก</span><span>เซฟอัตโนมัติ</span></div>
        <div class="intro-actions"><label class="field">รหัสเรื่องราว <small>เว้นว่าง = สุ่ม</small><input id="seedInput" placeholder="เช่น HCU-2569" autocomplete="off"></label><button class="primary intro-start" id="introStartNow" type="button">เริ่มเกมเลย <span>→</span></button><button class="intro-guide-link" id="introNext" type="button">ⓘ ดูไอคอนและค่าสถานะก่อนเล่น</button>${resume?'<button class="ghost intro-resume" id="resumeBtn" type="button">เล่นต่อจากที่บันทึกไว้ <span>→</span></button>':''}</div>
      </section>
      <section class="intro-step" id="introGuide" aria-label="คำอธิบายไอคอนและสถานะ" hidden>
        <span class="intro-step-count">หน้าคำอธิบาย</span><h2 class="intro-guide-heading">รู้จักค่าสถานะ</h2>
        <p class="intro-lead intro-guide-lead">แต่ละตัวเลือกอาจเพิ่มหรือลดค่าสถานะ บางตัวเลือกต้องมีค่าถึงเกณฑ์จึงจะเลือกได้</p>
        <div class="intro-guide">${introStatusLegend()}<p>ระหว่างเล่น กดปุ่ม i ข้างแถบสถานะเพื่อดูคำอธิบายอีกครั้ง</p></div>
        <div class="intro-step-actions"><button class="ghost intro-back" id="introBack" type="button">← กลับ</button><button class="primary intro-start" id="startBtn" type="button">เข้าใจแล้ว ไปใช้ชีวิตกัน <span>↗</span></button></div>
        <p class="intro-disclaimer">ตัวละครและเหตุการณ์เป็นเรื่องสมมติ · เปอร์เซ็นต์เทียบกับชีวิตจำลอง 6,300 รอบ</p>
      </section>
    </div>
  </div>`);
  $('modal').classList.add('intro-open');
  fitWalkerAnimation(document.querySelector('.intro-scene svg'));
  const welcome=$('introWelcome'),guide=$('introGuide'),screen=$('introScreen');
  $('introNext').onclick=()=>{welcome.hidden=true;guide.hidden=false;screen.classList.add('is-guide');guide.querySelector('button')?.focus()};
  $('introBack').onclick=()=>{guide.hidden=true;welcome.hidden=false;screen.classList.remove('is-guide');fitWalkerAnimation(document.querySelector('.intro-scene svg'));$('introNext').focus()};
  const startGame=()=>{if(state&&!confirm('เริ่มชีวิตใหม่? ผลการเล่นปัจจุบันจะถูกแทนที่'))return;newState($('seedInput').value);closeModal()};
  $('introStartNow').onclick=startGame;
  $('startBtn').onclick=startGame;
  if(resume)$('resumeBtn').onclick=closeModal;
  if(state)$('introDismiss').onclick=closeModal;
}
function showStatsInfo(){showModal(`<span class="eyebrow">STATUS GUIDE</span><h2>ค่าสถานะในเกม</h2><p>แถบด้านบนย่อค่าที่เปลี่ยนระหว่างเล่นไว้ให้ดูตลอดเวลา ตัวเลขส่วนใหญ่เต็ม 100 คะแนน ส่วน GPA เต็ม 4.00</p>${statusLegend()}<p>คะแนนชีวิตรวมตอนจบเฉลี่ยจากผลการเรียน ความสัมพันธ์ กิจกรรม และความสุข/สุขภาพ โดยให้น้ำหนักด้านละ 25%</p><button class="primary" id="statsInfoClose">กลับไปเล่น</button>`);$('statsInfoClose').onclick=closeModal}
function showDialogueLog(page=0){if(!state)return;if(typeof page!=='number')page=0;const all=state.dialogueLog||[],size=80,maxPage=Math.max(0,Math.ceil(all.length/size)-1);page=Math.max(0,Math.min(maxPage,page));const end=all.length-page*size,entries=all.slice(Math.max(0,end-size),end).reverse();const html=`<span class="eyebrow">CAMPUS DIARY</span><h2>เรื่องราวระหว่างวัน</h2><p>เรียงจากข้อความล่าสุด · เวลาในเกมแสดงตั้งแต่ 00:00–23:59</p><div class="dialogue-history">${entries.map(item=>`<article><time>${esc(item.time||'ก่อนอัปเดต')} · ${dateFor(item.day)}</time><strong>${esc(item.title||'บันทึกชีวิต')} · ${esc(item.speaker||'ตัวคุณเอง')}</strong><p>${esc(item.text||'')}</p>${item.quote?`<blockquote>“${esc(item.quote)}”</blockquote>`:''}${item.effects?`<small class="dialogue-delta">${renderEffects(item.effects)}</small>`:''}</article>`).join('')||'<p>เรื่องราวกำลังเริ่มต้น</p>'}</div><div class="dialogue-history-nav"><button id="dialogueNewer" ${page===0?'disabled':''}>← ใหม่กว่า</button><span>หน้า ${page+1} / ${maxPage+1}</span><button id="dialogueOlder" ${page===maxPage?'disabled':''}>เก่ากว่า →</button></div><button class="primary" id="dialogueLogClose">กลับไปเล่น</button>`;if($('modal').hidden)showModal(html);else $('modalContent').innerHTML=html;$('dialogueNewer').onclick=()=>showDialogueLog(page-1);$('dialogueOlder').onclick=()=>showDialogueLog(page+1);$('dialogueLogClose').onclick=closeModal}
let quickStatusHideTimer=0,touchStatusOrigin=null;
function hideQuickStatus(){clearTimeout(quickStatusHideTimer);$('quickStatTooltip').hidden=true}
function showQuickStatus(stat){
  if(!stat)return;
  clearTimeout(quickStatusHideTimer);
  const tip=$('quickStatTooltip');
  tip.querySelector('strong').textContent=stat.dataset.statusName;
  tip.querySelector('span').textContent=stat.dataset.statusDescription;
  tip.hidden=false;
  const box=stat.getBoundingClientRect(),width=tip.offsetWidth,height=tip.offsetHeight;
  const left=Math.max(8,Math.min(box.left+box.width/2-width/2,globalThis.innerWidth-width-8));
  const above=box.top-height-8,top=above>=8?above:Math.min(box.bottom+8,globalThis.innerHeight-height-8);
  tip.style.left=`${left}px`;tip.style.top=`${Math.max(8,top)}px`;
}
function quickStatusAt(target){const stat=target?.closest?.('.quick-stat');return stat&&$('quickStats').contains(stat)?stat:null}
document.addEventListener('pointerover',e=>{if(e.pointerType!=='touch'){const stat=quickStatusAt(e.target);if(stat)showQuickStatus(stat)}});
document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'){
    if(touchStatusOrigin&&Math.hypot(e.clientX-touchStatusOrigin.x,e.clientY-touchStatusOrigin.y)>12){touchStatusOrigin=null;hideQuickStatus()}
    return;
  }
  const stat=quickStatusAt(e.target);stat?showQuickStatus(stat):hideQuickStatus();
});
document.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch')return;
  const stat=quickStatusAt(e.target);
  if(!stat){hideQuickStatus();return}
  touchStatusOrigin={x:e.clientX,y:e.clientY};showQuickStatus(stat);
});
document.addEventListener('pointerup',e=>{if(e.pointerType==='touch'&&touchStatusOrigin){touchStatusOrigin=null;quickStatusHideTimer=setTimeout(hideQuickStatus,1600)}});
document.addEventListener('pointercancel',e=>{if(e.pointerType==='touch'){touchStatusOrigin=null;hideQuickStatus()}});
document.addEventListener('pointerout',e=>{if(e.pointerType!=='touch'&&!quickStatusAt(e.relatedTarget))hideQuickStatus()});
document.addEventListener('focusin',e=>{const stat=quickStatusAt(e.target);if(stat?.matches(':focus-visible'))showQuickStatus(stat)});
document.addEventListener('focusout',e=>{if(quickStatusAt(e.target))hideQuickStatus()});
document.addEventListener('contextmenu',e=>{if(quickStatusAt(e.target))e.preventDefault()});
document.addEventListener('scroll',hideQuickStatus,true);
globalThis.addEventListener?.('resize',hideQuickStatus);
function showHelp(){showModal(`<span class="eyebrow">HOW TO PLAY</span><h2>ชีวิตหนึ่งในหัวเฉียว</h2><div class="modal-list"><div>หลอดเล็กใต้ค่าสถานะแสดงเวลาที่ผ่านไปในแต่ละวัน ปรับ 1×–32× ได้ และจะหยุดทันทีเมื่อมีเรื่องให้เลือก</div><div>แต่ละคำตอบแสดงค่าที่เพิ่มหรือลด ถ้าพลัง เงิน หรือความรู้ไม่พอ ปุ่มจะล็อกพร้อมบอกค่าที่ต้องมี</div><div>เลือกกิจวัตรประจำสัปดาห์เพื่อเปลี่ยนแนวชีวิต เวลาเดินต่อโดยไม่ต้องกดทุกวัน จุดเปลี่ยนท้ายปีจะส่งผลต่อปีถัดไปด้วย</div><div>คะแนนวิชาแยกเข้าเรียน ตรงเวลา งาน โปรเจกต์ กลางภาค และปลายภาค คะแนนข้างวิชาเป็นค่าประเมินปัจจุบัน</div><div>ถ้าผลปลายเทอมมี F รอบนั้นจบ หลังจบหลักสูตรจะสรุป GPA และเกียรตินิยม</div><div>ผลลัพธ์มอบ Badge เกียรติยศเมื่อกิจกรรมตั้งแต่ 85 คะแนน และเชิดชูเกียรติเมื่อคะแนนชีวิตรวมตั้งแต่ 85 คะแนน</div><div>เกมเซฟในเบราว์เซอร์นี้ และหยุดเวลาเมื่อสลับออกจากแท็บ</div></div><button class="primary" id="helpClose">เข้าใจแล้ว</button>`);$('helpClose').onclick=closeModal}
function showTranscript(){let rows=state.transcript.map(c=>`<tr><td>${c.year}/${c.term}</td><td>${esc(c.code)}</td><td>${esc(c.title)}</td><td>${c.score}</td><td>${c.grade}</td></tr>`).join('');showModal(`<span class="eyebrow">ACADEMIC RECORD</span><h2>ใบเกรดของ ${esc(state.character.name)}</h2><p>GPA สะสม <strong>${gpa()?.toFixed(2)??'—'}</strong> · เกียรตินิยม ${state.ended&&!state.failure?honors():'—'}</p><table class="transcript-table"><thead><tr><th>ปี/เทอม</th><th>รหัส</th><th>วิชา</th><th>คะแนน</th><th>เกรด</th></tr></thead><tbody>${rows||'<tr><td colspan="5">ยังไม่มีผลการเรียน</td></tr>'}</tbody></table><p class="fine-print">การจัดวิชาและเกณฑ์คะแนนเป็นกติกาของเกม ไม่ใช่ใบแสดงผลการเรียนจริง</p>`)}
function showCourse(code){
  const c=state.courses.find(x=>x.code===code);if(!c)return;
  const w=weights(c),values=[c.attendance,c.punctual,c.assignment,c.project,c.midterm,c.final],labels=['เข้าเรียน','ตรงเวลา','ส่งงาน','โปรเจกต์','สอบกลางภาค','สอบปลายภาค'];
  const known=values.slice(0,5).reduce((sum,v,i)=>sum+(v??0)*w[i],0);
  const needed=Math.ceil((50-known)/w[5]);
  const risk=c.midterm===null?`ตอนนี้ประเมินได้ ${currentScore(c)} คะแนนจากแนวโน้มงานและการเข้าเรียน หลังสอบกลางภาคจะเห็นคะแนนปลายภาคที่ต้องทำให้ผ่าน`:`ถ้าคะแนนส่วนอื่นคงเดิม ต้องได้ปลายภาคอย่างน้อย ${Math.max(0,needed)} / 100 เพื่อผ่าน${needed>100?' — ควรเร่งแก้งานและคะแนนระหว่างเทอม':''}`;
  showModal(`<span class="eyebrow">${esc(c.code)} · ${c.credits} หน่วยกิต</span><h2>${esc(c.title)}</h2><p>คะแนนประเมินปัจจุบัน <strong>${currentScore(c)}/100</strong> · เกณฑ์ผ่าน 50 คะแนน</p><div class="modal-list">${labels.map((label,i)=>`<div style="display:flex;justify-content:space-between;gap:10px"><span>${label} · น้ำหนัก ${Math.round(w[i]*100)}%</span><strong>${values[i]===null?'รอสอบ':Math.round(values[i])+'/100'}</strong></div>`).join('')}</div><p class="${needed>100?'warning':''}">${risk}</p><p class="fine-print">คะแนนแสดงตามกติกาของเกมและอาจเปลี่ยนระหว่างเทอม</p><button class="primary" id="courseClose">กลับไปเล่น</button>`);
  $('courseClose').onclick=closeModal;
}
function showResult(){if(!state)return;const done=!state.failure;let p=percentile();let memories=highlights(),badges=earnedBadges();showModal(`<span class="eyebrow">THE UNIVERSITY MEMORY BOOK</span><h2>${done?'คุณมาถึงวันจบแล้ว':'เส้นทางหยุดลงในเทอมนี้'}</h2><div class="result-hero"><div><span class="eyebrow">${esc(state.character.faculty)}</span><br><strong>${esc(state.character.name)}</strong><br><small>${genderIcon(state.character.gender)} ${esc(state.character.gender)} · ${esc(state.character.major)} · ${state.character.years} ปี</small></div><div style="text-align:right"><span class="eyebrow">LIFE SCORE</span><br><strong>${lifeScore()}/100</strong><br><small>ดีสุด ${p}% ของชีวิตจำลอง</small></div></div>${!done?`<p class="warning">ได้ F ในวิชา ${state.failure.map(esc).join(', ')} ตามกติกาเกมจึงไม่สามารถไปต่อได้</p>`:''}<div class="result-grid"><div>GPA สะสม<strong>${gpa()?.toFixed(2)??'—'}</strong></div><div>เกียรตินิยม<strong>${done?honors():'—'}</strong></div><div>คะแนนกิจกรรม<strong>${Math.round(state.stats.activity)}/100</strong></div><div>ความสัมพันธ์<strong>${Math.round(state.friends.reduce((a,f)=>a+f.score,0)/3)}/100</strong></div><div>ความสุข<strong>${Math.round(state.stats.happiness)}/100</strong></div><div>วิชาที่ผ่าน<strong>${state.transcript.filter(c=>c.grade!=='F').length} วิชา</strong></div></div><h3>Badge ที่ได้รับ</h3><div class="result-badges">${badges.length?badges.map(b=>`<div class="result-badge result-badge-${b.kind}"><span class="result-badge-icon" aria-hidden="true">${b.symbol}</span><span><strong>${esc(b.title)}</strong><small>${esc(b.detail)}</small></span></div>`).join(''):'<p>ยังไม่มี Badge พิเศษในรอบนี้</p>'}</div><h3>สมุดความทรงจำ</h3><ul class="memory-list">${memories.map(m=>`<li>ปี ${Math.floor(m.day/365)+1} · ${esc(m.title)} — ${esc(m.choice)}</li>`).join('')}</ul><p class="seed-box">รหัสเรื่องราว: ${esc(state.seed)}<br>เปอร์เซ็นต์เทียบกับชีวิตจำลอง 6,300 รอบ ไม่ใช่ข้อมูลนักศึกษาจริง</p><div class="modal-actions"><button class="primary" id="downloadBtn">ดาวน์โหลดภาพสตอรี่ ↓</button><button class="ghost" id="resultTranscript">ดูใบเกรด</button><button class="ghost" id="retrySeed">ลองรหัสเดิมอีกครั้ง</button></div>`);$('downloadBtn').onclick=downloadStory;$('resultTranscript').onclick=showTranscript;$('retrySeed').onclick=()=>{if(confirm('เริ่มรอบใหม่ด้วยรหัสเรื่องราวเดิม? ผลการเล่นที่บันทึกไว้จะถูกแทนที่')){let seed=state.seed;newState(seed);closeModal()}}}
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=3){let words=[...String(text)];let line='',count=0;for(let i=0;i<words.length;i++){let t=line+words[i];if(ctx.measureText(t).width>maxWidth&&line){ctx.fillText(line,x,y+count*lineHeight);count++;line=words[i];if(count>=maxLines)return}else line=t}if(line&&count<maxLines)ctx.fillText(line,x,y+count*lineHeight)}
function drawHonorBadge(ctx,tier,x,y){
  const colors={second:{main:'#9fb1c1',light:'#e9f0ef',dark:'#596f83',ribbon:'#55738a',number:'2'},first:{main:'#e5b75c',light:'#fff0ba',dark:'#a27033',ribbon:'#8f1d29',number:'1'},gold:{main:'#ffcb05',light:'#fff4aa',dark:'#a86c16',ribbon:'#8f1d29',number:'1'}}[tier];
  if(!colors)return;
  const pixel=(dx,dy,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,w,h)};
  pixel(24,65,25,25,colors.ribbon);pixel(62,65,25,25,colors.ribbon);pixel(24,84,8,8,'#f3e4c4');pixel(79,84,8,8,'#f3e4c4');
  pixel(14,8,84,67,colors.dark);pixel(9,17,94,51,colors.dark);pixel(18,12,76,59,colors.main);pixel(13,21,86,43,colors.main);
  pixel(26,18,60,5,colors.light);pixel(23,27,5,34,colors.light);pixel(31,59,54,4,colors.dark);
  if(tier==='gold'){
    pixel(31,4,12,13,colors.light);pixel(49,0,12,17,colors.light);pixel(67,4,12,13,colors.light);pixel(34,17,43,5,colors.dark);
    pixel(30,33,7,7,colors.light);pixel(33,30,2,13,colors.light);pixel(72,33,7,7,colors.light);pixel(75,30,2,13,colors.light);
  }else if(tier==='first'){
    pixel(31,31,7,7,colors.light);pixel(33,28,3,13,colors.light);pixel(74,31,7,7,colors.light);pixel(76,28,3,13,colors.light);
  }else{
    pixel(28,32,8,8,colors.light);pixel(73,32,8,8,colors.light);pixel(28,46,8,8,colors.light);pixel(73,46,8,8,colors.light);
  }
  ctx.fillStyle=colors.dark;ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.fillText(colors.number,x+56,y+59);ctx.textAlign='left';
  ctx.fillStyle=colors.dark;ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(tier==='gold'?'GOLD':tier==='first'?'FIRST':'SECOND',x+56,y+104);ctx.textAlign='left';
}
function drawSpecialBadge(ctx,kind,x,y){
  const activity=kind==='activity',main=activity?'#328b77':'#9b2637',dark=activity?'#1b594d':'#70222e',light=activity?'#d9f4dd':'#ffe3a0';
  const pixel=(dx,dy,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x+dx,y+dy,w,h)};
  pixel(23,65,26,25,dark);pixel(63,65,26,25,dark);pixel(14,8,84,67,dark);pixel(9,17,94,51,dark);pixel(18,12,76,59,main);pixel(13,21,86,43,main);
  pixel(26,18,60,5,light);pixel(23,27,5,34,light);pixel(31,59,54,4,dark);
  if(activity){
    pixel(54,27,7,32,'#fff0bb');pixel(60,29,22,7,'#ffcb05');pixel(60,36,16,7,'#ffcb05');pixel(60,43,10,6,'#ffcb05');pixel(44,52,29,6,light);
  }else{
    pixel(52,25,8,35,'#ffcb05');pixel(39,38,34,8,'#ffcb05');pixel(44,30,24,24,'#fff0a2');pixel(51,35,10,14,'#a35c21');
    pixel(34,28,7,7,'#ffcb05');pixel(73,28,7,7,'#ffcb05');pixel(34,51,7,7,'#ffcb05');pixel(73,51,7,7,'#ffcb05');
  }
  ctx.fillStyle=dark;ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(activity?'ACTIVITY':'85+',x+56,y+104);ctx.textAlign='left';
}
async function downloadStory(){
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d'),c=state.character;
  const block=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
  const label=(text,x,y,color='#7c564c',size=22)=>{ctx.fillStyle=color;ctx.font=`bold ${size}px sans-serif`;ctx.fillText(text,x,y)};
  const fit=(text,x,y,width,size=52,min=28)=>{ctx.font=`bold ${size}px sans-serif`;while(ctx.measureText(text).width>width&&size>min){size-=2;ctx.font=`bold ${size}px sans-serif`}ctx.fillText(text,x,y)};
  block(0,0,1080,1920,'#fff8eb');block(0,0,1080,171,'#8f1d29');block(0,165,1080,6,'#eabd4e');
  block(58,42,92,92,'#ffcb05');label('1',83,110,'#8f1d29',68);block(121,62,13,13,'#8f1d29');
  label('1 ใน 6,300 คน',177,93,'#fff8e7',49);ctx.fillStyle='#ffe0ab';ctx.font='25px sans-serif';ctx.fillText('หนึ่งชีวิตในรั้วหัวเฉียว',179,133);
  label('MY UNIVERSITY LIFE',58,222,'#a63b43',24);
  block(65,267,960,470,'#e5d0ac');block(57,259,960,470,'#fff0cf');block(57,259,960,7,'#e9bc50');
  block(80,286,276,382,'#c8dcc9');block(80,286,276,8,'#e5b65e');block(80,593,276,75,'#9fc9ad');
  for(let i=0;i<8;i++)block(82+i*36,574,20,4,'#e9f2d9');
  drawAvatar(ctx,c,90,318,4);block(80,669,276,45,'#742934');label('HCU / STUDENT',100,698,'#fff1d3',19);
  label('YOUR CHARACTER',389,314,'#a13e43',20);ctx.fillStyle='#63242d';fit(c.name,387,380,585,55,32);
  block(389,407,220,4,'#e9bb60');ctx.fillStyle='#6e3c3b';ctx.font='bold 27px sans-serif';wrapText(ctx,c.faculty,389,457,584,33,2);
  ctx.fillStyle='#775b54';ctx.font='24px sans-serif';wrapText(ctx,c.major,389,525,584,32,2);
  label(`${genderIcon(c.gender)} ${c.gender}`,390,605,'#8f1d29',27);ctx.fillStyle='#876b5d';ctx.font='23px sans-serif';fit(`${c.nationality} · ${c.hometown} · ${c.living}`,390,650,594,23,19);
  label(`หลักสูตร ${c.years} ปี`,390,691,'#82665a',23);
  block(57,759,960,231,'#afd0c4');
  try{const scene=new Image();scene.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="310" viewBox="0 0 1240 310"><style>.pixel-rain{display:none}</style>${globalThis.sceneArt('campus',sceneActors('campus'))}</svg>`);await scene.decode();ctx.drawImage(scene,57,759,960,231)}catch{block(57,759,960,163,'#a8d3cb');block(57,922,960,68,'#c8ad8b')}
  block(75,942,290,33,'#fff7e9');label('ลานโพธิ์ · หัวเฉียว',90,965,'#722c36',17);
  block(57,1017,960,140,'#8f1d29');block(57,1017,9,140,'#e8bc57');label('ชีวิตดีสุด',86,1061,'#ffe2aa',25);
  ctx.fillStyle='#fff6e5';fit(`${percentile()}%`,82,1130,420,68,48);label('LIFE SCORE',620,1062,'#ffe2aa',22);
  ctx.fillStyle='#fff7e7';ctx.textAlign='right';ctx.font='bold 64px sans-serif';ctx.fillText(`${lifeScore()}/100`,980,1133);ctx.textAlign='left';
  const stats=[['GPA',gpa()?.toFixed(2)??'—'],['กิจกรรม',`${Math.round(state.stats.activity)}/100`],['ความสัมพันธ์',`${Math.round(state.friends.reduce((sum,f)=>sum+f.score,0)/3)}/100`],['ความสุข',`${Math.round(state.stats.happiness)}/100`]];
  stats.forEach(([title,value],i)=>{const x=57+i%2*490,y=1190+Math.floor(i/2)*137;block(x+5,y+5,470,120,'#e9d6b6');block(x,y,470,120,'#fff0ce');block(x,y,6,120,i===0?'#8f1d29':'#e9bc50');label(title,x+22,y+39,'#78564d',23);label(value,x+22,y+99,'#7c2530',52)});
  block(57,1483,960,160,'#f3e4c4');block(57,1483,960,5,'#d3a45b');label(state.failure?'เส้นทางหยุดลงเมื่อได้ F':state.ended?`จบหลักสูตร ${state.years} ปี`:'เรื่องราวยังดำเนินต่อ',79,1516,'#91404a',22);
  const badges=earnedBadges();
  if(badges.length){
    const groupWidth=300,gap=10,startX=57+(960-(badges.length*groupWidth+(badges.length-1)*gap))/2;
    badges.forEach((badge,i)=>{const x=startX+i*(groupWidth+gap);block(x,1530,groupWidth,103,'#fff8e9');badge.kind==='honor'?drawHonorBadge(ctx,badge.tier,x+2,1530):drawSpecialBadge(ctx,badge.kind,x+2,1530);label(badge.title,x+117,1575,'#792833',19);ctx.fillStyle='#78594e';fit(badge.detail,x+117,1603,173,18,14)});
  }else label('ยังไม่มี Badge พิเศษในรอบนี้',79,1585,'#78594e',20);
  label('สมุดความทรงจำ',58,1673,'#812d37',27);const memories=highlights(4).slice(-3);ctx.fillStyle='#755b54';ctx.font='20px sans-serif';memories.forEach((m,i)=>{block(61,1695+i*54,11,11,'#e1ad54');wrapText(ctx,`ปี ${Math.floor(m.day/365)+1} · ${m.title} — ${m.choice}`,86,1707+i*54,894,23,1)});
  block(57,1830,960,3,'#d4ad66');ctx.fillStyle='#7e665a';ctx.font='19px sans-serif';fit(`รหัสเรื่องราว ${state.seed}`,57,1866,650,19,16);
  const host=location.hostname,publicUrl=location.protocol==='https:'&&!['localhost','127.0.0.1'].includes(host)?new URL('.',document.baseURI).href.replace(/\/$/,''):null;
  if(publicUrl){ctx.font='bold 19px sans-serif';ctx.textAlign='right';ctx.fillText(publicUrl,1017,1866,390);ctx.textAlign='left'}
  ctx.font='17px sans-serif';ctx.fillText('ผลลัพธ์เป็นการจำลองเพื่อความบันเทิง',57,1901);
  canvas.toBlob(blob=>{if(!blob)return;let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`hcu-life-${state.seed.replace(/[^\w-]/g,'-').slice(0,40)}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)},'image/png');
}
async function init(){try{const res=await fetch('./courses.json');if(!res.ok)throw Error('โหลดข้อมูลวิชาไม่สำเร็จ');catalog=await res.json();if(!load())showIntro(false);else showIntro(true);ticker=requestAnimationFrame(loop)}catch(e){$('storyTitle').textContent='เปิดข้อมูลวิชาไม่สำเร็จ';$('storyText').textContent='กรุณาเปิดเว็บผ่าน local server หรือโฮสต์แบบ static แล้วโหลดหน้าใหม่';console.error(e)}}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state?.playing){state.playing=false;save();render()}lastTick=performance.now()});
globalThis.addEventListener?.('resize',()=>document.querySelectorAll('.intro-scene svg, .campus-art').forEach(fitWalkerAnimation));
$('pauseBtn').onclick=()=>{if(!state||state.pending||state.ended)return;state.playing=!state.playing;lastTick=performance.now();render();save()};
document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{if(!state)return;state.speed=Number(b.dataset.speed);render();save()});
$('helpBtn').onclick=showHelp;$('transcriptBtn').onclick=()=>state&&showTranscript();
$('statsInfoBtn').onclick=showStatsInfo;
$('dialogueLogBtn').onclick=showDialogueLog;
$('newBtn').onclick=()=>showIntro(!!state);
$('modalClose').onclick=closeModal;document.querySelector('.modal-scrim').onclick=closeModal;document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function closeMobileNav(){const menu=$('mobileNavMenu');menu.hidden=true;$('mobileNavToggle').setAttribute('aria-expanded','false')}
$('mobileNavToggle').onclick=()=>{const menu=$('mobileNavMenu');menu.hidden=!menu.hidden;$('mobileNavToggle').setAttribute('aria-expanded',String(!menu.hidden))};
document.querySelectorAll('[data-mobile-target]').forEach(button=>button.onclick=()=>{const target=$(button.dataset.mobileTarget);closeMobileNav();if(!target)return;const hud=document.querySelector('.quickbar');const top=window.scrollY+target.getBoundingClientRect().top-(hud?.getBoundingClientRect().height||0)-10;window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.focus({preventScroll:true})});
document.addEventListener('pointerdown',e=>{if(!$('mobileNav').contains(e.target))closeMobileNav()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileNav()});
function introSceneActors(){return {player:{gender:'หญิง',faculty:'คณะพยาบาลศาสตร์',avatar:0,sceneRole:'player'},companion:{gender:'ชาย',faculty:'คณะวิทยาศาสตร์และเทคโนโลยี',avatar:2,sceneRole:'companion'}}}
init();
