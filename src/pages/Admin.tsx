import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRooms, useAddRoom, useUpdateRoom, useDeleteRoom, type Room } from "@/hooks/useRooms";
import { useTheme } from "@/hooks/useTheme";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BUILDINGS = ["Admin Block", "Academic Block A", "Academic Block B", "Science Block", "Engineering Block", "Library Block"];
const FLOORS = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];
const DIRECTIONS = ["Left", "Right", "Straight", "End of Corridor"];
const TYPES = ["Classroom", "Lab", "Office", "Library", "Canteen", "Auditorium", "Seminar Hall"];

interface RoomFormData {
  building: string;
  floor: string;
  room: string;
  direction: string;
  type: string;
}

const emptyForm: RoomFormData = { building: "", floor: "", room: "", direction: "", type: "" };

export default function Admin() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: rooms, isLoading } = useRooms();
  const addRoom = useAddRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const { dark, toggle } = useTheme();

  const [form, setForm] = useState<RoomFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async () => {
    if (!form.building || !form.floor || !form.room || !form.direction || !form.type) {
      toast.error("Please fill all fields");
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
    setForm({
      building: room.building,
      floor: room.floor,
      room: room.room,
      direction: room.direction,
      type: room.type,
    });
    setEditingId(room.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRoom.mutateAsync(id);
      toast.success("Room deleted");
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header dark={dark} toggleTheme={toggle} />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Manage campus rooms and locations</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2">
                  <Plus className="h-4 w-4" /> Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Room" : "Add New Room"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Select value={form.building} onValueChange={(v) => setForm({ ...form, building: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Building" /></SelectTrigger>
                    <SelectContent>
                      {BUILDINGS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={form.floor} onValueChange={(v) => setForm({ ...form, floor: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Floor" /></SelectTrigger>
                    <SelectContent>
                      {FLOORS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Room Code (e.g. LT-204)"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="rounded-xl"
                  />
                  <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Direction" /></SelectTrigger>
                    <SelectContent>
                      {DIRECTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Room Type" /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSubmit} className="w-full rounded-xl" disabled={addRoom.isPending || updateRoom.isPending}>
                    {(addRoom.isPending || updateRoom.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update Room" : "Add Room"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon" className="rounded-xl" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="glass-card rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !rooms?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-semibold">No rooms yet</p>
                <p className="text-sm">Click "Add Room" to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead className="hidden sm:table-cell">Floor</TableHead>
                      <TableHead className="hidden sm:table-cell">Direction</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-semibold">{room.room}</TableCell>
                        <TableCell>{room.building}</TableCell>
                        <TableCell className="hidden sm:table-cell">{room.floor}</TableCell>
                        <TableCell className="hidden sm:table-cell">{room.direction}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{room.type}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(room)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(room.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
