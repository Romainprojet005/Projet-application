// Tripotes (« Rank your friends ») — questions anglaises (site /en/). Même structure que quiEstLePlusPrompts.js.
import { tirerUn } from '../utils/dejaVu';

export const QUELPLUS_CATEGORIES = [
  { id: 'all', name: 'All', emoji: '🎲', color: '#F59E0B' },
  { id: 'soiree', name: 'Party', emoji: '🍺', color: '#F59E0B' },
  { id: 'perso', name: 'Personal', emoji: '😏', color: '#EC4899' },
  { id: 'courage', name: 'Bold', emoji: '🔥', color: '#EF4444' },
  { id: 'hot', name: 'Hot 🔞', emoji: '🌶️', color: '#DC2626' },
  // Catégorie explicite : jamais incluse dans « All », il faut la choisir exprès
  { id: 'tres_hot', name: 'Very hot 🔞', emoji: '🔥', color: '#B91C1C', explicit: true,
    joker: 'The chosen player can name someone else instead, if that person agrees to take a dare.' },
];

const q = (category, list, start) => list.map((text, i) => ({ id: start + i, text, category }));

export const QUELPLUS_PROMPTS = [
  ...q('soiree', [
    'most likely to fall asleep on the sofa first',
    'most likely to start an unwanted karaoke',
    'most likely to order pizza at 3 a.m.',
    'most likely to lose their phone at a party',
    'most likely to dance on the table',
    'most likely to make an emotional speech after two drinks',
    'most likely to text their ex after midnight',
    'most likely to get lost on the way home',
    'most likely to tell the same story three times in one night',
    'most likely to befriend a total stranger at a party',
    'most likely to be the last one to leave',
    'most likely to take over the music',
  ], 1),
  ...q('perso', [
    'most likely to cry during a cartoon',
    'most likely to spend a whole day in bed',
    'most likely to have a secret talent nobody knows about',
    'most likely to talk to their plants',
    'most likely to be late to their own wedding',
    'most likely to stalk someone’s profile for an hour',
    'most likely to forget a friend’s birthday',
    'most likely to binge a whole series in one night',
    'most likely to have a dramatic reaction to a spider',
    'most likely to still sleep with a cuddly toy',
    'most likely to lie about having read a book',
    'most likely to get attached to a waiter’s smile',
  ], 101),
  ...q('courage', [
    'most likely to go skydiving tomorrow',
    'most likely to quit their job on a whim',
    'most likely to ask a stranger out',
    'most likely to sing alone on stage',
    'most likely to try the weirdest dish on the menu',
    'most likely to move to another country overnight',
    'most likely to argue with a referee',
    'most likely to get a tattoo on a dare',
    'most likely to jump into cold water first',
    'most likely to call their boss by mistake and keep talking',
    'most likely to survive alone on a desert island',
    'most likely to say what everyone is thinking',
  ], 201),
  ...q('hot', [
    'most likely to hook up on the first date without hesitating',
    'most likely to have a secret crush on someone here',
    'most likely to send a risky text by mistake',
    'most likely to have kissed two people on the same night',
    'most likely to have a hidden dating app',
    'most likely to flirt their way into a free drink',
    'most likely to go skinny dipping tonight',
    'most likely to have a walk of shame story',
    'most likely to fall for their best friend',
    'most likely to have the wildest fantasy',
    'most likely to give a lap dance if asked',
    'most likely to get caught making out in public',
  ], 301),
  ...q('tres_hot', [
    'most likely to passionately kiss a stranger tonight',
    'most likely to have tried a threesome',
    'most likely to own the most sex toys',
    'most likely to have done it in a public place',
    'most likely to have a secret sex tape',
    'most likely to be into handcuffs',
    'most likely to have slept with someone in this room',
    'most likely to sext during a work meeting',
  ], 401),
];

const EXPLICIT_CATS = new Set(QUELPLUS_CATEGORIES.filter(c => c.explicit).map(c => c.id));

export function pickPromptAndDecoys(categoryId = 'all') {
  const pool = categoryId === 'all'
    ? QUELPLUS_PROMPTS.filter(p => !EXPLICIT_CATS.has(p.category))
    : QUELPLUS_PROMPTS.filter(p => p.category === categoryId);

  const prompt = tirerUn('tripotes_en', pool);

  const sameCat = pool.filter(p => p.category === prompt.category && p.id !== prompt.id);
  const decoys  = [...sameCat].sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [prompt, ...decoys].sort(() => Math.random() - 0.5);

  return { prompt, options };
}
