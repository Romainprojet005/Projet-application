// Undercover — paires de mots anglaises (site /en/). Mêmes clés de thèmes que wordLists.js.
import { wordThemes as FR } from './wordLists';

// Familles de mots proches pour le thème « Random » : deux mots d'une même famille forment une paire
export const wordClusters = [
  { words: ['Car', 'Motorbike', 'Bus', 'Truck'] },
  { words: ['Beach', 'Pool', 'Lake', 'River'] },
  { words: ['Pizza', 'Burger', 'Hot dog', 'Taco'] },
  { words: ['Cat', 'Dog', 'Rabbit', 'Hamster'] },
  { words: ['Coffee', 'Tea', 'Hot chocolate', 'Latte'] },
  { words: ['Football', 'Rugby', 'Basketball', 'Volleyball'] },
  { words: ['Guitar', 'Piano', 'Violin', 'Drums'] },
  { words: ['Doctor', 'Nurse', 'Dentist', 'Vet'] },
  { words: ['Castle', 'Palace', 'Tower', 'Fortress'] },
  { words: ['Pirate', 'Viking', 'Knight', 'Ninja'] },
  { words: ['Snow', 'Rain', 'Hail', 'Fog'] },
  { words: ['Plane', 'Helicopter', 'Rocket', 'Hot-air balloon'] },
  { words: ['Wedding', 'Birthday', 'Graduation', 'Baby shower'] },
  { words: ['Netflix', 'YouTube', 'TikTok', 'Instagram'] },
  { words: ['Ice cream', 'Frozen yogurt', 'Sorbet', 'Milkshake'] },
  { words: ['Gym', 'Yoga', 'Pilates', 'Running'] },
];

export function generateRandomPair(usedClusterIndices) {
  let available = wordClusters.map((_, i) => i).filter(i => !usedClusterIndices.has(i));
  if (available.length === 0) {
    usedClusterIndices.clear();
    available = wordClusters.map((_, i) => i);
  }
  const clusterIdx = available[Math.floor(Math.random() * available.length)];
  usedClusterIndices.add(clusterIdx);
  const words = [...wordClusters[clusterIdx].words];
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return { civilian: words[0], undercover: words[1] };
}

const p = (list) => list.map(([civilian, undercover]) => ({ civilian, undercover }));

