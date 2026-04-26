// Maps character names (as used in wordLists.js pairs) to a representative
// Wikipedia image URL. Characters without an entry just show no image (graceful fallback).
const characterImages = {

  // ── ANIME ─────────────────────────────────────────────────────────────────

  // Naruto universe
  Naruto:          'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  Sasuke:          'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  Kakashi:         'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  'Hinata Hyuga':  'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  'Itachi Uchiha': 'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  'Rock Lee':      'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  'Madara Uchiha': 'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  'Zabuza Momochi':'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',
  'Shikamaru Nara':'https://upload.wikimedia.org/wikipedia/en/9/94/NarutoCoverTankobon1.jpg',

  // Dragon Ball universe
  Goku:    'https://upload.wikimedia.org/wikipedia/en/c/c9/DB_Tank%C5%8Dbon.png',
  Vegeta:  'https://upload.wikimedia.org/wikipedia/en/c/c9/DB_Tank%C5%8Dbon.png',
  Frieza:  'https://upload.wikimedia.org/wikipedia/en/c/c9/DB_Tank%C5%8Dbon.png',
  Bulma:   'https://upload.wikimedia.org/wikipedia/en/c/c9/DB_Tank%C5%8Dbon.png',
  Piccolo: 'https://upload.wikimedia.org/wikipedia/en/c/c9/DB_Tank%C5%8Dbon.png',

  // One Piece
  Luffy:          'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg',
  Zoro:           'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg',
  Nami:           'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg',
  Usopp:          'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg',
  Shanks:         'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg',
  'Barbe Blanche':'https://upload.wikimedia.org/wikipedia/en/9/90/One_Piece%2C_Volume_61_Cover_%28Japanese%29.jpg',

  // Bleach
  'Ichigo Kurosaki': 'https://upload.wikimedia.org/wikipedia/en/3/3f/Bleach_%28manga%29_1.png',
  'Rukia Kuchiki':   'https://upload.wikimedia.org/wikipedia/en/3/3f/Bleach_%28manga%29_1.png',
  'Byakuya Kuchiki': 'https://upload.wikimedia.org/wikipedia/en/3/3f/Bleach_%28manga%29_1.png',
  Aizen:             'https://upload.wikimedia.org/wikipedia/en/3/3f/Bleach_%28manga%29_1.png',

  // Demon Slayer
  'Tanjiro Kamado':    'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg',
  'Nezuko Kamado':     'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg',
  Zenitsu:             'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg',
  'Giyu Tomioka':      'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg',
  'Inosuke Hashibira': 'https://upload.wikimedia.org/wikipedia/en/0/09/Demon_Slayer_-_Kimetsu_no_Yaiba%2C_volume_1.jpg',

  // Attack on Titan
  'Mikasa Ackerman': 'https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg',
  'Levi Ackerman':   'https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg',
  'Erwin Smith':     'https://upload.wikimedia.org/wikipedia/en/d/d6/Shingeki_no_Kyojin_manga_volume_1.jpg',

  // Hunter x Hunter
  'Gon Freecss': 'https://upload.wikimedia.org/wikipedia/en/e/e8/Hunter_%C3%97_Hunter_vol._1.png',
  Killua:        'https://upload.wikimedia.org/wikipedia/en/e/e8/Hunter_%C3%97_Hunter_vol._1.png',
  Kurapika:      'https://upload.wikimedia.org/wikipedia/en/e/e8/Hunter_%C3%97_Hunter_vol._1.png',

  // My Hero Academia
  'Izuku Midoriya': 'https://upload.wikimedia.org/wikipedia/en/5/5a/Boku_no_Hero_Academia_Volume_1.png',
  Todoroki:         'https://upload.wikimedia.org/wikipedia/en/5/5a/Boku_no_Hero_Academia_Volume_1.png',
  'All Might':      'https://upload.wikimedia.org/wikipedia/en/5/5a/Boku_no_Hero_Academia_Volume_1.png',
  'Toga Himiko':    'https://upload.wikimedia.org/wikipedia/en/5/5a/Boku_no_Hero_Academia_Volume_1.png',

  // Death Note
  'Light Yagami': 'https://upload.wikimedia.org/wikipedia/en/6/6f/Death_Note_Vol_1.jpg',
  L:              'https://upload.wikimedia.org/wikipedia/en/6/6f/Death_Note_Vol_1.jpg',

  // Jujutsu Kaisen
  'Gojo Satoru': 'https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_kaisen.jpg',

  // Code Geass
  Lelouch: 'https://upload.wikimedia.org/wikipedia/en/7/74/Code_Geass_R1_box_set_cover.jpg',

  // One Punch Man
  Saitama: 'https://upload.wikimedia.org/wikipedia/en/c/c3/OnePunchMan_manga_cover.png',

  // Mob Psycho 100
  'Mob Kageyama': 'https://upload.wikimedia.org/wikipedia/en/4/4b/Mob_Psycho_100_manga_vol_1.jpg',

  // Fullmetal Alchemist
  'Edward Elric': 'https://upload.wikimedia.org/wikipedia/en/9/9d/Fullmetal123.jpg',
  'Roy Mustang':  'https://upload.wikimedia.org/wikipedia/en/9/9d/Fullmetal123.jpg',

  // Sword Art Online
  Kirito: 'https://upload.wikimedia.org/wikipedia/en/3/3e/Sword_Art_Online_light_novel_volume_1_cover.jpg',

  // Re:Zero
  'Subaru Natsuki': 'https://upload.wikimedia.org/wikipedia/en/3/3c/Re-Zero_kara_Hajimeru_Isekai_Seikatsu_light_novel_volume_1_cover.jpg',
  Rem:              'https://upload.wikimedia.org/wikipedia/en/3/3c/Re-Zero_kara_Hajimeru_Isekai_Seikatsu_light_novel_volume_1_cover.jpg',

  // That Time I Got Reincarnated as a Slime
  'Rimuru Tempest': 'https://upload.wikimedia.org/wikipedia/en/8/8c/That_Time_I_Got_Reincarnated_as_a_Slime_light_novel_volume_1_cover.jpg',

  // Overlord
  'Ainz Ooal Gown': 'https://upload.wikimedia.org/wikipedia/en/1/18/Overlord_novel.jpg',

  // Soul Eater
  'Maka Albarn':   'https://upload.wikimedia.org/wikipedia/en/f/fe/Soul_Eater_manga_volume_1.jpg',
  'Death the Kid': 'https://upload.wikimedia.org/wikipedia/en/f/fe/Soul_Eater_manga_volume_1.jpg',

  // Tokyo Ghoul
  'Ken Kaneki': 'https://upload.wikimedia.org/wikipedia/en/e/e5/Tokyo_Ghoul_volume_1_cover.jpg',

  // Fairy Tail
  'Natsu Dragneel': 'https://upload.wikimedia.org/wikipedia/en/e/e1/FairyTail-Volume_1_Cover.jpg',
  'Erza Scarlet':   'https://upload.wikimedia.org/wikipedia/en/e/e1/FairyTail-Volume_1_Cover.jpg',
  Gildarts:         'https://upload.wikimedia.org/wikipedia/en/e/e1/FairyTail-Volume_1_Cover.jpg',

  // Black Clover
  Asta: 'https://upload.wikimedia.org/wikipedia/en/6/69/Black_Clover%2C_volume_1.jpg',

  // Tengen Toppa Gurren Lagann
  Simon: 'https://upload.wikimedia.org/wikipedia/en/2/20/Gurren_Lagann_key_visual.jpg',

  // JoJo's Bizarre Adventure
  'Dio Brando':  'https://upload.wikimedia.org/wikipedia/en/f/f7/JoJo_no_Kimyou_na_Bouken_cover_-_vol1.jpg',
  'Jotaro Kujo': 'https://upload.wikimedia.org/wikipedia/en/f/f7/JoJo_no_Kimyou_na_Bouken_cover_-_vol1.jpg',

  // Berserk
  Guts:     'https://upload.wikimedia.org/wikipedia/en/4/4a/Berserk_vol01.png',
  Griffith: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Berserk_vol01.png',

  // The Seven Deadly Sins
  Meliodas: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Nanatsu_no_Taizai_Volume_1.png',

  // Gintama
  Gintoki: 'https://upload.wikimedia.org/wikipedia/en/a/a9/Gintama_vol._01.png',

  // Hellsing
  Alucard: 'https://upload.wikimedia.org/wikipedia/en/0/02/Hellsing_1.png',

  // Charlotte
  'Yuu Otosaka': 'https://upload.wikimedia.org/wikipedia/en/3/32/Charlotte_key.jpg',

  // Future Diary (Mirai Nikki)
  'Yuno Gasai': 'https://upload.wikimedia.org/wikipedia/en/5/54/Mirainikkicover.jpg',

  // Saint Seiya
  Seiya: 'https://upload.wikimedia.org/wikipedia/en/7/75/Saint_Seiya_1.png',

  // Rurouni Kenshin
  'Kenshin Himura': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Rurouni_Kenshin_28.png',

  // Pokémon
  'Ash Ketchum': 'https://upload.wikimedia.org/wikipedia/en/e/e3/PokemonSunMoonSeason20JapaneseAnimeLogo.png',

  // Digimon
  'Taichi Kamiya': 'https://upload.wikimedia.org/wikipedia/en/4/43/Digimon_Digital_Monsters_Season_1_DVD_Cover.png',

  // Darker than Black
  Hei: 'https://upload.wikimedia.org/wikipedia/en/a/a4/DTB_DVD.jpg',

  // Detective Conan
  'Conan Edogawa': 'https://upload.wikimedia.org/wikipedia/en/3/3f/Case_Closed_Volume_36.png',

  // Dr. Stone
  'Senku Ishigami': 'https://upload.wikimedia.org/wikipedia/en/2/29/Doctor_stone.jpg',

  // Fruits Basket
  'Tohru Honda': 'https://upload.wikimedia.org/wikipedia/en/e/e6/Fruits_Basket_manga.jpg',

  // Yu Yu Hakusho
  'Yusuke Urameshi': 'https://upload.wikimedia.org/wikipedia/en/b/b7/YuYu_Hakusho_1.png',

  // ── ANIMATION ─────────────────────────────────────────────────────────────

  // Disney — Classic characters
  'Mickey Mouse': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Mickey_Mouse_%28poster_version%29.svg/400px-Mickey_Mouse_%28poster_version%29.svg.png',
  'Donald Duck':  'https://upload.wikimedia.org/wikipedia/en/a/a5/Donald_Duck_angry_transparent_background.png',
  Dingo:          'https://upload.wikimedia.org/wikipedia/en/5/50/Goofy_Duckipedia.png',

  // Looney Tunes
  'Bugs Bunny': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/17/Bugs_Bunny.svg/400px-Bugs_Bunny.svg.png',
  'Daffy Duck': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Daffy_Duck.svg/400px-Daffy_Duck.svg.png',

  // Scooby-Doo
  'Scooby-Doo': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Scooby_doo_logo.png',

  // Frozen
  Elsa: 'https://upload.wikimedia.org/wikipedia/en/0/05/Frozen_%282013_film%29_poster.jpg',
  Anna: 'https://upload.wikimedia.org/wikipedia/en/0/05/Frozen_%282013_film%29_poster.jpg',
  Olaf: 'https://upload.wikimedia.org/wikipedia/en/0/05/Frozen_%282013_film%29_poster.jpg',

  // Tangled
  Raiponce:     'https://upload.wikimedia.org/wikipedia/en/9/91/Tangled_poster.jpg',
  'Flynn Rider':'https://upload.wikimedia.org/wikipedia/en/9/91/Tangled_poster.jpg',

  // Aladdin
  Aladdin: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Aladdin_%281992_Disney_film%29_poster.jpg',
  Jasmine: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Aladdin_%281992_Disney_film%29_poster.jpg',
  Jafar:   'https://upload.wikimedia.org/wikipedia/en/e/ea/Aladdin_%281992_Disney_film%29_poster.jpg',
  Abu:     'https://upload.wikimedia.org/wikipedia/en/e/ea/Aladdin_%281992_Disney_film%29_poster.jpg',

  // Mulan
  Mulan: 'https://upload.wikimedia.org/wikipedia/en/1/11/Mulan-1998-movie-poster.jpg',

  // Pocahontas
  Pocahontas: 'https://upload.wikimedia.org/wikipedia/en/5/57/Pocahontasposter.jpg',

  // The Lion King
  Simba:  'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg',
  Timon:  'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg',
  Pumbaa: 'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg',
  Scar:   'https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg',

  // Bambi
  Bambi: "https://upload.wikimedia.org/wikipedia/en/8/88/Walt_Disney%27s_Bambi_poster.jpg",

  // Lilo & Stitch
  Stitch: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Lilo_%26_Stitch_poster.jpg',
  Lilo:   'https://upload.wikimedia.org/wikipedia/en/c/c3/Lilo_%26_Stitch_poster.jpg',

  // How to Train Your Dragon
  Krokmou: 'https://upload.wikimedia.org/wikipedia/en/9/99/How_to_Train_Your_Dragon_logo.png',

  // Moana
  Vaiana: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Moana_%282016_film%29_poster.jpg',
  Maui:   'https://upload.wikimedia.org/wikipedia/en/4/4a/Moana_%282016_film%29_poster.jpg',

  // Hercules
  Hercule: 'https://upload.wikimedia.org/wikipedia/en/6/65/Hercules_%281997_film%29_poster.jpg',
  Hades:   'https://upload.wikimedia.org/wikipedia/en/6/65/Hercules_%281997_film%29_poster.jpg',

  // The Nightmare Before Christmas
  'Jack Skellington': 'https://upload.wikimedia.org/wikipedia/en/9/9a/The_nightmare_before_christmas_poster.jpg',

  // Cinderella
  Cendrillon: 'https://upload.wikimedia.org/wikipedia/en/5/58/Cinderella_%281950_film%29.jpg',

  // Snow White
  'Blanche-Neige':     'https://upload.wikimedia.org/wikipedia/en/5/5e/Snow_White_1937_film_poster.jpg',
  'la Reine Sorcière': 'https://upload.wikimedia.org/wikipedia/en/5/5e/Snow_White_1937_film_poster.jpg',

  // The Little Mermaid
  Ariel:  'https://upload.wikimedia.org/wikipedia/en/0/04/The_Little_Mermaid_%281989_film%29_poster.jpg',
  Ursula: 'https://upload.wikimedia.org/wikipedia/en/0/04/The_Little_Mermaid_%281989_film%29_poster.jpg',

  // Toy Story 3
  Lotso: 'https://upload.wikimedia.org/wikipedia/en/6/69/Toy_Story_3_poster.jpg',

  // The Incredibles
  'Bob Parr': 'https://upload.wikimedia.org/wikipedia/en/2/27/The_Incredibles_%282004_animated_feature_film%29.jpg',

  // Shrek
  Shrek: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Shrek_%282001_animated_feature_film%29.jpg',

  // Robin Hood
  'Robin des Bois': 'https://upload.wikimedia.org/wikipedia/en/9/91/Robinhood_1973_poster.png',

  // Peter Pan
  'Peter Pan': 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Peter_Pan_%281953_poster%29.jpg',

  // Tarzan
  Tarzan:  'https://upload.wikimedia.org/wikipedia/en/4/4f/Tarzan_%281999_film%29_-_theatrical_poster.jpg',
  Jane:    'https://upload.wikimedia.org/wikipedia/en/4/4f/Tarzan_%281999_film%29_-_theatrical_poster.jpg',
  Clayton: 'https://upload.wikimedia.org/wikipedia/en/4/4f/Tarzan_%281999_film%29_-_theatrical_poster.jpg',

  // The Jungle Book
  Mowgli: 'https://upload.wikimedia.org/wikipedia/en/b/bf/The_Jungle_Book_%281967_film%29.jpg',
  Baloo:  'https://upload.wikimedia.org/wikipedia/en/b/bf/The_Jungle_Book_%281967_film%29.jpg',

  // Beauty and the Beast
  'la Bête': 'https://upload.wikimedia.org/wikipedia/en/7/71/Beauty_and_the_Beast_Poster.jpg',
  Belle:     'https://upload.wikimedia.org/wikipedia/en/7/71/Beauty_and_the_Beast_Poster.jpg',
  Gaston:    'https://upload.wikimedia.org/wikipedia/en/7/71/Beauty_and_the_Beast_Poster.jpg',

  // Sleeping Beauty
  Maleficent: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Sleeping_Beauty_%281959_film%29.jpg',

  // The Hunchback of Notre Dame
  Quasimodo: 'https://upload.wikimedia.org/wikipedia/en/2/26/The_Hunchback_of_Notre_Dame_1996_poster.jpg',
  Esmeralda: 'https://upload.wikimedia.org/wikipedia/en/2/26/The_Hunchback_of_Notre_Dame_1996_poster.jpg',

  // Wreck-It Ralph
  'Wreck-It Ralph': 'https://upload.wikimedia.org/wikipedia/en/1/15/Wreckitralphposter.jpeg',
  Vanellope:        'https://upload.wikimedia.org/wikipedia/en/1/15/Wreckitralphposter.jpeg',

  // Monsters, Inc.
  Sulley: 'https://upload.wikimedia.org/wikipedia/en/6/63/Monsters_Inc.JPG',

  // Finding Nemo
  Dory: 'https://upload.wikimedia.org/wikipedia/en/2/29/Finding_Nemo.jpg',

  // WALL-E
  'WALL-E': 'https://upload.wikimedia.org/wikipedia/en/4/4c/WALL-E_poster.jpg',

  // Big Hero 6
  Baymax: 'https://upload.wikimedia.org/wikipedia/en/4/4b/Big_Hero_6_%28film%29_poster.jpg',

  // Kung Fu Panda
  Po:       'https://upload.wikimedia.org/wikipedia/en/7/76/Kungfupanda.jpg',
  'Tai Lung':'https://upload.wikimedia.org/wikipedia/en/7/76/Kungfupanda.jpg',

  // Coco
  Miguel: 'https://upload.wikimedia.org/wikipedia/en/9/98/Coco_%282017_film%29_poster.jpg',

  // Brave
  Merida: 'https://upload.wikimedia.org/wikipedia/en/9/96/Brave_Poster.jpg',

  // Raya and the Last Dragon
  Raya: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Raya_and_the_Last_Dragon.png',

  // Encanto
  Mirabel: 'https://upload.wikimedia.org/wikipedia/en/8/83/Encanto_poster.jpg',

  // Adventure Time
  Finn: 'https://upload.wikimedia.org/wikipedia/en/3/37/Adventure_Time_-_Title_card.png',

  // Avatar: The Last Airbender
  Aang: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Avatar-_The_Last_Airbender_Book_1_DVD.jpg',

  // SpongeBob SquarePants
  SpongeBob: 'https://upload.wikimedia.org/wikipedia/en/2/27/SpongeBob_S1.jpg',

  // Astérix
  'Astérix': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Asterix.svg/400px-Asterix.svg.png',

  // Lucky Luke
  'Lucky Luke': 'https://upload.wikimedia.org/wikipedia/en/0/0e/LuckyLuke2.png',
};

export default characterImages;
