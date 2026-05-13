import { useState } from "react";
import { Map, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import campusMap from "@/assets/campus-map.png";

export default function CampusMap({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Map className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">VGU Campus Map</h3>
            <p className="text-[11px] text-muted-foreground">Tap to view full size</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Maximize2 className="h-3.5 w-3.5" /> Full view
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full p-0 overflow-hidden">
            <div className="relative max-h-[90vh] overflow-auto">
              <img src={campusMap} alt="VGU Campus 2D Navigation Map" className="w-full h-auto min-w-[1200px]" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="block w-full bg-muted/30 hover:bg-muted/50 transition"
        aria-label="Open campus map"
      >
        <img
          src={campusMap}
          alt="VGU Campus Map preview"
          loading="lazy"
          className={`w-full object-cover ${compact ? "max-h-48" : "max-h-72"} object-center`}
        />
      </button>
    </section>
  );
}
