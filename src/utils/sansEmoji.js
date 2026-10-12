// Retire les emojis d'un texte (utilisé dans les menus de paramétrage).
const EMO = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}\u{20E3}]+\s*/gu;
const KEEP = /[✕✓✔♛]/u;

export default function sansEmoji(text) {
  if (typeof text !== 'string') return text;
  return text.replace(EMO, (m) => (KEEP.test(m) ? m : '')).trim();
}
