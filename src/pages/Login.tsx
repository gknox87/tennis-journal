import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, Trophy, Eye, EyeOff } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { signInWithApple } from "@/lib/appleAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateFields = () => {
    const errors: typeof fieldErrors = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!email.includes("@") || !email.includes(".")) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setFieldErrors({ password: "Incorrect email or password" });
          return;
        }
        throw error;
      }

      if (data.user) {
        analytics.loggedIn("email");
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sign in failed. Please try again.";
      toast({ title: "Sign in failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
      // Native flow returns with an active session; web flow redirects to Apple.
      analytics.loggedIn("apple");
      navigate("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Apple sign in failed. Please try again.";
      toast({ title: "Sign in failed", description: message, variant: "destructive" });
      setAppleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-4 shadow-lg">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sports Journal</h1>
          <p className="text-gray-500 text-sm mt-1">Track your journey to greatness</p>
        </div>

        {/* Login card */}
        <Card className="p-6 bg-white border border-gray-100 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>

          {/* Sign in with Apple — native flow on iOS, OAuth redirect on web */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 flex items-center justify-center gap-2.5 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
            onClick={handleAppleLogin}
            disabled={loading || appleLoading}
          >
            {appleLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.05 12.536c-.028-2.85 2.33-4.216 2.436-4.283-1.327-1.94-3.392-2.206-4.126-2.235-1.758-.178-3.43 1.035-4.322 1.035-.888 0-2.263-1.01-3.72-.983-1.914.028-3.68 1.112-4.664 2.826-1.988 3.447-.508 8.552 1.426 11.35.945 1.37 2.07 2.91 3.544 2.855 1.423-.057 1.96-.92 3.68-.92 1.718 0 2.203.92 3.708.89 1.53-.026 2.5-1.397 3.436-2.775 1.083-1.59 1.53-3.13 1.556-3.21-.034-.015-2.985-1.146-3.014-4.545zM14.27 4.2c.785-.953 1.315-2.276 1.17-3.593-1.132.046-2.503.755-3.315 1.706-.728.842-1.366 2.19-1.195 3.481 1.264.098 2.554-.642 3.34-1.594z" />
              </svg>
            )}
            Sign in with Apple
          </Button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" style={{ top: fieldErrors.email ? "calc(50% - 10px)" : "50%" }} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined })); }}
                  className={`pl-9 h-11 border rounded-xl bg-white transition-colors focus:ring-2 focus:ring-blue-500/20 ${fieldErrors.email ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300"}`}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" style={{ top: fieldErrors.password ? "calc(50% - 10px)" : "50%" }} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  className={`pl-9 pr-10 h-11 border rounded-xl bg-white transition-colors focus:ring-2 focus:ring-blue-500/20 ${fieldErrors.password ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-gray-300"}`}
                  placeholder="Your password"
                  disabled={loading}
                  autoComplete="current-password"
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
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
              disabled={loading || appleLoading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-5">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-gray-600">Terms</Link>
          {" "}and{" "}
          <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;