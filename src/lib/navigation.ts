import type { Tables } from "@/integrations/supabase/types";

export type Location = Tables<"locations">;
export type Connection = Tables<"location_connections">;

export type RouteStep = {
  from: Location;
  to: Location;
  edge: Connection;
};

export type Route = {
  steps: RouteStep[];
  path: Location[];
  totalDistance: number;
  totalSeconds: number;
};

type Graph = Map<string, { edge: Connection; toId: string }[]>;

export function buildGraph(locations: Location[], connections: Connection[]): Graph {
  const g: Graph = new Map();
  locations.forEach((l) => g.set(l.id, []));
  connections.forEach((c) => {
    const list = g.get(c.from_location_id);
    if (list) list.push({ edge: c, toId: c.to_location_id });
  });
  return g;
}

export function findShortestPath(
  graph: Graph,
  locations: Location[],
  fromId: string,
  toId: string,
): Route | null {
  if (fromId === toId) return null;
  const byId = new Map(locations.map((l) => [l.id, l]));
  if (!byId.has(fromId) || !byId.has(toId)) return null;

  const prev = new Map<string, { fromId: string; edge: Connection }>();
  const visited = new Set<string>([fromId]);
  const queue: string[] = [fromId];

  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === toId) break;
    for (const { edge, toId: nxt } of graph.get(cur) ?? []) {
      if (visited.has(nxt)) continue;
      visited.add(nxt);
      prev.set(nxt, { fromId: cur, edge });
      queue.push(nxt);
    }
  }

  if (!prev.has(toId)) return null;

  const steps: RouteStep[] = [];
  const path: Location[] = [];
  let cur = toId;
  while (cur !== fromId) {
    const p = prev.get(cur)!;
    steps.unshift({ from: byId.get(p.fromId)!, to: byId.get(cur)!, edge: p.edge });
    cur = p.fromId;
  }
  path.push(byId.get(fromId)!);
  steps.forEach((s) => path.push(s.to));

  const totalDistance = steps.reduce((s, x) => s + (x.edge.distance_m ?? 0), 0);
  const totalSeconds = steps.reduce((s, x) => s + (x.edge.estimated_seconds ?? 0), 0);
  return { steps, path, totalDistance, totalSeconds };
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  return `${m} min`;
}
