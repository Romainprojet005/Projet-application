// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — données des joueurs professionnels Rocket League
// Pas de postes fixes en Rocket League (équipes de 3, contrairement aux 5
// rôles de LoL) : tous les joueurs sont éligibles à n'importe quel slot de
// l'équipe. 36 joueurs vérifiés (Wikipedia + recherche web ciblée —
// Liquipedia/Leaguepedia bloquent l'accès automatisé) : les finalistes du
// Championnat du monde RLCS pour les éditions 2019 (Saisons 7 et 8),
// 2021-22, 2024 et 2025, plus les champions du Major de Copenhague 2024
// (Gentle Mates) et du Major de Birmingham 2025 (Karmine Corp). Plusieurs
// légendes reviennent à plusieurs années différentes (`personId` commun) —
// ex. Atomic finaliste avec G2 Esports (2021-22) puis G2 Stride (2024)
// avant le sacre avec NRG (2025), ou Seikoo champion avec Team BDS (2022)
// puis Gentle Mates (2024). Encore extensible dans une prochaine passe.
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

  // ── GENTLE MATES 2024 — Champions du Major de Copenhague ─────────────
  {
    id: 'itachi_2024', personId: 'itachi', name: 'itachi', realName: 'Amine Benayachi',
    team: 'Gentle Mates', year: 2024, region: 'EU', flag: '🇫🇷',
    power: 86,
    image: null,
    bio: 'Champion du Major de Copenhague 2024 avec Gentle Mates, dès la toute première apparition de l\'écurie en RLCS.',
    signature: "un contrôle aérien qui ne laisse jamais un ballon filer",
    weakness: "un profil plus discret que ses coéquipiers stars",
  },
  {
    id: 'seikoo_2024', personId: 'seikoo', name: 'Seikoo', realName: 'Enzo Grondein',
    team: 'Gentle Mates', year: 2024, region: 'EU', flag: '🇫🇷',
    power: 87,
    image: null,
    bio: 'Champion du Major de Copenhague 2024 avec Gentle Mates, après avoir déjà été sacré champion du monde en 2021-22 avec Team BDS.',
    signature: "une lecture de jeu qui structure tout le trio",
    weakness: "un jeu qui dépend beaucoup du tempo donné par ses coéquipiers",
  },
  {
    id: 'juicy_2024', personId: 'juicy', name: 'Juicy', realName: 'Charles Sabiani',
    team: 'Gentle Mates', year: 2024, region: 'EU', flag: '🇫🇷',
    power: 87,
    image: null,
    bio: 'Champion du Major de Copenhague 2024 avec Gentle Mates, avant de rejoindre Karmine Corp la saison suivante.',
    signature: "un placement défensif qui étouffe toute contre-attaque",
    weakness: "un jeu qui dépend beaucoup du tempo donné par ses coéquipiers",
  },

  // ── G2 ESPORTS 2019 — Finalistes Worlds (Saison 7) ────────────────────
  {
    id: 'rizzo_2019', personId: 'rizzo', name: 'Rizzo', realName: 'Dillon Rizzo',
    team: 'G2 Esports', year: 2019, region: 'NA', flag: '🇺🇸',
    power: 85,
    image: null,
    bio: 'Finaliste des Worlds 2019 (Saison 7) avec G2 Esports, avant de devenir l\'un des créateurs de contenu les plus suivis de la scène.',
    signature: "une capacité à hausser son niveau dans les moments qui comptent",
    weakness: "une équipe encore jeune sur la plus grande des scènes",
  },
  {
    id: 'jknaps_2019', personId: 'jknaps', name: 'JKnaps', realName: 'Jacob Knapman',
    team: 'G2 Esports', year: 2019, region: 'NA', flag: '🇨🇦',
    power: 85,
    image: null,
    bio: 'Finaliste des Worlds 2019 avec G2 Esports, l\'un des piliers nord-américains les plus réguliers de sa génération.',
    signature: "un jeu défensif increvable qui ne craque jamais en infériorité",
    weakness: "une équipe encore jeune sur la plus grande des scènes",
  },
  {
    id: 'chicago_2019', personId: 'chicago', name: 'Chicago', realName: 'Reed Wilen',
    team: 'G2 Esports', year: 2019, region: 'NA', flag: '🇺🇸',
    power: 84,
    image: null,
    bio: 'Finaliste des Worlds 2019 avec G2 Esports à seulement 17 ans, révélation nord-américaine de la saison.',
    signature: "une précocité qui annonçait déjà une future star",
    weakness: "une jeunesse qui peut mener à des prises de risque inutiles",
  },

  // ── NRG ESPORTS 2019 — Champions du monde (Saison 8) ──────────────────
  {
    id: 'garrettg_2019', personId: 'garrettg', name: 'GarrettG', realName: 'Garrett Gordon',
    team: 'NRG Esports', year: 2019, region: 'NA', flag: '🇺🇸',
    power: 89,
    image: null,
    bio: 'Champion du monde 2019 (Saison 8) avec NRG Esports, l\'un des joueurs les plus respectés de l\'histoire nord-américaine.',
    signature: "un leadership qui structure toute l'équipe autour de lui",
    weakness: "un profil plus discret que les mécaniciens les plus flashy",
  },
  {
    id: 'turbopolsa_2019', personId: 'turbopolsa', name: 'Turbopolsa', realName: 'Pierre Silfver',
    team: 'NRG Esports', year: 2019, region: 'NA', flag: '🇸🇪',
    power: 96,
    image: null,
    bio: 'Champion du monde 2019 avec NRG Esports après un transfert historique de l\'Europe vers l\'Amérique du Nord — le joueur le plus titré de l\'histoire du RLCS, avec quatre sacres mondiaux.',
    signature: "un tempo de rotation qui ne laisse jamais un partenaire à découvert",
    weakness: "presque aucune — si ce n'est l'excès de confiance de l'adversaire",
  },
  {
    id: 'jstn_2019', personId: 'jstn', name: 'jstn.', realName: 'Justin Morales',
    team: 'NRG Esports', year: 2019, region: 'NA', flag: '🇺🇸',
    power: 90,
    image: null,
    bio: 'Champion du monde 2019 avec NRG Esports, but victorieux inscrit en prolongation lors d\'une finale à sept manches restée dans les mémoires.',
    signature: "un sang-froid retrouvé au meilleur moment de la finale",
    weakness: "une carrière plus discrète en dehors de ce sacre",
  },

  // ── TEAM BDS 2021-22 — Champions du monde (1er titre du club) ────────
  {
    id: 'm0nkeymoon_2022', personId: 'm0nkeymoon', name: 'M0nkey M00n', realName: 'Evan Rogez',
    team: 'Team BDS', year: 2022, region: 'EU', flag: '🇫🇷',
    power: 90,
    image: null,
    bio: 'Champion du monde 2021-22 avec Team BDS, premier titre mondial de l\'histoire du club français.',
    signature: "un aerial qui ne rate jamais sa fenêtre de tir",
    weakness: "un profil plus discret que les mécaniciens les plus flashy",
  },
  {
    id: 'extra_2022', personId: 'extra', name: 'Extra', realName: 'Alexandre Paoli',
    team: 'Team BDS', year: 2022, region: 'EU', flag: '🇫🇷',
    power: 88,
    image: null,
    bio: 'Champion du monde 2021-22 avec Team BDS, artisan discret du tout premier sacre mondial du club.',
    signature: "un placement défensif qui étouffe toute contre-attaque",
    weakness: "un profil qui s'efface volontairement derrière ses coéquipiers",
  },
  {
    id: 'seikoo_2022', personId: 'seikoo', name: 'Seikoo', realName: 'Enzo Grondein',
    team: 'Team BDS', year: 2022, region: 'EU', flag: '🇫🇷',
    power: 89,
    image: null,
    bio: 'MVP des Worlds 2021-22 avec Team BDS, artisan du tout premier titre mondial du club français.',
    signature: "une lecture de jeu qui structure tout le trio",
    weakness: "un jeu qui dépend beaucoup du tempo donné par ses coéquipiers",
  },

  // ── G2 ESPORTS 2021-22 — Finalistes Worlds ────────────────────────────
  {
    id: 'atomic_2022', personId: 'atomic', name: 'Atomic', realName: 'Massimo Franceschi',
    team: 'G2 Esports', year: 2022, region: 'NA', flag: '🇺🇸',
    power: 87,
    image: null,
    bio: 'Finaliste des Worlds 2021-22 avec G2 Esports dès sa première saison sur le roster, avant de devenir champion du monde trois ans plus tard.',
    signature: "un contrôle de balle chirurgical en zone offensive",
    weakness: "une équipe encore jeune sur la plus grande des scènes",
  },
  {
    id: 'jknaps_2022', personId: 'jknaps', name: 'JKnaps', realName: 'Jacob Knapman',
    team: 'G2 Esports', year: 2022, region: 'NA', flag: '🇨🇦',
    power: 86,
    image: null,
    bio: 'Deuxième finale mondiale avec G2 Esports en 2021-22, trois ans après celle de 2019.',
    signature: "un jeu défensif increvable qui ne craque jamais en infériorité",
    weakness: "une finale mondiale qui lui échappe encore, de justesse",
  },
  {
    id: 'chicago_2022', personId: 'chicago', name: 'Chicago', realName: 'Reed Wilen',
    team: 'G2 Esports', year: 2022, region: 'NA', flag: '🇺🇸',
    power: 86,
    image: null,
    bio: 'Deuxième finale mondiale avec G2 Esports en 2021-22, trois ans après celle de 2019.',
    signature: "une précocité qui annonçait déjà une future star",
    weakness: "une finale mondiale qui lui échappe encore, de justesse",
  },

  // ── TEAM BDS 2024 — Champions du monde ────────────────────────────────
  {
    id: 'm0nkeymoon_2024', personId: 'm0nkeymoon', name: 'M0nkey M00n', realName: 'Evan Rogez',
    team: 'Team BDS', year: 2024, region: 'EU', flag: '🇫🇷',
    power: 91,
    image: null,
    bio: 'Double champion du monde avec Team BDS (2021-22 et 2024), l\'un des joueurs français les plus titrés de l\'histoire du RLCS.',
    signature: "un aerial qui ne rate jamais sa fenêtre de tir",
    weakness: "un profil plus discret que les mécaniciens les plus flashy",
  },
  {
    id: 'dralii_2024', personId: 'dralii', name: 'dralii', realName: 'Samy Hajji',
    team: 'Team BDS', year: 2024, region: 'EU', flag: '🇫🇷',
    power: 88,
    image: null,
    bio: 'Champion du monde 2024 avec Team BDS, artisan de la victoire en finale contre G2 Stride.',
    signature: "une régularité qui ne craque jamais sous la pression",
    weakness: "un profil plus discret que ses coéquipiers stars",
  },
  {
    id: 'exotiik_2024', personId: 'exotiik', name: 'ExoTiiK', realName: 'Brice Bigeard',
    team: 'Team BDS', year: 2024, region: 'EU', flag: '🇫🇷',
    power: 88,
    image: null,
    bio: 'Champion du monde 2024 avec Team BDS, avant de rejoindre Team Vitality les saisons suivantes.',
    signature: "une vitesse d'exécution qui prend toujours de vitesse la défense adverse",
    weakness: "une prise de risque qui peut isoler le reste du trio",
  },

  // ── G2 STRIDE 2024 — Finalistes Worlds ────────────────────────────────
  {
    id: 'beastmode_2024', personId: 'beastmode', name: 'BeastMode', realName: 'Landon Konerman',
    team: 'G2 Stride', year: 2024, region: 'NA', flag: '🇺🇸',
    power: 90,
    image: null,
    bio: 'Finaliste des Worlds 2024 avec G2 Stride, avant d\'être recruté en bloc par NRG Esports pour décrocher le titre mondial l\'année suivante.',
    signature: "un aerial qui ne rate jamais sa fenêtre de tir",
    weakness: "une finale mondiale qui lui échappe encore, de justesse",
  },
  {
    id: 'daniel_2024', personId: 'daniel', name: 'Daniel', realName: 'Daniel Piecenski',
    team: 'G2 Stride', year: 2024, region: 'NA', flag: '🇺🇸',
    power: 88,
    image: null,
    bio: 'Finaliste des Worlds 2024 avec G2 Stride, avant d\'être recruté en bloc par NRG Esports pour décrocher le titre mondial l\'année suivante.',
    signature: "un jeu défensif increvable qui ne craque jamais en infériorité",
    weakness: "une finale mondiale qui lui échappe encore, de justesse",
  },
  {
    id: 'atomic_2024', personId: 'atomic', name: 'Atomic', realName: 'Massimo Franceschi',
    team: 'G2 Stride', year: 2024, region: 'NA', flag: '🇺🇸',
    power: 89,
    image: null,
    bio: 'Deuxième finale mondiale pour Massimo Franceschi, cette fois avec G2 Stride, avant le sacre avec NRG Esports l\'année suivante.',
    signature: "un contrôle de balle chirurgical en zone offensive",
    weakness: "une finale mondiale qui lui échappe encore, de justesse",
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
  kaydop: FAME_S_RL, vatira: FAME_S_RL, turbopolsa: FAME_S_RL,
  scrubkilla: FAME_A_RL, beastmode: FAME_A_RL, atomic: FAME_A_RL, daniel: FAME_A_RL,
  zen: FAME_A_RL, alpha54: FAME_A_RL, juicy: FAME_A_RL, m0nkeymoon: FAME_A_RL,
  garrettg: FAME_A_RL, jstn: FAME_A_RL, rizzo: FAME_A_RL, seikoo: FAME_A_RL,
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
  ['itachi_2024', 'seikoo_2024', 'juicy_2024'],            // Gentle Mates 2024 — Champions du Major de Copenhague
  ['rizzo_2019', 'jknaps_2019', 'chicago_2019'],           // G2 Esports 2019 — Finalistes Worlds (Saison 7)
  ['garrettg_2019', 'turbopolsa_2019', 'jstn_2019'],       // NRG Esports 2019 — Champions du monde (Saison 8)
  ['m0nkeymoon_2022', 'extra_2022', 'seikoo_2022'],        // Team BDS 2021-22 — Champions du monde (1er titre du club)
  ['atomic_2022', 'jknaps_2022', 'chicago_2022'],          // G2 Esports 2021-22 — Finalistes Worlds
  ['m0nkeymoon_2024', 'dralii_2024', 'exotiik_2024'],      // Team BDS 2024 — Champions du monde
  ['beastmode_2024', 'daniel_2024', 'atomic_2024'],        // G2 Stride 2024 — Finalistes Worlds
];

