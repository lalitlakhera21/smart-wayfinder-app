import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";
import { useState } from "react";

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: announcements } = useQuery({
    queryKey: ["active-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const visible = (announcements ?? []).filter((a) => !dismissed.includes(a.id));

  if (!visible.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      {visible.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-2"
        >
          <Megaphone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{a.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.message}</p>
          </div>
          <button
            onClick={() => setDismissed((d) => [...d, a.id])}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
