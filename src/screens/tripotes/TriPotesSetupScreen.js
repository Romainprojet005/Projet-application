import React, { useState } from 'react';
import { Text } from 'react-native';
import * as Q_FR from '../../data/quiEstLePlusPrompts';
import * as Q_EN from '../../data/quiEstLePlusPromptsEn';
import { t, IS_EN } from '../../i18n';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor, T } from '../../components/game/Legende';

const { QUELPLUS_CATEGORIES } = IS_EN ? Q_EN : Q_FR;

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
      note={canStart ? t(`${roundCount} manches · le juge change à chaque manche`, `${roundCount} rounds · a new judge every round`) : t(`Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`, `Add at least ${MIN_PLAYERS} players to start.`)}
      rules={IS_EN ? [
        'The judge reads a secret question alone.',
        'They rank the other players using that question.',
        'The group sees the ranking and must guess the real question out of four.',
        'Right guess: each player in the group scores 1 point. Otherwise, the judge scores 2 points.',
      ] : [
        'Le juge découvre seul une question secrète.',
        'Il classe les autres joueurs selon cette question.',
        'Le groupe voit le classement et doit deviner la vraie question parmi quatre.',
        'Bonne pioche : chaque joueur du groupe marque 1 point. Sinon, le juge marque 2 points.',
      ]}
    >
      <Section label={t('Catégorie', 'Category')}>
        <ChoiceChips
          options={QUELPLUS_CATEGORIES.map((c) => ({ value: c.id, label: c.name, adult: ADULT.has(c.id) }))}
          value={categoryId}
          onChange={setCategoryId}
        />
        {category?.joker ? <Text style={{ color: T.encreDouce, fontSize: 13, lineHeight: 19 }}>{t('Joker', 'Joker')} : {category.joker}</Text> : null}
      </Section>

      <Section label={t('Manches', 'Rounds')}>
        <ChoicePills options={ROUND_OPTIONS} value={roundCount} onChange={setRoundCount} />
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
