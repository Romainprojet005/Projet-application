function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const MOT_DE_PASSE_CARDS = [
  // ── ANIMAUX ──────────────────────────────────────────────────────
  { word: 'CHIEN',              forbidden: ['Animal', 'Chiot', 'Aboyer', 'Poil', 'Laisse'] },
  { word: 'CHAT',               forbidden: ['Animal', 'Chaton', 'Miauler', 'Ronronner', 'Poil'] },
  { word: 'LION',               forbidden: ['Savane', 'Rugir', 'Mufasa', 'Fauve', 'Crinière'] },
  { word: 'DAUPHIN',            forbidden: ['Mer', 'Mammifère', 'Intelligent', 'Nager', 'Flipper'] },
  { word: 'ÉLÉPHANT',           forbidden: ['Trompe', 'Gros', 'Afrique', 'Ivoire', 'Mémoire'] },
  { word: 'REQUIN',             forbidden: ['Dents', 'Mer', 'Attaque', 'Jaws', 'Nager'] },
  { word: 'PINGOUIN',           forbidden: ['Froid', 'Arctique', 'Noir', 'Blanc', 'Marcher'] },
  { word: 'CROCODILE',          forbidden: ['Dents', 'Mâchoire', 'Reptile', 'Vert', 'Nager'] },
  { word: 'GIRAFE',             forbidden: ['Cou', 'Grand', 'Afrique', 'Taches', 'Savane'] },
  { word: 'ARAIGNÉE',           forbidden: ['Toile', 'Pattes', 'Peur', 'Venin', 'Huit'] },

  // ── SPORTS ───────────────────────────────────────────────────────
  { word: 'FOOTBALL',           forbidden: ['Ballon', 'But', 'Terrain', 'Joueur', 'Équipe'] },
  { word: 'TENNIS',             forbidden: ['Raquette', 'Balle', 'Court', 'Filet', 'Service'] },
  { word: 'NATATION',           forbidden: ['Piscine', 'Eau', 'Nager', 'Brasse', 'Crawl'] },
  { word: 'BOXE',               forbidden: ['Gants', 'Ring', 'Coup', 'Combat', 'KO'] },
  { word: 'CYCLISME',           forbidden: ['Vélo', 'Tour', 'Roue', 'Pédaler', 'Casque'] },
  { word: 'SKI',                forbidden: ['Neige', 'Montagne', 'Piste', 'Descente', 'Station'] },
  { word: 'BASKETBALL',         forbidden: ['Panier', 'Ballon', 'Court', 'Dribble', 'NBA'] },
  { word: 'RUGBY',              forbidden: ['Ballon', 'Ovale', 'Plaquage', 'Essai', 'Équipe'] },
  { word: 'GOLF',               forbidden: ['Balle', 'Club', 'Trou', 'Fairway', 'Green'] },
  { word: 'ESCRIME',            forbidden: ['Épée', 'Masque', 'Fleuret', 'Combat', 'Touche'] },

  // ── ALIMENTS ─────────────────────────────────────────────────────
  { word: 'PIZZA',              forbidden: ['Italie', 'Fromage', 'Tomate', 'Four', 'Ronde'] },
  { word: 'SUSHI',              forbidden: ['Japon', 'Riz', 'Poisson', 'Baguette', 'Rouler'] },
  { word: 'CHOCOLAT',           forbidden: ['Sucré', 'Cacao', 'Noir', 'Bonbon', 'Fondre'] },
  { word: 'FROMAGE',            forbidden: ['Lait', 'Vache', 'France', 'Sentir', 'Trou'] },
  { word: 'CROISSANT',          forbidden: ['Boulangerie', 'Beurre', 'France', 'Pâte', 'Feuilleté'] },
  { word: 'GLACE',              forbidden: ['Froid', 'Sucre', 'Cornet', 'Vanille', 'Crème'] },
  { word: 'CRÊPE',              forbidden: ['Farine', 'Bretagne', 'Sucre', 'Fine', 'Poêle'] },
  { word: 'HAMBURGER',          forbidden: ['Bun', 'Steak', 'Américain', 'McDonald', 'Fast-food'] },
  { word: 'PÂTES',              forbidden: ['Italie', 'Cuire', 'Sauce', 'Spaghetti', 'Farine'] },
  { word: 'FRAISE',             forbidden: ['Rouge', 'Fruit', 'Printemps', 'Confiture', 'Saison'] },

  // ── LIEUX ────────────────────────────────────────────────────────
  { word: 'PLAGE',              forbidden: ['Mer', 'Sable', 'Vacances', 'Soleil', 'Eau'] },
  { word: 'FORÊT',              forbidden: ['Arbres', 'Bois', 'Nature', 'Animaux', 'Vert'] },
  { word: 'DÉSERT',             forbidden: ['Sable', 'Chaud', 'Sahara', 'Cactus', 'Dunes'] },
  { word: 'VOLCAN',             forbidden: ['Lave', 'Éruption', 'Feu', 'Magma', 'Montagne'] },
  { word: 'BIBLIOTHÈQUE',       forbidden: ['Livres', 'Lire', 'Calme', 'Bibliothécaire', 'Emprunter'] },
  { word: 'STADE',              forbidden: ['Sport', 'Tribunes', 'Match', 'Pelouse', 'Spectateurs'] },
  { word: 'MUSÉE',              forbidden: ['Art', 'Tableau', 'Culture', 'Expo', 'Œuvre'] },
  { word: 'SUPERMARCHÉ',        forbidden: ['Courses', 'Rayon', 'Caisse', 'Chariot', 'Acheter'] },

  // ── OBJETS ───────────────────────────────────────────────────────
  { word: 'TÉLÉPHONE',          forbidden: ['Appeler', 'Écran', 'Portable', 'Mobile', 'Sonner'] },
  { word: 'VOITURE',            forbidden: ['Conduire', 'Route', 'Moteur', 'Volant', 'Auto'] },
  { word: 'ORDINATEUR',         forbidden: ['Écran', 'Clavier', 'Internet', 'Souris', 'Programmer'] },
  { word: 'PARAPLUIE',          forbidden: ['Pluie', 'Abri', 'Imperméable', 'Ouvrir', 'Vent'] },
  { word: 'MIROIR',             forbidden: ['Reflet', 'Image', 'Verre', 'Salle de bain', 'Se voir'] },
  { word: 'LUNETTES',           forbidden: ['Voir', 'Yeux', 'Verre', 'Monture', 'Vue'] },
  { word: 'CASQUE',             forbidden: ['Tête', 'Protection', 'Moto', 'Musique', 'Son'] },
  { word: 'BOUGIE',             forbidden: ['Lumière', 'Feu', 'Cire', 'Flamme', 'Romantique'] },

  // ── POP CULTURE ──────────────────────────────────────────────────
  { word: 'SUPERMAN',           forbidden: ['Super-héros', 'Cape', 'Kryptonite', 'Clark Kent', 'Voler'] },
  { word: 'BATMAN',             forbidden: ['Super-héros', 'Cape', 'Chauve-souris', 'Gotham', 'Robin'] },
  { word: 'VAMPIRE',            forbidden: ['Sang', 'Nuit', 'Morsure', 'Cercueil', 'Ail'] },
  { word: 'ZOMBIE',             forbidden: ['Mort', 'Mort-vivant', 'Cerveau', 'Marcher', 'Morsure'] },
  { word: 'ROBOT',              forbidden: ['Métal', 'Machine', 'Programme', 'Automatique', 'Fer'] },
  { word: 'MINECRAFT',          forbidden: ['Jeu', 'Cube', 'Construire', 'Creeper', 'Blocs'] },
  { word: 'NETFLIX',            forbidden: ['Film', 'Série', 'Streaming', 'Abonnement', 'Regarder'] },
  { word: 'EMOJI',              forbidden: ['Symbole', 'Émotion', 'Téléphone', 'Image', 'Exprimer'] },

  // ── NATURE / SCIENCE ─────────────────────────────────────────────
  { word: 'ÉCLIPSE',            forbidden: ['Soleil', 'Lune', 'Ombre', 'Astronomie', 'Cacher'] },
  { word: 'COMÈTE',             forbidden: ['Espace', 'Queue', 'Étoile', 'Orbite', 'Feu'] },
  { word: 'TORNADE',            forbidden: ['Vent', 'Tourbillon', 'Dévaster', 'Amérique', 'Danger'] },
  { word: 'ARC-EN-CIEL',        forbidden: ['Couleur', 'Pluie', 'Soleil', 'Beau', 'Ciel'] },
  { word: 'AVALANCHE',          forbidden: ['Neige', 'Montagne', 'Glisser', 'Danger', 'Ski'] },
  { word: 'DIAMANT',            forbidden: ['Pierre', 'Bijou', 'Dur', 'Bague', 'Précieux'] },

  // ── MOTS ABSTRAITS ───────────────────────────────────────────────
  { word: 'LIBERTÉ',            forbidden: ['Libre', 'Droit', 'Choisir', 'Indépendance', 'Prison'] },
  { word: 'COURAGE',            forbidden: ['Brave', 'Peur', 'Héros', 'Affronter', 'Force'] },
  { word: 'PATIENCE',           forbidden: ['Attendre', 'Calme', 'Temps', 'Vertu', 'Zen'] },
  { word: 'JALOUSIE',           forbidden: ['Jaloux', 'Envie', 'Rival', 'Sentiment', 'Vert'] },
  { word: 'NOSTALGIE',          forbidden: ['Passé', 'Souvenir', 'Mélancolie', 'Vieux', 'Temps'] },

  // ── MÉTIERS ──────────────────────────────────────────────────────
  { word: 'MÉDECIN',            forbidden: ['Docteur', 'Hôpital', 'Soigner', 'Malade', 'Ordonnance'] },
  { word: 'POMPIER',            forbidden: ['Feu', 'Casque', 'Camion', 'Eau', 'Sauver'] },
  { word: 'CUISINIER',          forbidden: ['Cuisine', 'Recette', 'Chef', 'Casserole', 'Préparer'] },
  { word: 'ASTRONAUTE',         forbidden: ['Espace', 'Fusée', 'NASA', 'Planète', 'Combinaison'] },
  { word: 'ACTEUR',             forbidden: ['Film', 'Jouer', 'Rôle', 'Scène', 'Hollywood'] },
  { word: 'MAGICIEN',           forbidden: ['Magie', 'Tour', 'Baguette', 'Chapeau', 'Illusion'] },
  { word: 'PIRATE',             forbidden: ['Bateau', 'Mer', 'Trésor', 'Perroquet', 'Crochet'] },

  // ── FÊTES / EVENTS ───────────────────────────────────────────────
  { word: 'NOËL',               forbidden: ['Père Noël', 'Cadeau', 'Sapin', 'Hiver', 'Décembre'] },
  { word: 'HALLOWEEN',          forbidden: ['Sorcière', 'Citrouille', 'Fantôme', 'Bonbon', 'Déguisement'] },
  { word: 'CARNAVAL',           forbidden: ['Déguisement', 'Masque', 'Mardi Gras', 'Parade', 'Fête'] },
  { word: 'ANNIVERSAIRE',       forbidden: ['Gâteau', 'Bougie', 'Cadeau', 'Fête', 'Age'] },
  { word: 'MARIAGE',            forbidden: ['Mariés', 'Alliance', 'Cérémonie', 'Robe', 'Amour'] },

  // ── TRANSPORT ────────────────────────────────────────────────────
  { word: 'AVION',              forbidden: ['Voler', 'Aéroport', 'Pilote', 'Aile', 'Altitude'] },
  { word: 'SOUS-MARIN',         forbidden: ['Mer', 'Plonger', 'Torpille', 'Profond', 'Naval'] },
  { word: 'FUSÉE',              forbidden: ['Espace', 'Lancer', 'NASA', 'Astronaute', 'Feu'] },
  { word: 'VÉLO',               forbidden: ['Roue', 'Pédaler', 'Casque', 'Cycliste', 'Tour'] },
  { word: 'HÉLICOPTÈRE',        forbidden: ['Voler', 'Hélice', 'Atterrir', 'Pilote', 'Air'] },

  // ── CÉLÉBRITÉS (cartes difficiles) ───────────────────────────────
  { word: 'NAPOLÉON',           forbidden: ['Empereur', 'France', 'Waterloo', 'Petit', 'Guerre'] },
  { word: 'EINSTEIN',           forbidden: ['Génie', 'Physique', 'Relativité', 'Scientifique', 'E=mc²'] },
  { word: 'CLÉOPÂTRE',          forbidden: ['Égypte', 'Reine', 'Serpent', 'Pharaon', 'César'] },
  { word: 'PICASSO',            forbidden: ['Peintre', 'Art', 'Tableau', 'Cubisme', 'Espagne'] },
  { word: 'SHAKESPEARE',        forbidden: ['Écrivain', 'Roméo', 'Anglais', 'Théâtre', 'Hamlet'] },
];

let _usedIndices = new Set();

export function getMotDePasseCards(count) {
  let available = MOT_DE_PASSE_CARDS
    .map((c, i) => ({ ...c, _i: i }))
    .filter(c => !_usedIndices.has(c._i));
  if (available.length < count) {
    _usedIndices.clear();
    available = MOT_DE_PASSE_CARDS.map((c, i) => ({ ...c, _i: i }));
  }
  const selected = shuffle([...available]).slice(0, Math.min(count, available.length));
  selected.forEach(c => _usedIndices.add(c._i));
  return selected;
}
