function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const BUZZER_MODES = [
  { id: 'quiz',         name: 'Quiz',          emoji: '🧠', color: '#8B5CF6', desc: 'Culture générale' },
  { id: 'blindtest',    name: 'Blind Test',    emoji: '🎵', color: '#10B981', desc: 'Trouvez le titre' },
  { id: 'personnalite', name: 'Personnalité',  emoji: '🌟', color: '#F59E0B', desc: 'Devinez la célébrité' },
];

// Quiz — réponse verbale, l'animateur valide
export const QUIZ_QUESTIONS = [
  { q: "Quelle est la capitale de l'Australie ?",                          answer: "Canberra" },
  { q: "Combien de côtés a un hexagone ?",                                  answer: "6" },
  { q: "Quel pays a la plus grande superficie au monde ?",                  answer: "La Russie" },
  { q: "Qui a peint la Joconde ?",                                          answer: "Léonard de Vinci" },
  { q: "En quelle année a eu lieu la Révolution française ?",               answer: "1789" },
  { q: "Quel est l'animal terrestre le plus rapide ?",                      answer: "Le guépard" },
  { q: "Quelle planète est surnommée la 'planète rouge' ?",                 answer: "Mars" },
  { q: "Quelle est la monnaie officielle du Japon ?",                       answer: "Le yen" },
  { q: "Combien de joueurs dans une équipe de football ?",                  answer: "11" },
  { q: "Qui a réalisé le film 'Inception' (2010) ?",                        answer: "Christopher Nolan" },
  { q: "Quelle est la capitale du Brésil ?",                                answer: "Brasilia" },
  { q: "Quel est le plus grand océan du monde ?",                           answer: "L'océan Pacifique" },
  { q: "En quelle année Neil Armstrong a-t-il marché sur la Lune ?",        answer: "1969" },
  { q: "Quel est le symbole chimique de l'or ?",                            answer: "Au" },
  { q: "Combien de cordes a une guitare classique ?",                        answer: "6" },
  { q: "Qui joue Iron Man dans le MCU ?",                                   answer: "Robert Downey Jr." },
  { q: "Quel est le plus grand désert chaud du monde ?",                    answer: "Le Sahara" },
  { q: "Quelle est la capitale du Canada ?",                                answer: "Ottawa" },
  { q: "Qui a écrit 'Les Misérables' ?",                                    answer: "Victor Hugo" },
  { q: "Combien de continents y a-t-il sur Terre ?",                        answer: "7" },
  { q: "Quel acteur a joué Wolverine pendant 17 ans ?",                     answer: "Hugh Jackman" },
  { q: "Quelle est la formule chimique de l'eau ?",                         answer: "H₂O" },
  { q: "En quelle année a été lancé le premier iPhone ?",                   answer: "2007" },
  { q: "Qui a composé la 5e Symphonie ?",                                   answer: "Beethoven" },
  { q: "Quelle est la plus haute montagne du monde ?",                      answer: "L'Everest" },
  { q: "Quelle est la capitale de l'Espagne ?",                             answer: "Madrid" },
  { q: "Quel pays a remporté la Coupe du monde 2018 ?",                     answer: "La France" },
  { q: "Quel est le pays le plus peuplé du monde depuis 2023 ?",            answer: "L'Inde" },
  { q: "Qui a inventé la théorie de la relativité ?",                       answer: "Albert Einstein" },
  { q: "Quel est le plus petit pays du monde ?",                            answer: "Le Vatican" },
  { q: "Quelle ville accueille le Colisée ?",                               answer: "Rome" },
  { q: "Quel est le fleuve le plus long du monde ?",                        answer: "Le Nil (ou l'Amazone selon mesure)" },
  { q: "Combien de dents a un adulte (sagesses incluses) ?",                answer: "32" },
  { q: "Qui joue le Joker dans 'The Dark Knight' (2008) ?",                 answer: "Heath Ledger" },
  { q: "Dans quel film Tom Hanks survit avec le ballon 'Wilson' ?",         answer: "Cast Away" },
];

