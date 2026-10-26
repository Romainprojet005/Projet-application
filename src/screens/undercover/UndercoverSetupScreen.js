import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as MOTS_FR from '../../data/wordLists';
import * as MOTS_EN from '../../data/wordListsEn';
import { t, IS_EN } from '../../i18n';
import sansEmoji from '../../utils/sansEmoji';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, StepperRow, ToggleRow, Panel, PlayerEditor, T, F } from '../../components/game/Legende';

const { wordThemes, generateRandomPair } = IS_EN ? MOTS_EN : MOTS_FR;

// Persiste en mémoire tant que l'app n'est pas fermée
const usedPairsPerTheme = {};

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

export default function UndercoverSetupScreen({ navigation, route }) {
  const [nbSansNoms, setNbSansNoms] = useState(5);
  const [noms, setNoms] = useState([]);
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [hasMrWhite, setHasMrWhite] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('classique');

  // Prénoms facultatifs : s'il y en a, ils fixent le nombre de joueurs ; sinon « Joueur 1, 2… »
  const nomsValides = noms.map((n) => n.trim()).filter(Boolean);
  const avecNoms = nomsValides.length > 0;
  const playerCount = avecNoms ? nomsValides.length : nbSansNoms;
  const uniques = new Set(nomsValides.map((n) => n.toLowerCase())).size === nomsValides.length;
  const canStart = playerCount >= MIN_PLAYERS && uniques;

  const maxUndercover = Math.max(1, Math.floor(playerCount / 3));
  useEffect(() => {
    if (undercoverCount > maxUndercover) setUndercoverCount(maxUndercover);
  }, [maxUndercover]);

  const civilianCount = playerCount - undercoverCount - (hasMrWhite ? 1 : 0);

  const handleStart = () => {
    if (!canStart) return;
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
      playerNames: avecNoms ? nomsValides : null,
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
      startLabel={t('Lancer la mission', 'Start the mission')}
      canStart={canStart}
      note={avecNoms && playerCount < MIN_PLAYERS ? t(`Ajoutez au moins ${MIN_PLAYERS} joueurs, ou effacez les prénoms.`, `Add at least ${MIN_PLAYERS} players, or clear the names.`)
        : !uniques ? t('Deux joueurs ont le même prénom : ajoutez une initiale.', 'Two players have the same name: add an initial.')
        : IS_EN ? `${civilianCount} civilian${civilianCount > 1 ? 's' : ''} · ${undercoverCount} ${undercoverCount > 1 ? 'spies' : 'spy'}${hasMrWhite ? ' · 1 Mr. White' : ''}`
        : `${civilianCount} villageois · ${undercoverCount} espion${undercoverCount > 1 ? 's' : ''}${hasMrWhite ? ' · 1 Monsieur Blanc' : ''}`}
      rules={IS_EN ? [
        'Each player looks at their word in secret. The civilians all share the same word; the spies get a similar one.',
        'Mr. White, if playing, has no word: they listen and bluff.',
        'One by one, everyone gives a clue about their word, without saying it.',
        'After each round, vote to eliminate a suspect.',
        'Civilians win once every spy is found; spies win when they match the civilians in number.',
      ] : [
        'Chaque joueur découvre son mot en secret. Les villageois ont tous le même ; les espions en ont un proche.',
        'Monsieur Blanc, s’il est en jeu, n’a aucun mot : il écoute et bluffe.',
        'Chacun à son tour donne un indice sur son mot, sans le dire.',
        'Après chaque tour, votez pour éliminer un suspect.',
        'Les villageois gagnent quand tous les espions sont démasqués ; les espions, quand ils sont aussi nombreux que les villageois.',
      ]}
    >
      <Section label={t('Équipe', 'Team')}>
        {avecNoms ? null : (
          <StepperRow label={t('Joueurs', 'Players')} hint={t('Sans prénoms : Joueur 1, Joueur 2…', 'Without names: Player 1, Player 2…')} value={nbSansNoms} min={MIN_PLAYERS} max={MAX_PLAYERS} onChange={setNbSansNoms} />
        )}
        <StepperRow label={t('Espions', 'Spies')} hint={t('Recommandé : 1 espion pour 3 joueurs', 'Recommended: 1 spy for every 3 players')} value={undercoverCount} min={1} max={maxUndercover} onChange={setUndercoverCount} />
        <ToggleRow label={t('Monsieur Blanc', 'Mr. White')} hint={t('Un joueur sans mot qui doit bluffer', 'A player with no word who has to bluff')} value={hasMrWhite} onChange={setHasMrWhite} />
      </Section>

      <PlayerEditor names={noms} onChange={setNoms} min={MIN_PLAYERS} max={MAX_PLAYERS} />
      <Text style={[s.desc, { marginTop: -12 }]}>{t('Facultatif : sans prénoms, les joueurs sont numérotés.', 'Optional: without names, players are numbered.')}</Text>

      <Section label={t('Thème des mots', 'Word theme')}>
        <ChoiceChips
          options={Object.entries(wordThemes).map(([key, th]) => ({ value: key, label: th.label, adult: ['hot', 'coquin', 'tres_hot'].includes(key) }))}
          value={selectedTheme}
          onChange={setSelectedTheme}
        />
        {theme?.description ? <Text style={s.desc}>{sansEmoji(theme.description)}</Text> : null}
      </Section>

      <Panel>
        <Text style={s.panelTitle}>{t('RÉPARTITION', 'BREAKDOWN')}</Text>
        <View style={s.split}>
          <Count n={civilianCount} label={t('Villageois', 'Civilians')} color="#7CC4FF" />
          <Count n={undercoverCount} label={IS_EN ? (undercoverCount > 1 ? 'Spies' : 'Spy') : `Espion${undercoverCount > 1 ? 's' : ''}`} color={T.alerte} />
          {hasMrWhite ? <Count n={1} label={t('M. Blanc', 'Mr. White')} color={T.orTexte} /> : null}
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
