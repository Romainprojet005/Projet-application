import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, Image, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { characters } from '../../data/characters';
import { FAMILIES, FamilyEmblem } from '../BoosterCard';
import { FULL_HEIGHT } from '../../utils/fullHeight';
import sansEmoji from '../../utils/sansEmoji';

// ── Pièces communes des écrans de jeu (refonte « La Soirée des Légendes ») ──
// Un seul vocabulaire pour les 19 jeux : barre du haut, en-tête de légende,
// sections, sélecteurs, jetons de joueurs, carte de question, barre d'action
// avec UN bouton or. Couleurs = jetons du système de design ; la couleur d'un
// jeu est celle de sa famille (Bluff, Savoir, Social, Défis).

export const T = {
  fond: '#0E0C1A', carte: '#1A1730', creux: '#08070F',
  trait: '#2E2A4A', traitFort: '#6B6590',
  encre: '#F3EEE2', encreDouce: '#A9A3BF',
  or: '#D4AF37', orTexte: '#E6C766', orVoile: 'rgba(212,175,55,0.10)', surOr: '#1A1408',
  alerte: '#FF8A8A', alerteVoile: 'rgba(255,138,138,0.12)', focus: '#F4DC8C',
};
export const F = {
  affiche: 'BodoniModa_700Bold',
  afficheSemi: 'BodoniModa_600SemiBold',
  texte: 'Outfit_400Regular',
  texteMoyen: 'Outfit_500Medium',
  texteFort: 'Outfit_600SemiBold',
  chiffre: 'JetBrainsMono_400Regular',
};
const isWeb = Platform.OS === 'web';
const shadow = (css) => (isWeb ? { boxShadow: css } : null);
const HALO = '0 0 0 1px rgba(212,175,55,0.5), 0 10px 30px -8px rgba(212,175,55,0.4)';

// Jeu → fiche (numéro dans le carrousel, famille, couleurs)
export function gameInfo(game) {
  const i = characters.findIndex((c) => c.game === game);
  const c = characters[i] || {};
  const fam = FAMILIES[c.family] || FAMILIES.savoir;
  return { ...c, numero: i + 1, fam, color: fam.color, veil: fam.veil };
}

// ── Icônes au trait (web) ; repli texte ailleurs ──
const ICONS = {
  back: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12l5 5 9-10',
  help: 'M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17h.01',
  flame: 'M12 3c1 4 6 5 6 11a6 6 0 0 1-12 0c0-3 2-4 2-7 2 1 3 3 3 4 1-2 1-5 1-8z',
};
const FALLBACK = { back: '‹', close: '✕', plus: '+', check: '✓', help: '?', flame: '•' };
export function Icon({ name, size = 20, color = T.encre, circle = false }) {
  if (!isWeb) return <Text style={{ color, fontSize: size * 0.9 }}>{FALLBACK[name]}</Text>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
      {circle && <circle cx="12" cy="12" r="9" />}
      <path d={ICONS[name]} />
    </svg>
  );
}

// Présence d'une barre du haut à l'écran : le bouton « Menu » global (HomeButton) se masque alors,
// puisque la barre a déjà son bouton Jeux / Quitter au même endroit.
let topBars = 0; const topBarListeners = new Set();
const notifyTopBars = () => topBarListeners.forEach((fn) => fn(topBars > 0));
export function subscribeTopBar(fn) { topBarListeners.add(fn); fn(topBars > 0); return () => topBarListeners.delete(fn); }

// ── Barre du haut ──
// Réglages : « ‹ Jeux · N° 13 · ? » — En partie : « ✕ Quitter · Nom du jeu · 3 / 10 » + progression
export function GameTopBar({ game, mode = 'game', onBack, onHelp, current, total, right, confirmQuit = true }) {
  const g = gameInfo(game);
  const setup = mode === 'setup';
  // En partie : un 1er toucher demande « Quitter ? », le 2e quitte (évite de perdre la partie par erreur)
  const [confirm, setConfirm] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { topBars++; notifyTopBars(); return () => { topBars--; notifyTopBars(); }; }, []);
  const press = () => {
    if (setup || !confirmQuit || confirm) { setConfirm(false); onBack && onBack(); return; }
    setConfirm(true); clearTimeout(timer.current); timer.current = setTimeout(() => setConfirm(false), 3000);
  };
  const pct = total ? Math.max(0, Math.min(1, current / total)) : 0;
  return (
    <View>
      <View style={st.topBar}>
        <Pressable onPress={press} accessibilityRole="button" accessibilityLabel={setup ? 'Retour aux jeux' : confirm ? 'Confirmer : quitter la partie' : 'Quitter la partie'} style={st.topLeft}>
          <Icon name={setup ? 'back' : 'close'} color={confirm ? T.orTexte : T.encre} />
          <Text style={[st.topLeftText, confirm && { color: T.orTexte }]}>{setup ? 'Jeux' : confirm ? 'Quitter ?' : 'Quitter'}</Text>
        </Pressable>
        {setup
          ? <Text style={st.numero}>N° {String(g.numero).padStart(2, '0')}</Text>
          : <Text style={st.topTitle} numberOfLines={1}>{titleCase(g.gameName)}</Text>}
        <View style={st.topRight}>
          {right !== undefined ? right
            : setup
              ? (onHelp ? (
                <Pressable onPress={onHelp} accessibilityRole="button" accessibilityLabel="Règles du jeu" style={st.helpBtn}>
                  <Icon name="help" circle />
                </Pressable>) : null)
              : (total ? <Text style={st.counter}>{current} / {total}</Text> : null)}
        </View>
      </View>
      {!setup && total ? (
        <View style={st.progressTrack}><View style={[st.progressFill, { width: `${pct * 100}%`, backgroundColor: g.color }]} /></View>
      ) : <View style={st.topRule} />}
    </View>
  );
}
// Nom de jeu en casse de phrase (« LE VERRE MAUDIT » → « Le verre maudit »), comme dans les phrases du site
export function titleCase(s = '') {
  const low = s.toLocaleLowerCase('fr');
  return low.charAt(0).toLocaleUpperCase('fr') + low.slice(1);
}

