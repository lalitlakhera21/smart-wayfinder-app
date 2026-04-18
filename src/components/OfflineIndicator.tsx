import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineIndicator() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="fixed top-2 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-md flex items-center gap-1.5">
      <WifiOff className="h-3.5 w-3.5 text-primary" />
      Offline — showing cached data
    </div>
  );
}
