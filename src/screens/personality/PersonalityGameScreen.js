import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Image, Dimensions, Pressable } from 'react-native';
import personalityImages from '../../data/personalityImages';
import goBackOrMenu from '../../navigation/goBack';
import {
  EndActions, GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Notice, Field,
  Ranking, PlayerToken, Icon, T, F,
} from '../../components/game/Legende';

const GAME = 'personality';
const SCREEN = Dimensions.get('window');
const IMG_W = Math.min(360, SCREEN.width - 32);
const IMG_H = Math.min(SCREEN.height * 0.42, 340);

// Normalise pour comparaison (minuscules, sans accents ni ponctuation)
function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}
function maxErrors(len) {
  if (len >= 8) return 2;
  if (len >= 5) return 1;
  return 0;
}

// Flou (filtre CSS) sur le web : 3 niveaux, net à l'étape 4
const blurStyle = (step) => {
  if (Platform.OS !== 'web') return {};
  if (step === 1) return { filter: 'blur(24px)' };
  if (step === 2) return { filter: 'blur(14px)' };
  if (step === 3) return { filter: 'blur(6px)' };
  return {};
};

// Mosaïque : 8 × 12 = 96 cases, 8 de plus révélées à chaque étape
const GRID_COLS = 8;
const GRID_ROWS = 12;
const TILE_W = 100 / GRID_COLS;
const TILE_H = 100 / GRID_ROWS;
const TILES_PER_STEP = 8;

function TilesMask({ revealedTiles, source, imgError }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: T.creux }]} />
      {revealedTiles.map(tileIdx => {
        const col = tileIdx % GRID_COLS;
        const row = Math.floor(tileIdx / GRID_COLS);
        return (
          <View key={tileIdx} style={{
            position: 'absolute', top: `${row * TILE_H}%`, left: `${col * TILE_W}%`,
            width: `${TILE_W}%`, height: `${TILE_H}%`, overflow: 'hidden',
            borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)',
          }}>
            {source && !imgError ? (
              <Image source={source} resizeMode="cover" style={{
                position: 'absolute', top: `${-row * 100}%`, left: `${-col * 100}%`,
                width: `${GRID_COLS * 100}%`, height: `${GRID_ROWS * 100}%`,
              }} />
            ) : <View style={{ flex: 1, backgroundColor: T.fond }} />}
          </View>
        );
      })}
    </View>
  );
}

