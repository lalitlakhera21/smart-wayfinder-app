import { Search, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
}

export default function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="relative flex items-center glass-card rounded-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:shadow-xl">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search room code (e.g. LT-204, CPL-101)..."
          className="border-0 bg-transparent pl-12 pr-14 py-6 text-lg focus-visible:ring-0 placeholder:text-muted-foreground/60"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 h-10 w-10 rounded-xl text-muted-foreground hover:text-primary"
          title="Voice search (coming soon)"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
