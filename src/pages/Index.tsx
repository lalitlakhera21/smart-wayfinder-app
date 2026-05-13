import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import SearchBar from "@/components/SearchBar";
import SearchSuggestions from "@/components/SearchSuggestions";
import RoomCard from "@/components/RoomCard";
import QuickActions from "@/components/QuickActions";
import RecentSearches from "@/components/RecentSearches";
import CampusStats from "@/components/CampusStats";
import SmartFilters from "@/components/SmartFilters";
import SubmitRoomDialog from "@/components/SubmitRoomDialog";
import NavigateWidget from "@/components/NavigateWidget";
import { useSearchRooms, useRooms } from "@/hooks/useRooms";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useTheme } from "@/hooks/useTheme";
import { SearchX, Navigation, Compass } from "lucide-react";

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [filters, setFilters] = useState<{
    building: string | null;
    floor: string | null;
    type: string | null;
    verifiedOnly: boolean;
  }>({ building: null, floor: null, type: null, verifiedOnly: false });

  // Sync URL ?q= -> state when it changes externally (e.g. coming from Departments page)
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    if (urlQ && urlQ !== query) setQuery(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const results = useSearchRooms(query);
  const { data: rooms } = useRooms();
  const { recent, add, clear } = useRecentSearches();
  const { dark, toggle } = useTheme();

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (filters.building && r.building !== filters.building) return false;
      if (filters.floor && r.floor !== filters.floor) return false;
      if (filters.type && r.type !== filters.type) return false;
      if (filters.verifiedOnly && r.status !== "verified") return false;
      return true;
    });
  }, [results, filters]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setFilters({ building: null, floor: null, type: null, verifiedOnly: false });
    if (q.trim()) {
      add(q);
      supabase.from("search_logs").insert({ query: q.trim() }).then(() => {});
    }
  }, [add]);

  const updateFilter = (k: "building" | "floor" | "type", v: string | null) =>
    setFilters((p) => ({ ...p, [k]: v }));

  const toggleVerified = (v: boolean) => setFilters((p) => ({ ...p, verifiedOnly: v }));

  const clearFilters = () => setFilters({ building: null, floor: null, type: null, verifiedOnly: false });

  return (
    <div className="min-h-screen flex flex-col">
      <Header dark={dark} toggleTheme={toggle} />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6">
        <div className="w-full mt-4">
          <AnnouncementBanner />
        </div>

        {/* Hero */}
        <div className="text-center mt-8 sm:mt-16 mb-8 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 -left-20 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-2">
              <Navigation className="h-4 w-4 animate-pulse" />
              Find any room instantly
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight leading-tight">
              Campus <span className="text-primary">Navigation</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
              Search by room code, lab name, or facility and get
              <span className="text-foreground font-medium"> step-by-step directions</span> instantly.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <a href="/navigate" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
                <Navigation className="h-4 w-4" /> Smart Navigate
              </a>
              <a href="/departments" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium hover:bg-muted/50 transition">
                Browse Departments
              </a>
            </div>
          </div>
        </div>

        {/* Search */}
        <SearchBar
          value={query}
          onChange={handleSearch}
          onSubmit={() => query.trim() && add(query)}
          resultCount={query.trim() ? filteredResults.length : undefined}
        />

        {/* Autocomplete suggestions */}
        {query.trim() && (
          <SearchSuggestions query={query} rooms={rooms ?? []} onSelect={handleSearch} />
        )}

        {/* Smart filters when searching */}
        {query.trim() && results.length > 0 && (
          <div className="w-full mt-4">
            <SmartFilters
              rooms={results}
              building={filters.building}
              floor={filters.floor}
              type={filters.type}
              verifiedOnly={filters.verifiedOnly}
              onChange={updateFilter}
              onToggleVerified={toggleVerified}
              onClear={clearFilters}
            />
          </div>
        )}

        {/* Results */}
        <div className="w-full max-w-2xl mx-auto mt-6 space-y-4">
          {query.trim() && filteredResults.length === 0 && (
            <div className="text-center py-16 animate-in fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                <SearchX className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-semibold text-foreground">Room not found</p>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Agar yeh location actually exist karti hai, please add karein.
              </p>
              <SubmitRoomDialog />
            </div>
          )}
          {filteredResults.map((room, i) => (
            <div key={room.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-in fade-in slide-in-from-bottom-3">
              <RoomCard room={room} />
            </div>
          ))}
          {query.trim() && filteredResults.length > 0 && (
            <p className="text-center text-xs text-muted-foreground pb-4">
              Showing {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Home view (no query) */}
        {!query.trim() && (
          <div className="w-full mt-8 space-y-8 pb-8">
            <CampusStats rooms={rooms ?? []} />
            <QuickActions onAction={handleSearch} />
            <RecentSearches recent={recent} onSelect={handleSearch} onClear={clear} />

            {/* Crowd contribution CTA */}
            <div className="w-full max-w-2xl mx-auto glass-card rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold text-foreground">Koi room missing hai?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Students aur faculty naye destinations submit kar sakte hain. Admin verify karega.
                </p>
              </div>
              <SubmitRoomDialog />
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border/50">
        <div className="flex items-center justify-center gap-2">
          <Compass className="h-3.5 w-3.5" />
          © {new Date().getFullYear()} CampusNav — Smart Campus Navigation
        </div>
      </footer>
    </div>
  );
}
