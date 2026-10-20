import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { ANSWERS, initCards } from '../../data/blancMangerData';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, QuestionCard, PassPhone, Field, Ranking, T, F,
} from '../../components/game/Legende';

const GAME = 'blanc_manger';

export default function BlancGameScreen({ navigation, route }) {
  const { players, category, totalRounds, questions } = route.params;

  const answers = useMemo(() =>
    ANSWERS.filter(a => !a.adulte || category === 'adulte'),
  []);

  const answerMap = useMemo(() =>
    Object.fromEntries(answers.map(a => [a.id, a.text])),
  [answers]);

  const [phase, setPhase]           = useState('question');
  const [round, setRound]           = useState(0);
  const [judgeIdx, setJudgeIdx]     = useState(0);
  const [pickerStep, setPickerStep] = useState(0);
  const [gameCards, setGameCards]   = useState(() => initCards(players.length, answers));
  const [submissions, setSubmissions]     = useState({});
  const [selectedCard, setSelectedCard]   = useState(null);
  const [judgeSelected, setJudgeSelected] = useState(null);
  const [winnerIdx, setWinnerIdx]         = useState(null);
  const [shuffledSubs, setShuffledSubs]   = useState([]);
  const [scores, setScores] = useState(
    Object.fromEntries(players.map((_, i) => [i, 0]))
  );
  const [customAnswers, setCustomAnswers] = useState({});
  const [rareDraft, setRareDraft]         = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const pickers = players.map((_, i) => i).filter(i => i !== judgeIdx);
  const currentQuestion = questions[round];
  const rareSet = useMemo(() => new Set(answers.filter(a => a.rare).map(a => a.id)), [answers]);
  const getAnswerText = (id) => customAnswers[id] || answerMap[id];

  const go = (callback) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    });
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStartPicking = () => go(() => { setPickerStep(0); setPhase('picker_lock'); });

  const handlePickerLockOK = () => go(() => { setSelectedCard(null); setPhase('picker_active'); });

  const handleCardSelect = (id) => setSelectedCard(id);

  const handlePickerSubmit = () => {
    if (selectedCard === null) return;
    if (rareSet.has(selectedCard) && !rareDraft.trim()) return;
    const playerIdx = pickers[pickerStep];

    if (rareSet.has(selectedCard)) {
      setCustomAnswers(prev => ({ ...prev, [selectedCard]: rareDraft.trim() }));
    }

    setGameCards(prev => {
      const newHand = prev.hands[playerIdx].filter(id => id !== selectedCard);
      const newDeck = [...prev.deck];
      if (newDeck.length > 0) newHand.push(newDeck.shift());
      return { hands: { ...prev.hands, [playerIdx]: newHand }, deck: newDeck };
    });
    setSubmissions(prev => ({ ...prev, [playerIdx]: selectedCard }));

    go(() => {
      setRareDraft('');
      if (pickerStep < pickers.length - 1) {
        setPickerStep(s => s + 1);
        setSelectedCard(null);
        setPhase('picker_lock');
      } else {
        setPhase('judge_lock');
      }
    });
  };

  const handleJudgeLockOK = () => {
    const subs = pickers.map(pi => ({ playerIdx: pi, cardId: submissions[pi] }));
    setShuffledSubs([...subs].sort(() => Math.random() - 0.5));
    setJudgeSelected(null);
    go(() => setPhase('judge_active'));
  };

  const handleJudgePickCard = (id) => setJudgeSelected(id);

  const handleJudgeConfirm = () => {
    if (judgeSelected === null) return;
    const winner = shuffledSubs.find(s => s.cardId === judgeSelected);
    const wIdx = winner.playerIdx;
    setWinnerIdx(wIdx);
    setScores(prev => ({ ...prev, [wIdx]: (prev[wIdx] || 0) + 1 }));
    go(() => setPhase('reveal'));
  };

  const handleNextRound = () => {
    if (round + 1 >= totalRounds) { go(() => setPhase('results')); return; }
    const nextJudge = (judgeIdx + 1) % players.length;
    go(() => {
      setRound(r => r + 1);
      setJudgeIdx(nextJudge);
      setPickerStep(0);
      setSubmissions({});
      setSelectedCard(null);
      setJudgeSelected(null);
      setWinnerIdx(null);
      setShuffledSubs([]);
      setPhase('question');
    });
  };

  const quit = () => goBackOrMenu(navigation);
  const one = (label, onPress, disabled) => <ActionBar><PrimaryButton label={label} onPress={onPress} disabled={disabled} /></ActionBar>;

  // ── Classement ──
  if (phase === 'results') {
    const byName = Object.fromEntries(players.map((n, i) => [n, scores[i] || 0]));
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={totalRounds} total={totalRounds} />}
        footer={(
          <ActionBar>
            <PrimaryButton label="Rejouer" onPress={() => navigation.navigate('BlancSetup', { replay: Date.now() })} />
            <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
          </ActionBar>
        )}>
        <Heading kicker="Fin de partie" title="Le classement" sub="Qui a fait le plus rire le jury ?" />
        <Ranking players={players} scores={byName} suffix=" pts" />
      </GameScreen>
    );
  }

  const parts = currentQuestion.split('___');
  const Sentence = ({ fill }) => (
    <QuestionCard kicker={`Phrase à trou · tour ${round + 1}`}>
      <Text style={s.sentence}>
        {parts[0]}
        <Text style={fill ? s.fill : s.blank}>{fill ? ` ${fill} ` : ' ________ '}</Text>
        {parts[1] || ''}
      </Text>
    </QuestionCard>
  );
  const top = (
    <GameTopBar game={GAME} onBack={quit} current={round + 1} total={totalRounds}
      right={<Text style={s.judgeTag} numberOfLines={1}>JURY · {players[judgeIdx].toUpperCase()}</Text>} />
  );

  let body = null;
  let footer = null;
  let scroll = true;

  if (phase === 'question') {
    footer = one('Lancez vos réponses', handleStartPicking);
    body = (
      <>
        <Sentence />
        <Text style={s.instr}>{players[judgeIdx]}, lisez la phrase à voix haute. Tout le monde écoute avant de choisir sa réponse.</Text>
      </>
    );
  } else if (phase === 'picker_lock') {
    const pi = pickers[pickerStep];
    scroll = false;
    footer = one(`Je suis ${players[pi]}`, handlePickerLockOK);
    body = <PassPhone game={GAME} name={players[pi]} index={pi} kicker={`Carte ${pickerStep + 1} sur ${pickers.length}`} instruction="Choisissez votre carte en secret : les autres joueurs détournent le regard." />;
  } else if (phase === 'picker_active') {
    const playerIdx = pickers[pickerStep];
    const hand = gameCards.hands[playerIdx] || [];
    const selectedIsRare = selectedCard !== null && rareSet.has(selectedCard);
    const canSubmit = selectedCard !== null && (!selectedIsRare || rareDraft.trim().length > 0);
    footer = one(selectedIsRare ? 'Jouer ma réponse' : 'Choisir cette carte', handlePickerSubmit, !canSubmit);
    body = (
      <>
        <Sentence />
        <Heading kicker={`${players[playerIdx]} choisit`} sub="Laquelle fera le plus rire le jury ?" />
        <View style={s.grid}>
          {hand.map(cardId => {
            const isRare = rareSet.has(cardId);
            const on = selectedCard === cardId;
            return (
              <Pressable key={cardId} onPress={() => { handleCardSelect(cardId); if (!isRare) setRareDraft(''); }}
                accessibilityRole="button" accessibilityState={{ selected: on }}
                accessibilityLabel={isRare ? 'Carte rare : écrivez votre propre réponse' : answerMap[cardId]}
                style={[s.card, isRare && s.cardRare, on && s.cardOn]}>
                {isRare ? (
                  <>
                    <Text style={s.rareKicker}>CARTE RARE</Text>
                    <Text style={[s.cardText, { color: T.encre }]}>Écrivez votre propre réponse</Text>
                  </>
                ) : <Text style={[s.cardText, on && { color: T.orTexte }]}>{answerMap[cardId]}</Text>}
              </Pressable>
            );
          })}
        </View>
        {selectedIsRare && (
          <Field value={rareDraft} onChangeText={setRareDraft} placeholder="Votre réponse la plus drôle…" multiline autoFocus
            accessibilityLabel="Votre réponse libre" />
        )}
      </>
    );
  } else if (phase === 'judge_lock') {
    scroll = false;
    footer = one('Voir les réponses', handleJudgeLockOK);
    body = <PassPhone game={GAME} name={players[judgeIdx]} index={judgeIdx} kicker="Le jury" instruction="Tout le monde a choisi : reprenez le téléphone et désignez la réponse la plus drôle." />;
  } else if (phase === 'judge_active') {
    footer = one('Couronner cette réponse', handleJudgeConfirm, judgeSelected === null);
    body = (
      <>
        <Sentence />
        <Heading kicker={`${players[judgeIdx]} juge`} sub="Lisez les réponses à voix haute, puis touchez votre préférée." />
        <View style={s.grid}>
          {shuffledSubs.map(({ cardId }) => {
            const on = judgeSelected === cardId;
            return (
              <Pressable key={cardId} onPress={() => handleJudgePickCard(cardId)} accessibilityRole="button" accessibilityState={{ selected: on }}
                accessibilityLabel={getAnswerText(cardId)} style={[s.card, on && s.cardOn]}>
                <Text style={[s.cardText, on && { color: T.orTexte }]}>{getAnswerText(cardId)}</Text>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  } else if (phase === 'reveal') {
    const winnerName = players[winnerIdx];
    const winnerText = getAnswerText(submissions[winnerIdx]);
    const byName = Object.fromEntries(players.map((n, i) => [n, scores[i] || 0]));
    footer = one(round + 1 >= totalRounds ? 'Voir les résultats' : 'Tour suivant', handleNextRound);
    body = (
      <>
        <Heading kicker="Le jury a tranché" title={`${winnerName} gagne ce tour`} />
        <Sentence fill={winnerText} />
        <Ranking players={players} scores={byName} suffix=" pts" />
      </>
    );
  }

  return (
    <GameScreen top={top} footer={footer} scroll={scroll}>
      <Animated.View style={{ opacity: fadeAnim, gap: 22, flex: scroll ? undefined : 1 }}>{body}</Animated.View>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  judgeTag: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 1.4, maxWidth: 110 },
  sentence: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 24, lineHeight: 32, textAlign: 'center' },
  blank: { color: T.encreDouce },
  fill: { color: T.orTexte },
  instr: { color: T.encreDouce, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { flexBasis: '47%', flexGrow: 1, minHeight: 92, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.encre, padding: 12, justifyContent: 'center', gap: 4 },
  cardRare: { backgroundColor: T.carte, borderStyle: 'dashed', borderColor: T.or },
  cardOn: { borderColor: T.or, borderWidth: 2, backgroundColor: T.orVoile },
  cardText: { color: T.fond, fontFamily: F.texteFort, fontSize: 15, lineHeight: 20 },
  rareKicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 2 },
});
