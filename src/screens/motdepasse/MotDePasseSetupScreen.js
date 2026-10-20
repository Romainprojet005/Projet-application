import React, { useState, useEffect } from 'react';
import { getMotDePasseCards } from '../../data/motDePasseData';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, AmbianceSelector, PlayerEditor } from '../../components/game/Legende';

const TIMER_OPTIONS = [30, 60, 90];
const WORDS_OPTIONS = [20, 30, 40];
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const LEVELS = [
  { value: 'normal', label: 'Tout public', sub: 'Pour tous', heat: 1 },
  { value: 'adult', label: 'Adulte', heat: 3, adult: true },
];

export default function MotDePasseSetupScreen({ navigation, route }) {
  const [players,   setPlayers]   = useState([]);
  const [timerSecs, setTimerSecs] = useState(60);
  const [wordCount, setWordCount] = useState(30);
  const [category,  setCategory]  = useState('normal');

  const trimmed  = players.map(p => p.trim()).filter(Boolean);
  const unique   = new Set(trimmed.map(n => n.toLowerCase())).size === trimmed.length;
  const canStart = trimmed.length >= MIN_PLAYERS && unique;
  const turnsEst = Math.ceil(wordCount / Math.max(trimmed.length, 1));

  const handleStart = () => {
    if (!canStart) return;
    const cards = getMotDePasseCards(wordCount, category);
    navigation.navigate('MotDePasseGame', { players: trimmed, cards, timerSecs });
  };

  // « Rejouer » depuis la fin de partie : relance aussitôt avec les mêmes réglages
  const replayToken = route?.params?.replay;
  useEffect(() => {
    if (!replayToken) return;
    navigation.setParams({ replay: undefined });
    handleStart();
  }, [replayToken]);

  return (
    <SetupLayout
      game="motdepasse"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      startLabel="C’est parti"
      note={trimmed.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !unique ? 'Deux joueurs ont le même prénom : ajoutez une initiale.' : `${wordCount} mots · environ ${turnsEst} par joueur`}
      rules={[
        'À votre tour, faites deviner un maximum de mots avant la fin du temps.',
        'Interdit de prononcer les cinq mots affichés sous le mot à faire deviner.',
        'Touchez « Trouvé » quand le mot est deviné, ou passez au suivant.',
        'Celui qui fait deviner le plus de mots gagne.',
      ]}
    >
      <Section label="Ambiance">
        <AmbianceSelector levels={LEVELS} value={category} onChange={setCategory} />
      </Section>

      <Section label="Durée par tour">
        <ChoicePills options={TIMER_OPTIONS.map((t) => ({ value: t, label: `${t} s` }))} value={timerSecs} onChange={setTimerSecs} />
      </Section>

      <Section label="Mots au total">
        <ChoicePills options={WORDS_OPTIONS} value={wordCount} onChange={setWordCount} />
      </Section>

      <PlayerEditor names={players} onChange={setPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
