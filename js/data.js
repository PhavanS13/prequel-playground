
 // Fixed content: your Project Athletic playbook, the moods, and the parts of life.
export const AREAS = {
  move: { name: 'Move', colour: '#1F55D0' },
  food: { name: 'Food', colour: '#E5893D' },
  rest: { name: 'Rest', colour: '#D9A400' },
  win: { name: 'Tiny win', colour: '#D6698C' },
  mind: { name: 'Mind', colour: '#3E9E6E' },
  goal: { name: 'Your goals', colour: '#7A5BC7' }
};

// t: wr = weight × reps, hold = seconds, mins = minutes. rest: c = compound, i = isolation. m = machine (kg or plate #)
export const EXERCISES = {
  legpress: { n: 'Leg press', t: 'wr', m: 1, rest: 'c', subs: ['Smith squat', 'Goblet squat', 'Split squat'] },
  chest: { n: 'Chest press', t: 'wr', m: 1, rest: 'c', subs: ['Flat dumbbell press', 'Incline dumbbell press', 'Smith press'] },
  incline: { n: 'Incline press', t: 'wr', m: 1, rest: 'c', subs: ['Incline dumbbells', 'Flat press'] },
  lat: { n: 'Lat pulldown', t: 'wr', m: 1, rest: 'c', subs: ['Assisted pull-up', 'Another pulldown station'] },
  row: { n: 'Seated cable row', t: 'wr', m: 1, rest: 'c', subs: ['Machine row', 'Chest-supported dumbbell row'] },
  shoulder: { n: 'Shoulder press', t: 'wr', m: 1, rest: 'c', subs: ['Seated dumbbell press'] },
  curl: { n: 'Biceps curl', t: 'wr', m: 0, rest: 'i', subs: ['Dumbbell curl', 'Fixed-bar curl', 'Hammer curl'] },
  hammer: { n: 'Hammer curl', t: 'wr', m: 0, rest: 'i', subs: ['Dumbbell curl'] },
  tri: { n: 'Triceps pushdown', t: 'wr', m: 1, rest: 'i', subs: ['Overhead dumbbell extension', 'Machine extension'] },
  ohtri: { n: 'Overhead triceps ext.', t: 'wr', m: 0, rest: 'i', subs: ['Cable pushdown'] },
  crunch: { n: 'Ab crunch', t: 'wr', m: 1, rest: 'i', subs: ['Cable crunch', 'Plank'] },
  legcurl: { n: 'Seated leg curl', t: 'wr', m: 1, rest: 'c', subs: ['Romanian deadlift', 'Swiss-ball hamstring curl'] },
  rdl: { n: 'Romanian deadlift', t: 'wr', m: 0, rest: 'c', subs: ['Seated leg curl'] },
  legext: { n: 'Leg extension', t: 'wr', m: 1, rest: 'i', subs: ['Split squat', 'Step-up'] },
  calf: { n: 'Dumbbell calf raise', t: 'wr', m: 0, rest: 'i', subs: ['Calf machine'] },
  plank: { n: 'Plank', t: 'hold', m: 0, rest: 'i', subs: ['Ab crunch'] },
  face: { n: 'Face pulls', t: 'wr', m: 1, rest: 'i', subs: ['Reverse fly'] },
  lateral: { n: 'Lateral raise', t: 'wr', m: 0, rest: 'i', subs: ['Cable lateral raise'] },
  split: { n: 'Split squat', t: 'wr', m: 0, rest: 'c', each: 1, subs: ['Step-up'] },
  pallof: { n: 'Pallof press', t: 'wr', m: 1, rest: 'i', subs: ['Plank'] },
  walk: { n: 'Easy walk / cycle / row', t: 'mins', m: 0, rest: null, subs: ['Cycle', 'Rower'] },
  mobility: { n: 'Mobility / stretching', t: 'mins', m: 0, rest: null, subs: [] }
};

const C = '8-12', I = '10-15';

