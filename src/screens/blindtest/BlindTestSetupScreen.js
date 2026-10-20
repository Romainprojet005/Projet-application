import React, { useState } from 'react';
import { Text } from 'react-native';
import { CATEGORIES, getSongsCount } from '../../data/blindTestSongs';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoiceChips, ChoicePills, PlayerEditor, SecondaryButton, T } from '../../components/game/Legende';

const ROUND_OPTIONS = [5, 10, 15, 20];
const TIME_OPTIONS  = [30, null]; // null = infini
const MAX_PLAYERS = 6;

export default function BlindTestSetupScreen({ navigation }) {
  const [categoryId, setCategoryId]   = useState('france');
  const [songCount, setSongCount]     = useState(10);
  const [timeLimit, setTimeLimit]     = useState(30);
  const [playerNames, setPlayerNames] = useState([]);

  const available = getSongsCount(categoryId);
  const third = timeLimit ? Math.round(timeLimit / 3) : 0;

  const handleStart = () => {
    const validNames = playerNames.map(n => n.trim()).filter(Boolean);
    navigation.navigate('BlindTestGame', { songCount, playerNames: validNames, timeLimit, categoryId });
  };

  return (
    <SetupLayout
      game="blindtest"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      startLabel="Que la musique commence"
      note={`${songCount} chansons sur ${available} disponibles · jusqu’à ${timeLimit === null ? songCount : songCount * 3} points`}
      secondary={<SecondaryButton label="Mode multi-téléphones" onPress={() => navigation.navigate('BlindMultiSetup')} />}
      rules={timeLimit === null ? [
        'Lancez l’extrait, puis tapez le titre de la chanson.',
        'Pas de limite de temps : 1 point par chanson trouvée.',
        'Touchez « Je ne sais pas » pour passer.',
      ] : [
        'Lancez l’extrait, puis tapez le titre de la chanson.',
        `De 0 à ${third} s : 3 points. De ${third} à ${third * 2} s : 2 points. Jusqu’à ${timeLimit} s : 1 point.`,
        'Plus vous êtes rapide, plus vous marquez.',
      ]}
    >
      <Section label="Catégorie">
        <ChoiceChips options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))} value={categoryId} onChange={setCategoryId} />
      </Section>

      <Section label="Temps par chanson">
        <ChoicePills options={TIME_OPTIONS.map((t) => ({ value: t, label: t === null ? 'Illimité' : `${t} s` }))} value={timeLimit} onChange={setTimeLimit} />
      </Section>

      <Section label="Chansons">
        <ChoicePills options={ROUND_OPTIONS} value={songCount} onChange={setSongCount} />
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={0} max={MAX_PLAYERS} />
      <Text style={{ color: T.encreDouce, fontSize: 13, marginTop: -12 }}>Facultatif : sans joueurs, la partie se joue sans scores.</Text>
    </SetupLayout>
  );
}
