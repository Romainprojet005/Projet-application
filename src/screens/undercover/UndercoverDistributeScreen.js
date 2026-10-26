import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import characterImages from '../../data/characterImages';
import goBackOrMenu from '../../navigation/goBack';
import { retour } from '../../utils/feedback';
import {
  GameScreen, GameTopBar, ActionBar, PrimaryButton, SecondaryButton, TextLink, Heading, Overlay,
  PlayerToken, PlayerChoice, PlayerGrid, tokenColor, Icon, SoireeActions, T, F,
} from '../../components/game/Legende';
import { dansLaSoiree } from '../../services/soiree';
import { t, IS_EN } from '../../i18n';

const GAME = 'undercover';

// Image du mot, ou rien si l'adresse manque / ne charge pas
function CharacterImage({ name }) {
  const [error, setError] = useState(false);
  const uri = name ? characterImages[name] : null;
  if (!uri || error) return null;
  return <Image source={{ uri }} style={styles.charImage} resizeMode="cover" onError={() => setError(true)} />;
}

// Les espions découvrent leur mot comme des villageois : personne ne sait qu'il est espion
const ROLE_CONFIG = {
  civilian:   { label: t('Villageois', 'Civilian'), color: '#7CC4FF', message: t('Donnez des indices sans trop en dire : un espion a un mot proche du vôtre.', 'Give clues without saying too much: a spy has a word close to yours.') },
  undercover: { label: t('Espion', 'Spy'), color: T.alerte,  message: t('Vous étiez l’espion infiltré.', 'You were the undercover spy.') },
  mrwhite:    { label: t('Monsieur Blanc', 'Mr. White'), color: T.orTexte, message: t('Vous n’avez aucun mot. Écoutez les autres et inventez un bluff parfait.', 'You have no word. Listen to the others and come up with the perfect bluff.') },
};
const roleName = (r) => (r === 'civilian' ? t('Villageois', 'Civilian') : r === 'undercover' ? t('Espion', 'Spy') : t('M. Blanc', 'Mr. White'));
// Nom affiché d'un joueur : son prénom s'il a été saisi, sinon « Joueur N »
const nommer = (names) => (i) => names?.[i] || `${t('Joueur', 'Player')} ${i + 1}`;
const jeton = (names) => (i) => (names?.[i] ? names[i] : String(i + 1));

function distributeRoles(playerCount, wordPair, undercoverCount, hasMrWhite) {
  const roles = [];
  const civCount = playerCount - undercoverCount - (hasMrWhite ? 1 : 0);
  for (let i = 0; i < civCount; i++) roles.push({ type: 'civilian', word: wordPair.civilian });
  for (let i = 0; i < undercoverCount; i++) roles.push({ type: 'undercover', word: wordPair.undercover });
  if (hasMrWhite) roles.push({ type: 'mrwhite', word: null });
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return roles;
}

