import { useState } from "react";
import { useListPayments, useCreatePayment, useUpdatePayment, useListPackages, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

const ORG_ID = 1;

type PaymentForm = {
  amount: number;
  currency: string;
  gateway: string;
  transactionRef: string;
  phoneNumber: string;
  packageId: string;
};

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const { data: payments, isLoading } = useListPayments({
    orgId: ORG_ID,
    ...(filter !== "all" ? { status: filter as "pending" | "paid" | "failed" } : {}),
  });
  const { data: packages } = useListPackages({ orgId: ORG_ID });
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset } = useForm<PaymentForm>({ defaultValues: { currency: "KES", gateway: "mpesa" } });

  const onSubmit = async (data: PaymentForm) => {
    await createPayment.mutateAsync({
      data: {
        orgId: ORG_ID,
        amount: Number(data.amount),
        currency: data.currency,
        gateway: data.gateway as "mpesa" | "paystack" | "pesapal" | "intasend" | "manual",
        transactionRef: data.transactionRef || null,
        phoneNumber: data.phoneNumber || null,
        packageId: data.packageId ? Number(data.packageId) : null,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
    toast({ title: "Payment recorded" });
    reset();
    setOpen(false);
  };

  const markPaid = async (id: number) => {
    await updatePayment.mutateAsync({ id, data: { status: "paid", paidAt: new Date().toISOString() } });
    queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey() });
    toast({ title: "Marked as paid" });
  };

  const gatewayColors: Record<string, string> = {
    mpesa: "bg-green-100 text-green-700",
    paystack: "bg-blue-100 text-blue-700",
    pesapal: "bg-purple-100 text-purple-700",
    intasend: "bg-orange-100 text-orange-700",
    manual: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Track all payment transactions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-payment">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (KES)</Label>
                  <Input {...register("amount", { required: true })} type="number" placeholder="500" className="mt-1" data-testid="input-payment-amount" />
                </div>
                <div>
                  <Label>Gateway</Label>
                  <Select onValueChange={(v) => setValue("gateway", v)} defaultValue="mpesa">
                    <SelectTrigger className="mt-1" data-testid="select-payment-gateway">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="paystack">Paystack</SelectItem>
                      <SelectItem value="pesapal">PesaPal</SelectItem>
                      <SelectItem value="intasend">IntaSend</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transaction Ref</Label>
                  <Input {...register("transactionRef")} placeholder="MPESA001XYZ" className="mt-1" data-testid="input-payment-ref" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input {...register("phoneNumber")} placeholder="+254700000000" className="mt-1" data-testid="input-payment-phone" />
                </div>
                <div className="col-span-2">
                  <Label>Package</Label>
                  <Select onValueChange={(v) => setValue("packageId", v)}>
                    <SelectTrigger className="mt-1" data-testid="select-payment-package">
                      <SelectValue placeholder="Select package (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} — KES {p.price}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={createPayment.isPending} data-testid="button-submit-payment">
                  {createPayment.isPending ? "Saving..." : "Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "paid", "failed"].map(s => (
          <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)}
            className={filter === s ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
            data-testid={`button-filter-payment-${s}`}>
            <span className="capitalize">{s}</span>
          </Button>
        ))}
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User / Ref</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gateway</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Package</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>
              ))
            ) : payments?.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No payments found</td></tr>
            ) : (
              payments?.map(p => (
                <tr key={p.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-payment-${p.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.userName ?? "Anonymous"}</div>
                    {p.transactionRef && <div className="text-xs text-muted-foreground font-mono">{p.transactionRef}</div>}
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.currency} {Number(p.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${gatewayColors[p.gateway] ?? "bg-gray-100 text-gray-700"}`}>{p.gateway}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.packageName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1.5 text-xs font-medium capitalize ${
                      p.status === "paid" ? "text-green-600" : p.status === "pending" ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {p.status === "paid" ? <CheckCircle className="w-3.5 h-3.5" /> : p.status === "pending" ? <Clock className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {p.status}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {p.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => markPaid(p.id)} data-testid={`button-mark-paid-${p.id}`}>
                        Mark Paid
                      </Button>
                    )}
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
