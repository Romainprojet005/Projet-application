export const MIN_MANCHES  = 1;
export const MAX_MANCHES  = 10;
export const START_GLASS  = 1;
export const FILL_STEP    = 1;
export const CARD_MIN     = 1;
export const CARD_MAX     = 20;

export function randomManches() {
  return MIN_MANCHES + Math.floor(Math.random() * (MAX_MANCHES - MIN_MANCHES + 1));
}

export function dealCards(playerCount) {
  const pool = Array.from({ length: CARD_MAX - CARD_MIN + 1 }, (_, i) => i + CARD_MIN);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, playerCount);
}