export const WORKOUTS = [
  { id: 'fbA', n: 'Full Body A', d: 'your main general session', items: [['legpress', '2-3', C], ['chest', '2-3', C], ['lat', '2-3', C], ['shoulder', '2', C], ['curl', '2', I], ['crunch', '2', I]] },
  { id: 'fbB', n: 'Full Body B', d: 'posterior chain + rows', items: [['legcurl', '2-3', C], ['row', '2-3', C], ['legext', '2', I], ['chest', '2', C], ['tri', '2', I], ['calf', '2', '12-20'], ['plank', '2', '20-60s']] },
  { id: 'tbe', n: 'Total Body Essential', d: 'only one gym day this week', items: [['legpress', '2-3', C], ['chest', '2-3', C], ['lat', '2-3', C], ['row', '2', C], ['shoulder', '2', C], ['legcurl', '2', C], ['curl', '2', I], ['tri', '2', I], ['calf', '2', '12-20'], ['crunch', '2', I]] },
  { id: 'min20', n: '20-Minute Minimum', d: 'okay body, terrible motivation', items: [['legpress', '2', C], ['chest', '2', C], ['lat', '2', C]] },
  { id: 'rec', n: 'Recovery / Light', d: 'want to go, not recovered', items: [['walk', '1', '10-20 min'], ['face', '2', '12-15'], ['plank', '2', '20-45s'], ['calf', '2', 'easy'], ['mobility', '1', '5-10 min']] },
  { id: 'uA', n: 'Upper A', d: 'horizontal push + vertical pull', items: [['chest', '2-3', C], ['lat', '2-3', C], ['row', '2', C], ['shoulder', '2', C], ['face', '2', '12-15'], ['curl', '2', I], ['tri', '2', I]] },
  { id: 'lA', n: 'Lower A', d: 'quad emphasis', items: [['legpress', '2-3', C], ['legext', '2', I], ['legcurl', '2', I], ['calf', '2', '12-20'], ['crunch', '2', I]] },
  { id: 'uB', n: 'Upper B', d: 'incline + back / shoulders', items: [['incline', '2-3', C], ['row', '2-3', C], ['lat', '2', C], ['lateral', '2', '12-20'], ['face', '2', '12-15'], ['hammer', '2', I], ['ohtri', '2', I]] },
  { id: 'lB', n: 'Lower B', d: 'hamstring / hip hinge', items: [['rdl', '2-3', C], ['legpress', '2', I], ['legcurl', '2', I], ['split', '2', '8-12 each'], ['calf', '2', '12-20'], ['pallof', '2', I]] },
  { id: 'push', n: 'Push', d: 'chest, shoulders, triceps', items: [['chest', '2-3', C], ['shoulder', '2', C], ['incline', '2', C], ['lateral', '2', '12-20'], ['tri', '2', I]] },
  { id: 'pull', n: 'Pull', d: 'lats, back, rear delts, biceps', items: [['lat', '2-3', C], ['row', '2-3', C], ['face', '2', '12-15'], ['curl', '2', I], ['hammer', '2', I]] },
  { id: 'legs', n: 'Legs', d: 'quads, hams, glutes, calves, core', items: [['legpress', '2-3', C], ['legcurl', '2', I], ['rdl', '2', C], ['legext', '2', I], ['calf', '2', '12-20'], ['crunch', '2', I]] }
];

export const REST_GUIDE = { c: '1:30–2:00', i: '1:00–1:30' };

const CLOUD = 'M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z';
const CLOUD_UP = 'M7 14h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 7a3.5 3.5 0 0 0 1 7z';

