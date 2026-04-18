import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, FolderTree, GraduationCap, MapPin, X, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepartments } from "@/hooks/useDepartments";
import Header from "@/components/Header";
import { useTheme } from "@/hooks/useTheme";

export default function Departments() {
  const { data: depts = [], isLoading } = useDepartments();
  const { dark, toggle } = useTheme();
  const [building, setBuilding] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const buildings = useMemo(
    () => Array.from(new Set(depts.map((d) => d.building_name))).sort(),
    [depts]
  );
  const categories = useMemo(() => {
    const list = depts
      .filter((d) => building === "all" || d.building_name === building)
      .map((d) => d.category);
    return Array.from(new Set(list)).sort();
  }, [depts, building]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return depts.filter((d) => {
      if (building !== "all" && d.building_name !== building) return false;
      if (category !== "all" && d.category !== category) return false;
      if (q && !d.program_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [depts, building, category, query]);

  // Group by building → category for clean display
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, typeof filtered>>();
    for (const d of filtered) {
      if (!map.has(d.building_name)) map.set(d.building_name, new Map());
      const inner = map.get(d.building_name)!;
      if (!inner.has(d.category)) inner.set(d.category, []);
      inner.get(d.category)!.push(d);
    }
    return map;
  }, [filtered]);

  const clear = () => {
    setBuilding("all");
    setCategory("all");
    setQuery("");
  };

  const hasFilters = building !== "all" || category !== "all" || query.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header dark={dark} toggleTheme={toggle} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <FolderTree className="h-3.5 w-3.5" /> Department Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Find your <span className="text-primary">department</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Browse all programs by building and category. Click any program to find its location.
          </p>
        </div>

        {/* Filters */}
        <Card className="glass-card rounded-2xl mb-6">
          <CardContent className="p-4 sm:p-5 grid gap-3 sm:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search program (e.g. B.Tech, MBA)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Select value={building} onValueChange={(v) => { setBuilding(v); setCategory("all"); }}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All buildings</SelectItem>
                {buildings.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clear} className="h-10">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Result count */}
        <p className="text-xs text-muted-foreground mb-4">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {depts.length} programs
        </p>

        {/* Results */}
        {isLoading && <p className="text-center text-muted-foreground py-12">Loading...</p>}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
              <Search className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-foreground">No programs found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or clear filters.</p>
          </div>
        )}

        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([bld, cats]) => (
            <div key={bld}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-tight">{bld}</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {Array.from(cats.values()).reduce((n, arr) => n + arr.length, 0)} programs
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from(cats.entries()).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">
                      <FolderTree className="h-3 w-3" /> {cat}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((p) => (
                        <Link
                          key={p.id}
                          to={`/?q=${encodeURIComponent(p.program_name)}`}
                          className="group glass-card rounded-xl p-3 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-start gap-3"
                        >
                          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-foreground truncate">{p.program_name}</p>
                              {p.type && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                  {p.type}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {p.building_name}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
