
import { useState, useRef } from "react";
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
import { Users, User, GraduationCap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountType = "player" | "coach";

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
  const [sportTouched, setSportTouched] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    sport?: string;
  }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSportTouched(true);

    const finalEmail = emailRef.current?.value || email;
    const finalPassword = passwordRef.current?.value || password;
    const finalConfirmPassword = confirmPasswordRef.current?.value || confirmPassword;
    const finalFirstName = firstNameRef.current?.value || firstName;
    const finalLastName = lastNameRef.current?.value || lastName;

    setErrors({});

    const newErrors: typeof errors = {};
    let hasErrors = false;

    if (!finalFirstName?.trim()) {
      newErrors.firstName = "First name is required";
      hasErrors = true;
    }

    if (!finalLastName?.trim()) {
      newErrors.lastName = "Last name is required";
      hasErrors = true;
    }

    if (!finalEmail?.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail.trim())) {
        newErrors.email = "Please enter a valid email address";
        hasErrors = true;
      }
    }

    if (!finalPassword?.trim()) {
      newErrors.password = "Password is required";
      hasErrors = true;
    } else if (finalPassword.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      hasErrors = true;
    }

    if (!finalConfirmPassword?.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      hasErrors = true;
    } else if (finalPassword.trim() !== finalConfirmPassword.trim()) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    if (!sportId) {
      newErrors.sport = "Please select a sport";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      const missingFields: string[] = [];
      if (newErrors.email) missingFields.push("email");
      if (newErrors.password) missingFields.push("password");
      if (newErrors.confirmPassword) missingFields.push("confirm password");
      if (newErrors.firstName) missingFields.push("first name");
      if (newErrors.lastName) missingFields.push("last name");
      if (newErrors.sport) missingFields.push("sport selection");

      if (missingFields.length > 0) {
        toast({
          title: "Please fix the following",
          description: `Please check: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: finalEmail.trim(),
        password: finalPassword.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: finalFirstName.trim(),
            last_name: finalLastName.trim(),
            primary_sport_id: sportId,
            performance_goal: goalId,
            account_type: accountType,
          },
        },
      });

      if (error) throw error;

      // If signup succeeded and we have a user, assign the coach role if selected
      if (data.user && accountType === "coach") {
        // The default 'player' role is auto-assigned by the trigger.
        // Add 'coach' role via direct insert (RLS allows no client insert,
        // so we use a service-level approach via edge function or rely on
        // the metadata being read later). For now, store in user metadata.
        // The admin will assign via manage-roles edge function.
        // We store account_type in user_metadata so it can be read server-side.
      }

      const selection: PendingOnboardingSelection = {
        sportId: sportId!,
        goalId,
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(selection));

      toast({
        title: "Account created! 🎉",
        description: accountType === "coach" 
          ? "Welcome, Coach! Check your email for confirmation. Your coach role will be activated shortly."
          : "Please check your email for the confirmation link.",
      });

      navigate("/login");
    } catch (error: unknown) {
      console.error('Signup error:', error);
      let message = error instanceof Error ? error.message : "An unknown error occurred";
      if (message.includes('already registered')) {
        message = "This email is already registered. Please sign in instead.";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm border-2 border-white/20 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create an Account
            </h1>
            <p className="text-muted-foreground text-sm">Join the community of athletes & coaches</p>
          </div>

          {/* Account Type Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              I am a... <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("player")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 touch-manipulation",
                  accountType === "player"
                    ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  accountType === "player" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  <User className="h-6 w-6" />
                </div>
                <span className={cn(
                  "font-semibold text-sm",
                  accountType === "player" ? "text-blue-700" : "text-gray-600"
                )}>
                  Player
                </span>
                <span className="text-xs text-muted-foreground text-center leading-tight">
                  Track matches & improve
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("coach")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 touch-manipulation",
                  accountType === "coach"
                    ? "border-purple-500 bg-purple-50 shadow-md scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  accountType === "coach" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className={cn(
                  "font-semibold text-sm",
                  accountType === "coach" ? "text-purple-700" : "text-gray-600"
                )}>
                  Coach
                </span>
                <span className="text-xs text-muted-foreground text-center leading-tight">
                  Manage players & teams
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  ref={firstNameRef}
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
                  }}
                  className={cn("h-12 rounded-xl", errors.firstName && "border-destructive")}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  ref={lastNameRef}
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
                  }}
                  className={cn("h-12 rounded-xl", errors.lastName && "border-destructive")}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={cn("h-12 rounded-xl", errors.email && "border-destructive")}
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
                <span className="text-xs text-muted-foreground font-normal ml-2">(min. 6 characters)</span>
              </Label>
              <Input
                ref={passwordRef}
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (errors.confirmPassword && e.target.value === confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                className={cn("h-12 rounded-xl", errors.password && "border-destructive")}
                placeholder="Enter your password"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <Input
                ref={confirmPasswordRef}
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className={cn("h-12 rounded-xl", errors.confirmPassword && "border-destructive")}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className={errors.sport ? "rounded-lg border-2 border-destructive p-3 bg-destructive/5" : ""}>
              <SportGoalSelector
                sportId={sportId}
                onSportChange={(id) => {
                  setSportId(id);
                  setSportTouched(true);
                  if (errors.sport) setErrors((prev) => ({ ...prev, sport: undefined }));
                }}
                goalId={goalId}
                onGoalChange={setGoalId}
              />
              {errors.sport && (
                <p className="text-sm text-destructive mt-2 font-medium">{errors.sport}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Creating Account..." : `Create ${accountType === "coach" ? "Coach" : "Player"} Account`}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
