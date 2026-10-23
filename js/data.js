
const AREAS = [
  { id: 'mind', name: 'Mind', icon: 'brain' },
  { id: 'body', name: 'Body', icon: 'activity' },
  { id: 'life', name: 'Life', icon: 'sun' }
];

const EXERCISES = {
  mind: [
    { name: 'Brain dump', desc: 'Get everything out of your head.', time: '3 min' },
    { name: 'Name the feeling', desc: 'Put a name to what you are experiencing.', time: '2 min' },
    { name: 'Thought check', desc: 'Separate facts from assumptions.', time: '3 min' },
    { name: 'Tiny gratitude', desc: 'Notice one thing that went okay.', time: '1 min' }
  ],
  body: [
    { name: 'Stretch break', desc: 'Release some tension with gentle movement.', time: '3 min' },
    { name: 'Water break', desc: 'Pause and have a drink of water.', time: '1 min' },
    { name: 'Fresh air', desc: 'Step outside or open a window.', time: '5 min' },
    { name: 'Body scan', desc: 'Notice where you are holding tension.', time: '2 min' }
  ],
  life: [
    { name: 'Clear one thing', desc: 'Make one small space feel calmer.', time: '3 min' },
    { name: 'One next step', desc: 'Choose one manageable thing to do next.', time: '2 min' },
    { name: 'Take a pause', desc: 'Give yourself a moment without a task.', time: '2 min' },
    { name: 'Reach out', desc: 'Connect with someone you trust.', time: '5 min' }
  ]
};

const WORKOUTS = [
  { name: 'Gentle reset', desc: 'Easy movement to help you reset.', time: '5 min' },
  { name: 'Walk break', desc: 'Take a short walk at your own pace.', time: '10 min' },
  { name: 'Stretch', desc: 'Loosen up with a few comfortable stretches.', time: '5 min' }
];

const REST_GUIDE = [
  { name: 'Quick pause', desc: 'Step away from what you are doing for a moment.', time: '2 min' },
  { name: 'Quiet time', desc: 'Give yourself a little space without pressure.', time: '5 min' },
  { name: 'Wind down', desc: 'Choose something calm before bed.', time: '10 min' }
];

// Weather colours use a coordinated, softer palette so the picker and ribbon
// feel consistent with the app's themes while keeping each mood distinguishable.
const WEATHERS = [
  { name: 'Happy', icon: 'sun', color: '#F2C14E', reply: 'Let yourself enjoy this moment.', pose: 'sunny' },
  { name: 'Content', icon: 'cloud-sun', color: '#E6A15C', reply: 'It is okay to appreciate things as they are.', pose: 'calm' },
  { name: 'Mixed', icon: 'cloud-sun', color: '#9AAED6', reply: 'You can feel more than one thing at once.', pose: 'mixed' },
  { name: 'Meh', icon: 'cloud', color: '#A6A29A', reply: 'You do not have to feel a certain way today.', pose: 'neutral' },
  { name: 'Confused', icon: 'cloud-fog', color: '#B5B0A8', reply: 'You can take your time figuring things out.', pose: 'foggy' },
  { name: 'Sad', icon: 'cloud-rain', color: '#7298C8', reply: 'Be gentle with yourself today.', pose: 'rainy' },
  { name: 'Down', icon: 'cloud-rain', color: '#5578B8', reply: 'You do not have to handle everything at once.', pose: 'rainy' },
  { name: 'Overwhelmed', icon: 'cloud-lightning', color: '#8870B8', reply: 'Try taking one small thing at a time.', pose: 'stormy' },
  { name: 'Anxious', icon: 'wind', color: '#5B9E9A', reply: 'Come back to what is in front of you, one moment at a time.', pose: 'windy' },
  { name: 'Burnt out', icon: 'thermometer-sun', color: '#D9785D', reply: 'Rest is a valid next step.', pose: 'hot' },
  { name: 'Numb', icon: 'cloud', color: '#8BA5B8', reply: 'You do not have to force yourself to feel something.', pose: 'overcast' },
  { name: 'Relieved', icon: 'cloud-sun', color: '#B88ACB', reply: 'Give yourself a moment to breathe out.', pose: 'clearing' },
  { name: 'Peaceful', icon: 'moon', color: '#5B6F9C', reply: 'You can stay with this quiet moment.', pose: 'calm' },
  { name: 'Angry', icon: 'flame', color: '#C65D55', reply: 'Your feelings matter. Give yourself space before reacting.', pose: 'stormy' },
  { name: 'Lonely', icon: 'cloud-rain', color: '#8586AE', reply: 'You deserve connection, even when it feels far away.', pose: 'rainy' },
  { name: 'Stressed', icon: 'cloud-lightning', color: '#B86B8C', reply: 'Focus on the next manageable step, not everything at once.', pose: 'stormy' },
  { name: 'Frustrated', icon: 'wind', color: '#C47A48', reply: 'It is okay to pause and try again later.', pose: 'windy' },
  { name: 'Excited', icon: 'sun', color: '#E6B84C', reply: 'Enjoy the energy and give yourself room to explore it.', pose: 'sunny' },
  { name: 'Grateful', icon: 'heart', color: '#CC8BA8', reply: 'Take a moment to notice what matters to you.', pose: 'clearing' },
  { name: 'Confident', icon: 'sun', color: '#4D9C8D', reply: 'Trust yourself to take the next step.', pose: 'sunny' },
  { name: 'Hopeful', icon: 'cloud-sun', color: '#8EA9D8', reply: 'Small possibilities can still matter.', pose: 'clearing' },
  { name: 'Bored', icon: 'cloud', color: '#A6A39A', reply: 'A small change of pace might help.', pose: 'overcast' },
  { name: 'Proud', icon: 'sun', color: '#D98A55', reply: 'Give yourself credit for what you have done.', pose: 'sunny' },
  { name: 'Curious', icon: 'sparkles', color: '#4C9CA6', reply: 'Follow what interests you, one question at a time.', pose: 'clearing' }
];

