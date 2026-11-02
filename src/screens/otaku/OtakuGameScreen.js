import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OTAKU_CATEGORIES, OTAKU_BY_CATEGORY } from '../../data/otakuData';
import goBackOrMenu from '../../navigation/goBack';
import { retour } from '../../utils/feedback';
import { tirer } from '../../utils/dejaVu';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, SecondaryButton, QuestionCard, Heading, Notice,
  PlayerChoice, PlayerGrid, Ranking, EndActions, T, F,
} from '../../components/game/Legende';

const GAME = 'otaku';
const CATEGORY = Object.fromEntries(OTAKU_CATEGORIES.map(c => [c.value, c]));

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Autant de questions de chaque catégorie choisie (les jamais vues d'abord), puis mélange
function buildDeck(categories, count) {
  const piles = categories.map(id => tirer('otaku-' + id, OTAKU_BY_CATEGORY[id] || [], count).map(item => ({ ...item, category: id })));
  const deck = [];
  for (let i = 0; deck.length < count && piles.some(p => p.length); i++) {
    const pile = piles[i % piles.length];
    if (pile.length) deck.push(pile.shift());
  }
  return shuffle(deck);
}

export default function OtakuGameScreen({ route, navigation }) {
  const { playerNames, categories, count = 20 } = route.params;

  const [deck]    = useState(() => buildDeck(categories, count));
  const [qIdx,    setQIdx]    = useState(0);
  const [phase,   setPhase]   = useState('question'); // question|answer|final
  const [clues,   setClues]   = useState(1);          // indices dévoilés (Devine l'animé)
  const [helped,  setHelped]  = useState(false);      // aide demandée (autres catégories)
  const [winners, setWinners] = useState([]);
  const [scores,  setScores]  = useState(Object.fromEntries(playerNames.map(n => [n, 0])));

  const item = deck[qIdx];
  const isIndices = item?.category === 'indices';
  const points = !item ? 0 : isIndices ? 4 - clues : helped ? 1 : 2;
  const ptsLabel = `${points} point${points > 1 ? 's' : ''}`;

  const toggleWinner = (name) => {
    setWinners(w => (w.includes(name) ? w.filter(n => n !== name) : [...w, name]));
  };

  const handleReveal = () => { retour('bon'); setPhase('answer'); };

  const handleNext = () => {
    setScores(s => {
      const next = { ...s };
      winners.forEach(n => { next[n] = (next[n] || 0) + points; });
      return next;
    });
    setWinners([]); setClues(1); setHelped(false);
    if (qIdx + 1 >= deck.length) { setPhase('final'); return; }
    setQIdx(i => i + 1);
    setPhase('question');
  };

  const quit = () => goBackOrMenu(navigation);
  const top = <GameTopBar game={GAME} onBack={quit} current={qIdx + 1} total={deck.length} />;

  // ── Classement final ──
  if (phase === 'final' || !item) {
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={deck.length} total={deck.length} />}
        footer={<EndActions navigation={navigation} route={route} game={GAME} scores={scores} />}>
        <Heading kicker="Fin de partie" title="Le classement" sub="Qui est le vrai sensei des animés ?" />
        <Ranking players={playerNames} scores={scores} suffix=" pts" />
      </GameScreen>
    );
  }

  const cat = CATEGORY[item.category];
  const revealed = phase === 'answer';

  const renderPrompt = () => {
    if (isIndices) {
      return (
        <View style={{ gap: 8 }}>
          {item.clues.map((c, i) => {
            const shown = i < clues || revealed;
            return (
              <View key={i} style={[s.clue, shown && s.clueOn]}>
                <Text style={[s.clueNum, shown && { color: T.orTexte }]}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={[s.clueText, !shown && { color: T.encreDouce }]}>{shown ? c : 'Indice caché'}</Text>
              </View>
            );
          })}
        </View>
      );
    }
    if (item.category === 'emoji') {
      return (
        <QuestionCard kicker={cat.label} footer={helped || revealed ? `Indice : ${item.hint}` : null}>
          <Text style={s.emojis}>{item.emojis.join(' ')}</Text>
        </QuestionCard>
      );
    }
    return (
      <QuestionCard kicker={cat.label} footer={helped && !revealed ? `Animé : ${item.from}` : null}>
        {item.q}
      </QuestionCard>
    );
  };

  // ── Question ──
  if (!revealed) {
    const canMoreClues = isIndices && clues < item.clues.length;
    const canHelp      = !isIndices && !helped;
    return (
      <GameScreen top={top} footer={(
        <ActionBar note={`${ptsLabel} en jeu`}>
          {canMoreClues ? <SecondaryButton label="Indice suivant (−1 point)" onPress={() => setClues(c => c + 1)} /> : null}
          {canHelp ? <SecondaryButton label={item.category === 'emoji' ? 'Un indice (−1 point)' : 'Donner l’animé (−1 point)'} onPress={() => setHelped(true)} /> : null}
          <PrimaryButton label="Révéler la réponse" onPress={handleReveal} />
        </ActionBar>
      )}>
        <Heading kicker={`Question ${qIdx + 1} sur ${deck.length} · ${cat.label}`} title={cat.question} />
        {renderPrompt()}
      </GameScreen>
    );
  }

  // ── Réponse : qui a trouvé ? ──
  return (
    <GameScreen top={top} footer={(
      <ActionBar>
        <PrimaryButton
          label={`${winners.length ? '' : 'Personne · '}${qIdx + 1 >= deck.length ? 'Voir le classement' : 'Question suivante'}`}
          onPress={handleNext}
        />
      </ActionBar>
    )}>
      {renderPrompt()}
      <Notice title="Réponse">
        <Text style={s.answer}>{item.answer}</Text>
        {item.from ? <Text style={s.from}>{item.from}</Text> : null}
      </Notice>
      <Heading kicker={`+${ptsLabel} chacun`} title="Qui a trouvé ?" />
      <PlayerGrid>
        {playerNames.map((name, idx) => (
          <PlayerChoice key={name} name={name} index={idx} selected={winners.includes(name)} onPress={() => toggleWinner(name)}
            label={`${name} a trouvé`} right={<Text style={s.score}>{scores[name] || 0}</Text>} />
        ))}
      </PlayerGrid>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  clue:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.creux },
  clueOn:   { borderColor: 'rgba(212,175,55,0.6)', backgroundColor: T.carte },
  clueNum:  { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13, letterSpacing: 1.6 },
  clueText: { flex: 1, color: T.encre, fontFamily: F.texteMoyen, fontSize: 17, lineHeight: 24 },
  emojis:   { fontSize: 52, lineHeight: 64, textAlign: 'center' },
  answer:   { color: T.encre, fontFamily: F.afficheSemi, fontSize: 28, lineHeight: 34, textAlign: 'center' },
  from:     { color: T.encreDouce, fontSize: 14, textAlign: 'center' },
  score:    { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 14 },
});
