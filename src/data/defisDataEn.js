// Les défis (« Dares ») — version anglaise (site /en/). Même structure que defisData.js.
import { tirerUn } from '../utils/dejaVu';

export const DEFI_CATEGORIES = [
  { id: 'physique', name: 'Physical', emoji: '🏃', color: '#10B981' },
  { id: 'social', name: 'Social', emoji: '🗣️', color: '#3B82F6' },
  { id: 'hot', name: 'Questions 🔥', emoji: '🔥', color: '#EF4444' },
  { id: 'creatif', name: 'Creative', emoji: '🎨', color: '#8B5CF6' },
  // Catégorie explicite : désactivée par défaut, il faut la cocher exprès
  { id: 'ose', name: 'Daring 🔞', emoji: '💋', color: '#DB2777', explicit: true,
    joker: 'Pick another player to do the dare for you.' },
];

const d = (cat, list, start) => list.map((text, i) => ({ id: start + i, cat, text }));

export const DEFIS = [
  ...d('physique', [
    'Do 20 jumping jacks without stopping',
    'Stand on one foot for 45 seconds',
    'Do 10 push-ups',
    'Dance with no music for 30 seconds',
    'Do 15 squats',
    'Hold a plank for 30 seconds',
    'Do the moonwalk (even badly, it’s funny!)',
    'Pretend to be a horse for 20 seconds',
    'Act like a robot for 30 seconds',
    'Spin around 10 times, then walk in a straight line',
  ], 1),
  ...d('social', [
    'Text the third person in your contacts “I miss you”',
    'Let the group post a story on your account',
    'Call a friend and sing them happy birthday',
    'Talk with a fake accent until your next turn',
    'Give a sincere compliment to every player',
    'Show the last photo in your gallery',
    'Do your best impression of someone in the room',
    'Read your last sent message out loud',
    'Let the player on your right change your profile picture for an hour',
    'Speak only in questions until your next turn',
  ], 101),
  ...d('hot', [
    'What bad habit do you struggle to admit?',
    'What is the secret you will never tell your parents?',
    'Who here would you trust with your phone unlocked?',
    'What is the most embarrassing thing you have searched online?',
    'Who was your first crush?',
    'What is the worst lie you have ever told?',
    'Say something sincere you never say out loud',
    'What is your biggest red flag?',
    'Which player would you take to a desert island?',
    'What is the most childish thing you still do?',
    'What is your most embarrassing memory from school?',
    'Which song do you secretly love?',
  ], 201),
  ...d('creatif', [
    'Invent a 4-line poem about the player on your left',
    'Make up a commercial for an object in the room',
    'Draw a portrait of a player in 30 seconds',
    'Tell the story of your day as a movie trailer',
    'Invent a new dance move and teach it to everyone',
    'Rap a verse about tonight',
    'Mime your job without speaking',
    'Invent a toast for the group',
    'Make up a word and give its definition',
    'Describe a player as if they were a dish on a menu',
  ], 301),
  ...d('ose', [
    'Dance suggestively with a partner of your choice',
    'Fake an orgasm realistically for 15 seconds',
    'Give a 30-second massage to the player of your choice',
    'Whisper something flirty in a player’s ear',
    'Do a 20-second strip-tease (keep your clothes on!)',
    'Describe your ideal first date in detail',
    'Kiss the player of your choice on the cheek',
    'Tell the group your wildest fantasy',
    'Do a lap dance on a chair for 20 seconds',
    'Send a flirty emoji to the last person you texted',
  ], 401),
];

export const CONSEQUENCES = [
  'Take a forfeit chosen by the group! 🎲',
  'Obey the group for 2 minutes 👑',
  'Skip your next turn 🚫',
  'Sing a whole song 🎵',
  'The group decides your punishment ⚖️',
  'Do 10 push-ups 💪',
  'You must take the next dare, no refusing!',
  'Say something embarrassing 😳',
];

export function pickDefi(activeCats) {
  const available = DEFIS.filter(x => activeCats.includes(x.cat));
  if (available.length === 0) return DEFIS[0];
  return tirerUn('defis_en', available);
}

export function pickConsequence() {
  return CONSEQUENCES[Math.floor(Math.random() * CONSEQUENCES.length)];
}
