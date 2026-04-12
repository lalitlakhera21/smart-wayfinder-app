import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import SearchBar from "@/components/SearchBar";
import RoomCard from "@/components/RoomCard";
import QuickSuggestions from "@/components/QuickSuggestions";
import RecentSearches from "@/components/RecentSearches";
import CampusStats from "@/components/CampusStats";
import FloorFilter from "@/components/FloorFilter";
import { useSearchRooms, useRooms } from "@/hooks/useRooms";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useTheme } from "@/hooks/useTheme";
import { SearchX, MapPin, Navigation, Compass } from "lucide-react";

export default function Index() {
  const [query, setQuery] = useState("");
  const [floorFilter, setFloorFilter] = useState<string | null>(null);
  const results = useSearchRooms(query);
  const { data: rooms } = useRooms();
  const { recent, add, clear } = useRecentSearches();
  const { dark, toggle } = useTheme();

  const filteredResults = floorFilter
    ? results.filter((r) => r.floor === floorFilter)
    : results;

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setFloorFilter(null);
    if (q.trim()) {
      add(q);
      supabase.from("search_logs").insert({ query: q.trim() }).then(() => {});
    }
  }, [add]);

  const uniqueFloors = query.trim()
    ? [...new Set(results.map((r) => r.floor))]
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header dark={dark} toggleTheme={toggle} />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mt-8 sm:mt-16 mb-8 relative">
          {/* Decorative elements */}
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
          </div>
        </div>

        {/* Search */}
        <SearchBar
          value={query}
          onChange={handleSearch}
          onSubmit={() => query.trim() && add(query)}
          resultCount={query.trim() ? filteredResults.length : undefined}
        />

        {/* Floor Filter */}
        {uniqueFloors.length > 1 && (
          <FloorFilter
            floors={uniqueFloors}
            selected={floorFilter}
            onSelect={setFloorFilter}
          />
        )}

        {/* Results */}
        <div className="w-full max-w-2xl mx-auto mt-6 space-y-4">
          {query.trim() && filteredResults.length === 0 && (
            <div className="text-center py-16 animate-in fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                <SearchX className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-semibold text-foreground">Room not found</p>
              <p className="text-muted-foreground text-sm mt-1">Please check the room code and try again.</p>
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

        {/* Suggestions, Stats & Recent (when no query) */}
        {!query.trim() && (
          <div className="w-full mt-8 space-y-8 pb-8">
            <CampusStats rooms={rooms ?? []} />
            <QuickSuggestions onSelect={handleSearch} />
            <RecentSearches recent={recent} onSelect={handleSearch} onClear={clear} />
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
