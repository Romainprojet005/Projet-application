// Web mobile : plein écran pendant les parties, et installation du site comme une appli.
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined';

const isTouch = () => isWeb && !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

// Déjà lancé depuis l'écran d'accueil (appli installée) : pas de barre d'adresse.
export const isInstalled = () => isWeb && (
  (window.matchMedia && window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches)
  || window.navigator.standalone === true
);

// ── Plein écran pendant les parties ──
// Le navigateur n'accepte le plein écran qu'après un geste du joueur : en entrant dans
// une partie on « arme » la demande, qui part au toucher suivant. Si le joueur quitte le
// plein écran lui-même, on ne le lui réimpose pas avant la partie suivante.
const NOT_IN_GAME = /^(Menu|Welcome)$|Setup$/;
let armed = false;
let currentGame = null;
let listening = false;

const canFullscreen = () => isWeb && !!document.documentElement.requestFullscreen && document.fullscreenEnabled !== false;

function onGesture() {
  if (!armed || document.fullscreenElement) return;
  armed = false;
  document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
}

export function updateFullscreenForRoute(routeName) {
  if (!canFullscreen() || !isTouch() || isInstalled()) return;
  if (!listening) {
    listening = true;
    document.addEventListener('touchend', onGesture, true);
    document.addEventListener('click', onGesture, true);
  }
  const inGame = !!routeName && !NOT_IN_GAME.test(routeName);
  if (inGame) {
    // Même jeu (QuizGame → écran suivant du quiz) : on garde le choix du joueur.
    const game = routeName.replace(/(Game|Lobby|Final|Distribute|Draft|Tournament|Wait|Multi).*$/, '');
    if (game !== currentGame) { currentGame = game; armed = true; }
  } else {
    currentGame = null;
    armed = false;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
}

// ── Installation comme une appli ──
let deferredPrompt = null;
const subscribers = new Set();
if (isWeb) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();               // on propose notre propre bouton « Installer »
    deferredPrompt = e;
    subscribers.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    subscribers.forEach((fn) => fn());
  });
}

// { show, install } — le bouton n'apparaît que là où le navigateur sait installer tout seul
// (Android, Chrome/Edge sur ordinateur). Sur iPhone, rien : l'ajout à l'écran d'accueil y est manuel.
export function useInstall() {
  const [, refresh] = useState(0);
  useEffect(() => {
    const fn = () => refresh((n) => n + 1);
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }, []);
  return {
    show: !!deferredPrompt,
    install: async () => {
      if (!deferredPrompt) return false;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      subscribers.forEach((fn) => fn());
      return outcome === 'accepted';
    },
  };
}
