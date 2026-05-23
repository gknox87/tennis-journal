
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your .env file.'
  );
}

// Migrate old storage key to new one (one-time migration)
const OLD_STORAGE_KEY = 'tennis-match-chronicle-auth';
const NEW_STORAGE_KEY = 'sports-journal-auth';

// Check for old auth data and migrate it
if (localStorage.getItem(OLD_STORAGE_KEY) && !localStorage.getItem(NEW_STORAGE_KEY)) {
  const oldAuthData = localStorage.getItem(OLD_STORAGE_KEY);
  if (oldAuthData) {
    localStorage.setItem(NEW_STORAGE_KEY, oldAuthData);
  }
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: NEW_STORAGE_KEY
    },
    global: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
);

// Initialize auth state
supabase.auth.getSession().then(({ data: { session }}) => {
  if (session) {
    supabase.realtime.setAuth(session.access_token);
  }
});

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    supabase.realtime.setAuth(session.access_token);
  }
});
