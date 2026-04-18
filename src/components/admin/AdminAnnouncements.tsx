import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminAnnouncements() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addAnnouncement = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login as admin first");
      const { error } = await supabase.from("announcements").insert({ title: title.trim(), message: message.trim(), created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["active-announcements"] });
      setTitle("");
      setMessage("");
      setDialogOpen(false);
      toast.success("Announcement published");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed. Please login as admin."),
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      qc.invalidateQueries({ queryKey: ["active-announcements"] });
      toast.success("Announcement deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading announcements..." : error ? "Announcements load nahi hue" : `${announcements?.length ?? 0} announcements`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Students ko ye home page ke top banner me dikhengi.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2"><Plus className="h-4 w-4" /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
              <Textarea placeholder="Message *" value={message} onChange={(e) => setMessage(e.target.value)} className="rounded-xl min-h-[100px]" />
              <Button onClick={() => addAnnouncement.mutate()} className="w-full rounded-xl" disabled={!title.trim() || !message.trim() || addAnnouncement.isPending}>
                {addAnnouncement.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : error ? (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-semibold text-destructive">Announcements load nahi ho paayi</p>
            <p className="text-sm text-muted-foreground mt-1">Agar add karte waqt issue aaye, please dubara admin login karke try karo.</p>
          </CardContent>
        </Card>
      ) : !announcements?.length ? (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id} className="rounded-2xl">
              <CardContent className="pt-5 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <Badge variant={a.is_active ? "default" : "secondary"} className="text-[10px]">
                      {a.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteAnnouncement.mutate(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
