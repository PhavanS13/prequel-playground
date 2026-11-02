
import { get, save, uid, today } from '../store.js';
import { esc, nav, prettyDate, toast } from '../ui.js';

const DIFFICULTY = [
  'Very easy',
  'Easy',
  'About right',
  'Difficult',
  'Very difficult'
];

let root = null;
let checkInOpen = false;

function ensureChallenge() {
  const st = get();

  if (!st.pushupChallenge || typeof st.pushupChallenge !== 'object') {
    st.pushupChallenge = {
      sessions: []
    };
    save();
    return st.pushupChallenge;
  }

  const p = st.pushupChallenge;

  if (!Array.isArray(p.sessions)) {
    p.sessions = [];
    save();
    return p;
  }

  // Convert older session-based entries into one daily total.
  const grouped = new Map();

  p.sessions
    .filter(s => s && s.date)
    .sort((a, b) => (a.ts || 0) - (b.ts || 0))
    .forEach(s => {
      const date = String(s.date);
      const reps = Math.max(0, Number(s.reps) || 0);

      if (!grouped.has(date)) {
        grouped.set(date, {
          id: s.id || uid(),
          date,
          reps: 0,
          goal: null,
          feedback: '',
          checkedInAt: null
        });
      }

      const day = grouped.get(date);
      day.reps += reps;

      if (s.feedback) {
        day.feedback = s.feedback === 'Too difficult'
          ? 'Difficult'
          : s.feedback;
      }

      if (s.checkedInAt) {
        day.checkedInAt = s.checkedInAt;
      }

      if (s.goal != null && day.goal == null) {
        day.goal = Number(s.goal);
      }
    });

  const normalised = [...grouped.values()]
    .sort((a, b) => a.date.localeCompare(b.date));

  const changed =
    normalised.length !== p.sessions.length ||
    normalised.some((s, i) => {
      const old = p.sessions[i];
      return !old ||
        old.date !== s.date ||
        old.reps !== s.reps ||
        old.feedback !== s.feedback;
    });

  if (changed) {
    p.sessions = normalised;
    save();
  }

  return p;
}