export const wordThemes = {
  classique: {
    label: 'Classic',
    emoji: '🎯',
    description: 'For all ages',
    pairs: p([
      ['Car', 'Motorbike'], ['Beach', 'Pool'], ['Pizza', 'Burger'], ['Cat', 'Dog'], ['Phone', 'Tablet'],
      ['Coffee', 'Tea'], ['Football', 'Rugby'], ['Movie', 'TV series'], ['Mountain', 'Hill'], ['Rain', 'Snow'],
      ['Sun', 'Moon'], ['Book', 'Magazine'], ['Plane', 'Helicopter'], ['Chocolate', 'Caramel'], ['Beer', 'Cider'],
      ['Pool', 'Hot tub'], ['Wedding', 'Engagement'], ['Shoes', 'Socks'], ['Mirror', 'Window'], ['Key', 'Padlock'],
      ['Birthday', 'Christmas'], ['Scarf', 'Tie'], ['Postcard', 'Letter'], ['Video game', 'Board game'],
      ['Running', 'Walking'], ['Smile', 'Laugh'], ['Party', 'Celebration'], ['Breakfast', 'Brunch'], ['Pillow', 'Blanket'],
    ]),
  },
  nature: {
    label: 'Nature',
    emoji: '🌿',
    description: 'The world around us',
    pairs: p([
      ['Lion', 'Tiger'], ['Forest', 'Jungle'], ['River', 'Lake'], ['Flower', 'Plant'], ['Bird', 'Butterfly'],
      ['Rock', 'Stone'], ['Cloud', 'Fog'], ['Leaf', 'Grass'], ['Sea', 'Ocean'], ['Volcano', 'Mountain'],
      ['Ant', 'Bee'], ['Storm', 'Thunder'], ['Waterfall', 'Fountain'], ['Desert', 'Savanna'], ['Owl', 'Eagle'],
      ['Spider', 'Scorpion'], ['Shark', 'Killer whale'], ['Fox', 'Wolf'], ['Crocodile', 'Alligator'], ['Glacier', 'Iceberg'],
      ['Snake', 'Lizard'], ['Deer', 'Moose'], ['Cliff', 'Dune'], ['Moss', 'Lichen'], ['Penguin', 'Puffin'],
    ]),
  },
  cinema: {
    label: 'Movies',
    emoji: '🎬',
    description: 'For movie buffs',
    pairs: p([
      ['Hero', 'Superhero'], ['Cinema', 'Theatre'], ['Comedy', 'Drama'], ['Director', 'Producer'], ['Oscar', 'Golden Globe'],
      ['Popcorn', 'Nachos'], ['Special effects', 'Stunts'], ['Horror', 'Thriller'], ['Remake', 'Sequel'], ['Streaming', 'DVD'],
      ['Actor', 'Extra'], ['Script', 'Novel'], ['Premiere', 'Festival'], ['Trailer', 'Poster'], ['Stunt double', 'Body double'],
      ['Soundtrack', 'Credits'], ['Documentary', 'Mockumentary'], ['Western', 'War movie'], ['Prequel', 'Spin-off'], ['Drive-in', 'Movie theatre'],
    ]),
  },
  // Noms de personnages : identiques dans toutes les langues
  anime: { ...FR.anime, label: 'Anime', description: 'Similar characters' },
  animation: {
    label: 'Cartoons',
    emoji: '🎨',
    description: 'Similar characters',
    pairs: p([
      ['Mickey Mouse', 'Bugs Bunny'], ['Donald Duck', 'Daffy Duck'], ['Scooby-Doo', 'Goofy'], ['Cinderella', 'Snow White'],
      ['Elsa', 'Rapunzel'], ['Ariel', 'Moana'], ['Mulan', 'Pocahontas'], ['Merida', 'Raya'], ['Aladdin', 'Flynn Rider'],
      ['Tarzan', 'Mowgli'], ['Robin Hood', 'Peter Pan'], ['Maui', 'Hercules'], ['Simba', 'Bambi'], ['Stitch', 'Toothless'],
      ['Shrek', 'Mr. Incredible'], ['Wreck-It Ralph', 'Sulley'], ['WALL-E', 'Baymax'], ['Timon', 'Abu'], ['Dory', 'Olaf'],
      ['Hades', 'Jafar'], ['Maleficent', 'The Evil Queen'], ['Ursula', 'Cruella'], ['Scar', 'Tai Lung'], ['Jack Skellington', 'The Grinch'],
    ]),
  },
  aleatoire: {
    label: 'Random',
    emoji: '✨',
    description: 'A surprise every game!',
    generated: true,
    pairs: [],
  },
  hot: {
    label: 'Hot 🔥',
    emoji: '🔥',
    description: 'Adults only…',
    pairs: p([
      ['Lube', 'Lotion'], ['Handcuffs', 'Ropes'], ['Lingerie', 'Swimsuit'], ['Strip-tease', 'Pole dance'], ['Condom', 'Balloon'],
      ['One-night stand', 'Friends with benefits'], ['Blindfold', 'Mask'], ['Hickey', 'Bruise'], ['Dating app', 'Blind date'],
      ['Slow dance', 'Lap dance'], ['Bubble bath for two', 'Shower for two'], ['Fantasy', 'Fetish'], ['Sexting', 'Nudes'],
      ['Threesome', 'Swinging'], ['Flirting', 'Seducing'], ['Skinny dipping', 'Nudist beach'], ['Sex shop', 'Lingerie shop'],
      ['Foreplay', 'Make-out session'], ['Massage oil', 'Olive oil'], ['Whipped cream', 'Melted chocolate'], ['Peach', 'Apricot'],
      ['Eggplant', 'Zucchini'], ['Spanking', 'Pat on the back'], ['Safe word', 'Password'], ['Walk of shame', 'Morning after'],
      ['Ex', 'Crush'], ['Body shot', 'Tequila shot'], ['Stockings', 'Fishnets'], ['Back seat', 'Changing room'], ['Squeaky bed', 'Thin walls'],
    ]),
  },
  coquin: {
    label: 'Naughty 😏',
    emoji: '😏',
    description: 'Innuendo for adults',
    pairs: p([
      ['Kiss', 'Peck'], ['Naked', 'Undressed'], ['Tongue', 'Lips'], ['Hands', 'Fingers'], ['Shower', 'Bath'],
      ['Bedroom', 'Living room'], ['Massage', 'Caress'], ['Underwear', 'Swimwear'], ['Tights', 'Stockings'],
      ['Handcuffs', 'Bracelet'], ['Toy', 'Accessory'], ['Fantasy', 'Dream'], ['Forbidden', 'Secret'], ['Tease', 'Flirt'],
    ]),
  },
  tres_hot: {
    label: 'Very hot 🔞',
    emoji: '🔞',
    description: 'Explicit — adults only',
    pairs: p([
      ['Butt', 'Booty'], ['Doggy style', 'Missionary'], ['Blowjob', 'Oral'], ['Dildo', 'Toy'], ['Vibrator', 'Dildo'],
      ['Orgasm', 'Climax'], ['Dominant', 'Master'], ['Submissive', 'Slave'], ['Boobs', 'Chest'], ['Threesome', 'Orgy'],
      ['Quickie', 'Marathon'], ['Porn', 'Sex tape'], ['Fingering', 'Touching'], ['Horny', 'Turned on'],
    ]),
  },
};
