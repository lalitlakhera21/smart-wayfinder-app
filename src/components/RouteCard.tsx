import { CheckCircle2, Clock, MapPin, Navigation2, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Route } from "@/lib/navigation";
import { formatDuration } from "@/lib/navigation";

export default function RouteCard({ route }: { route: Route }) {
  const destination = route.path[route.path.length - 1];
  const origin = route.path[0];

  return (
    <Card className="p-5 space-y-5 animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          Destination Found
        </div>
        <h2 className="text-xl font-semibold leading-tight">{destination.name}</h2>
        <p className="text-sm text-muted-foreground">
          {[destination.building, destination.floor].filter(Boolean).join(" • ") || destination.type}
        </p>
        {destination.is_verified && (
          <Badge variant="secondary" className="gap-1 mt-1">
            <CheckCircle2 className="h-3 w-3" /> Verified Navigation
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-3">
          <Clock className="h-4 w-4 text-primary" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Time</div>
            <div className="font-semibold text-sm">{formatDuration(route.totalSeconds)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-3">
          <Ruler className="h-4 w-4 text-primary" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Distance</div>
            <div className="font-semibold text-sm">{route.totalDistance}m</div>
          </div>
        </div>
      </div>

      {/* Route timeline */}
      <div className="relative pl-5">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
        <div className="space-y-3">
          <RouteNode label="Start" name={origin.name} accent />
          {route.steps.map((s, i) => (
            <RouteNode
              key={i}
              label={s.edge.direction}
              name={s.to.name}
              detail={s.edge.instruction ?? undefined}
              meta={`${s.edge.distance_m}m • ${formatDuration(s.edge.estimated_seconds)}`}
              final={i === route.steps.length - 1}
            />
          ))}
        </div>
      </div>

      {destination.photo_url && (
        <Button asChild variant="outline" className="w-full">
          <a href={destination.photo_url} target="_blank" rel="noreferrer">
            View Location Photo
          </a>
        </Button>
      )}
    </Card>
  );
}

function RouteNode({
  label,
  name,
  detail,
  meta,
  accent,
  final,
}: {
  label: string;
  name: string;
  detail?: string;
  meta?: string;
  accent?: boolean;
  final?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-[18px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
          accent || final ? "bg-primary border-primary" : "bg-background border-border"
        }`}
      />
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          {label}
        </span>
        <span className="font-semibold text-sm">{name}</span>
      </div>
      {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
      {meta && (
        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
          <Navigation2 className="h-3 w-3" />
          {meta}
        </p>
      )}
    </div>
  );
}
