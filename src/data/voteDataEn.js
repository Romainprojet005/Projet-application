// Vote majorité — version anglaise (site /en/). Même structure que voteData.js.
import { tirer } from '../utils/dejaVu';

export const VOTE_CATEGORIES = [
  { id: 'all',        name: 'All mixed',          emoji: '🎲', color: '#6366F1' },
  { id: 'cible',      name: 'Targeted 🎯',        emoji: '🎯', color: '#F43F5E', needsPlayers: true },
  { id: 'cibleHot',   name: 'Targeted Very Hot 🌶️', emoji: '🌶️', color: '#FF4500', needsPlayers: true },
  { id: 'tuPreferes', name: 'Would you rather',   emoji: '🤔', color: '#EC4899' },
  { id: 'pourContre', name: 'For or against',     emoji: '⚖️', color: '#F59E0B' },
  { id: 'cEstPlutot', name: 'Are you more…',      emoji: '🪞', color: '#06B6D4' },
  { id: 'debat',      name: 'Debate',             emoji: '🔥', color: '#EF4444' },
  { id: 'adulte',     name: 'Adult mode 🔞',      emoji: '🍷', color: '#9333EA' },
  { id: 'majorite',   name: 'Majority 🔞',        emoji: '🗳️', color: '#BE123C', needsPlayers: true,
    rule: 'The player chosen by the majority drinks or takes a forfeit.' },
];

const pair = (q, list) => list.map(([a, b], i) => ({ id: i + 1, q, a, b }));
const forAgainst = list => list.map((q, i) => ({ id: i + 1, q, a: '✅  For', b: '❌  Against' }));
const targeted = (list) => list.map(([q, e], i) => ({
  id: i + 1, q: `Between {A} and {B}, ${q}`, a: `${e}  {A}`, b: `${e}  {B}`, targeted: true,
}));

