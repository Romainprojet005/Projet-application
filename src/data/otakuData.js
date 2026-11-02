// ── OTAKU ARENA — questions sur les animés ─────────────────────────────
// 4 catégories. Chaque question : { q, answer, from? } + champs propres à la catégorie.
//   indices    : clues = [difficile, moyen, facile] → 3 / 2 / 1 pt selon l'indice
//   citation   : q = réplique culte → qui l'a dite ?
//   technique  : q = attaque / technique → à quel personnage appartient-elle ?
//   emoji      : emojis = [...] → quel animé ? (hint optionnel, coûte 1 pt)

export const OTAKU_CATEGORIES = [
  { id: 'indices',   emoji: '🔍', label: 'Devine l\'animé', desc: '3 indices, de plus en plus faciles' },
  { id: 'citation',  emoji: '💬', label: 'Qui a dit ça ?',  desc: 'Une réplique culte, trouve le perso' },
  { id: 'technique', emoji: '⚡', label: 'Attaque spéciale', desc: 'Une technique, trouve son utilisateur' },
  { id: 'emoji',     emoji: '😀', label: 'Emoji animé',      desc: 'Des emojis, trouve l\'animé' },
];

export const OTAKU_INDICES = [
  { answer: 'One Piece', clues: ['Plus de 1000 épisodes et toujours en cours', 'Un fruit du démon rend le héros élastique', 'Luffy veut devenir le Roi des Pirates'] },
  { answer: 'Naruto', clues: ['Un village caché dans les feuilles', 'Un démon renard scellé dans un enfant', '« Je deviendrai Hokage ! »'] },
  { answer: 'Dragon Ball', clues: ['Sept objets à réunir pour exaucer un vœu', 'Un petit garçon avec une queue de singe', 'Son Goku et le Kamehameha'] },
  { answer: 'Death Note', clues: ['Un dieu de la mort qui adore les pommes', 'Un cahier qui tue quiconque y est inscrit', 'Light Yagami contre L'] },
  { answer: 'L\'Attaque des Titans', clues: ['D\'immenses murs protègent l\'humanité', 'Un équipement de manœuvre tridimensionnelle', 'Eren jure d\'exterminer les Titans'] },
  { answer: 'Demon Slayer', clues: ['Une boîte en bois portée sur le dos', 'Une sœur devenue démon qui mord un bambou', 'Tanjiro et la Respiration de l\'Eau'] },
  { answer: 'My Hero Academia', clues: ['80 % de la population possède un pouvoir', 'Le lycée Yuei forme des héros', 'Deku hérite du One For All d\'All Might'] },
  { answer: 'Pokémon', clues: ['Un jeune garçon originaire de Bourg Palette', 'Une créature jaune qui refuse sa Poké Ball', 'Sacha et Pikachu'] },
  { answer: 'Fullmetal Alchemist', clues: ['Le principe de l\'échange équivalent', 'Une âme liée à une armure vide', 'Les frères Edward et Alphonse Elric'] },
  { answer: 'Hunter x Hunter', clues: ['Un examen mortel pour obtenir une licence', 'Une énergie vitale appelée le Nen', 'Gon et Kirua'] },
  { answer: 'Jujutsu Kaisen', clues: ['Un lycéen avale un doigt maudit', 'Des fléaux nés des émotions négatives', 'Itadori, Sukuna et Gojo'] },
  { answer: 'One Punch Man', clues: ['Un héros chauve qui s\'ennuie', 'Il bat n\'importe qui en un seul coup', 'Saitama'] },
  { answer: 'Chainsaw Man', clues: ['Un chien-démon nommé Pochita', 'Un héros criblé de dettes', 'Denji se transforme en tronçonneuse'] },
  { answer: 'Spy x Family', clues: ['Une petite fille qui lit dans les pensées', 'Une tueuse à gages mariée à un espion', 'La famille Forger'] },
  { answer: 'Les Chevaliers du Zodiaque', clues: ['Des armures liées aux constellations', 'Protéger la déesse Athéna', 'Seiya, chevalier de Pégase'] },
  { answer: 'Olive et Tom', clues: ['Des terrains qui semblent faire des kilomètres', 'Un gardien prodige nommé Thomas Price', 'Olivier Atton rêve de la Coupe du monde'] },
  { answer: 'Sailor Moon', clues: ['Un chat noir avec un croissant de lune sur le front', 'Des guerrières en uniforme de marin', '« Au nom de la Lune, je vais te punir ! »'] },
  { answer: 'Le Voyage de Chihiro', clues: ['Des parents transformés en cochons', 'Des bains publics pour les esprits', 'Film de Miyazaki, Oscar 2003'] },
  { answer: 'Mon voisin Totoro', clues: ['Un chat-bus', 'Deux sœurs s\'installent à la campagne', 'La grosse créature mascotte du studio Ghibli'] },
  { answer: 'Blue Lock', clues: ['Un projet pour créer le meilleur attaquant du monde', '300 joueurs enfermés dans un centre', 'Isagi Yoichi'] },
  { answer: 'Solo Leveling', clues: ['Le chasseur « le plus faible de l\'humanité »', 'Des fenêtres de quête comme dans un jeu vidéo', 'Sung Jin-Woo'] },
  { answer: 'Haikyu!!', clues: ['Un petit joueur qui saute très haut', 'Le lycée Karasuno, « les corbeaux »', 'Volley-ball : Hinata et Kageyama'] },
  { answer: 'Tokyo Ghoul', clues: ['Un café nommé l\'Antique', 'Un étudiant devenu mi-humain mi-goule', 'Ken Kaneki'] },
  { answer: 'Bleach', clues: ['Un badge de shinigami remplaçant', 'La Soul Society', 'Ichigo Kurosaki'] },
  { answer: 'Frieren', clues: ['Une elfe qui a plus de mille ans', 'Le voyage après la défaite du Roi Démon', 'Frieren et son apprentie Fern'] },
  { answer: 'Code Geass', clues: ['Un prince exilé qui défie un empire', 'Un pouvoir d\'obéissance absolue dans l\'œil', 'Lelouch et son masque de Zero'] },
];

