import React, { useState } from 'react';
import { generateRivalTeam, simulateMatch } from '../../data/lolSimulation';
import LolTournamentView from './LolTournamentView';

export default function LolSelectTournamentScreen({ route, navigation }) {
  const { team } = route.params || {};
  const [rivalTeam] = useState(() => generateRivalTeam(team));
  const [result]    = useState(() => simulateMatch(team, rivalTeam, 'Votre équipe', "L'équipe adverse"));

  return (
    <LolTournamentView
      labelA="Votre équipe"
      labelB="L'équipe adverse"
      teamA={team}
      teamB={rivalTeam}
      result={result}
      youSide="A"
      onHome={() => navigation.navigate('Menu')}
      onReplay={() => navigation.replace('LolSelectDraft')}
      replayLabel="🔄  Nouveau draft"
    />
  );
}
