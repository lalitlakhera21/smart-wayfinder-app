import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Department = {
  id: string;
  building_name: string;
  category: string;
  program_name: string;
  type: string | null;
  created_at: string;
  updated_at: string;
};

export type DepartmentInput = Omit<Department, "id" | "created_at" | "updated_at">;

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      console.log("[useDepartments] queryFn START");
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("building_name", { ascending: true });
      console.log("[useDepartments] queryFn DONE", { rows: data?.length, error });
      if (error) throw error;
      return (data ?? []) as Department[];
    },
    retry: 1,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: DepartmentInput) => {
      const { error } = await supabase.from("departments").insert(d);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Department> & { id: string }) => {
      const { error } = await supabase.from("departments").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}
