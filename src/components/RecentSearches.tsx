import { Clock, X } from "lucide-react";

interface Props {
  recent: string[];
  onSelect: (q: string) => void;
  onClear: () => void;
}

export default function RecentSearches({ recent, onSelect, onClear }: Props) {
  if (!recent.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
        </div>
        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recent.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground hover:bg-secondary transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
