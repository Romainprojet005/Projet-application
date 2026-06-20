import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

import { GOLD, GOLD_LIGHT, GOLD_DARK, OB_BG, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';
const PINK       = GOLD;
const PINK_DARK  = GOLD_DARK;
const PINK_LIGHT = GOLD_LIGHT;
const BG         = OB_BG;

function generateCode() {
  return Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]).join('');
}

function getPlayerId() {
  try {
    let id = (typeof localStorage !== 'undefined' ? localStorage : sessionStorage).getItem('mime_player_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      (typeof localStorage !== 'undefined' ? localStorage : sessionStorage).setItem('mime_player_id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export default function MimeSetupScreen({ navigation }) {
  const [tab, setTab] = useState('create'); // 'create' | 'join'
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [rounds, setRounds] = useState(5);
  const [category, setCategory] = useState('classique');
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <View style={styles.configError}>
          <Text style={styles.configTitle}>⚙️ Configuration requise</Text>
          <Text style={styles.configText}>
            Le jeu Mime Express nécessite Supabase.{'\n\n'}
            Crée un compte gratuit sur supabase.com, puis ajoute dans le fichier .env :{'\n\n'}
            EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co{'\n'}
            EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const code = generateCode();
      const { data: room, error: rErr } = await supabase
        .from('mime_rooms')
        .insert({ code, max_rounds: rounds, category })
        .select()
        .single();
      if (rErr) throw rErr;

      const deviceId = getPlayerId();
      const { data: player, error: pErr } = await supabase
        .from('mime_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true, device_id: deviceId })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('MimeLobby', { roomId: room.id, playerId: player.id, isHost: true });
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
        .from('mime_rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifie le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');

      const deviceId = getPlayerId();
      const { data: player, error: pErr } = await supabase
        .from('mime_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false, device_id: deviceId })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('MimeLobby', { roomId: room.id, playerId: player.id, isHost: false });
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
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.backText}>← Menu</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🎭 MIME EXPRESS</Text>
        <Text style={styles.subtitle}>Faites deviner sans parler !</Text>

        {/* Tabs */}
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

        {/* Name input (shared) */}
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
              <Text style={styles.label}>NOMBRE DE MANCHES</Text>
              <View style={styles.roundsRow}>
                {[3, 5, 8, 10].map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.roundBtn, rounds === n && styles.roundBtnActive]}
                    onPress={() => setRounds(n)}
                  >
                    <Text style={[styles.roundBtnText, rounds === n && styles.roundBtnTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>MODE DE JEU</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[styles.modeBtn, category === 'classique' && styles.modeBtnActive]}
                  onPress={() => setCategory('classique')}
                >
                  <Text style={styles.modeEmoji}>🎭</Text>
                  <Text style={[styles.modeBtnLabel, category === 'classique' && styles.modeBtnLabelActive]}>Classique</Text>
                  <Text style={styles.modeDesc}>Tout public</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, styles.modeBtnAdulte, category === 'adulte' && styles.modeBtnAdulteActive]}
                  onPress={() => setCategory('adulte')}
                >
                  <Text style={styles.modeEmoji}>🔞</Text>
                  <Text style={[styles.modeBtnLabel, category === 'adulte' && { color: '#FF6B6B' }]}>Adulte</Text>
                  <Text style={styles.modeDesc}>18+ sans filtre</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.mainBtn, (!name.trim() || loading) && styles.mainBtnDisabled]}
              onPress={handleCreate}
              disabled={!name.trim() || loading}
              activeOpacity={0.8}
            >
              <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
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
              <LinearGradient colors={GOLD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
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
  title: { fontSize: 32, fontWeight: '900', color: PINK_LIGHT, textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, padding: 4, marginBottom: spacing.xl },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: GOLD },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: LAUNCH_TEXT },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 11, fontWeight: '800', color: PINK_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: PINK + '44',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  codeInput: { fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 8 },
  roundsRow: { flexDirection: 'row', gap: spacing.sm },
  roundBtn: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  roundBtnActive: { backgroundColor: PINK + '33', borderColor: PINK },
  roundBtnText: { fontSize: 20, fontWeight: '900', color: colors.textMuted },
  roundBtnTextActive: { color: PINK_LIGHT },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.card, gap: 2,
  },
  modeBtnActive: { borderColor: PINK, backgroundColor: PINK + '22' },
  modeBtnAdulte: { borderColor: colors.border },
  modeBtnAdulteActive: { borderColor: '#FF6B6B', backgroundColor: '#FF6B6B22' },
  modeEmoji: { fontSize: 28, marginBottom: 2 },
  modeBtnLabel: { fontSize: 14, fontWeight: '800', color: colors.textMuted },
  modeBtnLabelActive: { color: PINK_LIGHT },
  modeDesc: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },

  mainBtn: { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.md },
  mainBtnDisabled: { opacity: 0.4 },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: LAUNCH_TEXT, letterSpacing: 2 },
  configError: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  configTitle: { fontSize: 22, fontWeight: '900', color: PINK_LIGHT, marginBottom: spacing.lg, textAlign: 'center' },
  configText: { fontSize: 13, color: colors.textSecondary, lineHeight: 22, fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier' },
  backBtn: { marginTop: spacing.xl, alignItems: 'center' },
  backBtnText: { color: PINK_LIGHT, fontSize: 15, fontWeight: '700' },
});
