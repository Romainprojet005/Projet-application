import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, SecondaryButton, TextLink, Heading, QuestionCard, PassPhone,
  PlayerToken, Ranking, T, F,
} from '../../components/game/Legende';

const GAME = 'motdepasse';

export default function MotDePasseGameScreen({ navigation, route }) {
  const { players, cards, timerSecs } = route.params;

  const [phase,          setPhase]          = useState('handoff');
  const [playerIdx,      setPlayerIdx]      = useState(0);
  const [cardIdxDisplay, setCardIdxDisplay] = useState(0);
  const [scores,         setScores]         = useState(Array(players.length).fill(0));
  const [timeLeft,       setTimeLeft]       = useState(timerSecs);
  const [lastTurnResult, setLastTurnResult] = useState({ correct: 0, skipped: 0 });

  // Refs to avoid stale closures in interval callbacks
  const timerRef       = useRef(null);
  const turnCorrectRef = useRef(0);
  const turnSkippedRef = useRef(0);
  const cardIdxRef     = useRef(0);
  const playerIdxRef   = useRef(0);
  const turnEndedRef   = useRef(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnim  = useRef(new Animated.Value(1)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0); slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => { animateIn(); }, [phase]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const doEndTurn = useCallback(() => {
    if (turnEndedRef.current) return;
    turnEndedRef.current = true;
    clearTimer();

    const correct  = turnCorrectRef.current;
    const skipped  = turnSkippedRef.current;
    const cIdx     = cardIdxRef.current;
    const pIdx     = playerIdxRef.current;

    setLastTurnResult({ correct, skipped });
    setScores(prev => { const next = [...prev]; next[pIdx] = (next[pIdx] || 0) + correct; return next; });
    setCardIdxDisplay(cIdx);
    setPhase(cIdx >= cards.length ? 'gameEnd' : 'turnEnd');
  }, [cards.length]);

  // Keep a ref to always-current doEndTurn for interval callback
  const doEndTurnRef = useRef(doEndTurn);
  useEffect(() => { doEndTurnRef.current = doEndTurn; });

  const startTurn = () => {
    turnCorrectRef.current = 0;
    turnSkippedRef.current = 0;
    cardIdxRef.current     = cardIdxDisplay;
    playerIdxRef.current   = playerIdx;
    turnEndedRef.current   = false;

    setTimeLeft(timerSecs);
    setPhase('playing');

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          doEndTurnRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const animateCardChange = (callback) => {
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    callback();
  };

  const handleCorrect = () => {
    turnCorrectRef.current += 1;
    cardIdxRef.current += 1;
    if (cardIdxRef.current >= cards.length) {
      doEndTurnRef.current();
    } else {
      animateCardChange(() => setCardIdxDisplay(cardIdxRef.current));
    }
  };

  const handleSkip = () => {
    turnSkippedRef.current += 1;
    cardIdxRef.current += 1;
    if (cardIdxRef.current >= cards.length) {
      doEndTurnRef.current();
    } else {
      animateCardChange(() => setCardIdxDisplay(cardIdxRef.current));
    }
  };

  const handleNextTurn = () => {
    const nextPlayer = (playerIdx + 1) % players.length;
    setPlayerIdx(nextPlayer);
    setPhase('handoff');
  };

  const quit = () => goBackOrMenu(navigation);

  // ── Classement ──
  if (phase === 'gameEnd') {
    const byName = Object.fromEntries(players.map((n, i) => [n, scores[i] || 0]));
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={cards.length} total={cards.length} />}
        footer={(
          <ActionBar>
            <PrimaryButton label="Rejouer" onPress={() => navigation.navigate('MotDePasseSetup', { replay: Date.now() })} />
            <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
          </ActionBar>
        )}>
        <Heading kicker="Partie terminée" title="Le classement" sub="Le Poète applaudit. Mots devinés par joueur :" />
        <Ranking players={players} scores={byName} />
      </GameScreen>
    );
  }

  const currentCard = cards[cardIdxDisplay] || cards[cards.length - 1];
  const timerPct    = timeLeft / timerSecs;
  const timerColor  = timerPct > 0.5 ? '#FF8A8A' : timerPct > 0.25 ? T.orTexte : T.alerte;
  const top = <GameTopBar game={GAME} onBack={quit} current={cardIdxDisplay} total={cards.length} />;

  // ── Au tour de… ──
  if (phase === 'handoff') {
    return (
      <GameScreen top={top} scroll={false} footer={<ActionBar><PrimaryButton label="Je suis prêt" onPress={startTurn} /></ActionBar>}>
        <PassPhone game={GAME} name={players[playerIdx]} index={playerIdx} order={players} kicker={`${cardIdxDisplay} mots sur ${cards.length}`}
          instruction={`Faites deviner les mots sans dire les mots interdits. Vous avez ${timerSecs} secondes.`}
          extra={(
            <View style={s.scores}>
              {players.map((name, i) => (
                <View key={i} style={[s.scoreChip, i === playerIdx && { borderColor: T.or }]}>
                  <Text style={s.scoreName} numberOfLines={1}>{name}</Text>
                  <Text style={[s.scoreVal, i === playerIdx && { color: T.orTexte }]}>{scores[i] || 0}</Text>
                </View>
              ))}
            </View>
          )} />
      </GameScreen>
    );
  }

  // ── Le tour ──
  if (phase === 'playing') {
    return (
      <GameScreen top={top} footer={(
        <ActionBar>
          <View style={s.duo}>
            <SecondaryButton label="Passer" onPress={handleSkip} style={{ flex: 1, width: 'auto' }} />
            <PrimaryButton label="Trouvé" onPress={handleCorrect} style={{ flex: 1.4, width: 'auto' }} />
          </View>
          <TextLink label="Terminer le tour" color={T.encreDouce} onPress={() => doEndTurnRef.current()} />
        </ActionBar>
      )}>
        <View style={s.status}>
          <PlayerToken name={players[playerIdx]} index={playerIdx} size={28} />
          <Text style={s.player}>{players[playerIdx]}</Text>
          <Text style={s.turn}>{turnCorrectRef.current} trouvé{turnCorrectRef.current > 1 ? 's' : ''}</Text>
          <View style={[s.timer, { borderColor: timerColor }]}><Text style={[s.timerText, { color: timerColor }]}>{timeLeft}</Text></View>
        </View>
        <View style={s.track}><View style={[s.fill, { width: `${timerPct * 100}%`, backgroundColor: timerColor }]} /></View>

        <Animated.View style={{ opacity: cardAnim, gap: 16 }}>
          <QuestionCard kicker="Faites deviner">{currentCard.word}</QuestionCard>
          <View style={s.forbidden}>
            <Text style={s.forbiddenTitle}>MOTS INTERDITS</Text>
            <View style={s.chips}>
              {currentCard.forbidden.map((w, i) => (
                <View key={i} style={s.chip}><Text style={s.chipText}>{w}</Text></View>
              ))}
            </View>
          </View>
        </Animated.View>
      </GameScreen>
    );
  }

  // ── Fin du tour ──
  const next = players[(playerIdx + 1) % players.length];
  const byName = Object.fromEntries(players.map((n, i) => [n, scores[i] || 0]));
  return (
    <GameScreen top={top} footer={<ActionBar note={`${cards.length - cardIdxDisplay} mots restants`}><PrimaryButton label={`Au tour de ${next}`} onPress={handleNextTurn} /></ActionBar>}>
      <Heading kicker="Fin du tour" title={players[playerIdx]} />
      <View style={s.result}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={[s.resultNum, { color: T.orTexte }]}>{lastTurnResult.correct}</Text>
          <Text style={s.resultLabel}>trouvé{lastTurnResult.correct > 1 ? 's' : ''}</Text>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={s.resultNum}>{lastTurnResult.skipped}</Text>
          <Text style={s.resultLabel}>passé{lastTurnResult.skipped > 1 ? 's' : ''}</Text>
        </View>
      </View>
      <Ranking players={players} scores={byName} />
    </GameScreen>
  );
}

