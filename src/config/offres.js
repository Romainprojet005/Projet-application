// ── Offres et rotation des jeux gratuits ──────────────────────────────
// Tout ce qui concerne les prix se règle ici.

// Mettre à false pour couper le cadenas (tous les jeux redeviennent gratuits).
// En pause tant que le paiement en ligne n'est pas branché (liens ci-dessous vides).
export const PAYWALL_ACTIF = false;

// Nombre de jeux « un seul téléphone » offerts chaque jour, en plus des jeux
// multi-téléphones (toujours gratuits). La sélection change chaque jour à minuit
// (heure de Paris) et est la même pour tout le monde.
export const JEUX_GRATUITS_PAR_JOUR = 4;

export const OFFRES = [
  {
    id: 'jeu_24h',
    titre: 'Ce jeu',
    prix: '0,99 €',
    duree: '24 h',
    detail: 'Débloque le jeu choisi pendant 24 heures.',
    // Lien de paiement (ex. Stripe Payment Link). Vide = paiement pas encore branché.
    lien: '',
  },
  {
    id: 'tous_24h',
    titre: 'Pass Soirée',
    prix: '2,99 €',
    duree: '24 h',
    detail: 'Tous les jeux débloqués pendant 24 heures.',
    recommande: true,
    lien: '',
  },
  {
    id: 'abonnement',
    titre: 'Légende',
    prix: '4,99 €',
    duree: 'mois',
    detail: 'Tous les jeux, tout le temps. Sans engagement.',
    lien: '',
  },
];
