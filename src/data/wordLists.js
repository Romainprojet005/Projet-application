// ── 50 clusters thématiques pour le mode Aléatoire ───────────────────────
export const wordClusters = [
  { words: ['Chien', 'Chat', 'Lapin', 'Hamster'] },
  { words: ['Lion', 'Tigre', 'Panthère', 'Guépard'] },
  { words: ['Aigle', 'Faucon', 'Vautour', 'Buse'] },
  { words: ['Dauphin', 'Baleine', 'Orque', 'Marsouin'] },
  { words: ['Fourmi', 'Abeille', 'Guêpe', 'Frelon'] },
  { words: ['Pizza', 'Burger', 'Hot-dog', 'Kebab'] },
  { words: ['Café', 'Thé', 'Chocolat chaud', 'Cappuccino'] },
  { words: ['Glace', 'Sorbet', 'Granita', 'Crème glacée'] },
  { words: ['Croissant', 'Pain au chocolat', 'Brioche', 'Chausson'] },
  { words: ['Vélo', 'Trottinette', 'Scooter', 'Moto'] },
  { words: ['Avion', 'Hélicoptère', 'Planeur', 'ULM'] },
  { words: ['Train', 'Métro', 'Tram', 'RER'] },
  { words: ['Football', 'Rugby', 'Handball', 'Basket'] },
  { words: ['Tennis', 'Badminton', 'Squash', 'Ping-pong'] },
  { words: ['Natation', 'Plongée', 'Surf', 'Kayak'] },
  { words: ['Pluie', 'Averse', 'Orage', 'Tempête'] },
  { words: ['Neige', 'Grêle', 'Givre', 'Verglas'] },
  { words: ['Boulanger', 'Pâtissier', 'Chocolatier', 'Confiseur'] },
  { words: ['Médecin', 'Chirurgien', 'Urgentiste', 'Anesthésiste'] },
  { words: ['Guitare', 'Violon', 'Alto', 'Violoncelle'] },
  { words: ['Flûte', 'Clarinette', 'Hautbois', 'Saxophone'] },
  { words: ['Fraise', 'Framboise', 'Cerise', 'Groseille'] },
  { words: ['Orange', 'Citron', 'Pamplemousse', 'Mandarine'] },
  { words: ['Carotte', 'Navet', 'Radis', 'Betterave'] },
  { words: ['Camembert', 'Brie', 'Coulommiers', 'Munster'] },
  { words: ['Château', 'Palais', 'Manoir', 'Forteresse'] },
  { words: ['Maison', 'Villa', 'Chalet', 'Pavillon'] },
  { words: ['Valse', 'Tango', 'Salsa', 'Bachata'] },
  { words: ['Spider-Man', 'Batman', 'Superman', 'Iron Man'] },
  { words: ['Fée', 'Sorcière', 'Elfe', 'Gnome'] },
  { words: ['Instagram', 'TikTok', 'Snapchat', 'Pinterest'] },
  { words: ['PlayStation', 'Xbox', 'Nintendo Switch', 'Steam Deck'] },
  { words: ['Mars', 'Jupiter', 'Saturne', 'Vénus'] },
  { words: ['Tour Eiffel', 'Arc de Triomphe', 'Sacré-Cœur', 'Panthéon'] },
  { words: ['Boxe', 'Judo', 'Karaté', 'Taekwondo'] },
  { words: ["Collier", "Bracelet", "Bague", "Boucles d'oreilles"] },
  { words: ['Pantalon', 'Jean', 'Short', 'Bermuda'] },
  { words: ['Baskets', 'Mocassins', 'Bottes', 'Sandales'] },
  { words: ['Champagne', 'Prosecco', 'Cava', 'Crémant'] },
  { words: ['Whisky', 'Rhum', 'Vodka', 'Gin'] },
  { words: ['Riz', 'Pâtes', 'Semoule', 'Quinoa'] },
  { words: ['Brocoli', 'Épinard', 'Courgette', 'Haricot vert'] },
  { words: ['Piscine', 'Jacuzzi', 'Spa', 'Hammam'] },
  { words: ['Roman', 'Nouvelle', 'Conte', 'Fable'] },
  { words: ['Peinture', 'Dessin', 'Aquarelle', 'Gravure'] },
  { words: ['Randonnée', 'Trekking', 'Alpinisme', 'Escalade'] },
  { words: ['Anniversaire', 'Mariage', 'Baptême', 'Fiançailles'] },
  { words: ['Hôtel', 'Auberge', 'Camping', 'Gîte'] },
  { words: ['Bibliothèque', 'Médiathèque', 'Librairie', 'Bouquiniste'] },
  { words: ['Pompier', 'Policier', 'Gendarme', 'Secouriste'] },
];

/**
 * Génère une paire de mots proches depuis les clusters.
 * usedClusterIndices : Set<number> persisté entre les parties.
 */
export function generateRandomPair(usedClusterIndices) {
  let available = wordClusters.map((_, i) => i).filter(i => !usedClusterIndices.has(i));
  if (available.length === 0) {
    usedClusterIndices.clear();
    available = wordClusters.map((_, i) => i);
  }
  const clusterIdx = available[Math.floor(Math.random() * available.length)];
  usedClusterIndices.add(clusterIdx);
  const words = [...wordClusters[clusterIdx].words];
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return { civilian: words[0], undercover: words[1] };
}

