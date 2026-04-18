import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ["active-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
    retry: 1,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">Announcements load nahi ho payi.</p>
        </div>
      </div>
    );
  }

  const visible = (announcements ?? []).filter((a) => !dismissed.includes(a.id));
  if (!visible.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {visible.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/10 border-2 border-primary/30 shadow-sm animate-in fade-in slide-in-from-top-2"
        >
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Megaphone className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{a.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
          </div>
          <button
            onClick={() => setDismissed((d) => [...d, a.id])}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
