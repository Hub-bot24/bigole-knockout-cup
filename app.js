const W=1280,H=700,DATA='data/live.json';
function fit(){const c=document.getElementById('canvas');const v=window.visualViewport;const w=v?.width||innerWidth,h=v?.height||innerHeight;const s=Math.min(w/W,h/H);c.style.transform=`translate(${Math.max(0,(w-W*s)/2)}px,${Math.max(0,(h-H*s)/2)}px) scale(${s})`;}
function seeds(d){return [...d.standings].filter(x=>x.coach.toLowerCase()!==String(d.excludedCoach).toLowerCase()).sort((a,b)=>b.leaguePoints-a.leaguePoints||b.totalPoints-a.totalPoints).slice(0,8).map((x,i)=>({...x,seed:i+1}))}
function node(x,y,t,week=1,cls=''){if(!t)return `<div class="node future ${cls}" style="left:${x}px;top:${y}px"><div class="seed">–</div><div class="team"><div class="name">TBD</div><div class="coach">Waiting for result</div><div class="value">—</div></div></div>`;const val=week===1?`${t.leaguePoints}<small>pts</small>`:(t.roundScore||'—');return `<div class="node ${cls}" style="left:${x}px;top:${y}px"><div class="seed">${t.seed??'–'}</div><div class="team"><div class="name">${t.team}</div><div class="coach">${t.coach}</div><div class="value">${val}</div></div></div>`}
function render(d){const s=seeds(d),[a,b,c,e,f,g,h,i]=s;document.getElementById('status').textContent=`ROUND ${d.round??'—'} · ${d.phase==='regular'?'LADDER':'FINALS'}`;document.getElementById('bracket').innerHTML=`
<div class="round-label r1">WEEK 1</div><div class="round-label r2">WEEK 2</div><div class="round-label r3">WEEK 3</div><div class="round-label r4">WEEK 4</div>
<div class="note n1">TOP 4: WIN → WEEK 3 · LOSE → WEEK 2</div><div class="note n2">SEMI FINALS</div><div class="note n3">PRELIMINARY FINALS</div><div class="note n4">GRAND FINAL</div>
<svg class="map" viewBox="0 0 1212 590" preserveAspectRatio="none">
<path d="M245 75 H292 V105 H335"/><circle cx="292" cy="105" r="13"/><rect x="335" y="80" width="70" height="50" rx="4"/>
<path d="M245 165 H292 V105"/>
<path d="M245 75 H620 V105 H665"/><circle cx="620" cy="105" r="13"/><rect x="665" y="80" width="70" height="50" rx="4"/>
<path d="M405 105 H500 V195 H620 V275 H665"/><circle cx="620" cy="275" r="13"/><rect x="665" y="250" width="70" height="50" rx="4"/>
<path d="M245 245 H292 V275 H335"/><circle cx="292" cy="275" r="13"/><rect x="335" y="250" width="70" height="50" rx="4"/>
<path d="M245 335 H292 V275"/>
<path d="M245 415 H292 V445 H335"/><circle cx="292" cy="445" r="13"/><rect x="335" y="420" width="70" height="50" rx="4"/>
<path d="M245 505 H292 V445"/>
<path d="M245 415 H620 V445 H665"/><circle cx="620" cy="445" r="13"/><rect x="665" y="420" width="70" height="50" rx="4"/>
<path d="M405 445 H500 V355 H620 V275"/>
<path d="M735 105 H850 V190 H895"/><circle cx="850" cy="190" r="13"/><rect x="895" y="165" width="70" height="50" rx="4"/>
<path d="M735 275 H850 V190"/>
<path d="M735 275 H850 V360 H895"/><circle cx="850" cy="360" r="13"/><rect x="895" y="335" width="70" height="50" rx="4"/>
<path d="M735 445 H850 V360"/>
<path d="M965 190 H1060 V275 H1105"/><circle cx="1060" cy="275" r="13"/><rect x="1105" y="250" width="70" height="50" rx="4"/>
<path d="M965 360 H1060 V275"/>
</svg>
${node(0,48,a)}${node(0,138,e)}${node(0,218,f)}${node(0,308,i)}${node(0,388,g)}${node(0,478,h)}${node(0,558,b)}${node(0,648,c)}
${node(305,78,null,2,'future')}${node(305,248,null,2,'future')}${node(305,418,null,2,'future')}
${node(635,78,null,3,'future')}${node(635,248,null,3,'future')}${node(635,418,null,3,'future')}
${node(865,163,null,4,'future final')}${node(865,333,null,4,'future final')}${node(1075,248,null,4,'future final')}`;
}
async function load(){try{const r=await fetch(`${DATA}?v=${Date.now()}`,{cache:'no-store'});render(await r.json())}catch(e){document.getElementById('status').textContent='DATA ERROR'}}
fit();load();setInterval(load,60000);addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,150));visualViewport?.addEventListener('resize',fit);
