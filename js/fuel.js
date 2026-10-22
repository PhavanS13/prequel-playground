
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
    calories: hasCalories ? Math.round(calories).toLocaleString() : '—',
    protein: hasProtein ? Math.round(protein) + ' g' : '—',
    hasCalories,
    hasProtein
  };
}

function dailyMovement(date) {
  const st = get();

  const moments = Array.isArray(st.moments) ? st.moments : [];
  const logs = moments.filter(item =>
    item.date === date && item.area === 'move'
  );

  const sessions = Array.isArray(st.sessions) ? st.sessions : [];
  const sessionCount = sessions.filter(item => item.date === date).length;

  return {
    count: Math.max(logs.length, sessionCount)
  };
}

function readSteps(date) {
  const st = get();
  const steps = st.fuelSteps || {};
  const value = steps[date];

  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function fuelCardHtml() {
  const date = logDate();
  const food = dailyFood(date);
  const movement = dailyMovement(date);
  const steps = readSteps(date);
  const isToday = date === today();

  return `
    <section class="card fuel-card"
      aria-labelledby="fuel-heading"
      style="margin:16px 0;padding:18px;border-radius:18px">

      <div style="display:flex;justify-content:space-between;align-items:start;gap:12px">
        <div>
          <h2 id="fuel-heading" style="margin:0 0 4px">Food + Move</h2>
          <p class="muted" style="margin:0;font-size:13px">
            ${esc(prettyDate(date))} · Your daily summary
          </p>
        </div>
        <span class="muted" style="font-size:12px;text-align:right">
          Logged data
        </span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px">

        <div style="padding:12px;border-radius:12px;background:var(--paper,#FAF3DC)">
          <div class="muted" style="font-size:13px">Calories logged</div>
          <strong style="display:block;font-size:23px;margin-top:4px">
            ${food.calories}
          </strong>
        </div>

        <div style="padding:12px;border-radius:12px;background:var(--paper,#FAF3DC)">
          <div class="muted" style="font-size:13px">Protein logged</div>
          <strong style="display:block;font-size:23px;margin-top:4px">
            ${esc(food.protein)}
          </strong>
        </div>

        <div style="padding:12px;border-radius:12px;background:var(--paper,#FAF3DC)">
          <div class="muted" style="font-size:13px">Move logs</div>
          <strong style="display:block;font-size:23px;margin-top:4px">
            ${movement.count}
          </strong>
        </div>

        <div style="padding:12px;border-radius:12px;background:var(--paper,#FAF3DC)">
          <div class="muted" style="font-size:13px">Steps</div>
          <strong style="display:block;font-size:23px;margin-top:4px">
            ${steps == null ? '—' : steps.toLocaleString()}
          </strong>
        </div>
      </div>

      <form data-fuel-form style="margin-top:16px">
        <label for="fuel-steps" style="display:block;font-weight:700;margin-bottom:6px">
          ${isToday ? 'Enter today’s steps' : 'Enter steps for this day'}
        </label>

        <div style="display:flex;gap:8px;align-items:stretch">
          <input
            id="fuel-steps"
            name="steps"
            type="number"
            inputmode="numeric"
            min="0"
            max="200000"
            step="1"
            placeholder="Step count"
            value="${steps == null ? '' : steps}"
            aria-describedby="fuel-step-note"
            style="flex:1;min-width:0"
          >
          <button type="submit" class="btn">Save steps</button>
        </div>

        <p id="fuel-step-note" class="muted" style="font-size:12px;margin:8px 0 0">
          Enter a count from your device or tracker. Steps are manual for now;
          automatic health-app syncing is not connected.
        </p>

        <p data-fuel-status role="status" aria-live="polite"
          style="font-size:13px;margin:8px 0 0"></p>
      </form>
    </section>
  `;
}

export function bindFuelCard(root) {
  const form = root.querySelector('[data-fuel-form]');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();

    const input = form.querySelector('[name="steps"]');
    const status = form.querySelector('[data-fuel-status]');
    const raw = input.value.trim();
    const date = logDate();

    if (raw === '') {
      status.textContent = 'Enter a step count first.';
      input.focus();
      return;
    }

    const value = Number(raw);

    if (
      !Number.isSafeInteger(value) ||
      value < 0 ||
      value > 200000
    ) {
      status.textContent = 'Enter a whole number from 0 to 200,000.';
      input.focus();
      return;
    }

    const st = get();
    if (!st.fuelSteps || typeof st.fuelSteps !== 'object') {
      st.fuelSteps = {};
    }

    st.fuelSteps[date] = value;
    save();

    const display = form.closest('.fuel-card');
    const stepsValue = display?.querySelectorAll('strong')[3];

    if (stepsValue) {
      stepsValue.textContent = value.toLocaleString();
    }

    status.textContent = 'Steps saved for ' + prettyDate(date) + '.';
  });
}
