
// Offline support: the app opens even with no signal.
// Change VERSION when you publish an update.
const VERSION = 'prequel-v59';

const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',

  // Core app files
  'js/app.js',
  'js/app-lock.js',
  'js/store.js',
  'js/data.js',
  'js/ui.js',
  'js/sky-model.js',
  'js/goals.js',
  'js/charts.js',
  'js/nutrition.js',
  'js/quotesoftheday.js',
  'js/fuel.js',
  'data/foods.json',

  // App screens
  'js/screens/home.js',
  'js/screens/weather.js',
  'js/screens/move.js',
  'js/screens/food.js',
  'js/screens/rest.js',
  'js/screens/wins.js',
  'js/screens/mind.js',
  'js/screens/vent.js',
  'js/screens/journal.js',
  'js/screens/minesweeper.js',
  'js/screens/breather.js',
  'js/screens/letters.js',
  'js/screens/days.js',
  'js/screens/me.js',
  'js/screens/sky.js',
  'js/screens/quilt.js',
  'js/screens/skate.js',
  'js/screens/settings.js',
  'js/screens/share.js',

  // Other app modules
  'js/cards.js',
  'js/pdf.js',
  'js/reports.js',
  'js/news.js',
  'js/cycle.js',
  'js/activities.js',
  'js/screens/movehub.js',

  // Fonts
  ...[
    'nunito-latin-500',
    'nunito-latin-700',
    'nunito-latin-800',
    'nunito-latin-900',
    'gaegu-latin-700'
  ].map(n => 'fonts/' + n + '-normal.woff2'),

  // App icons
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',

  // App artwork
  ...[
    'standing',
    'waving',
    'lying',
    'asleep',
    'eating',
    'cooking',
    'umbrella',
    'sunny',
    'nightwatch',
    'letter',
    'cheer',
    'stickynote',
    'skate',
    'legday',
    'sitting',
    'skatego',
    'afternoon',
    'cwalk',
    'cgrab',
    'cflip',
    'cfloat',
    'cmanual',
    'ccarve',
    'sewing'
  ].map(n => 'art/' + n + '.webp')
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache =>
        cache.addAll(
          SHELL.map(url =>
            new Request(url, { cache: 'reload' })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== VERSION)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(VERSION).then(cache => {
              cache.put('index.html', copy);
            });
          }

          return response;
        })
        .catch(() => caches.match('index.html'))
    );

    return;
  }

  event.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(
        event.request,
        { ignoreSearch: true }
      );

      const network = fetch(event.request)
        .then(response => {
          if (
            response &&
            response.ok &&
            (
              response.type === 'basic' ||
              response.type === 'cors'
            )
          ) {
            cache.put(event.request, response.clone());
          }

          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
