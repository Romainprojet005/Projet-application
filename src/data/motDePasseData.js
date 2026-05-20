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
  { word: 'PAPILLON',           forbidden: ['Insecte', 'Aile', 'Chenille', 'Cocon', 'Voler'] },
  { word: 'RENARD',             forbidden: ['Roux', 'Forêt', 'Rusé', 'Queue', 'Chasser'] },
  { word: 'HIBOU',              forbidden: ['Oiseau', 'Nuit', 'Yeux', 'Forêt', 'Hululu'] },
  { word: 'PIEUVRE',            forbidden: ['Tentacules', 'Mer', 'Encre', 'Huit', 'Mollusque'] },
  { word: 'FLAMANT ROSE',       forbidden: ['Rose', 'Oiseau', 'Patte', 'Équilibre', 'Afrique'] },

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
  { word: 'TRAMPOLINE',         forbidden: ['Sauter', 'Rebondir', 'Ressort', 'Sport', 'Enfant'] },
  { word: 'SKATEBOARD',         forbidden: ['Planche', 'Roulettes', 'Glisser', 'Trick', 'Street'] },
  { word: 'SURF',               forbidden: ['Vague', 'Mer', 'Planche', 'Glisser', 'Hawaii'] },

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
  { word: 'CHAMPAGNE',          forbidden: ['Bulles', 'Fête', 'France', 'Alcool', 'Bouteille'] },
  { word: 'BAGUETTE',           forbidden: ['France', 'Pain', 'Boulanger', 'Long', 'Croustillant'] },
  { word: 'RAMEN',              forbidden: ['Japon', 'Soupe', 'Nouilles', 'Bouillon', 'Chaud'] },
  { word: 'TACO',               forbidden: ['Mexique', 'Tortilla', 'Salsa', 'Manger', 'Mexicain'] },
  { word: 'FONDUE',             forbidden: ['Fromage', 'Suisse', 'Chauffer', 'Partager', 'Manger'] },

  // ── LIEUX ────────────────────────────────────────────────────────
  { word: 'PLAGE',              forbidden: ['Mer', 'Sable', 'Vacances', 'Soleil', 'Eau'] },
  { word: 'FORÊT',              forbidden: ['Arbres', 'Bois', 'Nature', 'Animaux', 'Vert'] },
  { word: 'DÉSERT',             forbidden: ['Sable', 'Chaud', 'Sahara', 'Cactus', 'Dunes'] },
  { word: 'VOLCAN',             forbidden: ['Lave', 'Éruption', 'Feu', 'Magma', 'Montagne'] },
  { word: 'BIBLIOTHÈQUE',       forbidden: ['Livres', 'Lire', 'Calme', 'Bibliothécaire', 'Emprunter'] },
  { word: 'STADE',              forbidden: ['Sport', 'Tribunes', 'Match', 'Pelouse', 'Spectateurs'] },
  { word: 'MUSÉE',              forbidden: ['Art', 'Tableau', 'Culture', 'Expo', 'Œuvre'] },
  { word: 'SUPERMARCHÉ',        forbidden: ['Courses', 'Rayon', 'Caisse', 'Chariot', 'Acheter'] },
  { word: 'GROTTE',             forbidden: ['Caverne', 'Pierre', 'Sombre', 'Stalactite', 'Préhistoire'] },
  { word: 'IGLOO',              forbidden: ['Neige', 'Esquimau', 'Arctique', 'Froid', 'Glace'] },

  // ── OBJETS ───────────────────────────────────────────────────────
  { word: 'TÉLÉPHONE',          forbidden: ['Appeler', 'Écran', 'Portable', 'Mobile', 'Sonner'] },
  { word: 'VOITURE',            forbidden: ['Conduire', 'Route', 'Moteur', 'Volant', 'Auto'] },
  { word: 'ORDINATEUR',         forbidden: ['Écran', 'Clavier', 'Internet', 'Souris', 'Programmer'] },
  { word: 'PARAPLUIE',          forbidden: ['Pluie', 'Abri', 'Imperméable', 'Ouvrir', 'Vent'] },
  { word: 'MIROIR',             forbidden: ['Reflet', 'Image', 'Verre', 'Salle de bain', 'Se voir'] },
  { word: 'LUNETTES',           forbidden: ['Voir', 'Yeux', 'Verre', 'Monture', 'Vue'] },
  { word: 'CASQUE',             forbidden: ['Tête', 'Protection', 'Moto', 'Musique', 'Son'] },
  { word: 'BOUGIE',             forbidden: ['Lumière', 'Feu', 'Cire', 'Flamme', 'Romantique'] },
  { word: 'PARACHUTE',          forbidden: ['Sauter', 'Chute', 'Ciel', 'Tissu', 'Avion'] },
  { word: 'BOOMERANG',          forbidden: ['Revenir', 'Lancer', 'Australie', 'Bois', 'Retour'] },
  { word: 'LASSO',              forbidden: ['Cowboy', 'Attraper', 'Corde', 'Rodéo', 'Lancer'] },

  // ── POP CULTURE ──────────────────────────────────────────────────
  { word: 'SUPERMAN',           forbidden: ['Super-héros', 'Cape', 'Kryptonite', 'Clark Kent', 'Voler'] },
  { word: 'BATMAN',             forbidden: ['Super-héros', 'Cape', 'Chauve-souris', 'Gotham', 'Robin'] },
  { word: 'VAMPIRE',            forbidden: ['Sang', 'Nuit', 'Morsure', 'Cercueil', 'Ail'] },
  { word: 'ZOMBIE',             forbidden: ['Mort', 'Mort-vivant', 'Cerveau', 'Marcher', 'Morsure'] },
  { word: 'ROBOT',              forbidden: ['Métal', 'Machine', 'Programme', 'Automatique', 'Fer'] },
  { word: 'MINECRAFT',          forbidden: ['Jeu', 'Cube', 'Construire', 'Creeper', 'Blocs'] },
  { word: 'NETFLIX',            forbidden: ['Film', 'Série', 'Streaming', 'Abonnement', 'Regarder'] },
  { word: 'EMOJI',              forbidden: ['Symbole', 'Émotion', 'Téléphone', 'Image', 'Exprimer'] },
  { word: 'SHERLOCK HOLMES',    forbidden: ['Détective', 'Pipe', 'Chapeau', 'Watson', 'Anglais'] },
  { word: 'JAMES BOND',         forbidden: ['Espion', 'Agent', 'Martini', 'Mission', 'Voiture'] },
  { word: 'SELFIE',             forbidden: ['Photo', 'Soi-même', 'Téléphone', 'Partager', 'Poser'] },
  { word: 'INFLUENCEUR',        forbidden: ['Réseaux', 'Followers', 'YouTube', 'Instagram', 'Marque'] },
  { word: 'PODCAST',            forbidden: ['Audio', 'Écouter', 'Épisode', 'Micro', 'Voix'] },
  { word: 'GRAFFITI',           forbidden: ['Peinture', 'Mur', 'Spray', 'Dessin', 'Street'] },
  { word: 'KARAOKE',            forbidden: ['Chanter', 'Micro', 'Chanson', 'Bar', 'Écran'] },
  { word: 'TAPIS ROUGE',        forbidden: ['Célébrités', 'Cinéma', 'Oscar', 'Mode', 'Marcher'] },
  { word: 'PAPARAZZI',          forbidden: ['Photo', 'Célébrités', 'Caché', 'Appareil', 'Suivre'] },

  // ── NATURE / SCIENCE ─────────────────────────────────────────────
  { word: 'ÉCLIPSE',            forbidden: ['Soleil', 'Lune', 'Ombre', 'Astronomie', 'Cacher'] },
  { word: 'COMÈTE',             forbidden: ['Espace', 'Queue', 'Étoile', 'Orbite', 'Feu'] },
  { word: 'TORNADE',            forbidden: ['Vent', 'Tourbillon', 'Dévaster', 'Amérique', 'Danger'] },
  { word: 'ARC-EN-CIEL',        forbidden: ['Couleur', 'Pluie', 'Soleil', 'Beau', 'Ciel'] },
  { word: 'AVALANCHE',          forbidden: ['Neige', 'Montagne', 'Glisser', 'Danger', 'Ski'] },
  { word: 'DIAMANT',            forbidden: ['Pierre', 'Bijou', 'Dur', 'Bague', 'Précieux'] },
  { word: 'ORIGAMI',            forbidden: ['Papier', 'Plier', 'Japon', 'Figure', 'Art'] },
  { word: 'KARMA',              forbidden: ['Destin', 'Bouddhisme', 'Bien', 'Mal', 'Retour'] },

  // ── MOTS ABSTRAITS ───────────────────────────────────────────────
  { word: 'LIBERTÉ',            forbidden: ['Libre', 'Droit', 'Choisir', 'Indépendance', 'Prison'] },
  { word: 'COURAGE',            forbidden: ['Brave', 'Peur', 'Héros', 'Affronter', 'Force'] },
  { word: 'PATIENCE',           forbidden: ['Attendre', 'Calme', 'Temps', 'Vertu', 'Zen'] },
  { word: 'JALOUSIE',           forbidden: ['Jaloux', 'Envie', 'Rival', 'Sentiment', 'Vert'] },
  { word: 'NOSTALGIE',          forbidden: ['Passé', 'Souvenir', 'Mélancolie', 'Vieux', 'Temps'] },
  { word: 'PROCRASTINATION',    forbidden: ['Remettre', 'Retarder', 'Plus tard', 'Paresse', 'Tâche'] },

  // ── MÉTIERS ──────────────────────────────────────────────────────
  { word: 'MÉDECIN',            forbidden: ['Docteur', 'Hôpital', 'Soigner', 'Malade', 'Ordonnance'] },
  { word: 'POMPIER',            forbidden: ['Feu', 'Casque', 'Camion', 'Eau', 'Sauver'] },
  { word: 'CUISINIER',          forbidden: ['Cuisine', 'Recette', 'Chef', 'Casserole', 'Préparer'] },
  { word: 'ASTRONAUTE',         forbidden: ['Espace', 'Fusée', 'NASA', 'Planète', 'Combinaison'] },
  { word: 'ACTEUR',             forbidden: ['Film', 'Jouer', 'Rôle', 'Scène', 'Hollywood'] },
  { word: 'MAGICIEN',           forbidden: ['Magie', 'Tour', 'Baguette', 'Chapeau', 'Illusion'] },
  { word: 'PIRATE',             forbidden: ['Bateau', 'Mer', 'Trésor', 'Perroquet', 'Crochet'] },
  { word: 'ASTRONOME',          forbidden: ['Étoiles', 'Télescope', 'Espace', 'Science', 'Planètes'] },

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

  // ── ADULTE 🔞 ────────────────────────────────────────────────────
  { category: 'adult', word: 'KAMA-SUTRA',        forbidden: ['Livre', 'Inde', 'Positions', 'Corps', 'Couple'] },
  { category: 'adult', word: 'STRIP-POKER',        forbidden: ['Cartes', 'Jeu', 'Déshabiller', 'Enjeu', 'Pari'] },
  { category: 'adult', word: 'APHRODISIAQUE',      forbidden: ['Désir', 'Stimuler', 'Huître', 'Libido', 'Sexe'] },
  { category: 'adult', word: 'FANTASME',           forbidden: ['Rêve', 'Désir', 'Imaginaire', 'Secret', 'Sexe'] },
  { category: 'adult', word: 'LINGERIE',           forbidden: ['Sous-vêtements', 'Dentelle', 'Féminin', 'Soutien', 'Porter'] },
  { category: 'adult', word: 'TINDER',             forbidden: ['Application', 'Swiper', 'Rencontres', 'Profil', 'Match'] },
  { category: 'adult', word: 'INFIDÈLE',           forbidden: ['Tromper', 'Couple', 'Liaison', 'Tromperie', 'Adultère'] },
  { category: 'adult', word: 'AMANT',              forbidden: ['Secret', 'Relation', 'Couple', 'Homme', 'Maîtresse'] },
  { category: 'adult', word: 'VOYEUR',             forbidden: ['Regarder', 'Secret', 'Observer', 'Fenêtre', 'Indiscret'] },
  { category: 'adult', word: 'STRIPTEASE',         forbidden: ['Danser', 'Déshabiller', 'Club', 'Barre', 'Spectacle'] },
  { category: 'adult', word: 'LIBIDO',             forbidden: ['Désir', 'Sexuel', 'Envie', 'Pulsion', 'Manque'] },
  { category: 'adult', word: 'PRÉSERVATIF',        forbidden: ['Protection', 'Contraception', 'Caoutchouc', 'Capote', 'Utiliser'] },
  { category: 'adult', word: 'FÉTICHE',            forbidden: ['Objet', 'Désir', 'Spécial', 'Fixation', 'Attirance'] },
  { category: 'adult', word: 'COCU',               forbidden: ['Trompé', 'Tromper', 'Couple', 'Cornes', 'Adultère'] },
  { category: 'adult', word: 'SÉDUCTEUR',          forbidden: ['Charme', 'Draguer', 'Don Juan', 'Attirer', 'Flirt'] },
  { category: 'adult', word: 'SEXTOY',             forbidden: ['Objet', 'Plaisir', 'Intime', 'Vibrer', 'Corps'] },
  { category: 'adult', word: 'SEXTING',            forbidden: ['Message', 'Photo', 'Téléphone', 'Intime', 'Envoyer'] },
  { category: 'adult', word: 'ONE-NIGHT STAND',    forbidden: ['Nuit', 'Rencontre', 'Aventure', 'Coucher', 'Lendemain'] },
  { category: 'adult', word: 'ORGASME',            forbidden: ['Plaisir', 'Culminer', 'Corps', 'Jouir', 'Sommet'] },
  { category: 'adult', word: 'LIBERTINAGE',        forbidden: ['Liberté', 'Relations', 'Ouvert', 'Partenaires', 'Couple'] },
  { category: 'adult', word: 'MAÎTRESSE',          forbidden: ['Secret', 'Relation', 'Couple', 'Femme', 'Amant'] },
  { category: 'adult', word: 'BDSM',               forbidden: ['Dominant', 'Soumis', 'Attacher', 'Fouet', 'Jeu'] },
  { category: 'adult', word: 'EXHIBITIONNISTE',    forbidden: ['Montrer', 'Nu', 'Public', 'Corps', 'Dévoiler'] },
  { category: 'adult', word: 'FLIRT',              forbidden: ['Séduire', 'Draguer', 'Regard', 'Sourire', 'Romantique'] },
  { category: 'adult', word: 'ÉROTIQUE',           forbidden: ['Sensuel', 'Désir', 'Film', 'Roman', 'Charnel'] },
  { category: 'adult', word: 'POLE DANCE',         forbidden: ['Barre', 'Danser', 'Club', 'Tourner', 'Acrobatie'] },
  { category: 'adult', word: 'PLAN À TROIS',       forbidden: ['Trois', 'Personnes', 'Ensemble', 'Couple', 'Partager'] },
  { category: 'adult', word: 'ZONE ÉROGÈNE',       forbidden: ['Sensible', 'Corps', 'Plaisir', 'Toucher', 'Stimuler'] },
  { category: 'adult', word: 'VIBROMASSEUR',       forbidden: ['Vibrer', 'Plaisir', 'Intime', 'Masseur', 'Corps'] },
  { category: 'adult', word: 'NUDISTE',            forbidden: ['Nu', 'Plage', 'Corps', 'Naturiste', 'Vêtement'] },
  { category: 'adult', word: 'SEX-SHOP',           forbidden: ['Boutique', 'Acheter', 'Érotique', 'Magasin', 'Adulte'] },
  { category: 'adult', word: 'FILM X',             forbidden: ['Porno', 'Adulte', 'Vidéo', 'Acteur', 'Intime'] },
  { category: 'adult', word: 'COQUIN',             forbidden: ['Malicieux', 'Espiègle', 'Osé', 'Grivois', 'Sage'] },
  { category: 'adult', word: 'DOMINANT',           forbidden: ['Soumis', 'Contrôle', 'Actif', 'Pouvoir', 'BDSM'] },
  { category: 'adult', word: 'SOUMIS',             forbidden: ['Dominant', 'Obéir', 'Passif', 'Servir', 'BDSM'] },
  { category: 'adult', word: 'TROMPER',            forbidden: ['Infidèle', 'Mensonge', 'Couple', 'Liaison', 'Cocu'] },
  { category: 'adult', word: 'SÉDUCTION',          forbidden: ['Séduire', 'Charme', 'Attirer', 'Draguer', 'Flirt'] },
  { category: 'adult', word: 'MASSAGE ÉROTIQUE',   forbidden: ['Massage', 'Corps', 'Huile', 'Mains', 'Détente'] },
  { category: 'adult', word: 'DÉSHABILLER',        forbidden: ['Vêtements', 'Nu', 'Enlever', 'Corps', 'Retirer'] },
  { category: 'adult', word: 'NUIT TORRIDE',       forbidden: ['Nuit', 'Chaud', 'Passionné', 'Intense', 'Couple'] },
  { category: 'adult', word: 'TENSION SEXUELLE',   forbidden: ['Attirance', 'Regard', 'Désir', 'Entre', 'Non-dit'] },
  { category: 'adult', word: 'PRÉLIMINAIRES',      forbidden: ['Avant', 'Caresser', 'Intimité', 'Commencer', 'Jeu'] },
  { category: 'adult', word: 'GÉMISSEMENT',        forbidden: ['Son', 'Bruit', 'Plaisir', 'Crier', 'Exprimer'] },
  { category: 'adult', word: 'LOVE HOTEL',         forbidden: ['Hôtel', 'Chambre', 'Intime', 'Nuit', 'Japon'] },
  { category: 'adult', word: 'INFIDÈLE',           forbidden: ['Tromper', 'Couple', 'Liaison', 'Adultère', 'Secret'] },
  { category: 'adult', word: 'PORNO',              forbidden: ['Film', 'Adulte', 'X', 'Acteur', 'Vidéo'] },
];

const _usedNormal = new Set();
const _usedAdult  = new Set();

export function getMotDePasseCards(count, category = 'normal') {
  const isAdult = category === 'adult';
  const used = isAdult ? _usedAdult : _usedNormal;
  const pool = MOT_DE_PASSE_CARDS
    .map((c, i) => ({ ...c, _i: i }))
    .filter(c => isAdult ? c.category === 'adult' : c.category !== 'adult');

  let available = pool.filter(c => !used.has(c._i));
  if (available.length < count) {
    used.clear();
    available = pool;
  }
  const selected = shuffle([...available]).slice(0, Math.min(count, available.length));
  selected.forEach(c => used.add(c._i));
  return selected;
}
