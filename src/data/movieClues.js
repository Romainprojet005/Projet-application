// Ciné-Flash : 3 photos par titre dans web/cineflash/[Titre]/1.png, 2.png, 3.png
// (order = ordre d'affichage, du plus obscur au plus reconnaissable).
// Seuls les titres qui ont un dossier de photos sont proposés (voir scripts/cineflash-index.js).
// category : 'film' (par défaut) ou 'anime' · aliases : autres titres acceptés en réponse.
import IMAGES from './cineflashImages.json';

export const CINEFLASH_CATEGORIES = [
  { value: 'film',  label: 'Films' },
  { value: 'anime', label: 'Animés' },
  { value: 'tout',  label: 'Tout' },
];

export const movieClues = [
  { id: 1,  title: 'Aladdin',                  imgs: 3, order: [0,1,2] },
  { id: 2,  title: 'Drive',                    imgs: 3, order: [2,0,1] },
  { id: 3,  title: 'Peter pan',                imgs: 3, order: [2,0,1] },
  { id: 4,  title: 'Pinocchio',                imgs: 3, order: [1,0,2] },
  { id: 5,  title: 'Pirate Des Caraibes',      imgs: 3, order: [0,2,1] },
  { id: 6,  title: 'Pocahontas',               imgs: 3, order: [1,0,2] },
  { id: 7,  title: 'Raiponce',                 imgs: 3, order: [0,1,2] },
  { id: 8,  title: 'Ratatouille',              imgs: 3, order: [2,0,1] },
  { id: 9,  title: 'Rebelle',                  imgs: 3, order: [0,1,2] },
  { id: 10, title: 'Requiem for a Dream',      imgs: 3, order: [1,0,2] },
  { id: 11, title: 'Retour vers le futur',     imgs: 3, order: [0,1,2] },
  { id: 12, title: 'Rio',                      imgs: 3, order: [1,0,2] },
  { id: 13, title: 'Robin des bois',           imgs: 3, order: [0,1,2] },
  { id: 14, title: 'Rocky',                    imgs: 3, order: [2,1,0] },
  { id: 15, title: 'Rox et Rouky',             imgs: 3, order: [1,0,2] },
  { id: 16, title: 'Seven',                    imgs: 3, order: [1,2,0] },
  { id: 17, title: 'Shining',                  imgs: 3, order: [1,0,2] },
  { id: 18, title: 'Shrek',                    imgs: 3, order: [2,0,1] },
  { id: 19, title: 'Slumdog Millionaire',      imgs: 3, order: [1,0,2] },
  { id: 20, title: 'Spirit',                   imgs: 3, order: [0,2,1] },
  { id: 21, title: 'Tarzan',                   imgs: 2, order: [0,1]   },
  { id: 22, title: 'Taxi Driver',              imgs: 3, order: [2,1,0] },
  { id: 23, title: 'Tenet',                    imgs: 3, order: [0,1,2] },
  { id: 24, title: 'The Grand Budapest Hotel', imgs: 3, order: [1,0,2] },
  { id: 25, title: 'The Gray Man',             imgs: 3, order: [0,2,1] },
  { id: 26, title: 'The Pianist',              imgs: 3, order: [2,1,0] },
  { id: 27, title: 'The Revenant',             imgs: 2, order: [1,0]   },
  { id: 28, title: 'The Social Network',       imgs: 3, order: [2,0,1] },
  { id: 29, title: 'The Truman Show',          imgs: 3, order: [0,2,1] },
  { id: 30, title: 'Titanic',                  imgs: 3, order: [0,1,2] },
  { id: 31, title: 'Top Gun',                  imgs: 3, order: [0,1,2] },
  { id: 32, title: 'Toys story',               imgs: 3, order: [1,0,2] },
  { id: 33, title: 'Trolls',                   imgs: 3, order: [0,2,1] },
  { id: 34, title: 'Turbo',                    imgs: 3, order: [2,1,0] },
  { id: 35, title: 'Un monstre a paris',       imgs: 3, order: [1,0,2] },
  { id: 36, title: 'Vaiana 2',                 imgs: 3, order: [0,1,2] },
  { id: 37, title: 'Vice-versa',               imgs: 3, order: [2,0,1] },
  { id: 38, title: 'Volt',                     imgs: 3, order: [2,0,1] },
  { id: 39, title: 'Wall-E',                   imgs: 3, order: [0,1,2] },
  { id: 40, title: 'Zootopie',                 imgs: 2, order: [0,1]   },

  // ── ANIMÉS ─────────────────────────────────────────────────────────
  { id: 101, category: 'anime', title: 'Le Voyage de Chihiro',       aliases: ['Spirited Away', 'Sen to Chihiro'] },
  { id: 102, category: 'anime', title: 'Mon voisin Totoro',          aliases: ['My Neighbor Totoro'] },
  { id: 103, category: 'anime', title: 'Princesse Mononoké',         aliases: ['Mononoke Hime'] },
  { id: 104, category: 'anime', title: 'Le Château ambulant',        aliases: ['Howl', 'Howl no Ugoku Shiro'] },
  { id: 105, category: 'anime', title: 'Ponyo sur la falaise',       aliases: ['Ponyo'] },
  { id: 106, category: 'anime', title: 'Kiki la petite sorcière',    aliases: ['Kiki'] },
  { id: 107, category: 'anime', title: 'Le Tombeau des lucioles',    aliases: ['Grave of the Fireflies', 'Hotaru no Haka'] },
  { id: 108, category: 'anime', title: 'Your Name',                  aliases: ['Kimi no na wa'] },
  { id: 109, category: 'anime', title: 'Suzume',                     aliases: ['Suzume no Tojimari'] },
  { id: 110, category: 'anime', title: 'Akira' },
  { id: 111, category: 'anime', title: 'Dragon Ball',                aliases: ['DBZ', 'Dragon Ball Z', 'Dragon Ball Super'] },
  { id: 112, category: 'anime', title: 'One Piece' },
  { id: 113, category: 'anime', title: 'Naruto',                     aliases: ['Naruto Shippuden'] },
  { id: 114, category: 'anime', title: "L'Attaque des Titans",       aliases: ['Attaque des Titans', 'Shingeki no Kyojin', 'Attack on Titan', 'SNK'] },
  { id: 115, category: 'anime', title: 'Demon Slayer',               aliases: ['Kimetsu no Yaiba'] },
  { id: 116, category: 'anime', title: 'Death Note' },
  { id: 117, category: 'anime', title: 'Pokémon' },
  { id: 118, category: 'anime', title: 'Jujutsu Kaisen',             aliases: ['JJK'] },
  { id: 119, category: 'anime', title: 'One Punch Man' },
  { id: 120, category: 'anime', title: 'Les Chevaliers du Zodiaque', aliases: ['Saint Seiya'] },
];

const withPhotos = (c) => {
  const n = IMAGES[c.title] || 0;
  if (!n) return null;
  const order = (c.order || [0, 1, 2]).filter(i => i < n).slice(0, c.imgs ?? 3);
  return { category: 'film', ...c, imgs: order.length, order };
};

// Titres jouables d'une catégorie ('film', 'anime' ou 'tout') : seulement ceux qui ont des photos
export function availableClues(category = 'film') {
  return movieClues
    .filter(c => category === 'tout' || (c.category || 'film') === category)
    .map(withPhotos)
    .filter(Boolean);
}

export function selectFilms(count, category = 'film') {
  const pool = availableClues(category);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}

