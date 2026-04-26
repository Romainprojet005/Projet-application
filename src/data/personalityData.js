function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// image: direct Wikimedia Commons thumbnail URL
export const ALL_PERSONALITIES = [
  // ── CINÉMA INTERNATIONAL ──────────────────────────────────
  {
    id: 'leo_dicaprio', name: 'Leonardo DiCaprio', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Leonardo_Dicaprio_Cannes_2019.jpg/400px-Leonardo_Dicaprio_Cannes_2019.jpg',
    hint: 'Acteur américain — Titanic, Inception, Le Loup de Wall Street',
  },
  {
    id: 'angelina_jolie', name: 'Angelina Jolie', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Angelina_Jolie_2_June_2014_%28cropped%29.jpg/400px-Angelina_Jolie_2_June_2014_%28cropped%29.jpg',
    hint: 'Actrice américaine — Lara Croft, Maléfique, ambascadrice ONU',
  },
  {
    id: 'brad_pitt', name: 'Brad Pitt', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg/400px-Brad_Pitt_2019_by_Glenn_Francis.jpg',
    hint: 'Acteur américain — Fight Club, Once Upon a Time in Hollywood',
  },
  {
    id: 'scarlett_johansson', name: 'Scarlett Johansson', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg/400px-Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg',
    hint: 'Actrice américaine — Black Widow, Her, Lost in Translation',
  },
  {
    id: 'tom_cruise', name: 'Tom Cruise', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Tom_Cruise_by_Gage_Skidmore_2.jpg/400px-Tom_Cruise_by_Gage_Skidmore_2.jpg',
    hint: 'Acteur américain — Mission Impossible, Top Gun',
  },
  {
    id: 'dwayne_johnson', name: 'Dwayne Johnson', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Dwayne_Johnson_%28cropped%29.jpg/400px-Dwayne_Johnson_%28cropped%29.jpg',
    hint: 'Acteur et catcheur américain — The Rock, Fast & Furious',
  },
  {
    id: 'emma_watson', name: 'Emma Watson', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Emma_Watson_2013.jpg/400px-Emma_Watson_2013.jpg',
    hint: 'Actrice britannique — Hermione Granger dans Harry Potter',
  },
  {
    id: 'will_smith', name: 'Will Smith', wiki: 'Will_Smith', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Will_Smith_2011.jpg/400px-Will_Smith_2011.jpg',
    hint: 'Acteur américain — Ali, Men in Black, La Méthode Williams',
  },
  {
    id: 'robert_downey', name: 'Robert Downey Jr.', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg/400px-Robert_Downey_Jr_2014_Comic_Con_%28cropped%29.jpg',
    hint: 'Acteur américain — Iron Man dans l\'univers Marvel',
  },
  {
    id: 'keanu_reeves', name: 'Keanu Reeves', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Keanu_Reeves_2014.jpg/400px-Keanu_Reeves_2014.jpg',
    hint: 'Acteur canadien — Matrix, John Wick, Speed',
  },
  {
    id: 'meryl_streep', name: 'Meryl Streep', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Meryl_Streep_at_Berlinale_2012.jpg/400px-Meryl_Streep_at_Berlinale_2012.jpg',
    hint: 'Actrice américaine — 3 Oscars, Le Diable s\'habille en Prada',
  },
  {
    id: 'johnny_depp', name: 'Johnny Depp', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Johnny_Depp_2020.jpg/400px-Johnny_Depp_2020.jpg',
    hint: 'Acteur américain — Jack Sparrow dans Pirates des Caraïbes',
  },
  {
    id: 'natalie_portman', name: 'Natalie Portman', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Natalie_Portman_by_Gage_Skidmore_%28cropped%29.jpg/400px-Natalie_Portman_by_Gage_Skidmore_%28cropped%29.jpg',
    hint: 'Actrice américano-israélienne — Black Swan, Thor, Star Wars',
  },
  {
    id: 'ryan_reynolds', name: 'Ryan Reynolds', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ryan_Reynolds_2016_%28cropped%29.jpg/400px-Ryan_Reynolds_2016_%28cropped%29.jpg',
    hint: 'Acteur canadien — Deadpool, Free Guy',
  },
  {
    id: 'chris_evans', name: 'Chris Evans', wiki: 'Chris_Evans_(actor)', category: 'cinema', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Chris_Evans_July_2021.jpg/400px-Chris_Evans_July_2021.jpg',
    hint: 'Acteur américain — Captain America dans Marvel',
  },

  // ── MUSIQUE INTERNATIONALE ─────────────────────────────────
  {
    id: 'michael_jackson', name: 'Michael Jackson', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Michael_Jackson_in_1988.jpg/400px-Michael_Jackson_in_1988.jpg',
    hint: 'Chanteur américain — King of Pop, Thriller, Billie Jean, Moonwalk',
  },
  {
    id: 'taylor_swift', name: 'Taylor Swift', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png/400px-191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png',
    hint: 'Chanteuse américaine — Shake It Off, Anti-Hero, Eras Tour',
  },
  {
    id: 'beyonce', name: 'Beyoncé', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Beyonce_Homecoming_Film.png/400px-Beyonce_Homecoming_Film.png',
    hint: 'Chanteuse américaine — Single Ladies, Lemonade, Destiny\'s Child',
  },
  {
    id: 'drake', name: 'Drake', wiki: 'Drake_(musician)', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Drake_2014_%28cropped%29.jpg/400px-Drake_2014_%28cropped%29.jpg',
    hint: 'Rappeur canadien — God\'s Plan, Hotline Bling',
  },
  {
    id: 'ed_sheeran', name: 'Ed Sheeran', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Ed_Sheeran_-_Multiply_Tour.jpg/400px-Ed_Sheeran_-_Multiply_Tour.jpg',
    hint: 'Chanteur britannique — Shape of You, Perfect, Thinking Out Loud',
  },
  {
    id: 'billie_eilish', name: 'Billie Eilish', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Billie_Eilish_2019_by_Glenn_Francis.jpg/400px-Billie_Eilish_2019_by_Glenn_Francis.jpg',
    hint: 'Chanteuse américaine — Bad Guy, générique de James Bond No Time To Die',
  },
  {
    id: 'the_weeknd', name: 'The Weeknd', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/The_Weeknd_Photo.jpg/400px-The_Weeknd_Photo.jpg',
    hint: 'Chanteur canadien — Blinding Lights, Starboy',
  },
  {
    id: 'rihanna', name: 'Rihanna', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Rihanna_Fenty_2018.jpg/400px-Rihanna_Fenty_2018.jpg',
    hint: 'Chanteuse barbadienne — Umbrella, Diamonds, fondatrice Fenty Beauty',
  },
  {
    id: 'justin_bieber', name: 'Justin Bieber', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Justin_Bieber_in_2015.jpg/400px-Justin_Bieber_in_2015.jpg',
    hint: 'Chanteur canadien — Baby, Sorry, Love Yourself',
  },
  {
    id: 'adele', name: 'Adele', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Adele_2016.jpg/400px-Adele_2016.jpg',
    hint: 'Chanteuse britannique — Rolling in the Deep, Hello, Someone Like You',
  },
  {
    id: 'kanye_west', name: 'Kanye West', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kanye_West_at_the_2009_Tribeca_Film_Festival.jpg/400px-Kanye_West_at_the_2009_Tribeca_Film_Festival.jpg',
    hint: 'Rappeur américain — Gold Digger, Stronger, album Graduation',
  },
  {
    id: 'eminem', name: 'Eminem', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Eminem_2021_%28cropped%29.jpg/400px-Eminem_2021_%28cropped%29.jpg',
    hint: 'Rappeur américain — Lose Yourself, Slim Shady, 8 Mile',
  },
  {
    id: 'lady_gaga', name: 'Lady Gaga', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Lady_Gaga_at_the_2019_Met_Gala_%28cropped%29.jpg/400px-Lady_Gaga_at_the_2019_Met_Gala_%28cropped%29.jpg',
    hint: 'Chanteuse américaine — Bad Romance, Poker Face, Shallow',
  },
  {
    id: 'ariana_grande', name: 'Ariana Grande', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Ariana_Grande_2019_by_Glenn_Francis.jpg/400px-Ariana_Grande_2019_by_Glenn_Francis.jpg',
    hint: 'Chanteuse américaine — Thank U, Next, 7 Rings',
  },
  {
    id: 'bruno_mars', name: 'Bruno Mars', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Bruno_Mars_2014.jpg/400px-Bruno_Mars_2014.jpg',
    hint: 'Chanteur américain — Uptown Funk, Just the Way You Are',
  },
  {
    id: 'shakira', name: 'Shakira', category: 'musique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shakira_2009.jpg/400px-Shakira_2009.jpg',
    hint: 'Chanteuse colombienne — Waka Waka, Hips Don\'t Lie',
  },

  // ── SPORT INTERNATIONAL ────────────────────────────────────
  {
    id: 'pele', name: 'Pelé', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pele_chasing_ball_1970.jpg/400px-Pele_chasing_ball_1970.jpg',
    hint: 'Footballeur brésilien — O Rei, 3 Coupes du monde, Santos FC, New York Cosmos',
  },
  {
    id: 'ronaldinho', name: 'Ronaldinho', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ronaldinho_2010.jpg/400px-Ronaldinho_2010.jpg',
    hint: 'Footballeur brésilien — Gaúcho, 2 Ballons d\'Or, FC Barcelone, Brasil',
  },
  {
    id: 'zlatan_ibrahimovic', name: 'Zlatan Ibrahimovic', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Zlatan_Ibrahimovic_2013.jpg/400px-Zlatan_Ibrahimovic_2013.jpg',
    hint: 'Footballeur suédois — PSG, AC Milan, Manchester United, "Je suis Zlatan"',
  },
  {
    id: 'erling_haaland', name: 'Erling Haaland', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Haaland%2C_Erling_Braut_%28cropped%29.jpg/400px-Haaland%2C_Erling_Braut_%28cropped%29.jpg',
    hint: 'Footballeur norvégien — Manchester City, machine à buts en Premier League',
  },
  {
    id: 'cristiano_ronaldo', name: 'Cristiano Ronaldo', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/400px-Cristiano_Ronaldo_2018.jpg',
    hint: 'Footballeur portugais — CR7, 5 Ballons d\'Or, Real Madrid, Juventus',
  },
  {
    id: 'lionel_messi', name: 'Lionel Messi', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Messi_vs_Nigeria_2018.jpg/400px-Messi_vs_Nigeria_2018.jpg',
    hint: 'Footballeur argentin — 8 Ballons d\'Or, FC Barcelone, PSG, champion du monde 2022',
  },
  {
    id: 'lebron_james', name: 'LeBron James', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/LeBron_James_crop.jpg/400px-LeBron_James_crop.jpg',
    hint: 'Basketteur américain — King James, Lakers, 4 titres NBA',
  },
  {
    id: 'serena_williams', name: 'Serena Williams', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Serena_Williams_2013_US_Open.jpg/400px-Serena_Williams_2013_US_Open.jpg',
    hint: 'Tenniswoman américaine — 23 titres du Grand Chelem',
  },
  {
    id: 'usain_bolt', name: 'Usain Bolt', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Usain_Bolt_2012_Olympics_2.jpg/400px-Usain_Bolt_2012_Olympics_2.jpg',
    hint: 'Sprinter jamaïcain — Record du monde 100m, 3 JO consécutifs',
  },
  {
    id: 'michael_jordan', name: 'Michael Jordan', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Michael_Jordan_in_2014.jpg/400px-Michael_Jordan_in_2014.jpg',
    hint: 'Basketteur américain — Air Jordan, Chicago Bulls, 6 titres NBA',
  },
  {
    id: 'novak_djokovic', name: 'Novak Djokovic', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Novak_Djokovic_2019.jpg/400px-Novak_Djokovic_2019.jpg',
    hint: 'Tennisman serbe — Nole, record de titres du Grand Chelem',
  },
  {
    id: 'roger_federer', name: 'Roger Federer', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Roger_Federer_2018.jpg/400px-Roger_Federer_2018.jpg',
    hint: 'Tennisman suisse — 20 titres du Grand Chelem, Wimbledon x8',
  },
  {
    id: 'neymar', name: 'Neymar', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Neymar_2018.jpg/400px-Neymar_2018.jpg',
    hint: 'Footballeur brésilien — PSG, FC Barcelone, coupe du monde 2014',
  },
  {
    id: 'rafael_nadal', name: 'Rafael Nadal', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rafael_Nadal_2018.jpg/400px-Rafael_Nadal_2018.jpg',
    hint: 'Tennisman espagnol — Rafa, roi de la terre battue, Roland Garros x14',
  },
  {
    id: 'tiger_woods', name: 'Tiger Woods', category: 'sport', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Tiger_Woods_%40_WGC_-_Bridgestone_Invitational_%28cropped%29.jpg/400px-Tiger_Woods_%40_WGC_-_Bridgestone_Invitational_%28cropped%29.jpg',
    hint: 'Golfeur américain — 15 titres majeurs, révolution du golf mondial',
  },

  // ── POLITIQUE INTERNATIONALE ───────────────────────────────
  {
    id: 'barack_obama', name: 'Barack Obama', category: 'politique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/400px-President_Barack_Obama.jpg',
    hint: '44e président des États-Unis, 1er président afro-américain, Nobel de la Paix',
  },
  {
    id: 'joe_biden', name: 'Joe Biden', category: 'politique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/President_Joe_Biden.jpg/400px-President_Joe_Biden.jpg',
    hint: '46e président des États-Unis',
  },
  {
    id: 'donald_trump', name: 'Donald Trump', category: 'politique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/400px-Donald_Trump_official_portrait.jpg',
    hint: '45e et 47e président des États-Unis — milliardaire, réseaux sociaux',
  },
  {
    id: 'vladimir_poutine', name: 'Vladimir Poutine', category: 'politique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Vladimir_Putin_%282020-02-20%29_%28cropped%29.jpg/400px-Vladimir_Putin_%282020-02-20%29_%28cropped%29.jpg',
    hint: 'Président de la Russie depuis plus de 20 ans',
  },
  {
    id: 'xi_jinping', name: 'Xi Jinping', category: 'politique', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Xi_Jinping_2019.jpg/400px-Xi_Jinping_2019.jpg',
    hint: 'Président de la République populaire de Chine',
  },

  // ── SCIENCE & TECH ─────────────────────────────────────────
  {
    id: 'albert_einstein', name: 'Albert Einstein', category: 'science', flag: '🔬',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/400px-Albert_Einstein_Head.jpg',
    hint: 'Physicien théoricien allemand — Théorie de la relativité, E=mc²',
  },
  {
    id: 'marie_curie', name: 'Marie Curie', category: 'science', flag: '🔬',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/400px-Marie_Curie_c1920.jpg',
    hint: 'Physicienne et chimiste franco-polonaise — 2 Prix Nobel, radioactivité',
  },
  {
    id: 'elon_musk', name: 'Elon Musk', category: 'science', flag: '🔬',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28cropped2%29.jpg/400px-Elon_Musk_Royal_Society_%28cropped2%29.jpg',
    hint: 'Entrepreneur américain — Tesla, SpaceX, Twitter/X',
  },
  {
    id: 'bill_gates', name: 'Bill Gates', category: 'science', flag: '🔬',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bill_Gates_2018.jpg/400px-Bill_Gates_2018.jpg',
    hint: 'Co-fondateur de Microsoft, philanthrope',
  },
  {
    id: 'mark_zuckerberg', name: 'Mark Zuckerberg', category: 'science', flag: '🔬',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/400px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
    hint: 'Co-fondateur de Facebook / Meta',
  },
  {
    id: 'steve_jobs', name: 'Steve Jobs', category: 'science', flag: '🔬',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/400px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
    hint: 'Co-fondateur d\'Apple — iPhone, iPad, iMac',
  },
  {
    id: 'jeff_bezos', name: 'Jeff Bezos', category: 'science', flag: '🔬',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Jeff_Bezos_Visit_to_NASA_Goddard_%2826105490701%29_%28cropped%29.jpg/400px-Jeff_Bezos_Visit_to_NASA_Goddard_%2826105490701%29_%28cropped%29.jpg',
    hint: 'Fondateur d\'Amazon et Blue Origin',
  },

  // ── CINÉMA FRANÇAIS ────────────────────────────────────────
  {
    id: 'omar_sy', name: 'Omar Sy', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Omar_Sy_Cannes_2016.jpg/400px-Omar_Sy_Cannes_2016.jpg',
    hint: 'Acteur français — Intouchables, Lupin (Netflix)',
  },
  {
    id: 'marion_cotillard', name: 'Marion Cotillard', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Marion_Cotillard_Cannes_2013_%28cropped%29.jpg/400px-Marion_Cotillard_Cannes_2013_%28cropped%29.jpg',
    hint: 'Actrice française — Oscar pour La Môme (Édith Piaf)',
  },
  {
    id: 'jean_dujardin', name: 'Jean Dujardin', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Jean_Dujardin_Cannes_2011.jpg/400px-Jean_Dujardin_Cannes_2011.jpg',
    hint: 'Acteur français — Oscar pour The Artist, OSS 117',
  },
  {
    id: 'lea_seydoux', name: 'Léa Seydoux', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/L%C3%A9a_Seydoux_Cannes_2016.jpg/400px-L%C3%A9a_Seydoux_Cannes_2016.jpg',
    hint: 'Actrice française — La Vie d\'Adèle, James Bond Spectre',
  },
  {
    id: 'vincent_cassel', name: 'Vincent Cassel', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Vincent_Cassel_%28cropped%29.jpg/400px-Vincent_Cassel_%28cropped%29.jpg',
    hint: 'Acteur français — La Haine, Black Swan, Le Dernier Duel',
  },
  {
    id: 'gad_elmaleh', name: 'Gad Elmaleh', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Gad_Elmaleh_2012.jpg/400px-Gad_Elmaleh_2012.jpg',
    hint: 'Humoriste et acteur franco-marocain — Coco, L\'Arnacoeur',
  },
  {
    id: 'audrey_tautou', name: 'Audrey Tautou', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Audrey_Tautou_2010.jpg/400px-Audrey_Tautou_2010.jpg',
    hint: 'Actrice française — Amélie Poulain, Da Vinci Code',
  },
  {
    id: 'isabelle_adjani', name: 'Isabelle Adjani', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Isabelle_Adjani_at_Cannes.jpg/400px-Isabelle_Adjani_at_Cannes.jpg',
    hint: 'Actrice française — 5 Césars, Camille Claudel, Reine Margot',
  },
  {
    id: 'louis_de_funes', name: 'Louis de Funès', category: 'fr_cinema', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Louis_de_Fun%C3%A8s_1965.jpg/400px-Louis_de_Fun%C3%A8s_1965.jpg',
    hint: 'Acteur comique français — Le Gendarme de Saint-Tropez, La Grande Vadrouille',
  },

  // ── MUSIQUE FRANÇAISE ──────────────────────────────────────
  {
    id: 'stromae', name: 'Stromae', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Stromae_-_Coachella_2014.jpg/400px-Stromae_-_Coachella_2014.jpg',
    hint: 'Chanteur belgo-rwandais — Alors on Danse, Formidable, Papaoutai',
  },
  {
    id: 'aya_nakamura', name: 'Aya Nakamura', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Aya_Nakamura_2018.jpg/400px-Aya_Nakamura_2018.jpg',
    hint: 'Chanteuse française — Djadja, Pookie, artiste francophone la plus écoutée',
  },
  {
    id: 'david_guetta', name: 'David Guetta', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/David_Guetta_2011.jpg/400px-David_Guetta_2011.jpg',
    hint: 'DJ et producteur français — Titanium, Without You',
  },
  {
    id: 'johnny_hallyday', name: 'Johnny Hallyday', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Johnny_Hallyday_2009.jpg/400px-Johnny_Hallyday_2009.jpg',
    hint: 'Chanteur français — Le Elvis français, Allumer le feu, L\'idole des jeunes',
  },
  {
    id: 'indila', name: 'Indila', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Indila_-_Artiste_Promo_2014.jpg/400px-Indila_-_Artiste_Promo_2014.jpg',
    hint: 'Chanteuse française — Dernière Danse, SOS, Mini World',
  },
  {
    id: 'jul', name: 'Jul', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Jul_-_Primavera_Sound_Madrid_2022.jpg/400px-Jul_-_Primavera_Sound_Madrid_2022.jpg',
    hint: 'Rappeur marseillais — L\'Ovni, On s\'en bat les couilles',
  },
  {
    id: 'mylene_farmer', name: 'Mylène Farmer', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Mylene_Farmer_2019.jpg/400px-Mylene_Farmer_2019.jpg',
    hint: 'Chanteuse française — Libertine, Sans Contrefaçon, Désenchantée',
  },
  {
    id: 'daft_punk', name: 'Daft Punk', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Daft_Punk_2013.jpg/400px-Daft_Punk_2013.jpg',
    hint: 'Duo de musique électronique français — Get Lucky, Around the World, casques dorés et argentés',
  },
  {
    id: 'mc_solaar', name: 'MC Solaar', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/MC_Solaar.jpg/400px-MC_Solaar.jpg',
    hint: 'Rappeur franco-tchadien — Bouge de là, La Belle et le Bad Boy',
  },
  {
    id: 'dj_snake', name: 'DJ Snake', category: 'fr_musique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/DJ_Snake_2017.jpg/400px-DJ_Snake_2017.jpg',
    hint: 'DJ français — Lean On, Taki Taki, Un Poco Loco',
  },

  // ── YOUTUBEURS / INFLUENCEURS INTERNATIONAUX ───────────────
  {
    id: 'mrbeast', name: 'MrBeast', category: 'youtubeur', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jimmy_Donaldson_%28MrBeast%29_%28cropped%29.jpg/400px-Jimmy_Donaldson_%28MrBeast%29_%28cropped%29.jpg',
    hint: 'YouTubeur américain — Jimmy Donaldson, défis extrêmes, plus de 300M d\'abonnés',
  },
  {
    id: 'pewdiepie', name: 'PewDiePie', category: 'youtubeur', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/PewDiePie%2C_Felix_Kjellberg.jpg/400px-PewDiePie%2C_Felix_Kjellberg.jpg',
    hint: 'YouTubeur suédois — Felix Kjellberg, gaming, humour, longtemps n°1 YouTube',
  },
  {
    id: 'khaby_lame', name: 'Khaby Lame', category: 'youtubeur', flag: '🌍',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Khaby_Lame_2022.jpg/400px-Khaby_Lame_2022.jpg',
    hint: 'Influenceur sénégalo-italien — TikTok, gestes muets pour ridiculiser les "life hacks"',
  },

  // ── YOUTUBEURS / INFLUENCEURS FRANÇAIS ─────────────────────
  {
    id: 'squeezie', name: 'Squeezie', category: 'fr_youtubeur', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Lucas_Hauchard.jpg/400px-Lucas_Hauchard.jpg',
    hint: 'YouTubeur français — Lucas Hauchard, gaming, vlogs, plus de 18M d\'abonnés',
  },
  {
    id: 'mcfly_carlito', name: 'Mcfly et Carlito', category: 'fr_youtubeur', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mcfly_et_Carlito.jpg/400px-Mcfly_et_Carlito.jpg',
    hint: 'Duo de YouTubeurs français — défis, humour, ont chanté avec Emmanuel Macron',
  },
  {
    id: 'cyprien', name: 'Cyprien', category: 'fr_youtubeur', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Cyprien_Iov.jpg/400px-Cyprien_Iov.jpg',
    hint: 'YouTubeur français — Cyprien Iov, sketchs comiques, pionnier YouTube FR',
  },
  {
    id: 'tibo_inshape', name: 'Tibo InShape', category: 'fr_youtubeur', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Tibo_InShape.jpg/400px-Tibo_InShape.jpg',
    hint: 'YouTubeur français — Thibault Delesalle, fitness, sport, défis physiques',
  },
  {
    id: 'lena_situations', name: 'Léna Situations', category: 'fr_youtubeur', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/L%C3%A9na_Mahfouf.jpg/400px-L%C3%A9na_Mahfouf.jpg',
    hint: 'YouTubeuse et influenceuse française — mode, lifestyle, Léna Mahfouf',
  },
  {
    id: 'norman', name: 'Norman', category: 'fr_youtubeur', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Norman_Thavaud.jpg/400px-Norman_Thavaud.jpg',
    hint: 'YouTubeur français — Norman Thavaud, sketchs d\'humour, pionnier YouTube FR',
  },
  {
    id: 'amixem', name: 'Amixem', category: 'fr_youtubeur', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Amixem.jpg/400px-Amixem.jpg',
    hint: 'YouTubeur français — Alexis Chabrol, défis, humour décalé',
  },

  // ── SPORT FRANÇAIS ─────────────────────────────────────────
  {
    id: 'thierry_henry', name: 'Thierry Henry', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Thierry_Henry_2019.jpg/400px-Thierry_Henry_2019.jpg',
    hint: 'Footballeur français — Arsenal, FC Barcelone, champion du monde 1998 et d\'Europe 2000',
  },
  {
    id: 'karim_benzema', name: 'Karim Benzema', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Karim_Benzema_2016.jpg/400px-Karim_Benzema_2016.jpg',
    hint: 'Footballeur français — Ballon d\'Or 2022, Real Madrid, record de buts en Ligue des Champions',
  },
  {
    id: 'kylian_mbappe', name: 'Kylian Mbappé', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2019-07-17_SG_Dynamo_Dresden_v_Paris_Saint-Germain_F.C._by_Sandro_Halank%E2%80%93014_%28cropped%29.jpg/400px-2019-07-17_SG_Dynamo_Dresden_v_Paris_Saint-Germain_F.C._by_Sandro_Halank%E2%80%93014_%28cropped%29.jpg',
    hint: 'Footballeur français — PSG, Real Madrid, champion du monde 2018',
  },
  {
    id: 'zinedine_zidane', name: 'Zinédine Zidane', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Zinedine_Zidane_%28cropped%29.jpg/400px-Zinedine_Zidane_%28cropped%29.jpg',
    hint: 'Footballeur français — Zizou, champion du monde 1998, Real Madrid',
  },
  {
    id: 'antoine_griezmann', name: 'Antoine Griezmann', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Antoine_Griezmann_2018.jpg/400px-Antoine_Griezmann_2018.jpg',
    hint: 'Footballeur français — Atlético de Madrid, champion du monde 2018',
  },
  {
    id: 'tony_parker', name: 'Tony Parker', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Tony_Parker_2012.jpg/400px-Tony_Parker_2012.jpg',
    hint: 'Basketteur français — 4 titres NBA avec les Spurs de San Antonio',
  },
  {
    id: 'teddy_riner', name: 'Teddy Riner', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Teddy_Riner_2012.jpg/400px-Teddy_Riner_2012.jpg',
    hint: 'Judoka français — 10 fois champion du monde, multiple champion olympique',
  },
  {
    id: 'amelie_mauresmo', name: 'Amélie Mauresmo', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Amelie_Mauresmo_Wimbledon.jpg/400px-Amelie_Mauresmo_Wimbledon.jpg',
    hint: 'Tenniswoman française — n°1 mondiale, Wimbledon et Open d\'Australie',
  },
  {
    id: 'yannick_noah', name: 'Yannick Noah', category: 'fr_sport', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Yannick_Noah_2009.jpg/400px-Yannick_Noah_2009.jpg',
    hint: 'Tennisman et chanteur français — Roland Garros 1983, Saga Africa',
  },

  // ── POLITIQUE FRANÇAISE ────────────────────────────────────
  {
    id: 'emmanuel_macron', name: 'Emmanuel Macron', category: 'fr_politique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Emmanuel_Macron_in_2019.jpg/400px-Emmanuel_Macron_in_2019.jpg',
    hint: 'Président de la République française depuis 2017',
  },
  {
    id: 'marine_le_pen', name: 'Marine Le Pen', category: 'fr_politique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Marine_le_pen_%28cropped%29.jpg/400px-Marine_le_pen_%28cropped%29.jpg',
    hint: 'Femme politique française — présidente du Rassemblement National',
  },
  {
    id: 'nicolas_sarkozy', name: 'Nicolas Sarkozy', category: 'fr_politique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Nicolas_Sarkozy_%28cropped%29.jpg/400px-Nicolas_Sarkozy_%28cropped%29.jpg',
    hint: 'Ancien président de la République française (2007–2012)',
  },
  {
    id: 'francois_hollande', name: 'François Hollande', category: 'fr_politique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Fran%C3%A7ois_Hollande_%28cropped%29.jpg/400px-Fran%C3%A7ois_Hollande_%28cropped%29.jpg',
    hint: 'Ancien président de la République française (2012–2017)',
  },
  {
    id: 'jean_luc_melenchon', name: 'Jean-Luc Mélenchon', category: 'fr_politique', flag: '🇫🇷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Jean-Luc_M%C3%A9lenchon_%28cropped%29.jpg/400px-Jean-Luc_M%C3%A9lenchon_%28cropped%29.jpg',
    hint: 'Homme politique français — fondateur de La France Insoumise',
  },
];

