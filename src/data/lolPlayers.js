// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — données des 15 joueurs professionnels League of Legends
// 3 joueurs par poste (TOP / JGL / MID / ADC / SUP), à des années différentes
// de leur carrière. La force (`power`) reflète leur niveau de domination
// réelle CETTE année-là (ex : Faker 2015 > Chovy 2022, cf. palmarès).
// Photos : Wikimedia Commons (licence libre). Quand aucune photo Wikipédia
// fiable n'a été trouvée, `image` vaut null → le poste s'affiche sans photo.
// ─────────────────────────────────────────────────────────────────────────

export const ROLE_META = {
  TOP: { id: 'TOP', label: 'Top',     emoji: '⚔️', order: 0 },
  JGL: { id: 'JGL', label: 'Jungle',  emoji: '🗡️', order: 1 },
  MID: { id: 'MID', label: 'Mid',     emoji: '🔮', order: 2 },
  ADC: { id: 'ADC', label: 'ADC',     emoji: '🏹', order: 3 },
  SUP: { id: 'SUP', label: 'Support', emoji: '💠', order: 4 },
};

export const ROLE_ORDER = ['TOP', 'JGL', 'MID', 'ADC', 'SUP'];

export const LOL_PLAYERS = [
  // ── TOP ────────────────────────────────────────────────────────────────
  {
    id: 'marin_2015', name: 'MaRin', realName: 'Jang Gyeong-hwan',
    role: 'TOP', team: 'SK Telecom T1', year: 2015, region: 'LCK', flag: '🇰🇷',
    power: 86,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Jang_Gyeong-hwan_or_MaRin%2C_SK_Telecom_T1%2C_2015_League_of_Legends_World_Championship.jpg/250px-Jang_Gyeong-hwan_or_MaRin%2C_SK_Telecom_T1%2C_2015_League_of_Legends_World_Championship.jpg',
    bio: 'MVP des Worlds 2015, pionnier du top lane créatif et agressif.',
    signature: "un pick de champion impossible à anticiper",
    weakness: "une préparation un peu plus fragile en fin de partie",
  },
  {
    id: 'theshy_2018', name: 'TheShy', realName: 'Kang Seung-lok',
    role: 'TOP', team: 'Invictus Gaming', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 92,
    image: null,
    bio: 'Champion du monde 2018 avec Invictus Gaming, top laner le plus explosif de sa génération.',
    signature: "une agressivité qui fait exploser toutes les lanes",
    weakness: "un excès de confiance qui peut coûter très cher",
  },
  {
    id: 'khan_2021', name: 'Khan', realName: 'Kim Dong-ha',
    role: 'TOP', team: 'DWG KIA', year: 2021, region: 'LCK', flag: '🇰🇷',
    power: 89,
    image: null,
    bio: 'Finaliste des Worlds 2021 avec DWG KIA, roster de champions au style ultra polyvalent.',
    signature: "une polyvalence redoutable sur tout le roster",
    weakness: "un temps d'adaptation quand la composition change",
  },

  // ── JUNGLE ────────────────────────────────────────────────────────────
  {
    id: 'canyon_2021', name: 'Canyon', realName: 'Kim Geon-bu',
    role: 'JGL', team: 'DWG KIA', year: 2021, region: 'LCK', flag: '🇰🇷',
    power: 93,
    image: null,
    bio: 'Considéré comme l\'un des meilleurs junglers de l\'histoire, tempo de jeu presque inhumain.',
    signature: "un tempo de jungle presque inhumain",
    weakness: "une jungle encore jeune face à un adversaire chevronné",
  },
  {
    id: 'peanut_2022', name: 'Peanut', realName: 'Han Wang-ho',
    role: 'JGL', team: 'Gen.G', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 85,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Peanut_2025.jpg/250px-Peanut_2025.jpg',
    bio: 'Pilier de Gen.G 2022, champion LCK au printemps avec un instinct de ganks précoces.',
    signature: "un instinct de ganks précoces qui déséquilibre tout",
    weakness: "un manque de setup quand la partie s'éternise",
  },
  {
    id: 'oner_2023', name: 'Oner', realName: 'Moon Hyeon-jun',
    role: 'JGL', team: 'T1', year: 2023, region: 'LCK', flag: '🇰🇷',
    power: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Oner_at_Worlds_2025.jpg/250px-Oner_at_Worlds_2025.jpg',
    bio: 'Champion du monde 2023 avec T1, lecture des objectifs sans faille.',
    signature: "une lecture des objectifs sans faille",
    weakness: "une préférence pour jouer collectif plutôt que solo",
  },

  // ── MID ───────────────────────────────────────────────────────────────
  {
    id: 'faker_2015', name: 'Faker', realName: 'Lee Sang-hyeok',
    role: 'MID', team: 'SK Telecom T1', year: 2015, region: 'LCK', flag: '🇰🇷',
    power: 98,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Faker_2020_interview.jpg',
    bio: 'À son apogée légendaire, double champion du monde consécutif, sang-froid inégalé.',
    signature: "un sang-froid devenu légendaire",
    weakness: "presque aucune — si ce n'est l'excès de confiance de l'adversaire",
  },
  {
    id: 'chovy_2022', name: 'Chovy', realName: 'Jeong Ji-hoon',
    role: 'MID', team: 'Gen.G', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 91,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Chovy_MSI_2025.jpg/250px-Chovy_MSI_2025.jpg',
    bio: 'Phase de laning quasi parfaite, considéré comme le mid le plus propre mécaniquement.',
    signature: "une phase de laning quasi parfaite",
    weakness: "une prise de risque parfois trop calculée",
  },
  {
    id: 'caps_2019', name: 'Caps', realName: 'Rasmus Winther',
    role: 'MID', team: 'G2 Esports', year: 2019, region: 'LEC', flag: '🇩🇰',
    power: 89,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Caps_2025.jpg/250px-Caps_2025.jpg',
    bio: 'MVP du MSI 2019, meilleur joueur occidental de sa génération, créativité débridée.',
    signature: "une créativité qui déstabilise n'importe quel plan",
    weakness: "un all-in qui peut se retourner contre lui",
  },

  // ── ADC ───────────────────────────────────────────────────────────────
  {
    id: 'uzi_2018', name: 'Uzi', realName: 'Jian Zi-Hao',
    role: 'ADC', team: 'Royal Never Give Up', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Uzi_in_Journey_to_the_Top_-_2022_LPL_Spring_Split.jpg/250px-Uzi_in_Journey_to_the_Top_-_2022_LPL_Spring_Split.jpg',
    bio: 'Champion du MSI 2018, DPS explosif considéré comme l\'un des plus grands ADC de l\'histoire.',
    signature: "un DPS explosif dès que les items tombent",
    weakness: "un démarrage de partie parfois hésitant",
  },
  {
    id: 'deft_2022', name: 'Deft', realName: 'Kim Hyuk-kyu',
    role: 'ADC', team: 'DRX', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 88,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Deft_interview_in_2022.jpg/250px-Deft_interview_in_2022.jpg',
    bio: 'Champion du monde 2022 avec DRX au terme d\'un run miracle en outsider absolu.',
    signature: "une régularité forgée par des années de scène",
    weakness: "un profil prévisible pour une préparation adverse pointue",
  },
  {
    id: 'ruler_2022', name: 'Ruler', realName: 'Park Jae-hyuk',
    role: 'ADC', team: 'Gen.G', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 92,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ruler_interview_2022.jpg/250px-Ruler_interview_2022.jpg',
    bio: 'Meilleur ADC LCK 2022, positionnement chirurgical en combat d\'équipe.',
    signature: "un positionnement en combat d'équipe chirurgical",
    weakness: "une dépendance à une jungle qui doit le protéger",
  },

  // ── SUPPORT ───────────────────────────────────────────────────────────
  {
    id: 'wolf_2015', name: 'Wolf', realName: 'Lee Jae-wan',
    role: 'SUP', team: 'SK Telecom T1', year: 2015, region: 'LCK', flag: '🇰🇷',
    power: 84,
    image: null,
    bio: 'Double champion du monde avec SKT T1, engages qui changent une partie à eux seuls.',
    signature: "des engages qui changent une partie à eux seuls",
    weakness: "une prise de risque qui peut isoler son ADC",
  },
  {
    id: 'beryl_2022', name: 'BeryL', realName: 'Cho Geon-hee',
    role: 'SUP', team: 'DRX', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 90,
    image: null,
    bio: 'Double champion du monde (2020 puis 2022), contrôle de vision qui étouffe la carte.',
    signature: "un contrôle de vision qui étouffe la carte",
    weakness: "un profil plus passif si on lui coupe sa roam",
  },
  {
    id: 'keria_2023', name: 'Keria', realName: 'Ryu Min-seok',
    role: 'SUP', team: 'T1', year: 2023, region: 'LCK', flag: '🇰🇷',
    power: 94,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Keria%2C_2023_worlds_winning_team_interview.jpg/250px-Keria%2C_2023_worlds_winning_team_interview.jpg',
    bio: 'Champion du monde 2023 avec T1, playmaking hors norme capable de tout retourner.',
    signature: "un playmaking hors norme, capable de tout retourner",
    weakness: "un style si créatif qu'il peut parfois se faire punir",
  },
];

