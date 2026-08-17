// ─────────────────────────────────────────────────────────────────────────
// LE SÉLECTIONNEUR — données des joueurs professionnels League of Legends
// Près de 70 joueurs, une douzaine par poste (TOP / JGL / MID / ADC / SUP),
// venus de LCK (Corée), LEC (Europe) et LPL (Chine), à des années
// différentes de leur carrière — de la toute première dynastie SKT T1
// (2013) jusqu'aux sacres les plus récents. De nombreuses légendes
// apparaissent PLUSIEURS FOIS, à des années différentes (`personId`
// commun) — ex. Faker 2013 (révélation), 2015 (pic de forme absolu) et
// 2023 (retour au sommet) : trois versions bien réelles, mais pas d'égale
// domination. La force (`power`) reflète le niveau de domination réelle
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
    id: 'theshy_2023', personId: 'theshy', name: 'TheShy', realName: 'Kang Seung-lok',
    role: 'TOP', team: 'Weibo Gaming', year: 2023, region: 'LPL', flag: '🇨🇳',
    power: 89,
    image: null,
    bio: 'Finaliste des Worlds 2023 avec Weibo Gaming après quatre ans loin de la scène internationale.',
    signature: "un solo-kill qui peut tomber à n'importe quel moment",
    weakness: "une finale où il a été dominé de bout en bout par un rival plus jeune",
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
    id: 'bin_2020', personId: 'bin', name: 'Bin', realName: 'Chen Ze-Bin',
    role: 'TOP', team: 'Suning', year: 2020, region: 'LPL', flag: '🇨🇳',
    power: 88,
    image: null,
    bio: 'Finaliste des Worlds 2020 avec Suning, auteur de l\'unique Pentakill de l\'histoire en finale mondiale.',
    signature: "un Pentakill resté unique dans l'histoire des finales mondiales",
    weakness: "une équipe outsider qui a fini par manquer de profondeur",
  },
  {
    id: 'flandre_2021', personId: 'flandre', name: 'Flandre', realName: 'Li Xuan-Jun',
    role: 'TOP', team: 'EDward Gaming', year: 2021, region: 'LPL', flag: '🇨🇳',
    power: 86,
    image: null,
    bio: 'Champion du monde 2021 avec EDG, artisan discret du sweep surprise contre les tenants du titre.',
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
  {
    id: 'impact_2013', personId: 'impact', name: 'Impact', realName: 'Jung Eon-yeong',
    role: 'TOP', team: 'SK Telecom T1', year: 2013, region: 'LCK', flag: '🇰🇷',
    power: 88,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Impact_interview_2019.jpg/250px-Impact_interview_2019.jpg',
    bio: 'Champion du monde 2013 avec SKT T1, pilier fondateur de la toute première dynastie coréenne.',
    signature: "une solidité de top laner qui a posé les bases de toute une dynastie",
    weakness: "un style plus conservateur que les tops modernes",
  },
  {
    id: 'duke_2016', personId: 'duke', name: 'Duke', realName: 'Lee Ho-seong',
    role: 'TOP', team: 'SK Telecom T1', year: 2016, region: 'LCK', flag: '🇰🇷',
    power: 86,
    image: null,
    bio: 'Troisième titre mondial de SKT T1 en 2016, top laner polyvalent au service du collectif.',
    signature: "une polyvalence qui s'efface au profit du collectif",
    weakness: "un profil moins individuellement spectaculaire",
  },
  {
    id: 'cuvee_2017', personId: 'cuvee', name: 'CuVee', realName: 'Lee Seong-jin',
    role: 'TOP', team: 'Samsung Galaxy', year: 2017, region: 'LCK', flag: '🇰🇷',
    power: 87,
    image: null,
    bio: 'Champion du monde 2017 avec Samsung Galaxy, artisan du sweep historique contre SKT T1.',
    signature: "une expérience du meta top qui déjoue tous les pièges",
    weakness: "un style moins flamboyant que les carries purs",
  },
  {
    id: 'doran_2022', personId: 'doran', name: 'Doran', realName: 'Choi Hyeon-joon',
    role: 'TOP', team: 'Gen.G', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 86,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Doran_2025.jpg/250px-Doran_2025.jpg',
    bio: 'Pilier de Gen.G 2022, top laner solide et régulier de la LCK.',
    signature: "une régularité qui ne craque jamais sous la pression",
    weakness: "un profil plus discret face aux top laners créatifs",
  },
  {
    id: 'gimgoon_2019', personId: 'gimgoon', name: 'GimGoon', realName: 'Kim Han-saem',
    role: 'TOP', team: 'FunPlus Phoenix', year: 2019, region: 'LPL', flag: '🇰🇷',
    power: 85,
    image: null,
    bio: 'Champion du monde 2019 avec FunPlus Phoenix, top laner clé du sweep en finale.',
    signature: "un sang-froid retrouvé au meilleur moment de la saison",
    weakness: "une carrière plus discrète en dehors de ce sacre",
  },
  {
    id: 'bwipo_2018', personId: 'bwipo', name: 'Bwipo', realName: 'Gabriël Rau',
    role: 'TOP', team: 'Fnatic', year: 2018, region: 'LEC', flag: '🇧🇪',
    power: 84,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Bwipo_at_Worlds_2025.jpg/250px-Bwipo_at_Worlds_2025.jpg',
    bio: 'Finaliste des Worlds 2018 avec Fnatic, top laner polyvalent capable de jouer plusieurs postes.',
    signature: "une polyvalence rare, prêt à changer de poste à tout moment",
    weakness: "un manque d'expérience internationale à ce stade de carrière",
  },
  {
    id: 'letme_2018', personId: 'letme', name: 'Letme', realName: 'Cheng Zhi-Zheng',
    role: 'TOP', team: 'Royal Never Give Up', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 87,
    image: null,
    bio: 'Champion du MSI 2018 avec RNG, top laner increvable au style de tank increvable.',
    signature: "un style de tank increvable qui absorbe toute la pression",
    weakness: "un profil plus défensif qu'offensif",
  },
  {
    id: 'cabochard_2024', personId: 'cabochard', name: 'Cabochard', realName: 'Cabochard',
    role: 'TOP', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇫🇷',
    power: 82,
    image: null,
    bio: 'Vétéran français, capitaine emblématique de Karmine Corp lors de leur toute première saison en LEC.',
    signature: "un leadership de vétéran qui structure tout un vestiaire",
    weakness: "un mécanique un cran en dessous des plus jeunes générations",
  },
  {
    id: 'cabochard_2018', personId: 'cabochard', name: 'Cabochard', realName: 'Cabochard',
    role: 'TOP', team: 'Team Vitality', year: 2018, region: 'LEC', flag: '🇫🇷',
    power: 78,
    image: null,
    bio: 'Pilier de Team Vitality lors de leur retour fracassant en playoffs EU LCS, style agressif et sans complexe.',
    signature: "une agressivité qui n'a jamais peur des gros noms",
    weakness: "une équipe encore jeune autour de lui à l'époque",
  },
  {
    id: 'brokenblade_2023', personId: 'brokenblade', name: 'BrokenBlade', realName: 'Sergen Çelik',
    role: 'TOP', team: 'G2 Esports', year: 2023, region: 'LEC', flag: '🇹🇷',
    power: 87,
    image: null,
    bio: 'Champion LEC été 2023 avec G2 Esports, top laner turc au style de carry increvable.',
    signature: "une résistance en side lane qui use tous les adversaires",
    weakness: "un profil moins flashy que ses coéquipiers stars",
  },
  {
    id: 'armut_2021', personId: 'armut', name: 'Armut', realName: 'Armut',
    role: 'TOP', team: 'MAD Lions', year: 2021, region: 'LEC', flag: '🇹🇷',
    power: 84,
    image: null,
    bio: 'Double champion LEC 2021 avec MAD Lions, pièce maîtresse du titre le plus inattendu de la saison.',
    signature: "un pool de champions large qui déjoue toutes les préparations",
    weakness: "un style qui a besoin d'une jungle proactive autour de lui",
  },
  {
    id: 'odoamne_2022', personId: 'odoamne', name: 'Odoamne', realName: 'Odoamne',
    role: 'TOP', team: 'Rogue', year: 2022, region: 'LEC', flag: '🇷🇴',
    power: 83,
    image: null,
    bio: 'Champion LEC été 2022 avec Rogue, vétéran roumain increvable de la scène européenne.',
    signature: "une expérience de vétéran qui ne craque jamais en finale",
    weakness: "un mécanique un cran en dessous des top laners les plus jeunes",
  },
  {
    id: 'bin_2024', personId: 'bin', name: 'Bin', realName: 'Chen Ze-Bin',
    role: 'TOP', team: 'Bilibili Gaming', year: 2024, region: 'LPL', flag: '🇨🇳',
    power: 90,
    image: null,
    bio: 'Finaliste des Worlds 2024 avec Bilibili Gaming, poussant T1 jusqu\'à la cinquième manche.',
    signature: "un flamboyant sens du timing en side lane",
    weakness: "une finale perdue à un cheveu, encore une fois",
  },
  {
    id: 'alphari_2017', personId: 'alphari', name: 'Alphari', realName: 'Barney Morris',
    role: 'TOP', team: 'Misfits Gaming', year: 2017, region: 'LEC', flag: '🇬🇧',
    power: 82,
    image: null,
    bio: 'Quart de finaliste des Worlds 2017 avec Misfits Gaming dès sa première année pro, révélation britannique.',
    signature: "une précocité qui annonçait déjà une future star",
    weakness: "une inexpérience de la scène internationale à ce stade",
  },
  {
    id: 'odoamne_2018', personId: 'odoamne', name: 'Odoamne', realName: 'Odoamne',
    role: 'TOP', team: 'Splyce', year: 2018, region: 'LEC', flag: '🇷🇴',
    power: 79,
    image: null,
    bio: 'Quart de finaliste des Worlds 2018 avec Splyce, déjà increvable en side lane.',
    signature: "une résistance en side lane qui use tous les adversaires",
    weakness: "un profil plus discret face aux top laners flamboyants",
  },
  {
    id: 'doran_2024', personId: 'doran', name: 'Doran', realName: 'Choi Hyeon-joon',
    role: 'TOP', team: 'Hanwha Life Esports', year: 2024, region: 'LCK', flag: '🇰🇷',
    power: 88,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Doran_2025.jpg/250px-Doran_2025.jpg',
    bio: 'Champion LCK été 2024 et quart de finaliste des Worlds avec Hanwha Life, artisan d\'un exploit contre Gen.G en finale.',
    signature: "une régularité qui ne craque jamais sous la pression",
    weakness: "un profil plus discret face aux top laners créatifs",
  },
  {
    id: 'canna_2024', personId: 'canna', name: 'Canna', realName: 'Canna',
    role: 'TOP', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇰🇷',
    power: 85,
    image: null,
    bio: 'Recruté par Karmine Corp pour l\'été 2024, top laner coréen au pool de champions redouté.',
    signature: "un pool de champions redouté par toute la LEC",
    weakness: "une adaptation à un tout nouveau championnat",
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
    id: 'jiejie_2021', personId: 'jiejie', name: 'Jiejie', realName: 'Zhao Li-Jie',
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
    id: 'kanavi_2023', personId: 'kanavi', name: 'Kanavi', realName: 'Seo Jin-hyeok',
    role: 'JGL', team: 'JD Gaming', year: 2023, region: 'LPL', flag: '🇰🇷',
    power: 89,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Kanavi_2020_interview.jpg/250px-Kanavi_2020_interview.jpg',
    bio: 'Champion du MSI 2023 et demi-finaliste des Worlds avec JD Gaming, franchise player devenu légende de la LPL.',
    signature: "une expérience de la scène chinoise inégalée",
    weakness: "un rythme parfois freiné par une early game trop prudente",
  },
  {
    id: 'bengi_2013', personId: 'bengi', name: 'Bengi', realName: 'Bae Seong-ung',
    role: 'JGL', team: 'SK Telecom T1', year: 2013, region: 'LCK', flag: '🇰🇷',
    power: 87,
    image: null,
    bio: 'Champion du monde 2013 avec SKT T1, jungler qui a défini le rôle de support de carte moderne.',
    signature: "un contrôle de carte qui a inventé le rôle moderne de jungler",
    weakness: "un impact plus discret individuellement",
  },
  {
    id: 'ambition_2017', personId: 'ambition', name: 'Ambition', realName: 'Kang Chan-yong',
    role: 'JGL', team: 'Samsung Galaxy', year: 2017, region: 'LCK', flag: '🇰🇷',
    power: 86,
    image: null,
    bio: 'Champion du monde 2017 avec Samsung Galaxy, jungler vétéran au sang-froid exemplaire.',
    signature: "un sang-froid de vétéran dans les moments qui comptent",
    weakness: "un tempo plus lent que les junglers hyper-agressifs",
  },
  {
    id: 'ning_2018', personId: 'ning', name: 'Ning', realName: 'Xu Zhen-Ning',
    role: 'JGL', team: 'Invictus Gaming', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 91,
    image: null,
    bio: 'Finals MVP des Worlds 2018 avec Invictus Gaming, l\'un des junglers les plus dominants de sa génération.',
    signature: "un impact de jungle qui lui a valu le titre de MVP des Worlds",
    weakness: "une prise de risque qui peut parfois se retourner contre lui",
  },
  {
    id: 'karsa_2018', personId: 'karsa', name: 'Karsa', realName: 'Hung Hau-Hsuan',
    role: 'JGL', team: 'Royal Never Give Up', year: 2018, region: 'LPL', flag: '🇹🇼',
    power: 88,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Karsa_%28cropped%29.jpg/250px-Karsa_%28cropped%29.jpg',
    bio: 'Champion du MSI 2018 avec RNG, considéré comme l\'un des meilleurs junglers de sa génération.',
    signature: "une explosivité de early game qui écrase la concurrence",
    weakness: "un jeu qui dépend beaucoup du tempo qu'on lui laisse prendre",
  },
  {
    id: 'broxah_2018', personId: 'broxah', name: 'Broxah', realName: 'Mads Brock-Pedersen',
    role: 'JGL', team: 'Fnatic', year: 2018, region: 'LEC', flag: '🇩🇰',
    power: 85,
    image: null,
    bio: 'Finaliste des Worlds 2018 avec Fnatic, jungler discret à l\'impact décisif.',
    signature: "un impact discret mais décisif dans les moments clés",
    weakness: "un profil moins médiatique que ses coéquipiers stars",
  },
  {
    id: 'tian_2019', personId: 'tian', name: 'Tian', realName: 'Gao Tian-Liang',
    role: 'JGL', team: 'FunPlus Phoenix', year: 2019, region: 'LPL', flag: '🇨🇳',
    power: 90,
    image: null,
    bio: 'Champion du monde 2019 avec FunPlus Phoenix, Finals MVP lors du sweep en finale contre G2.',
    signature: "un tempo de early game qui a valu le titre de Finals MVP",
    weakness: "un style encore en construction à cette étape de carrière",
  },
  {
    id: 'bo_2024', personId: 'bo', name: 'Bo', realName: 'Zhou Yang-Bo',
    role: 'JGL', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇨🇳',
    power: 83,
    image: null,
    bio: 'Jungler chinois recruté par Karmine Corp pour leur toute première saison en LEC.',
    signature: "un pathing agressif qui déstabilise les débuts de partie",
    weakness: "une adaptation à un tout nouveau championnat",
  },
  {
    id: 'gilius_2018', personId: 'gilius', name: 'Gilius', realName: 'Gilius',
    role: 'JGL', team: 'Team Vitality', year: 2018, region: 'LEC', flag: '🇳🇱',
    power: 79,
    image: null,
    bio: 'Jungler vétéran de Team Vitality, artisan du 7-1 surprise en début de saison EU LCS.',
    signature: "une lecture de carte de vétéran qui rassure tout un roster",
    weakness: "un tempo plus lent que les junglers hyper-agressifs",
  },
  {
    id: 'yike_2023', personId: 'yike', name: 'Yike', realName: 'Martin Sundelin',
    role: 'JGL', team: 'G2 Esports', year: 2023, region: 'LEC', flag: '🇩🇰',
    power: 84,
    image: null,
    bio: 'Champion LEC été 2023 avec G2 Esports, jungler danois au style tranchant.',
    signature: "un tempo de early game qui écrase la concurrence",
    weakness: "un profil plus jeune face aux junglers vétérans",
  },
  {
    id: 'elyoya_2021', personId: 'elyoya', name: 'Elyoya', realName: 'Elyoya',
    role: 'JGL', team: 'MAD Lions', year: 2021, region: 'LEC', flag: '🇪🇸',
    power: 87,
    image: null,
    bio: 'Double champion LEC 2021 avec MAD Lions, considéré comme l\'un des meilleurs junglers européens de sa génération.',
    signature: "un instinct de ganks précoces qui déséquilibre tout",
    weakness: "une jeunesse qui peut encore sur-agresser",
  },
  {
    id: 'malrang_2022', personId: 'malrang', name: 'Malrang', realName: 'Malrang',
    role: 'JGL', team: 'Rogue', year: 2022, region: 'LEC', flag: '🇰🇷',
    power: 85,
    image: null,
    bio: 'Champion LEC été 2022 avec Rogue, jungler coréen expatrié en Europe.',
    signature: "une expertise coréenne transposée avec succès en LEC",
    weakness: "un profil qui a besoin d'une équipe soudée autour de lui",
  },
  {
    id: 'xun_2024', personId: 'xun', name: 'Xun', realName: 'Peng Li-Xun',
    role: 'JGL', team: 'Bilibili Gaming', year: 2024, region: 'LPL', flag: '🇨🇳',
    power: 87,
    image: null,
    bio: 'Finaliste des Worlds 2024 avec Bilibili Gaming, jungler clé du parcours jusqu\'à la cinquième manche.',
    signature: "un pathing propre qui libère l'espace pour ses lanes",
    weakness: "une finale perdue à un cheveu, encore une fois",
  },
  {
    id: 'maxlore_2017', personId: 'maxlore', name: 'Maxlore', realName: 'Nubar Sarafian',
    role: 'JGL', team: 'Misfits Gaming', year: 2017, region: 'LEC', flag: '🌍',
    power: 80,
    image: null,
    bio: 'Quart de finaliste des Worlds 2017 avec Misfits Gaming, jungler discret d\'une équipe pleine de promesses.',
    signature: "un impact discret mais décisif dans les moments clés",
    weakness: "un profil moins médiatique que ses coéquipiers stars",
  },
  {
    id: 'xerxe_2018', personId: 'xerxe', name: 'Xerxe', realName: 'Xerxe',
    role: 'JGL', team: 'Splyce', year: 2018, region: 'LEC', flag: '🇳🇱',
    power: 79,
    image: null,
    bio: 'Quart de finaliste des Worlds 2018 avec Splyce, jungler néerlandais au style posé.',
    signature: "un pathing propre qui libère l'espace pour ses lanes",
    weakness: "un profil moins spectaculaire qui peut sembler passif",
  },
  {
    id: 'peanut_2024', personId: 'peanut', name: 'Peanut', realName: 'Han Wang-ho',
    role: 'JGL', team: 'Hanwha Life Esports', year: 2024, region: 'LCK', flag: '🇰🇷',
    power: 87,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Peanut_2025.jpg/250px-Peanut_2025.jpg',
    bio: 'Champion LCK été 2024 et quart de finaliste des Worlds avec Hanwha Life, vétéran toujours au sommet.',
    signature: "une expérience de vétéran qui rassure tout un roster",
    weakness: "un manque de setup quand la partie s'éternise",
  },
  {
    id: 'yike_2024', personId: 'yike', name: 'Yike', realName: 'Martin Sundelin',
    role: 'JGL', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇩🇰',
    power: 85,
    image: null,
    bio: 'Recruté par Karmine Corp pour l\'été 2024 après son titre avec G2, jungler très courtisé du marché LEC.',
    signature: "un tempo de early game qui écrase la concurrence",
    weakness: "une adaptation à un tout nouveau vestiaire",
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
    id: 'scout_2021', personId: 'scout', name: 'Scout', realName: 'Lee Ye-chan',
    role: 'MID', team: 'EDward Gaming', year: 2021, region: 'LPL', flag: '🇰🇷',
    power: 90,
    image: null,
    bio: 'Champion du monde 2021 avec EDG, mid coréen expatrié parmi les plus complets de la LPL.',
    signature: "une adaptabilité totale à n'importe quel champion",
    weakness: "un jeu parfois trop mesuré qui laisse passer l'occasion",
  },
  {
    id: 'knight_2023', personId: 'knight', name: 'Knight', realName: 'Zhuo Ding',
    role: 'MID', team: 'JD Gaming', year: 2023, region: 'LPL', flag: '🇨🇳',
    power: 91,
    image: null,
    bio: 'Triple couronne LPL/MSI 2023 avec JD Gaming, demi-finaliste des Worlds, l\'un des mids les plus titrés de la LPL.',
    signature: "une constance qui a fait tomber tous les titres domestiques",
    weakness: "une finale mondiale qui lui échappe encore",
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
  {
    id: 'faker_2013', personId: 'faker', name: 'Faker', realName: 'Lee Sang-hyeok',
    role: 'MID', team: 'SK Telecom T1', year: 2013, region: 'LCK', flag: '🇰🇷',
    power: 95,
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Faker_2020_interview.jpg',
    bio: 'Champion du monde dès sa toute première année pro en 2013, le phénomène qui allait changer l\'histoire du jeu.',
    signature: "un talent brut qui allait redéfinir tout un rôle",
    weakness: "une inexpérience de la scène internationale à ce stade",
  },
  {
    id: 'crown_2017', personId: 'crown', name: 'Crown', realName: 'Lee Min-ho',
    role: 'MID', team: 'Samsung Galaxy', year: 2017, region: 'LCK', flag: '🇰🇷',
    power: 87,
    image: null,
    bio: 'Champion du monde 2017 avec Samsung Galaxy, mid laner au style élégant et sans excès.',
    signature: "une élégance de jeu qui ne laisse jamais rien au hasard",
    weakness: "un style plus mesuré que les mids hyper-agressifs",
  },
  {
    id: 'xiaohu_2018', personId: 'xiaohu', name: 'Xiaohu', realName: 'Li Yuan-Hao',
    role: 'MID', team: 'Royal Never Give Up', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 86,
    image: null,
    bio: 'Champion du MSI 2018 avec RNG, vétéran respecté de la scène chinoise.',
    signature: "une expérience de vétéran qui rassure tout un roster",
    weakness: "un profil plus classique face aux mids les plus créatifs",
  },
  {
    id: 'doinb_2019', personId: 'doinb', name: 'Doinb', realName: 'Kim Tae-sang',
    role: 'MID', team: 'FunPlus Phoenix', year: 2019, region: 'LPL', flag: '🇰🇷',
    power: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Doinb_in_Journey_to_the_Top_-_2022_LPL_Spring_Split.jpg/250px-Doinb_in_Journey_to_the_Top_-_2022_LPL_Spring_Split.jpg',
    bio: 'Champion du monde 2019 avec FunPlus Phoenix, génie tactique aux picks improbables.',
    signature: "des picks improbables qui retournent des parties entières",
    weakness: "un style si atypique qu'il peut aussi se faire punir",
  },
  {
    id: 'caps_2018', personId: 'caps', name: 'Caps', realName: 'Rasmus Winther',
    role: 'MID', team: 'Fnatic', year: 2018, region: 'LEC', flag: '🇩🇰',
    power: 88,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Caps_2025.jpg/250px-Caps_2025.jpg',
    bio: 'Finaliste des Worlds 2018 avec Fnatic à seulement 18 ans, surnommé « Baby Faker ».',
    signature: "une précocité qui lui vaut déjà le surnom de Baby Faker",
    weakness: "une jeunesse qui peut parfois manquer de patience",
  },
  {
    id: 'saken_2024', personId: 'saken', name: 'Saken', realName: 'Saken',
    role: 'MID', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇫🇷',
    power: 80,
    image: null,
    bio: 'Mid laner français de Karmine Corp lors de leur toute première saison en LEC.',
    signature: "une créativité française qui surprend la LEC",
    weakness: "un mécanique un cran en dessous des meilleurs mids",
  },
  {
    id: 'jiizuke_2018', personId: 'jiizuke', name: 'Jiizuke', realName: 'Jiizuke',
    role: 'MID', team: 'Team Vitality', year: 2018, region: 'LEC', flag: '🇳🇱',
    power: 80,
    image: null,
    bio: 'Rookie surprise de Team Vitality, artisan du 7-1 explosif en début de saison EU LCS.',
    signature: "une agressivité de rookie qui a surpris toute la LEC",
    weakness: "une prise de risque qui peut se retourner contre lui",
  },
  {
    id: 'caps_2023', personId: 'caps', name: 'Caps', realName: 'Rasmus Winther',
    role: 'MID', team: 'G2 Esports', year: 2023, region: 'LEC', flag: '🇩🇰',
    power: 90,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Caps_2025.jpg/250px-Caps_2025.jpg',
    bio: 'Champion LEC été 2023 avec G2 Esports, toujours considéré comme le meilleur mid occidental de sa génération.',
    signature: "une créativité qui déstabilise n'importe quel plan",
    weakness: "un all-in qui peut se retourner contre lui",
  },
  {
    id: 'humanoid_2021', personId: 'humanoid', name: 'Humanoid', realName: 'Marek Brázda',
    role: 'MID', team: 'MAD Lions', year: 2021, region: 'LEC', flag: '🇨🇿',
    power: 85,
    image: null,
    bio: 'Double champion LEC 2021 avec MAD Lions, mid laner tchèque au style calculateur.',
    signature: "une exécution mécanique quasi sans erreur",
    weakness: "un jeu parfois trop mesuré qui laisse passer l'occasion",
  },
  {
    id: 'larssen_2022', personId: 'larssen', name: 'Larssen', realName: 'Larssen',
    role: 'MID', team: 'Rogue', year: 2022, region: 'LEC', flag: '🇸🇪',
    power: 86,
    image: null,
    bio: 'Champion LEC été 2022 avec Rogue, mid laner suédois régulièrement élu meilleur joueur de la ligue.',
    signature: "une constance qui a fait de lui une référence continentale",
    weakness: "un style plus posé qui peine face à un rythme trop rapide",
  },
  {
    id: 'knight_2024', personId: 'knight', name: 'Knight', realName: 'Zhuo Ding',
    role: 'MID', team: 'Bilibili Gaming', year: 2024, region: 'LPL', flag: '🇨🇳',
    power: 91,
    image: null,
    bio: 'Finaliste des Worlds 2024 avec Bilibili Gaming, poussant T1 jusqu\'à la cinquième manche.',
    signature: "une constance qui a fait tomber tous les titres domestiques",
    weakness: "une finale mondiale qui lui échappe encore, de justesse",
  },
  {
    id: 'powerofevil_2017', personId: 'powerofevil', name: 'PowerOfEvil', realName: 'Tristan Schrage',
    role: 'MID', team: 'Misfits Gaming', year: 2017, region: 'LEC', flag: '🇩🇪',
    power: 83,
    image: null,
    bio: 'Quart de finaliste des Worlds 2017 avec Misfits Gaming, mid laner allemand au mécanique précis.',
    signature: "une exécution mécanique quasi sans erreur",
    weakness: "un style qui dépend beaucoup du tempo donné par sa jungle",
  },
  {
    id: 'nisqy_2018', personId: 'nisqy', name: 'Nisqy', realName: 'Nisqy',
    role: 'MID', team: 'Splyce', year: 2018, region: 'LEC', flag: '🇧🇪',
    power: 82,
    image: null,
    bio: 'Quart de finaliste des Worlds 2018 avec Splyce, mid laner belge au style créatif.',
    signature: "une créativité qui déstabilise n'importe quel plan",
    weakness: "un mécanique un cran en dessous des spécialistes purs",
  },
  {
    id: 'zeka_2024', personId: 'zeka', name: 'Zeka', realName: 'Kim Geon-woo',
    role: 'MID', team: 'Hanwha Life Esports', year: 2024, region: 'LCK', flag: '🇰🇷',
    power: 89,
    image: null,
    bio: 'Champion LCK été 2024 et quart de finaliste des Worlds avec Hanwha Life, artisan de l\'exploit contre Gen.G.',
    signature: "une capacité à hausser son niveau à chaque match couperet",
    weakness: "un profil plus discret en phase de laning pure",
  },
  {
    id: 'vladi_2024', personId: 'vladi', name: 'Vladi', realName: 'Vladimiros Kourtidis',
    role: 'MID', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇬🇷',
    power: 81,
    image: null,
    bio: 'Mid laner grec promu chez Karmine Corp pour l\'été 2024, révélation de leur académie.',
    signature: "une audace de jeune joueur qui ne recule devant rien",
    weakness: "une inexpérience de la scène LEC à ce stade",
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
    id: 'ruler_2023', personId: 'ruler', name: 'Ruler', realName: 'Park Jae-hyuk',
    role: 'ADC', team: 'JD Gaming', year: 2023, region: 'LPL', flag: '🇰🇷',
    power: 91,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ruler_interview_2022.jpg/250px-Ruler_interview_2022.jpg',
    bio: 'Passé en LPL en 2023, MVP des finales LPL et champion du MSI avec JD Gaming.',
    signature: "un carry hyper-scaling que personne n'arrête en fin de partie",
    weakness: "une adaptation à un nouveau championnat, une nouvelle langue",
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
  {
    id: 'piglet_2013', personId: 'piglet', name: 'Piglet', realName: 'Chae Gwang-jin',
    role: 'ADC', team: 'SK Telecom T1', year: 2013, region: 'LCK', flag: '🇰🇷',
    power: 87,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Piglet_at_the_NA_LCS_Spring_2016_playoffs.jpg/250px-Piglet_at_the_NA_LCS_Spring_2016_playoffs.jpg',
    bio: 'Champion du monde 2013 avec SKT T1, ADC précoce au mécanique déjà redoutable.',
    signature: "un mécanique précoce qui impressionne déjà toute la scène",
    weakness: "une gestion du risque encore en construction",
  },
  {
    id: 'bang_2016', personId: 'bang', name: 'Bang', realName: 'Bae Jun-sik',
    role: 'ADC', team: 'SK Telecom T1', year: 2016, region: 'LCK', flag: '🇰🇷',
    power: 88,
    image: null,
    bio: 'Champion du monde 2016 avec SKT T1, ADC increvable au style sans faille.',
    signature: "un style sans faille qui ne laisse aucune ouverture",
    weakness: "un profil plus discret que les ADC hyper-agressifs",
  },
  {
    id: 'lwx_2019', personId: 'lwx', name: 'Lwx', realName: 'Lin Wei-Xiang',
    role: 'ADC', team: 'FunPlus Phoenix', year: 2019, region: 'LPL', flag: '🇨🇳',
    power: 89,
    image: null,
    bio: 'Champion du monde 2019 avec FunPlus Phoenix, seul joueur de l\'histoire à finir une finale sans la moindre mort.',
    signature: "une propreté d'exécution jamais vue en finale des Worlds",
    weakness: "un style plus prudent que les hyper-carries",
  },
  {
    id: 'upset_2024', personId: 'upset', name: 'Upset', realName: 'Upset',
    role: 'ADC', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇩🇪',
    power: 85,
    image: null,
    bio: 'Superstar allemande recrutée par Karmine Corp pour leur toute première saison en LEC.',
    signature: "un DPS explosif dès que les items tombent",
    weakness: "un profil qui dépend beaucoup du peel de son support",
  },
  {
    id: 'minitroupax_2018', personId: 'minitroupax', name: 'Minitroupax', realName: 'Minitroupax',
    role: 'ADC', team: 'Team Vitality', year: 2018, region: 'LEC', flag: '🇫🇷',
    power: 78,
    image: null,
    bio: 'ADC français rookie de Team Vitality, artisan du 7-1 explosif en début de saison EU LCS.',
    signature: "une agressivité de rookie qui a surpris toute la LEC",
    weakness: "une prise de risque qui peut isoler son support",
  },
  {
    id: 'hansama_2023', personId: 'hansama', name: 'Hans Sama', realName: 'Steven Liv',
    role: 'ADC', team: 'G2 Esports', year: 2023, region: 'LEC', flag: '🇫🇷',
    power: 88,
    image: null,
    bio: 'Champion LEC été 2023 avec G2 Esports, ADC français devenu l\'un des meilleurs d\'Europe.',
    signature: "un DPS explosif dès que les items tombent",
    weakness: "un profil prévisible pour une préparation adverse pointue",
  },
  {
    id: 'carzzy_2021', personId: 'carzzy', name: 'Carzzy', realName: 'Matyáš Orság',
    role: 'ADC', team: 'MAD Lions', year: 2021, region: 'LEC', flag: '🇭🇺',
    power: 84,
    image: null,
    bio: 'Double champion LEC 2021 avec MAD Lions, ADC hongrois révélation de la saison.',
    signature: "un DPS explosif dès que les items tombent",
    weakness: "une jeunesse qui peut mener à des prises de risque inutiles",
  },
  {
    id: 'comp_2022', personId: 'comp', name: 'Comp', realName: 'Comp',
    role: 'ADC', team: 'Rogue', year: 2022, region: 'LEC', flag: '🇫🇷',
    power: 84,
    image: null,
    bio: 'Champion LEC été 2022 avec Rogue, ADC français au positionnement chirurgical.',
    signature: "un positionnement en combat d'équipe chirurgical",
    weakness: "une dépendance à une jungle qui doit le protéger",
  },
  {
    id: 'elk_2024', personId: 'elk', name: 'Elk', realName: 'Zhao Jia-Hao',
    role: 'ADC', team: 'Bilibili Gaming', year: 2024, region: 'LPL', flag: '🇨🇳',
    power: 88,
    image: null,
    bio: 'Finaliste des Worlds 2024 avec Bilibili Gaming, poussant T1 jusqu\'à la cinquième manche.',
    signature: "un DPS constant qui ne sort jamais de son plan de jeu",
    weakness: "une finale perdue à un cheveu, encore une fois",
  },
  {
    id: 'hansama_2017', personId: 'hansama', name: 'Hans Sama', realName: 'Steven Liv',
    role: 'ADC', team: 'Misfits Gaming', year: 2017, region: 'LEC', flag: '🇫🇷',
    power: 80,
    image: null,
    bio: 'Quart de finaliste des Worlds 2017 avec Misfits Gaming dès sa première année pro, révélation française.',
    signature: "une précocité qui annonçait déjà une future star",
    weakness: "une jeunesse qui peut mener à des prises de risque inutiles",
  },
  {
    id: 'kobbe_2018', personId: 'kobbe', name: 'Kobbe', realName: 'Kobbe',
    role: 'ADC', team: 'Splyce', year: 2018, region: 'LEC', flag: '🇩🇰',
    power: 81,
    image: null,
    bio: 'Quart de finaliste des Worlds 2018 avec Splyce, ADC danois au style posé et efficace.',
    signature: "une propreté d'exécution qui ne laisse rien au hasard",
    weakness: "un style plus prudent que les hyper-carries",
  },
  {
    id: 'viper_2024', personId: 'viper', name: 'Viper', realName: 'Park Do-hyeon',
    role: 'ADC', team: 'Hanwha Life Esports', year: 2024, region: 'LCK', flag: '🇰🇷',
    power: 91,
    image: null,
    bio: 'Champion LCK été 2024 et quart de finaliste des Worlds avec Hanwha Life, toujours parmi les meilleurs ADC du monde.',
    signature: "une exécution froide même dans le money fight",
    weakness: "un profil qui dépend beaucoup du peel de son support",
  },
  {
    id: 'caliste_2024', personId: 'caliste', name: 'Caliste', realName: 'Caliste',
    role: 'ADC', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇫🇷',
    power: 82,
    image: null,
    bio: 'Révélation française promue de l\'académie de Karmine Corp pour l\'été 2024.',
    signature: "une audace de jeune joueur qui ne recule devant rien",
    weakness: "une inexpérience de la scène LEC à ce stade",
  },
  {
    id: 'rekkles_2022', personId: 'rekkles', name: 'Rekkles', realName: 'Martin Larsson',
    role: 'ADC', team: 'Karmine Corp', year: 2022, region: 'LFL', flag: '🇸🇪',
    power: 84,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Rekkles_2020.jpg/250px-Rekkles_2020.jpg',
    bio: 'Légende suédoise recrutée à prix d\'or par Karmine Corp, devenu la plus grosse star de la LFL française.',
    signature: "une constance qui a fait de lui une légende continentale",
    weakness: "un style plus posé qui peine face à un rythme trop rapide",
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
    id: 'baolan_2018', personId: 'baolan', name: 'Baolan', realName: 'Wang Liu-yi',
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
  {
    id: 'poohmandu_2013', personId: 'poohmandu', name: 'PoohManDu', realName: 'Lee Jeong-hyeon',
    role: 'SUP', team: 'SK Telecom T1', year: 2013, region: 'LCK', flag: '🇰🇷',
    power: 83,
    image: null,
    bio: 'Champion du monde 2013 avec SKT T1, support vétéran et architecte du premier titre mondial coréen.',
    signature: "une expérience de vétéran qui structure toute l'équipe",
    weakness: "un style plus classique que les supports playmakers modernes",
  },
  {
    id: 'ming_2018', personId: 'ming', name: 'Ming', realName: 'Shi Sen-Ming',
    role: 'SUP', team: 'Royal Never Give Up', year: 2018, region: 'LPL', flag: '🇨🇳',
    power: 84,
    image: null,
    bio: 'Champion du MSI 2018 avec RNG, support increvable au service de son ADC star.',
    signature: "un dévouement total au service de son ADC",
    weakness: "un profil qui s'efface volontairement derrière ses coéquipiers",
  },
  {
    id: 'lehends_2022', personId: 'lehends', name: 'Lehends', realName: 'Son Si-woo',
    role: 'SUP', team: 'Gen.G', year: 2022, region: 'LCK', flag: '🇰🇷',
    power: 85,
    image: null,
    bio: 'Pilier de Gen.G 2022, support créatif et vocal de la LCK.',
    signature: "une communication et une créativité qui portent tout le roster",
    weakness: "une prise de risque qui peut parfois isoler son ADC",
  },
  {
    id: 'hylissang_2018', personId: 'hylissang', name: 'Hylissang', realName: 'Zdravets Galabov',
    role: 'SUP', team: 'Fnatic', year: 2018, region: 'LEC', flag: '🇧🇬',
    power: 83,
    image: null,
    bio: 'Finaliste des Worlds 2018 avec Fnatic, support engageant au tempérament de feu.',
    signature: "un engage tout terrain qui ne recule devant rien",
    weakness: "une impulsivité qui peut parfois coûter cher",
  },
  {
    id: 'crisp_2019', personId: 'crisp', name: 'Crisp', realName: 'Liu Qing-Song',
    role: 'SUP', team: 'FunPlus Phoenix', year: 2019, region: 'LPL', flag: '🇨🇳',
    power: 84,
    image: null,
    bio: 'Champion du monde 2019 avec FunPlus Phoenix, dernier rempart d\'un roster ultra-dominant.',
    signature: "une protection sans faille de ses coéquipiers stars",
    weakness: "un profil qui reste dans l'ombre des stars de son équipe",
  },
  {
    id: 'targamas_2024', personId: 'targamas', name: 'Targamas', realName: 'Targamas',
    role: 'SUP', team: 'Karmine Corp', year: 2024, region: 'LEC', flag: '🇫🇷',
    power: 79,
    image: null,
    bio: 'Première joueuse française à disputer un titre LEC, pilier de Karmine Corp toute la saison.',
    signature: "une lecture de combat qui a fait taire tous les sceptiques",
    weakness: "une pression médiatique immense à porter en plus du jeu",
  },
  {
    id: 'jactroll_2018', personId: 'jactroll', name: 'Jactroll', realName: 'Jactroll',
    role: 'SUP', team: 'Team Vitality', year: 2018, region: 'LEC', flag: '🇫🇷',
    power: 78,
    image: null,
    bio: 'Support français rookie de Team Vitality, artisan du 7-1 explosif en début de saison EU LCS.',
    signature: "des engages qui changent une partie à eux seuls",
    weakness: "une prise de risque qui peut isoler son ADC",
  },
  {
    id: 'mikyx_2023', personId: 'mikyx', name: 'Mikyx', realName: 'Mihael Mehle',
    role: 'SUP', team: 'G2 Esports', year: 2023, region: 'LEC', flag: '🇸🇮',
    power: 86,
    image: null,
    bio: 'Champion LEC été 2023 avec G2 Esports, l\'un des supports les plus expérimentés de la ligue.',
    signature: "un contrôle de vision qui étouffe la carte",
    weakness: "un profil plus passif si on lui coupe sa roam",
  },
  {
    id: 'kaiser_2021', personId: 'kaiser', name: 'Kaiser', realName: 'Kaiser',
    role: 'SUP', team: 'MAD Lions', year: 2021, region: 'LEC', flag: '🇩🇰',
    power: 83,
    image: null,
    bio: 'Double champion LEC 2021 avec MAD Lions, support danois discret mais redoutablement efficace.',
    signature: "un contrôle de vision qui étouffe la carte",
    weakness: "un profil peu spectaculaire face aux stars de sa propre équipe",
  },
  {
    id: 'trymbi_2022', personId: 'trymbi', name: 'Trymbi', realName: 'Trymbi',
    role: 'SUP', team: 'Rogue', year: 2022, region: 'LEC', flag: '🇩🇰',
    power: 82,
    image: null,
    bio: 'Champion LEC été 2022 avec Rogue, support engageant au tempérament vocal.',
    signature: "des engages qui changent une partie à eux seuls",
    weakness: "une impulsivité qui peut parfois coûter cher",
  },
  {
    id: 'on_2024', personId: 'on', name: 'ON', realName: 'Luo Wen-Jun',
    role: 'SUP', team: 'Bilibili Gaming', year: 2024, region: 'LPL', flag: '🇨🇳',
    power: 85,
    image: null,
    bio: 'Finaliste des Worlds 2024 avec Bilibili Gaming, poussant T1 jusqu\'à la cinquième manche.',
    signature: "un contrôle de vision qui étouffe la carte",
    weakness: "une finale perdue à un cheveu, encore une fois",
  },
  {
    id: 'ignar_2017', personId: 'ignar', name: 'IgNar', realName: 'Lee Dong-guen',
    role: 'SUP', team: 'Misfits Gaming', year: 2017, region: 'LEC', flag: '🇰🇷',
    power: 81,
    image: null,
    bio: 'Quart de finaliste des Worlds 2017 avec Misfits Gaming, support coréen expatrié en Europe.',
    signature: "un leadership coréen transposé avec succès en Europe",
    weakness: "une prise de risque qui peut isoler son ADC",
  },
  {
    id: 'kasing_2018', personId: 'kasing', name: 'kaSing', realName: 'kaSing',
    role: 'SUP', team: 'Splyce', year: 2018, region: 'LEC', flag: '🇭🇰',
    power: 79,
    image: null,
    bio: 'Quart de finaliste des Worlds 2018 avec Splyce, support hongkongais au style posé.',
    signature: "un contrôle de vision qui étouffe la carte",
    weakness: "un profil plus passif si on lui coupe sa roam",
  },
  {
    id: 'delight_2024', personId: 'delight', name: 'Delight', realName: 'Yoo Hwan-jung',
    role: 'SUP', team: 'Hanwha Life Esports', year: 2024, region: 'LCK', flag: '🇰🇷',
    power: 86,
    image: null,
    bio: 'Champion LCK été 2024 et quart de finaliste des Worlds avec Hanwha Life, artisan de l\'exploit contre Gen.G.',
    signature: "un playmaking hors norme, capable de tout retourner",
    weakness: "un style si créatif qu'il peut parfois se faire punir",
  },
];

export const LOL_PLAYERS_BY_ID = Object.fromEntries(LOL_PLAYERS.map(p => [p.id, p]));

// ─────────────────────────────────────────────────────────────────────────
// NOTORIÉTÉ — indépendante du niveau de jeu (`power`) : reflète à quel point
// un nom est connu même en dehors des suiveurs assidus de la scène esport.
// Sert au filtre « niveau de connaissance » du draft (100/75/50/25 %), pour
// que les moins familiers de la scène puissent jouer avec un vivier réduit
// aux noms les plus incontournables. Clé par `personId` (une légende garde
// la même notoriété quelle que soit l'année choisie).
// ─────────────────────────────────────────────────────────────────────────
const FAME_S = 95; // Icônes connues même au-delà des suiveurs réguliers de la scène
const FAME_A = 78; // Grands noms bien connus des amateurs d'esport
const FAME_B = 58; // Légendes réelles, mais plus confidentielles hors des passionnés

const FAME_TIERS = {
  faker: FAME_S, uzi: FAME_S, caps: FAME_S, theshy: FAME_S, canyon: FAME_S,
  chovy: FAME_S, doinb: FAME_S, ruler: FAME_S,

  zeus: FAME_A, oner: FAME_A, gumayusi: FAME_A, keria: FAME_A, deft: FAME_A,
  rekkles: FAME_A, jankos: FAME_A, perkz: FAME_A, wunder: FAME_A, mikyx: FAME_A,
  showmaker: FAME_A, khan: FAME_A, marin: FAME_A, wolf: FAME_A, ning: FAME_A,
  jackeylove: FAME_A, rookie: FAME_A, kanavi: FAME_A, knight: FAME_A,
  viper: FAME_A, meiko: FAME_A, bin: FAME_A, hansama: FAME_A, elyoya: FAME_A,
  cabochard: FAME_A, targamas: FAME_A,
};

export function fameOf(player) {
  return FAME_TIERS[player.personId] ?? FAME_B;
}

// Retourne le vivier de joueurs à utiliser pour le draft : à 100%, tout le
// monde ; en dessous, ne garde que les `familiarity`% les plus connus de
// CHAQUE poste (donc toujours au moins 3 par poste, jamais un poste vidé).
export function getFilteredPool(familiarity = 100) {
  if (familiarity >= 100) return LOL_PLAYERS;
  const byRole = {};
  ROLE_ORDER.forEach(r => { byRole[r] = []; });
  LOL_PLAYERS.forEach(p => byRole[p.role].push(p));

  const result = [];
  ROLE_ORDER.forEach(role => {
    const sorted = [...byRole[role]].sort((a, b) => (fameOf(b) * 1000 + b.power) - (fameOf(a) * 1000 + a.power));
    const keepCount = Math.max(3, Math.round(sorted.length * familiarity / 100));
    result.push(...sorted.slice(0, keepCount));
  });
  return result;
}

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
  ['impact_2013', 'bengi_2013', 'faker_2013', 'piglet_2013', 'poohmandu_2013'], // SKT T1 2013 — Champions du monde (Season 3)
  ['duke_2016', 'bang_2016'],                                                 // SKT T1 2016 — Champions du monde (+ Bengi/Faker/Wolf déjà présents à d'autres années)
  ['peanut_2022', 'chovy_2022', 'ruler_2022', 'doran_2022', 'lehends_2022'],  // Gen.G 2022 — roster complet
  ['khan_2021', 'canyon_2021'],                                               // DWG KIA 2021 — Finalistes Worlds
  ['nuguri_2020', 'canyon_2020', 'showmaker_2020', 'ghost_2020', 'beryl_2020'], // DAMWON Gaming 2020 — Champions du monde
  ['kingen_2022', 'pyosik_2022', 'zeka_2022', 'deft_2022', 'beryl_2022'],     // DRX 2022 — Champions du monde (run miracle)
  ['zeus_2023', 'oner_2023', 'faker_2023', 'gumayusi_2023', 'keria_2023'],    // T1 2023 — Champions du monde
  ['theshy_2018', 'rookie_2018', 'jackeylove_2018', 'baolan_2018', 'ning_2018'], // Invictus Gaming 2018 — Champions du monde, roster complet
  ['flandre_2021', 'jiejie_2021', 'scout_2021', 'viper_2021', 'meiko_2021'],  // EDward Gaming 2021 — Champions du monde
  ['kanavi_2023', 'knight_2023', 'ruler_2023'],                              // JD Gaming 2023 — Champions du MSI, demi-finalistes Worlds
  ['wunder_2019', 'jankos_2019', 'caps_2019', 'perkz_2019', 'mikyx_2019'],    // G2 Esports 2019 — Champions du MSI, finalistes Worlds
  ['ruler_2017', 'corejj_2017', 'cuvee_2017', 'ambition_2017', 'crown_2017'], // Samsung Galaxy 2017 — Champions du monde, roster complet
  ['letme_2018', 'karsa_2018', 'xiaohu_2018', 'uzi_2018', 'ming_2018'],       // Royal Never Give Up 2018 — Champions du MSI
  ['gimgoon_2019', 'tian_2019', 'doinb_2019', 'lwx_2019', 'crisp_2019'],      // FunPlus Phoenix 2019 — Champions du monde
  ['bwipo_2018', 'broxah_2018', 'caps_2018', 'rekkles_2018', 'hylissang_2018'], // Fnatic 2018 — Finalistes Worlds
  ['cabochard_2024', 'bo_2024', 'saken_2024', 'upset_2024', 'targamas_2024'],  // Karmine Corp — LEC Spring 2024 (1ère saison LEC)
  ['canna_2024', 'yike_2024', 'vladi_2024', 'caliste_2024', 'targamas_2024'],  // Karmine Corp — LEC Summer 2024
  ['cabochard_2018', 'gilius_2018', 'jiizuke_2018', 'minitroupax_2018', 'jactroll_2018'], // Team Vitality 2018 — 7-1 surprise EU LCS
  ['brokenblade_2023', 'yike_2023', 'caps_2023', 'hansama_2023', 'mikyx_2023'], // G2 Esports 2023 — Champions LEC été
  ['armut_2021', 'elyoya_2021', 'humanoid_2021', 'carzzy_2021', 'kaiser_2021'], // MAD Lions 2021 — Double champions LEC
  ['odoamne_2022', 'malrang_2022', 'larssen_2022', 'comp_2022', 'trymbi_2022'], // Rogue 2022 — Champions LEC été
  ['bin_2024', 'xun_2024', 'knight_2024', 'elk_2024', 'on_2024'],             // Bilibili Gaming 2024 — Finalistes Worlds
  ['alphari_2017', 'maxlore_2017', 'powerofevil_2017', 'hansama_2017', 'ignar_2017'], // Misfits Gaming 2017 — Quart de finale Worlds
  ['odoamne_2018', 'xerxe_2018', 'nisqy_2018', 'kobbe_2018', 'kasing_2018'],  // Splyce 2018 — Quart de finale Worlds
  ['doran_2024', 'peanut_2024', 'zeka_2024', 'viper_2024', 'delight_2024'],   // Hanwha Life Esports 2024 — Champions LCK été, quart de finale Worlds
];

export const TEAMMATES_STRONG = STRONG_GROUPS.flatMap(withinPairs);

// Même écurie/maison à une autre époque (académie, culture commune) → synergie légère
const SKT_T1_LINEAGE = [
  'impact_2013', 'bengi_2013', 'faker_2013', 'piglet_2013', 'poohmandu_2013',
  'marin_2015', 'faker_2015', 'wolf_2015',
  'duke_2016', 'bang_2016',
  'zeus_2023', 'oner_2023', 'faker_2023', 'gumayusi_2023', 'keria_2023',
];
const SAMSUNG_GENG_LINEAGE = [
  'cuvee_2017', 'ambition_2017', 'crown_2017', 'ruler_2017', 'corejj_2017',
  'peanut_2022', 'chovy_2022', 'ruler_2022', 'doran_2022', 'lehends_2022',
];
const DWG_DRX_LINEAGE = [
  'canyon_2020', 'khan_2021', 'canyon_2021', 'beryl_2020', 'beryl_2022',
];
const IG_LPL_LINEAGE = [
  'theshy_2018', 'rookie_2018', 'jackeylove_2018', 'baolan_2018', 'ning_2018', 'theshy_2023',
];
// Karmine Corp, écurie française phare : les deux moitiés de la saison 2024
// + Rekkles, recruté à prix d'or en LFL avant l'arrivée en LEC.
const KARMINE_CORP_LINEAGE = [
  'cabochard_2024', 'bo_2024', 'saken_2024', 'upset_2024', 'targamas_2024',
  'canna_2024', 'yike_2024', 'vladi_2024', 'caliste_2024',
  'rekkles_2022',
];

export const TEAMMATES_MILD = [
  ...withinPairs(SKT_T1_LINEAGE),
  ...withinPairs(SAMSUNG_GENG_LINEAGE),
  ...withinPairs(DWG_DRX_LINEAGE),
  ...withinPairs(IG_LPL_LINEAGE),
  ...withinPairs(KARMINE_CORP_LINEAGE),
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
  {
    pair: ['doinb_2019', 'caps_2019'],
    story: "Un remake de la finale des Worlds 2019 : le FunPlus Phoenix de Doinb avait balayé le G2 Esports de Caps 3-0 en finale mondiale.",
  },
  {
    pair: ['ruler_2017', 'faker_2015'],
    story: "L'histoire se souvient encore du sweep : en 2017, la Samsung Galaxy de Ruler avait stoppé net la dynastie SKT T1 en finale des Worlds, 3-0.",
  },
  {
    pair: ['zeus_2023', 'theshy_2023'],
    story: "Un remake exact de la finale des Worlds 2023 : Zeus (Finals MVP) avait totalement dominé TheShy en top lane lors du sweep 3-0 de T1 sur Weibo Gaming.",
  },
  {
    pair: ['bin_2020', 'showmaker_2020'],
    story: "La revanche d'une finale mondiale complètement folle : en 2020, le DAMWON Gaming de ShowMaker avait fini par dompter l'outsider Suning de Bin, auteur au passage de l'unique Pentakill de l'histoire en finale des Worlds.",
  },
  {
    pair: ['knight_2023', 'faker_2023'],
    story: "Un remake de la demi-finale des Worlds 2023 : le T1 de Faker avait sorti sans appel le JD Gaming de Knight, 3-0.",
  },
  {
    pair: ['bin_2024', 'faker_2023'],
    story: "Un remake de l'une des finales les plus folles de l'histoire : en 2024, le T1 de Faker avait fini par dompter Bilibili Gaming au terme d'une série à suspense, 3-2.",
  },
];
