import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdfwbswlejpcstycjcnj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZndic3dsZWpwY3N0eWNqY25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzQ0NzYsImV4cCI6MjA5MzA1MDQ3Nn0.7oRaTDpaX9amQwLaJf8-uBN-os9gEKThowLBkvOYh3E';

export const isSupabaseConfigured = true;

let _client = null;
try {
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
} catch (e) {
  console.warn('Supabase init failed:', e.message);
}

export const supabase = _client;
