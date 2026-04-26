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
      { q: 'Quelle est la monnaie officielle du Japon ?', choices: ['Yen','Won','Yuan','Baht'], answer: 0, anecdote: "Le yen (¥) est la 3e monnaie de réserve mondiale. Son nom signifie 'cercle' en japonais." },
      { q: 'Combien de cordes a une guitare classique ?', choices: ['4','5','6','7'], answer: 2, anecdote: '6 cordes accordées (grave→aigu) : mi, la, ré, sol, si, mi. La basse électrique en a généralement 4.' },
      { q: "Quel est le plus grand pays d'Afrique en superficie ?", choices: ['Nigeria','Algérie','RDC','Soudan'], answer: 1, anecdote: "L'Algérie (2,38M km²) est le plus grand pays d'Afrique depuis l'indépendance du Soudan du Sud en 2011." },
      { q: 'Combien de pattes a une araignée ?', choices: ['6','8','10','12'], answer: 1, anecdote: 'Les araignées sont des arachnides (8 pattes), pas des insectes (6 pattes).' },
      { q: "Quel est le symbole chimique de l'argent ?", choices: ['Ag','Ar','Si','Al'], answer: 0, anecdote: "Ag vient du latin 'Argentum'. L'Argentine tire son nom de ce métal précieux." },
      { q: 'Quelle est la capitale du Canada ?', choices: ['Toronto','Montréal','Vancouver','Ottawa'], answer: 3, anecdote: 'Ottawa est la capitale depuis 1857, choisie par la reine Victoria comme compromis entre Toronto et Montréal.' },
      { q: 'Quel est le nom du plus grand satellite de Saturne ?', choices: ['Titan','Europe','Ganymède','Callisto'], answer: 0, anecdote: 'Titan est plus grand que Mercure et possède une atmosphère dense. Il pourrait un jour abriter de la vie.' },
      { q: "En quelle année a été fondée l'ONU ?", choices: ['1943','1945','1947','1950'], answer: 1, anecdote: "L'ONU a été créée le 24 octobre 1945, après la Seconde Guerre mondiale, par 51 pays fondateurs." },
      { q: 'Quel insecte produit de la soie ?', choices: ['Abeille','Ver à soie','Fourmi','Mante religieuse'], answer: 1, anecdote: 'Le ver à soie (larve du bombyx du mûrier) peut produire jusqu\'à 900 m de fil de soie en un seul cocon.' },
      { q: 'Quelle est la capitale de la Nouvelle-Zélande ?', choices: ['Auckland','Christchurch','Wellington','Dunedin'], answer: 2, anecdote: "Wellington est la capitale depuis 1865. Auckland est la plus grande ville, mais Wellington est plus centrale." },
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
      { q: "Quel film de Pixar met en scène un robot nettoyeur sur une Terre abandonnée ?", choices: ['Cars','WALL-E','Ratatouille','Brave'], answer: 1, anecdote: "WALL-E (2008) critique la surconsommation avec très peu de dialogues. Un chef-d'œuvre de Pixar." },
      { q: "Qui joue Wolverine dans la saga X-Men pendant 17 ans ?", choices: ['Hugh Jackman','Tom Hardy','Chris Pratt','Josh Brolin'], answer: 0, anecdote: "Hugh Jackman a incarné Wolverine de 2000 à 2024, un record de longévité pour un super-héros." },
      { q: "Dans quel film entend-on 'I'll be back' (Je serai de retour) ?", choices: ['RoboCop','Terminator','Predator','Total Recall'], answer: 1, anecdote: "Schwarzenegger dans Terminator (1984). L'une des répliques les plus cultes de l'histoire du cinéma." },
      { q: "Qui joue Jack Sparrow dans Pirates des Caraïbes ?", choices: ['Orlando Bloom','Johnny Depp','Jude Law','Colin Farrell'], answer: 1, anecdote: "Johnny Depp s'est inspiré de Keith Richards des Rolling Stones pour créer ce personnage excentrique." },
      { q: "Dans quel film Bruce Willis dit-il 'Yippee-ki-yay' ?", choices: ['The Fifth Element','Die Hard','Unbreakable','Sin City'], answer: 1, anecdote: "Die Hard (1988). Bruce Willis répète cette réplique culte dans chaque volet de la saga." },
      { q: "Quel film de Miyazaki suit une fillette dans un monde de dieux des bains ?", choices: ['Mon Voisin Totoro','Le Voyage de Chihiro','Princesse Mononoké','Nausicaä'], answer: 1, anecdote: "Le Voyage de Chihiro (2001) : premier film non-anglophone à recevoir l'Oscar du meilleur film d'animation." },
      { q: "Quel est le premier film à avoir reçu l'Oscar du meilleur film d'animation (2002) ?", choices: ['Monsters Inc.','Shrek','Lilo & Stitch','Ice Age'], answer: 1, anecdote: "Shrek a reçu le tout premier Oscar du meilleur film d'animation en 2002, devant Monsters Inc." },
      { q: "Qui réalise 'No Country for Old Men', Palme d'Or et 4 Oscars ?", choices: ['Tarantino','Nolan','Frères Coen','P.T. Anderson'], answer: 2, anecdote: "Joel et Ethan Coen ont adapté Cormac McCarthy. Javier Bardem est absolument terrifiant en Anton Chigurh." },
      { q: "Quelle actrice joue Lara Croft dans Tomb Raider (2001) ?", choices: ['Milla Jovovich','Angelina Jolie','Charlize Theron','Halle Berry'], answer: 1, anecdote: "Angelina Jolie a joué Lara Croft dans 2 films. Alicia Vikander a repris le rôle en 2018." },
      { q: "Dans quel film Tom Cruise joue-t-il un agent secret de la Division IMF ?", choices: ['Top Gun','Jerry Maguire','Mission: Impossible','Collateral'], answer: 2, anecdote: "Mission: Impossible (1996) a lancé la saga d'action. Tom Cruise réalise lui-même ses cascades les plus folles." },
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
      { q: "Comment s'appelle le premier album solo de Michael Jackson ?", choices: ['Off the Wall','Thriller','Bad','Dangerous'], answer: 0, anecdote: "Off the Wall (1979), produit par Quincy Jones, a lancé la carrière solo de Michael Jackson." },
      { q: "Quel groupe a sorti 'Nevermind' en 1991 ?", choices: ['Pearl Jam','Soundgarden','Nirvana','Alice in Chains'], answer: 2, anecdote: "Nevermind (1991) avec 'Smells Like Teen Spirit' a défini le mouvement grunge et propulsé Nirvana au sommet." },
      { q: "Qui est surnommé 'The Boss' dans le monde du rock ?", choices: ['Bob Dylan','Bruce Springsteen','Tom Petty','Neil Young'], answer: 1, anecdote: "Bruce Springsteen doit ce surnom à ses concerts marathons de 3 à 4 heures non-stop." },
      { q: "Dans quel pays est né Bob Marley ?", choices: ['Jamaïque','Barbade','Trinité-et-Tobago','Cuba'], answer: 0, anecdote: "Bob Marley est né à Nine Mile, Jamaïque, en 1945. Il a popularisé le reggae dans le monde entier." },
      { q: "Combien de membres comptent les Beatles ?", choices: ['3','4','5','6'], answer: 1, anecdote: "John Lennon, Paul McCartney, George Harrison, Ringo Starr. Pete Best et Stuart Sutcliffe ont quitté avant la gloire." },
      { q: "Quel rappeur américain est né à East Harlem le 17 juin 1971 ?", choices: ['Jay-Z','Tupac','Notorious B.I.G','Eminem'], answer: 0, anecdote: "Jay-Z (Shawn Carter), né à New York, est l'un des rappeurs les plus influents et riches au monde." },
      { q: "Quelle artiste porte le surnom de 'Queen of Pop' ?", choices: ['Rihanna','Madonna','Whitney Houston','Mariah Carey'], answer: 1, anecdote: "Madonna, active depuis les années 80, est l'artiste féminine la plus vendue de l'histoire de la musique." },
      { q: "Quel instrument joue le célèbre Yo-Yo Ma ?", choices: ['Violon','Alto','Violoncelle','Contrebasse'], answer: 2, anecdote: "Yo-Yo Ma est le violoncelliste le plus célèbre du monde. Il a joué à l'inauguration de Barack Obama." },
      { q: "Quelle artiste a sorti l'album 'Lemonade' en 2016 ?", choices: ['Rihanna','Beyoncé','Adele','Alicia Keys'], answer: 1, anecdote: "Lemonade de Beyoncé est une œuvre conceptuelle sur l'infidélité, la guérison et l'empowerment féminin." },
      { q: "De quel pays vient le groupe Daft Punk ?", choices: ['Royaume-Uni','Allemagne','France','États-Unis'], answer: 2, anecdote: "Daft Punk (Thomas Bangalter et Guy-Manuel de Homem-Christo) est né à Paris en 1993. Ils ont séparé en 2021." },
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
      { q: "Quel nageur a remporté le plus de médailles olympiques de l'histoire ?", choices: ['Ian Thorpe','Michael Phelps','Mark Spitz','Ryan Lochte'], answer: 1, anecdote: "Michael Phelps : 28 médailles olympiques dont 23 d'or — un record absolu probablement indépassable." },
      { q: "Dans quel sport pratique-t-on le 'dunk' ?", choices: ['Volley-ball','Basketball','Football américain','Handball'], answer: 1, anecdote: "Le dunk consiste à plonger le ballon dans le panier depuis au-dessus du cercle. Spectaculaire !" },
      { q: "Quel est le Grand Chelem de tennis joué sur gazon ?", choices: ['Roland Garros','Australian Open','US Open','Wimbledon'], answer: 3, anecdote: "Wimbledon (1877) est le plus ancien tournoi de tennis au monde et le seul joué sur gazon." },
      { q: "Quel boxeur était surnommé 'The Greatest' ?", choices: ['Joe Frazier','George Foreman','Muhammad Ali','Mike Tyson'], answer: 2, anecdote: "Muhammad Ali ('Je suis le plus grand !') est universellement considéré comme le plus grand boxeur de tous les temps." },
      { q: "Quel est le pays d'origine du judo ?", choices: ['Chine','Corée','Japon','Thaïlande'], answer: 2, anecdote: "Le judo a été créé en 1882 par Jigoro Kano à Tokyo. Il est sport olympique depuis les JO de Tokyo 1964." },
      { q: "Quel coureur cycliste a été déchu de ses 7 Tours de France pour dopage ?", choices: ['Eddy Merckx','Bernard Hinault','Miguel Indurain','Lance Armstrong'], answer: 3, anecdote: "Lance Armstrong a été déchu de ses titres 1999-2005 en 2012 après avoir avoué un dopage systématique." },
      { q: "En football américain, combien de points vaut un 'touchdown' ?", choices: ['3','5','6','7'], answer: 2, anecdote: "6 points pour le touchdown, puis 1 ou 2 points de conversion possible. Le field goal vaut 3 points." },
      { q: "Quel sport se pratique avec un volant en plumes ?", choices: ['Tennis','Squash','Badminton','Pelote basque'], answer: 2, anecdote: "Le badminton est l'un des sports les plus rapides au monde avec des volants dépassant 300 km/h." },
      { q: "Quel athlète a remporté 9 médailles d'or en sprint aux Jeux Olympiques ?", choices: ['Carl Lewis','Usain Bolt','Maurice Greene','Asafa Powell'], answer: 1, anecdote: "Usain Bolt (Jamaïque) détient les records du monde du 100m (9.58s) et du 200m (19.19s)." },
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
      { q: "Quel est le plus haut sommet du monde ?", choices: ['K2','Mont Blanc','Everest','Kilimandjaro'], answer: 2, anecdote: "L'Everest (8 849m) a été gravi pour la première fois le 29 mai 1953 par Hillary et Tenzing Norgay." },
      { q: "Quelle est la capitale de l'Espagne ?", choices: ['Barcelone','Séville','Madrid','Valence'], answer: 2, anecdote: "Madrid est la capitale de l'Espagne depuis 1561 et sa plus grande ville avec 3,3 millions d'habitants." },
      { q: "Quel fleuve traverse Paris ?", choices: ['Rhône','Loire','Marne','Seine'], answer: 3, anecdote: "La Seine traverse Paris sur 13 km. Elle prend sa source en Côte-d'Or et se jette dans la Manche." },
      { q: "Combien de pays font partie de l'Union Européenne ?", choices: ['25','27','28','30'], answer: 1, anecdote: "L'UE compte 27 membres depuis le Brexit du Royaume-Uni, effectif le 31 janvier 2020." },
      { q: "Quelle chaîne de montagnes sépare l'Europe de l'Asie ?", choices: ['Alpes','Carpates','Oural','Caucase'], answer: 2, anecdote: "L'Oural (2500 km de long) est la frontière géographique traditionnelle entre Europe et Asie." },
      { q: "Quel pays possède le plus de lacs au monde ?", choices: ['Russie','États-Unis','Canada','Finlande'], answer: 2, anecdote: "Le Canada abrite environ 60% des lacs du monde, soit plus de 2 millions de lacs." },
      { q: "Quelle est la mer la plus salée du monde ?", choices: ['Mer Morte','Mer Rouge','Mer Caspienne','Méditerranée'], answer: 0, anecdote: "La mer Morte (34% de sel) est 10× plus salée que l'océan. Il est physiquement impossible d'y couler !" },
      { q: "Quelle ville est surnommée 'La Cité Éternelle' ?", choices: ['Athènes','Rome','Paris','Istanbul'], answer: 1, anecdote: "Rome est surnommée la Cité Éternelle depuis l'Antiquité romaine, en référence à son importance millénaire." },
      { q: "Quel est le pays le plus petit d'Amérique du Sud ?", choices: ['Uruguay','Paraguay','Surinam','Guyana'], answer: 2, anecdote: "Le Surinam (163 820 km²) est le plus petit pays d'Amérique du Sud. Il fut colonie néerlandaise." },
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
      { q: "Quel scientifique a proposé la théorie de l'évolution par sélection naturelle ?", choices: ['Lamarck','Darwin','Mendel','Pasteur'], answer: 1, anecdote: "Charles Darwin a publié 'L'Origine des Espèces' en 1859, révolutionnant la biologie moderne." },
      { q: "Combien de dents a un adulte humain (sagesses comprises) ?", choices: ['28','30','32','36'], answer: 2, anecdote: "32 dents : 8 incisives, 4 canines, 8 prémolaires, 8 molaires dont 4 dents de sagesse." },
      { q: "Quelle partie du cerveau traite principalement les émotions ?", choices: ['Néocortex','Hippocampe','Amygdale','Cervelet'], answer: 2, anecdote: "L'amygdale (en forme d'amande) gère les émotions et les réponses de peur. Elle est essentielle à la survie." },
      { q: "Quel est l'os le plus petit du corps humain ?", choices: ['Étrier','Malleus','Incus','Radius'], answer: 0, anecdote: "L'étrier, dans l'oreille interne, mesure ~3mm et pèse 2,5mg. Le plus petit et le plus léger de tous." },
      { q: "Quelle planète a le plus de lunes dans le système solaire en 2023 ?", choices: ['Jupiter','Saturne','Uranus','Neptune'], answer: 1, anecdote: "Saturne : 146 lunes confirmées en 2023, devant Jupiter (95 lunes). Un record qui progresse chaque année." },
      { q: "Combien de temps met la lumière du Soleil pour atteindre la Terre ?", choices: ['1 min','8 min','15 min','1 heure'], answer: 1, anecdote: "8 min 20 s pour 150 millions de km. Si le Soleil disparaissait maintenant, on le verrait encore 8 min." },
      { q: "Quel gaz les plantes rejettent-elles lors de la photosynthèse ?", choices: ['CO2','O2','N2','H2'], answer: 1, anecdote: "Les plantes absorbent du CO2 et rejettent de l'O2 (oxygène) lors de la photosynthèse grâce à la lumière." },
      { q: "Quelle est la formule chimique de l'eau oxygénée ?", choices: ['H2O','H2O2','HO2','H3O'], answer: 1, anecdote: "H2O2 (peroxyde d'hydrogène). H2O est l'eau ordinaire. Un seul atome d'oxygène de plus change tout !" },
      { q: "Quel est l'ADN ?", choices: ['Acide désoxyribonucléique','Acide di-nucléique','Acide dé-ribosé','Acide désoxyribosé normalisé'], answer: 0, anecdote: "ADN = Acide DésoxyriboNucléique. Découvert en 1953 par Watson et Crick, il porte notre programme génétique." },
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
      { q: "Quel pharaon a fait construire la Grande Pyramide de Gizeh ?", choices: ['Ramsès II','Toutânkhamon','Khéops','Cléopâtre'], answer: 2, anecdote: "Khéops a fait construire la Grande Pyramide vers 2560 av. J.-C. Sa hauteur originale était de 146 mètres." },
      { q: "Quel traité a officiellement mis fin à la Première Guerre mondiale ?", choices: ['Traité de Paris','Traité de Versailles','Traité de Trianon','Armistice de Rethondes'], answer: 1, anecdote: "Le Traité de Versailles a été signé le 28 juin 1919, un an après l'armistice." },
      { q: "Qui a inventé la machine à vapeur moderne ?", choices: ['James Watt','Thomas Edison','George Stephenson','Nikola Tesla'], answer: 0, anecdote: "James Watt a breveté sa machine à vapeur en 1769, déclenchant la Révolution industrielle britannique." },
      { q: "En quelle année Napoléon a-t-il été exilé à Sainte-Hélène ?", choices: ['1812','1814','1815','1820'], answer: 2, anecdote: "Après Waterloo en juin 1815, Napoléon fut exilé à Sainte-Hélène, où il mourut en 1821." },
      { q: "Qui a assassiné Jules César ?", choices: ['Marc Antoine','Brutus et Cassius','Pompée','Octave'], answer: 1, anecdote: "Brutus et Cassius ont conduit la conjuration de 23 sénateurs aux Ides de Mars (15 mars -44 av. J.-C.)." },
      { q: "Quel pays a lancé le premier satellite artificiel, Spoutnik ?", choices: ['États-Unis','URSS','France','Chine'], answer: 1, anecdote: "L'URSS a lancé Spoutnik 1 le 4 octobre 1957, inaugurant la conquête spatiale et la guerre froide technologique." },
      { q: "En quelle année la France a-t-elle définitivement aboli l'esclavage ?", choices: ['1794','1815','1848','1865'], answer: 2, anecdote: "L'abolition définitive date du 27 avril 1848 sous Victor Schoelcher, lors de la IIe République." },
      { q: "Qui était le leader de la révolution cubaine aux côtés de Fidel Castro ?", choices: ['Che Guevara','Hugo Chavez','Salvador Allende','Daniel Ortega'], answer: 0, anecdote: "Che Guevara, le bras droit de Castro, est devenu une icône révolutionnaire mondiale après sa mort en 1967." },
      { q: "En quelle année a été signée la Déclaration des Droits de l'Homme et du Citoyen ?", choices: ['1776','1789','1793','1799'], answer: 1, anecdote: "La DDHC a été adoptée le 26 août 1789 par l'Assemblée nationale, deux semaines après la prise de la Bastille." },
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
      { q: "Quel est le nom du cheval de Raiponce ?", choices: ['Philippe','Maximus','Samson','Buck'], answer: 1, anecdote: "Maximus est un cheval de la garde royale qui voulait capturer Flynn Rider avant de devenir l'ami de Raiponce." },
      { q: "Dans Zootopie, quel métier exerce Judy Hopps ?", choices: ['Journaliste','Détective','Policière','Avocate'], answer: 2, anecdote: "Judy Hopps est la première lapine à intégrer la police de Zootopie. Elle enquête sur des disparitions mystérieuses." },
      { q: "Quel personnage dit 'Hakuna Matata' dans Le Roi Lion ?", choices: ['Simba','Scar','Timon et Pumbaa','Rafiki'], answer: 2, anecdote: "'Hakuna Matata' est une expression swahili signifiant 'aucun problème'. Timon (suricate) et Pumbaa (phacochère) l'enseignent à Simba." },
      { q: "Quel est le nom du méchant dans Coco (Pixar) ?", choices: ['Ernesto de la Cruz','Héctor','Miguel','Dante'], answer: 0, anecdote: "Ernesto de la Cruz est la star de musique révérée par Miguel... mais cache un sombre secret de trahison." },
      { q: "Dans quel film Disney voit-on la fameuse scène du spaghetti partagé ?", choices: ['Ratatouille','La Belle et la Bête','Les 101 Dalmatiens','Bambi'], answer: 1, anecdote: "La Belle et la Bête (1991) : la scène romantique du spaghetti partagé entre les deux personnages est iconique." },
      { q: "Comment s'appelle l'antagoniste principal de Toy Story 3 ?", choices: ['Lotso','Stinky Pete','Zurg','Sid'], answer: 0, anecdote: "Lotso (Lotso-Hugs Bear) est l'ours en peluche rose au parfum de fraise qui dirige la garderie Sunnyside avec autorité." },
      { q: "Dans 'Soul' (Pixar), que cherche Joe Gardner avant tout ?", choices: ["L'amour","Sa raison d'être","La gloire","La sagesse"], answer: 1, anecdote: "Joe Gardner cherche sa 'spark' (étincelle) — sa raison d'être — dans ce film Pixar profond de 2020." },
      { q: "Quel animal guide Mowgli dans Le Livre de la Jungle ?", choices: ['Baloo l\'ours','Bagheera la panthère','Kaa le serpent','Shere Khan le tigre'], answer: 1, anecdote: "Bagheera la panthère noire guide et protège Mowgli depuis sa naissance. C'est lui qui l'a trouvé bébé." },
      { q: "Dans Encanto, quel est le don de Mirabel ?", choices: ['La force','La guérison','La voyance','Elle n\'en a pas'], answer: 3, anecdote: "Mirabel est la seule de la famille Madrigal sans don magique apparent — c'est pourtant elle qui sauve la magie familiale." },
      { q: "Quel personnage Disney chante 'Let It Go' ?", choices: ['Anna','Elsa','Kristoff','Olaf'], answer: 1, anecdote: "Elsa chante 'Let It Go' (Libérée, Délivrée en français) en s'enfuyant et en créant son château de glace." },
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
      { q: "Comment appelle-t-on les tranches de poisson ou viande crus japonais ?", choices: ['Tempura','Yakitori','Shabu-shabu','Sashimi'], answer: 3, anecdote: "Le sashimi est du poisson ou de la viande crue tranchée. À ne pas confondre avec les sushi (servis sur riz)." },
      { q: "Quel fromage accompagne une vraie pizza Margherita napolitaine ?", choices: ['Parmesan','Grana Padano','Mozzarella','Pecorino'], answer: 2, anecdote: "La vraie Margherita (1889) porte les couleurs italiennes : tomate (rouge), mozzarella (blanc), basilic (vert)." },
      { q: "Quelle céréale est utilisée pour distiller le whisky écossais ?", choices: ['Blé','Seigle','Orge','Avoine'], answer: 2, anecdote: "Le scotch whisky est distillé à partir d'orge maltée, ce qui le distingue du bourbon américain (maïs)." },
      { q: "Quel pays consomme le plus de pain par habitant ?", choices: ['France','Allemagne','Turquie','Italie'], answer: 2, anecdote: "La Turquie consomme ~200 kg de pain par habitant par an — le plus élevé au monde." },
      { q: "Que signifie 'al dente' en cuisine italienne ?", choices: ['Trop cuit','Bien cuit','Légèrement ferme','Presque cru'], answer: 2, anecdote: "'Al dente' = 'à la dent' en italien. La pâte doit résister légèrement sous la dent — ni molle ni dure." },
      { q: "Quel fruit est le plus consommé dans le monde ?", choices: ['Pomme','Banane','Orange','Mangue'], answer: 1, anecdote: "La banane est le fruit le plus consommé mondialement et l'une des cultures tropicales les plus importantes." },
      { q: "Quelle est la base d'une sauce béchamel ?", choices: ['Crème fraîche','Beurre et farine','Bouillon et crème','Lait et œufs'], answer: 1, anecdote: "Béchamel = beurre fondu + farine + lait. C'est l'une des 5 grandes sauces mères de la cuisine française." },
      { q: "De quel pays vient le chocolat chaud comme boisson ?", choices: ['Belgique','Suisse','Mexique','France'], answer: 2, anecdote: "Les Mayas et Aztèques consommaient le cacao sous forme de boisson amère épicée depuis plus de 2 000 ans." },
      { q: "Quelle est la différence principale entre beurre salé et beurre doux ?", choices: ['La fermentation','La crème utilisée','La teneur en sel','La pasteurisation'], answer: 2, anecdote: "Le beurre salé contient entre 0,5% et 3% de sel. La Bretagne est réputée pour son beurre salé de qualité." },
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
      { q: "Quel film érotique des années 80 est célèbre pour sa scène de réfrigérateur ?", choices: ['9 semaines et demie','Basic Instinct','Liaison Fatale','Pulsion'], answer: 0, anecdote: "9 semaines et demie (1986) avec Kim Basinger et Mickey Rourke : la scène du réfrigérateur est culte." },
      { q: "Dans quelle ville se trouve le célèbre Moulin Rouge ?", choices: ['Amsterdam','Paris','Londres','Bruxelles'], answer: 1, anecdote: "Le Moulin Rouge, fondé en 1889 à Pigalle, est la capitale mondiale du French Cancan." },
      { q: "Quel roman érotique a battu des records de vente en 2012 ?", choices: ["L'Amant","Cinquante nuances de Grey","Lolita","L'Amant de Lady Chatterley"], answer: 1, anecdote: "Cinquante nuances de Grey (E.L. James, 2012) s'est vendu à 125 millions d'exemplaires dans le monde." },
      { q: "Quel pays scandinave a introduit l'éducation sexuelle obligatoire à l'école en premier ?", choices: ['Danemark','Suède','Norvège','Finlande'], answer: 1, anecdote: "La Suède a rendu l'éducation sexuelle obligatoire dès 1955, première au monde à le faire." },
      { q: "Dans quel film entend-on la réplique 'Je prendrai la même chose qu'elle !' ?", choices: ['Pretty Woman','Basic Instinct','Quand Harry rencontre Sally','Liaison Fatale'], answer: 2, anecdote: "La scène de l'orgasme simulé au Katz's Deli à New York. Une plaque commémorative y est installée." },
      { q: "Quel acteur est connu pour son rôle dans le film 'Magic Mike' ?", choices: ['Ryan Reynolds','Channing Tatum','Chris Evans','Zac Efron'], answer: 1, anecdote: "Channing Tatum a été strip-teaseur à 18 ans. Il a co-produit Magic Mike (2012) pour raconter cette période." },
      { q: "Quelle hormone est principalement responsable de la libido chez les deux sexes ?", choices: ['Ocytocine','Testostérone','Dopamine','Œstrogène'], answer: 1, anecdote: "La testostérone, présente chez les deux sexes, est le principal moteur du désir sexuel." },
      { q: "Quel pays a légalisé le mariage homosexuel en premier au monde ?", choices: ['Suède','Canada','Pays-Bas','Espagne'], answer: 2, anecdote: "Les Pays-Bas ont légalisé le mariage homosexuel le 1er avril 2001, premiers au monde." },
      { q: "Combien d'actes érotiques le Kama Sutra décrit-il ?", choices: ['16','36','64','108'], answer: 2, anecdote: "Le Kama Sutra décrit 64 actes mais est avant tout un traité sur l'amour, la vie en société et la vertu." },
    ],
  },
};

