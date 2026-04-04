import { Layers } from "lucide-react";

interface Props {
  floors: string[];
  selected: string | null;
  onSelect: (f: string | null) => void;
}

export default function FloorFilter({ floors, selected, onSelect }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-4 flex items-center gap-2 flex-wrap">
      <Layers className="h-4 w-4 text-muted-foreground" />
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          !selected
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-secondary text-secondary-foreground hover:bg-primary/10"
        }`}
      >
        All Floors
      </button>
      {floors.map((f) => (
        <button
          key={f}
          onClick={() => onSelect(f === selected ? null : f)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            selected === f
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-primary/10"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
