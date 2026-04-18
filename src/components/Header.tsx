import { MapPin, Shield, FolderTree } from "lucide-react";
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
    <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
          <MapPin className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">CampusNav</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Smart Navigation</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Link to="/departments">
          <Button variant="ghost" size="sm" className="rounded-xl gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Departments</span>
          </Button>
        </Link>
        <ThemeToggle dark={dark} toggle={toggleTheme} />
        <Link to={isAdmin ? "/admin" : "/login"}>
          <Button variant="outline" size="sm" className="rounded-xl gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{isAdmin ? "Admin Panel" : "Admin"}</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
