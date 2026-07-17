const seedOrder=[1,4,5,8,6,7,2,3];
const cardYs=[46,112,180,246,316,382,450,516];
const vsYs=[108,240,374,510];

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function makeSeedCard(team,seed,y){
  return `<g class="seed-card" transform="translate(14 ${y})">
    <rect class="seed-box" width="46" height="54" rx="4"/>
    <rect class="team-box" x="46" width="194" height="54" rx="4"/>
    <text class="seed-num" x="23" y="35" text-anchor="middle">${seed}</text>
    <text class="team-name" x="58" y="22">${esc(team.team)}</text>
    <text class="coach" x="58" y="41">${esc(team.coach)}</text>
    <text class="points" x="217" y="31" text-anchor="end">${team.leaguePoints ?? 0}</text>
    <text class="pts" x="231" y="31" text-anchor="end">PTS</text>
  </g>`;
}

function setSlot(matchKey,index,data){
  const match=document.querySelector(`[data-match="${matchKey}"]`); if(!match)return;
  const slot=match.querySelectorAll('.slot')[index]; if(!slot)return;
  slot.querySelector('.slot-team').textContent=data?.team||'TBD';
  slot.querySelector('.slot-score').textContent=Number.isFinite(data?.score)?data.score:'—';
}

function normaliseMatch(m){
  if(!m)return [null,null];
  if(Array.isArray(m.teams)) return m.teams.map(x=>({team:x.team||x.name,score:x.roundScore??x.score}));
  return [m.home,m.away].map(x=>x?({team:x.team||x.name,score:x.roundScore??x.score}):null);
}

async function load(){
  const res=await fetch(`data/live.json?t=${Date.now()}`,{cache:'no-store'});
  if(!res.ok) throw new Error('live.json failed');
  const d=await res.json();
  const excluded=String(d.excludedCoach||'Tim').toLowerCase();
  const sorted=(d.standings||[])
    .filter(x=>String(x.coach||'').toLowerCase()!==excluded)
    .sort((a,b)=>(b.leaguePoints-a.leaguePoints)||(b.totalPoints-a.totalPoints))
    .slice(0,8);

  const cards=seedOrder.map((seed,i)=>makeSeedCard(sorted[seed-1]||{team:'TBD',coach:'',leaguePoints:0},seed,cardYs[i])).join('');
  const vs=vsYs.map(y=>`<text class="vs" x="134" y="${y}">VS</text>`).join('');
  document.getElementById('week1').innerHTML=cards+vs;

  document.getElementById('meta').textContent=`ROUND ${d.round ?? '—'} · ${String(d.phase||'regular').toUpperCase()}`;
  const matches=d.finals?.matches||{};
  for(const key of ['sf1','sf2','pf1','pf2','gf']){
    const pair=normaliseMatch(matches[key]);
    setSlot(key,0,pair[0]);
    setSlot(key,1,pair[1]);
  }
}

load().catch(err=>{console.error(err);document.getElementById('meta').textContent='DATA LOAD FAILED';});
setInterval(load,60000);
