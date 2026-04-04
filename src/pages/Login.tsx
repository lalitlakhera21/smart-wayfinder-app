import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { signIn, signUp, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  useTheme();

  if (user && isAdmin) {
    navigate("/admin");
    return null;
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess("Password reset link tumhare email pe bhej diya gaya hai! Inbox check karo.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isSignUp) {
      const { error: err } = await signUp(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        setSuccess("Account created! You can now sign in.");
        setIsSignUp(false);
      }
    } else {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        setTimeout(() => navigate("/admin"), 300);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md glass-card rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-2">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {forgotMode ? "Reset Password" : isSignUp ? "Create Account" : "Admin Login"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {forgotMode ? "Enter your email to receive a reset link" : isSignUp ? "Sign up to get started" : "Sign in to manage campus rooms"}
          </p>
        </CardHeader>
        <CardContent>
          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
              {success && <div className="p-3 rounded-xl bg-accent/10 text-accent text-sm">{success}</div>}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl py-5"
              />
              <Button type="submit" className="w-full rounded-xl py-5" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => { setForgotMode(false); setError(""); setSuccess(""); }} className="text-sm text-primary hover:underline">
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>}
                {success && <div className="p-3 rounded-xl bg-accent/10 text-accent text-sm">{success}</div>}
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl py-5"
                />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="rounded-xl py-5"
                />
                <Button type="submit" className="w-full rounded-xl py-5" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </form>
              <div className="text-center mt-4 space-y-2">
                {!isSignUp && (
                  <button type="button" onClick={() => { setForgotMode(true); setError(""); setSuccess(""); }} className="text-sm text-muted-foreground hover:underline block w-full">
                    Forgot Password?
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
