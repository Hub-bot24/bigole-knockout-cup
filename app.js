const seedGroups=[[1,4],[5,8],[6,7],[2,3]];
const groupX=[170,470,770,1070];
const groupTitles=['QUALIFYING FINAL 1','ELIMINATION FINAL 1','ELIMINATION FINAL 2','QUALIFYING FINAL 2'];
const cardY=650, cardW=130, cardH=74, cardGap=6;

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function makeSeedCard(team,seed,x,y){
  return `<g class="seed-card" transform="translate(${x} ${y})">
    <rect class="seed-box" width="32" height="${cardH}" rx="4"/>
    <rect class="team-box" x="32" width="${cardW-32}" height="${cardH}" rx="4"/>
    <text class="seed-num" x="16" y="${cardH/2+7}" text-anchor="middle">${seed}</text>
    <text class="team-name" x="40" y="24">${esc(team.team)}</text>
    <text class="coach" x="40" y="39">${esc(team.coach)}</text>
    <text class="points" x="${cardW-8}" y="60" text-anchor="end">${team.leaguePoints ?? 0}<tspan class="pts" dx="3">PTS</tspan></text>
  </g>`;
}

function buildFirstRound(sorted){
  const pairWidth=cardW*2+cardGap;
  let out='';
  seedGroups.forEach((pair,gi)=>{
    const cx=groupX[gi];
    const leftX=cx-pairWidth/2;
    const rightX=leftX+cardW+cardGap;
    out+=`<rect class="group-box" x="${leftX-6}" y="${cardY-6}" width="${pairWidth+12}" height="${cardH+12}" rx="6"/>`;
    out+=makeSeedCard(sorted[pair[0]-1]||{team:'TBD',coach:'',leaguePoints:0},pair[0],leftX,cardY);
    out+=makeSeedCard(sorted[pair[1]-1]||{team:'TBD',coach:'',leaguePoints:0},pair[1],rightX,cardY);
    out+=`<text class="group-title" x="${cx}" y="${cardY+cardH+22}" text-anchor="middle">${groupTitles[gi]}</text>`;
  });
  return out;
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

  document.getElementById('week1').innerHTML=buildFirstRound(sorted);

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
