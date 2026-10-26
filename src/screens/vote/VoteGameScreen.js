import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as V_FR from '../../data/voteData';
import * as V_EN from '../../data/voteDataEn';
import { t, IS_EN } from '../../i18n';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, Heading, Notice, QuestionCard, PassPhone,
  AnswerChoice, PlayerToken, Ranking, EndActions, T, F,
} from '../../components/game/Legende';

const GAME = 'vote';
const { selectQuestions } = IS_EN ? V_EN : V_FR;

// Phase machine:
// player_ready → player_voting → player_voted → player_ready (next player)
//                             ↘ voting_complete → reveal → player_ready (next question)
//                                                        ↘ final

export default function VoteGameScreen({ route, navigation }) {
  const { questionCount = 10, playerNames = [], categoryId = 'all' } = route.params || {};

  const [questions]          = useState(() => selectQuestions(questionCount, categoryId, playerNames));
  const [questionIdx, setQuestionIdx]       = useState(0);
  const [phase, setPhase]                   = useState('player_ready');
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [playerVotes, setPlayerVotes]       = useState({});
  const [roundPoints, setRoundPoints]       = useState(null);
  const [scores, setScores]                 = useState(() =>
    Object.fromEntries(playerNames.map(n => [n, 0]))
  );

  const currentQuestion = questions[questionIdx];
  const currentPlayer   = playerNames[currentVoterIdx];

  const calcPoints = useCallback((votes) => {
    const vals = Object.values(votes);
    const countA = vals.filter(v => v === 'a').length;
    const countB = vals.filter(v => v === 'b').length;
    const n = playerNames.length;
    const pts = Object.fromEntries(playerNames.map(name => [name, 0]));
    if (countA === n || countB === n) {
      playerNames.forEach(name => { pts[name] = 2; });
    } else if (countA !== countB) {
      const maj = countA > countB ? 'a' : 'b';
      Object.entries(votes).forEach(([idx, vote]) => {
        if (vote === maj) pts[playerNames[+idx]] = 1;
      });
    }
    return pts;
  }, [playerNames]);

  const handleVote = useCallback((choice) => {
    const newVotes = { ...playerVotes, [currentVoterIdx]: choice };
    setPlayerVotes(newVotes);
    if (currentVoterIdx < playerNames.length - 1) {
      setCurrentVoterIdx(i => i + 1);
      setPhase('player_voted');
    } else {
      setRoundPoints(calcPoints(newVotes));
      setPhase('voting_complete');
    }
  }, [playerVotes, currentVoterIdx, playerNames, calcPoints]);

  const handleNextQuestion = useCallback(() => {
    const newScores = { ...scores };
    if (roundPoints) {
      Object.entries(roundPoints).forEach(([name, pts]) => {
        newScores[name] = (newScores[name] || 0) + pts;
      });
    }
    setScores(newScores);
    if (questionIdx < questions.length - 1) {
      setQuestionIdx(q => q + 1);
      setCurrentVoterIdx(0);
      setPlayerVotes({});
      setRoundPoints(null);
      setPhase('player_ready');
    } else {
      setPhase('final');
    }
  }, [scores, roundPoints, questionIdx, questions.length]);

  const quit = () => goBackOrMenu(navigation);
  const top = <GameTopBar game={GAME} onBack={quit} current={questionIdx + 1} total={questions.length} />;
  const one = (label, onPress) => <ActionBar><PrimaryButton label={label} onPress={onPress} /></ActionBar>;

  // ── Au tour de… ──
  if (phase === 'player_ready' || phase === 'player_voted') {
    return (
      <GameScreen top={top} scroll={false} footer={one(t('Voter en secret', 'Vote in secret'), () => setPhase('player_voting'))}>
        <PassPhone game={GAME} name={currentPlayer} index={currentVoterIdx} order={playerNames}
          kicker={phase === 'player_voted' ? t('Vote enregistré', 'Vote saved') : t('À vous de voter', 'Your turn to vote')} instruction={t('Les autres joueurs détournent le regard.', 'Everyone else looks away.')} />
      </GameScreen>
    );
  }

  // ── Vote ──
  if (phase === 'player_voting') {
    return (
      <GameScreen top={top}>
        <View style={s.who}>
          <PlayerToken name={currentPlayer} index={currentVoterIdx} size={28} />
          <Text style={s.whoText}>{t(`${currentPlayer} vote`, `${currentPlayer} is voting`)}</Text>
        </View>
        <QuestionCard kicker={t('Votez comme la majorité', 'Vote like the majority')}>{currentQuestion.q}</QuestionCard>
        <View style={{ gap: 10 }}>
          {['a', 'b'].map((k, i) => (
            <AnswerChoice key={k} index={i} label={currentQuestion[k]} onPress={() => handleVote(k)} />
          ))}
        </View>
      </GameScreen>
    );
  }

  // ── Tout le monde a voté ──
  if (phase === 'voting_complete') {
    return (
      <GameScreen top={top} footer={one(t('Révéler les votes', 'Reveal the votes'), () => setPhase('reveal'))}>
        <Heading kicker={t(`${playerNames.length} votes enregistrés`, `${playerNames.length} votes saved`)} title={t('Tout le monde a voté', 'Everyone has voted')} />
        <QuestionCard>{currentQuestion.q}</QuestionCard>
      </GameScreen>
    );
  }

  // ── Résultat ──
  if (phase === 'reveal') {
    const countA      = Object.values(playerVotes).filter(v => v === 'a').length;
    const countB      = Object.values(playerVotes).filter(v => v === 'b').length;
    const n           = playerNames.length;
    const isUnanimous = countA === n || countB === n;
    const isTie       = countA === countB;
    const majority    = countA > countB ? 'a' : 'b';
    const votersA     = Object.entries(playerVotes).filter(([, v]) => v === 'a').map(([i]) => playerNames[+i]);
    const votersB     = Object.entries(playerVotes).filter(([, v]) => v === 'b').map(([i]) => playerNames[+i]);
    const totals      = Object.fromEntries(playerNames.map(nm => [nm, (scores[nm] || 0) + (roundPoints?.[nm] || 0)]));
    const col = (k, count, voters) => {
      const win = !isTie && majority === k;
      return (
        <View style={[s.col, win && { borderColor: T.or, backgroundColor: T.orVoile }]}>
          <Text style={[s.colCount, win && { color: T.orTexte }]}>{count}</Text>
          <Text style={s.colOption}>{currentQuestion[k]}</Text>
          <Text style={s.colNames}>{voters.join(', ') || '—'}</Text>
          {win ? <Text style={s.colTag}>{isUnanimous ? t('UNANIME', 'UNANIMOUS') : t('MAJORITÉ', 'MAJORITY')}</Text> : null}
        </View>
      );
    };
    return (
      <GameScreen top={top} footer={one(questionIdx < questions.length - 1 ? t('Question suivante', 'Next question') : t('Résultats finaux', 'Final results'), handleNextQuestion)}>
        <Heading kicker={t('Résultat du vote', 'Vote result')} sub={currentQuestion.q} />
        <View style={s.cols}>
          {col('a', countA, votersA)}
          {col('b', countB, votersB)}
        </View>
        <Notice son="revele" tone={isTie ? 'neutre' : 'or'}
          title={isUnanimous ? t('Vote unanime', 'Unanimous vote') : isTie ? t('Égalité parfaite', 'Perfect tie') : t('La majorité l’emporte', 'The majority wins')}>
          {isUnanimous ? t('Tout le monde marque 2 points.', 'Everyone scores 2 points.') : isTie ? t('Personne ne marque.', 'Nobody scores.') : `${(majority === 'a' ? votersA : votersB).join(', ')}${t(' : ', ': ')}+1 point.`}
        </Notice>
        <Ranking players={playerNames} scores={totals} suffix=" pts" />
      </GameScreen>
    );
  }

  // ── Classement final ──
  return (
    <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={questions.length} total={questions.length} />}
      footer={<EndActions navigation={navigation} route={route} game={GAME} scores={scores} />}>
      <Heading kicker={t('Fin de partie', 'Game over')} title={t('Le classement', 'The ranking')} sub={t('Qui a pensé comme la majorité ?', 'Who thought like the majority?')} />
      <Ranking players={playerNames} scores={scores} suffix=" pts" />
    </GameScreen>
  );
}

const s = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whoText: { color: T.encre, fontSize: 15 },
  cols: { flexDirection: 'row', gap: 8 },
  col: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 14, alignItems: 'center', gap: 6 },
  colCount: { color: T.encre, fontFamily: F.affiche, fontSize: 40, lineHeight: 44 },
  colOption: { color: T.encre, fontFamily: F.texteFort, fontSize: 15, textAlign: 'center' },
  colNames: { color: T.encreDouce, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  colTag: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 2 },
});