export const OTAKU_CITATIONS = [
  { q: '« Je suis le prince des Saiyans ! »', answer: 'Vegeta', from: 'Dragon Ball Z' },
  { q: '« Je vais devenir le Roi des Pirates ! »', answer: 'Monkey D. Luffy', from: 'One Piece' },
  { q: '« Tu ne le sais pas encore… mais tu es déjà mort. »', answer: 'Kenshiro', from: 'Ken le Survivant' },
  { q: '« Je prends une chips… et je la mange ! »', answer: 'Light Yagami', from: 'Death Note' },
  { q: '« Plus Ultra ! »', answer: 'All Might', from: 'My Hero Academia' },
  { q: '« Bats-toi ! Bats-toi ! » (Tatakae !)', answer: 'Eren Jäger', from: 'L\'Attaque des Titans' },
  { q: '« Au nom de la Lune, je vais te punir ! »', answer: 'Sailor Moon (Bunny / Usagi)', from: 'Sailor Moon' },
  { q: '« Yare yare daze… »', answer: 'Jotaro Kujo', from: 'JoJo\'s Bizarre Adventure' },
  { q: '« 100 pompes, 100 abdos, 100 squats et 10 km de course. Tous les jours ! »', answer: 'Saitama', from: 'One Punch Man' },
  { q: '« Pika pika ! »', answer: 'Pikachu', from: 'Pokémon' },
  { q: '« Plus rapide que la lumière, rendez-vous tous ou ce sera la guerre ! »', answer: 'La Team Rocket (Jessie & James)', from: 'Pokémon' },
  { q: '« Pour obtenir quelque chose, il faut donner en échange quelque chose de valeur égale. »', answer: 'Les frères Elric', from: 'Fullmetal Alchemist' },
  { q: '« Entre ciel et terre, je suis le seul à être vénéré. »', answer: 'Satoru Gojo', from: 'Jujutsu Kaisen' },
  { q: '« Rien… Il ne s\'est rien passé. »', answer: 'Roronoa Zoro', from: 'One Piece' },
  { q: '« Pardonne-moi, Sasuke… ce sera pour la prochaine fois. »', answer: 'Itachi Uchiha', from: 'Naruto' },
  { q: '« Fais brûler ton cœur ! »', answer: 'Kyojuro Rengoku', from: 'Demon Slayer' },
  { q: '« Offrez vos cœurs ! »', answer: 'Erwin Smith', from: 'L\'Attaque des Titans' },
  { q: '« Waku waku ! »', answer: 'Anya Forger', from: 'Spy x Family' },
  { q: '« El Psy Kongroo. »', answer: 'Okabe Rintaro', from: 'Steins;Gate' },
  { q: '« Crois en moi qui crois en toi ! »', answer: 'Kamina', from: 'Gurren Lagann' },
  { q: '« Je deviendrai Hokage, et tout le village me reconnaîtra ! »', answer: 'Naruto Uzumaki', from: 'Naruto' },
  { q: '« Je suis L. »', answer: 'L', from: 'Death Note' },
  { q: '« Explosion ! »', answer: 'Megumin', from: 'KonoSuba' },
  { q: '« Zero ordonne… obéis-moi ! »', answer: 'Lelouch', from: 'Code Geass' },
];

