import React, { useState } from 'react';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, PlayerEditor } from '../../components/game/Legende';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export default function ConfessionsSetupScreen({ navigation }) {
  const [playerNames, setPlayerNames] = useState([]);

  const validPlayers = playerNames.map(n => n.trim()).filter(Boolean);
  const canStart     = validPlayers.length >= MIN_PLAYERS;

  const handleStart = () => {
    if (!canStart) return;
    navigation.navigate('ConfessionsGame', { playerNames: validPlayers });
  };

  return (
    <SetupLayout
      game="confessions"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={handleStart}
      canStart={canStart}
      startLabel="Révéler les secrets"
      note={canStart ? `${validPlayers.length} confessions à démasquer.` : `Ajoutez au moins ${MIN_PLAYERS} joueurs pour commencer.`}
      rules={[
        'Chaque joueur écrit une confession secrète, sans que les autres la voient.',
        'Chaque confession est lue à voix haute, puis tout le monde vote pour son auteur.',
        'L’auteur est révélé : a-t-il trompé le groupe ?',
        '+2 points si vous trouvez l’auteur. L’auteur gagne 1 point par joueur trompé.',
      ]}
    >
      <PlayerEditor names={playerNames} onChange={setPlayerNames} min={MIN_PLAYERS} max={MAX_PLAYERS} />
    </SetupLayout>
  );
}
