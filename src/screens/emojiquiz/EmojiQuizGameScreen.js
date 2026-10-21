import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { EMOJI_QUIZ_ITEMS } from '../../data/emojiQuizData';
import goBackOrMenu from '../../navigation/goBack';
import {
  EndActions, GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Notice, PassPhone, Field,
  AnswerChoice, Ranking, PlayerToken, Icon, T, F,
} from '../../components/game/Legende';

const GAME = 'emojiquiz';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

const CAT_LABEL = {
  film: 'Film', musique: 'Musique', serie: 'Série', personnalite: 'Célébrité', jeu_video: 'Jeu vidéo',
};

export default function EmojiQuizGameScreen({ navigation, route }) {
  const { players, rounds } = route.params;
  const totalQ = rounds.length;

  const [qIndex,         setQIndex]        = useState(0);
  const [phase,          setPhase]         = useState('intro'); // intro | question | mcq | reveal | final
  const [step,           setStep]          = useState(1);
  const [scores,         setScores]        = useState(Array(players.length).fill(0));
  const [inputText,      setInputText]     = useState('');
  const [wasCorrect,     setWasCorrect]    = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const currentPlayer = qIndex % players.length;
  const round = rounds[qIndex];
  const emojis = Array.isArray(round.emojis) ? round.emojis : [round.emojis];
  const feedbackScale = useRef(new Animated.Value(0)).current;
  const quit = () => goBackOrMenu(navigation);

  const animateFeedback = () => {
    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  };

  const propositions = useMemo(() => {
    const correct = round.answer;
    const pool = EMOJI_QUIZ_ITEMS.filter(item => item.category === round.category && item.answer !== correct);
    const distractors = shuffle([...pool]).slice(0, 3).map(item => item.answer);
    return shuffle([correct, ...distractors]);
  }, [qIndex]);

  const handleStartQuestion = () => {
    setPhase('question'); setStep(1); setWasCorrect(null); setSelectedAnswer(null); setInputText('');
  };

  const handleNext = () => {
    if (qIndex + 1 >= totalQ) { setPhase('final'); return; }
    setQIndex(i => i + 1); setStep(1); setPhase('intro'); setWasCorrect(null); setSelectedAnswer(null); setInputText('');
  };

  const nextClue = () => {
    setInputText('');
    if (step < 3) { setStep(s => s + 1); setWasCorrect(null); setPhase('question'); }
    else { setStep(4); setWasCorrect(null); setPhase('mcq'); } // 3e indice raté → propositions
  };

  const handleSubmit = () => {
    if (phase !== 'question' || !inputText.trim()) return;
    const inputNorm = normalize(inputText);
    const correctNorm = normalize(round.answer);
    const lastWord = normalize(round.answer.split(' ').pop());
    const correct = inputNorm === correctNorm || (lastWord.length >= 3 && inputNorm === lastWord);
    setWasCorrect(correct);
    animateFeedback();
    if (correct) {
      const pts = 5 - step; // indice 1 → 4 pts, 2 → 3 pts, 3 → 2 pts
      setScores(prev => { const next = [...prev]; next[currentPlayer] += pts; return next; });
      setTimeout(() => setPhase('reveal'), 900);
    } else {
      setTimeout(nextClue, 900);
    }
  };

  const handleMcqChoice = (answer) => {
    if (phase !== 'mcq' || selectedAnswer !== null) return;
    const correct = answer === round.answer;
    setSelectedAnswer(answer);
    setWasCorrect(correct);
    animateFeedback();
    if (correct) setScores(prev => { const next = [...prev]; next[currentPlayer] += 1; return next; });
    setTimeout(() => setPhase('reveal'), 1000);
  };

  const handleSkip = () => {
    if (phase === 'mcq') { setPhase('reveal'); return; }
    animateFeedback();
    setWasCorrect(false);
    setTimeout(nextClue, 700);
  };

  // ── Classement ──
  if (phase === 'final') {
    const byName = Object.fromEntries(players.map((n, i) => [n, scores[i] || 0]));
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={totalQ} total={totalQ} />}
        footer={<EndActions navigation={navigation} route={route} replay={() => navigation.navigate('EmojiQuizSetup', { replay: Date.now() })} game={GAME} scores={byName} />}>
        <Heading kicker="Partie terminée" title="Le classement" sub="Le Confiseur est fier de vous." />
        <Ranking players={players} scores={byName} suffix=" pts" />
      </GameScreen>
    );
  }

  const top = <GameTopBar game={GAME} onBack={quit} current={qIndex + 1} total={totalQ} />;

  if (phase === 'intro') {
    return (
      <GameScreen top={top} scroll={false} footer={<ActionBar><PrimaryButton label="Je suis prêt" onPress={handleStartQuestion} /></ActionBar>}>
        <PassPhone game={GAME} name={players[currentPlayer]} index={currentPlayer} order={players}
          kicker={`Question ${qIndex + 1} sur ${totalQ}`} instruction="Un emoji à la fois : plus vous trouvez vite, plus vous marquez." />
      </GameScreen>
    );
  }

  const isReveal = phase === 'reveal';
  const isMcq    = phase === 'mcq';
  const shown    = isReveal ? emojis.length : Math.min(step, 3);
  const mcqState = (a) => (selectedAnswer === null ? null : a === round.answer ? 'correct' : a === selectedAnswer ? 'wrong' : 'neutral');

  return (
    <GameScreen top={top} footer={
      isReveal ? (
        <ActionBar><PrimaryButton label={qIndex + 1 >= totalQ ? 'Voir le classement' : 'Question suivante'} onPress={handleNext} /></ActionBar>
      ) : phase === 'question' ? (
        <ActionBar>
          <View style={s.inputRow}>
            <Field style={{ flex: 1 }} placeholder="Votre réponse…" value={inputText} onChangeText={setInputText}
              onSubmitEditing={handleSubmit} returnKeyType="done" autoCorrect={false} autoCapitalize="words" blurOnSubmit={false}
              accessibilityLabel="Votre réponse" />
            <Pressable onPress={inputText.trim() ? handleSubmit : undefined} accessibilityRole="button" accessibilityLabel="Valider"
              style={[s.validate, !inputText.trim() && { opacity: 0.4 }]}>
              <Icon name="check" color={T.surOr} />
            </Pressable>
          </View>
          <TextLink label={step < 3 ? `Indice suivant (${step + 1} sur 3)` : 'Voir les propositions'} color={T.encreDouce} onPress={handleSkip} />
        </ActionBar>
      ) : isMcq && selectedAnswer === null ? (
        <ActionBar><TextLink label="Passer" color={T.encreDouce} onPress={handleSkip} /></ActionBar>
      ) : null
    }>
      <View style={s.head}>
        <PlayerToken name={players[currentPlayer]} index={currentPlayer} size={28} />
        <Text style={s.player}>{players[currentPlayer]}</Text>
        <Text style={s.cat}>{CAT_LABEL[round.category] || ''}</Text>
      </View>

      <View style={s.card}>
        <View style={s.cardInner}>
          <Text style={s.kicker}>{isReveal ? 'LA RÉPONSE' : isMcq ? 'TOUS LES INDICES' : `INDICE ${step} SUR 3`}</Text>
          <View style={s.emojiRow}>
            {emojis.map((emoji, i) => (
              <View key={i} style={[s.slot, i < shown ? s.slotOn : null]}>
                <Text style={i < shown ? s.emoji : s.hidden}>{i < shown ? emoji : '?'}</Text>
              </View>
            ))}
          </View>
          {isReveal ? <Text style={s.answer}>{round.answer}</Text> : null}
          {!isReveal ? (
            <View style={s.dots}>
              {[1, 2, 3, 4].map(k => (
                <View key={k} style={[s.dot, { backgroundColor: k < step ? T.encreDouce : k === step ? T.or : T.trait }]} />
              ))}
            </View>
          ) : null}
        </View>
      </View>

      {wasCorrect !== null && !isReveal && (
        <Animated.View style={{ transform: [{ scale: feedbackScale }] }}>
          <Notice son={wasCorrect ? 'bon' : 'faux'} tone={wasCorrect ? 'or' : 'neutre'}
            title={wasCorrect ? `Bonne réponse · +${isMcq ? 1 : 5 - step} pts` : isMcq ? 'Raté' : step < 3 ? 'Indice suivant…' : 'Place aux propositions…'} />
        </Animated.View>
      )}

      {isMcq && (
        <View style={{ gap: 8 }}>
          <Text style={s.mcqTitle}>Choisissez la bonne réponse (1 point)</Text>
          {propositions.map((answer, i) => (
            <AnswerChoice key={i} index={i} label={answer} state={mcqState(answer)} onPress={() => handleMcqChoice(answer)} disabled={selectedAnswer !== null} />
          ))}
        </View>
      )}

      {isReveal && (
        <>
          <Notice tone={wasCorrect ? 'or' : 'alerte'} title={wasCorrect ? `Bravo ${players[currentPlayer]}` : 'Pas trouvé'} />
          {round.hint ? (
            <View style={s.hintBox}>
              <Text style={s.hintLabel}>LE SAVIEZ-VOUS ?</Text>
              <Text style={s.hintText}>{round.hint}</Text>
            </View>
          ) : null}
        </>
      )}
    </GameScreen>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  player: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  cat: { flex: 1, textAlign: 'right', color: T.encreDouce, fontSize: 13 },
  card: { borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  cardInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', paddingVertical: 24, paddingHorizontal: 12, alignItems: 'center', gap: 16 },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  emojiRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  slot: { width: 78, height: 78, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: T.traitFort, alignItems: 'center', justifyContent: 'center' },
  slotOn: { borderStyle: 'solid', borderColor: T.trait, backgroundColor: T.creux },
  emoji: { fontSize: 44 },
  hidden: { color: T.encreDouce, fontFamily: F.affiche, fontSize: 28 },
  answer: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 26, lineHeight: 32, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 22, height: 4, borderRadius: 2 },
  inputRow: { flexDirection: 'row', gap: 8, width: '100%' },
  validate: { width: 52, height: 52, borderRadius: 999, backgroundColor: T.or, alignItems: 'center', justifyContent: 'center' },
  mcqTitle: { color: T.encreDouce, fontSize: 14, textAlign: 'center' },
  hintBox: { borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 16, gap: 6 },
  hintLabel: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  hintText: { color: T.encre, fontSize: 15, lineHeight: 22 },
});
