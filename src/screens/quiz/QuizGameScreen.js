import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Notice, PassPhone,
  AnswerChoice, TimeBar, Ranking, PlayerToken, T, F,
} from '../../components/game/Legende';

const GAME = 'quiz';
const TIME_LIMIT = 15;
const POINTS_CORRECT = 100;
const POINTS_SPEED_BONUS = 50;

export default function QuizGameScreen({ navigation, route }) {
  const { players, questions } = route.params;
  const totalQ = questions.length;

  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'question' | 'reveal' | 'final'
  const [selected, setSelected] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [scores, setScores] = useState(Array(players.length).fill(0));
  const [pointsGained, setPointsGained] = useState(0);
  const [imageError, setImageError] = useState(false);
  const questionStartTime = useRef(null);

  const currentPlayer = qIndex % players.length;
  const question = questions[qIndex];
  const quit = () => goBackOrMenu(navigation);

  const handleStartQuestion = () => {
    questionStartTime.current = Date.now();
    setImageError(false);
    setPhase('question');
    setTimerKey((k) => k + 1);
    setSelected(null);
    setPointsGained(0);
  };

  const handleAnswer = (choiceIndex) => {
    if (phase !== 'question') return;
    const elapsed = (Date.now() - questionStartTime.current) / 1000;
    setSelected(choiceIndex);
    setPhase('reveal');
    let pts = 0;
    if (choiceIndex === question.answer) {
      const speedBonus = elapsed < 5 ? POINTS_SPEED_BONUS : elapsed < 10 ? 25 : 0;
      pts = POINTS_CORRECT + speedBonus;
      setScores((prev) => {
        const next = [...prev];
        next[currentPlayer] = (next[currentPlayer] || 0) + pts;
        return next;
      });
    }
    setPointsGained(pts);
  };

  const handleTimeout = () => {
    if (phase !== 'question') return;
    setSelected(-1); // -1 = pas de réponse
    setPhase('reveal');
    setPointsGained(0);
  };

  const handleNext = () => {
    if (qIndex + 1 >= totalQ) setPhase('final');
    else { setQIndex((i) => i + 1); setPhase('intro'); }
  };

  const getChoiceState = (index) => {
    if (phase !== 'reveal') return null;
    if (index === question.answer) return 'correct';
    if (index === selected) return 'wrong';
    return 'neutral';
  };

  // ── Classement final ──
  if (phase === 'final') {
    const byName = Object.fromEntries(players.map((n, i) => [n, scores[i] || 0]));
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={totalQ} total={totalQ} />}
        footer={(
          <ActionBar>
            <PrimaryButton label="Rejouer" onPress={() => navigation.navigate('QuizSetup', { replay: Date.now() })} />
            <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
          </ActionBar>
        )}>
        <Heading kicker="Quiz terminé" title="Le classement" sub="La première de la classe a parlé." />
        <Ranking players={players} scores={byName} suffix=" pts" />
      </GameScreen>
    );
  }

  const top = <GameTopBar game={GAME} onBack={quit} current={qIndex + 1} total={totalQ} />;

  // ── Au tour de… ──
  if (phase === 'intro') {
    return (
      <GameScreen top={top} scroll={false}
        footer={<ActionBar><PrimaryButton label="Je suis prêt" onPress={handleStartQuestion} /></ActionBar>}>
        <PassPhone game={GAME} name={players[currentPlayer]} index={currentPlayer} order={players}
          kicker={`Question ${qIndex + 1} sur ${totalQ}`} instruction={`Prenez le téléphone : vous aurez ${TIME_LIMIT} secondes pour répondre.`}
          extra={(
            <View style={s.scores}>
              {players.map((name, i) => (
                <View key={i} style={[s.scoreChip, i === currentPlayer && { borderColor: T.or }]}>
                  <Text style={s.scoreName}>{name.replace('Joueur ', 'J')}</Text>
                  <Text style={[s.scoreVal, i === currentPlayer && { color: T.orTexte }]}>{scores[i] || 0}</Text>
                </View>
              ))}
            </View>
          )} />
      </GameScreen>
    );
  }

  // ── Question / réponse ──
  const isRevealed = phase === 'reveal';
  const wasCorrect = selected === question.answer;
  const wasTimeout = selected === -1;

  return (
    <GameScreen top={top} footer={isRevealed ? (
      <ActionBar><PrimaryButton label={qIndex + 1 >= totalQ ? 'Voir le classement' : 'Question suivante'} onPress={handleNext} /></ActionBar>
    ) : null}>
      <View style={s.head}>
        <PlayerToken name={players[currentPlayer]} index={currentPlayer} size={28} />
        <Text style={s.player}>{players[currentPlayer]}</Text>
        <Text style={s.cat} numberOfLines={1}>{question.categoryLabel}</Text>
      </View>
      <TimeBar running={phase === 'question'} duration={TIME_LIMIT} onExpire={handleTimeout} resetKey={timerKey} />

      {question.image && !imageError && (
        <View style={s.imageBox}>
          <Image key={qIndex} source={{ uri: question.image }} style={s.image} resizeMode="cover" onError={() => setImageError(true)} />
        </View>
      )}
      <Text style={s.question}>{question.q}</Text>

      <View style={{ gap: 8 }}>
        {question.choices.map((choice, i) => (
          <AnswerChoice key={i} index={i} label={choice} state={getChoiceState(i)} onPress={() => handleAnswer(i)} disabled={isRevealed} />
        ))}
      </View>

      {isRevealed && (
        <>
          <Notice tone={wasCorrect ? 'or' : 'alerte'}
            title={wasTimeout ? 'Temps écoulé' : wasCorrect ? `Bravo ${players[currentPlayer]} · +${pointsGained} pts` : 'Pas tout à fait'}>
            {pointsGained > POINTS_CORRECT ? 'Bonus de rapidité inclus.' : null}
          </Notice>
          {question.anecdote ? (
            <View style={s.anecdote}>
              <Text style={s.anecdoteLabel}>LE SAVIEZ-VOUS ?</Text>
              <Text style={s.anecdoteText}>{question.anecdote}</Text>
            </View>
          ) : null}
        </>
      )}
    </GameScreen>
  );
}

const s = StyleSheet.create({
  scores: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 8 },
  scoreChip: { flexDirection: 'row', gap: 6, alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: T.trait },
  scoreName: { color: T.encreDouce, fontSize: 13 },
  scoreVal: { color: T.encre, fontFamily: F.chiffre, fontSize: 13 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  player: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  cat: { flex: 1, textAlign: 'right', color: T.encreDouce, fontSize: 13 },
  imageBox: { borderRadius: 14, overflow: 'hidden', backgroundColor: T.creux, alignSelf: 'center', width: '100%', maxWidth: 320, aspectRatio: 1 },
  image: { width: '100%', height: '100%' },
  question: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 24, lineHeight: 31, textAlign: 'center' },
  anecdote: { borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 16, gap: 6 },
  anecdoteLabel: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  anecdoteText: { color: T.encre, fontSize: 15, lineHeight: 22 },
});
