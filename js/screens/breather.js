
import { esc, nav, backLink } from '../ui.js';

const ACTIVITIES = {
  breathing: {
    title: 'Slow breathing',
    intro: 'Follow a gentle rhythm. Keep your breathing comfortable, and stop whenever you want.',
    body: `
      <div id="breath-orb" style="display:flex;align-items:center;justify-content:center;width:150px;height:150px;margin:28px auto;border-radius:50%;background:var(--blue,#DCE7FF);color:var(--ink,#25304A);font-size:20px;font-weight:700;transform:scale(1);transition:transform 4s ease-in-out;text-align:center;">
        Ready
      </div>
      <p id="breath-cue" class="muted" aria-live="polite">Start whenever you feel ready.</p>
      <p class="muted">Breathe in gently for 4 seconds, then breathe out for 6. Do not hold your breath.</p>
      <button class="btn" type="button" data-start-breath>Begin</button>
      <button class="btn ghost" type="button" data-stop-breath hidden>Stop</button>
    `
  },
  grounding: {
    title: '5-senses grounding',
    intro: 'Bring your attention to the world around you, one small thing at a time.',
    body: `
      <p>Notice each sense at your own pace. You can write something down or simply notice it in your mind.</p>
      <label class="ground-step">
        <b>5 things you can see</b>
        <textarea rows="2" placeholder="Optional notes..." data-ground></textarea>
      </label>
      <label class="ground-step">
        <b>4 things you can feel</b>
        <textarea rows="2" placeholder="Optional notes..." data-ground></textarea>
      </label>
      <label class="ground-step">
        <b>3 things you can hear</b>
        <textarea rows="2" placeholder="Optional notes..." data-ground></textarea>
      </label>
      <label class="ground-step">
        <b>2 things you can smell</b>
        <textarea rows="2" placeholder="Optional notes..." data-ground></textarea>
      </label>
      <label class="ground-step">
        <b>1 thing you can taste, or a taste you remember</b>
        <textarea rows="2" placeholder="Optional notes..." data-ground></textarea>
      </label>
      <button class="btn ghost" type="button" data-clear-ground>Clear notes</button>
    `
  },
  focus: {
    title: 'Tiny focus reset',
    intro: 'Try a small observation challenge to give your attention something different to explore.',
    body: `
      <div class="card">
        <div class="lbl">YOUR PROMPT</div>
        <p id="focus-prompt" class="say" aria-live="polite"></p>
        <button class="btn" type="button" data-new-prompt>Another prompt</button>
      </div>
      <p class="muted">There is no score and no need to finish. Just notice what you notice.</p>
    `
  }
};

const PROMPTS = [
  'Find three things nearby with a curved edge.',
  'Notice one object with an interesting texture.',
  'Find two things that share a colour.',
  'Listen for the farthest-away sound you can hear.',
  'Look for a small detail you have not noticed before.',
  'Notice where your body is supported by the chair or floor.',
  'Find something that reminds you of a good memory.',
  'Choose an object and notice its shape, colour and shadows.',
  'Find something that was made from a natural material.',
  'Notice three different sources of light around you.'
];

const PHASES = [
  { label: 'Breathe in', seconds: 4, scale: 1.15 },
  { label: 'Breathe out', seconds: 6, scale: 0.9 }
];

let root = null;
let breathTimer = null;
let breathStep = 0;
let breathRunning = false;
let focusIndex = -1;

export function mount(r, params = {}) {
  root = r;

  const requested = params.activity;
  const activity = ACTIVITIES[requested] ? requested : 'breathing';

  render(activity);
  root.addEventListener('click', onClick);
}

export function unmount() {
  stopBreathing();

  if (root) {
    root.removeEventListener('click', onClick);
  }

  root = null;
}

function render(activity) {
  const selected = ACTIVITIES[activity];

  root.innerHTML =
    '<div class="top">' +
      backLink('#/home', 'Home') +
      '<h1>Wanna take a breather?</h1>' +
      '<p class="muted">Small ways to give your mind a little space.</p>' +
    '</div>' +

    '<div class="quick" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">' +
      Object.keys(ACTIVITIES).map(key =>
        '<a class="card" style="text-decoration:none;padding:12px;text-align:center" href="#/breather?activity=' +
          key + '"' +
          (key === activity ? ' aria-current="page"' : '') +
        '><b>' +
          ({ breathing: 'Breathing', grounding: '5 senses', focus: 'Focus reset' })[key] +
        '</b></a>'
      ).join('') +
    '</div>' +

    '<section class="card" style="margin-top:16px">' +
      '<div class="lbl">TAKE A MOMENT</div>' +
      '<h2>' + selected.title + '</h2>' +
      '<p>' + selected.intro + '</p>' +
      selected.body +
    '</section>' +

    '<p class="muted">These activities are optional. If one does not feel helpful, stop or try another.</p>' +
    nav('home');

  if (activity === 'focus') {
    nextPrompt();
  }
}

function onClick(event) {
  if (!root) return;

  if (event.target.closest('[data-start-breath]')) {
    startBreathing();
    return;
  }

  if (event.target.closest('[data-stop-breath]')) {
    stopBreathing();
    return;
  }

  if (event.target.closest('[data-new-prompt]')) {
    nextPrompt();
    return;
  }

  if (event.target.closest('[data-clear-ground]')) {
    root.querySelectorAll('[data-ground]').forEach(field => {
      field.value = '';
    });
  }
}

function startBreathing() {
  stopBreathing();

  breathRunning = true;
  breathStep = 0;

  const start = root.querySelector('[data-start-breath]');
  const stop = root.querySelector('[data-stop-breath]');

  if (start) start.hidden = true;
  if (stop) stop.hidden = false;

  tickBreathing();
}

function tickBreathing() {
  if (!breathRunning || !root) return;

  const phase = PHASES[breathStep % PHASES.length];
  const orb = root.querySelector('#breath-orb');
  const cue = root.querySelector('#breath-cue');

  if (orb) {
    orb.textContent = phase.label;
    orb.style.transform = 'scale(' + phase.scale + ')';
    orb.style.transitionDuration = phase.seconds + 's';
  }

  if (cue) {
    cue.textContent =
      phase.label + ' gently for ' + phase.seconds + ' seconds.';
  }

  breathTimer = setTimeout(() => {
    breathStep++;
    tickBreathing();
  }, phase.seconds * 1000);
}

function stopBreathing() {
  breathRunning = false;

  if (breathTimer) {
    clearTimeout(breathTimer);
    breathTimer = null;
  }

  if (!root) return;

  const orb = root.querySelector('#breath-orb');
  const cue = root.querySelector('#breath-cue');
  const start = root.querySelector('[data-start-breath]');
  const stop = root.querySelector('[data-stop-breath]');

  if (orb) {
    orb.textContent = 'Ready';
    orb.style.transform = 'scale(1)';
    orb.style.transitionDuration = '0.3s';
  }

  if (cue) {
    cue.textContent = 'Start whenever you feel ready.';
  }

  if (start) start.hidden = false;
  if (stop) stop.hidden = true;
}

function nextPrompt() {
  let next = Math.floor(Math.random() * PROMPTS.length);

  if (PROMPTS.length > 1 && next === focusIndex) {
    next = (next + 1) % PROMPTS.length;
  }

  focusIndex = next;

  const prompt = root && root.querySelector('#focus-prompt');

  if (prompt) {
    prompt.textContent = PROMPTS[focusIndex];
  }
}
