import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdfwbswlejpcstycjcnj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oSmPF4n_PyzC8DyzlSDD6Q_kCPweM4A';

export const isSupabaseConfigured = true;

const customFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set('apikey', SUPABASE_KEY);
  headers.set('Authorization', `Bearer ${SUPABASE_KEY}`);
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
