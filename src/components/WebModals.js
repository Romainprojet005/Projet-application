import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { OFFRES, JEUX_GRATUITS_PAR_JOUR } from '../config/offres';
import { avantRotation, verifierCode } from '../services/acces';
import { supabase } from '../services/supabase';
import { LockIcon } from './BoosterCard';

// ── Fenêtres (web) : offres / déblocage, et boîte à idées ─────────────

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('sdl-modal-css')) {
  const st = document.createElement('style');
  st.id = 'sdl-modal-css';
  st.textContent = `
    .sdl-modal { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;
      padding: 16px; background: rgba(8,7,15,.78); font-family: 'Outfit', system-ui, sans-serif; color: #F3EEE2; }
    .sdl-box { position: relative; width: min(100%, 860px); max-height: calc(100vh - 32px); max-height: calc(100dvh - 32px); overflow: auto; box-sizing: border-box;
      background: #1A1730; border: 1px solid #2E2A4A; border-radius: 16px; padding: 28px;
      box-shadow: 0 30px 80px -20px #000; }
    .sdl-box.small { width: min(100%, 520px); }
    .sdl-x { position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border-radius: 50%;
      border: 1px solid #2E2A4A; background: transparent; color: #F3EEE2; font-size: 22px; cursor: pointer; }
    .sdl-x:hover { border-color: #6B6590; }
    .sdl-kick { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: .2em;
      text-transform: uppercase; color: #E6C766; }
    .sdl-mh { margin: 6px 0 8px; font-family: 'Bodoni Moda', Didot, Georgia, serif; font-weight: 600; font-size: 30px; line-height: 1.1; padding-right: 40px; }
    .sdl-mp { margin: 0; font-size: 15px; line-height: 22px; color: #A9A3BF; }
    .sdl-offers { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 22px 0 16px; }
    .sdl-offer { position: relative; display: flex; flex-direction: column; gap: 10px; padding: 22px 18px 18px; border-radius: 12px;
      border: 1px solid #6B6590; background: #0E0C1A; }
    .sdl-offer.best { border: 2px solid #D4AF37; background: rgba(212,175,55,.08); }
    .sdl-flag { position: absolute; top: -11px; left: 16px; background: #D4AF37; color: #1A1408; border-radius: 99px;
      padding: 3px 10px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; }
    .sdl-offer h3 { margin: 0; font-family: 'Bodoni Moda', Georgia, serif; font-weight: 600; font-size: 24px; }
    .sdl-price { font-family: 'Bodoni Moda', Georgia, serif; font-weight: 600; font-size: 30px; color: #E6C766; }
    .sdl-price small { font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 14px; color: #A9A3BF; }
    .sdl-offer p { margin: 0; flex: 1; font-size: 14px; line-height: 20px; color: #A9A3BF; }
    .sdl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; box-sizing: border-box;
      padding: 10px 20px; border-radius: 99px; border: 1px solid #6B6590; background: transparent; color: #F3EEE2;
      font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 15px; text-decoration: none; cursor: pointer; }
    .sdl-btn:hover { border-color: #F3EEE2; }
    .sdl-btn.or { background: #D4AF37; color: #1A1408; border-color: transparent; }
    .sdl-btn.or:hover { background: #E0BD4C; }
    .sdl-btn[disabled], .sdl-btn[aria-disabled="true"] { opacity: .45; cursor: default; pointer-events: none; }
    .sdl-btn:focus-visible, .sdl-x:focus-visible, .sdl-field input:focus-visible, .sdl-field textarea:focus-visible {
      outline: 2px solid #F4DC8C; outline-offset: 2px; }
    .sdl-note { font-size: 13px; line-height: 20px; color: #A9A3BF; text-align: center; }
    .sdl-form { display: grid; gap: 14px; margin-top: 18px; }
    .sdl-field { display: grid; gap: 6px; font-size: 14px; font-weight: 500; }
    .sdl-field span em { font-style: normal; font-weight: 400; color: #A9A3BF; }
    .sdl-field input, .sdl-field textarea { box-sizing: border-box; width: 100%; padding: 12px 14px; border-radius: 8px;
      border: 1px solid #6B6590; background: #0E0C1A; color: #F3EEE2; font: 400 15px/22px 'Outfit', sans-serif; }
    .sdl-field textarea { min-height: 120px; resize: vertical; }
    .sdl-msg { font-size: 14px; line-height: 20px; padding: 10px 12px; border-radius: 8px; }
    .sdl-msg.err { color: #FF8A8A; border: 1px solid #FF8A8A; }
    @media (max-width: 600px) { .sdl-box { padding: 22px 18px; } .sdl-mh { font-size: 24px; } }
  `;
  document.head.appendChild(st);
}

