// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — données des joueurs professionnels Rocket League
// Pas de postes fixes en Rocket League (équipes de 3, contrairement aux 5
// rôles de LoL) : tous les joueurs sont éligibles à n'importe quel slot de
// l'équipe. Premier lot vérifié : 5 vrais trios (15 joueurs), sourcés sur
// Wikipedia (Liquipedia/Leaguepedia bloquent l'accès automatisé) — le
// champion du monde RLCS 2025 (NRG Esports) et son finaliste (Team
// Falcons), les champions du Major de Birmingham 2025 (Karmine Corp), et
// deux rosters historiques de Team Vitality (champions du monde 2019 et
// 2022-23, ces derniers premiers doubles champions du monde de l'histoire
// du RLCS). Extensible dans une passe ultérieure comme pour le roster LoL.
// ─────────────────────────────────────────────────────────────────────────

export const ROCKET_SLOT_ORDER = ['P1', 'P2', 'P3'];
export const ROCKET_SLOT_META = {
  P1: { id: 'P1', label: 'Duel 1', emoji: '🚀', order: 0 },
  P2: { id: 'P2', label: 'Duel 2', emoji: '🚀', order: 1 },
  P3: { id: 'P3', label: 'Duel 3', emoji: '🚀', order: 2 },
};

export const ROCKET_PLAYERS = [
  // ── NRG ESPORTS 2025 — Champions du monde ────────────────────────────
  {
    id: 'beastmode_2025', personId: 'beastmode', name: 'BeastMode', realName: 'Landon Konerman',
    team: 'NRG Esports', year: 2025, region: 'NA', flag: '🇺🇸',
    power: 93,
    image: null,
    bio: 'Champion du monde 2025 avec NRG Esports, première équipe nord-américaine à soulever le trophée dans les années 2020.',
    signature: "un aerial qui ne rate jamais sa fenêtre de tir",
    weakness: "une équipe qui a mis du temps à trouver ses automatismes après le transfert",
  },
  {
    id: 'atomic_2025', personId: 'atomic', name: 'Atomic', realName: 'Massimo Franceschi',
    team: 'NRG Esports', year: 2025, region: 'NA', flag: '🇺🇸',
    power: 92,
    image: null,
    bio: 'Champion du monde 2025 avec NRG Esports, après un titre et deux Majors déjà glanés sous les couleurs de G2.',
    signature: "un contrôle de balle chirurgical en zone offensive",
    weakness: "un profil plus discret que les mécaniciens les plus flashy",
  },
  {
    id: 'daniel_2025', personId: 'daniel', name: 'Daniel', realName: 'Daniel Piecenski',
    team: 'NRG Esports', year: 2025, region: 'NA', flag: '🇺🇸',
    power: 91,
    image: null,
    bio: 'Champion du monde 2025 avec NRG Esports, pilier discret d\'un trio recruté en bloc depuis G2 fin 2024.',
    signature: "un jeu défensif increvable qui ne craque jamais en infériorité",
    weakness: "un impact offensif plus mesuré que ses coéquipiers",
  },

  // ── TEAM FALCONS 2025 — Finalistes Worlds ────────────────────────────
  {
    id: 'trk511_2025', personId: 'trk511', name: 'trk511', realName: 'Mohammed Alotaibi',
    team: 'Team Falcons', year: 2025, region: 'MENA', flag: '🇸🇦',
    power: 88,
    image: null,
    bio: 'Finaliste des Worlds 2025 avec Team Falcons, première équipe du Moyen-Orient à atteindre une finale mondiale.',
    signature: "une lecture de jeu qui structure tout le trio",
    weakness: "une finale perdue face à un trio nord-américain plus expérimenté",
  },
  {
    id: 'rw9_2025', personId: 'rw9', name: 'Rw9', realName: 'Saleh Bakhashwin',
    team: 'Team Falcons', year: 2025, region: 'MENA', flag: '🇸🇦',
    power: 87,
    image: null,
    bio: 'Finaliste des Worlds 2025 avec Team Falcons aux côtés de son frère Kiileerrz, duo saoudien devenu une référence régionale.',
    signature: "une complicité de duo qui déstabilise toutes les rotations adverses",
    weakness: "un profil encore jeune sur la plus grande des scènes",
  },
  {
    id: 'kiileerrz_2025', personId: 'kiileerrz', name: 'Kiileerrz', realName: 'Yazid Bakhashwin',
    team: 'Team Falcons', year: 2025, region: 'MENA', flag: '🇸🇦',
    power: 87,
    image: null,
    bio: 'Finaliste des Worlds 2025 avec Team Falcons, artisan du tout premier titre international mondial pour la région MENA.',
    signature: "une complicité de duo qui déstabilise toutes les rotations adverses",
    weakness: "un profil encore jeune sur la plus grande des scènes",
  },

  // ── KARMINE CORP — Champions du Major de Birmingham 2025 ─────────────
  {
    id: 'juicy_2025', personId: 'juicy', name: 'Juicy', realName: 'Charles Sabiani',
    team: 'Karmine Corp', year: 2025, region: 'EU', flag: '🇫🇷',
    power: 89,
    image: null,
    bio: 'Champion du Major de Birmingham 2025 avec Karmine Corp, double vainqueur de Major et fer de lance du Rocket League français.',
    signature: "un placement défensif qui étouffe toute contre-attaque",
    weakness: "un jeu qui dépend beaucoup du tempo donné par ses coéquipiers",
  },
  {
    id: 'atow_2025', personId: 'atow', name: 'Atow.', realName: 'Tristan Soyez',
    team: 'Karmine Corp', year: 2025, region: 'EU', flag: '🇧🇪',
    power: 88,
    image: null,
    bio: 'Champion du Major de Birmingham 2025 avec Karmine Corp, ailier belge à la vitesse d\'exécution redoutée dans tout le RLCS.',
    signature: "une vitesse d'exécution qui prend toujours de vitesse la défense adverse",
    weakness: "une prise de risque qui peut isoler le reste du trio",
  },
  {
    id: 'vatira_2025', personId: 'vatira', name: 'Vatira', realName: 'Axel Touret',
    team: 'Karmine Corp', year: 2025, region: 'EU', flag: '🇫🇷',
    power: 94,
    image: null,
    bio: 'Champion du Major de Birmingham 2025 avec Karmine Corp, joueur le plus titré de l\'histoire des Majors RLCS avec quatre trophées.',
    signature: "un mécanique de freestyle qui redéfinit ce qui est possible en match",
    weakness: "un style si créatif qu'il peut parfois se faire punir sur une erreur",
  },

  // ── TEAM VITALITY 2022-23 — Champions du monde ───────────────────────
  {
    id: 'alpha54_2023', personId: 'alpha54', name: 'Alpha54', realName: 'Yanis Champenois',
    team: 'Team Vitality', year: 2023, region: 'EU', flag: '🇫🇷',
    power: 90,
    image: null,
    bio: 'Champion du monde 2022-23 avec Team Vitality, premier club de l\'histoire du RLCS à décrocher deux titres mondiaux.',
    signature: "un aerial qui ne rate jamais sa fenêtre de tir",
    weakness: "un profil plus discret que les mécaniciens les plus flashy",
  },
  {
    id: 'radosin_2023', personId: 'radosin', name: 'Radosin', realName: 'Andrea Radovanović',
    team: 'Team Vitality', year: 2023, region: 'EU', flag: '🇷🇸',
    power: 89,
    image: null,
    bio: 'Champion du monde 2022-23 avec Team Vitality, artisan du seul split parfait de l\'histoire du RLCS (Open, Cup et Invitational balayés).',
    signature: "un contrôle de balle chirurgical en zone offensive",
    weakness: "une adaptation encore récente à ce niveau de compétition",
  },
  {
    id: 'zen_2023', personId: 'zen', name: 'zen', realName: 'Alexis Bernier',
    team: 'Team Vitality', year: 2023, region: 'EU', flag: '🇫🇷',
    power: 90,
    image: null,
    bio: 'Champion du monde 2022-23 avec Team Vitality, toujours titulaire du club des années plus tard, pilier de longévité rare au sommet.',
    signature: "un placement défensif qui étouffe toute contre-attaque",
    weakness: "un jeu qui dépend beaucoup du tempo donné par ses coéquipiers",
  },

  // ── RENAULT VITALITY 2019 — Champions du monde (Saison 7) ────────────
  {
    id: 'fairypeak_2019', personId: 'fairypeak', name: 'Fairy Peak!', realName: 'Victor Locquet',
    team: 'Renault Vitality', year: 2019, region: 'EU', flag: '🇫🇷',
    power: 88,
    image: null,
    bio: 'Champion du monde 2019 (Saison 7) avec Renault Vitality, en battant G2 Esports en finale.',
    signature: "une lecture de jeu qui structure tout le trio",
    weakness: "un profil plus discret que ses coéquipiers stars",
  },
  {
    id: 'scrubkilla_2019', personId: 'scrubkilla', name: 'Scrub Killa', realName: 'Kyle Robertson',
    team: 'Renault Vitality', year: 2019, region: 'EU', flag: '🇬🇧',
    power: 89,
    image: null,
    bio: 'MVP des Worlds 2019 avec Renault Vitality, l\'un des mécaniciens les plus spectaculaires de l\'histoire du jeu.',
    signature: "un mécanique de freestyle qui redéfinit ce qui est possible en match",
    weakness: "une prise de risque qui peut se retourner contre lui",
  },
  {
    id: 'kaydop_2019', personId: 'kaydop', name: 'Kaydop', realName: 'Alexandre Courant',
    team: 'Renault Vitality', year: 2019, region: 'EU', flag: '🇫🇷',
    power: 95,
    image: null,
    bio: 'Champion du monde 2019 avec Renault Vitality, l\'un des joueurs les plus titrés de l\'histoire du RLCS avec trois sacres mondiaux.',
    signature: "une lecture de jeu qui a défini des générations entières de joueurs",
    weakness: "presque aucune — si ce n'est l'excès de confiance de l'adversaire",
  },
];