function sortedDays(p) {
  return [...p.sessions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

function findDay(p, date) {
  return p.sessions.find(s => s.date === date) || null;
}

function suggestedGoal(p, date) {
  const previous = p.sessions
    .filter(s => s.date < date && s.feedback && s.reps > 0)
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (!previous) return null;

  let next = Number(previous.reps) || 0;

  switch (previous.feedback) {
    case 'Very easy':
      next += 1;
      break;

    case 'Easy':
      break;

    case 'About right':
      break;

    case 'Difficult':
      next = Math.max(1, next - 1);
      break;

    case 'Very difficult':
      next = Math.max(1, next - 2);
      break;

    default:
      return null;
  }

  return next;
}

function getOrCreateDay(p, date) {
  let day = findDay(p, date);

  if (!day) {
    day = {
      id: uid(),
      date,
      reps: 0,
      goal: suggestedGoal(p, date),
      feedback: '',
      checkedInAt: null
    };

    p.sessions.push(day);
  }

  return day;
}

function totalReps(p) {
  return p.sessions.reduce((sum, day) =>
    sum + (Number(day.reps) || 0), 0
  );
}

function historyHtml(p) {
  const days = sortedDays(p).filter(day => day.reps > 0);

  if (!days.length) {
    return '<p class="muted">Your daily totals will appear here after you log your first push up.</p>';
  }

  return '<div class="actrecent">' +
    days.slice(0, 14).map(day =>
      '<div class="mgrow">' +
        '<span>' +
          esc(prettyDate(day.date)) +
          '<small>' +
            day.reps + ' push ups' +
            (day.feedback
              ? ' · ' + esc(day.feedback)
              : ' · No check-in yet') +
          '</small>' +
        '</span>' +
      '</div>'
    ).join('') +
  '</div>';
}

function difficultyHtml() {
  return '<div class="card">' +
    '<div class="lbl">End-of-day check-in</div>' +
    '<h2>How did today’s total feel?</h2>' +
    '<p class="muted">Your answer helps suggest a comfortable goal for tomorrow. There is no wrong answer.</p>' +
    '<div class="chips">' +
      DIFFICULTY.map(choice =>
        '<button type="button" class="chip small" data-difficulty="' +
          esc(choice) + '">' +
          esc(choice) +
        '</button>'
      ).join('') +
    '</div>' +
    '<button type="button" class="btn alt wide" data-cancel-checkin>Not now</button>' +
  '</div>';
}

function mainHtml(p) {
  const date = today();
  const day = findDay(p, date);
  const reps = day ? Number(day.reps) || 0 : 0;
  const goal = day ? day.goal : suggestedGoal(p, date);
  const checkedIn = Boolean(day && day.feedback);
  const allTime = totalReps(p);

  return '<div class="card">' +
    '<div class="lbl">' + esc(prettyDate(date)) + '</div>' +
    '<h1>Push ups</h1>' +
    '<p class="muted">A daily count-up tracker. Tap the button once each time you complete a push up. Every tap adds to today’s total.</p>' +

    '<div class="count">' +
      '<b>' + reps + '</b>' +
      '<span>push ups today</span>' +
    '</div>' +

    (goal == null
      ? '<p class="muted">No daily goal yet. Log at your own pace and check in when you’re finished for the day.</p>'
      : '<p class="muted">Suggested daily goal: <b>' + goal +
        '</b>. This is flexible guidance, not a limit or a requirement.</p>'
    ) +

    '<button type="button" class="btn wide" data-add-one>+1 push up</button>' +
    '<button type="button" class="btn alt wide" data-undo' +
      (reps < 1 ? ' disabled' : '') +
      '>Undo one</button>' +

    (checkedIn
      ? '<p class="muted">Today’s check-in: <b>' +
          esc(day.feedback) +
        '</b>. You can keep logging; adding or undoing a rep will reopen your check-in.</p>'
      : reps > 0
        ? '<button type="button" class="btn alt wide" data-finish-checkin>Finish today’s check-in</button>'
        : '<p class="muted">Your end-of-day check-in will appear after you log a push up.</p>'
    ) +
  '</div>' +

  (checkInOpen && reps > 0 && !checkedIn
    ? difficultyHtml()
    : '') +

  '<div class="card">' +
    '<div class="lbl">Your progress</div>' +
    '<div class="grid2">' +
      '<div class="count"><b>' + allTime + '</b><span>total push ups</span></div>' +
      '<div class="count"><b>' + p.sessions.filter(s => s.reps > 0).length +
        '</b><span>days logged</span></div>' +
    '</div>' +
    '<p class="muted">Your progress is counted by day, not by individual sessions.</p>' +
  '</div>' +

  '<div class="card">' +
    '<b>Daily history</b>' +
    historyHtml(p) +
  '</div>' +

  '<div class="card">' +
    '<p class="muted">Take breaks when you need them. You can stop at any time, and you never need to push through pain or discomfort. Your suggested goal can stay the same or go down.</p>' +
  '</div>';
}

function renderPage() {
  if (!root) return;

  const p = ensureChallenge();

  root.innerHTML =
    '<div class="top">' +
      '<div class="lbl">Move</div>' +
    '</div>' +
    mainHtml(p) +
    nav('move');
}

export function mount(el) {
  root = el;
  checkInOpen = false;

  ensureChallenge();
  renderPage();

  root.addEventListener('click', ev => {
    const t = ev.target;

    if (t.closest('[data-add-one]')) {
      const p = ensureChallenge();
      const day = getOrCreateDay(p, today());

      day.reps = (Number(day.reps) || 0) + 1;

      if (day.feedback) {
        day.feedback = '';
        day.checkedInAt = null;
        toast('Count updated. Please check in again when you’re finished.');
      }

      save();
      renderPage();
      return;
    }

    if (t.closest('[data-undo]')) {
      const p = ensureChallenge();
      const day = findDay(p, today());

      if (!day || day.reps < 1) return;

      day.reps -= 1;

      if (day.feedback) {
        day.feedback = '';
        day.checkedInAt = null;
        toast('Count updated. Please check in again when you’re finished.');
      }

      save();
      renderPage();
      return;
    }

    if (t.closest('[data-finish-checkin]')) {
      checkInOpen = true;
      renderPage();
      return;
    }

    if (t.closest('[data-cancel-checkin]')) {
      checkInOpen = false;
      renderPage();
      return;
    }

    const choice = t.closest('[data-difficulty]');

    if (choice) {
      const p = ensureChallenge();
      const day = findDay(p, today());

      if (!day || day.reps < 1) {
        checkInOpen = false;
        renderPage();
        return;
      }

      day.feedback = choice.dataset.difficulty;
      day.checkedInAt = Date.now();

      save();
      checkInOpen = false;
      renderPage();

      toast('Daily check-in saved.');
    }
  });
}

export function unmount() {
  root = null;
  checkInOpen = false;
}
