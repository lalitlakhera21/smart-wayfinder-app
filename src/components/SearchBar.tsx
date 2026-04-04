import { Search, Mic, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  resultCount?: number;
}

export default function SearchBar({ value, onChange, onSubmit, resultCount }: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="relative flex items-center glass-card rounded-2xl overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/40 focus-within:shadow-2xl focus-within:shadow-primary/5">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search room code (e.g. LT-204, CPL-101, Library)..."
          className="border-0 bg-transparent pl-12 pr-24 py-7 text-lg focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary"
            title="Voice search (coming soon)"
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {resultCount !== undefined && (
        <p className="text-xs text-muted-foreground mt-2 ml-1">
          {resultCount} room{resultCount !== 1 ? "s" : ""} found
        </p>
      )}
    </form>
  );
}