export const ROCKET_PLAYERS_BY_ID = Object.fromEntries(ROCKET_PLAYERS.map(p => [p.id, p]));

// ─────────────────────────────────────────────────────────────────────────
// NOTORIÉTÉ — même logique que pour le roster LoL (voir lolPlayers.js).
// ─────────────────────────────────────────────────────────────────────────
const FAME_S_RL = 95;
const FAME_A_RL = 78;
const FAME_B_RL = 58;

const FAME_TIERS_RL = {
  kaydop: FAME_S_RL, vatira: FAME_S_RL,
  scrubkilla: FAME_A_RL, beastmode: FAME_A_RL, atomic: FAME_A_RL, daniel: FAME_A_RL,
  zen: FAME_A_RL, alpha54: FAME_A_RL, juicy: FAME_A_RL,
};

export function fameOfRocket(player) {
  return FAME_TIERS_RL[player.personId] ?? FAME_B_RL;
}

// Retourne le vivier filtré par niveau de connaissance — pas de partition
// par poste ici (contrairement à LoL) puisque les 3 slots sont partagés :
// on garde un minimum de 9 joueurs pour que le mécanisme de trios (3 slots
// × 3 cartes) puisse toujours démarrer, même à 25 %.
export function getFilteredPoolRocket(familiarity = 100) {
  if (familiarity >= 100) return ROCKET_PLAYERS;
  const sorted = [...ROCKET_PLAYERS].sort(
    (a, b) => (fameOfRocket(b) * 1000 + b.power) - (fameOfRocket(a) * 1000 + a.power)
  );
  const keepCount = Math.max(9, Math.round(sorted.length * familiarity / 100));
  return sorted.slice(0, keepCount);
}

