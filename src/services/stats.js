// Statistiques anonymes des jeux (table `parties`, voir supabase_parties.sql).
// Aucune donnée personnelle : seulement le jeu, l'étape, le mode et le nombre de joueurs.
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { characters } from '../data/characters';
import { gamePath } from '../data/seo';

// Uniquement sur le vrai site (pas en local ni sur les aperçus Netlify) et dans l'app mobile
const ENABLED =
  Platform.OS !== 'web' ||
  (typeof window !== 'undefined' && window.location.hostname === 'soireedeslegendes.com');

const GAME_PATHS = new Set(characters.map(gamePath));

// Jeu d'un écran, d'après son chemin dans le linking (« blindtest/multi/lobby » → « blindtest »)
function gameOf(route, screens) {
  const path = route && screens[route.name];
  const first = typeof path === 'string' ? path.split('/')[0] : null;
  return GAME_PATHS.has(first) ? first : null;
}

function playerCount(params = {}) {
  const n = params.players?.length ?? params.playerNames?.length ?? params.playerCount;
  return Number.isInteger(n) ? n : null;
}

function log(row) {
  if (!ENABLED || !supabase) return;
  supabase.from('parties').insert(row).then(({ error }) => {
    if (error) console.warn('Stats parties :', error.message);
  });
}

// À appeler à chaque changement d'écran :
// - « ouverture » : on arrive sur l'écran de paramétrage d'un jeu (depuis l'accueil)
// - « lancement » : on quitte l'écran de paramétrage pour démarrer la partie
// En multi-téléphones, chaque téléphone qui rejoint compte pour un lancement.
export function trackRouteChange(prev, cur, screens) {
  const jeu = gameOf(cur, screens);
  if (!jeu) return;
  const prevJeu = gameOf(prev, screens);
  const curSetup = cur.name.endsWith('Setup');
  const prevSetup = !!prev && prev.name.endsWith('Setup');

  if (curSetup && prevJeu !== jeu) {
    log({ jeu, etape: 'ouverture' });
  } else if (prevSetup && !curSetup && prevJeu === jeu) {
    log({
      jeu,
      etape: 'lancement',
      mode: /Multi|Lobby|Wait/.test(cur.name) ? 'multi' : 'local',
      joueurs: playerCount(cur.params),
    });
  }
}
