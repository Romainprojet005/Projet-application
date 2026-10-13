// Hauteur de l'écran visible pour les pages web.
// Sur mobile, 100vh compte aussi la zone cachée sous la barre d'adresse du navigateur :
// le bas des pages (bouton « Lancer ») passait dessous. 100dvh suit la zone réellement visible.
const supportsDvh = typeof CSS !== 'undefined' && !!CSS.supports && CSS.supports('height', '100dvh');

export const FULL_HEIGHT = supportsDvh ? '100dvh' : '100vh';
