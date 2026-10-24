/* ============================================================
   ALTERA 에로 모드 (ero.js) — 독립 파일
   비밀번호: deca10  (일반 관리자: deca10x2)
   index.html 수정 시 이 파일은 절대 수정하지 마세요.
   Claude에게 "index.html만 고쳐줘"라고 하면 에로 모드는 그대로 유지됩니다.
   ============================================================ */
(function(){
'use strict';

function __eroInjectUI(){
  if (document.getElementById('eroModePanel')) return;
  var btn=document.createElement('button');
  btn.className='ero-toggle-btn';btn.id='eroToggleBtn';btn.title='에로 모드';btn.textContent='🔥';
  btn.style.display='none';
  btn.onclick=function(){if(window.toggleEroPanel)window.toggleEroPanel();};
  document.body.appendChild(btn);
  var panel=document.createElement('div');panel.id='eroModePanel';
  panel.innerHTML='<div class="ero-header"><div class="ero-title">에로 모드</div><button class="ero-close" type="button">✕</button></div><div class="ero-points-box"><span>에로 포인트</span><span class="ero-points-value" id="eroPointsDisplay">0</span></div><div class="ero-tabs"><div class="ero-tab active" data-etab="upgrade">강화</div><div class="ero-tab" data-etab="quest">에로 퀘스트</div><div class="ero-tab" data-etab="status">상태</div></div><div id="eroTabUpgrade"></div><div id="eroTabQuest" style="display:none"></div><div id="eroTabStatus" style="display:none"></div>';
  document.body.appendChild(panel);
  var cl=panel.querySelector('.ero-close');if(cl)cl.onclick=function(){if(window.toggleEroPanel)window.toggleEroPanel();};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',__eroInjectUI);
else __eroInjectUI();

var GS=window.gameState=window.gameState||{};
GS.eroModeUnlocked=!!GS.eroModeUnlocked;GS.eroPoints=GS.eroPoints||0;GS.eroLevels=GS.eroLevels||{};
GS.gender=GS.gender||'male';GS.completedQuests=GS.completedQuests||[];GS.questCooldowns=GS.questCooldowns||{};
GS.eroStats=GS.eroStats||{sensitivity:1,pheromone:1,charm:1,stamina:1,orgasmIntensity:1,recovery:1,cockSize:1,cockHardness:1,cockSensitivity:1,cumVolume:1,cumForce:1,precum:1,prostateSense:1,endurance:1,multiOrgasmM:0,breastSize:1,breastSensitivity:1,nippleSense:1,pussySensitivity:1,clitSense:1,wetness:1,tightness:1,gspot:1,squirting:0,multiOrgasmF:0,lactation:0,ahegao:0,bodyTremble:1};
try{var sv=localStorage.getItem('altera_ero_v1');if(sv){var o=JSON.parse(sv);delete o.gender;Object.assign(GS,o);}}catch(e){}

function syncGender(){
  try{
    var src=(typeof window!=='undefined'&&window.S&&window.S.gender)?window.S:(typeof S!=='undefined'&&S&&S.gender)?S:null;
    if(src&&src.gender){
      var g=String(src.gender);
      if(g.indexOf('여')>=0||/female|여자|여성/i.test(g)) GS.gender='female';
      else GS.gender='male';
    }
  }catch(e){}
  return GS.gender==='female'?'female':'male';
}

function saveEro(){try{localStorage.setItem('altera_ero_v1',JSON.stringify({eroModeUnlocked:GS.eroModeUnlocked,eroPoints:GS.eroPoints,eroLevels:GS.eroLevels,gender:GS.gender,completedQuests:GS.completedQuests,questCooldowns:GS.questCooldowns,eroStats:GS.eroStats}));}catch(e){}}
function U(id,n,m,d,ef){return{id:id,name:n,max:m,desc:d,effect:ef};}
var EM={
male:{cock:[U('cock_sensitivity','자지 민감도 극대화',12,'귀두와 자지 전체가 극도로 예민해진다.',function(l){return '민감도 +'+(l*15)+'%';}),U('cock_size','자지 크기 강화',10,'발기 시 길이와 굵기가 커진다.',function(l){return '크기 x'+(1+l*0.08).toFixed(2);}),U('cock_hardness','철봉 발기력',8,'발기한 자지가 돌처럼 단단해진다.',function(l){return '경도 +'+(l*12)+'%';}),U('cock_vein','혈관 발달',6,'혈관이 울끈불끈 도드라진다.',function(l){return '시각 +'+(l*14)+'%';}),U('cock_tip','귀두 과성장',7,'귀두가 커지고 민감해진다.',function(l){return '귀두 +'+(l*18)+'%';}),U('cock_curve','자지 휨',5,'자지가 휘어 G스팟을 때린다.',function(l){return '명중 +'+(l*10)+'%';}),U('cock_pulse','맥박 조절',5,'자지 맥박을 조절한다.',function(l){return '내부 조작';})],
cum:[U('cum_volume','정액량 폭발',12,'한 번 싸면 엄청난 양이 나온다.',function(l){return '정액량 x'+(1+l*0.2).toFixed(1);}),U('cum_force','분출 압력',9,'정액이 강하게 분출된다.',function(l){return '압력 +'+(l*16)+'%';}),U('cum_thick','정액 농도',7,'정액이 걸쭉해진다.',function(l){return '농도 +'+(l*13)+'%';}),U('cum_taste','정액 맛 개선',6,'맛이 덜 쓰고 중독성 있게 변한다.',function(l){return '거부감 -'+(l*12)+'%';}),U('precum','프리컴 홍수',8,'프리컴이 쉴 새 없이 흘러나온다.',function(l){return '프리컴 x'+(1+l*0.25).toFixed(1);}),U('cum_recovery','사정 후 회복',10,'싸자마자 다시 단단해진다.',function(l){return '회복 +'+(l*11)+'%';}),U('cum_mark','정액 마킹',5,'정액에 자신의 냄새가 밴다.',function(l){return '마킹 +'+(l*15)+'%';})],
prostate:[U('prostate_sense','전립선 각성',10,'전립선 자극만으로 강한 절정.',function(l){return '전립선 +'+(l*20)+'%';}),U('prostate_orgasm','전립선 오르가즘',6,'드라이 오르가즘 가능.',function(l){return '드라이 오르가즘';}),U('anal_sensitivity','항문 민감도',8,'항문이 성감대로 각성.',function(l){return '항문 +'+(l*17)+'%';})],
pheromone:[U('pheromone_male','수컷 페로몬',12,'주변 여자를 끌어당긴다.',function(l){return '유혹 +'+(l*7)+'%';}),U('musk','수컷 체취',7,'체취가 본능을 자극한다.',function(l){return '체취 +'+(l*13)+'%';}),U('voice_dom','지배 목소리',6,'복종시키고 싶게 만든다.',function(l){return '복종 +'+(l*14)+'%';}),U('eye_contact','최음 시선',5,'눈 마주치면 젖기 시작한다.',function(l){return '시선 +'+(l*16)+'%';})],
endurance:[U('endurance','사정 참기',12,'사정 직전에서도 오래 참는다.',function(l){return '임계점 +'+(l*10)+'%';}),U('multi_orgasm_m','연속 사정',8,'싸도 바로 또 싼다.',function(l){return '연속 +'+l+'회';}),U('stamina_sex','야수 스태미나',10,'몇 시간을 박아도 안 지친다.',function(l){return '스태미나 +'+(l*9)+'%';}),U('pain_to_pleasure','고통→쾌감',6,'고통이 쾌감으로 바뀐다.',function(l){return '변환 +'+(l*12)+'%';})],
special_m:[U('cock_control','자지 제어',5,'자지를 마음대로 움직인다.',function(l){return '내부 조작';}),U('heat_sense','흥분 감지',5,'상대 흥분을 느낀다.',function(l){return '흥분 감지';}),U('forced_ejac','강제 사정',4,'상대를 강제로 싸게 한다.',function(l){return '강제 절정';})]},
female:{breast:[U('breast_sensitivity','가슴 민감도',12,'유두와 유방이 성기 수준으로 예민.',function(l){return '가슴 민감 +'+(l*16)+'%';}),U('breast_size','가슴 과성장',10,'가슴이 무겁고 풍만해진다.',function(l){return '크기 x'+(1+l*0.09).toFixed(2);}),U('nipple_develop','유두 과민',9,'유두가 항상 서 있고 예민하다.',function(l){return '유두 +'+(l*22)+'%';}),U('breast_soft','유방 부드러움',7,'녹아내릴 것처럼 부드럽다.',function(l){return '촉감 +'+(l*14)+'%';}),U('lactation','모유 분비',8,'흥분하면 모유가 나온다.',function(l){return '모유 x'+(1+l*0.3).toFixed(1);}),U('breast_orgasm','가슴 오르가즘',6,'유두만으로 절정.',function(l){return '가슴 절정';})],
pussy:[U('pussy_sensitivity','보지 민감도',12,'음핵과 질이 극도로 예민.',function(l){return '보지 민감 +'+(l*18)+'%';}),U('clit_develop','음핵 과성장',9,'음핵이 커지고 돌출.',function(l){return '음핵 +'+(l*24)+'%';}),U('wetness','애액 홍수',11,'조금만 흥분해도 흘러내린다.',function(l){return '애액 x'+(1+l*0.28).toFixed(1);}),U('tightness','조임 악마',10,'강하게 조여 바로 싸버릴 정도.',function(l){return '조임 +'+(l*15)+'%';}),U('gspot','G스팟 각성',9,'G스팟만 자극해도 분수.',function(l){return 'G스팟 +'+(l*20)+'%';}),U('depth','자궁구 민감',7,'자궁 입구까지 성감대.',function(l){return '심부 +'+(l*17)+'%';}),U('cervix_kiss','자궁 키스',5,'자궁에 닿을 때마다 경련.',function(l){return '자궁 자극';})],
orgasm:[U('orgasm_multi','연속 오르가즘',12,'끝없이 연달아 절정.',function(l){return '연속 +'+l+'회';}),U('orgasm_intensity','절정 강도',10,'눈이 풀리고 의식을 잃을 수도.',function(l){return '강도 +'+(l*16)+'%';}),U('squirting','분수 체질',9,'절정마다 분수처럼 뿜는다.',function(l){return '분수 +'+(l*11)+'%';}),U('ahegao','아헤가오',7,'자동으로 아헤가오.',function(l){return '아헤가오';}),U('body_tremble','전신 경련',8,'온몸이 크게 떤다.',function(l){return '경련 +'+(l*18)+'%';}),U('incontinence','실금 체질',5,'방광 조절이 안 된다.',function(l){return '실금 +'+(l*9)+'%';})],
pheromone_f:[U('pheromone_female','암컷 페로몬',12,'남자 이성을 날린다.',function(l){return '유혹 +'+(l*8)+'%';}),U('scent_heat','발정 체향',8,'흥분 냄새가 자극한다.',function(l){return '발정 +'+(l*14)+'%';}),U('voice_sweet','신음 목소리',7,'신음이 상대를 거칠게 만든다.',function(l){return '신음 +'+(l*13)+'%';}),U('eye_beg','애원 눈빛',6,'올려다보면 박아달라는 신호.',function(l){return '애원 +'+(l*15)+'%';})],
special_f:[U('heat_cycle','강제 발정',7,'주기적으로 참을 수 없는 발정.',function(l){return '발정 상태';}),U('sensitive_whole','전신 성감대',8,'목·귀·허벅지까지 성감대.',function(l){return '전신 예민화';}),U('milk_play','수유 특화',5,'수유 섹스가 특히 강하다.',function(l){return '수유 쾌감';}),U('forced_orgasm','강제 절정',6,'자극받으면 절로 절정.',function(l){return '강제 절정';})]}};
function Q(id,t,d,h,k,r,ty,cd){return{id:id,title:t,desc:d,hint:h,keys:k,reward:r,type:ty||'repeatable',cooldown:cd||0};}
var EQ=[
Q('q_masturbate_public','공중화장실 자위','사람이 있는 공중화장실에서 자위·사정/절정.','NPC에게 화장실에서 자위했다고 말하세요',['화장실','자위','공중화장실','싸버렸'],25,'repeatable',2),
Q('q_edge_30min','30분 엣지','절정 직전까지 갔다가 참고 30분 반복.','엣지/참았다고 말하세요',['엣지','참았','참기','30분'],40,'repeatable',1),
Q('q_mirror_mast','거울 앞 자위','전신 거울 앞에서 자위.','거울 앞에서 자위했다고 말하세요',['거울','자위'],20,'repeatable',1),
Q('q_outdoor_flash','야외 노출','야외에서 가슴/성기 노출.','밖에서 노출했다고 말하세요',['노출','보여줬','야외','밖에서'],45,'repeatable',3),
Q('q_no_panties','노팬티 외출','속옷 없이 1시간 이상 외출.','팬티 안 입고 나갔다고 말하세요',['노팬티','팬티 없이','속옷 없이','안 입고'],35,'repeatable',2),
Q('q_outdoor_sex','야외 섹스','공원·옥상·차 안 삽입 섹스.','야외/밖에서 했다고 말하세요',['야외 섹스','밖에서 했어','공원에서','차에서 했어','옥상'],90,'repeatable',5),
Q('q_semi_public_sex','반공공 섹스','사람이 올 수 있는 장소에서 섹스.','화장실/계단에서 했다고 말하세요',['화장실에서','계단에서','영화관','사람 오는'],80,'repeatable',4),
Q('q_night_park','밤공원 섹스','밤에 공원에서 섹스.','밤 공원에서 했다고 말하세요',['밤 공원','공원에서 밤','벤치에서'],70,'repeatable',4),
Q('q_rape_role','강간 롤플레이','강간 연기하며 거친 섹스.','강제/억지로/강간 플레이했다고 말하세요',['강간','강제','억지로','저항'],100,'repeatable',6),
Q('q_threesome','3P','3명 섹스.','셋이서/3P 했다고 말하세요',['3p','셋이서','삼인','쓰리섬'],120,'repeatable',7),
Q('q_group','난교','4명 이상 섹스.','난교/여러 명 했다고 말하세요',['난교','여러 명','단체','4명'],180,'once',0),
Q('q_anal_first','애널 첫경험','애널 첫 삽입.','애널/뒤로 했다고 말하세요',['애널','뒤로','항문'],60,'once',0),
Q('q_creampie','질내 사정','피임 없이 질내 사정.','안에 싸다고 말하세요',['안에 싸','질내','중출','안에 발사'],55,'repeatable',2),
Q('q_facial','안면사정','얼굴에 정액.','얼굴에 싸다고 말하세요',['얼굴에','안면','얼굴 사정'],40,'repeatable',2),
Q('q_swallow','정액 삼키기','정액 전부 삼킴.','삼켰다고 말하세요',['삼켰','마셨','정액 삼'],35,'repeatable',1),
Q('q_milk_sex','수유 섹스','모유 나오며 수유 섹스.','수유/모유 했다고 말하세요',['수유','모유','젖 먹'],70,'repeatable',4),
Q('q_public_orgasm','공공 절정','사람 있는 곳에서 참고 절정.','밖에서 가버렸다고 말하세요',['밖에서 가버','공공','참고 절정','사람 앞에서'],65,'repeatable',3),
Q('q_slave_day','하루 노예','하루 종일 성노예.','노예/복종했다고 말하세요',['노예','복종','주인'],95,'repeatable',7),
Q('q_pet_play','펫 플레이','개/고양이처럼 행동.','펫/강아지처럼 했다고 말하세요',['펫','강아지','고양이처럼','펫플'],60,'repeatable',4),
Q('q_bondage','구속 플레이','손발 묶인 채 섹스.','묶/구속했다고 말하세요',['묶','구속','포박','결박'],50,'repeatable',3),
Q('q_camera','촬영 섹스','사진/영상 찍으며 섹스.','촬영/찍으면서 했다고 말하세요',['촬영','찍으면서','영상으로','사진 찍'],55,'repeatable',3),
Q('q_stranger','모르는 사람과','거의 처음 본 사람과 섹스.','모르는 사람이랑 했다고 말하세요',['모르는 사람','처음 본','낯선'],100,'repeatable',8),
Q('q_office','직장/학교 섹스','직장·학교 장소에서 섹스.','학교/직장에서 했다고 말하세요',['학교에서','직장에서','사무실','교실'],85,'repeatable',5),
Q('q_multiple_day','하루 5회 이상','하루 사정/절정 5회 이상.','다섯 번 싸다고 말하세요',['다섯 번','5번','여러 번 싸','하루 종일'],70,'repeatable',2)
];
function applyEroEffects(){var lv=function(id){return GS.eroLevels[id]||0;},s=GS.eroStats;s.sensitivity=1;s.pheromone=1;s.charm=1;s.stamina=1;s.orgasmIntensity=1;s.recovery=1;s.cockSize=1;s.cockHardness=1;s.cockSensitivity=1;s.cumVolume=1;s.cumForce=1;s.precum=1;s.prostateSense=1;s.endurance=1;s.multiOrgasmM=0;s.breastSize=1;s.breastSensitivity=1;s.nippleSense=1;s.pussySensitivity=1;s.clitSense=1;s.wetness=1;s.tightness=1;s.gspot=1;s.squirting=0;s.multiOrgasmF=0;s.lactation=0;s.ahegao=0;s.bodyTremble=1;s.cockSensitivity+=lv('cock_sensitivity')*0.15;s.cockSize+=lv('cock_size')*0.08;s.cockHardness+=lv('cock_hardness')*0.12;s.cumVolume+=lv('cum_volume')*0.2;s.cumForce+=lv('cum_force')*0.16;s.precum+=lv('precum')*0.25;s.recovery+=lv('cum_recovery')*0.11;s.prostateSense+=lv('prostate_sense')*0.2;s.endurance+=lv('endurance')*0.1;s.stamina+=lv('stamina_sex')*0.09;s.multiOrgasmM=lv('multi_orgasm_m');s.pheromone+=lv('pheromone_male')*0.07;s.charm+=lv('musk')*0.13+lv('voice_dom')*0.14;s.breastSensitivity+=lv('breast_sensitivity')*0.16;s.breastSize+=lv('breast_size')*0.09;s.nippleSense+=lv('nipple_develop')*0.22;s.pussySensitivity+=lv('pussy_sensitivity')*0.18;s.clitSense+=lv('clit_develop')*0.24;s.wetness+=lv('wetness')*0.28;s.tightness+=lv('tightness')*0.15;s.gspot+=lv('gspot')*0.2;s.orgasmIntensity+=lv('orgasm_intensity')*0.16;s.multiOrgasmF=lv('orgasm_multi');s.squirting=lv('squirting');s.ahegao=lv('ahegao');s.bodyTremble+=lv('body_tremble')*0.18;s.lactation=lv('lactation');s.pheromone+=lv('pheromone_female')*0.08;s.charm+=lv('scent_heat')*0.14+lv('voice_sweet')*0.13;s.sensitivity=1+(s.cockSensitivity-1)+(s.pussySensitivity-1)+(s.breastSensitivity-1)*0.5;}
window.setEroPoints=function(v){GS.eroPoints=Math.max(0,v|0);saveEro();var el=document.getElementById('eroPointsDisplay');if(el)el.textContent=GS.eroPoints;};
window.grantEroPoints=function(v){GS.eroPoints=(GS.eroPoints||0)+(v|0);saveEro();var el=document.getElementById('eroPointsDisplay');if(el)el.textContent=GS.eroPoints;};
window.unlockEroMode=function(){GS.eroModeUnlocked=true;saveEro();var btn=document.getElementById('eroToggleBtn');if(btn)btn.style.display='block';alert('에로 모드 해금 (비밀번호 deca10)\n오른쪽 아래 🔥 버튼을 누르세요.');};
window.toggleEroPanel=function(){if(!GS.eroModeUnlocked){alert('해금 안 됨. 명령창에 deca10 을 입력하세요');return;}var panel=document.getElementById('eroModePanel');if(!panel)return;panel.style.display=panel.style.display==='block'?'none':'block';if(panel.style.display==='block'){syncGender();document.getElementById('eroPointsDisplay').textContent=GS.eroPoints;ru();}};
function switchEroTab(tab){document.querySelectorAll('.ero-tab').forEach(function(t){t.classList.toggle('active',t.getAttribute('data-etab')===tab);});document.getElementById('eroTabUpgrade').style.display=tab==='upgrade'?'block':'none';document.getElementById('eroTabQuest').style.display=tab==='quest'?'block':'none';document.getElementById('eroTabStatus').style.display=tab==='status'?'block':'none';if(tab==='upgrade')ru();if(tab==='quest')rq();if(tab==='status')rs();}
document.addEventListener('click',function(e){var t=e.target.closest('.ero-tab');if(t)switchEroTab(t.getAttribute('data-etab'));});
function ru(){var c=document.getElementById('eroTabUpgrade');if(!c)return;var g=syncGender(),d=EM[g],names={cock:'자지 관련',cum:'사정 / 정액',prostate:'전립선 / 항문',pheromone:'페로몬 / 매력',endurance:'지구력 / 감각',special_m:'특수 능력',breast:'가슴 관련',pussy:'보지 / 하체',orgasm:'절정 / 신체 반응',pheromone_f:'페로몬 / 매력',special_f:'특수 능력'},h='';Object.keys(d).forEach(function(cat){h+='<div class="ero-section-title">'+(names[cat]||cat)+'</div>';d[cat].forEach(function(u){var lv=GS.eroLevels[u.id]||0,mx=lv>=u.max,cost=8+lv*4;h+='<div class="ero-card"><div class="ero-card-header"><div><span class="ero-name">'+u.name+'</span> <span class="ero-level">Lv.'+lv+'/'+u.max+'</span></div><button class="ero-btn" data-upg="'+u.id+'" '+(mx?'disabled':'')+'>'+(mx?'MAX':cost+'P')+'</button></div><div class="ero-desc">'+u.desc+'</div><div class="ero-effect">효과: '+u.effect(lv)+'</div></div>';});});c.innerHTML=h;c.querySelectorAll('[data-upg]').forEach(function(b){b.onclick=function(){up(b.getAttribute('data-upg'));};});}
function up(id){var g=syncGender(),t=null;Object.keys(EM[g]).forEach(function(cat){EM[g][cat].forEach(function(u){if(u.id===id)t=u;});});if(!t)return;var lv=GS.eroLevels[id]||0;if(lv>=t.max)return;var cost=8+lv*4;if(GS.eroPoints<cost){alert('에로P 부족 (필요 '+cost+')');return;}GS.eroPoints-=cost;GS.eroLevels[id]=lv+1;applyEroEffects();document.getElementById('eroPointsDisplay').textContent=GS.eroPoints;ru();saveEro();}
function rq(){var c=document.getElementById('eroTabQuest');if(!c)return;var h='<div style="font-size:11px;color:#ff8fa3;margin-bottom:10px;line-height:1.5">NPC와 채팅하며 해당 행동/말을 하면 자동 완료됩니다.<br>완료 버튼 없음.</div>';EQ.forEach(function(q){var done=q.type==='once'&&GS.completedQuests.indexOf(q.id)>=0,cd=GS.questCooldowns[q.id]&&GS.questCooldowns[q.id]>Date.now(),st=done?'✓ 완료':(cd?'쿨타임 '+Math.ceil((GS.questCooldowns[q.id]-Date.now())/3600000)+'h':'진행 가능');h+='<div class="quest-card"><div class="quest-title">'+q.title+'</div><div class="quest-desc">'+q.desc+'</div><div class="quest-hint">💬 '+q.hint+'</div><div class="quest-reward">보상 +'+q.reward+'P</div><div class="quest-status">'+st+'</div></div>';});c.innerHTML=h;}
window.checkEroQuestFromChat=function(text,npc){if(!GS.eroModeUnlocked||!text)return;var low=text.toLowerCase().replace(/\s+/g,''),done=[];EQ.forEach(function(q){if(q.type==='once'&&GS.completedQuests.indexOf(q.id)>=0)return;if(GS.questCooldowns[q.id]&&GS.questCooldowns[q.id]>Date.now())return;var hit=false;for(var i=0;i<q.keys.length;i++){if(low.indexOf(q.keys[i].toLowerCase().replace(/\s+/g,''))>=0){hit=true;break;}}if(!hit)return;GS.eroPoints+=q.reward;if(q.type==='once')GS.completedQuests.push(q.id);if(q.cooldown)GS.questCooldowns[q.id]=Date.now()+q.cooldown*3600000;done.push(q.title+' (+'+q.reward+'P)');});if(done.length){applyEroEffects();saveEro();var el=document.getElementById('eroPointsDisplay');if(el)el.textContent=GS.eroPoints;try{if(typeof sys==='function')sys(['에로 퀘스트 완료'].concat(done),'SYSTEM');else alert('에로 퀘스트 완료!\n'+done.join('\n'));}catch(e){alert('에로 퀘스트 완료!\n'+done.join('\n'));}}};
function rs(){var s=GS.eroStats,g=syncGender(),h='<div class="ero-section-title">현재 에로 스탯</div><div class="ero-card"><b>공통</b><br>민감도 x'+s.sensitivity.toFixed(2)+'<br>페로몬 x'+s.pheromone.toFixed(2)+'<br>매력 x'+s.charm.toFixed(2)+'<br>스태미나 x'+s.stamina.toFixed(2)+'<br>절정강도 x'+s.orgasmIntensity.toFixed(2)+'<br>회복 x'+s.recovery.toFixed(2)+'</div>';if(g==='male')h+='<div class="ero-card"><b>남성</b><br>자지크기 x'+s.cockSize.toFixed(2)+'<br>발기력 x'+s.cockHardness.toFixed(2)+'<br>자지민감 x'+s.cockSensitivity.toFixed(2)+'<br>정액량 x'+s.cumVolume.toFixed(2)+'<br>분출 x'+s.cumForce.toFixed(2)+'<br>프리컴 x'+s.precum.toFixed(2)+'<br>전립선 x'+s.prostateSense.toFixed(2)+'<br>지구력 x'+s.endurance.toFixed(2)+'<br>연속사정 +'+s.multiOrgasmM+'</div>';else h+='<div class="ero-card"><b>여성</b><br>가슴크기 x'+s.breastSize.toFixed(2)+'<br>가슴민감 x'+s.breastSensitivity.toFixed(2)+'<br>유두 x'+s.nippleSense.toFixed(2)+'<br>보지민감 x'+s.pussySensitivity.toFixed(2)+'<br>음핵 x'+s.clitSense.toFixed(2)+'<br>애액 x'+s.wetness.toFixed(2)+'<br>조임 x'+s.tightness.toFixed(2)+'<br>G스팟 x'+s.gspot.toFixed(2)+'<br>분수 '+s.squirting+'<br>연속절정 +'+s.multiOrgasmF+'<br>모유 '+s.lactation+'<br>아헤가오 '+s.ahegao+'<br>경련 x'+s.bodyTremble.toFixed(2)+'</div>';document.getElementById('eroTabStatus').innerHTML=h;}
setInterval(function(){syncGender();var btn=document.getElementById('eroToggleBtn');if(btn)btn.style.display=GS.eroModeUnlocked?'block':'none';},1000);
if(GS.eroModeUnlocked){var b=document.getElementById('eroToggleBtn');if(b)b.style.display='block';}
syncGender();
})();
