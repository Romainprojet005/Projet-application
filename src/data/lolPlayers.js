// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — données des joueurs professionnels League of Legends
// Plusieurs joueurs par poste (TOP / JGL / MID / ADC / SUP), venus de LCK
// (Corée), LEC (Europe) et LPL (Chine), à des années différentes de leur
// carrière. Certaines légendes apparaissent PLUSIEURS FOIS, à des années
// différentes (`personId` commun) — ex. Faker 2015 (pic de forme) est plus
// fort que Faker 2023, bien que tous deux soient d'authentiques champions
// du monde. La force (`power`) reflète leur niveau de domination réelle
// CETTE année-là. Photos : Wikimedia Commons (licence libre). Quand aucune
// photo Wikipédia fiable n'a été trouvée, `image` vaut null → le poste
// s'affiche sans photo.
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
    id: 'marin_2015', personId: 'marin', name: 'MaRin', realName: 'Jang Gyeong-hwan',
    role: 'TOP', team: 'SK Telecom T1', year: 2015, region: 'LCK', flag: '🇰🇷',
    power: 86,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Jang_Gyeong-hwan_or_MaRin%2C_SK_Telecom_T1%2C_2015_League_of_Legends_World_Championship.jpg/250px-Jang_Gyeong-hwan_or_MaRin%2C_SK_Telecom_T1%2C_2015_League_of_Legends_World_Championship.jpg',
    bio: 'MVP des Worlds 2015, pionnier du top lane créatif et agressif.',
    signature: "un pick de champion impossible à anticiper",
    weakness: "une préparation un peu plus fragile en fin de partie",
  },
  {
    id: 'theshy_2018', personId: 'theshy', name: 'TheShy', realName: 'Kang Seung-lok',
    role: 'TOP', team: 'Invictus Gaming', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 92,
    image: null,
    bio: 'Champion du monde 2018 avec Invictus Gaming, top laner le plus explosif de sa génération.',
    signature: "une agressivité qui fait exploser toutes les lanes",
    weakness: "un excès de confiance qui peut coûter très cher",
  },
  {
    id: 'theshy_2024', personId: 'theshy', name: 'TheShy', realName: 'Kang Seung-lok',
    role: 'TOP', team: 'JD Gaming', year: 2024, region: 'LPL', flag: '🇨🇳',
    power: 90,
    image: null,
    bio: 'Nouveau sacre mondial en 2024 avec JD Gaming, toujours aussi dangereux en solo-kill.',
    signature: "un solo-kill qui peut tomber à n'importe quel moment",
    weakness: "des jambes un peu moins fraîches qu'à ses débuts",
  },
  {
    id: 'khan_2021', personId: 'khan', name: 'Khan', realName: 'Kim Dong-ha',
    role: 'TOP', team: 'DWG KIA', year: 2021, region: 'LCK', flag: '🇰🇷',
    power: 89,
    image: null,
    bio: 'Finaliste des Worlds 2021 avec DWG KIA, roster de champions au style ultra polyvalent.',
    signature: "une polyvalence redoutable sur tout le roster",
    weakness: "un temps d'adaptation quand la composition change",
  },
  {
    id: 'zeus_2023', personId: 'zeus', name: 'Zeus', realName: 'Choi Woo-je',
    role: 'TOP', team: 'T1', year: 2023, region: 'LCK', flag: '🇰🇷',
    power: 88,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Zeus_2024_post-match_interview.jpg/250px-Zeus_2024_post-match_interview.jpg',
    bio: 'Champion du monde 2023 avec T1 dès sa première année pro, sang-froid déjà impressionnant.',
    signature: "un sang-froid impressionnant pour un si jeune roster",
    weakness: "un manque encore d'expérience dans les longues séries",
  },
  {
    id: 'wunder_2019', personId: 'wunder', name: 'Wunder', realName: 'Martin Hansen',
    role: 'TOP', team: 'G2 Esports', year: 2019, region: 'LEC', flag: '🇩🇰',
    power: 85,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Wunder_in_2021.jpg/250px-Wunder_in_2021.jpg',
    bio: 'Champion du MSI 2019 et finaliste des Worlds avec G2 Esports, pilier du top lane européen.',
    signature: "une capacité à absorber la pression sans lane",
    weakness: "un style parfois trop passif si le jungler ne vient pas",
  },
  {
    id: 'bin_2021', personId: 'bin', name: 'Bin', realName: 'Chen Ze-Bin',
    role: 'TOP', team: 'EDward Gaming', year: 2021, region: 'LPL', flag: '🇨🇳',
    power: 87,
    image: null,
    bio: 'Champion du monde 2021 avec EDG, style flamboyant hérité de l\'école chinoise du top lane.',
    signature: "un flamboyant sens du timing en side lane",
    weakness: "une prise de risque qui peut isoler son équipe",
  },
  {
    id: 'kingen_2022', personId: 'kingen', name: 'Kingen', realName: 'Hwang Seong-hoon',
    role: 'TOP', team: 'DRX', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 84,
    image: null,
    bio: 'Champion du monde 2022 avec DRX au terme d\'un run miracle depuis les play-ins.',
    signature: "une solidité inattendue qui a porté tout un run miracle",
    weakness: "un profil moins spectaculaire que ses adversaires directs",
  },
  {
    id: 'nuguri_2020', personId: 'nuguri', name: 'Nuguri', realName: 'Jang Ha-gwon',
    role: 'TOP', team: 'DAMWON Gaming', year: 2020, region: 'LCK', flag: '🇰🇷',
    power: 88,
    image: null,
    bio: 'Champion du monde 2020 avec DAMWON Gaming, pool de champions large et sans faille.',
    signature: "un pool de champions si large qu'il en devient imprévisible",
    weakness: "une dépendance à un draft favorable pour exploser",
  },

  // ── JUNGLE ────────────────────────────────────────────────────────────
  {
    id: 'canyon_2020', personId: 'canyon', name: 'Canyon', realName: 'Kim Geon-bu',
    role: 'JGL', team: 'DAMWON Gaming', year: 2020, region: 'LCK', flag: '🇰🇷',
    power: 95,
    image: null,
    bio: 'MVP des Worlds 2020 avec DAMWON Gaming, considéré comme son année la plus dominante.',
    signature: "un tempo de jungle presque inhumain",
    weakness: "une jeunesse qui peut encore sur-agresser",
  },
  {
    id: 'canyon_2021', personId: 'canyon', name: 'Canyon', realName: 'Kim Geon-bu',
    role: 'JGL', team: 'DWG KIA', year: 2021, region: 'LCK', flag: '🇰🇷',
    power: 93,
    image: null,
    bio: 'Encore finaliste des Worlds 2021 avec DWG KIA, l\'un des meilleurs junglers de l\'histoire.',
    signature: "une lecture de carte encore un cran au-dessus",
    weakness: "une bande d'adversaires qui a eu le temps d'étudier son style",
  },
  {
    id: 'peanut_2022', personId: 'peanut', name: 'Peanut', realName: 'Han Wang-ho',
    role: 'JGL', team: 'Gen.G', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 85,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Peanut_2025.jpg/250px-Peanut_2025.jpg',
    bio: 'Pilier de Gen.G 2022, champion LCK au printemps avec un instinct de ganks précoces.',
    signature: "un instinct de ganks précoces qui déséquilibre tout",
    weakness: "un manque de setup quand la partie s'éternise",
  },
  {
    id: 'oner_2023', personId: 'oner', name: 'Oner', realName: 'Moon Hyeon-jun',
    role: 'JGL', team: 'T1', year: 2023, region: 'LCK', flag: '🇰🇷',
    power: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Oner_at_Worlds_2025.jpg/250px-Oner_at_Worlds_2025.jpg',
    bio: 'Champion du monde 2023 avec T1, lecture des objectifs sans faille.',
    signature: "une lecture des objectifs sans faille",
    weakness: "une préférence pour jouer collectif plutôt que solo",
  },
  {
    id: 'tian_2021', personId: 'tian', name: 'Tian', realName: 'Gao Tian-Liang',
    role: 'JGL', team: 'EDward Gaming', year: 2021, region: 'LPL', flag: '🇨🇳',
    power: 88,
    image: null,
    bio: 'Champion du monde 2021 avec EDG, jungle discret mais d\'une efficacité redoutable.',
    signature: "une efficacité discrète qui ne laisse rien au hasard",
    weakness: "un style moins spectaculaire qui peut sembler passif",
  },
  {
    id: 'jankos_2019', personId: 'jankos', name: 'Jankos', realName: 'Marcin Jankowski',
    role: 'JGL', team: 'G2 Esports', year: 2019, region: 'LEC', flag: '🇵🇱',
    power: 87,
    image: null,
    bio: 'Champion du MSI 2019 avec G2, jungler le plus décoré de l\'histoire européenne.',
    signature: "un charisme et une prise de risque qui portent toute l'équipe",
    weakness: "un excès de confiance qui peut virer au troll fight",
  },
  {
    id: 'pyosik_2022', personId: 'pyosik', name: 'Pyosik', realName: 'Hong Chang-hyun',
    role: 'JGL', team: 'DRX', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 86,
    image: null,
    bio: 'Champion du monde 2022 avec DRX, pièce maîtresse discrète du run miracle.',
    signature: "un pathing propre qui libère l'espace pour ses lanes",
    weakness: "un profil qui a besoin d'une équipe soudée autour de lui",
  },
  {
    id: 'kanavi_2024', personId: 'kanavi', name: 'Kanavi', realName: 'Seo Jin-hyeok',
    role: 'JGL', team: 'JD Gaming', year: 2024, region: 'LPL', flag: '🇰🇷',
    power: 89,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Kanavi_2020_interview.jpg/250px-Kanavi_2020_interview.jpg',
    bio: 'Champion du monde 2024 avec JD Gaming, déjà titré au MSI avec RNG en 2018.',
    signature: "une expérience de la scène chinoise inégalée",
    weakness: "un rythme parfois freiné par une early game trop prudente",
  },

  // ── MID ───────────────────────────────────────────────────────────────
  {
    id: 'faker_2015', personId: 'faker', name: 'Faker', realName: 'Lee Sang-hyeok',
    role: 'MID', team: 'SK Telecom T1', year: 2015, region: 'LCK', flag: '🇰🇷',
    power: 98,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Faker_2020_interview.jpg',
    bio: 'À son apogée légendaire, double champion du monde consécutif, sang-froid inégalé.',
    signature: "un sang-froid devenu légendaire",
    weakness: "presque aucune — si ce n'est l'excès de confiance de l'adversaire",
  },
  {
    id: 'faker_2023', personId: 'faker', name: 'Faker', realName: 'Lee Sang-hyeok',
    role: 'MID', team: 'T1', year: 2023, region: 'LCK', flag: '🇰🇷',
    power: 94,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Faker_2020_interview.jpg',
    bio: 'Encore champion du monde huit ans plus tard, toujours au sommet malgré la nouvelle génération.',
    signature: "une expérience de compétition sans égale",
    weakness: "des réflexes qui ne sont plus tout à fait ceux de ses 19 ans",
  },
  {
    id: 'chovy_2022', personId: 'chovy', name: 'Chovy', realName: 'Jeong Ji-hoon',
    role: 'MID', team: 'Gen.G', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 91,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Chovy_MSI_2025.jpg/250px-Chovy_MSI_2025.jpg',
    bio: 'Phase de laning quasi parfaite, considéré comme le mid le plus propre mécaniquement.',
    signature: "une phase de laning quasi parfaite",
    weakness: "une prise de risque parfois trop calculée",
  },
  {
    id: 'caps_2019', personId: 'caps', name: 'Caps', realName: 'Rasmus Winther',
    role: 'MID', team: 'G2 Esports', year: 2019, region: 'LEC', flag: '🇩🇰',
    power: 89,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Caps_2025.jpg/250px-Caps_2025.jpg',
    bio: 'MVP du MSI 2019, meilleur joueur occidental de sa génération, créativité débridée.',
    signature: "une créativité qui déstabilise n'importe quel plan",
    weakness: "un all-in qui peut se retourner contre lui",
  },
  {
    id: 'rookie_2018', personId: 'rookie', name: 'Rookie', realName: 'Song Eui-jin',
    role: 'MID', team: 'Invictus Gaming', year: 2018, region: 'LPL', flag: '🇰🇷',
    power: 92,
    image: null,
    bio: 'Champion du monde 2018 avec Invictus Gaming, mécaniques parmi les plus propres de la LPL.',
    signature: "une exécution mécanique quasi sans erreur",
    weakness: "un style qui dépend beaucoup du tempo donné par sa jungle",
  },
  {
    id: 'knight_2021', personId: 'knight', name: 'Knight', realName: 'Zhuo Ding',
    role: 'MID', team: 'EDward Gaming', year: 2021, region: 'LPL', flag: '🇨🇳',
    power: 90,
    image: null,
    bio: 'Champion du monde 2021 avec EDG, l\'un des mids les plus complets de la LPL.',
    signature: "une adaptabilité totale à n'importe quel champion",
    weakness: "un jeu parfois trop mesuré qui laisse passer l'occasion",
  },
  {
    id: 'zeka_2022', personId: 'zeka', name: 'Zeka', realName: 'Kim Geon-woo',
    role: 'MID', team: 'DRX', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 87,
    image: null,
    bio: 'Champion du monde 2022 avec DRX, l\'un des artisans du run miracle depuis les play-ins.',
    signature: "une capacité à hausser son niveau à chaque match couperet",
    weakness: "un profil plus discret en phase de laning pure",
  },
  {
    id: 'perkz_2019', personId: 'perkz', name: 'Perkz', realName: 'Luka Perković',
    role: 'MID', team: 'G2 Esports', year: 2019, region: 'LEC', flag: '🇭🇷',
    power: 88,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Perkz_2020.jpg/250px-Perkz_2020.jpg',
    bio: 'Champion du MSI 2019 avec G2, reconverti à l\'ADC cette année-là avec un succès total.',
    signature: "une intelligence de jeu qui compense n'importe quel changement de poste",
    weakness: "un mécanique un cran en dessous des spécialistes purs",
  },
  {
    id: 'showmaker_2020', personId: 'showmaker', name: 'ShowMaker', realName: 'Heo Su',
    role: 'MID', team: 'DAMWON Gaming', year: 2020, region: 'LCK', flag: '🇰🇷',
    power: 93,
    image: null,
    bio: 'Finals MVP des Worlds 2020, considéré comme l\'un des mids les plus complets jamais vus.',
    signature: "un contrôle de wave qui étouffe la lane adverse",
    weakness: "un style qui a besoin d'une jungle proactive pour exploser",
  },

  // ── ADC ───────────────────────────────────────────────────────────────
  {
    id: 'uzi_2018', personId: 'uzi', name: 'Uzi', realName: 'Jian Zi-Hao',
    role: 'ADC', team: 'Royal Never Give Up', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Uzi_in_Journey_to_the_Top_-_2022_LPL_Spring_Split.jpg/250px-Uzi_in_Journey_to_the_Top_-_2022_LPL_Spring_Split.jpg',
    bio: 'Champion du MSI 2018, DPS explosif considéré comme l\'un des plus grands ADC de l\'histoire.',
    signature: "un DPS explosif dès que les items tombent",
    weakness: "un démarrage de partie parfois hésitant",
  },
  {
    id: 'ruler_2017', personId: 'ruler', name: 'Ruler', realName: 'Park Jae-hyuk',
    role: 'ADC', team: 'Samsung Galaxy', year: 2017, region: 'LCK', flag: '🇰🇷',
    power: 93,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ruler_interview_2022.jpg/250px-Ruler_interview_2022.jpg',
    bio: 'Finals MVP des Worlds 2017 avec Samsung Galaxy, sans doute son année la plus dominante.',
    signature: "un carry hyper-scaling que personne n'arrête en fin de partie",
    weakness: "une équipe encore jeune autour de lui cette année-là",
  },
  {
    id: 'ruler_2022', personId: 'ruler', name: 'Ruler', realName: 'Park Jae-hyuk',
    role: 'ADC', team: 'Gen.G', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 92,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ruler_interview_2022.jpg/250px-Ruler_interview_2022.jpg',
    bio: 'Meilleur ADC LCK 2022, positionnement chirurgical en combat d\'équipe.',
    signature: "un positionnement en combat d'équipe chirurgical",
    weakness: "une dépendance à une jungle qui doit le protéger",
  },
  {
    id: 'deft_2022', personId: 'deft', name: 'Deft', realName: 'Kim Hyuk-kyu',
    role: 'ADC', team: 'DRX', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 88,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Deft_interview_in_2022.jpg/250px-Deft_interview_in_2022.jpg',
    bio: 'Champion du monde 2022 avec DRX au terme d\'un run miracle en outsider absolu.',
    signature: "une régularité forgée par des années de scène",
    weakness: "un profil prévisible pour une préparation adverse pointue",
  },
  {
    id: 'jackeylove_2018', personId: 'jackeylove', name: 'JackeyLove', realName: 'Yu Wen-Bo',
    role: 'ADC', team: 'Invictus Gaming', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 91,
    image: null,
    bio: 'Champion du monde 2018 avec Invictus Gaming à seulement 17 ans, carry pur et sans peur.',
    signature: "une audace de carry qui n'a peur de personne",
    weakness: "une jeunesse qui peut mener à des prises de risque inutiles",
  },
  {
    id: 'viper_2021', personId: 'viper', name: 'Viper', realName: 'Park Do-hyeon',
    role: 'ADC', team: 'EDward Gaming', year: 2021, region: 'LPL', flag: '🇰🇷',
    power: 89,
    image: null,
    bio: 'Champion du monde 2021 avec EDG, ADC coréen devenu icône de la LPL.',
    signature: "une exécution froide même dans le money fight",
    weakness: "un profil qui dépend beaucoup du peel de son support",
  },
  {
    id: 'gumayusi_2023', personId: 'gumayusi', name: 'Gumayusi', realName: 'Lee Min-hyeong',
    role: 'ADC', team: 'T1', year: 2023, region: 'LCK', flag: '🇰🇷',
    power: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Gumayusi_at_2023_LCK_Awards.jpg/250px-Gumayusi_at_2023_LCK_Awards.jpg',
    bio: 'Champion du monde 2023 avec T1, DPS constant au sein d\'un roster stellaire.',
    signature: "un DPS constant qui ne sort jamais de son plan de jeu",
    weakness: "un profil plus discret quand la vision lui manque",
  },
  {
    id: 'rekkles_2018', personId: 'rekkles', name: 'Rekkles', realName: 'Martin Larsson',
    role: 'ADC', team: 'Fnatic', year: 2018, region: 'LEC', flag: '🇸🇪',
    power: 86,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Rekkles_2020.jpg/250px-Rekkles_2020.jpg',
    bio: 'Finaliste des Worlds 2018 avec Fnatic, ADC le plus régulier de l\'histoire européenne.',
    signature: "une constance qui a fait de lui une légende continentale",
    weakness: "un style plus posé qui peine face à un rythme trop rapide",
  },
  {
    id: 'ghost_2020', personId: 'ghost', name: 'Ghost', realName: 'Jang Yong-jun',
    role: 'ADC', team: 'DAMWON Gaming', year: 2020, region: 'LCK', flag: '🇰🇷',
    power: 87,
    image: null,
    bio: 'Champion du monde 2020 avec DAMWON Gaming, discret mais d\'une efficacité redoutable.',
    signature: "une discrétion trompeuse jusqu'à l'explosion en teamfight",
    weakness: "un profil qui laisse peu de place à l'individualité",
  },

  // ── SUPPORT ───────────────────────────────────────────────────────────
  {
    id: 'wolf_2015', personId: 'wolf', name: 'Wolf', realName: 'Lee Jae-wan',
    role: 'SUP', team: 'SK Telecom T1', year: 2015, region: 'LCK', flag: '🇰🇷',
    power: 84,
    image: null,
    bio: 'Double champion du monde avec SKT T1, engages qui changent une partie à eux seuls.',
    signature: "des engages qui changent une partie à eux seuls",
    weakness: "une prise de risque qui peut isoler son ADC",
  },
  {
    id: 'corejj_2017', personId: 'corejj', name: 'CoreJJ', realName: 'Jo Yong-in',
    role: 'SUP', team: 'Samsung Galaxy', year: 2017, region: 'LCK', flag: '🇰🇷',
    power: 87,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/CoreJJ%2C_NA_LCS_2015_Summer_Split_Week_6_Day_2.jpg/250px-CoreJJ%2C_NA_LCS_2015_Summer_Split_Week_6_Day_2.jpg',
    bio: 'Champion du monde 2017 avec Samsung Galaxy, meneur de jeu et vétéran respecté.',
    signature: "un leadership qui structure toute l'équipe autour de lui",
    weakness: "un style plus posé, moins flashy que la concurrence",
  },
  {
    id: 'baolan_2018', personId: 'baolan', name: 'Baolan', realName: 'Shi Sen-Ming',
    role: 'SUP', team: 'Invictus Gaming', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 86,
    image: null,
    bio: 'Champion du monde 2018 avec Invictus Gaming, vétéran discret d\'un roster explosif.',
    signature: "un contrôle de vision qui protège tout un roster offensif",
    weakness: "un profil peu spectaculaire face aux stars de sa propre équipe",
  },
  {
    id: 'meiko_2021', personId: 'meiko', name: 'Meiko', realName: 'Tian Ye',
    role: 'SUP', team: 'EDward Gaming', year: 2021, region: 'LPL', flag: '🇨🇳',
    power: 88,
    image: null,
    bio: 'Champion du monde 2021 avec EDG, l\'un des supports les plus décorés de la LPL.',
    signature: "une lecture de combat qui anticipe tout engage adverse",
    weakness: "un style plus conservateur que les supports playmakers",
  },
  {
    id: 'mikyx_2019', personId: 'mikyx', name: 'Mikyx', realName: 'Mihael Mehle',
    role: 'SUP', team: 'G2 Esports', year: 2019, region: 'LEC', flag: '🇸🇮',
    power: 85,
    image: null,
    bio: 'Champion du MSI 2019 avec G2, duo légendaire avec Perkz sur la bot lane.',
    signature: "une complicité de bot lane qui déstabilise n'importe quel duo",
    weakness: "un profil plus jeune face aux vétérans du poste",
  },
  {
    id: 'beryl_2020', personId: 'beryl', name: 'BeryL', realName: 'Cho Geon-hee',
    role: 'SUP', team: 'DAMWON Gaming', year: 2020, region: 'LCK', flag: '🇰🇷',
    power: 89,
    image: null,
    bio: 'Premier sacre mondial en 2020 avec DAMWON Gaming, révélation du poste support.',
    signature: "une roam agressive qui prend les autres lanes par surprise",
    weakness: "une équipe encore en rodage autour de lui",
  },
  {
    id: 'beryl_2022', personId: 'beryl', name: 'BeryL', realName: 'Cho Geon-hee',
    role: 'SUP', team: 'DRX', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 90,
    image: null,
    bio: 'Double champion du monde (2020 puis 2022), contrôle de vision qui étouffe la carte.',
    signature: "un contrôle de vision qui étouffe la carte",
    weakness: "un profil plus passif si on lui coupe sa roam",
  },
  {
    id: 'keria_2023', personId: 'keria', name: 'Keria', realName: 'Ryu Min-seok',
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

function personIdOf(id) { return LOL_PLAYERS_BY_ID[id]?.personId || id; }

// Génère toutes les paires possibles au sein d'un groupe (coéquipiers réels
// la même année), en excluant les paires qui seraient la même personne.
function withinPairs(ids) {
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (personIdOf(ids[i]) !== personIdOf(ids[j])) out.push([ids[i], ids[j]]);
    }
  }
  return out;
}

