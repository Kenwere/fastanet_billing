import { useState } from "react";
import { useListPackages, useCreatePackage, useDeletePackage, getListPackagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Package as PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const ORG_ID = 1;

type PkgForm = {
  name: string;
  price: number;
  durationValue: number;
  durationUnit: string;
  downloadSpeed: string;
  uploadSpeed: string;
  dataLimit: string;
  type: string;
};

export default function PackagesPage() {
  const [open, setOpen] = useState(false);
  const { data: packages, isLoading } = useListPackages({ orgId: ORG_ID });
  const createPackage = useCreatePackage();
  const deletePackage = useDeletePackage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset } = useForm<PkgForm>({
    defaultValues: { durationUnit: "days", type: "hotspot" },
  });

  const onSubmit = async (data: PkgForm) => {
    await createPackage.mutateAsync({
      data: {
        orgId: ORG_ID,
        name: data.name,
        price: Number(data.price),
        durationValue: Number(data.durationValue),
        durationUnit: data.durationUnit as "minutes" | "hours" | "days",
        downloadSpeed: data.downloadSpeed,
        uploadSpeed: data.uploadSpeed,
        dataLimit: data.dataLimit || null,
        type: data.type as "hotspot" | "pppoe",
      },
    });
    queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() });
    toast({ title: "Package created", description: `${data.name} has been created` });
    reset();
    setOpen(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete package "${name}"?`)) return;
    await deletePackage.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListPackagesQueryKey() });
    toast({ title: "Deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Internet Packages</h1>
          <p className="text-muted-foreground text-sm mt-1">Define packages for hotspot and PPPoE users</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-package">
              <Plus className="w-4 h-4 mr-2" />
              New Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Package</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Package Name</Label>
                  <Input {...register("name", { required: true })} placeholder="Monthly Premium" className="mt-1" data-testid="input-package-name" />
                </div>
                <div>
                  <Label>Price (KES)</Label>
                  <Input {...register("price", { required: true })} type="number" placeholder="999" className="mt-1" data-testid="input-package-price" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select onValueChange={(v) => setValue("type", v)} defaultValue="hotspot">
                    <SelectTrigger className="mt-1" data-testid="select-package-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotspot">Hotspot</SelectItem>
                      <SelectItem value="pppoe">PPPoE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input {...register("durationValue", { required: true })} type="number" placeholder="30" className="mt-1" data-testid="input-package-duration" />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select onValueChange={(v) => setValue("durationUnit", v)} defaultValue="days">
                    <SelectTrigger className="mt-1" data-testid="select-package-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Download Speed</Label>
                  <Input {...register("downloadSpeed", { required: true })} placeholder="10M" className="mt-1" data-testid="input-package-download" />
                </div>
                <div>
                  <Label>Upload Speed</Label>
                  <Input {...register("uploadSpeed", { required: true })} placeholder="5M" className="mt-1" data-testid="input-package-upload" />
                </div>
                <div className="col-span-2">
                  <Label>Data Limit (optional)</Label>
                  <Input {...register("dataLimit")} placeholder="e.g. 50GB (leave blank for unlimited)" className="mt-1" data-testid="input-package-data-limit" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createPackage.isPending} data-testid="button-submit-package">
                  {createPackage.isPending ? "Creating..." : "Create Package"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-5 animate-pulse h-36 bg-muted" />
          ))
        ) : packages?.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-muted-foreground border rounded-xl bg-card">
            <PackageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No packages yet</p>
          </div>
        ) : (
          packages?.map(pkg => (
            <div key={pkg.id} className="bg-card border rounded-xl p-5" data-testid={`card-package-${pkg.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pkg.type === "hotspot" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                    {pkg.type}
                  </span>
                  <h3 className="font-semibold mt-2">{pkg.name}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(pkg.id, pkg.name)}
                  data-testid={`button-delete-package-${pkg.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-2xl font-bold text-primary">KES {pkg.price}</div>
              <div className="text-sm text-muted-foreground">{pkg.durationValue} {pkg.durationUnit}</div>
              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Down: <strong className="text-foreground">{pkg.downloadSpeed}</strong></span>
                <span>Up: <strong className="text-foreground">{pkg.uploadSpeed}</strong></span>
                <span className="col-span-2">Data: <strong className="text-foreground">{pkg.dataLimit ?? "Unlimited"}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
