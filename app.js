const DATA_URL='data/live.json';
const REFRESH_MS=60_000;

const positions={qf1:'qf1',ef1:'ef1',ef2:'ef2',qf2:'qf2',sf1:'sf1',sf2:'sf2',pf1:'pf1',pf2:'pf2',gf:'grand'};

function fitStage(){
  const stage=document.getElementById('stage');
  const scale=Math.min(window.innerWidth/1792,window.innerHeight/832);
  stage.style.transform=`scale(${scale})`;
}
window.addEventListener('resize',fitStage);window.addEventListener('orientationchange',fitStage);fitStage();

function seedsFrom(data){
  const excluded=String(data.excludedCoach||'').toLowerCase();
  return [...(data.standings||[])]
    .filter(x=>String(x.coach||'').toLowerCase()!==excluded)
    .sort((a,b)=>(b.leaguePoints||0)-(a.leaguePoints||0)||(b.totalPoints||0)-(a.totalPoints||0))
    .slice(0,8).map((x,i)=>({...x,seed:i+1}));
}
function byTeam(seeds,name){return seeds.find(x=>x.team===name)||null}
function resolved(match,seeds){
  if(!match)return{a:null,b:null,status:'waiting',winner:null,scores:null};
  return{a:byTeam(seeds,match.a),b:byTeam(seeds,match.b),status:match.status||'waiting',winner:match.winner||null,scores:match.scores||null};
}
function scoreFor(team,week,match,side){
  if(!team)return'—';
  if(week===1)return`${team.leaguePoints??0}<small>PTS</small>`;
  const v=match?.scores?.[side] ?? team.roundScore ?? 0;
  return Number(v)>0?String(v):'—';
}
function row(team,week,match,side,winner){
  if(!team)return`<div class="team"><div class="seed">–</div><div class="team-name pending">TBD</div><div class="team-score pending">—</div></div>`;
  const loser=winner&&winner!==team.team;
  return`<div class="team ${winner===team.team?'winner':''} ${loser?'loser':''}"><div class="seed">${team.seed??'–'}</div><div class="team-name">${team.team}</div><div class="team-score">${scoreFor(team,week,match,side)}</div></div>`;
}
function card(id,label,type,a,b,week,match){
  const small=week>1?' small':'';
  const gf=id==='gf'?' gf':'';
  const pill=type==='qualifying'?'DOUBLE CHANCE':type==='elimination'?'LOSE = OUT':'';
  return`<article class="match ${positions[id]} ${type||''}${small}${gf}"><div class="match-title"><span>${label}</span>${pill?`<span class="pill">${pill}</span>`:''}</div>${row(a,week,match,'a',match.winner)}${row(b,week,match,'b',match.winner)}</article>`;
}
function render(data){
  const s=seedsFrom(data),[s1,s2,s3,s4,s5,s6,s7,s8]=s,m=data.finals?.matches||{};
  const qf1=resolved(m.qf1,s),ef1=resolved(m.ef1,s),ef2=resolved(m.ef2,s),qf2=resolved(m.qf2,s),sf1=resolved(m.sf1,s),sf2=resolved(m.sf2,s),pf1=resolved(m.pf1,s),pf2=resolved(m.pf2,s),gf=resolved(m.gf,s);
  document.getElementById('cards').innerHTML=[
    card('qf1','Qualifying Final 1','qualifying',qf1.a||s1,qf1.b||s4,1,qf1),
    card('ef1','Elimination Final 1','elimination',ef1.a||s5,ef1.b||s8,1,ef1),
    card('ef2','Elimination Final 2','elimination',ef2.a||s6,ef2.b||s7,1,ef2),
    card('qf2','Qualifying Final 2','qualifying',qf2.a||s2,qf2.b||s3,1,qf2),
    card('sf1','Semi Final 1','',sf1.a,sf1.b,2,sf1),
    card('sf2','Semi Final 2','',sf2.a,sf2.b,2,sf2),
    card('pf1','Preliminary Final 1','',pf1.a,pf1.b,3,pf1),
    card('pf2','Preliminary Final 2','',pf2.a,pf2.b,3,pf2),
    card('gf','Grand Final','',gf.a,gf.b,4,gf)
  ].join('');
  document.getElementById('roundBadge').textContent=`ROUND ${data.round??'—'}`;
  const state=document.getElementById('feedState');
  state.className=data.roundStatus==='FINAL'?'final':data.sourceStatus==='live'?'live':'';
  state.textContent=data.phase==='regular'?'LADDER':data.roundStatus==='FINAL'?'FINAL':'PROVISIONAL';
  document.getElementById('championName').textContent=m.gf?.status==='final'&&m.gf?.winner?m.gf.winner:'TBD';
  const d=data.updatedAt?new Date(data.updatedAt):null;
  document.getElementById('updatedAt').textContent=d&&!Number.isNaN(d.valueOf())?`UPDATED ${d.toLocaleString()}`:'WAITING FOR DATA';
}
async function loadData(){
  try{
    const r=await fetch(`${DATA_URL}?t=${Date.now()}`,{cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    render(await r.json());
  }catch(e){
    const s=document.getElementById('feedState');s.className='error';s.textContent='DATA ERROR';console.error(e);
  }
}
async function landscape(){try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();if(screen.orientation?.lock)await screen.orientation.lock('landscape')}catch{}}
document.getElementById('landscapeButton')?.addEventListener('click',landscape);
loadData();setInterval(loadData,REFRESH_MS);
