import { GraduationCap, FlaskConical, Briefcase, DoorClosed, Car, MapPin, Coffee, BookOpen } from "lucide-react";

interface Props {
  onAction: (query: string) => void;
}

const actions = [
  { label: "Find My Class", query: "Classroom", icon: GraduationCap, color: "bg-primary/10 text-primary" },
  { label: "Find Lab", query: "Lab", icon: FlaskConical, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { label: "Find HOD", query: "HOD", icon: Briefcase, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { label: "Library", query: "Library", icon: BookOpen, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { label: "Canteen", query: "Canteen", icon: Coffee, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { label: "Washroom", query: "Washroom", icon: DoorClosed, color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
  { label: "Parking", query: "Parking", icon: Car, color: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  { label: "Gate", query: "Gate", icon: MapPin, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
];

export default function QuickActions({ onAction }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">Quick Actions</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => onAction(a.query)}
            className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform`}>
              <a.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-foreground text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
