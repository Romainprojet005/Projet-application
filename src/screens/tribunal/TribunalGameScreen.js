import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { GOLD, GOLD_DARK, GOLD_LIGHT, OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';

const CRIMSON    = '#EF4444';
const GREEN      = '#10B981';
const BG = OB_BG;

export default function TribunalGameScreen({ navigation, route }) {
  const { roomId, playerId } = route.params;

  const [room,          setRoom]          = useState(null);
  const [players,       setPlayers]       = useState([]);
  const [writings,      setWritings]      = useState([]);
  const [myWritingText, setMyWritingText] = useState('');
  const [guessedId,     setGuessedId]     = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  const roomRef     = useRef(null);
  const playersRef  = useRef([]);
  const writingsRef = useRef([]);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { writingsRef.current = writings; }, [writings]);
  // Reset accused's guess when defendant changes
  useEffect(() => { setGuessedId(null); }, [room?.current_accused_idx]);

  useEffect(() => {
    loadState();
    const ch = supabase
      .channel(`tribunal:${roomId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tribunal_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          roomRef.current = r;
          if (r.status === 'lobby') {
            const me = playersRef.current.find(p => p.id === playerId);
            navigation.replace('TribunalLobby', { roomId, playerId, isHost: me?.is_host ?? false });
            return;
          }
          if ((r.status === 'trial' || r.status === 'finished') && writingsRef.current.length === 0) {
            loadWritings();
          }
          checkAutoAdvance(r, playersRef.current);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tribunal_players', filter: `room_id=eq.${roomId}` },
        () => reloadPlayers()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const loadState = async () => {
    const [{ data: r }, { data: ps }] = await Promise.all([
      supabase.from('tribunal_rooms').select().eq('id', roomId).single(),
      supabase.from('tribunal_players').select().eq('room_id', roomId).order('turn_order'),
    ]);
    if (r)  { setRoom(r);    roomRef.current    = r;  }
    if (ps) { setPlayers(ps); playersRef.current = ps; }
    if (r?.status === 'trial' || r?.status === 'finished') await loadWritings();
    if (r && ps) checkAutoAdvance(r, ps);
  };

  const loadWritings = async () => {
    const { data } = await supabase.from('tribunal_writings').select().eq('room_id', roomId);
    if (data) { setWritings(data); writingsRef.current = data; }
  };

  const reloadPlayers = async () => {
    const { data: ps } = await supabase.from('tribunal_players').select().eq('room_id', roomId).order('turn_order');
    if (ps) {
      setPlayers(ps);
      playersRef.current = ps;
      checkAutoAdvance(roomRef.current, ps);
    }
  };

  const checkAutoAdvance = async (r, ps) => {
    if (!r) return;

    // All written → start trial
    if (r.status === 'writing' && ps.length > 0 && ps.every(p => p.has_written)) {
      const { data } = await supabase.from('tribunal_rooms').update({
        status: 'trial', trial_phase: 'defense', current_accused_idx: 0,
      }).eq('id', roomId).eq('status', 'writing').select();
      if (data && data.length > 0) await loadWritings();
    }

    // All voted → reveal
    if (r.status === 'trial' && r.trial_phase === 'voting') {
      const accused = ps.find(p => p.turn_order === r.current_accused_idx);
      if (!accused) return;
      const voters = ps.filter(p => p.id !== accused.id);
      if (voters.length > 0 && voters.every(p => p.has_voted)) {
        await supabase.from('tribunal_rooms').update({ trial_phase: 'reveal' })
          .eq('id', roomId).eq('trial_phase', 'voting');
      }
    }
  };

  const handleSubmitWriting = async () => {
    if (!myWritingText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const myPlayer = players.find(p => p.id === playerId);
      if (!myPlayer) return;
      await supabase.from('tribunal_writings').insert({
        room_id: roomId, author_id: playerId,
        target_id: myPlayer.target_id, content: myWritingText.trim(),
      });
      await supabase.from('tribunal_players').update({ has_written: true }).eq('id', playerId);
    } finally { setSubmitting(false); }
  };

  const handleDefenseDone = async () => {
    await supabase.from('tribunal_rooms')
      .update({ trial_phase: 'voting' })
      .eq('id', roomId).eq('trial_phase', 'defense');
  };

  const handleVote = async (voteVal) => {
    await supabase.from('tribunal_players')
      .update({ vote: voteVal, has_voted: true })
      .eq('id', playerId);
  };

  const handleReplay = async () => {
    await supabase.from('tribunal_writings').delete().eq('room_id', roomId);
    await supabase.from('tribunal_players')
      .update({ has_written: false, malus: 0, vote: null, has_voted: false })
      .eq('room_id', roomId);
    await supabase.from('tribunal_rooms')
      .update({ status: 'lobby', trial_phase: null, current_accused_idx: 0 })
      .eq('id', roomId);
  };

  const handleContinue = async () => {
    if (!room) return;
    const ps = playersRef.current;
    const accused = ps.find(p => p.turn_order === room.current_accused_idx);
    if (!accused) return;
    const voters      = ps.filter(p => p.id !== accused.id);
    const trueVotes   = voters.filter(p => p.vote === 'vrai').length;
    const falseVotes  = voters.filter(p => p.vote === 'faux').length;
    const accusedWins = falseVotes > trueVotes;
    const nextIdx     = room.current_accused_idx + 1;
    const isLast      = nextIdx >= ps.length;

    // Atomic advance — only the first caller succeeds
    const { data } = await supabase.from('tribunal_rooms').update({
      status: isLast ? 'finished' : 'trial',
      current_accused_idx: isLast ? room.current_accused_idx : nextIdx,
      trial_phase: 'defense',
    }).eq('id', roomId).eq('trial_phase', 'reveal').select();

    if (data && data.length > 0) {
      // Apply malus if accused didn't win
      if (!accusedWins) {
        await supabase.from('tribunal_players')
          .update({ malus: accused.malus + 1 }).eq('id', accused.id);
      }
      // Reset votes for next round
      if (!isLast) {
        await Promise.all(ps.map(p =>
          supabase.from('tribunal_players').update({ vote: null, has_voted: false }).eq('id', p.id)
        ));
      }
    }
  };

  // ── LOADING ───────────────────────────────────────────────────────
  if (!room) {
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <View style={styles.centered}><ActivityIndicator color={GOLD} size="large" /></View>
      </LinearGradient>
    );
  }

  const myPlayer      = players.find(p => p.id === playerId);
  const byTurn        = [...players].sort((a, b) => a.turn_order - b.turn_order);
  const currentAccused = byTurn[room.current_accused_idx];
  const amAccused     = currentAccused?.id === playerId;
  const accusation    = writings.find(w => w.target_id === currentAccused?.id);
  const realAuthor    = players.find(p => p.id === accusation?.author_id);
  const nonAccused    = players.filter(p => p.id !== currentAccused?.id);
  const voters        = players.filter(p => p.id !== currentAccused?.id);

  // ── WRITING ───────────────────────────────────────────────────────
  if (room.status === 'writing') {
    if (myPlayer?.has_written) {
      const remaining = players.filter(p => !p.has_written).length;
      return (
        <LinearGradient colors={BG} style={styles.container}>
          <View style={styles.centered}>
            <Text style={styles.bigEmoji}>✍️</Text>
            <Text style={styles.phaseTitle}>Accusation envoyée !</Text>
            <Text style={styles.phaseSub}>
              En attente de {remaining} autre{remaining > 1 ? 's' : ''} joueur{remaining > 1 ? 's' : ''}…
            </Text>
            <View style={styles.dotsRow}>
              {players.map(p => (
                <View key={p.id} style={[styles.dot, p.has_written && styles.dotDone]} />
              ))}
            </View>
          </View>
        </LinearGradient>
      );
    }

    const targetName = players.find(p => p.id === myPlayer?.target_id)?.name ?? '…';
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepBadge}>PHASE 1 — ACCUSATION</Text>

          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>Tu dois écrire une vérité sur</Text>
            <Text style={styles.targetName}>{targetName}</Text>
          </View>

          <View style={styles.hintCard}>
            <Text style={styles.hintText}>
              💡 Écris quelque chose de <Text style={{ color: GOLD_LIGHT, fontWeight: '900' }}>vrai</Text> que
              les autres pourraient nier. Il devra convaincre le jury que c'est faux !
            </Text>
          </View>

          <TextInput
            style={styles.writingInput}
            placeholder={`Une vérité sur ${targetName}…`}
            placeholderTextColor={colors.textMuted}
            value={myWritingText}
            onChangeText={setMyWritingText}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{myWritingText.length}/200</Text>

          <TouchableOpacity
            style={[styles.mainBtn, (!myWritingText.trim() || submitting) && styles.mainBtnDisabled]}
            onPress={handleSubmitWriting}
            disabled={!myWritingText.trim() || submitting}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[GOLD, GOLD_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
              {submitting
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.mainBtnText}>⚖️ SOUMETTRE AU TRIBUNAL</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── DEFENSE ───────────────────────────────────────────────────────
  if (room.status === 'trial' && room.trial_phase === 'defense') {
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
          {/* Progress */}
          <View style={styles.trialProgress}>
            <Text style={styles.trialProgressLabel}>Accusé {room.current_accused_idx + 1} / {players.length}</Text>
            <View style={styles.dotsRow}>
              {byTurn.map((_, i) => (
                <View key={i} style={[
                  styles.trialDot,
                  i < room.current_accused_idx && { backgroundColor: CRIMSON + '88' },
                  i === room.current_accused_idx && { backgroundColor: GOLD, transform: [{ scale: 1.3 }] },
                  i > room.current_accused_idx && { backgroundColor: colors.border },
                ]} />
              ))}
            </View>
          </View>

          <Text style={styles.phaseLabel}>⚖️ AUDIENCE</Text>

          <View style={styles.accusedBanner}>
            <Text style={styles.accusedBannerSub}>Sur le banc des accusés</Text>
            <Text style={styles.accusedBannerName}>{currentAccused?.name}</Text>
          </View>

          <View style={styles.accusationCard}>
            <Text style={styles.accusationLabel}>L'ACCUSATION</Text>
            <Text style={styles.accusationText}>« {accusation?.content ?? '…'} »</Text>
          </View>

          {amAccused ? (
            <>
              <Text style={styles.sectionTitle}>🤔 Qui penses-tu que c'est ?</Text>
              <View style={styles.guessRow}>
                {nonAccused.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.guessBtn, guessedId === p.id && styles.guessBtnActive]}
                    onPress={() => setGuessedId(prev => prev === p.id ? null : p.id)}
                  >
                    <Text style={[styles.guessBtnText, guessedId === p.id && styles.guessBtnTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.defenseHint}>
                <Text style={styles.defenseHintText}>
                  🎤 Dis à voix haute pourquoi c'est FAUX !{'\n'}Convaincs le jury…
                </Text>
              </View>

              <TouchableOpacity style={styles.mainBtn} onPress={handleDefenseDone} activeOpacity={0.8}>
                <LinearGradient colors={[GOLD, GOLD_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                  <Text style={styles.mainBtnText}>🗳️ LE JURY VA VOTER !</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.waitBox}>
              <Text style={styles.waitEmoji}>🎤</Text>
              <Text style={styles.waitTitle}>{currentAccused?.name} plaide sa cause…</Text>
              <Text style={styles.waitSub}>Écoutez sa défense, vous voterez bientôt.</Text>
              <ActivityIndicator color={GOLD} style={{ marginTop: spacing.lg }} />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── VOTING ────────────────────────────────────────────────────────
  if (room.status === 'trial' && room.trial_phase === 'voting') {
    if (amAccused) {
      const voted = voters.filter(p => p.has_voted).length;
      return (
        <LinearGradient colors={BG} style={styles.container}>
          <View style={styles.centered}>
            <Text style={styles.bigEmoji}>⚖️</Text>
            <Text style={styles.phaseTitle}>Le jury délibère…</Text>
            <Text style={styles.phaseSub}>{voted} / {voters.length} votes reçus</Text>
            <View style={styles.dotsRow}>
              {voters.map(p => (
                <View key={p.id} style={[styles.dot, p.has_voted && styles.dotDone]} />
              ))}
            </View>
          </View>
        </LinearGradient>
      );
    }

    const myVote = myPlayer?.has_voted ? myPlayer.vote : null;
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
          <Text style={styles.phaseLabel}>🗳️ VOTE DU JURY</Text>

          <View style={styles.accusedBanner}>
            <Text style={styles.accusedBannerSub}>L'accusé(e)</Text>
            <Text style={styles.accusedBannerName}>{currentAccused?.name}</Text>
          </View>

          <View style={styles.accusationCard}>
            <Text style={styles.accusationLabel}>L'ACCUSATION</Text>
            <Text style={styles.accusationText}>« {accusation?.content ?? '…'} »</Text>
          </View>

          {myVote ? (
            <View style={styles.votedBox}>
              <Text style={styles.bigEmoji}>{myVote === 'faux' ? '❌' : '✅'}</Text>
              <Text style={styles.votedText}>
                Tu as voté : {myVote === 'faux' ? '"C\'est faux !"' : '"C\'est vrai !"'}
              </Text>
              <Text style={styles.phaseSub}>En attente des autres jurés…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.voteQuestion}>L'accusation est-elle vraie ?</Text>
              <View style={styles.voteRow}>
                <TouchableOpacity
                  style={[styles.voteBtn, { borderColor: GREEN + '88', backgroundColor: GREEN + '1A' }]}
                  onPress={() => handleVote('faux')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.voteBtnEmoji}>❌</Text>
                  <Text style={[styles.voteBtnText, { color: GREEN }]}>C'est FAUX !</Text>
                  <Text style={styles.voteBtnSub}>{currentAccused?.name} a raison</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.voteBtn, { borderColor: CRIMSON + '88', backgroundColor: CRIMSON + '1A' }]}
                  onPress={() => handleVote('vrai')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.voteBtnEmoji}>✅</Text>
                  <Text style={[styles.voteBtnText, { color: CRIMSON }]}>C'est VRAI !</Text>
                  <Text style={styles.voteBtnSub}>{currentAccused?.name} ment !</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── REVEAL ────────────────────────────────────────────────────────
  if (room.status === 'trial' && room.trial_phase === 'reveal') {
    const trueVotes   = voters.filter(p => p.vote === 'vrai').length;
    const falseVotes  = voters.filter(p => p.vote === 'faux').length;
    const accusedWins = falseVotes > trueVotes;
    const isTie       = trueVotes === falseVotes;
    const verdictColor = isTie ? GOLD : accusedWins ? GREEN : CRIMSON;

    return (
      <LinearGradient colors={BG} style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
          <Text style={styles.phaseLabel}>📜 VERDICT</Text>

          {/* Verdict card */}
          <View style={[styles.verdictCard, { borderColor: verdictColor + '77', backgroundColor: verdictColor + '18' }]}>
            <Text style={styles.bigEmoji}>{isTie ? '⚖️' : accusedWins ? '🎉' : '💀'}</Text>
            <Text style={[styles.verdictTitle, { color: isTie ? GOLD_LIGHT : accusedWins ? GREEN : CRIMSON }]}>
              {isTie
                ? 'Égalité parfaite !'
                : accusedWins
                  ? `${currentAccused?.name} est acquitté(e) !`
                  : `${currentAccused?.name} est COUPABLE !`}
            </Text>
            <Text style={styles.verdictSub}>
              {isTie
                ? 'Le jury est divisé — pas de malus'
                : accusedWins
                  ? 'Majorité "C\'est faux" — pas de malus !'
                  : `+1 point de malus pour ${currentAccused?.name}`}
            </Text>
          </View>

          {/* Scores votes */}
          <View style={styles.voteBreakdown}>
            <View style={[styles.voteCount, { borderColor: GREEN + '55' }]}>
              <Text style={[styles.voteCountNum, { color: GREEN }]}>{falseVotes}</Text>
              <Text style={styles.voteCountLabel}>C'est FAUX</Text>
            </View>
            <View style={[styles.voteCount, { borderColor: CRIMSON + '55' }]}>
              <Text style={[styles.voteCountNum, { color: CRIMSON }]}>{trueVotes}</Text>
              <Text style={styles.voteCountLabel}>C'est VRAI</Text>
            </View>
          </View>

          {/* Détail des votes */}
          <View style={styles.voteDetail}>
            <Text style={styles.voteDetailTitle}>VOTES DU JURY</Text>
            {voters.map(p => (
              <View key={p.id} style={styles.voteDetailRow}>
                <Text style={styles.voteDetailName}>{p.name}</Text>
                <Text style={[styles.voteDetailVal, { color: p.vote === 'faux' ? GREEN : CRIMSON }]}>
                  {p.vote === 'faux' ? '❌ C\'est faux !' : '✅ C\'est vrai !'}
                </Text>
              </View>
            ))}
          </View>

          {/* Révélation de l'auteur */}
          <View style={styles.authorReveal}>
            <Text style={styles.authorRevealText}>
              ✍️ C'est <Text style={{ color: GOLD_LIGHT, fontWeight: '900' }}>{realAuthor?.name}</Text> qui a écrit ça !
            </Text>
            {amAccused && guessedId && (
              <Text style={[styles.guessResult, { color: guessedId === realAuthor?.id ? GREEN : CRIMSON }]}>
                {guessedId === realAuthor?.id
                  ? '🎯 Tu avais deviné juste !'
                  : `❌ Tu pensais que c'était ${players.find(p => p.id === guessedId)?.name}…`}
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.mainBtn} onPress={handleContinue} activeOpacity={0.8}>
            <LinearGradient colors={[GOLD, GOLD_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
              <Text style={styles.mainBtnText}>
                {room.current_accused_idx + 1 >= players.length ? '🏁 RÉSULTATS FINAUX' : '▶ ACCUSÉ SUIVANT'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── FINISHED ──────────────────────────────────────────────────────
  if (room.status === 'finished') {
    const sortedByMalus = [...players].sort((a, b) => a.malus - b.malus);
    const maxMalus = Math.max(...players.map(p => p.malus), 0);
    const winner = sortedByMalus[0];

    return (
      <LinearGradient colors={BG} style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
          <Text style={styles.finalTitle}>⚖️ JUGEMENT FINAL</Text>
          <Text style={styles.finalSub}>Le tribunal a rendu son verdict !</Text>

          {sortedByMalus.map((p, i) => {
            const isWinner = i === 0 && p.malus === 0;
            const isLoser  = p.malus === maxMalus && maxMalus > 0 && i === sortedByMalus.length - 1;
            return (
              <View
                key={p.id}
                style={[
                  styles.finalRow,
                  isWinner && { borderColor: GREEN + '66', backgroundColor: GREEN + '12' },
                  isLoser  && { borderColor: CRIMSON + '66', backgroundColor: CRIMSON + '12' },
                  p.id === playerId && { borderColor: GOLD + '66' },
                ]}
              >
                <Text style={styles.finalRank}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </Text>
                <Text style={styles.finalName}>{p.name}{p.id === playerId ? ' (toi)' : ''}</Text>
                <View style={[
                  styles.malusBadge,
                  p.malus === 0
                    ? { backgroundColor: GREEN + '25', borderColor: GREEN + '55' }
                    : { backgroundColor: CRIMSON + '25', borderColor: CRIMSON + '55' },
                ]}>
                  <Text style={[styles.malusText, { color: p.malus === 0 ? GREEN : CRIMSON }]}>
                    {p.malus} malus
                  </Text>
                </View>
              </View>
            );
          })}

          <View style={styles.finalComment}>
            <Text style={styles.finalCommentText}>
              {winner?.malus === 0
                ? `🏆 ${winner.name} n'a aucun malus — le jury était convaincu !`
                : `💀 ${sortedByMalus[sortedByMalus.length - 1].name} n'a convaincu personne…`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.mainBtn, { marginBottom: spacing.sm }]}
            onPress={handleReplay}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[GOLD, GOLD_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
              <Text style={styles.mainBtnText}>🔄 REJOUER</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.menuBtnText}>← Retour au menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { padding: spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: spacing.xxl },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  bigEmoji: { fontSize: 64, textAlign: 'center' },
  phaseTitle: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center' },
  phaseSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  dotsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border },
  dotDone: { backgroundColor: GREEN },

  // Writing
  stepBadge: { fontSize: 11, fontWeight: '900', color: GOLD, letterSpacing: 2, textAlign: 'center', marginBottom: spacing.xl },
  targetCard: {
    backgroundColor: GOLD + '22', borderRadius: radius.xl, borderWidth: 1, borderColor: GOLD + '55',
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
  },
  targetLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  targetName: { fontSize: 32, fontWeight: '900', color: GOLD_LIGHT, textAlign: 'center' },
  hintCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  hintText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  writingInput: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: GOLD + '44',
    padding: spacing.lg, fontSize: 16, color: colors.text, minHeight: 120,
    textAlignVertical: 'top', marginBottom: spacing.xs,
  },
  charCount: { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginBottom: spacing.xl },

  // Trial shared
  trialProgress: { alignItems: 'center', marginBottom: spacing.xl },
  trialProgressLabel: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, letterSpacing: 1 },
  trialDot: { width: 10, height: 10, borderRadius: 5 },
  phaseLabel: { fontSize: 11, fontWeight: '900', color: GOLD, letterSpacing: 3, textAlign: 'center', marginBottom: spacing.lg },
  accusedBanner: {
    backgroundColor: GOLD + '18', borderRadius: radius.xl, borderWidth: 1, borderColor: GOLD + '44',
    padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg,
  },
  accusedBannerSub: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs },
  accusedBannerName: { fontSize: 28, fontWeight: '900', color: GOLD_LIGHT },
  accusationCard: {
    backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: GOLD + '44',
    padding: spacing.xl, marginBottom: spacing.xl,
  },
  accusationLabel: { fontSize: 10, fontWeight: '900', color: GOLD, letterSpacing: 2, marginBottom: spacing.md, textAlign: 'center' },
  accusationText: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 26, fontStyle: 'italic' },

  // Defense
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  guessRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  guessBtn: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
  guessBtnActive: { backgroundColor: GOLD + '33', borderColor: GOLD },
  guessBtnText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  guessBtnTextActive: { color: GOLD_LIGHT },
  defenseHint: {
    backgroundColor: GOLD + '18', borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: GOLD + '33',
  },
  defenseHintText: { fontSize: 14, color: GOLD_LIGHT, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
  waitBox: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  waitEmoji: { fontSize: 52 },
  waitTitle: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center' },
  waitSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },

  // Voting
  voteQuestion: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.xl },
  voteRow: { flexDirection: 'row', gap: spacing.md },
  voteBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
    borderRadius: radius.xl, borderWidth: 1.5, gap: spacing.xs, minHeight: 130,
  },
  voteBtnEmoji: { fontSize: 36 },
  voteBtnText: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  voteBtnSub: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  votedBox: {
    alignItems: 'center', padding: spacing.xl, gap: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
  },
  votedText: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },

  // Reveal
  verdictCard: {
    borderRadius: radius.xl, borderWidth: 2, padding: spacing.xl,
    alignItems: 'center', marginBottom: spacing.lg, gap: spacing.sm,
  },
  verdictTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  verdictSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  voteBreakdown: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  voteCount: {
    flex: 1, alignItems: 'center', padding: spacing.lg,
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
  },
  voteCountNum: { fontSize: 40, fontWeight: '900' },
  voteCountLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '700' },
  voteDetail: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: spacing.md, marginBottom: spacing.lg,
  },
  voteDetailTitle: { fontSize: 10, fontWeight: '900', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.sm },
  voteDetailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border,
  },
  voteDetailName: { fontSize: 15, fontWeight: '700', color: colors.text },
  voteDetailVal: { fontSize: 14, fontWeight: '800' },
  authorReveal: {
    backgroundColor: GOLD + '18', borderRadius: radius.lg, borderWidth: 1, borderColor: GOLD + '44',
    padding: spacing.lg, marginBottom: spacing.xl, alignItems: 'center', gap: spacing.sm,
  },
  authorRevealText: { fontSize: 16, fontWeight: '700', color: GOLD_LIGHT, textAlign: 'center' },
  guessResult: { fontSize: 14, fontWeight: '700', textAlign: 'center' },

  // Finished
  finalTitle: { fontSize: 28, fontWeight: '900', color: GOLD_LIGHT, textAlign: 'center', marginBottom: spacing.xs },
  finalSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  finalRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md,
  },
  finalRank: { fontSize: 24, width: 36 },
  finalName: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.text },
  malusBadge: {
    borderRadius: radius.full, paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  malusText: { fontSize: 13, fontWeight: '900' },
  finalComment: {
    backgroundColor: GOLD + '15', borderRadius: radius.lg, borderWidth: 1, borderColor: GOLD + '30',
    padding: spacing.lg, marginBottom: spacing.xl, alignItems: 'center',
  },
  finalCommentText: { fontSize: 15, fontWeight: '700', color: GOLD_LIGHT, textAlign: 'center' },

  // Buttons
  mainBtn: { borderRadius: radius.full, overflow: 'hidden' },
  mainBtnDisabled: { opacity: 0.4 },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: '#000', letterSpacing: 2 },
  menuBtn: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  menuBtnText: { fontSize: 14, color: GOLD_LIGHT, fontWeight: '600' },
});
