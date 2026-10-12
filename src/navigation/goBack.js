// Bouton « Retour » : revient à l'écran précédent, ou au menu des jeux
// quand il n'y en a pas (page rechargée, lien ouvert directement…).
export default function goBackOrMenu(navigation) {
  if (navigation?.canGoBack?.()) navigation.goBack();
  else navigation?.navigate?.('Menu');
}
