let matches = [
  ['2026-03-22','Criciuma','Casa',0,1,'D'],
  ['2026-04-01','Atletico Goianiense','Fora',2,1,'V'],
  ['2026-04-04','Ponte Preta','Casa',1,0,'V'],
  ['2026-04-11','Ceara','Fora',0,1,'D'],
  ['2026-04-18','São Bernardo','Casa',0,3,'D'],
  ['2026-04-27','Athletic Club','Fora',1,0,'V'],
  ['2026-05-02','Botafogo SP','Fora',1,1,'E'],
  ['2026-05-10','America Mineiro','Casa',4,0,'V'],
  ['2026-05-16','Operario-PR','Fora',6,2,'V'],
  ['2026-05-22','Cuiaba','Casa',1,0,'V'],
  ['2026-05-30','Sport Recife','Fora',0,2,'D'],
  ['2026-06-09','Fortaleza EC','Casa',0,1,'D'],
  ['2026-06-14','Novorizontino','Fora',2,2,'E'],
  ['2026-06-20','Vila Nova','Fora',3,4,'D'],
  ['2026-06-28','Goias','Casa',0,1,'D'],
  ['2026-07-05','Juventude','Casa',0,0,'E'],
  ['2026-07-12','Avai','Fora',0,2,'D'],
  ['2026-07-16','CRB','Fora',1,2,'D'],
  ['2026-07-23','Londrina','Casa',2,1,'V'],
  ['2026-07-26','Criciuma','Fora',0,0,'E'],
  ['2026-08-09','Atletico Goianiense','Casa',1,1,'E'],
  ['2026-08-14','Ponte Preta','Fora',1,1,'E'],
  ['2026-08-19','Ceara','Casa',1,0,'V'],
  ['2026-08-23','São Bernardo','Fora',1,1,'E'],
  ['2026-08-28','Athletic Club','Casa',2,1,'V'],
  ['2026-09-03','Botafogo SP','Casa',1,0,'V'],
  ['2026-09-09','America Mineiro','Fora',1,2,'D'],
  ['2026-09-15','Operario-PR','Casa',3,3,'E']
].map((m, i) => ({ round: i + 1, date: m[0], opponent: m[1], venue: m[2], gf: m[3], ga: m[4], result: m[5], points: m[5] === 'V' ? 3 : m[5] === 'E' ? 1 : 0 }));

const halfTimeScores = [
  [0,1], [0,1], [0,0], [0,0], [0,0], [0,0], [0,1],
  [2,0], [2,1], [0,0], [0,1], [0,1], [1,0], [1,4],
  [0,1], [0,0], [0,1], [0,1], [1,0], [0,0], [1,0],
  [0,1], [1,0], [0,0], [0,1], [0,0], [0,2], [1,1]
];

matches = matches.map((match, index) => {
  const [htGf, htGa] = halfTimeScores[index];
  return {...match, htGf, htGa, shGf: match.gf - htGf, shGa: match.ga - htGa};
});

const $ = (id) => document.getElementById(id);
const pct = (n) => `${n.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1})}%`;
const decimal = (n) => n.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', {day: '2-digit', month: 'short'}).format(new Date(`${date}T12:00:00`)).replace('.', '');
let activeFilter = 'Todos';
const MODEL_LIMITS = {relegation: 44, playoff: 60, direct: 65};

function summarize(list) {
  const wins = list.filter(m => m.result === 'V').length;
  const draws = list.filter(m => m.result === 'E').length;
  const losses = list.filter(m => m.result === 'D').length;
  const points = list.reduce((sum, m) => sum + m.points, 0);
  const gf = list.reduce((sum, m) => sum + m.gf, 0);
  const ga = list.reduce((sum, m) => sum + m.ga, 0);
  const max = list.length * 3;
  return { games: list.length, wins, draws, losses, points, gf, ga, max, efficiency: max ? points / max * 100 : 0, ppg: list.length ? points / list.length : 0 };
}

