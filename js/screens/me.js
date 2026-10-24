
import { get, dateKey } from '../store.js';
import { EXERCISES, AREAS, WEATHERS, weatherByName } from '../data.js';
import { esc, nav, him, prettyDate } from '../ui.js';
import {
  ensureGoals, count, unitOf, checkFinished,
  openNewGoal, openEditGoal, openLog
} from '../goals.js';
import { hill, wireHills, restClock, noticing } from '../charts.js';
import { actDef, logsOf } from '../activities.js';

let hillKey = 'all';
let weatherRange = 7;

export function mount(root) {
  ensureGoals();
  render(root);
  checkFinished();
  wireHills(root);

  root.addEventListener('click', e => {
    const t = e.target;
    let b;

    if (t.closest('[data-newgoal]')) {
      openNewGoal(() => render(root));
      return;
    }

    if (t.closest('[data-loggoal]')) {
      openLog(null, () => render(root));
      return;
    }

    if ((b = t.closest('[data-goal]'))) {
      openEditGoal(b.dataset.goal, () => render(root));
      return;
    }

    if ((b = t.closest('[data-hill]'))) {
      hillKey = b.dataset.hill;
      render(root);
      wireHills(root);
      return;
    }

    if ((b = t.closest('[data-weather-range]'))) {
      weatherRange = Number(b.dataset.weatherRange);
      render(root);
      wireHills(root);
      return;
    }
  });
}

function dayKeyOffset(offset) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - offset);
  return dateKey(d);
}

