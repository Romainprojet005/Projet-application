import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { randomTours, dealCards, START_GLASS, FILL_STEP } from '../../data/verreData';
import goBackOrMenu from '../../navigation/goBack';
import { retour } from '../../utils/feedback';
import VerreTable from './VerreTable';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, TextLink, Heading, Notice, PassPhone,
  PlayerChoice, PlayerGrid, PlayerToken, EndActions, T, F,
} from '../../components/game/Legende';

const GAME = 'verre';

function rotate(arr, start) {
  return arr.map((_, i) => arr[(start + i) % arr.length]);
}

export default function VerreGameScreen({ route, navigation }) {
  const { playerNames, mode = 'classique' } = route.params;
  const n = playerNames.length;
  const isElim = mode === 'battleRoyale';

  // Joueurs encore en lice (indices) et ordre des éliminations (mode Battle Royale)
  const [alive,         setAlive]         = useState(() => [...playerNames.keys()]);
  const [eliminated,    setEliminated]    = useState([]);

  const [mancheIdx,     setMancheIdx]     = useState(1);
  const [toursMax,      setToursMax]      = useState(() => randomTours());
  const [cards,         setCards]         = useState(() => dealCards(n));
  const [glass,         setGlass]         = useState(START_GLASS);
  const [totalSips,     setTotalSips]     = useState(
    Object.fromEntries(playerNames.map(name => [name, 0]))
  );
  const [turnOrder,     setTurnOrder]     = useState(() => rotate([...playerNames.keys()], 0));
  const [turnPos,       setTurnPos]       = useState(0);
  const [passesThisLap, setPassesThisLap] = useState(0);
  const [lapsCompleted, setLapsCompleted] = useState(0);

  const [phase,        setPhase]        = useState('distribute'); // distribute | table | challengeTarget | challengeCall | resolve | drink | revealFinal | final
  const [peekIdx,       setPeekIdx]       = useState(0);
  const [peekRevealed,  setPeekRevealed]  = useState(false);
  const [challengeTarget, setChallengeTarget] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);

  const revealAnim = useRef(new Animated.Value(0)).current;

  const activePlayerIdx = turnOrder[turnPos];
  const activePlayer = playerNames[activePlayerIdx];

  // ── Distribution des cartes ─────────────────────────────────────────
  const handlePeekReveal = () => {
    retour('carte');
    revealAnim.setValue(0);
    Animated.timing(revealAnim, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    setPeekRevealed(true);
  };
  const handlePeekNext = () => {
    if (peekIdx + 1 >= alive.length) {
      setPhase('table');
    } else {
      setPeekIdx(i => i + 1);
      setPeekRevealed(false);
    }
  };

  // ── Actions du tour ──────────────────────────────────────────────────
  const addSips = (playerIdx, amount) => {
    setTotalSips(prev => ({ ...prev, [playerNames[playerIdx]]: prev[playerNames[playerIdx]] + amount }));
  };

  const handleDrinkSelf = () => {
    const amount = glass;
    addSips(activePlayerIdx, amount);
    setPendingResult({ type: 'volontaire', drinkerIdx: activePlayerIdx, amount });
    setPhase('drink');
  };

  // Chaque joueur qui passe remplit le verre d'une gorgée
  const handlePass = () => {
    retour('remplir');
    const nextPasses  = passesThisLap + 1;
    const nextTurnPos = (turnPos + 1) % turnOrder.length;
    const newGlass    = glass + FILL_STEP;

    if (nextTurnPos !== 0) {
      setGlass(newGlass);
      setPassesThisLap(nextPasses);
      setTurnPos(nextTurnPos);
      return;
    }

    // Un tour complet vient de se terminer
    const newLapsCompleted = lapsCompleted + 1;

    if (newLapsCompleted >= toursMax) {
      let minIdx = alive[0];
      for (const i of alive) if (cards[i] < cards[minIdx]) minIdx = i;
      addSips(minIdx, newGlass);
      setGlass(newGlass);
      setPendingResult({ type: 'reveal', cards: [...cards], drinkerIdx: minIdx, amount: newGlass });
      setPhase('revealFinal');
      return;
    }

    setGlass(newGlass);
    setLapsCompleted(newLapsCompleted);
    setPassesThisLap(0);
    setTurnPos(0);
  };

  const openChallenge = () => {
    retour('ouvrir');
    setChallengeTarget(null);
    setPhase('challengeTarget');
  };

  const pickTarget = (targetIdx) => {
    setChallengeTarget(targetIdx);
    setPhase('challengeCall');
  };

  const resolveChallenge = (call) => {
    const challengerIdx = activePlayerIdx;
    const targetIdx = challengeTarget;
    const challengerCard = cards[challengerIdx];
    const targetCard = cards[targetIdx];
    const actual = challengerCard > targetCard ? 'higher' : 'lower';
    const correct = call === actual;
    // Le verre n’est doublé que si le défi est perdu (le challenger s’est trompé)
    const amount = correct ? glass : glass * 2;
    const drinkerIdx = correct ? targetIdx : challengerIdx;
    addSips(drinkerIdx, amount);
    const remaining = isElim ? alive.filter(i => i !== drinkerIdx) : alive;
    if (isElim) {
      setAlive(remaining);
      setEliminated(prev => [...prev, drinkerIdx]);
    }
    setPendingResult({
      type: 'duel', challengerIdx, targetIdx, call, correct, amount,
      challengerCard, targetCard, drinkerIdx, remaining: remaining.length,
    });
    setPhase('resolve');
  };

  const advanceManche = () => {
    const nextManche = mancheIdx + 1;
    setMancheIdx(nextManche);
    setToursMax(randomTours());
    setCards(dealCards(n));
    setGlass(START_GLASS);
    setPassesThisLap(0);
    setLapsCompleted(0);
    setTurnPos(0);
    setTurnOrder(rotate(alive, (nextManche - 1) % alive.length));
    setPeekIdx(0);
    setPeekRevealed(false);
    setChallengeTarget(null);
    setPendingResult(null);
    setPhase('distribute');
  };

  // Battle Royale : après une élimination, la manche continue — chacun garde sa carte
  const continueAfterElim = () => {
    const pos = turnOrder.indexOf(pendingResult.challengerIdx);
    setTurnOrder(rotate(turnOrder, pos + 1).filter(i => alive.includes(i)));
    setTurnPos(0);
    setPassesThisLap(0);
    setChallengeTarget(null);
    setPendingResult(null);
    setPhase('table');
  };

  const endGame = () => setPhase('final');

  const quit = () => goBackOrMenu(navigation);
  const tourLabel = `MANCHE ${mancheIdx} · TOUR ${Math.min(lapsCompleted + 1, toursMax)} SUR ${toursMax}`;
  const top = <GameTopBar game={GAME} onBack={quit} right={<Text style={s.counter}>MANCHE {mancheIdx}</Text>} />;
  const one = (label, onPress) => <ActionBar><PrimaryButton label={label} onPress={onPress} /></ActionBar>;
  const nextOrEnd = (label, onNext) => (
    <ActionBar>
      <PrimaryButton label={label} onPress={onNext} />
      <TextLink label="Terminer la partie" color={T.encreDouce} onPress={endGame} />
    </ActionBar>
  );

  // ── Distribution des cartes secrètes ──
  if (phase === 'distribute') {
    const peekPlayerIdx = alive[peekIdx];
    const peekName = playerNames[peekPlayerIdx];
    if (!peekRevealed) {
      return (
        <GameScreen top={top} scroll={false} footer={one('Voir ma carte', handlePeekReveal)}>
          <PassPhone game={GAME} name={peekName} index={peekPlayerIdx} order={alive.map(i => playerNames[i])}
            kicker={`Manche ${mancheIdx} · ${toursMax} tour${toursMax > 1 ? 's' : ''} max`}
            instruction="Regardez votre carte secrète : les autres joueurs détournent le regard." />
        </GameScreen>
      );
    }
    return (
      <GameScreen top={top} scroll={false} footer={one(peekIdx + 1 >= alive.length ? 'J’ai mémorisé, on commence' : 'Joueur suivant', handlePeekNext)}>
        <View style={s.center}>
          <Animated.View style={[s.secret, { opacity: revealAnim, transform: [{ scale: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
            <View style={s.secretInner}>
              <Text style={s.kicker}>VOTRE CARTE SECRÈTE</Text>
              <Text style={s.secretValue}>{cards[peekPlayerIdx]}</Text>
              <View style={s.rule} />
              <Text style={s.kickerMuted}>SUR 20 · GARDEZ-LA EN TÊTE</Text>
            </View>
          </Animated.View>
          <Text style={s.sub}>{peekName}</Text>
        </View>
      </GameScreen>
    );
  }

  // ── La table ──
  if (phase === 'table') {
    return (
      <GameScreen top={top} footer={<ActionBar><TextLink label="Terminer la partie" color={T.encreDouce} onPress={endGame} /></ActionBar>}>
        <Heading kicker={tourLabel} title={`Au tour de ${activePlayer}`} />
        <VerreTable
          playerNames={playerNames}
          alive={alive}
          activeIdx={activePlayerIdx}
          glass={glass}
          totalSips={totalSips}
          canChallenge={alive.length > 1}
          onChallenge={openChallenge}
          onDrink={handleDrinkSelf}
          onPass={handlePass}
        />
        <Text style={s.hint}>{passesThisLap} joueur{passesThisLap > 1 ? 's' : ''} sur {turnOrder.length} ont passé ce tour-ci.</Text>
        <Text style={s.hint}>
          {isElim
            ? `Perdre un défi = éliminé. Chacun garde sa carte · ${alive.length} joueurs en lice.`
            : 'Boire ou perdre un défi termine la manche : nouvelles cartes ensuite.'}
        </Text>
      </GameScreen>
    );
  }

  // ── Défi : choix de la cible ──
  if (phase === 'challengeTarget') {
    return (
      <GameScreen top={top} footer={<ActionBar><TextLink label="Annuler" color={T.encreDouce} onPress={() => setPhase('table')} /></ActionBar>}>
        <Heading kicker={tourLabel} title={`${activePlayer} défie qui ?`} sub={`Pari gagné : il boit ${glass} gorgée${glass > 1 ? 's' : ''}. Pari perdu : tu bois ${glass * 2} gorgées.`} />
        <PlayerGrid>
          {alive.filter(idx => idx !== activePlayerIdx).map(idx => (
            <PlayerChoice key={idx} name={playerNames[idx]} index={idx} onPress={() => pickTarget(idx)} label={`Défier ${playerNames[idx]}`} />
          ))}
        </PlayerGrid>
      </GameScreen>
    );
  }

  // ── Défi : plus haute / plus basse ──
  if (phase === 'challengeCall') {
    return (
      <GameScreen top={top} footer={<ActionBar><TextLink label="Changer de cible" color={T.encreDouce} onPress={() => setPhase('challengeTarget')} /></ActionBar>}>
        <Heading kicker={`${activePlayer} contre ${playerNames[challengeTarget]}`} title="Votre carte est…" sub={`…plus haute ou plus basse que celle de ${playerNames[challengeTarget]} ?`} />
        <View style={s.callRow}>
          <Pressable onPress={() => resolveChallenge('lower')} accessibilityRole="button" accessibilityLabel="Plus basse"
            style={({ pressed }) => [s.call, pressed && { borderColor: T.or }]}>
            <Text style={s.callArrow}>↓</Text>
            <Text style={s.callText}>Plus basse</Text>
          </Pressable>
          <Pressable onPress={() => resolveChallenge('higher')} accessibilityRole="button" accessibilityLabel="Plus haute"
            style={({ pressed }) => [s.call, pressed && { borderColor: T.or }]}>
            <Text style={s.callArrow}>↑</Text>
            <Text style={s.callText}>Plus haute</Text>
          </Pressable>
        </View>
      </GameScreen>
    );
  }

  // ── Résultat du défi ──
  if (phase === 'resolve' && pendingResult?.type === 'duel') {
    const r = pendingResult;
    const last = isElim && r.remaining <= 1;
    return (
      <GameScreen top={top} footer={last
        ? one('Voir le vainqueur', endGame)
        : nextOrEnd(isElim ? 'Continuer la manche' : 'Manche suivante', isElim ? continueAfterElim : advanceManche)}>
        <Heading kicker={r.correct ? 'Pari réussi' : 'Pari raté'} />
        <View style={s.duel}>
          {[[r.challengerIdx, r.challengerCard], [r.targetIdx, r.targetCard]].map(([idx, val], k) => (
            <React.Fragment key={idx}>
              {k === 1 ? <Text style={s.vs}>VS</Text> : null}
              <View style={[s.duelCard, idx === r.drinkerIdx && { borderColor: T.alerte }]}>
                <Text style={s.duelName} numberOfLines={1}>{playerNames[idx]}</Text>
                <Text style={s.duelValue}>{val}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        <Notice son="boire" tone="alerte" title={`${playerNames[r.drinkerIdx]} boit ${r.amount} gorgée${r.amount > 1 ? 's' : ''}${r.correct ? '' : ' (verre doublé)'}`}>
          {isElim
            ? (last ? `${playerNames[r.drinkerIdx]} est éliminé. Il ne reste plus qu’un joueur…` : `${playerNames[r.drinkerIdx]} est éliminé. ${r.remaining} joueurs en lice : chacun garde sa carte, la manche continue.`)
            : 'La manche se termine : nouvelles cartes.'}
        </Notice>
      </GameScreen>
    );
  }

  // ── Verre bu volontairement ──
  if (phase === 'drink' && pendingResult?.type === 'volontaire') {
    const r = pendingResult;
    return (
      <GameScreen top={top} footer={nextOrEnd('Manche suivante', advanceManche)}>
        <Heading kicker="Verre bu" title={playerNames[r.drinkerIdx]} />
        <Notice son="boire" title={`Boit ${r.amount} gorgée${r.amount > 1 ? 's' : ''}`}>La manche se termine : nouvelles cartes.</Notice>
      </GameScreen>
    );
  }

  // ── Personne n'a bu : les cartes parlent ──
  if (phase === 'revealFinal' && pendingResult?.type === 'reveal') {
    const r = pendingResult;
    return (
      <GameScreen top={top} footer={nextOrEnd('Manche suivante', advanceManche)}>
        <Heading kicker="Révélation" title="Les cartes parlent" sub={`Personne n’a bu en ${toursMax} tour${toursMax > 1 ? 's' : ''}.`} />
        <View style={s.grid}>
          {alive.map(idx => (
            <View key={idx} style={[s.revealCard, idx === r.drinkerIdx && { borderColor: T.alerte, backgroundColor: T.alerteVoile }]}>
              <Text style={s.duelName} numberOfLines={1}>{playerNames[idx]}</Text>
              <Text style={[s.revealValue, idx === r.drinkerIdx && { color: T.alerte }]}>{r.cards[idx]}</Text>
            </View>
          ))}
        </View>
        <Notice son="drame" tone="alerte" title={`${playerNames[r.drinkerIdx]} boit ${r.amount} gorgées`}>Carte la plus basse.</Notice>
      </GameScreen>
    );
  }

  // ── Résultats ──
  // Battle royale : survivants (départagés aux gorgées), puis éliminés du dernier au premier
  const sorted = isElim
    ? [
        ...alive.map(i => playerNames[i]).sort((a, b) => totalSips[a] - totalSips[b]),
        ...[...eliminated].reverse().map(i => playerNames[i]),
      ]
    : [...playerNames].sort((a, b) => totalSips[a] - totalSips[b]);
  const elimWinner = isElim && alive.length === 1 ? playerNames[alive[0]] : null;

  return (
    <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} />} footer={<EndActions navigation={navigation} route={route} game={GAME} scores={totalSips} moinsGagne />}>
      <Heading kicker="Résultats finaux" title={elimWinner ? `${elimWinner}, dernier debout` : `${sorted[0]} l’emporte`}
        sub={`${mancheIdx} manche${mancheIdx > 1 ? 's' : ''} jouée${mancheIdx > 1 ? 's' : ''} · ${isElim ? 'le dernier en lice gagne' : 'moins vous avez bu, mieux c’est'}`} />
      <View style={{ gap: 8 }}>
        {sorted.map((name, i) => {
          const out = isElim && eliminated.includes(playerNames.indexOf(name));
          return (
            <View key={name} style={[s.row, i === 0 && { borderColor: T.or, backgroundColor: T.orVoile }]}>
              <Text style={[s.rank, i === 0 && { color: T.orTexte }]}>{String(i + 1).padStart(2, '0')}</Text>
              <PlayerToken name={name} index={playerNames.indexOf(name)} />
              <Text style={[s.rowName, i === 0 && { color: T.orTexte }]} numberOfLines={1}>{name}{out ? ' · éliminé' : ''}</Text>
              <Text style={s.sips}>{totalSips[name]} gorgée{totalSips[name] > 1 ? 's' : ''}</Text>
            </View>
          );
        })}
      </View>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  counter: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  kickerMuted: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 10, letterSpacing: 2 },
  sub: { color: T.encreDouce, fontSize: 15 },
  secret: { width: 240, borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  secretInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', paddingVertical: 30, alignItems: 'center', gap: 12 },
  secretValue: { color: T.encre, fontFamily: F.affiche, fontSize: 96, lineHeight: 104 },
  rule: { width: 56, height: 1, backgroundColor: 'rgba(212,175,55,0.5)' },
  hint: { color: T.encreDouce, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  callRow: { flexDirection: 'row', gap: 8 },
  call: { flex: 1, minHeight: 140, borderRadius: 14, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.carte, alignItems: 'center', justifyContent: 'center', gap: 6 },
  callArrow: { color: T.orTexte, fontFamily: F.affiche, fontSize: 48, lineHeight: 52 },
  callText: { color: T.encre, fontFamily: F.texteFort, fontSize: 16 },
  duel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vs: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2 },
  duelCard: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 14, alignItems: 'center', gap: 4 },
  duelName: { color: T.encreDouce, fontSize: 14 },
  duelValue: { color: T.encre, fontFamily: F.affiche, fontSize: 48, lineHeight: 54 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  revealCard: { flexBasis: '30%', flexGrow: 1, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 10, alignItems: 'center' },
  revealValue: { color: T.encre, fontFamily: F.affiche, fontSize: 32, lineHeight: 38 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte },
  rank: { width: 24, color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
  rowName: { flex: 1, color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  sips: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
});
