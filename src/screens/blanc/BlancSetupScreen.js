import React, { useEffect, useState } from 'react';
import { QUESTIONS } from '../../data/blancMangerData';
import goBackOrMenu from '../../navigation/goBack';
import { tirer } from '../../utils/dejaVu';
import { SetupLayout, Section, ChoicePills, AmbianceSelector, PlayerEditor, SecondaryButton } from '../../components/game/Legende';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;
const LEVELS = [
  { value: 'classique', label: 'Classique', sub: 'Tout public', heat: 1 },
  { value: 'adulte', label: 'Adulte', heat: 3, adult: true },
];
const ROUNDS = [
  { value: 5, label: '5 · rapide' },
  { value: 10, label: '10 · standard' },
  { value: 15, label: '15 · long' },
];

export default function BlancSetupScreen({ navigation, route }) {
  const [players, setPlayers]   = useState([]);
  const [category, setCategory] = useState('classique');
  const [rounds, setRounds]     = useState(10);

  const trimmed   = players.map(p => p.trim()).filter(Boolean);
  const unique    = new Set(trimmed.map(n => n.toLowerCase())).size === trimmed.length;
  const canLaunch = trimmed.length >= MIN_PLAYERS && unique;

  const handleLaunch = () => {
    if (!canLaunch) return;
    const questions = tirer('blanc-' + category, QUESTIONS[category], rounds);
    navigation.navigate('BlancGame', { players: trimmed, category, totalRounds: questions.length, questions });
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
      game="blanc_manger"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleLaunch}
      canStart={canLaunch}
      note={trimmed.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !unique ? 'Deux joueurs ont le même prénom : ajoutez une initiale.' : `${rounds} tours · le jury change à chaque tour`}
      secondary={<SecondaryButton label="Mode multi-téléphones" onPress={() => navigation.navigate('BlancMultiSetup')} />}
      rules={[
        'Une phrase à trou s’affiche ; un joueur est le jury du tour.',
        'Les autres choisissent en secret, parmi leurs cartes, la réponse la plus drôle.',
        'Le jury lit les réponses à voix haute et désigne sa préférée : son auteur marque 1 point.',
        'Le jury change à chaque tour.',
      ]}
    >
      <Section label="Ambiance">
        <AmbianceSelector levels={LEVELS} value={category} onChange={setCategory} />
      </Section>

      <Section label="Tours">
        <ChoicePills options={ROUNDS} value={rounds} onChange={setRounds} />
      </Section>

      <PlayerEditor names={players} onChange={setPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
