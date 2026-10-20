import React, { useState } from 'react';
import { Text } from 'react-native';
import { QUELPLUS_CATEGORIES } from '../../data/quiEstLePlusPrompts';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor, T } from '../../components/game/Legende';

const ROUND_OPTIONS = [4, 6, 8, 10];
const MIN_PLAYERS   = 3;
const MAX_PLAYERS   = 10;
const ADULT = new Set(['hot', 'tres_hot']);

export default function TriPotesSetupScreen({ navigation }) {
  const [categoryId, setCategoryId]   = useState('all');
  const [roundCount, setRoundCount]   = useState(6);
  const [playerNames, setPlayerNames] = useState([]);

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const canStart     = validPlayers.length >= MIN_PLAYERS;
  const category     = QUELPLUS_CATEGORIES.find(c => c.id === categoryId);

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('TriPotesGame', { roundCount, playerNames: validPlayers, categoryId });
  };

  return (
    <SetupLayout
      game="tripotes"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      note={canStart ? `${roundCount} manches · le juge change à chaque manche` : `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`}
      rules={[
        'Le juge découvre seul une question secrète.',
        'Il classe les autres joueurs selon cette question.',
        'Le groupe voit le classement et doit deviner la vraie question parmi quatre.',
        'Bonne pioche : chaque joueur du groupe marque 1 point. Sinon, le juge marque 2 points.',
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