// Génère toutes les paires entre deux groupes (ex. deux générations d'une
// même écurie), en excluant les paires "même personne".
function crossPairs(a, b) {
  const out = [];
  a.forEach(x => b.forEach(y => {
    if (personIdOf(x) !== personIdOf(y)) out.push([x, y]);
  }));
  return out;
}

// Coéquipiers directs, même club ET même année → forte synergie
const STRONG_GROUPS = [
  ['marin_2015', 'faker_2015', 'wolf_2015'],                                  // SKT T1 2015 — Champions du monde
  ['peanut_2022', 'chovy_2022', 'ruler_2022'],                                // Gen.G 2022
  ['khan_2021', 'canyon_2021'],                                               // DWG KIA 2021 — Finalistes Worlds
  ['nuguri_2020', 'canyon_2020', 'showmaker_2020', 'ghost_2020', 'beryl_2020'], // DAMWON Gaming 2020 — Champions du monde
  ['kingen_2022', 'pyosik_2022', 'zeka_2022', 'deft_2022', 'beryl_2022'],     // DRX 2022 — Champions du monde (run miracle)
  ['zeus_2023', 'oner_2023', 'faker_2023', 'gumayusi_2023', 'keria_2023'],    // T1 2023 — Champions du monde
  ['theshy_2018', 'rookie_2018', 'jackeylove_2018', 'baolan_2018'],           // Invictus Gaming 2018 — Champions du monde
  ['bin_2021', 'tian_2021', 'knight_2021', 'viper_2021', 'meiko_2021'],       // EDward Gaming 2021 — Champions du monde
  ['wunder_2019', 'jankos_2019', 'caps_2019', 'perkz_2019', 'mikyx_2019'],    // G2 Esports 2019 — Champions du MSI, finalistes Worlds
  ['ruler_2017', 'corejj_2017'],                                             // Samsung Galaxy 2017 — Champions du monde
];

