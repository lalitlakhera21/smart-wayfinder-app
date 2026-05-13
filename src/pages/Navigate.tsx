import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Header from "@/components/Header";
import { useTheme } from "@/hooks/useTheme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RouteCard from "@/components/RouteCard";
import RouteMiniMap from "@/components/RouteMiniMap";
import { useLocations, useConnections } from "@/hooks/useLocations";
import { buildGraph, findShortestPath } from "@/lib/navigation";

export default function Navigate() {
  const { data: locations = [], isLoading: l1 } = useLocations();
  const { data: connections = [], isLoading: l2 } = useConnections();
  const [params] = useSearchParams();

  const defaultFromName = "Main Gate";
  const defaultFrom = locations.find((l) => l.name === defaultFromName)?.id ?? "";
  const queryFromId = params.get("from") ?? "";
  const queryToId = params.get("to") ?? "";

  const [fromId, setFromId] = useState<string>(queryFromId || defaultFrom);
  const [toId, setToId] = useState<string>(queryToId);
  const [search, setSearch] = useState("");
  const { dark, toggle } = useTheme();

  useEffect(() => {
    if (!fromId && defaultFrom) setFromId(defaultFrom);
  }, [fromId, defaultFrom]);

  const fromOptions = useMemo(
    () => locations.filter((l) => ["gate", "landmark", "building"].includes(l.type)),
    [locations],
  );

  const destOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = locations.filter((l) => l.id !== fromId);
    if (!q) return all.slice(0, 50);
    return all.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.building ?? "").toLowerCase().includes(q) ||
        (l.floor ?? "").toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q),
    );
  }, [locations, fromId, search]);

  const route = useMemo(() => {
    if (!fromId || !toId) return null;
    const graph = buildGraph(locations, connections);
    return findShortestPath(graph, locations, fromId, toId);
  }, [fromId, toId, locations, connections]);

  const loading = l1 || l2;

  return (
    <div className="min-h-screen bg-background">
      <Header dark={dark} toggleTheme={toggle} />
      <main className="container max-w-2xl px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Smart Navigation</h1>
          <p className="text-sm text-muted-foreground">
            Pick where you are and where you want to go — we'll build the route.
          </p>
        </div>

        <Card className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>1. Your current location</Label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {fromOptions.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>2. Destination</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search room, office, or department…"
                className="pl-9"
              />
            </div>
            <div className="max-h-64 overflow-auto rounded-lg border divide-y">
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading…</div>
              ) : destOptions.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No matches</div>
              ) : (
                destOptions.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setToId(l.id)}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition ${
                      toId === l.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{l.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[l.building, l.floor, l.type].filter(Boolean).join(" • ")}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </Card>

        {fromId && toId && !route && (
          <Card className="p-5 text-sm text-muted-foreground">
            No connected path found between these locations yet. Add a connection in admin.
          </Card>
        )}

        {route && (
          <>
            <RouteCard route={route} />
            <RouteMiniMap route={route} />
          </>
        )}
      </main>
    </div>
  );
}
