import React, { useState } from 'react';
import { Text } from 'react-native';
import * as D_FR from '../../data/defisData';
import * as D_EN from '../../data/defisDataEn';
import { t, IS_EN } from '../../i18n';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor, T } from '../../components/game/Legende';

const { DEFI_CATEGORIES } = IS_EN ? D_EN : D_FR;

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
      startLabel={t('Lancer les défis', 'Start the dares')}
      note={activeCategories.length === 0 ? t('Choisissez au moins une catégorie.', 'Pick at least one category.')
        : validPlayers.length < MIN_PLAYERS ? t(`Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`, `Add at least ${MIN_PLAYERS} players to start.`) : t(`${roundCount} défis à relever.`, `${roundCount} dares to take on.`)}
      rules={IS_EN ? [
        'The wheel picks a random player.',
        'The game gives them a dare.',
        'Dare done: everyone cheers. Refused: a consequence awaits.',
        'At the end, see who dared the most.',
      ] : [
        'La roue désigne un joueur au hasard.',
        'Le jeu lui donne un défi à relever.',
        'Il réussit : les autres applaudissent. Il refuse : une conséquence l’attend.',
        'À la fin, on voit qui a tout osé.',
      ]}
    >
      <Section label={t('Défis', 'Dares')}>
        <ChoicePills options={ROUND_OPTIONS} value={roundCount} onChange={setRoundCount} />
      </Section>

      <Section label={t('Catégories', 'Categories')} aside={t('Au moins une', 'At least one')}>
        <ChoiceChips
          multiple
          options={DEFI_CATEGORIES.map((c) => ({ value: c.id, label: c.name, adult: !!c.explicit }))}
          value={activeCategories}
          onChange={toggleCategory}
        />
        {activeCategories.includes('ose') ? (
          <Text style={{ color: T.encreDouce, fontSize: 13, lineHeight: 19 }}>
            {t('Défis osés : réservés aux adultes. Tout défi qui implique un autre joueur se fait avec son accord ; chacun peut refuser et prendre la conséquence. Joker : ', 'Daring dares: adults only. Any dare involving another player needs their consent; anyone can refuse and take the consequence. Joker: ')}{DEFI_CATEGORIES.find(c => c.id === 'ose').joker}
          </Text>
        ) : null}
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
