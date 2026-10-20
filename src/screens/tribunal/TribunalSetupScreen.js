import React, { useState } from 'react';
import { Text } from 'react-native';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import goBackOrMenu from '../../navigation/goBack';
import { SetupLayout, Section, ChoicePills, Field, Notice, GameScreen, GameTopBar, Heading, T } from '../../components/game/Legende';

function generateCode() {
  return Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)]).join('');
}

const TABS = [{ value: 'create', label: 'Créer une salle' }, { value: 'join', label: 'Rejoindre' }];
const errorText = (e) => {
  const msg = e.message || '';
  return msg.includes('fetch') || msg.includes('network') || msg.includes('ECONN')
    ? 'Serveur inaccessible pour le moment. Réessayez dans quelques minutes.'
    : msg || 'Erreur de connexion. Réessayez.';
};

export default function TribunalSetupScreen({ navigation }) {
  const [tab,      setTab]      = useState('create');
  const [name,     setName]     = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isSupabaseConfigured) {
    return (
      <GameScreen top={<GameTopBar game="tribunal" mode="setup" onBack={() => navigation.navigate('Menu')} />}>
        <Heading title="Indisponible" sub="Ce jeu a besoin d’une connexion au serveur, qui n’est pas configurée." />
      </GameScreen>
    );
  }

  const handleCreate = async () => {
    if (!name.trim()) return;
    setErrorMsg('');
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
    } catch (e) { setErrorMsg(errorText(e)); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!name.trim() || joinCode.length < 4) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const { data: room, error: rErr } = await supabase
        .from('tribunal_rooms').select().eq('code', joinCode.toUpperCase()).single();
      if (rErr || !room) throw new Error('Salle introuvable. Vérifiez le code.');
      if (room.status !== 'lobby') throw new Error('La partie a déjà commencé.');
      const { data: player, error: pErr } = await supabase
        .from('tribunal_players')
        .insert({ room_id: room.id, name: name.trim(), is_host: false })
        .select().single();
      if (pErr) throw pErr;
      navigation.replace('TribunalLobby', { roomId: room.id, playerId: player.id, isHost: false });
    } catch (e) { setErrorMsg(errorText(e)); }
    finally { setLoading(false); }
  };

  const create = tab === 'create';
  const canProceed = create ? !!name.trim() : !!name.trim() && joinCode.length === 4;

  return (
    <SetupLayout
      game="tribunal"
      navigation={navigation}
      onBack={() => goBackOrMenu(navigation)}
      onStart={create ? handleCreate : handleJoin}
      canStart={canProceed && !loading}
      startLabel={loading ? 'Connexion…' : create ? 'Créer la salle' : 'Rejoindre la salle'}
      note="Chaque joueur utilise son propre téléphone."
      rules={[
        'Chacun écrit une vérité sur un autre joueur.',
        'L’accusé découvre ce qu’on a écrit sur lui, devine qui l’a écrit, puis se défend à voix haute.',
        'Le jury vote : « C’est vrai » ou « C’est faux ».',
        'Majorité « faux » : acquitté. Sinon : +1 point de malus.',
        'Le joueur avec le moins de malus gagne.',
      ]}
    >
      <ChoicePills options={TABS} value={tab} onChange={(t) => { setTab(t); setErrorMsg(''); }} />

      <Section label="Votre prénom">
        <Field placeholder="Votre prénom…" value={name} onChangeText={setName} autoCapitalize="words" maxLength={20} accessibilityLabel="Votre prénom" />
      </Section>

      {!create && (
        <Section label="Code de la salle">
          <Field placeholder="ABCD" value={joinCode} onChangeText={(t) => setJoinCode(t.toUpperCase())} autoCapitalize="characters" maxLength={4}
            accessibilityLabel="Code de la salle" style={{ textAlign: 'center', fontSize: 28, letterSpacing: 10, height: 64 }} />
          <Text style={{ color: T.encreDouce, fontSize: 13 }}>Demandez le code au joueur qui a créé la salle.</Text>
        </Section>
      )}

      {errorMsg ? <Notice tone="alerte">{errorMsg}</Notice> : null}
    </SetupLayout>
  );
}
