import { useState } from "react";
import { useListIspUsers, useCreateIspUser, useDeleteIspUser, useListPackages, getListIspUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UserCheck, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const ORG_ID = 1;

type UserForm = {
  fullName: string;
  phone: string;
  email: string;
  macAddress: string;
  username: string;
  packageId: string;
};

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const { data: users, isLoading } = useListIspUsers({ orgId: ORG_ID, ...(filter !== "all" ? { status: filter as "active" | "expired" | "suspended" } : {}) });
  const { data: packages } = useListPackages({ orgId: ORG_ID });
  const createUser = useCreateIspUser();
  const deleteUser = useDeleteIspUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset } = useForm<UserForm>();

  const onSubmit = async (data: UserForm) => {
    await createUser.mutateAsync({
      data: {
        orgId: ORG_ID,
        fullName: data.fullName,
        phone: data.phone || null,
        email: data.email || null,
        macAddress: data.macAddress || null,
        username: data.username || null,
        packageId: data.packageId ? Number(data.packageId) : null,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListIspUsersQueryKey() });
    toast({ title: "User added", description: `${data.fullName} has been added` });
    reset();
    setOpen(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    await deleteUser.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListIspUsersQueryKey() });
    toast({ title: "Deleted" });
  };

  const statusIcon = (status: string) => {
    if (status === "active") return <UserCheck className="w-4 h-4 text-green-600" />;
    if (status === "expired") return <Clock className="w-4 h-4 text-yellow-600" />;
    return <UserX className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ISP Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your internet subscribers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-user">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add ISP User</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Full Name</Label>
                  <Input {...register("fullName", { required: true })} placeholder="John Doe" className="mt-1" data-testid="input-user-name" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input {...register("phone")} placeholder="+254700000000" className="mt-1" data-testid="input-user-phone" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input {...register("email")} type="email" placeholder="user@example.com" className="mt-1" data-testid="input-user-email" />
                </div>
                <div>
                  <Label>MAC Address</Label>
                  <Input {...register("macAddress")} placeholder="AA:BB:CC:DD:EE:FF" className="mt-1" data-testid="input-user-mac" />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input {...register("username")} placeholder="john.doe" className="mt-1" data-testid="input-user-username" />
                </div>
                <div className="col-span-2">
                  <Label>Package</Label>
                  <Select onValueChange={(v) => setValue("packageId", v)}>
                    <SelectTrigger className="mt-1" data-testid="select-user-package">
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name} — KES {p.price}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createUser.isPending} data-testid="button-submit-user">
                  {createUser.isPending ? "Adding..." : "Add User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "active", "expired", "suspended"].map(s => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
            className={filter === s ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
            data-testid={`button-filter-${s}`}
          >
            <span className="capitalize">{s}</span>
          </Button>
        ))}
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expiry</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">No users found</td>
              </tr>
            ) : (
              users?.map(user => (
                <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-user-${user.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.fullName}</div>
                    {user.username && <div className="text-xs text-muted-foreground">{user.username}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.phone ?? "—"}</td>
                  <td className="px-4 py-3">{user.packageName ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {statusIcon(user.status)}
                      <span className={`text-xs font-medium capitalize ${
                        user.status === "active" ? "text-green-600" :
                        user.status === "expired" ? "text-yellow-600" : "text-red-600"
                      }`}>{user.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(user.id, user.fullName)}
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
