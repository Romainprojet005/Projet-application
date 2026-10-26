import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Q_FR from '../../data/quiEstLePlusPrompts';
import * as Q_EN from '../../data/quiEstLePlusPromptsEn';
import { t, IS_EN } from '../../i18n';
import goBackOrMenu from '../../navigation/goBack';
import { retour } from '../../utils/feedback';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Notice, QuestionCard, PassPhone,
  AnswerChoice, PlayerChoice, PlayerToken, Ranking, EndActions, T, F,
} from '../../components/game/Legende';

const GAME = 'tripotes';
const { pickPromptAndDecoys } = IS_EN ? Q_EN : Q_FR;

export default function TriPotesGameScreen({ navigation, route }) {
  const { playerNames = [], roundCount = 6, categoryId = 'all' } = route.params || {};

  const [round,       setRound]       = useState(0);
  const [phase,       setPhase]       = useState('pass_to_judge');
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [options,     setOptions]     = useState([]);
  const [ranking,     setRanking]     = useState([]);
  const [selectedGuess, setSelectedGuess] = useState(null);
  const [scores,      setScores]      = useState(() => Object.fromEntries(playerNames.map(n => [n, 0])));
  const [lastResult,  setLastResult]  = useState(null); // { correct }

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  const judge  = playerNames[round % playerNames.length];
  const others = playerNames.filter((_, i) => i !== round % playerNames.length);

  useEffect(() => {
    const { prompt, options: opts } = pickPromptAndDecoys(categoryId);
    setCurrentPrompt(prompt);
    setOptions(opts);
    setRanking([]);
    setSelectedGuess(null);
    setLastResult(null);
    animateIn();
  }, [round]);

  const animateIn = () => {
    fadeIn.setValue(0);
    slideUp.setValue(30);
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  };

  const goPhase = (p) => {
    fadeIn.setValue(0);
    slideUp.setValue(20);
    setPhase(p);
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 70, friction: 14, useNativeDriver: true }),
    ]).start();
  };

  const toggleRank = (name) => {
    if (ranking.includes(name)) return;
    retour('vote');
    setRanking(prev => [...prev, name]);
  };

  const resetRanking = () => setRanking([]);

  const handleConfirmGuess = () => {
    if (!selectedGuess) return;
    const correct = selectedGuess.id === currentPrompt.id;
    const newScores = { ...scores };
    if (correct) {
      others.forEach(n => { newScores[n] = (newScores[n] || 0) + 1; });
    } else {
      newScores[judge] = (newScores[judge] || 0) + 2;
    }
    setScores(newScores);
    setLastResult({ correct });
    goPhase('result');
  };

  const handleNextRound = () => {
    if (round + 1 >= roundCount) {
      goPhase('final');
    } else {
      setRound(r => r + 1);
      goPhase('pass_to_judge');
    }
  };

  const quit = () => goBackOrMenu(navigation);
  const judgeIdx = round % playerNames.length;
  const idxOf = (n) => playerNames.indexOf(n);
  const top = <GameTopBar game={GAME} onBack={quit} current={Math.min(round + 1, roundCount)} total={roundCount} />;
  const one = (label, onPress, disabled) => <ActionBar><PrimaryButton label={label} onPress={onPress} disabled={disabled} /></ActionBar>;
  const RankList = () => (
    <View style={{ gap: 8 }}>
      {ranking.map((name, i) => (
        <View key={name} style={s.row}>
          <Text style={s.rank}>{String(i + 1).padStart(2, '0')}</Text>
          <PlayerToken name={name} index={idxOf(name)} size={28} />
          <Text style={s.rowName}>{name}</Text>
        </View>
      ))}
    </View>
  );

  // ── Fin ──
  if (phase === 'final') {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const winner = sorted[0]?.[0];
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={roundCount} total={roundCount} />}
        footer={<EndActions navigation={navigation} route={route} game={GAME} scores={scores} />}>
        <Heading kicker={t('Fin du jugement', 'Final verdict')} title={winner ? t(`${winner} l’emporte`, `${winner} wins`) : t('Le classement', 'The ranking')} sub={t('Meilleur juge de potes de la soirée.', 'Best judge of friends tonight.')} />
        <Ranking players={playerNames} scores={scores} suffix=" pts" />
      </GameScreen>
    );
  }

  // ── Passer le téléphone au juge ──
  if (phase === 'pass_to_judge') {
    return (
      <GameScreen top={top} scroll={false} footer={one(t(`${judge} a le téléphone`, `${judge} has the phone`), () => goPhase('question_reveal'))}>
        <PassPhone game={GAME} name={judge} index={judgeIdx} kicker={t(`Juge de la manche ${round + 1}`, `Judge of round ${round + 1}`)} instruction={t('Les autres joueurs ne regardent pas l’écran.', 'Everyone else looks away from the screen.')} />
      </GameScreen>
    );
  }

  // ── La question secrète ──
  if (phase === 'question_reveal') {
    return (
      <GameScreen top={top} footer={one(t('Classer les joueurs', 'Rank the players'), () => goPhase('ranking'))}>
        <QuestionCard kicker={t('La question secrète', 'The secret question')} footer={t('Mémorisez-la : vous allez classer les autres joueurs selon elle.', 'Memorise it: you’ll rank the other players with it.')}>
          {currentPrompt?.text ?? '…'}
        </QuestionCard>
      </GameScreen>
    );
  }

  // ── Classement par le juge ──
  if (phase === 'ranking') {
    return (
      <GameScreen top={top} footer={(
        <ActionBar>
          <PrimaryButton label={t('Valider le classement', 'Confirm the ranking')} onPress={() => goPhase('reveal_ranking')} disabled={ranking.length !== others.length} />
          {ranking.length > 0 ? <TextLink label={t('Recommencer le classement', 'Start the ranking over')} color={T.encreDouce} onPress={resetRanking} /> : null}
        </ActionBar>
      )}>
        <Heading kicker={t(`${judge} classe`, `${judge} ranks`)} title={t('Classez-les', 'Rank them')} sub={t('Touchez les joueurs du plus au moins concerné par la question.', 'Tap the players from most to least likely.')} />
        <View style={{ gap: 8 }}>
          {others.map((name) => {
            const pos = ranking.indexOf(name);
            const ranked = pos !== -1;
            return (
              <PlayerChoice key={name} name={name} index={idxOf(name)} selected={ranked} disabled={false}
                onPress={() => toggleRank(name)} label={ranked ? t(`${name}, classé ${pos + 1}`, `${name}, ranked ${pos + 1}`) : t(`Classer ${name}`, `Rank ${name}`)}
                right={<Text style={[s.pos, ranked && { color: T.orTexte }]}>{ranked ? String(pos + 1).padStart(2, '0') : '—'}</Text>} />
            );
          })}
        </View>
      </GameScreen>
    );
  }

  // ── Classement montré au groupe ──
  if (phase === 'reveal_ranking') {
    return (
      <GameScreen top={top} footer={one(t('Le groupe est prêt', 'The group is ready'), () => goPhase('guessing'))}>
        <Heading kicker={t('Le classement de', 'The ranking by')} title={judge} sub={t('Passez le téléphone au groupe : à vous de deviner la vraie question.', 'Pass the phone to the group: now guess the real question.')} />
        <RankList />
      </GameScreen>
    );
  }

  // ── Le groupe devine ──
  if (phase === 'guessing') {
    return (
      <GameScreen top={top} footer={one(t('Valider la réponse', 'Confirm the answer'), handleConfirmGuess, !selectedGuess)}>
        <Heading kicker={t('Le groupe devine', 'The group guesses')} title={t('Quelle était la question ?', 'What was the question?')} sub={t(`${judge}, ne dites rien.`, `${judge}, say nothing.`)} />
        <RankList />
        <View style={{ gap: 8 }}>
          {options.map((opt, i) => (
            <AnswerChoice key={opt.id} index={i} label={opt.text} state={selectedGuess?.id === opt.id ? 'selected' : null} onPress={() => setSelectedGuess(opt)} />
          ))}
        </View>
      </GameScreen>
    );
  }

  // ── Résultat ──
  if (phase === 'result' && lastResult) {
    return (
      <GameScreen top={top} footer={one(round + 1 >= roundCount ? t('Voir les scores', 'See the scores') : t('Manche suivante', 'Next round'), handleNextRound)}>
        <Notice son={lastResult.correct ? 'bon' : 'faux'} tone={lastResult.correct ? 'or' : 'neutre'}
          title={lastResult.correct ? t('Le groupe a trouvé', 'The group got it') : t(`${judge} a bluffé`, `${judge} fooled you`)}>
          {lastResult.correct ? t('+1 point pour chaque joueur du groupe.', '+1 point for each player in the group.') : t(`+2 points pour ${judge}.`, `+2 points for ${judge}.`)}
        </Notice>
        <QuestionCard kicker={t('La question était', 'The question was')}>{currentPrompt?.text ?? '…'}</QuestionCard>
        <Ranking players={playerNames} scores={scores} suffix=" pts" />
      </GameScreen>
    );
  }

  return null;
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte },
  rank: { width: 24, color: T.orTexte, fontFamily: F.chiffre, fontSize: 13 },
  rowName: { flex: 1, color: T.encre, fontFamily: F.texteMoyen, fontSize: 15 },
  pos: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 14 },
});