export const OTAKU_TECHNIQUES = [
  { q: 'Kamehameha', answer: 'Son Goku', from: 'Dragon Ball (inventée par Tortue Géniale)' },
  { q: 'Genkidama (Boule d\'énergie)', answer: 'Son Goku', from: 'Dragon Ball' },
  { q: 'Final Flash', answer: 'Vegeta', from: 'Dragon Ball Z' },
  { q: 'Makankosappo', answer: 'Piccolo', from: 'Dragon Ball' },
  { q: 'Rasengan', answer: 'Naruto Uzumaki', from: 'Naruto (inventé par Minato)' },
  { q: 'Multiclonage', answer: 'Naruto Uzumaki', from: 'Naruto' },
  { q: 'Chidori', answer: 'Kakashi puis Sasuke', from: 'Naruto' },
  { q: 'Amaterasu', answer: 'Itachi (et Sasuke) Uchiha', from: 'Naruto' },
  { q: 'Gomu Gomu no Pistol', answer: 'Monkey D. Luffy', from: 'One Piece' },
  { q: 'Santoryu, le style à trois sabres', answer: 'Roronoa Zoro', from: 'One Piece' },
  { q: 'Diable Jambe', answer: 'Sanji', from: 'One Piece' },
  { q: 'Getsuga Tensho', answer: 'Ichigo Kurosaki', from: 'Bleach' },
  { q: 'Detroit Smash', answer: 'All Might (puis Deku)', from: 'My Hero Academia' },
  { q: 'Hinokami Kagura, la Danse du Dieu du Feu', answer: 'Tanjiro Kamado', from: 'Demon Slayer' },
  { q: 'Respiration de la Foudre — Premier Mouvement', answer: 'Zenitsu Agatsuma', from: 'Demon Slayer' },
  { q: 'Extension du territoire : Vide infini', answer: 'Satoru Gojo', from: 'Jujutsu Kaisen' },
  { q: 'Coup Sérieux', answer: 'Saitama', from: 'One Punch Man' },
  { q: 'Jajanken', answer: 'Gon Freecss', from: 'Hunter x Hunter' },
  { q: 'Météores de Pégase', answer: 'Seiya', from: 'Les Chevaliers du Zodiaque' },
  { q: 'Alchimie sans cercle de transmutation (en frappant des mains)', answer: 'Edward Elric', from: 'Fullmetal Alchemist' },
  { q: 'Explosion (magie qui l\'épuise après un seul sort)', answer: 'Megumin', from: 'KonoSuba' },
  { q: 'Tonnerre de Pikachu (Fatal-Foudre)', answer: 'Pikachu', from: 'Pokémon' },
];

