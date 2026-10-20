import React, { useState } from 'react';
import { Text } from 'react-native';
import { MIN_TOURS, MAX_TOURS } from '../../data/verreData';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, PlayerEditor, T } from '../../components/game/Legende';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const MODES = [
  { value: 'classique',    label: 'Classique',     desc: 'Celui qui a bu le moins gagne.' },
  { value: 'battleRoyale', label: 'Battle royale', desc: 'Perdre un duel = éliminé. Le dernier debout gagne.' },
];

export default function VerreSetupScreen({ navigation }) {
  const [playerNames, setPlayerNames] = useState([]);
  const [mode,        setMode]        = useState('classique');

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const unique       = new Set(validPlayers).size === validPlayers.length;
  const canStart     = validPlayers.length >= MIN_PLAYERS && unique;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('VerreGame', { playerNames: validPlayers, mode });
  };

  return (
    <SetupLayout
      game="verre"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      note={validPlayers.length < MIN_PLAYERS ? `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`
        : !unique ? 'Deux joueurs ont le même prénom : ajoutez une initiale.' : 'Bluffez, pariez, et buvez le moins possible.'}
      rules={[
        'Chaque joueur reçoit une carte secrète, de 1 à 20, que lui seul voit.',
        'Le verre commence avec 1 gorgée. À votre tour : buvez le verre, passez, ou défiez un joueur.',
        'Chaque fois qu’un joueur passe, le verre se remplit d’une gorgée.',
        'En défi, pariez que votre carte est plus haute ou plus basse que la sienne.',
        'Si un joueur boit ou perd un défi, la manche se termine et de nouvelles cartes sont distribuées.',
        `Un nombre de tours (${MIN_TOURS} à ${MAX_TOURS}) est tiré au sort : si personne n’a bu à la fin, la plus petite carte boit le verre.`,
        mode === 'battleRoyale'
          ? 'Battle royale : le perdant d’un défi est éliminé et la manche continue sans lui. Le dernier en lice gagne.'
          : 'À la fin, celui qui a bu le moins gagne.',
      ]}
    >
      <Section label="Mode">
        <ChoicePills options={MODES} value={mode} onChange={setMode} />
        <Text style={{ color: T.encreDouce, fontSize: 13, lineHeight: 19 }}>{MODES.find(m => m.value === mode).desc}</Text>
      </Section>

      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
