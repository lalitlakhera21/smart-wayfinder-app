import { useRooms } from "@/hooks/useRooms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DoorOpen, Layers, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { data: rooms, isLoading, error } = useRooms();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-10 text-center">
          <p className="font-semibold text-destructive">Dashboard data load nahi ho paaya</p>
          <p className="text-sm text-muted-foreground mt-1">Please refresh and try again.</p>
        </CardContent>
      </Card>
    );
  }

  const safeRooms = rooms ?? [];
  const totalRooms = safeRooms.length;
  const buildings = new Set(safeRooms.map((r) => r.building)).size;
  const floors = new Set(safeRooms.map((r) => `${r.building}-${r.floor}`)).size;

  const recentRooms = [...safeRooms]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Total Rooms", value: totalRooms, icon: DoorOpen, color: "text-primary" },
    { label: "Buildings", value: buildings, icon: Building2, color: "text-accent" },
    { label: "Floors", value: floors, icon: Layers, color: "text-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Campus overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRooms.length === 0 ? (
            <p className="text-muted-foreground text-sm">No rooms yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-semibold text-foreground">{room.room}</p>
                    <p className="text-xs text-muted-foreground">
                      {room.building} {room.block ? `→ ${room.block}` : ""} → {room.floor}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
