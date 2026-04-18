import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Departments from "./pages/Departments";
import NotFound from "./pages/NotFound";
import InstallPrompt from "./components/InstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <InstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<Admin section="dashboard" />} />
            <Route path="/admin/rooms" element={<Admin section="rooms" />} />
            <Route path="/admin/submissions" element={<Admin section="submissions" />} />
            <Route path="/admin/reports" element={<Admin section="reports" />} />
            <Route path="/admin/users" element={<Admin section="users" />} />
            <Route path="/admin/announcements" element={<Admin section="announcements" />} />
            <Route path="/admin/analytics" element={<Admin section="analytics" />} />
            <Route path="/admin/departments" element={<Admin section="departments" />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
