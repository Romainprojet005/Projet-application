import React, { useState } from 'react';
import { ORACLE_CATEGORIES, selectQuestions } from '../../data/oracleQuestions';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor } from '../../components/game/Legende';

const ROUND_OPTIONS = [5, 8, 10, 15];
const MIN_PLAYERS   = 3;
const MAX_PLAYERS   = 10;

export default function OracleSetupScreen({ navigation }) {
  const [categoryId, setCategoryId]   = useState('all');
  const [roundCount, setRoundCount]   = useState(8);
  const [playerNames, setPlayerNames] = useState([]);

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const available    = selectQuestions(999, categoryId).length;
  const canStart     = validPlayers.length >= MIN_PLAYERS;
  const minutes      = Math.round(roundCount * Math.max(validPlayers.length, MIN_PLAYERS) * 0.5 + roundCount * 2);

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('OracleGame', { roundCount, playerNames: validPlayers, categoryId });
  };

  return (
    <SetupLayout
      game="oracle"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      startLabel="Que l’Oracle parle"
      note={canStart ? `${roundCount} questions sur ${available} · environ ${minutes} min` : `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`}
      rules={[
        'Une question mystérieuse s’affiche.',
        'Chaque joueur écrit sa réponse en secret.',
        'Toutes les réponses sont révélées, anonymes (A, B, C…).',
        'Chacun vote pour la meilleure réponse : la plus votée rapporte 1 point à son auteur.',
      ]}
    >
      <Section label="Catégorie">
        <ChoiceChips options={ORACLE_CATEGORIES.map((c) => ({ value: c.id, label: c.name, adult: c.id === 'adulte' }))} value={categoryId} onChange={setCategoryId} />
      </Section>

      <Section label="Questions">
        <ChoicePills options={ROUND_OPTIONS} value={roundCount} onChange={setRoundCount} />
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
