import { ArrowDown, ArrowUp, ArrowRight, ArrowLeft, MoveRight, MapPin, Flag, Building2, Layers } from "lucide-react";
import type { Route } from "@/lib/navigation";
import { formatDuration } from "@/lib/navigation";

function DirIcon({ d }: { d: string }) {
  const cls = "h-3.5 w-3.5";
  if (d === "Up") return <ArrowUp className={cls} />;
  if (d === "Down") return <ArrowDown className={cls} />;
  if (d === "Left") return <ArrowLeft className={cls} />;
  if (d === "Right") return <ArrowRight className={cls} />;
  return <MoveRight className={cls} />;
}

export default function RouteMiniMap({ route }: { route: Route }) {
  // Group path nodes by floor for a floor-by-floor diagram
  const groups: { key: string; floor: string; building: string; nodes: typeof route.path }[] = [];
  route.path.forEach((n) => {
    const floor = n.floor ?? "—";
    const building = n.building ?? n.name;
    const key = `${building}::${floor}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.nodes.push(n);
    else groups.push({ key, floor, building, nodes: [n] });
  });

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-primary" /> Floor-by-floor map
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {groups.length} {groups.length === 1 ? "level" : "levels"}
        </span>
      </div>

      <div className="space-y-3">
        {groups.map((g, gi) => {
          const isFirst = gi === 0;
          const isLast = gi === groups.length - 1;
          return (
            <div key={gi} className="relative">
              {/* Floor card */}
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{g.building}</div>
                    <div className="text-[10px] text-muted-foreground">{g.floor}</div>
                  </div>
                </div>

                {/* Horizontal node strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                  {g.nodes.map((n, ni) => {
                    const isStart = isFirst && ni === 0;
                    const isEnd = isLast && ni === g.nodes.length - 1;
                    // Find the edge that led INTO this node (skip the very first)
                    const globalIdx = route.path.indexOf(n);
                    const edge = globalIdx > 0 ? route.steps[globalIdx - 1]?.edge : null;
                    return (
                      <div key={n.id + ni} className="flex items-center gap-1.5 shrink-0">
                        {edge && ni > 0 && (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <DirIcon d={edge.direction} />
                            <span className="text-[9px]">{edge.distance_m}m</span>
                          </div>
                        )}
                        <div
                          className={`flex flex-col items-center text-center px-2 py-1.5 rounded-lg border min-w-[72px] ${
                            isStart
                              ? "bg-primary text-primary-foreground border-primary"
                              : isEnd
                              ? "bg-accent text-accent-foreground border-accent"
                              : "bg-background"
                          }`}
                        >
                          <div className="h-5 w-5 flex items-center justify-center">
                            {isStart ? (
                              <MapPin className="h-3.5 w-3.5" />
                            ) : isEnd ? (
                              <Flag className="h-3.5 w-3.5" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                            )}
                          </div>
                          <div className="text-[10px] font-medium leading-tight mt-0.5 line-clamp-2">
                            {n.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inter-floor connector (stairs / lift) */}
              {!isLast && (() => {
                const lastNode = g.nodes[g.nodes.length - 1];
                const idx = route.path.indexOf(lastNode);
                const transitionEdge = route.steps[idx]?.edge;
                const dir = transitionEdge?.direction ?? "";
                const goingUp = dir === "Up";
                const goingDown = dir === "Down";
                return (
                  <div className="flex items-center gap-2 pl-4 py-1">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {goingUp ? <ArrowUp className="h-3.5 w-3.5" /> : goingDown ? <ArrowDown className="h-3.5 w-3.5" /> : <MoveRight className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {transitionEdge?.instruction || (goingUp ? "Take stairs up" : goingDown ? "Take stairs down" : "Continue")}
                    </span>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
        <span>Total: {route.totalDistance}m</span>
        <span>{formatDuration(route.totalSeconds)}</span>
      </div>
    </div>
  );
}
