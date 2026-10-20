import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { pickRuleAndDecoys, REGLE_CATEGORIES } from '../../data/regles';
import sansEmoji from '../../utils/sansEmoji';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Notice, QuestionCard,
  AnswerChoice, Stepper, PlayerToken, Ranking, EndActions, T, F,
} from '../../components/game/Legende';

const GAME = 'trouveLaRegle';

function calcPoints(questions) {
  if (questions <= 3) return 3;
  if (questions <= 6) return 2;
  return 1;
}

export default function TrouveLaRegleGameScreen({ navigation, route }) {
  const { playerNames = [], roundCount = 5 } = route.params || {};

  const [round,          setRound]          = useState(0);
  const [phase,          setPhase]          = useState('detective_out');
  const [questionCount,  setQuestionCount]  = useState(0);
  const [scores,         setScores]         = useState(() => Object.fromEntries(playerNames.map(n => [n, 0])));
  const [currentRule,    setCurrentRule]    = useState(null);
  const [options,        setOptions]        = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lastResult,     setLastResult]     = useState(null); // { correct, pts }

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  const detective = playerNames[round % playerNames.length];
  const others    = playerNames.filter((_, i) => i !== round % playerNames.length);

  useEffect(() => {
    const { rule, options: opts } = pickRuleAndDecoys();
    setCurrentRule(rule);
    setOptions(opts);
    setQuestionCount(0);
    setSelectedOption(null);
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

  const handleConfirmGuess = () => {
    if (!selectedOption) return;
    const correct = selectedOption.id === currentRule.id;
    const pts     = correct ? calcPoints(questionCount) : 0;
    if (correct) setScores(prev => ({ ...prev, [detective]: (prev[detective] || 0) + pts }));
    setLastResult({ correct, pts });
    goPhase('result');
  };

  const handleNextRound = () => {
    if (round + 1 >= roundCount) {
      goPhase('final');
    } else {
      setRound(r => r + 1);
      goPhase('detective_out');
    }
  };

  const catMeta = currentRule
    ? REGLE_CATEGORIES.find(c => c.id === currentRule.cat) ?? REGLE_CATEGORIES[0]
    : REGLE_CATEGORIES[0];

  const quit = () => goBackOrMenu(navigation);
  const detIdx = round % playerNames.length;
  const top = <GameTopBar game={GAME} onBack={quit} current={Math.min(round + 1, roundCount)} total={roundCount} />;
  const one = (label, onPress, disabled) => <ActionBar><PrimaryButton label={label} onPress={onPress} disabled={disabled} /></ActionBar>;

  // ── Fin de l'enquête ──
  if (phase === 'final') {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
    const winner = sorted[0]?.[0];
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={roundCount} total={roundCount} />}
        footer={<EndActions navigation={navigation} route={route} />}>
        <Heading kicker="Fin de l’enquête" title={winner ? `${winner}, meilleur détective` : 'Le classement'} />
        <Ranking players={playerNames} scores={scores} suffix=" pts" />
      </GameScreen>
    );
  }

  // ── Le détective sort ──
  if (phase === 'detective_out') {
    return (
      <GameScreen top={top} scroll={false} footer={one(`${detective} est sorti`, () => goPhase('rule_reveal'))}>
        <View style={s.center}>
          <Text style={s.kicker}>MANCHE {round + 1} SUR {roundCount} · DÉTECTIVE</Text>
          <PlayerToken name={detective} index={detIdx} size={88} />
          <Heading title={`${detective}, sortez de la pièce`}
            sub={`${others.join(', ')} : gardez l’écran pour vous. Touchez le bouton quand ${detective} est bien sorti.`} />
        </View>
      </GameScreen>
    );
  }

  // ── La règle secrète ──
  if (phase === 'rule_reveal') {
    return (
      <GameScreen top={top} footer={one(`Appeler ${detective}`, () => goPhase('playing'))}>
        <QuestionCard kicker={`Règle secrète · ${sansEmoji(catMeta.name)}`} footer={`Mémorisez-la, puis appelez ${detective}.`}>
          {currentRule?.text ?? '…'}
        </QuestionCard>
      </GameScreen>
    );
  }

  // ── L'enquête ──
  if (phase === 'playing') {
    return (
      <GameScreen top={top} footer={(
        <ActionBar>
          <PrimaryButton label="J’ai trouvé" onPress={() => goPhase('guessing')} />
          <TextLink label="Abandonner cette manche" color={T.encreDouce} onPress={() => { setLastResult({ correct: false, pts: 0 }); goPhase('result'); }} />
        </ActionBar>
      )}>
        <View style={s.center}>
          <PlayerToken name={detective} index={detIdx} size={64} />
          <Heading title={`${detective} enquête…`} sub="Posez des questions libres ; les autres répondent en suivant la règle." />
          <View style={s.counter}>
            <Text style={s.kickerMuted}>QUESTIONS POSÉES</Text>
            <Stepper value={questionCount} min={0} max={99} onChange={setQuestionCount} label="Questions posées" />
            <Text style={s.hint}>
              {questionCount <= 3 ? '3 questions ou moins' : questionCount <= 6 ? '6 questions ou moins' : '7 questions ou plus'} : {calcPoints(questionCount)} point{calcPoints(questionCount) > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </GameScreen>
    );
  }

  // ── Proposition du détective ──
  if (phase === 'guessing') {
    return (
      <GameScreen top={top} footer={one('Valider ma réponse', handleConfirmGuess, !selectedOption)}>
        <Heading kicker={`${detective} répond`} title="Quelle est la règle ?" sub="Les autres joueurs détournent le regard." />
        <View style={{ gap: 8 }}>
          {options.map((opt, i) => (
            <AnswerChoice key={opt.id} index={i} label={opt.text} state={selectedOption?.id === opt.id ? 'selected' : null} onPress={() => setSelectedOption(opt)} />
          ))}
        </View>
      </GameScreen>
    );
  }

  // ── Résultat ──
  if (phase === 'result' && lastResult) {
    return (
      <GameScreen top={top} footer={one(round + 1 >= roundCount ? 'Voir les scores' : 'Manche suivante', handleNextRound)}>
        <Notice tone={lastResult.correct ? 'or' : 'alerte'}
          title={lastResult.correct ? `Bonne réponse · +${lastResult.pts} pt${lastResult.pts > 1 ? 's' : ''}` : 'Raté'} />
        <QuestionCard kicker="La règle était">{currentRule?.text ?? '…'}</QuestionCard>
        <Ranking players={playerNames} scores={scores} suffix=" pts" />
      </GameScreen>
    );
  }

  return null;
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  kickerMuted: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  counter: { alignItems: 'center', gap: 12, padding: 18, borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, alignSelf: 'stretch' },
  hint: { color: T.encreDouce, fontSize: 14 },
});