// Indices (0-based) des questions difficiles par catégorie
const HARD_INDICES = {
  culture: [5, 7, 12, 14, 15, 16, 17, 19],
  cinema:  [7, 15, 16, 17],
  musique: [9, 10, 15, 17],
  sport:   [5, 6, 8, 16],
  geo:     [0, 3, 6, 14, 15, 16, 18],
  science: [4, 5, 6, 9, 12, 13, 14, 17],
  histoire:[5, 6, 9, 10, 11, 13, 16],
  disney:  [8, 15, 18, 20, 21, 23],
  cuisine: [3, 6, 10, 12, 13, 17],
  hot:     [3, 4, 9, 13],
};

// difficulty: 'facile' | 'normal' | 'difficile'
export function buildQuestions(selectedCategories, count, difficulty = 'normal') {
  const pool = [];
  selectedCategories.forEach((key) => {
    const cat = quizCategories[key];
    if (!cat) return;
    const hardSet = new Set(HARD_INDICES[key] || []);
    if (!_usedIndices[key]) _usedIndices[key] = new Set();
    const diffFilter = (q) => {
      if (difficulty === 'facile')    return !hardSet.has(q._i);
      if (difficulty === 'difficile') return  hardSet.has(q._i);
      return true;
    };
    let avail = cat.questions
      .map((q, i) => ({ ...q, cat: key, _i: i }))
      .filter((q) => !_usedIndices[key].has(q._i) && diffFilter(q));
    if (!avail.length) {
      _usedIndices[key].clear();
      avail = cat.questions.map((q, i) => ({ ...q, cat: key, _i: i })).filter(diffFilter);
    }
    pool.push(...avail);
  });
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
