// Version anglaise des cartes de jeux (site /en/). Seuls les jeux traduits y figurent :
// les autres ne sont pas proposés en anglais. Clé = champ `game` de characters.js.
// Garder uniquement des `export const` : scripts/seo.js lit ce fichier sans bundler.

export const CHARACTERS_EN = {
  undercover: {
    name: 'The Detective',
    title: 'The Detective',
    description: 'An impostor is hiding among you. Every word counts to unmask them… without giving yourself away.',
    gameName: 'UNDERCOVER',
    stats: { Deduction: 99, Observation: 95, Bluff: 88 },
  },
  tripotes: {
    name: 'The Marquise',
    title: 'The Marquise',
    description: 'The judge ranks their friends using a secret question. The group must guess the real question out of four.',
    gameName: 'RANK YOUR FRIENDS',
    stats: { Intuition: 97, Bluff: 95, Observation: 90 },
  },
  defis: {
    name: 'The Dare Master',
    title: 'The Dare Master',
    description: 'The wheel picks a player: they take the dare or face the consequence. Nobody is spared!',
    gameName: 'DARES',
    stats: { Nerve: 99, Humour: 95, Courage: 88 },
  },
  vote: {
    name: 'The Referee',
    title: 'The Referee',
    description: 'Vote in secret on questions, debates and dilemmas. Think like the majority to score points!',
    gameName: 'MAJORITY VOTE',
    // Version anglaise : partie sur un seul téléphone uniquement
    phones: 'one',
    stats: { Diplomacy: 95, Intuition: 90, Strategy: 88 },
  },
};
