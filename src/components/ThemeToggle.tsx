import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="rounded-xl"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
