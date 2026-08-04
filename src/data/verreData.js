export const MIN_TOURS      = 1;
export const MAX_TOURS      = 10;
export const START_GLASS    = 1;
export const FILL_STEP      = 1;
export const CARD_MIN       = 1;
export const CARD_MAX       = 20;
export const HOT_MIN        = 7;
export const HOT_MAX        = 13;
export const HOT_WEIGHT     = 3;

export function randomTours() {
  return MIN_TOURS + Math.floor(Math.random() * (MAX_TOURS - MIN_TOURS + 1));
}

function cardWeight(value) {
  return value >= HOT_MIN && value <= HOT_MAX ? HOT_WEIGHT : 1;
}

export function dealCards(playerCount) {
  const values  = Array.from({ length: CARD_MAX - CARD_MIN + 1 }, (_, i) => i + CARD_MIN);
  const weights = values.map(cardWeight);
  const result  = [];

  for (let n = 0; n < playerCount && values.length > 0; n++) {
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * totalWeight;
    let idx = 0;
    while (idx < weights.length - 1 && r >= weights[idx]) {
      r -= weights[idx];
      idx++;
    }
    result.push(values[idx]);
    values.splice(idx, 1);
    weights.splice(idx, 1);
  }
  return result;
}