// Génère toutes les paires possibles au sein d'un groupe, en excluant les
// paires qui seraient en réalité la même personne (même `personId`, deux
// années différentes) — un joueur ne peut pas être son propre coéquipier.
function withinPairsRL(ids, personIdOfFn) {
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (!personIdOfFn || personIdOfFn(ids[i]) !== personIdOfFn(ids[j])) out.push([ids[i], ids[j]]);
    }
  }
  return out;
}

function personIdOfRL(id) { return ROCKET_PLAYERS_BY_ID[id]?.personId || id; }

export const TEAMMATES_STRONG_RL = STRONG_GROUPS_RL.flatMap(ids => withinPairsRL(ids, personIdOfRL));

// Même écurie à une autre époque, ou même trio resté soudé à travers un
// transfert/rebranding (G2 Esports → G2 Stride → NRG) → synergie légère.
const BDS_LINEAGE_RL = [
  'm0nkeymoon_2022', 'extra_2022', 'seikoo_2022', 'm0nkeymoon_2024', 'dralii_2024', 'exotiik_2024',
];
const G2_LINEAGE_RL = [
  'rizzo_2019', 'jknaps_2019', 'chicago_2019', 'atomic_2022', 'jknaps_2022', 'chicago_2022',
  'beastmode_2024', 'daniel_2024', 'atomic_2024', 'beastmode_2025', 'atomic_2025', 'daniel_2025',
];

