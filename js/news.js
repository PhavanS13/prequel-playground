
import { esc, openSheet, him } from './ui.js';
import { dayDate } from './pdf.js';

// What's new: newest releases first.
// Keep each release number aligned with VERSION in sw.js.
export const NEWS = [
  {
    v: 60,
    date: '2026-10-23',
    items: [
      'Set or change your daily calorie and protein goals in Settings.',
      'Your food summary compares your logged nutrition with the goals you choose.',
      'The Me page has a cleaner layout, with the extra Insights link removed.',
      'The weather ribbon has been updated to handle renamed weather labels.'
    ]
  },
  {
    v: 59,
    date: '2026-10-22',
    items: [
      'Food and Move now work together to show a daily summary of calories, protein and movement.',
      'You can set daily calorie and protein targets and track your progress throughout the day.',
      'Your movement and workout activity appears alongside your food log, helping you review your day in one place.'
    ]
  },
  {
    v: 58,
    date: '2026-10-18',
    items: [
      'Food and movement now share a clearer daily view.',
      'Your movement and workout activity is displayed alongside your food log.'
    ]
  },
  {
    v: 57,
    date: '2026-10-22',
    items: [
      'You can now optionally set a PIN lock in Settings.'
    ]
  },
  {
    v: 56,
    date: '2026-10-22',
    items: [
      'The mood check-in now has 24 emotions and feelings to choose from.',
      'Pick one feeling or combine two, and choose how strongly you feel them.',
      'Each mood has its own supportive reply and suggestions for things that might help.'
    ]
  },
  {
    v: 55,
    date: '2026-10-21',
    items: [
      'A new Breather section on Home gives you a few gentle ways to take a break.',
      'Try slow breathing, following a comfortable four-second inhale and six-second exhale.',
      'Use the 5-senses grounding activity or try a tiny focus reset when you want to turn your attention to something else.'
    ]
  },
  {
    v: 54,
    date: '2026-10-20',
    items: [
      'A new Journal page gives you a space to write about your thoughts, your days and anything in between.',
      'Save entries and come back to read them whenever you like.',
      'You can edit or delete an entry, and your journal is included in your Prequel data backup.'
    ]
  },
  {
    v: 53,
    date: '2026-10-18',
    items: [
      'You can now mark when you fell asleep or woke up as approximate, if you only remember roughly.',
      'Your sleep diary keeps that distinction, so you and your doctor can tell which times are estimates.'
    ]
  },
  {
    v: 52,
    date: '2026-10-18',
    items: [
      'Days has a calendar, making it easier to find a date and look back at your days.',
      'Your calendar is available offline too, so you can still use it without an internet connection.'
    ]
  },
  {
    v: 51,
    date: '2026-10-18',
    items: [
      'Four new weathers: Angry, Lonely, Stressed and Annoyed.',
      'Tap any weather and you will see "Things that might help", with ideas for that feeling.',
      'New on Mind: Vent. Write it all out, and it is saved just for you. You can read it back or delete it any time.',
      'Home has a "Today\'s thought", a new quote every day.',
      'Goals on Me can now be ticked off when you have done them.',
      'A new Minesweeper game is available under Skate on Home.'
    ]
  },
  {
    v: 50,
    date: '2026-10-18',
    items: [
      'You can now change or remove a log right on Move.',
      'Gym sessions can also be edited or removed directly from Move.'
    ]
  },
  {
    v: 49,
    date: '2026-10-17',
    items: [
      'Kickboxing and MMA are on Move now, with options for activity type, rounds and round length.',
      '"Lately" on Move now shows your most recent days first.'
    ]
  },
  {
    v: 48,
    date: '2026-10-17',
    items: [
      'Move now supports activities such as walks, runs, badminton, football, swimming, yoga and custom activities.',
      'Each activity can record relevant details, such as games, goals, laps or distance.',
      'You can log an activity or tap "Start now" to track its duration.',
      '"How\'s the body?" now sits at the top of Move.',
      'You can set your own milestones for each activity.',
      'This is a first version. Tell Phavan what is missing.'
    ]
  },
  {
    v: 47,
    date: '2026-10-17',
    items: [
      'The sleep diary has a new "Week by week" table showing typical rest, typical night, nights you woke, and your shortest to longest day.'
    ]
  },
  {
    v: 46,
    date: '2026-10-17',
    items: [
      'A private period tracker is available if you want it. Turn it on in Days → + → Cycle.',
      'Tap a day to mark it as a period day. Additional details are optional.',
      'After a couple of periods, Prequel estimates when the next one might start. It is only an estimate.',
      'The tracker stays on your phone and does not appear on share cards.'
    ]
  },
  {
    v: 45,
    date: '2026-10-17',
    items: [
      'The Awake card now has "Breathe with me", a slow breathing exercise.',
      '"Put it down for the morning" lets you write down what is on your mind.',
      'You can record what woke you, in your own words, if you want to.',
      'Choose how you woke up and add notes if you like.',
      '"Notes for your doctor" on Rest lets you record notes with the day and time.',
      'After a rough night, Move might gently suggest a Yellow day. You still choose.'
    ]
  },
  {
    v: 44,
    date: '2026-10-15',
    items: [
      'The update window now shows only the latest update. "See all updates" opens the complete list.'
    ]
  },
  {
    v: 43,
    date: '2026-10-15',
    items: [
      'You can mark a weight as "Not noted", choose "Bar only", or use "Body weight".',
      'Exercises can use "Body weight × reps", so you only need to enter reps.',
      'Each exercise has a menu to change its measurement, reorder it or remove it.',
      'In Days, you can correct details in a past workout.',
      'You can copy a completed session, and Move shows your latest workout.'
    ]
  },
  {
    v: 42,
    date: '2026-10-15',
    items: [
      'Move remembers the order you completed exercises in.',
      'Your next session shows "Last time" with the previous exercise order.',
      'Sessions live on Move. Open one to view it or copy it into another app.',
      'Rest has one "Awake for a bit?" button to record when you wake and return to sleep.',
      'The "0 patches" message no longer appears on Rest before your first night.'
    ]
  },
  {
    v: 41,
    date: '2026-10-15',
    items: [
      'Each new jar holds a randomly chosen number of stars.',
      'Jars come in different shapes and sizes.',
      'Paper stars come in different sizes too.',
      'A full jar gets an animation as it is sealed and added to your shelf.',
      'You can bring back a lantern you released by mistake or retrieve one later.',
      'Sticky notes on Mind are readable again in Cosy dark.'
    ]
  },
  {
    v: 40,
    date: '2026-10-15',
    items: [
      'After each update, Prequel tells you what is new, just once.',
      'You can read all updates again in Settings → What\'s new.'
    ]
  },
  {
    v: 39,
    date: '2026-10-15',
    items: [
      'On Android, reports and share cards have a "Save to this phone" button.',
      'Sharing your quilt in the middle of a month now shows a whole quilt.'
    ]
  },
  {
    v: 38,
    date: '2026-10-14',
    items: [
      'Restoring a backup is safer, with the file contents shown beside the current app data.',
      'After a restore, Prequel keeps a copy of your old data for seven days.',
      'Damaged backup files are rejected without changing the app.',
      '"Last backup" only updates when a backup was actually saved.'
    ]
  },
  {
    v: 37,
    date: '2026-10-14',
    items: [
      'You cannot log things for days that have not happened yet.',
      'The food page shows your top five usuals, with the rest in an "All your usuals" sheet.',
      'Move has a quick session option for tracking sets, reps or completed activities.',
      'Reports say "not yet" instead of creating an empty PDF when nothing has been logged.'
    ]
  }
];

