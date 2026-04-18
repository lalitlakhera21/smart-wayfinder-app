import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Check, X, ExternalLink, User, Building2, ImageIcon, Inbox } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Status = "pending" | "approved" | "rejected";

export default function AdminSubmissions() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("pending");

  const { data, isLoading, error } = useQuery({
    queryKey: ["room_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const review = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("room_submissions")
        .update({ status, reviewed_by: user?.id ?? null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["room_submissions"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success(v.status === "approved" ? "Approved & added to rooms" : "Rejected");
    },
    onError: (e: any) => toast.error(e.message ?? "Action failed. Login as admin?"),
  });

  const filtered = (data ?? []).filter((s) => s.status === tab);
  const counts = {
    pending: (data ?? []).filter((s) => s.status === "pending").length,
    approved: (data ?? []).filter((s) => s.status === "approved").length,
    rejected: (data ?? []).filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Room Submissions</h2>
        <p className="text-sm text-muted-foreground">
          Crowd-sourced submissions from students &amp; faculty. Approve karne par room automatically add ho jayega.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg gap-2">
            Pending <Badge variant="secondary" className="text-[10px]">{counts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg gap-2">
            Approved <Badge variant="secondary" className="text-[10px]">{counts.approved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg gap-2">
            Rejected <Badge variant="secondary" className="text-[10px]">{counts.rejected}</Badge>
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
                <p className="font-semibold text-destructive">Couldn't load submissions</p>
                <p className="text-sm text-muted-foreground mt-1">Admin login required.</p>
              </CardContent>
            </Card>
          ) : !filtered.length ? (
            <Card className="rounded-2xl">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No {tab} submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((s) => (
                <Card key={s.id} className="rounded-2xl">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{s.destination}</h3>
                          <Badge variant="outline" className="text-[10px]">{s.room_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="h-3 w-3" />
                          {s.building}{s.block ? ` • ${s.block}` : ""} • {s.floor}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-foreground bg-muted/50 rounded-xl p-3 leading-relaxed">
                      {s.direction}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{s.submitter_name}</span>
                        <Badge variant="secondary" className="text-[10px] capitalize">{s.submitter_role}</Badge>
                      </div>
                      {s.photo_url && (
                        <a
                          href={s.photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <ImageIcon className="h-3.5 w-3.5" /> View photo <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {s.photo_url && (
                      <img
                        src={s.photo_url}
                        alt={s.destination}
                        className="w-full max-h-48 object-cover rounded-xl border border-border/50"
                        loading="lazy"
                      />
                    )}

                    {s.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={() => review.mutate({ id: s.id, status: "approved" })}
                          disabled={review.isPending}
                          className="rounded-xl gap-2 flex-1"
                        >
                          <Check className="h-4 w-4" /> Approve &amp; add
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => review.mutate({ id: s.id, status: "rejected" })}
                          disabled={review.isPending}
                          className="rounded-xl gap-2 flex-1"
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
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
