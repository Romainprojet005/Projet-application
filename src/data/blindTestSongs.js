// IDs YouTube — vérifiables sur youtube.com/watch?v=ID
export const rockSongs = [
  { id: 1,  title: 'Bohemian Rhapsody',     artist: 'Queen',                   videoId: 'fJ9rUzIMcZQ', startAt: 0  },
  { id: 2,  title: 'Smells Like Teen Spirit',artist: 'Nirvana',                 videoId: 'hTWKbfoikeg', startAt: 0  },
  { id: 3,  title: 'Sweet Child O Mine',     artist: "Guns N' Roses",           videoId: '1w7OgIMMRc4', startAt: 0  },
  { id: 4,  title: 'Thunderstruck',          artist: 'AC/DC',                   videoId: 'v2AC41dglnM', startAt: 0  },
  { id: 5,  title: 'Enter Sandman',          artist: 'Metallica',               videoId: 'CD-E-LDc384', startAt: 0  },
  { id: 6,  title: 'Seven Nation Army',      artist: 'The White Stripes',       videoId: '0J2QdDbelmY', startAt: 0  },
  { id: 7,  title: 'Mr Brightside',          artist: 'The Killers',             videoId: 'gGdGFtwCNBE', startAt: 0  },
  { id: 8,  title: 'Basket Case',            artist: 'Green Day',               videoId: '-OVkMxEt6GM', startAt: 0  },
  { id: 9,  title: 'Under the Bridge',       artist: 'Red Hot Chili Peppers',   videoId: 'GLvohMXgcBo', startAt: 0  },
  { id: 10, title: 'Everlong',               artist: 'Foo Fighters',            videoId: 'eBG7P-K-r1Y', startAt: 0  },
  { id: 11, title: "Livin on a Prayer",      artist: 'Bon Jovi',                videoId: 'lDK9QqIzhwk', startAt: 0  },
  { id: 12, title: 'With or Without You',    artist: 'U2',                      videoId: 'XmSdTa9kaiQ', startAt: 0  },
  { id: 13, title: 'Creep',                  artist: 'Radiohead',               videoId: 'XFkzRNyygfk', startAt: 0  },
  { id: 14, title: 'Paint It Black',         artist: 'The Rolling Stones',      videoId: 'O4irXQhgMqg', startAt: 0  },
  { id: 15, title: 'Dream On',               artist: 'Aerosmith',               videoId: '89dGtCN73aQ', startAt: 0  },
  { id: 16, title: 'Stairway to Heaven',     artist: 'Led Zeppelin',            videoId: 'QkF3oxziUI4', startAt: 0  },
  { id: 17, title: 'Another Brick in the Wall', artist: 'Pink Floyd',           videoId: 'YR5ApYxkU-U', startAt: 0  },
  { id: 18, title: 'Back in Black',          artist: 'AC/DC',                   videoId: 'pAgnJDJN4VA', startAt: 0  },
  { id: 19, title: 'Wonderwall',             artist: 'Oasis',                   videoId: 'bx1Bh8ZvH84', startAt: 0  },
  { id: 20, title: 'Losing My Religion',     artist: 'R.E.M.',                  videoId: 'xwtdhWltSIg', startAt: 0  },
];

export function selectSongs(count) {
  const shuffled = [...rockSongs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, rockSongs.length));
}
