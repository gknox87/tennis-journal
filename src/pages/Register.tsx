import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { SportGoalSelector } from "@/components/onboarding/SportGoalSelector";
import { type SupportedSportId } from "@/constants/sports";
import { ONBOARDING_STORAGE_KEY, type PendingOnboardingSelection } from "@/constants/onboarding";
import { User, GraduationCap, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

type AccountType = "player" | "coach";

const STRENGTH_COLORS = {
  weak: "bg-red-400",
  fair: "bg-yellow-400",
  good: "bg-blue-400",
  strong: "bg-green-400",
};
type Strength = keyof typeof STRENGTH_COLORS;

function getPasswordStrength(pw: string): Strength {
  if (pw.length < 6) return "weak";
  if (pw.length < 10) return "fair";
  if (/[^a-zA-Z0-9]/.test(pw) && pw.length >= 12) return "strong";
  if (/[^a-zA-Z0-9]/.test(pw) || /[A-Z]/.test(pw)) return "good";
  return "fair";
}

const STRENGTH_LABELS: Record<Strength, string> = {
  weak: "Too short",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sportId, setSportId] = useState<SupportedSportId | null>(null);
  const [goalId, setGoalId] = useState<string>("performance");
  const [accountType, setAccountType] = useState<AccountType>("player");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [sportTouched, setSportTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    sport?: string;
  }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength: Strength | null = password.length > 0 ? getPasswordStrength(password) : null;
  const passwordsMatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          data: {
            account_type: accountType,
          },
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `${provider} sign in failed. Please try again.`;
      toast({ title: "Sign up failed", description: message, variant: "destructive" });
      setSocialLoading(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSportTouched(true);

    const errors: typeof fieldErrors = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!sportId) {
      errors.sport = "Select a sport to continue";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            primary_sport_id: sportId,
            performance_goal: goalId,
            account_type: accountType,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        analytics.signedUp("email");
        analytics.sportSelected(sportId ?? "unknown");
        localStorage.setItem(
          ONBOARDING_STORAGE_KEY,
          JSON.stringify({ sportId: sportId!, goalId } satisfies PendingOnboardingSelection)
        );
        toast({
          title: "Check your email",
          description: `We've sent a confirmation link to ${email}. Click it to activate your account.`,
        });
        navigate("/login");
      }
    } catch (error: unknown) {
      let message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      if (message.toLowerCase().includes("already registered")) {
        message = "This email is already in use. Try signing in instead.";
      }
      toast({ title: "Sign up failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join athletes and coaches tracking their progress</p>
        </div>

        <Card className="p-6 bg-white border border-gray-100 shadow-xl space-y-5">
          {/* Account type selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-gray-400" />
              I am a...
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("player")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all duration-200 touch-manipulation",
                  accountType === "player"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                  accountType === "player" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <User className="h-4.5 w-4.5" />
                </div>
                <span className={cn("text-sm font-semibold", accountType === "player" ? "text-blue-700" : "text-gray-600")}>
                  Player
                </span>
                <span className="text-xs text-gray-400 text-center leading-tight">
                  Track matches & improve
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("coach")}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all duration-200 touch-manipulation",
                  accountType === "coach"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                  accountType === "coach" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <span className={cn("text-sm font-semibold", accountType === "coach" ? "text-purple-700" : "text-gray-600")}>
                  Coach
                </span>
                <span className="text-xs text-gray-400 text-center leading-tight">
                  Manage players & teams
                </span>
              </button>
            </div>
          </div>

          {/* Social sign-in */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400">or sign up with email</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 flex items-center justify-center gap-2.5 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
              onClick={() => handleSocialLogin("google")}
              disabled={!!socialLoading}
            >
              {socialLoading === "google" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Sign up with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 flex items-center justify-center gap-2.5 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
              onClick={() => handleSocialLogin("apple")}
              disabled={!!socialLoading}
            >
              {socialLoading === "apple" ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              Sign up with Apple
            </Button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: undefined })); }}
                  className={cn("h-10 rounded-xl", fieldErrors.firstName ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300")}
                  placeholder="First"
                  autoComplete="given-name"
                />
                {fieldErrors.firstName && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.firstName}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: undefined })); }}
                  className={cn("h-10 rounded-xl", fieldErrors.lastName ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300")}
                  placeholder="Last"
                  autoComplete="family-name"
                />
                {fieldErrors.lastName && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                className={cn("h-10 rounded-xl", fieldErrors.email ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300")}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {fieldErrors.email && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  className={cn("h-10 rounded-xl pr-10", fieldErrors.password ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300")}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordStrength && (
                <div className="mt-1.5">
                  <div className="flex gap-1">
                    {(["weak", "fair", "good", "strong"] as Strength[]).map((level, i) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          password.length === 0 ? "bg-gray-200" : STRENGTH_COLORS[level],
                          password.length > 0 && (["weak", "fair", "good", "strong"].indexOf(passwordStrength) < i ? "bg-gray-200" : "")
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn("text-xs mt-1", `text-${passwordStrength === "weak" ? "red" : passwordStrength === "fair" ? "yellow" : passwordStrength === "good" ? "blue" : "green"}-500`)}>
                    {STRENGTH_LABELS[passwordStrength]}
                  </p>
                </div>
              )}
              {fieldErrors.password && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.password}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                  className={cn("h-10 rounded-xl pr-10", passwordsMatch || fieldErrors.confirmPassword ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300")}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordsMatch && <p className="text-xs text-red-500 mt-0.5">Passwords don't match</p>}
              {fieldErrors.confirmPassword && !passwordsMatch && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Sport selector */}
            <div className={cn("rounded-xl border p-3 transition-colors", fieldErrors.sport ? "border-red-400 bg-red-50/30" : "border-gray-100 bg-gray-50/50")}>
              <SportGoalSelector
                sportId={sportId}
                onSportChange={(id) => { setSportId(id); setSportTouched(true); setFieldErrors((p) => ({ ...p, sport: undefined })); }}
                goalId={goalId}
                onGoalChange={setGoalId}
              />
            </div>
            {fieldErrors.sport && <p className="text-xs text-red-500 -mt-2">{fieldErrors.sport}</p>}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create {accountType === "coach" ? "Coach" : "Player"} Account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-4">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-gray-600">Terms</Link>
          {" "}and{" "}
          <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;