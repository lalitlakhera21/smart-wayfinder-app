import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRooms } from "@/hooks/useRooms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, Search } from "lucide-react";

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 72%, 50%)",
  "hsl(262, 83%, 58%)",
  "hsl(25, 95%, 53%)",
  "hsl(340, 75%, 55%)",
  "hsl(190, 80%, 45%)",
];

export default function AdminAnalytics() {
  const { data: rooms } = useRooms();

  const { data: searchLogs, isLoading } = useQuery({
    queryKey: ["search_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("search_logs").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });

  // Rooms per building
  const buildingData = Object.entries(
    (rooms ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.building] = (acc[r.building] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  // Rooms per type
  const typeData = Object.entries(
    (rooms ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.type] = (acc[r.type] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Popular searches
  const searchCounts = (searchLogs ?? []).reduce<Record<string, number>>((acc, l) => {
    const q = l.query.toLowerCase().trim();
    if (q) acc[q] = (acc[q] ?? 0) + 1;
    return acc;
  }, {});
  const popularSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Campus usage insights</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rooms per Building */}
            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-lg">Rooms per Building</CardTitle></CardHeader>
              <CardContent>
                {buildingData.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={buildingData}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Room Types */}
            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-lg">Room Types</CardTitle></CardHeader>
              <CardContent>
                {typeData.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                        {typeData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Popular Searches */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Popular Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popularSearches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No search data yet. Searches will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {popularSearches.map(([query, count], i) => (
                    <div key={query} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <span className="font-medium text-foreground">{query}</span>
                      </div>
                      <Badge variant="secondary">{count} searches</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
