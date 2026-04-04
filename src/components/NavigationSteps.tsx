import { Building2, Layers, ArrowRight, DoorOpen } from "lucide-react";
import type { Room } from "@/hooks/useRooms";

const steps = [
  { key: "building", icon: Building2, label: "Go to", className: "nav-step-building" },
  { key: "floor", icon: Layers, label: "Go to", className: "nav-step-floor" },
  { key: "direction", icon: ArrowRight, label: "Turn", className: "nav-step-direction" },
  { key: "room", icon: DoorOpen, label: "Room", className: "nav-step-room" },
] as const;

export default function NavigationSteps({ room }: { room: Room }) {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          {/* Step number */}
          <div className="flex flex-col items-center">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${step.className}`}>
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="w-0.5 h-2 bg-border mt-0.5" />
            )}
          </div>
          {/* Step content */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 ${step.className} transition-all duration-200`}>
            <step.icon className="h-4 w-4 flex-shrink-0 opacity-70" />
            <span className="text-xs font-medium opacity-60">{step.label}</span>
            <span className="font-semibold text-sm">{room[step.key]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
