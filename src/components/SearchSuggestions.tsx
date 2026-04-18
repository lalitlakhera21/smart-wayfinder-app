import { useMemo } from "react";
import { Search, Building2 } from "lucide-react";
import type { Room } from "@/hooks/useRooms";

interface Props {
  query: string;
  rooms: Room[];
  onSelect: (q: string) => void;
}

export default function SearchSuggestions({ query, rooms, onSelect }: Props) {
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 1) return [];
    const q = query.toLowerCase();
    const matches = rooms
      .filter(
        (r) =>
          r.room.toLowerCase().includes(q) ||
          r.building.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
      )
      .slice(0, 6);
    return matches;
  }, [query, rooms]);

  if (!suggestions.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 glass-card rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="p-2">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">
          Suggestions
        </div>
        {suggestions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.room)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-colors text-left group"
          >
            <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{s.room}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3" />
                {s.building} • {s.floor} • {s.type}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
