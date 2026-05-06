export const QUELPLUS_CATEGORIES = [
  { id: 'all', name: 'Tous', emoji: '🎲', color: '#F59E0B' },
  { id: 'soiree', name: 'Soirée', emoji: '🍺', color: '#F59E0B' },
  { id: 'perso', name: 'Perso', emoji: '😏', color: '#EC4899' },
  { id: 'courage', name: 'Courage', emoji: '🔥', color: '#EF4444' },
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
];

export function selectPrompts(count, categoryId) {
  const filtered =
    categoryId === 'all'
      ? [...QUELPLUS_PROMPTS]
      : QUELPLUS_PROMPTS.filter((p) => p.category === categoryId);

  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, count);
}
