
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

// Migrate auth data from old key to new key
// If both keys exist, prefer the new key (already migrated case)
// If only old key exists, migrate it
const oldAuthData = localStorage.getItem(OLD_STORAGE_KEY);
const newAuthData = localStorage.getItem(NEW_STORAGE_KEY);
if (oldAuthData && !newAuthData) {
  // Only old key present — migrate to new key
  localStorage.setItem(NEW_STORAGE_KEY, oldAuthData);
  localStorage.removeItem(OLD_STORAGE_KEY);
} else if (oldAuthData && newAuthData) {
  // Both keys present — old key is stale, remove it
  localStorage.removeItem(OLD_STORAGE_KEY);
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

// Initialize auth state with proper error handling
// Wrap in an immediately-invoked async function to handle rejection
(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      supabase.realtime.setAuth(session.access_token);
    }
  } catch (err) {
    console.error('Failed to initialize realtime auth:', err);
  }
})();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    supabase.realtime.setAuth(session.access_token);
  }
});
