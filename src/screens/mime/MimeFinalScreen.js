import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Ranking } from '../../components/game/Legende';

export default function MimeFinalScreen({ navigation, route }) {
  const { roomId } = route.params;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    supabase.from('mime_players').select().eq('room_id', roomId).order('score', { ascending: false })
      .then(({ data }) => { if (data) setPlayers(data); });
  }, []);

  const names = players.map((p) => p.name);
  const scores = Object.fromEntries(players.map((p) => [p.name, p.score || 0]));
  const winner = players[0];

  return (
    <GameScreen
      top={<GameTopBar game="mime" onBack={() => navigation.navigate('Menu')} confirmQuit={false} />}
      footer={(
        <ActionBar>
          <PrimaryButton label="Rejouer" onPress={async () => {
            await supabase.from('mime_rooms').delete().eq('id', roomId);
            navigation.replace('MimeSetup');
          }} />
          <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
        </ActionBar>
      )}
    >
      <Heading kicker="Fin de partie" title={winner ? `${winner.name} l’emporte` : 'Le classement'} sub={winner ? `${winner.score} points` : null} />
      <Ranking players={names} scores={scores} order={names} suffix=" pts" />
    </GameScreen>
  );
}
