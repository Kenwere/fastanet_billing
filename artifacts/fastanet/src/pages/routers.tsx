import { useState } from "react";
import { useListRouters, useCreateRouter, useDeleteRouter, useGetRouterRsc, getListRoutersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Download, Trash2, Wifi, WifiOff, Router as RouterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const ORG_ID = 1;

type RouterForm = {
  name: string;
  ipAddress: string;
  apiPort: number;
  username: string;
  password: string;
  model: string;
  location: string;
  type: string;
};

function RouterRscButton({ routerId }: { routerId: number }) {
  const { refetch, isLoading } = useGetRouterRsc(routerId, { query: { enabled: false } });
  const { toast } = useToast();

  const handleDownload = async () => {
    const result = await refetch();
    if (result.data) {
      const blob = new Blob([result.data.script], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: `${result.data.filename} downloaded successfully` });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading} data-testid={`button-download-rsc-${routerId}`}>
      <Download className="w-3 h-3 mr-1" />
      {isLoading ? "Generating..." : "Download .rsc"}
    </Button>
  );
}

export default function RoutersPage() {
  const [open, setOpen] = useState(false);
  const { data: routers, isLoading } = useListRouters({ orgId: ORG_ID });
  const createRouter = useCreateRouter();
  const deleteRouter = useDeleteRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset } = useForm<RouterForm>({
    defaultValues: { apiPort: 8728, type: "hotspot" },
  });

  const onSubmit = async (data: RouterForm) => {
    await createRouter.mutateAsync({
      data: { ...data, orgId: ORG_ID, apiPort: Number(data.apiPort) },
    });
    queryClient.invalidateQueries({ queryKey: getListRoutersQueryKey() });
    toast({ title: "Router added", description: `${data.name} has been added successfully` });
    reset();
    setOpen(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete router "${name}"?`)) return;
    await deleteRouter.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListRoutersQueryKey() });
    toast({ title: "Deleted", description: `${name} removed` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">MikroTik Routers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your network routers and download configuration scripts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-router">
              <Plus className="w-4 h-4 mr-2" />
              Add Router
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add MikroTik Router</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Router Name</Label>
                  <Input {...register("name", { required: true })} placeholder="Main Router" className="mt-1" data-testid="input-router-name" />
                </div>
                <div>
                  <Label>IP Address</Label>
                  <Input {...register("ipAddress", { required: true })} placeholder="192.168.1.1" className="mt-1" data-testid="input-router-ip" />
                </div>
                <div>
                  <Label>API Port</Label>
                  <Input {...register("apiPort")} type="number" placeholder="8728" className="mt-1" data-testid="input-router-port" />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input {...register("username", { required: true })} placeholder="admin" className="mt-1" data-testid="input-router-username" />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input {...register("password", { required: true })} type="password" placeholder="••••••••" className="mt-1" data-testid="input-router-password" />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input {...register("model")} placeholder="RB951Ui-2HnD" className="mt-1" data-testid="input-router-model" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input {...register("location")} placeholder="CBD Office" className="mt-1" data-testid="input-router-location" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select onValueChange={(v) => setValue("type", v)} defaultValue="hotspot">
                    <SelectTrigger className="mt-1" data-testid="select-router-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotspot">Hotspot</SelectItem>
                      <SelectItem value="pppoe">PPPoE</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createRouter.isPending} data-testid="button-submit-router">
                  {createRouter.isPending ? "Adding..." : "Add Router"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-5 animate-pulse h-20 bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {routers?.map((router) => (
            <div key={router.id} className="bg-card border rounded-xl p-5" data-testid={`card-router-${router.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${router.status === "online" ? "bg-green-100" : router.status === "offline" ? "bg-red-100" : "bg-yellow-100"}`}>
                    {router.status === "online" ? (
                      <Wifi className="w-5 h-5 text-green-600" />
                    ) : router.status === "offline" ? (
                      <WifiOff className="w-5 h-5 text-red-600" />
                    ) : (
                      <RouterIcon className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{router.name}</div>
                    <div className="text-sm text-muted-foreground">{router.ipAddress}:{router.apiPort} · {router.model ?? "Unknown model"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    router.status === "online" ? "bg-green-100 text-green-700" :
                    router.status === "offline" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{router.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <span>Type: <strong className="text-foreground capitalize">{router.type}</strong></span>
                  {router.activeUsers !== null && <span>Active users: <strong className="text-foreground">{router.activeUsers}</strong></span>}
                  {router.location && <span>Location: <strong className="text-foreground">{router.location}</strong></span>}
                </div>
                <div className="flex items-center gap-2">
                  <RouterRscButton routerId={router.id} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(router.id, router.name)}
                    data-testid={`button-delete-router-${router.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {routers?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground border rounded-xl bg-card">
              <RouterIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No routers yet</p>
              <p className="text-sm mt-1">Add your first MikroTik router to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
