import posthog from 'posthog-js';

// PostHog project 173738 — sportsjournal.app (EU cluster)
const POSTHOG_KEY = 'phc_ZSfxfq2WvivHp3p2b5TK5XTkLEk7YqmHC9prERitvsmoVMqj';

let analyticsReady = false;

export function isAnalyticsReady(): boolean {
  return analyticsReady;
}

export function initAnalytics() {
  if (typeof window === 'undefined') return;

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: 'https://eu.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      session_recording: {
        blockClass: 'no-capture',
        maskTextClass: 'no-capture',
      },
      autocapture: true,
      bootstrap: {},
    });
    analyticsReady = true;
  } catch (error) {
    console.warn('Analytics init failed — app will continue without PostHog:', error);
  }
}

export const analytics = {
  // ── Core match events ──────────────────────────────
  matchLogged(sport: string, format: string, score: string, won: boolean) {
    posthog.capture('match_logged', {
      sport,
      format,
      score,
      outcome: won ? 'win' : 'loss',
    });
  },

  matchEdited(matchId: string) {
    posthog.capture('match_edited', { match_id: matchId });
  },

  matchDeleted(matchId: string) {
    posthog.capture('match_deleted', { match_id: matchId });
  },

  // ── Reflection / journaling ─────────────────────────
  reflectionCompleted(sport: string, promptLevel: string) {
    posthog.capture('reflection_completed', {
      sport,
      prompt_level: promptLevel,
    });
  },

  // ── Navigation / pages ────────────────────────────
  pageView(path: string, properties?: Record<string, unknown>) {
    posthog.capture('$pageview', {
      path,
      ...properties,
    });
  },

  // ── Auth ──────────────────────────────────────────
  signedUp(method: 'email' | 'google' | 'apple') {
    posthog.capture('user_signed_up', { method });
  },

  loggedIn(method: 'email' | 'google' | 'apple') {
    posthog.capture('user_logged_in', { method });
  },

  // ── Coach mode ─────────────────────────────────────
  coachPlayerLinked(playerId: string) {
    posthog.capture('coach_player_linked', { player_id: playerId });
  },

  coachFeedbackGiven(sessionId: string) {
    posthog.capture('coach_feedback_given', { session_id: sessionId });
  },

  // ── Challenges / streaks ───────────────────────────
  challengeJoined(challengeId: string, type: string) {
    posthog.capture('challenge_joined', {
      challenge_id: challengeId,
      challenge_type: type,
    });
  },

  badgeEarned(badgeId: string, streak: number) {
    posthog.capture('badge_earned', {
      badge_id: badgeId,
      streak_days: streak,
    });
  },

  // ── Wellness ───────────────────────────────────────
  wellnessLogged(mood: string, energy: number) {
    posthog.capture('wellness_logged', {
      mood,
      energy,
    });
  },

  // ── Voice / AI ────────────────────────────────────
  voiceMatchSubmitted(duration_seconds: number) {
    posthog.capture('voice_match_submitted', {
      duration_seconds,
    });
  },

  aiInsightsViewed(patternKey: string) {
    posthog.capture("ai_insights_viewed", {
      pattern_key: patternKey,
    });
  },

  patternDismissed(patternKey: string) {
    posthog.capture("pattern_dismissed", {
      pattern_key: patternKey,
    });
  },

  patternRefreshRequested() {
    posthog.capture("pattern_refresh_requested");
  },

  // ── Sharing / social ───────────────────────────────
  sessionShared(recipient: 'coach' | 'opponent' | 'friend') {
    posthog.capture('session_shared', { recipient });
  },

  // ── Pro / upgrade ─────────────────────────────────
  proUpgradeAttempted() {
    posthog.capture('pro_upgrade_attempted');
  },

  proUpgradeCompleted() {
    posthog.capture('pro_upgrade_completed');
  },

  // ── Push notifications ─────────────────────────────
  pushNotificationEnabled() {
    posthog.capture('push_notification_enabled');
  },

  notificationTapped(template: string) {
    posthog.capture('notification_tapped', { template });
  },

  // ── Onboarding ────────────────────────────────────
  onboardingCompleted() {
    posthog.capture('onboarding_completed');
  },

  sportSelected(sport: string) {
    posthog.capture('sport_selected', { sport });
  },
};

export default posthog;
