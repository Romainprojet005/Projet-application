import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { BodoniModa_600SemiBold, BodoniModa_700Bold } from '@expo-google-fonts/bodoni-moda';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { CormorantGaramond_600SemiBold_Italic, CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import AppNavigator from './src/navigation/AppNavigator';

// Web : remplace la police système par défaut des textes par Outfit (refonte).
// On modifie la règle de base de react-native-web sur place : les textes qui ont
// leur propre police (titres en Bodoni Moda, chiffres en mono…) la gardent.
const BODY_FONT = 'Outfit, Outfit_400Regular, system-ui, -apple-system, "Segoe UI", sans-serif';
function applyBodyFont() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of Array.from(rules || [])) {
      const sel = rule.selectorText || '';
      if (sel.startsWith('.css-') && rule.style && /-apple-system|System/.test(rule.style.fontFamily || '')) {
        rule.style.fontFamily = BODY_FONT;
      }
    }
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BodoniModa_600SemiBold,
    BodoniModa_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_400Regular_Italic,
    JetBrainsMono_400Regular,
  });

  useEffect(() => { applyBodyFont(); }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
