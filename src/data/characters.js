export const characters = [
  {
    id: 'agent_ombre',
    name: 'Agent Ombre',
    emoji: '🕵️',
    title: 'Maître de l\'Infiltration',
    description:
      'Expert en mensonges et double sens, Agent Ombre connaît tous vos secrets… même ceux que vous n\'avez pas encore dits.',
    catchphrase: '"Qui cache quoi... et pourquoi ?"',
    color: '#7C3AED',
    gradientColors: ['#1A0A3B', '#2D1069'],
    game: 'undercover',
    available: true,
    stats: {
      Bluff: 95,
      Stratégie: 88,
      Charisme: 72,
    },
  },
  {
    id: 'maestro_zap',
    name: 'Maestro Zap',
    emoji: '⚡',
    title: 'Génie des Questions',
    description:
      'Avec son intelligence foudroyante et sa mémoire photographique, Maestro Zap teste vos connaissances dans tous les domaines.',
    catchphrase: '"La connaissance est un pouvoir... électrisant !"',
    color: '#0EA5E9',
    gradientColors: ['#0A1A3B', '#0A2B4A'],
    game: 'quiz',
    available: true,
    stats: {
      Savoir: 99,
      Rapidité: 91,
      Piège: 85,
    },
  },
  {
    id: 'lola_fiesta',
    name: 'Lola Fiesta',
    emoji: '🎉',
    title: 'Reine de la Fête',
    description:
      'Explosive, imprévisible, et toujours prête à faire monter la soirée d\'un cran. Lola Fiesta ne connaît pas la modération.',
    catchphrase: '"On est là pour s\'amuser, pas pour se souvenir !"',
    color: '#EC4899',
    gradientColors: ['#3B0A2A', '#5B1040'],
    game: 'drinking',
    available: false,
    stats: {
      Chaos: 97,
      Audace: 94,
      Humour: 89,
    },
  },
  {
    id: 'doc_mystere',
    name: 'Doc Mystère',
    emoji: '🔮',
    title: 'Gardien des Secrets',
    description:
      'Personne ne sait d\'où il vient ni ce qu\'il trame vraiment. Doc Mystère orchestre des jeux de rôle et d\'enquête inoubliables.',
    catchphrase: '"Le mystère est partout… cherchez bien."',
    color: '#059669',
    gradientColors: ['#0A2B1A', '#0A3B25'],
    game: 'mystery',
    available: false,
    stats: {
      Énigme: 98,
      Manipulation: 87,
      Patience: 76,
    },
  },
];
