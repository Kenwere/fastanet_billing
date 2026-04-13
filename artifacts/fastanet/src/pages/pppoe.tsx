import { useState } from "react";
import { useListPppoeAccounts, useCreatePppoeAccount, useDeletePppoeAccount, useListRouters, useListPackages, getListPppoeAccountsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const ORG_ID = 1;

type PppoeForm = {
  username: string;
  password: string;
  routerId: string;
  packageId: string;
  service: string;
  profile: string;
};

export default function PppoePage() {
  const [open, setOpen] = useState(false);
  const { data: accounts, isLoading } = useListPppoeAccounts({ orgId: ORG_ID });
  const { data: routers } = useListRouters({ orgId: ORG_ID });
  const { data: packages } = useListPackages({ orgId: ORG_ID });
  const createAccount = useCreatePppoeAccount();
  const deleteAccount = useDeletePppoeAccount();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset } = useForm<PppoeForm>({ defaultValues: { service: "pppoe" } });

  const onSubmit = async (data: PppoeForm) => {
    await createAccount.mutateAsync({
      data: {
        orgId: ORG_ID,
        routerId: Number(data.routerId),
        username: data.username,
        password: data.password,
        service: data.service,
        profile: data.profile || null,
        packageId: data.packageId ? Number(data.packageId) : null,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListPppoeAccountsQueryKey() });
    toast({ title: "PPPoE account created" });
    reset();
    setOpen(false);
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Delete PPPoE account "${username}"?`)) return;
    await deleteAccount.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListPppoeAccountsQueryKey() });
    toast({ title: "Account deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PPPoE Accounts</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage PPPoE subscriber accounts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-pppoe">
              <Plus className="w-4 h-4 mr-2" />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create PPPoE Account</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input {...register("username", { required: true })} placeholder="user@pppoe" className="mt-1" data-testid="input-pppoe-username" />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input {...register("password", { required: true })} type="password" className="mt-1" data-testid="input-pppoe-password" />
                </div>
                <div>
                  <Label>Router</Label>
                  <Select onValueChange={(v) => setValue("routerId", v)}>
                    <SelectTrigger className="mt-1" data-testid="select-pppoe-router">
                      <SelectValue placeholder="Select router" />
                    </SelectTrigger>
                    <SelectContent>
                      {routers?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Package</Label>
                  <Select onValueChange={(v) => setValue("packageId", v)}>
                    <SelectTrigger className="mt-1" data-testid="select-pppoe-package">
                      <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.filter(p => p.type === "pppoe").map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Service</Label>
                  <Input {...register("service")} placeholder="pppoe" className="mt-1" data-testid="input-pppoe-service" />
                </div>
                <div>
                  <Label>Profile</Label>
                  <Input {...register("profile")} placeholder="fastanet-pppoe" className="mt-1" data-testid="input-pppoe-profile" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createAccount.isPending} data-testid="button-submit-pppoe">
                  {createAccount.isPending ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Username</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Profile</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expiry</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>
              ))
            ) : accounts?.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                <Network className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No PPPoE accounts
              </td></tr>
            ) : (
              accounts?.map(a => (
                <tr key={a.id} className="border-b hover:bg-muted/20" data-testid={`row-pppoe-${a.id}`}>
                  <td className="px-4 py-3 font-medium font-mono">{a.username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.service}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.profile ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      a.status === "active" ? "bg-green-100 text-green-700" :
                      a.status === "inactive" ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.expiryDate ? new Date(a.expiryDate).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(a.id, a.username)} data-testid={`button-delete-pppoe-${a.id}`}>
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