export const LOL_PLAYERS_BY_ID = Object.fromEntries(LOL_PLAYERS.map(p => [p.id, p]));

// ─────────────────────────────────────────────────────────────────────────
// RELATIONS — coéquipiers réels (même club, même année) et anciens
// coéquipiers / même écurie à une autre époque. Utilisées pour la synergie
// d'équipe et pour enrichir le récit du tournoi.
// ─────────────────────────────────────────────────────────────────────────

// Coéquipiers directs, même club ET même année → forte synergie
export const TEAMMATES_STRONG = [
  ['marin_2015', 'faker_2015'], ['marin_2015', 'wolf_2015'], ['faker_2015', 'wolf_2015'], // SKT T1 2015 — Champions du monde
  ['peanut_2022', 'chovy_2022'], ['peanut_2022', 'ruler_2022'], ['chovy_2022', 'ruler_2022'], // Gen.G 2022
  ['khan_2021', 'canyon_2021'], // DWG KIA 2021 — Finalistes Worlds
  ['deft_2022', 'beryl_2022'], // DRX 2022 — Champions du monde
  ['oner_2023', 'keria_2023'], // T1 2023 — Champions du monde
];

// Même écurie/maison à une autre époque (académie, culture commune) → synergie légère
export const TEAMMATES_MILD = [
  ['khan_2021', 'beryl_2022'], ['canyon_2021', 'beryl_2022'], // BeryL est passé par DWG KIA avant DRX
  ['marin_2015', 'oner_2023'], ['marin_2015', 'keria_2023'],
  ['faker_2015', 'oner_2023'], ['faker_2015', 'keria_2023'],
  ['wolf_2015', 'oner_2023'], ['wolf_2015', 'keria_2023'], // lignée SKT T1 → T1
];

// Rivalités marquantes (pur récit, aucun impact sur le score)
export const RIVALRIES = [
  {
    pair: ['ruler_2022', 'deft_2022'],
    story: "Un air de déjà-vu : en quart de finale des Worlds 2022, le DRX de Deft avait déjà sorti le grand favori Gen.G de Ruler contre toute attente.",
  },
];

function pairKey(a, b) { return [a, b].sort().join('__'); }

export const TEAMMATES_STRONG_SET = new Set(TEAMMATES_STRONG.map(([a, b]) => pairKey(a, b)));
export const TEAMMATES_MILD_SET   = new Set(TEAMMATES_MILD.map(([a, b]) => pairKey(a, b)));

export function relationBetween(idA, idB) {
  const key = pairKey(idA, idB);
  if (TEAMMATES_STRONG_SET.has(key)) return 'strong';
  if (TEAMMATES_MILD_SET.has(key))   return 'mild';
  return null;
}
