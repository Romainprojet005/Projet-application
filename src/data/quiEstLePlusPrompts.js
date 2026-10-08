export const QUELPLUS_CATEGORIES = [
  { id: 'all', name: 'Tous', emoji: '🎲', color: '#F59E0B' },
  { id: 'soiree', name: 'Soirée', emoji: '🍺', color: '#F59E0B' },
  { id: 'perso', name: 'Perso', emoji: '😏', color: '#EC4899' },
  { id: 'courage', name: 'Courage', emoji: '🔥', color: '#EF4444' },
  { id: 'hot', name: 'Hot 🔞', emoji: '🌶️', color: '#DC2626' },
  // Catégorie explicite : jamais incluse dans « Tous », il faut la choisir exprès
  { id: 'tres_hot', name: 'Très hot 🔞', emoji: '🔥', color: '#B91C1C', explicit: true,
    joker: 'Le joueur désigné peut nommer une autre personne à sa place si cette personne accepte de boire un shot.' },
];

export const QUELPLUS_PROMPTS = [
  // Soirée
  { id: 1, text: 'susceptible de finir la soirée sous la table', category: 'soiree' },
  { id: 2, text: 'le premier à s\'endormir sur le canapé', category: 'soiree' },
  { id: 3, text: 'susceptible de proposer un shot de trop', category: 'soiree' },
  { id: 4, text: 'susceptible de danser sur la table', category: 'soiree' },
  { id: 5, text: 'le plus susceptible de lancer un karaoké non désiré', category: 'soiree' },
  { id: 6, text: 'susceptible de commander une pizza à 3h du matin', category: 'soiree' },
  { id: 7, text: 'le plus susceptible de perdre son téléphone en soirée', category: 'soiree' },
  { id: 8, text: 'susceptible de danser avec un parfait inconnu', category: 'soiree' },
  { id: 9, text: 'le plus susceptible de faire un discours émouvant après deux verres', category: 'soiree' },
  { id: 10, text: 'susceptible de finir la soirée dans un kebab', category: 'soiree' },
  { id: 11, text: 'le plus susceptible de mixer les alcools sans le faire exprès', category: 'soiree' },
  { id: 12, text: 'susceptible de pleurer en soirée sans raison valable', category: 'soiree' },
  { id: 13, text: 'le plus susceptible de retrouver quelqu\'un de son passé en soirée', category: 'soiree' },
  { id: 14, text: 'susceptible d\'appeler son ex après minuit', category: 'soiree' },
  { id: 15, text: 'le plus susceptible de se perdre en rentrant chez lui', category: 'soiree' },
  { id: 16, text: 'susceptible de raconter la même histoire trois fois dans la nuit', category: 'soiree' },
  { id: 17, text: 'le plus susceptible de voler la bouteille de la cuisine', category: 'soiree' },
  { id: 18, text: 'susceptible de faire un selfie avec tout le monde à la soirée', category: 'soiree' },
  { id: 19, text: 'le plus susceptible de se retrouver à faire la vaisselle à 2h du mat', category: 'soiree' },
  { id: 20, text: 'susceptible de proposer un jeu de soirée chelou', category: 'soiree' },
  { id: 21, text: 'le plus susceptible de rentrer à pied peu importe la distance', category: 'soiree' },
  { id: 22, text: 'susceptible de draguer le/la DJ', category: 'soiree' },
  { id: 23, text: 'le plus susceptible de tomber en dansant', category: 'soiree' },
  { id: 24, text: 'susceptible de commander à boire pour tout le groupe sans demander', category: 'soiree' },

  // Perso
  { id: 25, text: 'le plus susceptible de mentir pour éviter une sortie', category: 'perso' },
  { id: 26, text: 'le plus difficile à réveiller le matin', category: 'perso' },
  { id: 27, text: 'susceptible de stalker un ex sur les réseaux', category: 'perso' },
  { id: 28, text: 'le plus susceptible d\'annuler des plans au dernier moment', category: 'perso' },
  { id: 29, text: 'susceptible de passer une heure à choisir quoi regarder sur Netflix', category: 'perso' },
  { id: 30, text: 'le plus susceptible de tomber amoureux du premier venu', category: 'perso' },
  { id: 31, text: 'susceptible de dépenser tout son salaire le premier jour du mois', category: 'perso' },
  { id: 32, text: 'le plus susceptible de dormir avec son téléphone dans la main', category: 'perso' },
  { id: 33, text: 'susceptible de manger les restes des autres sans demander', category: 'perso' },
  { id: 34, text: 'le plus susceptible d\'avoir une collection de trucs inutiles chez lui', category: 'perso' },
  { id: 35, text: 'susceptible de pleurer devant un film de dessin animé', category: 'perso' },
  { id: 36, text: 'le plus susceptible de mentir sur son âge', category: 'perso' },
  { id: 37, text: 'susceptible d\'envoyer un message puis de le regretter immédiatement', category: 'perso' },
  { id: 38, text: 'le plus susceptible d\'avoir une double vie secrète', category: 'perso' },
  { id: 39, text: 'susceptible de googler les symptômes d\'une maladie grave pour un bobo', category: 'perso' },
  { id: 40, text: 'le plus susceptible de parler à ses plantes ou à ses animaux', category: 'perso' },
  { id: 41, text: 'susceptible de rejeter la faute sur quelqu\'un d\'autre', category: 'perso' },
  { id: 42, text: 'le plus susceptible d\'avoir une liste de to-do qu\'il ne fait jamais', category: 'perso' },
  { id: 43, text: 'susceptible de rater un rendez-vous important par excès de flemme', category: 'perso' },
  { id: 44, text: 'le plus susceptible d\'envoyer un vocal de 5 minutes au lieu d\'un message', category: 'perso' },
  { id: 45, text: 'susceptible de finir les chips tout seul pendant un film', category: 'perso' },
  { id: 46, text: 'le plus susceptible de liker accidentellement une vieille photo d\'un inconnu', category: 'perso' },
  { id: 47, text: 'susceptible de tout remettre au lendemain sans exception', category: 'perso' },
  { id: 48, text: 'le plus susceptible d\'avoir un crush sur un personnage fictif', category: 'perso' },
  { id: 71, text: 'celui qui aurait la meilleure tête s\'il était chauve', category: 'perso' },

  // Courage
  { id: 49, text: 'susceptible de parler à un inconnu dans la rue pour rigoler', category: 'courage' },
  { id: 50, text: 'capable de faire le tour du pâté de maisons en caleçon', category: 'courage' },
  { id: 51, text: 'susceptible de sauter dans une fontaine publique en plein été', category: 'courage' },
  { id: 52, text: 'capable de draguer quelqu\'un avec une blague nulle et d\'assumer', category: 'courage' },
  { id: 53, text: 'susceptible de chanter a cappella devant tout le groupe sans rougir', category: 'courage' },
  { id: 54, text: 'capable de manger le piment le plus fort du menu sans broncher', category: 'courage' },
  { id: 55, text: 'susceptible de faire un canular téléphonique à quelqu\'un du groupe', category: 'courage' },
  { id: 56, text: 'capable de faire 10 pompes maintenant même ivre', category: 'courage' },
  { id: 57, text: 'susceptible de demander une réduction à la caisse juste pour le fun', category: 'courage' },
  { id: 58, text: 'capable de tenir une conversation sérieuse avec quelqu\'un qu\'il n\'a jamais vu', category: 'courage' },
  { id: 59, text: 'susceptible de poster une photo gênante de lui sur ses réseaux ce soir', category: 'courage' },
  { id: 60, text: 'capable de mimer un animal pendant une minute en public', category: 'courage' },
  { id: 61, text: 'susceptible de confesser un secret ce soir sans qu\'on le lui demande', category: 'courage' },
  { id: 62, text: 'capable de tenir un regard fixe avec un inconnu jusqu\'à ce qu\'il détourne les yeux', category: 'courage' },
  { id: 63, text: 'susceptible de sonner chez un voisin pour lui demander du sel à minuit', category: 'courage' },
  { id: 64, text: 'capable de faire semblant d\'être un guide touristique pour des étrangers', category: 'courage' },
  { id: 65, text: 'susceptible de traverser la rue en courant en criant le prénom de quelqu\'un', category: 'courage' },
  { id: 66, text: 'capable de commander à manger avec un faux accent toute la soirée', category: 'courage' },
  { id: 67, text: 'susceptible de faire un défi physique absurde sans poser de question', category: 'courage' },
  { id: 68, text: 'capable de réciter un poème improvisé en moins de 30 secondes', category: 'courage' },
  { id: 69, text: 'susceptible de demander le numéro d\'un inconnu juste pour prouver qu\'il peut', category: 'courage' },
  { id: 70, text: 'capable de faire une entrée remarquée dans n\'importe quelle pièce', category: 'courage' },

  // Hot 🔞
  { id: 72, text: 'le plus susceptible de draguer quelqu\'un dans cette pièce ce soir', category: 'hot' },
  { id: 73, text: 'susceptible d\'avoir déjà eu un coup de cœur pour un(e) ami(e) du groupe', category: 'hot' },
  { id: 74, text: 'le plus susceptible de swiper à droite sur tout le monde par flemme', category: 'hot' },
  { id: 75, text: 'susceptible d\'avoir envoyé un texto coquin à la mauvaise personne', category: 'hot' },
  { id: 76, text: 'le plus susceptible de proposer un jeu à gages qui finit mal', category: 'hot' },
  { id: 77, text: 'susceptible d\'avoir déjà menti sur son nombre de partenaires', category: 'hot' },
  { id: 78, text: 'le plus susceptible de recraquer sur son ex après trois verres', category: 'hot' },
  { id: 79, text: 'susceptible d\'avoir un fantasme qu\'il n\'assumerait jamais devant ses parents', category: 'hot' },
  { id: 80, text: 'le plus susceptible d\'embrasser quelqu\'un pour un défi', category: 'hot' },
  { id: 81, text: 'susceptible d\'avoir déjà simulé un coup de foudre pour éviter d\'être seul(e)', category: 'hot' },
  { id: 82, text: 'le plus susceptible de garder une conversation coquine dans ses messages', category: 'hot' },
  { id: 83, text: 'susceptible de proposer un strip-poker si personne ne l\'arrête', category: 'hot' },
  { id: 84, text: 'le plus susceptible d\'avoir un plan cul régulier sans l\'assumer', category: 'hot' },
  { id: 85, text: 'susceptible de charmer n\'importe qui pour obtenir une tournée gratuite', category: 'hot' },
  { id: 86, text: 'le plus susceptible d\'avoir déjà trompé quelqu\'un ou d\'y avoir pensé sérieusement', category: 'hot' },
  { id: 87, text: 'susceptible de raconter ses histoires de cul sans aucune gêne', category: 'hot' },
  { id: 88, text: 'le plus susceptible de coucher le premier soir sans hésiter', category: 'hot' },
  { id: 89, text: 'susceptible d\'avoir déjà eu un plan à trois ou d\'y avoir pensé', category: 'hot' },
  { id: 90, text: 'le plus susceptible de flirter avec quelqu\'un du groupe ce soir', category: 'hot' },
  { id: 91, text: 'susceptible d\'avoir le compte de rencontre le plus actif', category: 'hot' },
  { id: 92, text: 'le plus susceptible de faire durer un date juste pour l\'addition offerte', category: 'hot' },
  { id: 93, text: 'susceptible d\'avoir déjà eu une aventure d\'un soir dont il/elle ne regrette rien', category: 'hot' },
  { id: 94, text: 'le plus susceptible de proposer un jeu où il faut se déshabiller', category: 'hot' },
  { id: 95, text: 'susceptible d\'avoir un dossier photos qu\'il/elle ne montrerait jamais', category: 'hot' },
  { id: 96, text: 'le plus susceptible de séduire pour gagner un pari stupide', category: 'hot' },
  { id: 97, text: 'susceptible d\'avoir déjà couché avec quelqu\'un pour de mauvaises raisons', category: 'hot' },
  { id: 98, text: 'le plus susceptible de rougir si on lisait ses messages à voix haute', category: 'hot' },
  { id: 99, text: 'susceptible d\'avoir un crush actuel qu\'il/elle cache à tout le monde', category: 'hot' },
  { id: 100, text: 'le plus susceptible de proposer un french kiss pour un gage', category: 'hot' },
  { id: 101, text: 'susceptible d\'avoir déjà trahi un secret intime d\'un(e) ex par vengeance', category: 'hot' },

  // ── TRÈS HOT 🔞 ──
  { id: 201, text: 'le plus susceptible de caresser l\'autre sous la table en plein dîner de famille', category: 'tres_hot' },
  { id: 202, text: 'le plus susceptible de faire l\'amour dans les toilettes d\'un avion', category: 'tres_hot' },
  { id: 203, text: 'le plus susceptible d\'embrasser passionnément un inconnu ce soir', category: 'tres_hot' },
  { id: 204, text: 'le plus susceptible de se faire sucer/sucer quelqu\'un en voiture en conduisant', category: 'tres_hot' },
  { id: 205, text: 'le plus susceptible de faire un striptease complet pour des étrangers', category: 'tres_hot' },
  { id: 206, text: 'le plus susceptible d\'avoir des relations sur son lieu de travail', category: 'tres_hot' },
  { id: 207, text: 'le plus susceptible de porter un sex-toy en public et de le laisser contrôler par quelqu\'un d\'autre', category: 'tres_hot' },
  { id: 208, text: 'le plus susceptible de faire l\'amour avec les menottes attachées au lit', category: 'tres_hot' },
  { id: 209, text: 'le plus susceptible de se masturber en pensant à quelqu\'un du groupe', category: 'tres_hot' },
  { id: 210, text: 'le plus susceptible de faire un plan à trois avec deux inconnus', category: 'tres_hot' },
  { id: 211, text: 'le plus susceptible de faire l\'amour pendant les règles sans aucune gêne', category: 'tres_hot' },
  { id: 212, text: 'le plus susceptible d\'essayer la double pénétration', category: 'tres_hot' },
  { id: 213, text: 'le plus susceptible de faire l\'amour dans un club échangiste', category: 'tres_hot' },
  { id: 214, text: 'le plus susceptible de se faire photographier/filmer pendant l\'acte', category: 'tres_hot' },
  { id: 215, text: 'le plus susceptible d\'avoir une aventure avec son/sa supérieur(e) hiérarchique', category: 'tres_hot' },
  { id: 216, text: 'le plus susceptible de faire l\'amour avec quelqu\'un du même sexe pour la première fois', category: 'tres_hot' },
  { id: 217, text: 'le plus susceptible de pratiquer le BDSM extrême (cravache, cire, etc.)', category: 'tres_hot' },
  { id: 218, text: 'le plus susceptible d\'avoir des relations avec quelqu\'un de déjà en couple ici', category: 'tres_hot' },
  { id: 219, text: 'le plus susceptible de faire l\'amour en pleine nature avec le risque d\'être vu', category: 'tres_hot' },
  { id: 220, text: 'le plus susceptible d\'essayer la sodomie ce soir si l\'occasion se présente', category: 'tres_hot' },
];

