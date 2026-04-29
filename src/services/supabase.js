import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdfwbswlejpcstycjcnj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_oSmPF4n_PyzC8DyzlSDD6Q_kCPweM4A';

export const isSupabaseConfigured = true;

let _client = null;
try {
  _client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  });
} catch (e) {
  console.warn('Supabase init failed:', e.message);
}

export const supabase = _client;