const weatherByName = Object.fromEntries(WEATHERS.map(w => [w.name, w]));

const WEATHER_TIPS = {
  Happy: ['Enjoy something you love.', 'Share your good mood with someone.'],
  Content: ['Notice what is going well.', 'Let this moment be enough.'],
  Mixed: ['Make room for all your feelings.', 'You do not need to resolve everything now.'],
  Meh: ['Try one small change of pace.', 'Keep your expectations gentle today.'],
  Confused: ['Write down what you know so far.', 'Give yourself time to think.'],
  Sad: ['Choose something comforting.', 'Reach out to someone you trust if you need support.'],
  Down: ['Make your next step small.', 'You deserve patience and care.'],
  Overwhelmed: ['Pick just one next step.', 'Pause and take a few comfortable breaths.'],
  Anxious: ['Focus on what you can control.', 'Bring your attention back to the present.'],
  'Burnt out': ['Give yourself permission to rest.', 'Put off anything that can reasonably wait.'],
  Numb: ['Keep things simple for now.', 'Notice your surroundings without pressure.'],
  Relieved: ['Let yourself unwind.', 'Notice what feels lighter now.'],
  Peaceful: ['Protect a little quiet time.', 'Enjoy the slower pace.'],
  Angry: ['Take space before responding.', 'Choose a safe way to release tension.'],
  Lonely: ['Send a small message to someone you trust.', 'Choose a comforting activity.'],
  Stressed: ['Break a task into smaller pieces.', 'Take a short pause between tasks.'],
  Frustrated: ['Step back and return when ready.', 'Try a different approach if you can.'],
  Excited: ['Enjoy what you are looking forward to.', 'Channel your energy into something meaningful.'],
  Grateful: ['Notice one thing you appreciate.', 'Tell someone you value them.'],
  Confident: ['Recognise what you have learned.', 'Take the next step at your own pace.'],
  Hopeful: ['Choose one small action toward what matters.', 'Keep space for possibilities.'],
  Bored: ['Try a small new activity.', 'Change your surroundings for a moment.'],
  Proud: ['Acknowledge the effort you put in.', 'Let yourself enjoy the progress.'],
  Curious: ['Follow one question that interests you.', 'Learn something small today.']
};

const FOOD_TAGS = [
  'quick', 'comfort', 'fresh', 'easy', 'warm', 'light'
];

const FEELS = [
  { name: 'Calm', family: 'steady', label: 'Calm' },
  { name: 'Okay', family: 'steady', label: 'Okay' },
  { name: 'Tired', family: 'low', label: 'Tired' },
  { name: 'Sad', family: 'low', label: 'Sad' },
  { name: 'Anxious', family: 'tense', label: 'Anxious' },
  { name: 'Stressed', family: 'tense', label: 'Stressed' },
  { name: 'Happy', family: 'positive', label: 'Happy' },
  { name: 'Excited', family: 'positive', label: 'Excited' }
];

const feelFamily = Object.fromEntries(FEELS.map(f => [f.name, f.family]));
const feelLabel = Object.fromEntries(FEELS.map(f => [f.name, f.label]));

const NIGHT_THINGS = [
  'Put your phone down for a few minutes.',
  'Prepare one small thing for tomorrow.',
  'Choose something relaxing to do.',
  'Give yourself permission to call it a day.'
];
