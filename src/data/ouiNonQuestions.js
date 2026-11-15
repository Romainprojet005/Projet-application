// Oui ou Non : chacun répond en secret, puis devine combien de « oui » il y a eu.
// Les questions se posent à la 2e personne (« Est-ce que tu… ? ») et appellent un oui ou un non franc.
import { tirer } from '../utils/dejaVu';

export const OUINON_CATEGORIES = [
  { value: 'all',     label: 'Tous' },
  { value: 'soiree',  label: 'Soirée' },
  { value: 'perso',   label: 'Perso' },
  { value: 'cercle',  label: 'Dans ce cercle' },
  { value: 'coeur',   label: 'Cœur' },
  { value: 'hot',     label: 'Hot 🔞', adult: true },
];
export const OUINON_ADULT = new Set(['hot']);

const Q = {
  soiree: [
    'As-tu déjà oublié comment tu étais rentré chez toi ?',
    'As-tu déjà vomi en soirée ?',
    'As-tu déjà fait semblant d’être sobre devant tes parents ?',
    'As-tu déjà dansé sur une table ?',
    'As-tu déjà perdu ton téléphone en soirée ?',
    'As-tu déjà envoyé un message que tu as regretté le lendemain ?',
    'As-tu déjà dormi dans une baignoire ou par terre après une soirée ?',
    'As-tu déjà mangé un kebab après 4 h du matin ?',
    'As-tu déjà menti sur ton âge pour entrer quelque part ?',
    'As-tu déjà quitté une soirée sans dire au revoir à personne ?',
    'As-tu déjà chanté au karaoké sans connaître les paroles ?',
    'As-tu déjà appelé quelqu’un en pleine nuit sans raison valable ?',
    'As-tu déjà été le dernier debout à la fin d’une soirée ?',
    'As-tu déjà fait une nuit blanche juste pour faire la fête ?',
    'As-tu déjà été refoulé à l’entrée d’une boîte ?',
    'As-tu déjà mélangé des alcools en te jurant de ne plus jamais le faire ?',
    'As-tu déjà raté un train ou un avion à cause d’une soirée ?',
    'As-tu déjà inventé une excuse pour ne pas venir à une soirée ?',
  ],
  perso: [
    'As-tu déjà menti dans ce jeu ?',
    'As-tu déjà pleuré devant un dessin animé ?',
    'As-tu déjà fouillé le téléphone de quelqu’un ?',
    'As-tu déjà triché à un examen ?',
    'As-tu déjà fait semblant d’être malade pour ne pas aller en cours ou au travail ?',
    'As-tu déjà volé quelque chose dans un magasin ?',
    'As-tu déjà parlé tout seul devant un miroir ?',
    'As-tu déjà stalké un ex sur les réseaux sociaux ?',
    'As-tu déjà mangé un truc tombé par terre ?',
    'As-tu déjà fait pipi dans une piscine ?',
    'As-tu déjà recraché discrètement un plat chez quelqu’un ?',
    'As-tu déjà fait semblant de rire à une blague que tu n’avais pas comprise ?',
    'As-tu déjà gardé un cadeau que tu comptais offrir à quelqu’un d’autre ?',
    'As-tu déjà dit « je suis en route » alors que tu n’étais pas encore habillé ?',
    'As-tu déjà eu peur du noir après tes 15 ans ?',
    'As-tu déjà été viré d’un cours ?',
    'As-tu déjà lu les messages de quelqu’un par-dessus son épaule ?',
    'As-tu déjà oublié l’anniversaire d’un ami proche ?',
    'As-tu déjà fait une recherche Google sur toi-même ?',
    'Dors-tu encore avec une peluche ?',
  ],
  cercle: [
    'Est-ce que tu embrasserais quelqu’un dans ce cercle ?',
    'As-tu déjà dit du mal de quelqu’un dans ce cercle ?',
    'Y a-t-il quelqu’un dans ce cercle que tu trouves canon ?',
    'As-tu déjà menti à quelqu’un dans ce cercle ?',
    'Y a-t-il quelqu’un dans ce cercle à qui tu ne confierais jamais un secret ?',
    'As-tu déjà été jaloux de quelqu’un dans ce cercle ?',
    'Partirais-tu en vacances seul avec n’importe qui de ce cercle ?',
    'Y a-t-il quelqu’un dans ce cercle que tu n’aimais pas au début ?',
    'As-tu déjà rêvé de quelqu’un dans ce cercle ?',
    'As-tu déjà eu un crush sur quelqu’un dans ce cercle ?',
    'Y a-t-il quelqu’un dans ce cercle dont tu as déjà fouillé les réseaux sociaux ?',
    'Penses-tu être la personne la plus drôle de ce cercle ?',
    'Prêterais-tu 500 € à n’importe qui dans ce cercle ?',
    'As-tu déjà parlé de quelqu’un de ce cercle dans son dos ce soir ?',
    'Y a-t-il quelqu’un dans ce cercle avec qui tu ne pourrais pas vivre en coloc ?',
    'Connais-tu un secret sur quelqu’un dans ce cercle ?',
  ],
  coeur: [
    'As-tu déjà été en couple plus d’un an ?',
    'As-tu déjà dragué sur une application de rencontre ?',
    'As-tu déjà ghosté quelqu’un ?',
    'As-tu déjà été ghosté ?',
    'As-tu déjà dit « je t’aime » sans le penser ?',
    'As-tu déjà eu un coup de foudre ?',
    'Es-tu déjà retourné avec un ex ?',
    'As-tu déjà eu le cœur brisé ?',
    'As-tu déjà eu un crush sur le copain ou la copine d’un ami ?',
    'As-tu déjà écrit une lettre d’amour ?',
    'As-tu déjà fait le premier pas ?',
    'As-tu déjà été trompé ?',
    'As-tu déjà oublié le prénom de quelqu’un avec qui tu flirtais ?',
    'As-tu déjà eu un rendez-vous si nul que tu as inventé une excuse pour partir ?',
    'Es-tu encore en contact avec un ex ?',
    'Crois-tu au grand amour ?',
  ],
  hot: [
    'As-tu déjà embrassé quelqu’un dont tu ne connaissais pas le prénom ?',
    'As-tu déjà envoyé une photo osée ?',
    'As-tu déjà eu un plan d’un soir ?',
    'As-tu déjà embrassé deux personnes différentes dans la même soirée ?',
    'As-tu déjà été surpris dans une situation gênante ?',
    'As-tu déjà fantasmé sur un prof ou un collègue ?',
    'As-tu déjà fait l’amour dans un lieu public ?',
    'As-tu déjà simulé ?',
    'As-tu déjà couché avec un ex après la rupture ?',
    'As-tu déjà embrassé quelqu’un du même sexe ?',
    'As-tu déjà eu un sex friend ?',
    'As-tu déjà été pris en flagrant délit par tes parents ?',
    'As-tu déjà fait un strip-tease ?',
    'As-tu déjà regardé un film X avec quelqu’un ?',
  ],
};

export const OUINON_QUESTIONS = Object.entries(Q).flatMap(([category, list]) =>
  list.map((q) => ({ q, category })));

export function ouiNonPool(categoryId) {
  return OUINON_QUESTIONS.filter((x) => (categoryId === 'all' ? !OUINON_ADULT.has(x.category) : x.category === categoryId));
}

// Questions jamais vues d'abord (cf. utils/dejaVu)
export function selectOuiNon(count, categoryId) {
  return tirer('ouinon', ouiNonPool(categoryId), count);
}