export default function PersonalityGameScreen({ navigation, route }) {
  const { players, rounds } = route.params;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('playing'); // playing | feedback | reveal | results
  const [wasCorrect, setWasCorrect] = useState(null);
  const [scores, setScores] = useState(Object.fromEntries(players.map((_, i) => [i, 0])));
  const [imgError, setImgError] = useState(false);
  const [inputText, setInputText] = useState('');

  const mode = currentIdx % 2 === 0 ? 'blur' : 'tiles';
  const currentRound = rounds[currentIdx];
  const currentPersonality = currentRound.personality;
  const playerIdx = currentIdx % players.length;
  const currentPlayer = players[playerIdx];
  const feedbackScale = useRef(new Animated.Value(0)).current;
  const quit = () => goBackOrMenu(navigation);

  const animateFeedback = () => {
    feedbackScale.setValue(0);
    Animated.spring(feedbackScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  };

  const goToNext = () => {
    if (currentIdx + 1 >= rounds.length) { setPhase('results'); return; }
    setCurrentIdx(i => i + 1); setStep(1); setPhase('playing'); setWasCorrect(null); setImgError(false); setInputText('');
  };

  const afterMiss = () => {
    setTimeout(() => {
      setInputText('');
      if (step < 4) { setStep(s => s + 1); setPhase('playing'); setWasCorrect(null); }
      else setPhase('reveal');
    }, 1000);
  };

  const handleChoice = (choice) => {
    if (phase !== 'playing') return;
    const correct = choice.id === currentPersonality.id;
    setWasCorrect(correct);
    setPhase('feedback');
    animateFeedback();
    if (correct) {
      const pts = 5 - step; // étape 1 → 4 pts … étape 4 → 1 pt
      setScores(s => ({ ...s, [playerIdx]: (s[playerIdx] || 0) + pts }));
      setTimeout(() => setPhase('reveal'), 900);
    } else afterMiss();
  };

  const handleTextSubmit = () => {
    if (phase !== 'playing' || !inputText.trim()) return;
    const inputNorm = normalize(inputText);
    const correctNorm = normalize(currentPersonality.name);
    const lastWord = normalize(currentPersonality.name.split(' ').pop());
    const correct =
      levenshtein(inputNorm, correctNorm) <= maxErrors(correctNorm.length) ||
      (lastWord.length >= 4 && levenshtein(inputNorm, lastWord) <= maxErrors(lastWord.length));
    handleChoice({ id: correct ? currentPersonality.id : '__wrong__' });
  };

  const handleDontKnow = () => {
    if (phase !== 'playing') return;
    setWasCorrect(false);
    setPhase('feedback');
    animateFeedback();
    afterMiss();
  };

  // ── Résultats ──
  if (phase === 'results') {
    const totalPossible = rounds.length * 3;
    const totalScored = Object.values(scores).reduce((a, b) => a + b, 0);
    const successPct = Math.min(100, Math.round((totalScored / Math.max(totalPossible, 1)) * 100));
    const byName = Object.fromEntries(players.map((n, i) => [n, scores[i] || 0]));
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={rounds.length} total={rounds.length} />}
        footer={<EndActions navigation={navigation} route={route} replay={() => navigation.navigate('PersonalitySetup', { replay: Date.now() })} game={GAME} scores={byName} />}>
        <View style={s.score}>
          <Text style={s.kicker}>FIN DE PARTIE</Text>
          <Text style={s.pct}>{successPct} %</Text>
          <Text style={s.verdict}>
            {successPct >= 70 ? 'Impressionnant : vous connaissez vos célébrités.' : successPct >= 40 ? 'Pas mal, quelques têtes connues.' : 'Les célébrités vous sont restées floues.'}
          </Text>
        </View>
        <Ranking players={players} scores={byName} suffix=" pts" />
      </GameScreen>
    );
  }

  const isReveal = phase === 'reveal';
  const revealedTiles = mode === 'tiles' ? currentRound.tileOrder.slice(0, step * TILES_PER_STEP) : null;
  const img = personalityImages[currentPersonality.id];

  return (
    <GameScreen
      top={<GameTopBar game={GAME} onBack={quit} current={currentIdx + 1} total={rounds.length} />}
      footer={isReveal ? (
        <ActionBar><PrimaryButton label={currentIdx + 1 >= rounds.length ? 'Voir les résultats' : 'Personnalité suivante'} onPress={goToNext} /></ActionBar>
      ) : phase === 'playing' ? (
        <ActionBar>
          <View style={s.inputRow}>
            <Field style={{ flex: 1 }} placeholder="Nom de la célébrité…" value={inputText} onChangeText={setInputText}
              onSubmitEditing={handleTextSubmit} returnKeyType="done" autoCorrect={false} autoCapitalize="words" blurOnSubmit={false}
              accessibilityLabel="Nom de la célébrité" />
            <Pressable onPress={inputText.trim() ? handleTextSubmit : undefined} accessibilityRole="button" accessibilityLabel="Valider"
              style={[s.validate, !inputText.trim() && { opacity: 0.4 }]}>
              <Icon name="check" color={T.surOr} />
            </Pressable>
          </View>
          <TextLink label={step < 4 ? `Indice suivant (${step + 1} sur 4)` : 'Passer'} color={T.encreDouce} onPress={handleDontKnow} />
        </ActionBar>
      ) : null}
    >
      <View style={s.head}>
        <PlayerToken name={currentPlayer} index={playerIdx} size={28} />
        <Text style={s.player}>{currentPlayer}</Text>
        <Text style={s.mode}>{mode === 'blur' ? 'FLOU' : `MOSAÏQUE · ${Math.min(step * TILES_PER_STEP, 96)} / 96`}</Text>
      </View>

      <View style={[s.frame, { width: IMG_W, height: mode === 'tiles' && !isReveal ? Math.min(IMG_H, IMG_W) : IMG_H }]}>
        <View style={s.clip}>
          <View style={[{ flex: 1, overflow: 'hidden' }, !isReveal && mode === 'blur' && blurStyle(step)]}>
            {img && !imgError ? (
              <Image source={img} resizeMode={isReveal ? 'contain' : 'cover'} onError={() => setImgError(true)}
                style={[{ width: '100%', height: '100%' }, Platform.OS === 'web' && { objectPosition: 'top center' }]} />
            ) : (
              <View style={s.fallback}><Text style={s.fallbackText}>Image non disponible</Text></View>
            )}
          </View>
          {!isReveal && mode === 'tiles' && revealedTiles && <TilesMask revealedTiles={revealedTiles} source={img} imgError={imgError} />}
          {!isReveal && (
            <View style={s.dots}>
              {[1, 2, 3, 4].map(k => <View key={k} style={[s.dot, { backgroundColor: k < step ? T.encreDouce : k === step ? T.or : T.trait }]} />)}
            </View>
          )}
        </View>
      </View>

      {phase === 'feedback' && (
        <Animated.View style={{ transform: [{ scale: feedbackScale }] }}>
          <Notice tone={wasCorrect ? 'or' : 'neutre'} title={wasCorrect ? `Bonne réponse · +${5 - step} pts` : step < 4 ? 'Indice suivant…' : 'Raté'} />
        </Animated.View>
      )}

      {isReveal && (
        <Heading kicker={wasCorrect ? `Trouvé par ${currentPlayer}` : 'C’était'} title={currentPersonality.name} sub={currentPersonality.hint} />
      )}
    </GameScreen>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  player: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  mode: { flex: 1, textAlign: 'right', color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 1.6 },
  frame: { alignSelf: 'center', borderRadius: 18, backgroundColor: T.carte, padding: 6 },
  clip: { flex: 1, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', backgroundColor: T.creux },
  fallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: T.encreDouce, fontSize: 13 },
  dots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 22, height: 4, borderRadius: 2 },
  inputRow: { flexDirection: 'row', gap: 8, width: '100%' },
  validate: { width: 52, height: 52, borderRadius: 999, backgroundColor: T.or, alignItems: 'center', justifyContent: 'center' },
  score: { borderRadius: 18, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 20, alignItems: 'center', gap: 6 },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  pct: { color: T.encre, fontFamily: F.affiche, fontSize: 56, lineHeight: 62 },
  verdict: { color: T.encre, fontSize: 16, textAlign: 'center' },
});