const EXPLICIT_CATS = new Set(QUELPLUS_CATEGORIES.filter(c => c.explicit).map(c => c.id));

export function selectPrompts(count, categoryId) {
  const filtered =
    categoryId === 'all'
      ? QUELPLUS_PROMPTS.filter((p) => !EXPLICIT_CATS.has(p.category))
      : QUELPLUS_PROMPTS.filter((p) => p.category === categoryId);

  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, count);
}

let _tripotesUsedIds = new Set();

export function pickPromptAndDecoys(categoryId = 'all') {
  const pool = categoryId === 'all'
    ? QUELPLUS_PROMPTS.filter(p => !EXPLICIT_CATS.has(p.category))
    : QUELPLUS_PROMPTS.filter(p => p.category === categoryId);

  let available = pool.filter(p => !_tripotesUsedIds.has(p.id));
  if (available.length === 0) {
    _tripotesUsedIds = new Set();
    available = [...pool];
  }

  const prompt = available[Math.floor(Math.random() * available.length)];
  _tripotesUsedIds.add(prompt.id);

  const sameCat = pool.filter(p => p.category === prompt.category && p.id !== prompt.id);
  const decoys  = [...sameCat].sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [prompt, ...decoys].sort(() => Math.random() - 0.5);

  return { prompt, options };
}
