import { Building2, DoorOpen, FlaskConical, Briefcase, BookOpen, Coffee, Mic2, GraduationCap, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Room } from "@/hooks/useRooms";
import NavigationSteps from "./NavigationSteps";

const typeIcons: Record<string, typeof Building2> = {
  Classroom: GraduationCap,
  Lab: FlaskConical,
  Office: Briefcase,
  Library: BookOpen,
  Canteen: Coffee,
  Auditorium: Mic2,
  "Seminar Hall": Mic2,
};

const typeColors: Record<string, string> = {
  Classroom: "bg-primary/10 text-primary",
  Lab: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Office: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Library: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Canteen: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Auditorium: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "Seminar Hall": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

export default function RoomCard({ room, onClick }: { room: Room; onClick?: () => void }) {
  const Icon = typeIcons[room.type] || DoorOpen;
  const colorClass = typeColors[room.type] || "bg-primary/10 text-primary";

  return (
    <Card
      className="glass-card rounded-2xl cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 group"
      onClick={onClick}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${colorClass} transition-transform group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground leading-tight">{room.room}</h3>
              <p className="text-xs text-muted-foreground">
                {room.building}
                {room.block ? ` • ${room.block}` : ""}
                {" • "}{room.floor}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass} whitespace-nowrap`}>
            {room.type}
          </span>
        </div>
        <NavigationSteps room={room} />
      </CardContent>
    </Card>
  );
}
