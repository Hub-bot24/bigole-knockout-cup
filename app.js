const seedGroups=[[1,4],[5,8],[6,7],[2,3]];
const groupX=[170,470,770,1070];
const groupTitles=['QUALIFYING FINAL 1','ELIMINATION FINAL 1','ELIMINATION FINAL 2','QUALIFYING FINAL 2'];
const cardY=650, cardW=130, cardH=74, cardGap=22;

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
    const leftCenter=leftX+cardW/2, rightCenter=rightX+cardW/2;
    out+=`<path class="tie-bracket" d="M ${leftCenter} ${cardY} V ${cardY-18} H ${rightCenter} V ${cardY}"/>`;
    out+=`<rect class="group-box" x="${leftX-6}" y="${cardY-6}" width="${pairWidth+12}" height="${cardH+12}" rx="6"/>`;
    out+=makeSeedCard(sorted[pair[0]-1]||{team:'TBD',coach:'',leaguePoints:0},pair[0],leftX,cardY);
    out+=makeSeedCard(sorted[pair[1]-1]||{team:'TBD',coach:'',leaguePoints:0},pair[1],rightX,cardY);
    out+=`<text class="vs" x="${cx}" y="${cardY+cardH/2+4}" text-anchor="middle">VS</text>`;
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

// Winner/loser of a single {home:{team,score},away:{team,score}} match, or nulls if not yet decided.
function outcome(match){
  const h=match?.home, a=match?.away;
  if(!h||!a||!Number.isFinite(h.score)||!Number.isFinite(a.score)||h.score===a.score){
    return {winner:null,loser:null};
  }
  return h.score>a.score
    ? {winner:{team:h.team},loser:{team:a.team}}
    : {winner:{team:a.team},loser:{team:h.team}};
}

function slotFor(source,recorded){
  return source?{team:source.team,score:recorded?.score}:null;
}

// Cascades qf1/ef1/ef2/qf2 results up through sf1/sf2 (same side) into pf1/pf2
// (crossover: qf1 winner + sf2 winner -> pf1, sf1 winner + qf2 winner -> pf2) and gf.
function buildBracket(m){
  const qf1=outcome(m.qf1), ef1=outcome(m.ef1), ef2=outcome(m.ef2), qf2=outcome(m.qf2);

  const sf1={home:slotFor(qf1.loser,m.sf1?.home), away:slotFor(ef1.winner,m.sf1?.away)};
  const sf2={home:slotFor(ef2.winner,m.sf2?.home), away:slotFor(qf2.loser,m.sf2?.away)};
  const sf1Out=outcome(sf1), sf2Out=outcome(sf2);

  const pf1={home:slotFor(qf1.winner,m.pf1?.home), away:slotFor(sf2Out.winner,m.pf1?.away)};
  const pf2={home:slotFor(sf1Out.winner,m.pf2?.home), away:slotFor(qf2.winner,m.pf2?.away)};
  const pf1Out=outcome(pf1), pf2Out=outcome(pf2);

  const gf={home:slotFor(pf1Out.winner,m.gf?.home), away:slotFor(pf2Out.winner,m.gf?.away)};

  return {sf1,sf2,pf1,pf2,gf};
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
  const bracket=buildBracket(matches);
  for(const key of ['sf1','sf2','pf1','pf2','gf']){
    setSlot(key,0,bracket[key].home);
    setSlot(key,1,bracket[key].away);
  }
}

load().catch(err=>{console.error(err);document.getElementById('meta').textContent='DATA LOAD FAILED';});
setInterval(load,60000);
