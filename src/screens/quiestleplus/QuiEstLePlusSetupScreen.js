import React, { useState } from 'react';
import { Text } from 'react-native';
import { QUELPLUS_CATEGORIES } from '../../data/quiEstLePlusPrompts';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor, T } from '../../components/game/Legende';

const ROUND_OPTIONS = [5, 8, 10, 15];
const MIN_PLAYERS   = 3;
const MAX_PLAYERS   = 10;
const ADULT = new Set(['hot', 'tres_hot']);

export default function QuiEstLePlusSetupScreen({ navigation }) {
  const [categoryId, setCategoryId]   = useState('all');
  const [roundCount, setRoundCount]   = useState(10);
  const [playerNames, setPlayerNames] = useState([]);

  const validPlayers = playerNames.map((n) => n.trim()).filter(Boolean);
  const canStart     = validPlayers.length >= MIN_PLAYERS;
  const category     = QUELPLUS_CATEGORIES.find((c) => c.id === categoryId);

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('QuiEstLePlusGame', { roundCount, playerNames: validPlayers, categoryId });
  };

  return (
    <SetupLayout
      game="quiestleplus"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      note={canStart ? 'Le plus désigné prend autant de gages que de votes. En 18+ : autant de gorgées.' : `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`}
      rules={[
        'Une question s’affiche : « Qui est le plus susceptible de… ? »',
        'Chacun vote en secret pour un joueur, puis passe le téléphone.',
        'Le plus désigné prend autant de gages que de votes reçus (en mode 18+ : autant de gorgées).',
        'En cas d’égalité, tous les ex æquo sont concernés.',
      ]}
    >
      <Section label="Catégorie">
        <ChoiceChips
          options={QUELPLUS_CATEGORIES.map((c) => ({ value: c.id, label: c.name, adult: ADULT.has(c.id) }))}
          value={categoryId}
          onChange={setCategoryId}
        />
        {category?.joker ? <Text style={{ color: T.encreDouce, fontSize: 13, lineHeight: 19 }}>Joker : {category.joker}</Text> : null}
      </Section>

      <Section label="Manches">
        <ChoicePills options={ROUND_OPTIONS} value={roundCount} onChange={setRoundCount} />
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
