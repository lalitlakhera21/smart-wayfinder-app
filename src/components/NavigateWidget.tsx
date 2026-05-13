import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Flag, ArrowUpDown, Navigation2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocations } from "@/hooks/useLocations";

export default function NavigateWidget() {
  const navigate = useNavigate();
  const { data: locations = [] } = useLocations();

  const defaultFromId = locations.find((l) => l.name === "Main Gate")?.id ?? "";
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [fromQ, setFromQ] = useState("");
  const [toQ, setToQ] = useState("");
  const [openField, setOpenField] = useState<"from" | "to" | null>(null);

  const fromName = locations.find((l) => l.id === (fromId || defaultFromId))?.name ?? "";
  const toName = locations.find((l) => l.id === toId)?.name ?? "";

  const filterList = (q: string) => {
    const s = q.trim().toLowerCase();
    const base = locations;
    if (!s) return base.slice(0, 8);
    return base
      .filter(
        (l) =>
          l.name.toLowerCase().includes(s) ||
          (l.building ?? "").toLowerCase().includes(s) ||
          (l.floor ?? "").toLowerCase().includes(s),
      )
      .slice(0, 8);
  };

  const fromMatches = useMemo(() => filterList(fromQ), [fromQ, locations]);
  const toMatches = useMemo(() => filterList(toQ), [toQ, locations]);

  const swap = () => {
    const a = fromId || defaultFromId;
    setFromId(toId);
    setToId(a);
    setFromQ("");
    setToQ("");
  };

  const go = () => {
    const f = fromId || defaultFromId;
    if (!f || !toId) return;
    navigate(`/navigate?from=${f}&to=${toId}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Navigation2 className="h-4 w-4 text-primary" />
          Smart Navigate
        </div>
        <button
          onClick={swap}
          className="h-8 w-8 rounded-lg border bg-background hover:bg-muted/50 flex items-center justify-center"
          title="Swap"
          type="button"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {/* From field */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <input
              value={openField === "from" ? fromQ : fromName}
              onChange={(e) => {
                setFromQ(e.target.value);
                setFromId("");
              }}
              onFocus={() => {
                setOpenField("from");
                setFromQ("");
              }}
              onBlur={() => setTimeout(() => setOpenField((f) => (f === "from" ? null : f)), 150)}
              placeholder="Your location"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
            />
          </div>
          {openField === "from" && fromMatches.length > 0 && (
            <div className="absolute z-20 mt-1 left-0 right-0 rounded-xl border bg-popover shadow-lg max-h-64 overflow-auto">
              {fromMatches.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setFromId(l.id);
                    setFromQ("");
                    setOpenField(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b last:border-b-0"
                >
                  <div className="text-sm font-medium">{l.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {[l.building, l.floor, l.type].filter(Boolean).join(" • ")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* To field */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/30">
            <Flag className="h-4 w-4 text-accent-foreground shrink-0" />
            <input
              value={openField === "to" ? toQ : toName}
              onChange={(e) => {
                setToQ(e.target.value);
                setToId("");
              }}
              onFocus={() => {
                setOpenField("to");
                setToQ("");
              }}
              onBlur={() => setTimeout(() => setOpenField((f) => (f === "to" ? null : f)), 150)}
              placeholder="Destination (room, office, lab…)"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
            />
          </div>
          {openField === "to" && toMatches.length > 0 && (
            <div className="absolute z-20 mt-1 left-0 right-0 rounded-xl border bg-popover shadow-lg max-h-64 overflow-auto">
              {toMatches.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setToId(l.id);
                    setToQ("");
                    setOpenField(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b last:border-b-0"
                >
                  <div className="text-sm font-medium">{l.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {[l.building, l.floor, l.type].filter(Boolean).join(" • ")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button onClick={go} disabled={!toId} className="w-full">
        <Search className="h-4 w-4 mr-1.5" /> Get Directions
      </Button>
    </div>
  );
}
