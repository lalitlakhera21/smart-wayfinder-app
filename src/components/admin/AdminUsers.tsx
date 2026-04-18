import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type UserRole = Tables<"user_roles">;
type Role = "admin" | "faculty" | "user";

const roleColor: Record<Role, "default" | "secondary" | "outline"> = {
  admin: "default",
  faculty: "outline",
  user: "secondary",
};

export default function AdminUsers() {
  const qc = useQueryClient();

  const { data: roles, isLoading, error } = useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: role as any })
        .eq("user_id", userId);
      if (error) throw error;
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
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading users..." : error ? "Users load nahi hue" : `${roles?.length ?? 0} registered users`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Admin</span> = full control · <span className="font-medium">Faculty</span> = verify rooms &amp; review submissions · <span className="font-medium">User</span> = search only
        </p>
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-destructive">Users data load nahi ho paaya</p>
              <p className="text-sm text-muted-foreground mt-1">Please login as admin and refresh once.</p>
            </div>
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
                    <TableHead>Current Role</TableHead>
                    <TableHead className="text-right">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((r) => {
                    const role = r.role as Role;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.user_id.slice(0, 8)}…</TableCell>
                        <TableCell>
                          <Badge variant={roleColor[role] ?? "secondary"} className="capitalize">
                            {role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={role}
                            onValueChange={(v: Role) => setRole.mutate({ userId: r.user_id, role: v })}
                            disabled={setRole.isPending}
                          >
                            <SelectTrigger className="w-[140px] rounded-xl ml-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="faculty">Faculty</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
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