// ─────────────────────────────────────────────────────────────────────────
// SYNERGIE — vrais trios ayant réellement joué ensemble → forte synergie.
// Pas encore de lignée « même écurie, années différentes » (aucun joueur
// n'apparaît deux fois dans ce premier lot) : TEAMMATES_MILD reste vide
// pour l'instant, prêt à être rempli dans une prochaine extension.
// ─────────────────────────────────────────────────────────────────────────
const STRONG_GROUPS_RL = [
  ['beastmode_2025', 'atomic_2025', 'daniel_2025'],       // NRG Esports 2025 — Champions du monde
  ['trk511_2025', 'rw9_2025', 'kiileerrz_2025'],           // Team Falcons 2025 — Finalistes Worlds
  ['juicy_2025', 'atow_2025', 'vatira_2025'],              // Karmine Corp — Champions du Major de Birmingham 2025
  ['alpha54_2023', 'radosin_2023', 'zen_2023'],            // Team Vitality 2022-23 — Champions du monde
  ['fairypeak_2019', 'scrubkilla_2019', 'kaydop_2019'],    // Renault Vitality 2019 — Champions du monde (Saison 7)
];

function withinPairsRL(ids) {
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      out.push([ids[i], ids[j]]);
    }
  }
  return out;
}

export const TEAMMATES_STRONG_RL = STRONG_GROUPS_RL.flatMap(withinPairsRL);
export const TEAMMATES_MILD_RL = [];

function pairKeyRL(a, b) { return [a, b].sort().join('__'); }

const TEAMMATES_STRONG_SET_RL = new Set(TEAMMATES_STRONG_RL.map(([a, b]) => pairKeyRL(a, b)));
const TEAMMATES_MILD_SET_RL = new Set(TEAMMATES_MILD_RL.map(([a, b]) => pairKeyRL(a, b)));

export function relationBetweenRocket(idA, idB) {
  const key = pairKeyRL(idA, idB);
  if (TEAMMATES_STRONG_SET_RL.has(key)) return 'strong';
  if (TEAMMATES_MILD_SET_RL.has(key)) return 'mild';
  return null;
}

// Rivalités marquantes (pur récit, aucun impact sur le score)
export const ROCKET_RIVALRIES = [
  {
    pair: ['beastmode_2025', 'trk511_2025'],
    story: "Un remake de la finale des Worlds 2025 : le NRG Esports de BeastMode avait dompté le Team Falcons de trk511, 4-1, devenant la première équipe nord-américaine championne du monde de la décennie.",
  },
];
