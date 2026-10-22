
import { get } from '../store.js';
import { esc, nav, backLink } from '../ui.js';

let range = 30;
let compare = 'sleep-mood';

const MOOD_GROUPS = {
  positive: ['Happy', 'Content', 'Relieved', 'Peaceful', 'Excited', 'Hopeful', 'Proud', 'Loved', 'Grateful', 'Calm'],
  difficult: ['Sad', 'Down', 'Overwhelmed', 'Anxious', 'Burnt out', 'Numb', 'Angry', 'Lonely', 'Stressed', 'Scared', 'Frustrated'],
};

const MOOD_LABELS = {
  positive: 'Positive mood',
  mixed: 'Mixed mood',
  difficult: 'Difficult mood',
};

const pad = n => String(n).padStart(2, '0');

function dayKey(date) {
  const d = new Date(date);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function shiftDay(key, amount) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + amount);
  return dayKey(date);
}

function dateLabel(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

function getMood(weather) {
  if (!weather?.length) return null;

  const names = weather.flatMap(w => Array.isArray(w.types) ? w.types : []);
  if (!names.length) return null;

  const positives = names.filter(n => MOOD_GROUPS.positive.includes(n)).length;
  const difficulties = names.filter(n => MOOD_GROUPS.difficult.includes(n)).length;

  if (positives > difficulties) return 'positive';
  if (difficulties > positives) return 'difficult';
  return 'mixed';
}

function getSleepMinutes(rests) {
  const valid = rests
    .filter(r => Number.isFinite(r.start) && Number.isFinite(r.end) && r.end > r.start)
    .map(r => r.end - r.start);

  if (!valid.length) return null;

  return Math.round(valid.reduce((sum, ms) => sum + ms / 60000, 0));
}

function fmtHours(minutes) {
  if (minutes == null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? h + 'h ' + m + 'm' : h + 'h';
}

function average(values) {
  const valid = values.filter(v => Number.isFinite(v));
  if (!valid.length) return null;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function fmtAverage(values, format = v => String(Math.round(v))) {
  const value = average(values);
  return value == null ? '—' : format(value);
}

function makeDays(st, period) {
  const today = dayKey(new Date());
  const earliest = period === 'all'
    ? ([
        ...(st.weather || []).map(x => x.date),
        ...(st.rests || []).map(x => x.date),
        ...(st.meals || []).map(x => x.date),
        ...(st.foods || []).map(x => x.date),
        ...(st.sessions || []).map(x => x.date),
        ...(st.activities || []).map(x => x.date),
        ...(st.moments || []).map(x => x.date),
      ].filter(Boolean).sort()[0] || today)
    : shiftDay(today, -(period - 1));

  const map = new Map();

  for (let key = earliest; key <= today; key = shiftDay(key, 1)) {
    map.set(key, {
      date: key,
      weather: [],
      rests: [],
      meals: [],
      foods: [],
      sessions: [],
      activities: [],
      moments: [],
    });
  }

  const add = (list, field) => {
    for (const item of list || []) {
      if (!item.date || item.date < earliest || item.date > today) continue;
      if (!map.has(item.date)) continue;
      map.get(item.date)[field].push(item);
    }
  };

  add(st.weather, 'weather');
  add(st.rests, 'rests');
  add(st.meals, 'meals');
  add(st.foods, 'foods');
  add(st.sessions, 'sessions');
  add(st.activities, 'activities');
  add(st.moments, 'moments');

  return [...map.values()].map(d => ({
    ...d,
    mood: getMood(d.weather),
    sleep: getSleepMinutes(d.rests),
    foodCount: d.meals.length + d.foods.length,
    movementCount: d.sessions.length + d.activities.length,
  }));
}

function countDays(days, predicate) {
  return days.filter(predicate).length;
}

function metric(value, sub = '') {
  return '<div class="ins-metric"><b>' + esc(value) + '</b>' +
    (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>';
}

function comparisonCard(title, leftLabel, leftValue, rightLabel, rightValue, note = '') {
  return '<section class="ins-card">' +
    '<div class="ins-card-title">' + esc(title) + '</div>' +
    '<div class="ins-pair">' +
      '<div class="ins-side"><small>' + esc(leftLabel) + '</small><b>' + esc(leftValue) + '</b></div>' +
      '<div class="ins-side"><small>' + esc(rightLabel) + '</small><b>' + esc(rightValue) + '</b></div>' +
    '</div>' +
    (note ? '<p class="ins-note">' + esc(note) + '</p>' : '') +
  '</section>';
}

function emptyState(title, detail) {
  return '<section class="ins-card ins-empty"><b>' + esc(title) + '</b><p>' +
    esc(detail) + '</p></section>';
}

function sleepMood(days) {
  const rested = days.filter(d => d.sleep != null && d.mood === 'positive');
  const difficult = days.filter(d => d.sleep != null && d.mood === 'difficult');
  const a = average(rested.map(d => d.sleep));
  const b = average(difficult.map(d => d.sleep));

  if (!rested.length || !difficult.length) {
    return emptyState(
      'Sleep and mood',
      'Log sleep and your inside weather on different days. Once there are both positive-mood and difficult-mood days with sleep logged, their average sleep can be compared here.'
    );
  }

  return comparisonCard(
    'Average sleep',
    'Positive mood days · ' + rested.length + ' days',
    fmtHours(a),
    'Difficult mood days · ' + difficult.length + ' days',
    fmtHours(b),
    'These are patterns in your logs, not proof that sleep caused a mood.'
  );
}

function foodMood(days) {
  const withFood = days.filter(d => d.foodCount > 0 && d.mood);
  const withoutFood = days.filter(d => d.foodCount === 0 && d.mood);

  if (!withFood.length || !withoutFood.length) {
    return emptyState(
      'Food and mood',
      'Log food and your inside weather across more days. This comparison needs mood logs from days both with and without food entries.'
    );
  }

  const positiveRate = group => {
    const positives = group.filter(d => d.mood === 'positive').length;
    return Math.round(positives / group.length * 100) + '%';
  };

  return comparisonCard(
    'Positive mood days',
    'Food logged · ' + withFood.length + ' days',
    positiveRate(withFood),
    'No food logged · ' + withoutFood.length + ' days',
    positiveRate(withoutFood),
    'No food log does not mean you did not eat. This compares logging patterns only.'
  );
}

function movementMood(days) {
  const active = days.filter(d => d.movementCount > 0 && d.mood);
  const quiet = days.filter(d => d.movementCount === 0 && d.mood);

  if (!active.length || !quiet.length) {
    return emptyState(
      'Movement and mood',
      'Log movement and your inside weather over time. This needs mood logs on both days with movement logged and days without movement logs.'
    );
  }

  const positiveRate = group => {
    const positives = group.filter(d => d.mood === 'positive').length;
    return Math.round(positives / group.length * 100) + '%';
  };

  return comparisonCard(
    'Positive mood days',
    'Movement logged · ' + active.length + ' days',
    positiveRate(active),
    'No movement log · ' + quiet.length + ' days',
    positiveRate(quiet),
    'This shows an association, not proof that movement changed your mood.'
  );
}

function sleepFood(days) {
  const withFood = days.filter(d => d.foodCount > 0 && d.sleep != null);
  const withoutFood = days.filter(d => d.foodCount === 0 && d.sleep != null);

  if (!withFood.length || !withoutFood.length) {
    return emptyState(
      'Sleep and food logs',
      'Log sleep on days both with and without food entries to compare the averages. An empty food log does not mean you skipped eating.'
    );
  }

  return comparisonCard(
    'Average sleep',
    'Food logged · ' + withFood.length + ' days',
    fmtHours(average(withFood.map(d => d.sleep))),
    'No food log · ' + withoutFood.length + ' days',
    fmtHours(average(withoutFood.map(d => d.sleep))),
    'A comparison of your records only; it does not tell us what caused the difference.'
  );
}

function overview(days) {
  const sleepDays = days.filter(d => d.sleep != null);
  const moodDays = days.filter(d => d.mood);
  const foodDays = days.filter(d => d.foodCount > 0);
  const moveDays = days.filter(d => d.movementCount > 0);

  return '<div class="ins-overview">' +
    '<div class="ins-stat"><small>Sleep logged</small><b>' + sleepDays.length + '</b><span>days</span></div>' +
    '<div class="ins-stat"><small>Mood logged</small><b>' + moodDays.length + '</b><span>days</span></div>' +
    '<div class="ins-stat"><small>Food logged</small><b>' + foodDays.length + '</b><span>days</span></div>' +
    '<div class="ins-stat"><small>Movement logged</small><b>' + moveDays.length + '</b><span>days</span></div>' +
  '</div>';
}

function render(root) {
  const st = get();
  const days = makeDays(st, range);
  const available = days.filter(d =>
    d.sleep != null || d.mood || d.foodCount || d.movementCount
  ).length;

  const choices = [
    ['sleep-mood', 'Sleep and mood'],
    ['food-mood', 'Food and mood'],
    ['movement-mood', 'Movement and mood'],
    ['sleep-food', 'Sleep and food logs'],
  ];

  let body = '';

  if (!available) {
    body = emptyState(
      'Your comparisons will appear here',
      'Start logging sleep, inside weather, food or movement. Insights will build from your own records.'
    );
  } else {
    if (compare === 'sleep-mood') body = sleepMood(days);
    if (compare === 'food-mood') body = foodMood(days);
    if (compare === 'movement-mood') body = movementMood(days);
    if (compare === 'sleep-food') body = sleepFood(days);
  }

  root.innerHTML =
    '<style>' +
      '.screen-insights{gap:12px}' +
      '.ins-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}' +
      '.ins-head h1{margin:0;line-height:1.08;letter-spacing:-.035em}' +
      '.ins-head p{margin:5px 0 0;color:var(--ink-soft);font-size:14px;line-height:1.45}' +
      '.ins-period{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}' +
      '.ins-period button,.ins-select{min-width:0;min-height:42px;border:1px solid var(--line);border-radius:12px;background:var(--paper);color:var(--ink);font:inherit;font-size:13px;font-weight:800}' +
      '.ins-period button[aria-pressed="true"]{background:var(--blue);border-color:var(--blue);color:white}' +
      '.ins-overview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}' +
      '.ins-stat{min-width:0;padding:10px 8px;border:1px solid var(--line);border-radius:14px;background:var(--paper);display:flex;flex-direction:column;gap:2px}' +
      '.ins-stat small{font-size:10px;line-height:1.25;color:var(--ink-soft);font-weight:800;overflow-wrap:anywhere}' +
      '.ins-stat b{font-size:23px;line-height:1.15;font-weight:900}' +
      '.ins-stat span{font-size:11px;color:var(--ink-soft)}' +
      '.ins-label{font-size:11px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft);margin:3px 0 0}' +
      '.ins-select{width:100%;padding:0 12px;font-size:14px}' +
      '.ins-card{min-width:0;padding:14px;border:1px solid var(--line);border-radius:17px;background:var(--paper);display:flex;flex-direction:column;gap:12px}' +
      '.ins-card-title{font-size:15px;font-weight:900;line-height:1.3;overflow-wrap:anywhere}' +
      '.ins-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}' +
      '.ins-side{min-width:0;padding:11px;border-radius:12px;background:var(--room);display:flex;flex-direction:column;gap:7px}' +
      '.ins-side small{font-size:11px;line-height:1.35;font-weight:800;color:var(--ink-soft);overflow-wrap:anywhere}' +
      '.ins-side b{font-size:clamp(19px,5vw,27px);line-height:1.1;letter-spacing:-.025em;overflow-wrap:anywhere}' +
      '.ins-note{margin:0;color:var(--ink-soft);font-size:12px;line-height:1.45;overflow-wrap:anywhere}' +
      '.ins-empty{gap:6px}' +
      '.ins-empty>b{font-size:15px;line-height:1.35}' +
      '.ins-empty p{margin:0;color:var(--ink-soft);font-size:13px;line-height:1.5;overflow-wrap:anywhere}' +
      '.ins-foot{margin:0;color:var(--ink-soft);font-size:11px;line-height:1.45}' +
      '@media(max-width:370px){.ins-overview{grid-template-columns:repeat(2,minmax(0,1fr))}.ins-side{padding:9px}.ins-pair{gap:6px}}' +
    '</style>' +
    '<div class="top">' + backLink() + '</div>' +
    '<header class="ins-head"><div><h1>Patterns</h1><p>How your days connect, based on what you log.</p></div></header>' +
    '<div class="ins-period" aria-label="Date range">' +
      [['7', 7], ['30', 30], ['All', 'all']].map(([label, value]) =>
        '<button type="button" data-range="' + value + '" aria-pressed="' + (range === value) + '">' + label + (value === 'all' ? '' : ' days') + '</button>'
      ).join('') +
    '</div>' +
    overview(days) +
    '<div class="ins-label">Choose a comparison</div>' +
    '<select class="ins-select" data-compare aria-label="Choose a comparison">' +
      choices.map(([value, label]) =>
        '<option value="' + value + '"' + (compare === value ? ' selected' : '') + '>' + label + '</option>'
      ).join('') +
    '</select>' +
    body +
    '<p class="ins-foot">Comparisons describe patterns in your records, not causes. Missing logs are not proof that something did not happen.</p>' +
    nav('home');

  root.querySelectorAll('[data-range]').forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.range;
      range = value === 'all' ? 'all' : Number(value);
      render(root);
    });
  });

  const select = root.querySelector('[data-compare]');
  select.addEventListener('change', () => {
    compare = select.value;
    render(root);
  });
}

export function mount(root) {
  render(root);
}
