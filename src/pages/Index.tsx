import { useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import RoomCard from "@/components/RoomCard";
import QuickSuggestions from "@/components/QuickSuggestions";
import RecentSearches from "@/components/RecentSearches";
import { useSearchRooms } from "@/hooks/useRooms";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { useTheme } from "@/hooks/useTheme";
import { SearchX, MapPin } from "lucide-react";

export default function Index() {
  const [query, setQuery] = useState("");
  const results = useSearchRooms(query);
  const { recent, add, clear } = useRecentSearches();
  const { dark, toggle } = useTheme();

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) add(q);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header dark={dark} toggleTheme={toggle} />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mt-8 sm:mt-16 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" />
            Find any room instantly
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
            Campus Navigation
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Search by room code, lab name, or facility and get step-by-step directions.
          </p>
        </div>

        {/* Search */}
        <SearchBar
          value={query}
          onChange={handleSearch}
          onSubmit={() => query.trim() && add(query)}
        />

        {/* Results */}
        <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
          {query.trim() && results.length === 0 && (
            <div className="text-center py-12 animate-in fade-in">
              <SearchX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Room not found</p>
              <p className="text-muted-foreground text-sm">Please check the room code and try again.</p>
            </div>
          )}
          {results.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {/* Suggestions & Recent (when no query) */}
        {!query.trim() && (
          <div className="w-full mt-8 space-y-6">
            <QuickSuggestions onSelect={handleSearch} />
            <RecentSearches recent={recent} onSelect={handleSearch} onClear={clear} />
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} CampusNav — Smart Campus Navigation
      </footer>
    </div>
  );
}
