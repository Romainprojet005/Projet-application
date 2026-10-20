import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import goBackOrMenu from '../../navigation/goBack';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, Heading, QuestionCard, PassPhone, Field,
  PlayerChoice, PlayerGrid, PlayerToken, Ranking, EndActions, T, F,
} from '../../components/game/Legende';

const GAME = 'confessions';

const PROMPTS = [
  "J'ai une fois fait semblant de…",
  "Mon secret le plus honteux est…",
  "J'ai déjà menti à propos de…",
  "Je n'ai jamais avoué que…",
  "La chose la plus folle que j'aie faite est…",
];

export default function ConfessionsGameScreen({ route, navigation }) {
  const { playerNames } = route.params;
  const N = playerNames.length;

  // Collect phase
  const [collectorIdx,  setCollectorIdx]  = useState(0);
  const [currentText,   setCurrentText]   = useState('');
  const [confessions,   setConfessions]   = useState([]); // [{authorIdx, text}]

  // Vote phase
  const [confessionIdx,    setConfessionIdx]    = useState(0);
  const [voterIdx,         setVoterIdx]         = useState(0);
  const [currentVotes,     setCurrentVotes]     = useState([]); // [guessedAuthorIdx per voter]
  const [frozenVotes,      setFrozenVotes]      = useState(null); // locked when reveal starts

  // Scores
  const [scores, setScores] = useState(Object.fromEntries(playerNames.map(n => [n, 0])));

  // Phase
  const [phase, setPhase] = useState('collect'); // collect|vote|reveal|final

  const revealAnim = useRef(new Animated.Value(0)).current;
  // Tirée une seule fois : tous les joueurs répondent à la même question
  const [prompt]   = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  // ── COLLECT ───────────────────────────────────────────────────────────
  const handleSubmitConfession = () => {
    if (!currentText.trim()) return;
    const next = [...confessions, { authorIdx: collectorIdx, text: currentText.trim() }];
    setConfessions(next);
    setCurrentText('');

    if (collectorIdx + 1 >= N) {
      setConfessionIdx(0);
      setVoterIdx(0);
      setCurrentVotes([]);
      setFrozenVotes(null);
      setPhase('vote');
    } else {
      setCollectorIdx(c => c + 1);
    }
  };

  // ── VOTE ──────────────────────────────────────────────────────────────
  const handleVote = (guessIdx) => {
    const newVotes = [...currentVotes, guessIdx];
    setCurrentVotes(newVotes);

    if (voterIdx + 1 >= N) {
      // All voted — lock votes and reveal
      setFrozenVotes(newVotes);
      setVoterIdx(v => v + 1);
      revealAnim.setValue(0);
      Animated.spring(revealAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }).start();
      setPhase('reveal');
    } else {
      setVoterIdx(v => v + 1);
    }
  };

  // ── REVEAL ────────────────────────────────────────────────────────────
  const handleNext = () => {
    const confession = confessions[confessionIdx];
    const authorIdx  = confession.authorIdx;
    const votes      = frozenVotes || currentVotes;

    const newScores = { ...scores };
    votes.forEach((guessIdx, vIdx) => {
      if (vIdx === authorIdx) return; // author's own vote doesn't count
      if (guessIdx === authorIdx) {
        newScores[playerNames[vIdx]] = (newScores[playerNames[vIdx]] || 0) + 2;
      } else {
        newScores[playerNames[authorIdx]] = (newScores[playerNames[authorIdx]] || 0) + 1;
      }
    });
    setScores(newScores);

    if (confessionIdx + 1 >= confessions.length) {
      setPhase('final');
    } else {
      setConfessionIdx(i => i + 1);
      setVoterIdx(0);
      setCurrentVotes([]);
      setFrozenVotes(null);
      revealAnim.setValue(0);
      setPhase('vote');
    }
  };

  // Écran « Passez le téléphone » avant chaque saisie et chaque vote secrets
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(false); }, [collectorIdx, voterIdx, phase]);

  const quit = () => goBackOrMenu(navigation);
  const one = (label, onPress, disabled) => <ActionBar><PrimaryButton label={label} onPress={onPress} disabled={disabled} /></ActionBar>;

  // ── Écrire sa confession ──
  if (phase === 'collect') {
    const playerName = playerNames[collectorIdx];
    const top = <GameTopBar game={GAME} onBack={quit} current={collectorIdx + 1} total={N} />;
    if (!ready) {
      return (
        <GameScreen top={top} scroll={false} footer={one(`Je suis ${playerName}`, () => setReady(true))}>
          <PassPhone game={GAME} name={playerName} index={collectorIdx} order={playerNames} kicker="Confession secrète" />
        </GameScreen>
      );
    }
    return (
      <GameScreen top={top} footer={one(collectorIdx + 1 < N ? 'Valider ma confession' : 'Terminer la collecte', handleSubmitConfession, !currentText.trim())}>
        <View style={s.who}>
          <PlayerToken name={playerName} index={collectorIdx} size={28} />
          <Text style={s.whoText}>{playerName}, en secret</Text>
        </View>
        <QuestionCard kicker="Complétez la phrase">{prompt}</QuestionCard>
        <View style={{ gap: 6 }}>
          <Field value={currentText} onChangeText={setCurrentText} placeholder={prompt} multiline maxLength={200} autoFocus
            accessibilityLabel="Votre confession" />
          <Text style={s.chars}>{currentText.length} / 200</Text>
        </View>
      </GameScreen>
    );
  }

  const confession = confessions[confessionIdx];
  const top = <GameTopBar game={GAME} onBack={quit} current={confessionIdx + 1} total={confessions.length} />;

  // ── Vote ──
  if (phase === 'vote') {
    const voterName = playerNames[voterIdx];
    if (!ready) {
      return (
        <GameScreen top={top} scroll={false} footer={one(`Je suis ${voterName}`, () => setReady(true))}>
          <PassPhone game={GAME} name={voterName} index={voterIdx} order={playerNames} kicker={`Confession ${confessionIdx + 1} sur ${confessions.length}`}
            instruction="Votez en secret : les autres joueurs détournent le regard." />
        </GameScreen>
      );
    }
    return (
      <GameScreen top={top}>
        <QuestionCard kicker="Confession anonyme">{`« ${confession.text} »`}</QuestionCard>
        <Heading kicker={`${voterName} vote`} title="Qui l’a écrite ?" />
        <PlayerGrid>
          {playerNames.map((name, idx) => (
            <PlayerChoice key={idx} name={name} index={idx} onPress={() => handleVote(idx)} label={`Désigner ${name}`} />
          ))}
        </PlayerGrid>
      </GameScreen>
    );
  }

  // ── Révélation ──
  if (phase === 'reveal') {
    const authorIdx  = confession.authorIdx;
    const authorName = playerNames[authorIdx];
    const votes      = frozenVotes || currentVotes;
    const results = votes
      .map((guessIdx, vIdx) => ({ name: playerNames[vIdx], idx: vIdx, correct: guessIdx === authorIdx, isAuthor: vIdx === authorIdx }))
      .filter(r => !r.isAuthor);
    const fooled = results.filter(r => !r.correct).length;
    return (
      <GameScreen top={top} footer={one(confessionIdx + 1 >= confessions.length ? 'Voir le classement' : 'Confession suivante', handleNext)}>
        <QuestionCard kicker="La confession">{`« ${confession.text} »`}</QuestionCard>
        <Animated.View style={[s.author, { opacity: revealAnim, transform: [{ scale: revealAnim }] }]}>
          <Text style={s.kicker}>L’AUTEUR EST</Text>
          <PlayerToken name={authorName} index={authorIdx} size={60} />
          <Text style={s.authorName}>{authorName}</Text>
          {fooled > 0 ? <Text style={s.authorSub}>A trompé {fooled} joueur{fooled > 1 ? 's' : ''} · +{fooled} pt{fooled > 1 ? 's' : ''}</Text> : null}
        </Animated.View>
        <View style={{ gap: 8 }}>
          {results.map((r) => (
            <View key={r.idx} style={s.row}>
              <PlayerToken name={r.name} index={r.idx} size={28} />
              <Text style={s.rowName}>{r.name}</Text>
              <Text style={[s.rowRes, { color: r.correct ? '#4FD8A4' : T.encreDouce }]}>{r.correct ? 'Trouvé · +2' : 'Trompé'}</Text>
            </View>
          ))}
        </View>
      </GameScreen>
    );
  }

  // ── Classement ──
  return (
    <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={confessions.length} total={confessions.length} />}
      footer={<EndActions navigation={navigation} route={route} game={GAME} scores={scores} />}>
      <Heading kicker="Fin de partie" title="Le classement" sub="Qui a le mieux gardé ses secrets ?" />
      <Ranking players={playerNames} scores={scores} suffix=" pts" />
    </GameScreen>
  );
}

const s = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whoText: { color: T.encre, fontSize: 15 },
  chars: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, textAlign: 'right' },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  author: { borderRadius: 18, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 20, alignItems: 'center', gap: 10 },
  authorName: { color: T.encre, fontFamily: F.affiche, fontSize: 32, lineHeight: 36 },
  authorSub: { color: T.encreDouce, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte },
  rowName: { flex: 1, color: T.encre, fontFamily: F.texteMoyen, fontSize: 15 },
  rowRes: { fontFamily: F.chiffre, fontSize: 13 },
});