// ── En-tête de légende (écran de réglages) ──
export function LegendHeader({ game, subtitle }) {
  const g = gameInfo(game);
  return (
    <View style={st.legend}>
      <View style={[st.medal, { borderColor: g.color, backgroundColor: g.veil }]}>
        {isWeb && <Image source={{ uri: `/legendes/${g.game}.webp` }} style={st.medalImg} accessibilityIgnoresInvertColors />}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text style={st.surtitre}>{(g.title || '').toUpperCase()}</Text>
        <Text style={st.legendTitle}>{titleCase(g.gameName)}</Text>
        <View style={st.metaRow}>
          <FamilyBadge family={g.family} />
          <Text style={st.meta}>{g.players || '2–12'} joueurs · {g.time || '15 min'}</Text>
        </View>
        {subtitle ? <Text style={st.meta}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function FamilyBadge({ family }) {
  const fam = FAMILIES[family] || FAMILIES.savoir;
  return (
    <View style={[st.badge, { backgroundColor: fam.veil }]}>
      {isWeb && <span style={{ color: fam.color, display: 'inline-flex' }}><FamilyEmblem family={family} size="13px" /></span>}
      <Text style={[st.badgeText, { color: fam.color }]}>{fam.label}</Text>
    </View>
  );
}
export function AdultTag({ style }) {
  return <View style={[st.adult, style]}><Text style={st.adultText}>18+</Text></View>;
}

// ── Sections et sélecteurs ──
export function Section({ label, aside, children, style }) {
  return (
    <View style={[{ gap: 10 }, style]}>
      {(label || aside) ? (
        <View style={st.sectionHead}>
          {label ? <Text style={st.sectionLabel}>{label.toUpperCase()}</Text> : <View />}
          {aside ? <Text style={st.sectionAside}>{aside}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
export function Panel({ children, style }) {
  return <View style={[st.panel, style]}>{children}</View>;
}

// Choix exclusif en cases égales (nombre de manches, durée…)
export function ChoicePills({ options, value, onChange, format = (o) => String(o.label ?? o) }) {
  return (
    <View style={st.pillRow} accessibilityRole="radiogroup">
      {options.map((o) => {
        const v = o.value ?? o, on = v === value;
        return (
          <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityRole="radio" accessibilityState={{ checked: on }}
            style={[st.pill, on && st.pillOn]}>
            <Text style={[st.pillText, on && st.pillTextOn]}>{format(o)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Catégories / modes en étiquettes qui passent à la ligne (plus de rangée qui déborde)
export function ChoiceChips({ options, value, onChange, multiple = false }) {
  const isOn = (v) => (multiple ? (value || []).includes(v) : v === value);
  return (
    <View style={st.chips}>
      {options.map((o) => {
        const on = isOn(o.value);
        return (
          <Pressable key={String(o.value)} onPress={() => onChange(o.value)} accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: on }} style={[st.chip, on && st.chipOn]}>
            <Text style={[st.chipText, on && st.chipTextOn]}>{sansEmoji(o.label)}</Text>
            {o.adult ? <AdultTag style={{ marginLeft: 6 }} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

// Ambiance Classique / Hot / Très hot (jauge de 3 crans)
export function AmbianceSelector({ levels, value, onChange }) {
  return (
    <View style={[st.pillRow, { gap: 8 }]} accessibilityRole="radiogroup">
      {levels.map((l) => {
        const on = l.value === value;
        return (
          <Pressable key={l.value} onPress={() => onChange(l.value)} accessibilityRole="radio" accessibilityState={{ checked: on }}
            style={[st.level, on && st.levelOn]}>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {[1, 2, 3].map((k) => (
                <View key={k} style={[st.heat, { backgroundColor: k <= (l.heat || 1) ? (l.adult ? T.alerte : '#7CC4FF') : T.trait }]} />
              ))}
            </View>
            <Text style={[st.levelLabel, on && { color: T.orTexte }]} numberOfLines={1}>{sansEmoji(l.label)}</Text>
            {l.adult ? <Text style={st.levelAdult}>18+</Text> : <Text style={st.levelSub} numberOfLines={1}>{l.sub || 'Tout public'}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

// Compteur − valeur + (nombre de joueurs, d'espions…)
export function Stepper({ value, min = 0, max = 99, onChange, label, step = 1 }) {
  const btn = (d, icon, off) => (
    <Pressable onPress={off ? undefined : () => onChange(Math.min(max, Math.max(min, value + d)))} accessibilityRole="button"
      accessibilityLabel={`${d < 0 ? 'Moins' : 'Plus'}${label ? ' : ' + label : ''}`} accessibilityState={{ disabled: off }}
      style={[st.stepBtn, off && { opacity: 0.35 }]}>
      {icon === 'minus' ? <View style={{ width: 14, height: 2, borderRadius: 1, backgroundColor: T.encre }} /> : <Icon name="plus" size={18} />}
    </Pressable>
  );
  return (
    <View style={st.stepper}>
      {btn(-step, 'minus', value <= min)}
      <Text style={st.stepValue} accessibilityLabel={label ? `${label} : ${value}` : String(value)}>{value}</Text>
      {btn(step, 'plus', value >= max)}
    </View>
  );
}
// Ligne réglage + compteur
export function StepperRow({ label, hint, ...props }) {
  return (
    <View style={st.rowSetting}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={st.rowLabel}>{label}</Text>
        {hint ? <Text style={st.rowHint}>{hint}</Text> : null}
      </View>
      <Stepper label={label} {...props} />
    </View>
  );
}
// Ligne réglage + interrupteur
export function ToggleRow({ label, hint, value, onChange, adult }) {
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: !!value }} accessibilityLabel={label}
      style={st.rowSetting}>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={st.rowLabel}>{label}</Text>
          {adult ? <AdultTag /> : null}
        </View>
        {hint ? <Text style={st.rowHint}>{hint}</Text> : null}
      </View>
      <View style={[st.switch, value && st.switchOn]}>
        <View style={[st.knob, value && st.knobOn]} />
      </View>
    </Pressable>
  );
}

// Fenêtre par-dessus l'écran (révélation, confirmation…)
export function Overlay({ children, onClose }) {
  return (
    <Pressable style={st.overlay} onPress={onClose} accessibilityLabel={onClose ? 'Fermer' : undefined}>
      <Pressable style={[st.overlayCard, shadow('0 24px 60px -12px rgba(0,0,0,0.9)')]} onPress={() => {}}>
        <ScrollView style={{ maxHeight: '100%' }} contentContainerStyle={{ gap: 16, padding: 20 }}>{children}</ScrollView>
      </Pressable>
    </Pressable>
  );
}

// ── Jetons de joueurs ──
const TOKEN_COLORS = ['#7CC4FF', '#B9A2FF', '#4FD8A4', '#FF8A8A', '#E6C766'];
export const tokenColor = (i) => TOKEN_COLORS[i % TOKEN_COLORS.length];
export function PlayerToken({ name, index = 0, size = 32 }) {
  const c = tokenColor(index);
  return (
    <View style={{ width: size, height: size, borderRadius: size, backgroundColor: c + '1F', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: c, fontFamily: F.texteFort, fontSize: size * 0.42 }}>{(name || '?').trim().charAt(0).toUpperCase()}</Text>
    </View>
  );
}

// Liste de joueurs : jetons + champ « Ajouter un joueur » (Entrée pour valider)
export function PlayerEditor({ names, onChange, min = 2, max = 12 }) {
  const [draft, setDraft] = useState('');
  const filled = names.map((n) => n.trim()).filter(Boolean);
  const add = () => {
    const n = draft.trim();
    if (!n || filled.length >= max) return;
    onChange([...filled, n]); setDraft('');
  };
  const remove = (i) => onChange(filled.filter((_, j) => j !== i));
  return (
    <Section label="Joueurs" aside={`${filled.length} sur ${max}${filled.length < min ? ` · ${min} minimum` : ''}`}>
      <View style={st.chips}>
        {filled.map((n, i) => (
          <View key={n + i} style={st.player}>
            <PlayerToken name={n} index={i} />
            <Text style={st.playerName} numberOfLines={1}>{n}</Text>
            <Pressable onPress={() => remove(i)} accessibilityRole="button" accessibilityLabel={`Retirer ${n}`} style={st.playerX}>
              <Icon name="close" size={14} color={T.encreDouce} />
            </Pressable>
          </View>
        ))}
        {filled.length < max && (
          <View style={st.addPlayer}>
            <Icon name="plus" size={16} />
            <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={add} blurOnSubmit={false}
              placeholder={filled.length ? 'Ajouter un joueur' : 'Prénom du 1er joueur'} placeholderTextColor={T.encreDouce}
              maxLength={16} returnKeyType="done" accessibilityLabel="Prénom du joueur à ajouter" style={st.addInput} />
            {draft.trim() ? (
              <Pressable onPress={add} accessibilityRole="button" accessibilityLabel="Ajouter ce joueur" style={st.addOk}>
                <Icon name="check" size={16} color={T.surOr} />
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    </Section>
  );
}

// ── Boutons ──
export function PrimaryButton({ label, onPress, disabled, style }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} accessibilityRole="button" accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [st.primary, disabled ? { opacity: 0.4 } : shadow(HALO), pressed && !disabled && { transform: [{ scale: 0.98 }] }, style]}>
      <Text style={st.primaryText}>{label}</Text>
    </Pressable>
  );
}
export function SecondaryButton({ label, onPress, style, disabled }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} accessibilityRole="button" style={[st.secondary, disabled && { opacity: 0.4 }, style]}>
      <Text style={st.secondaryText}>{label}</Text>
    </Pressable>
  );
}
export function TextLink({ label, onPress, color = T.orTexte }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={st.link}>
      <Text style={[st.linkText, { color }]}>{label}</Text>
    </Pressable>
  );
}

// Barre du bas (fond-creux) : contient LE bouton principal de l'écran
export function ActionBar({ children, note }) {
  return (
    <View style={st.actionBar}>
      {children}
      {note ? <Text style={st.note}>{note}</Text> : null}
    </View>
  );
}

// ── Carte de question (face de carte de légende : cadre or intérieur) ──
export function QuestionCard({ kicker, children, footer, style }) {
  return (
    <View style={[st.qCard, shadow('0 18px 40px -12px rgba(0,0,0,0.8)'), style]}>
      <View style={st.qInner}>
        {kicker ? <Text style={st.qKicker}>{kicker.toUpperCase()}</Text> : null}
        {typeof children === 'string' ? <Text style={st.qText}>{children}</Text> : children}
        {footer ? <><View style={st.qRule} /><Text style={st.qFooter}>{footer}</Text></> : null}
      </View>
    </View>
  );
}

// ── Écran « Passez le téléphone à … » ──
export function PassPhone({ game, name, index = 0, order = [], kicker = 'À vous de jouer', instruction = 'Les autres joueurs détournent le regard.', extra }) {
  return (
    <View style={st.pass}>
      <View style={[st.passCard, shadow('0 18px 40px -12px rgba(0,0,0,0.8)')]}>
        <View style={st.passInner}>
          <Text style={st.qKicker}>{kicker.toUpperCase()}</Text>
          <PlayerToken name={name} index={index} size={88} />
          <Text style={st.passName} numberOfLines={1}>{name}</Text>
          <View style={st.qRule} />
          {order.length ? <Text style={st.qKicker}>JOUEUR {index + 1} SUR {order.length}</Text> : null}
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={st.passTitle}>Passez le téléphone à {name}</Text>
        <Text style={st.passText}>{instruction}</Text>
        {extra}
      </View>
      {order.length > 1 && (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {order.map((n, i) => (
            <View key={n + i} style={[st.orderDot, i === index && { backgroundColor: tokenColor(i), borderColor: tokenColor(i) }]}>
              <Text style={[st.orderText, i === index && { color: T.fond }]}>{(n || '?').charAt(0).toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Titre d'écran : surtitre en chiffres, titre affiche, sous-titre ──
export function Heading({ kicker, title, sub, align = 'center' }) {
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start', gap: 6 }}>
      {kicker ? <Text style={[st.surtitre, { textAlign: align }]}>{kicker.toUpperCase()}</Text> : null}
      {title ? <Text style={[st.h1, { textAlign: align }]}>{title}</Text> : null}
      {sub ? <Text style={[st.sub, { textAlign: align }]}>{sub}</Text> : null}
    </View>
  );
}

// Encadré d'information (or = révélation, alerte = attention, famille = neutre coloré)
export function Notice({ tone = 'or', title, children, style }) {
  const c = tone === 'alerte' ? { b: T.alerte, bg: T.alerteVoile, t: T.alerte } : tone === 'neutre' ? { b: T.trait, bg: T.carte, t: T.encre } : { b: T.or, bg: T.orVoile, t: T.orTexte };
  return (
    <View style={[st.notice, { borderColor: c.b, backgroundColor: c.bg }, style]}>
      {title ? <Text style={[st.noticeTitle, { color: c.t }]}>{title}</Text> : null}
      {typeof children === 'string' ? <Text style={st.noticeText}>{children}</Text> : children}
    </View>
  );
}

// Rangée de joueur sélectionnable (vote, désignation…)
export function PlayerChoice({ name, index, selected, onPress, label, right, disabled }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      accessibilityLabel={label || name}
      style={({ pressed }) => [st.choice, selected && st.choiceOn, pressed && !disabled && { borderColor: T.or }, disabled && { opacity: 0.4 }]}>
      <PlayerToken name={name} index={index} />
      <Text style={[st.choiceName, selected && { color: T.orTexte }]} numberOfLines={1}>{name}</Text>
      {right !== undefined ? right : selected ? <Icon name="check" size={18} color={T.orTexte} /> : null}
    </Pressable>
  );
}
export function PlayerGrid({ children }) {
  return <View style={st.choiceGrid}>{children}</View>;
}

// Classement final : rang, jeton, nom, barre, score
export function Ranking({ players, scores, order, suffix = '' }) {
  const sorted = order || [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const best = Math.max(1, ...sorted.map((n) => scores[n] || 0));
  return (
    <View style={{ gap: 8 }}>
      {sorted.map((name, i) => {
        const first = i === 0 && (scores[name] || 0) > 0;
        return (
          <View key={name} style={[st.rankRow, first && st.rankFirst]}>
            <Text style={[st.rank, first && { color: T.orTexte }]}>{String(i + 1).padStart(2, '0')}</Text>
            <PlayerToken name={name} index={players.indexOf(name)} />
            <Text style={[st.rankName, first && { color: T.orTexte }]} numberOfLines={1}>{name}</Text>
            <View style={st.barTrack}><View style={[st.barFill, { width: `${Math.max(0, (scores[name] || 0) / best) * 100}%`, backgroundColor: first ? T.orTexte : T.encreDouce }]} /></View>
            <Text style={[st.rankScore, first && { color: T.orTexte }]}>{scores[name] || 0}{suffix}</Text>
          </View>
        );
      })}
    </View>
  );
}

// Barre de fin de partie : Rejouer (or) + Retour aux jeux
export function EndActions({ navigation, route, replay, children }) {
  return (
    <ActionBar>
      {children}
      <PrimaryButton label="Rejouer" onPress={replay || (() => navigation.replace(route.name, route.params))} />
      <TextLink label="Retour aux jeux" onPress={() => navigation.navigate('Menu')} />
    </ActionBar>
  );
}

// Réponse à choix (A, B, C, D) : état null | 'correct' | 'wrong' | 'neutral' | 'selected'
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
export function AnswerChoice({ label, index, state, onPress, disabled }) {
  const c = state === 'correct' ? { b: '#4FD8A4', bg: 'rgba(79,216,164,0.12)', t: T.encre, l: '#4FD8A4' }
    : state === 'wrong' ? { b: T.alerte, bg: T.alerteVoile, t: T.encre, l: T.alerte }
      : state === 'selected' ? { b: T.or, bg: T.orVoile, t: T.orTexte, l: T.or }
        : state === 'neutral' ? { b: T.trait, bg: 'transparent', t: T.encreDouce, l: T.trait }
          : { b: T.traitFort, bg: T.carte, t: T.encre, l: T.traitFort };
  return (
    <Pressable onPress={disabled ? undefined : onPress} accessibilityRole="button" accessibilityState={{ disabled: !!disabled, selected: state === 'selected' }}
      accessibilityLabel={`Réponse ${LETTERS[index]} : ${label}${state === 'correct' ? ', bonne réponse' : state === 'wrong' ? ', mauvaise réponse' : ''}`}
      style={({ pressed }) => [st.answer, { borderColor: c.b, backgroundColor: c.bg }, pressed && !disabled && { borderColor: T.or }]}>
      <View style={[st.answerLetter, { borderColor: c.l, backgroundColor: state === 'correct' || state === 'wrong' ? c.l : 'transparent' }]}>
        {state === 'correct' ? <Icon name="check" size={16} color={T.fond} />
          : state === 'wrong' ? <Icon name="close" size={14} color={T.fond} />
            : <Text style={[st.answerLetterText, { color: state === 'selected' ? T.orTexte : T.encreDouce }]}>{LETTERS[index]}</Text>}
      </View>
      <Text style={[st.answerText, { color: c.t }]}>{label}</Text>
    </Pressable>
  );
}

// Barre de temps qui se vide (remise à zéro quand resetKey change)
export function TimeBar({ running, duration, onExpire, resetKey, color = '#4FD8A4' }) {
  const [left, setLeft] = useState(1);
  const cb = useRef(onExpire); cb.current = onExpire;
  useEffect(() => {
    setLeft(1);
    if (!running) return undefined;
    const t0 = Date.now();
    const id = setInterval(() => {
      const r = Math.max(0, 1 - (Date.now() - t0) / (duration * 1000));
      setLeft(r);
      if (r <= 0) { clearInterval(id); cb.current && cb.current(); }
    }, 100);
    return () => clearInterval(id);
  }, [resetKey, running]);
  const col = left > 0.5 ? color : left > 0.2 ? T.orTexte : T.alerte;
  return (
    <View style={st.timeTrack} accessibilityRole="progressbar" accessibilityLabel={`${Math.ceil(left * duration)} secondes restantes`}>
      <View style={[st.timeFill, { width: `${left * 100}%`, backgroundColor: col }]} />
    </View>
  );
}

// ── Multi-téléphones : code de salle + liste des joueurs connectés ──
export function RoomCode({ code, hint = 'Partagez ce code avec vos amis.' }) {
  return (
    <View style={[st.qCard, shadow('0 18px 40px -12px rgba(0,0,0,0.8)')]}>
      <View style={st.qInner}>
        <Text style={st.qKicker}>CODE DE LA SALLE</Text>
        <Text style={st.roomCode} accessibilityLabel={`Code de la salle : ${(code || '').split('').join(' ')}`}>{code ?? '…'}</Text>
        <View style={st.qRule} />
        <Text style={st.qFooter}>{hint}</Text>
      </View>
    </View>
  );
}
export function LobbyPlayers({ players, meId, min = 2, label = 'Joueurs connectés' }) {
  return (
    <Section label={`${label} · ${players.length}`}>
      <View style={{ gap: 8 }}>
        {players.map((p, i) => (
          <View key={p.id} style={[st.rankRow, p.id === meId && { borderColor: T.or }]}>
            <PlayerToken name={p.name} index={i} />
            <Text style={[st.choiceName, p.id === meId && { color: T.orTexte }]} numberOfLines={1}>{p.name}{p.id === meId ? ' (vous)' : ''}</Text>
            {p.is_host ? <Text style={st.sectionAside}>Hôte</Text> : null}
          </View>
        ))}
        {players.length < min ? <Text style={st.note}>En attente d’au moins {min} joueurs…</Text> : null}
      </View>
    </Section>
  );
}

// Écran complet de salle d'attente (multi-téléphones)
export function LobbyScreen({ game, code, players, meId, isHost, starting, onStart, onLeave, min = 2, label, rules, startLabel = 'Lancer la partie', children }) {
  return (
    <GameScreen
      top={<GameTopBar game={game} onBack={onLeave} right={<Text style={st.lobbyTag}>ATTENTE</Text>} />}
      footer={(
        <ActionBar>
          {isHost ? (
            <PrimaryButton label={starting ? 'Lancement…' : startLabel} onPress={onStart} disabled={players.length < min || starting} />
          ) : (
            <View style={st.lobbyWait}>
              <ActivityIndicator color={T.orTexte} />
              <Text style={st.lobbyWaitText}>En attente que l’hôte lance la partie…</Text>
            </View>
          )}
          <TextLink label="Quitter la salle" color={T.encreDouce} onPress={onLeave} />
        </ActionBar>
      )}
    >
      <RoomCode code={code} />
      {children}
      <LobbyPlayers players={players} meId={meId} min={min} label={label} />
      {rules ? <Text style={[st.note, { fontSize: 14, lineHeight: 21 }]}>{rules}</Text> : null}
    </GameScreen>
  );
}

// Champ de saisie au style du système
export const Field = React.forwardRef(function Field({ style, multiline, ...props }, ref) {
  return (
    <TextInput ref={ref} placeholderTextColor={T.encreDouce} multiline={multiline}
      style={[st.field, multiline && { minHeight: 96, textAlignVertical: 'top', paddingTop: 12 }, style]} {...props} />
  );
});

// ── Écran plein : barre du haut + contenu défilant + barre d'action ──
export function GameScreen({ top, children, footer, scroll = true, contentStyle }) {
  return (
    <View style={st.screen}>
      {top}
      {scroll
        ? <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={[st.content, contentStyle]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        : <View style={[{ flex: 1, minHeight: 0 }, st.content, contentStyle]}>{children}</View>}
      {footer}
    </View>
  );
}

// ── Gabarit des écrans de réglages ──
export function SetupLayout({ game, navigation, onBack, rules = [], children, startLabel = 'Lancer la partie', onStart, canStart = true, note, secondary, subtitle }) {
  const [showRules, setShowRules] = useState(false);
  return (
    <View style={st.screen}>
      <GameTopBar game={game} mode="setup" onBack={onBack || (() => navigation.navigate('Menu'))} onHelp={rules.length ? () => setShowRules(true) : null} />
      <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
        <LegendHeader game={game} subtitle={subtitle} />
        {children}
      </ScrollView>
      <ActionBar note={note}>
        {secondary}
        <PrimaryButton label={startLabel} onPress={onStart} disabled={!canStart} />
      </ActionBar>
      {showRules && (
        <Pressable style={st.sheetBack} onPress={() => setShowRules(false)} accessibilityLabel="Fermer les règles">
          <Pressable style={st.sheet} onPress={() => {}}>
            <View style={st.sectionHead}>
              <Text style={st.sheetTitle}>Comment jouer</Text>
              <Pressable onPress={() => setShowRules(false)} accessibilityRole="button" accessibilityLabel="Fermer" style={st.helpBtn}><Icon name="close" /></Pressable>
            </View>
            {rules.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={st.ruleNum}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={st.ruleText}>{r}</Text>
              </View>
            ))}
            <PrimaryButton label="Compris" onPress={() => setShowRules(false)} style={{ marginTop: 8 }} />
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, backgroundColor: T.fond, ...Platform.select({ web: { height: FULL_HEIGHT } }) },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 22, width: '100%', maxWidth: 560, alignSelf: 'center' },

  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  topLeft: { minWidth: 96, height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  topLeftText: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  topTitle: { flex: 1, textAlign: 'center', color: T.encre, fontFamily: F.afficheSemi, fontSize: 17 },
  numero: { flex: 1, textAlign: 'center', color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2.2 },
  topRight: { minWidth: 96, alignItems: 'flex-end', paddingHorizontal: 4 },
  counter: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 2.2 },
  helpBtn: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  topRule: { height: 1, backgroundColor: T.trait },
  progressTrack: { height: 3, backgroundColor: T.trait },
  progressFill: { height: 3 },

  legend: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  medal: { width: 84, height: 84, borderRadius: 999, borderWidth: 2, padding: 3, overflow: 'hidden' },
  medalImg: { width: '100%', height: '100%', borderRadius: 999 },
  surtitre: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  legendTitle: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 30, lineHeight: 34 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  meta: { color: T.encreDouce, fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 24, paddingLeft: 6, paddingRight: 8, borderRadius: 6 },
  badgeText: { fontFamily: F.texteMoyen, fontSize: 13 },
  adult: { height: 20, paddingHorizontal: 6, borderRadius: 6, borderWidth: 1, borderColor: T.alerte, justifyContent: 'center' },
  adultText: { color: T.alerte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 0.6 },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { color: T.encreDouce, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4 },
  sectionAside: { color: T.encreDouce, fontSize: 13 },
  panel: { padding: 14, borderRadius: 12, backgroundColor: T.carte, borderWidth: 1, borderColor: T.trait, gap: 10 },

  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  pillOn: { borderColor: T.or, backgroundColor: T.orVoile },
  pillText: { color: T.encre, fontFamily: F.texteFort, fontSize: 15, textAlign: 'center' },
  pillTextOn: { color: T.orTexte },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort },
  chipOn: { borderColor: T.or, backgroundColor: T.orVoile },
  chipText: { color: T.encre, fontFamily: F.texteMoyen, fontSize: 14 },
  chipTextOn: { color: T.orTexte, fontFamily: F.texteFort },
  level: { flex: 1, minHeight: 88, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.carte, justifyContent: 'space-between' },
  levelOn: { borderColor: T.or, backgroundColor: T.orVoile },
  heat: { width: 10, height: 4, borderRadius: 2 },
  levelLabel: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  levelSub: { color: T.encreDouce, fontSize: 12 },
  levelAdult: { color: T.alerte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 0.6 },

  player: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4, paddingRight: 2, borderRadius: 999, backgroundColor: T.carte, borderWidth: 1, borderColor: T.trait, maxWidth: '100%' },
  playerName: { color: T.encre, fontSize: 15, maxWidth: 140 },
  playerX: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  addPlayer: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 4, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: T.traitFort, flexGrow: 1, minWidth: 190 },
  addInput: { flex: 1, minWidth: 0, color: T.encre, fontSize: 16, paddingVertical: 0, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  addOk: { width: 32, height: 32, borderRadius: 999, backgroundColor: T.or, alignItems: 'center', justifyContent: 'center' },

  primary: { height: 52, borderRadius: 999, backgroundColor: T.or, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, width: '100%' },
  primaryText: { color: T.surOr, fontFamily: F.texteFort, fontSize: 16, letterSpacing: 0.3 },
  secondary: { height: 48, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, width: '100%' },
  secondaryText: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  link: { minHeight: 36, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  linkText: { fontFamily: F.texteFort, fontSize: 14 },
  actionBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: T.creux, borderTopWidth: 1, borderTopColor: T.trait, gap: 8, alignItems: 'center' },
  note: { color: T.encreDouce, fontSize: 13, lineHeight: 18, textAlign: 'center' },

  qCard: { borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  qInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', paddingVertical: 24, paddingHorizontal: 18, alignItems: 'center', gap: 14 },
  qKicker: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 11, letterSpacing: 2.4, textAlign: 'center' },
  qText: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 26, lineHeight: 32, textAlign: 'center' },
  qRule: { width: 56, height: 1, backgroundColor: 'rgba(212,175,55,0.5)' },
  qFooter: { color: T.encreDouce, fontSize: 14, textAlign: 'center' },

  pass: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, paddingHorizontal: 16, paddingVertical: 12 },
  passCard: { width: 236, borderRadius: 18, backgroundColor: T.carte, padding: 8 },
  passInner: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.6)', paddingVertical: 26, paddingHorizontal: 12, alignItems: 'center', gap: 14 },
  passName: { color: T.encre, fontFamily: F.affiche, fontSize: 38, lineHeight: 42 },
  passTitle: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 26, lineHeight: 32, textAlign: 'center' },
  passText: { color: T.encreDouce, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  orderDot: { width: 34, height: 34, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort, alignItems: 'center', justifyContent: 'center' },
  orderText: { color: T.encreDouce, fontFamily: F.texteFort, fontSize: 13 },

  h1: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 30, lineHeight: 35 },
  sub: { color: T.encreDouce, fontSize: 15, lineHeight: 22 },
  notice: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 6 },
  noticeTitle: { fontFamily: F.texteFort, fontSize: 16, textAlign: 'center' },
  noticeText: { color: T.encre, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { flexBasis: '47%', flexGrow: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort },
  choiceOn: { borderColor: T.or, backgroundColor: T.orVoile },
  choiceName: { flex: 1, color: T.encre, fontFamily: F.texteMoyen, fontSize: 16 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: T.carte, borderWidth: 1, borderColor: T.trait },
  rankFirst: { borderColor: T.or, backgroundColor: T.orVoile },
  rank: { width: 24, color: T.encreDouce, fontFamily: F.chiffre, fontSize: 13 },
  rankName: { width: 86, color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  rankScore: { minWidth: 28, textAlign: 'right', color: T.encre, fontFamily: F.chiffre, fontSize: 15 },
  barTrack: { flex: 1, height: 10, borderRadius: 999, backgroundColor: T.trait, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 999 },
  field: { minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: T.traitFort, backgroundColor: T.creux, color: T.encre, fontSize: 16, paddingHorizontal: 14, ...Platform.select({ web: { outlineStyle: 'none', resize: 'none' } }) },

  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 44, height: 44, borderRadius: 999, borderWidth: 1, borderColor: T.traitFort, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 40, textAlign: 'center', color: T.encre, fontFamily: F.chiffre, fontSize: 20 },
  rowSetting: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: T.carte, borderWidth: 1, borderColor: T.trait },
  rowLabel: { color: T.encre, fontFamily: F.texteFort, fontSize: 15 },
  rowHint: { color: T.encreDouce, fontSize: 13, lineHeight: 18 },
  switch: { width: 48, height: 28, borderRadius: 999, backgroundColor: T.trait, padding: 3, justifyContent: 'center' },
  switchOn: { backgroundColor: T.or },
  knob: { width: 22, height: 22, borderRadius: 999, backgroundColor: T.encreDouce },
  knobOn: { backgroundColor: T.surOr, transform: [{ translateX: 20 }] },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,7,15,0.82)', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 },
  overlayCard: { width: '100%', maxWidth: 440, maxHeight: '92%', borderRadius: 18, backgroundColor: T.carte, borderWidth: 1, borderColor: T.trait, overflow: 'hidden' },

  answer: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  answerLetter: { width: 30, height: 30, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  answerLetterText: { fontFamily: F.chiffre, fontSize: 13 },
  answerText: { flex: 1, fontFamily: F.texteMoyen, fontSize: 16, lineHeight: 22 },
  timeTrack: { height: 6, borderRadius: 999, backgroundColor: T.trait, overflow: 'hidden' },
  timeFill: { height: 6, borderRadius: 999 },

  lobbyTag: { color: T.encreDouce, fontSize: 11, letterSpacing: 1.6 },
  lobbyWait: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 },
  lobbyWaitText: { color: T.encre, fontSize: 15 },
  roomCode: { color: T.encre, fontFamily: F.chiffre, fontSize: 48, letterSpacing: 12, paddingLeft: 12 },

  sheetBack: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,7,15,0.78)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: T.carte, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, borderColor: T.trait, padding: 20, gap: 14, width: '100%', maxWidth: 560, alignSelf: 'center' },
  sheetTitle: { color: T.encre, fontFamily: F.afficheSemi, fontSize: 26 },
  ruleNum: { color: T.orTexte, fontFamily: F.chiffre, fontSize: 12, letterSpacing: 1.6, paddingTop: 3 },
  ruleText: { flex: 1, color: T.encre, fontSize: 16, lineHeight: 23 },
});
