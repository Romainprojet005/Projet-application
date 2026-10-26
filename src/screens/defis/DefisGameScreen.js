import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as D_FR from '../../data/defisData';
import * as D_EN from '../../data/defisDataEn';
import { t, IS_EN } from '../../i18n';
import sansEmoji from '../../utils/sansEmoji';
import goBackOrMenu from '../../navigation/goBack';
import { retour } from '../../utils/feedback';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, SecondaryButton, Heading, Notice, QuestionCard,
  PlayerToken, Ranking, EndActions, AdultTag, T, F,
} from '../../components/game/Legende';

const GAME = 'defis';
const { DEFI_CATEGORIES, pickDefi, pickConsequence } = IS_EN ? D_EN : D_FR;

export default function DefisGameScreen({ route, navigation }) {
  const { roundCount, playerNames, activeCategories } = route.params;

  const [round,             setRound]             = useState(0);
  const [phase,             setPhase]             = useState('spin');
  const [displayedName,     setDisplayedName]     = useState(playerNames[0]);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);
  const [currentChallenge,  setCurrentChallenge]  = useState(null);
  const [currentConsequence,setCurrentConsequence]= useState('');
  const [playerStats,       setPlayerStats]       = useState(
    Object.fromEntries(playerNames.map(n => [n, { completed: 0, refused: 0 }]))
  );

  const cardAnim      = useRef(new Animated.Value(0)).current;
  const spinTimeout   = useRef(null);
  const mountedRef    = useRef(true);

  useEffect(() => {
    // Le web peut monter l'écran deux fois : sans cette remise à true, le nettoyage du
    // premier montage laissait la roue bloquée sur « Sélection en cours… ».
    mountedRef.current = true;
    startSpin();
    return () => {
      mountedRef.current = false;
      clearTimeout(spinTimeout.current);
    };
  }, []);

  const startSpin = () => {
    cardAnim.setValue(0);
    setPhase('spin');

    let ticks = 0;
    const maxTicks = 22;

    const tick = (delay) => {
      if (!mountedRef.current) return;
      setDisplayedName(playerNames[Math.floor(Math.random() * playerNames.length)]);
      retour('roue');
      ticks++;
      if (ticks < maxTicks) {
        spinTimeout.current = setTimeout(() => tick(Math.min(delay * 1.18, 380)), delay);
      } else {
        const finalIdx = Math.floor(Math.random() * playerNames.length);
        setSelectedPlayerIdx(finalIdx);
        setDisplayedName(playerNames[finalIdx]);
        const challenge = pickDefi(activeCategories);
        setCurrentChallenge(challenge);
        spinTimeout.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setPhase('challenge');
          retour('tire');
          Animated.spring(cardAnim, { toValue: 1, tension: 45, friction: 9, useNativeDriver: true }).start();
        }, 450);
      }
    };

    tick(60);
  };

  const handleComplete = () => {
    retour('bon');
    const name = playerNames[selectedPlayerIdx];
    setPlayerStats(prev => ({ ...prev, [name]: { ...prev[name], completed: prev[name].completed + 1 } }));
    advanceRound();
  };

  const handleRefuse = () => {
    const name = playerNames[selectedPlayerIdx];
    setPlayerStats(prev => ({ ...prev, [name]: { ...prev[name], refused: prev[name].refused + 1 } }));
    setCurrentConsequence(pickConsequence());
    setPhase('consequence');
  };

  const advanceRound = () => {
    if (round + 1 >= roundCount) {
      setRound(r => r + 1);
      setPhase('final');
    } else {
      setRound(r => r + 1);
      setTimeout(() => { if (mountedRef.current) startSpin(); }, 300);
    }
  };

  const catInfo = currentChallenge
    ? DEFI_CATEGORIES.find(c => c.id === currentChallenge.cat)
    : null;

  const quit = () => goBackOrMenu(navigation);
  const top = <GameTopBar game={GAME} onBack={quit} current={Math.min(round + 1, roundCount)} total={roundCount} />;
  const selIdx = selectedPlayerIdx;

  // ── La roue tourne ──
  if (phase === 'spin') {
    const idx = playerNames.indexOf(displayedName);
    return (
      <GameScreen top={top} scroll={false}>
        <View style={s.center}>
          <Text style={s.kicker}>{t('DÉFI', 'DARE')} {round + 1} {t('SUR', 'OF')} {roundCount}</Text>
          <View style={s.spin}>
            <View style={s.spinInner}>
              <PlayerToken name={displayedName} index={idx < 0 ? 0 : idx} size={88} />
              <Text style={s.spinName} numberOfLines={1}>{displayedName}</Text>
              <View style={s.rule} />
              <Text style={s.kicker}>{t('SÉLECTION EN COURS…', 'PICKING A PLAYER…')}</Text>
            </View>
          </View>
        </View>
      </GameScreen>
    );
  }

  // ── Le défi ──
  if (phase === 'challenge') {
    return (
      <GameScreen top={top} footer={(
        <ActionBar>
          <View style={s.duo}>
            <SecondaryButton label={t('Refuser', 'Refuse')} onPress={handleRefuse} style={{ flex: 1, width: 'auto' }} />
            <PrimaryButton label={t('Défi réussi', 'Dare done')} onPress={handleComplete} style={{ flex: 1.4, width: 'auto' }} />
          </View>
        </ActionBar>
      )}>
        <View style={s.who}>
          <PlayerToken name={playerNames[selIdx]} index={selIdx} size={36} />
          <Text style={s.whoText}>{playerNames[selIdx]}</Text>
          {catInfo ? (
            <View style={s.cat}>
              <Text style={s.catText}>{sansEmoji(catInfo.name)}</Text>
              {catInfo.explicit ? <AdultTag /> : null}
            </View>
          ) : null}
        </View>
        <Animated.View style={{ opacity: cardAnim, transform: [{ scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }}>
          <QuestionCard kicker={t('Votre défi', 'Your dare')} footer={catInfo?.joker ? `Joker : ${catInfo.joker}` : null}>{currentChallenge?.text}</QuestionCard>
        </Animated.View>
      </GameScreen>
    );
  }

  // ── Conséquence ──
  if (phase === 'consequence') {
    return (
      <GameScreen top={top} footer={<ActionBar><PrimaryButton label={round + 1 >= roundCount ? t('Voir les résultats', 'See the results') : t('Défi suivant', 'Next dare')} onPress={advanceRound} /></ActionBar>}>
        <Heading kicker={t('Défi refusé', 'Dare refused')} title={playerNames[selIdx]} />
        <Notice son="faux" tone="alerte" title={t('Conséquence', 'Consequence')}>{currentConsequence}</Notice>
      </GameScreen>
    );
  }

  // ── Résultats ──
  const totalCompleted = Object.values(playerStats).reduce((sum, v) => sum + v.completed, 0);
  const totalRefused   = Object.values(playerStats).reduce((sum, v) => sum + v.refused, 0);
  const done = Object.fromEntries(playerNames.map(n => [n, playerStats[n].completed]));
  return (
    <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={roundCount} total={roundCount} />}
      footer={<EndActions navigation={navigation} route={route} game={GAME} scores={done} />}>
      <Heading kicker={t('Fin de partie', 'Game over')} title={t('Qui a tout osé ?', 'Who dared it all?')} sub={IS_EN ? `${totalCompleted} dare${totalCompleted > 1 ? 's' : ''} done · ${totalRefused} refused` : `${totalCompleted} défi${totalCompleted > 1 ? 's' : ''} réussi${totalCompleted > 1 ? 's' : ''} · ${totalRefused} refusé${totalRefused > 1 ? 's' : ''}`} />
      <Text style={s.kickerMuted}>{t('DÉFIS RÉUSSIS PAR JOUEUR', 'DARES DONE PER PLAYER')}</Text>
      <Ranking players={playerNames} scores={done} />
    </GameScreen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  kickerMuted: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, marginBottom: -12 },
  spin: { width: 260, borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  spinInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', paddingVertical: 28, paddingHorizontal: 12, alignItems: 'center', gap: 14 },
  spinName: { color: T.encre, fontFamily: F.affiche, fontSize: 34, lineHeight: 40 },
  rule: { width: 56, height: 1, backgroundColor: 'rgba(212,175,55,0.5)' },
  who: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  whoText: { flex: 1, color: T.encre, fontFamily: F.afficheSemi, fontSize: 22 },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort },
  catText: { color: T.encreDouce, fontSize: 13 },
  duo: { flexDirection: 'row', gap: 8, width: '100%' },
});
