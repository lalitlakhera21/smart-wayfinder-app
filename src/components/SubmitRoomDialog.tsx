import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  destination: z.string().trim().min(1, "Required").max(80),
  building: z.string().trim().min(1, "Required").max(80),
  block: z.string().trim().max(40).optional(),
  floor: z.string().trim().min(1, "Required").max(40),
  room_type: z.string().trim().min(1).max(40),
  direction: z.string().trim().min(5, "Add some directions").max(500),
  submitter_name: z.string().trim().min(1, "Required").max(80),
  submitter_role: z.enum(["student", "faculty"]),
});

const TYPES = ["Classroom", "Lab", "Office", "Library", "Canteen", "Auditorium", "Seminar Hall", "Washroom", "Parking", "Gate", "Other"];

export default function SubmitRoomDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    destination: "",
    building: "",
    block: "",
    floor: "",
    room_type: "Classroom",
    direction: "",
    submitter_name: "",
    submitter_role: "student" as "student" | "faculty",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const update = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setForm({
      destination: "",
      building: "",
      block: "",
      floor: "",
      room_type: "Classroom",
      direction: "",
      submitter_name: "",
      submitter_role: "student",
    });
    setPhoto(null);
    setSubmitted(false);
  };

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0].message);
      }
      let photo_url: string | null = null;
      if (photo) {
        if (photo.size > 5 * 1024 * 1024) throw new Error("Photo must be under 5MB");
        const ext = photo.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("submission-photos")
          .upload(path, photo, { contentType: photo.type });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("submission-photos").getPublicUrl(path);
        photo_url = data.publicUrl;
      }
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("room_submissions").insert({
        ...parsed.data,
        block: parsed.data.block ?? "",
        photo_url,
        submitter_user_id: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["room_submissions"] });
      setSubmitted(true);
      toast.success("Submission sent for admin review");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to submit"),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2 glass-card border-primary/20">
          <Plus className="h-4 w-4 text-primary" />
          Add a destination
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a new destination</DialogTitle>
          <DialogDescription>
            Students aur faculty naye location submit kar sakte hain. Admin verify karke add karega.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-foreground">Thank you!</h3>
            <p className="text-sm text-muted-foreground">
              Aapki submission admin ke paas review ke liye chali gayi hai. Approve hone par yeh search me dikhne lagegi.
            </p>
            <Button onClick={() => setOpen(false)} className="rounded-xl">Done</Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Destination / Room name *</Label>
              <Input
                placeholder="e.g. LT-301, New Robotics Lab"
                value={form.destination}
                onChange={(e) => update("destination", e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Building *</Label>
                <Input
                  placeholder="e.g. Academic Block"
                  value={form.building}
                  onChange={(e) => update("building", e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Block</Label>
                <Input
                  placeholder="A / B"
                  value={form.block}
                  onChange={(e) => update("block", e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Floor *</Label>
                <Input
                  placeholder="Ground / 1st / 2nd"
                  value={form.floor}
                  onChange={(e) => update("floor", e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Type *</Label>
                <Select value={form.room_type} onValueChange={(v) => update("room_type", v)}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">How to reach (directions) *</Label>
              <Textarea
                placeholder="e.g. Main gate se andar aakar right turn, 1st floor par left side teesra room"
                value={form.direction}
                onChange={(e) => update("direction", e.target.value)}
                className="rounded-xl mt-1 min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-xs">Photo (outside the room/class)</Label>
              <label className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {photo ? photo.name : "Upload a photo (optional, max 5MB)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Your name *</Label>
                <Input
                  placeholder="Full name"
                  value={form.submitter_name}
                  onChange={(e) => update("submitter_name", e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">You are *</Label>
                <Select value={form.submitter_role} onValueChange={(v: "student" | "faculty") => update("submitter_role", v)}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={() => submit.mutate()}
              disabled={submit.isPending}
              className="w-full rounded-xl mt-2"
            >
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for review"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
