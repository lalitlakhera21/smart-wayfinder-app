import { Building2, DoorOpen, FlaskConical, Briefcase } from "lucide-react";
import type { Room } from "@/hooks/useRooms";

export default function CampusStats({ rooms }: { rooms: Room[] }) {
  if (!rooms.length) return null;

  const buildings = new Set(rooms.map((r) => r.building)).size;
  const classrooms = rooms.filter((r) => r.type === "Classroom").length;
  const labs = rooms.filter((r) => r.type === "Lab").length;
  const offices = rooms.filter((r) => r.type === "Office").length;

  const stats = [
    { label: "Buildings", value: buildings, icon: Building2, color: "text-primary" },
    { label: "Classrooms", value: classrooms, icon: DoorOpen, color: "text-emerald-500" },
    { label: "Labs", value: labs, icon: FlaskConical, color: "text-violet-500" },
    { label: "Offices", value: offices, icon: Briefcase, color: "text-amber-500" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-200">
            <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