// name, meaning, colour, icon, reply, character pose
export const WEATHERS = [
  ['Happy', 'joyful, upbeat', '#F4C430', '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 3 4 3 4-3 4-3M8 9h.01M16 9h.01"/>', 'There it is. Let yourself enjoy the good stuff.', 'cheer'],
  ['Content', 'comfortable, satisfied', '#F2A65A', '<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 7v3M5 11l2 1.5M19 11l-2 1.5"/>', 'That soft kind of good. You can stay here a while.', 'skate'],
  ['Mixed', 'a bit of everything', '#9FB8E8', '<path d="M8 3v1.5M3.5 7.5H5M4.6 4.6l1 1"/><circle cx="8.5" cy="8.5" r="2.8"/><path d="M9 19h8a3.5 3.5 0 0 0 .4-6.98A5 5 0 0 0 8 13a3 3 0 0 0 1 6z"/>', 'A bit of everything. You do not have to pick just one feeling.', 'standing'],
  ['Meh', 'flat, unmotivated', '#A9A398', '<path d="' + CLOUD + '"/>', 'Some days are just meh. You do not have to force it.', 'standing'],
  ['Confused', 'uncertain, unsure what to think', '#B8B2A6', '<path d="M4 9h16M6 13h12M4 17h16"/>', 'You do not need to figure everything out at once. Just the next step.', 'standing'],
  ['Sad', 'low, a bit hurt', '#6F96D0', '<path d="' + CLOUD_UP + '"/><path d="M9 18v.5M13 19v.5M16 17v.5"/>', 'It is okay to feel sad. You do not have to pretend otherwise.', 'umbrella'],
  ['Down', 'really low, having a hard time', '#3F68B0', '<path d="' + CLOUD_UP + '"/><path d="M8 17l-1 4M12 17l-1 4M16 17l-1 4"/>', 'You do not have to fix everything today. Just being here is enough.', 'umbrella'],
  ['Overwhelmed', 'too much happening at once', '#7A55C0', '<path d="' + CLOUD_UP + '"/><path d="M12 15l-2 4h3l-2 4"/>', 'That is a lot to carry. Let us take one thing at a time.', 'umbrella'],
  ['Anxious', 'restless, worried, on edge', '#4FA89A', '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"/>', 'Everything can feel unsettled when you are anxious. Take one slow breath.', 'standing'],
  ['Burnt out', 'exhausted, running on empty', '#E0663A', '<circle cx="12" cy="9" r="3.5"/><path d="M12 2.5v1.5M5.5 9H7M17 9h1.5M7.4 4.4l1 1M16.6 4.4l-1 1M4 17c2-1.5 4 1.5 6 0s4 1.5 6 0 3 .5 4 0M4 21c2-1.5 4 1.5 6 0s4 1.5 6 0 3 .5 4 0"/>', 'You have been carrying a lot. Rest is allowed, even before everything is done.', 'nightwatch'],
  ['Numb', 'disconnected, hard to feel much', '#8FA9C7', '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>', 'You do not have to force a feeling. Take things gently for now.', 'asleep'],
  ['Relieved', 'lighter after something difficult', '#C77BD6', '<path d="M3 18a9 9 0 0 1 18 0M6.5 18a5.5 5.5 0 0 1 11 0M10 18a2 2 0 0 1 4 0"/>', 'You made it through that part. Let yourself breathe a little.', 'cheer'],
  ['Peaceful', 'calm, settled, at ease', '#3C4A8A', '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3l.6 1.4L19 5l-1.4.6L17 7l-.6-1.4L15 5l1.4-.6z"/>', 'Calm and quiet. You can stay here a while.', 'nightwatch'],
  ['Angry', 'angry, furious', '#C23B2E', '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', 'That fire is real. Take a breath before deciding what to do with it.', 'standing'],
  ['Lonely', 'lonely, missing people', '#6B6F9E', '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', 'Missing people can feel heavy. Consider reaching out to someone you trust.', 'nightwatch'],
  ['Stressed', 'stressed, too much on', '#B0457A', '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>', 'Too many tabs open in your head. One thing at a time is plenty.', 'standing'],
  ['Frustrated', 'irritated, things are not working', '#C9792B', '<circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/>', 'Ugh, that is frustrating. Take a moment before having another go.', 'standing'],
  ['Excited', 'energised, looking forward to something', '#E7B84B', '<path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z"/>', 'Something has you buzzing. Enjoy having something to look forward to.', 'skate'],
  ['Grateful', 'appreciative, thankful', '#D58CB6', '<path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11z"/>', 'Hold onto what matters to you. The little things count too.', 'cheer'],
  ['Confident', 'capable, sure of yourself', '#4FA89A', '<path d="M12 3l7 4v5c0 4.5-3 7-7 9-4-2-7-4.5-7-9V7z"/><path d="M9 12l2 2 4-4"/>', 'You can trust yourself to take the next step.', 'standing'],
  ['Hopeful', 'optimistic, looking ahead', '#9FB8E8', '<path d="M3 17l6-6 4 4 8-9M15 6h6v6"/>', 'You do not need every answer yet. A little hope is enough to start.', 'cheer'],
  ['Bored', 'uninterested, wanting something to do', '#A6A39A', '<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M9 16h6"/>', 'Feeling stuck in a dull moment? Try changing one small thing around you.', 'standing'],
  ['Proud', 'pleased with yourself, recognising progress', '#E5893D', '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>', 'Give yourself credit. You did something worth recognising.', 'cheer'],
  ['Curious', 'interested, wanting to understand', '#4A9CA6', '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.5 1-1.5 1.5-1.5 3M12 17h.01"/>', 'Follow that curiosity. You might discover something interesting.', 'standing']
];

export const weatherByName = n => WEATHERS.find(w => w[0] === n);

