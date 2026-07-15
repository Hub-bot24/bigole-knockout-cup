const DATA_URL='data/live.json';
const REFRESH_MS=60_000;

function seedsFrom(data){
  return [...data.standings]
    .filter(x=>x.coach.toLowerCase()!==data.excludedCoach.toLowerCase())
    .sort((a,b)=>b.leaguePoints-a.leaguePoints||b.totalPoints-a.totalPoints)
    .slice(0,8).map((x,i)=>({...x,seed:i+1}));
}
function byTeam(seeds,name){return seeds.find(x=>x.team===name)||null}
function result(match,seeds){
  if(!match)return{a:null,b:null,status:'waiting',winner:null,scores:null};
  return{a:byTeam(seeds,match.a),b:byTeam(seeds,match.b),status:match.status||'waiting',winner:match.winner||null,scores:match.scores||null};
}
function scoreFor(team,match,side){
  if(!team)return null;
  if(match?.scores && Number.isFinite(match.scores[side]))return match.scores[side];
  if(Number.isFinite(team.roundScore))return team.roundScore;
  return 0;
}
function valueFor(team,week,match,side){
  if(!team)return'—';
  if(week===1)return`${team.leaguePoints}<small>pts</small>`;
  const value=scoreFor(team,match,side);
  return value>0?String(value):'—';
}
function teamRow(team,week,data,match,side,winner,loser){
  if(!team)return`<div class="team"><div class="seed">–</div><div class="copy"><div class="name pending">TBD</div><div class="coach">Waiting for result</div></div><div class="score pending">—</div></div>`;
  const isWinner=winner===team.team,isLoser=loser===team.team;
  return`<div class="team active ${isWinner?'winner':''} ${isLoser?'loser':''}"><div class="seed">${team.seed??'–'}</div><div class="copy"><div class="name">${team.team}</div><div class="coach">${team.coach}</div></div><div class="score ${isWinner?'lead':''}">${valueFor(team,week,match,side)}</div></div>`;
}
function card({className,label,type='',route='',a,b,data,status='waiting',winner=null,week,match}){
  const loser=winner&&a&&b?(winner===a.team?b.team:a.team):null;
  const state=status==='final'?'FINAL':status==='live'?'LIVE':'';
  return`<article class="match ${className} ${type} ${status==='final'?'complete':''}"><div class="match-label"><span>${label}</span>${route?`<span class="route ${type==='qualifying'?'skip':'out'}">${route}</span>`:''}${state?`<span class="state ${status}">${state}</span>`:''}</div>${teamRow(a,week,data,match,'a',winner,loser)}${teamRow(b,week,data,match,'b',winner,loser)}</article>`;
}
function render(data){
  const s=seedsFrom(data),[s1,s2,s3,s4,s5,s6,s7,s8]=s,m=data.finals?.matches||{};
  const qf1=result(m.qf1,s),ef1=result(m.ef1,s),ef2=result(m.ef2,s),qf2=result(m.qf2,s),sf1=result(m.sf1,s),sf2=result(m.sf2,s),pf1=result(m.pf1,s),pf2=result(m.pf2,s),gf=result(m.gf,s);
  document.getElementById('bracket').innerHTML=`
  <section class="round w1"><div class="round-title">Week 1 <small>League points shown</small></div>
    ${card({className:'m1',label:'Qualifying Final 1',type:'qualifying',route:'WIN → W3 · LOSE → W2',a:qf1.a||s1,b:qf1.b||s4,data,status:qf1.status,winner:qf1.winner,week:1,match:qf1})}
    ${card({className:'m2',label:'Elimination Final 1',type:'elimination',route:'WIN → W2 · LOSE OUT',a:ef1.a||s5,b:ef1.b||s8,data,status:ef1.status,winner:ef1.winner,week:1,match:ef1})}
    ${card({className:'m3',label:'Elimination Final 2',type:'elimination',route:'WIN → W2 · LOSE OUT',a:ef2.a||s6,b:ef2.b||s7,data,status:ef2.status,winner:ef2.winner,week:1,match:ef2})}
    ${card({className:'m4',label:'Qualifying Final 2',type:'qualifying',route:'WIN → W3 · LOSE → W2',a:qf2.a||s2,b:qf2.b||s3,data,status:qf2.status,winner:qf2.winner,week:1,match:qf2})}
  </section>
  <section class="round w2"><div class="round-title">Week 2 <small>Round score</small></div>
    ${card({className:'m1',label:'Semi Final 1',a:sf1.a,b:sf1.b,data,status:sf1.status,winner:sf1.winner,week:2,match:sf1})}
    ${card({className:'m2',label:'Semi Final 2',a:sf2.a,b:sf2.b,data,status:sf2.status,winner:sf2.winner,week:2,match:sf2})}
  </section>
  <section class="round w3"><div class="round-title">Week 3 <small>Top-4 winners return</small></div>
    ${card({className:'m1',label:'Preliminary Final 1',a:pf1.a,b:pf1.b,data,status:pf1.status,winner:pf1.winner,week:3,match:pf1})}
    ${card({className:'m2',label:'Preliminary Final 2',a:pf2.a,b:pf2.b,data,status:pf2.status,winner:pf2.winner,week:3,match:pf2})}
  </section>
  <section class="round w4"><div class="round-title">Week 4 <small>Grand Final</small></div>
    ${card({className:'m1',label:'Grand Final',a:gf.a,b:gf.b,data,status:gf.status,winner:gf.winner,week:4,match:gf})}
  </section>`;
  document.getElementById('roundBadge').textContent=`ROUND ${data.round??'—'}`;
  const state=document.getElementById('feedState');
  state.className=data.roundStatus==='FINAL'?'final':data.sourceStatus==='live'?'live':'';
  state.textContent=data.phase==='regular'?'LADDER':data.roundStatus==='FINAL'?'FINAL':'PROVISIONAL';
}
async function loadData(){
  try{const r=await fetch(`${DATA_URL}?t=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(r.status);render(await r.json())}
  catch(e){const s=document.getElementById('feedState');s.className='error';s.textContent='DATA ERROR';console.error(e)}
}
async function landscape(){try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();if(screen.orientation?.lock)await screen.orientation.lock('landscape')}catch{}}
document.getElementById('landscapeButton')?.addEventListener('click',landscape);
loadData();setInterval(loadData,REFRESH_MS);
