
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
import { DEFAULT_SPORT_ID, type SupportedSportId } from "@/constants/sports";
import { ONBOARDING_STORAGE_KEY, type PendingOnboardingSelection } from "@/constants/onboarding";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sportId, setSportId] = useState<SupportedSportId>(DEFAULT_SPORT_ID);
  const [goalId, setGoalId] = useState<string>("performance");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting signup with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
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
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Confirm your password"
              minLength={6}
            />
          </div>
          <SportGoalSelector
            sportId={sportId}
            onSportChange={setSportId}
            goalId={goalId}
            onGoalChange={setGoalId}
          />
          <Button type="submit" className="w-full" disabled={loading}>
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
