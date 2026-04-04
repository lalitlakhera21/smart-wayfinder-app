import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  useTheme();

  if (user && isAdmin) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      // Wait a tick for auth state to update
      setTimeout(() => navigate("/admin"), 300);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md glass-card rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-2">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to manage campus rooms</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl py-5"
            />
            <Button type="submit" className="w-full rounded-xl py-5" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
