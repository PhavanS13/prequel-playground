
import { get, save, today } from './store.js';
import { meals, totalOf } from './nutrition.js';
import { esc, logDate, prettyDate } from './ui.js';

function dailyFood(date) {
  const list = meals().filter(meal => meal.date === date);
  let calories = 0;
  let protein = 0;
  let hasCalories = false;
  let hasProtein = false;

  list.forEach(meal => {
    const values = totalOf(meal);
    if (!values) return;

    if (values[0] != null && Number.isFinite(values[0])) {
      calories += values[0];
      hasCalories = true;
    }

    if (values[1] != null && Number.isFinite(values[1])) {
      protein += values[1];
      hasProtein = true;
    }
  });

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    hasCalories,
    hasProtein,
    count: list.length
  };
}

function dailyMovement(date) {
  const st = get();
  const moments = Array.isArray(st.moments) ? st.moments : [];
  const activities = Array.isArray(st.activities) ? st.activities : [];
  const sessions = Array.isArray(st.sessions) ? st.sessions : [];

  const moveMoments = moments.filter(
    item => item.date === date && item.area === 'move'
  );

  const activityCount = activities.filter(
    item => item.date === date
  ).length;

  const sessionCount = sessions.filter(
    item => item.date === date
  ).length;

  return {
    count: Math.max(moveMoments.length, activityCount + sessionCount)
  };
}

function readSteps(date) {
  const steps = get().fuelSteps || {};
  const value = steps[date];

  return Number.isInteger(value) && value >= 0 ? value : null;
}

function readTargets() {
  const saved = get().fuelTargets || {};

  const valid = value => {
    const n = Number(value);
    return value !== '' &&
      value != null &&
      Number.isFinite(n) &&
      n > 0;
  };

  return {
    calories: valid(saved.calories) ? Number(saved.calories) : null,
    protein: valid(saved.protein) ? Number(saved.protein) : null
  };
}

function progressHtml(label, amount, unit, target, available, key) {
  const current = available ? amount.toLocaleString() : '—';
  const hasTarget = target != null;
  const pct = hasTarget && available
    ? Math.min(100, Math.round(amount / target * 100))
    : 0;

  return `
    <div class="fuel-progress">
      <div class="fuel-progress-head">
        <span class="fuel-label">${label}</span>
        <strong class="fuel-fraction">
          ${current} / ${hasTarget ? target.toLocaleString() : '—'}
          <span>${unit}</span>
        </strong>
      </div>

      <div
        class="fuel-track"
        role="progressbar"
        aria-label="${label} progress"
        aria-valuemin="0"
        aria-valuemax="${hasTarget ? target : 100}"
        aria-valuenow="${hasTarget && available ? Math.min(amount, target) : 0}"
      >
        <div class="fuel-fill" style="width:${pct}%"></div>
      </div>

      <p class="fuel-caption">
        ${!hasTarget
          ? 'Add a recommended target below to see progress.'
          : !available
            ? 'Log food to calculate this total.'
            : amount >= target
              ? 'Target reached. This is a guide, not a limit.'
              : `${Math.round(target - amount).toLocaleString()} ${unit} to target`}
      </p>
    </div>
  `;
}

