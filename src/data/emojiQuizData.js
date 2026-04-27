function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const EMOJI_QUIZ_ITEMS = [
  // ── FILMS ──────────────────────────────────────────────────────────
  { id: 'roi_lion',       emojis: '🦁👑🌍', answer: 'Le Roi Lion',              category: 'film',         hint: 'Disney 1994 — Mufasa et Simba' },
  { id: 'reine_neiges',   emojis: '❄️👸✨', answer: 'La Reine des Neiges',      category: 'film',         hint: 'Disney 2013 — Let It Go' },
  { id: 'nemo',           emojis: '🐟🌊🔍', answer: 'Le Monde de Nemo',         category: 'film',         hint: 'Pixar 2003 — poisson-clown' },
  { id: 'spiderman',      emojis: '🕷️🕸️🏙️', answer: 'Spider-Man',             category: 'film',         hint: 'Marvel — Peter Parker' },
  { id: 'batman',         emojis: '🦇🌃🦹', answer: 'Batman',                   category: 'film',         hint: 'DC Comics — Gotham City' },
  { id: 'walle',          emojis: '🤖❤️🌱', answer: 'WALL-E',                   category: 'film',         hint: 'Pixar 2008 — robot solitaire' },
  { id: 'harry_potter',   emojis: '⚡🧙🧹', answer: 'Harry Potter',             category: 'film',         hint: 'Sorcier à lunettes — Poudlard' },
  { id: 'star_wars',      emojis: '⚔️🌌🚀', answer: 'Star Wars',                category: 'film',         hint: 'La Guerre des Étoiles — La Force' },
  { id: 'jaws',           emojis: '🦈🌊😱', answer: 'Les Dents de la Mer',      category: 'film',         hint: 'Spielberg 1975' },
  { id: 'belle_bete',     emojis: '🌹🕯️👸', answer: 'La Belle et la Bête',      category: 'film',         hint: 'Disney — rose enchantée' },
  { id: 'lotr',           emojis: '💍🌋🧝', answer: 'Le Seigneur des Anneaux',  category: 'film',         hint: 'Tolkien — Frodon' },
  { id: 'joker',          emojis: '🃏😈🎭', answer: 'Joker',                    category: 'film',         hint: 'Joaquin Phoenix 2019' },
  { id: 'ironman',        emojis: '🔴💪🤖', answer: 'Iron Man',                 category: 'film',         hint: 'Marvel — Tony Stark' },
  { id: 'vaiana',         emojis: '🌊🌺🎵', answer: 'Vaiana',                   category: 'film',         hint: 'Disney Polynésie — Maui' },
  { id: 'kung_fu_panda',  emojis: '🐼🥋🌿', answer: 'Kung Fu Panda',            category: 'film',         hint: 'DreamWorks — Po' },
  { id: 'pinocchio',      emojis: '🤥👦🪄', answer: 'Pinocchio',                category: 'film',         hint: 'Le nez qui grandit' },
  { id: 'lilo_stitch',    emojis: '🌺👽🌈', answer: 'Lilo & Stitch',            category: 'film',         hint: 'Disney Hawaï — Expérience 626' },
  { id: 'cendrillon',     emojis: '👠🎃🕰️', answer: 'Cendrillon',               category: 'film',         hint: 'La pantoufle de verre' },
  { id: 'ratatouille',    emojis: '🐭🍽️🗼', answer: 'Ratatouille',              category: 'film',         hint: 'Pixar — Rémi le rat cuisinier' },
  { id: 'cars',           emojis: '🚗⚡🏁', answer: 'Cars',                     category: 'film',         hint: 'Pixar — Flash McQueen' },
  { id: 'petite_sirene',  emojis: '🧜🌊❤️', answer: 'La Petite Sirène',         category: 'film',         hint: 'Disney — Ariel' },
  { id: 'pirates',        emojis: '🏴‍☠️⚓🌊', answer: 'Pirates des Caraïbes',   category: 'film',         hint: 'Jack Sparrow' },
  { id: 'jurassic_park',  emojis: '🦖🏝️😱', answer: 'Jurassic Park',            category: 'film',         hint: 'Spielberg — dinosaures' },
  { id: 'james_bond',     emojis: '🍸🔫🕶️', answer: 'James Bond',              category: 'film',         hint: 'Agent 007' },
  { id: 'titanic',        emojis: '🚢🧊💔', answer: 'Titanic',                  category: 'film',         hint: 'DiCaprio & Kate Winslet 1997' },
  { id: 'frozen2',        emojis: '🦁🌿🦁', answer: 'Le Livre de la Jungle',    category: 'film',         hint: 'Mowgli — Baloo et Bagheera' },
  { id: 'up_pixar',       emojis: '🏠🎈👴', answer: 'Là-haut',                  category: 'film',         hint: 'Pixar — maison avec ballons' },
  { id: 'inside_out',     emojis: '😂😢😡🧠', answer: 'Vice-Versa',             category: 'film',         hint: 'Pixar — les émotions' },
  { id: 'shrek',          emojis: '🟢🐸🧅', answer: 'Shrek',                   category: 'film',         hint: 'Ogre vert — DreamWorks' },
  { id: 'minions',        emojis: '💛👀🍌', answer: 'Les Minions',              category: 'film',         hint: 'Petits serviteurs jaunes' },

  // ── MUSIQUE ────────────────────────────────────────────────────────
  { id: 'mj_music',       emojis: '🕺🌕🎤', answer: 'Michael Jackson',          category: 'musique',      hint: 'King of Pop — Thriller' },
  { id: 'beatles',        emojis: '🪲🎸🇬🇧', answer: 'The Beatles',             category: 'musique',      hint: 'Liverpool — John, Paul, George, Ringo' },
  { id: 'queen',          emojis: '👑🎸🎤', answer: 'Queen',                    category: 'musique',      hint: 'Freddie Mercury — Bohemian Rhapsody' },
  { id: 'daft_punk',      emojis: '🤖💿🇫🇷', answer: 'Daft Punk',              category: 'musique',      hint: 'Duo électro français — casques' },
  { id: 'acdc',           emojis: '⚡🎸🔌', answer: 'AC/DC',                    category: 'musique',      hint: 'Rock australien — Thunderstruck' },
  { id: 'beyonce_music',  emojis: '👸🐝💛', answer: 'Beyoncé',                  category: 'musique',      hint: 'Lemonade — Formation' },
  { id: 'eminem_music',   emojis: '🎤😤8️⃣', answer: 'Eminem',                  category: 'musique',      hint: '8 Mile — Slim Shady' },
  { id: 'billie',         emojis: '🖤🕷️😶', answer: 'Billie Eilish',            category: 'musique',      hint: 'Bad Guy — James Bond No Time To Die' },
  { id: 'stromae',        emojis: '🎶🇧🇪👔', answer: 'Stromae',                 category: 'musique',      hint: 'Alors on Danse — Papaoutai' },
  { id: 'abba',           emojis: '🇸🇪💃🕺', answer: 'ABBA',                   category: 'musique',      hint: 'Dancing Queen — Waterloo' },
  { id: 'taylor',         emojis: '🐍💔13️⃣', answer: 'Taylor Swift',            category: 'musique',      hint: 'Shake It Off — Eras Tour' },
  { id: 'rolling',        emojis: '👅🎸🌀', answer: 'The Rolling Stones',        category: 'musique',      hint: 'Satisfaction — Gimme Shelter' },
  { id: 'nirvana',        emojis: '🌀👶🏊', answer: 'Nirvana',                  category: 'musique',      hint: 'Smells Like Teen Spirit — Kurt Cobain' },
  { id: 'rihanna_music',  emojis: '☂️💎🌊', answer: 'Rihanna',                  category: 'musique',      hint: 'Umbrella — Diamonds' },
  { id: 'bob_marley',     emojis: '🇯🇲🌿☮️', answer: 'Bob Marley',              category: 'musique',      hint: 'No Woman No Cry — reggae' },
  { id: 'adele_music',    emojis: '💔🎵🥀', answer: 'Adele',                    category: 'musique',      hint: 'Hello — Rolling in the Deep' },
  { id: 'lady_gaga',      emojis: '🌈🎤👗', answer: 'Lady Gaga',                category: 'musique',      hint: 'Bad Romance — Poker Face' },
  { id: 'muse_music',     emojis: '🚀🔭🎸', answer: 'Muse',                     category: 'musique',      hint: 'Uprising — Supermassive Black Hole' },

  // ── SÉRIES ─────────────────────────────────────────────────────────
  { id: 'breaking_bad',   emojis: '⚗️💊💰', answer: 'Breaking Bad',             category: 'serie',        hint: 'Walter White — meth' },
  { id: 'got',            emojis: '🐉❄️⚔️', answer: 'Game of Thrones',          category: 'serie',        hint: 'Winter is Coming' },
  { id: 'friends',        emojis: '☕🛋️🗽', answer: 'Friends',                  category: 'serie',        hint: 'Central Perk — How you doin\'' },
  { id: 'stranger',       emojis: '🌀🔦👧', answer: 'Stranger Things',          category: 'serie',        hint: 'Upside Down — Hawkins' },
  { id: 'peaky',          emojis: '🎩🔫🚬', answer: 'Peaky Blinders',           category: 'serie',        hint: 'Birmingham 1920s — Shelby' },
  { id: 'squid_game',     emojis: '🦑🎮💀', answer: 'Squid Game',               category: 'serie',        hint: 'Netflix coréen — 456 participants' },
  { id: 'casa_papel',     emojis: '👺💰🎵', answer: 'La Casa de Papel',         category: 'serie',        hint: 'Bella Ciao — Le Professeur' },
  { id: 'narcos',         emojis: '🌿💊🔫', answer: 'Narcos',                   category: 'serie',        hint: 'Pablo Escobar — Colombie' },
  { id: 'black_mirror',   emojis: '📱😱🤖', answer: 'Black Mirror',             category: 'serie',        hint: 'Dystopie numérique — Charlie Brooker' },
  { id: 'the_office',     emojis: '🏢😐📋', answer: 'The Office',               category: 'serie',        hint: 'Dunder Mifflin — Michael Scott' },
  { id: 'mandalorian',    emojis: '🪖⭐👶', answer: 'The Mandalorian',           category: 'serie',        hint: 'Star Wars — Baby Yoda' },
  { id: 'witcher',        emojis: '🗡️🐺🧙', answer: 'The Witcher',              category: 'serie',        hint: 'Geralt de Riva — Netflix' },

  // ── PERSONNALITÉS ──────────────────────────────────────────────────
  { id: 'elon',           emojis: '🚀🚗🐦', answer: 'Elon Musk',                category: 'personnalite', hint: 'Tesla, SpaceX, X (Twitter)' },
  { id: 'cr7',            emojis: '⚽7️⃣💪', answer: 'Cristiano Ronaldo',        category: 'personnalite', hint: 'CR7 — Portugal' },
  { id: 'messi_e',        emojis: '⚽🐐🇦🇷', answer: 'Lionel Messi',            category: 'personnalite', hint: 'La Pulga — 8 Ballons d\'Or' },
  { id: 'einstein_e',     emojis: '👨‍🦳⚛️💡', answer: 'Albert Einstein',         category: 'personnalite', hint: 'E=mc² — relativité' },
  { id: 'obama_e',        emojis: '🏛️🕊️🇺🇸', answer: 'Barack Obama',           category: 'personnalite', hint: '44e président des USA' },
  { id: 'trump_e',        emojis: '🏆💰🇺🇸', answer: 'Donald Trump',            category: 'personnalite', hint: '45e et 47e président des USA' },
  { id: 'mbappe_e',       emojis: '⚽🇫🇷⚡', answer: 'Kylian Mbappé',           category: 'personnalite', hint: 'PSG / Real Madrid — champion du monde 2018' },
  { id: 'jobs_e',         emojis: '🍎💻🖤', answer: 'Steve Jobs',               category: 'personnalite', hint: 'Co-fondateur Apple' },
  { id: 'zidane_e',       emojis: '⚽🇫🇷🤕', answer: 'Zinédine Zidane',         category: 'personnalite', hint: 'Coup de tête 2006 — Ballon d\'Or' },
  { id: 'mj_pers',        emojis: '🕺🌕💀', answer: 'Michael Jackson',          category: 'personnalite', hint: 'King of Pop — Moonwalk' },
  { id: 'madonna_e',      emojis: '👸🎤💋', answer: 'Madonna',                  category: 'personnalite', hint: 'Queen of Pop — Like a Virgin' },
  { id: 'pele_e',         emojis: '⚽🇧🇷👑', answer: 'Pelé',                    category: 'personnalite', hint: 'O Rei — 3 Coupes du Monde' },
];