export const LATEST = NEWS[0].v;

// Render one block per update.
export function newsHtml(entries) {
  return entries.map(n =>
    '<div class="newsday"><div class="lbl">' +
    esc(dayDate(n.date)) + ' · update ' + n.v +
    '</div><ul>' +
    n.items.map(t => '<li>' + esc(t) + '</li>').join('') +
    '</ul></div>'
  ).join('');
}

const head = title =>
  '<div class="newshead">' +
  him('letter', 'pop', 'Your character holding a note') +
  '<div><div class="k">Fresh from the workshop</div><h2>' +
  title + '</h2></div></div>';

const fullList = () =>
  head('What\'s new') +
  '<div class="newslist">' + newsHtml(NEWS) + '</div>' +
  '<button type="button" class="btn" data-close>Done</button>';

export function openNews(entries, all) {
  if (all) {
    openSheet(fullList());
    return;
  }

  const missed = entries.length - 1;

  const sheet = openSheet(
    head('A few new things') +
    '<div class="newslist">' +
    newsHtml(entries.slice(0, 1)) +
    '</div>' +
    (missed > 0
      ? '<div class="newsmore"><p>You also missed ' + missed +
        (missed === 1
          ? ' earlier update.'
          : ' earlier updates.') +
        '</p><button type="button" class="btn alt" data-allnews>See all updates</button></div>'
      : '') +
    '<p class="muted newswhere">Every update stays in Settings → What\'s new.</p>' +
    '<button type="button" class="btn" data-close>Got it</button>',
    ev => {
      if (ev.target.closest('[data-allnews]')) {
        const sh = sheet.querySelector('.sheet');

        if (sh) {
          sh.innerHTML = fullList();
          sh.scrollTop = 0;
        }
      }
    }
  );
}