const s = StyleSheet.create({
  scores: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 8 },
  scoreChip: { flexDirection: 'row', gap: 6, alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: T.trait, maxWidth: 160 },
  scoreName: { color: T.encreDouce, fontSize: 13, flexShrink: 1 },
  scoreVal: { color: T.encre, fontFamily: F.chiffre, fontSize: 13 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  player: { flex: 1, color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  turn: { color: T.encreDouce, fontSize: 13 },
  timer: { width: 48, height: 48, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timerText: { fontFamily: F.chiffre, fontSize: 17 },
  track: { height: 6, borderRadius: 999, backgroundColor: T.trait, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 999 },
  forbidden: { borderRadius: 14, borderWidth: 1, borderColor: T.alerte, backgroundColor: T.alerteVoile, padding: 16, gap: 10 },
  forbiddenTitle: { color: T.alerte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { height: 34, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,138,138,0.5)', justifyContent: 'center' },
  chipText: { color: T.encre, fontFamily: F.texteMoyen, fontSize: 15 },
  duo: { flexDirection: 'row', gap: 8, width: '100%' },
  result: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 16 },
  resultNum: { color: T.encre, fontFamily: F.affiche, fontSize: 40, lineHeight: 44 },
  resultLabel: { color: T.encreDouce, fontSize: 13 },
});