// Things that might help, keyed by mood name.
export const WEATHER_TIPS = {
  'Happy': ['Make time for something you enjoy', 'Share the good news or moment with someone', 'Write down what made today feel good'],
  'Content': ['Stay in the moment for a little while', 'Put your phone down and enjoy what you are doing', 'Notice one thing you appreciate about today'],
  'Mixed': ['Name the different feelings you have without judging them', 'Do one small thing you have been putting off', 'Take a short walk or a quiet break'],
  'Meh': ['Pick one tiny task, or give yourself permission to rest', 'Put on music or a podcast you like', 'Get some fresh air if you feel up to it'],
  'Confused': ['Write down what you know and what you are unsure about', 'Pick one small next step instead of solving everything', 'Ask someone you trust for another perspective'],
  'Sad': ['Talk to someone you trust, even just by text', 'Read something comforting or put on a favourite show', 'A warm drink and a quiet break can help'],
  'Down': ['Tell someone you trust how you are feeling', 'Focus on food, water, rest, and one manageable thing', 'If this feeling sticks around or gets harder to handle, consider talking with a trusted adult or health professional'],
  'Overwhelmed': ['Write down what is on your mind, then choose just one thing', 'Take a short break away from the screen', 'Try slow breathing: in for 4, out for 6', 'Ask someone for help with one thing'],
  'Anxious': ['Try slow breathing: in for 4, out for 6', 'Name five things you can see around you', 'Talk to someone you trust about what is worrying you', 'Focus on what you can do right now'],
  'Burnt out': ['Take a proper break without trying to be productive', 'Shrink your to-do list to what is genuinely necessary', 'Eat something, drink water, and give yourself time to rest'],
  'Numb': ['You do not have to force yourself to feel differently', 'Try a gentle grounding activity, like noticing what is around you', 'Consider telling someone you trust that you feel disconnected'],
  'Relieved': ['Give yourself a moment to unwind', 'Notice what helped you get through the difficult part', 'Do something calm to mark that it is over'],
  'Peaceful': ['Keep the evening gentle if you can', 'Try a few minutes of stretching or reading', 'Notice what is helping you feel settled'],
  'Angry': ['Pause before responding while the feeling is intense', 'Write out what you want to say without sending it yet', 'Take a short walk or try slow breathing', 'Wait before making decisions if you can'],
  'Lonely': ['Message or call one person, even if it feels small', 'Spend time somewhere welcoming with people around', 'Read or watch something that feels like company'],
  'Stressed': ['Write a list of what is on your mind, then choose one small next step', 'Take a short break away from the screen', 'Try slow breathing: in for 4, out for 6', 'Ask someone for help with one thing'],
  'Frustrated': ['Step away from the problem for a few minutes', 'Write down what is bothering you and what you can change', 'Try again with one small adjustment when you feel ready'],
  'Excited': ['Enjoy having something to look forward to', 'Tell someone what you are excited about', 'Write down an idea you want to remember'],
  'Grateful': ['Write down a couple of things you appreciate', 'Tell someone you are glad they are in your life', 'Notice one small thing that made today better'],
  'Confident': ['Take one step towards something that matters to you', 'Remember a challenge you have handled before', 'Notice your progress without needing to be perfect'],
  'Hopeful': ['Write down one thing you would like to work towards', 'Choose a small action you can take today', 'Talk to someone who encourages you'],
  'Bored': ['Try a small activity you have not done in a while', 'Put on a song and change your surroundings', 'Message someone or get outside for a little while'],
  'Proud': ['Give yourself credit for the effort you put in', 'Write down what you learned from the experience', 'Share the win with someone who will appreciate it'],
  'Curious': ['Look up something you have wondered about', 'Ask a question or try a new activity', 'Write down what you discover']
};

export const FOOD_TAGS = ['Proper meal', 'Snack', 'Cooked it myself', 'Tried something new', 'Breakfast', 'Fruit', 'Drank water', 'Protein-y'];

// How you woke up. The third item is the quilt pattern family it sews with:
// rested = soft round patterns, okay = tidy ones, groggy = wavy ones. Old nights keep their word and their patch.
export const FEELS = [
  ['refreshed', 'Refreshed', 'rested'],
  ['rested', 'Rested', 'rested'],
  ['okay', 'Okay', 'okay'],
  ['tired', 'Tired', 'okay'],
  ['groggy', 'Groggy', 'groggy'],
  ['restless', 'Restless', 'groggy']
];

export const feelFamily = k => (FEELS.find(f => f[0] === k) || [0, 0, 'okay'])[2];
export const feelLabel = k => (FEELS.find(f => f[0] === k) || [k, k ? k[0].toUpperCase() + k.slice(1) : ''])[1];

export const NIGHT_THINGS = ['Washed the dishes', 'Laptop work', 'Read', 'Just lay there', 'Had a snack', 'Scrolled for a bit'];