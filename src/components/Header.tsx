import { MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  dark: boolean;
  toggleTheme: () => void;
}

export default function Header({ dark, toggleTheme }: Props) {
  const { user, isAdmin } = useAuth();

  return (
    <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <MapPin className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">CampusNav</h1>
          <p className="text-xs text-muted-foreground">Smart Navigation</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle dark={dark} toggle={toggleTheme} />
        <Link to={isAdmin ? "/admin" : "/login"}>
          <Button variant="outline" size="sm" className="rounded-xl gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{isAdmin ? "Admin Panel" : "Admin"}</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
