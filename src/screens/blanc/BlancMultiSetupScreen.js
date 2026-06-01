import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabase';
import { GOLD, GOLD_LIGHT, GOLD_DARK, OB_BG, GOLD_GRADIENT, LAUNCH_TEXT } from '../../theme/obsidian';

const PRP       = colors.primary;
const PRP_LIGHT = colors.primaryLight;
const PRP_DARK  = colors.primaryDark;

function generateCode() {
  return Array.from({ length: 4 }, () =>
    'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]
  ).join('');
}

function getDeviceId() {
  try {
    const store = typeof localStorage !== 'undefined' ? localStorage : sessionStorage;
    let id = store.getItem('blanc_device_id');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      store.setItem('blanc_device_id', id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

const CATEGORIES = [
  { id: 'classique', emoji: '🃏', name: 'Classique' },
  { id: 'adulte',    emoji: '🔞', name: 'Adulte'    },
];

export default function BlancMultiSetupScreen({ navigation }) {
  const [tab, setTab]         = useState('create');
  const [name, setName]       = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [category, setCategory] = useState('classique');
  const [rounds, setRounds]   = useState(10);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const code = generateCode();
      const { data: room, error: rErr } = await supabase
        .from('blanc_rooms')
        .insert({ code, category, total_rounds: rounds })
        .select()
        .single();
      if (rErr) throw rErr;

      const { data: player, error: pErr } = await supabase
        .from('blanc_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('BlancMultiLobby', { roomId: room.id, playerId: player.id, isHost: true });
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
        .from('blanc_rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifie le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');

      const { data: player, error: pErr } = await supabase
        .from('blanc_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false, device_id: getDeviceId() })
        .select()
        .single();
      if (pErr) throw pErr;

      navigation.replace('BlancMultiLobby', { roomId: room.id, playerId: player.id, isHost: false });
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
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('BlancSetup')}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🃏 REMPLIS LE BLANC</Text>
        <Text style={styles.subtitle}>Mode multi-appareils</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[{ id: 'create', label: 'Créer une salle' }, { id: 'join', label: 'Rejoindre' }].map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, tab === t.id && styles.tabActive]}
              onPress={() => setTab(t.id)}
            >
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prénom (commun) */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>👤 TON PRÉNOM</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Entre ton prénom..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            maxLength={18}
            autoCapitalize="words"
          />
        </View>

        {tab === 'create' ? (
          <>
            {/* Catégorie */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🎯 CATÉGORIE</Text>
              <View style={styles.row}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.optBtn, category === c.id && { borderColor: PRP, backgroundColor: PRP + '22' }]}
                    onPress={() => setCategory(c.id)}
                  >
                    <Text style={styles.optEmoji}>{c.emoji}</Text>
                    <Text style={[styles.optName, category === c.id && { color: PRP_LIGHT }]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tours */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🔄 NOMBRE DE TOURS</Text>
              <View style={styles.row}>
                {[5, 10, 15].map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.optBtn, rounds === n && { borderColor: PRP, backgroundColor: PRP + '22' }]}
                    onPress={() => setRounds(n)}
                  >
                    <Text style={[styles.optNum, rounds === n && { color: PRP_LIGHT }]}>{n}</Text>
                    <Text style={styles.optSub}>{n === 5 ? 'Rapide' : n === 10 ? 'Normal' : 'Long'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              disabled={!name.trim() || loading}
              style={{ marginBottom: spacing.xxl }}
            >
              <LinearGradient
                colors={name.trim() && !loading ? GOLD_GRADIENT : [colors.border, colors.surface]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.launchBtn}
              >
                {loading
                  ? <ActivityIndicator color={LAUNCH_TEXT} />
                  : <Text style={[styles.launchTxt, (!name.trim() || loading) && { color: colors.textMuted }]}>
                      CRÉER LA SALLE 🃏
                    </Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🔑 CODE DE LA SALLE</Text>
              <TextInput
                value={joinCode}
                onChangeText={t => setJoinCode(t.toUpperCase())}
                placeholder="ABCD"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.codeInput]}
                maxLength={4}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              onPress={handleJoin}
              disabled={!name.trim() || joinCode.length < 4 || loading}
              style={{ marginBottom: spacing.xxl }}
            >
              <LinearGradient
                colors={name.trim() && joinCode.length === 4 && !loading ? GOLD_GRADIENT : [colors.border, colors.surface]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.launchBtn}
              >
                {loading
                  ? <ActivityIndicator color={LAUNCH_TEXT} />
                  : <Text style={[styles.launchTxt, (!name.trim() || joinCode.length < 4) && { color: colors.textMuted }]}>
                      REJOINDRE 🚀
                    </Text>
                }
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
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },

  backRow: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: spacing.md },
  backText: { color: PRP_LIGHT, fontSize: 14, fontWeight: '600' },

  title:    { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 3, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },

  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabActive:     { borderColor: PRP, backgroundColor: PRP + '22' },
  tabText:       { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: PRP_LIGHT },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  cardLabel: { fontSize: 11, fontWeight: '800', color: PRP_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },

  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    color: colors.text, fontSize: 16, fontWeight: '600',
  },
  codeInput: { fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 8 },

  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  optBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optEmoji: { fontSize: 24, marginBottom: 4 },
  optName:  { fontSize: 13, fontWeight: '700', color: colors.text },
  optNum:   { fontSize: 26, fontWeight: '900', color: colors.text },
  optSub:   { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  launchBtn: {
    paddingVertical: spacing.md + 4, borderRadius: radius.full, alignItems: 'center',
    shadowColor: GOLD, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  launchTxt: { fontSize: 15, fontWeight: '900', color: LAUNCH_TEXT, letterSpacing: 2 },
});
