
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pnlocibettgyqyttegcu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubG9jaWJldHRneXF5dHRlZ2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyOTMyNTAsImV4cCI6MjA1Mjg2OTI1MH0.eA90Z5FYhTwVD37Lh7WX6ctYHSI4_Z_-q7oOL_4FkFg";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: 'tennis-match-chronicle-auth'
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
