import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Location = Tables<"locations">;
export type Connection = Tables<"location_connections">;

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("*").order("name");
      if (error) throw error;
      return data as Location[];
    },
  });
}

export function useConnections() {
  return useQuery({
    queryKey: ["location_connections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("location_connections").select("*");
      if (error) throw error;
      return data as Connection[];
    },
  });
}

export function useAddLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (l: TablesInsert<"locations">) => {
      const { error } = await supabase.from("locations").insert(l);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations"] }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...u }: TablesUpdate<"locations"> & { id: string }) => {
      const { error } = await supabase.from("locations").update(u).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations"] }),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["locations"] });
      qc.invalidateQueries({ queryKey: ["location_connections"] });
    },
  });
}

export function useAddConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: TablesInsert<"location_connections">) => {
      const { error } = await supabase.from("location_connections").insert(c);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["location_connections"] }),
  });
}

export function useDeleteConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("location_connections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["location_connections"] }),
  });
}
