import { Building2, DoorOpen, FlaskConical, Briefcase, BookOpen, Coffee, Mic2, GraduationCap, ShieldCheck, Clock, AlertCircle, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Room } from "@/hooks/useRooms";
import NavigationSteps from "./NavigationSteps";
import ReportIssueDialog from "./ReportIssueDialog";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

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
  const [imgError, setImgError] = useState(false);
  const showPhoto = room.photo_url && !imgError;

  return (
    <Card
      className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 group"
      onClick={onClick}
    >
      {/* Hero photo (route card style) */}
      {showPhoto && (
        <div className="relative h-40 sm:h-48 w-full bg-muted overflow-hidden">
          <img
            src={room.photo_url!}
            alt={`${room.room} entrance`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-background/80 backdrop-blur text-foreground">
              <ImageIcon className="h-3 w-3" /> Photo confirmed
            </span>
            <StatusBadge status={status} />
          </div>
        </div>
      )}

      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${colorClass} transition-transform group-hover:scale-110 shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-foreground leading-tight">{room.room}</h3>
                {!showPhoto && <StatusBadge status={status} />}
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

        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-end">
          <ReportIssueDialog roomId={room.id} roomName={room.room} />
        </div>
      </CardContent>
    </Card>
  );
}
