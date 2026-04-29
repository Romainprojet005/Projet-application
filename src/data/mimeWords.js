export const mimeCategories = {
  animaux: {
    label: '🐘 Animaux',
    words: ['chat', 'chien', 'éléphant', 'girafe', 'pingouin', 'crocodile', 'papillon', 'grenouille', 'lion', 'kangourou', 'tortue', 'dauphin', 'singe', 'ours', 'cheval', 'requin', 'perroquet', 'lapin', 'hibou', 'zèbre'],
  },
  sports: {
    label: '⚽ Sports',
    words: ['football', 'natation', 'tennis', 'vélo', 'ski', 'boxe', 'golf', 'escalade', 'basket', 'volleyball', 'karaté', 'gym', 'surf', 'judo', 'plongée', 'aviron', 'patin à glace', 'yoga', 'tir à l\'arc', 'lutte'],
  },
  actions: {
    label: '🏃 Actions',
    words: ['dormir', 'courir', 'manger', 'danser', 'cuisiner', 'pleurer', 'rire', 'peindre', 'conduire', 'photographier', 'chanter', 'lire', 'écrire', 'grimper', 'nager', 'sauter', 'skier', 'pêcher', 'tricoter', 'jardiner'],
  },
  metiers: {
    label: '👷 Métiers',
    words: ['pompier', 'médecin', 'cuisinier', 'policier', 'professeur', 'astronaute', 'pirate', 'magicien', 'pilote', 'dentiste', 'vétérinaire', 'acteur', 'plombier', 'architecte', 'boulanger', 'coiffeur', 'mécanicien', 'chirurgien', 'détective', 'cowboy'],
  },
  objets: {
    label: '📱 Objets',
    words: ['téléphone', 'parapluie', 'aspirateur', 'guitare', 'jumelles', 'raquette', 'sèche-cheveux', 'tondeuse', 'télévision', 'microscope', 'accordéon', 'trompette', 'télescope', 'haltères', 'kayak', 'skate', 'trottinette', 'marteau', 'scie', 'balai'],
  },
  films: {
    label: '🎬 Films & Séries',
    words: ['Titanic', 'Star Wars', 'Matrix', 'Avengers', 'Toy Story', 'Harry Potter', 'Le Lion Roi', 'Shrek', 'Jurassic Park', 'Batman', 'Spider-Man', 'La Reine des Neiges', 'Minions', 'Avatar', 'Inception', 'Intouchables', 'Astérix', 'Aladdin', 'Pocahontas', 'Mulan'],
  },
};

const ALL_WORDS = Object.values(mimeCategories).flatMap(c => c.words);
const usedWords = new Set();

export function pickWord(category = null) {
  const pool = category ? mimeCategories[category]?.words ?? ALL_WORDS : ALL_WORDS;
  const available = pool.filter(w => !usedWords.has(w));
  const source = available.length > 0 ? available : pool;
  const word = source[Math.floor(Math.random() * source.length)];
  usedWords.add(word);
  if (usedWords.size > ALL_WORDS.length * 0.8) usedWords.clear();
  return word;
}
