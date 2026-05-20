export const REGLE_CATEGORIES = [
  { id: 'parole',       name: 'Parole',       emoji: '🗣️', color: '#8B5CF6' },
  { id: 'geste',        name: 'Geste',        emoji: '🤝', color: '#10B981' },
  { id: 'mots',         name: 'Mots secrets', emoji: '🔤', color: '#F59E0B' },
  { id: 'comportement', name: 'Comportement', emoji: '🎭', color: '#EC4899' },
];

const ALL_RULES = [
  // PAROLE
  { id: 1,  cat: 'parole', text: 'Terminer chaque réponse par "tu vois ce que je veux dire ?"' },
  { id: 2,  cat: 'parole', text: 'Commencer chaque réponse par "En fait..."' },
  { id: 3,  cat: 'parole', text: 'Parler à la 3e personne (remplacer "je" par son propre prénom)' },
  { id: 4,  cat: 'parole', text: 'Terminer chaque réponse par une question' },
  { id: 5,  cat: 'parole', text: 'Faire rimer le dernier mot de chaque réponse' },
  { id: 6,  cat: 'parole', text: 'Inclure le mot "absolument" dans chaque réponse' },
  { id: 7,  cat: 'parole', text: 'Ne jamais utiliser le mot "je"' },
  { id: 8,  cat: 'parole', text: 'Terminer chaque phrase par "...et j\'assume !"' },
  { id: 9,  cat: 'parole', text: 'Commencer chaque réponse par "Wow, quelle question !"' },
  { id: 10, cat: 'parole', text: 'Inclure une couleur dans chaque réponse' },
  { id: 11, cat: 'parole', text: 'Répéter le dernier mot de la question avant de répondre' },
  { id: 12, cat: 'parole', text: 'Terminer chaque réponse par "...mais c\'est mon avis"' },
  { id: 13, cat: 'parole', text: 'Commencer chaque réponse par "C\'est une très bonne question..."' },
  { id: 14, cat: 'parole', text: 'Parler uniquement en chuchotant' },

  // GESTE
  { id: 15, cat: 'geste', text: 'Croiser les bras avant chaque réponse' },
  { id: 16, cat: 'geste', text: 'Pointer le plafond avec le doigt en parlant' },
  { id: 17, cat: 'geste', text: 'Hocher la tête de gauche à droite (non) même pour approuver' },
  { id: 18, cat: 'geste', text: 'Cligner des yeux deux fois avant de parler' },
  { id: 19, cat: 'geste', text: 'Sourire excessivement pendant toute la réponse' },
  { id: 20, cat: 'geste', text: 'Toucher son nez avant de parler' },
  { id: 21, cat: 'geste', text: 'Regarder le plafond en répondant (jamais la personne)' },
  { id: 22, cat: 'geste', text: 'Lever le pouce en l\'air avant chaque réponse' },
  { id: 23, cat: 'geste', text: 'Applaudir une fois avant de parler' },
  { id: 24, cat: 'geste', text: 'Mettre la main sur le cœur avant de répondre' },
  { id: 25, cat: 'geste', text: 'Se gratter la tête avant chaque réponse' },
  { id: 26, cat: 'geste', text: 'Pointer la personne qui a posé la question à la fin de la réponse' },
  { id: 27, cat: 'geste', text: 'Faire "OK" avec les doigts en commençant à répondre' },
  { id: 28, cat: 'geste', text: 'Se lever pour répondre, puis se rasseoir' },

  // MOTS SECRETS
  { id: 29, cat: 'mots', text: 'Inclure le nom d\'un animal dans chaque réponse' },
  { id: 30, cat: 'mots', text: 'Inclure un chiffre dans chaque réponse' },
  { id: 31, cat: 'mots', text: 'Mentionner un pays dans chaque réponse' },
  { id: 32, cat: 'mots', text: 'Inclure le nom d\'une célébrité dans chaque réponse' },
  { id: 33, cat: 'mots', text: 'Dire le nom d\'un aliment dans chaque réponse' },
  { id: 34, cat: 'mots', text: 'Utiliser un mot en anglais dans chaque réponse' },
  { id: 35, cat: 'mots', text: 'Mentionner une météo dans chaque réponse (soleil, pluie, neige…)' },
  { id: 36, cat: 'mots', text: 'Inclure une saison dans chaque réponse' },
  { id: 37, cat: 'mots', text: 'Dire le nom d\'un sport dans chaque réponse' },
  { id: 38, cat: 'mots', text: 'Inclure un prénom dans chaque réponse' },
  { id: 39, cat: 'mots', text: 'Mentionner un objet visible dans la pièce dans chaque réponse' },
  { id: 40, cat: 'mots', text: 'Inclure une émotion dans chaque réponse' },
  { id: 41, cat: 'mots', text: 'Dire le nom d\'une boisson dans chaque réponse' },
  { id: 42, cat: 'mots', text: 'Inclure un métier dans chaque réponse' },

  // COMPORTEMENT
  { id: 43, cat: 'comportement', text: 'Approuver avec enthousiasme chaque question avant de répondre' },
  { id: 44, cat: 'comportement', text: 'Faire une pause silencieuse de 3 secondes avant chaque réponse' },
  { id: 45, cat: 'comportement', text: 'Paraître surpris ou choqué par chaque question' },
  { id: 46, cat: 'comportement', text: 'Répondre toujours avec une métaphore ou comparaison' },
  { id: 47, cat: 'comportement', text: 'Faire semblant de consulter une note imaginaire avant de répondre' },
  { id: 48, cat: 'comportement', text: 'Compter sur ses doigts à chaque réponse' },
  { id: 49, cat: 'comportement', text: 'Parler beaucoup plus fort que d\'habitude' },
  { id: 50, cat: 'comportement', text: 'Répéter la question entière avant d\'y répondre' },
  { id: 51, cat: 'comportement', text: 'Soupirer profondément avant chaque réponse' },
  { id: 52, cat: 'comportement', text: 'Se tourner brièvement vers un autre joueur avant de répondre' },
  { id: 53, cat: 'comportement', text: 'Rire légèrement à la fin de chaque réponse' },
  { id: 54, cat: 'comportement', text: 'Toujours relier la réponse à son enfance' },
];

let _usedIds = new Set();

export function pickRuleAndDecoys() {
  let available = ALL_RULES.filter(r => !_usedIds.has(r.id));
  if (available.length === 0) {
    _usedIds = new Set();
    available = [...ALL_RULES];
  }

  const rule = available[Math.floor(Math.random() * available.length)];
  _usedIds.add(rule.id);

  const sameCat = ALL_RULES.filter(r => r.cat === rule.cat && r.id !== rule.id);
  const decoys  = [...sameCat].sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [rule, ...decoys].sort(() => Math.random() - 0.5);

  return { rule, options };
}
