import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import {
  GameScreen, ActionBar, PrimaryButton, SecondaryButton, TextLink, Heading, Notice, QuestionCard,
  AnswerChoice, TimeBar, Icon, useMasqueMenu, T, F,
} from '../../components/game/Legende';
import {
  EPREUVES, PAR_EPREUVE, MAX_POINTS, defiDuJour, jourDuDefi, points, etatDefi, enregistrerDefi,
  texteDePartage, avantProchainDefi, noterAvancement, terminerAbandon, oublierAvancement,
} from '../../services/defiDuJour';
import personalityImages from '../../data/personalityImages';
import { retour } from '../../utils/feedback';

const isWeb = Platform.OS === 'web';
const COULEURS = { 3: '#4FD8A4', 2: '#E6C766', 1: '#F0A35E', 0: '#2E2A4A' };

function Barre({ onQuit, avancement, titre }) {
  useMasqueMenu();
  const [confirm, setConfirm] = useState(false);
  const t = useRef(null);
  useEffect(() => () => clearTimeout(t.current), []);
  const quitter = () => {
    if (!avancement || confirm) { onQuit(); return; }
    setConfirm(true); t.current = setTimeout(() => setConfirm(false), 3000);
  };
  return (
    <View>
      <View style={s.top}>
        <Pressable onPress={quitter} accessibilityRole="button" accessibilityLabel={confirm ? 'Confirmer : quitter le défi' : 'Quitter'} style={s.back}>
          <Icon name={avancement ? 'close' : 'back'} color={confirm ? T.orTexte : T.encre} />
          <Text style={[s.backText, confirm && { color: T.orTexte }]}>{avancement ? (confirm ? 'Quitter ?' : 'Quitter') : 'Jeux'}</Text>
        </Pressable>
        <Text style={s.topTitle} numberOfLines={1}>{titre}</Text>
        <View style={{ minWidth: 96 }} />
      </View>
      {avancement ? (
        <View style={s.track}><View style={[s.fill, { width: `${avancement * 100}%` }]} /></View>
      ) : <View style={s.rule} />}
    </View>
  );
}

