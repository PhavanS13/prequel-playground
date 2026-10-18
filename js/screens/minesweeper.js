import { get, save } from '../store.js';
import { nav, backLink, him } from '../ui.js';

const LEVELS = {
  easy: { n: 'Easy', c: 8, r: 8, m: 8 },
  medium: { n: 'Medium', c: 9, r: 10, m: 14 },
  hard: { n: 'Hard', c: 10, r: 12, m: 24 }
};

// the game's own styles live here, so app.css doesn't need touching. Removed again when you leave.
// Light theme first, then html[data-theme="dark"] overrides. Unopened squares are solid and raised,
// opened ones are flat and clearly different, so the board reads well on either background.
const CSS = '' +
  '.ms-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
  '.ms-stat{display:flex;flex-direction:column;padding:10px 12px;border-radius:16px;background:var(--paper);border:1px solid var(--line)}' +
  '.ms-stat b{font-size:22px;font-weight:900;font-variant-numeric:tabular-nums}' +
  '.ms-stat span{font-size:11px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em}' +
  '.ms-board{display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));gap:4px;padding:8px;border-radius:18px;background:#B9AA82;user-select:none;-webkit-user-select:none;touch-action:manipulation}' +
  '.ms-c{aspect-ratio:1;min-width:0;padding:0;border-radius:7px;border:2px solid #5E7FC9;background:#8FAAE6;box-shadow:inset 0 -3px 0 rgba(20,40,110,.28),inset 0 2px 0 rgba(255,255,255,.4);font-weight:900;font-size:clamp(14px,4.6vw,20px);display:flex;align-items:center;justify-content:center;line-height:1;color:#23262F}' +
  '.ms-c.open{background:#FFFDF6;border-color:#D8CCA8;box-shadow:none}' +
  '.ms-c.flag{background:#FFE08A;border-color:#D9A400;box-shadow:inset 0 -3px 0 rgba(120,80,0,.25),inset 0 2px 0 rgba(255,255,255,.5)}' +
  '.ms-c.boom{background:#F08C7C;border-color:#C2412D}' +
  '.ms-c.n1{color:#1F55D0}.ms-c.n2{color:#1E7A46}.ms-c.n3{color:#C2412D}.ms-c.n4{color:#6A45B8}.ms-c.n5{color:#B8651B}.ms-c.n6{color:#1F8585}.ms-c.n7{color:#23262F}.ms-c.n8{color:#5E584B}' +
  'html[data-theme="dark"] .ms-board{background:#0F0C0A}' +
  'html[data-theme="dark"] .ms-c{border-color:#8FA9FF;background:#4C6BC4;box-shadow:inset 0 -3px 0 rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.22);color:#F2E8DA}' +
  'html[data-theme="dark"] .ms-c.open{background:#241E19;border-color:#3A2F27;box-shadow:none}' +
  'html[data-theme="dark"] .ms-c.flag{background:#7A5F1E;border-color:#E0B84A;box-shadow:inset 0 -3px 0 rgba(0,0,0,.35),inset 0 2px 0 rgba(255,255,255,.2)}' +
  'html[data-theme="dark"] .ms-c.boom{background:#8A3326;border-color:#F0907B}' +
  'html[data-theme="dark"] .ms-c.n1{color:#8FB0FF}html[data-theme="dark"] .ms-c.n2{color:#6CC08F}html[data-theme="dark"] .ms-c.n3{color:#FF8F7A}html[data-theme="dark"] .ms-c.n4{color:#C3A6FF}html[data-theme="dark"] .ms-c.n5{color:#FFB36B}html[data-theme="dark"] .ms-c.n6{color:#5FD0D0}html[data-theme="dark"] .ms-c.n7{color:#F2E8DA}html[data-theme="dark"] .ms-c.n8{color:#BCAD9A}' +
  '.ms-bar{position:sticky;bottom:calc(var(--tabbar) + env(safe-area-inset-bottom,0px) + 10px);z-index:5;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px;border-radius:20px;background:var(--paper);border:1px solid var(--line);box-shadow:0 8px 24px rgba(0,0,0,.12)}' +
  '.ms-bar .btn{min-height:54px;font-size:16px}';

let root = null, styleEl = null, timer = null;
let level = 'easy', mode = 'clear', cells = [], started = false, over = false, won = false;
let flags = 0, opened = 0, secs = 0, hitIdx = -1, bestNote = '';

export function mount(r) {
  root = r;
  if (!styleEl) { styleEl = document.createElement('style'); styleEl.textContent = CSS; document.head.appendChild(styleEl); }
  newGame();
  render();
  root.addEventListener('click', e => {
    const t = e.target; let b;
    if ((b = t.closest('[data-i]'))) {
      if (over) return;
      const i = Number(b.dataset.i);
      if (mode === 'flag') toggleFlag(i); else reveal(i);
      render(); return;
    }
    if ((b = t.closest('[data-mode]'))) { mode = b.dataset.mode; render(); return; }
    if ((b = t.closest('[data-level]'))) { level = b.dataset.level; newGame(); render(); return; }
    if (t.closest('[data-new]')) { newGame(); render(); }
  });
}

export function unmount() {
  clearInterval(timer);
  if (styleEl) { styleEl.remove(); styleEl = null; }
}

