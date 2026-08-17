import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { OB_BG } from '../../theme/obsidian';
import { supabase } from '../../services/supabase';

const ACCENT       = '#C89B3C';
const ACCENT_LIGHT = '#F0D68C';
const ACCENT_DARK  = '#8B6914';

function generateCode() {
  return Array.from({ length: 4 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]
  ).join('');
}

function getDeviceId() {
  try {
    const store = typeof localStorage !== 'undefined' ? localStorage : sessionStorage;
    let id = store.getItem('lolselect_device_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      store.setItem('lolselect_device_id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export default function LolSelectMultiSetupScreen({ navigation }) {
  const [tab, setTab]           = useState('create');
  const [name, setName]         = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const code = generateCode();
      const { data: room, error: rErr } = await supabase
        .from('lolselect_rooms')
        .insert({ code })
        .select()
        .single();
      if (rErr) throw rErr;

      const { data: player, error: pErr } = await supabase
        .from('lolselect_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('LolSelectMultiLobby', { roomId: room.id, playerId: player.id, isHost: true });
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
        .from('lolselect_rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifie le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');

      const { data: existing } = await supabase
        .from('lolselect_players')
        .select()
        .eq('room_id', room.id);
      if (existing && existing.length >= 2) throw new Error('Cette salle est déjà complète (2 joueurs max).');

      const { data: player, error: pErr } = await supabase
        .from('lolselect_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('LolSelectMultiLobby', { roomId: room.id, playerId: player.id, isHost: false });
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={OB_BG} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        style={Platform.OS === 'web' && { height: '100vh' }}
      >
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('LolSelectSetup')}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🌐 SÉLECTIONNEUR À DISTANCE</Text>
        <Text style={styles.subtitle}>Chacun draft sa propre équipe sur son appareil, puis les deux s'affrontent</Text>

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

        {tab === 'create' ? (
          <TouchableOpacity
            style={[styles.mainBtn, (!name.trim() || loading) && styles.mainBtnDisabled]}
            onPress={handleCreate}
            disabled={!name.trim() || loading}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
              {loading ? <ActivityIndicator color="#0A0815" /> : <Text style={styles.mainBtnText}>✨ CRÉER LA SALLE</Text>}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
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
              <LinearGradient colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
                {loading ? <ActivityIndicator color="#0A0815" /> : <Text style={styles.mainBtnText}>🚀 REJOINDRE</Text>}
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
  title: { fontSize: 24, fontWeight: '900', color: ACCENT_LIGHT, textAlign: 'center', letterSpacing: 1.5 },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl, lineHeight: 19 },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, padding: 4, marginBottom: spacing.xl },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: ACCENT },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: '#0A0815' },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 11, fontWeight: '800', color: ACCENT_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: ACCENT + '44',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: 16, fontWeight: '700', color: colors.text,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  codeInput: { fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 8 },
  mainBtn: { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.md },
  mainBtnDisabled: { opacity: 0.4 },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: '#0A0815', letterSpacing: 2 },
});
