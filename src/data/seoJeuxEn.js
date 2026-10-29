// Version anglaise de seoJeux.js (pages /en/<jeu>/ et texte « The game » des écrans de réglages).
// Garder uniquement des `export const` : scripts/seo.js lit ce fichier sans bundler.

export const SEO_JEUX_EN = {
  undercover: {
    // titre / description : remplacent gameTitleEn / gameDescriptionEn pour viser les recherches « undercover game »
    titre: 'Undercover Game Online — Free Word Party Game on One Phone | La Soirée des Légendes',
    description: 'Play the Undercover game online for free: find the undercover spy and Mr. White hiding among civilians. 4–12 players on a single phone, no app or sign-up needed.',
    motCle: 'online impostor word game',
    intro: 'Undercover is an impostor word game where every player gets a secret word: the civilians all share the same one, the undercover spies get a similar word. One by one, everyone gives a clue without giving themselves away, then the group votes to eliminate a suspect.',
    regles: [
      'Each player looks at their word in secret on the phone, then passes it on.',
      'Mr. White, if playing, has no word at all and must bluff.',
      'Everyone gives one clue about their word, without saying it.',
      'After each round, vote to eliminate a player: their role is revealed.',
      'Civilians win once every spy is found; spies win when they match the civilians in number.',
    ],
    faq: [
      ['What is the Undercover game?', 'Undercover is a social deduction word game: civilians share a secret word, the undercover players get a slightly different one, and everyone must find out who is who from the clues.'],
      ['Who is Mr. White in Undercover?', 'Mr. White is an optional role with no word at all: they listen to the others’ clues and bluff to avoid being voted out. Mr. White plays on the spies’ side.'],
      ['Does every player need a phone to play Undercover?', 'No: one phone is enough, it is passed around while the words are handed out.'],
      ['How many spies should we have?', 'The game suggests one spy for every three players, and you can add Mr. White to spice things up.'],
    ],
  },
  tripotes: {
    motCle: 'rank your friends party game',
    intro: 'Rank your friends: the judge reads a secret question and ranks their friends with it. The group must then find the real question out of four.',
    regles: [
      'The judge reads the secret question alone.',
      'They rank the other players from most to least likely.',
      'The group sees the ranking and picks the question out of four.',
      'Right answer: one point for each player in the group. Wrong: two points for the judge.',
    ],
    faq: [
      ['Who is the judge?', 'The judge changes every round, so everyone gets a turn.'],
    ],
  },
  defis: {
    motCle: 'party dare game',
    intro: 'Dares: the wheel picks a random player, who must take on a physical, social, creative or question dare. Refuse it, and a consequence awaits.',
    regles: [
      'The wheel picks a random player.',
      'The game gives them a dare.',
      'Dare done: well played. Dare refused: they take a consequence.',
      'At the end, the ranking shows who dared the most.',
    ],
    faq: [
      ['Are the dares suitable for everyone?', 'The all-ages categories are on by default; the daring ones are for adults only and can always be refused.'],
    ],
  },
  vote: {
    motCle: 'majority vote party game',
    intro: 'Majority vote asks questions, debates and “would you rather” dilemmas: everyone votes in secret, and those who think like the majority score points.',
    regles: [
      'A question appears with two possible answers.',
      'Each player votes in secret, passing the phone around.',
      'Voting with the majority scores 1 point; a unanimous vote gives everyone 2 points.',
      'If it’s a perfect tie, nobody scores.',
    ],
    faq: [
      ['Are there adult questions?', 'Yes, there are 18+ categories; they are clearly marked and must be chosen on purpose.'],
    ],
  },
};
