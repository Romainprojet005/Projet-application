// Affiche un message d'erreur. Alert.alert ne fait rien sur le web (react-native-web),
// donc sur le site on passe par la boîte de dialogue du navigateur.
import { Alert, Platform } from 'react-native';

export default function alerte(title, message) {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n\n${message}` : title);
  else Alert.alert(title, message);
}
