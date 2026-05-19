export const ORACLE_CATEGORIES = [
  { id: 'all',     name: 'Tout',     emoji: '🔮', color: '#8B5CF6' },
  { id: 'fun',     name: 'Fun',      emoji: '🎉', color: '#F59E0B' },
  { id: 'perso',   name: 'Perso',    emoji: '💭', color: '#EC4899' },
  { id: 'profond', name: 'Profond',  emoji: '🌊', color: '#0EA5E9' },
  { id: 'creatif', name: 'Créatif',  emoji: '🎨', color: '#10B981' },
];

const ALL_QUESTIONS = [
  // FUN
  { id: 1,  text: 'Si tu étais un plat, lequel serais-tu et pourquoi ?', cat: 'fun' },
  { id: 2,  text: 'Quel superpouvoir totalement inutile voudrais-tu avoir ?', cat: 'fun' },
  { id: 3,  text: 'Si ta vie était une série Netflix, quel serait le titre du dernier épisode ?', cat: 'fun' },
  { id: 4,  text: 'Quelle est la chose la plus absurde que tu ferais avec un million d\'euros ?', cat: 'fun' },
  { id: 5,  text: 'Si tu devais vivre dans un dessin animé, lequel choisirais-tu ?', cat: 'fun' },
  { id: 6,  text: 'Quel animal représente le mieux ta façon de gérer les lundis matin ?', cat: 'fun' },
  { id: 7,  text: 'Quel son jouerait en fond sonore chaque fois que tu entres dans une pièce ?', cat: 'fun' },
  { id: 8,  text: 'Quelle serait ta stratégie de survie dans un film d\'horreur ?', cat: 'fun' },
  { id: 9,  text: 'Quel emoji te représente le mieux en ce moment précis ?', cat: 'fun' },
  { id: 10, text: 'Si tu pouvais bannir un mot de la langue française pour toujours, lequel ?', cat: 'fun' },
  { id: 11, text: 'Quelle loi absurde instaurerais-tu si tu étais président pour un jour ?', cat: 'fun' },
  { id: 12, text: 'Invente une théorie du complot sur quelque chose de complètement banal.', cat: 'fun' },
  { id: 13, text: 'Comment expliquerais-tu internet à quelqu\'un du Moyen Âge ?', cat: 'fun' },
  { id: 14, text: 'Si les animaux pouvaient parler, lequel aurait les opinions les plus controversées ?', cat: 'fun' },
  { id: 15, text: 'Quelle est la chose la plus dramatique que tu aies déjà faite pour un truc ridicule ?', cat: 'fun' },

  // PERSO
  { id: 16, text: 'Quel conseil donnerais-tu à toi-même il y a 5 ans ?', cat: 'perso' },
  { id: 17, text: 'Quelle est ta plus grande bizarrerie que tu assumes complètement ?', cat: 'perso' },
  { id: 18, text: 'Quel est le mensonge le plus innocent que tu te racontes chaque matin ?', cat: 'perso' },
  { id: 19, text: 'Si ta personnalité était une météo, quelle serait-elle aujourd\'hui ?', cat: 'perso' },
  { id: 20, text: 'Quelle compétence inutile as-tu développée sans vraiment la chercher ?', cat: 'perso' },
  { id: 21, text: 'Quelle est la chose dont tu parles tout le temps mais que tu ne feras probablement jamais ?', cat: 'perso' },
  { id: 22, text: 'Quelle est ta contradiction personnelle préférée ?', cat: 'perso' },
  { id: 23, text: 'Quel truc totalement banal te rend inexplicablement heureux(se) ?', cat: 'perso' },
  { id: 24, text: 'Quelle est la chose dont tu es le plus fier(e) et dont tu ne parles jamais ?', cat: 'perso' },
  { id: 25, text: 'Si ta vie avait une bande-son, quel serait le morceau du moment ?', cat: 'perso' },
  { id: 26, text: 'Quelle est la version de toi-même que tu imagines dans 10 ans ?', cat: 'perso' },
  { id: 27, text: 'Si tu devais résumer ta philosophie de vie en une phrase, ce serait quoi ?', cat: 'perso' },
  { id: 28, text: 'Quel est le truc courageux que tu as fait sans que personne ne le sache ?', cat: 'perso' },
  { id: 29, text: 'Qu\'est-ce que tu ne ferais jamais, peu importe le montant offert ?', cat: 'perso' },
  { id: 30, text: 'Quelle est la chose que tu as apprise sur toi-même cette année ?', cat: 'perso' },

  // PROFOND
  { id: 31, text: 'Si tu pouvais poser une seule question à l\'univers et obtenir une vraie réponse, ce serait quoi ?', cat: 'profond' },
  { id: 32, text: 'Qu\'est-ce que le bonheur selon toi, en une phrase maximum ?', cat: 'profond' },
  { id: 33, text: 'Quelle est la leçon la plus dure que la vie t\'ait enseignée ?', cat: 'profond' },
  { id: 34, text: 'Si tu savais que personne ne te jugerait, qu\'est-ce que tu ferais différemment ?', cat: 'profond' },
  { id: 35, text: 'Quelle est la chose que tu ne comprends pas chez les humains en général ?', cat: 'profond' },
  { id: 36, text: 'Quelle croyance as-tu abandonnée et qui a tout changé pour toi ?', cat: 'profond' },
  { id: 37, text: 'Qu\'est-ce qui fait qu\'une personne mérite d\'être admirée selon toi ?', cat: 'profond' },
  { id: 38, text: 'Quelle question poses-tu mentalement à chaque personne que tu rencontres ?', cat: 'profond' },
  { id: 39, text: 'Si tu devais écrire la première phrase de ta biographie, ce serait quoi ?', cat: 'profond' },
  { id: 40, text: 'Qu\'est-ce que tu ferais différemment si tu savais que tu ne pouvais pas échouer ?', cat: 'profond' },
  { id: 41, text: 'Quelle est la chose que tu comprends maintenant sur l\'amitié que tu ne comprenais pas avant ?', cat: 'profond' },
  { id: 42, text: 'Si tu pouvais envoyer un message à ton futur toi dans 20 ans, ce serait quoi ?', cat: 'profond' },
  { id: 43, text: 'Quel est le moment de ta vie où tu t\'es senti(e) le plus libre ?', cat: 'profond' },
  { id: 44, text: 'Quelle est la question que tu n\'oses jamais poser aux gens que tu aimes ?', cat: 'profond' },
  { id: 45, text: 'Si l\'humanité ne devait retenir qu\'une seule idée, ce serait laquelle ?', cat: 'profond' },

  // CREATIF
  { id: 46, text: 'Invente le titre d\'un film qui résumerait ta semaine.', cat: 'creatif' },
  { id: 47, text: 'Crée un slogan publicitaire pour vendre ta personnalité.', cat: 'creatif' },
  { id: 48, text: 'Invente un nouveau métier qui n\'existe pas encore mais qui devrait.', cat: 'creatif' },
  { id: 49, text: 'Quel serait le nom de ton restaurant et quel serait le plat signature ?', cat: 'creatif' },
  { id: 50, text: 'Invente une règle absurde qui devrait s\'appliquer dans toutes les soirées.', cat: 'creatif' },
  { id: 51, text: 'Comment s\'appellerait ton autobiographie si tu l\'écrivais ce soir ?', cat: 'creatif' },
  { id: 52, text: 'Crée une excuse improbable pour ne pas aller travailler demain.', cat: 'creatif' },
  { id: 53, text: 'Invente un proverbe qui n\'existe pas mais qui devrait.', cat: 'creatif' },
  { id: 54, text: 'Décris ta journée d\'aujourd\'hui comme si c\'était la bande-annonce d\'un film épique.', cat: 'creatif' },
  { id: 55, text: 'Invente le nom et le concept d\'une app qui résoudrait ton plus grand problème du quotidien.', cat: 'creatif' },
  { id: 56, text: 'Si tu étais un personnage de jeu vidéo, quelles seraient tes stats et ta capacité spéciale ?', cat: 'creatif' },
  { id: 57, text: 'Écris le premier tweet de Napoléon s\'il avait Twitter en 1805.', cat: 'creatif' },
  { id: 58, text: 'Quel serait le nom de ta religion si tu en fondais une, et quelle en serait la règle principale ?', cat: 'creatif' },
  { id: 59, text: 'Décris l\'amour en une métaphore complètement farfelue.', cat: 'creatif' },
  { id: 60, text: 'Si ton groupe d\'amis était une équipe de super-héros, quel serait le nom du groupe et quel serait ton pouvoir ?', cat: 'creatif' },
];

let _used = new Set();

export function selectQuestions(count, categoryId = 'all') {
  const pool = categoryId === 'all'
    ? ALL_QUESTIONS
    : ALL_QUESTIONS.filter(q => q.cat === categoryId);

  let available = pool.filter(q => !_used.has(q.id));
  if (available.length < count) {
    _used = new Set();
    available = [...pool];
  }

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  selected.forEach(q => _used.add(q.id));
  return selected;
}
