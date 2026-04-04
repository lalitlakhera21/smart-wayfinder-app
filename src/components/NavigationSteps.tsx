import { Building2, Layers, ArrowRight, DoorOpen, ChevronRight } from "lucide-react";
import type { Room } from "@/hooks/useRooms";

const steps = [
  { key: "building", icon: Building2, label: "Go to", className: "nav-step-building" },
  { key: "floor", icon: Layers, label: "Go to", className: "nav-step-floor" },
  { key: "direction", icon: ArrowRight, label: "Turn", className: "nav-step-direction" },
  { key: "room", icon: DoorOpen, label: "Room", className: "nav-step-room" },
] as const;

export default function NavigationSteps({ room }: { room: Room }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-3 animate-in slide-in-from-left" style={{ animationDelay: `${i * 100}ms` }}>
          {i > 0 && (
            <div className="absolute -mt-10 ml-5 w-0.5 h-6 bg-border" />
          )}
          <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border w-full ${step.className}`}>
            <step.icon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium opacity-70">{step.label}</span>
            <span className="font-semibold">{room[step.key]}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}
