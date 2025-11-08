
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pnlocibettgyqyttegcu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubG9jaWJldHRneXF5dHRlZ2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyOTMyNTAsImV4cCI6MjA1Mjg2OTI1MH0.eA90Z5FYhTwVD37Lh7WX6ctYHSI4_Z_-q7oOL_4FkFg";

// Migrate old storage key to new one (one-time migration)
const OLD_STORAGE_KEY = 'tennis-match-chronicle-auth';
const NEW_STORAGE_KEY = 'sports-journal-auth';

// Check for old auth data and migrate it
if (localStorage.getItem(OLD_STORAGE_KEY) && !localStorage.getItem(NEW_STORAGE_KEY)) {
  const oldAuthData = localStorage.getItem(OLD_STORAGE_KEY);
  if (oldAuthData) {
    localStorage.setItem(NEW_STORAGE_KEY, oldAuthData);
    console.log('[Auth Migration] Migrated from tennis-match-chronicle-auth to sports-journal-auth');
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
