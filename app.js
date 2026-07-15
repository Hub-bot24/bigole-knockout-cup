const competition = {
  excludedCoach: 'Tim',
  roundsLeft: 3,
  updatedAt: new Date().toISOString(),
  standings: [
    { originalRank: 1, team: 'Cooma Stallions', coach: 'Tim', points: 34, scored: 24554 },
    { originalRank: 2, team: 'BIGOLE', coach: 'Joel', points: 30, scored: 25105 },
    { originalRank: 3, team: "Multch’s Magoo’s", coach: 'Mitch', points: 28, scored: 24658 },
    { originalRank: 4, team: 'Ballbags', coach: 'Hayden', points: 28, scored: 24035 },
    { originalRank: 5, team: 'The amateurs', coach: 'Jhai', points: 26, scored: 24262 },
    { originalRank: 6, team: 'I love Herbie', coach: 'Blake', points: 26, scored: 23476 },
    { originalRank: 7, team: 'Bonogin Brawlers', coach: 'Matt', points: 24, scored: 23332 },
    { originalRank: 8, team: 'BARRY', coach: 'Kyle', points: 22, scored: 23788 },
    { originalRank: 9, team: 'Bridgette', coach: 'Bridgette', points: 20, scored: 23046 },
    { originalRank: 10, team: '#Phinsup', coach: 'Aidan', points: 20, scored: 22293 },
    { originalRank: 11, team: 'Kini_mo’s', coach: 'Ryan', points: 18, scored: 22971 },
    { originalRank: 12, team: 'Brisbane Lions', coach: 'Ivan', points: 18, scored: 21150 },
    { originalRank: 13, team: 'Jade on top', coach: 'JD', points: 14, scored: 21872 },
    { originalRank: 14, team: "Walsh’s plumbing", coach: 'brendan', points: 14, scored: 19727 },
    { originalRank: 15, team: 'Superstars', coach: 'Rayna', points: 10, scored: 20256 },
    { originalRank: 16, team: 'Heavy Hitters', coach: 'Reece', points: 6, scored: 18097 },
    { originalRank: 17, team: 'Turbzz', coach: 'Nicholas', points: 4, scored: 15037 },
    { originalRank: 18, team: 'Beeteezeelz', coach: 'Brett', points: 0, scored: 14819 }
  ]
};

function getSeeds() {
  return competition.standings
    .filter(x => x.coach.toLowerCase() !== competition.excludedCoach.toLowerCase())
    .sort((a,b) => b.points-a.points || b.scored-a.scored)
    .slice(0,8)
    .map((x,i) => ({...x, seed:i+1}));
}

function teamRow(team, score='—', leading=false) {
  if (!team) return `<div class="team"><div class="rank">–</div><div><div class="team-name pending">TBD</div><div class="coach">Waiting for result</div></div><div class="score pending">—</div></div>`;
  return `<div class="team ${leading?'leading':''}"><div class="rank">${team.seed ?? '–'}</div><div><div class="team-name">${team.team}</div><div class="coach">${team.coach}</div></div><div class="score">${score}</div></div>`;
}
function match(label,a,b){return `<div class="match"><div class="match-label">${label}</div>${teamRow(a)}${teamRow(b)}</div>`}

function render(){
  const seeds=getSeeds();
  document.getElementById('roundsLeft').textContent=competition.roundsLeft;
  document.getElementById('updatedAt').textContent=`Updated ${new Date(competition.updatedAt).toLocaleString([], {hour:'2-digit',minute:'2-digit'})}`;
  document.getElementById('seedList').innerHTML=seeds.map(t=>`<div class="seed"><div class="seed-num">${t.seed}</div><div><div class="seed-name">${t.team}</div><div class="seed-coach">${t.coach} · ${t.points} pts</div></div></div>`).join('');

  const [s1,s2,s3,s4,s5,s6,s7,s8]=seeds;
  document.getElementById('bracket').innerHTML=`
    <div class="round"><div class="round-title">Week 1</div>${match('Qualifying final 1',s1,s4)}${match('Elimination final 1',s5,s8)}${match('Elimination final 2',s6,s7)}${match('Qualifying final 2',s2,s3)}</div>
    <div class="round"><div class="round-title">Week 2</div>${match('Semi final 1',null,null)}${match('Semi final 2',null,null)}</div>
    <div class="round"><div class="round-title">Week 3</div>${match('Preliminary final 1',null,null)}${match('Preliminary final 2',null,null)}</div>
    <div class="round"><div class="round-title">Week 4</div>${match('Grand final',null,null)}</div>`;
}
render();
