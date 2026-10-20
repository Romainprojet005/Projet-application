import React, { useState } from 'react';
import { getQuestions } from '../../data/amitieQuestions';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, AmbianceSelector, PlayerEditor } from '../../components/game/Legende';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;
const MODES = [
  { value: 'amitie', label: 'Amitié', sub: 'Entre amis', heat: 1 },
  { value: 'couple', label: 'Couple', sub: 'En amoureux', heat: 2 },
  { value: 'adulte', label: 'Adulte', heat: 3, adult: true },
];
const COUNTS = [
  { value: 5, label: '5 · rapide' },
  { value: 10, label: '10 · standard' },
  { value: 15, label: '15 · long' },
];

export default function AmitieSetupScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [mode, setMode] = useState('amitie');
  const [questionsCount, setQuestionsCount] = useState(10);

  const trimmed = players.map((p) => p.trim()).filter(Boolean);
  const unique = new Set(trimmed.map((n) => n.toLowerCase())).size === trimmed.length;
  const canLaunch = trimmed.length >= MIN_PLAYERS && unique;

  const handleLaunch = () => {
    if (!canLaunch) return;
    const questions = getQuestions(mode, questionsCount);
    navigation.navigate('AmitieGame', { players: trimmed, mode, questions });
  };

  return (
    <SetupLayout
      game="amitie"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleLaunch}
      canStart={canLaunch}
      startLabel="Lancer le test"
      note={trimmed.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !unique ? 'Deux joueurs ont le même prénom : ajoutez une initiale.' : `${questionsCount} questions pour mesurer votre lien.`}
      rules={[
        'À chaque question, un joueur devine la réponse d’un autre joueur, à voix haute.',
        'Le joueur visé révèle sa vraie réponse : bonne réponse, +1 point.',
        'À la fin, le pourcentage de bonnes réponses donne votre taux de compatibilité.',
      ]}
    >
      <Section label="Mode">
        <AmbianceSelector levels={MODES} value={mode} onChange={setMode} />
      </Section>

      <Section label="Questions">
        <ChoicePills options={COUNTS} value={questionsCount} onChange={setQuestionsCount} />
      </Section>

      <PlayerEditor names={players} onChange={setPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