export const CATEGORY_LABELS = {
  cinema:        { label: 'Cinéma',              emoji: '🎬', group: '🌍 International' },
  musique:       { label: 'Musique',             emoji: '🎵', group: '🌍 International' },
  sport:         { label: 'Sport',               emoji: '⚽', group: '🌍 International' },
  politique:     { label: 'Politique',           emoji: '🌐', group: '🌍 International' },
  science:       { label: 'Science & Tech',      emoji: '🔬', group: '🌍 International' },
  youtubeur:     { label: 'YouTubeurs',          emoji: '📱', group: '🌍 International' },
  fr_cinema:     { label: 'Cinéma',              emoji: '🎬', group: '🇫🇷 Français' },
  fr_musique:    { label: 'Musique',             emoji: '🎵', group: '🇫🇷 Français' },
  fr_sport:      { label: 'Sport',               emoji: '⚽', group: '🇫🇷 Français' },
  fr_politique:  { label: 'Politique',           emoji: '🏛️', group: '🇫🇷 Français' },
  fr_youtubeur:  { label: 'YouTubeurs',          emoji: '📱', group: '🇫🇷 Français' },
};

export function getPersonalities(count, filter = 'all') {
  let pool = ALL_PERSONALITIES;
  if (filter === 'international') {
    pool = ALL_PERSONALITIES.filter(p => !p.category.startsWith('fr_'));
  } else if (filter === 'francais') {
    pool = ALL_PERSONALITIES.filter(p => p.category.startsWith('fr_'));
  }
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

export function buildChoices(correct, allUsed) {
  const sameCategory = allUsed.filter(p => p.category === correct.category && p.id !== correct.id);
  const others = allUsed.filter(p => p.id !== correct.id && p.category !== correct.category);
  const wrongs = shuffle([...sameCategory, ...others]).slice(0, 3);
  return shuffle([correct, ...wrongs]);
}
