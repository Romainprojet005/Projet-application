import React, { useState } from 'react';
import { Text } from 'react-native';
import { VERITES_HOT_JOKER } from '../../data/veritesVoleesData';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, AmbianceSelector, PlayerEditor, T } from '../../components/game/Legende';

const MIN_PLAYERS   = 4;
const MAX_PLAYERS   = 10;
const ROUND_OPTIONS = [3, 5, 7];
const LEVELS = [
  { value: 'classique', label: 'Classique', sub: 'Tout public', heat: 1 },
  { value: 'hot',       label: 'Hot',       heat: 2, adult: true },
  { value: 'tres_hot',  label: 'Très hot',  heat: 3, adult: true },
];

export default function VeritesSetupScreen({ navigation }) {
  const [playerNames, setPlayerNames] = useState([]);
  const [rounds, setRounds]           = useState(3);
  const [mode, setMode]               = useState('classique');

  const validPlayers = playerNames.map((n) => n.trim()).filter(Boolean);
  const uniqueNames  = new Set(validPlayers.map((n) => n.toLowerCase())).size === validPlayers.length;
  const canStart     = validPlayers.length >= MIN_PLAYERS && uniqueNames;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('VeritesGame', { playerNames: validPlayers, rounds, mode });
  };

  return (
    <SetupLayout
      game="verites"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      note={validPlayers.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !uniqueNames ? 'Deux joueurs ont le même prénom : ajoutez une initiale.' : 'Tout le monde dit la vérité… mais pas toujours la sienne.'}
      rules={[
        'Chacun complète en secret le même début de phrase, en disant la vérité.',
        'Le jeu échange en secret les vérités de deux joueurs.',
        'Chacun lit « sa » vérité à voix haute : les deux tricheurs doivent l’assumer et bluffer.',
        'Au vote final, chacun désigne deux suspects.',
        '+1 point par tricheur démasqué. Un tricheur gagne +1 point par joueur berné.',
      ]}
    >
      <Section label="Ambiance">
        <AmbianceSelector levels={LEVELS} value={mode} onChange={setMode} />
        {mode !== 'classique' ? (
          <Text style={{ color: T.encreDouce, fontSize: 13, lineHeight: 19 }}>
            Questions {mode === 'tres_hot' ? 'très ' : ''}indiscrètes, réservées aux adultes. On répond honnêtement… ou on utilise son joker. Joker : {VERITES_HOT_JOKER}
          </Text>
        ) : null}
      </Section>

      <Section label="Manches">
        <ChoicePills options={ROUND_OPTIONS} value={rounds} onChange={setRounds} />
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
