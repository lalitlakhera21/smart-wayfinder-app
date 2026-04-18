import { Building2, DoorOpen, FlaskConical, Briefcase, BookOpen, Coffee, Mic2, GraduationCap, ShieldCheck, Clock, AlertCircle, ImageIcon, MapPin, Route } from "lucide-react";
import { Card } from "@/components/ui/card";
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <ShieldCheck className="h-3 w-3" /> Verified
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
        <AlertCircle className="h-3 w-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
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

  // Build a compact route summary chips: Start → Building → Block? → Floor → Room
  const routeChips = [
    { label: "Main Gate", tone: "start" as const },
    { label: room.building, tone: "building" as const },
    ...(room.block ? [{ label: room.block, tone: "block" as const }] : []),
    { label: room.floor, tone: "floor" as const },
    { label: room.room, tone: "room" as const },
  ];

  const toneClass: Record<string, string> = {
    start: "nav-step-start",
    building: "nav-step-building",
    block: "nav-step-block",
    floor: "nav-step-floor",
    room: "nav-step-room",
  };

  return (
    <Card
      className="glass-card rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 group p-0"
      onClick={onClick}
    >
      {/* ===== TOP: Route Card Header ===== */}
      <div className="relative">
        {/* Hero photo or gradient fallback */}
        {showPhoto ? (
          <div className="relative h-44 sm:h-52 w-full bg-muted overflow-hidden">
            <img
              src={room.photo_url!}
              alt={`${room.room} entrance`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          </div>
        ) : (
          <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: "radial-gradient(circle at 20% 30%, hsl(var(--primary)/0.4), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--accent)/0.3), transparent 40%)"
            }} />
          </div>
        )}

        {/* Floating top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-background/85 backdrop-blur text-foreground border border-border/50">
            <Route className="h-3 w-3 text-primary" /> Route Card
          </span>
          <div className="flex items-center gap-1.5">
            {showPhoto && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-background/85 backdrop-blur text-foreground border border-border/50">
                <ImageIcon className="h-3 w-3" /> Photo
              </span>
            )}
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Title block — overlaps photo */}
        <div className="px-5 sm:px-6 -mt-10 relative">
          <div className="flex items-end gap-3">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colorClass} border-2 border-card shadow-lg shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 pb-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight tracking-tight truncate">
                {room.room}
              </h3>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                {room.building}{room.block ? ` • ${room.block}` : ""} • {room.floor}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Route summary strip ===== */}
      <div className="px-5 sm:px-6 mt-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {routeChips.map((chip, i) => (
            <div key={i} className="flex items-center gap-1.5 shrink-0">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${toneClass[chip.tone]} whitespace-nowrap`}>
                {chip.label}
              </span>
              {i < routeChips.length - 1 && (
                <span className="text-muted-foreground/40 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Detailed turn-by-turn ===== */}
      <div className="px-5 sm:px-6 mt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
            Turn-by-turn
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colorClass}`}>
            {room.type}
          </span>
        </div>
        <NavigationSteps room={room} />
      </div>

      {/* ===== Footer ===== */}
      <div className="px-5 sm:px-6 mt-4 pb-5 pt-3 border-t border-border/50 flex items-center justify-between gap-3">
        {updatedLabel ? (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {status === "verified" ? "Verified" : "Updated"} {updatedLabel}
            </span>
          </div>
        ) : <span />}
        <ReportIssueDialog roomId={room.id} roomName={room.room} />
      </div>
    </Card>
  );
}
