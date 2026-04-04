import { useRooms } from "@/hooks/useRooms";
import { Sparkles } from "lucide-react";

export default function QuickSuggestions({ onSelect }: { onSelect: (q: string) => void }) {
  const { data: rooms } = useRooms();
  // Show a diverse mix of room types
  const seen = new Set<string>();
  const popular = (rooms ?? []).filter((r) => {
    if (seen.has(r.type)) return false;
    seen.add(r.type);
    return true;
  }).slice(0, 8);

  if (!popular.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Popular Locations</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {popular.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r.room)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5"
          >
            {r.room}
          </button>
        ))}
      </div>
    </div>
  );
}
