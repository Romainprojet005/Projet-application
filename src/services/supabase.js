import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdfwbswlejpcstycjcnj.supabase.co';
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ'));

let _client = null;
try {
  if (isSupabaseConfigured) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
} catch (e) {
  console.warn('Supabase init failed:', e.message);
}

export const supabase = _client;
