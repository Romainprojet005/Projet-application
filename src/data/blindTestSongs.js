// IDs YouTube — vérifiés le 12/10/2026 (version audio officielle de préférence : la chanson démarre au tout début)
// Une vidéo devenue indisponible est remplacée automatiquement en cours de partie.

export const CATEGORIES = [
  { id: 'france',      name: 'Chansons Françaises', emoji: '🇫🇷', color: '#2563EB' },
  { id: 'rock',        name: 'Rock',                emoji: '🎸',  color: '#10B981' },
  { id: 'annees80',    name: 'Années 80',            emoji: '🕺',  color: '#F59E0B' },
  { id: 'annees90',    name: 'Années 90',            emoji: '💿',  color: '#EC4899' },
  { id: 'pop',         name: 'Pop Internationale',   emoji: '🎤',  color: '#8B5CF6' },
  { id: 'dessinanime', name: 'Dessins Animés',       emoji: '📺',  color: '#F97316' },
];

const SONGS_BY_CATEGORY = {

  france: [
    { id: 1,  title: 'Alors on danse',             artist: 'Stromae',          videoId: 'GPoPKwXybY4', startAt: 0  },
    { id: 2,  title: 'Formidable',                 artist: 'Stromae',          videoId: 'hdwjwN-eFn0', startAt: 0  },
    { id: 3,  title: 'Papaoutai',                  artist: 'Stromae',          videoId: 'oiKj0Z_Xnjc', startAt: 0 },
    { id: 4,  title: 'Je veux',                    artist: 'ZAZ',              videoId: 'r9Ck4Jy8mAc', startAt: 0  },
    { id: 5,  title: 'La Vie en Rose',             artist: 'Édith Piaf',       videoId: '-0KvBnIvTFs', startAt: 0  },
    { id: 6,  title: 'Voyage Voyage',              artist: 'Désireless',       videoId: 'r7LggW7lpTg', startAt: 0  },
    { id: 7,  title: 'Les Champs-Élysées',         artist: 'Joe Dassin',       videoId: 'tDWeLlvYyYU', startAt: 0  },
    { id: 8,  title: 'Ne me quitte pas',           artist: 'Jacques Brel',     videoId: 'e0esAGxzP6Y', startAt: 0  },
    { id: 9,  title: 'Alexandrie Alexandra',       artist: 'Claude François',  videoId: 'Eh_ojsYN2xk', startAt: 0  },
    { id: 10, title: "Je l'aime à mourir",         artist: 'Francis Cabrel',   videoId: 'MzvlalfN0Es', startAt: 0  },
    { id: 11, title: 'Place des grands hommes',    artist: 'Patrick Bruel',    videoId: 'C9K5_AwMGdw', startAt: 0  },
    { id: 12, title: "J'ai demandé à la lune",     artist: 'Indochine',        videoId: 'KAOmC5qT02w', startAt: 0  },
    { id: 13, title: 'La Bohème',                  artist: 'Charles Aznavour', videoId: 'mZ_jwmUw1FU', startAt: 0  },
    { id: 14, title: 'Mistral Gagnant',            artist: 'Renaud',           videoId: 'Tuoh3o0CM3Y', startAt: 0  },
    { id: 15, title: 'Mon vieux',                  artist: 'Daniel Guichard',  videoId: 'VOH0Xh0bXdQ', startAt: 0  },
    { id: 16, title: 'La Mer',                     artist: 'Charles Trenet',   videoId: '0QUOR_KPf34', startAt: 0  },
    { id: 17, title: 'Quelque chose de Tennessee', artist: 'Johnny Hallyday',  videoId: '8Sc4Pb7d1Nk', startAt: 0  },
    { id: 18, title: 'Amsterdam',                  artist: 'Jacques Brel',     videoId: 'KcMwzi2RtSs', startAt: 0  },
    { id: 19, title: 'La Mauvaise Réputation',     artist: 'Georges Brassens', videoId: 'ye8lmjjiOn4', startAt: 0  },
    { id: 20, title: 'Sans contrefaçon',           artist: 'Mylène Farmer',    videoId: 'Jqy2FqMgcpk', startAt: 0  },
  ],

  rock: [
    { id: 1,  title: 'Bohemian Rhapsody',          artist: 'Queen',                  videoId: 'fJ9rUzIMcZQ', startAt: 0  },
    { id: 2,  title: 'Smells Like Teen Spirit',    artist: 'Nirvana',                videoId: 'q8sGURLcGK4', startAt: 0  },
    { id: 3,  title: 'Sweet Child O Mine',         artist: "Guns N' Roses",          videoId: 'aEMool3DlIU', startAt: 0  },
    { id: 4,  title: 'Thunderstruck',              artist: 'AC/DC',                  videoId: 'v2AC41dglnM', startAt: 0  },
    { id: 5,  title: 'Enter Sandman',              artist: 'Metallica',              videoId: 'CD-E-LDc384', startAt: 0  },
    { id: 6,  title: 'Seven Nation Army',          artist: 'The White Stripes',      videoId: 'CBEJo18auXE', startAt: 0  },
    { id: 7,  title: 'Mr Brightside',              artist: 'The Killers',            videoId: 'gGdGFtwCNBE', startAt: 0  },
    { id: 8,  title: 'Basket Case',                artist: 'Green Day',              videoId: 'NUTGr5t3MoY', startAt: 0  },
    { id: 9,  title: 'Under the Bridge',           artist: 'Red Hot Chili Peppers',  videoId: 'GLvohMXgcBo', startAt: 0  },
    { id: 10, title: 'Everlong',                   artist: 'Foo Fighters',           videoId: 'eBG7P-K-r1Y', startAt: 0  },
    { id: 11, title: "Livin on a Prayer",          artist: 'Bon Jovi',               videoId: 'Lvro-vIY-Gw', startAt: 0  },
    { id: 12, title: 'With or Without You',        artist: 'U2',                     videoId: 'O-kWo5N1E3s', startAt: 0  },
    { id: 13, title: 'Creep',                      artist: 'Radiohead',              videoId: '6kpQNCOp7T4', startAt: 0  },
    { id: 14, title: 'Paint It Black',             artist: 'The Rolling Stones',     videoId: 'O4irXQhgMqg', startAt: 0  },
    { id: 15, title: 'Dream On',                   artist: 'Aerosmith',              videoId: '89dGC8de0CA', startAt: 0  },
    { id: 16, title: 'Stairway to Heaven',         artist: 'Led Zeppelin',           videoId: 'QkF3oxziUI4', startAt: 0  },
    { id: 17, title: 'Another Brick in the Wall',  artist: 'Pink Floyd',             videoId: 'YR5ApYxkU-U', startAt: 0  },
    { id: 18, title: 'Back in Black',              artist: 'AC/DC',                  videoId: 'pAgnJDJN4VA', startAt: 0  },
    { id: 19, title: 'Wonderwall',                 artist: 'Oasis',                  videoId: 'PoJh4JNedns', startAt: 0  },
    { id: 20, title: 'Losing My Religion',         artist: 'R.E.M.',                 videoId: 'xwtdhWltSIg', startAt: 0  },
  ],

  annees80: [
    { id: 1,  title: 'Take On Me',                 artist: 'A-ha',                   videoId: 'djV11Xbc914', startAt: 0  },
    { id: 2,  title: 'Girls Just Want to Have Fun',artist: 'Cyndi Lauper',           videoId: 'jRr5EasAq84', startAt: 0  },
    { id: 3,  title: "Don't Stop Believin'",       artist: 'Journey',                videoId: '1k8craCGpgs', startAt: 0  },
    { id: 4,  title: 'Africa',                     artist: 'Toto',                   videoId: 'Kb7lAMjFuA0', startAt: 0  },
    { id: 5,  title: 'Every Breath You Take',      artist: 'The Police',             videoId: '_VaxPfLhK9M', startAt: 0  },
    { id: 6,  title: 'Sweet Dreams',               artist: 'Eurythmics',             videoId: 'qeMFqkcPYcg', startAt: 0  },
    { id: 7,  title: 'Billie Jean',                artist: 'Michael Jackson',        videoId: 'OZGtRvYF-A4', startAt: 0  },
    { id: 8,  title: 'Like a Prayer',              artist: 'Madonna',                videoId: 'lPy9Jmfxe18', startAt: 0  },
    { id: 9,  title: 'Eye of the Tiger',           artist: 'Survivor',               videoId: 'btPJPFnesV4', startAt: 0  },
    { id: 10, title: 'Total Eclipse of the Heart', artist: 'Bonnie Tyler',           videoId: 'LSYGIljR6sQ', startAt: 0  },
    { id: 11, title: 'Karma Chameleon',            artist: 'Culture Club',           videoId: 'JmcA9LIIXWw', startAt: 0  },
    { id: 12, title: 'Faith',                      artist: 'George Michael',         videoId: 'NfxmVh2d9Vs', startAt: 0  },
    { id: 13, title: 'Come On Eileen',             artist: 'Dexys Midnight Runners', videoId: 'HwVnX4ZgliY', startAt: 0  },
    { id: 14, title: 'Jump',                       artist: 'Van Halen',              videoId: 'QXt9b9bce-0', startAt: 0  },
    { id: 15, title: 'True',                       artist: 'Spandau Ballet',         videoId: 'sWBueqYA2Es', startAt: 0  },
    { id: 16, title: '99 Luftballons',             artist: 'Nena',                   videoId: 'TMSlTQmDLx4', startAt: 0  },
    { id: 17, title: 'The Final Countdown',        artist: 'Europe',                 videoId: 'lZzcQ-uQ8R0', startAt: 0  },
    { id: 18, title: 'Wake Me Up Before You Go-Go',artist: 'Wham!',                  videoId: 'pIgZ7gMze7A', startAt: 0  },
    { id: 19, title: 'Dancing in the Dark',        artist: 'Bruce Springsteen',      videoId: '129kuDCQtHs', startAt: 0  },
    { id: 20, title: 'Walk Like an Egyptian',      artist: 'The Bangles',            videoId: 'Cv6tuzHUuuk', startAt: 0  },
  ],

  annees90: [
    { id: 1,  title: 'Wannabe',                    artist: 'Spice Girls',            videoId: 'tTZDHlnTgR0', startAt: 0  },
    { id: 2,  title: '...Baby One More Time',      artist: 'Britney Spears',         videoId: 'hitIxB22QcI', startAt: 0  },
    { id: 3,  title: 'Killing Me Softly',          artist: 'Fugees',                 videoId: 'IXl0nMLIUsU', startAt: 0  },
    { id: 4,  title: 'My Heart Will Go On',        artist: 'Céline Dion',            videoId: 'mNsm2P0l_7Y', startAt: 0  },
    { id: 5,  title: 'I Will Always Love You',     artist: 'Whitney Houston',        videoId: 'T9Ybsvw_0p4', startAt: 0  },
    { id: 6,  title: 'Believe',                    artist: 'Cher',                   videoId: 'n7wvAEDOxAs', startAt: 0  },
    { id: 7,  title: "Everybody (Backstreet's Back)",artist: 'Backstreet Boys',      videoId: 'eV7qXmqYs9E', startAt: 0  },
    { id: 8,  title: "Livin' la Vida Loca",        artist: 'Ricky Martin',           videoId: 'CN5hQOI__10', startAt: 0  },
    { id: 9,  title: 'Barbie Girl',                artist: 'Aqua',                   videoId: 'zRspR_Mni-Y', startAt: 0  },
    { id: 10, title: 'Smooth',                     artist: 'Santana ft. Rob Thomas', videoId: 'QcUxrpIwuQ4', startAt: 0  },
    { id: 11, title: 'MMMBop',                     artist: 'Hanson',                 videoId: 'x8FlkFD87qI', startAt: 0  },
    { id: 12, title: "What's Up",                  artist: '4 Non Blondes',          videoId: '6NXnxTNIWkc', startAt: 0  },
    { id: 13, title: 'No Scrubs',                  artist: 'TLC',                    videoId: 'rmOd7z8Edrg', startAt: 0  },
    { id: 14, title: 'Say My Name',                artist: "Destiny's Child",        videoId: 'cZQVBRtUfu4', startAt: 0  },
    { id: 15, title: 'Waterfalls',                 artist: 'TLC',                    videoId: 'aIl23kwFUqM', startAt: 0  },
    { id: 16, title: "Don't Look Back in Anger",   artist: 'Oasis',                  videoId: 'YZG7z4FOn0g', startAt: 0  },
    { id: 17, title: 'Iris',                       artist: 'Goo Goo Dolls',          videoId: 'zDOILKOOUCo', startAt: 0  },
    { id: 18, title: 'One',                        artist: 'U2',                     videoId: 'ftjEcrrf7r0', startAt: 0  },
    { id: 19, title: 'Semi-Charmed Life',          artist: 'Third Eye Blind',        videoId: 'beINamVRGy4', startAt: 0  },
    { id: 20, title: 'Mambo No. 5',                artist: 'Lou Bega',               videoId: 'EK_LN3XEcnw', startAt: 0  },
  ],

  pop: [
    { id: 1,  title: 'Shape of You',              artist: 'Ed Sheeran',             videoId: '_dK2tDK9grQ', startAt: 0  },
    { id: 2,  title: 'Rolling in the Deep',       artist: 'Adele',                  videoId: 'bDtjO-R0QSo', startAt: 0  },
    { id: 3,  title: 'Uptown Funk',               artist: 'Mark Ronson ft. Bruno Mars', videoId: '7Ya2U8XN_Zw', startAt: 0 },
    { id: 4,  title: 'Blinding Lights',           artist: 'The Weeknd',             videoId: 'fHI8X4OXluQ', startAt: 0  },
    { id: 5,  title: 'Happy',                     artist: 'Pharrell Williams',       videoId: '4m-_cqRsoqA', startAt: 0  },
    { id: 6,  title: 'Someone Like You',          artist: 'Adele',                  videoId: '22c3_LoIfZQ', startAt: 0  },
    { id: 7,  title: 'Thinking Out Loud',         artist: 'Ed Sheeran',             videoId: 'WpyfrixXBqU', startAt: 0  },
    { id: 8,  title: 'Stay With Me',              artist: 'Sam Smith',              videoId: 'pB-5XG-DbAA', startAt: 0  },
    { id: 9,  title: 'See You Again',             artist: 'Wiz Khalifa ft. Charlie Puth', videoId: 'Jh-uBm_4yuA', startAt: 0 },
    { id: 10, title: 'Shallow',                   artist: 'Lady Gaga & Bradley Cooper', videoId: 'BpIf43m2ZQI', startAt: 0  },
    { id: 11, title: 'All of Me',                 artist: 'John Legend',            videoId: '4zXUHvfoEyQ', startAt: 0  },
    { id: 12, title: 'Despacito',                 artist: 'Luis Fonsi ft. Daddy Yankee', videoId: '2bHBUs-k3ac', startAt: 0 },
    { id: 13, title: 'Sorry',                     artist: 'Justin Bieber',          videoId: 'ZO3V4zdRm1g', startAt: 0  },
    { id: 14, title: "Can't Stop the Feeling",    artist: 'Justin Timberlake',      videoId: 'KbyPok-3dio', startAt: 0  },
    { id: 15, title: 'Closer',                    artist: 'The Chainsmokers',       videoId: '5XggbNWy3NA', startAt: 0  },
    { id: 16, title: 'Havana',                    artist: 'Camila Cabello',         videoId: 'HCjNJDNzw8Y', startAt: 0  },
    { id: 17, title: 'Señorita',                  artist: 'Shawn Mendes & Camila Cabello', videoId: 'GUNIrPe707s', startAt: 0 },
    { id: 18, title: 'Bad Guy',                   artist: 'Billie Eilish',          videoId: 'YD4utuFiexw', startAt: 0  },
    { id: 19, title: 'Levitating',                artist: 'Dua Lipa',               videoId: 'PqbJJNuVMoc', startAt: 0  },
    { id: 20, title: 'Watermelon Sugar',          artist: 'Harry Styles',           videoId: '7-x3uD5z1bQ', startAt: 0  },
  ],

  dessinanime: [
    // IDs à vérifier sur youtube.com/watch?v=ID — uploads de fans, peuvent changer
    { id: 1,  title: 'Pokémon',                        artist: 'Générique', videoId: 'jVm1NbrXaXc', startAt: 0 },
    { id: 2,  title: 'Dragon Ball Z',                  artist: 'Générique', videoId: 'KUBnnrvTC2o', startAt: 0 },
    { id: 3,  title: 'Code Lyoko',                     artist: 'Générique', videoId: 'lLwk_lpvL44', startAt: 0 },
    { id: 4,  title: 'Totally Spies',                  artist: 'Générique', videoId: 'QzpHRCfd5vU', startAt: 0 },
    { id: 5,  title: 'Galactik Football',              artist: 'Générique', videoId: 'abzhBJDqYug', startAt: 0 },
    { id: 6,  title: 'Miraculous Ladybug',             artist: 'Générique', videoId: 'T6YViPa8pVc', startAt: 0 },
    { id: 7,  title: 'Les Chevaliers du Zodiaque',     artist: 'Générique', videoId: '234a0963oVw', startAt: 0 },
    { id: 8,  title: 'One Piece',                      artist: 'Générique', videoId: '8emFHDYsWcs', startAt: 0 },
    { id: 9,  title: 'Naruto',                         artist: 'Générique', videoId: 'oe4RnJM9RZM', startAt: 0 },
    { id: 10, title: 'Titeuf',                         artist: 'Générique', videoId: 'r0jmwd4uoPM', startAt: 0 },
    { id: 11, title: 'Winx Club',                      artist: 'Générique', videoId: 'GeXnW78C3Bk', startAt: 0 },
    { id: 12, title: 'Les As de la Jungle',            artist: 'Générique', videoId: 'KysL0dF1vVk', startAt: 0 },
    { id: 13, title: "Avatar, le dernier maître de l'air", artist: 'Générique', videoId: 'lvAvAOvppNQ', startAt: 0 },
    { id: 14, title: 'Olive et Tom',                   artist: 'Générique', videoId: 'juQl2UbcD7w', startAt: 0 },
    { id: 15, title: 'W.I.T.C.H.',                    artist: 'Générique', videoId: 'ub-RCHTsbDA', startAt: 0 },
    { id: 16, title: 'Beyblade Metal Fusion',          artist: 'Générique', videoId: 'fL5euQ2_ndI', startAt: 0 },
    { id: 17, title: 'Angelo la Débrouille',           artist: 'Générique', videoId: 'ia-KUijCgXM', startAt: 0 },
    { id: 18, title: 'Oggy et les Cafards',            artist: 'Générique', videoId: '2apJXX46ce0', startAt: 0 },
    { id: 19, title: 'Redakai',                        artist: 'Générique', videoId: '-jjS9bG3M00', startAt: 0 },
    { id: 20, title: 'Rekkit Rabbit',                  artist: 'Générique', videoId: 'C-4JF9_qTlQ', startAt: 0 },
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
