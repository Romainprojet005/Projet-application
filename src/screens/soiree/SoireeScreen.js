import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  GameScreen, ActionBar, PrimaryButton, TextLink, Heading, Section, PlayerEditor, Ranking, Notice, Icon, useMasqueMenu, T, F,
} from '../../components/game/Legende';
import {
  useSoiree, demarrerSoiree, abandonnerSoiree, jeuxDeSoiree, nomDuJeu, SETUP_ROUTES,
} from '../../services/soiree';
import { enConstruction } from '../../services/acces';

const MIN_JOUEURS = 2;
const MIN_JEUX = 2;
const MAX_JEUX = 6;

function TopBar({ onBack }) {
  useMasqueMenu();
  return (
    <View>
      <View style={s.top}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Retour aux jeux" style={s.back}>
          <Icon name="back" />
          <Text style={s.backText}>Jeux</Text>
        </Pressable>
        <Text style={s.topTitle}>SOIRÉE ENCHAÎNÉE</Text>
        <View style={{ minWidth: 96 }} />
      </View>
      <View style={s.rule} />
    </View>
  );
}

export default function SoireeScreen({ navigation }) {
  const soiree = useSoiree();
  const [joueurs, setJoueurs] = useState([]);
  const [jeux, setJeux] = useState([]);
  const toMenu = () => navigation.navigate('Menu');

  // ── Soirée terminée : classement général ──
  if (soiree?.fini) {
    return (
      <GameScreen top={<TopBar onBack={toMenu} />} footer={(
        <ActionBar>
          <PrimaryButton label="Nouvelle soirée" onPress={() => abandonnerSoiree()} />
          <TextLink label="Retour aux jeux" onPress={() => { abandonnerSoiree(); toMenu(); }} />
        </ActionBar>
      )}>
        <Heading kicker="Fin de la soirée" title={`${[...soiree.joueurs].sort((a, b) => soiree.scores[b] - soiree.scores[a])[0]} est la légende`}
          sub={`${soiree.jeux.length} jeux joués. Points de soirée : le premier d’un jeu marque autant de points que de joueurs classés.`} />
        <Ranking players={soiree.joueurs} scores={soiree.scores} suffix=" pts" />
        <Detail soiree={soiree} />
      </GameScreen>
    );
  }

  // ── Soirée en cours ──
  if (soiree) {
    const jeu = soiree.jeux[soiree.idx];
    return (
      <GameScreen top={<TopBar onBack={toMenu} />} footer={(
        <ActionBar>
          <PrimaryButton label={`Jouer : ${nomDuJeu(jeu)}`} onPress={() => navigation.navigate(SETUP_ROUTES[jeu])} />
          <TextLink label="Abandonner la soirée" color={T.encreDouce} onPress={() => abandonnerSoiree()} />
        </ActionBar>
      )}>
        <Heading kicker={`Jeu ${soiree.idx + 1} sur ${soiree.jeux.length}`} title="La soirée continue" />
        <View style={{ gap: 8 }}>
          {soiree.jeux.map((g, i) => (
            <View key={g + i} style={[s.step, i === soiree.idx && s.stepOn, i < soiree.idx && { opacity: 0.55 }]}>
              <Text style={[s.stepNum, i === soiree.idx && { color: T.orTexte }]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[s.stepName, i === soiree.idx && { color: T.orTexte }]}>{nomDuJeu(g)}</Text>
              <Text style={s.stepState}>{i < soiree.idx ? 'Joué' : i === soiree.idx ? 'À jouer' : ''}</Text>
            </View>
          ))}
        </View>
        <Section label="Classement de la soirée">
          <Ranking players={soiree.joueurs} scores={soiree.scores} suffix=" pts" />
        </Section>
      </GameScreen>
    );
  }

  // ── Préparer une soirée ──
  const valides = joueurs.map((n) => n.trim()).filter(Boolean);
  const disponibles = jeuxDeSoiree().filter((c) => !enConstruction(c));
  const basculer = (game) => setJeux((l) => (l.includes(game) ? l.filter((g) => g !== game) : l.length >= MAX_JEUX ? l : [...l, game]));
  const pret = valides.length >= MIN_JOUEURS && jeux.length >= MIN_JEUX;
  const lancer = () => {
    if (!pret) return;
    demarrerSoiree(valides, jeux);
    navigation.navigate(SETUP_ROUTES[jeux[0]]);
  };

  return (
    <GameScreen top={<TopBar onBack={toMenu} />} footer={(
      <ActionBar note={valides.length < MIN_JOUEURS ? `Ajoutez au moins ${MIN_JOUEURS} joueurs.`
        : jeux.length < MIN_JEUX ? `Choisissez de ${MIN_JEUX} à ${MAX_JEUX} jeux.` : `${jeux.length} jeux à la suite, un classement général.`}>
        <PrimaryButton label="Lancer la soirée" onPress={lancer} disabled={!pret} />
      </ActionBar>
    )}>
      <Heading kicker="Plusieurs jeux à la suite" title="Soirée enchaînée"
        sub="Choisissez vos jeux dans l’ordre : à la fin de chacun, le site passe au suivant et tient un classement général." />

      <PlayerEditor names={joueurs} onChange={setJoueurs} min={MIN_JOUEURS} max={12} />

      <Section label="Jeux, dans l’ordre" aside={`${jeux.length} sur ${MAX_JEUX}`}>
        <View style={s.grid}>
          {disponibles.map((c) => {
            const pos = jeux.indexOf(c.game);
            const on = pos !== -1;
            return (
              <Pressable key={c.game} onPress={() => basculer(c.game)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
                accessibilityLabel={nomDuJeu(c.game)} style={[s.game, on && s.gameOn]}>
                <Text style={[s.gamePos, on && { color: T.surOr, backgroundColor: T.or, borderColor: T.or }]}>{on ? pos + 1 : ''}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.gameName, on && { color: T.orTexte }]} numberOfLines={1}>{nomDuJeu(c.game)}</Text>
                  <Text style={s.gameMeta} numberOfLines={1}>{c.players} joueurs · {c.time}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Section>
      <Notice tone="neutre">Les jeux à plusieurs téléphones ne font pas partie des soirées enchaînées.</Notice>
    </GameScreen>
  );
}

function Detail({ soiree }) {
  if (!soiree.detail.length) return null;
  return (
    <Section label="Jeu par jeu">
      <View style={{ gap: 8 }}>
        {soiree.detail.map((d) => {
          const meilleur = Object.entries(d.gains).sort((a, b) => b[1] - a[1])[0];
          return (
            <View key={d.idx} style={s.step}>
              <Text style={s.stepNum}>{String(d.idx + 1).padStart(2, '0')}</Text>
              <Text style={s.stepName}>{nomDuJeu(d.game)}</Text>
              <Text style={s.stepState}>{meilleur ? `${meilleur[0]} · +${meilleur[1]}` : '—'}</Text>
            </View>
          );
        })}
      </View>
    </Section>
  );
}

const s = StyleSheet.create({
  top: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  back: { minWidth: 96, height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  backText: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  topTitle: { flex: 1, textAlign: 'center', color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2.2 },
  rule: { height: 1, backgroundColor: T.trait },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  game: { flexBasis: '47%', flexGrow: 1, minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.carte },
  gameOn: { borderColor: T.or, backgroundColor: T.orVoile },
  gamePos: { width: 26, height: 26, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort, textAlign: 'center', lineHeight: 24, color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13, overflow: 'hidden' },
  gameName: { color: T.encre, fontFamily: F.texteFort, fontSize: 14 },
  gameMeta: { color: T.encreDouce, fontSize: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.trait, backgroundColor: T.carte },
  stepOn: { borderColor: T.or, backgroundColor: T.orVoile },
  stepNum: { width: 24, color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
  stepName: { flex: 1, color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  stepState: { color: T.encreDouce, fontSize: 13 },
});
