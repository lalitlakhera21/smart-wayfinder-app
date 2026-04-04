import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type UserRole = Tables<"user_roles">;

export default function AdminUsers() {
  const qc = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, currentRole }: { userId: string; currentRole: string }) => {
      if (currentRole === "admin") {
        const { error } = await supabase.from("user_roles").update({ role: "user" }).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").update({ role: "admin" }).eq("user_id", userId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-sm text-muted-foreground">{roles?.length ?? 0} registered users</p>
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !roles?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-semibold">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.user_id.slice(0, 8)}…</TableCell>
                      <TableCell>
                        <Badge variant={r.role === "admin" ? "default" : "secondary"}>
                          {r.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 rounded-xl"
                          onClick={() => toggleAdmin.mutate({ userId: r.user_id, currentRole: r.role })}
                          disabled={toggleAdmin.isPending}
                        >
                          {r.role === "admin" ? (
                            <><ShieldOff className="h-4 w-4" /> Remove Admin</>
                          ) : (
                            <><ShieldCheck className="h-4 w-4" /> Make Admin</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
