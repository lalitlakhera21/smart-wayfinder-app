import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment, type Department, type DepartmentInput } from "@/hooks/useDepartments";
import { toast } from "sonner";

const TYPES = ["UG", "PG", "Research"];

function DeptDialog({
  trigger, initial, onSubmit, title,
}: {
  trigger: React.ReactNode;
  initial?: Partial<Department>;
  onSubmit: (d: DepartmentInput) => Promise<void>;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DepartmentInput>({
    building_name: initial?.building_name ?? "",
    category: initial?.category ?? "",
    program_name: initial?.program_name ?? "",
    type: initial?.type ?? null,
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.building_name.trim() || !form.category.trim() || !form.program_name.trim()) {
      toast.error("Building, category and program name are required");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...form, type: form.type || null });
      toast.success("Saved");
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Building</Label>
            <Input value={form.building_name} onChange={(e) => setForm({ ...form, building_name: e.target.value })} placeholder="Technology Block" />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Engineering & IT" />
          </div>
          <div>
            <Label>Program name</Label>
            <Input value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} placeholder="B.Tech" />
          </div>
          <div>
            <Label>Type (optional)</Label>
            <Select value={form.type ?? "none"} onValueChange={(v) => setForm({ ...form, type: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDepartments() {
  const { data: depts = [] } = useDepartments();
  const createM = useCreateDepartment();
  const updateM = useUpdateDepartment();
  const deleteM = useDeleteDepartment();
  const [q, setQ] = useState("");
  const [building, setBuilding] = useState("all");

  const buildings = useMemo(() => Array.from(new Set(depts.map((d) => d.building_name))).sort(), [depts]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return depts.filter((d) => {
      if (building !== "all" && d.building_name !== building) return false;
      if (s && !`${d.program_name} ${d.category} ${d.building_name}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [depts, q, building]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground">{depts.length} programs across {buildings.length} buildings</p>
        </div>
        <DeptDialog
          title="Add new program"
          trigger={<Button><Plus className="h-4 w-4 mr-1" /> Add program</Button>}
          onSubmit={(d) => createM.mutateAsync(d)}
        />
      </div>

      <Card>
        <CardContent className="p-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search programs..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={building} onValueChange={setBuilding}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buildings</SelectItem>
              {buildings.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.program_name}</TableCell>
                  <TableCell className="text-muted-foreground">{d.category}</TableCell>
                  <TableCell className="text-muted-foreground">{d.building_name}</TableCell>
                  <TableCell>
                    {d.type && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted">{d.type}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <DeptDialog
                        title="Edit program"
                        initial={d}
                        trigger={<Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>}
                        onSubmit={(p) => updateM.mutateAsync({ id: d.id, ...p })}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          if (!confirm(`Delete ${d.program_name}?`)) return;
                          try {
                            await deleteM.mutateAsync(d.id);
                            toast.success("Deleted");
                          } catch (e: any) {
                            toast.error(e.message ?? "Failed");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No programs match</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
