// Sign in with Apple that works in both the web app and the native iOS (Capacitor) build.
//
// On the web we use Supabase's browser-based OAuth redirect, which works in a real
// browser. Inside the iOS WKWebView that redirect flow cannot return to the app, so on
// native we use Apple's ASAuthorizationController (via @capacitor-community/apple-sign-in)
// to obtain an identity token and complete the session with signInWithIdToken.

import { supabase } from "@/integrations/supabase/client";
import { isCapacitorNative } from "@/lib/hostMode";

// Must match the iOS App ID / bundle identifier and be listed under the Apple provider's
// "Client IDs" in the Supabase dashboard so signInWithIdToken accepts the token audience.
const APPLE_BUNDLE_ID = "com.sportsjournal.app";

function generateRawNonce(length = 32): string {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (value) => charset[value % charset.length]).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signInWithAppleNative(): Promise<void> {
  const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");

  // Apple embeds the SHA-256 hash of the nonce in the identity token; Supabase re-hashes
  // the raw nonce we pass to signInWithIdToken and compares. Send the hash to Apple and
  // the raw value to Supabase.
  const rawNonce = generateRawNonce();
  const hashedNonce = await sha256Hex(rawNonce);

  const result = await SignInWithApple.authorize({
    clientId: APPLE_BUNDLE_ID,
    redirectURI: `${window.location.origin}/login`,
    scopes: "email name",
    nonce: hashedNonce,
  });

  const { identityToken, givenName, familyName } = result.response;
  if (!identityToken) {
    throw new Error("Apple did not return an identity token.");
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;

  // Apple only sends the user's name on the very first authorization, so persist it now.
  const fullName = [givenName, familyName].filter(Boolean).join(" ").trim();
  if (fullName) {
    try {
      await supabase.auth.updateUser({
        data: {
          first_name: givenName ?? undefined,
          last_name: familyName ?? undefined,
          full_name: fullName,
        },
      });
    } catch {
      // Non-fatal: the session is already established even if name metadata fails to save.
    }
  }
}

async function signInWithAppleWeb(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) throw error;
  // On success the browser navigates to Apple, then back to redirectTo.
}

/**
 * Starts Sign in with Apple using the correct flow for the current platform.
 * Resolves once the session is established (native) or the OAuth redirect begins (web).
 */
export async function signInWithApple(): Promise<void> {
  if (isCapacitorNative()) {
    await signInWithAppleNative();
  } else {
    await signInWithAppleWeb();
  }
}
