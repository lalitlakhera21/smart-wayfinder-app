import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Room = Tables<"rooms">;

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("building");
      if (error) throw error;
      return data as Room[];
    },
  });
}

export function useSearchRooms(query: string) {
  const { data: rooms } = useRooms();
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return (rooms ?? []).filter(
    (r) =>
      r.room.toLowerCase().includes(q) ||
      r.building.toLowerCase().includes(q) ||
      r.block.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
  );
}

export function useAddRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (room: TablesInsert<"rooms">) => {
      const { error } = await supabase.from("rooms").insert(room);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"rooms"> & { id: string }) => {
      const { error } = await supabase.from("rooms").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });
}
