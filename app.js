const DATA_URL = 'data/live.json';
const REFRESH_MS = 60_000;
let currentData = null;

function seedsFrom(data) {
  return [...data.standings]
    .filter(x => x.coach.toLowerCase() !== data.excludedCoach.toLowerCase())
    .sort((a,b) => b.leaguePoints - a.leaguePoints || b.totalPoints - a.totalPoints)
    .slice(0,8)
    .map((x,i) => ({...x, seed:i+1}));
}

function scoreFor(team, data) {
  if (!team) return '—';
  return data.phase === 'regular' ? `${team.leaguePoints}<span class="unit">pts</span>` : `${team.roundScore ?? 0}`;
}

function teamRow(team, data, winnerName = null, loserName = null) {
  if (!team) return `<div class="team"><div class="rank">–</div><div class="team-copy"><div class="team-name pending">TBD</div><div class="coach">Waiting for result</div></div><div class="score pending">—</div></div>`;
  const winner = winnerName === team.team;
  const loser = loserName === team.team;
  return `<div class="team current ${winner?'winner':''} ${loser?'loser':''}">
    <div class="rank">${team.seed ?? '–'}</div>
    <div class="team-copy"><div class="team-name">${team.team}</div><div class="coach">${team.coach}</div><div class="team-meta">${data.phase==='regular' ? `${team.totalPoints.toLocaleString()} total` : 'Current round score'}</div></div>
    <div class="score ${winner?'leading':''}">${scoreFor(team,data)}</div>
  </div>`;
}

function matchCard({className,label,badge='',a=null,b=null,data,status='waiting',winner=null}) {
  const loser = winner && a && b ? (winner===a.team ? b.team : a.team) : null;
  return `<article class="match ${className} ${status==='final'?'complete':''}">
    <div class="match-label"><span>${label}</span>${badge?`<span class="chance">${badge}</span>`:''}<span class="status-pill ${status}">${status}</span></div>
    ${teamRow(a,data,winner,loser)}${teamRow(b,data,winner,loser)}
  </article>`;
}

function byTeam(seeds,name){ return seeds.find(x=>x.team===name) || null; }
function result(match,seeds){
  if(!match) return {a:null,b:null,status:'waiting',winner:null};
  const a = byTeam(seeds,match.a), b = byTeam(seeds,match.b);
  return {a,b,status:match.status||'waiting',winner:match.winner||null};
}

function render(data){
  currentData = data;
  const s = seedsFrom(data);
  const [s1,s2,s3,s4,s5,s6,s7,s8]=s;
  const m=data.finals?.matches||{};
  const qf1=result(m.qf1,s), ef1=result(m.ef1,s), ef2=result(m.ef2,s), qf2=result(m.qf2,s);
  const sf1=result(m.sf1,s), sf2=result(m.sf2,s), pf1=result(m.pf1,s), pf2=result(m.pf2,s), gf=result(m.gf,s);
  document.getElementById('bracket').innerHTML=`
    <section class="round w1"><div class="round-title">Week 1</div>
      ${matchCard({className:'m1',label:'Qualifying Final 1',badge:'Double chance',a:qf1.a||s1,b:qf1.b||s4,data,status:qf1.status,winner:qf1.winner})}
      ${matchCard({className:'m2',label:'Elimination Final 1',badge:'Lose = out',a:ef1.a||s5,b:ef1.b||s8,data,status:ef1.status,winner:ef1.winner})}
      ${matchCard({className:'m3',label:'Elimination Final 2',badge:'Lose = out',a:ef2.a||s6,b:ef2.b||s7,data,status:ef2.status,winner:ef2.winner})}
      ${matchCard({className:'m4',label:'Qualifying Final 2',badge:'Double chance',a:qf2.a||s2,b:qf2.b||s3,data,status:qf2.status,winner:qf2.winner})}
    </section>
    <section class="round w2"><div class="round-title">Week 2</div>
      ${matchCard({className:'m1',label:'Semi Final 1',a:sf1.a,b:sf1.b,data,status:sf1.status,winner:sf1.winner})}
      ${matchCard({className:'m2',label:'Semi Final 2',a:sf2.a,b:sf2.b,data,status:sf2.status,winner:sf2.winner})}
    </section>
    <section class="round w3"><div class="round-title">Week 3</div>
      ${matchCard({className:'m1',label:'Preliminary Final 1',a:pf1.a,b:pf1.b,data,status:pf1.status,winner:pf1.winner})}
      ${matchCard({className:'m2',label:'Preliminary Final 2',a:pf2.a,b:pf2.b,data,status:pf2.status,winner:pf2.winner})}
    </section>
    <section class="round w4"><div class="round-title">Week 4</div>
      ${matchCard({className:'m1',label:'Grand Final',a:gf.a,b:gf.b,data,status:gf.status,winner:gf.winner})}
    </section>`;
  const champion=gf.winner;
  document.getElementById('championName').textContent=champion||'Champion waiting';
  document.getElementById('championText').textContent=champion ? `${champion} are the BIGOLE Knockout Cup champions.` : 'The winner of Week 4 will light up this card.';
  const state=document.getElementById('feedState');
  state.className='feed-state'+(data.sourceStatus==='live'?'':' offline');
  state.textContent=data.sourceStatus==='live' ? `Live · Round ${data.round}` : `Snapshot · Round ${data.round}`;
  document.getElementById('updatedAt').textContent=`Updated ${new Date(data.updatedAt).toLocaleString()}`;
}

async function loadData(){
  const state=document.getElementById('feedState');
  try{
    const res=await fetch(`${DATA_URL}?t=${Date.now()}`,{cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    render(await res.json());
  }catch(err){
    state.className='feed-state error'; state.textContent='Data unavailable';
    console.error(err);
  }
}

async function requestLandscape(){
  try{
    if(!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    if(screen.orientation?.lock) await screen.orientation.lock('landscape');
  }catch{}
}

document.getElementById('landscapeButton')?.addEventListener('click',requestLandscape);
loadData(); setInterval(loadData,REFRESH_MS);
