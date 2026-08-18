import React, { useState } from 'react';
import { generateRivalTeam, simulateBo3 } from '../../data/lolSimulation';
import { getGame, DEFAULT_GAME_ID } from '../../data/selectGames';
import LolTournamentView from './LolTournamentView';

export default function LolSelectTournamentScreen({ route, navigation }) {
  const { team, gameId = DEFAULT_GAME_ID } = route.params || {};
  const game = getGame(gameId);
  const [rivalTeam] = useState(() => generateRivalTeam(game, team));
  const [result]    = useState(() => simulateBo3(game, team, rivalTeam, 'Votre équipe', "L'équipe adverse"));

  return (
    <LolTournamentView
      game={game}
      labelA="Votre équipe"
      labelB="L'équipe adverse"
      teamA={team}
      teamB={rivalTeam}
      result={result}
      youSide="A"
      onHome={() => navigation.navigate('Menu')}
      onReplay={() => navigation.replace('LolSelectDraft', { gameId })}
      replayLabel="🔄  Nouveau draft"
    />
  );
}
