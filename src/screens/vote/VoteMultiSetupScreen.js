import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';
import { VOTE_CATEGORIES } from '../../data/voteData';

const VOTE_COLOR = '#6366F1';
const VOTE_DARK  = '#4F46E5';
const VOTE_LIGHT = '#A5B4FC';
const BG = ['#080818', '#0C0A24', '#080818'];

const ROUND_OPTIONS = [5, 10, 15, 20];

function generateCode() {
  return Array.from({ length: 4 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]
  ).join('');
}

function getDeviceId() {
  try {
    const store = typeof localStorage !== 'undefined' ? localStorage : sessionStorage;
    let id = store.getItem('vote_device_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      store.setItem('vote_device_id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export default function VoteMultiSetupScreen({ navigation }) {
  const [tab, setTab]                   = useState('create');
  const [name, setName]                 = useState('');
  const [joinCode, setJoinCode]         = useState('');
  const [categoryId, setCategoryId]     = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading]           = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const code = generateCode();
      const { data: room, error: rErr } = await supabase
        .from('vote_rooms')
        .insert({ code, category_id: categoryId, question_count: questionCount })
        .select()
        .single();
      if (rErr) throw rErr;

      const { data: player, error: pErr } = await supabase
        .from('vote_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('VoteMultiLobby', { roomId: room.id, playerId: player.id, isHost: true });
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
        .from('vote_rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifie le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');

      const { data: player, error: pErr } = await supabase
        .from('vote_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('VoteMultiLobby', { roomId: room.id, playerId: player.id, isHost: false });
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
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('VoteSetup')}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>⚖️ VOTE MULTI</Text>
        <Text style={styles.subtitle}>Votez tous en même temps !</Text>

        <View style={styles.tabs}>
          {['create', 'join'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
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
                {VOTE_CATEGORIES.map(cat => {
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
              {VOTE_CATEGORIES.find(c => c.id === categoryId)?.needsPlayers && (
                <Text style={styles.needsPlayersHint}>
                  ⚖️ Les prénoms des joueurs seront automatiquement utilisés
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>NOMBRE DE QUESTIONS</Text>
              <View style={styles.roundsRow}>
                {ROUND_OPTIONS.map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.roundBtn, questionCount === n && styles.roundBtnActive]}
                    onPress={() => setQuestionCount(n)}
                  >
                    <Text style={[styles.roundBtnText, questionCount === n && styles.roundBtnTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.mainBtn, (!name.trim() || loading) && styles.mainBtnDisabled]}
              onPress={handleCreate}
              disabled={!name.trim() || loading}
              activeOpacity={0.8}
            >
              <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
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
              onPress={handleJoin}
              disabled={!name.trim() || joinCode.length < 4 || loading}
              activeOpacity={0.8}
            >
              <LinearGradient colors={[VOTE_COLOR, VOTE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
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
  title: { fontSize: 32, fontWeight: '900', color: VOTE_LIGHT, textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, padding: 4, marginBottom: spacing.xl },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: VOTE_COLOR },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: colors.text },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 11, fontWeight: '800', color: VOTE_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: VOTE_COLOR + '44',
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
  catText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  needsPlayersHint: { fontSize: 12, color: VOTE_LIGHT, marginTop: spacing.sm, fontStyle: 'italic' },
  roundsRow: { flexDirection: 'row', gap: spacing.sm },
  roundBtn: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  roundBtnActive: { backgroundColor: VOTE_COLOR + '33', borderColor: VOTE_COLOR },
  roundBtnText: { fontSize: 20, fontWeight: '900', color: colors.textMuted },
  roundBtnTextActive: { color: VOTE_LIGHT },
  mainBtn: { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.md },
  mainBtnDisabled: { opacity: 0.4 },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: colors.text, letterSpacing: 2 },
});
