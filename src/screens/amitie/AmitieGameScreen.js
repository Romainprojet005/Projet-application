import React, { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getQuestions } from '../../data/amitieQuestions';
import goBackOrMenu from '../../navigation/goBack';
import {
  EndActions, GameScreen, GameTopBar, ActionBar, PrimaryButton, SecondaryButton, TextLink, Heading, Notice,
  QuestionCard, PlayerToken, Ranking, AdultTag, T, F,
} from '../../components/game/Legende';

const GAME = 'amitie';

function buildRounds(players, questions) {
  const pairs = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < players.length; j++) {
      if (i !== j) pairs.push([i, j]);
    }
  }
  return questions.map((question, idx) => ({
    guesser: pairs[idx % pairs.length][0],
    subject: pairs[idx % pairs.length][1],
    question,
  }));
}

function getCompatibilityLabel(pct) {
  if (pct >= 80) return 'Vous vous connaissez parfaitement.';
  if (pct >= 60) return 'Vous vous connaissez bien.';
  if (pct >= 40) return 'Vous avez encore des surprises à vous faire…';
  return 'Il y a des choses à (re)découvrir ensemble.';
}

export default function AmitieGameScreen({ navigation, route }) {
  const { players, mode, questions } = route.params;
  const rounds = useMemo(() => buildRounds(players, questions), []);

  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState('question'); // 'question' | 'reveal' | 'results'
  const [scores, setScores] = useState(Object.fromEntries(players.map((_, i) => [i, 0])));
  const [lastResult, setLastResult] = useState(null); // null | 'correct' | 'wrong'
  const feedbackScale = useRef(new Animated.Value(0)).current;
  const quit = () => goBackOrMenu(navigation);

  const handleAnswer = (correct) => {
    if (lastResult) return;
    const round = rounds[currentRound];
    const newScores = { ...scores };
    if (correct) newScores[round.guesser] = (newScores[round.guesser] || 0) + 1;
    setScores(newScores);
    setLastResult(correct ? 'correct' : 'wrong');
    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
    setTimeout(() => {
      if (currentRound + 1 >= rounds.length) setPhase('results');
      else { setCurrentRound(currentRound + 1); setPhase('question'); setLastResult(null); }
    }, 900);
  };

  // ── Résultats ──
  if (phase === 'results') {
    const totalCorrect = Object.values(scores).reduce((a, b) => a + b, 0);
    const compatibility = Math.round((totalCorrect / rounds.length) * 100);
    const byName = Object.fromEntries(players.map((n, i) => [n, scores[i] || 0]));
    const handleReplay = () => {
      const newQuestions = getQuestions(mode, questions.length);
      navigation.replace('AmitieGame', { players, mode, questions: newQuestions });
    };
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={rounds.length} total={rounds.length} />}
        footer={<EndActions navigation={navigation} route={route} replay={handleReplay} game={GAME} scores={byName} />}>
        <View style={s.score}>
          <Text style={s.kicker}>COMPATIBILITÉ</Text>
          <Text style={s.pct}>{compatibility} %</Text>
          <Text style={s.verdict}>{getCompatibilityLabel(compatibility)}</Text>
        </View>
        <Text style={s.kickerMuted}>BONNES RÉPONSES PAR JOUEUR</Text>
        <Ranking players={players} scores={byName} />
      </GameScreen>
    );
  }

  const round = rounds[currentRound];
  const guesserName = players[round.guesser];
  const subjectName = players[round.subject];
  const questionText = round.question.question.replace('{nom}', subjectName);

  return (
    <GameScreen
      top={<GameTopBar game={GAME} onBack={quit} current={currentRound + 1} total={rounds.length} />}
      footer={(
        <ActionBar>
          {phase === 'question' ? (
            <PrimaryButton label={`Voir la réponse de ${subjectName}`} onPress={() => setPhase('reveal')} />
          ) : (
            <View style={s.duo}>
              <SecondaryButton label="Raté" onPress={() => handleAnswer(false)} style={{ flex: 1, width: 'auto' }} disabled={!!lastResult} />
              <PrimaryButton label="Bonne réponse" onPress={() => handleAnswer(true)} style={{ flex: 1.4, width: 'auto' }} disabled={!!lastResult} />
            </View>
          )}
        </ActionBar>
      )}>
      <View style={s.duel}>
        <View style={s.who}>
          <PlayerToken name={guesserName} index={round.guesser} size={44} />
          <Text style={s.role}>DEVINE</Text>
          <Text style={s.name} numberOfLines={1}>{guesserName}</Text>
        </View>
        <Text style={s.arrow}>→</Text>
        <View style={s.who}>
          <PlayerToken name={subjectName} index={round.subject} size={44} />
          <Text style={s.role}>RÉPOND</Text>
          <Text style={s.name} numberOfLines={1}>{subjectName}</Text>
        </View>
      </View>

      {mode === 'adulte' ? <View style={{ alignSelf: 'flex-end' }}><AdultTag /></View> : null}
      <QuestionCard kicker={mode === 'couple' ? 'Question de couple' : mode === 'adulte' ? 'Question coquine' : 'Question d’amitié'}
        footer={phase === 'question' ? `${guesserName}, donnez votre réponse à voix haute.` : `${subjectName}, révélez votre vraie réponse.`}>
        {questionText}
      </QuestionCard>

      {lastResult && (
        <Animated.View style={{ transform: [{ scale: feedbackScale }] }}>
          <Notice son={lastResult === 'correct' ? 'bon' : 'faux'} tone={lastResult === 'correct' ? 'or' : 'neutre'} title={lastResult === 'correct' ? 'Bien joué, +1 point' : 'Raté'} />
        </Animated.View>
      )}
    </GameScreen>
  );
}

const s = StyleSheet.create({
  duel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  who: { flex: 1, alignItems: 'center', gap: 4, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte },
  role: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 2 },
  name: { color: T.encre, fontFamily: F.texteFort, fontSize: 16 },
  arrow: { color: T.encreDouce, fontSize: 20 },
  duo: { flexDirection: 'row', gap: 8, width: '100%' },
  score: { borderRadius: 18, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 20, alignItems: 'center', gap: 6 },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  kickerMuted: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, marginBottom: -12 },
  pct: { color: T.encre, fontFamily: F.affiche, fontSize: 56, lineHeight: 62 },
  verdict: { color: T.encre, fontSize: 16, textAlign: 'center' },
});
