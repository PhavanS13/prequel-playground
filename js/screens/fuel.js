
import { get, save, today } from './store.js';
import { meals, sumDay } from './nutrition.js';
import { esc } from './ui.js';

function dailyTotals() {
  const list = meals().filter(m => m.date === today());
  const totals = sumDay(list);

  return {
    calories: totals.has[0] ? Math.round(totals.t[0]) : null,
    protein: totals.has[1] ? Math.round(totals.t[1] * 10) / 10 : null
  };
}

function loggedMovement() {
  const st = get();
  const activities = (st.activities || []).filter(a => a.date === today());
  const workouts = (st.sessions || []).filter(s => s.date === today());

  return {
    activities,
    workouts,
    count: activities.length + workouts.length
  };
}

function numberOrBlank(value) {
  const n = Number(value);
  return value !== '' && Number.isFinite(n) && n >= 0 ? n : null;
}

export function fuelCardHtml() {
  const st = get();
  const settings = st.settings || {};
  const steps = settings.fuelSteps == null ? '' : settings.fuelSteps;
  const calorieTarget = settings.fuelCalorieTarget == null
    ? ''
    : settings.fuelCalorieTarget;
  const proteinTarget = settings.fuelProteinTarget == null
    ? ''
    : settings.fuelProteinTarget;

  const totals = dailyTotals();
  const movement = loggedMovement();

  const targetLine = (label, actual, target, unit) => {
    const shown = actual == null ? 'Not logged yet' : actual.toLocaleString() + ' ' + unit;
    const goal = target === '' ? 'No target set' : 'Your target: ' + Number(target).toLocaleString() + ' ' + unit;

    return '<div class="fuel-stat"><span>' + label + '</span>' +
      '<b>' + shown + '</b><small>' + goal + '</small></div>';
  };

  return '<section class="card fuel-panel" aria-labelledby="fuel-title">' +
    '<h2 id="fuel-title">Food + Move</h2>' +
    '<p class="muted">A shared view of what you have logged today. Targets are optional and are values you choose with appropriate guidance; they are not calculated from steps or workouts.</p>' +
    '<div class="fuel-stats">' +
      targetLine('Calories logged', totals.calories, calorieTarget, 'Cal') +
      targetLine('Protein logged', totals.protein, proteinTarget, 'g') +
    '</div>' +
    '<div class="fuel-movement"><b>Movement logged today</b>' +
      '<p>' + movement.count + (movement.count === 1 ? ' entry' : ' entries') +
      ' from Move, including ' + movement.workouts.length +
      (movement.workouts.length === 1 ? ' gym session' : ' gym sessions') + '.</p>' +
    '</div>' +
    '<label class="field-label" for="fuel-steps">STEPS (OPTIONAL)</label>' +
    '<input id="fuel-steps" type="number" min="0" step="1" inputmode="numeric" value="' + esc(steps) + '" placeholder="Enter steps for today">' +
    '<p class="muted">Steps are entered manually for now. Prequel does not automatically read Apple Health or Health Connect.</p>' +
    '<details class="fuel-targets"><summary>Set personal targets</summary>' +
      '<p class="muted">Only enter targets you have chosen with a parent, doctor or qualified dietitian. Leaving them blank is fine.</p>' +
      '<label class="field-label" for="fuel-cal-target">DAILY CALORIE TARGET</label>' +
      '<input id="fuel-cal-target" type="number" min="0" step="50" inputmode="numeric" value="' + esc(calorieTarget) + '" placeholder="Optional">' +
      '<label class="field-label" for="fuel-protein-target">DAILY PROTEIN TARGET (G)</label>' +
      '<input id="fuel-protein-target" type="number" min="0" step="1" inputmode="numeric" value="' + esc(proteinTarget) + '" placeholder="Optional">' +
    '</details>' +
    '<div class="fuel-actions">' +
      '<a class="btn" href="#/food">Open Food</a>' +
      '<a class="btn alt" href="#/move">Open Move</a>' +
      '<button type="button" class="btn alt" data-fuel-save>Save steps and targets</button>' +
    '</div>' +
    '<p class="muted" id="fuel-status" role="status"></p>' +
  '</section>';
}

export function bindFuelCard(root) {
  if (!root || root.dataset.fuelBound === 'true') return;
  root.dataset.fuelBound = 'true';

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-fuel-save]');
    if (!button || !root.contains(button)) return;

    const stepsInput = root.querySelector('#fuel-steps');
    const calInput = root.querySelector('#fuel-cal-target');
    const proteinInput = root.querySelector('#fuel-protein-target');
    const status = root.querySelector('#fuel-status');

    const steps = numberOrBlank(stepsInput.value);
    const calories = numberOrBlank(calInput.value);
    const protein = numberOrBlank(proteinInput.value);

    if (stepsInput.value !== '' && steps == null) {
      status.textContent = 'Enter a valid non-negative step count.';
      return;
    }
    if (calInput.value !== '' && calories == null) {
      status.textContent = 'Enter a valid calorie target or leave it blank.';
      return;
    }
    if (proteinInput.value !== '' && protein == null) {
      status.textContent = 'Enter a valid protein target or leave it blank.';
      return;
    }

    const st = get();
    st.settings = st.settings || {};

    if (steps == null) delete st.settings.fuelSteps;
    else st.settings.fuelSteps = Math.floor(steps);

    if (calories == null) delete st.settings.fuelCalorieTarget;
    else st.settings.fuelCalorieTarget = calories;

    if (protein == null) delete st.settings.fuelProteinTarget;
    else st.settings.fuelProteinTarget = protein;

    save();
    status.textContent = 'Saved on this device.';
  });
}