export const TEAMMATES_MILD_RL = [
  ...withinPairsRL(BDS_LINEAGE_RL, personIdOfRL),
  ...withinPairsRL(G2_LINEAGE_RL, personIdOfRL),
];

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
  {
    pair: ['m0nkeymoon_2024', 'beastmode_2024'],
    story: "Un remake de la finale des Worlds 2024 : le Team BDS de M0nkey M00n avait dompté le G2 Stride de BeastMode, décrochant le deuxième titre mondial de l'histoire du club français.",
  },
  {
    pair: ['m0nkeymoon_2022', 'atomic_2022'],
    story: "Un remake de la toute première finale mondiale de Team BDS : en 2021-22 à Fort Worth, le trio de M0nkey M00n avait dompté le G2 Esports d'Atomic pour le tout premier titre mondial du club français.",
  },
  {
    pair: ['jstn_2019', 'kaydop_2019'],
    story: "Un remake de la finale de la Saison 8 (2019) : le NRG Esports de jstn avait dompté le Renault Vitality de Kaydop en sept manches, le but victorieux de jstn en prolongation restant l'un des moments les plus mémorables de l'histoire du RLCS.",
  },
  {
    pair: ['rizzo_2019', 'kaydop_2019'],
    story: "Un remake de la finale de la Saison 7 (2019) : le Renault Vitality de Kaydop avait dompté le G2 Esports de Rizzo pour le tout premier titre mondial du club français, avant que Vitality n'affronte NRG en fin d'année dans la revanche de la Saison 8.",
  },
];
