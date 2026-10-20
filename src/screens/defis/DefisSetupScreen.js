import React, { useState } from 'react';
import { Text } from 'react-native';
import { DEFI_CATEGORIES } from '../../data/defisData';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor, T } from '../../components/game/Legende';

const MIN_PLAYERS   = 2;
const MAX_PLAYERS   = 10;
const ROUND_OPTIONS = [5, 10, 15, 20];

export default function DefisSetupScreen({ navigation }) {
  const [roundCount,       setRoundCount]       = useState(10);
  const [playerNames,      setPlayerNames]      = useState([]);
  const [activeCategories, setActiveCategories] = useState(DEFI_CATEGORIES.filter(c => !c.explicit).map(c => c.id));

  const toggleCategory = (id) =>
    setActiveCategories(prev => (prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]));

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const canStart     = validPlayers.length >= MIN_PLAYERS && activeCategories.length > 0;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('DefisGame', { roundCount, playerNames: validPlayers, activeCategories });
  };

  return (
    <SetupLayout
      game="defis"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      startLabel="Lancer les défis"
      note={activeCategories.length === 0 ? 'Choisissez au moins une catégorie.'
        : validPlayers.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.` : `${roundCount} défis à relever.`}
      rules={[
        'La roue désigne un joueur au hasard.',
        'Le jeu lui donne un défi à relever.',
        'Il réussit : les autres applaudissent. Il refuse : une conséquence l’attend.',
        'À la fin, on voit qui a tout osé.',
      ]}
    >
      <Section label="Défis">
        <ChoicePills options={ROUND_OPTIONS} value={roundCount} onChange={setRoundCount} />
      </Section>

      <Section label="Catégories" aside="Au moins une">
        <ChoiceChips
          multiple
          options={DEFI_CATEGORIES.map((c) => ({ value: c.id, label: c.name, adult: !!c.explicit }))}
          value={activeCategories}
          onChange={toggleCategory}
        />
        {activeCategories.includes('ose') ? (
          <Text style={{ color: T.encreDouce, fontSize: 13, lineHeight: 19 }}>
            Défis osés : réservés aux adultes. Tout défi qui implique un autre joueur se fait avec son accord ; chacun peut refuser et prendre la conséquence. Joker : {DEFI_CATEGORIES.find(c => c.id === 'ose').joker}
          </Text>
        ) : null}
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
