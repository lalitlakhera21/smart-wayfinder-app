import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  useLocations,
  useConnections,
  useAddLocation,
  useDeleteLocation,
  useAddConnection,
  useDeleteConnection,
} from "@/hooks/useLocations";

const TYPES = ["gate", "building", "block", "floor", "corridor", "stairs", "lift", "room", "office", "landmark"];
const DIRECTIONS = ["Straight", "Left", "Right", "Up", "Down"];

export default function AdminLocations() {
  const { data: locations = [] } = useLocations();
  const { data: connections = [] } = useConnections();
  const addLoc = useAddLocation();
  const delLoc = useDeleteLocation();
  const addConn = useAddConnection();
  const delConn = useDeleteConnection();

  const [loc, setLoc] = useState({ name: "", type: "room", building: "", floor: "" });
  const [conn, setConn] = useState({
    from_location_id: "",
    to_location_id: "",
    direction: "Straight",
    distance_m: 10,
    estimated_seconds: 30,
    instruction: "",
  });

  const byId = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Locations & Connections</h1>
        <p className="text-sm text-muted-foreground">Manage the campus navigation graph.</p>
      </div>

      <Tabs defaultValue="locations">
        <TabsList>
          <TabsTrigger value="locations">Locations ({locations.length})</TabsTrigger>
          <TabsTrigger value="connections">Connections ({connections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Add location</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={loc.name} onChange={(e) => setLoc({ ...loc, name: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={loc.type} onValueChange={(v) => setLoc({ ...loc, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Building</Label>
                <Input value={loc.building} onChange={(e) => setLoc({ ...loc, building: e.target.value })} />
              </div>
              <div>
                <Label>Floor</Label>
                <Input value={loc.floor} onChange={(e) => setLoc({ ...loc, floor: e.target.value })} />
              </div>
            </div>
            <Button
              onClick={async () => {
                if (!loc.name) return toast.error("Name required");
                await addLoc.mutateAsync({
                  name: loc.name,
                  type: loc.type,
                  building: loc.building || null,
                  floor: loc.floor || null,
                });
                toast.success("Location added");
                setLoc({ name: "", type: "room", building: "", floor: "" });
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </Card>

          <Card className="divide-y max-h-[480px] overflow-auto">
            {locations.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="font-medium text-sm">{l.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[l.type, l.building, l.floor].filter(Boolean).join(" • ")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await delLoc.mutateAsync(l.id);
                    toast.success("Deleted");
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Add connection</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>From</Label>
                <Select value={conn.from_location_id} onValueChange={(v) => setConn({ ...conn, from_location_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>To</Label>
                <Select value={conn.to_location_id} onValueChange={(v) => setConn({ ...conn, to_location_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Direction</Label>
                <Select value={conn.direction} onValueChange={(v) => setConn({ ...conn, direction: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIRECTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Distance (m)</Label>
                <Input type="number" value={conn.distance_m}
                  onChange={(e) => setConn({ ...conn, distance_m: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Time (sec)</Label>
                <Input type="number" value={conn.estimated_seconds}
                  onChange={(e) => setConn({ ...conn, estimated_seconds: Number(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Instruction</Label>
                <Input value={conn.instruction} onChange={(e) => setConn({ ...conn, instruction: e.target.value })} />
              </div>
            </div>
            <Button
              onClick={async () => {
                if (!conn.from_location_id || !conn.to_location_id) return toast.error("Select both locations");
                if (conn.from_location_id === conn.to_location_id) return toast.error("From and To must differ");
                await addConn.mutateAsync({
                  from_location_id: conn.from_location_id,
                  to_location_id: conn.to_location_id,
                  direction: conn.direction,
                  distance_m: conn.distance_m,
                  estimated_seconds: conn.estimated_seconds,
                  instruction: conn.instruction || null,
                });
                toast.success("Connection added");
                setConn({ ...conn, instruction: "" });
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </Card>

          <Card className="divide-y max-h-[480px] overflow-auto">
            {connections.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3">
                <div className="text-sm">
                  <span className="font-medium">{byId.get(c.from_location_id)?.name ?? "?"}</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="font-medium">{byId.get(c.to_location_id)?.name ?? "?"}</span>
                  <div className="text-xs text-muted-foreground">
                    {c.direction} • {c.distance_m}m • {c.estimated_seconds}s
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    await delConn.mutateAsync(c.id);
                    toast.success("Deleted");
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
