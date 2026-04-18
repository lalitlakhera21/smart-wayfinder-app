import { useState } from "react";
import { useRooms, useAddRoom, useUpdateRoom, useDeleteRoom, useSetRoomStatus, type Room, type RoomStatus } from "@/hooks/useRooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Search, Filter, ShieldCheck, Clock, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const BUILDINGS = ["Tech Block", "Admin Block", "Academic Block"];
const BLOCKS = ["", "Management Block", "Science Block", "Engineering Block", "Library Block"];
const FLOORS = ["Lower Ground Floor", "Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor"];
const DIRECTIONS = ["Left", "Right", "Straight", "End of Corridor"];
const TYPES = ["Classroom", "Lab", "Office", "Library", "Canteen", "Auditorium", "Seminar Hall", "Staff Room", "Meeting Room", "Conference Room", "Faculty Lounge", "Common Room", "Studio", "Workshop"];

interface RoomFormData {
  building: string;
  block: string;
  floor: string;
  room: string;
  direction: string;
  type: string;
}

const emptyForm: RoomFormData = { building: "", block: "", floor: "", room: "", direction: "", type: "" };

export default function AdminRooms() {
  const { data: rooms, isLoading } = useRooms();
  const addRoom = useAddRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const setStatus = useSetRoomStatus();

  const [form, setForm] = useState<RoomFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBuilding, setFilterBuilding] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = (rooms ?? []).filter((r) => {
    const matchSearch = !search.trim() ||
      r.room.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase()) ||
      r.block.toLowerCase().includes(search.toLowerCase());
    const matchBuilding = filterBuilding === "all" || r.building === filterBuilding;
    const matchStatus = filterStatus === "all" || (r.status ?? "pending") === filterStatus;
    return matchSearch && matchBuilding && matchStatus;
  });

  const counts = {
    verified: (rooms ?? []).filter((r) => r.status === "verified").length,
    pending: (rooms ?? []).filter((r) => (r.status ?? "pending") === "pending").length,
    rejected: (rooms ?? []).filter((r) => r.status === "rejected").length,
  };

  const handleSetStatus = async (id: string, status: RoomStatus) => {
    try {
      await setStatus.mutateAsync({ id, status });
      toast.success(`Marked as ${status}`);
    } catch (e: any) {
      toast.error(e.message || "Failed. Login as admin?");
    }
  };

  const handleSubmit = async () => {
    if (!form.building || !form.floor || !form.room || !form.direction || !form.type) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingId) {
        await updateRoom.mutateAsync({ id: editingId, ...form });
        toast.success("Room updated");
      } else {
        await addRoom.mutateAsync(form);
        toast.success("Room added");
      }
      setForm(emptyForm);
      setEditingId(null);
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    }
  };

  const handleEdit = (room: Room) => {
    setForm({ building: room.building, block: room.block, floor: room.floor, room: room.room, direction: room.direction, type: room.type });
    setEditingId(room.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    try {
      await deleteRoom.mutateAsync(id);
      toast.success("Room deleted");
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Room Management</h2>
          <p className="text-sm text-muted-foreground">
            {rooms?.length ?? 0} total · <span className="text-emerald-600 dark:text-emerald-400">{counts.verified} verified</span> · <span className="text-amber-600 dark:text-amber-400">{counts.pending} pending</span>{counts.rejected ? <> · <span className="text-destructive">{counts.rejected} rejected</span></> : null}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Add Room</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>{editingId ? "Edit Room" : "Add New Room"}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Select value={form.building} onValueChange={(v) => setForm({ ...form, building: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Building *" /></SelectTrigger>
                <SelectContent>{BUILDINGS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.block} onValueChange={(v) => setForm({ ...form, block: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Block/Section (optional)" /></SelectTrigger>
                <SelectContent>{BLOCKS.map((b) => <SelectItem key={b || "none"} value={b}>{b || "— None —"}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.floor} onValueChange={(v) => setForm({ ...form, floor: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Floor *" /></SelectTrigger>
                <SelectContent>{FLOORS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Room Code (e.g. LT-204) *" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="rounded-xl" />
              <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Direction *" /></SelectTrigger>
                <SelectContent>{DIRECTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Room Type *" /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={handleSubmit} className="w-full rounded-xl" disabled={addRoom.isPending || updateRoom.isPending}>
                {(addRoom.isPending || updateRoom.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update Room" : "Add Room"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Select value={filterBuilding} onValueChange={setFilterBuilding}>
          <SelectTrigger className="w-[180px] rounded-xl">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            {BUILDINGS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !filtered.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-semibold">No rooms found</p>
              <p className="text-sm">{search.trim() ? "Try a different search" : "Click 'Add Room' to get started"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead className="hidden sm:table-cell">Block</TableHead>
                    <TableHead className="hidden sm:table-cell">Floor</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((room) => {
                    const status = (room.status ?? "pending") as RoomStatus;
                    const updated = room.verified_at ?? room.updated_at;
                    return (
                      <TableRow key={room.id}>
                        <TableCell className="font-semibold">
                          {room.room}
                          {updated && (
                            <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                              {formatDistanceToNow(new Date(updated), { addSuffix: true })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{room.building}</TableCell>
                        <TableCell className="hidden sm:table-cell">{room.block || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{room.floor}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{room.type}</span>
                        </TableCell>
                        <TableCell>
                          {status === "verified" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </span>
                          )}
                          {status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          )}
                          {status === "rejected" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive">
                              <AlertCircle className="h-3 w-3" /> Rejected
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {status !== "verified" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                title="Mark as verified"
                                onClick={() => handleSetStatus(room.id, "verified")}
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {status !== "rejected" && status !== "verified" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-muted-foreground"
                                title="Reject"
                                onClick={() => handleSetStatus(room.id, "rejected")}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(room)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(room.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
