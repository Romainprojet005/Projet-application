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

// ── Fréquentation (table `visites`, voir supabase_visites.sql) ──
// Une ligne par visite (une fois par onglet) : page d'arrivée, site d'origine (domaine seulement),
// type d'écran, site installé ou non. Ni cookie, ni adresse IP, ni identifiant.
function trackVisite() {
  if (!ENABLED || !supabase || Platform.OS !== 'web') return;
  try {
    if (sessionStorage.getItem('sdl-visite')) return;
    sessionStorage.setItem('sdl-visite', '1');
  } catch { return; }
  let source = null;
  try {
    const ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
    if (ref && ref !== window.location.hostname) source = ref.slice(0, 60);
  } catch {}
  const page = (window.location.pathname.split('/')[1] || 'accueil').slice(0, 40);
  const ecran = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1100 ? 'tablette' : 'ordinateur';
  let installe = false;
  try { installe = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch {}
  supabase.from('visites').insert({ page, source, ecran, installe }).then(({ error }) => {
    if (error) console.warn('Stats visites :', error.message);
  });
}
trackVisite();