function renderSummary(list) {
  const s = summarize(list);
  $('headerGames').textContent = `${matches.length} de 38`;
  $('headerEndDate').textContent = formatDate(matches.at(-1).date);
  $('kpiEfficiency').textContent = pct(s.efficiency);
  $('efficiencyMeter').style.width = `${s.efficiency}%`;
  $('efficiencyDetail').textContent = `${s.points} de ${s.max} pontos possíveis`;
  $('kpiWins').textContent = s.wins;
  $('kpiDraws').textContent = s.draws;
  $('kpiLosses').textContent = s.losses;
  $('kpiPpg').textContent = decimal(s.ppg);
  $('ppgMeter').style.width = `${Math.min(s.ppg / 3 * 100, 100)}%`;
  $('kpiGoalDiff').textContent = `${s.gf - s.ga > 0 ? '+' : ''}${s.gf - s.ga}`;
  $('goalsFor').textContent = s.gf;
  $('goalsAgainst').textContent = s.ga;
  $('winsCount').textContent = s.wins;
  $('drawsCount').textContent = s.draws;
  $('lossesCount').textContent = s.losses;
  $('donutEfficiency').textContent = pct(s.efficiency);
  $('winsPercent').textContent = pct(s.games ? s.wins / s.games * 100 : 0);
  $('drawsPercent').textContent = pct(s.games ? s.draws / s.games * 100 : 0);
  $('lossesPercent').textContent = pct(s.games ? s.losses / s.games * 100 : 0);
  $('winRate').textContent = pct(s.games ? s.wins / s.games * 100 : 0);
  $('nonLossRate').textContent = pct(s.games ? (s.wins + s.draws) / s.games * 100 : 0);
  const winDeg = s.games ? s.wins / s.games * 360 : 0;
  const drawDeg = s.games ? s.draws / s.games * 360 : 0;
  $('resultDonut').style.background = `conic-gradient(var(--red) 0 ${winDeg}deg, var(--gold) ${winDeg}deg ${winDeg + drawDeg}deg, #b9b6b0 ${winDeg + drawDeg}deg 360deg)`;
  $('filterContext').textContent = activeFilter === 'Todos' ? 'Visão geral da campanha' : `${s.games} partidas como ${activeFilter === 'Casa' ? 'mandante' : 'visitante'}`;
}

