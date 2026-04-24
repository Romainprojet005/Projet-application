const _usedIndices = {};

export const quizCategories = {
  culture: {
    label: 'Culture G.',
    emoji: '🧠',
    color: '#8B5CF6',
    questions: [
      { q: 'Combien de côtés a un hexagone ?', choices: ['5','6','7','8'], answer: 1, anecdote: "L'hexagone est aussi le surnom de la France métropolitaine, car sa forme y ressemble." },
      { q: 'Quel est le pays le plus peuplé du monde ?', choices: ['Chine','Inde','États-Unis','Indonésie'], answer: 1, anecdote: "En 2023, l'Inde a dépassé la Chine avec plus de 1,4 milliard d'habitants." },
      { q: 'Quel animal est le plus rapide sur terre ?', choices: ['Guépard','Lion','Autruche','Antilope'], answer: 0, anecdote: 'Le guépard peut atteindre 112 km/h sur de courtes distances, mais se fatigue très vite.' },
      { q: "Combien d'os compte le squelette d'un adulte ?", choices: ['196','206','216','226'], answer: 1, anecdote: "Les bébés naissent avec ~270 os qui fusionnent progressivement pour arriver à 206." },
      { q: 'Quel est le plus grand océan du monde ?', choices: ['Atlantique','Indien','Pacifique','Arctique'], answer: 2, anecdote: "L'océan Pacifique représente plus de 30% de la surface totale de la Terre." },
      { q: 'Quel est le métal le plus abondant dans la croûte terrestre ?', choices: ['Fer','Aluminium','Cuivre','Or'], answer: 1, anecdote: "L'aluminium représente environ 8% de la croûte terrestre." },
      { q: 'Quelle planète est surnommée la planète rouge ?', choices: ['Vénus','Jupiter','Mars','Saturne'], answer: 2, anecdote: "Mars doit sa couleur rouge à l'oxyde de fer (rouille) qui recouvre sa surface." },
      { q: "Quelle langue est la plus parlée au monde (tous locuteurs confondus) ?", choices: ['Mandarin','Anglais','Espagnol','Hindi'], answer: 1, anecdote: "L'anglais est 1er en comptant les locuteurs non-natifs. Le mandarin reste 1er en natifs." },
      { q: "En quelle année a débuté la Première Guerre mondiale ?", choices: ['1912','1914','1916','1918'], answer: 1, anecdote: "La guerre a débuté le 28 juillet 1914 après l'assassinat de l'archiduc François-Ferdinand." },
      { q: "Quel pays a la plus grande superficie au monde ?", choices: ['Russie','Canada','États-Unis','Chine'], answer: 0, anecdote: 'La Russie couvre plus de 17 millions de km², soit presque deux fois le Canada.' },
    ],
  },
  cinema: {
    label: 'Cinéma',
    emoji: '🎬',
    color: '#EC4899',
    questions: [
      { q: "Qui a réalisé 'Inception' (2010) ?", choices: ['Christopher Nolan','James Cameron','Denis Villeneuve','David Fincher'], answer: 0, anecdote: "Nolan a développé l'idée d'Inception pendant 10 ans avant de la réaliser." },
      { q: "Quel film Disney est le premier entièrement en CGI ?", choices: ["A Bug's Life",'Toy Story','Monsters Inc.','Finding Nemo'], answer: 1, anecdote: 'Toy Story (1995) est le premier long métrage entièrement réalisé en images de synthèse.' },
      { q: "Qui joue le Joker dans 'The Dark Knight' (2008) ?", choices: ['Joaquin Phoenix','Heath Ledger','Jack Nicholson','Jared Leto'], answer: 1, anecdote: "Heath Ledger a remporté l'Oscar à titre posthume. Il s'était enfermé seul dans une chambre pour préparer le rôle." },
      { q: "Quel film a remporté l'Oscar du Meilleur Film en 2020 ?", choices: ['1917','Joker','Parasite','Once Upon a Time in Hollywood'], answer: 2, anecdote: "Parasite est le premier film non-anglophone à remporter l'Oscar du Meilleur Film." },
      { q: "Quel acteur joue Iron Man dans le MCU ?", choices: ['Robert Downey Jr.','Chris Evans','Chris Hemsworth','Mark Ruffalo'], answer: 0, anecdote: "RDJ a failli ne pas obtenir le rôle. C'est le réalisateur Jon Favreau qui a insisté." },
      { q: "Quel réalisateur a tourné 'Pulp Fiction' et 'Kill Bill' ?", choices: ['Martin Scorsese','David Fincher','Quentin Tarantino','Guy Ritchie'], answer: 2, anecdote: 'Tarantino est aussi acteur et apparaît dans presque tous ses propres films.' },
      { q: "Dans quel film Tom Hanks survit avec un ballon de volley 'Wilson' ?", choices: ['The Blue Lagoon','Cast Away','Uncharted','The Beach'], answer: 1, anecdote: 'Tom Hanks a pris 25 kg pour le début du film puis les a perdus pour montrer l\'état du naufragé.' },
      { q: "Qui a composé la musique de la saga Star Wars ?", choices: ['Hans Zimmer','John Williams','Ennio Morricone','Howard Shore'], answer: 1, anecdote: "John Williams a remporté 5 Oscars. Il a aussi composé Jaws, Indiana Jones et Harry Potter." },
      { q: "Quel est le film le plus rentable de tous les temps ?", choices: ['Avatar','Avengers: Endgame','Titanic','Star Wars VII'], answer: 0, anecdote: 'Avatar (2009) a rapporté 2,9 milliards de dollars. Sa suite en 2022, 2,3 milliards.' },
      { q: "Dans 'Forrest Gump', avec quoi compare-t-il la vie ?", choices: ['Un long fleuve','Une boîte de chocolats','Une plume au vent','Un marathon'], answer: 1, anecdote: "La phrase exacte : 'Life was like a box of chocolats, you never know what you're gonna get.'" },
    ],
  },
  musique: {
    label: 'Musique',
    emoji: '🎵',
    color: '#F59E0B',
    questions: [
      { q: "Quel groupe a chanté 'Bohemian Rhapsody' ?", choices: ['Led Zeppelin','The Beatles','Queen','Rolling Stones'], answer: 2, anecdote: "Bohemian Rhapsody (1975) a été le 1er clip diffusé à la TV pour promouvoir un single." },
      { q: 'En quelle année The Beatles se sont-ils séparés ?', choices: ['1968','1970','1972','1975'], answer: 1, anecdote: 'La séparation officielle fut annoncée par Paul McCartney en avril 1970.' },
      { q: "De quel pays vient le groupe ABBA ?", choices: ['Danemark','Norvège','Suède','Finlande'], answer: 2, anecdote: "ABBA = initiales des 4 membres : Agnetha, Björn, Benny, Anni-Frid." },
      { q: "Quel instrument joue Jimi Hendrix ?", choices: ['Batterie','Basse','Guitare','Piano'], answer: 2, anecdote: 'Hendrix était gaucher et jouait sur une guitare droite retournée et re-cordée.' },
      { q: "Quel chanteur français est surnommé 'Le Taulier' ?", choices: ['Stromae','Johnny Hallyday','Francis Cabrel','Charles Aznavour'], answer: 1, anecdote: "Johnny Hallyday a vendu plus de 110 millions d'albums en 60 ans de carrière." },
      { q: "Quelle chanson de Michael Jackson a le plus grand nombre de ventes ?", choices: ['Bad','Thriller','Billie Jean','Smooth Criminal'], answer: 1, anecdote: "L'album Thriller est le plus vendu de l'histoire de la musique (~70M d'exemplaires)." },
      { q: "Dans quelle ville se déroule le festival de Coachella ?", choices: ['Los Angeles','San Francisco','Indio','Las Vegas'], answer: 2, anecdote: 'Coachella se tient dans le désert de Californie, à Indio, depuis 1999.' },
      { q: "Quel artiste détient le record du plus grand nombre de Grammys (32) ?", choices: ['Beyoncé','Taylor Swift','Adele','Lady Gaga'], answer: 0, anecdote: "Beyoncé est la plus titrée de l'histoire des Grammy Awards avec 32 récompenses." },
      { q: "Quel est le vrai nom de Lady Gaga ?", choices: ['Stephanie Bennett','Stefani Germanotta','Sandra Cortez','Sylvia Gaston'], answer: 1, anecdote: 'Stefani Joanne Angelina Germanotta de son vrai nom, née en 1986 à New York.' },
      { q: "De quel pays vient le style musical 'bossa nova' ?", choices: ['Argentine','Cuba','Brésil','Colombie'], answer: 2, anecdote: "La bossa nova est née à Rio de Janeiro à la fin des années 1950, fusion de samba et jazz." },
    ],
  },
  sport: {
    label: 'Sport',
    emoji: '⚽',
    color: '#10B981',
    questions: [
      { q: 'Combien de joueurs y a-t-il dans une équipe de basketball sur le terrain ?', choices: ['4','5','6','7'], answer: 1, anecdote: '5 joueurs par équipe sur le terrain. Les équipes ont généralement 12-15 joueurs au total.' },
      { q: 'Quel pays a remporté la Coupe du Monde 2018 en Russie ?', choices: ['Argentine','Brésil','France','Allemagne'], answer: 2, anecdote: "La France a battu la Croatie 4-2 en finale. C'était son 2e titre mondial." },
      { q: "Quel joueur a remporté le plus de titres du Grand Chelem en tennis ?", choices: ['Roger Federer','Rafael Nadal','Novak Djokovic','Pete Sampras'], answer: 2, anecdote: 'Djokovic détient 24 titres du Grand Chelem, record absolu.' },
      { q: 'Dans quel pays les Jeux Olympiques modernes ont-ils été créés en 1896 ?', choices: ['France','Grèce','États-Unis','Angleterre'], answer: 1, anecdote: 'Les 1ers JO modernes se sont tenus à Athènes en 1896, grâce à Pierre de Coubertin.' },
      { q: "Quel club de football a remporté le plus de Ligues des Champions ?", choices: ['FC Barcelone','Bayern Munich','Real Madrid','Liverpool'], answer: 2, anecdote: 'Le Real Madrid a remporté 15 Ligues des Champions, un record absolu.' },
      { q: 'En quelle année Zidane a-t-il donné son coup de tête en finale de Coupe du Monde ?', choices: ['2002','2004','2006','2008'], answer: 2, anecdote: "La finale France-Italie de 2006 s'est terminée aux tirs au but. Zidane venait d'être Ballon d'Or." },
      { q: "Combien d'étapes compte le Tour de France ?", choices: ['18','19','20','21'], answer: 3, anecdote: 'Le Tour de France compte 21 étapes chaque année depuis 1913.' },
      { q: "Quel sport se joue avec un volant ?", choices: ['Tennis','Squash','Badminton','Pelote basque'], answer: 2, anecdote: "Le badminton est l'un des sports les plus rapides du monde, avec des volants à +300 km/h." },
      { q: "En combien de sets se joue un match de tennis (Grand Chelem hommes) ?", choices: ['3 sets','4 sets','5 sets','6 sets'], answer: 2, anecdote: "Les hommes jouent en 5 sets maximum en Grand Chelem. Les femmes en 3 sets." },
      { q: "Quel pays a remporté le plus de Coupes du Monde de football ?", choices: ['Allemagne','Argentine','Brésil','France'], answer: 2, anecdote: 'Le Brésil est 5 fois champion du monde (1958, 1962, 1970, 1994, 2002).' },
    ],
  },
  geo: {
    label: 'Géographie',
    emoji: '🌍',
    color: '#0EA5E9',
    questions: [
      { q: "Quelle est la capitale de l'Australie ?", choices: ['Sydney','Melbourne','Canberra','Brisbane'], answer: 2, anecdote: 'Canberra a été fondée en 1913 comme compromis entre Sydney et Melbourne.' },
      { q: "Quel est le plus long fleuve du monde ?", choices: ['Amazone','Nil','Mississippi','Yangtsé'], answer: 1, anecdote: "Le Nil mesure 6 650 km. L'Amazone a cependant le plus grand débit d'eau." },
      { q: "Quelle est la plus grande île du monde ?", choices: ['Madagascar','Nouvelle-Guinée','Groenland','Bornéo'], answer: 2, anecdote: 'Le Groenland (2 166 000 km²) est 3 fois plus grand que la 2e plus grande île.' },
      { q: "Quel pays possède le plus long littoral au monde ?", choices: ['Russie','Canada','Australie','Norvège'], answer: 1, anecdote: "Le Canada possède 202 080 km de côtes, soit 15% du littoral mondial." },
      { q: "Dans quel pays se trouve le Machu Picchu ?", choices: ['Bolivie','Chili','Pérou','Colombie'], answer: 2, anecdote: "Le Machu Picchu (Pérou) est une ancienne cité inca construite vers 1450." },
      { q: "Quel pays est surnommé 'La botte' ?", choices: ['Grèce','Portugal','Espagne','Italie'], answer: 3, anecdote: "La forme de l'Italie ressemble effectivement à une botte sur les cartes." },
      { q: "Combien y a-t-il de pays en Afrique ?", choices: ['44','48','54','60'], answer: 2, anecdote: "L'Afrique compte 54 pays reconnus par l'ONU, dont le Soudan du Sud (2011)." },
      { q: "Quelle est la ville la plus peuplée du monde ?", choices: ['Shanghai','Pékin','Tokyo','Mumbai'], answer: 2, anecdote: "Tokyo (Greater Tokyo) est la plus grande zone urbaine avec ~37 millions d'habitants." },
      { q: "Quel est le plus petit pays du monde ?", choices: ['Monaco','San Marin','Liechtenstein','Vatican'], answer: 3, anecdote: 'Le Vatican (0,44 km²) est le plus petit État souverain du monde.' },
      { q: "Quel continent est le plus grand ?", choices: ['Amérique','Afrique','Asie','Europe'], answer: 2, anecdote: "L'Asie couvre 44 millions de km², soit 30% des terres émergées de la planète." },
    ],
  },
  science: {
    label: 'Science',
    emoji: '🔬',
    color: '#6366F1',
    questions: [
      { q: "Quel est le symbole chimique de l'or ?", choices: ['Au','Ag','Fe','Or'], answer: 0, anecdote: "Au vient du latin 'Aurum'. L'argent (Ag) vient d'Argentum." },
      { q: "Combien de chromosomes possède une cellule humaine normale ?", choices: ['23','44','46','48'], answer: 2, anecdote: "23 paires = 46 chromosomes. Le spermatozoïde et l'ovule n'en ont que 23 chacun." },
      { q: "Quelle est la vitesse de la lumière dans le vide ?", choices: ['200 000 km/s','300 000 km/s','400 000 km/s','150 000 km/s'], answer: 1, anecdote: "299 792 km/s exactement. Aucune information ne peut voyager plus vite." },
      { q: "Quel scientifique a découvert la pénicilline ?", choices: ['Marie Curie','Louis Pasteur','Alexander Fleming','Albert Einstein'], answer: 2, anecdote: "Alexander Fleming a découvert la pénicilline en 1928 par accident." },
      { q: "Quelle planète tourne sur le côté (axe incliné à 98°) ?", choices: ['Saturne','Neptune','Uranus','Jupiter'], answer: 2, anecdote: "Uranus tourne pratiquement sur son côté, probablement suite à une collision ancienne." },
      { q: "Quel élément est le plus abondant dans l'univers ?", choices: ['Oxygène','Carbone','Hélium','Hydrogène'], answer: 3, anecdote: "L'hydrogène représente environ 75% de la masse baryonique de l'univers observable." },
      { q: "Combien de neurones contient le cerveau humain ?", choices: ['1 milliard','10 milliards','86 milliards','1 000 milliards'], answer: 2, anecdote: "Le cerveau contient environ 86 milliards de neurones et autant de cellules gliales." },
      { q: "Quelle est la formule chimique de l'eau ?", choices: ['HO','H2O','H2O2','H3O'], answer: 1, anecdote: "H2O : 2 atomes d'hydrogène liés à 1 atome d'oxygène. Simple mais vital !" },
      { q: "Quel os est le plus long du corps humain ?", choices: ['Radius','Humérus','Tibia','Fémur'], answer: 3, anecdote: "Le fémur (os de la cuisse) peut mesurer jusqu'à 50 cm et est aussi le plus solide." },
      { q: "En quelle année Einstein a-t-il publié sa théorie de la relativité restreinte ?", choices: ['1895','1900','1905','1915'], answer: 2, anecdote: "En 1905, dite 'annus mirabilis', Einstein a publié 4 articles révolutionnaires." },
    ],
  },
  histoire: {
    label: 'Histoire',
    emoji: '📜',
    color: '#DC2626',
    questions: [
      { q: "En quelle année a débuté la Révolution française ?", choices: ['1787','1789','1791','1793'], answer: 1, anecdote: "La prise de la Bastille le 14 juillet 1789 est le symbole de la Révolution." },
      { q: "Qui était le premier président des États-Unis ?", choices: ['John Adams','Benjamin Franklin','George Washington','Thomas Jefferson'], answer: 2, anecdote: "George Washington a été président de 1789 à 1797 et a refusé un 3e mandat." },
      { q: "En quelle année le mur de Berlin est-il tombé ?", choices: ['1987','1989','1991','1993'], answer: 1, anecdote: "Le 9 novembre 1989, des milliers de Berlinois ont commencé à démolir le mur." },
      { q: "Qui a découvert l'Amérique en 1492 ?", choices: ['Amerigo Vespucci','Christophe Colomb','Vasco de Gama','Magellan'], answer: 1, anecdote: "Colomb cherchait une route vers l'Asie et ne savait pas avoir découvert un nouveau continent." },
      { q: "En quelle année la Première Guerre mondiale a-t-elle pris fin ?", choices: ['1916','1917','1918','1919'], answer: 2, anecdote: "L'armistice a été signé le 11 novembre 1918 à 11h, d'où les commémorations du 11 novembre." },
      { q: "Quel empire était le plus étendu de l'histoire ?", choices: ["Empire romain","Empire mongol","Empire britannique","Empire ottoman"], answer: 2, anecdote: "L'Empire britannique couvrait 24% des terres émergées et 23% de la population mondiale." },
      { q: "Qui a commandé les forces alliées lors du Débarquement en Normandie (1944) ?", choices: ['Patton','MacArthur','Eisenhower','Montgomery'], answer: 2, anecdote: "Le général Eisenhower commandait les forces alliées (SHAEF). Il deviendra ensuite président des USA." },
      { q: "Quelle civilisation a construit les pyramides de Gizeh ?", choices: ['Sumérienne','Mésopotamienne','Égyptienne','Grecque'], answer: 2, anecdote: "La Grande Pyramide de Khéops, construite vers 2560 av. J.-C., est l'une des 7 merveilles du monde." },
      { q: "En quelle année a eu lieu la Révolution russe bolchévique ?", choices: ['1905','1914','1917','1920'], answer: 2, anecdote: "La Révolution d'octobre 1917 a porté Lénine au pouvoir et conduit à la création de l'URSS." },
      { q: "Quel est le nom de la bombe atomique larguée sur Hiroshima ?", choices: ['Fat Man','Little Boy','Big Bang','Thin Man'], answer: 1, anecdote: "Little Boy (bombe à uranium) sur Hiroshima le 6 août 1945. Fat Man (plutonium) sur Nagasaki le 9." },
    ],
  },
  disney: {
    label: 'Disney',
    emoji: '🏰',
    color: '#E879F9',
    questions: [
      { q: "Quel est le nom du père de Simba dans Le Roi Lion ?", img: 'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg', choices: ['Scar','Mufasa','Rafiki','Timon'], answer: 1, anecdote: "Mufasa signifie 'roi' en langue Manazoto. L'histoire est librement inspirée de Hamlet de Shakespeare." },
      { q: "Comment s'appelle la reine aux pouvoirs de glace dans La Reine des Neiges ?", img: 'https://upload.wikimedia.org/wikipedia/en/0/05/Frozen_%282013_film%29_poster.jpg', choices: ['Anna','Elsa','Kristoff','Olaf'], answer: 1, anecdote: "Elsa est inspirée de la 'Reine des Neiges' de Hans Christian Andersen, mais totalement réinventée par Disney." },
      { q: "Quel acteur a prêté sa voix au Génie dans Aladdin (1992, VO) ?", img: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Aladdin_%281992_Disney_film%29_poster.jpg', choices: ['Eddie Murphy','Robin Williams','Jim Carrey','Steve Martin'], answer: 1, anecdote: "Robin Williams a improvisé la majorité de ses répliques. Le rôle du Génie a été écrit spécialement pour lui." },
      { q: "Comment s'appelle la petite sirène dans le film Disney de 1989 ?", img: 'https://upload.wikimedia.org/wikipedia/en/0/04/The_Little_Mermaid_%281989_film%29_poster.jpg', choices: ['Marina','Coral','Ariel','Melody'], answer: 2, anecdote: "Ariel est la première princesse Disney à forte personnalité. Son histoire est inspirée d'Hans Christian Andersen." },
      { q: "Quel objet enchanté symbolise la malédiction dans La Belle et la Bête ?", img: 'https://upload.wikimedia.org/wikipedia/en/7/71/Beauty_and_the_Beast_Poster.jpg', choices: ['Un miroir magique','Un livre enchanté','Une rose enchantée','Une épée magique'], answer: 2, anecdote: "La rose représente le temps qu'il reste à la Bête pour trouver l'amour avant que tous ses pétales tombent." },
      { q: "Quel demi-dieu aide Vaiana dans ses aventures en mer ?", img: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Moana_%282016_film%29_poster.jpg', choices: ['Tamatoa','Te Kā','Hei Hei','Maui'], answer: 3, anecdote: "Maui est doublé en VO par Dwayne 'The Rock' Johnson. Il est basé sur le dieu polynésien du même nom." },
      { q: "Quel est le pouvoir des cheveux de Raiponce ?", img: 'https://upload.wikimedia.org/wikipedia/en/9/91/Tangled_poster.jpg', choices: ["Donnent la force","Guérissent et rajeunissent","Permettent de voler","Produisent de la lumière"], answer: 1, anecdote: "Quand ses cheveux sont coupés, ils perdent leur pouvoir et deviennent bruns. La chanson 'Je veux y croire' est culte." },
      { q: "Quel est le nom du dragon rouge de Mulan ?", img: 'https://upload.wikimedia.org/wikipedia/en/1/11/Mulan-1998-movie-poster.jpg', choices: ['Long','Cri-Kee','Shang','Mushu'], answer: 3, anecdote: "Mushu est un petit dragon déchu qui veut se racheter. En VO, il est doublé par Eddie Murphy." },
      { q: "Quel est le numéro d'expérience de Stitch ?", img: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Lilo_%26_Stitch_poster.jpg', choices: ['316','526','626','696'], answer: 2, anecdote: "L'Expérience 626 a été créée par le Professeur Jumba Jookiba pour être indestructible et causer le chaos." },
      { q: "Quel est le célèbre slogan de Buzz l'Éclair ?", img: 'https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg', choices: ["Vers l'infini et au-delà !",'Je serai là pour toi !',"À l'aventure cowboy !",'On est partis !'], answer: 0, anecdote: "'To Infinity and Beyond!' est l'une des phrases les plus célèbres du cinéma d'animation." },
      { q: "Comment s'appelle le poisson amnésique ami de Nemo ?", img: 'https://upload.wikimedia.org/wikipedia/en/2/29/Finding_Nemo.jpg', choices: ['Gill','Pearl','Gurgle','Dory'], answer: 3, anecdote: "Dory souffre de perte de mémoire à court terme. Elle a eu son propre film en 2016 : 'Le Monde de Dory'." },
      { q: "Quel est le nom de l'ours du Livre de la Jungle ?", img: 'https://upload.wikimedia.org/wikipedia/en/b/bf/The_Jungle_Book_%281967_film%29.jpg', choices: ['Bagheera','Shere Khan','Kaa','Baloo'], answer: 3, anecdote: "Baloo enseigne à Mowgli les nécessités de la vie. Sa chanson 'The Bare Necessities' est iconique." },
      { q: "Combien de nains accompagnent Blanche-Neige ?", img: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Snow_White_1937_film_poster.jpg', choices: ['5','6','7','8'], answer: 2, anecdote: "Les 7 nains : Simplet, Grincheux, Joyeux, Dormeur, Timide, Atchoum et Prof." },
      { q: "À quelle heure la magie de Cendrillon prend-elle fin ?", img: 'https://upload.wikimedia.org/wikipedia/en/5/58/Cinderella_%281950_film%29.jpg', choices: ['À 23h','À minuit','À 1h du matin',"À l'aube"], answer: 1, anecdote: "Cendrillon (1950) a sauvé Disney de la faillite : coûtant 3M$, il a rapporté 85M$." },
      { q: "Comment s'appelle la vilaine de La Belle au Bois Dormant ?", img: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Sleeping_Beauty_%281959_film%29.jpg', choices: ['Ursula','La Sorcière','Gothel','Maléfique'], answer: 3, anecdote: "Maléfique est souvent citée comme la meilleure vilaine Disney. Son nom vient du latin 'maleficus'." },
    ],
  },
  cuisine: {
    label: 'Cuisine',
    emoji: '🍕',
    color: '#F97316',
    questions: [
      { q: "Dans quelle cuisine est né le sushi ?", choices: ['Thaïlandaise','Japonaise','Coréenne','Chinoise'], answer: 1, anecdote: "Le sushi moderne sous sa forme actuelle est apparu à Tokyo au début du XIXe siècle." },
      { q: "Quelle épice est la plus chère au monde au kilo ?", choices: ['Vanille','Truffe','Safran','Cardamome'], answer: 2, anecdote: "Le safran peut coûter jusqu'à 30 000€/kg. Il faut 150 000 fleurs pour en produire 1 kg." },
      { q: "De quel pays vient la paella ?", choices: ['Portugal','Mexique','Espagne','Italie'], answer: 2, anecdote: "La paella est originaire de Valence, en Espagne. La recette traditionnelle contient du lapin." },
      { q: "Quel fruit contient une enzyme qui empêche la gélatine de prendre ?", choices: ['Ananas','Mangue','Papaye','Kiwi'], answer: 0, anecdote: "La broméline de l'ananas frais dégrade les protéines de la gélatine. Cuit, ce n'est plus un problème." },
      { q: "De quel pays vient le fromage Gouda ?", choices: ['Belgique','France','Pays-Bas','Allemagne'], answer: 2, anecdote: "Gouda est une ville des Pays-Bas. Le fromage y était commercialisé depuis le Moyen Âge." },
      { q: "Quel est le temps de cuisson d'un œuf à la coque ?", choices: ['3 min','6 min','9 min','12 min'], answer: 0, anecdote: "3 minutes dans l'eau bouillante : le blanc est cuit, le jaune encore coulant." },
      { q: "Dans quelle ville est né le croissant ?", choices: ['Paris','Vienne','Budapest','Lyon'], answer: 1, anecdote: "Le croissant est d'origine viennoise (Autriche), importé en France par Marie-Antoinette." },
      { q: "Quelle est l'épice principale du curry ?", choices: ['Cumin','Cardamome','Curcuma','Coriandre'], answer: 2, anecdote: "Le curcuma donne sa couleur jaune caractéristique au curry. Il est aussi réputé anti-inflammatoire." },
      { q: "De quel pays vient le tiramisu ?", choices: ['Grèce','France','Espagne','Italie'], answer: 3, anecdote: "Le tiramisu (qui signifie 'remonte-moi le moral') est originaire de Vénétie, en Italie." },
      { q: "Quelle boisson alcoolisée est faite à base d'agave ?", choices: ['Rhum','Vodka','Tequila','Gin'], answer: 2, anecdote: "La tequila est produite à partir de l'agave bleu, dans la région de Jalisco au Mexique." },
    ],
  },
  hot: {
    label: 'Hot',
    emoji: '🔞',
    color: '#EF4444',
    adult: true,
    questions: [
      { q: "Quelle est la durée moyenne d'un rapport sexuel selon les études scientifiques ?", choices: ['1-2 min','5-7 min','15-20 min','30 min'], answer: 1, anecdote: "Une étude du Journal of Sexual Medicine (2005) indique une durée moyenne de 5,4 min — bien loin des films !" },
      { q: "Dans quel film y a-t-il la célèbre scène d'orgasme simulé au restaurant ?", choices: ['Pretty Woman','Basic Instinct','Quand Harry rencontre Sally','9 semaines et demie'], answer: 2, anecdote: "'Je prendrai la même chose qu'elle !' — tournée au Katz's Deli à New York qui a depuis installé une plaque commémorative." },
      { q: "Quelle hormone est principalement responsable de la libido chez les deux sexes ?", choices: ['Ocytocine','Testostérone','Dopamine','Œstrogène'], answer: 1, anecdote: "La testostérone (présente chez les deux sexes) est le principal moteur du désir. Les femmes en produisent 10x moins que les hommes." },
      { q: "Dans le Kama Sutra, combien d'actes (angas) sont décrits ?", choices: ['16','36','64','108'], answer: 2, anecdote: "Le Kama Sutra décrit 64 actes, mais est avant tout un traité philosophique sur l'amour et la vie en société." },
      { q: "Quel pays a été le premier à légaliser le mariage homosexuel ?", choices: ['Suède','Canada','Pays-Bas','Espagne'], answer: 2, anecdote: "Les Pays-Bas ont légalisé le mariage homosexuel le 1er avril 2001, premiers au monde." },
      { q: "Quel acteur s'est inspiré de sa propre expérience de strip-teaseur pour 'Magic Mike' ?", choices: ['Ryan Reynolds','Channing Tatum','Chris Evans','Zac Efron'], answer: 1, anecdote: "Channing Tatum a été strip-teaseur à 18 ans à Tampa, Floride. Il a co-produit le film pour raconter cette période." },
      { q: "Quelle célébrité vend des sex-toys via sa marque de bien-être 'Goop' ?", choices: ['Kim Kardashian','Gwyneth Paltrow','Jennifer Lopez','Bella Hadid'], answer: 1, anecdote: "Gwyneth Paltrow via Goop vend également des bougies à l'odeur 'de son vagin' à 75€ — sold-out en quelques heures." },
      { q: "Quelle est la capitale mondiale de l'industrie du film adulte ?", choices: ['Hollywood','Las Vegas','San Fernando Valley','Miami'], answer: 2, anecdote: "La San Fernando Valley (banlieue de L.A.) abrite la majorité des studios X américains depuis les années 80." },
      { q: "Quel était le vrai métier de la femme qui a inspiré le personnage de Pretty Woman ?", choices: ['Strip-teaseuse','Escort','Barmaid','Serveuse'], answer: 1, anecdote: "Le scénario original s'appelait '3000' (le prix de la nuit) et ne finissait pas bien pour Vivian." },
      { q: "Quelle zone érogène est la plus méconnue selon une étude de 2016 ?", choices: ['Le cou','Le lobe de l\'oreille','La nuque','Le clitoris interne'], answer: 3, anecdote: "L'anatomie complète du clitoris (10-12 cm sous la peau) n'a été modélisée en 3D qu'en 2016." },
    ],
  },
};

export function buildQuestions(selectedCategories, count) {
  const pool = [];
  selectedCategories.forEach((key) => {
    const cat = quizCategories[key];
    if (!cat) return;
    if (!_usedIndices[key]) _usedIndices[key] = new Set();
    let avail = cat.questions
      .map((q, i) => ({ ...q, cat: key, _i: i }))
      .filter((q) => !_usedIndices[key].has(q._i));
    if (!avail.length) {
      _usedIndices[key].clear();
      avail = cat.questions.map((q, i) => ({ ...q, cat: key, _i: i }));
    }
    pool.push(...avail);
  });
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const selected = pool.slice(0, count);
  selected.forEach((q) => {
    if (!_usedIndices[q.cat]) _usedIndices[q.cat] = new Set();
    _usedIndices[q.cat].add(q._i);
  });
  return selected;
}

export function getCategories() {
  return quizCategories;
}
