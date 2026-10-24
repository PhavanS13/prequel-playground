
import { get, today, addDays } from './store.js';
import {
  esc, openSheet, closeSheet, toast, IOS,
  canShareFile, saveToDevice, SAVED_NOTE
} from './ui.js';
import { Doc, SOFT, BODY, longDate, range, clock, shareFile } from './pdf.js';
import { WEATHERS } from './data.js';

const weatherColour = name =>
  (WEATHERS.find(w => w[0] === name) || [null, null, '#777A7D'])[2];

export function makeWeatherReport(from, to, label) {
  const entries = (get().weather || [])
    .filter(w => w.date >= from && w.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts);

  const days = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);

  const counts = {};
  entries.forEach(entry => {
    (entry.types || []).forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
    });
  });

  const ranked = Object.entries(counts)
    .sort((a, b) => b[1] - a[1]);

  const loggedDays = days.filter(d =>
    entries.some(entry => entry.date === d)
  ).length;

  const doc = new Doc('Weather report', range(from, to));
  doc.heading('My weather report', label + ' · ' + range(from, to));
  doc.para(
    'A record of the weather you chose to log. No weather is good or bad.',
    '600 24px ' + BODY,
    SOFT
  );

  doc.heading('At a glance');
  doc.tiles([
    [entries.length, 'check-ins'],
    [loggedDays, 'days with check-ins'],
    [ranked.length, 'different weathers logged']
  ]);

  doc.heading('Weather counts');
  if (ranked.length) {
    const total = ranked.reduce((sum, item) => sum + item[1], 0) || 1;
    doc.table(
      [
        { label: 'Weather', w: 440 },
        { label: 'Times logged', w: 250, right: true },
        { label: 'Share', w: 200, right: true }
      ],
      ranked.map(([name, count]) => ({
        cells: [
          name,
          count,
          Math.round(count / total * 100) + '%'
        ]
      })),
      { boldFirst: true, rh: 48, fs: 21 }
    );
  } else {
    doc.para('No weather check-ins were logged during this period.');
  }

  doc.heading('Day by day');
  const rows = [];

  days.forEach(day => {
    const list = entries.filter(entry => entry.date === day);

    if (!list.length) {
      rows.push({
        cells: [longDate(day), 'No check-in', '', ''],
        soft: [0, 1]
      });
      return;
    }

    list.forEach(entry => {
      rows.push({
        cells: [
          longDate(day),
          clock(entry.ts),
          (entry.types || []).join(' + '),
          entry.strength || ''
        ]
      });
    });
  });

  doc.table(
    [
      { label: 'Day', w: 330 },
      { label: 'Time', w: 170 },
      { label: 'Weather', w: 390 },
      { label: 'Strength', w: 150 }
    ],
    rows,
    { boldFirst: true, rh: 44, fs: 18 }
  );

  doc.para(
    'A check-in containing two weathers counts once for each selected weather. Percentages are shares of all weather selections, not shares of days.',
    '600 20px ' + BODY,
    SOFT
  );

  return doc.finish(
    'Weather report ' + from + ' to ' + to + '.pdf',
    'Weather · ' + range(from, to)
  );
}

function showReady(file) {
  openSheet(
    '<h2>Your weather report is ready</h2>' +
    '<p class="muted">' + esc(file.name) + '</p>' +
    (IOS
      ? '<button type="button" class="btn" data-sharepdf>Share or save the PDF</button>'
      : '<button type="button" class="btn" data-savepdf>Save to this device</button>' +
        (canShareFile(file)
          ? '<button type="button" class="btn alt" data-sharepdf>Share it</button>'
          : '')) +
    '<button type="button" class="btn ghost" data-close>Done</button>',
    async e => {
      if (e.target.closest('[data-savepdf]')) {
        saveToDevice(file);
        toast(SAVED_NOTE);
      } else if (e.target.closest('[data-sharepdf]')) {
        const result = await shareFile(file);
        if (result === 'saved') toast(SAVED_NOTE);
      }
    }
  );
}

export function openWeatherReport(from, to, label) {
  openSheet(
    '<h2>Making your weather report…</h2>' +
    '<p class="muted">Just a moment.</p>'
  );

  try {
    const file = makeWeatherReport(from, to, label);
    showReady(file);
  } catch (error) {
    closeSheet();
    toast('Something went wrong making the PDF.');
    console.error(error);
  }
}

export function chooseWeatherReport() {
  const end = today();
  const start = (get().weather || []).reduce(
    (earliest, entry) => entry.date < earliest ? entry.date : earliest,
    end
  );

  if (!(get().weather || []).length) {
    openSheet(
      '<h2>Your weather report starts with a check-in</h2>' +
      '<p class="muted">Log a weather first, then you can make a report here.</p>' +
      '<button type="button" class="btn" data-close>Okay</button>'
    );
    return;
  }

  const options = [
    ['Last 7 days', addDays(end, -6), end],
    ['Last 2 weeks', addDays(end, -13), end],
    ['Last month', addDays(end, -29), end],
    ['Everything logged', start, end]
  ];

  openSheet(
    '<h2>Weather report</h2>' +
    '<p class="muted">Choose the dates to include in your PDF.</p>' +
    options.map((o, i) =>
      '<button type="button" class="opt" data-weather-range="' + i + '">' +
      o[0] + '<small style="display:block;opacity:.7">' +
      esc(range(o[1], o[2])) + '</small></button>'
    ).join('') +
    '<button type="button" class="btn alt" data-close>Cancel</button>',
    e => {
      const b = e.target.closest('[data-weather-range]');
      if (!b) return;
      const o = options[Number(b.dataset.weatherRange)];
      openWeatherReport(o[1], o[2], o[0]);
    }
  );
}
