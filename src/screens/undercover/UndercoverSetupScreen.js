import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { wordThemes, generateRandomPair } from '../../data/wordLists';
import sansEmoji from '../../utils/sansEmoji';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, StepperRow, ToggleRow, Panel, T, F } from '../../components/game/Legende';

// Persiste en mémoire tant que l'app n'est pas fermée
const usedPairsPerTheme = {};

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

export default function UndercoverSetupScreen({ navigation, route }) {
  const [playerCount, setPlayerCount] = useState(5);
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [hasMrWhite, setHasMrWhite] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('classique');

  const maxUndercover = Math.max(1, Math.floor(playerCount / 3));

  const changePlayers = (next) => {
    setPlayerCount(next);
    const nextMaxUC = Math.max(1, Math.floor(next / 3));
    if (undercoverCount > nextMaxUC) setUndercoverCount(nextMaxUC);
  };

  const civilianCount = playerCount - undercoverCount - (hasMrWhite ? 1 : 0);

  const handleStart = () => {
    let randomPair;

    if (selectedTheme === 'aleatoire') {
      if (!usedPairsPerTheme['aleatoire']) usedPairsPerTheme['aleatoire'] = new Set();
      randomPair = generateRandomPair(usedPairsPerTheme['aleatoire']);
    } else {
      const theme = wordThemes[selectedTheme];
      if (!usedPairsPerTheme[selectedTheme]) usedPairsPerTheme[selectedTheme] = new Set();
      let available = theme.pairs.map((_, i) => i).filter(i => !usedPairsPerTheme[selectedTheme].has(i));
      if (available.length === 0) {
        usedPairsPerTheme[selectedTheme] = new Set();
        available = theme.pairs.map((_, i) => i);
      }
      const idx = available[Math.floor(Math.random() * available.length)];
      usedPairsPerTheme[selectedTheme].add(idx);
      const pair = theme.pairs[idx];
      // Tire au sort quel mot de la paire revient aux imposteurs
      randomPair = Math.random() < 0.5
        ? { civilian: pair.civilian, undercover: pair.undercover }
        : { civilian: pair.undercover, undercover: pair.civilian };
    }

    navigation.navigate('UndercoverDistribute', {
      playerCount,
      wordPair: randomPair,
      undercoverCount,
      hasMrWhite,
      themeName: wordThemes[selectedTheme].label,
    });
  };

  // « Rejouer » depuis la fin de partie : relance aussitôt avec les mêmes réglages
  const replayToken = route?.params?.replay;
  useEffect(() => {
    if (!replayToken) return;
    navigation.setParams({ replay: undefined });
    handleStart();
  }, [replayToken]);

  const theme = wordThemes[selectedTheme];

  return (
    <SetupLayout
      game="undercover"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      startLabel="Lancer la mission"
      note={`${civilianCount} villageois · ${undercoverCount} espion${undercoverCount > 1 ? 's' : ''}${hasMrWhite ? ' · 1 Monsieur Blanc' : ''}`}
      rules={[
        'Chaque joueur découvre son mot en secret. Les villageois ont tous le même ; les espions en ont un proche.',
        'Monsieur Blanc, s’il est en jeu, n’a aucun mot : il écoute et bluffe.',
        'Chacun à son tour donne un indice sur son mot, sans le dire.',
        'Après chaque tour, votez pour éliminer un suspect.',
        'Les villageois gagnent quand tous les espions sont démasqués ; les espions, quand ils sont aussi nombreux que les villageois.',
      ]}
    >
      <Section label="Équipe">
        <StepperRow label="Joueurs" hint={`De ${MIN_PLAYERS} à ${MAX_PLAYERS}`} value={playerCount} min={MIN_PLAYERS} max={MAX_PLAYERS} onChange={changePlayers} />
        <StepperRow label="Espions" hint="Recommandé : 1 espion pour 3 joueurs" value={undercoverCount} min={1} max={maxUndercover} onChange={setUndercoverCount} />
        <ToggleRow label="Monsieur Blanc" hint="Un joueur sans mot qui doit bluffer" value={hasMrWhite} onChange={setHasMrWhite} />
      </Section>

      <Section label="Thème des mots">
        <ChoiceChips
          options={Object.entries(wordThemes).map(([key, t]) => ({ value: key, label: t.label, adult: ['hot', 'coquin', 'tres_hot'].includes(key) }))}
          value={selectedTheme}
          onChange={setSelectedTheme}
        />
        {theme?.description ? <Text style={s.desc}>{sansEmoji(theme.description)}</Text> : null}
      </Section>

      <Panel>
        <Text style={s.panelTitle}>RÉPARTITION</Text>
        <View style={s.split}>
          <Count n={civilianCount} label="Villageois" color="#7CC4FF" />
          <Count n={undercoverCount} label={`Espion${undercoverCount > 1 ? 's' : ''}`} color={T.alerte} />
          {hasMrWhite ? <Count n={1} label="M. Blanc" color={T.orTexte} /> : null}
        </View>
      </Panel>
    </SetupLayout>
  );
}

function Count({ n, label, color }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={[s.countN, { color }]}>{n}</Text>
      <Text style={s.countL}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  desc: { color: T.encreDouce, fontSize: 13, lineHeight: 19 },
  panelTitle: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  split: { flexDirection: 'row' },
  countN: { fontFamily: F.affiche, fontSize: 32, lineHeight: 36 },
  countL: { color: T.encreDouce, fontSize: 13 },
});