// Carte de mot (révélée)
function WordCard({ role, themeName }) {
  const cfg = ROLE_CONFIG[role.type === 'undercover' ? 'civilian' : role.type];
  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>
        <Text style={[styles.kicker, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
        {role.type !== 'mrwhite' && <CharacterImage name={role.word} />}
        <Text style={styles.kicker}>{t('VOTRE MOT', 'YOUR WORD')}</Text>
        <Text style={styles.word}>{role.type !== 'mrwhite' ? role.word : '???'}</Text>
        <View style={styles.rule} />
        <Text style={styles.cardNote}>{role.type !== 'mrwhite' ? `${t('Thème', 'Theme')} : ${themeName}` : t('Aucun mot attribué', 'No word given')}</Text>
        <Text style={styles.cardMsg}>{cfg.message}</Text>
      </View>
    </View>
  );
}

// ── Plateau : éliminations et fin de partie ──
function GameBoard({ roles, themeName, onQuit, onBackToMenu, onReplay, navigation, names }) {
  const P = nommer(names);
  const tok = jeton(names);
  const [eliminated, setEliminated] = useState(new Set());
  const [modalIdx, setModalIdx]     = useState(null);
  const [winner, setWinner]         = useState(null); // null | 'spies' | 'civilians' | 'ended'
  // Le jeu désigne qui commence — jamais Monsieur Blanc (il n'a pas de mot)
  const [starter] = useState(() => {
    const ok = roles.map((r, i) => (r.type !== 'mrwhite' ? i : -1)).filter(i => i >= 0);
    return ok[Math.floor(Math.random() * ok.length)];
  });
  const civilianWord   = roles.find(r => r.type === 'civilian')?.word;
  const undercoverWord = roles.find(r => r.type === 'undercover')?.word;
  const [peekPlayer, setPeekPlayer] = useState(null); // null | -1 (choix) | numéro
  const [peekRevealed, setPeekRevealed] = useState(false);

  const handleEliminate = () => {
    retour('drame');
    const next = new Set(eliminated);
    next.add(modalIdx);
    setEliminated(next);
    setModalIdx(null);
    const aliveRoles     = roles.filter((_, i) => !next.has(i));
    const aliveCivilians = aliveRoles.filter(r => r.type === 'civilian').length;
    const aliveSpies     = aliveRoles.filter(r => r.type === 'undercover' || r.type === 'mrwhite').length;
    if (aliveCivilians === 0 || aliveSpies >= aliveCivilians) setWinner('spies');
    else if (aliveSpies === 0) setWinner('civilians');
  };

  const closePeek = () => { setPeekPlayer(null); setPeekRevealed(false); };
  useEffect(() => { if (winner) retour(winner === 'ended' ? 'revele' : 'victoire'); }, [winner]);
  const alive = roles.length - eliminated.size;
  const modalRole = modalIdx !== null ? roles[modalIdx] : null;
  const peekRole  = peekPlayer !== null && peekPlayer >= 0 ? roles[peekPlayer] : null;

  return (
    <View style={{ flex: 1 }}>
      <GameScreen
        top={<GameTopBar game={GAME} onBack={onQuit} right={<Text style={styles.counter}>{alive} {t('EN JEU', 'IN PLAY')}</Text>} />}
        footer={(
          <ActionBar>
            <SecondaryButton label={t('Revoir mon mot', 'See my word again')} onPress={() => { setPeekPlayer(-1); setPeekRevealed(false); }} />
            <TextLink label={t('Terminer et révéler les mots', 'End and reveal the words')} onPress={() => setWinner('ended')} />
          </ActionBar>
        )}
      >
        <View style={styles.starter}>
          <Text style={styles.kicker}>{t('COMMENCE', 'GOES FIRST')}</Text>
          <Text style={styles.starterName}>{P(starter)}</Text>
          <Text style={styles.sub}>{t('Puis on tourne dans le sens des aiguilles d’une montre. Après chaque tour, touchez le joueur éliminé.', 'Then go round clockwise. After each round, tap the player who was voted out.')}</Text>
        </View>
        <View style={styles.grid}>
          {roles.map((r, idx) => {
            const out = eliminated.has(idx);
            const cfg = ROLE_CONFIG[r.type];
            return (
              <Pressable key={idx} onPress={out ? undefined : () => setModalIdx(idx)} accessibilityRole="button"
                accessibilityLabel={out ? `${P(idx)}, ${t('éliminé', 'out')}, ${cfg.label}` : `${t('Éliminer', 'Eliminate')} ${P(idx)}`}
                style={({ pressed }) => [styles.seat, out && styles.seatOut, idx === starter && !out && { borderColor: T.or }, pressed && !out && { backgroundColor: T.orVoile }]}>
                <PlayerToken name={tok(idx)} index={idx} size={36} />
                <Text style={styles.seatName} numberOfLines={1}>{P(idx)}</Text>
                <Text style={[styles.seatState, out && { color: cfg.color }]}>{out ? cfg.label : t('En jeu', 'In play')}</Text>
              </Pressable>
            );
          })}
        </View>
      </GameScreen>

      {modalRole && (
        <Overlay onClose={() => setModalIdx(null)}>
          <Heading kicker={P(modalIdx)} title={t('Éliminer ce joueur ?', 'Eliminate this player?')} sub={t('Son rôle sera révélé à tous.', 'Their role will be revealed to everyone.')} />
          <PrimaryButton label={t('Confirmer l’élimination', 'Confirm elimination')} onPress={handleEliminate} />
          <TextLink label={t('Annuler', 'Cancel')} onPress={() => setModalIdx(null)} color={T.encreDouce} />
        </Overlay>
      )}

      {peekPlayer !== null && (
        <Overlay onClose={closePeek}>
          {peekPlayer === -1 ? (
            <>
              <Heading title={names ? t('Qui êtes-vous ?', 'Who are you?') : t('Quel est votre numéro ?', 'What is your number?')} sub={t('Assurez-vous d’être seul à regarder.', 'Make sure nobody else is looking.')} />
              {names ? (
                <PlayerGrid>
                  {roles.map((_, idx) => !eliminated.has(idx) && (
                    <PlayerChoice key={idx} name={P(idx)} index={idx} onPress={() => { setPeekPlayer(idx); setPeekRevealed(false); }} label={`${t('Je suis', 'I am')} ${P(idx)}`} />
                  ))}
                </PlayerGrid>
              ) : (
              <View style={styles.peekGrid}>
                {roles.map((_, idx) => !eliminated.has(idx) && (
                  <Pressable key={idx} onPress={() => { setPeekPlayer(idx); setPeekRevealed(false); }} accessibilityRole="button"
                    accessibilityLabel={P(idx)} style={[styles.peekBtn, { borderColor: tokenColor(idx) }]}>
                    <Text style={[styles.peekNum, { color: tokenColor(idx) }]}>{idx + 1}</Text>
                  </Pressable>
                ))}
              </View>
              )}
              <TextLink label={t('Annuler', 'Cancel')} onPress={closePeek} color={T.encreDouce} />
            </>
          ) : !peekRevealed ? (
            <>
              <Heading kicker={P(peekPlayer)} title={t('Personne ne regarde ?', 'Nobody looking?')} sub={t('Touchez le bouton pour voir votre mot.', 'Tap the button to see your word.')} />
              <PrimaryButton label={t('Voir mon mot', 'See my word')} onPress={() => setPeekRevealed(true)} />
              <TextLink label={t('Annuler', 'Cancel')} onPress={closePeek} color={T.encreDouce} />
            </>
          ) : (
            <>
              <WordCard role={peekRole} themeName={themeName} />
              <PrimaryButton label={t('Fermer', 'Close')} onPress={closePeek} />
            </>
          )}
        </Overlay>
      )}

      {winner && (
        <Overlay>
          <Heading
            kicker={t('Fin de partie', 'Game over')}
            title={winner === 'spies' ? t('Les espions gagnent', 'The spies win') : winner === 'civilians' ? t('Les villageois gagnent', 'The civilians win') : t('Voici qui était qui', 'Here’s who was who')}
            sub={winner === 'spies' ? t('Les espions sont en majorité : la mission est compromise.', 'The spies are the majority: the mission is compromised.') : winner === 'civilians' ? t('Tous les espions ont été démasqués.', 'Every spy has been unmasked.') : null}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={[styles.wordBox, { borderColor: '#7CC4FF' }]}>
              <Text style={styles.kicker}>{t('VILLAGEOIS', 'CIVILIANS')}</Text>
              <Text style={styles.wordSmall}>{civilianWord ?? '—'}</Text>
            </View>
            <View style={[styles.wordBox, { borderColor: T.alerte }]}>
              <Text style={[styles.kicker, { color: T.alerte }]}>{t('ESPION', 'SPY')}</Text>
              <Text style={styles.wordSmall}>{undercoverWord ?? '—'}</Text>
            </View>
          </View>
          <View style={styles.revealList}>
            {roles.map((r, i) => (
              <View key={i} style={styles.revealChip}>
                <Text style={styles.revealNum}>{names ? P(i) : `${t('J', 'P')}${i + 1}`}</Text>
                <Text style={[styles.revealRole, { color: ROLE_CONFIG[r.type].color }]}>{roleName(r.type)}</Text>
                {eliminated.has(i) ? <Icon name="close" size={12} color={T.encreDouce} /> : null}
              </View>
            ))}
          </View>
          {dansLaSoiree(GAME) ? <SoireeActions navigation={navigation} game={GAME} /> : (
            <>
              <PrimaryButton label={t('Rejouer', 'Play again')} onPress={onReplay} />
              <TextLink label={t('Retour aux jeux', 'Back to games')} onPress={onBackToMenu} />
            </>
          )}
        </Overlay>
      )}
    </View>
  );
}

// ── Distribution des mots ──
export default function UndercoverDistributeScreen({ navigation, route }) {
  const { playerCount, wordPair, undercoverCount, hasMrWhite, themeName, playerNames: names = null } = route.params;
  const P = nommer(names);
  const tok = jeton(names);

  const [roles] = useState(() => distributeRoles(playerCount, wordPair, undercoverCount, hasMrWhite));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [phase, setPhase] = useState('waiting'); // 'waiting' | 'revealed' | 'gameboard'
  const quit = () => goBackOrMenu(navigation);

  if (phase === 'gameboard') {
    return (
      <GameBoard
        roles={roles}
        names={names}
        navigation={navigation}
        themeName={themeName}
        onQuit={quit}
        onBackToMenu={() => navigation.navigate('Menu')}
        onReplay={() => navigation.navigate('UndercoverSetup', { replay: Date.now() })}
      />
    );
  }

  const role = roles[currentPlayer];
  const isLast = currentPlayer === playerCount - 1;
  const handleNext = () => {
    if (isLast) { setPhase('gameboard'); return; }
    setCurrentPlayer((p) => p + 1);
    setPhase('waiting');
  };

  return (
    <GameScreen
      top={<GameTopBar game={GAME} onBack={quit} current={currentPlayer + 1} total={playerCount} />}
      footer={(
        <ActionBar note={phase === 'waiting' ? t('Prenez le téléphone seul.', 'Take the phone alone.') : t('Mémorisez-le, puis passez le téléphone.', 'Memorise it, then pass the phone on.')}>
          {phase === 'waiting'
            ? <PrimaryButton label={t('Révéler mon mot', 'Reveal my word')} onPress={() => { retour('carte'); setPhase('revealed'); }} />
            : <PrimaryButton label={isLast ? t('Tout le monde a vu', 'Everyone has seen it') : (names ? `${t('À', 'To')} ${P(currentPlayer + 1)}` : `${t('Au joueur', 'To player')} ${currentPlayer + 2}`)} onPress={handleNext} />}
        </ActionBar>
      )}
    >
      {phase === 'waiting' ? (
        <View style={{ alignItems: 'center', gap: 22, paddingTop: 12 }}>
          <View style={styles.card}>
            <View style={[styles.cardInner, { paddingVertical: 34 }]}>
              <Text style={styles.kicker}>{t('DISTRIBUTION SECRÈTE', 'SECRET HANDOUT')}</Text>
              <PlayerToken name={tok(currentPlayer)} index={currentPlayer} size={88} />
              <Text style={styles.word}>{P(currentPlayer)}</Text>
              <View style={styles.rule} />
              <Text style={styles.kicker}>{currentPlayer + 1} {t('SUR', 'OF')} {playerCount}</Text>
            </View>
          </View>
          <Heading title={names ? `${t('Passez le téléphone à', 'Pass the phone to')} ${P(currentPlayer)}` : `${t('Passez le téléphone au joueur', 'Pass the phone to player')} ${currentPlayer + 1}`} sub={t('Les autres joueurs détournent le regard.', 'Everyone else looks away.')} />
        </View>
      ) : (
        <WordCard role={role} themeName={themeName} />
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  counter: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2.2 },
  sub: { color: T.encreDouce, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  card: { width: '100%', maxWidth: 340, alignSelf: 'center', borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  cardInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', gap: 12 },
  word: { color: T.encre, fontFamily: F.affiche, fontSize: 36, lineHeight: 42, textAlign: 'center' },
  rule: { width: 56, height: 1, backgroundColor: 'rgba(212,175,55,0.5)' },
  cardNote: { color: T.encreDouce, fontSize: 13 },
  cardMsg: { color: T.encre, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  charImage: { width: 180, height: 180, borderRadius: 12, overflow: 'hidden' },

  starter: { borderRadius: 14, borderWidth: 1, borderColor: T.or, backgroundColor: T.orVoile, padding: 16, alignItems: 'center', gap: 4 },
  starterName: { color: T.encre, fontFamily: F.affiche, fontSize: 30, lineHeight: 36 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seat: { flexBasis: '30%', flexGrow: 1, minHeight: 104, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.carte, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8 },
  seatOut: { opacity: 0.55, borderColor: T.trait, backgroundColor: 'transparent' },
  seatName: { color: T.encre, fontFamily: F.texteFort, fontSize: 14 },
  seatState: { color: T.encreDouce, fontSize: 12 },

  peekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  peekBtn: { width: 56, height: 56, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  peekNum: { fontFamily: F.chiffre, fontSize: 20 },

  wordBox: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center', gap: 6 },
  wordSmall: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 22, textAlign: 'center' },
  revealList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  revealChip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: T.trait },
  revealNum: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 12 },
  revealRole: { fontFamily: F.texteMoyen, fontSize: 13 },
});
