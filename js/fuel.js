
import { get } from './store.js';
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
    hasProtein
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

function progressHtml(label, amount, unit, target, available) {
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

      <div class="fuel-track" role="progressbar"
        aria-label="${label} progress"
        aria-valuemin="0"
        aria-valuemax="${hasTarget ? target : 100}"
        aria-valuenow="${hasTarget && available ? Math.min(amount, target) : 0}">
        <div class="fuel-fill" style="width:${pct}%"></div>
      </div>

      <p class="fuel-caption">
        ${!hasTarget
          ? 'Set a target in Settings to see progress.'
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
  const targets = readTargets();

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
          <strong>${food.hasCalories ? food.calories.toLocaleString() : '—'}</strong>
          <small>calories logged</small>
        </div>
        <div class="fuel-stat">
          <span>Protein eaten</span>
          <strong>${food.hasProtein ? food.protein.toLocaleString() + ' g' : '—'}</strong>
          <small>protein logged</small>
        </div>
        <div class="fuel-stat">
          <span>Move logs</span>
          <strong>${movement.count}</strong>
          <small>activities recorded</small>
        </div>
      </div>

      <section class="fuel-section" aria-labelledby="fuel-progress-title">
        <h3 id="fuel-progress-title">Nutrition progress</h3>

        ${progressHtml('Calories', food.calories, 'cal',
          targets.calories, food.hasCalories)}

        ${progressHtml('Protein', food.protein, 'g',
          targets.protein, food.hasProtein)}

        <p class="fuel-note">
          Food totals are estimates from your logged foods and portions.
          Your targets are optional guides, not limits on what you can eat.
        </p>
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
      .fuel-header h2 { margin: 0 0 5px; font-size: 21px; }
      .fuel-subtitle { font-size: 13px; line-height: 1.5; }
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
      .fuel-section h3 { font-size: 16px; font-weight: 900; margin: 0; }
      .fuel-progress { display: flex; flex-direction: column; gap: 9px; }
      .fuel-progress-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }
      .fuel-label { font-size: 14px; font-weight: 800; }
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
      .fuel-caption, .fuel-note {
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
      .fuel-food-link span { font-size: 22px; flex: 0 0 auto; }
      @media (max-width: 360px) {
        .fuel-card { padding: 14px; }
        .fuel-stats { gap: 8px; }
        .fuel-stat { padding: 11px; }
      }
    </style>
  `;
}

export function bindFuelCard() {
  // Nutrition goals are managed in Settings.
}
