import { useMemo } from "react";
import { Building2, Layers, Tag, X } from "lucide-react";
import type { Room } from "@/hooks/useRooms";

interface Props {
  rooms: Room[];
  building: string | null;
  floor: string | null;
  type: string | null;
  onChange: (k: "building" | "floor" | "type", v: string | null) => void;
  onClear: () => void;
}

export default function SmartFilters({ rooms, building, floor, type, onChange, onClear }: Props) {
  const buildings = useMemo(() => [...new Set(rooms.map((r) => r.building))].sort(), [rooms]);
  const floors = useMemo(() => [...new Set(rooms.map((r) => r.floor))].sort(), [rooms]);
  const types = useMemo(() => [...new Set(rooms.map((r) => r.type))].sort(), [rooms]);

  const active = !!(building || floor || type);

  const Section = ({
    icon: Icon,
    label,
    options,
    value,
    onSelect,
  }: {
    icon: typeof Building2;
    label: string;
    options: string[];
    value: string | null;
    onSelect: (v: string | null) => void;
  }) => (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onSelect(o === value ? null : o)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              value === o
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-primary/10"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Smart Filters</span>
        {active && (
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
      <Section icon={Building2} label="Building" options={buildings} value={building} onSelect={(v) => onChange("building", v)} />
      <Section icon={Layers} label="Floor" options={floors} value={floor} onSelect={(v) => onChange("floor", v)} />
      <Section icon={Tag} label="Type" options={types} value={type} onSelect={(v) => onChange("type", v)} />
    </div>
  );
}