const QUESTIONS = {
  tuPreferes: pair('Would you rather…', [
    ['🍕  Pizza', '🍣  Sushi'],
    ['🌊  The sea', '⛰️  The mountains'],
    ['🐕  Dog', '🐈  Cat'],
    ['☀️  Summer', '❄️  Winter'],
    ['🌅  Morning', '🌙  Night'],
    ['🛋️  Netflix', '🎬  Cinema'],
    ['🏙️  City', '🌿  Countryside'],
    ['📖  Read a book', '🎥  Watch a movie'],
    ['🧳  Travel alone', '👫  Travel in a group'],
    ['👻  Be invisible', '🦸  Fly'],
    ['⏮️  Go back in time', '🔮  See the future'],
    ['🍫  Dark chocolate', '🍬  Milk chocolate'],
    ['🍭  Sweet', '🧂  Salty'],
    ['🌍  Speak every language', '🎸  Play every instrument'],
    ['💰  More money', '⏳  More time'],
    ['🤝  A few close friends', '🎉  Lots of friends'],
    ['📱  Text', '📞  Call'],
    ['🚗  Drive', '🚌  Be the passenger'],
  ]),

  pourContre: forAgainst([
    'Pineapple on pizza?',
    'Working from home 100% of the time?',
    'Marriage?',
    'Visible tattoos at work?',
    'Homework?',
    'Moving abroad?',
    'Social media before age 13?',
    'Dogs in restaurants?',
    'A 4-day work week?',
    'Cosmetic surgery?',
    'AI in schools?',
    'Extreme sports?',
    'Self-driving cars on the road?',
    'Banning phones at school?',
    'Splitting the bill on a first date?',
    'Socks with sandals?',
  ]),

  cEstPlutot: pair('Are you more…', [
    ['📋  Organised', '🎲  Spontaneous'],
    ['👑  Leader', '🤝  Follower'],
    ['🎙️  Extrovert', '🎧  Introvert'],
    ['🌈  Optimist', '🔭  Realist'],
    ['❤️  Heart', '🧠  Head'],
    ['🚀  Bold', '🛡️  Careful'],
    ['🏆  Competitive', '🌱  Cooperative'],
    ['🎉  Party', '🕯️  Quiet night in'],
    ['🌄  Early bird', '🌙  Night owl'],
    ['📅  Plan everything', '✈️  Improvise'],
    ['🗣️  Blunt', '🕊️  Diplomatic'],
    ['🏃  Sporty', '🛋️  Couch potato'],
    ['🐢  Shy', '🦁  Confident'],
  ]),

  debat: pair('Hot debate…', [
    ['🥚  The chicken came first', '🐣  The egg came first'],
    ['🍞  Toast butter side up', '🧈  Butter side down'],
    ['💸  Money buys happiness', '🙅  It doesn’t'],
    ['👽  Aliens exist', '🌍  We’re alone'],
    ['📺  Series', '🎬  Movies'],
    ['🎄  Christmas songs in November', '🛑  Not before December'],
    ['🍝  Ketchup on pasta is fine', '🤢  It’s a crime'],
    ['🎮  Gaming is a sport', '🏟️  It isn’t'],
    ['🤳  Selfies are art', '🙄  They’re vanity'],
    ['🧦  Sleep with socks on', '🦶  Never'],
  ]),

  cible: targeted([
    ['who is always late?', '⏰'],
    ['who would survive a zombie apocalypse?', '🧟'],
    ['who spends the most time on their phone?', '📱'],
    ['who would become famous first?', '🌟'],
    ['who is the worst cook?', '🍳'],
    ['who would forget a friend’s birthday?', '🎂'],
    ['who laughs at their own jokes?', '😂'],
    ['who would win a reality show?', '📺'],
    ['who is the most dramatic?', '🎭'],
    ['who would get lost with a GPS?', '🗺️'],
    ['who would cry at a cartoon?', '😢'],
    ['who keeps secrets best?', '🤐'],
    ['who would spend all their pay in a day?', '💸'],
    ['who would text their ex at 3am?', '🌙'],
    ['who is the best liar?', '🤥'],
  ]),

  cibleHot: targeted([
    ['who is the better kisser?', '💋'],
    ['who has the wildest search history?', '🔎'],
    ['who would sleep with someone on the first date?', '🔥'],
    ['who has the most secret fantasies?', '💭'],
    ['who would send a spicy photo first?', '📸'],
    ['who is wilder in bed?', '🌶️'],
    ['who would have a secret affair?', '🕵️'],
    ['who has had the most partners?', '🔢'],
    ['who would try anything once?', '🎲'],
    ['who would drop everything for a steamy night?', '🌙'],
  ]),

  adulte: pair('Would you rather… 🔞', [
    ['🌅  Morning sex', '🌙  Late-night sex'],
    ['💡  Lights on', '🌑  Lights off'],
    ['🗣️  Talk dirty', '🤫  Stay silent'],
    ['🏠  At home', '🏨  At a hotel'],
    ['🐢  Slow and tender', '⚡  Fast and wild'],
    ['📸  Spicy photos', '🎙️  Spicy voice notes'],
    ['👑  Take control', '🎀  Let go'],
    ['💌  Romantic', '🔥  Passionate'],
    ['🛁  Shower together', '🛏️  Breakfast in bed'],
    ['😈  One wild night', '💞  A long relationship'],
  ]),

  majorite: targeted([
    ['who has had the craziest one-night stand?', '🌙'],
    ['who would kiss a stranger tonight?', '💋'],
    ['who would go to a strip club?', '💃'],
    ['who would date two people at once?', '💔'],
    ['who would skinny-dip first?', '🌊'],
    ['who would have sex in a public place?', '🚻'],
    ['who is the most dominant?', '⛓️'],
    ['who would make an amateur spicy video?', '🎥'],
  ]),
};

function injectPlayers(q, playerNames) {
  if (!q.targeted || playerNames.length < 2) return q.targeted ? null : q;
  const p = [...playerNames].sort(() => Math.random() - 0.5);
  const A = p[0], B = p[1];
  const sub = s => s.replace(/\{A\}/g, A).replace(/\{B\}/g, B);
  return { ...q, q: sub(q.q), a: sub(q.a), b: sub(q.b) };
}

export function selectQuestions(count, categoryId = 'all', playerNames = []) {
  let pool;
  if (categoryId === 'all') {
    pool = Object.values(QUESTIONS).flat().filter(q => !q.targeted);
  } else {
    pool = QUESTIONS[categoryId] ?? Object.values(QUESTIONS).flat();
  }
  const selected = tirer('vote_en', pool, Math.min(count, pool.length));
  return selected.map(q => injectPlayers(q, playerNames)).filter(Boolean);
}