export function fuelCardHtml() {
  const date = logDate();
  const food = dailyFood(date);
  const movement = dailyMovement(date);
  const steps = readSteps(date);
  const targets = readTargets();
  const isToday = date === today();

  return `
    <section class="card fuel-card" aria-labelledby="fuel-heading">

      <header class="fuel-header">
        <div>
          <h2 id="fuel-heading">Food + Move</h2>
          <p class="muted fuel-subtitle">
            ${esc(prettyDate(date))} · Daily overview
          </p>
        </div>
        <span class="fuel-tag">Daily summary</span>
      </header>

      <div class="fuel-stats">
        <div class="fuel-stat">
          <span>Calories eaten</span>
          <strong>${food.hasCalories
            ? food.calories.toLocaleString()
            : '—'}</strong>
          <small>calories logged</small>
        </div>

        <div class="fuel-stat">
          <span>Protein eaten</span>
          <strong>${food.hasProtein
            ? food.protein.toLocaleString() + ' g'
            : '—'}</strong>
          <small>protein logged</small>
        </div>

        <div class="fuel-stat">
          <span>Move logs</span>
          <strong>${movement.count}</strong>
          <small>activities recorded</small>
        </div>

        <div class="fuel-stat">
          <span>Steps</span>
          <strong>${steps == null ? '—' : steps.toLocaleString()}</strong>
          <small>steps recorded</small>
        </div>
      </div>

      <section class="fuel-section" aria-labelledby="fuel-progress-title">
        <h3 id="fuel-progress-title">Nutrition progress</h3>

        ${progressHtml(
          'Calories',
          food.calories,
          'cal',
          targets.calories,
          food.hasCalories,
          'calories'
        )}

        ${progressHtml(
          'Protein',
          food.protein,
          'g',
          targets.protein,
          food.hasProtein,
          'protein'
        )}

        <p class="fuel-note">
          Food totals are estimates from your logged foods and portions.
          Your targets are optional guides, not limits on what you can eat.
        </p>
      </section>

      <details class="fuel-settings">
        <summary>Set daily nutrition targets</summary>

        <p class="muted fuel-help">
          Enter targets recommended for you by a qualified health professional.
          Leave a field blank if you do not have a recommended target.
        </p>

        <form data-fuel-target-form>
          <div class="fuel-fields">
            <label>
              <span>Calories (kcal)</span>
              <input
                name="calories"
                type="number"
                min="1"
                max="10000"
                step="1"
                inputmode="numeric"
                placeholder="Optional"
                value="${targets.calories ?? ''}"
              >
            </label>

            <label>
              <span>Protein (g)</span>
              <input
                name="protein"
                type="number"
                min="1"
                max="500"
                step="1"
                inputmode="numeric"
                placeholder="Optional"
                value="${targets.protein ?? ''}"
              >
            </label>
          </div>

          <button class="btn wide" type="submit">
            Save nutrition targets
          </button>

          <button class="btn ghost wide" type="button" data-fuel-clear>
            Clear targets
          </button>

          <p data-fuel-target-status role="status" aria-live="polite"></p>
        </form>
      </details>

      <section class="fuel-section">
        <h3>Daily steps</h3>

        <form data-fuel-form>
          <label class="fuel-input-label" for="fuel-steps">
            ${isToday ? "Today's step count" : 'Step count for this day'}
          </label>

          <div class="fuel-step-row">
            <input
              id="fuel-steps"
              name="steps"
              type="number"
              inputmode="numeric"
              min="0"
              max="200000"
              step="1"
              placeholder="Enter steps"
              value="${steps == null ? '' : steps}"
            >
            <button type="submit" class="btn">Save steps</button>
          </div>

          <p class="muted fuel-help">
            Enter the count from your device or tracker. Automatic health-app
            syncing is not connected yet.
          </p>

          <p data-fuel-status role="status" aria-live="polite"></p>
        </form>
      </section>

      <a class="fuel-food-link" href="#/food">
        Open Food to log meals and see exact nutrient details
        <span aria-hidden="true">›</span>
      </a>

    </section>

    <style>
      .fuel-card {
        margin: 0 0 4px;
        padding: 20px;
        border-radius: 20px;
        gap: 20px;
        width: 100%;
        min-width: 0;
      }

      .fuel-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }

      .fuel-header h2 {
        margin: 0 0 5px;
        font-size: 21px;
      }

      .fuel-subtitle {
        font-size: 13px;
        line-height: 1.5;
      }

      .fuel-tag {
        flex: 0 0 auto;
        padding: 6px 9px;
        border-radius: 10px;
        background: var(--room-2);
        font-size: 11px;
        font-weight: 800;
      }

      .fuel-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .fuel-stat {
        min-width: 0;
        padding: 15px;
        border: 1px solid var(--line);
        border-radius: 15px;
        background: var(--room);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }

      .fuel-stat > span {
        font-size: 13px;
        line-height: 1.4;
        color: var(--ink-soft);
        font-weight: 700;
      }

      .fuel-stat strong {
        font-size: clamp(21px, 5vw, 27px);
        line-height: 1.2;
        font-weight: 900;
        overflow-wrap: anywhere;
      }

      .fuel-stat small {
        font-size: 11px;
        line-height: 1.4;
        color: var(--ink-soft);
      }

      .fuel-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
      }

      .fuel-section h3 {
        font-size: 16px;
        font-weight: 900;
        margin: 0;
      }

      .fuel-progress {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .fuel-progress-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }

      .fuel-label {
        font-size: 14px;
        font-weight: 800;
      }

      .fuel-fraction {
        text-align: right;
        font-size: 17px;
        line-height: 1.3;
        overflow-wrap: anywhere;
      }

      .fuel-fraction span {
        font-size: 12px;
        color: var(--ink-soft);
        font-weight: 700;
      }

      .fuel-track {
        width: 100%;
        height: 10px;
        overflow: hidden;
        border-radius: 999px;
        background: var(--room-2);
      }

      .fuel-fill {
        height: 100%;
        border-radius: inherit;
        background: var(--blue);
        transition: width 180ms ease;
      }

      .fuel-caption,
      .fuel-note,
      .fuel-help {
        margin: 0;
        font-size: 12px;
        line-height: 1.55;
        color: var(--ink-soft);
      }

      .fuel-note {
        padding: 12px;
        border-radius: 12px;
        background: var(--room);
      }

      .fuel-settings {
        border-top: 1px solid var(--line);
        padding-top: 16px;
      }

      .fuel-settings summary {
        cursor: pointer;
        font-weight: 900;
        line-height: 1.5;
        padding: 4px 0;
      }

      .fuel-settings[open] summary {
        margin-bottom: 12px;
      }

      .fuel-settings form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 14px;
      }

      .fuel-fields {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .fuel-fields label {
        display: flex;
        flex-direction: column;
        gap: 7px;
        min-width: 0;
        font-size: 12px;
        line-height: 1.4;
        font-weight: 800;
      }

      .fuel-fields input,
      .fuel-step-row input {
        width: 100%;
        min-width: 0;
        min-height: 48px;
        padding: 10px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: var(--paper);
        font: inherit;
        font-size: 16px;
      }

      .fuel-step-row {
        display: flex;
        align-items: stretch;
        gap: 10px;
      }

      .fuel-step-row input {
        flex: 1;
      }

      .fuel-step-row .btn {
        flex: 0 0 auto;
        padding: 0 14px;
      }

      .fuel-input-label {
        display: block;
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 9px;
      }

      .fuel-food-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px;
        border-radius: 13px;
        background: var(--blue-soft);
        color: var(--blue);
        font-size: 13px;
        line-height: 1.5;
        font-weight: 900;
      }

      .fuel-food-link span {
        font-size: 22px;
        flex: 0 0 auto;
      }

      @media (max-width: 360px) {
        .fuel-card { padding: 14px; }
        .fuel-stats { gap: 8px; }
        .fuel-stat { padding: 11px; }
        .fuel-step-row { flex-direction: column; }
        .fuel-step-row .btn { width: 100%; }
        .fuel-fields { grid-template-columns: 1fr; }
      }
    </style>
  `;
}

