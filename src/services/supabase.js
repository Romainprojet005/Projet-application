import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdfwbswlejpcstycjcnj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oSmPF4n_PyzC8DyzlSDD6Q_kCPweM4A';

export const isSupabaseConfigured = true;

// Clé secrète propre à ce téléphone : la base n'en garde que l'empreinte (voir supabase_securite.sql)
// et n'autorise à modifier une salle que les téléphones qui y ont rejoint.
let memorySecret = null;
function getClientSecret() {
  try {
    let s = localStorage.getItem('sdl_client_secret');
    if (!s) {
      s = newSecret();
      localStorage.setItem('sdl_client_secret', s);
    }
    return s;
  } catch {
    return memorySecret || (memorySecret = newSecret());
  }
}

function newSecret() {
  const bytes = new Uint8Array(24);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const customFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set('apikey', SUPABASE_KEY);
  headers.set('Authorization', `Bearer ${SUPABASE_KEY}`);
  headers.set('x-client-secret', getClientSecret());
  return fetch(url, { ...options, headers });
};

let _client = null;
try {
  _client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: customFetch },
    realtime: { params: { eventsPerSecond: 10 } },
  });
} catch (e) {
  console.warn('Supabase init failed:', e.message);
}

export const supabase = _client;

// Nom de canal temps réel unique par écran ouvert. supabase.channel() renvoie le canal existant
// si le nom est déjà pris (écran remonté, ancien canal pas encore fermé) : y ajouter des écouteurs
// après subscribe() échoue et l'écran ne reçoit plus aucune mise à jour.
export const channelName = (name) => `${name}:${Math.random().toString(36).slice(2, 10)}`;
