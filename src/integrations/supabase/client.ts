import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pnlocibettgyqyttegcu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubG9jaWJldHRneXF5dHRlZ2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0MDY4NTAsImV4cCI6MjAyMjk4Mjg1MH0.qDlZhwqEXBj8SeYV-GyQ5vKXMAZhseCLtQH_R3TRwLw";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Info': 'supabase-js-web'
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // Update the realtime subscription auth when we have a session
    supabase.realtime.setAuth(session.access_token);
  }
});