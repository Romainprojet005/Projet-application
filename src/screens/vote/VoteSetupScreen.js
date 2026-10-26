import React, { useState } from 'react';
import { Text } from 'react-native';
import * as V_FR from '../../data/voteData';
import * as V_EN from '../../data/voteDataEn';
import { t, IS_EN } from '../../i18n';
import sansEmoji from '../../utils/sansEmoji';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor, SecondaryButton, T } from '../../components/game/Legende';

const { VOTE_CATEGORIES, selectQuestions } = IS_EN ? V_EN : V_FR;

const ROUND_OPTIONS = [5, 10, 15, 20];
const MIN_PLAYERS   = 2;
const MAX_PLAYERS   = 20;

export default function VoteSetupScreen({ navigation }) {
  const [categoryId, setCategoryId]       = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [playerNames, setPlayerNames]     = useState([]);

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const activeCat    = VOTE_CATEGORIES.find(c => c.id === categoryId) ?? VOTE_CATEGORIES[0];
  const available    = selectQuestions(999, categoryId, validPlayers).length;
  const canStart     = validPlayers.length >= MIN_PLAYERS;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('VoteGame', { questionCount, playerNames: validPlayers, categoryId });
  };

  return (
    <SetupLayout
      game="vote"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      startLabel={t('Que le vote commence', 'Let the vote begin')}
      note={canStart ? t(`${questionCount} questions sur ${available} disponibles · jusqu’à ${questionCount * 2} points`, `${questionCount} questions out of ${available} available · up to ${questionCount * 2} points`) : t(`Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`, `Add at least ${MIN_PLAYERS} players to start.`)}
      secondary={IS_EN ? null : <SecondaryButton label="Mode multi-téléphones" onPress={() => navigation.navigate('VoteMultiSetup')} />}
      rules={IS_EN ? [
        'Pass the phone: each player votes in secret.',
        'Voting with the majority scores 1 point.',
        'Unanimous vote: 2 points for everyone.',
        'Perfect tie: nobody scores.',
      ] : [
        'Passez le téléphone : chaque joueur vote en secret.',
        'Voter comme la majorité rapporte 1 point.',
        'Vote unanime : 2 points pour tout le monde.',
        'Égalité parfaite : personne ne marque.',
      ]}
    >
      <Section label={t('Catégorie', 'Category')}>
        <ChoiceChips options={VOTE_CATEGORIES.map((c) => ({ value: c.id, label: c.name, adult: ['cibleHot', 'adulte', 'majorite'].includes(c.id) }))} value={categoryId} onChange={setCategoryId} />
        {activeCat.rule ? <Text style={{ color: T.encreDouce, fontSize: 13, lineHeight: 19 }}>{sansEmoji(activeCat.rule)}</Text> : null}
      </Section>

      <Section label="Questions">
        <ChoicePills options={ROUND_OPTIONS} value={questionCount} onChange={setQuestionCount} />
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