export const OTAKU_EMOJIS = [
  { emojis: ['🏴‍☠️', '👒', '🍖'], answer: 'One Piece', hint: 'Un équipage de pirates' },
  { emojis: ['🍥', '🦊', '🍜'], answer: 'Naruto', hint: 'Un ninja fan de ramen' },
  { emojis: ['🐉', '🟠', '⭐'], answer: 'Dragon Ball', hint: 'Sept boules et un dragon' },
  { emojis: ['📓', '✍️', '💀'], answer: 'Death Note', hint: 'Un cahier mortel' },
  { emojis: ['🧱', '👹', '⚔️'], answer: 'L\'Attaque des Titans', hint: 'Des murs et des géants' },
  { emojis: ['👹', '🗡️', '🎋'], answer: 'Demon Slayer', hint: 'Chasseurs de démons' },
  { emojis: ['⚡', '🐭', '🎒'], answer: 'Pokémon', hint: 'Attrapez-les tous' },
  { emojis: ['🥚', '👊', '😐'], answer: 'One Punch Man', hint: 'Un seul coup suffit' },
  { emojis: ['🪚', '😈', '🐶'], answer: 'Chainsaw Man', hint: 'Pochita' },
  { emojis: ['🕵️', '🔫', '🥜'], answer: 'Spy x Family', hint: 'Une famille pas comme les autres' },
  { emojis: ['🛁', '👻', '🐉'], answer: 'Le Voyage de Chihiro', hint: 'Studio Ghibli' },
  { emojis: ['🐱', '🚌', '🌳'], answer: 'Mon voisin Totoro', hint: 'Studio Ghibli' },
  { emojis: ['🏐', '🐦‍⬛', '🦘'], answer: 'Haikyu!!', hint: 'Sport au lycée' },
  { emojis: ['⚽', '🔒', '👁️'], answer: 'Blue Lock', hint: 'Le meilleur attaquant' },
  { emojis: ['🌙', '👸', '🐈‍⬛'], answer: 'Sailor Moon', hint: 'Magical girl des années 90' },
  { emojis: ['🛡️', '⚗️', '👬'], answer: 'Fullmetal Alchemist', hint: 'Deux frères alchimistes' },
  { emojis: ['☕', '🩸', '🎭'], answer: 'Tokyo Ghoul', hint: 'Mi-humain mi-monstre' },
  { emojis: ['🕶️', '👹', '🏫'], answer: 'Jujutsu Kaisen', hint: 'Lycée d\'exorcistes' },
  { emojis: ['🧝‍♀️', '⏳', '🪄'], answer: 'Frieren', hint: 'Une elfe magicienne' },
  { emojis: ['🎮', '🗡️', '🔒'], answer: 'Sword Art Online', hint: 'Piégés dans un jeu en réalité virtuelle' },
  { emojis: ['🌸', '🃏', '🪄'], answer: 'Card Captor Sakura', hint: 'Des cartes magiques à capturer' },
  { emojis: ['🦸', '🏫', '💥'], answer: 'My Hero Academia', hint: 'Une école de super-héros' },
  { emojis: ['🗡️', '☠️', '⚫'], answer: 'Bleach', hint: 'Shinigami remplaçant' },
  { emojis: ['🎣', '🃏', '🟢'], answer: 'Hunter x Hunter', hint: 'Gon cherche son père' },
];

const BY_CATEGORY = {
  indices:   OTAKU_INDICES,
  citation:  OTAKU_CITATIONS,
  technique: OTAKU_TECHNIQUES,
  emoji:     OTAKU_EMOJIS,
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Tire `count` questions mélangées parmi les catégories choisies, en alternant les catégories
export function buildOtakuDeck(categoryIds, count) {
  const piles = categoryIds.map(id => shuffle(BY_CATEGORY[id] || []).map(item => ({ ...item, category: id })));
  const deck = [];
  let i = 0;
  while (deck.length < count && piles.some(p => p.length)) {
    const pile = piles[i % piles.length];
    if (pile.length) deck.push(pile.shift());
    i++;
  }
  return shuffle(deck);
}

export function otakuPoolSize(categoryIds) {
  return categoryIds.reduce((n, id) => n + (BY_CATEGORY[id]?.length || 0), 0);
}
