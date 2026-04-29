import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';
import { CATEGORIES } from '../../data/blindTestSongs';

const BEAT       = '#10B981';
const BEAT_DARK  = '#059669';
const BEAT_LIGHT = '#6EE7B7';
const BG = ['#001A0F', '#00110A', '#001A0F'];

const SONG_OPTIONS = [5, 10, 15, 20];
const TIME_OPTIONS = [30, null]; // null = infini

function generateCode() {
  return Array.from({ length: 4 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]
  ).join('');
}

function getDeviceId() {
  try {
    const store = typeof localStorage !== 'undefined' ? localStorage : sessionStorage;
    let id = store.getItem('blind_device_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      store.setItem('blind_device_id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export default function BlindMultiSetupScreen({ navigation }) {
  const [tab, setTab]             = useState('create');
  const [name, setName]           = useState('');
  const [joinCode, setJoinCode]   = useState('');
  const [categoryId, setCategoryId] = useState('france');
  const [songCount, setSongCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading]     = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const code = generateCode();
      const { data: room, error: rErr } = await supabase
        .from('blind_rooms')
        .insert({ code, category_id: categoryId, song_count: songCount, time_limit: timeLimit })
        .select()
        .single();
      if (rErr) throw rErr;

      const { data: player, error: pErr } = await supabase
        .from('blind_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('BlindMultiLobby', { roomId: room.id, playerId: player.id, isHost: true });
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || joinCode.length < 4) return;
    setLoading(true);
    try {
      const { data: room, error: rErr } = await supabase
        .from('blind_rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifie le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');

      const { data: player, error: pErr } = await supabase
        .from('blind_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('BlindMultiLobby', { roomId: room.id, playerId: player.id, isHost: false });
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        style={Platform.OS === 'web' && { height: '100vh' }}
      >
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('BlindTestSetup')}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🎸 BLIND TEST MULTI</Text>
        <Text style={styles.subtitle}>Chaque joueur devine sur son téléphone !</Text>

        <View style={styles.tabs}>
          {['create', 'join'].map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'create' ? '➕ Créer' : '🔑 Rejoindre'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>TON PRÉNOM</Text>
          <TextInput
            style={styles.input}
            placeholder="Entre ton prénom..."
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={20}
          />
        </View>

        {tab === 'create' && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>CATÉGORIE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {CATEGORIES.map(cat => {
                  const active = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategoryId(cat.id)}
                      style={[styles.catPill, active && { backgroundColor: cat.color + '30', borderColor: cat.color }]}
                    >
                      <Text style={styles.catEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.catText, active && { color: cat.color, fontWeight: '800' }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>NOMBRE DE CHANSONS</Text>
              <View style={styles.pillRow}>
                {SONG_OPTIONS.map(n => (
                  <TouchableOpacity key={n} style={[styles.pill, songCount === n && styles.pillActive]} onPress={() => setSongCount(n)}>
                    <Text style={[styles.pillText, songCount === n && styles.pillTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>TEMPS PAR CHANSON</Text>
              <View style={styles.pillRow}>
                {TIME_OPTIONS.map(t => (
                  <TouchableOpacity key={t ?? 'inf'} style={[styles.pill, timeLimit === t && styles.pillActive]} onPress={() => setTimeLimit(t)}>
                    <Text style={[styles.pillText, timeLimit === t && styles.pillTextActive]}>{t === null ? '∞' : `${t} s`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🎵 L'hôte joue la musique depuis son téléphone.{'\n'}
                ⌨️ Tous les joueurs tapent la réponse en même temps.{'\n'}
                🏆 Le premier à trouver gagne les points !
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.mainBtn, (!name.trim() || loading) && styles.mainBtnDisabled]}
              onPress={handleCreate} disabled={!name.trim() || loading} activeOpacity={0.8}
            >
              <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>✨ CRÉER LA SALLE</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {tab === 'join' && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>CODE DE LA SALLE</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="ABCD"
                placeholderTextColor={colors.textMuted}
                value={joinCode}
                onChangeText={t => setJoinCode(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={4}
              />
            </View>
            <TouchableOpacity
              style={[styles.mainBtn, (!name.trim() || joinCode.length < 4 || loading) && styles.mainBtnDisabled]}
              onPress={handleJoin} disabled={!name.trim() || joinCode.length < 4 || loading} activeOpacity={0.8}
            >
              <LinearGradient colors={[BEAT, BEAT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>🚀 REJOINDRE</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { padding: spacing.lg, paddingTop: 50, paddingBottom: spacing.xxl },
  backRow: { marginBottom: spacing.lg },
  backText: { color: colors.textMuted, fontSize: 14 },
  title:    { fontSize: 32, fontWeight: '900', color: BEAT_LIGHT, textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, padding: 4, marginBottom: spacing.xl },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: BEAT },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: colors.text },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 11, fontWeight: '800', color: BEAT_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: BEAT + '44',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: 16, fontWeight: '700', color: colors.text,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  codeInput: { fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 8 },
  catRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1, backgroundColor: colors.surface, borderColor: colors.border,
  },
  catEmoji: { fontSize: 16 },
  catText:  { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  pillRow: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  pillActive:     { backgroundColor: BEAT + '33', borderColor: BEAT },
  pillText:       { fontSize: 18, fontWeight: '900', color: colors.textMuted },
  pillTextActive: { color: BEAT_LIGHT },
  infoBox: {
    backgroundColor: BEAT + '12', borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: BEAT + '30', marginBottom: spacing.lg,
  },
  infoText: { fontSize: 13, color: colors.textSecondary, lineHeight: 22 },
  mainBtn:         { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.md },
  mainBtnDisabled: { opacity: 0.4 },
  mainBtnGrad:     { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText:     { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },
});