// Blind Test — l'artiste est visible, les joueurs buzzent pour donner le titre
export const BLIND_TEST_CLUES = [
  { artist: "Queen",           year: "1975", hint: "Rock opéra en 6 minutes — l'un des plus grands hits de tous les temps",        answer: "Bohemian Rhapsody" },
  { artist: "Stromae",         year: "2010", hint: "Chanson électro sur la procrastination qui fait danser",                        answer: "Alors on danse" },
  { artist: "Michael Jackson", year: "1982", hint: "Clip culte avec des zombies et un manteau rouge",                              answer: "Thriller" },
  { artist: "ABBA",            year: "1974", hint: "Victoire suédoise à l'Eurovision — bataille napoléonienne",                    answer: "Waterloo" },
  { artist: "Daft Punk",       year: "2013", hint: "Collaboration avec Pharrell Williams",                                          answer: "Get Lucky" },
  { artist: "Adele",           year: "2011", hint: "Hymne de rupture — 'Rolling in the...'",                                       answer: "Rolling in the Deep" },
  { artist: "Nirvana",         year: "1991", hint: "Hymne du grunge — teen spirit",                                                answer: "Smells Like Teen Spirit" },
  { artist: "Édith Piaf",      year: "1945", hint: "Hymne à l'amour avec une couleur",                                             answer: "La Vie en Rose" },
  { artist: "Joe Dassin",      year: "1969", hint: "Promenade sur la plus belle avenue de Paris",                                  answer: "Les Champs-Élysées" },
  { artist: "Shakira",         year: "2006", hint: "Ces hanches ne mentent jamais",                                                answer: "Hips Don't Lie" },
  { artist: "Eminem",          year: "2002", hint: "Bande originale du film 8 Mile — saisir ta chance",                            answer: "Lose Yourself" },
  { artist: "Whitney Houston", year: "1992", hint: "Bande originale du film Bodyguard",                                            answer: "I Will Always Love You" },
  { artist: "Eagles",          year: "1977", hint: "Établissement hôtelier en Californie",                                         answer: "Hotel California" },
  { artist: "Billie Eilish",   year: "2019", hint: "Bad ___",                                                                      answer: "Bad Guy" },
  { artist: "Coldplay",        year: "2000", hint: "Couleur d'une étoile ou d'un sous-marin",                                      answer: "Yellow" },
  { artist: "The Weeknd",      year: "2019", hint: "Des lumières qui aveuglent",                                                   answer: "Blinding Lights" },
  { artist: "Indochine",       year: "2002", hint: "Requête faite à l'astre de la nuit",                                           answer: "J'ai demandé à la lune" },
  { artist: "Angèle",          year: "2018", hint: "Chanson féministe qui dérange",                                                answer: "Balance ton quoi" },
  { artist: "Jul",             year: "2020", hint: "13 rappeurs marseillais — un seul titre",                                      answer: "Bande Organisée" },
  { artist: "Amy Winehouse",   year: "2006", hint: "Refus catégorique d'aller se soigner",                                         answer: "Rehab" },
  { artist: "Beyoncé",         year: "2003", hint: "Les filles dirigent le monde, ou presque",                                     answer: "Crazy in Love" },
  { artist: "Justin Bieber",   year: "2015", hint: "Est-ce qu'il t'aurait traité différemment ?",                                  answer: "Sorry" },
  { artist: "Taylor Swift",    year: "2014", hint: "Elle secoue les critiques",                                                    answer: "Shake It Off" },
  { artist: "Bruno Mars",      year: "2013", hint: "Il aurait dépensé toutes ses économies pour toi",                              answer: "Just The Way You Are / Treasure" },
  { artist: "Lady Gaga",       year: "2008", hint: "Ra-ra-ah-ah-ah, Roma-ro-ma-ma",                                               answer: "Bad Romance" },
  { artist: "Aya Nakamura",    year: "2017", hint: "Pas envie d'être 'djadja'",                                                    answer: "Djadja" },
  { artist: "Kendji Girac",    year: "2015", hint: "Déclaration ardente à une belle",                                              answer: "Andalouse" },
  { artist: "PNL",             year: "2019", hint: "Dans la légende, avec des ailes de mafioso",                                   answer: "Au DD" },
  { artist: "Vianney",         year: "2017", hint: "Il voulait juste te dire qu'il t'attend",                                      answer: "Je voulais" },
  { artist: "Maes ft. Gradur", year: "2020", hint: "Douceur brune et sucrée",                                                     answer: "Chocolat" },
];