function renderChart(list) {
  if (!list.length) return;
  const w = 700, h = 285, pad = {l: 36, r: 16, t: 18, b: 32};
  let acc = 0;
  const points = list.map(m => ({x: m.round, y: (acc += m.points)}));
  const maxY = Math.max(45, Math.ceil(points.at(-1).y / 10) * 10);
  const xAt = (round) => pad.l + (round - 1) / Math.max(matches.length - 1, 1) * (w - pad.l - pad.r);
  const yAt = (value) => h - pad.b - value / maxY * (h - pad.t - pad.b);
  const actualPath = points.map((p, i) => `${i ? 'L' : 'M'} ${xAt(p.x).toFixed(1)} ${yAt(p.y).toFixed(1)}`).join(' ');
  const pacePath = `M ${xAt(1)} ${yAt(1.5)} L ${xAt(matches.length)} ${yAt(matches.length * 1.5)}`;
  const grid = [0, .25, .5, .75, 1].map(f => {
    const y = yAt(maxY * f), val = Math.round(maxY * f);
    return `<line x1="${pad.l}" y1="${y}" x2="${w-pad.r}" y2="${y}" stroke="#e4ded4" stroke-width="1"/><text x="0" y="${y+4}" fill="#89847c" font-size="10">${val}</text>`;
  }).join('');
  const area = `${actualPath} L ${xAt(points.at(-1).x)} ${h-pad.b} L ${xAt(points[0].x)} ${h-pad.b} Z`;
  $('pointsChart').innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cc2229" stop-opacity=".18"/><stop offset="1" stop-color="#cc2229" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${pacePath}" fill="none" stroke="#a9a39a" stroke-width="2" stroke-dasharray="6 7"/>
    <path d="${area}" fill="url(#areaFill)"/><path d="${actualPath}" fill="none" stroke="#cc2229" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${points.map((p,i) => `<circle cx="${xAt(p.x)}" cy="${yAt(p.y)}" r="${i===points.length-1?5:2.4}" fill="${i===points.length-1?'#fff':'#cc2229'}" stroke="#cc2229" stroke-width="${i===points.length-1?3:0}"><title>Rodada ${p.x}: ${p.y} pontos</title></circle>`).join('')}
    ${[1,5,10,15,20,25,28].map(r => `<text x="${xAt(r)}" y="${h-7}" text-anchor="middle" fill="#89847c" font-size="10">R${r}</text>`).join('')}
    <g transform="translate(${xAt(points.at(-1).x)-45},${yAt(points.at(-1).y)+9})"><rect width="51" height="26" rx="8" fill="#cc2229"/><text x="25.5" y="17" fill="white" text-anchor="middle" font-size="11" font-weight="800">${points.at(-1).y} pts</text></g>
    <g transform="translate(${xAt(matches.length)-111},${yAt(matches.length*1.5)-33})"><rect width="59" height="22" rx="7" fill="#fff" stroke="#aaa6a0"/><text x="29.5" y="15" fill="#77736d" text-anchor="middle" font-size="9" font-weight="700">${matches.length*1.5} pts</text></g>
  </svg>`;
  const full = summarize(matches);
  const pacePoints = matches.length * 1.5;
  const delta = full.points - pacePoints;
  $('chartCurrentPoints').textContent = `${full.points} pts`;
  $('chartPacePoints').textContent = `${pacePoints.toLocaleString('pt-BR')} pts`;
  $('chartGap').textContent = `${delta > 0 ? '+' : ''}${delta.toLocaleString('pt-BR')} pts`;
  $('chartGapCard').classList.toggle('positive', delta >= 0);
  $('chartInsight').innerHTML = `Após ${matches.length} rodadas, o Náutico está <b>${Math.abs(delta).toLocaleString('pt-BR')} ponto${Math.abs(delta) === 1 ? '' : 's'} ${delta >= 0 ? 'acima' : 'abaixo'}</b> do ritmo de 50% de aproveitamento.`;
}

function renderForm(list) {
  const recent = list.slice(-5);
  $('recentForm').innerHTML = recent.map(m => `<i class="${m.result}" title="${m.opponent}: ${m.gf} x ${m.ga}">${m.result}</i>`).join('');
  const points = recent.reduce((s,m) => s + m.points, 0);
  $('recentPoints').textContent = `${points}/${recent.length * 3} pts`;
}

function renderVenue() {
  const home = summarize(matches.filter(m => m.venue === 'Casa'));
  const away = summarize(matches.filter(m => m.venue === 'Fora'));
  const card = (name, subtitle, icon, s, cls='') => {
    const goalDiff = s.gf - s.ga;
    return `<article class="venue-card ${cls}">
      <div class="venue-card-head"><div><i>${icon}</i><span><b>${name}</b><small>${subtitle}</small></span></div><strong>${pct(s.efficiency)}</strong></div>
      <div class="venue-progress"><i style="width:${s.efficiency}%"></i></div>
      <div class="venue-stats">
        <div><span>Pontos</span><b>${s.points}</b></div>
        <div><span>Por jogo</span><b>${decimal(s.ppg)}</b></div>
        <div><span>Saldo</span><b>${goalDiff > 0 ? '+' : ''}${goalDiff}</b></div>
      </div>
      <div class="venue-record"><span><b>${s.wins}</b> vitórias</span><span><b>${s.draws}</b> empates</span><span><b>${s.losses}</b> derrotas</span></div>
    </article>`;
  };
  const totalPoints = home.points + away.points;
  const homeShare = totalPoints ? home.points / totalPoints * 100 : 0;
  const awayShare = 100 - homeShare;
  $('venueComparison').innerHTML = `
    <div class="venue-cards">${card('Em casa', 'Nos Aflitos', 'C', home)}${card('Como visitante', 'Fora dos Aflitos', 'F', away, 'away')}</div>
    <div class="venue-deep-dive">
      <div class="points-origin">
        <div class="venue-detail-head"><span>ORIGEM DOS ${totalPoints} PONTOS</span><b>${pct(homeShare)} em casa</b></div>
        <div class="split-points"><i style="width:${homeShare}%"></i><i style="width:${awayShare}%"></i></div>
        <div class="split-labels"><span><b>${home.points}</b> casa</span><span><b>${away.points}</b> fora</span></div>
      </div>
      <div class="goal-balance">
        <div class="venue-detail-head"><span>BALANÇO DE GOLS</span><b>${home.gf + away.gf} marcados</b></div>
        <div class="goal-balance-rows">
          <span><i class="home-dot"></i>Casa <b>${home.gf} pró · ${home.ga} contra</b></span>
          <span><i></i>Fora <b>${away.gf} pró · ${away.ga} contra</b></span>
        </div>
      </div>
    </div>`;
  const better = home.efficiency >= away.efficiency ? ['em casa', home, away] : ['fora de casa', away, home];
  $('venueInsight').innerHTML = `<span>LEITURA DO MANDO</span><p>O Náutico rende melhor <b>${better[0]}</b>: são <strong>${pct(Math.abs(better[1].efficiency - better[2].efficiency))}</strong> pontos percentuais de diferença.</p>`;
}

function renderProjection() {
  const s = summarize(matches);
  const remaining = 38 - s.games;
  const projected = Math.round(s.ppg * 38);
  $('projectedPoints').textContent = `${projected} pts`;
  $('projectionCopy').innerHTML = `Mantendo a média atual de <b>${decimal(s.ppg)} ponto por jogo</b>, a projeção é terminar as 38 rodadas com aproximadamente <b>${projected} pontos</b>. Restam ${remaining} partidas.`;
  $('remainingFixtures').innerHTML = getRemainingFixtures().map(fixture => `<span class="fixture-chip"><b>${fixture.venue === 'Casa' ? 'C' : 'F'}</b> ${fixture.opponent}</span>`).join('');
  updateScenario();
}

function getRemainingFixtures() {
  const fixtures = [];
  for (let round = matches.length + 1; round <= 38; round++) {
    if (round > 19) {
      const firstLeg = matches[round - 20];
      if (firstLeg) fixtures.push({
        round,
        opponent: firstLeg.opponent,
        venue: firstLeg.venue === 'Casa' ? 'Fora' : 'Casa'
      });
    }
  }
  return fixtures;
}

function factorial(n) {
  let value = 1;
  for (let i = 2; i <= n; i++) value *= i;
  return value;
}

function rising(value, n) {
  let result = 1;
  for (let i = 0; i < n; i++) result *= value + i;
  return result;
}

function predictivePointsDistribution(games, summary) {
  const alpha = [summary.wins + .5, summary.draws + .5, summary.losses + .5];
  const alphaTotal = alpha.reduce((sum, value) => sum + value, 0);
  const distribution = new Map();
  for (let wins = 0; wins <= games; wins++) {
    for (let draws = 0; draws <= games - wins; draws++) {
      const losses = games - wins - draws;
      const arrangements = factorial(games) / factorial(wins) / factorial(draws) / factorial(losses);
      const probability = arrangements
        * rising(alpha[0], wins) * rising(alpha[1], draws) * rising(alpha[2], losses)
        / rising(alphaTotal, games);
      const points = wins * 3 + draws;
      distribution.set(points, (distribution.get(points) || 0) + probability);
    }
  }
  return distribution;
}

function buildFinishDistribution() {
  const current = summarize(matches).points;
  const fixtures = getRemainingFixtures();
  const homeGames = fixtures.filter(f => f.venue === 'Casa').length;
  const awayGames = fixtures.length - homeGames;
  const home = predictivePointsDistribution(homeGames, summarize(matches.filter(m => m.venue === 'Casa')));
  const away = predictivePointsDistribution(awayGames, summarize(matches.filter(m => m.venue === 'Fora')));
  const final = new Map();
  for (const [homePoints, homeProbability] of home) {
    for (const [awayPoints, awayProbability] of away) {
      const total = current + homePoints + awayPoints;
      final.set(total, (final.get(total) || 0) + homeProbability * awayProbability);
    }
  }
  return final;
}

function distributionProbability(distribution, predicate) {
  return [...distribution].reduce((sum, [points, probability]) => sum + (predicate(points) ? probability : 0), 0);
}

function distributionQuantile(distribution, target) {
  let cumulative = 0;
  for (const [points, probability] of [...distribution].sort((a, b) => a[0] - b[0])) {
    cumulative += probability;
    if (cumulative >= target) return points;
  }
  return Math.max(...distribution.keys());
}

function modelPercent(probability) {
  const value = probability * 100;
  if (value > 0 && value < .1) return '<0,1%';
  return pct(value);
}

function renderProbabilities() {
  const distribution = buildFinishDistribution();
  const relegation = distributionProbability(distribution, points => points <= MODEL_LIMITS.relegation);
  const playoff = distributionProbability(distribution, points => points >= MODEL_LIMITS.playoff);
  const direct = distributionProbability(distribution, points => points >= MODEL_LIMITS.direct);
  const playoffAccess = Math.max(0, playoff - direct) * .5;
  const access = direct + playoffAccess;
  const q10 = distributionQuantile(distribution, .10);
  const median = distributionQuantile(distribution, .50);
  const q90 = distributionQuantile(distribution, .90);
  const currentPoints = summarize(matches).points;
  const playoffNeeded = Math.max(0, MODEL_LIMITS.playoff - currentPoints);
  const safetyNeeded = Math.max(0, MODEL_LIMITS.relegation + 1 - currentPoints);

  $('accessProbability').textContent = modelPercent(access);
  $('playoffProbability').textContent = modelPercent(playoff);
  $('relegationProbability').textContent = modelPercent(relegation);
  $('directProbability').textContent = modelPercent(direct);
  $('playoffAccessProbability').textContent = modelPercent(playoffAccess);
  $('survivalProbability').textContent = modelPercent(1 - relegation);
  $('playoffPointsNeeded').textContent = `${playoffNeeded} pts`;
  $('safetyPointsNeeded').textContent = `${safetyNeeded} pts`;
  $('accessBar').style.width = `${Math.max(access * 100, .5)}%`;
  $('playoffBar').style.width = `${Math.max(playoff * 100, .5)}%`;
  $('relegationBar').style.width = `${Math.max(relegation * 100, .5)}%`;
  $('accessDetail').innerHTML = `O caminho mais viável passa pelo <b>G6 e pelos playoffs</b>; o acesso direto exige ${MODEL_LIMITS.direct} pontos.`;
  $('playoffDetail').innerHTML = `São necessários <b>${playoffNeeded} dos ${getRemainingFixtures().length * 3} pontos</b> ainda disponíveis.`;
  $('relegationDetail').innerHTML = `Com mais <b>${safetyNeeded} pontos</b>, o time chega a 45, acima da faixa conservadora de risco.`;
  $('likelyRange').textContent = `${q10}–${q90} pontos`;
  $('rangeLow').textContent = q10;
  $('rangeMedian').textContent = median;
  $('rangeHigh').textContent = q90;
  $('modelSummary').innerHTML = `Em 80% dos cenários, a campanha termina nessa faixa. O centro da projeção é <b>${median} pontos</b>.`;
}

function longestSequence(predicate) {
  let longest = 0, current = 0;
  matches.forEach(match => {
    current = predicate(match) ? current + 1 : 0;
    longest = Math.max(longest, current);
  });
  return longest;
}

function renderPerformance() {
  $('gameStrip').innerHTML = matches.map(match => `<div class="game-tile ${match.result}" title="R${match.round} · ${match.opponent} · ${match.gf} x ${match.ga}">
    <span>R${String(match.round).padStart(2, '0')}</span><strong>${match.result}</strong>
  </div>`).join('');

  const periods = [
    {label: 'Rodadas 1–10', list: matches.slice(0, 10)},
    {label: 'Rodadas 11–20', list: matches.slice(10, 20)},
    {label: `Rodadas 21–${matches.length}`, list: matches.slice(20)}
  ].filter(period => period.list.length);
  const periodData = periods.map(period => ({...period, summary: summarize(period.list)}));
  const best = Math.max(...periodData.map(period => period.summary.efficiency));
  $('periodGrid').innerHTML = periodData.map(period => `<div class="period-card ${period.summary.efficiency === best ? 'best' : ''}">
    <span>${period.label}</span><strong>${pct(period.summary.efficiency)}</strong>
    <div class="period-meter"><i style="width:${period.summary.efficiency}%"></i></div>
    <small>${period.summary.points} pontos · ${period.summary.wins}V ${period.summary.draws}E ${period.summary.losses}D</small>
  </div>`).join('');

  const cleanSheets = matches.filter(match => match.ga === 0).length;
  const scored = matches.filter(match => match.gf > 0).length;
  const recent = summarize(matches.slice(-5));
  const items = [
    [longestSequence(match => match.result !== 'D'), 'maior série invicta'],
    [longestSequence(match => match.result === 'V'), 'maior série de vitórias'],
    [`${cleanSheets}/${matches.length}`, 'jogos sem sofrer gol'],
    [`${recent.points}/15`, `pontos nos últimos 5 · marcou em ${scored}/${matches.length}`]
  ];
  $('streakGrid').innerHTML = items.map(([value, label]) => `<div class="streak-item"><b>${value}</b><span>${label}</span></div>`).join('');
}

function updateScenario() {
  const target = Number($('targetPoints').value);
  const current = summarize(matches).points;
  const remaining = 38 - matches.length;
  const needed = Math.max(0, target - current);
  const wins = Math.ceil(needed / 3);
  $('targetOutput').textContent = target;
  if (wins > remaining) {
    $('scenarioText').innerHTML = `A meta exige <b>${needed} pontos</b>, acima dos ${remaining * 3} ainda disponíveis.`;
  } else if (!needed) {
    $('scenarioText').innerHTML = `Meta já alcançada: o Náutico tem <b>${current} pontos</b>.`;
  } else {
    const restPoints = wins * 3 - needed;
    const detail = restPoints ? `${wins - 1} vitórias e ${3 - restPoints} empate${3-restPoints===1?'':'s'}` : `${wins} vitória${wins===1?'':'s'}`;
    $('scenarioText').innerHTML = `Faltam <b>${needed} pontos</b>. Um caminho mínimo: <b>${detail}</b> nos ${remaining} jogos restantes.`;
  }
}

function resultPoints(gf, ga) {
  return gf > ga ? 3 : gf === ga ? 1 : 0;
}
function signedNumber(value) {
  return (value > 0 ? '+' : '') + value;
}
function setHalfBalance(id, value) {
  const element = $(id);
  element.textContent = signedNumber(value) + ' saldo';
  element.classList.toggle('positive', value > 0);
  element.classList.toggle('negative', value < 0);
}
function renderHalves(list) {
  const valid = list.filter(m => [m.htGf, m.htGa, m.shGf, m.shGa].every(Number.isFinite));
  if (!valid.length) {
    $('halvesInsight').textContent = 'Os placares de intervalo nÃ£o estÃ£o disponÃ­veis para este recorte.';
    return;
  }
  const totals = valid.reduce((acc, match) => {
    acc.htGf += match.htGf;
    acc.htGa += match.htGa;
    acc.shGf += match.shGf;
    acc.shGa += match.shGa;
    acc.htPoints += resultPoints(match.htGf, match.htGa);
    acc.finalPoints += resultPoints(match.gf, match.ga);
    const before = resultPoints(match.htGf, match.htGa);
    const after = resultPoints(match.gf, match.ga);
    if (after > before) acc.improved += 1;
    if (after < before) acc.worsened += 1;
    return acc;
  }, {htGf: 0, htGa: 0, shGf: 0, shGa: 0, htPoints: 0, finalPoints: 0, improved: 0, worsened: 0});

  const totalScored = totals.htGf + totals.shGf;
  const maxGoals = Math.max(totals.htGf, totals.htGa, totals.shGf, totals.shGa, 1);
  const firstBalance = totals.htGf - totals.htGa;
  const secondBalance = totals.shGf - totals.shGa;
  const pointsSwing = totals.finalPoints - totals.htPoints;
  const productive = totals.htGf === totals.shGf ? 'Equilibrado' : totals.htGf > totals.shGf ? '1Âº tempo' : '2Âº tempo';
  const vulnerable = totals.htGa === totals.shGa ? 'Equilibrado' : totals.htGa > totals.shGa ? '1Âº tempo' : '2Âº tempo';

  $('firstHalfFor').textContent = totals.htGf;
  $('firstHalfAgainst').textContent = totals.htGa;
  $('secondHalfFor').textContent = totals.shGf;
  $('secondHalfAgainst').textContent = totals.shGa;
  $('firstHalfShare').textContent = pct(totalScored ? totals.htGf / totalScored * 100 : 0);
  $('secondHalfShare').textContent = pct(totalScored ? totals.shGf / totalScored * 100 : 0);
  setHalfBalance('firstHalfBalance', firstBalance);
  setHalfBalance('secondHalfBalance', secondBalance);
  $('firstForBar').style.width = (totals.htGf / maxGoals * 100) + '%';
  $('firstAgainstBar').style.width = (totals.htGa / maxGoals * 100) + '%';
  $('secondForBar').style.width = (totals.shGf / maxGoals * 100) + '%';
  $('secondAgainstBar').style.width = (totals.shGa / maxGoals * 100) + '%';
  $('productiveHalf').textContent = productive;
  $('vulnerableHalf').textContent = vulnerable;
  $('improvedResults').textContent = totals.improved + ' Ã— ' + totals.worsened;
  $('pointsSwing').textContent = signedNumber(pointsSwing) + ' pts';

  const secondShare = totalScored ? totals.shGf / totalScored * 100 : 0;
  $('halvesInsight').innerHTML = 'O <b>2Âº tempo</b> concentra <b>' + pct(secondShare) +
    '</b> dos gols marcados. O saldo muda de <b>' + signedNumber(firstBalance) +
    '</b> antes do intervalo para <b>' + signedNumber(secondBalance) + '</b> depois dele.';
}
function renderTable(list) {
  let accumulated = 0;
  const accumulatedByRound = new Map(matches.map(m => [m.round, (accumulated += m.points)]));
  const term = $('matchSearch').value.trim().toLocaleLowerCase('pt-BR');
  const visible = list.filter(m => m.opponent.toLocaleLowerCase('pt-BR').includes(term));
  const resultName = {V: 'Vitória', E: 'Empate', D: 'Derrota'};
  $('matchesBody').innerHTML = visible.map(m => `<tr class="row-${m.result}">
    <td><span class="round-number">${String(m.round).padStart(2,'0')}</span></td><td class="date-cell">${formatDate(m.date)}</td>
    <td><div class="fixture"><span>Náutico</span><strong>${m.gf} <i>×</i> ${m.ga}</strong><span>${m.opponent}</span></div></td>
    <td><span class="venue-tag ${m.venue.toLowerCase()}">${m.venue}</span></td>
    <td><div class="result-cell"><span class="badge ${m.result}">${m.result}</span><b>${resultName[m.result]}</b></div></td>
    <td><span class="points-pill ${m.result}">+${m.points}</span></td>
    <td><div class="accumulated"><b>${accumulatedByRound.get(m.round)}</b><span>pts</span></div></td>
  </tr>`).join('');
  $('emptyState').hidden = visible.length > 0;
}

function applyFilter(filter) {
  activeFilter = filter;
  const list = filter === 'Todos' ? matches : matches.filter(m => m.venue === filter);
  renderSummary(list);
  renderForm(list);
  renderHalves(list);
  renderTable(list);
}

document.querySelectorAll('#venueFilter button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('#venueFilter button').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  applyFilter(button.dataset.filter);
}));
$('targetPoints').addEventListener('input', updateScenario);
$('matchSearch').addEventListener('input', () => applyFilter(activeFilter));

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { field += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift().map(header => header.trim());
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

async function loadCsv() {
  try {
    let csvText = window.__NAUTICO_CSV__;
    if (!csvText) {
      const response = await fetch('nautico_serie_b_2026_todos_jogos.csv', {cache: 'no-store'});
      if (!response.ok) return;
      csvText = await response.text();
    }
    const records = parseCsv(csvText).filter(row => row.status === 'finished' && ['V','E','D'].includes(row.resultado));
    if (!records.length) return;
    matches = records.map((row, index) => ({
      round: index + 1,
      date: row.data,
      opponent: row.adversario,
      venue: row.mando,
      gf: Number(row.gols_nautico),
      ga: Number(row.gols_adversario),
      htGf: Number(row.gols_1t_nautico),
      htGa: Number(row.gols_1t_adversario),
      shGf: Number(row.gols_2t_nautico),
      shGa: Number(row.gols_2t_adversario),
      result: row.resultado,
      points: row.resultado === 'V' ? 3 : row.resultado === 'E' ? 1 : 0
    }));
  } catch (_) {
    // Em file://, o navegador bloqueia fetch local; os dados incorporados acima mantêm o painel funcional.
  }
}

function renderAll() {
  applyFilter('Todos');
  renderChart(matches);
  renderVenue();
  renderProjection();
  renderProbabilities();
  renderPerformance();
}

$('modelInfoButton').addEventListener('click', () => {
  const explanation = $('modelExplanation');
  explanation.hidden = !explanation.hidden;
  $('modelInfoButton').textContent = explanation.hidden ? 'Como calculamos?' : 'Ocultar metodologia';
});

loadCsv().finally(renderAll);
