export const VOTE_CATEGORIES = [
  { id: 'all',        name: 'Tout mélangé',    emoji: '🎲', color: '#6366F1' },
  { id: 'tuPreferes', name: 'Tu préfères',      emoji: '🤔', color: '#F43F5E' },
  { id: 'pourContre', name: 'Pour ou Contre',   emoji: '⚖️', color: '#F59E0B' },
  { id: 'cEstPlutot', name: "C'est plutôt...",  emoji: '🪞', color: '#06B6D4' },
  { id: 'debat',      name: 'Débat',            emoji: '🔥', color: '#EF4444' },
];

const QUESTIONS = {

  tuPreferes: [
    { id: 1,  q: 'Tu préfères…',                    a: '🍕  Pizza',           b: '🍣  Sushi'             },
    { id: 2,  q: 'Tu préfères…',                    a: '🌊  La mer',          b: '⛰️  La montagne'       },
    { id: 3,  q: 'Tu préfères…',                    a: '🐕  Chien',           b: '🐈  Chat'              },
    { id: 4,  q: 'Tu préfères…',                    a: '☀️  L\'été',          b: '❄️  L\'hiver'          },
    { id: 5,  q: 'Tu préfères…',                    a: '🌅  Le matin',        b: '🌙  Le soir'           },
    { id: 6,  q: 'Tu préfères…',                    a: '🛋️  Netflix',        b: '🎬  Le cinéma'         },
    { id: 7,  q: 'Tu préfères…',                    a: '🏙️  La ville',       b: '🌿  La campagne'       },
    { id: 8,  q: 'Tu préfères…',                    a: '📖  Lire',            b: '🎥  Regarder un film'  },
    { id: 9,  q: 'Tu préfères…',                    a: '🧳  Voyager seul',    b: '👫  Voyager en groupe' },
    { id: 10, q: 'Tu préfères avoir le pouvoir de…',a: '👻  Être invisible',  b: '🦸  Voler'             },
    { id: 11, q: 'Tu préfères…',                    a: '⏮️  Remonter le passé',b: '🔮  Voir le futur'   },
    { id: 12, q: 'Tu préfères…',                    a: '🍫  Chocolat noir',   b: '🍬  Chocolat au lait'  },
    { id: 13, q: 'Tu préfères…',                    a: '🍭  Sucré',           b: '🧂  Salé'              },
    { id: 14, q: 'Tu préfères avoir…',              a: '🌍  Parler toutes les langues', b: '🎸  Jouer de tous les instruments' },
    { id: 15, q: 'Tu préfères…',                    a: '🔥  Le chaud',        b: '🧊  Le froid'          },
    { id: 16, q: 'Tu préfères…',                    a: '🏖️  Week-end à la mer', b: '🗼  Semaine à Paris' },
    { id: 17, q: 'Tu préfères avoir…',              a: '💰  Plus d\'argent',  b: '⏳  Plus de temps'     },
    { id: 18, q: 'Tu préfères…',                    a: '🤝  Peu d\'amis proches', b: '🎉  Beaucoup d\'amis' },
    { id: 19, q: 'Tu préfères…',                    a: '📱  Réseau social',   b: '📞  Appel téléphonique'},
    { id: 20, q: 'Tu préfères…',                    a: '🚗  Conduire',        b: '🚌  Être passager'     },
  ],

  pourContre: [
    { id: 1,  q: 'L\'ananas sur la pizza ?',          a: '✅  Pour',  b: '❌  Contre' },
    { id: 2,  q: 'Le télétravail à 100% ?',           a: '✅  Pour',  b: '❌  Contre' },
    { id: 3,  q: 'Coucher les enfants avant 21h ?',   a: '✅  Pour',  b: '❌  Contre' },
    { id: 4,  q: 'Le mariage ?',                      a: '✅  Pour',  b: '❌  Contre' },
    { id: 5,  q: 'Les tatouages visibles au travail ?',a: '✅  Pour',  b: '❌  Contre' },
    { id: 6,  q: 'Les devoirs à la maison ?',         a: '✅  Pour',  b: '❌  Contre' },
    { id: 7,  q: 'Partir vivre à l\'étranger ?',      a: '✅  Pour',  b: '❌  Contre' },
    { id: 8,  q: 'Les réseaux sociaux avant 13 ans ?',a: '✅  Pour',  b: '❌  Contre' },
    { id: 9,  q: 'Les chiens dans les restaurants ?', a: '✅  Pour',  b: '❌  Contre' },
    { id: 10, q: 'La semaine de 4 jours ?',           a: '✅  Pour',  b: '❌  Contre' },
    { id: 11, q: 'La chirurgie esthétique ?',         a: '✅  Pour',  b: '❌  Contre' },
    { id: 12, q: 'Le végétarisme un jour par semaine ?', a: '✅  Pour', b: '❌  Contre' },
    { id: 13, q: 'L\'IA dans l\'éducation ?',         a: '✅  Pour',  b: '❌  Contre' },
    { id: 14, q: 'Les voitures électriques obligatoires ?', a: '✅  Pour', b: '❌  Contre' },
    { id: 15, q: 'Les sports extrêmes ?',             a: '✅  Pour',  b: '❌  Contre' },
    { id: 16, q: 'Les jeux vidéo pour les enfants ?', a: '✅  Pour',  b: '❌  Contre' },
    { id: 17, q: 'Les voitures autonomes sur route ?',a: '✅  Pour',  b: '❌  Contre' },
    { id: 18, q: 'L\'apprentissage des langues dès le primaire ?', a: '✅  Pour', b: '❌  Contre' },
    { id: 19, q: 'La polygamie légalisée ?',          a: '✅  Pour',  b: '❌  Contre' },
    { id: 20, q: 'Interdire les téléphones à l\'école ?', a: '✅  Pour', b: '❌  Contre' },
  ],

  cEstPlutot: [
    { id: 1,  q: 'Tu es plutôt…', a: '📋  Organisé',       b: '🎲  Spontané'         },
    { id: 2,  q: 'Tu es plutôt…', a: '👑  Leader',          b: '🤝  Suiveur'           },
    { id: 3,  q: 'Tu es plutôt…', a: '🎙️  Extraverti',     b: '🎧  Introverti'        },
    { id: 4,  q: 'Tu es plutôt…', a: '🌈  Optimiste',       b: '🔭  Réaliste'          },
    { id: 5,  q: 'Tu es plutôt…', a: '❤️  Cœur',           b: '🧠  Raison'            },
    { id: 6,  q: 'Tu es plutôt…', a: '🚀  Audacieux',       b: '🛡️  Prudent'          },
    { id: 7,  q: 'Tu es plutôt…', a: '🏆  Compétitif',      b: '🌱  Coopératif'        },
    { id: 8,  q: 'Tu es plutôt…', a: '🎩  Classique',       b: '🌀  Original'          },
    { id: 9,  q: 'Tu es plutôt…', a: '🎉  Fête',            b: '🕯️  Soirée calme'     },
    { id: 10, q: 'Tu es plutôt…', a: '🌄  Lève-tôt',        b: '🌙  Couche-tard'       },
    { id: 11, q: 'Tu es plutôt…', a: '📅  Tout planifier',  b: '✈️  Improviser'        },
    { id: 12, q: 'Tu es plutôt…', a: '🗣️  Direct',         b: '🕊️  Diplomate'        },
    { id: 13, q: 'Tu es plutôt…', a: '🧹  Minimaliste',     b: '🗂️  Collectionneur'   },
    { id: 14, q: 'Tu es plutôt…', a: '🏃  Sportif',         b: '🛋️  Sédentaire'      },
    { id: 15, q: 'Tu es plutôt…', a: '📻  Nostalgique',     b: '🚀  Tourné vers l\'avenir' },
    { id: 16, q: 'Tu es plutôt…', a: '🔢  Perfectionniste', b: '🎯  Pragmatique'       },
    { id: 17, q: 'Tu es plutôt…', a: '🐢  Timide',          b: '🦁  Sûr de soi'        },
    { id: 18, q: 'Tu es plutôt…', a: '🌍  Voyageur',        b: '🏠  Casanier'          },
    { id: 19, q: 'Tu es plutôt…', a: '🔍  Curieux de tout', b: '🎯  Focalisé'          },
    { id: 20, q: 'Tu es plutôt…', a: '💬  Bavard',          b: '🤫  Discret'           },
  ],

  debat: [
    { id: 1,  q: 'Les films en VO c\'est mieux qu\'en VF ?',     a: '👍  Oui', b: '👎  Non' },
    { id: 2,  q: 'La vie à la campagne est meilleure qu\'en ville ?', a: '👍  Oui', b: '👎  Non' },
    { id: 3,  q: 'Les chats sont plus intelligents que les chiens ?', a: '👍  Oui', b: '👎  Non' },
    { id: 4,  q: 'On peut être vraiment heureux sans argent ?',   a: '👍  Oui', b: '👎  Non' },
    { id: 5,  q: 'La technologie nous rend moins sociaux ?',      a: '👍  Oui', b: '👎  Non' },
    { id: 6,  q: 'Les tatouages vieillissent bien ?',             a: '👍  Oui', b: '👎  Non' },
    { id: 7,  q: 'L\'amour à distance peut vraiment durer ?',     a: '👍  Oui', b: '👎  Non' },
    { id: 8,  q: 'Les séries ont dépassé les films ?',            a: '👍  Oui', b: '👎  Non' },
    { id: 9,  q: 'Les humains sont naturellement bons ?',         a: '👍  Oui', b: '👎  Non' },
    { id: 10, q: 'La chance compte plus que le talent ?',         a: '👍  Oui', b: '👎  Non' },
    { id: 11, q: 'La jalousie est normale dans un couple ?',      a: '👍  Oui', b: '👎  Non' },
    { id: 12, q: 'Les réseaux sociaux font plus de mal que de bien ?', a: '👍  Oui', b: '👎  Non' },
    { id: 13, q: 'L\'argent fait le bonheur ?',                   a: '👍  Oui', b: '👎  Non' },
    { id: 14, q: 'Il vaut mieux être seul que mal accompagné ?',  a: '👍  Oui', b: '👎  Non' },
    { id: 15, q: 'Le sport devrait être obligatoire à l\'école ?',a: '👍  Oui', b: '👎  Non' },
    { id: 16, q: 'On travaille pour vivre, pas l\'inverse ?',     a: '👍  Oui', b: '👎  Non' },
    { id: 17, q: 'Il faut avoir des enfants pour être heureux ?', a: '👍  Oui', b: '👎  Non' },
    { id: 18, q: 'Les jeux vidéo peuvent devenir un sport olympique ?', a: '👍  Oui', b: '👎  Non' },
    { id: 19, q: 'On devrait enseigner le bonheur à l\'école ?',  a: '👍  Oui', b: '👎  Non' },
    { id: 20, q: 'Le destin existe vraiment ?',                   a: '👍  Oui', b: '👎  Non' },
  ],
};

export function selectQuestions(count, categoryId = 'all') {
  let pool;
  if (categoryId === 'all') {
    pool = Object.values(QUESTIONS).flat();
  } else {
    pool = QUESTIONS[categoryId] ?? Object.values(QUESTIONS).flat();
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}
