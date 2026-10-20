import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { selectQuestions } from '../../data/oracleQuestions';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, Heading, Notice, QuestionCard, PassPhone, Field,
  PlayerToken, Ranking, EndActions, T, F,
} from '../../components/game/Legende';

const GAME = 'oracle';
const LETTERS      = 'ABCDEFGHIJKL';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Phases :
// question → handoff_write → writing → reveal → handoff_vote → voting → result → final

export default function OracleGameScreen({ route, navigation }) {
  const { roundCount = 8, playerNames = [], categoryId = 'all' } = route.params || {};

  const [questions]    = useState(() => selectQuestions(roundCount, categoryId));
  const [roundIdx, setRoundIdx]               = useState(0);
  const [phase, setPhase]                     = useState('question');
  const [currentIdx, setCurrentIdx]           = useState(0);
  const [currentInput, setCurrentInput]       = useState('');
  const [answers, setAnswers]                 = useState([]);
  const [shuffled, setShuffled]               = useState([]);
  const [votes, setVotes]                     = useState([]);
  const [scores, setScores]                   = useState(() =>
    Object.fromEntries(playerNames.map(n => [n, 0]))
  );

  const inputRef  = useRef(null);

  const currentQuestion = questions[roundIdx];

  // ── Handlers ────────────────────────────────────────────────────────

  const handleStartWriting = () => {
    setAnswers([]);
    setCurrentIdx(0);
    setCurrentInput('');
    setPhase('handoff_write');
  };

  const handleHandoffWriteConfirm = () => {
    setCurrentInput('');
    setPhase('writing');
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSubmitAnswer = () => {
    const text = currentInput.trim();
    if (!text) return;
    const newAnswers = [...answers, { playerIdx: currentIdx, text }];
    setAnswers(newAnswers);
    setCurrentInput('');

    if (currentIdx + 1 >= playerNames.length) {
      // Tous ont écrit → révéler
      const s = shuffle(newAnswers).map((a, i) => ({ ...a, letter: LETTERS[i] }));
      setShuffled(s);
      setVotes([]);
      setPhase('reveal');
    } else {
      setCurrentIdx(i => i + 1);
      setPhase('handoff_write');
    }
  };

  const handleStartVoting = () => {
    setCurrentIdx(0);
    setVotes([]);
    setPhase('handoff_vote');
  };

  const handleHandoffVoteConfirm = () => {
    setPhase('voting');
  };

  const handleVote = (letter) => {
    const newVotes = [...votes, { voterIdx: currentIdx, letter }];

    if (currentIdx + 1 >= playerNames.length) {
      // Comptage
      const tally = {};
      LETTERS.slice(0, shuffled.length).split('').forEach(l => { tally[l] = 0; });
      newVotes.forEach(v => { tally[v.letter] = (tally[v.letter] || 0) + 1; });
      const maxV   = Math.max(...Object.values(tally));
      const winners = shuffled.filter(a => (tally[a.letter] || 0) === maxV && maxV > 0);

      const newScores = { ...scores };
      winners.forEach(w => {
        const name = playerNames[w.playerIdx];
        newScores[name] = (newScores[name] || 0) + 1;
      });
      setScores(newScores);
      setVotes(newVotes);
      setPhase('result');
    } else {
      setVotes(newVotes);
      setCurrentIdx(i => i + 1);
      setPhase('handoff_vote');
    }
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= questions.length) {
      setPhase('final');
    } else {
      setRoundIdx(i => i + 1);
      setAnswers([]);
      setShuffled([]);
      setVotes([]);
      setCurrentIdx(0);
      setPhase('question');
    }
  };

  // ── Calculs résultat ─────────────────────────────────────────────────

  const tally = {};
  if (phase === 'result') {
    LETTERS.slice(0, shuffled.length).split('').forEach(l => { tally[l] = 0; });
    votes.forEach(v => { tally[v.letter] = (tally[v.letter] || 0) + 1; });
  }
  const maxV = phase === 'result' ? Math.max(...Object.values(tally), 0) : 0;
  const winningLetters = phase === 'result'
    ? Object.entries(tally).filter(([, c]) => c === maxV && maxV > 0).map(([l]) => l)
    : [];

  const quit = () => goBackOrMenu(navigation);
  const top = <GameTopBar game={GAME} onBack={quit} current={roundIdx + 1} total={questions.length} />;
  const one = (label, onPress, disabled) => <ActionBar><PrimaryButton label={label} onPress={onPress} disabled={disabled} /></ActionBar>;
  const Letter = ({ l, on }) => (
    <View style={[s.letter, on && { backgroundColor: T.or, borderColor: T.or }]}>
      <Text style={[s.letterText, on && { color: T.surOr }]}>{l}</Text>
    </View>
  );

  // ── Classement ──
  if (phase === 'final') {
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={questions.length} total={questions.length} />}
        footer={<EndActions navigation={navigation} route={route} game={GAME} scores={scores} />}>
        <Heading kicker="L’Oracle a parlé" title="Le classement" />
        <Ranking players={playerNames} scores={scores} suffix=" pts" />
      </GameScreen>
    );
  }

  // ── Résultat de la manche ──
  if (phase === 'result') {
    const winners = shuffled.filter(a => winningLetters.includes(a.letter));
    return (
      <GameScreen top={top} footer={one(roundIdx + 1 >= questions.length ? 'Voir le classement' : 'Question suivante', handleNextRound)}>
        <Notice tone={winners.length ? 'or' : 'neutre'}
          title={maxV === 0 ? 'Aucun vote, aucun point' : winners.length === 1
            ? `${playerNames[winners[0].playerIdx]} remporte le point`
            : `Égalité : ${winners.map(w => playerNames[w.playerIdx]).join(' et ')}`} />
        <View style={{ gap: 8 }}>
          {shuffled.map((a) => {
            const win = winningLetters.includes(a.letter);
            const n = tally[a.letter] || 0;
            return (
              <View key={a.letter} style={[s.answer, win && { borderColor: T.or, backgroundColor: T.orVoile }]}>
                <View style={s.answerTop}>
                  <Letter l={a.letter} on={win} />
                  <Text style={[s.answerText, win && { color: T.orTexte }]}>{a.text}</Text>
                </View>
                <View style={s.answerBottom}>
                  <Text style={s.meta}>par {playerNames[a.playerIdx]}</Text>
                  <Text style={s.meta}>{n} vote{n !== 1 ? 's' : ''}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </GameScreen>
    );
  }

  // ── Passer le téléphone ──
  if (phase === 'handoff_vote' || phase === 'handoff_write') {
    const vote = phase === 'handoff_vote';
    return (
      <GameScreen top={top} scroll={false} footer={one(`Je suis ${playerNames[currentIdx]}`, vote ? handleHandoffVoteConfirm : handleHandoffWriteConfirm)}>
        <PassPhone game={GAME} name={playerNames[currentIdx]} index={currentIdx} order={playerNames}
          kicker={vote ? 'Au vote' : 'À vous d’écrire'}
          instruction={vote ? 'Votez pour votre réponse préférée.' : 'Écrivez votre réponse en secret.'} />
      </GameScreen>
    );
  }

  // ── Vote ──
  if (phase === 'voting') {
    return (
      <GameScreen top={top}>
        <View style={s.who}>
          <PlayerToken name={playerNames[currentIdx]} index={currentIdx} size={28} />
          <Text style={s.whoText}>{playerNames[currentIdx]} vote</Text>
          <Text style={s.count}>{currentIdx + 1} / {playerNames.length}</Text>
        </View>
        <QuestionCard kicker="La question">{currentQuestion?.text}</QuestionCard>
        <Text style={s.instr}>Votez pour la réponse que vous préférez :</Text>
        <View style={{ gap: 8 }}>
          {shuffled.map((a) => {
            const mine = a.playerIdx === currentIdx;
            return (
              <Pressable key={a.letter} onPress={mine ? undefined : () => handleVote(a.letter)} accessibilityRole="button"
                accessibilityState={{ disabled: mine }} accessibilityLabel={mine ? `Réponse ${a.letter} : la vôtre` : `Voter pour la réponse ${a.letter} : ${a.text}`}
                style={({ pressed }) => [s.answer, s.answerTop, mine && { opacity: 0.45 }, pressed && !mine && { borderColor: T.or }]}>
                <Letter l={a.letter} />
                <Text style={s.answerText}>{mine ? 'Votre réponse' : a.text}</Text>
              </Pressable>
            );
          })}
        </View>
      </GameScreen>
    );
  }

  // ── Réponses révélées ──
  if (phase === 'reveal') {
    return (
      <GameScreen top={top} footer={one('Commencer le vote', handleStartVoting)}>
        <Heading kicker="Révélation" title="Les réponses sont prêtes" sub="Lisez-les à voix haute avant de voter." />
        <QuestionCard kicker="La question">{currentQuestion?.text}</QuestionCard>
        <View style={{ gap: 8 }}>
          {shuffled.map((a) => (
            <View key={a.letter} style={[s.answer, s.answerTop]}>
              <Letter l={a.letter} />
              <Text style={s.answerText}>{a.text}</Text>
            </View>
          ))}
        </View>
      </GameScreen>
    );
  }

  // ── Écriture ──
  if (phase === 'writing') {
    const canSubmit = currentInput.trim().length > 0;
    return (
      <GameScreen top={top} footer={one(currentIdx + 1 >= playerNames.length ? 'Valider et voir les réponses' : 'Valider ma réponse', handleSubmitAnswer, !canSubmit)}>
        <View style={s.who}>
          <PlayerToken name={playerNames[currentIdx]} index={currentIdx} size={28} />
          <Text style={s.whoText}>{playerNames[currentIdx]} écrit</Text>
          <Text style={s.count}>{currentIdx + 1} / {playerNames.length}</Text>
        </View>
        <QuestionCard kicker="La question de l’Oracle">{currentQuestion?.text}</QuestionCard>
        <View style={{ gap: 6 }}>
          <Field ref={inputRef} value={currentInput} onChangeText={setCurrentInput} placeholder="Votre réponse, en secret…"
            multiline maxLength={200} accessibilityLabel="Votre réponse" />
          <Text style={s.chars}>{currentInput.length} / 200</Text>
        </View>
      </GameScreen>
    );
  }

  // ── La question (début de manche) ──
  return (
    <GameScreen top={top} footer={one('Commencer à écrire', handleStartWriting)}>
      <QuestionCard kicker="L’Oracle demande…" footer="Chaque joueur écrit sa réponse en secret, à tour de rôle.">
        {currentQuestion?.text ?? '…'}
      </QuestionCard>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whoText: { flex: 1, color: T.encre, fontSize: 15 },
  count: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 12 },
  instr: { color: T.encreDouce, fontSize: 14 },
  chars: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, textAlign: 'right' },
  answer: { borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.carte, padding: 12, gap: 8 },
  answerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  answerBottom: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 42 },
  answerText: { flex: 1, color: T.encre, fontSize: 16, lineHeight: 22 },
  meta: { color: T.encreDouce, fontSize: 13 },
  letter: { width: 30, height: 30, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort, alignItems: 'center', justifyContent: 'center' },
  letterText: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
});
