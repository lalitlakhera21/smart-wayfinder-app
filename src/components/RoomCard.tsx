import { Building2, Layers, ArrowRight, DoorOpen, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Room } from "@/hooks/useRooms";
import NavigationSteps from "./NavigationSteps";

export default function RoomCard({ room, onClick }: { room: Room; onClick?: () => void }) {
  return (
    <Card
      className="glass-card rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">{room.room}</h3>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {room.type}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {room.building} → {room.floor} → {room.direction} → {room.room}
        </p>
        <NavigationSteps room={room} />
      </CardContent>
    </Card>
  );
}
