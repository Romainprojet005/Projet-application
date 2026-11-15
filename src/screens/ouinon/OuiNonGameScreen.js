import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { selectOuiNon, OUINON_CATEGORIES } from '../../data/ouiNonQuestions';
import goBackOrMenu from '../../navigation/goBack';
import { retour } from '../../utils/feedback';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, QuestionCard, Heading, PassPhone, PlayerToken,
  Ranking, EndActions, AdultTag, Icon, T, F,
} from '../../components/game/Legende';

const GAME = 'ouinon';
const CAT_LABEL = Object.fromEntries(OUINON_CATEGORIES.map((c) => [c.value, c.label]));

// Phases : question → (pass → secret) × joueurs → reveal → … → final
export default function OuiNonGameScreen({ route, navigation }) {
  // Après un rechargement, les paramètres reviennent de l'URL sous forme de texte
  const params = route.params || {};
  const playerNames = Array.isArray(params.playerNames) ? params.playerNames : String(params.playerNames || '').split(',').filter(Boolean);
  const categoryId = params.categoryId || 'all';
  const roundCount = Number(params.roundCount) || 10;
  const drink = params.drink === true || params.drink === 'true';
  const N = playerNames.length;

  const [questions]       = useState(() => selectOuiNon(roundCount, categoryId));
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState('question');
  const [turn, setTurn]   = useState(0);          // joueur qui a le téléphone
  const [ready, setReady] = useState(false);      // « Je suis X » touché
  const [answer, setAnswer] = useState(null);     // true | false (joueur en cours)
  const [guess, setGuess] = useState(null);       // nombre de oui pronostiqué (joueur en cours)
  const [entries, setEntries] = useState([]);     // [{ name, oui, guess }]
  const [scores, setScores] = useState(() => Object.fromEntries(playerNames.map((n) => [n, 0])));

  const item = questions[roundIdx];
  const last = roundIdx + 1 >= questions.length;
  const quit = () => goBackOrMenu(navigation);
  const top = <GameTopBar game={GAME} onBack={quit} current={Math.min(roundIdx + 1, questions.length)} total={questions.length} />;
  const adultTag = drink ? <View style={{ alignSelf: 'flex-end' }}><AdultTag /></View> : null;

  const startRound = () => { setTurn(0); setReady(false); setAnswer(null); setGuess(null); setEntries([]); setPhase('secret'); };

  const validate = () => {
    const next = [...entries, { name: playerNames[turn], oui: answer, guess }];
    setAnswer(null); setGuess(null); setReady(false);
    if (turn + 1 < N) { retour('vote'); setEntries(next); setTurn(turn + 1); return; }
    // Tout le monde a répondu : on compte et on distribue les pénalités
    const total = next.filter((e) => e.oui).length;
    setScores((s) => {
      const out = { ...s };
      next.forEach((e) => { if (e.guess !== total) out[e.name] = (out[e.name] || 0) + 1; });
      return out;
    });
    retour('drame');
    setEntries(next);
    setPhase('reveal');
  };

  const handleNext = () => {
    if (last) { setPhase('final'); return; }
    setRoundIdx((i) => i + 1);
    setPhase('question');
  };

  // ── Fin de partie ──
  if (phase === 'final' || !item) {
    const order = [...playerNames].sort((a, b) => (scores[a] || 0) - (scores[b] || 0));
    return (
      <GameScreen top={<GameTopBar game={GAME} onBack={quit} confirmQuit={false} current={questions.length} total={questions.length} />}
        footer={<EndActions navigation={navigation} route={route} game={GAME} scores={scores} moinsGagne />}>
        <Heading kicker="Fin de partie" title="Le classement" sub={`Le moins de ${drink ? 'gorgées' : 'gages'} l’emporte : ${order[0]} lit le mieux dans les pensées !`} />
        <Ranking players={playerNames} scores={scores} order={order} />
      </GameScreen>
    );
  }

  // ── La question, pour tout le monde ──
  if (phase === 'question') {
    return (
      <GameScreen top={top} footer={(
        <ActionBar note="Chacun répond en secret, puis devine le nombre de « oui ».">
          <PrimaryButton label="C’est parti" onPress={startRound} />
        </ActionBar>
      )}>
        {adultTag}
        <Heading kicker={`Question ${roundIdx + 1} sur ${questions.length} · ${CAT_LABEL[item.category] || ''}`} title="Oui ou non ?" />
        <QuestionCard kicker="Tout le monde répond" footer="Soyez honnêtes : personne ne saura qui a dit quoi.">{item.q}</QuestionCard>
      </GameScreen>
    );
  }

  // ── Tour secret d'un joueur ──
  if (phase === 'secret') {
    const name = playerNames[turn];
    if (!ready) {
      return (
        <GameScreen top={top} scroll={false} footer={(
          <ActionBar><PrimaryButton label={`Je suis ${name}`} onPress={() => setReady(true)} /></ActionBar>
        )}>
          <PassPhone game={GAME} name={name} index={turn} order={playerNames} kicker={`Question ${roundIdx + 1} · réponse secrète`} />
        </GameScreen>
      );
    }
    return (
      <GameScreen top={top} footer={(
        <ActionBar note={answer === null ? 'Réponds d’abord oui ou non.' : guess === null ? 'Puis devine le nombre total de « oui ».' : null}>
          <PrimaryButton label={turn + 1 < N ? 'Valider et passer le téléphone' : 'Valider et révéler'} onPress={validate}
            disabled={answer === null || guess === null} />
        </ActionBar>
      )}>
        <View style={s.who}>
          <PlayerToken name={name} index={turn} size={28} />
          <Text style={s.whoText}>{name}, en secret</Text>
        </View>
        <QuestionCard kicker="Ta réponse">{item.q}</QuestionCard>
        <View style={s.yesNo} accessibilityRole="radiogroup" accessibilityLabel="Ta réponse">
          {[true, false].map((v) => {
            const on = answer === v;
            return (
              <Pressable key={String(v)} onPress={() => { retour('tap'); setAnswer(v); }} accessibilityRole="radio" accessibilityState={{ checked: on }}
                accessibilityLabel={v ? 'Oui' : 'Non'} style={({ pressed }) => [s.yn, on && (v ? s.ynOui : s.ynNon), pressed && { opacity: 0.85 }]}>
                <Text style={[s.ynText, on && { color: T.fond }]}>{v ? 'OUI' : 'NON'}</Text>
              </Pressable>
            );
          })}
        </View>
        <Heading kicker="Ton pronostic" title={`Combien de « oui » sur ${N} ?`} sub="Ta propre réponse compte aussi." />
        <View style={s.grid} accessibilityRole="radiogroup" accessibilityLabel="Nombre de oui">
          {Array.from({ length: N + 1 }, (_, k) => {
            const on = guess === k;
            return (
              <Pressable key={k} onPress={() => setGuess(k)} accessibilityRole="radio" accessibilityState={{ checked: on }}
                accessibilityLabel={`${k} oui`} style={({ pressed }) => [s.num, on && s.numOn, pressed && { borderColor: T.or }]}>
                <Text style={[s.numText, on && { color: T.surOr }]}>{k}</Text>
              </Pressable>
            );
          })}
        </View>
      </GameScreen>
    );
  }

  // ── Révélation ──
  const total = entries.filter((e) => e.oui).length;
  const winners = entries.filter((e) => e.guess === total);
  return (
    <GameScreen top={top} footer={(
      <ActionBar>
        <PrimaryButton label={last ? 'Voir le classement' : 'Question suivante'} onPress={handleNext} />
      </ActionBar>
    )}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text style={s.kicker}>RÉVÉLATION</Text>
        <Text style={s.sub}>« {item.q} »</Text>
      </View>
      <View style={s.verdict}>
        <Text style={s.big}>{total}</Text>
        <Text style={s.bigLabel}>« OUI » SUR {N}</Text>
        <Text style={s.verdictText}>
          {total === 0 ? 'Personne n’a dit oui… vraiment ?' : total === N ? 'Tout le monde a dit oui !'
            : total === 1 ? 'Une seule personne a dit oui. Qui ose avouer ?' : 'Personne ne saura qui a dit oui… à moins d’avouer.'}
        </Text>
      </View>
      <Heading kicker={winners.length ? `${winners.length} bon${winners.length > 1 ? 's' : ''} pronostic${winners.length > 1 ? 's' : ''}` : 'Personne n’a trouvé'}
        title={drink ? 'Qui boit ?' : 'Qui prend un gage ?'} />
      <View style={{ gap: 8 }}>
        {entries.map((e) => {
          const ok = e.guess === total;
          return (
            <View key={e.name} style={[s.row, ok && s.rowOk]}>
              <PlayerToken name={e.name} index={playerNames.indexOf(e.name)} />
              <Text style={s.rowName} numberOfLines={1}>{e.name}</Text>
              <Text style={s.rowGuess}>{e.guess} ?</Text>
              {ok ? <View style={s.badgeOk}><Icon name="check" size={14} color={T.surOr} /><Text style={s.badgeOkText}>Tranquille</Text></View>
                : <View style={s.badgeKo}><Text style={s.badgeKoText}>{drink ? 'Boit 1 gorgée' : '1 gage'}</Text></View>}
            </View>
          );
        })}
      </View>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whoText: { color: T.encre, fontSize: 15 },
  yesNo: { flexDirection: 'row', gap: 10 },
  yn: { flex: 1, height: 72, borderRadius: 16, borderWidth: 1, borderColor: T.traitFort, alignItems: 'center', justifyContent: 'center', backgroundColor: T.carte },
  ynOui: { backgroundColor: '#4FD8A4', borderColor: '#4FD8A4' },
  ynNon: { backgroundColor: T.alerte, borderColor: T.alerte },
  ynText: { color: T.encre, fontFamily: F.affiche, fontSize: 28, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  num: { width: 52, height: 52, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, alignItems: 'center', justifyContent: 'center' },
  numOn: { backgroundColor: T.or, borderColor: T.or },
  numText: { color: T.encre, fontFamily: F.chiffre, fontSize: 20 },
  kicker: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  sub: { color: T.encreDouce, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  verdict: { borderRadius: 18, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 20, alignItems: 'center', gap: 6 },
  big: { color: T.orTexte, fontFamily: F.affiche, fontSize: 72, lineHeight: 80 },
  bigLabel: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2 },
  verdictText: { color: T.encre, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: T.carte, borderWidth: 1, borderColor: T.trait },
  rowOk: { borderColor: T.or, backgroundColor: T.orVoile },
  rowName: { flex: 1, color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  rowGuess: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 14 },
  badgeOk: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: T.or },
  badgeOkText: { color: T.surOr, fontFamily: F.texteFort, fontSize: 12 },
  badgeKo: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: T.alerteVoile, borderWidth: 1, borderColor: T.alerte },
  badgeKoText: { color: T.alerte, fontFamily: F.texteFort, fontSize: 12 },
});
