import { useRooms } from "@/hooks/useRooms";
import { Sparkles } from "lucide-react";

export default function QuickSuggestions({ onSelect }: { onSelect: (q: string) => void }) {
  const { data: rooms } = useRooms();
  const popular = (rooms ?? []).slice(0, 6);

  if (!popular.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Quick Suggestions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {popular.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r.room)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            {r.room}
          </button>
        ))}
      </div>
    </div>
  );
}