// Grille du résultat : une ligne par épreuve, une case par question
function Grille({ detail }) {
  return (
    <View style={{ gap: 8 }}>
      {EPREUVES.map((e, i) => (
        <View key={e.id} style={s.gridRow}>
          <Text style={s.gridName}>{e.nom}</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {Array.from({ length: PAR_EPREUVE }).map((_, k) => {
              const p = detail[i * PAR_EPREUVE + k] ?? 0;
              return <View key={k} style={[s.cell, { backgroundColor: COULEURS[p] }]} accessibilityLabel={`${p} point${p > 1 ? 's' : ''}`} />;
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

export default function DefiScreen({ navigation }) {
  const jour = useMemo(() => jourDuDefi(), []);
  const questions = useMemo(() => defiDuJour(jour), [jour]);
  // Un défi quitté en cours de route compte avec les points déjà gagnés
  const [etat, setEtat] = useState(() => terminerAbandon(jour) || etatDefi(jour));
  const [phase, setPhase] = useState(etat.dejaJoue ? 'fin' : 'accueil'); // accueil | intro | question | fin
  const [idx, setIdx] = useState(0);
  const [choisi, setChoisi] = useState(null);       // index choisi, -1 = temps écoulé, null = pas encore
  const [ecoute, setEcoute] = useState(false);      // blind test : extrait lancé
  const [detail, setDetail] = useState([]);
  const [ecoule, setEcoule] = useState(0);
  const [partage, setPartage] = useState('');
  const debut = useRef(0);
  const iframeRef = useRef(null);

  const q = questions[idx];
  const epreuve = EPREUVES.find((e) => e.id === q?.epreuve) || EPREUVES[0];
  const numEpreuve = EPREUVES.indexOf(epreuve);
  const enCours = phase === 'question' && choisi === null && (q?.epreuve !== 'blind' || ecoute);
  const score = detail.reduce((a, b) => a + b, 0);
  const toMenu = () => { couperSon(); navigation.navigate('Menu'); };

  // Chronomètre (pour les points et le flou des célébrités)
  useEffect(() => {
    if (!enCours) return undefined;
    debut.current = Date.now();
    setEcoule(0);
    const id = setInterval(() => setEcoule((Date.now() - debut.current) / 1000), 200);
    return () => clearInterval(id);
  }, [enCours, idx]);

  function couperSon() { if (iframeRef.current) iframeRef.current.src = ''; }

  const lancerExtrait = () => {
    const c = q.chanson;
    if (isWeb && iframeRef.current) {
      iframeRef.current.src = `https://www.youtube-nocookie.com/embed/${c.videoId}?autoplay=1&start=${c.startAt ?? 0}&controls=0&rel=0&modestbranding=1&iv_load_policy=3`;
    }
    setEcoute(true);
  };

  const repondre = (i) => {
    if (choisi !== null) return;
    const s2 = (Date.now() - debut.current) / 1000;
    const p = points(i === q.bonne, s2, epreuve.duree);
    setChoisi(i);
    setDetail((d) => { const n = [...d, p]; noterAvancement(n, jour); return n; });
    if (q.epreuve === 'blind') setTimeout(couperSon, 2500);
  };
  const tempsEcoule = () => {
    if (choisi !== null) return;
    setChoisi(-1);
    setDetail((d) => { const n = [...d, 0]; noterAvancement(n, jour); return n; });
    couperSon();
  };

  const suivant = () => {
    couperSon();
    const n = idx + 1;
    if (n >= questions.length) {
      oublierAvancement();
      const fin = enregistrerDefi(detail.reduce((a, b) => a + b, 0), detail, jour);
      setEtat(fin);
      setPhase('fin');
      retour('victoire');
      return;
    }
    setIdx(n);
    setChoisi(null);
    setEcoute(false);
    // Nouvelle épreuve : petit écran d'annonce
    setPhase(questions[n].epreuve !== q.epreuve ? 'intro' : 'question');
  };

  const partager = async () => {
    const texte = texteDePartage(etat.score ?? score, etat.detail.length ? etat.detail : detail, etat.serie, jour);
    try {
      if (isWeb && navigator.share) { await navigator.share({ text: texte }); return; }
    } catch { return; }
    try { await navigator.clipboard.writeText(texte); setPartage('Résultat copié : collez-le où vous voulez.'); }
    catch { setPartage(texte); }
  };

  const iframe = isWeb ? React.createElement('iframe', {
    ref: iframeRef, allow: 'autoplay; encrypted-media',
    style: { position: 'fixed', bottom: -1, left: -1, width: 1, height: 1, opacity: 0, border: 'none', pointerEvents: 'none' },
  }) : null;

  let ecran;

  // ── Accueil ──
  if (phase === 'accueil') {
    const date = new Date(jour * 86400000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    ecran = (
      <GameScreen top={<Barre onQuit={toMenu} titre="DÉFI DU JOUR" />} footer={(
        <ActionBar note="Le même défi pour tout le monde aujourd’hui. Un seul essai : quitter en cours de route compte comme terminé.">
          <PrimaryButton label="Relever le défi" onPress={() => { noterAvancement([], jour); setPhase('intro'); }} />
        </ActionBar>
      )}>
        <Heading kicker={date} title="Le défi du jour" sub={`${EPREUVES.length} épreuves de ${PAR_EPREUVE} questions, en solo. Plus vous répondez vite, plus vous marquez : jusqu’à 3 points par question.`} />
        <View style={{ gap: 8 }}>
          {EPREUVES.map((e, i) => (
            <View key={e.id} style={s.step}>
              <Text style={s.stepNum}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.stepName}>{e.nom}</Text>
                <Text style={s.stepSub}>{e.consigne} {e.duree} secondes par question.</Text>
              </View>
            </View>
          ))}
        </View>
        {etat.serie > 0 || etat.record > 0 ? (
          <View style={s.stats}>
            <Stat n={etat.serie} label={`jour${etat.serie > 1 ? 's' : ''} de suite`} />
            <Stat n={etat.record} label="record" />
            <Stat n={etat.joues} label={`défi${etat.joues > 1 ? 's' : ''} joué${etat.joues > 1 ? 's' : ''}`} />
          </View>
        ) : null}
      </GameScreen>
    );

  // ── Annonce d'une épreuve ──
  } else if (phase === 'intro') {
    ecran = (
      <GameScreen top={<Barre onQuit={toMenu} titre={`ÉPREUVE ${numEpreuve + 1} SUR ${EPREUVES.length}`} avancement={idx / questions.length || 0.001} />} scroll={false}
        footer={<ActionBar><PrimaryButton label="C’est parti" onPress={() => setPhase('question')} /></ActionBar>}>
        <View style={s.center}>
          <View style={s.badge}><Text style={s.badgeTxt}>{epreuve.symbole}</Text></View>
          <Heading kicker={`Épreuve ${numEpreuve + 1} sur ${EPREUVES.length}`} title={epreuve.nom} sub={`${epreuve.consigne} ${PAR_EPREUVE} questions, ${epreuve.duree} secondes chacune.`} />
          <Text style={s.scoreNow}>{score} point{score > 1 ? 's' : ''} pour l’instant</Text>
        </View>
      </GameScreen>
    );

  // ── Question ──
  } else if (phase === 'question') {
    const revele = choisi !== null;
    const etatOption = (i) => (!revele ? null : i === q.bonne ? 'correct' : i === choisi ? 'wrong' : 'neutral');
    const flou = Math.max(0, 22 * (1 - ecoule / epreuve.duree));
    const gagne = revele ? detail[detail.length - 1] : 0;
    ecran = (
      <GameScreen
        top={<Barre onQuit={toMenu} titre={epreuve.nom.toUpperCase()} avancement={(idx + (revele ? 1 : 0)) / questions.length || 0.001} />}
        footer={revele ? (
          <ActionBar><PrimaryButton label={idx + 1 >= questions.length ? 'Voir mon score' : 'Question suivante'} onPress={suivant} /></ActionBar>
        ) : q.epreuve === 'blind' && !ecoute ? (
          <ActionBar><PrimaryButton label="Écouter l’extrait" onPress={lancerExtrait} /></ActionBar>
        ) : null}
      >
        <View style={s.head}>
          <Text style={s.headTxt}>Question {(idx % PAR_EPREUVE) + 1} sur {PAR_EPREUVE}</Text>
          <Text style={s.headScore}>{score} pts</Text>
        </View>
        <TimeBar running={enCours} duration={epreuve.duree} onExpire={tempsEcoule} resetKey={`${idx}-${ecoute}`} />

        {q.epreuve === 'blind' && (
          <QuestionCard kicker="Blind test">{revele ? q.reponse : ecoute ? 'Quelle est cette chanson ?' : 'Touchez « Écouter l’extrait » quand vous êtes prêt.'}</QuestionCard>
        )}
        {q.epreuve === 'emoji' && (
          <View style={s.emojiCard}>
            <View style={s.emojiInner}>
              <Text style={s.kicker}>QUE CACHENT CES EMOJIS ?</Text>
              <Text style={s.emojis}>{q.emojis.join(' ')}</Text>
            </View>
          </View>
        )}
        {q.epreuve === 'quiz' && <QuestionCard kicker="Culture générale">{q.question}</QuestionCard>}
        {q.epreuve === 'star' && (
          <View style={s.starFrame}>
            <View style={s.starClip}>
              <View style={[{ flex: 1 }, isWeb && { filter: `blur(${revele ? 0 : flou}px)` }]}>
                <Image source={personalityImages[q.star]} resizeMode="cover" style={[{ width: '100%', height: '100%' }, isWeb && { objectPosition: 'top center' }]} />
              </View>
            </View>
          </View>
        )}
        {q.epreuve === 'mot' && (
          <View style={s.motBox}>
            <Text style={s.kicker}>CINQ INDICES POUR UN MOT</Text>
            <View style={s.chips}>
              {q.indices.map((w) => <View key={w} style={s.chip}><Text style={s.chipTxt}>{w}</Text></View>)}
            </View>
          </View>
        )}

        {(q.epreuve !== 'blind' || ecoute || revele) && (
          <View style={{ gap: 8 }}>
            {q.options.map((o, i) => (
              <AnswerChoice key={o + i} index={i} label={o} state={etatOption(i)} onPress={() => repondre(i)} disabled={revele || (q.epreuve === 'blind' && !ecoute)} />
            ))}
          </View>
        )}

        {revele && (
          <Notice tone={gagne ? 'or' : choisi === -1 ? 'neutre' : 'alerte'}
            title={gagne ? `+${gagne} point${gagne > 1 ? 's' : ''}` : choisi === -1 ? 'Temps écoulé' : 'Raté'}>
            {q.epreuve === 'quiz' && q.anecdote ? q.anecdote : q.epreuve !== 'blind' && !gagne ? `C’était : ${q.reponse}` : null}
          </Notice>
        )}
      </GameScreen>
    );

  // ── Résultat ──
  } else {
    const final = etat.score ?? score;
    const det = etat.detail.length ? etat.detail : detail;
    const { heures, minutes } = avantProchainDefi();
    ecran = (
      <GameScreen top={<Barre onQuit={toMenu} titre="DÉFI DU JOUR" />} footer={(
        <ActionBar note={`Prochain défi dans ${heures} h ${String(minutes).padStart(2, '0')}.`}>
          <PrimaryButton label="Partager mon score" onPress={partager} />
          <TextLink label="Retour aux jeux" onPress={toMenu} />
        </ActionBar>
      )}>
        <View style={s.score}>
          <Text style={s.kicker}>VOTRE SCORE DU JOUR</Text>
          <Text style={s.big}>{final}<Text style={s.max}> / {MAX_POINTS}</Text></Text>
          <Text style={s.verdict}>{final >= MAX_POINTS * 0.75 ? 'Légendaire.' : final >= MAX_POINTS * 0.5 ? 'Très belle performance.' : final >= MAX_POINTS * 0.25 ? 'Pas mal, demain sera meilleur.' : 'Revenez demain prendre votre revanche.'}</Text>
        </View>
        <Grille detail={det} />
        <View style={s.stats}>
          <Stat n={etat.serie} label={`jour${etat.serie > 1 ? 's' : ''} de suite`} />
          <Stat n={etat.record} label="record" />
          <Stat n={etat.joues} label={`défi${etat.joues > 1 ? 's' : ''} joué${etat.joues > 1 ? 's' : ''}`} />
        </View>
        {partage ? <Notice tone="neutre">{partage}</Notice> : null}
      </GameScreen>
    );
  }

  return <View style={{ flex: 1 }}>{ecran}{iframe}</View>;
}

function Stat({ n, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={s.statN}>{n}</Text>
      <Text style={s.statL}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  top: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  back: { minWidth: 96, height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  backText: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  topTitle: { flex: 1, textAlign: 'center', color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2.2 },
  rule: { height: 1, backgroundColor: T.trait },
  track: { height: 3, backgroundColor: T.trait },
  fill: { height: 3, backgroundColor: T.or },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  badge: { width: 96, height: 96, borderRadius: 999, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { color: T.orTexte, fontFamily: F.affiche, fontSize: 44, lineHeight: 50 },
  scoreNow: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte },
  stepNum: { width: 24, color: T.orTexte, fontFamily: F.chiffre, fontSize: 13 },
  stepName: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  stepSub: { color: T.encreDouce, fontSize: 13 },
  stats: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, paddingVertical: 14 },
  statN: { color: T.encre, fontFamily: F.affiche, fontSize: 28, lineHeight: 32 },
  statL: { color: T.encreDouce, fontSize: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headTxt: { color: T.encreDouce, fontSize: 13 },
  headScore: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 13 },
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  emojiCard: { borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  emojiInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', paddingVertical: 24, alignItems: 'center', gap: 14 },
  emojis: { fontSize: 46, letterSpacing: 6 },
  starFrame: { alignSelf: 'center', width: 230, height: 270, borderRadius: 18, backgroundColor: T.carte, padding: 6 },
  starClip: { flex: 1, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', backgroundColor: T.creux },
  motBox: { borderRadius: 14, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte, padding: 16, gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort, justifyContent: 'center' },
  chipTxt: { color: T.encre, fontFamily: F.texteMoyen, fontSize: 15 },
  score: { borderRadius: 18, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 20, alignItems: 'center', gap: 6 },
  big: { color: T.encre, fontFamily: F.affiche, fontSize: 60, lineHeight: 66 },
  max: { color: T.encreDouce, fontFamily: F.afficheSemi, fontSize: 26 },
  verdict: { color: T.encre, fontSize: 16, textAlign: 'center' },
  gridRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  gridName: { color: T.encre, fontFamily: F.texteMoyen, fontSize: 14, flex: 1 },
  cell: { width: 34, height: 34, borderRadius: 8 },
});