export const EMOJI_CATEGORIES = {
  film:         { label: 'Films',       emoji: '🎬', color: '#DC2626' },
  musique:      { label: 'Musique',     emoji: '🎵', color: '#7C3AED' },
  serie:        { label: 'Séries',      emoji: '📺', color: '#0EA5E9' },
  personnalite: { label: 'Célébrités',  emoji: '⭐', color: '#F59E0B' },
};

function buildChoices(correct, allItems) {
  const sameCat = allItems.filter(p => p.category === correct.category && p.id !== correct.id);
  const other   = allItems.filter(p => p.id !== correct.id && p.category !== correct.category);
  const wrongs  = shuffle([...sameCat, ...other]).slice(0, 3);
  return shuffle([correct, ...wrongs]);
}

let _usedIds = new Set();

export function buildEmojiRound(count, categories = ['film', 'musique', 'serie', 'personnalite']) {
  let pool = EMOJI_QUIZ_ITEMS.filter(item => categories.includes(item.category) && !_usedIds.has(item.id));
  if (pool.length < count) {
    _usedIds.clear();
    pool = EMOJI_QUIZ_ITEMS.filter(item => categories.includes(item.category));
  }
  const selected = shuffle([...pool]).slice(0, count);
  selected.forEach(item => _usedIds.add(item.id));
  return selected.map(item => ({
    ...item,
    choices: buildChoices(item, EMOJI_QUIZ_ITEMS),
  }));
}