// ── Thèmes fixes ──────────────────────────────────────────────────────────
export const wordThemes = {
  classique: {
    label: 'Classique',
    emoji: '🎯',
    description: 'Pour tous les âges',
    pairs: [
      { civilian: 'Voiture', undercover: 'Moto' },
      { civilian: 'Plage', undercover: 'Piscine' },
      { civilian: 'Pizza', undercover: 'Burger' },
      { civilian: 'Chat', undercover: 'Chien' },
      { civilian: 'Téléphone', undercover: 'Tablette' },
      { civilian: 'Café', undercover: 'Thé' },
      { civilian: 'Football', undercover: 'Rugby' },
      { civilian: 'Film', undercover: 'Série' },
      { civilian: 'Montagne', undercover: 'Colline' },
      { civilian: 'Pluie', undercover: 'Neige' },
      { civilian: 'Soleil', undercover: 'Lune' },
      { civilian: 'Livre', undercover: 'Magazine' },
      { civilian: 'Musique', undercover: 'Chanson' },
      { civilian: 'Avion', undercover: 'Hélicoptère' },
      { civilian: 'Chocolat', undercover: 'Caramel' },
    ],
  },
  nature: {
    label: 'Nature',
    emoji: '🌿',
    description: 'Le monde qui nous entoure',
    pairs: [
      { civilian: 'Lion', undercover: 'Tigre' },
      { civilian: 'Forêt', undercover: 'Jungle' },
      { civilian: 'Rivière', undercover: 'Lac' },
      { civilian: 'Fleur', undercover: 'Plante' },
      { civilian: 'Oiseau', undercover: 'Papillon' },
      { civilian: 'Rocher', undercover: 'Pierre' },
      { civilian: 'Nuage', undercover: 'Brouillard' },
      { civilian: 'Feuille', undercover: 'Herbe' },
      { civilian: 'Mer', undercover: 'Océan' },
      { civilian: 'Volcan', undercover: 'Montagne' },
      { civilian: 'Fourmi', undercover: 'Abeille' },
      { civilian: 'Orage', undercover: 'Tempête' },
      { civilian: 'Cascade', undercover: 'Fontaine' },
      { civilian: 'Désert', undercover: 'Savane' },
      { civilian: 'Hibou', undercover: 'Chouette' },
    ],
  },
  cinema: {
    label: 'Cinéma',
    emoji: '🎬',
    description: 'Pour les cinéphiles',
    pairs: [
      { civilian: 'Héros', undercover: 'Super-héros' },
      { civilian: 'Cinéma', undercover: 'Théâtre' },
      { civilian: 'Comédie', undercover: 'Drame' },
      { civilian: 'Réalisateur', undercover: 'Producteur' },
      { civilian: 'Oscar', undercover: 'César' },
      { civilian: 'Popcorn', undercover: 'Bonbons' },
      { civilian: 'Effets spéciaux', undercover: 'Cascades' },
      { civilian: 'Horreur', undercover: 'Thriller' },
      { civilian: 'Animation', undercover: 'Dessin animé' },
      { civilian: 'Remake', undercover: 'Suite' },
      { civilian: 'Streaming', undercover: 'DVD' },
      { civilian: 'Acteur', undercover: 'Figurant' },
      { civilian: 'Scénario', undercover: 'Roman' },
      { civilian: 'Avant-première', undercover: 'Festival' },
      { civilian: 'Bande-annonce', undercover: 'Affiche' },
    ],
  },
  aleatoire: {
    label: 'Aléatoire',
    emoji: '✨',
    description: 'Surprise à chaque partie !',
    generated: true,
    pairs: [],
  },
  hot: {
    label: 'Hot 🔥',
    emoji: '🔥',
    description: 'Adults only...',
    pairs: [
      { civilian: 'Bondage', undercover: 'Attaché' },
      { civilian: 'Club échangisme', undercover: 'Partouze' },
      { civilian: 'Sextoy', undercover: 'Jouet' },
      { civilian: 'Prostate', undercover: 'Point G' },
      { civilian: 'Fouet', undercover: 'Matraque' },
      { civilian: 'Lubrifiant', undercover: 'Crème' },
      { civilian: 'Bidule', undercover: 'Chose' },
      { civilian: 'Pense-bête', undercover: 'Post-it' },
      { civilian: 'Raton-laveur', undercover: 'Lave-vaisselle' },
      { civilian: 'Sucer', undercover: 'Lécher' },
      { civilian: 'Strip-tease', undercover: 'Pole dance' },
      { civilian: 'Capote', undercover: 'Ballon' },
      { civilian: 'Prendre', undercover: 'Enfiler' },
      { civilian: 'Amuse-bouche', undercover: 'Micro pénis' },
      { civilian: 'Pamplemousse', undercover: 'Orange' },
      { civilian: 'Phoque', undercover: 'Morse' },
      { civilian: 'Jupe', undercover: 'Tanga' },
      { civilian: 'Poils', undercover: 'Clément' },
      { civilian: 'Cowgirl', undercover: 'Équitation' },
      { civilian: 'Tarte à la crème', undercover: 'Tarte aux pommes' },
    ],
  },
};