function newGame() {
  const L = LEVELS[level];
  clearInterval(timer);
  cells = Array.from({ length: L.c * L.r }, () => ({ mine: false, open: false, flag: false, n: 0 }));
  started = false; over = false; won = false;
  flags = 0; opened = 0; secs = 0; hitIdx = -1; bestNote = '';
}

function around(i) {
  const L = LEVELS[level], x = i % L.c, y = Math.floor(i / L.c), out = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && nx < L.c && ny >= 0 && ny < L.r) out.push(ny * L.c + nx);
  }
  return out;
}

// mines are placed after your first tap, so the first square (and the ones around it) are always safe
function placeMines(safe) {
  const L = LEVELS[level], ban = new Set([safe].concat(around(safe))), pool = [];
  cells.forEach((_, i) => { if (!ban.has(i)) pool.push(i); });
  for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); const tmp = pool[k]; pool[k] = pool[j]; pool[j] = tmp; }
  pool.slice(0, L.m).forEach(i => { cells[i].mine = true; });
  cells.forEach((c, i) => { c.n = around(i).filter(j => cells[j].mine).length; });
}

function tick() {
  secs++;
  const el = root && root.querySelector('#ms-time');
  if (el) el.textContent = fmt(secs);
}
const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

function toggleFlag(i) {
  const c = cells[i];
  if (c.open) return;
  c.flag = !c.flag;
  flags += c.flag ? 1 : -1;
}

function reveal(i) {
  const c = cells[i];
  if (c.open || c.flag) return;
  if (!started) { started = true; placeMines(i); timer = setInterval(tick, 1000); }
  if (c.mine) { hitIdx = i; over = true; won = false; clearInterval(timer); return; }
  const stack = [i];
  while (stack.length) {
    const k = stack.pop(), q = cells[k];
    if (q.open || q.flag) continue;
    q.open = true; opened++;
    if (q.n === 0) around(k).forEach(j => { if (!cells[j].open && !cells[j].mine) stack.push(j); });
  }
  if (opened === cells.length - LEVELS[level].m) win();
}

function win() {
  over = true; won = true; clearInterval(timer);
  cells.forEach(c => { if (c.mine && !c.flag) { c.flag = true; flags++; } });
  const st = get();
  st.games = st.games || {};
  const g = st.games.minesweeper = st.games.minesweeper || {};
  if (!g[level]) bestNote = 'Your first one cleared on ' + LEVELS[level].n.toLowerCase() + '.';
  else if (secs < g[level]) bestNote = 'A new best time.';
  if (!g[level] || secs < g[level]) g[level] = secs;
  save();
}

function cellHtml(c, i) {
  const L = LEVELS[level];
  let cls = 'ms-c', txt = '';
  if (c.open) { cls += ' open'; if (c.n) { txt = c.n; cls += ' n' + c.n; } }
  else if (c.flag) { cls += ' flag'; txt = '🚩'; }
  else if (over && !won && c.mine) { cls += i === hitIdx ? ' open boom' : ' open'; txt = '💣'; }
  return '<button type="button" class="' + cls + '" data-i="' + i + '" aria-label="Square ' + (Math.floor(i / L.c) + 1) + ', ' + (i % L.c + 1) + '">' + txt + '</button>';
}

function render() {
  const L = LEVELS[level], st = get();
  const best = (st.games && st.games.minesweeper && st.games.minesweeper[level]) || 0;
  root.innerHTML =
    '<div class="top">' + backLink('#/home', 'Home') + '</div>' +
    '<div><h1>Minesweeper</h1><p class="sub">Clear every safe square without touching a mine. A number tells you how many mines are next to that square. Pick <b>Clear square</b> or <b>Flag mine</b> at the bottom, then tap a square.</p></div>' +
    '<div class="chips">' + Object.keys(LEVELS).map(k => '<button type="button" class="chip small" data-level="' + k + '" aria-pressed="' + (k === level) + '">' + LEVELS[k].n + '</button>').join('') + '</div>' +
    '<div class="ms-stats">' +
      '<div class="ms-stat"><b>' + (L.m - flags) + '</b><span>Mines left</span></div>' +
      '<div class="ms-stat"><b id="ms-time">' + fmt(secs) + '</b><span>Time</span></div>' +
      '<div class="ms-stat"><b>' + (best ? fmt(best) : '-') + '</b><span>Best</span></div>' +
    '</div>' +
    '<div class="ms-board" style="--cols:' + L.c + '">' + cells.map(cellHtml).join('') + '</div>' +
    (over
      ? (won
        ? '<div class="card done">' + him('cheer', 'pop', 'Your character jumping with joy') + '<div class="big">Cleared it.</div><p class="muted">Done in ' + fmt(secs) + '. ' + bestNote + '</p><button type="button" class="btn" data-new>Play again</button></div>'
        : '<div class="card"><div class="say">Boom. Mines happen.</div><p class="muted">No harm done. Want another go?</p><button type="button" class="btn" data-new>New game</button></div>')
      : '') +
    '<div class="ms-bar">' +
      '<button type="button" class="btn' + (mode === 'clear' ? '' : ' alt') + '" data-mode="clear" aria-pressed="' + (mode === 'clear') + '">Clear square</button>' +
      '<button type="button" class="btn' + (mode === 'flag' ? '' : ' alt') + '" data-mode="flag" aria-pressed="' + (mode === 'flag') + '">🚩 Flag mine</button>' +
    '</div>' +
    '<button type="button" class="btn ghost" data-new>New game</button>' +
    nav('home');
}