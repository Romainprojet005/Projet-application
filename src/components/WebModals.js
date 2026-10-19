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
    .sdl-steps { margin: 18px 0 0; padding: 0; list-style: none; counter-reset: s; display: grid; gap: 14px; }
    .sdl-steps li { position: relative; padding-left: 40px; font-size: 15px; line-height: 22px; counter-increment: s; }
    .sdl-steps li::before { content: counter(s); position: absolute; left: 0; top: -2px; width: 28px; height: 28px; border-radius: 50%;
      background: #D4AF37; color: #1A1408; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; }
    .sdl-steps strong { color: #F3EEE2; }
    .sdl-ico { display: inline-block; vertical-align: -3px; color: #4DA3FF; }
    .sdl-tip { display: block; margin-top: 4px; font-size: 13px; line-height: 19px; color: #A9A3BF; }
    .sdl-copy { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 14px; }
    .sdl-copy code { padding: 10px 12px; border-radius: 8px; background: #0E0C1A; border: 1px solid #2E2A4A; font-size: 14px; }
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
        <p className="sdl-note" style={{ textAlign: 'left', margin: 0 }}>
          Votre idée est conservée 2 ans au maximum. <a href="/confidentialite/" target="_blank" rel="noopener" style={{ color: '#E6C766' }}>Confidentialité</a>
        </p>
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

// iPhone/iPad : aucun navigateur n'a de bouton d'installation, et le plein écran n'existe
// que pour le site ajouté à l'écran d'accueil. On guide pas à pas, selon le navigateur.
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="sdl-ico">
    <path d="M12 3v12M8 7l4-4 4 4" /><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
  </svg>
);
const AddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="sdl-ico">
    <rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" />
  </svg>
);

function iosBrowser() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/CriOS/.test(ua)) return 'chrome';
  if (/GSA\/|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Instagram|FBAN|FBAV/.test(ua)) return 'autre';
  return 'safari';
}

export function InstallModal({ onClose }) {
  const browser = iosBrowser();
  const [copie, setCopie] = useState(false);
  const lien = typeof window !== 'undefined' ? window.location.origin + '/' : 'https://soireedeslegendes.com/';
  const copier = async () => {
    try { await navigator.clipboard.writeText(lien); setCopie(true); } catch { setCopie(false); }
  };

  return (
    <Modal onClose={onClose} small label="Installer l'appli">
      <span className="sdl-kick">Appli · plein écran</span>
      <h2 className="sdl-mh">Ajouter à l’écran d’accueil</h2>
      <p className="sdl-mp">
        Sur iPhone, c’est le seul moyen de jouer <strong>en plein écran, sans barre d’adresse</strong>.
        Le site s’ouvre ensuite comme une vraie appli, avec son icône.
      </p>

      {browser === 'autre' ? (
        <>
          <ol className="sdl-steps">
            <li>Cette appli ne permet pas d’ajouter un site à l’écran d’accueil : il faut passer par <strong>Safari</strong>.</li>
            <li>Copiez le lien ci-dessous, ouvrez <strong>Safari</strong>, collez-le dans la barre d’adresse.</li>
            <li>Touchez à nouveau <strong>Installer</strong> sur le site : les étapes pour Safari s’afficheront.</li>
          </ol>
          <div className="sdl-copy">
            <code>{lien.replace('https://', '')}</code>
            <button className="sdl-btn or" onClick={copier}>{copie ? 'Lien copié ✓' : 'Copier le lien'}</button>
          </div>
        </>
      ) : (
        <ol className="sdl-steps">
          {browser === 'chrome' ? (
            <li>Touchez <strong>Partager</strong> <ShareIcon /> à droite de la barre d’adresse, en haut de l’écran.</li>
          ) : (
            <li>
              Touchez <strong>Partager</strong> <ShareIcon /> dans la barre en bas de l’écran.
              <span className="sdl-tip">Vous ne le voyez pas ? Touchez d’abord <strong>•••</strong> en bas à droite, ou faites
              défiler la page vers le haut pour faire réapparaître la barre.</span>
            </li>
          )}
          <li>
            Faites défiler la liste et touchez <strong>Sur l’écran d’accueil</strong> <AddIcon />.
            <span className="sdl-tip">Pas dans la liste ? Touchez <strong>Afficher plus</strong> ou <strong>Modifier les actions</strong>.</span>
          </li>
          <li>Touchez <strong>Ajouter</strong>, en haut à droite.</li>
          <li>Lancez <strong>Légendes</strong> depuis l’icône de votre écran d’accueil.</li>
        </ol>
      )}

      <div style={{ marginTop: 20 }}><button className="sdl-btn" onClick={onClose}>Fermer</button></div>
    </Modal>
  );
}

export { LockIcon };
