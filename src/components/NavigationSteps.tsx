import { Navigation, Building2, DoorOpen, Layers, ArrowRight, Footprints, ArrowUp } from "lucide-react";
import type { Room } from "@/hooks/useRooms";

export default function NavigationSteps({ room }: { room: Room }) {
  const directionLabel =
    room.direction === "Left" ? "Turn Left" :
    room.direction === "Right" ? "Turn Right" :
    room.direction === "Straight" ? "Go Straight" :
    `Go ${room.direction}`;

  const steps = [
    {
      icon: Navigation,
      label: "Start from",
      value: "Main Campus Gate",
      detail: "Enter the campus from the main entrance",
      className: "nav-step-start",
    },
    {
      icon: Building2,
      label: "Go to",
      value: "Academic Building",
      detail: "Walk towards the Academic Building complex",
      className: "nav-step-building",
    },
    {
      icon: DoorOpen,
      label: "Enter",
      value: room.building,
      detail: `Find and enter ${room.building}`,
      className: "nav-step-block",
    },
    {
      icon: ArrowUp,
      label: "Take Stairs to",
      value: room.floor,
      detail: room.floor === "Ground Floor"
        ? "Stay on the ground level"
        : room.floor === "Basement Floor"
        ? "Go down the stairs to basement"
        : `Climb the stairs up to ${room.floor}`,
      className: "nav-step-floor",
    },
    {
      icon: ArrowRight,
      label: directionLabel,
      value: `from Stairs`,
      detail: `After reaching ${room.floor}, ${directionLabel.toLowerCase()} from the staircase`,
      className: "nav-step-direction",
    },
    {
      icon: Footprints,
      label: "You've reached",
      value: room.room,
      detail: `${room.type} — ${room.room} is on your ${room.direction.toLowerCase()} side`,
      className: "nav-step-room",
    },
  ];

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-border" />

      <div className="flex flex-col gap-1">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-start gap-3 relative animate-in fade-in slide-in-from-left"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Step circle */}
            <div className={`relative z-10 h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${step.className} border-2 shadow-sm`}>
              <step.icon className="h-4 w-4" />
            </div>

            {/* Step content */}
            <div className={`flex-1 px-3 py-2.5 rounded-xl border ${step.className} mb-1 transition-all duration-200`}>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-50">{step.label}</span>
                <span className="font-bold text-sm">{step.value}</span>
              </div>
              <p className="text-[11px] opacity-60 mt-0.5 leading-snug">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
