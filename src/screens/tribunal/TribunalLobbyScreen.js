import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { GOLD, GOLD_DARK, GOLD_LIGHT, OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';

const BG = OB_BG;
const MIN_PLAYERS = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TribunalLobbyScreen({ navigation, route }) {
  const { roomId, playerId, isHost } = route.params;
  const [players,  setPlayers]  = useState([]);
  const [room,     setRoom]     = useState(null);
  const [starting, setStarting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    load();
    channelRef.current = supabase
      .channel(`tribunal_lobby:${roomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tribunal_players', filter: `room_id=eq.${roomId}` },
        () => load()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tribunal_rooms', filter: `id=eq.${roomId}` },
        ({ new: r }) => {
          setRoom(r);
          if (r.status === 'writing') navigation.replace('TribunalGame', { roomId, playerId });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channelRef.current); };
  }, []);

  const load = async () => {
    const [{ data: ps }, { data: r }] = await Promise.all([
      supabase.from('tribunal_players').select().eq('room_id', roomId).order('created_at'),
      supabase.from('tribunal_rooms').select().eq('id', roomId).single(),
    ]);
    if (ps) setPlayers(ps);
    if (r)  setRoom(r);
  };

  const handleStart = async () => {
    if (players.length < MIN_PLAYERS) return;
    setStarting(true);
    try {
      const shuffled = shuffle(players);
      const n = shuffled.length;
      // Assign circular targets: player[i] writes about player[(i+1)%n]
      await Promise.all(shuffled.map((p, i) =>
        supabase.from('tribunal_players').update({
          turn_order: i,
          target_id: shuffled[(i + 1) % n].id,
        }).eq('id', p.id)
      ));
      await supabase.from('tribunal_rooms').update({ status: 'writing' }).eq('id', roomId);
    } catch {
      setStarting(false);
    }
  };

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>⚖️ SALLE D'ATTENTE</Text>

        {/* Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>CODE DE LA SALLE</Text>
          <Text style={styles.code}>{room?.code ?? '…'}</Text>
          <Text style={styles.codeHint}>Partage ce code avec tes amis</Text>
        </View>

        {/* Joueurs */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>JURÉS CONNECTÉS ({players.length})</Text>
          {players.map(p => (
            <View key={p.id} style={[styles.playerRow, p.id === playerId && styles.playerRowMe]}>
              <Text style={styles.playerEmoji}>{p.is_host ? '👑' : '⚖️'}</Text>
              <Text style={[styles.playerName, p.id === playerId && { color: GOLD_LIGHT }]}>
                {p.name}{p.id === playerId ? ' (toi)' : ''}
              </Text>
            </View>
          ))}
          {players.length < MIN_PLAYERS && (
            <Text style={styles.waitMinText}>
              Minimum {MIN_PLAYERS} joueurs requis ({players.length}/{MIN_PLAYERS})
            </Text>
          )}
        </View>

        {/* Rappel des règles */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>📜 Rappel</Text>
          <Text style={styles.rulesText}>
            Chacun recevra le nom d'un autre joueur et devra écrire une vérité sur lui.{'\n'}
            Ensuite, chaque accusé devra convaincre le jury que c'est faux !
          </Text>
        </View>

        {isHost ? (
          <TouchableOpacity
            style={[styles.startBtn, (players.length < MIN_PLAYERS || starting) && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={players.length < MIN_PLAYERS || starting}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[GOLD, GOLD_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              {starting
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.startBtnText}>⚖️ LANCER LE TRIBUNAL</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitBanner}>
            <ActivityIndicator color={GOLD} />
            <Text style={styles.waitBannerText}>En attente que l'hôte lance le tribunal…</Text>
          </View>
        )}

        <TouchableOpacity style={styles.leaveBtn} onPress={async () => {
          await supabase.from('tribunal_players').delete().eq('id', playerId);
          navigation.navigate('Menu');
        }}>
          <Text style={styles.leaveBtnText}>Quitter</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { padding: spacing.lg, paddingTop: 50, paddingBottom: spacing.xxl },
  title: { fontSize: 22, fontWeight: '900', color: GOLD_LIGHT, textAlign: 'center', letterSpacing: 3, marginBottom: spacing.xl },
  codeCard: {
    backgroundColor: GOLD + '22', borderRadius: radius.xl, borderWidth: 1, borderColor: GOLD + '55',
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl,
  },
  codeLabel: { fontSize: 11, fontWeight: '800', color: GOLD_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  code: { fontSize: 56, fontWeight: '900', color: colors.text, letterSpacing: 12 },
  codeHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md },
  playerRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  playerRowMe: { borderColor: GOLD + '66' },
  playerEmoji: { fontSize: 20 },
  playerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  waitMinText: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, fontStyle: 'italic' },
  rulesCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border,
  },
  rulesTitle: { fontSize: 13, fontWeight: '800', color: GOLD_LIGHT, marginBottom: spacing.sm },
  rulesText: { fontSize: 13, color: colors.textSecondary, lineHeight: 22 },
  startBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.md },
  startBtnDisabled: { opacity: 0.4 },
  startBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  startBtnText: { fontSize: 15, fontWeight: '900', color: '#000', letterSpacing: 2 },
  waitBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.md, paddingVertical: spacing.lg,
  },
  waitBannerText: { color: colors.textSecondary, fontSize: 14 },
  leaveBtn: { alignItems: 'center', paddingVertical: spacing.md },
  leaveBtnText: { color: colors.textMuted, fontSize: 13 },
});
