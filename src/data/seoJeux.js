// Textes des pages de jeux pour les moteurs de recherche (lus par scripts/seo.js, sans bundler).
// Garder uniquement des `export const` et des données simples.
// intro : 2 phrases pour présenter le jeu · regles : déroulé · faq : [question, réponse]

export const SEO_JEUX = {
  undercover: {
    motCle: 'jeu de l’imposteur en ligne',
    intro: 'Undercover est un jeu d’imposteur où chaque joueur reçoit un mot secret : les villageois ont tous le même, les espions un mot proche. À tour de rôle, chacun donne un indice sans se trahir, puis le groupe vote pour éliminer un suspect.',
    regles: [
      'Chaque joueur découvre son mot en secret sur le téléphone, puis le passe à son voisin.',
      'Monsieur Blanc, s’il est en jeu, n’a aucun mot et doit improviser.',
      'Chacun donne un indice sur son mot, sans le dire.',
      'Après chaque tour, votez pour éliminer un joueur : son rôle est révélé.',
      'Les villageois gagnent quand tous les espions sont démasqués ; les espions, quand ils sont aussi nombreux que les villageois.',
    ],
    faq: [
      ['Faut-il un téléphone par joueur pour jouer à Undercover ?', 'Non : un seul téléphone suffit, il passe de main en main pendant la distribution des mots.'],
      ['Combien d’espions mettre ?', 'Le jeu conseille un espion pour trois joueurs, et vous pouvez ajouter Monsieur Blanc pour corser la partie.'],
    ],
  },
  tribunal: {
    motCle: 'jeu du tribunal entre amis',
    intro: 'Tribunal est un jeu de bluff à plusieurs téléphones : chacun écrit une vérité sur un autre joueur, puis l’accusé doit convaincre le jury que c’est faux.',
    regles: [
      'Un joueur crée une salle, les autres la rejoignent avec un code à 4 lettres.',
      'Chacun écrit en secret une vérité sur le joueur qui lui est attribué.',
      'L’accusé découvre l’accusation, devine son auteur et plaide sa cause à voix haute.',
      'Le jury vote « vrai » ou « faux » : sans majorité « faux », l’accusé prend un malus.',
      'Le joueur avec le moins de malus gagne.',
    ],
    faq: [
      ['Faut-il un téléphone par joueur ?', 'Oui, Tribunal se joue avec un téléphone par personne pour que les votes restent secrets.'],
    ],
  },
  amitie: {
    motCle: 'test d’amitié et de couple',
    intro: 'Test relation met votre lien à l’épreuve : un joueur devine la réponse de l’autre à des questions sur ses goûts, ses habitudes ou ses secrets. À la fin, un pourcentage de compatibilité tombe.',
    regles: [
      'Choisissez le mode : amitié, couple ou adulte.',
      'À chaque question, un joueur devine à voix haute la réponse de l’autre.',
      'Le joueur visé révèle sa vraie réponse : bonne réponse, un point.',
      'Le pourcentage de bonnes réponses donne votre taux de compatibilité.',
    ],
    faq: [
      ['Peut-on jouer à plus de deux ?', 'Oui, jusqu’à six joueurs : les questions tournent entre toutes les paires.'],
    ],
  },
  blindtest: {
    motCle: 'quiz musical en ligne gratuit',
    intro: 'Un blind test musical gratuit, directement dans le navigateur : un extrait se lance, tapez le titre de la chanson le plus vite possible. Chansons françaises, années 80, rock, dessins animés et plus.',
    regles: [
      'Choisissez une catégorie, le nombre de chansons et le temps par chanson.',
      'Lancez l’extrait, puis tapez le titre : les fautes de frappe légères sont acceptées.',
      'Plus vous répondez vite, plus vous marquez : 3, 2 ou 1 point.',
      'En mode multi-téléphones, la musique joue partout et le premier qui trouve gagne.',
    ],
    faq: [
      ['Le blind test est-il gratuit ?', 'Oui, sans inscription ni application : les extraits sont lus depuis YouTube.'],
      ['Peut-on jouer chacun sur son téléphone ?', 'Oui, le mode multi-téléphones permet à chacun de répondre sur son propre écran.'],
    ],
  },
  emojiquiz: {
    motCle: 'devinettes en emojis',
    intro: 'Emoji quiz cache un film, une chanson, une série, une célébrité ou un jeu vidéo derrière trois emojis. Un emoji d’abord, puis deux, puis trois : trouvez la réponse le plus tôt possible.',
    regles: [
      'Chaque joueur répond à son tour à une énigme.',
      'Un premier emoji s’affiche ; tapez votre réponse ou demandez l’indice suivant.',
      '4 points au premier indice, 3 au deuxième, 2 au troisième, puis 1 point avec quatre propositions.',
    ],
    faq: [
      ['Quelles catégories d’énigmes ?', 'Films, musique, séries, célébrités et jeux vidéo : choisissez celles que vous voulez.'],
    ],
  },
  vote: {
    motCle: 'jeu de vote majorité',
    intro: 'Vote majorité pose des questions, des débats et des dilemmes « tu préfères » : chacun vote en secret, et ceux qui pensent comme la majorité marquent des points.',
    regles: [
      'Une question s’affiche avec deux réponses possibles.',
      'Chaque joueur vote en secret, en se passant le téléphone, ou sur son propre téléphone en mode multi.',
      'Voter comme la majorité rapporte 1 point ; un vote unanime, 2 points pour tous.',
      'En cas d’égalité parfaite, personne ne marque.',
    ],
    faq: [
      ['Y a-t-il des questions pour adultes ?', 'Oui, des catégories 18+ existent ; elles sont signalées et à choisir volontairement.'],
    ],
  },
  personality: {
    motCle: 'devine la célébrité floue',
    intro: 'Devine la personnalité montre une célébrité floue ou cachée derrière une mosaïque. L’image se précise à chaque indice : trouvez son nom le plus tôt possible.',
    regles: [
      'Une question sur deux, le visage est flouté ; l’autre, il se dévoile en mosaïque.',
      'Tapez le nom de la célébrité : les petites fautes sont acceptées.',
      'Plus vous trouvez tôt, plus vous marquez : 4, 3, 2 puis 1 point.',
    ],
    faq: [
      ['Quelles célébrités ?', 'Des stars internationales et françaises : cinéma, musique, sport, télévision, internet.'],
    ],
  },
  quiz: {
    motCle: 'culture générale entre amis',
    intro: 'Un quiz de culture générale à plusieurs sur un seul téléphone : culture générale, cinéma, musique, sport, géographie, sciences, histoire, Disney, cuisine. 15 secondes par question.',
    regles: [
      'Les joueurs répondent chacun leur tour à leur question.',
      'Quatre réponses possibles, 15 secondes pour choisir.',
      'Une bonne réponse rapporte 100 points, avec un bonus de rapidité.',
      'Une anecdote accompagne chaque réponse.',
    ],
    faq: [
      ['Peut-on choisir la difficulté ?', 'Oui : facile, normal ou difficile, et autant de catégories que vous voulez.'],
    ],
  },
  mime: {
    motCle: 'jeu de mime en ligne',
    intro: 'Mime express : un joueur reçoit un mot sur son téléphone et le mime, les autres tapent leur réponse sur le leur. Chacun son écran, zéro triche.',
    regles: [
      'Un joueur crée la salle, les autres la rejoignent avec le code.',
      'À chaque manche, le mimeur voit un mot et a 60 secondes pour le faire deviner sans parler.',
      'Des indices de lettres apparaissent au fil du temps.',
      'Celui qui trouve marque 3 points, le mimeur 2.',
    ],
    faq: [
      ['Faut-il un téléphone par joueur ?', 'Oui, chaque joueur tape ses réponses sur son propre téléphone.'],
    ],
  },
  quiestleplus: {
    motCle: 'qui est le plus susceptible de',
    intro: 'Qui est le plus susceptible de… ? Une question s’affiche, chacun vote en secret pour le joueur qui correspond le mieux, et le plus désigné prend un gage.',
    regles: [
      'Une question s’affiche : « Qui est le plus susceptible de… ? »',
      'Chacun vote en secret pour un joueur, puis passe le téléphone.',
      'Le plus désigné prend autant de gages que de votes reçus (en mode 18+ : autant de gorgées).',
      'En cas d’égalité, tous les ex æquo sont concernés.',
    ],
    faq: [
      ['Existe-t-il une version hot ?', 'Oui, les catégories Hot et Très hot sont réservées aux adultes et signalées 18+.'],
    ],
  },
  oracle: {
    motCle: 'jeu de questions et réponses drôles',
    intro: 'L’Oracle pose une question mystérieuse ; chacun écrit sa réponse en secret, puis toutes sont révélées anonymement et le groupe vote pour la meilleure.',
    regles: [
      'Une question s’affiche pour tout le monde.',
      'Chaque joueur écrit sa réponse en secret, à tour de rôle.',
      'Les réponses sont révélées sans leur auteur (A, B, C…).',
      'Chacun vote pour sa préférée : la plus votée rapporte un point à son auteur.',
    ],
    faq: [
      ['Peut-on voter pour sa propre réponse ?', 'Non, votre réponse est grisée au moment du vote.'],
    ],
  },
  confessions: {
    motCle: 'jeu de confessions anonymes',
    intro: 'Confessions : chaque joueur écrit une confession secrète, puis le groupe tente de deviner l’auteur de chacune. Tromper les autres rapporte des points.',
    regles: [
      'Chaque joueur complète en secret la même phrase de confession.',
      'Les confessions sont lues une à une, sans leur auteur.',
      'Chacun vote pour l’auteur supposé.',
      '+2 points si vous trouvez ; l’auteur gagne 1 point par joueur trompé.',
    ],
    faq: [
      ['Les confessions sont-elles enregistrées ?', 'Non, elles restent sur le téléphone le temps de la partie.'],
    ],
  },
  verites: {
    motCle: 'jeu de vérités et de bluff',
    intro: 'Vérités volées : tout le monde complète la même phrase en disant la vérité, puis le jeu échange en secret les réponses de deux joueurs, qui doivent bluffer jusqu’au vote final.',
    regles: [
      'Chacun complète en secret le même début de phrase, honnêtement.',
      'Le jeu échange les vérités de deux joueurs sans le dire.',
      'Chacun lit « sa » vérité à voix haute : les deux tricheurs assument et bluffent.',
      'Chaque joueur désigne deux suspects : un point par tricheur démasqué, un point au tricheur par joueur berné.',
    ],
    faq: [
      ['Combien de joueurs faut-il ?', 'De 4 à 10 joueurs, pour que le bluff fonctionne.'],
    ],
  },
  defis: {
    motCle: 'jeu de défis pour soirée',
    intro: 'Les défis : la roue désigne un joueur au hasard, qui doit relever un défi physique, social, créatif ou de questions. S’il refuse, une conséquence l’attend.',
    regles: [
      'La roue tire un joueur au hasard.',
      'Le jeu lui donne un défi à relever.',
      'Défi réussi : bravo. Défi refusé : il prend une conséquence.',
      'À la fin, le classement montre qui a tout osé.',
    ],
    faq: [
      ['Les défis sont-ils adaptés à tous ?', 'Les catégories tout public sont activées par défaut ; les défis osés sont réservés aux adultes et peuvent toujours être refusés.'],
    ],
  },
  trouveLaRegle: {
    motCle: 'jeu de la règle secrète',
    intro: 'Trouve la règle : le détective sort de la pièce pendant que le groupe découvre une règle secrète. En posant des questions, il doit deviner cette règle.',
    regles: [
      'Un joueur, le détective, quitte la pièce.',
      'Les autres découvrent une règle secrète, par exemple « répondre par une question ».',
      'Le détective revient et pose des questions libres ; tout le monde répond en suivant la règle.',
      'Il choisit la règle parmi quatre propositions : moins de questions, plus de points.',
    ],
    faq: [
      ['Combien de joueurs ?', 'De 3 à 8 joueurs ; le rôle de détective tourne à chaque manche.'],
    ],
  },
  motdepasse: {
    motCle: 'jeu des mots interdits',
    intro: 'Mot de passe : faites deviner un maximum de mots avant la fin du chrono, sans jamais prononcer les cinq mots interdits affichés sous chaque carte.',
    regles: [
      'À votre tour, prenez le téléphone et lancez le chrono (30, 60 ou 90 secondes).',
      'Faites deviner le mot sans dire les mots interdits.',
      'Touchez « Trouvé » ou passez au mot suivant.',
      'Celui qui fait deviner le plus de mots gagne.',
    ],
    faq: [
      ['Existe-t-il une version adulte ?', 'Oui, une ambiance adulte est disponible et signalée 18+.'],
    ],
  },
  blanc_manger: {
    motCle: 'jeu de phrases à trous drôles',
    intro: 'Remplis le blanc : une phrase à trou s’affiche, chacun choisit en secret la carte la plus drôle pour la compléter, et le jury du tour couronne sa préférée.',
    regles: [
      'Une phrase à trou s’affiche ; un joueur est le jury du tour.',
      'Les autres choisissent en secret une carte réponse, ou écrivent la leur avec une carte rare.',
      'Le jury lit les réponses et désigne la plus drôle : son auteur marque un point.',
      'Le jury change à chaque tour.',
    ],
    faq: [
      ['Peut-on y jouer chacun sur son téléphone ?', 'Oui, un mode multi-téléphones permet de choisir ses cartes sur son propre écran.'],
    ],
  },
  tripotes: {
    motCle: 'jeu de classement entre amis',
    intro: 'Tripotes : le juge découvre une question secrète et classe ses amis selon elle. Le groupe doit ensuite retrouver la vraie question parmi quatre.',
    regles: [
      'Le juge découvre seul la question secrète.',
      'Il classe les autres joueurs du plus au moins concerné.',
      'Le groupe voit le classement et choisit la question parmi quatre.',
      'Bonne réponse : un point par joueur du groupe. Sinon : deux points pour le juge.',
    ],
    faq: [
      ['Qui est le juge ?', 'Le rôle de juge change à chaque manche, pour que tout le monde y passe.'],
    ],
  },
  verre: {
    motCle: 'jeu de bluff et de cartes à boire',
    intro: 'Le verre maudit : chacun reçoit une carte secrète de 1 à 20. À votre tour, buvez le verre, passez pour le remplir, ou défiez un adversaire en pariant plus haut ou plus bas.',
    regles: [
      'Chaque joueur découvre sa carte secrète, de 1 à 20.',
      'À votre tour : boire le verre, passer (il se remplit d’une gorgée) ou défier un joueur.',
      'En défi, pariez que votre carte est plus haute ou plus basse : le perdant boit le double.',
      'Si personne n’a bu au bout des tours tirés au sort, la plus petite carte boit le verre.',
      'Mode battle royale : le perdant d’un défi est éliminé.',
    ],
    faq: [
      ['Faut-il boire de l’alcool ?', 'Non : jouez avec la boisson de votre choix. Le jeu est réservé aux adultes en version alcoolisée.'],
    ],
  },
};
