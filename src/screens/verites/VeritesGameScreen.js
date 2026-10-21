import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VERITES_PROMPTS, VERITES_HOT_PROMPTS, VERITES_TRES_HOT_PROMPTS, VERITES_HOT_JOKER } from '../../data/veritesVoleesData';
import goBackOrMenu from '../../navigation/goBack';
import { retour } from '../../utils/feedback';
import { tirer } from '../../utils/dejaVu';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, QuestionCard, PassPhone, Heading, Notice,
  PlayerChoice, PlayerGrid, PlayerToken, Ranking, EndActions, Field, AdultTag, T, F,
} from '../../components/game/Legende';

const GAME = 'verites';
const PROMPTS_BY_MODE = {
  classique: VERITES_PROMPTS,
  hot:       VERITES_HOT_PROMPTS,
  tres_hot:  VERITES_TRES_HOT_PROMPTS,
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function VeritesGameScreen({ route, navigation }) {
  const { playerNames, rounds = 3, mode = 'classique' } = route.params;
  const N = playerNames.length;
  const isHot = mode !== 'classique';

  // Une question différente par manche, tirée une fois pour toute la partie
  const [prompts] = useState(() => tirer('verites-' + mode, PROMPTS_BY_MODE[mode] ?? VERITES_PROMPTS, rounds));
  const [roundIdx, setRoundIdx] = useState(0);
  const prompt = prompts[roundIdx];
  const isQuestion = prompt.trim().endsWith('?') || prompt.trim().endsWith('.');

  // write|read|discuss|vote|reveal|final — chaque tour de passage commence masqué (handoff)
  const [phase,    setPhase]    = useState('write');
  const [turnIdx,  setTurnIdx]  = useState(0);
  const [unlocked, setUnlocked] = useState(false); // le joueur a confirmé qu'il tient le téléphone
  const [aloud,    setAloud]    = useState(false); // lecture à voix haute (écran neutre)

  const [currentText, setCurrentText] = useState('');
  const [truths,      setTruths]      = useState([]);   // truths[i] = vérité écrite par i
  const [swapped,     setSwapped]     = useState([]);   // [a, b] : a lit la vérité de b et inversement
  const [selection,   setSelection]   = useState([]);   // suspects choisis par le votant courant
  const [votes,       setVotes]       = useState([]);   // votes[i] = [suspect1, suspect2]
  const [roundPoints, setRoundPoints] = useState({});
  const [scores, setScores] = useState(Object.fromEntries(playerNames.map(n => [n, 0])));

  const readerTruthIdx = (i) => {
    const [a, b] = swapped;
    if (i === a) return b;
    if (i === b) return a;
    return i;
  };

  const nextTurn = (onDone) => {
    setUnlocked(false);
    setAloud(false);
    if (turnIdx + 1 >= N) {
      setTurnIdx(0);
      onDone();
    } else {
      setTurnIdx(t => t + 1);
    }
  };

  const handleSubmitTruth = () => {
    if (!currentText.trim()) return;
    const next = [...truths];
    next[turnIdx] = currentText.trim();
    setTruths(next);
    setCurrentText('');
    nextTurn(() => {
      const [a, b] = shuffle([...Array(N).keys()]);
      setSwapped([a, b]);
      setPhase('read');
    });
  };

  const toggleSuspect = (idx) => {
    retour('vote');
    if (selection.includes(idx)) setSelection(selection.filter(s => s !== idx));
    else if (selection.length < 2) setSelection([...selection, idx]);
  };

  const handleConfirmVote = () => {
    if (selection.length !== 2) return;
    const nextVotes = [...votes];
    nextVotes[turnIdx] = selection;
    setVotes(nextVotes);
    setSelection([]);
    nextTurn(() => {
      // Innocent : +1 par tricheur démasqué. Tricheur : +1 par innocent berné.
      const pts = Object.fromEntries(playerNames.map(n => [n, 0]));
      nextVotes.forEach((sus, v) => {
        if (swapped.includes(v)) return;
        swapped.forEach(liar => {
          if (sus.includes(liar)) pts[playerNames[v]] += 1;
          else pts[playerNames[liar]] += 1;
        });
      });
      setRoundPoints(pts);
      retour('drame');
      setScores(s => Object.fromEntries(playerNames.map(n => [n, (s[n] || 0) + pts[n]])));
      setPhase('reveal');
    });
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= rounds) { setPhase('final'); return; }
    setRoundIdx(r => r + 1);
    setTruths([]); setSwapped([]); setVotes([]); setSelection([]);
    setTurnIdx(0); setUnlocked(false);
    setPhase('write');
  };

  const quit = () => goBackOrMenu(navigation);
  const top = <GameTopBar game={GAME} onBack={quit} current={roundIdx + 1} total={rounds} />;
  const kicker = `Manche ${roundIdx + 1} sur ${rounds}`;
  const one = (label, onPress, disabled) => <ActionBar><PrimaryButton label={label} onPress={onPress} disabled={disabled} /></ActionBar>;

  const handoff = (instruction) => (
    <GameScreen top={top} scroll={false} footer={one(`Je suis ${playerNames[turnIdx]}`, () => setUnlocked(true))}>
      <PassPhone game={GAME} name={playerNames[turnIdx]} index={turnIdx} order={playerNames} kicker={kicker} instruction={instruction} />
    </GameScreen>
  );

  // ── Écrire sa vérité ──
  if (phase === 'write') {
    if (!unlocked) return handoff('Les autres joueurs détournent le regard.');
    return (
      <GameScreen top={top} footer={one('Valider ma vérité', handleSubmitTruth, !currentText.trim())}>
        <View style={s.who}>
          <PlayerToken name={playerNames[turnIdx]} index={turnIdx} size={28} />
          <Text style={s.whoText}>{playerNames[turnIdx]}, dites la vérité</Text>
          {isHot ? <AdultTag /> : null}
        </View>
        <QuestionCard kicker={isQuestion ? 'Répondez en secret' : 'Complétez la phrase'}>{prompt}</QuestionCard>
        <View style={{ gap: 6 }}>
          <Field value={currentText} onChangeText={setCurrentText} placeholder="Votre vérité…" multiline maxLength={160} autoFocus
            accessibilityLabel="Votre vérité" />
          <Text style={s.count}>{currentText.length} / 160</Text>
        </View>
        {isHot ? <Text style={s.small}>Joker : {VERITES_HOT_JOKER}</Text> : null}
      </GameScreen>
    );
  }

  // ── Lire « sa » vérité ──
  if (phase === 'read') {
    if (!unlocked) return handoff('Découvrez votre vérité en secret avant de la lire.');
    const isLiar    = swapped.includes(turnIdx);
    const truthText = truths[readerTruthIdx(turnIdx)];

    if (!aloud) {
      return (
        <GameScreen top={top} footer={one('Lire à voix haute', () => setAloud(true))}>
          {isLiar ? (
            <Notice son="drame" tone="alerte" title="Ce n’est pas votre vérité">
              Le jeu vous l’a échangée. Assumez-la comme si c’était la vôtre et bluffez pour ne pas être démasqué.
            </Notice>
          ) : (
            <Notice tone="neutre" title="C’est bien votre vérité">À vous de trouver les deux joueurs qui mentent.</Notice>
          )}
          <QuestionCard kicker={prompt}>{`« ${truthText} »`}</QuestionCard>
        </GameScreen>
      );
    }

    return (
      <GameScreen top={top} footer={one(turnIdx + 1 < N ? 'Joueur suivant' : 'Place au débat', () => nextTurn(() => setPhase('discuss')))}>
        <Heading kicker={kicker} title={`La vérité de ${playerNames[turnIdx]}`} />
        <QuestionCard kicker={prompt}>{`« ${truthText} »`}</QuestionCard>
      </GameScreen>
    );
  }

  // ── Débat ──
  if (phase === 'discuss') {
    return (
      <GameScreen top={top} footer={one('Passer au vote', () => { setTurnIdx(0); setUnlocked(false); setPhase('vote'); })}>
        <Heading kicker={kicker} title="Qui ment ?" sub="Questionnez-vous, demandez des détails : deux joueurs bluffent." />
        <View style={s.recap}>
          <Text style={s.recapPrompt}>{prompt}</Text>
          {playerNames.map((name, i) => (
            <View key={name} style={s.recapRow}>
              <PlayerToken name={name} index={i} size={28} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.recapName}>{name}</Text>
                <Text style={s.recapText}>« {truths[readerTruthIdx(i)]} »</Text>
              </View>
            </View>
          ))}
        </View>
      </GameScreen>
    );
  }

  // ── Vote secret ──
  if (phase === 'vote') {
    if (!unlocked) return handoff('Votez en secret pour deux suspects.');
    return (
      <GameScreen top={top} footer={one(`Valider mon vote (${selection.length} / 2)`, handleConfirmVote, selection.length !== 2)}>
        <Heading kicker={`${playerNames[turnIdx]} vote`} title="Choisissez deux suspects" sub="Qui a lu une vérité qui n’était pas la sienne ?" />
        <PlayerGrid>
          {playerNames.map((name, idx) => (idx === turnIdx ? null : (
            <PlayerChoice key={idx} name={name} index={idx} selected={selection.includes(idx)} onPress={() => toggleSuspect(idx)} label={`Suspecter ${name}`} />
          )))}
        </PlayerGrid>
      </GameScreen>
    );
  }

  // ── Révélation ──
  if (phase === 'reveal') {
    const [a, b] = swapped;
    const suspicion = playerNames.map((_, i) => votes.filter(v => v.includes(i)).length);
    const ranked = [...playerNames.keys()].sort((x, y) => suspicion[y] - suspicion[x]);
    return (
      <GameScreen top={top} footer={one(roundIdx + 1 >= rounds ? 'Voir le classement' : 'Manche suivante', handleNextRound)}>
        <Heading kicker="Les tricheurs étaient" />
        <View style={s.verdict}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PlayerToken name={playerNames[a]} index={a} size={60} />
            <PlayerToken name={playerNames[b]} index={b} size={60} />
          </View>
          <Text style={s.verdictName}>{playerNames[a]} & {playerNames[b]}</Text>
          <Text style={s.verdictLine}><Text style={s.strong}>{playerNames[a]}</Text> a lu la vérité de {playerNames[b]} : « {truths[b]} »</Text>
          <Text style={s.verdictLine}><Text style={s.strong}>{playerNames[b]}</Text> a lu la vérité de {playerNames[a]} : « {truths[a]} »</Text>
        </View>
        <View style={{ gap: 8 }}>
          {ranked.map(i => {
            const liar = swapped.includes(i);
            return (
              <View key={i} style={s.row}>
                <PlayerToken name={playerNames[i]} index={i} size={28} />
                <Text style={[s.rowName, liar && { color: T.alerte }]} numberOfLines={1}>{playerNames[i]}{liar ? ' · tricheur' : ''}</Text>
                <Text style={s.rowVotes}>{suspicion[i]} vote{suspicion[i] > 1 ? 's' : ''}</Text>
                <Text style={s.rowPts}>+{roundPoints[playerNames[i]] || 0}</Text>
              </View>
            );
          })}
        </View>
      </GameScreen>
    );
  }

  // ── Classement final ──
  return (
    <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={rounds} total={rounds} />}
      footer={<EndActions navigation={navigation} route={route} game={GAME} scores={scores} />}>
      <Heading kicker="Fin de partie" title="Le classement" sub="Qui sait le mieux mentir… et démasquer ?" />
      <Ranking players={playerNames} scores={scores} suffix=" pts" />
    </GameScreen>
  );
}

const s = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whoText: { flex: 1, color: T.encre, fontSize: 15 },
  count: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, textAlign: 'right' },
  small: { color: T.encreDouce, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  recap: { borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 16, gap: 12 },
  recapPrompt: { color: T.orTexte, fontFamily: F.texteFort, fontSize: 14 },
  recapRow: { flexDirection: 'row', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.trait },
  recapName: { color: T.encreDouce, fontFamily: F.texteFort, fontSize: 13 },
  recapText: { color: T.encre, fontSize: 16, lineHeight: 22 },
  verdict: { borderRadius: 18, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 20, alignItems: 'center', gap: 10 },
  verdictName: { color: T.encre, fontFamily: F.affiche, fontSize: 30, lineHeight: 34, textAlign: 'center' },
  verdictLine: { color: T.encreDouce, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  strong: { color: T.encre, fontFamily: F.texteFort },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.trait },
  rowName: { flex: 1, color: T.encre, fontFamily: F.texteMoyen, fontSize: 15 },
  rowVotes: { color: T.encreDouce, fontSize: 13 },
  rowPts: { minWidth: 30, textAlign: 'right', color: T.orTexte, fontFamily: F.chiffre, fontSize: 14 },
});
