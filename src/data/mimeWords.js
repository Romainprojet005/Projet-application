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

const ADULT_WORDS = [
  // Sexy / séduction
  'strip-tease', 'lap dance', 'pole dance', 'twerker', 'séduire',
  'draguer', 'embrasser passionnément', 'faire l\'amour', 'orgasme',
  'massage sensuel', 'danser sexy', 'flirter', 'se déshabiller',
  'simuler un orgasme', 'faire du teasing', 'onduler du bassin',
  'sucer un glaçon', 'manger une banane lentement', 'donner une fessée',
  'porter des menottes', 'faire du charme irrésistible', 'nuit torride',
  'regarder quelqu\'un de haut en bas', 'faire un clin d\'œil suggestif',
  'caresser sensuellement', 'regarder un film adulte', 'envoyer des messages coquins',
  'se regarder nu dans le miroir', 'danser nu', 'faire semblant de dormir pour éviter',
  'déboutonner une chemise lentement', 'retirer ses chaussettes de façon sexy',
  'faire une danse du ventre', 'imiter une actrice de film X',
  'faire le beau gosse', 'se coiffer de manière séduisante',
  // Sexy / séduction — nouveaux
  'lécher une glace de manière suggestive', 'faire des yeux doux en mangeant',
  'souffler dans l\'oreille de quelqu\'un', 'mordre sa lèvre en regardant',
  'déboutonner son pantalon lentement', 'retirer sa ceinture façon whip',
  'faire semblant de recevoir un massage', 'mimer un baiser langoureux',
  'faire une danse de séduction autour d\'une chaise', 'se baisser pour ramasser en exagérant',
  'mimer le caméraman d\'un film X', 'poser comme une pin-up des années 50',
  'faire le mime du yoga sexy', 'imiter une scène de Dirty Dancing',
  'faire le pont de façon suggestive', 'mimer l\'acteur porno qui sonne à la porte',
  'faire une pose de magazine adulte', 'imiter une scène de 50 nuances de Grey',
  'se mettre en position de sphinx', 'faire le mime du plombier qui séduit',
  'imiter une sirène qui chante pour attirer les marins', 'faire semblant d\'attacher quelqu\'un',
  'mimer quelqu\'un qui s\'habille très lentement le matin', 'faire le mime du selfie sexy',
  'poser en statue grecque dénudée', 'imiter une danseuse de cabaret',
  'faire le mime de l\'essuie-glace avec les hanches', 'imiter une scène de tango argentin',
  'faire semblant de lire un livre érotique en rougissant', 'mimer un roman photo de charme',
  // Crados / corps
  'gueule de bois', 'vomir', 'ronfler', 'péter', 'roter',
  'se gratter les fesses', 'faire pipi debout', 'uriner contre un arbre',
  'vomir dans les toilettes', 'se gratter l\'entrejambe', 'renifler une chaussette',
  'se moucher bruyamment', 'se curer le nez', 'cracher par terre',
  'se tenir le ventre en courant aux toilettes', 'scorser ses pieds',
  'peter dans son lit', 'ronfler comme un tracteur', 'baver en dormant',
  // Crados / corps — nouveaux
  'se gratter partout en même temps', 'renifler ses propres aisselles',
  'essayer de sentir si ses chaussettes puent', 'se curer les oreilles avec satisfaction',
  'se ronger les ongles jusqu\'au sang', 'péter dans un canapé et soulever une fesse',
  'se gratter le dos contre un mur comme un ours', 'cracher un noyau de cerise très loin',
  'se moucher dans un t-shirt', 'lâcher un rot digne d\'un champion',
  'faire pipi dans une bouteille en voiture', 'chercher un poil dans sa bouche après manger',
  'enlever une tique', 'exprimer un bouton avec satisfaction', 'arracher un poil incarné',
  'se peser et faire une grimace de désespoir', 'essayer de sentir son propre souffle',
  'tirer une épine du pied d\'un autre', 'compter ses poils de bras',
  'souffler dans un sac plastique pour mesurer son haleine', 'faire semblant d\'avoir des poux',
  'se gratter une plaque d\'eczéma', 'renifler ses doigts après manger des chips',
  'arracher un sparadrap sur des poils', 'se couper les ongles de pieds tordu',
  'faire semblant de déféquer en faisant des bruits appropriés',
  // Alcool / soirée
  'être ivre mort', 'boire jusqu\'à tomber', 's\'endormir ivre',
  'faire le tour de piste ivre', 'trinquer et tout renverser',
  'essayer de danser ivre', 'appeler son ex ivre', 'pleurer en buvant',
  'raconter sa vie à un inconnu au bar', 'perdre ses affaires en boîte',
  'faire la queue pour les toilettes en urgence', 'danser sur une table',
  // Alcool / soirée — nouveaux
  'faire un saut sur le bar et tomber', 'renverser son verre sur quelqu\'un',
  'essayer de retrouver son chemin ivre de nuit', 'vomir dans un taxi',
  'draguer quelqu\'un et se rendre compte qu\'il est marié', 'essayer de mettre sa clé dans la serrure ivre',
  'danser sur la chanson de la soirée les yeux fermés', 'commander un kebab géant à 4h du matin',
  'se battre avec le distributeur de billets ivre', 'envoyer un message honteux à l\'ex la nuit',
  'crier "je vous aime tous" à des inconnus dans la rue', 'faire la sieste dans les vestiaires d\'une boîte',
  'essayer de marcher droit sous le regard d\'un flic', 'monter sur scène sans être invité',
  'faire un discours de mariage totalement ivre', 'chanter karaoké en hurlant les mauvaises paroles',
  'faire des shots de tequila avec la langue de sel sur le bras',
  'essayer de retrouver sa voiture sur un parking géant complètement ivre',
  'tomber dans la piscine habillé à une pool party', 'vomir dans ses chaussures et les remettre',
  'se réveiller avec un marqueur sur le visage après s\'être endormi en fête',
  'essayer de danser le moonwalk sur un sol glissant', 'perdre son pantalon en dansant',
  'trinquer et casser son verre sur le visage du voisin', 'faire semblant d\'être sobre devant ses parents',
  // Situations gênantes
  'accoucher', 'passer une mammographie', 'faire une prise de sang en ayant peur',
  'trébucher devant tout le monde', 'se prendre la porte en verre',
  'glisser sur du verglas', 'se coincer la fermeture éclair',
  'essayer d\'entrer dans un jean trop petit', 'rater son slip',
  'surprendre ses parents', 'chercher ses clés dans les mauvaises poches',
  // Situations gênantes — nouvelles
  'péter lors d\'un entretien d\'embauche', 'avoir le hoquet pendant un discours important',
  'glisser sur une peau de banane en public', 'confondre quelqu\'un avec quelqu\'un d\'autre',
  'appeler son prof "maman" devant la classe', 'rater une marche dans un escalier bondé',
  'essayer de traverser une rue et rater le timing', 'se cogner la tête dans une vitre propre',
  'perdre son maillot de bain dans les vagues', 'répondre à voix haute à un message audio en public',
  'appeler son ex par erreur au lieu de son nouveau copain', 'envoyer un message intime au mauvais contact',
  'se lever d\'une chaise avec des bruits de pet involontaires', 'faire semblant de connaître quelqu\'un qui ne vous reconnaît pas',
  'se retrouver à parler seul en croyant avoir des écouteurs', 'essayer de rentrer dans des toilettes occupées',
  'chercher son téléphone pendant qu\'on téléphone dessus', 'réaliser qu\'on a sa braguette ouverte depuis des heures',
  'découvrir qu\'on a une tâche sur sa chemise après toute la journée de boulot',
  'danser seul pensant que personne ne regarde et se faire filmer', 'essayer de parler la bouche pleine et postillonner',
  'péter dans un ascenseur et ne pas avoir le temps de sortir', 'tomber en essayant de monter sur une table',
  'faire semblant de savoir utiliser des baguettes', 'essayer de mimer quelqu\'un et ne réussir qu\'à ressembler à un idiot',
  'recevoir un texto gênant de ses parents en public', 'se retrouver sans PQ dans des toilettes publiques',
  'rater un high-five en public', 'avoir son téléphone qui lit à voix haute un message coquin',
  // Corps humain embarrassant
  'avoir une érection en public dans un maillot de bain', 'rater son dribble avec la bouche en mangeant',
  'essayer de retenir un pet pendant un câlin', 'tétaniser ses hanches en essayant de danser',
  'faire une grimace involontaire pendant une photo', 'avoir les larmes aux yeux en faisant un câlin',
  'essayer de se gratter le dos avec un stylo', 'avoir les yeux plus grands que le ventre à un buffet',
  'essayer de dissimuler une tache de transpiration', 'faire semblant d\'éternuer et se moucher sur quelqu\'un',
  // Scènes de vie adulte explicites
  'essayer de faire l\'amour silencieusement quand les parents sont là',
  'faire semblant de rien quand quelqu\'un entre sans frapper',
  'cacher des objets quand les parents arrivent à l\'improviste',
  'faire le mime d\'une position du Kama Sutra impossible',
  'se retrouver à poil chez l\'ex quand ses parents débarquent',
  'essayer de s\'habiller rapidement quand quelqu\'un sonne',
  'regarder un film adulte et changer de fenêtre en urgence',
  'expliquer à ses parents ce qu\'est OnlyFans',
  'montrer comment utiliser une application de rencontres',
  'expliquer à ses grands-parents ce qu\'est un sextoy',
  'faire semblant de rien quand les voisins font du bruit la nuit',
  'mimer comment utiliser correctement un préservatif',
  'découvrir le casier de quelqu\'un avec un contenu surprenant',
  'faire le mime du gynécologue très professionnel',
  'imiter quelqu\'un qui fait du speed dating',
  'mimer une scène de salle de gym avec des exercices suggestifs',
  'faire le mime du massage qui devient incontrôlable',
  'imiter quelqu\'un qui essaie des sex toys dans un magasin',
  'faire semblant d\'être un acteur porno qui rate son audition',
  'mimer une scène de sauna mixte gêné',
];

const ALL_WORDS = Object.values(mimeCategories).flatMap(c => c.words);
const usedWords = new Set();
const usedAdultWords = new Set();

export function pickWord(category = null) {
  if (category === 'adulte') {
    const available = ADULT_WORDS.filter(w => !usedAdultWords.has(w));
    const source = available.length > 0 ? available : ADULT_WORDS;
    const word = source[Math.floor(Math.random() * source.length)];
    usedAdultWords.add(word);
    if (usedAdultWords.size > ADULT_WORDS.length * 0.8) usedAdultWords.clear();
    return word;
  }
  const pool = category ? mimeCategories[category]?.words ?? ALL_WORDS : ALL_WORDS;
  const available = pool.filter(w => !usedWords.has(w));
  const source = available.length > 0 ? available : pool;
  const word = source[Math.floor(Math.random() * source.length)];
  usedWords.add(word);
  if (usedWords.size > ALL_WORDS.length * 0.8) usedWords.clear();
  return word;
}
