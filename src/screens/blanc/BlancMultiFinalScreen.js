import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Ranking } from '../../components/game/Legende';

export default function BlancMultiFinalScreen({ navigation, route }) {
  const { roomId } = route.params;
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    supabase
      .from('blanc_players')
      .select()
      .eq('room_id', roomId)
      .order('score', { ascending: false })
      .then(({ data }) => { if (data) setPlayers(data); });
  }, []);

  const names = players.map((p) => p.name);
  const scores = Object.fromEntries(players.map((p) => [p.name, p.score || 0]));
  const winner = players[0];

  return (
    <GameScreen
      top={<GameTopBar game="blanc_manger" onBack={() => navigation.navigate('Menu')} confirmQuit={false} />}
      footer={(
        <ActionBar>
          <PrimaryButton label="Nouvelle partie" onPress={() => navigation.navigate('BlancMultiSetup')} />
          <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
        </ActionBar>
      )}
    >
      <Heading kicker="Résultats finaux" title={winner ? `${winner.name} l’emporte` : 'Le classement'}
        sub={winner ? `${winner.score || 0} point${(winner.score || 0) > 1 ? 's' : ''}` : null} />
      <Ranking players={names} scores={scores} order={names} suffix=" pts" />
    </GameScreen>
  );
}