export const TEAMMATES_STRONG = STRONG_GROUPS.flatMap(withinPairs);

// Même écurie/maison à une autre époque (académie, culture commune) → synergie légère
export const TEAMMATES_MILD = [
  ...crossPairs(['khan_2021', 'canyon_2021'], ['beryl_2022', 'beryl_2020']), // alumni DWG KIA
  ...crossPairs(['canyon_2020'], ['khan_2021']),
  // Lignée SKT T1 → T1
  ...crossPairs(['marin_2015', 'faker_2015', 'wolf_2015'], ['zeus_2023', 'oner_2023', 'gumayusi_2023', 'keria_2023', 'faker_2023']),
  // Lignée Samsung Galaxy → Gen.G (même écurie renommée)
  ...crossPairs(['ruler_2017', 'corejj_2017'], ['peanut_2022', 'chovy_2022', 'ruler_2022']),
  // Lignée Invictus Gaming 2018 → autres générations LPL
  ...crossPairs(['theshy_2018', 'rookie_2018', 'jackeylove_2018', 'baolan_2018'], ['theshy_2024']),
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

// Rivalités marquantes (pur récit, aucun impact sur le score)
export const RIVALRIES = [
  {
    pair: ['ruler_2022', 'deft_2022'],
    story: "Un air de déjà-vu : en quart de finale des Worlds 2022, le DRX de Deft avait déjà sorti le grand favori Gen.G de Ruler contre toute attente.",
  },
  {
    pair: ['jackeylove_2018', 'rekkles_2018'],
    story: "La revanche d'une finale mondiale : en 2018, l'Invictus Gaming de JackeyLove avait balayé le Fnatic de Rekkles 3-0 en finale des Worlds.",
  },
];