function weatherHistory(st) {
  const start = dayKeyOffset(weatherRange - 1);
  const end = dateKey(new Date());

  const entries = (st.weather || []).filter(w =>
    w.date >= start && w.date <= end
  );

  const counts = new Map();
  let total = 0;

  entries.forEach(entry => {
    (entry.types || []).forEach(name => {
      counts.set(name, (counts.get(name) || 0) + 1);
      total++;
    });
  });

  const orderedNames = [
    ...WEATHERS.map(w => w[0]),
    ...counts.keys()
  ];

  const uniqueNames = [...new Set(orderedNames)];
  const rows = uniqueNames
    .filter(name => counts.has(name))
    .map(name => ({
      name,
      count: counts.get(name),
      percent: total ? Math.round(counts.get(name) / total * 100) : 0,
      colour: (weatherByName(name) || [null, null, '#77766C'])[2]
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { rows, total, entries: entries.length, start, end };
}

function weatherHistoryHtml(st) {
  const history = weatherHistory(st);

  const filters = [
    [7, 'Week'],
    [14, '2 weeks'],
    [30, 'Month']
  ];

  const filterHtml = filters.map(([days, label]) =>
    '<button type="button" class="chip small" data-weather-range="' +
    days + '" aria-pressed="' + (weatherRange === days) + '">' +
    label + '</button>'
  ).join('');

  const rowsHtml = history.rows.length
    ? history.rows.map(row =>
        '<tr>' +
          '<td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' +
          row.colour + ';margin-right:8px"></span>' + esc(row.name) + '</td>' +
          '<td style="text-align:right;font-weight:800">' + row.count + '</td>' +
          '<td style="text-align:right">' + row.percent + '%</td>' +
        '</tr>'
      ).join('')
    : '<tr><td colspan="3" style="padding:14px 0;color:var(--ink-soft)">' +
      'No weather check-ins in this period yet.</td></tr>';

  return '<div class="card">' +
    '<b>Your weather history</b>' +
    '<p class="muted" style="font-size:13px;margin:0">' +
      'A look at the feelings you logged. There is no right or wrong pattern.' +
    '</p>' +
    '<div class="chips">' + filterHtml + '</div>' +
    '<p class="muted" style="font-size:12px;margin:0">' +
      'Last ' + weatherRange + ' days · ' + history.entries +
      (history.entries === 1 ? ' check-in' : ' check-ins') +
      ' · ' + history.total +
      (history.total === 1 ? ' weather selection' : ' weather selections') +
    '</p>' +
    '<div style="overflow-x:auto">' +
      '<table style="width:100%;border-collapse:collapse;font-size:14px">' +
        '<thead><tr style="border-bottom:1px solid var(--line);text-align:left">' +
          '<th style="padding:8px 4px">Weather</th>' +
          '<th style="padding:8px 4px;text-align:right">Count</th>' +
          '<th style="padding:8px 4px;text-align:right">Share</th>' +
        '</tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>' +
    '</div>' +
    '<p class="muted" style="font-size:12px;margin:0">' +
      'Share is the percentage of all weather selections in this period. ' +
      'A check-in with two feelings contributes one selection to each.' +
    '</p>' +
  '</div>';
}

function render(root) {
  const st = get();

  const COL = {
    sessions: '#1F55D0',
    cooked: '#E5893D',
    newfood: '#3E9E6E',
    breakfast: '#E5893D',
    restdays: '#D9A400',
    wins: '#D6698C',
    letters: '#3E9E6E',
    lanterns: '#3E9E6E'
  };

  const colourOf = g =>
    g.kind === 'own' ? AREAS.goal.colour : (COL[g.source] || AREAS.win.colour);

  const goal = g => {
    if (g.tick) {
      return '<button type="button" class="goal" data-goal="' + g.id + '">' +
        '<span class="lbl" style="text-transform:none;letter-spacing:0">' +
        esc(g.name) + '</span>' +
        '<span class="fresh">Not ticked off yet' +
        '<small>tick it from Goals on Home</small></span></button>';
    }

    const n = count(g);

    return '<button type="button" class="goal" data-goal="' + g.id + '">' +
      '<span class="lbl" style="text-transform:none;letter-spacing:0">' +
      esc(g.name) + '</span>' +
      (n
        ? '<span class="n">' + n + '<small> / ' + g.target +
          '</small></span><span class="bar"><i style="width:' +
          Math.max(3, Math.min(100, n / g.target * 100)) +
          '%;background:' + colourOf(g) + '"></i></span>'
        : '<span class="fresh">Ready when you are<small>counting up to ' +
          g.target + '</small></span>') +
      '</button>';
  };

  const active = st.goals.filter(g => !g.finished && !g.paused);
  const resting = st.goals.filter(g => !g.finished && g.paused);
  const finished = st.goals
    .filter(g => g.finished)
    .sort((a, b) => b.finished - a.finished);

  const ownActive = active.some(g => g.kind === 'own');

  const HILLS = {
    all: ['Everything', st.moments.map(m => m.date), '#D6698C', 'moments'],
    move: ['Gym', st.sessions.map(x => x.date), '#1F55D0', 'sessions'],
    cooked: [
      'Cooked',
      st.foods.filter(f => f.tags.includes('Cooked it myself')).map(f => f.date)
        .concat((st.meals || [])
          .filter(m => (st.myFoods || []).some(f => f.id === m.foodId && f.kind === 'home'))
          .map(m => m.date)),
      '#E5893D',
      'meals'
    ],
    rest: ['Rest days', [...new Set(st.rests.map(r => r.date))], '#D9A400', 'days']
  };

  const H = HILLS[hillKey] || HILLS.all;
  const notice = noticing(st);
  const wins = st.moments.filter(m => m.area === 'win').length;
  const lanterns = st.mind.filter(n => n.letGo).length;

  // Look-backs: your heaviest ever, and fun totals.
  const best = {};
  let lifted = 0;

  st.sessions.forEach(s => s.exercises.forEach(x => {
    if (x.swap || !EXERCISES[x.key] || EXERCISES[x.key].t !== 'wr') return;

    x.sets.forEach(z => {
      const w = Number(z.a) || 0;
      const r = Number(z.b) || 0;

      if ((st.units[x.key] || (x.key === 'legpress' ? 'plate' : 'kg')) === 'kg') {
        lifted += w * r;
      }

      if (!best[x.key] || w > best[x.key]) best[x.key] = w;
    });
  }));

  const bestList = Object.entries(best)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const elephants = lifted / 4000;
  const looks = [];

  bestList.forEach(([k, w]) => {
    looks.push([
      '#E4ECFF',
      'The heaviest you\'ve ever done on ' + EXERCISES[k].n.toLowerCase() +
      ': ' + w +
      ((st.units[k] || (k === 'legpress' ? 'plate' : 'kg')) === 'kg'
        ? ' kg'
        : ' (plate ' + w + ')')
    ]);
  });

  if (lifted > 0) {
    looks.push([
      '#FFF1C4',
      elephants >= 1
        ? 'All together you\'ve lifted about ' +
          (elephants >= 2 ? Math.floor(elephants) + ' elephants' : 'one whole elephant') + '.'
        : 'All together you\'ve lifted ' + Math.round(lifted).toLocaleString() +
          ' kg so far. An elephant is about 4,000.'
    ]);
  }

  root.innerHTML =
    '<a class="gear" href="#/settings" aria-label="Settings">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="3"/>' +
        '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
      '</svg></a>' +

    '<div class="hero">' +
      him('skate', 'breathe', 'Your character skating, feeling himself') +
      '<div class="txt"><h1>How far you\'ve come</h1>' +
      '<p class="say">Everything here only goes up.</p></div></div>' +

    '<div class="lbl">Your goals</div>' +
    '<div class="grid2">' + active.map(g => goal(g)).join('') +
      '<button type="button" class="goal newgoal" data-newgoal>' +
      '<b>+ New goal</b><span>tick off or count up</span></button></div>' +

    (ownActive
      ? '<button type="button" class="btn alt wide" data-loggoal>Tick off or log your own goals</button>'
      : '') +

    (resting.length
      ? '<div class="lbl">Resting for now</div><div class="trophies">' +
        resting.map(g => {
          const n = count(g);
          return '<button type="button" class="trophy resting" data-goal="' + g.id + '">' +
            '<span class="star">☾</span><span>' + esc(g.name) +
            '<small>' + (n ? n + ' so far, kept safe' : 'kept safe for later') +
            ' · tap to pick it back up</small></span></button>';
        }).join('') + '</div>'
      : '') +

    (finished.length
      ? '<div class="lbl">The finished shelf</div><div class="trophies">' +
        finished.map(g =>
          '<button type="button" class="trophy" data-goal="' + g.id + '">' +
          '<span class="star">★</span><span>' + esc(g.name) +
          '<small>' + (g.tick ? 'Ticked off' : g.target + ' ' + esc(unitOf(g))) +
          ' · ' + esc(prettyDate(dateKey(new Date(g.finished)))) +
          '</small></span></button>'
        ).join('') + '</div>'
      : '') +

    (() => {
      const ids = [...new Set((st.activities || []).map(a => a.type))];
      const c = (st.sessions.length
        ? [[st.sessions.length, st.sessions.length === 1 ? 'gym session' : 'gym sessions']]
        : []).concat(ids.map(id => {
          const d = actDef(id);
          const n = logsOf(id).length;
          return [
            n,
            d.unit === 'times'
              ? d.n.toLowerCase() + (n === 1 ? ' session' : ' sessions')
              : n === 1 ? d.unit.slice(0, -1) : d.unit
          ];
        }));

      return c.length
        ? '<div class="lbl">How you\'ve moved</div><div class="movecounts">' +
          c.map(x => '<div class="count"><b>' + x[0] +
            '</b><span>' + esc(x[1]) + '</span></div>').join('') + '</div>'
        : '';
    })() +

    (() => {
      const c = [
        [wins, 'tiny wins'],
        [lanterns, 'lanterns let go'],
        [st.letters.length, st.letters.length === 1 ? 'letter' : 'letters']
      ].filter(x => x[0] > 0);

      return c.length
        ? '<div class="grid' + (c.length === 1 ? '1' : c.length) + '">' +
          c.map(x => '<div class="count"><b>' + x[0] +
            '</b><span>' + x[1] + '</span></div>').join('') + '</div>'
        : '';
    })() +

    '<div class="grid2">' +
      '<a class="rowlink" href="#/sky?from=me"><span>Your sky</span><b>›</b></a>' +
      '<a class="rowlink" href="#/quilt?from=me"><span>Your quilt</span><b>›</b></a>' +
    '</div>' +

    '<a class="sharecta" href="#/share"><span><b>Share your story</b>' +
      '<small>Cards made from your sky, milestones and month</small></span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>' +
        '<path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>' +
      '</svg></a>' +

    '<div class="lbl">Looking back</div>' +

    '<div class="card"><b>Your hill</b>' +
      '<p class="muted" style="font-size:13px;margin:0">It only ever climbs. A break is just a flat bit of the path.</p>' +
      '<div class="chips">' +
        Object.keys(HILLS).map(k =>
          '<button type="button" class="chip small" data-hill="' + k +
          '" aria-pressed="' + (k === hillKey) + '">' +
          HILLS[k][0] + '</button>'
        ).join('') +
      '</div>' +
      hill(H[1], H[2], H[3]) +
    '</div>' +

    weatherHistoryHtml(st) +

    '<div class="card"><b>When you rest</b>' +
      '<p class="muted" style="font-size:13px;margin:0">All your rests on one clock. Your real pattern, no score.</p>' +
      restClock(st.rests) +
    '</div>' +

    (notice
      ? '<div class="lookback" style="background:#DFF0DC">' + esc(notice) + '</div>'
      : '') +

    (looks.length
      ? looks.map(l =>
          '<div class="lookback" style="background:' + l[0] + '">' +
          esc(l[1]) + '</div>'
        ).join('')
      : '') +

    nav('me');
}
