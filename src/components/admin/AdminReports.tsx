import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Check, X, Flag, DoorOpen, User, Inbox } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Status = "open" | "resolved" | "dismissed";

interface ReportRow {
  id: string;
  room_id: string;
  reason: string;
  reporter_name: string | null;
  status: Status;
  created_at: string;
  rooms: { room: string; building: string; floor: string } | null;
}

export default function AdminReports() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("open");

  const { data, isLoading, error } = useQuery({
    queryKey: ["room_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_reports")
        .select("id, room_id, reason, reporter_name, status, created_at, rooms(room, building, floor)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ReportRow[];
    },
  });

  const resolve = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("room_reports")
        .update({ status, resolved_by: user?.id ?? null, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["room_reports"] });
      toast.success("Report updated");
    },
    onError: (e: any) => toast.error(e.message ?? "Action failed. Login as admin/faculty?"),
  });

  const filtered = (data ?? []).filter((r) => r.status === tab);
  const counts = {
    open: (data ?? []).filter((r) => r.status === "open").length,
    resolved: (data ?? []).filter((r) => r.status === "resolved").length,
    dismissed: (data ?? []).filter((r) => r.status === "dismissed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Issue Reports</h2>
        <p className="text-sm text-muted-foreground">
          Users dwara report ki gayi galat info. Admin ya Faculty resolve kar sakte hain.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="open" className="rounded-lg gap-2">
            Open <Badge variant="secondary" className="text-[10px]">{counts.open}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="rounded-lg gap-2">
            Resolved <Badge variant="secondary" className="text-[10px]">{counts.resolved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="dismissed" className="rounded-lg gap-2">
            Dismissed <Badge variant="secondary" className="text-[10px]">{counts.dismissed}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="rounded-2xl">
              <CardContent className="py-10 text-center">
                <p className="font-semibold text-destructive">Couldn't load reports</p>
                <p className="text-sm text-muted-foreground mt-1">Admin/faculty login required.</p>
              </CardContent>
            </Card>
          ) : !filtered.length ? (
            <Card className="rounded-2xl">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No {tab} reports</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <Card key={r.id} className="rounded-2xl">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Flag className="h-4 w-4 text-destructive" />
                        <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                          <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          {r.rooms?.room ?? "(deleted room)"}
                        </h3>
                        {r.rooms && (
                          <span className="text-xs text-muted-foreground">
                            {r.rooms.building} • {r.rooms.floor}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-foreground bg-muted/50 rounded-xl p-3 leading-relaxed">
                      {r.reason}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">
                          {r.reporter_name || "Anonymous"}
                        </span>
                      </div>

                      {r.status === "open" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => resolve.mutate({ id: r.id, status: "resolved" })}
                            disabled={resolve.isPending}
                            className="rounded-xl gap-1.5"
                          >
                            <Check className="h-3.5 w-3.5" /> Mark resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolve.mutate({ id: r.id, status: "dismissed" })}
                            disabled={resolve.isPending}
                            className="rounded-xl gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" /> Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
