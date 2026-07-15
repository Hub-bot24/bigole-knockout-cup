const competition = {
  excludedCoach: 'Tim',
  standings: [
    { team: 'Cooma Stallions', coach: 'Tim', points: 34, scored: 24554 },
    { team: 'BIGOLE', coach: 'Joel', points: 30, scored: 25105 },
    { team: "Multch’s Magoo’s", coach: 'Mitch', points: 28, scored: 24658 },
    { team: 'Ballbags', coach: 'Hayden', points: 28, scored: 24035 },
    { team: 'The amateurs', coach: 'Jhai', points: 26, scored: 24262 },
    { team: 'I love Herbie', coach: 'Blake', points: 26, scored: 23476 },
    { team: 'Bonogin Brawlers', coach: 'Matt', points: 24, scored: 23332 },
    { team: 'BARRY', coach: 'Kyle', points: 22, scored: 23788 },
    { team: 'Bridgette', coach: 'Bridgette', points: 20, scored: 23046 }
  ]
};

function getSeeds() {
  return competition.standings
    .filter(entry => entry.coach.toLowerCase() !== competition.excludedCoach.toLowerCase())
    .sort((a, b) => b.points - a.points || b.scored - a.scored)
    .slice(0, 8)
    .map((entry, index) => ({ ...entry, seed: index + 1 }));
}

function teamRow(team) {
  if (!team) {
    return `<div class="team"><div class="rank">–</div><div><div class="team-name pending">TBD</div><div class="coach">Waiting for result</div></div><div class="score pending">—</div></div>`;
  }
  return `<div class="team current"><div class="rank">${team.seed}</div><div><div class="team-name">${team.team}</div><div class="coach">${team.coach}</div></div><div class="score">—</div></div>`;
}

function match({ className, label, type = 'future', badge = '', a = null, b = null, note = '' }) {
  return `<article class="match ${className}" data-type="${type}">
    <div class="match-label"><span>${label}</span>${badge ? `<span class="chance ${badge === 'Double chance' ? 'safe' : 'danger'}">${badge}</span>` : ''}</div>
    ${teamRow(a)}${teamRow(b)}${note ? `<span class="path-note" title="${note}">→</span>` : ''}
  </article>`;
}

function render() {
  const [s1, s2, s3, s4, s5, s6, s7, s8] = getSeeds();
  document.getElementById('bracket').innerHTML = `
    <section class="round w1">
      <div class="round-title">Week 1</div>
      ${match({ className:'m1', label:'Qualifying Final 1', type:'qualifying', badge:'Double chance', a:s1, b:s4, note:'Winner to preliminary final; loser to semi final' })}
      ${match({ className:'m2', label:'Elimination Final 1', type:'elimination', badge:'Lose = out', a:s5, b:s8, note:'Winner to semi final' })}
      ${match({ className:'m3', label:'Elimination Final 2', type:'elimination', badge:'Lose = out', a:s6, b:s7, note:'Winner to semi final' })}
      ${match({ className:'m4', label:'Qualifying Final 2', type:'qualifying', badge:'Double chance', a:s2, b:s3, note:'Winner to preliminary final; loser to semi final' })}
    </section>
    <section class="round w2">
      <div class="round-title">Week 2</div>
      ${match({ className:'m1', label:'Semi Final 1', a:null, b:null, note:'Winner to preliminary final' })}
      ${match({ className:'m2', label:'Semi Final 2', a:null, b:null, note:'Winner to preliminary final' })}
    </section>
    <section class="round w3">
      <div class="round-title">Week 3</div>
      ${match({ className:'m1', label:'Preliminary Final 1', a:null, b:null, note:'Winner to grand final' })}
      ${match({ className:'m2', label:'Preliminary Final 2', a:null, b:null, note:'Winner to grand final' })}
    </section>
    <section class="round w4">
      <div class="round-title">Week 4</div>
      ${match({ className:'m1', label:'Grand Final', a:null, b:null })}
    </section>`;
}

async function requestLandscape() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    if (screen.orientation?.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch {
    // iPhone Safari may reject orientation locking; portrait remains blocked by CSS.
  }
}

document.getElementById('landscapeButton')?.addEventListener('click', requestLandscape);
render();
