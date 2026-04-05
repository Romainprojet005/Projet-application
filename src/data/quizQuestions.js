export const quizCategories = {
  culture: {
    label: 'Culture Générale',
    emoji: '🧠',
    color: '#8B5CF6',
    questions: [
      {
        q: 'Combien de côtés a un hexagone ?',
        choices: ['5', '6', '7', '8'],
        answer: 1,
        anecdote: "L'hexagone est aussi le surnom de la France métropolitaine, car sa forme ressemble à cette figure géométrique.",
      },
      {
        q: 'Quelle est la planète la plus proche du Soleil ?',
        choices: ['Vénus', 'Mercure', 'Terre', 'Mars'],
        answer: 1,
        anecdote: 'Une année sur Mercure dure seulement 88 jours terrestres, tant elle tourne vite autour du Soleil.',
      },
      {
        q: 'Quel est le pays le plus peuplé du monde ?',
        choices: ['Chine', 'Inde', 'États-Unis', 'Indonésie'],
        answer: 1,
        anecdote: "En 2023, l'Inde a dépassé la Chine avec plus de 1,4 milliard d'habitants.",
      },
      {
        q: "Quel animal est le plus rapide sur terre ?",
        choices: ['Guépard', 'Lion', 'Autruche', 'Antilope'],
        answer: 0,
        anecdote: 'Le guépard peut atteindre 112 km/h sur de courtes distances, mais se fatigue très vite.',
      },
      {
        q: 'Combien d\'os compte un squelette adulte ?',
        choices: ['196', '206', '216', '226'],
        answer: 1,
        anecdote: 'Les bébés naissent avec ~270 os qui fusionnent progressivement pour arriver à 206 à l\'âge adulte.',
      },
      {
        q: 'Quelle couleur obtient-on en mélangeant bleu et jaune ?',
        choices: ['Orange', 'Vert', 'Violet', 'Marron'],
        answer: 1,
        anecdote: "C'est la synthèse soustractive des couleurs. Une des premières choses apprises en cours d'art !",
      },
      {
        q: 'Quel est le plus grand océan du monde ?',
        choices: ['Atlantique', 'Indien', 'Pacifique', 'Arctique'],
        answer: 2,
        anecdote: "L'océan Pacifique représente à lui seul plus de 30% de la surface totale de la Terre.",
      },
      {
        q: 'Quelle est la monnaie du Japon ?',
        choices: ['Yuan', 'Yen', 'Won', 'Ringgit'],
        answer: 1,
        anecdote: "Le yen (¥) est l'une des devises les plus échangées au monde, après le dollar et l'euro.",
      },
      {
        q: 'Quel est le métal le plus abondant dans la croûte terrestre ?',
        choices: ['Fer', 'Aluminium', 'Cuivre', 'Or'],
        answer: 1,
        anecdote: "L'aluminium représente environ 8% de la croûte terrestre, mais il a fallu attendre le XIXe siècle pour le produire industriellement.",
      },
      {
        q: 'En quelle année a débuté la Première Guerre mondiale ?',
        choices: ['1914', '1916', '1912', '1918'],
        answer: 0,
        anecdote: "La guerre a débuté le 28 juillet 1914 après l'assassinat de l'archiduc François-Ferdinand à Sarajevo.",
      },
      {
        q: 'Combien de minutes compte une journée ?',
        choices: ['1 200', '1 440', '1 600', '1 720'],
        answer: 1,
        anecdote: '24h × 60 min = 1 440 minutes. Soit 86 400 secondes pour ne pas gâcher la moindre d\'entre elles !',
      },
      {
        q: 'Quel pays a la plus grande superficie au monde ?',
        choices: ['Russie', 'Canada', 'États-Unis', 'Chine'],
        answer: 0,
        anecdote: 'La Russie couvre plus de 17 millions de km², soit presque deux fois la superficie du Canada.',
      },
      {
        q: 'Quelle planète est surnommée la "planète rouge" ?',
        choices: ['Vénus', 'Jupiter', 'Mars', 'Saturne'],
        answer: 2,
        anecdote: 'Mars doit sa couleur rouge à l\'oxyde de fer (rouille) qui recouvre sa surface. Son sol est littéralement rouillé !',
      },
      {
        q: 'Quelle langue est la plus parlée au monde (tous locuteurs) ?',
        choices: ['Mandarin', 'Anglais', 'Espagnol', 'Hindi'],
        answer: 1,
        anecdote: "L'anglais est premier en comptant les locuteurs non-natifs. Le mandarin reste premier en locuteurs natifs.",
      },
      {
        q: 'Combien de dents a un adulte humain (avec les dents de sagesse) ?',
        choices: ['28', '30', '32', '36'],
        answer: 2,
        anecdote: 'Les 32 dents incluent les 4 dents de sagesse. Beaucoup les font retirer car elles n\'ont plus assez de place.',
      },
    ],
  },

  cinema: {
    label: 'Cinéma',
    emoji: '🎬',
    color: '#EC4899',
    questions: [
      {
        q: "Qui a réalisé le film 'Inception' (2010) ?",
        choices: ['Christopher Nolan', 'James Cameron', 'Denis Villeneuve', 'David Fincher'],
        answer: 0,
        anecdote: 'Nolan a développé l\'idée d\'Inception pendant 10 ans. Le film a rapporté 836 millions $ pour un budget de 160M$.',
      },
      {
        q: "Quel film Disney est le premier entièrement en images de synthèse ?",
        choices: ["A Bug's Life", 'Toy Story', 'Monsters Inc.', 'Finding Nemo'],
        answer: 1,
        anecdote: "Toy Story (1995) est le premier long métrage entièrement réalisé en CGI. Une révolution dans l'histoire du cinéma.",
      },
      {
        q: "Qui joue le Joker dans 'The Dark Knight' (2008) ?",
        choices: ['Joaquin Phoenix', 'Heath Ledger', 'Jack Nicholson', 'Jared Leto'],
        answer: 1,
        anecdote: "Heath Ledger a remporté l'Oscar à titre posthume. Il s'est enfermé seul dans une chambre d'hôtel pour préparer le rôle.",
      },
      {
        q: "Quel film a remporté l'Oscar du Meilleur Film en 2020 ?",
        choices: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
        answer: 2,
        anecdote: "Parasite de Bong Joon-ho est le premier film non-anglophone à remporter l'Oscar du Meilleur Film en 92 ans.",
      },
      {
        q: "Quel acteur joue Iron Man dans le MCU ?",
        choices: ['Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo'],
        answer: 0,
        anecdote: "RDJ a failli ne pas obtenir le rôle à cause de son passé. C'est le réalisateur Jon Favreau qui a insisté pour lui.",
      },
      {
        q: "Dans 'Le Seigneur des Anneaux', qui joue Gandalf ?",
        choices: ['Anthony Hopkins', 'Ian McKellen', 'Patrick Stewart', 'Derek Jacobi'],
        answer: 1,
        anecdote: "Ian McKellen a failli refuser le rôle. Sean Connery l'avait décliné avant lui, ne comprenant pas le scénario.",
      },
      {
        q: "Quel est le film le plus rentable de tous les temps ?",
        choices: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars VII'],
        answer: 0,
        anecdote: 'Avatar (2009) a rapporté 2,9 milliards de dollars. Sa suite en 2022 a rapporté 2,3 milliards supplémentaires.',
      },
      {
        q: "Qui joue Hermione Granger dans Harry Potter ?",
        choices: ['Emma Stone', 'Emma Watson', 'Keira Knightley', 'Bonnie Wright'],
        answer: 1,
        anecdote: "Emma Watson était si populaire que les producteurs ont failli la remplacer pour ne pas qu'elle éclipse Daniel Radcliffe.",
      },
      {
        q: "Quel réalisateur a tourné 'Pulp Fiction' et 'Kill Bill' ?",
        choices: ['Martin Scorsese', 'David Fincher', 'Quentin Tarantino', 'Guy Ritchie'],
        answer: 2,
        anecdote: 'Tarantino est aussi acteur et apparaît dans presque tous ses propres films dans de petits rôles.',
      },
      {
        q: "Dans quel film Tom Hanks survit avec un ballon de volley 'Wilson' ?",
        choices: ['The Blue Lagoon', 'Cast Away', 'Uncharted', 'The Beach'],
        answer: 1,
        anecdote: "Tom Hanks a pris 25 kg pour le début du film, puis les a perdus pour montrer l'état du naufragé. Wilson est devenu iconique.",
      },
      {
        q: "Quel studio a créé les films Shrek ?",
        choices: ['Pixar', 'DreamWorks', 'Disney', 'Sony Pictures'],
        answer: 1,
        anecdote: "Shrek devait être joué par Chris Farley, décédé avant la fin de l'enregistrement. Mike Myers l'a remplacé.",
      },
      {
        q: "Dans 'Forrest Gump', avec quoi compare-t-il la vie ?",
        choices: ['Un long fleuve', 'Une boîte de chocolats', 'Une plume au vent', 'Un marathon'],
        answer: 1,
        anecdote: "La phrase exacte : 'Life was like a box of chocolates, you never know what you're gonna get.'",
      },
      {
        q: "Dans 'Jurassic Park', quel dinosaure est dans la célèbre scène de la cuisine ?",
        choices: ['Vélociraptor', 'T-Rex', 'Dilophosaure', 'Brachiosaure'],
        answer: 0,
        anecdote: 'Dans la réalité, les vélociraptors étaient de la taille d\'une dinde. La vraie taille montrée correspond au Deinonychus.',
      },
      {
        q: "Qui a composé la musique de la saga Star Wars ?",
        choices: ['Hans Zimmer', 'John Williams', 'Ennio Morricone', 'Howard Shore'],
        answer: 1,
        anecdote: "John Williams a remporté 5 Oscars. Il a aussi composé Jaws, Indiana Jones, Schindler's List et Harry Potter.",
      },
      {
        q: "Quel acteur a joué dans 'Titanic' et 'The Revenant' ?",
        choices: ['Brad Pitt', 'Tom Hanks', 'Leonardo DiCaprio', 'Johnny Depp'],
        answer: 2,
        anecdote: "DiCaprio a attendu 22 ans avant de recevoir son premier Oscar, pour The Revenant en 2016.",
      },
    ],
  },

  musique: {
    label: 'Musique',
    emoji: '🎵',
    color: '#10B981',
    questions: [
      {
        q: "Quel groupe est surnommé 'Les Fab Four' ?",
        choices: ['The Rolling Stones', 'The Beatles', 'Led Zeppelin', 'Pink Floyd'],
        answer: 1,
        anecdote: "Les 'Fab Four' sont John Lennon, Paul McCartney, George Harrison et Ringo Starr. Séparés en 1970.",
      },
      {
        q: "Quel album de Michael Jackson est le plus vendu de tous les temps ?",
        choices: ['Bad', 'Thriller', 'Off the Wall', 'Dangerous'],
        answer: 1,
        anecdote: "Thriller a vendu plus de 70 millions d'exemplaires. Son clip vidéo de 14 minutes a révolutionné l'industrie musicale.",
      },
      {
        q: "De quel pays est originaire ABBA ?",
        choices: ['Norvège', 'Danemark', 'Suède', 'Finlande'],
        answer: 2,
        anecdote: "ABBA (Agnetha, Björn, Benny, Anni-Frid) était le groupe des années 70. Ils ont refusé 1 milliard $ pour une tournée de retrouvailles.",
      },
      {
        q: "Quel est le vrai nom de Lady Gaga ?",
        choices: ['Stefani Germanotta', 'Alicia Moore', 'Robyn Fenty', 'Onika Maraj'],
        answer: 0,
        anecdote: "Lady Gaga s'est inspirée de la chanson 'Radio Ga Ga' de Queen pour choisir son nom de scène.",
      },
      {
        q: "Quel rappeur s'appelle en réalité Marshall Mathers ?",
        choices: ['Eminem', 'Jay-Z', 'Kanye West', 'Snoop Dogg'],
        answer: 0,
        anecdote: "Eminem vient de ses initiales M&M (Marshall Mathers). Il a appris des milliers de mots du dictionnaire pour ses textes.",
      },
      {
        q: "Quel artiste a chanté 'Bohemian Rhapsody' ?",
        choices: ['David Bowie', 'Elton John', 'Led Zeppelin', 'Queen'],
        answer: 3,
        anecdote: "Bohemian Rhapsody dure presque 6 minutes, bien trop long selon les radios de 1975. Pourtant, numéro 1 des charts !",
      },
      {
        q: "Dans quel opéra trouve-t-on l'air 'Nessun Dorma' ?",
        choices: ['La Traviata', 'Carmen', 'Turandot', 'Rigoletto'],
        answer: 2,
        anecdote: "Pavarotti a rendu cet air mondial lors de la Coupe du Monde 1990 en Italie. Turandot est un opéra de Puccini.",
      },
      {
        q: "Quel artiste français est connu pour 'La Vie en Rose' ?",
        choices: ['Charles Aznavour', 'Édith Piaf', 'Jacques Brel', 'Serge Gainsbourg'],
        answer: 1,
        anecdote: "Édith Piaf a composé les paroles de 'La Vie en Rose' en 1945. Elle est devenue le symbole de la chanson française.",
      },
      {
        q: "Combien de cordes a une guitare classique ?",
        choices: ['4', '5', '6', '7'],
        answer: 2,
        anecdote: "La guitare basse a 4 cordes. Des guitares 7 et 8 cordes existent pour les styles de métal extrême.",
      },
      {
        q: "Dans quelle ville est né Mozart ?",
        choices: ['Vienne', 'Salzbourg', 'Munich', 'Prague'],
        answer: 1,
        anecdote: "Mozart est né le 27 janvier 1756 à Salzbourg. Il a composé ses premières œuvres à l'âge de 5 ans.",
      },
      {
        q: "Quel groupe a composé 'Stairway to Heaven' ?",
        choices: ['Black Sabbath', 'Deep Purple', 'Led Zeppelin', 'AC/DC'],
        answer: 2,
        anecdote: "Stairway to Heaven dure 8 minutes et n'est jamais sorti en single, mais est souvent classée meilleure chanson rock ever.",
      },
      {
        q: "Quel instrument joue Jimi Hendrix ?",
        choices: ['Guitare', 'Basse', 'Batterie', 'Clavier'],
        answer: 0,
        anecdote: "Hendrix jouait d'une guitare droitier à l'envers (main gauche sur le manche). Considéré le plus grand guitariste de l'histoire.",
      },
      {
        q: "Quelle chanteuse est surnommée 'Queen of Pop' ?",
        choices: ['Beyoncé', 'Madonna', 'Mariah Carey', 'Lady Gaga'],
        answer: 1,
        anecdote: "Madonna a vendu plus de 300 millions d'albums, ce qui en fait la femme la plus vendeuse de l'histoire de la musique.",
      },
      {
        q: "Quel artiste a vendu le plus d'albums de tous les temps ?",
        choices: ['Elvis Presley', 'Michael Jackson', 'The Beatles', 'Led Zeppelin'],
        answer: 2,
        anecdote: "Les Beatles ont vendu entre 600M et 1 milliard d'albums selon les estimations.",
      },
      {
        q: "Quel genre musical a émergé à Jamaica dans les années 60 ?",
        choices: ['Ska', 'Reggae', 'Dancehall', 'Rocksteady'],
        answer: 1,
        anecdote: "Le reggae est né de l'évolution du ska et du rocksteady. Bob Marley en est l'ambassadeur mondial.",
      },
    ],
  },

  sport: {
    label: 'Sport',
    emoji: '⚽',
    color: '#F59E0B',
    questions: [
      {
        q: 'Combien de joueurs composent une équipe de football sur le terrain ?',
        choices: ['9', '10', '11', '12'],
        answer: 2,
        anecdote: 'Le football a été codifié en 1863 en Angleterre. Le nombre de 11 joueurs est fixé depuis l\'origine du jeu.',
      },
      {
        q: 'Quel pays a remporté le plus de Coupes du Monde de football ?',
        choices: ['Brésil', 'Allemagne', 'Italie', 'Argentine'],
        answer: 0,
        anecdote: 'Le Brésil est le seul pays à avoir remporté 5 Coupes du Monde et à avoir participé à toutes les éditions.',
      },
      {
        q: 'Quelle est la distance exacte d\'un marathon ?',
        choices: ['40 km', '42 km', '42,195 km', '45 km'],
        answer: 2,
        anecdote: 'Cette distance a été standardisée aux JO 1908 à Londres pour que la course se termine devant la loge royale.',
      },
      {
        q: 'Qui détient le record du monde du 100m ?',
        choices: ['Usain Bolt', 'Marcell Jacobs', 'Tyson Gay', 'Yohan Blake'],
        answer: 0,
        anecdote: 'Usain Bolt a couru le 100m en 9,58 secondes à Berlin en 2009. Ce record tient depuis plus de 15 ans.',
      },
      {
        q: 'Dans quel sport utilise-t-on un shuttlecock (volant) ?',
        choices: ['Tennis', 'Badminton', 'Squash', 'Padel'],
        answer: 1,
        anecdote: 'Le volant peut atteindre 493 km/h en compétition, ce qui en fait le projectile sportif le plus rapide du monde.',
      },
      {
        q: 'Combien de points vaut un panier à 3 points au basketball ?',
        choices: ['2', '3', '4', '5'],
        answer: 1,
        anecdote: 'La ligne à 3 points a été introduite en NBA en 1979. Stephen Curry détient le record de 3 points inscrits en carrière.',
      },
      {
        q: 'Quel nageur a remporté le plus de médailles olympiques de l\'histoire ?',
        choices: ['Michael Phelps', 'Mark Spitz', 'Ryan Lochte', 'Ian Thorpe'],
        answer: 0,
        anecdote: 'Michael Phelps a remporté 28 médailles olympiques dont 23 en or. L\'athlète le plus médaillé de l\'histoire des JO.',
      },
      {
        q: 'Combien de joueurs joue-t-on au rugby à XV ?',
        choices: ['13', '14', '15', '16'],
        answer: 2,
        anecdote: 'Il existe aussi le rugby à 7 (seven), joué aux JO depuis 2016, et le rugby à XIII, populaire en Australie.',
      },
      {
        q: 'Qui a inventé le basketball ?',
        choices: ['Un Américain', 'Un Canadien', 'Un Britannique', 'Un Français'],
        answer: 1,
        anecdote: 'James Naismith, un Canadien, a inventé le basketball en 1891 dans une école d\'éducation physique aux États-Unis.',
      },
      {
        q: 'Dans quel sport un "birdie" représente un score d\'un en dessous du par ?',
        choices: ['Golf', 'Tennis', 'Cricket', 'Baseball'],
        answer: 0,
        anecdote: 'En golf : birdie (-1), eagle (-2), albatross (-3). "Birdie" vient d\'une expression américaine des années 1800.',
      },
      {
        q: 'Combien de sets faut-il gagner pour remporter Wimbledon (hommes) ?',
        choices: ['2', '3', '4', '5'],
        answer: 1,
        anecdote: 'En Grand Chelem masculin, il faut gagner 3 sets sur 5. En féminin (et dans la plupart des tournois), c\'est 2 sets sur 3.',
      },
      {
        q: 'Quel pays a remporté le plus de médailles d\'or aux JO d\'été de l\'histoire ?',
        choices: ['États-Unis', 'URSS/Russie', 'Chine', 'Allemagne'],
        answer: 0,
        anecdote: 'Les États-Unis dominent avec plus de 1000 médailles d\'or depuis les premiers JO modernes en 1896.',
      },
      {
        q: 'Combien de temps dure un match de hockey sur glace (temps réglementaire) ?',
        choices: ['45 min', '60 min', '75 min', '90 min'],
        answer: 1,
        anecdote: 'Un match se joue en trois périodes de 20 minutes, séparées par deux pauses de 17 minutes.',
      },
      {
        q: 'Quel sport se pratique avec une raquette de 2,7 mm d\'épaisseur maximum ?',
        choices: ['Badminton', 'Squash', 'Tennis de table', 'Racquetball'],
        answer: 2,
        anecdote: 'La balle de ping-pong pèse 2,7g et mesure 40mm. Le sport s\'est officiellement appelé "tennis de table" depuis 1926.',
      },
      {
        q: 'En quelle année ont eu lieu les premiers Jeux Olympiques modernes ?',
        choices: ['1892', '1896', '1900', '1904'],
        answer: 1,
        anecdote: 'Les premiers JO modernes se sont tenus à Athènes en 1896, organisés par le Baron Pierre de Coubertin.',
      },
    ],
  },

  science: {
    label: 'Science & Tech',
    emoji: '🔬',
    color: '#0EA5E9',
    questions: [
      {
        q: "Quelle est la formule chimique de l'eau ?",
        choices: ['H₂O', 'CO₂', 'NaCl', 'O₂'],
        answer: 0,
        anecdote: "Une molécule d'eau : 2 atomes d'hydrogène + 1 d'oxygène. Elle couvre environ 71% de la surface terrestre.",
      },
      {
        q: "Qui a développé la théorie de la relativité ?",
        choices: ['Isaac Newton', 'Albert Einstein', 'Niels Bohr', 'Max Planck'],
        answer: 1,
        anecdote: 'Einstein a publié sa relativité restreinte en 1905 alors qu\'il était simple employé dans un bureau des brevets à Berne.',
      },
      {
        q: "Quelle entreprise a créé l'iPhone ?",
        choices: ['Samsung', 'Apple', 'Google', 'Microsoft'],
        answer: 1,
        anecdote: "Steve Jobs a présenté le premier iPhone le 9 janvier 2007. Il avait gardé le projet secret, même à ses proches.",
      },
      {
        q: "Quelle planète est la plus grande du système solaire ?",
        choices: ['Saturne', 'Uranus', 'Jupiter', 'Neptune'],
        answer: 2,
        anecdote: "Jupiter est si grande qu'on pourrait y faire rentrer 1321 Terres ! Sa Grande Tache Rouge est une tempête géante depuis 350 ans.",
      },
      {
        q: "Quel élément chimique a le symbole 'Au' ?",
        choices: ['Argent', 'Or', 'Cuivre', 'Aluminium'],
        answer: 1,
        anecdote: "'Au' vient du latin 'Aurum'. L'or est connu depuis l'Antiquité et l'un des métaux les plus malléables qui existent.",
      },
      {
        q: "Combien de bits composent un octet ?",
        choices: ['4', '8', '16', '32'],
        answer: 1,
        anecdote: '1 octet = 8 bits. Le terme "octet" est français ; les anglophones disent "byte". 1 Go = 8 milliards de bits.',
      },
      {
        q: "À quelle température l'eau bout-elle au niveau de la mer ?",
        choices: ['90°C', '95°C', '100°C', '105°C'],
        answer: 2,
        anecdote: "En altitude, l'eau bout plus tôt. Au sommet de l'Everest, elle bout à ~70°C, rendant la cuisson des aliments difficile.",
      },
      {
        q: "Qui a découvert la pénicilline ?",
        choices: ['Alexander Fleming', 'Louis Pasteur', 'Marie Curie', 'Joseph Lister'],
        answer: 0,
        anecdote: "Fleming a découvert la pénicilline par accident en 1928, en constatant qu'une moisissure avait tué ses cultures de bactéries.",
      },
      {
        q: "De quelle couleur est le sang humain dans les veines ?",
        choices: ['Bleu', 'Rouge sombre', 'Violet', 'Rouge vif'],
        answer: 1,
        anecdote: "Le sang dans les veines n'est PAS bleu ! Il est rouge sombre car il contient moins d'oxygène qu'dans les artères.",
      },
      {
        q: "Quel scientifique est connu pour la loi de la gravitation universelle ?",
        choices: ['Isaac Newton', 'Galilée', 'Johannes Kepler', 'Archimède'],
        answer: 0,
        anecdote: "L'histoire de la pomme est probablement apocryphe, mais Newton s'est bien inspiré de l'observation de la chute des objets.",
      },
      {
        q: "Quelle est la vitesse de la lumière dans le vide ?",
        choices: ['150 000 km/s', '300 000 km/s', '450 000 km/s', '600 000 km/s'],
        answer: 1,
        anecdote: 'Rien ne peut dépasser la vitesse de la lumière selon Einstein. La lumière du Soleil met 8 minutes pour nous atteindre.',
      },
      {
        q: "Qui a fondé Microsoft ?",
        choices: ['Bill Gates', 'Steve Jobs', 'Larry Page', 'Jeff Bezos'],
        answer: 0,
        anecdote: "Bill Gates et Paul Allen ont fondé Microsoft en 1975. Gates a abandonné Harvard pour se consacrer à l'entreprise.",
      },
      {
        q: "Quel os est le plus long du corps humain ?",
        choices: ['Tibia', 'Fémur', 'Humérus', 'Radius'],
        answer: 1,
        anecdote: 'Le fémur (os de la cuisse) peut mesurer jusqu\'à 50 cm chez un adulte. C\'est aussi l\'os le plus solide du corps.',
      },
      {
        q: "Quel gaz est le plus abondant dans l'atmosphère terrestre ?",
        choices: ['Azote', 'Oxygène', 'CO₂', 'Argon'],
        answer: 0,
        anecdote: "L'azote représente 78% de l'air, l'oxygène 21%. Le CO₂, malgré son impact climatique, ne représente que 0,04%.",
      },
      {
        q: "Combien de neurones le cerveau humain contient-il environ ?",
        choices: ['10 milliards', '50 milliards', '86 milliards', '200 milliards'],
        answer: 2,
        anecdote: '86 milliards de neurones, chacun pouvant avoir jusqu\'à 10 000 connexions avec d\'autres neurones.',
      },
    ],
  },

  histoire: {
    label: 'Histoire',
    emoji: '📜',
    color: '#EF4444',
    questions: [
      {
        q: "En quelle année a débuté la Révolution française ?",
        choices: ['1789', '1792', '1799', '1804'],
        answer: 0,
        anecdote: "La Révolution a débuté le 14 juillet 1789 avec la prise de la Bastille. Cette date est la fête nationale française.",
      },
      {
        q: "Qui était le premier président des États-Unis ?",
        choices: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'Benjamin Franklin'],
        answer: 0,
        anecdote: "George Washington a été président de 1789 à 1797. Il est le seul président à avoir refusé d'être roi quand on le lui proposait.",
      },
      {
        q: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?",
        choices: ['1965', '1967', '1969', '1971'],
        answer: 2,
        anecdote: "Neil Armstrong a posé le pied sur la Lune le 21 juillet 1969 : 'Un petit pas pour l'homme, un bond de géant pour l'humanité.'",
      },
      {
        q: "Quelle civilisation a construit les pyramides de Gizeh ?",
        choices: ['Égyptienne', 'Romaine', 'Grecque', 'Mésopotamienne'],
        answer: 0,
        anecdote: "La Grande Pyramide de Gizeh a été construite vers 2560 av. J.-C. Elle a été la plus haute structure du monde pendant 3800 ans.",
      },
      {
        q: "Quel événement a déclenché la Seconde Guerre mondiale ?",
        choices: ["L'assassinat de Franz Ferdinand", "L'invasion de la Pologne", "L'attaque de Pearl Harbor", "La montée d'Hitler"],
        answer: 1,
        anecdote: "Le 1er septembre 1939, l'Allemagne envahit la Pologne. La France et le Royaume-Uni déclarèrent la guerre deux jours plus tard.",
      },
      {
        q: "Qui a inventé l'imprimerie à caractères mobiles en Europe ?",
        choices: ['Gutenberg', 'Leonardo da Vinci', 'Galilée', 'Copernic'],
        answer: 0,
        anecdote: "Gutenberg a inventé l'imprimerie vers 1440. Sa Bible imprimée en 1455 est l'un des livres les plus précieux au monde.",
      },
      {
        q: "Quel traité a mis fin à la Première Guerre mondiale ?",
        choices: ['Traité de Paris', 'Traité de Versailles', 'Traité de Genève', 'Traité de Vienne'],
        answer: 1,
        anecdote: "Le Traité de Versailles (1919) a imposé des conditions très dures à l'Allemagne, souvent citées comme facteur de la WWII.",
      },
      {
        q: "Quel navigateur a relié l'Europe à l'Amérique pour les Européens en 1492 ?",
        choices: ['Christophe Colomb', 'Vasco de Gama', 'Amerigo Vespucci', 'Ferdinand Magellan'],
        answer: 0,
        anecdote: "Colomb pensait être aux Indes, c'est pourquoi les habitants furent appelés 'Indiens'. Vespucci comprit qu'il s'agissait d'un nouveau continent.",
      },
      {
        q: "Quelle était la capitale de l'Empire romain d'Orient (Byzance) ?",
        choices: ['Constantinople', 'Carthage', 'Alexandrie', 'Antioche'],
        answer: 0,
        anecdote: "Constantinople (aujourd'hui Istanbul) est tombée aux Ottomans en 1453, marquant conventionnellement la fin du Moyen Âge.",
      },
      {
        q: "Quel général carthaginois a traversé les Alpes avec des éléphants ?",
        choices: ['César', 'Hannibal', 'Scipion', 'Vercingétorix'],
        answer: 1,
        anecdote: "Hannibal Barca a traversé les Alpes en 218 av. J.-C. avec 37 éléphants. La plupart moururent dans les neiges alpines.",
      },
      {
        q: "En quelle année a été inaugurée la Tour Eiffel ?",
        choices: ['1879', '1885', '1889', '1900'],
        answer: 2,
        anecdote: "La Tour Eiffel a été construite pour l'Exposition universelle de 1889 commémorant le centenaire de la Révolution. Elle devait être démontée.",
      },
      {
        q: "Combien de temps a duré la Guerre de Cent Ans ?",
        choices: ['100 ans', '112 ans', '116 ans', '120 ans'],
        answer: 2,
        anecdote: "La Guerre de Cent Ans (1337-1453) a duré 116 ans. Jeanne d'Arc y a joué un rôle décisif avant d'être brûlée à Rouen.",
      },
      {
        q: "Quel peuple a construit Stonehenge ?",
        choices: ['Les Romains', 'Les Celtes', 'Les Druides', 'Mystère encore non résolu'],
        answer: 3,
        anecdote: "L'identité exacte des constructeurs de Stonehenge (-3000 av. J.-C.) reste un mystère. Probablement des populations néolithiques.",
      },
      {
        q: "Qui a proposé que la Terre tournait autour du Soleil ?",
        choices: ['Galilée', 'Copernic', 'Kepler', 'Brahe'],
        answer: 1,
        anecdote: "Copernic a publié sa théorie héliocentrique en 1543, juste avant sa mort. Galilée l'a confirmée et a été condamné par l'Église.",
      },
      {
        q: "Quel empire était gouverné par Napoléon Bonaparte ?",
        choices: ["Empire romain", "Premier Empire français", "Empire ottoman", "Empire colonial"],
        answer: 1,
        anecdote: "Napoléon s'est lui-même couronné Empereur en 1804. Le Code civil qu'il a réformé est encore en vigueur dans de nombreux pays.",
      },
    ],
  },
};

export function buildQuestions(selectedCategoryKeys, count) {
  let pool = [];
  for (const key of selectedCategoryKeys) {
    const cat = quizCategories[key];
    if (cat) {
      pool = pool.concat(cat.questions.map((q) => ({ ...q, categoryKey: key, categoryLabel: cat.label, categoryColor: cat.color, categoryEmoji: cat.emoji })));
    }
  }
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
