import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

const GOLD      = '#F59E0B';
const GOLD_DARK = '#D97706';
const GOLD_LIGHT = '#FDE68A';
const BG = ['#0A0600', '#1A0C00', '#0A0600'];

function generateCode() {
  return Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]).join('');
}

export default function TribunalSetupScreen({ navigation }) {
  const [tab,      setTab]      = useState('create');
  const [name,     setName]     = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading,  setLoading]  = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <LinearGradient colors={BG} style={styles.container}>
        <View style={styles.configWrap}>
          <Text style={styles.configTitle}>⚙️ Configuration requise</Text>
          <Text style={styles.configText}>
            Tribunal nécessite Supabase.{'\n\n'}
            Ajoute dans .env :{'\n\n'}
            EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co{'\n'}
            EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...{'\n\n'}
            Puis exécute la migration SQL tribunal dans Supabase.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.backBtn}>
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
        .from('tribunal_rooms').insert({ code }).select().single();
      if (rErr) throw rErr;
      const { data: player, error: pErr } = await supabase
        .from('tribunal_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: true })
        .select().single();
      if (pErr) throw pErr;
      navigation.replace('TribunalLobby', { roomId: room.id, playerId: player.id, isHost: true });
    } catch (e) { Alert.alert('Erreur', e.message); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!name.trim() || joinCode.length < 4) return;
    setLoading(true);
    try {
      const { data: room, error: rErr } = await supabase
        .from('tribunal_rooms').select().eq('code', joinCode.toUpperCase()).single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifie le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');
      const { data: player, error: pErr } = await supabase
        .from('tribunal_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false })
        .select().single();
      if (pErr) throw pErr;
      navigation.replace('TribunalLobby', { roomId: room.id, playerId: player.id, isHost: false });
    } catch (e) { Alert.alert('Erreur', e.message); }
    finally { setLoading(false); }
  };

  const canProceed = tab === 'create' ? !!name.trim() : name.trim() && joinCode.length === 4;

  return (
    <LinearGradient colors={BG} style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.navigate('Menu')} style={styles.backRow}>
          <Text style={styles.backText}>← Menu</Text>
        </TouchableOpacity>

        <Text style={styles.title}>⚖️ TRIBUNAL</Text>
        <Text style={styles.subtitle}>La vérité sera jugée !</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['create', 'join'].map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'create' ? '➕ Créer' : '🔑 Rejoindre'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nom */}
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

        {/* Code de la salle */}
        {tab === 'join' && (
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
        )}

        <TouchableOpacity
          style={[styles.mainBtn, (!canProceed || loading) && styles.mainBtnDisabled]}
          onPress={tab === 'create' ? handleCreate : handleJoin}
          disabled={!canProceed || loading}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[GOLD, GOLD_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.mainBtnGrad}>
            {loading
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.mainBtnText}>{tab === 'create' ? '⚖️ CRÉER LA SALLE' : '🚀 REJOINDRE'}</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        {/* Règles */}
        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>⚖️ Règles du Tribunal</Text>
          <Text style={styles.rulesLine}>✍️  Chacun écrit une vérité sur un autre joueur</Text>
          <Text style={styles.rulesLine}>🎤  L'accusé découvre ce qu'on a écrit sur lui</Text>
          <Text style={styles.rulesLine}>🔍  Il devine qui a écrit, puis se défend à voix haute</Text>
          <Text style={styles.rulesLine}>🗳️  Le jury vote : "C'est vrai" ou "C'est faux"</Text>
          <Text style={styles.rulesLine}>✅  Majorité "Faux" → acquitté, pas de malus</Text>
          <Text style={styles.rulesLine}>💀  Sinon → +1 point de malus</Text>
          <Text style={styles.rulesLine}>🏆  Le moins de malus gagne !</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, ...Platform.select({ web: { height: '100vh' } }) },
  scroll: { padding: spacing.lg, paddingTop: 50, paddingBottom: spacing.xxl },
  backRow: { marginBottom: spacing.lg },
  backText: { color: colors.textMuted, fontSize: 14 },
  title: { fontSize: 34, fontWeight: '900', color: GOLD_LIGHT, textAlign: 'center', letterSpacing: 3 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  tabs: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, padding: 4, marginBottom: spacing.xl },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: GOLD },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: '#000' },
  field: { marginBottom: spacing.lg },
  label: { fontSize: 11, fontWeight: '800', color: GOLD_LIGHT, letterSpacing: 2, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: GOLD + '44',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    fontSize: 16, fontWeight: '700', color: colors.text,
  },
  codeInput: { fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: 8 },
  mainBtn: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.xl },
  mainBtnDisabled: { opacity: 0.4 },
  mainBtnGrad: { paddingVertical: spacing.md + 4, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '900', color: '#000', letterSpacing: 2 },
  rules: {
    backgroundColor: GOLD + '15', borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: GOLD + '30',
  },
  rulesTitle: { fontSize: 14, fontWeight: '800', color: GOLD_LIGHT, marginBottom: spacing.md },
  rulesLine: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, lineHeight: 20 },
  configWrap: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  configTitle: { fontSize: 22, fontWeight: '900', color: GOLD_LIGHT, marginBottom: spacing.lg, textAlign: 'center' },
  configText: { fontSize: 13, color: colors.textSecondary, lineHeight: 22, fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier' },
  backBtn: { marginTop: spacing.xl, alignItems: 'center' },
  backBtnText: { color: GOLD_LIGHT, fontSize: 15, fontWeight: '700' },
});
