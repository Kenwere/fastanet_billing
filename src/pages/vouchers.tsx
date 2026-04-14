import { useState } from "react";
import { useListVouchers, useGenerateVouchers, useDeleteVoucher, useListPackages, getListVouchersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Ticket, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const ORG_ID = 1;

type GenForm = { packageId: string; count: number; expiryDays: string };

export default function VouchersPage() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const { data: vouchers, isLoading } = useListVouchers({
    orgId: ORG_ID,
    ...(filter !== "all" ? { status: filter as "unused" | "used" | "expired" } : {}),
  });
  const { data: packages } = useListPackages({ orgId: ORG_ID });
  const generateVouchers = useGenerateVouchers();
  const deleteVoucher = useDeleteVoucher();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset } = useForm<GenForm>({ defaultValues: { count: 10 } });

  const onSubmit = async (data: GenForm) => {
    const result = await generateVouchers.mutateAsync({
      data: {
        orgId: ORG_ID,
        packageId: Number(data.packageId),
        count: Number(data.count),
        expiryDays: data.expiryDays ? Number(data.expiryDays) : null,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListVouchersQueryKey() });
    toast({ title: "Vouchers generated", description: `${result.length} vouchers created` });
    reset();
    setOpen(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: code });
  };

  const handleDelete = async (id: number) => {
    await deleteVoucher.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListVouchersQueryKey() });
    toast({ title: "Voucher deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vouchers</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate and manage hotspot voucher codes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-generate-vouchers">
              <Plus className="w-4 h-4 mr-2" />
              Generate Vouchers
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate Vouchers</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Package</Label>
                <Select onValueChange={(v) => setValue("packageId", v)}>
                  <SelectTrigger className="mt-1" data-testid="select-voucher-package">
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages?.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name} — KES {p.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Number of Vouchers</Label>
                <Input {...register("count", { required: true })} type="number" min={1} max={500} className="mt-1" data-testid="input-voucher-count" />
              </div>
              <div>
                <Label>Expiry (days, optional)</Label>
                <Input {...register("expiryDays")} type="number" placeholder="e.g. 90" className="mt-1" data-testid="input-voucher-expiry" />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={generateVouchers.isPending} data-testid="button-submit-vouchers">
                  {generateVouchers.isPending ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {["all", "unused", "used", "expired"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}
            className={filter === s ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
            data-testid={`button-filter-voucher-${s}`}>
            <span className="capitalize">{s}</span>
          </Button>
        ))}
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expiry</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>
              ))
            ) : vouchers?.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">
                <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No vouchers yet
              </td></tr>
            ) : (
              vouchers?.map(v => (
                <tr key={v.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-voucher-${v.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold">{v.code}</span>
                      <button onClick={() => copyCode(v.code)} className="text-muted-foreground hover:text-foreground" data-testid={`button-copy-voucher-${v.id}`}>
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.packageName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      v.status === "unused" ? "bg-green-100 text-green-700" :
                      v.status === "used" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : "Never"}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(v.id)} data-testid={`button-delete-voucher-${v.id}`}>
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