function Modal({ onClose, small, label, children }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="sdl-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
         onKeyDown={(e) => { if (e.key === 'Escape') onClose(); e.stopPropagation(); }}>
      <div className={`sdl-box${small ? ' small' : ''}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref}>
        <button className="sdl-x" onClick={onClose} aria-label="Fermer">×</button>
        {children}
      </div>
    </div>
  );
}

export function OffresModal({ game, onClose }) {
  const { heures, minutes } = avantRotation();
  return (
    <Modal onClose={onClose} label="Offres">
      <span className="sdl-kick">{game ? 'Jeu verrouillé aujourd’hui' : 'Offres'}</span>
      <h2 className="sdl-mh">{game ? `Débloquer ${game.gameName.toLowerCase().replace(/^./, m => m.toUpperCase())}` : 'Débloquez toutes les légendes'}</h2>
      <p className="sdl-mp">
        Chaque jour, {JEUX_GRATUITS_PAR_JOUR} jeux changent et sont offerts, et les jeux multi-téléphones sont toujours gratuits.
        Prochaine rotation dans {heures} h {String(minutes).padStart(2, '0')}.
      </p>
      <div className="sdl-offers">
        {OFFRES.map((o) => {
          const needsGame = o.id === 'jeu_24h' && !game;
          const ready = !!o.lien && !needsGame;
          return (
            <section key={o.id} className={`sdl-offer${o.recommande ? ' best' : ''}`}>
              {o.recommande && <span className="sdl-flag">Le plus choisi</span>}
              <h3>{o.titre}</h3>
              <div className="sdl-price">{o.prix} <small>/ {o.duree}</small></div>
              <p>{needsGame ? 'Touchez un jeu verrouillé pour le débloquer seul pendant 24 heures.' : o.detail}</p>
              <a
                className={`sdl-btn${o.recommande ? ' or' : ''}`}
                href={ready ? o.lien : undefined}
                target="_blank" rel="noopener noreferrer"
                aria-disabled={!ready}
              >
                {ready ? `Choisir · ${o.prix}` : (needsGame ? 'Choisir un jeu' : 'Bientôt disponible')}
              </a>
            </section>
          );
        })}
      </div>
      <p className="sdl-note">
        {OFFRES.some(o => o.lien)
          ? 'Paiement sécurisé. L’abonnement se résilie à tout moment.'
          : 'Le paiement en ligne arrive très bientôt. En attendant, profitez des jeux gratuits du jour !'}
      </p>
    </Modal>
  );
}

export function IdeeModal({ onClose }) {
  const [form, setForm] = useState({ titre: '', idee: '', joueurs: '', contact: '' });
  const [etat, setEtat] = useState('saisie'); // saisie | envoi | merci | erreur
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const envoyer = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.idee.trim()) return;
    setEtat('envoi');
    try {
      const { error } = await supabase.from('game_ideas').insert({
        title: form.titre.trim().slice(0, 80),
        description: form.idee.trim().slice(0, 1500),
        players: form.joueurs.trim().slice(0, 40) || null,
        contact: form.contact.trim().slice(0, 120) || null,
      });
      setEtat(error ? 'erreur' : 'merci');
    } catch {
      setEtat('erreur');
    }
  };

  if (etat === 'merci') {
    return (
      <Modal onClose={onClose} small label="Idée envoyée">
        <span className="sdl-kick">Boîte à idées</span>
        <h2 className="sdl-mh">Merci, idée bien reçue !</h2>
        <p className="sdl-mp">Les meilleures idées deviendront peut-être la prochaine légende.</p>
        <div style={{ marginTop: 20 }}><button className="sdl-btn or" onClick={onClose}>Retour aux jeux</button></div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} small label="Proposer un jeu">
      <span className="sdl-kick">Boîte à idées</span>
      <h2 className="sdl-mh">Proposez votre jeu</h2>
      <p className="sdl-mp">Une idée de jeu de soirée ? Décrivez-la, on lit tout.</p>
      <form className="sdl-form" onSubmit={envoyer}>
        <label className="sdl-field"><span>Nom du jeu</span>
          <input value={form.titre} onChange={set('titre')} maxLength={80} required placeholder="Ex. : Le Grand Détournement" />
        </label>
        <label className="sdl-field"><span>Comment on y joue ?</span>
          <textarea value={form.idee} onChange={set('idee')} maxLength={1500} required placeholder="Le principe, les règles, ce qui le rend drôle…" />
        </label>
        <label className="sdl-field"><span>Nombre de joueurs <em>(facultatif)</em></span>
          <input value={form.joueurs} onChange={set('joueurs')} maxLength={40} placeholder="Ex. : 4 à 10" />
        </label>
        <label className="sdl-field"><span>Prénom ou email <em>(facultatif, pour vous recontacter)</em></span>
          <input value={form.contact} onChange={set('contact')} maxLength={120} />
        </label>
        {etat === 'erreur' && <div className="sdl-msg err" role="alert">L’envoi n’a pas fonctionné. Réessayez dans un instant.</div>}
        <div><button className="sdl-btn or" type="submit" disabled={etat === 'envoi'}>
          {etat === 'envoi' ? 'Envoi…' : 'Envoyer mon idée'}
        </button></div>
      </form>
    </Modal>
  );
}

export function CodeModal({ onClose, onUnlock }) {
  const [code, setCode] = useState('');
  const [etat, setEtat] = useState('saisie'); // saisie | ok | faux
  const valider = async (e) => {
    e.preventDefault();
    if (code.length !== 4) return;
    if (await verifierCode(code)) { setEtat('ok'); onUnlock?.(); }
    else { setEtat('faux'); setCode(''); }
  };
  return (
    <Modal onClose={onClose} small label="Code d'accès">
      <span className="sdl-kick">Accès</span>
      <h2 className="sdl-mh">{etat === 'ok' ? 'Tous les jeux sont débloqués' : 'Code d\u2019accès'}</h2>
      {etat === 'ok' ? (
        <div style={{ marginTop: 16 }}><button className="sdl-btn or" onClick={onClose}>Retour aux jeux</button></div>
      ) : (
        <form className="sdl-form" onSubmit={valider}>
          <label className="sdl-field"><span>Code à 4 chiffres</span>
            <input value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 4)); setEtat('saisie'); }}
              inputMode="numeric" autoComplete="off" maxLength={4} autoFocus
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, letterSpacing: '.5em', textAlign: 'center' }} />
          </label>
          {etat === 'faux' && <div className="sdl-msg err" role="alert">Code incorrect.</div>}
          <div><button className="sdl-btn or" type="submit" disabled={code.length !== 4}>Valider</button></div>
        </form>
      )}
    </Modal>
  );
}

// iPhone/iPad : Safari n'a pas de bouton d'installation, on explique la marche à suivre.
export function InstallModal({ onClose }) {
  return (
    <Modal onClose={onClose} small label="Installer l'appli">
      <span className="sdl-kick">Appli</span>
      <h2 className="sdl-mh">Installer sur l’iPhone</h2>
      <p className="sdl-mp">
        1. Touchez <strong>Partager</strong> (le carré avec une flèche vers le haut) dans Safari.<br />
        2. Choisissez <strong>Sur l’écran d’accueil</strong>, puis <strong>Ajouter</strong>.
      </p>
      <p className="sdl-mp" style={{ marginTop: 12 }}>
        Les jeux s’ouvrent alors en plein écran, sans barre d’adresse, et restent jouables si le réseau coupe.
      </p>
      <div style={{ marginTop: 20 }}><button className="sdl-btn or" onClick={onClose}>Compris</button></div>
    </Modal>
  );
}

export { LockIcon };
