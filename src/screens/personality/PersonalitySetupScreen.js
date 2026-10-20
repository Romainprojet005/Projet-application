import React, { useEffect, useState } from 'react';
import { getPersonalities, buildChoices } from '../../data/personalityData';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, PlayerEditor } from '../../components/game/Legende';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'international', label: 'International' },
  { value: 'francais', label: 'Français' },
];

function shuffleTiles(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PersonalitySetupScreen({ navigation, route }) {
  const [players, setPlayers] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(10);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const trimmed = players.map(p => p.trim()).filter(Boolean);
  const unique = new Set(trimmed.map(n => n.toLowerCase())).size === trimmed.length;
  const canLaunch = trimmed.length >= MIN_PLAYERS && unique;

  const handleLaunch = () => {
    if (!canLaunch) return;
    const personalities = getPersonalities(questionsCount, filter);
    if (personalities.length < 4) {
      setError('Pas assez de personnalités dans ce filtre : choisissez « Tous ».');
      return;
    }
    // Choix et ordre de révélation des tuiles préparés pour chaque personnalité
    const rounds = personalities.map(p => ({
      personality: p,
      choices: buildChoices(p, personalities),
      tileOrder: shuffleTiles(96),
    }));
    navigation.navigate('PersonalityGame', { players: trimmed, rounds });
  };

  // « Rejouer » depuis la fin de partie : relance aussitôt avec les mêmes réglages
  const replayToken = route?.params?.replay;
  useEffect(() => {
    if (!replayToken) return;
    navigation.setParams({ replay: undefined });
    handleLaunch();
  }, [replayToken]);

  return (
    <SetupLayout
      game="personality"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleLaunch}
      canStart={canLaunch}
      note={error || (trimmed.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !unique ? 'Deux joueurs ont le même prénom : ajoutez une initiale.' : `${questionsCount} célébrités à reconnaître.`)}
      rules={[
        'Une célébrité floue apparaît : devinez qui c’est.',
        'Une question sur deux, le visage se dévoile en mosaïque, quelques cases à la fois.',
        'Plus vous trouvez tôt, plus vous marquez : 4 points, puis 3, 2 et 1.',
      ]}
    >
      <Section label="Personnalités">
        <ChoicePills options={FILTERS} value={filter} onChange={(v) => { setFilter(v); setError(''); }} />
      </Section>

      <Section label="Questions">
        <ChoicePills options={[5, 10, 15, 20]} value={questionsCount} onChange={setQuestionsCount} />
      </Section>

      <PlayerEditor names={players} onChange={setPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