export function bindFuelCard(root) {
  const stepsForm = root.querySelector('[data-fuel-form]');
  const targetForm = root.querySelector('[data-fuel-target-form]');
  const card = root.querySelector('.fuel-card');

  if (!card) return;

  if (stepsForm) {
    stepsForm.addEventListener('submit', event => {
      event.preventDefault();

      const input = stepsForm.querySelector('[name="steps"]');
      const status = stepsForm.querySelector('[data-fuel-status]');
      const raw = input.value.trim();
      const date = logDate();

      if (raw === '') {
        status.textContent = 'Enter a step count first.';
        input.focus();
        return;
      }

      const value = Number(raw);

      if (!Number.isSafeInteger(value) || value < 0 || value > 200000) {
        status.textContent = 'Enter a whole number from 0 to 200,000.';
        input.focus();
        return;
      }

      const st = get();
      st.fuelSteps = st.fuelSteps || {};
      st.fuelSteps[date] = value;
      save();

      const stepsValue = card.querySelectorAll('.fuel-stat strong')[3];
      if (stepsValue) stepsValue.textContent = value.toLocaleString();

      status.textContent = 'Steps saved for ' + prettyDate(date) + '.';
    });
  }

  if (targetForm) {
    targetForm.addEventListener('submit', event => {
      event.preventDefault();

      const status = targetForm.querySelector('[data-fuel-target-status]');
      const read = name => targetForm.elements[name].value.trim();

      const rawCalories = read('calories');
      const rawProtein = read('protein');

      const valid = (raw, max) =>
        raw === '' ||
        (Number.isInteger(Number(raw)) &&
          Number(raw) > 0 &&
          Number(raw) <= max);

      if (!valid(rawCalories, 10000) || !valid(rawProtein, 500)) {
        status.textContent =
          'Enter a positive whole number within the displayed limits, or leave it blank.';
        return;
      }

      const st = get();
      st.fuelTargets = {
        calories: rawCalories === '' ? null : Number(rawCalories),
        protein: rawProtein === '' ? null : Number(rawProtein)
      };

      save();

      // Refresh the panel so progress and targets update immediately.
      const wrapper = document.createElement('div');
      wrapper.innerHTML = fuelCardHtml();
      card.replaceWith(wrapper.firstElementChild);
      bindFuelCard(root);
    });
  }

  const clearButton = card.querySelector('[data-fuel-clear]');

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      const st = get();
      st.fuelTargets = { calories: null, protein: null };
      save();

      const wrapper = document.createElement('div');
      wrapper.innerHTML = fuelCardHtml();
      card.replaceWith(wrapper.firstElementChild);
      bindFuelCard(root);
    });
  }
}