// Personnalité — indice visible, les joueurs buzzent pour donner le nom
export const PERSONALITY_CLUES = [
  { clue: "Acteur américain — Tony Stark / Iron Man dans le MCU, barbe et lunettes de soleil",          answer: "Robert Downey Jr." },
  { clue: "Footballeur portugais — 5 Ballons d'Or, CR7, célèbre pour ses abdominaux",                   answer: "Cristiano Ronaldo" },
  { clue: "Chanteur belge — 'Alors on danse', 'Papaoutai', looks androgynes et clips artistiques",       answer: "Stromae" },
  { clue: "Actrice britannique — Hermione Granger dans Harry Potter, militante féministe",               answer: "Emma Watson" },
  { clue: "Chanteuse belge — 'Balance ton quoi', sœur du rappeur Roméo Elvis",                          answer: "Angèle" },
  { clue: "Footballeur argentin — 8 Ballons d'Or, Pulga, champion du monde 2022",                       answer: "Lionel Messi" },
  { clue: "Chanteur canadien — découvert sur YouTube, 'Baby', cheveux blonds iconiques",                 answer: "Justin Bieber" },
  { clue: "Actrice américaine — Katniss Everdeen dans Hunger Games, Oscar pour Silver Linings Playbook", answer: "Jennifer Lawrence" },
  { clue: "Rappeur canadien — 'God's Plan', né Aubrey Graham, tatoué 'OVO'",                            answer: "Drake" },
  { clue: "Acteur américain — Jack Dawson dans Titanic, Inception, Oscar pour The Revenant",             answer: "Leonardo DiCaprio" },
  { clue: "Chanteuse britannique — 'Rolling in the Deep', 'Hello', voix hors-norme",                    answer: "Adele" },
  { clue: "Acteur et réalisateur — Forrest Gump, Cast Away, 'Run, Forrest, run!'",                      answer: "Tom Hanks" },
  { clue: "Rappeur américain — 'Lose Yourself', 8 Mile, Marshal Mathers de Detroit",                    answer: "Eminem" },
  { clue: "Chanteur français — 'Je voulais te dire que je t'attends', folk doux",                        answer: "Vianney" },
  { clue: "Chanteuse américaine — 'Bad Guy', la plus jeune à dominer les Grammy en 2020",               answer: "Billie Eilish" },
  { clue: "Footballeur français — 'Kyky', meilleur buteur de l'équipe de France, ex-PSG",               answer: "Kylian Mbappé" },
  { clue: "Chanteuse américaine — 'Shake It Off', ères musicales, Taylor's Versions",                   answer: "Taylor Swift" },
  { clue: "Chanteur franco-algérien — 'Andalouse', 'Color Gitano', issu de The Voice",                  answer: "Kendji Girac" },
  { clue: "Rappeur américain — 'Hotline Bling', né Aubrey, danse dans ses clips",                       answer: "Drake" },
  { clue: "Actrice américaine — Black Widow dans le MCU, 'Her', fiancée à Ryan Reynolds",               answer: "Scarlett Johansson" },
  { clue: "Chanteur malien-français — 'Djadja', artiste francophone la plus écoutée au monde",          answer: "Aya Nakamura" },
  { clue: "Acteur américain — The Rock, ex-catcheur WWE, Fast & Furious",                               answer: "Dwayne Johnson" },
  { clue: "Chanteuse américaine — 'Crazy in Love', Lemonade, moitié du couple Bey-Jay",                 answer: "Beyoncé" },
  { clue: "Chanteur britannique — 'Shape of You', Ed le roux aux tatouages",                             answer: "Ed Sheeran" },
  { clue: "Rappeur marseillais — né Julien Mari, le plus streamé en France, 'Vol 33'",                  answer: "Jul" },
  { clue: "Acteur britannique — James Bond dans les films Casino Royale à Mourir peut attendre",        answer: "Daniel Craig" },
  { clue: "Chanteur colombien — 'Hips Don't Lie', danses du ventre, époux de Gerard Piqué",             answer: "Shakira" },
  { clue: "Rappeur français — PNL avec son frère Ademo, 'Le monde ou rien'",                            answer: "NOS (de PNL)" },
  { clue: "Acteur américain — Mission Impossible, Top Gun, cascades sans doublure",                     answer: "Tom Cruise" },
  { clue: "Footballeur français — 'Zizou', meilleur joueur du Mondial 1998 et 2006",                    answer: "Zinédine Zidane" },
];

export function getShuffledQuestions(mode) {
  const map = {
    quiz: QUIZ_QUESTIONS,
    blindtest: BLIND_TEST_CLUES,
    personnalite: PERSONALITY_CLUES,
  };
  return shuffle([...(map[mode] ?? QUIZ_QUESTIONS)]);
}
