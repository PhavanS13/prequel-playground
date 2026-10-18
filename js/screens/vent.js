import { get, save, uid } from '../store.js';
import { esc, nav, backLink, dateChip, logDate, timeOf, prettyDate } from '../ui.js';

let draft = '', strength = 'steady', saved = false;

export function mount(root) {
  render(root);
  root.addEventListener('input', e => {
    if (e.target.id !== 'ventText') return;
    draft = e.target.value;
    saved = false;
    const b = root.querySelector('[data-save]');
    if (b) b.disabled = !draft.trim();
  });
  root.addEventListener('click', e => {
    const t = e.target;
    let b;
    if ((b = t.closest('[data-s]'))) { strength = b.dataset.s; render(root); return; }
    if (t.closest('[data-save]')) {
      if (!draft.trim()) return;
      const st = get();
      st.vents = st.vents || [];
      st.vents.push({ id: uid(), date: logDate(), ts: Date.now(), text: draft.trim(), strength });
      draft = ''; saved = true; save(); render(root); return;
    }
    if ((b = t.closest('[data-del]'))) {
      if (!confirm('Delete this vent? This can\'t be undone.')) return;
      const st = get();
      st.vents = (st.vents || []).filter(v => v.id !== b.dataset.del);
      save(); render(root);
    }
  });
}

function render(root) {
  const st = get(), date = logDate();
  const vents = (st.vents || []).slice().sort((a, b) => b.ts - a.ts);
  root.innerHTML =
    '<div class="top">' + backLink() + dateChip() + '</div>' +
    '<div><h1>Vent</h1><p class="sub">Get it all out. Nobody reads this but you, and it doesn\'t have to make sense.</p></div>' +
    '<div class="card">' +
      '<textarea id="ventText" placeholder="What\'s on your mind?" aria-label="Write here">' + esc(draft) + '</textarea>' +
      '<div class="lbl">How heavy does it feel?</div>' +
      '<div class="seg">' + ['light', 'steady', 'strong'].map(s => '<button type="button" data-s="' + s + '" aria-pressed="' + (strength === s) + '">' + s[0].toUpperCase() + s.slice(1) + '</button>').join('') + '</div>' +
      '<button type="button" class="btn" data-save' + (draft.trim() ? '' : ' disabled') + '>Save it</button>' +
      (saved ? '<div class="say" style="color:var(--blue)">Out of your head and onto the page. That counts.</div>' : '') +
    '</div>' +
    (saved ? '<div class="card"><div class="lbl">If you want a next step</div><ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px"><li>A few slow breaths: in for 4, out for 6</li><li>Some water, or something small to eat</li><li>Message someone you trust</li></ul></div>' : '') +
    (vents.length
      ? '<div class="lbl">Your vents (' + vents.length + ')</div>' + vents.map(v =>
          '<details class="card"><summary><b>' + esc(prettyDate(v.date)) + '</b> ' + timeOf(v.ts) + ' &middot; ' + esc(v.strength) + '<br><span class="muted">' + esc(v.text.slice(0, 60)) + (v.text.length > 60 ? '...' : '') + '</span></summary>' +
          '<p style="white-space:pre-wrap;margin:10px 0">' + esc(v.text) + '</p>' +
          '<button type="button" class="btn danger" data-del="' + v.id + '">Delete</button></details>').join('')
      : '<p class="empty">Nothing saved yet. Whenever you\'re ready.</p>') +
    '<p class="sub">If it ever feels too big to hold on your own, tell someone you trust.</p>' +
    nav('mind');
}