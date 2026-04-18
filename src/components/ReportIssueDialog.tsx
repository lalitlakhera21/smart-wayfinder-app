import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Flag, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  reason: z.string().trim().min(5, "Tell us briefly what's wrong").max(500),
  reporter_name: z.string().trim().max(80).optional(),
});

interface Props {
  roomId: string;
  roomName: string;
}

export default function ReportIssueDialog({ roomId, roomName }: Props) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState("");
  const [name, setName] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ reason, reporter_name: name });
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("room_reports").insert({
        room_id: roomId,
        reason: parsed.data.reason,
        reporter_name: parsed.data.reporter_name || null,
        reporter_user_id: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDone(true);
      toast.success("Report sent — thank you!");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not send report"),
  });

  const reset = () => {
    setReason("");
    setName("");
    setDone(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
        >
          <Flag className="h-3 w-3" />
          Report wrong info
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Report wrong info</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{roomName}</span> ke baare me kya galat hai? Admin review karega.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Report bhej diya. Aapke contribution ke liye shukriya!
            </p>
            <Button onClick={() => setOpen(false)} className="rounded-xl">Close</Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">What's wrong? *</Label>
              <Textarea
                placeholder="e.g. Direction galat hai, room ab 2nd floor pe shift ho gaya hai…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-xl mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label className="text-xs">Your name (optional)</Label>
              <Input
                placeholder="Optional"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
            <Button
              onClick={() => submit.mutate()}
              disabled={submit.isPending}
              className="w-full rounded-xl"
            >
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send report"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
