import { useState, useEffect } from "react";

const KEY = "campus-nav-recent";
const MAX = 5;

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  });

  const add = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    setRecent([]);
    localStorage.removeItem(KEY);
  };

  return { recent, add, clear };
}
