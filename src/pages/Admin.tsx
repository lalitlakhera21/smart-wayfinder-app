import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminRooms from "@/components/admin/AdminRooms";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSubmissions from "@/components/admin/AdminSubmissions";
import AdminReports from "@/components/admin/AdminReports";
import ThemeToggle from "@/components/ThemeToggle";
import { Loader2, MapPin } from "lucide-react";

interface AdminLayoutProps {
  section?: string;
}

export default function AdminLayout({ section = "dashboard" }: AdminLayoutProps) {
  const { user, isAdmin, loading } = useAuth();
  const { dark, toggle } = useTheme();

  // Auth check removed — open access for now

  const renderSection = () => {
    switch (section) {
      case "rooms": return <AdminRooms />;
      case "users": return <AdminUsers />;
      case "announcements": return <AdminAnnouncements />;
      case "analytics": return <AdminAnalytics />;
      case "submissions": return <AdminSubmissions />;
      case "reports": return <AdminReports />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link to="/" className="flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground hidden sm:inline">CampusNav</span>
              </Link>
            </div>
            <ThemeToggle dark={dark} toggle={toggle} />
          </header>
          <main className="flex-1 p-4 sm:p-6 max-w-6xl">
            {renderSection()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
