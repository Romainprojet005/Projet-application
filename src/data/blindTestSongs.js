// IDs YouTube — vérifiables sur youtube.com/watch?v=ID

export const CATEGORIES = [
  { id: 'france',   name: 'Chansons Françaises', emoji: '🇫🇷', color: '#2563EB' },
  { id: 'rock',     name: 'Rock',                emoji: '🎸',  color: '#10B981' },
  { id: 'annees80', name: 'Années 80',            emoji: '🕺',  color: '#F59E0B' },
  { id: 'annees90', name: 'Années 90',            emoji: '💿',  color: '#EC4899' },
  { id: 'pop',      name: 'Pop Internationale',   emoji: '🎤',  color: '#8B5CF6' },
];

const SONGS_BY_CATEGORY = {

  france: [
    { id: 1,  title: 'Alors on danse',             artist: 'Stromae',          videoId: 'qRB0NKGSXNQ', startAt: 0  },
    { id: 2,  title: 'Formidable',                 artist: 'Stromae',          videoId: 'RrQN2hjRBlo', startAt: 0  },
    { id: 3,  title: 'Papaoutai',                  artist: 'Stromae',          videoId: 'oiKj0Z_Xnjfo', startAt: 0 },
    { id: 4,  title: 'Je veux',                    artist: 'ZAZ',              videoId: 'fRgNKBmMXco', startAt: 0  },
    { id: 5,  title: 'La Vie en Rose',             artist: 'Édith Piaf',       videoId: 'r-3iathMo7o', startAt: 0  },
    { id: 6,  title: 'Voyage Voyage',              artist: 'Désireless',       videoId: 'uMoz_J5CKBU', startAt: 0  },
    { id: 7,  title: 'Les Champs-Élysées',         artist: 'Joe Dassin',       videoId: '1cX3VUDXMHE', startAt: 0  },
    { id: 8,  title: 'Ne me quitte pas',           artist: 'Jacques Brel',     videoId: 'xMN4PEfeDj0', startAt: 0  },
    { id: 9,  title: 'Alexandrie Alexandra',       artist: 'Claude François',  videoId: 'YxhkGbPxEXk', startAt: 0  },
    { id: 10, title: "Je l'aime à mourir",         artist: 'Francis Cabrel',   videoId: 'C_oXS3bWkP8', startAt: 0  },
    { id: 11, title: 'Place des grands hommes',    artist: 'Patrick Bruel',    videoId: 'eNfbGYNJKhM', startAt: 0  },
    { id: 12, title: "J'ai demandé à la lune",     artist: 'Indochine',        videoId: 'Aql3d9-l9N4', startAt: 0  },
    { id: 13, title: 'La Bohème',                  artist: 'Charles Aznavour', videoId: 'hBOcBqpx-Fc', startAt: 0  },
    { id: 14, title: 'Mistral Gagnant',            artist: 'Renaud',           videoId: '9VpP1lnP0K0', startAt: 0  },
    { id: 15, title: 'Mon vieux',                  artist: 'Daniel Guichard',  videoId: 'dZoMOl52ccs', startAt: 0  },
    { id: 16, title: 'La Mer',                     artist: 'Charles Trenet',   videoId: '0A1VXRXJWAE', startAt: 0  },
    { id: 17, title: 'Quelque chose de Tennessee', artist: 'Johnny Hallyday',  videoId: 'yCAfzB6WQZU', startAt: 0  },
    { id: 18, title: 'Amsterdam',                  artist: 'Jacques Brel',     videoId: 'PfSmxIvgXlg', startAt: 0  },
    { id: 19, title: 'La Mauvaise Réputation',     artist: 'Georges Brassens', videoId: 'Rm7Cvjv4Moc', startAt: 0  },
    { id: 20, title: 'Sans contrefaçon',           artist: 'Mylène Farmer',    videoId: '6ry1Xdj0DGM', startAt: 0  },
  ],

  rock: [
    { id: 1,  title: 'Bohemian Rhapsody',          artist: 'Queen',                  videoId: 'fJ9rUzIMcZQ', startAt: 0  },
    { id: 2,  title: 'Smells Like Teen Spirit',    artist: 'Nirvana',                videoId: 'hTWKbfoikeg', startAt: 0  },
    { id: 3,  title: 'Sweet Child O Mine',         artist: "Guns N' Roses",          videoId: '1w7OgIMMRc4', startAt: 0  },
    { id: 4,  title: 'Thunderstruck',              artist: 'AC/DC',                  videoId: 'v2AC41dglnM', startAt: 0  },
    { id: 5,  title: 'Enter Sandman',              artist: 'Metallica',              videoId: 'CD-E-LDc384', startAt: 0  },
    { id: 6,  title: 'Seven Nation Army',          artist: 'The White Stripes',      videoId: '0J2QdDbelmY', startAt: 0  },
    { id: 7,  title: 'Mr Brightside',              artist: 'The Killers',            videoId: 'gGdGFtwCNBE', startAt: 0  },
    { id: 8,  title: 'Basket Case',                artist: 'Green Day',              videoId: '-OVkMxEt6GM', startAt: 0  },
    { id: 9,  title: 'Under the Bridge',           artist: 'Red Hot Chili Peppers',  videoId: 'GLvohMXgcBo', startAt: 0  },
    { id: 10, title: 'Everlong',                   artist: 'Foo Fighters',           videoId: 'eBG7P-K-r1Y', startAt: 0  },
    { id: 11, title: "Livin on a Prayer",          artist: 'Bon Jovi',               videoId: 'lDK9QqIzhwk', startAt: 0  },
    { id: 12, title: 'With or Without You',        artist: 'U2',                     videoId: 'XmSdTa9kaiQ', startAt: 0  },
    { id: 13, title: 'Creep',                      artist: 'Radiohead',              videoId: 'XFkzRNyygfk', startAt: 0  },
    { id: 14, title: 'Paint It Black',             artist: 'The Rolling Stones',     videoId: 'O4irXQhgMqg', startAt: 0  },
    { id: 15, title: 'Dream On',                   artist: 'Aerosmith',              videoId: '89dGtCN73aQ', startAt: 0  },
    { id: 16, title: 'Stairway to Heaven',         artist: 'Led Zeppelin',           videoId: 'QkF3oxziUI4', startAt: 0  },
    { id: 17, title: 'Another Brick in the Wall',  artist: 'Pink Floyd',             videoId: 'YR5ApYxkU-U', startAt: 0  },
    { id: 18, title: 'Back in Black',              artist: 'AC/DC',                  videoId: 'pAgnJDJN4VA', startAt: 0  },
    { id: 19, title: 'Wonderwall',                 artist: 'Oasis',                  videoId: 'bx1Bh8ZvH84', startAt: 0  },
    { id: 20, title: 'Losing My Religion',         artist: 'R.E.M.',                 videoId: 'xwtdhWltSIg', startAt: 0  },
  ],

  annees80: [
    { id: 1,  title: 'Take On Me',                 artist: 'A-ha',                   videoId: 'djV11Xbc914', startAt: 0  },
    { id: 2,  title: 'Girls Just Want to Have Fun',artist: 'Cyndi Lauper',           videoId: 'PIb6AZdTr-A', startAt: 0  },
    { id: 3,  title: "Don't Stop Believin'",       artist: 'Journey',                videoId: '1k8craCGpgs', startAt: 0  },
    { id: 4,  title: 'Africa',                     artist: 'Toto',                   videoId: 'FTQbiNvZqaY', startAt: 0  },
    { id: 5,  title: 'Every Breath You Take',      artist: 'The Police',             videoId: 'OMOGaugKpzs', startAt: 0  },
    { id: 6,  title: 'Sweet Dreams',               artist: 'Eurythmics',             videoId: 'qeMFqkcPYcg', startAt: 0  },
    { id: 7,  title: 'Billie Jean',                artist: 'Michael Jackson',        videoId: 'Zi_XLOBDo_Y', startAt: 0  },
    { id: 8,  title: 'Like a Prayer',              artist: 'Madonna',                videoId: '79fzeNUqQbQ', startAt: 0  },
    { id: 9,  title: 'Eye of the Tiger',           artist: 'Survivor',               videoId: 'btPJPFnesV4', startAt: 0  },
    { id: 10, title: 'Total Eclipse of the Heart', artist: 'Bonnie Tyler',           videoId: 'lcOxiazu9iA', startAt: 0  },
    { id: 11, title: 'Karma Chameleon',            artist: 'Culture Club',           videoId: 'JmcA9LIIXWw', startAt: 0  },
    { id: 12, title: 'Faith',                      artist: 'George Michael',         videoId: '6Cs3Pvg-v8A', startAt: 0  },
    { id: 13, title: 'Come On Eileen',             artist: 'Dexys Midnight Runners', videoId: '9CML5qdMpBM', startAt: 0  },
    { id: 14, title: 'Jump',                       artist: 'Van Halen',              videoId: 'SwYN7mTi6HM', startAt: 0  },
    { id: 15, title: 'True',                       artist: 'Spandau Ballet',         videoId: 'AwhBvuDsX0I', startAt: 0  },
    { id: 16, title: '99 Luftballons',             artist: 'Nena',                   videoId: 'OEEEy1dMceI', startAt: 0  },
    { id: 17, title: 'The Final Countdown',        artist: 'Europe',                 videoId: '9jK-NcRmVcw', startAt: 0  },
    { id: 18, title: 'Wake Me Up Before You Go-Go',artist: 'Wham!',                  videoId: 'pIH_mBMX6ds', startAt: 0  },
    { id: 19, title: 'Dancing in the Dark',        artist: 'Bruce Springsteen',      videoId: '129kuDCQtHs', startAt: 0  },
    { id: 20, title: 'Walk Like an Egyptian',      artist: 'The Bangles',            videoId: 'Cv6t8t8qBRE', startAt: 0  },
  ],

  annees90: [
    { id: 1,  title: 'Wannabe',                    artist: 'Spice Girls',            videoId: 'gJLIiF15wjQ', startAt: 0  },
    { id: 2,  title: '...Baby One More Time',      artist: 'Britney Spears',         videoId: 'C-u5WLJ9Yk4', startAt: 0  },
    { id: 3,  title: 'Killing Me Softly',          artist: 'Fugees',                 videoId: 'Ru4_FDtFJdk', startAt: 0  },
    { id: 4,  title: 'My Heart Will Go On',        artist: 'Céline Dion',            videoId: '3JWTaaS7LdU', startAt: 0  },
    { id: 5,  title: 'I Will Always Love You',     artist: 'Whitney Houston',        videoId: 'vPFfAFSI7wI', startAt: 0  },
    { id: 6,  title: 'Believe',                    artist: 'Cher',                   videoId: 'nZXRV4MezEw', startAt: 0  },
    { id: 7,  title: "Everybody (Backstreet's Back)",artist: 'Backstreet Boys',      videoId: '6M6samPFMtQ', startAt: 0  },
    { id: 8,  title: "Livin' la Vida Loca",        artist: 'Ricky Martin',           videoId: 'p47fEXGaAB4', startAt: 0  },
    { id: 9,  title: 'Barbie Girl',                artist: 'Aqua',                   videoId: 'ZyhrYis509A', startAt: 0  },
    { id: 10, title: 'Smooth',                     artist: 'Santana ft. Rob Thomas', videoId: '6Whgn_2guEo', startAt: 0  },
    { id: 11, title: 'MMMBop',                     artist: 'Hanson',                 videoId: 'NHozn0YXAeE', startAt: 0  },
    { id: 12, title: "What's Up",                  artist: '4 Non Blondes',          videoId: '6NXnxTNIWkc', startAt: 0  },
    { id: 13, title: 'No Scrubs',                  artist: 'TLC',                    videoId: 'FrLequ6dUdM', startAt: 0  },
    { id: 14, title: 'Say My Name',                artist: "Destiny's Child",        videoId: 'sQy_jLlKpwQ', startAt: 0  },
    { id: 15, title: 'Waterfalls',                 artist: 'TLC',                    videoId: '8WEtxJ4-sh4', startAt: 0  },
    { id: 16, title: "Don't Look Back in Anger",   artist: 'Oasis',                  videoId: 'cmpOsKeSv3g', startAt: 0  },
    { id: 17, title: 'Iris',                       artist: 'Goo Goo Dolls',          videoId: 'NdYWuo9OFAw', startAt: 0  },
    { id: 18, title: 'One',                        artist: 'U2',                     videoId: 'ftjEcrrf7r0', startAt: 0  },
    { id: 19, title: 'Semi-Charmed Life',          artist: 'Third Eye Blind',        videoId: 'We7NyoFGoVo', startAt: 0  },
    { id: 20, title: 'Mambo No. 5',                artist: 'Lou Bega',               videoId: 'EK_LN3XEcnw', startAt: 0  },
  ],

  pop: [
    { id: 1,  title: 'Shape of You',              artist: 'Ed Sheeran',             videoId: 'JGwWNGJdvx8', startAt: 0  },
    { id: 2,  title: 'Rolling in the Deep',       artist: 'Adele',                  videoId: 'rYEDA3JcQqw', startAt: 0  },
    { id: 3,  title: 'Uptown Funk',               artist: 'Mark Ronson ft. Bruno Mars', videoId: 'OPf0YbXqDm0', startAt: 0 },
    { id: 4,  title: 'Blinding Lights',           artist: 'The Weeknd',             videoId: '4NRXx6pDs3U', startAt: 0  },
    { id: 5,  title: 'Happy',                     artist: 'Pharrell Williams',       videoId: 'ZbZSe6N_BXs', startAt: 0  },
    { id: 6,  title: 'Someone Like You',          artist: 'Adele',                  videoId: 'hLQl3WQQoQ0', startAt: 0  },
    { id: 7,  title: 'Thinking Out Loud',         artist: 'Ed Sheeran',             videoId: 'lp-EO5I60KA', startAt: 0  },
    { id: 8,  title: 'Stay With Me',              artist: 'Sam Smith',              videoId: 'pB-5XG-DbAA', startAt: 0  },
    { id: 9,  title: 'See You Again',             artist: 'Wiz Khalifa ft. Charlie Puth', videoId: 'RgKAFK5djSk', startAt: 0 },
    { id: 10, title: 'Shallow',                   artist: 'Lady Gaga',              videoId: 'bo_efYomy78', startAt: 0  },
    { id: 11, title: 'All of Me',                 artist: 'John Legend',            videoId: '450p7goxZqg', startAt: 0  },
    { id: 12, title: 'Despacito',                 artist: 'Luis Fonsi ft. Daddy Yankee', videoId: 'ktvTqknDobU', startAt: 0 },
    { id: 13, title: 'Sorry',                     artist: 'Justin Bieber',          videoId: 'fRh_vgS2dFE', startAt: 0  },
    { id: 14, title: "Can't Stop the Feeling",    artist: 'Justin Timberlake',      videoId: 'ru0K8uLgFQY', startAt: 0  },
    { id: 15, title: 'Closer',                    artist: 'The Chainsmokers',       videoId: 'PT2_F-1esPk', startAt: 0  },
    { id: 16, title: 'Havana',                    artist: 'Camila Cabello',         videoId: 'HCjNJDNzw8Y', startAt: 0  },
    { id: 17, title: 'Señorita',                  artist: 'Shawn Mendes & Camila Cabello', videoId: 'Pkh8UtuejGw', startAt: 0 },
    { id: 18, title: 'Bad Guy',                   artist: 'Billie Eilish',          videoId: 'DyDfgMOUjCI', startAt: 0  },
    { id: 19, title: 'Levitating',                artist: 'Dua Lipa',               videoId: 'TlPH1MtOrJs', startAt: 0  },
    { id: 20, title: 'Watermelon Sugar',          artist: 'Harry Styles',           videoId: 'E07s5ZYygMg', startAt: 0  },
  ],
};

export function getCategoryMeta(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];
}

export function getSongsCount(id) {
  return (SONGS_BY_CATEGORY[id] ?? SONGS_BY_CATEGORY.france).length;
}

export function selectSongs(count, categoryId = 'france') {
  const songs = SONGS_BY_CATEGORY[categoryId] ?? SONGS_BY_CATEGORY.france;
  const shuffled = [...songs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, songs.length));
}

// Compat
export const rockSongs = SONGS_BY_CATEGORY.rock;
