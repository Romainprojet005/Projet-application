import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { selectPrompts } from '../../data/quiEstLePlusPrompts';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, QuestionCard, PlayerToken, AdultTag, T, F, gameInfo,
} from '../../components/game/Legende';

const GAME = 'quiestleplus';
const ADULT = new Set(['hot', 'tres_hot']);

// Phases : prompt → voting → reveal → (next | final)
export default function QuiEstLePlusGameScreen({ route, navigation }) {
  const { roundCount = 10, playerNames = [], categoryId = 'all' } = route.params || {};
  const adult = ADULT.has(categoryId);
  const unit = (n) => (adult ? `gorgée${n > 1 ? 's' : ''}` : `gage${n > 1 ? 's' : ''}`);

  const [prompts]          = useState(() => selectPrompts(roundCount, categoryId));
  const [roundIdx, setRoundIdx]         = useState(0);
  const [phase, setPhase]               = useState('prompt');
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [votes, setVotes]               = useState([]);
  const [scores, setScores]             = useState(() => Object.fromEntries(playerNames.map((n) => [n, 0])));

  const currentPrompt = prompts[roundIdx];
  const currentVoter  = playerNames[currentVoterIdx];
  const isLastVoter   = currentVoterIdx === playerNames.length - 1;
  const quit = () => goBackOrMenu(navigation);
  const top = <GameTopBar game={GAME} onBack={quit} current={Math.min(roundIdx + 1, prompts.length)} total={prompts.length} />;

  const handleVote = (votedFor) => {
    const newVotes = [...votes, { voter: currentVoter, votedFor }];
    if (isLastVoter) {
      const tally = {};
      playerNames.forEach((n) => { tally[n] = 0; });
      newVotes.forEach((v) => { tally[v.votedFor] = (tally[v.votedFor] || 0) + 1; });
      const maxVotes = Math.max(...Object.values(tally));
      const losers   = Object.entries(tally).filter(([, c]) => c === maxVotes).map(([n]) => n);
      const newScores = { ...scores };
      losers.forEach((n) => { newScores[n] = (newScores[n] || 0) + maxVotes; });
      setScores(newScores);
      setVotes(newVotes);
      setPhase('reveal');
    } else {
      setVotes(newVotes);
      setCurrentVoterIdx((i) => i + 1);
    }
  };

  const handleNext = () => {
    if (roundIdx + 1 >= prompts.length) setPhase('final');
    else { setRoundIdx((i) => i + 1); setCurrentVoterIdx(0); setVotes([]); setPhase('prompt'); }
  };

  const tally = {};
  if (phase === 'reveal') {
    playerNames.forEach((n) => { tally[n] = 0; });
    votes.forEach((v) => { tally[v.votedFor] = (tally[v.votedFor] || 0) + 1; });
  }
  const maxVotes = phase === 'reveal' ? Math.max(...Object.values(tally)) : 0;
  const losers   = phase === 'reveal' ? Object.entries(tally).filter(([, c]) => c === maxVotes).map(([n]) => n) : [];

  // ── Fin de partie : classement ──
  if (phase === 'final') {
    const sorted = [...playerNames].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    const best = scores[sorted[0]] || 1;
    return (
      <GameScreen
        top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={prompts.length} total={prompts.length} />}
        footer={(
          <ActionBar>
            <PrimaryButton label="Rejouer" onPress={() => navigation.replace(route.name, route.params)} />
            <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
          </ActionBar>
        )}
      >
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={s.kicker}>FIN DE PARTIE</Text>
          <Text style={s.h1}>Le classement</Text>
          <Text style={s.sub}>{adult ? 'Gorgées' : 'Gages'} récoltés par joueur</Text>
        </View>
        <View style={{ gap: 8 }}>
          {sorted.map((name, i) => (
            <View key={name} style={[s.rankRow, i === 0 && s.rankFirst]}>
              <Text style={[s.rank, i === 0 && { color: T.orTexte }]}>{String(i + 1).padStart(2, '0')}</Text>
              <PlayerToken name={name} index={playerNames.indexOf(name)} />
              <Text style={[s.rankName, i === 0 && { color: T.orTexte }]} numberOfLines={1}>{name}</Text>
              <View style={s.barTrack}><View style={[s.barFill, { width: `${((scores[name] || 0) / best) * 100}%`, backgroundColor: i === 0 ? T.orTexte : T.encreDouce }]} /></View>
              <Text style={[s.rankScore, i === 0 && { color: T.orTexte }]}>{scores[name] || 0}</Text>
            </View>
          ))}
        </View>
      </GameScreen>
    );
  }

  // ── Verdict de la manche ──
  if (phase === 'reveal') {
    const sortedTally = [...playerNames].sort((a, b) => (tally[b] || 0) - (tally[a] || 0));
    return (
      <GameScreen top={top} footer={(
        <ActionBar>
          <PrimaryButton label={roundIdx + 1 >= prompts.length ? 'Voir le classement' : 'Question suivante'} onPress={handleNext} />
        </ActionBar>
      )}>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={s.kicker}>VERDICT DE LA MANCHE</Text>
          <Text style={[s.sub, { textAlign: 'center' }]}>« …{currentPrompt?.text} »</Text>
        </View>
        <View style={s.verdict}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {losers.map((n) => <PlayerToken key={n} name={n} index={playerNames.indexOf(n)} size={64} />)}
          </View>
          <Text style={s.verdictName}>{losers.join(' & ')}</Text>
          <Text style={s.verdictVotes}>{maxVotes} VOTE{maxVotes > 1 ? 'S' : ''} SUR {playerNames.length}</Text>
          <Text style={s.verdictText}>
            {losers.length === 1 ? (adult ? `${losers[0]} boit ` : `${losers[0]} prend `) : (adult ? 'Ils boivent ' : 'Ils prennent ')}
            {maxVotes} {unit(maxVotes)}.
          </Text>
        </View>
        <View style={{ gap: 10 }} accessibilityLabel="Répartition des votes">
          {sortedTally.map((name) => {
            const n = tally[name] || 0, lose = losers.includes(name);
            return (
              <View key={name} style={s.tallyRow}>
                <Text style={[s.tallyName, lose && { color: T.orTexte }]} numberOfLines={1}>{name}</Text>
                <View style={s.barTrack}><View style={[s.barFill, { width: `${(n / playerNames.length) * 100}%`, backgroundColor: lose ? T.orTexte : T.encreDouce }]} /></View>
                <Text style={[s.tallyCount, lose && { color: T.orTexte }]}>{n}</Text>
              </View>
            );
          })}
        </View>
      </GameScreen>
    );
  }

  // ── La question ──
  if (phase === 'prompt') {
    return (
      <GameScreen top={top} footer={(
        <ActionBar>
          <PrimaryButton label="Commencer le vote" onPress={() => { setCurrentVoterIdx(0); setVotes([]); setPhase('voting'); }} />
        </ActionBar>
      )}>
        {adult ? <View style={{ alignSelf: 'flex-end' }}><AdultTag /></View> : null}
        <QuestionCard kicker="Qui est le plus…" footer="Chacun vote en secret, puis passe le téléphone.">
          {`${currentPrompt?.text ?? '…'} ?`}
        </QuestionCard>
      </GameScreen>
    );
  }

  // ── Vote d'un joueur ──
  return (
    <GameScreen top={top} footer={(
      <ActionBar>
        <Text style={s.voteCount}>Vote {currentVoterIdx + 1} sur {playerNames.length} · touchez un prénom pour voter</Text>
      </ActionBar>
    )}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <PlayerToken name={currentVoter} index={currentVoterIdx} size={28} />
          <Text style={s.voter}>{currentVoter} vote</Text>
        </View>
        {adult ? <AdultTag /> : null}
      </View>
      <QuestionCard kicker="Qui est le plus…">{`${currentPrompt?.text ?? '…'} ?`}</QuestionCard>
      <View style={s.voteGrid} accessibilityRole="radiogroup" accessibilityLabel="Votre vote">
        {playerNames.filter((n) => n !== currentVoter).map((name) => (
          <Pressable key={name} onPress={() => handleVote(name)} accessibilityRole="button" accessibilityLabel={`Voter pour ${name}`}
            style={({ pressed }) => [s.voteBtn, pressed && { borderColor: T.or, backgroundColor: T.orVoile }]}>
            <PlayerToken name={name} index={playerNames.indexOf(name)} />
            <Text style={s.voteName} numberOfLines={1}>{name}</Text>
          </Pressable>
        ))}
      </View>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  kicker: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  h1: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 32, lineHeight: 36 },
  sub: { color: T.encreDouce, fontSize: 15, lineHeight: 21 },
  verdict: { borderRadius: 18, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 20, alignItems: 'center', gap: 10 },
  verdictName: { color: T.encre, fontFamily: F.affiche, fontSize: 34, lineHeight: 38, textAlign: 'center' },
  verdictVotes: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2 },
  verdictText: { color: T.encre, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tallyName: { width: 84, color: T.encre, fontSize: 15 },
  tallyCount: { width: 24, textAlign: 'right', color: T.encreDouce, fontFamily: F.chiffre, fontSize: 14 },
  barTrack: { flex: 1, height: 10, borderRadius: 999, backgroundColor: T.trait, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 999 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: T.carte, borderWidth: 1, borderColor: T.trait },
  rankFirst: { borderColor: T.or, backgroundColor: T.orVoile },
  rank: { width: 24, color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
  rankName: { width: 86, color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  rankScore: { width: 28, textAlign: 'right', color: T.encre, fontFamily: F.chiffre, fontSize: 15 },
  voter: { color: T.encre, fontSize: 15 },
  voteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  voteBtn: { flexBasis: '47%', flexGrow: 1, height: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort },
  voteName: { flex: 1, color: T.encre, fontFamily: F.texteMoyen, fontSize: 16 },
  voteCount: { color: T.encreDouce, fontSize: 13, textAlign: 'center' },
});
