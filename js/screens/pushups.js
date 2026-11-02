
import { get, save, uid, today, addDays } from '../store.js';
import { esc, nav, prettyDate, toast, openSheet, closeSheet } from '../ui.js';

const VARIATIONS = [
  { id: 'wall', name: 'Wall push ups', detail: 'Standing, using a wall for support.' },
  { id: 'incline', name: 'Incline push ups', detail: 'Hands on a stable raised surface.' },
  { id: 'knee', name: 'Knee push ups', detail: 'A modified floor variation.' },
  { id: 'standard', name: 'Standard push ups', detail: 'The usual floor variation.' }
];

const MIN_TARGET = 1;
const MAX_TARGET = 8;

function ensurePlan() {
  const st = get();

  if (!st.pushupChallenge) {
    st.pushupChallenge = {
      started: false,
      variation: '',
      target: 3,
      sessions: [],
      paused: false
    };
  }

  if (!Array.isArray(st.pushupChallenge.sessions)) {
    st.pushupChallenge.sessions = [];
  }

  return st.pushupChallenge;
}

function variationName(id) {
  const v = VARIATIONS.find(x => x.id === id);
  return v ? v.name : 'Push ups';
}

function nextPracticeDate(lastDate) {
  return addDays(lastDate || today(), 2);
}

function sortedSessions(p) {
  return [...p.sessions].sort((a, b) =>
    (b.date || '').localeCompare(a.date || '')
  );
}

function totals(p) {
  return p.sessions.reduce((out, s) => {
    out.total += 1;
    out.reps += Number(s.reps) || 0;
    return out;
  }, { total: 0, reps: 0 });
}

function setupHtml(p) {
  const selected = p.variation || '';
  const setupVariation = selected !== '';

  return '<div class="card">' +
    '<div class="lbl">A flexible practice programme</div>' +
    '<h1>Push ups</h1>' +
    '<p class="muted">Build a comfortable routine at your own pace. There are no deadlines and no need to catch up on missed days.</p>' +
    '<div class="lbl">Choose a variation</div>' +
    '<div class="chips">' +
      VARIATIONS.map(v =>
        '<button type="button" class="chip small" data-variation="' + v.id +
        '" aria-pressed="' + (selected === v.id) + '">' +
        esc(v.name) + '</button>'
      ).join('') +
    '</div>' +
    (selected
      ? '<p class="muted">' +
          esc(VARIATIONS.find(v => v.id === selected).detail) +
        '</p>'
      : '<p class="muted">Choose the version that feels comfortable for you.</p>'
    ) +
    '<div class="lbl">Starting suggestion</div>' +
    '<div class="chips">' +
      [1, 2, 3, 4, 5].map(n =>
        '<button type="button" class="chip small" data-target="' + n +
        '" aria-pressed="' + (p.target === n) + '">' + n + '</button>'
      ).join('') +
    '</div>' +
    '<p class="muted">This is only a starting suggestion. You can change it whenever you need to.</p>' +
    '<p class="muted" style="font-size:12px">Stop if you feel pain, dizziness or unwell. You never need to push through discomfort.</p>' +
    '<button type="button" class="btn wide" data-begin' +
      (!setupVariation ? ' disabled' : '') + '>Start Push ups</button>' +
  '</div>';
}

function historyHtml(p) {
  const sessions = sortedSessions(p);

  if (!sessions.length) {
    return '<p class="muted">Your completed sessions will appear here.</p>';
  }

  return '<div class="actrecent">' +
    sessions.slice(0, 12).map(s =>
      '<div class="mgrow">' +
        '<span>' +
          esc(prettyDate(s.date)) +
          '<small>' + s.reps + ' reps · ' + esc(s.feedback || 'Logged') +
          (s.variation ? ' · ' + esc(variationName(s.variation)) : '') +
          '</small>' +
        '</span>' +
      '</div>'
    ).join('') +
  '</div>';
}

function activeHtml(p, summary, last, due, isDue, target) {
  const paused = p.paused;

  return '<div class="card">' +
    '<div class="lbl">' + (paused ? 'Paused' : 'Your current plan') + '</div>' +
    '<h2>' + esc(variationName(p.variation)) + '</h2>' +
    '<p class="muted">Your suggested session is a guide, not a requirement.</p>' +
    '<div class="grid2">' +
      '<div class="count"><b>' + summary.total + '</b><span>sessions</span></div>' +
      '<div class="count"><b>' + summary.reps + '</b><span>reps logged</span></div>' +
    '</div>' +
    (paused
      ? '<p class="muted">Your programme is paused. Your previous sessions are saved.</p>' +
        '<button type="button" class="btn wide" data-resume>Resume</button>'
      : isDue
        ? '<div class="lbl">Whenever you\'re ready</div>' +
          '<h2>' + target + ' comfortable reps</h2>' +
          '<p class="muted">Take your time. You can do fewer, change the variation or skip today.</p>' +
          '<button type="button" class="btn wide" data-session>Log a session</button>'
        : '<div class="lbl">Recovery time</div>' +
          '<h2>Next suggested day: ' + esc(prettyDate(due)) + '</h2>' +
          '<p class="muted">You have time to recover. There is no need to make up a session.</p>'
    ) +
    (last
      ? '<p class="muted" style="font-size:12px">Last session: ' +
          esc(prettyDate(last.date)) + ' · ' + last.reps + ' reps · ' +
          esc(last.feedback) + '</p>'
      : '') +
    '<button type="button" class="btn alt wide" data-pause>' +
      (paused ? 'Programme paused' : 'Pause programme') +
    '</button>' +
    '<button type="button" class="rowlink" data-change style="width:100%"><span>Change variation</span><b>›</b></button>' +
    '<button type="button" class="rowlink" data-reset style="width:100%"><span>Start over</span><b>›</b></button>' +
  '</div>' +

  '<div class="card">' +
    '<b>Your sessions</b>' +
    historyHtml(p) +
  '</div>';
}

