import { useState, useEffect } from "react";

export function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("campus-theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("campus-theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
