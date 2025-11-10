
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

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sportId, setSportId] = useState<SupportedSportId | null>(null);
  const [goalId, setGoalId] = useState<string>("performance");
  const [loading, setLoading] = useState(false);
  const [sportTouched, setSportTouched] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    sport?: string;
  }>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Refs to access DOM values as fallback (useful for automated testing)
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSportTouched(true);

    // Get values from DOM refs first (source of truth), fallback to state
    // This ensures we capture values even if React state hasn't updated (e.g., in automated testing)
    const emailFromDOM = emailRef.current?.value || '';
    const passwordFromDOM = passwordRef.current?.value || '';
    const confirmPasswordFromDOM = confirmPasswordRef.current?.value || '';
    
    const finalEmail = emailFromDOM || email;
    const finalPassword = passwordFromDOM || password;
    const finalConfirmPassword = confirmPasswordFromDOM || confirmPassword;

    // Log detailed information for debugging
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Email - State:', email, '| DOM:', emailFromDOM, '| Final:', finalEmail);
    console.log('Password - State length:', password.length, '| DOM length:', passwordFromDOM.length, '| Final length:', finalPassword.length);
    console.log('ConfirmPassword - State length:', confirmPassword.length, '| DOM length:', confirmPasswordFromDOM.length, '| Final length:', finalConfirmPassword.length);
    console.log('SportId:', sportId, '| GoalId:', goalId);
    console.log('EmailRef exists:', !!emailRef.current, '| PasswordRef exists:', !!passwordRef.current, '| ConfirmPasswordRef exists:', !!confirmPasswordRef.current);
    
    if (emailRef.current) {
      console.log('Email input type:', emailRef.current.type, '| value length:', emailRef.current.value.length);
    }
    if (passwordRef.current) {
      console.log('Password input type:', passwordRef.current.type, '| value length:', passwordRef.current.value.length);
    }
    if (confirmPasswordRef.current) {
      console.log('ConfirmPassword input type:', confirmPasswordRef.current.type, '| value length:', confirmPasswordRef.current.value.length);
    }
    console.log('============================');

    // Sync DOM values to state if they differ (for consistency)
    if (emailRef.current?.value !== email) {
      setEmail(emailRef.current?.value || "");
    }
    if (passwordRef.current?.value !== password) {
      setPassword(passwordRef.current?.value || "");
    }
    if (confirmPasswordRef.current?.value !== confirmPassword) {
      setConfirmPassword(confirmPasswordRef.current?.value || "");
    }

    // Clear previous errors
    setErrors({});

    // Validate all required fields with specific error messages
    const newErrors: typeof errors = {};
    let hasErrors = false;

    // Validate email
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

    // Validate password
    if (!finalPassword?.trim()) {
      newErrors.password = "Password is required";
      hasErrors = true;
    } else if (finalPassword.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      hasErrors = true;
    }

    // Validate confirm password
    if (!finalConfirmPassword?.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      hasErrors = true;
    } else if (finalPassword.trim() !== finalConfirmPassword.trim()) {
      newErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    // Validate sport selection
    if (!sportId) {
      newErrors.sport = "Please select a sport";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      // Also show toast with summary
      const missingFields: string[] = [];
      if (newErrors.email) missingFields.push("email");
      if (newErrors.password) missingFields.push("password");
      if (newErrors.confirmPassword) missingFields.push("confirm password");
      if (newErrors.sport) missingFields.push("sport selection");

      if (missingFields.length > 0) {
        const fieldList = missingFields.length === 1 
          ? missingFields[0] 
          : missingFields.length === 2
          ? `${missingFields[0]} and ${missingFields[1]}`
          : `${missingFields.slice(0, -1).join(", ")}, and ${missingFields[missingFields.length - 1]}`;
        
        toast({
          title: "Please fix the following",
          description: `Please check: ${fieldList}`,
          variant: "destructive",
        });
      }
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting signup with email:', finalEmail);
      const { data, error } = await supabase.auth.signUp({
        email: finalEmail.trim(),
        password: finalPassword.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            primary_sport_id: sportId,
            performance_goal: goalId,
          },
        },
      });

      if (error) throw error;

      const selection: PendingOnboardingSelection = {
        sportId,
        goalId,
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(selection));

      toast({
        title: "Success",
        description: "Please check your email for the confirmation link. Your sport and goal have been saved.",
      });
      
      // Redirect to login after successful registration
      navigate("/login");
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-6 space-y-6 bg-background shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Signup to start recording your performances</p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-6" noValidate>
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
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={errors.email ? "border-destructive" : ""}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
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
                const value = e.target.value;
                setPassword(value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
                // Clear confirm password error if passwords now match
                if (errors.confirmPassword && value === confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              className={errors.password ? "border-destructive" : ""}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
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
                const value = e.target.value;
                setConfirmPassword(value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              className={errors.confirmPassword ? "border-destructive" : ""}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
          <div className={errors.sport ? "rounded-lg border-2 border-destructive p-3 bg-destructive/5" : ""}>
            <SportGoalSelector
              sportId={sportId}
              onSportChange={(id) => {
                console.log('Sport selected:', id);
                setSportId(id);
                setSportTouched(true);
                if (errors.sport) {
                  setErrors((prev) => ({ ...prev, sport: undefined }));
                }
              }}
              goalId={goalId}
              onGoalChange={(id) => {
                console.log('Goal selected:', id);
                setGoalId(id);
              }}
            />
            {errors.sport && (
              <p className="text-sm text-destructive mt-2 font-medium">
                {errors.sport}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default Register;