function sessionSheet(p) {
  let reps = p.target;
  let feedback = 'About right';

  const draw = () =>
    '<h2>Log a session</h2>' +
    '<p class="muted">Record what you actually did. It does not have to match the suggestion.</p>' +
    '<label class="field-label" for="puReps">REPS COMPLETED</label>' +
    '<input id="puReps" type="number" min="0" max="200" step="1" value="' + reps + '">' +
    '<div class="lbl">How did that feel?</div>' +
    '<div class="chips">' +
      ['Easy', 'About right', 'Too difficult'].map(f =>
        '<button type="button" class="chip small" data-feedback="' + f +
        '" aria-pressed="' + (feedback === f) + '">' + f + '</button>'
      ).join('') +
    '</div>' +
    '<p class="muted">Your next suggestion will adjust gently based on your feedback.</p>' +
    '<button type="button" class="btn wide" data-save-session>Save session</button>' +
    '<button type="button" class="btn alt wide" data-close>Cancel</button>';

  const sheet = openSheet(draw(), ev => {
    const t = ev.target;
    const fb = t.closest('[data-feedback]');

    if (fb) {
      feedback = fb.dataset.feedback;
      sheet.querySelector('.sheet').innerHTML = draw();
      return;
    }

    if (!t.closest('[data-save-session]')) return;

    const field = sheet.querySelector('#puReps');
    const value = Number(field.value);

    if (!Number.isInteger(value) || value < 0 || value > 200) {
      field.focus();
      toast('Enter a valid number of reps.');
      return;
    }

    const session = {
      id: uid(),
      date: today(),
      ts: Date.now(),
      reps: value,
      feedback,
      variation: p.variation
    };

    p.sessions.push(session);

    if (feedback === 'Easy') {
      p.target = Math.min(MAX_TARGET, p.target + 1);
    } else if (feedback === 'Too difficult') {
      p.target = Math.max(MIN_TARGET, p.target - 1);
    }

    save();
    closeSheet();
    toast('Session saved.');
    renderPage();
  });
}

let root = null;

function renderPage() {
  if (!root) return;

  const p = ensurePlan();
  const summary = totals(p);
  const sessions = sortedSessions(p);
  const last = sessions[0] || null;
  const due = last ? nextPracticeDate(last.date) : today();
  const isDue = !last || today() >= due;

  root.innerHTML =
    '<div class="top">' +
      '<div class="lbl">Move</div>' +
    '</div>' +
    '<h1>Push ups</h1>' +
    (!p.started
      ? setupHtml(p)
      : activeHtml(p, summary, last, due, isDue, p.target)
    ) +
    nav('move');
}

function resetProgramme() {
  const p = ensurePlan();

  if (!p.resetArmed) {
    p.resetArmed = true;
    save();
    toast('Tap Start over again to confirm.');
    return;
  }

  p.started = false;
  p.paused = false;
  p.variation = '';
  p.target = 3;
  p.sessions = [];
  delete p.resetArmed;

  save();
  renderPage();
}

export function mount(el) {
  root = el;
  ensurePlan();
  renderPage();

  root.addEventListener('click', ev => {
    const t = ev.target;
    const variation = t.closest('[data-variation]');
    const target = t.closest('[data-target]');

    if (variation) {
      const p = ensurePlan();
      p.variation = variation.dataset.variation;
      save();
      renderPage();
      return;
    }

    if (target) {
      const p = ensurePlan();
      p.target = Number(target.dataset.target);
      save();
      renderPage();
      return;
    }

    if (t.closest('[data-begin]')) {
      const p = ensurePlan();

      if (!p.variation) {
        toast('Choose a variation first.');
        return;
      }

      p.started = true;
      p.paused = false;
      delete p.resetArmed;
      save();
      renderPage();
      return;
    }

    if (t.closest('[data-session]')) {
      const p = ensurePlan();
      if (!p.paused) sessionSheet(p);
      return;
    }

    if (t.closest('[data-pause]')) {
      const p = ensurePlan();
      p.paused = !p.paused;
      save();
      renderPage();
      toast(p.paused ? 'Programme paused.' : 'Programme resumed.');
      return;
    }

    if (t.closest('[data-resume]')) {
      const p = ensurePlan();
      p.paused = false;
      save();
      renderPage();
      return;
    }

    if (t.closest('[data-change]')) {
      const p = ensurePlan();
      openSheet(
        '<h2>Change variation</h2>' +
        '<p class="muted">Choose a comfortable version. Your previous sessions will stay saved.</p>' +
        '<div class="chips">' +
          VARIATIONS.map(v =>
            '<button type="button" class="chip small" data-new-variation="' + v.id +
            '" aria-pressed="' + (p.variation === v.id) + '">' +
            esc(v.name) + '</button>'
          ).join('') +
        '</div>' +
        '<button type="button" class="btn alt wide" data-close>Cancel</button>',
        e => {
          const b = e.target.closest('[data-new-variation]');
          if (!b) return;

          p.variation = b.dataset.newVariation;
          save();
          closeSheet();
          renderPage();
          toast('Variation updated.');
        }
      );
      return;
    }

    if (t.closest('[data-reset]')) {
      resetProgramme();
    }
  });
}

export function unmount() {
  root = null;
}
