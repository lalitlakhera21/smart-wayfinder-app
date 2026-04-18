import { Building2, DoorOpen, FlaskConical, Briefcase, BookOpen, Coffee, Mic2, GraduationCap, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Room } from "@/hooks/useRooms";
import NavigationSteps from "./NavigationSteps";
import { formatDistanceToNow } from "date-fns";

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

function StatusBadge({ status }: { status: string }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <ShieldCheck className="h-3 w-3" /> Verified
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive">
        <AlertCircle className="h-3 w-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

export default function RoomCard({ room, onClick }: { room: Room; onClick?: () => void }) {
  const Icon = typeIcons[room.type] || DoorOpen;
  const colorClass = typeColors[room.type] || "bg-primary/10 text-primary";
  const status = room.status ?? "pending";
  const updatedRaw = room.verified_at ?? room.updated_at;
  const updatedLabel = updatedRaw ? formatDistanceToNow(new Date(updatedRaw), { addSuffix: true }) : null;

  return (
    <Card
      className="glass-card rounded-2xl cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 group"
      onClick={onClick}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${colorClass} transition-transform group-hover:scale-110 shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-foreground leading-tight">{room.room}</h3>
                <StatusBadge status={status} />
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {room.building}
                {room.block ? ` • ${room.block}` : ""}
                {" • "}{room.floor}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass} whitespace-nowrap shrink-0`}>
            {room.type}
          </span>
        </div>

        {updatedLabel && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
            <Clock className="h-3 w-3" />
            <span>
              {status === "verified" ? "Verified" : "Updated"} {updatedLabel}
            </span>
          </div>
        )}

        <NavigationSteps room={room} />
      </CardContent>
    </Card>
  );
}
